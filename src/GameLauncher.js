import { generateId } from './utils'

class GameLauncher {
	constructor(props = {}) {
		this.id = generateId('game');
		this.parent = props.parent;
		this.path = props.path || "";
		this.custom = props.custom || "";
		this.state = "idle";
		this.message = "";
		this.enabled = false;
		this.devmap = true;
		this.arguments = { enabled: false, value: "" };
		this.options = {}; // additonal fields from game defintion file
	}
}

export default GameLauncher;