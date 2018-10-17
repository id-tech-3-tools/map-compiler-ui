<template>
	<div>
		<VueInput v-model="value" class="input-field"/>
		&nbsp;
		<VueButton @click="copy" class="button-col" icon-left="add_to_photos" :disabled="!validation.valid">Copy As</VueButton>
		<VueButton @click="cancel">Cancel</VueButton>
		<div class="message-panel">
			<span v-show="!validation.valid" class="message-text">
				<VueIcon icon="warning" />
				&nbsp;
				{{ validation.message }}
			</span>
		</div>
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

<style>
	.input-field {
		min-width: 300px;
	}
	.button-col {
		margin-right: 10px;
	}
	.message-panel {
		margin: 10px 0;
		min-height: 25px;
	}
	.message-text {
		font-size: 14px;
		color: #e83030;
	}
</style>
