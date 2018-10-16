<template>
	<div>
		<h3>
			<label>
				<input v-model="launcher.enabled" type="checkbox" :title="toggleTitle">
				<span v-if="isIdle">
					<button @click="start" :disabled="isDisabled">Start</button>
				</span>
				<span v-else>
					<button @click="stop">Stop</button>
				</span>
				BSPC Launcher
			</label>
		</h3>
		
		<div>
			<executable-list :executables="executables" v-bind.sync="launcher"></executable-list>
		</div>
		<div>
			<input v-model="launcher.workDir.enabled" type="checkbox">
			<folder-dialog v-model="launcher.workDir.value">Work Dir</folder-dialog>
		</div>
		<div>
			<input v-model="launcher.arguments.enabled" type="checkbox">
			<label title="You can use $map or $mapPath keywords to inject map name and absolute map path respectively">
				Arguments: <input v-model.lazy="launcher.arguments.value" type="text">
			</label>
		</div>
		<div>
			<p class="error">{{ launcher.message }}</p>
		</div>
	</div>
</template>

<script>
	import Path from 'path'
	import ExecutableList from "@/components/ExecutableList"
	import { find } from "lodash/collection"
	import { matches, defaultTo } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import FolderDialog from "./FolderDialog.vue"

	export default {
		inject: ['api'],
		data() {
			return { 
				gameDefinitions: this.api.get('/fs/game-definitions')
			}
		},
		props: {
			launcher: { type: Object, required: true }
		},
		asyncComputed: {
			executables: {
				async get() {
					if (!this.project) return [];
					if (!this.project.path || !this.project.game) {
						if (this.launcher.path) this.launcher.path = "";
						return [];
					}
					const game = find(this.gameDefinitions, matches({ gameId: this.project.game }));
					const dir = defaultTo(this.launcher.workDir.enabled ? this.launcher.workDir.value : undefined, this.project.path);
					let list = [];
					if (game.BSPCs) {
						const BSPCs = game.BSPCs.map(engine => `${engine}.exe`);
						const executables = await this.api.get('/fs/contains', { dirpath: dir, names: BSPCs });
						list = executables.map(exe => ({ value: exe, label: Path.basename(exe) }));
					}
					// select default if required
					if (this.launcher.path) {
						if (!find(list, matches({ value: this.launcher.path }))) {
							this.launcher.path = "";
						}
					}
					return list;
				},
				default: []
			}
		},
		computed: {
			toggleTitle() {
				return "Allow BSPC launcher to run after map compile";
			},
			isIdle() {
				return this.launcher.state == "idle";
			},
			projectId() {
				return this.$route.params.id;
			},
			...mapField({
				project (state) {
					return find(state.projects.items, matches({ id: this.projectId }));
				}
			}),
			hasValidProject() {
				return !!(this.project.path && this.project.game);
			},
			isDisabled() {
				const { path, custom } = this.launcher;
				return !this.hasValidProject || !(path ? path : custom) || !this.project.map;
			}
		},
		methods: {
			start() {
				this.$emit('start', this.launcher.id);
			},
			stop() {
				this.$emit('stop', this.launcher.id);
			}
		},
		components: { ExecutableList, FolderDialog }
	}
</script>

<style scoped>
	.error {
		color: red;
	}
</style>
