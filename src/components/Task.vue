<template>
	<div>
		<div>
			<div>
				<input v-model="task.enabled" type="checkbox" :title="toggleTitle">
				<button v-if="isIdle" @click="start" :disabled="isDisabled">Start</button>
				<button v-else @click="stop">Stop</button>
				<select v-model="task.event">
					<option value="" disabled>Select Event</option>
					<option v-for="(event, i) in events" :value="event.value" :key="i">{{event.label}}</option>
				</select>
				<button @click="remove">Remove</button>
			</div>
			<div>
				<file-dialog v-model="task.path">Executable</file-dialog>
			</div>
			<div>
				<input v-model="task.workDir.enabled" type="checkbox">
				<folder-dialog v-model="task.workDir.value">Work Dir</folder-dialog>
			</div>
			<div>
				<label>
					<input v-model="task.sync" type="checkbox">Syncronous
				</label>
			</div>
			<div>
				<input v-model="task.arguments.enabled" type="checkbox">
				<label title="You can use $map or $mapPath keywords to inject map name and absolute map path respectively">
					Arguments: <input v-model.lazy="task.arguments.value" type="text">
				</label>
			</div>
			<div>
				<p class="error">{{ task.message }}</p>
			</div>
		</div>
		<hr>
	</div>
</template>

<script>
	import FileDialog from "@/components/FileDialog"
	import FolderDialog from "@/components/FolderDialog"

	const events = [
		{ value: 'before-compile', label: 'Before compilation' }, 
		{ value: 'after-compile', label: 'After compilation' },
		{ value: 'before-bspc', label: 'Before BSPC' },
		{ value: 'after-bspc', label: 'After BSPC' },
		{ value: 'before-game-start', label: 'Before game start' },
		{ value: 'after-game-start', label: 'After game start' },		
	];

	export default {
		props: { task: { type: Object, required: true } },
		data() {
			return { events };
		},
		computed: {
			toggleTitle() {
				return "Allow task to react on event"
			},
			isIdle() {
				return this.task.state == "idle";
			},
			isDisabled() {
				const { path } = this.task;
				return !path;
			}
		},
		methods: {
			start() {
				this.$emit('start', this.task.id);
			},
			stop() {
				this.$emit('stop', this.task.id);
			},
			remove() {
				this.$emit("remove", this.task.id);
			}
		},
		components: { FileDialog, FolderDialog }
	}
</script>

<style scoped>
	.error {
		color: red;
	}
</style>
