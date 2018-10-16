import { generateId } from './utils.js'

class Task {
	constructor(props = {}) {
		this.id = generateId('task');
		this.parent = props.parent;
		this.path = props.path || "";
		this.state = "idle";
		this.message = "";
		this.event = "";
		this.enabled = false;
		this.workDir = { enabled: false, value: "" }; // working directory
		this.sync = true;
		this.arguments = { enabled: false, value: "" };
	}
}

export default Task;