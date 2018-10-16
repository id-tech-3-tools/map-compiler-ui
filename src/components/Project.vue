<template>
	<div>
		<div>
			<router-link :to="{ name: 'project', params: { id: project.id }}">{{ project.name }}</router-link>
			<button @click="remove">X</button>
		</div>
		<div>
			<span>{{ compilerIsRunning ? "C" : "" }}</span>
			<span>{{ bspcIsRunning ? "B" : "" }}</span>
			<span>{{ gameIsRunning ? "G" : "" }}</span>
			<span>{{ tasksAreRunning ? "T" : "" }}</span>
		</div>
	</div>
</template>

<script>
	import { find, filter } from "lodash/collection"
	import { matches } from "lodash/util"

	export default {
		inject: ['api'],
		props: {
			project: { type: Object, required: true }
		},
		computed: {
			compilerIsRunning() {
				const launcher = find(this.$store.state.launchers.compiler.items, matches({ parent: this.project.id }));
				return launcher.state == "running";
			},
			bspcIsRunning() {
				const launcher = find(this.$store.state.launchers.bspc.items, matches({ parent: this.project.id }));
				return launcher.state == "running";
			},
			gameIsRunning() {
				const launcher = find(this.$store.state.launchers.game.items, matches({ parent: this.project.id }));
				return launcher.state == "running";
			},
			tasksAreRunning() {
				const tasks = filter(this.$store.state.tasks.items, matches({ parent: this.project.id }));
				const task = find(tasks, matches({ state: "running" }));
				return task !== undefined;
			}
		},
		methods: {
			remove() {
				this.api.post('/projects/remove', { id: this.project.id });
			}
		}
	}
</script>

