<template>
	<div class="switch">
		<label :title="title">
			<input v-model="option.enabled" type="checkbox" :disabled="frozen">
			{{ switchName }}
		</label>
		<input v-if="expectsNumberInput" v-model.lazy="option.value" class="num-field" type="number" :disabled="frozen">
	</div>
</template>

<script>
	import { omit } from "lodash/object"
	import { cloneDeep } from "lodash/lang"

	export default {
		props: {
			type: { type: String, default: "" },
			description: { type: String, required: true },
			name: { type: String, required: true },
			label: { type: String, default: "" },
			switches: { type: Object, required: true },
			frozen: { type: Boolean, required: true }
		},
		computed: {
			expectsNumberInput() {
				return this.type == "number";
			},
			switchName() {
				return this.label ? this.label : this.name;
			},
			title() {
				return `-${this.name}\n${this.description}`;
			},
			option() {
				const selfSwitch = this.switches[this.name]; 
				const self = this;
				return {
					get enabled() {
						return selfSwitch ? selfSwitch.enabled : false;
					},
					set enabled(value) {
						self.update(value, this.value);
					},
					get value() {
						return selfSwitch ? selfSwitch.value : "";
					},
					set value(value) {
						self.update(this.enabled, value);
					}
				}
			}
		},
		methods: {
			update(enabled, value) {
				const removed = !enabled && !value ? this.name : ""; // remove key/value if needed
				const newSwitches = omit(Object.assign(cloneDeep(this.switches), { [this.name]: {enabled, value} }), removed);
				this.$emit('update:switches', newSwitches);
			}
		}
	}
</script>

<style scoped>
	.num-field {
		width: 80px;
	}
	.switch {
		display: inline-block;
	}
</style>


