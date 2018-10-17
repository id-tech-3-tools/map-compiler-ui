<template>
	<div class="preset-stage">
		<h4>
			<VueSwitch v-model="stage.enabled" :disabled="frozen" v-tooltip="`Toggle ${name} stage`"/>&nbsp;
			<VueButton @click="start" :disabled="!isIdle || frozen" v-tooltip="`Start ${name} stage only`">
				Start
			</VueButton>&nbsp; 
			{{ name | capitalize }}
		</h4>
		<div>
			<slot></slot>
		</div>
	</div>
</template>

<script>
	import { find } from "lodash/collection"
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
				}
			})
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
</style>
