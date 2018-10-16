import Preset from './Preset'
import { head, findIndex } from 'lodash/array'
import { find, reject } from 'lodash/collection'
import { cloneDeep } from 'lodash/lang'
import { matches } from 'lodash/util'

class PresetController {
	constructor(store, fileSystem) {
		this.store = store;
		this.fileSystem = fileSystem;
	}
	create(props) {
		const preset = new Preset(props);
		return this.store.presets.items.push(preset), preset;
	}
	remove(id) {
		const { items } = this.store.presets;
		return head(items.splice(findIndex(items, matches({ id })), 1));
	}
	reset(id) {
		const preset = find(this.store.presets.items, matches({ id }));
		preset.draft = cloneDeep(preset.stages);
	}
	save(id) {
		const preset = find(this.store.presets.items, matches({ id }));
		preset.stages = cloneDeep(preset.draft);
	}
	copy(id, name) {
		const preset = find(this.store.presets.items, matches({ id }));
		let copy = null;
		if (preset.temp) {
			preset.temp = false;
			preset.frozen = false;
			preset.name = name;
			copy = preset;
		}
		else {
			copy = new Preset({ name });
			console.log(preset.draft);
			copy.draft = cloneDeep(preset.draft);
			copy.stages = cloneDeep(preset.stages);
			this.store.presets.items.push(copy);
		}
		return copy;
	}
	rename(id, name) {
		const preset = find(this.store.presets.items, matches({ id }));
		preset.name = name;
	}
	cleanUp() {
		const { presets } = this.store;
		presets.items = reject(presets.items, matches({ temp: true }));
	}
	restore(projectId) {
		const project = find(this.store.projects.items, matches({ id: projectId }));
		const { backup } = project.preset;
		if (!backup) return;
		const restored = new Preset({ name: `${backup.name}` });
		restored.temp = true;
		restored.frozen = true;
		restored.draft = cloneDeep(backup.draft);
		restored.stages = cloneDeep(backup.stages);
		this.store.presets.items.push(restored);
		return restored;
	}
	addDefaultPresets(defaultPresets) {
		if (!defaultPresets) return;
		if (!Array.isArray(defaultPresets)) {
			console.warn('Default presets were not added, because no root array was found!');
			return;
		}
		for (let defaultPreset of defaultPresets) {
			const preset = new Preset({ name: defaultPreset.name, id: defaultPreset.id });
			preset.frozen = true;
			preset.draft = cloneDeep(defaultPreset.stages);
			preset.stages = cloneDeep(defaultPreset.stages);
			this.store.presets.items.push(preset);
		}
	}
	addUserPresets(userPresets) {
		if (!userPresets) return;
		if (!Array.isArray(userPresets)) {
			console.warn('User presets were not added, because no root array was found!');
			return;
		}
		for (let userPreset of userPresets) {
			const preset = new Preset({ name: userPreset.name, id: userPreset.id });
			preset.draft = cloneDeep(userPreset.draft);
			preset.stages = cloneDeep(userPreset.stages);
			this.store.presets.items.push(preset);
		}
	}
	getUserPresets() {
		const userPresets = [];
		for (let preset of this.store.presets.items) {
			if (preset.frozen || preset.temp) continue;
			userPresets.push({
				name: preset.name,
				id: preset.id,
				stages: cloneDeep(preset.stages),
				draft: cloneDeep(preset.draft),
			});
		}
		return userPresets;
	}
}

export default PresetController;