import EventEmitter from 'events'
import ProcessRunner from './ProcessRunner'

class CompilerRunner extends EventEmitter {
	constructor(path, stages, props) {
		super();
		this.path = path;
		this.props = props;
		this.stages = stages;
		this._isRunning = false;
		this._procs = [];
	}
	async run() {
		const { path, props, stages } = this;
		if (!stages.length) return;
		this._procs = [];
		for (let stage of stages) {
			const newProps = { ...props, args: stage };
			const proc = new ProcessRunner(path, newProps);
			proc.on('data', data => super.emit('data', data));
			proc.on('error', error => super.emit('error', error));
			this._procs.push(proc);
		}
		this._isRunning = true;
		for (let proc of this._procs) {
			if (this._isRunning) await proc.run();
		}
		super.emit('exit');
		this._isRunning = false;
	}
	async kill() {
		this._isRunning = false;
		for (let proc of this._procs) await proc.kill();
	}
	isRunning() {
		return this._isRunning;
	}
}

export default CompilerRunner;