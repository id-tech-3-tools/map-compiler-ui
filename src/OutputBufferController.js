import OutputBuffer from "./OutputBuffer"
import { head } from "lodash/array"
import { findIndex } from "lodash/array"
import { matches } from "lodash/util"
import { filter } from "lodash/collection"

class OutputBufferController {
	constructor(store) {
		this.store = store;
	}
	create(props) {
		const output = new OutputBuffer(props);
		return this.store.output.items.push(output), output;
	}
	remove(id) {
		const { items } = this.store.output;
		return head(items.splice(findIndex(items, matches({ id })), 1));
	}
	async removeBy(pairs) {
		const { items } = this.store.output;
		const removed = filter(items, matches(pairs));
		removed.forEach(item => this.remove(item.id));
		return removed;
	}
	createMultiple(propsArray) {
		for (let props of propsArray) this.create(props);
	}
}

export default OutputBufferController;