import Task from './Task.js'
import { head, findIndex } from 'lodash/array'
import { filter, reject, find, map } from 'lodash/collection'
import { matches, defaultTo } from 'lodash/util'
import { omit } from 'lodash/object'
import { cloneDeep } from 'lodash/lang'
import ProcessRunner from "@/libs/ProcessRunner"
import Path from 'path'
import TaskWorker from './TaskWorker'
import { replaceString } from "@/utils"
import ArgumentStore from '@/libs/ArgumentStore'

class TaskController {
	constructor(store) {
		this.store = store;
		this.workers = new Map();
	}
	create(props) {
		const task = new Task(props);
		return this.store.tasks.items.push(task), task;
	}
	async remove(id) {
		const { items } = this.store.tasks;
		if (this.workers.has(id)) {
			console.warn(`task ${id} was issued to be removed, but it's still running, attempting to kill it`);
			await this.stop(id);
		}
		return head(items.splice(findIndex(items, matches({ id })), 1));
	}
	async removeBy(pairs) {
		const { items } = this.store.tasks;
		const removed = filter(items, matches(pairs));
		await Promise.all(removed.map(item => this.remove(item.id)));
		return removed;
	}
	async start(id) {
		const project = this.store.project;
		const task = find(this.store.tasks.items, matches({ id }));
		const path = task.path;

		if (this.workers.has(id)) {
			console.warn('task attempted to run, but it is already running, killing previous worker');
			const worker = this.workers.get(id);
			await worker.stop();
		}
		
		if (!path) {
			task.message = "Please select executable path.";
			return;
		}
		
		const cwd = defaultTo(task.workDir.enabled ? task.workDir.value : undefined, Path.dirname(task.path));
		const env = { map: Path.basename(project.map, '.map'), mapPath: project.map };
		const args = new ArgumentStore();
		args.append(task.arguments.enabled ? replaceString(task.arguments.value, env) : "");
		const proc = new ProcessRunner(path, { cwd, args: args.toArray() });
		const worker = new TaskWorker([() => proc.run()], [() => proc.kill()]);

		proc.on('error', (error) => task.message = error);
		
		this._wokerStarts(task, worker);
		await worker.start();
		this._wokerStops(task);
	}
	async stop(id) {
		const task = find(this.store.tasks.items, matches({ id }));
		const worker = this.workers.get(task.id);
		if (worker) await worker.stop();
	}
	async startBy(pairs) {
		const { items } = this.store.tasks;
		const tasks = filter(items, matches(pairs));
		const asyncTasks = [];
		for (let task of tasks) {
			if (task.sync)
				await this.start(task.id);
			else
				asyncTasks.push(this.start(task.id));
		}
		await Promise.all(asyncTasks);
	}
	async stopBy(pairs) {
		const { items } = this.store.tasks;
		const tasks = filter(items, matches(pairs));
		await Promise.all(tasks.map(async (task) => await this.stop(task.id)));
	}
	_wokerStarts(task, worker) {
		task.state = "running";
		this.workers.set(task.id, worker);
	}
	_wokerStops(task) {
		task.state = "idle";
		this.workers.delete(task.id);
	}
	addUserTasks(userTasks) {
		if (!userTasks) return;
		if (!Array.isArray(userTasks)) {
			console.warn('User tasks were not added, because no root array was found!');
			return;
		}
		for (let userTask of userTasks) {
			const task = Object.assign(new Task(), cloneDeep(userTask));
			this.store.tasks.items.push(task);
		}
	}
	getUserTasks() {
		let tasks = [];
		for (let task of this.store.tasks.items) {
			tasks.push(Object.assign(omit(cloneDeep(task), ['state', 'message'])));
		}
		return tasks;
	}
}

export default TaskController;