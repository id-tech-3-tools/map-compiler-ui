<template>
	<div class="project-panel">
		<div>
			<div class="project-header">
				<div>
					<h4>
						<router-link :to="{ name: 'project', params: { id: project.id }}">{{ project.name }}</router-link>
					</h4>
				</div>
				<div>
					<VueButton @click="remove" class="icon-button flat danger" icon-left="delete_forever"/>
				</div>
			</div>
			<div>
				<div class="project-info">
					<table>
						<tr>
							<td>game:</td>
							<td>{{ project.game ? getFullGameName(project.game) : "none" }}</td>
						</tr>
						<tr>
							<td>directory:</td>
							<td>{{ project.path ? project.path : "none" }}</td>
						</tr>
						<tr>
							<td>map:</td>
							<td>{{ project.map || "none" }}</td>
						</tr>
						<tr>
							<td>created:</td>
							<td>{{ project.date.created | formatDate }}</td>
						</tr>
					</table>
				</div> 
			</div>
		</div>
		<div>
			<span>{{ compilerIsRunning ? "C" : "" }}</span>
			<span>{{ bspcIsRunning ? "B" : "" }}</span>
			<span>{{ gameIsRunning ? "G" : "" }}</span>
			<span>{{ tasksAreRunning ? "T" : "" }}</span>
		</div>
		<div>
			<VueModal v-if="removeModal.show" class="small" @close="removeModal.show = false">
				<template slot="header">
					<VueIcon icon="warning" class="title big"/> &nbsp; Warning!
				</template>
				<div class="default-body">
					Are you sure you want to delete <b>{{ project.name }}</b>?
				</div>
				<div slot="footer" class="actions">
					<VueButton class="primary" @click="removeProject">Confirm</VueButton>
					<VueButton class="primary danger" @click="removeModal.show = false">Cancel</VueButton>
				</div>
			</VueModal>
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
		data() {
			return { 
				gameDefinitions: this.api.get('/fs/game-definitions'),
				removeModal: { show: false },
			}
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
				this.removeModal.show = true;
			},
			getFullGameName(gameId) {
				return find(this.gameDefinitions, matches({ gameId })).gameDescription;
			},
			removeProject() {
				this.api.post('/projects/remove', { id: this.project.id });
			}
		},
		filters: {
			formatDate(timestamp) {
				// console.log(new Date(timestamp));
				return new Date(timestamp).toLocaleString();
			}
		}
	}
</script>

<style scoped>
	.project-panel {
		background: #23303c;
		border-radius: 3px;
		padding: 10px;
	}
	.project-header {
		display: grid;
		grid-template-columns: auto 35px;
		grid-gap: 10px;
	}
	.project-info td {
		color: #b0c7cc;
	}	
	.project-info td:first-child {
		color: #6cc594;
	}	
</style>

