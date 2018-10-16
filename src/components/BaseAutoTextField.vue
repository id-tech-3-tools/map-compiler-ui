<template>
	<span :title="title">
		<input :list="id" v-model.lazy="binded" :placeholder="placeholder" type="text">
		<datalist :id="id">
			<option v-for="item in items" :key="item.value" :value="item.value">{{ item.label }}</option>
		</datalist>
	</span>
</template>

<script>
	import { generateId } from "@/utils"

	export default {
		data() {
			return { id: generateId('autofield') }
		},
		model: { prop: "value", event: "change" },
		props: {
			value: { type: String, required: true },
			items: { type: Array, required: true },
			title: { type: String, default: "" },
			placeholder: { type: String, default: " "}
		},
		computed: {
			binded: {
				get() {
					return this.value;
				},
				set(value) {
					this.$emit("change", value);
				}
			}
		}
	}
</script>

