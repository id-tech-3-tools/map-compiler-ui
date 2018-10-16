<template>
	<div>
		<h3>
			<label><input v-model="enabled" type="checkbox" :title="toggleTitle">Tasks</label> 
			<button @click="addTask">add</button>
		</h3>
		<div>
			<div v-for="task of tasks" :key="task.id">
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
				return "Allow tasks to react on events";
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

