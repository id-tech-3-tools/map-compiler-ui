<template>
	<span class="wrapper">
		<VueButton @click="openFile" v-tooltip="title" icon-left="insert_drive_file"><slot></slot></VueButton>
		&nbsp;
		<span class="path" v-tooltip="value">{{ value | basename }}</span>
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
	.path {
		text-overflow: ellipsis;
		font-size: 14px;
	}
</style>

