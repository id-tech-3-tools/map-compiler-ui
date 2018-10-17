<template>
	<span>
		<VueButton @click="openFolder" v-tooltip="title" icon-left="folder_open"><slot></slot></VueButton>
		&nbsp;
		<span class="path" v-tooltip="value">{{ value }}</span>
	</span>
</template>

<script>
import electron from 'electron';
const { remote: { dialog } } = electron;

function openFolderDialog(title) {
	return dialog.showOpenDialog({ title, properties: ['openDirectory'] });
}

export default {
	model: { prop: 'value', event: 'change' },
	props: {
		title: { type: String, default: 'Select a directory' },
		value: String
	},
	methods: {
		openFolder() {
			const value = openFolderDialog(this.title);
            if (value) this.$emit('change', value[0]);
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
