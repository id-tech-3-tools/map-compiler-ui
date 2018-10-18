import Path from "path"
import BspcLauncher from './BspcLauncher'
import { head, findIndex } from 'lodash/array'
import { filter, reject, find } from 'lodash/collection'
import { omit } from 'lodash/object'
import { matches, defaultTo } from 'lodash/util'
import { cloneDeep } from 'lodash/lang'
import CompilerRunner from "@/libs/CompilerRunner"
import TaskWorker from './TaskWorker'
import ArgumentStore from "@/libs/ArgumentStore"
import { replaceString } from "./utils"

class BspcLauncherController {
	constructor(store, taskCtrl, gameDefinitions) {
		this.store = store;
		this.taskCtrl = taskCtrl;
		this.gameDefinitions = gameDefinitions;
		this.workers = new Map();
	}
	create(props) {
		const launcher = new BspcLauncher(props);
		return this.store.launchers.bspc.items.push(launcher), launcher;
	}
	async remove(id) {
		const { items } = this.store.launchers.bspc;
		if (this.workers.has(id)) {
			console.warn(`bspc launcher ${id} was issued to be removed, but it's still running, attempting to kill it`);
			await this.stop(id);
		}
		return head(items.splice(findIndex(items, matches({ id })), 1));
	}
	async removeBy(pairs) {
		const { items } = this.store.launchers.bspc;
		const removed = filter(items, matches(pairs));
		await Promise.all(removed.map(item => this.remove(item.id)));
		return removed;
	}
	async start(id) {
		const launcher = find(this.store.launchers.bspc.items, matches({ id }));
		if (this.workers.has(id)) {
			console.warn('bspc attempted to run, but it is already running, killing previous worker');
			const worker = this.workers.get(id);
			await worker.stop();
		}
		const parent = launcher.parent;
		const project = find(this.store.projects.items, matches({ id: parent }));
		const path = launcher.path ? launcher.path : launcher.custom;
		const tasksEnabled = this.store.tasks.enabled;
		const threads = launcher.threads.enabled ? launcher.threads.value : -1;
		const gameDefinition = find(this.gameDefinitions, matches({ gameId: project.game }));

		if (!gameDefinition.BSPC) {
			console.warn("BSPC launcher attempted to run, but it's not enabled for the game, ignoring");
			return;
		}

		launcher.message = "";
		if (!project.game) {
			launcher.message = "Please select game.";
			return;
		}
		if (!project.path) {
			launcher.message = "Please game path.";
			return;
		}
		if (!path) {
			launcher.message = "Please select executable path.";
			return;
		}
		if (!project.map) {
			launcher.message = "Please select map.";
			return;
		}

		const env = { map: Path.basename(project.map, '.map'), mapPath: project.map };
		const stages = [];

		// dirty hack, refactor required!
		if (gameDefinition.compilerGameId == "wolf") {
			for (let [i, fileName] of ["aascfg_sm.c", "aascfg_lg.c"].entries()) {
				const args = new ArgumentStore();
				args.append(launcher.arguments.enabled ? replaceString(launcher.arguments.value, env) : "");
				args.append(`-ext _b${i} -cfg ${fileName}`)
				args.append(`-threads ${threads} -forcesidesvisible -bsp2aas ${project.map} -output ${Path.dirname(project.map)}`);
				stages.push(args.toArray())
			}
		}
		else {
			const args = new ArgumentStore();
			args.append(launcher.arguments.enabled ? replaceString(launcher.arguments.value, env) : "");
			args.append(`-threads ${threads} -forcesidesvisible -bsp2aas ${project.map} -output ${Path.dirname(project.map)}`);
			stages.push(args.toArray())
		}

		const cwd = defaultTo(launcher.workDir.enabled ? launcher.workDir.value : undefined, Path.dirname(path));

		const proc = new CompilerRunner(Path.resolve(path), stages, { cwd });
		const startTask = (event) => () => tasksEnabled && this.taskCtrl.startBy({ event, parent, enabled: true });
		const stopTask = (event) => () => tasksEnabled && this.taskCtrl.stopBy({ event, parent, enabled: true });
		const startTasks = [startTask('before-bspc'), () => proc.run(), startTask('after-bspc')];
		const stopTasks = [stopTask('before-bspc'), () => proc.kill(), stopTask('after-bspc')];
		const worker = new TaskWorker(startTasks, stopTasks);
		const output = find(this.store.output.items, matches({ parent: parent, type: "bspc" }));
		output.buffer = [];

		proc.on('data', chunk => output.buffer.push(chunk.toString('ascii')));
		proc.on('error', (error) => launcher.message = error);

		this._wokerStarts(launcher, worker);
		await worker.start();
		this._wokerStops(launcher);
	}
	async stop(id) {
		const launcher = find(this.store.launchers.bspc.items, matches({ id }));
		const worker = this.workers.get(launcher.id);
		if (worker) await worker.stop();
	}
	_wokerStarts(launcher, worker) {
		launcher.state = "running";
		this.workers.set(launcher.id, worker);
	}
	_wokerStops(launcher) {
		launcher.state = "idle";
		this.workers.delete(launcher.id);
	}
	async startBy(pairs) {
		const { items } = this.store.launchers.bspc;
		const tasks = filter(items, matches(pairs));
		await Promise.all(tasks.map(async (task) => await this.start(task.id)));
	}
	async stopBy(pairs) {
		const { items } = this.store.launchers.bspc;
		const tasks = filter(items, matches(pairs));
		await Promise.all(tasks.map(async (task) => await this.stop(task.id)));
	}
	addUserLaunchers(userLaunchers) {
		if (!userLaunchers) return;
		if (!Array.isArray(userLaunchers)) {
			console.warn('User bspc launchers were not added, because no root array was found!');
			return;
		}
		for (let userLauncher of userLaunchers) {
			const launcher = Object.assign(new BspcLauncher(), cloneDeep(userLauncher));
			this.store.launchers.bspc.items.push(launcher);
		}
	}
	getUserLaunchers() {
		let launchers = [];
		for (let launcher of this.store.launchers.bspc.items) {
			launchers.push(Object.assign(omit(cloneDeep(launcher), ['state', 'message'])));
		}
		return launchers;
	}
}

export default BspcLauncherController;