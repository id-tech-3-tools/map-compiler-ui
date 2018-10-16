<template>
	<div>
		<h3>Project Settings</h3>
		<div>id: {{projectId}}</div>
		<div>
			<input type="text" v-model.lazy="project.name">
		</div>
		<div>
			Game: 
			<select v-model="project.game">
				<option value="">Select Game</option>
				<option v-for="game of games" :value="game.value" :key="game.value">{{ game.label }}</option>
			</select>
		</div>
		<div>
			<folder-dialog v-model="project.path">Game Directory</folder-dialog>
		</div>
		<div>
			<input v-model="project.mod.enabled" type="checkbox">
			<label>
				Game Mod:
				<base-auto-text-field v-model="project.mod.value" :items="modlist"/>
			</label>
		</div>
	</div>
</template>

<script>
	import FileDialog from "@/components/FileDialog"
	import FolderDialog from "@/components/FolderDialog"
	import { find, map } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import BaseAutoTextField from "@/components/BaseAutoTextField"

	export default {
		inject: ['api'],
		data() {
			return { 
				gameDefinitions: this.api.get('/fs/game-definitions')
			}
		},
		asyncComputed: {
			modlist: {
				async get() {
					if (!this.project) return [];
					if (!this.project.path) return [];
					const paths = await this.api.get('/fs/dirlist', { path: this.project.path });
					return map(paths, path => ({ value: path, label: path }));
				},
				default: []
			}
		},
		computed: {
			games() {
				return map(this.gameDefinitions, entry => ({ value: entry.gameId, label: entry.gameName }));
			},
			projectId() {
				return this.$route.params.id;
			},
			...mapField({
				project (state) {
					return find(state.projects.items, matches({ id: this.projectId }));
				},

			})
		},
		components: { FolderDialog, BaseAutoTextField }
	}
</script>

