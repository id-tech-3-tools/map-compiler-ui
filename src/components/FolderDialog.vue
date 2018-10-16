<template>
	<span>
		<button @click="openFolder"><slot></slot></button>
		<span class="path">{{ value }}</span>
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
	}
</style>
