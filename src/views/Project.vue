<template>
	<div>
		<div v-if="project" class="columns">
			<div>
				<div class="sidebar">
					<div class="button-back">
						<router-link to="/">
							<VueIcon icon="keyboard_backspace" class="medium"/> &nbsp; Project List
						</router-link>
					</div>
					<project-settings></project-settings>
					<launchers></launchers>
					<tasks></tasks>
				</div>
			</div>
			<div>
				<div class="main">
					<div class="main-contents">
						<compiler></compiler>
						<Tabs :tab-id.sync="tabId" group-class="primary start" animate>
							<VueTab id="tab-presets" label="Presets" icon="assignment_turned_in">
								<div class="tab-content"><presets></presets></div>
							</VueTab>
							<VueTab id="tab-output-compiler" :label="outputCompilerLabel" icon="announcement">
								<div class="tab-content"><output-printer type="compiler"></output-printer></div>
							</VueTab>
							<VueTab v-if="allowBspc" id="tab-output-bspc" :label="outputBspcLabel" icon="announcement">
								<div class="tab-content"><output-printer type="bspc"></output-printer></div>
							</VueTab>
						</Tabs>
					</div>
				</div>
			</div>
		</div>
		<div>
			<h3>Project does not exists</h3>
			<router-link to="/">Return Back</router-link>
		</div>
	</div>
</template>

<script>
	import { find } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import ProjectSettings from "@/components/ProjectSettings"
	import Launchers from "@/components/Launchers"
	import Tasks from "@/components/Tasks"
	import Compiler from "@/components/Compiler"
	import Presets from "@/components/Presets"
	import OutputPrinter from "@/components/OutputPrinter"
	import Tabs from "@/ext_components/Tabs"
	import { countFinds } from '@/utils'

	export default {
		inject: ['api'],
		data() {
			return { 
				tabId: 'tab-presets', 
				gameDefinitions: this.api.get('/fs/game-definitions')
			}
		},
		computed: {
			projectId() {
				return this.$route.params.id;
			},
			...mapField({
				project (state) {
					return find(state.projects.items, matches({ id: this.projectId }));
				},
				outputCompilerBuffer(state) {
					const output = find(state.output.items, matches({ parent: this.projectId, type: "compiler" }));
					return output.buffer;
				},
				outputBspcBuffer(state) {
					const output = find(state.output.items, matches({ parent: this.projectId, type: "bspc" }));
					return output.buffer;
				}
			}),
			outputCompilerLabel() {
				const lines = this.calculateBufferLines(this.outputCompilerBuffer);
				return "Compiler" + (lines > 0 ? ` (${lines})` : "");
			},
			outputBspcLabel() {
				const lines = this.calculateBufferLines(this.outputBspcBuffer);
				return "BSPC" + (lines > 0 ? ` (${lines})` : "");
			},
			allowBspc() {
				const gameDefinition = find(this.gameDefinitions, matches({ gameId: this.project.game }));
				if (!gameDefinition) return false;
				return Boolean(gameDefinition.BSPC);
			}
		},
		methods: {
			calculateBufferLines(buffers) {
				if (!buffers) return 0;
				let lines = 0;
				for (let buffer of buffers) {
					lines += countFinds(buffer, '\n');
				}
				return lines;
			}
		},
		components: { ProjectSettings, Launchers, Tasks, Compiler, Presets, OutputPrinter, Tabs }
	}
</script>

<style scoped>
	.columns {
		display: grid;
		grid-template-columns: 400px auto;
		grid-auto-rows: minmax(100px, 100vh);
	}
	.sidebar {
		padding: 10px;
		height: 100%;
		overflow: auto;
		/* background: #eee; */
		box-sizing: border-box;
	}
	.main {
		height: 100%;
		overflow: hidden;
		box-sizing: border-box;
	}
	.main-contents {
		padding: 10px;
	}
	.button-back {
		margin: 15px 0 15px 0;
	}
</style>


