<template>
	<VueSwitch v-model="binded"><slot></slot></VueSwitch>
</template>

<script>
	export default {
		model: { prop: 'checked', event: 'change' },
		props: {
			values: { type: [String, Array], default: "" },
			checked: {}
		},
		computed: {
			binded: { 
				get() { 
					return this.values[1] == this.checked;
				},
				set(value) { 
					this.$emit('change', this.values[Number(value)]);
				}
			}
		}
	}
</script>

<style scoped>

</style>


