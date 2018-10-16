class TaskWorker {
	constructor(startTasks, stopTasks, restartTasks) {
		this.startTasks = startTasks;
		this.stopTasks = stopTasks;
		this.restartTasks = restartTasks;
		this.isRunning = true;
	}
	async start() {
		for (let task of this.startTasks) {
			if (this.isRunning) await task();
		}
	}
	async stop() {
		this.isRunning = false;
		for (let task of this.stopTasks) {
			await task();
		}
	}
	async restart() {
		if (!this.restartTasks) return;
		for (let task of this.restartTasks) {
			await task();
		}
	}
}

export default TaskWorker;