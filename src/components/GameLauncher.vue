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
					<button @click="restart">Restart</button>
				</span>
				Game Launcher
			</label>
		</h3>
		<div>
			<executable-list :executables="executables" v-bind.sync="launcher"></executable-list>
		</div>
		<div>
			<label title="Enable devmap mode">
				<input v-model="launcher.devmap" type="checkbox"> Devmap
			</label>
		</div>
		<div>
			<div v-for="option in options" :key="option.name">
				<div v-if="option.type == 'toggle'">
					<base-checkbox :title="option.title" :value="option.values" v-model="launcher.options[option.name].value">{{option.label}}</base-checkbox>
				</div>
				<div v-if="option.type == 'number'">
					<input v-model="launcher.options[option.name].enabled" type="checkbox">
					<label :title="option.title">{{ option.label }}
						<input v-model="launcher.options[option.name].value" type="number" class="numberWidth">
					</label>	
				</div>
			</div>
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
	import { clone } from 'lodash/lang'
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import BaseCheckbox from "@/components/BaseCheckbox"

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
					const { path: dirpath, game: gameId } = this.project;
					if (!dirpath || !gameId) {
						if (this.launcher.path) this.launcher.path = "";
						return [];
					}
					const game = find(this.gameDefinitions, matches({ gameId }));
					let list = [];
					if (game.engines) {
						const gameEngines = game.engines.map(engine => `${engine}.exe`);
						const executables = await this.api.get('/fs/contains', { dirpath, names: gameEngines });
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
				return "Allow game launcher to run after map compile";
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
			options() {
				if (!this.project) return [];
				const gameId = this.project.game;
				if (!gameId) return [];
				const { engineOptions } = find(this.gameDefinitions, matches({ gameId }));
				// copy options in launcher if neeeded
				let options = {};
				for (let option of engineOptions) {
					if (this.launcher.options[option.name]) {
						options[option.name] = clone(this.launcher.options[option.name]);
					}
					else {
						options[option.name] = { enabled: option.enabled, value: option.default };
					}
				}
				this.launcher.options = options;
				return engineOptions;
			},
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
			},
			restart() {
				this.$emit('restart', this.launcher.id);
			}
		},
		components: { ExecutableList, BaseCheckbox }
	}
</script>

<style scoped>
	/* temp */
	.numberWidth {
		width: 80px;
	}
	.error {
		color: red;
	}
</style>
