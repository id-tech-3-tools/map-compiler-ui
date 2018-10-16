<template>
	<div>
		<h3>
			<span v-if="isIdle">
				<button @click="start" :disabled="isDisabled">Start</button>
			</span>
			<span v-else>
				<button @click="stop">Stop</button>
			</span>
			Compiler Launcher
		</h3>
		<div>
			<executable-list :executables="executables" v-bind.sync="launcher"></executable-list>
		</div>
		<div>
			<input v-model="launcher.threads.enabled" type="checkbox"> Threads:
			<select v-model="launcher.threads.value">
				<option value="-1">Auto</option>
				<option v-for="(thread, i) of threads" :key="i" :value="thread.value">{{ thread.label }}</option>
			</select>
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
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"

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
					const { game: gameId } = this.project;
					if (!gameId) {
						if (this.launcher.path) this.launcher.path = "";
						return [];
					}
					const dirpath = "./data/bin/";
					const game = find(this.gameDefinitions, matches({ gameId }));
					let list = [];
					if (game.compilers) {
						const compilers = game.compilers.map(compiler => `${compiler}.exe`);
						const executables = await this.api.get('/fs/contains', { dirpath, names: compilers });
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
			},
			threads: {
				async get() {
					let list = [];
					let info = await this.api.get('/os/info');
					for (let i = 1; i <= info.threads; i++) {
						list.push({ value: i, label: i });
					}
					return list;
				},
				default: []
			}
		},
		computed: {
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
				const { map, preset } = this.project;
				return !this.hasValidProject || !(path ? path : custom) || !map || !preset.id;
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
		components: { ExecutableList }
	}
</script>

<style scoped>
	.error {
		color: red;
	}
</style>
