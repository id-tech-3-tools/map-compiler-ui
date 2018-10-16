import { generateId } from './utils'

class MasterLauncher {
	constructor(props = {}) {
		this.id = generateId('general');
		this.parent = props.parent;
		this.state = "idle";
		this.message = "";
		this.auto = false; // auto start
	}
}

export default MasterLauncher;