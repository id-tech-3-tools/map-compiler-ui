<template>
	<div>
		<h3>Compiler</h3>
		<select v-model="project.map">
			<option value="" disabled>Select Map</option>
			<option v-for="map of maplist" :key="map.value" :value="map.value">{{map.label}}</option>
		</select>
		<button @click="updateMapList">Update</button>
		<label>
			<input type="checkbox" v-model="launcher.auto" :disabled="isDisabled" title="Auto start compile on map change">Auto
		</label>
		<button v-if="isIdle" @click="start" :disabled="isDisabled" title="Compile stages and run launchers">Compile</button>
		<button v-else @click="stop">Stop</button>
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

