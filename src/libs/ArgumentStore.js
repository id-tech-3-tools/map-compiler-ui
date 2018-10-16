class ArgumentStore {
	constructor() {
		this._arguments = [];
	}
	parse(str, action) {
		const seqs = (`${str}`).split(/(\"[^"]*\")/).filter(seq => seq !== "").map(seq => seq.trim());
		const args = [];
		for (let seq of seqs) {
			if (seq.startsWith('"')) {
				args.push(seq.replace(/"/g, ''));
			} else {
				args.push(...seq.split(/\s+/));
			}
		}
		if (action) action(...args);
		return args;
	}
	prepend(...args) {
		if (args.length == 0) return;
		for (let argument of args) {
			this.parse(argument, (...rest) => this._arguments.unshift(...rest));
		}
	}
	append(...args) {
		if (args.length == 0) return;
		for (let argument of args) {
			this.parse(argument, (...rest) => this._arguments.push(...rest));
		} 
	}
	toArray() {
		return Array.from(this._arguments);
	}
	toString() {
		return this._arguments.reduce((args, arg) => `${args} ${/\s+/.test(arg) ? `"${arg}"` : arg}`, "").trim();
	}
}

export default ArgumentStore;