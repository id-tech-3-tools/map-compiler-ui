<template>
	<div>
		<h4>Game Launcher</h4>
		<div class="launcher-header">
			<div>
				<span class="launcher-ctrl"><VueSwitch v-model="launcher.enabled" v-tooltip="toggleTitle"/></span>
			</div>
			<div>
				<span v-if="isIdle">
					<VueButton 
						@click="start" 
						icon-left="play_arrow" 
						:disabled="isDisabled"
						v-tooltip="`Start game engine`"
					>Start</VueButton>
				</span>
				<span v-else>
					<VueButton @click="stop" class="button-col danger" icon-left="stop">Stop</VueButton>
					<VueButton @click="restart" icon-left="replay">Restart</VueButton>
				</span>
			</div>
			<div>
				<span class="launcher-ctrl"><VueIcon icon="build" class="medium"/></span>
			</div>		
		</div>
		<div>
			<executable-list :executables="executables" v-bind.sync="launcher"></executable-list>
		</div>
		<div class="setting">
			<label v-tooltip="`Enable devmap mode`">
				<VueSwitch v-model="launcher.devmap"/> &nbsp; Devmap
			</label>
		</div>
		<div class="game-options-panel">
			<VueSwitch v-model="launcher.options.enabled"/> &nbsp;
			<VueDropdown label="Game options" icon-left="settings" icon-right="keyboard_arrow_down" :disabled="!hasValidProject">
				<option-item 
					v-for="option in options" 
					:key="option.name" 
					:definition="option" 
					:option="launcher.options.items[option.name]"
				/>
			</VueDropdown>
		</div>
		<div class="setting arguments-panel">
			<div>
				<span class="arguments-ctrl"><VueSwitch v-model="launcher.arguments.enabled"/></span>
			</div>
			<VueInput 
				v-model.lazy="launcher.arguments.value" 
				v-tooltip="`You can use $map or $mapPath keywords to inject map name and absolute map path respectively`"
				placeholder="Arguments"
			/>
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
	import { clone } from 'lodash/lang'
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import OptionItem from "@/components/OptionItem"

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
					if (this.launcher.options.items[option.name]) {
						options[option.name] = clone(this.launcher.options.items[option.name]);
					}
					else {
						options[option.name] = { enabled: option.enabled, value: option.default };
					}
				}
				this.launcher.options.items = options;
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
		components: { ExecutableList, OptionItem }
	}
</script>

<style scoped>
	.setting {
		height: 40px;
	}
	.number-field {
		min-width: 80px;
	}
	.button-col {
		margin-right: 10px;
	}
	.launcher-header {
		border-radius: 3px;
		margin-bottom: 20px;
		background: #23303c;
		padding: 5px 5px;
		display: grid;
		grid-template-columns: 36px auto 30px;
		grid-gap: 10px;
	}
	.launcher-ctrl {
		line-height: 25px;
	}
	.arguments-panel {
		display: grid;
		grid-template-columns: 36px auto;
		grid-gap: 10px;
	}
	.arguments-ctrl {
		line-height: 28px;
	}
	.game-options-panel {
		height: 50px;
	}
	.message-text {
		font-size: 14px;
		color: #e83030;
	}
</style>

