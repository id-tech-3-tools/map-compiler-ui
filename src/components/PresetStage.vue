<template>
	<div>
		<h3>
			<label>
				<input type="checkbox" v-model="stage.enabled" :disabled="frozen">
				<button @click="start" :disabled="!isIdle || frozen">Start</button> {{ name }}
			</label>
		</h3>
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
		}
	}
</script>

