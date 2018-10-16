import { generateId } from './utils.js'

class Project {
	constructor(props = {}) {
		this.id = props.id || generateId('project');
		this.name = props.name || "New-Project";
		this.path = ""; // project path
		this.preset = { id: "", backup: null };
		this.map = ""; // map path
		this.game = "";
		this.mod = { enabled: false, value: "" };
	}
}

export default Project;