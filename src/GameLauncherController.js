import Path from 'path'
import GameLauncher from './GameLauncher'
import { head, findIndex, flatten } from 'lodash/array'
import { filter, reject, find, each } from 'lodash/collection'
import { matches, defaultTo } from 'lodash/util'
import { pickBy, toPairs, omit } from 'lodash/object'
import { cloneDeep } from 'lodash/lang'
import GameRunner from "@/libs/GameRunner"
import { delay, randomizePort, replaceString } from "@/utils"
import TaskWorker from './TaskWorker'
import ArgumentStore from "@/libs/ArgumentStore"

class GameLauncherController {
	constructor(store, taskCtrl, gameDefinitions) {
		this.store = store;
		this.taskCtrl = taskCtrl;
		this.gameDefinitions = gameDefinitions;
		this.workers = new Map();
	}
	create(props) {
		const launcher = new GameLauncher(props);
		return this.store.launchers.game.items.push(launcher), launcher;
	}
	async remove(id) {
		const { items } = this.store.launchers.game;
		if (this.workers.has(id)) {
			console.warn(`game launcher ${id} was issued to be removed, but it's still running, attempting to kill it`);
			await this.stop(id);
		}
		return head(items.splice(findIndex(items, matches({ id })), 1));
	}
	async removeBy(pairs) {
		const { items } = this.store.launchers.game;
		const removed = filter(items, matches(pairs));
		await Promise.all(removed.map(item => this.remove(item.id)));
		return removed;
	}
	async restart(id) {
		const launcher = find(this.store.launchers.game.items, matches({ id }));
		const project = find(this.store.projects.items, matches({ id: launcher.parent }));
		const gameDefinition = find(this.gameDefinitions, matches({ gameId: project.game }));
		const worker = this.workers.get(launcher.id);
		if (gameDefinition.rcon) {
			if (worker) await worker.restart();
		}
		else {
			await worker.stop();
			await this.start(id);
		}
	}
	async start(id) {
		const launcher = find(this.store.launchers.game.items, matches({ id }));
		if (this.workers.has(launcher.id)) {
			this.restart(id);
			return;
		}
		const parent = launcher.parent;
		const project = find(this.store.projects.items, matches({ id: parent }));
		const path = launcher.path ? launcher.path : launcher.custom;
		const tasksEnabled = this.store.tasks.enabled;
		const gameDefinition = find(this.gameDefinitions, matches({ gameId: project.game }));
		const rcon = gameDefinition.rcon ? randomizePort() : undefined;
		const mod = defaultTo(project.mod.enabled ? project.mod.value : undefined, gameDefinition.base);
		const { engineCommands } = gameDefinition;

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

		let additionalOptions = [];
		if (launcher.options.enabled) {
			additionalOptions = each(
				toPairs(pickBy(launcher.options.items,matches({ enabled: true }))),
				pair => (pair.unshift('+set'), pair[2] = pair[2].value)
			);
		}

		const args = new ArgumentStore();
		const env = { map: Path.basename(project.map, '.map'), mapPath: project.map };
		const mapStartCommand = replaceString(launcher.devmap ? engineCommands.startDevmap : engineCommands.startMap, env);
		args.append(`+set fs_game ${mod}`);
		args.append(...flatten(additionalOptions));
		args.append(launcher.arguments.enabled ? replaceString(launcher.arguments.value, env) : "");
		args.append(mapStartCommand);

		const proc = new GameRunner(Path.resolve(path), { cwd: project.path, rcon, args: args.toArray() });
		const startTask = (event) => () => tasksEnabled && this.taskCtrl.startBy({ event, parent, enabled: true });
		const stopTask = (event) => () => tasksEnabled && this.taskCtrl.stopBy({ event, parent, enabled: true });
		const runGame = () => (proc.run(), delay(100)); // skip game start waiting, just add 100ms delay
		const killGame = () => proc.kill();
		const reloadMap = () => proc.send(`devmap ${Path.basename(project.map, '.map')}`);
		const startTasks = [startTask('before-game-start'), runGame, startTask('after-game-start'), () => proc.exits()];
		const stopTasks = [stopTask('before-game-start'), killGame, stopTask('after-game-start')];
		const worker = new TaskWorker(startTasks, stopTasks, [reloadMap]);

		proc.on('error', (error) => launcher.message = error);

		// fixme: refactor non blocking runner for compound run
		this._wokerStarts(launcher, worker);
		worker.start().then(() => this._wokerStops(launcher));
	}
	async stop(id) {
		const launcher = find(this.store.launchers.game.items, matches({ id }));
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
		const { items } = this.store.launchers.game;
		const tasks = filter(items, matches(pairs));
		await Promise.all(tasks.map(async (task) => await this.start(task.id)));
	}
	async stopBy(pairs) {
		const { items } = this.store.launchers.game;
		const tasks = filter(items, matches(pairs));
		await Promise.all(tasks.map(async (task) => await this.stop(task.id)));
	}
	addUserLaunchers(userLaunchers) {
		if (!userLaunchers) return;
		if (!Array.isArray(userLaunchers)) {
			console.warn('User game launchers were not added, because no root array was found!');
			return;
		}
		for (let userLauncher of userLaunchers) {
			const launcher = Object.assign(new GameLauncher(), cloneDeep(userLauncher));
			this.store.launchers.game.items.push(launcher);
		}
	}
	getUserLaunchers() {
		let launchers = [];
		for (let launcher of this.store.launchers.game.items) {
			launchers.push(Object.assign(omit(cloneDeep(launcher), ['state', 'message'])));
		}
		return launchers;
	}
}

export default GameLauncherController;