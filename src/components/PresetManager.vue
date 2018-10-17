<template>
	<div>
		<div>
			<component :is="panel" :presets="presets" @action="action"></component>
		</div>
		<div>
			<VueModal v-if="resetModal.show" class="small" @close="resetModal.show = false">
				<template slot="header">
					<VueIcon icon="warning" class="title big"/> &nbsp; Warning!
				</template>
				<div class="default-body">
					Are you sure you want to reset the preset to last saved state?<br>
					This will affect other projects too.
				</div>
				<div slot="footer" class="actions">
					<VueButton class="primary" @click="resetPreset">Confirm</VueButton>
					<VueButton class="primary danger" @click="resetModal.show = false">Cancel</VueButton>
				</div>
			</VueModal>
		</div>
		<div>
			<VueModal v-if="removeModal.show" class="small" @close="removeModal.show = false">
				<template slot="header">
					<VueIcon icon="warning" class="title big"/> &nbsp; Warning!
				</template>
				<div class="default-body">
					Are you sure you want to delete this preset?<br>
					However, it won't affect other depending projects, since these are always fallback to backup preset.
				</div>
				<div slot="footer" class="actions">
					<VueButton class="primary" @click="removePreset">Confirm</VueButton>
					<VueButton class="primary danger" @click="removeModal.show = false">Cancel</VueButton>
				</div>
			</VueModal>
		</div>
	</div>
</template>

<script>
	import PresetCreator from './PresetCreator'
	import PresetMenu from "./PresetMenu";
	import PresetCopier from "./PresetCopier";
	import PresetEditor from "./PresetEditor";
	import { find, map } from "lodash/collection"
	import { matches } from "lodash/util"
	import { isEqual } from "lodash/lang"
	import { mapField } from "@/libs/vuex-field-mapper.js"

	export default {
		inject: ['api'],
		data() {
			return { 
				panel: "preset-menu",
				resetModal: { show: false, id: null },
				removeModal: { show: false, id: null },
			}
		},
		watch: {
			projectId: {
				handler(id, oldId) {
					if (!id) return;
					if (!this.project) return;
					this.api.post('/presets/cleanup');
					if (!this.project.preset.id) return;
					if (!find(this.presets.items, matches({ value: this.presets.selected }))) {
						this.api.post('/presets/restore', { projectId: id });
					}
				},
				immediate: true
			}
		},
		computed: {
			projectId() {
				return this.$route.params.id;
			},
			...mapField({
				project(state) {
					return find(state.projects.items, matches({ id: this.projectId }));
 				},
				presets(state) {
					const project = this.project;
					const items = map(state.presets.items, preset => {						
						return { 
							value: preset.id, 
							label: preset.name, 
							temp: preset.temp, 
							frozen: preset.frozen,
							modified: !isEqual(preset.draft, preset.stages)
						};
					});

					return { 
						items,
						get selected() {
							return project.preset.id;
						},
						set selected(value) {
							project.preset.id = value;
						}
					}
				}
			})
		},
		methods: {
			action(props) {
				switch (props.type) {
					case "create":
						this.api.post('/presets/create', { name: props.value });
						this.panel = "preset-menu";
						break;
					case "remove": {
						this.removeModal.show = true;
						this.removeModal.id = props.value;
						break;
					}
					case "cancel":
						this.panel = "preset-menu";
						break;
					case "show-create":
						this.panel = "preset-creator";
						break;
					case "reset": {
						this.resetModal.show = true;
						this.resetModal.id = props.value;
						break;
					}
					case "save":
						this.api.post('/presets/save', { id: props.value });
						break;
					case "show-copy":
						this.panel = "preset-copier";
						break;
					case "copy":
						this.api.post('/presets/copy', { id: props.value, name: props.name });
						this.panel = "preset-menu";
						break;
					case "show-edit":
						this.panel = "preset-editor";
						break;
					case "rename":
						this.api.post('/presets/rename', { id: props.value, name: props.name });
						this.panel = "preset-menu";
						break;
				}
			},
			resetPreset() {
				this.resetModal.show = false;
				if (this.resetModal.id) {
					this.api.post('/presets/reset', { id: this.resetModal.id });
					this.resetModal.id = null;
				}
			},
			removePreset() {
				this.removeModal.show = false;
				if (this.removeModal.id) {
					this.api.post('/presets/remove', { id: this.removeModal.id });
					this.removeModal.id = null;
				}
			}
		},
		components: { PresetCreator, PresetMenu, PresetCopier, PresetEditor }
	}
</script>

