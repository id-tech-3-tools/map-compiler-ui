<template>
	<div class="compiler-panel">
		<h4>Compiler</h4>
		<div class="compiler-ctrl-panel">
			<div class="compiler-map-selector">
				<VueSelect v-model="project.map" placeholder="Select map" class="map-selector" v-tooltip="`Select map`">
					<VueSelectButton v-for="map of maplist" :key="map.value" :value="map.value" :label="map.label"/>
				</VueSelect>
			</div>
			<div class="compiler-ctrl">
				<VueButton @click="updateMapList" v-tooltip="`Update map list`">Update</VueButton>
				<span class="auto-toggle">
					<VueSwitch v-model="launcher.auto" :disabled="isDisabled" v-tooltip="`Auto start compile on map change`">
						Auto
					</VueSwitch>
				</span>
				<VueButton 
					v-if="isIdle" 
					@click="start"  
					class="primary" 
					:disabled="isDisabled" 
					v-tooltip="`Start map compilation and run launchers`"
				>
					Compile
				</VueButton>
				<VueButton v-else @click="stop">Stop</VueButton>
			</div>
		</div>
	</div>
</template>

<script>
	import Path from 'path'
	import { concat } from "lodash/array"
	import { find } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"

	export default {
		inject: ['api'],
		data() {
			return { 
				gameDefinitions: this.api.get('/fs/game-definitions'),
				maplist: []
			}
		},
		watch: {
			'project': { handler: 'updateMapList', immediate: true },
			'project.path': 'updateMapList',
			'project.game': 'updateMapList',
			'project.mod': { handler: 'updateMapList', deep: true },
			'maplist': function(list) {
				if (!this.project.map) return;
				// select none if selected map is not in the map list (got deleted or renamed)
				if (!find(list, matches({ value: this.project.map }))) {
					this.project.map = "";
				}
			},
			'project.map': function(val) {
				if (this.isDisabled) return;
				if (this.launcher.auto) {
					this.api.post('/launchers/master/auto-start', { id: this.launcher.id, path: val });
				}
			},
			'launcher.auto': {
				handler(val) {
					if (!this.project.map) return;
					if (this.isDisabled) return;
					if (val == true) {
						this.api.post('/launchers/master/auto-start', { id: this.launcher.id, path: this.project.map });
					}
					else {
						this.api.post('/launchers/master/auto-stop', { id: this.launcher.id });
					}
				},
				immediate: true
			}
		},
		destroyed() {
			this.api.post('/launchers/master/auto-stop-all');
		},
		computed: {
			projectId() {
				return this.$route.params.id;
			},
			isIdle() {
				return this.launcher.state == "idle";
			},
			...mapField({
				project (state) {
					return find(state.projects.items, matches({ id: this.projectId }));
				},
				launcher(state) {
					return find(state.launchers.master.items, matches({ parent: this.projectId }));
				}
			}),
			hasValidProject() {
				return !!(this.project.path && this.project.game);
			},
			isDisabled() {
				const launcher = find(this.$store.state.launchers.compiler.items, matches({ parent: this.projectId }));
				const { path, custom } = launcher;
				const { map, preset } = this.project;
				return !this.hasValidProject || !(path ? path : custom) || !map || !preset.id;
			}
		},
		methods: {
			start() {
				this.api.post('/launchers/master/start', { id: this.launcher.id });
			},
			stop() {
				this.api.post('/launchers/master/stop', { id: this.launcher.id });
			},
			async updateMapList() {
				if (!this.project.path) return [];
				if (!this.project.game) return [];
				const gameDefinition = find(this.gameDefinitions, matches({ gameId: this.project.game }));
				const dirs = [gameDefinition.base];
				if (this.project.mod.enabled && this.project.mod.value !== gameDefinition.base) {
					dirs.push(this.project.mod.value);
				}
				let maps = [];
				for (let dir of dirs) {
					const path = this.project.path + `/${dir}/maps/`;
					const paths = await this.api.get('/fs/filelist', { path, ext: 'map' });
					maps = concat(maps, paths.map(path => ({ value: path, label: `${Path.basename(path)} (${dir})` })));
				}
				this.maplist = maps;
			}
		}
	}
</script>

<style scoped>
	.compiler-panel {
		margin: 20px 0;
	}
	.map-selector {
		min-width: 300px;
	}
	.compiler-ctrl-panel {
		max-width: 600px;
		display: grid;
		grid-template-columns: auto auto;
		grid-gap: 10px;
	}
	.compiler-map-selector > * {
		width: 100%;
	}
	.auto-toggle {
		line-height: 26px;
	}
	.compiler-ctrl {
		display: grid;
		grid-template-columns: auto auto auto;
		grid-gap: 10px;
	}
</style>
