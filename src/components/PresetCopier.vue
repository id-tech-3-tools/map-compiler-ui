<template>
	<div>
		<input v-model="value" type="text">
		<button @click="copy" :disabled="!validation.valid">Save As</button>
		<button @click="cancel">Cancel</button>
		<p v-show="!validation.valid">{{ validation.message }}</p>
	</div>
</template>

<script>
	import { find } from "lodash/collection"
	import { matches } from "lodash/util"

	export default {
		data() {
			const preset = find(this.presets.items, matches({ value: this.presets.selected }));
			return { value: preset && preset.label || "", validation: { valid: true, message: '' } }
		},
		props: {
			presets: { type: Object, required: true }
		},
		watch: {
			value: {
				handler(val, oldVal) {
					if (val == oldVal) return;
					if (val == "") {
						this.validation = { valid: false, message: "Name field should not stay empty!" };
					}
					else if (find(this.presets.items, matches({ label: val }))) {
						this.validation = { valid: false, message: "Should contain unique name!" };
					}
					else {
						this.validation.valid = true;
					}
				},
				immediate: true
			}
		},
		methods: {
			copy() {
				this.$emit("action", { type: "copy",  value: this.presets.selected, name: this.value });
			},
			cancel() {
				this.$emit("action", { type: "cancel" });
			}
		}
	}
</script>