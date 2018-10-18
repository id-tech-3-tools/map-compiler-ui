<template>
	<div>
		<preset-group-collapse :label="name" :icon-left="icon" :collapsers.sync="collapsers" :name="`${hash}_${name}`">
			<slot></slot>
		</preset-group-collapse>
	</div>
</template>

<script>
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import { reduce } from "lodash/collection"
	import PresetGroupCollapse from './PresetGroupCollapse'

	export default {
		data() {
			const hasher = (acc, opt) => acc + opt.name.charCodeAt(acc % opt.name.length);
			const hash = reduce(this.switches, hasher, 1) ^ this.switches.length;
			return { hash };
		},
		props: {
			name: { type: String, required: true },
			description: { type: String, required: true },
			switches: {}
		},
		computed: {
			icon() {
				switch (this.name) {
					case "debug": return "bug_report";
					default: return "settings_applications";
				}
			},
			...mapField({
				collapsers: {
					get(state) {
						return state.collapsers.items;
					},
					set(value, state) {
						state.collapsers.items = value;
					}
				}
			})
		},
		components: { PresetGroupCollapse }
	}
</script>

<style></style>

