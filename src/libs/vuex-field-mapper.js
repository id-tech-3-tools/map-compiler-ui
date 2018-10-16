// todo: refactor into Proxy

import Vue from 'vue'

// commit paths
const FIELD_UPDATE = '__fieldUpdater/update';
const FIELD_ARRAY_UPDATE = '__fieldUpdater/arrayUpdate';

function queryField(state, path) {
    let entry = state;
    for (let i = 0; i < path.length; i++) {
        entry = entry[path[i]];
    }
    return entry;
}

// Unwrap the entry, useful in cases where wrapped entry is set as a value:
// field.items = filter(field.items, matches({ enabled: false })) 
// The resulting array consists of wrapped entries which would normally leak to store.
// Upon next field wrapping this wrapped entries would get wrapped again,
// at the end each field would be wrapped multiple times, which would start to cause issues.
// To solve the issue unwrap entries upon each set.
function unWrapEntry(entry) {
    if (typeof entry == "object" && entry.__fmapper ) {
        const obj = {};
        for (let key of Object.keys(entry)) {
            if (key == "__fmapper") continue;
            obj[key] = unWrapEntry(entry[key]);
        }
        return obj;
    }
    else if (entry instanceof FMReactArray) {
        return unWrapEntry([...entry]);
    }
    else if (Array.isArray(entry)) {
        for (let i = 0; i < entry.length; i++) {
            entry[i] = unWrapEntry(entry[i]);
        }
    }
    return entry;
}

// isArray -> array update request
function updateStateField(state, path, value, isArray = false) {
    let entry = state;
    let fieldPath = path.filter(item => item !== "");
    let lastKey = fieldPath.pop();
    for (let key of fieldPath) {
        let nextEntry = entry[key];
        entry = nextEntry === undefined ? Vue.set(entry, key, {}) : nextEntry;
    }
    if (!entry[lastKey] || Array.isArray(entry)) {
        Vue.set(entry, lastKey, value);
    }
    else {
        // handle array methods
        if (Array.isArray(entry[lastKey]) && isArray) {
            const { method, props } = value;
            entry[lastKey][method](...props);
            return;
        }
        entry[lastKey] = value;
    }
}

class FMReactArray extends Array {
    constructor(updater, arr) {
        super();
        super.push(...arr);
        this._updater = updater;
    }
    push(...props) {
        this._updater({ method: 'push', props });
        return this.length + 1;
    }
    pop() {
        this._updater({ method: 'pop', props: [] });
        const lastElement = arr[this.length - 1];
        return lastElement;
    }
    shift() {
        this._updater({ method: 'shift', props: [] });
        const firstElement = arr[0];
        return firstElement;
    }
    unshift(...props) {
        this._updater({ method: 'unshift', props });
        return this.length + props.length;
    }
    splice(...props) {
        this._updater({ method: 'splice', props });
        // return super.splice(...props);
        return this.slice(props[0], props[1] !== undefined ? props[0] + props[1] : undefined);
    }
    sort(...props) {
        this._updater({ method: 'sort', props });
        // return super.sort(...props);
    }
    reverse() {
        this._updater({ method: 'reverse', props: [] });
        // return super.reverse(...props);
    }
}

// wraps entries with accessor methods, on each value set, unwraps value entries if required
function wrapEntry(store, entry, path) {
    if (Array.isArray(entry)) {
        return new FMReactArray(
            value => store.commit(FIELD_ARRAY_UPDATE, { path, value }), 
            entry.map((item, i) => wrapEntry(store, item, [...path, i])));
    }
    else if (entry && typeof entry == "object") {
        const obj = {};
        // mark entry as being wrapped by field mapper
        Object.defineProperty(obj, '__fmapper', { enumerable: false, writable: false, configurable: false, value: true });
        for (let key of Object.keys(entry)) {
            Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return wrapEntry(store, entry[key], [...path, key]);
                },
                set: (value) => {
                    store.commit(FIELD_UPDATE, { path: [...path, key], value: unWrapEntry(value) });
                }
            });
        }
        return obj;
    }
    else {
        return entry;
    }
}

function injectFieldUpdater(store) {
    store.registerModule('__fieldUpdater', {
        namespaced: true,
        state: {},
        mutations: {
            update(state, payload) {
                updateStateField(this.state, payload.path, payload.value);
            },
            arrayUpdate(state, payload) {
                updateStateField(this.state, payload.path, payload.value, true);
            }
        },
    });
}

function hasFieldUpdater(store) {
    return store.state.__fieldUpdater;
}

// Typical field mapping, which value can be either field name or function(state): 
// { alias: 'fieldName', alias(state) { return state.fieldName } }
function createFieldHandlers(field, namespaces, store = undefined) {
    return {
        get() {
            const theStore = store || this.$store;
            if (!hasFieldUpdater(theStore)) injectFieldUpdater(theStore);
            if (typeof field == 'function') {
                return field.call(this, wrapEntry(theStore, queryField(theStore.state, namespaces), namespaces));
            }
            else {
                const path = [...namespaces, field];
                return wrapEntry(theStore, queryField(theStore.state, path), path);
            }
        },
        set(value) {
            const theStore = store || this.$store;
            if (typeof field == 'function') {
                throw new Error('You cannot assign value to a non reactive field');
            }
            else {
                theStore.commit(FIELD_UPDATE, { path: [...namespaces, field], value });
            }
        }
    }
}

// Special case where value is an object with get/set functions 
// { alias: { get(state) { return state.fieldName }, set(value, state) { state.field = value } } }
function createGetSetHandlers(field, namespaces, store = undefined) {
    return {
        get() {
            const theStore = store || this.$store;
            if (!hasFieldUpdater(theStore)) injectFieldUpdater(theStore);
            return field.get.call(this, wrapEntry(theStore, queryField(theStore.state, namespaces), namespaces));
        },
        set(value) {
            const theStore = store || this.$store;
            field.set.call(this, value, wrapEntry(theStore, queryField(theStore.state, namespaces), namespaces));
        }
    }
}

/*
    Store field mapper for component
    mapField(fields[]);
    mapField(fields{});
    mapField(namespace, fields{});
    mapField(fields { field(state) {...} } })
    mapField(fields { field: { get(state) {...}, set(state) {...} } })
    mapField(namespace, fields[]);
    accept array with mixed types: String | Object
*/
function mapField(...parms) {
    let fields = parms[0]; 
    let namespaces = []; 
    // namespace support
    if (parms.length > 1) {
        namespaces = Array.isArray(parms[0]) ? parms[0] : parms[0].split('/');
        fields = parms[1];
    }
    
    if (Array.isArray(fields)) {
        fields = fields.reduce((obj, item) => (obj[item] = item, obj), {});
    }

    const obj = {};
    for (let [key, value] of Object.entries(fields)) {
        //  for { get(){}, set(){} }
        if (typeof value == "object")
            obj[key] = createGetSetHandlers(value, [...namespaces]);
        else
            obj[key] = createFieldHandlers(value, [...namespaces]);
    }
    return obj;
}

// Store mapper, allows to map fields outside the component, 
// returns a store wrapper, with all accessible fields specified in the arguments
// const wrapper = mapFieldWithStore(store, { projects(state) {  return state.projects.items } });
// wrapper.projects -> [...]
function mapFieldWithStore(store, ...parms) {
    let fields = parms[0];
    let namespaces = [];
    // namespace support
    if (parms.length > 1) {
        namespaces = Array.isArray(parms[0]) ? parms[0] : parms[0].split('/');
        fields = parms[1];
    }

    if (Array.isArray(fields)) {
        fields = fields.reduce((obj, item) => (obj[item] = item, obj), {});
    }

    const handlerFactory = function(value) {
        if (typeof value == "object")
            return createGetSetHandlers(value, [...namespaces], store);
        else
            return createFieldHandlers(value, [...namespaces], store);
    }

    let obj = {};
    for (let [key, value] of Object.entries(fields)) {
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            ...handlerFactory(value)       
        });
    }
    return obj;
}

export { mapField, mapFieldWithStore };