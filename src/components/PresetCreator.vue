<template>
	<div>
		<VueInput v-model="value" class="input-field" placeholder="Preset name"/>
		&nbsp;
		<VueButton @click="create" class="button-col" :disabled="!validation.valid" icon-left="note_add">Create</VueButton>
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
	import { includes, find } from 'lodash/collection'
	import { matches } from 'lodash/util'

	export default {
		data() {
			return { value: "", validation: { valid: true, message: '' } }
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
			},
		},
		methods: {
			create() {
				this.$emit("action", { type: "create", value: this.value });
			},
			cancel() {
				this.$emit("action", { type: "cancel" });
			}
		}
	}
</script>

<style scoped>
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

