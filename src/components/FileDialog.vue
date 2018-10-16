<template>
	<span class="wrapper">
		<div class="first">
			<button @click="openFile"><slot></slot></button>
		</div>
		<div class="last" :title="value">{{ value | basename }}</div>
	</span>
</template>

<script>
import electron from 'electron';
import Path from 'path'
const { remote: { dialog } } = electron;

function openFileDialog(title, extensions = ['exe'], name = "") {
	return dialog.showOpenDialog({ title, filters: [{ name, extensions }], properties: ['openFile'] });
}

export default {
	model: { props: 'value', event: 'change' },
	props: {
		title: { type: String, default: "Select a file" },
		extensions: { type: Array, default() { return ['*'] } },
		name: { type: String, default: "" },
		value: String
	},
	methods: {
        openFile() {
            const value = openFileDialog(this.title, this.extensions, this.name);
            if (value) this.$emit('change', value[0]);
        }
	},
	filters: {
		basename(value) {
			return Path.basename(value);
		}
	}
}
</script>

<style scoped>
	.wrapper{
		display: inline-flex;
		flex-flow:row nowrap;
		max-width:100%; /* or width:100% if you want the spans to take all available space */
	}
	.first {
		flex:1;
		white-space:nowrap;
	}
	.last {
		/* direction:rtl; */
		/* white-space:pre; */
		/* overflow: hidden; */
		/* text-overflow: ellipsis; */
	}
</style>

