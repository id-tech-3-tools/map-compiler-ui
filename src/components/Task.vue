<template>
	<div class="task-panel">
		<div>
			<div class="task-header">
				<div>
					<span class="task-ctrl"><VueSwitch v-model="task.enabled" type="checkbox" v-tooltip="toggleTitle"/></span>
				</div>
				<div>
					<VueButton v-if="isIdle" @click="start" class="width100" :disabled="isDisabled">Start</VueButton>
					<VueButton v-else class="width100 danger" @click="stop">Stop</VueButton>
				</div>
				<div v-tooltip="`Select task trigger event`">
					<VueSelect v-model="task.event" class="event-list width100" placeholder="Select Event" button-class="flat">
						<VueSelectButton v-for="(event, i) of events" :key="i" :value="event.value" :label="event.label"/>
					</VueSelect>
				</div>
				<div>
					<VueButton @click="remove" class="icon-button danger" icon-left="close"></VueButton>
				</div>
			</div>
			<div class="setting">
				<file-dialog v-model="task.path">Executable</file-dialog>
			</div>
			<div class="setting">
				<VueSwitch v-model="task.workDir.enabled"/>
				&nbsp;
				<folder-dialog v-model="task.workDir.value">Directory</folder-dialog>
			</div>
			<div class="setting">
				<VueSwitch v-model="task.sync" v-tooltip="`Run task syncronously along with other tasks of the same event`" /> &nbsp; Syncronous
			</div>
			<div class="setting arguments-panel">
				<div>
					<span class="arguments-ctrl"><VueSwitch v-model="task.arguments.enabled"/></span>
				</div>
				<VueInput 
					v-model.lazy="task.arguments.value" 
					v-tooltip="`You can use $map or $mapPath keywords to inject map name and absolute map path respectively`"
					placeholder="Arguments"
				/>
			</div>
			<div>
				<p class="message-text">{{ task.message }}</p>
			</div>
		</div>
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
	.task-panel {
		background: #23303c;
		border-radius: 3px;
		padding: 10px;
	}
	.setting {
		height: 40px;
	}
	.width100 {
		width: 100%;
	}
	.event-list {
		min-width: 180px;
	}
	.task-ctrl {
		line-height: 28px;
	}
	.task-header {
		display: grid;
		grid-template-columns: 36px auto auto 35px;
		grid-gap: 10px;
		margin-bottom: 20px;
	}
	.arguments-panel {
		display: grid;
		grid-template-columns: 36px auto;
		grid-gap: 10px;
	}
	.arguments-ctrl {
		line-height: 28px;
	}
	.message-text {
		font-size: 14px;
		color: #e83030;
	}
</style>
