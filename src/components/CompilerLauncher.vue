<template>
	<div>
		<h4>Compiler Launcher</h4>
		<div class="launcher-header">
			<div>
				<span v-if="isIdle">
					<VueButton 
						@click="start" 
						icon-left="play_arrow" 
						:disabled="isDisabled" 
						v-tooltip="`Start compiler`"
					>Start</VueButton>
				</span>
				<span v-else>
					<VueButton @click="stop" class="danger" icon-left="stop">Stop</VueButton>
				</span>
			</div>
			<div>
				<span class="launcher-ctrl"><VueIcon icon="build" class="medium"/></span>
			</div>
		</div>
		<div>
			<executable-list :executables="executables" v-bind.sync="launcher"></executable-list>
		</div>
		<div>
			<VueSwitch v-model="launcher.threads.enabled"/>
			&nbsp; 
			<VueSelect v-model="launcher.threads.value" v-tooltip="`Number of threads`" placeholder="Threads" class="threadsSelector">
				<VueSelectButton :value="-1" label="Auto"/>
				<VueSelectButton v-for="(thread, i) of threads" :key="i" :value="thread.value" :label="thread.label"/>
			</VueSelect>
		</div>
		<div>
			<p class="message-text">{{ launcher.message }}</p>
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
						list.push({ value: i, label: `${i} thread` + `${i > 1 ? "s" : ""}` });
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
	.threadsSelector {
		min-width: 120px;
	}
	.launcher-header {
		border-radius: 3px;
		margin-bottom: 20px;
		background: #23303c;
		padding: 5px 5px;
		display: grid;
		grid-template-columns: auto 30px;
		grid-gap: 10px;
	}
	.launcher-ctrl {
		line-height: 25px;
	}
	.message-text {
		font-size: 14px;
		color: #e83030;
	}
</style>
