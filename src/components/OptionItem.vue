<template>
	<div class="options-panel">
		<div v-if="definition.type == 'toggle'">
			<span v-tooltip="definition.title">
				<option-switch :values="definition.values" v-model="option.value" class="extend-right">
					{{definition.label}}
				</option-switch>
			</span>
		</div>
		<div v-if="definition.type == 'number'">
			<span v-tooltip="definition.title" class="col-gap">
				<VueSwitch v-model="option.enabled" class="extend-right">{{ definition.label }}</VueSwitch>
			</span>
			<VueInput v-model="option.value" type="number" class="option-num-field" />
		</div>
	</div>
</template>

<script>
	import OptionSwitch from "@/components/OptionSwitch"

	export default {
		model: { prop: 'checked', event: 'change' },
		props: {
			definition: { type: Object, required: true },
			option: { type: Object, required: true }
		},
		computed: {
			binded: { 
				get() { 
					if (this.value) {
						if (typeof this.value == "string") {
							return this.value == this.checked;
						}
						else if (Array.isArray(this.value)) {
							return this.value[1] == this.checked;
						}
						return false;
					}
					return this.checked;
				},
				set(value) { 
					if (this.value) {
						if (typeof this.value == "string") {
							this.$emit('change', value ? this.value : "");
						}
						else if (Array.isArray(this.value)) {
							this.$emit('change', this.value[Number(value)]);
						}
						return;
					}
					this.$emit('change', value);
				}
			}
		},
		components: { OptionSwitch }
	}
</script>

<style scoped>
	.col-gap {
		margin-right: 10px;
	}
</style>

<style>
	.options-panel {
		padding: 5px 10px;
	}
	.option-num-field {
		min-width: 80px;
	}
	.option-num-field input[type="number"] {
		height: 24px!important;
	}
</style>


