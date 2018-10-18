<template>
	<div>
		<div @click="toggle">
			<slot name="header"></slot>
		</div>
		<div>
			<collapse :toggled="value" :style="extStyle">
				<slot name="body"></slot>
			</collapse>
		</div>
	</div>	
</template>

<script>
	import Collapse from "./Collapse"

	export default {
		model: {
			event: "change",
			prop: "value"
		},
		props: {
			value: { type: Boolean, default: true },
			extStyle: { type: Object, default: {} },
		},
		methods: {
			toggle() {
				this.$emit('change', !this.value);
				this.$emit('expanded', !this.value);
			}
		},
		components: { Collapse }
	}
</script>
