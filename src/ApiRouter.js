import EventEmitter from 'events';
import { find } from 'lodash/collection'
import { matches } from 'lodash/util'

// todo: handle request type better
class ApiRouter {
	constructor() {
		this.listeners = [];
	}
	get(route, payload) {
		return this._emitWithReturn(route, payload);
	}
	post(route, payload) {
		this._emit(route, payload);
	}
	route(route, fun) {
		this.listeners.push({ route, fun });
	}
	_emit(route, payload) {
		const recipient = find(this.listeners, matches({ route }));
		if (recipient) {
			recipient.fun(payload);
		}
		else {
			console.warn(`Waning: unchaught route ${route}`);
		}
	}
	_emitWithReturn(route, payload) {
		const recipient = find(this.listeners, matches({ route }));
		if (recipient) {
			return recipient.fun(payload);
		}
		else {
			console.warn(`Waning: unchaught route ${route}`);
		}
		return;
	}
}

export default ApiRouter;