import { generateId } from './utils'

class CompilerLauncher {
	constructor(props = {}) {
		this.id = generateId('compiler');
		this.parent = props.parent;
		this.path = props.path || "";
		this.custom = props.custom || "";
		this.state = "idle";
		this.message = "";
		this.enabled = true;
		this.threads = { enabled: false, value: -1 };
	}
}

export default CompilerLauncher;