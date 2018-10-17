<template>
	<div>
		<h3>
			<VueSwitch v-model="enabled" v-tooltip="toggleTitle"/>
			&nbsp; Tasks &nbsp;
			<VueButton @click="addTask" class="icon-button" icon-left="note_add" v-tooltip="`Add new task`"/>
		</h3>
		<div>
			<div v-for="task of tasks" :key="task.id" class="task-wrapper">
				<task :task="task" @start="startTask" @stop="stopTask" @remove="removeTask"/>
			</div>
		</div>
	</div>
</template>

<script>
	import { filter } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import Task from "./Task"

	export default {
		inject: ['api'],
		computed: {
			toggleTitle() {
				return "Disable all tasks";
			},
			...mapField({
				tasks(state) {
					return filter(state.tasks.items, matches({ parent: this.$route.params.id }));
				},
				enabled: {
					get(state) {
						return state.tasks.enabled;
					},
					set(value, state) {
						state.tasks.enabled = value;
					}
				}
			})
		},
		methods: {
			addTask() {
				this.api.post('/tasks/create');
			},
			removeTask(id) {
				this.api.post('/tasks/remove', { id });
			},
			startTask(id) {
				this.api.post('/tasks/start', { id });
			},
			stopTask(id) {
				this.api.post('/tasks/stop', { id });
			}
		},
		components: { Task }
	}
</script>

<style scoped>
	.task-wrapper {
		margin-bottom: 5px;
	}
</style>
