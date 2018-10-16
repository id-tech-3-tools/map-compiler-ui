import MasterLauncher from './MasterLauncher'
import { head, findIndex, remove } from 'lodash/array'
import { filter, reject, find } from 'lodash/collection'
import { matches } from 'lodash/util'
import { debounce } from 'lodash/function'
import { omit } from "lodash/object"
import { cloneDeep } from "lodash/lang"
import TaskWorker from './TaskWorker'
import fs from 'fs'
import Path from 'path'

class MasterLauncherController {
	constructor(store, compilerCtrl, launchers) {
		this.store = store;
		this.compilerCtrl = compilerCtrl;
		this.launchers = launchers;
		this.workers = new Map();
		this.watchers = [];
	}
	create(props) {
		const launcher = new MasterLauncher(props);
		return this.store.launchers.master.items.push(launcher), launcher;
	}
	async remove(id) {
		const { items } = this.store.launchers.master;
		this.stopAutoWatcher(id);

		if (this.workers.has(id)) {
			console.warn(`master launcher ${id} was issued to be removed, but it's still running, attempting to kill it`);
			await this.stop(id);
		}
		return head(items.splice(findIndex(items, matches({ id })), 1));
	}
	async removeBy(pairs) {
		const { items } = this.store.launchers.master;
		const removed = filter(items, matches(pairs));
		await Promise.all(removed.map(item => this.remove(item.id)));
		return removed;
	}
	async start(id, forcedStage = "") {
		const masterLauncher = find(this.store.launchers.master.items, matches({ id }));
		const { parent } = masterLauncher;
		const startTasks = [() => this.compilerCtrl.startBy({ parent }, forcedStage)];
		const stopTasks = [() => this.compilerCtrl.stopBy({ parent })];
		for (let launcher of this.launchers) {
			startTasks.push(() => launcher.startBy({ parent, enabled: true }));
			stopTasks.push(() => launcher.stopBy({ parent, enabled: true }));
		}
		const worker = new TaskWorker(startTasks, stopTasks);
		this._wokerStarts(masterLauncher, worker);
		await worker.start();
		this._wokerStops(masterLauncher);
	}
	async stop(id) {
		const launcher = find(this.store.launchers.master.items, matches({ id }));
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
	startAutoWatcher(id, path) {
		this.stopAutoWatcher(id);
		if (!path) {
			console.log('no path was provided, rejected');
			return;
		}
		const watcher = fs.watchFile(path, debounce((curr, prev) => {
			if (curr.mtime == prev.mtime) return; 
			if (this.workers.has(id)) {
				console.log('Map was updated, but the compilation was not finished yet, rejected');
				return;
			}
			console.log(`${path} was updated, attempting to start compiler`);
			this.start(id);
		}, 10));
		this.watchers.push({ id, watcher, path });
	}
	// quick and dirty replacement for proper file/folder watch
	// todo: refactor into fs service
	stopAutoWatcher(id) {
		if (this.watchers.length) {
			const wrappers = remove(this.watchers, matches({ id }));
			const wrapper = head(wrappers);
			if (wrapper) {
				console.info(`closing map watcher for ${id}`);
				fs.unwatchFile(wrapper.path);
			}
		}
	}
	stopAutoWatcherAll() {
		if (this.watchers.length) {
			this.watchers.forEach(wrapper => this.stopAutoWatcher(wrapper.id));
		}
	}
	addUserLaunchers(userLaunchers) {
		if (!userLaunchers) return;
		if (!Array.isArray(userLaunchers)) {
			console.warn('User master launchers were not added, because no root array was found!');
			return;
		}
		for (let userLauncher of userLaunchers) {
			const launcher = Object.assign(new MasterLauncher(), cloneDeep(userLauncher));
			this.store.launchers.master.items.push(launcher);
		}
	}
	getUserLaunchers() {
		let launchers = [];
		for (let launcher of this.store.launchers.master.items) {
			launchers.push(Object.assign(omit(cloneDeep(launcher), ['state', 'message'])));
		}
		return launchers;
	}
}

export default MasterLauncherController;