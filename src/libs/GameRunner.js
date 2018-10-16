import ProcessRunner from './ProcessRunner'
import sendMessage from './net-chan' 

const RCON_PASSWORD = 'notweary';

class GameRunner extends ProcessRunner {
	constructor(path, props) {
		super(path);
		this.props = props;
		this.port = props.rcon;
		this.pass = props.rconPassword ? props.rconPassword : RCON_PASSWORD;
	}
	async run() {
		let props = this.props;
		if (this.port) {
			const newArgs = [`+set`, `rconPassword`, `${this.pass}`, `+set`, `net_port`, `${this.port}`, ...props.args];
			props = { ...props, args: newArgs };
		}
		super.setProps(props);
		await super.run();
	}
	async send(message) {
		if (!this.isRunning()) return;
		await sendMessage(this.port, `rcon ${this.pass} ${message}`);
	}
}

export default GameRunner;