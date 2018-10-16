import cp from 'child_process';
import EventEmitter from 'events';
import util from 'util';
import Path from 'path';

class ProcessRunner extends EventEmitter {
	constructor(path, props) {
		super();
		this._proc = null;
		this._path = path;
		if (props) this.setProps(props);
		this._isRunning = false;
		this._hasRun = false;
		this._wasStopped = false;
		this._signal = 0;
	}
	run() {
		return new Promise((resolve, reject) => {
			if (this._isRunning || this._hasRun) return;
			try {
				console.log(`launching process: ${Path.basename(this._path)} (${this._props.cwd})`, this._args);
				this._proc = cp.spawn(this._path, this._args, this._props);
			}
			catch (err) {
				super.emit('error', err.message);
				resolve();
				return;
			}
			this._isRunning = true;
			this._proc.stdout.on('data', (data) => super.emit('data', data));
			this._proc.on('exit', (code, signal) => {
				this._isRunning = false;
				super.emit('exit', undefined, code, signal);
				resolve();
			});
			this._proc.on('error', (err) => {
				this._isRunning = false;
				super.emit('error', err.message);
				resolve();
			});
		});
	}
	async kill() {
		if (!this._isRunning) return;
		this._proc.kill('SIGTERM');
		this._wasStopped = true;
		this._isRunning = false;
		this._hasRun = true;
		await util.promisify(this.on.bind(this))('exit');
	}
	async detach() {
		await kill();
	}
	async exits() {
		if (!this._isRunning) return;
		await util.promisify(this.on.bind(this))('exit');
	}
	wasStopped() {
		return this._wasStopped;
	}
	isRunning() {
		return this._isRunning;
	}
	setProps(props) {
		this._args = Array.from(props.args ? props.args : []);
		this._props = Object.assign({}, props);
	}
}

export default ProcessRunner;