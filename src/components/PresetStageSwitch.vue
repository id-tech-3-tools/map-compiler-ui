<template>
	<div class="switch-panel">
		<label v-tooltip=" htmlify(title)" class="switch-name">
			<input v-model="option.enabled" type="checkbox" :disabled="frozen" class="switch-toggle">
			<span class="switch-base">{{ switchName }}</span>
		</label>
		<VueInput v-if="expectsNumberInput" v-model.lazy="option.value" class="switch-num-field" type="number" :disabled="frozen"/>
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
			},
			htmlify(value) {
				return value.replace(/\\n/g, '<br>');
			}
		}
	}
</script>

<style scoped>
	.switch-panel {
		min-height: 30px;
	}

	.switch-name {
		padding-right: 10px;
	}

	.switch-toggle {
		display: none;
	}

	.switch-toggle + .switch-base {
		cursor: pointer;
	}
	
	.switch-toggle + .switch-base:before {
		box-sizing: border-box;
		background: #1d2935;
		border: 1px solid #2c3e50;
		width: 12px;
		height: 12px;
		content: "";
		display: inline-block;
		margin: 0px 10px 0 5px;
		transition: background-color .3s ease;
	}
	
	.switch-toggle:disabled + .switch-base {
		opacity: 0.8;
	}

	.switch-toggle:checked + .switch-base:before {
		background: #42b983;
		border: none;
	}
</style>

<style>
	.switch-num-field {
		min-width: 80px;
	}
	.switch-num-field input[type="number"] {
		height: 20px!important;
	}
</style>


