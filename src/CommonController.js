import { cloneDeep } from 'lodash/lang'
import { head } from 'lodash/array'
import { each, filter } from 'lodash/collection'
import { matches } from 'lodash/util'
import { get } from 'lodash/object'

class CommonController {
	constructor(store) {
		this.store = store;
	}
	assignPresetToProject(preset) {
		this.store.project.preset.id = preset.id;
	}
	selectFirstPresetForProject() {
		this.store.project.preset.id = get(head(this.store.presets.items), 'id', "");
	}
	backupPresetIntoProjects(preset) {
		each(filter(this.store.projects.items, matches({ preset: { id: preset.id } })), project => project.preset.backup = cloneDeep(preset));
	}
}

export default CommonController;