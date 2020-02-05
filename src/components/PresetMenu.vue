<template>
	<div>
		<div class="menu-panel">
			<div class="menu-panel-list" v-on:keydown="selectPresetByKey">
				<VueSelect v-model="presets.selected" placeholder="Select preset" class="preset-selector" v-tooltip="`Select preset`">
					<VueSelectButton 
						v-for="preset in presets.items" 
						:value="preset.value" 
						:key="preset.value" 
						:label="getLabel(preset)" 
						:icon-left="preset.frozen ? 'lock' : 'lock_open'"/>
				</VueSelect>
			</div>
			<div class="menu-panel-ctrl">
				<VueButton @click="add" class="icon-button" icon-left="note_add" v-tooltip="`Add preset`"/>
				<VueButton @click="reset" class="icon-button" icon-left="undo" :disabled="isEmpty || isFrozen || !isModified" v-tooltip="`Undo changes`"/>
				<VueButton @click="save" class="icon-button" icon-left="save" :disabled="isEmpty || isFrozen" v-tooltip="`Save preset`"/>
				<VueButton @click="copy" class="icon-button" icon-left="add_to_photos" :disabled="isEmpty" v-tooltip="`Copy preset`"/>
				<VueButton @click="edit" class="icon-button" icon-left="edit" :disabled="isEmpty || isFrozen" v-tooltip="`Edit preset`"/>
				<VueButton @click="remove" class="icon-button danger" icon-left="close" :disabled="isEmpty || isFrozen" v-tooltip="`Delete preset`"/>
			</div>
		</div>
	</div>
</template>

<script>
	import { find } from "lodash/collection"
	import { matches } from "lodash/util"
	import { selectNextByKey } from '@/utils.js'

	export default {
		props: {
			presets: { type: Object, required: true }
		},
		computed: {
			hasItems() {
				return this.presets.items.length > 0;
			},
			hasSelected() {
				return this.presets.selected.length > 0;
			},
			isEmpty() {
				return !this.hasItems || !this.hasSelected || !this.preset;
			},
			preset() {
				return find(this.presets.items, matches({ value: this.presets.selected }));
			},
			isFrozen() {
				if (this.isEmpty) return true;
				return this.preset.frozen;
			},
			isModified() {
				if (this.isEmpty) return false;
				return this.preset.modified;
			}
		},
		methods: {
			getLabel(preset) {
				return (preset.temp ? "deleted: " : "" ) + `${preset.label}` + (preset.modified ? " *" : "");
			},
			add() {
				this.$emit('action', { type: "show-create" });
			},
			remove() {
				this.$emit("action", { type: "remove", value: this.presets.selected });
			},
			reset() {
				this.$emit("action", { type: "reset", value: this.presets.selected });
			},
			save() {
				this.$emit("action", { type: "save", value: this.presets.selected });
			},
			copy() {
				this.$emit('action', { type: "show-copy" });
			},
			edit() {
				this.$emit('action', { type: "show-edit" });
			},
			selectPresetByKey(ev) {
				let presets = this.presets.items;
				if (!presets.length) {
					return;
				}
				let selectedPreset = this.presets.selected;
				let selectedPresetIndex = presets.findIndex((i) => i.value === selectedPreset);
				let newSelection = selectNextByKey(presets, selectedPresetIndex, ev.key);
				if (newSelection) {
					this.presets.selected = newSelection;
				}
			}
		}
	}
</script>

<style scoped>
	.preset-selector {
		min-width: 300px;
	}
	.menu-panel {
		max-width: 600px;
		display: grid;
		grid-template-columns: 350px auto;
		grid-gap: 10px;
	}
	.menu-panel-list > * {
		width: 100%;
	}
	.menu-panel-ctrl {
		display: grid;
		grid-template-columns: repeat(6, 32px);
		grid-gap: 10px;
	}
</style>
