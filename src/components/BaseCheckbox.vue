<template>
	<label :title="title">
		<input type="checkbox" v-model="binded"><slot></slot>
	</label>
</template>

<script>
	export default {
		model: { prop: 'checked', event: 'change' },
		props: {
			title: { default: "", type: String },
			value: { type: [String, Array], default: "" },
			checked: {}
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
		}
	}
</script>

