import { generateId } from "./utils"

class OutputBuffer {
	constructor(props) {
		this.id = generateId('output');
		this.parent = props.parent || "";
		this.buffer = [];
	}
}

export default OutputBuffer;