import { generateId } from './utils'

class BspcLauncher {
	constructor(props = {}) {
		this.id = generateId('bspc');
		this.parent = props.parent;
		this.path = props.path || "";
		this.custom = props.custom || "";
		this.workDir = { enabled: false, value: "" }; // working directory
		this.state = "idle";
		this.message = "";
		this.enabled = false;
		this.arguments = { enabled: false, value: "" };
	}
}

export default BspcLauncher;