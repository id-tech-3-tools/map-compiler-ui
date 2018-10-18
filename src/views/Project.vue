<template>
	<div>
		<div v-if="project" class="columns">
			<div>
				<div class="sidebar">
					<div class="backBtn">
						<router-link to="/"><VueIcon icon="keyboard_backspace" class="medium"/>Project List</router-link>
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
							<VueTab id="tab-output" :label="outputLabel" icon="announcement">
								<div class="tab-content"><output-printer></output-printer></div>
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
		data() {
			return { tabId: 'tab-presets' }
		},
		computed: {
			projectId() {
				return this.$route.params.id;
			},
			...mapField({
				project (state) {
					return find(state.projects.items, matches({ id: this.projectId }));
				},
				outputBuffer(state) {
					const output = find(state.output.items, matches({ parent: this.projectId }));
					return output.buffer;
				}
			}),
			outputLabel() {
				let lines = 0;
				for (let buffer of this.outputBuffer) {
					lines += countFinds(buffer, '\n');
				}
				return "Output" + (lines > 0 ? ` (${lines})` : "");
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
		overflow: auto;
		box-sizing: border-box;
	}
	.main-contents {
		padding: 10px;
	}
	.backBtn {
		margin: 20px 0;
	}
</style>


