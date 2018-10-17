<template>
	<div class="preset-stage">
		<div class="stage-header">
			<div class="stage-header-toggle">
				<VueSwitch v-model="stage.enabled" :disabled="frozen" v-tooltip="`Toggle ${name} stage`"/>
			</div>
			<div class="stage-header-button">
				<VueButton @click="start" :disabled="!isIdle || frozen" v-tooltip="`Start ${name} stage only`">Start</VueButton> 
			</div>
			<div class="stage-header-name">
				<h4>{{ name | capitalize }}</h4>
			</div>	
			<div></div>
		</div>
		<div v-show="selectedSwitches.length > 0" class="switches-printer">
			<div class="stage-header-switches">
				<div v-for="(opt, i) in selectedSwitches" :key="i" class="stage-header-switch">{{opt}}</div>
			</div>
		</div>	
		<div>
			<slot></slot>
		</div>
	</div>
</template>

<script>
	import { find, map } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"

	export default {
		inject: ['api'],
		props: {
			stage: { type: Object, required: true },
			name: { type: String, required: true },
			frozen: { type: Boolean, required: true }
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
				},
				preset(state) {
					return find(state.presets.items, matches({ id: this.project.preset.id }));
				}
			}),
			selectedSwitches() {
				const switches = this.preset.draft[this.name].switches;
				const getValue = (opt) => opt.enabled ? " " + opt.value : "";
				return map(switches, (value, key) => `-${key}${getValue(value)} `);
			}
		},
		methods: {
			start() {
				this.api.post('/launchers/master/start', { id: this.launcher.id, stage: this.name });
			}
		},
		filters: {
			capitalize(value) {
				return value[0].toUpperCase() + value.slice(1);
			}
		}
	}
</script>

<style scoped>
	.preset-stage {
		border-radius: 3px;
		margin-bottom: 20px;
		background: #23303c;
		padding: 10px;
	}
	.stage-header {
		display: grid;
		grid-gap: 10px;
		grid-template-columns: 36px 60px 80px auto;
	}
	.stage-header-toggle {
		line-height: 28px;
	}
	.stage-header-name {
		line-height: 32px;	
	}
	.stage-header-name > h4 {
		margin: 0px;
	}
	.stage-header-switches {
		font-size: 12px;
		color: #506f8d;
	}
	.stage-header-switch {
		display: inline-block;
		margin-right: 5px;
	}
	.switches-printer {
		margin: 10px 0px;
		border: 1px solid #1d2935;
		padding: 10px;
	}
</style>
