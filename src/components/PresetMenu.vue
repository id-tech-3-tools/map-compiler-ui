<template>
	<div>
		<select v-model="presets.selected">
			<option value="" disabled>Select preset</option>
			<option v-for="preset in presets.items" :value="preset.value" :key="preset.value">{{ augmentName(preset) }}</option>
		</select>
		<button @click="add">+</button>
		<button @click="reset" :disabled="isEmpty || isFrozen" title="Reset">R</button>
		<button @click="save" :disabled="isEmpty || isFrozen" title="Save">S</button>
		<button @click="copy" :disabled="isEmpty" title="Save As">C</button>
		<button @click="edit" :disabled="isEmpty || isFrozen" title="Edit">E</button>
		<button @click="remove" :disabled="isEmpty" title="Delet">X</button>
	</div>
</template>

<script>
	import { find } from "lodash/collection"
	import { matches } from "lodash/util"

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
		},
		methods: {
			augmentName(preset) {
				return (preset.temp ? "temp: " : "" ) + `${preset.label}` + (preset.modified ? " *" : "");
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
			}
		}
	}
</script>

