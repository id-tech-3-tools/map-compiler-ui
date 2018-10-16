<template>
	<div>
		<div v-if="preset">
			<preset-stage 
				v-for="(stageLayout, i) of stagesLayout" 
				:key="i" 
				:name="stageLayout.name" 
				:frozen="preset.frozen" 
				:stage="preset.draft[stageLayout.name]"
			>
				<preset-stage-group v-for="(stageGroupLayout, i) of stageLayout.groups" :key="i" v-bind="stageGroupLayout">
					<preset-stage-switches>
						<preset-stage-switch 
							v-for="(stageSwitchLayout, i) of stageGroupLayout.switches" :key="i" 
							v-bind="stageSwitchLayout" 
							:switches.sync="preset.draft[stageLayout.name].switches"
							:frozen="preset.frozen"
						/>
					</preset-stage-switches>
				</preset-stage-group>
			</preset-stage>
		</div>
		<div v-else>
			no preset was created yet
		</div>		
	</div>
</template>

<script>
	import PresetStage from './PresetStage'
	import PresetStageGroup from './PresetStageGroup'
	import PresetStageSwitches from './PresetStageSwitches'
	import PresetStageSwitch from './PresetStageSwitch'

	import { find } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	
	export default {
		inject: ['api'],
		data() {
			return { 
				stagesLayout: this.api.get('/fs/switches-layout')
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
				preset(state) {
					return find(state.presets.items, matches({ id: this.project.preset.id }));
				}
			})
		},
		components: { PresetStage, PresetStageGroup, PresetStageSwitches, PresetStageSwitch }
	}
</script>

