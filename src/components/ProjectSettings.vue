<template>
	<div class="project-settings-panel">
		<h4><VueIcon icon="settings" class="big"/> Project Settings</h4>
		<div class="input-entry">
			<div class="settings-name-game">
				<VueInput v-model.lazy="project.name" v-tooltip="`Project name`" placeholder="Project name" class="project-name"/>
				<VueSelect v-model="project.game" v-tooltip="`Project game`" placeholder="Select Game" class="game-selector">
					<VueSelectButton v-for="game of games" :value="game.value" :key="game.value" :label="game.label"/>
				</VueSelect>
			</div>
		</div>
		<div class="input-entry">
			<folder-dialog v-model="project.path" title="Select game directory">Game Directory</folder-dialog>
		</div>
		<div class="input-entry">
			<div class="settings-switch-mod">
				<span class="project-ctrl">
					<VueSwitch v-model="project.mod.enabled" v-tooltip="`Game mod`"></VueSwitch>
				</span>
				<VueTypeAhead
					v-model="project.mod.value"
					:suggestions="modlist"
					placeholder="Select game mod"
					v-tooltip="`Game mod`"
					show-all
					show-max="100"
					restrict-choice
				/>
			</div>
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

<style scoped>
	.project-settings-panel {
		border-bottom: 1px solid rgb(22, 31, 36);
		margin-bottom: 20px;
		padding-bottom: 10px;
	}
	.input-entry {
		margin-bottom: 10px;
	}
	.project-name {
		min-width: 200px;
	}
	.game-selector {
		min-width: 120px;
	}
	.settings-name-game {
		display: grid;
		grid-template-columns: auto auto;
		grid-gap: 10px;
	}
	.settings-switch-mod {
		display: grid;
		grid-template-columns: 40px auto;
		grid-gap: 10px;
	}
	.project-ctrl {
		line-height: 28px;
	}
</style>

