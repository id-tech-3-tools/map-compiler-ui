import CompilerLauncher from './CompilerLauncher'
import Path from 'path'
import { head, findIndex, flatten, without } from 'lodash/array'
import { filter, reject, find, map } from 'lodash/collection'
import { matches, flow, defaultTo } from 'lodash/util'
import { toPairs, pickBy, update, keys, omit } from 'lodash/object'
import { isEmpty, cloneDeep } from 'lodash/lang'
import { partialRight } from 'lodash/function'
import CompilerRunner from "@/libs/CompilerRunner"
import TaskWorker from "./TaskWorker"

class CompilerLauncherController {
	constructor(store, taskCtrl, gameDefinitions) {
		this.store = store;
		this.taskCtrl = taskCtrl;
		this.workers = new Map();
		this.gameDefinitions = gameDefinitions;
	}
	create(props) {
		const launcher = new CompilerLauncher(props);
		return this.store.launchers.compiler.items.push(launcher), launcher;
	}
	async remove(id) {
		const { items } = this.store.launchers.compiler;
		if (this.workers.has(id)) {
			console.warn(`compiler launcher ${id} was issued to be removed, but it's still running, attempting to kill it`);
			await this.stop(id);
		}
		return head(items.splice(findIndex(items, matches({ id })), 1));
	}
	async removeBy(pairs) {
		const { items } = this.store.launchers.compiler;
		const removed = filter(items, matches(pairs));
		await Promise.all(removed.map(item => this.remove(item.id)));
		return removed;
	}
	// refactor me
	async start(id, forcedStage = "") {
		const launcher = find(this.store.launchers.compiler.items, matches({ id }));
		if (this.workers.has(id)) {
			console.warn('compiler attempted to run, but it is already running, killing previous worker');
			const worker = this.workers.get(id);
			await worker.stop();
		}
		const parent = launcher.parent;
		const path = launcher.path ? launcher.path : launcher.custom;
		const threads = launcher.threads.enabled ? launcher.threads.value : -1;
		const { project, preset } = this.store;
		const { path: cwd, map: mapPath, game: gameId } = project;
		const tasksEnabled = this.store.tasks.enabled;
		const gameDefinition = find(this.gameDefinitions, matches({ gameId }));
		
		launcher.message = "";
		if (!gameId) {
			launcher.message = "Please select game.";
			return;
		}
		if (!cwd) {
			launcher.message = "Please game path.";
			return;
		}
		if (!path) {
			launcher.message = "Please select executable path.";
			return;
		}
		if (!mapPath) {
			launcher.message = "Please select map.";
			return;
		}
		
		if (!project.preset.id) {
			launcher.message = "Please select preset.";
			return;
		}
		
		const mod = defaultTo(project.mod.enabled ? project.mod.value : undefined, gameDefinition.base);
		// prepare compile stage switches
		const generalSwitches = [
			'-threads', threads, '-v', '-game', gameDefinition.compilerGameId, '-fs_basepath', `${cwd}`, '-fs_game', mod
		];
		const getSwitches = flow(
			partialRight(pickBy, opt => opt.enabled),
			partialRight(map, (opt, key) => without([`-${key}`, opt.value], "")),
			flatten
		);
		const getStageSwitches = (stage, name) => [`-${name}`, ...generalSwitches, ...getSwitches(stage.switches), `${mapPath}`]
		const stagePredicate = (stage, key) => forcedStage ? key == forcedStage : stage.enabled; 
		const stages = map(pickBy(preset.draft, stagePredicate), getStageSwitches);
	
		const proc = new CompilerRunner(Path.resolve(path), stages, { cwd });
		
		const startTask = (event) => () => tasksEnabled && this.taskCtrl.startBy({ event, parent, enabled: true });
		const stopTask = (event) => () => tasksEnabled && this.taskCtrl.stopBy({ event, parent, enabled: true });
		const startTasks = [startTask('before-compile'), () => proc.run(), startTask('after-compile')];
		const stopTasks = [stopTask('before-compile'), () => proc.kill(), stopTask('after-compile')];
		const worker = new TaskWorker(startTasks, stopTasks);

		const output = find(this.store.output.items, matches({ parent: parent, type: "compiler" }));
		output.buffer = [];

		proc.on('data', chunk => output.buffer.push(chunk.toString('ascii')));
		proc.on('error', error => launcher.message = error);

		this._wokerStarts(launcher, worker);
		await worker.start();
		this._wokerStops(launcher);
	}
	async stop(id) {
		const launcher = find(this.store.launchers.compiler.items, matches({ id }));
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
	async startBy(pairs, forcedStage) {
		const { items } = this.store.launchers.compiler;
		const tasks = filter(items, matches(pairs));
		await Promise.all(tasks.map(async (task) => await this.start(task.id, forcedStage)));
	}
	async stopBy(pairs) {
		const { items } = this.store.launchers.compiler;
		const tasks = filter(items, matches(pairs));
		await Promise.all(tasks.map(async (task) => await this.stop(task.id)));
	}
	addUserLaunchers(userLaunchers) {
		if (!userLaunchers) return;
		if (!Array.isArray(userLaunchers)) {
			console.warn('User compiler launchers were not added, because no root array was found!');
			return;
		}
		for (let userLauncher of userLaunchers) {
			const launcher = Object.assign(new CompilerLauncher(), cloneDeep(userLauncher));
			this.store.launchers.compiler.items.push(launcher);
		}
	}
	getUserLaunchers() {
		let launchers = [];
		for (let launcher of this.store.launchers.compiler.items) {
			launchers.push(Object.assign(omit(cloneDeep(launcher),['state', 'message'])));
		}
		return launchers;
	}
}

export default CompilerLauncherController;