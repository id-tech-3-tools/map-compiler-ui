<template>
	<div class="output-panel">
		<div class="output-ctrl">
			Console Output &nbsp; 
			<VueButton class="icon-button" @click="copy" :disabled="!output.buffer.length" icon-left="assignment" v-tooltip="`Copy to clipboard`" />
		</div>
		<div class="output" ref="outputtext">
			<div v-if="output.buffer.length">
				<span v-for="(chunk, i) of output.buffer" :key="i">{{ chunk }}</span>
			</div>
			<div v-else>No output was produced yet.</div>
		</div>
	</div>
</template>

<script>
	import { find } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"

	export default {
		props: {
			type: { type: String, default: "common" }
		},
		computed: {
			projectId() {
				return this.$route.params.id;
			},
			output () { 
				return find(this.$store.state.output.items, matches({ parent: this.projectId, type: this.type }));
			}
		},
		updated() {
			const node = this.$refs.outputtext;
			if (node) {
				node.scrollTop = node.scrollHeight;
			}
		},
		methods: {
			copy() {
				const outputNode = this.$refs.outputtext;
				if (!outputNode) return;

				const selection = window.getSelection();
				const range = document.createRange();
				range.selectNodeContents(outputNode);
				selection.removeAllRanges();
				selection.addRange(range);

				try {
					document.execCommand('copy');
					selection.removeAllRanges();
					console.log('Copied text into the clipboard.');
				} catch(err) {  
					console.log(err);
					console.log('Unable to copy text into the clipboard.');  
				}  
			}
		}
	}
</script>

<style scoped>
	.output-panel {
		margin: 20px 0 0 0;
	}
	.output-ctrl {
		margin-bottom: 10px;
	}
	.output {
		width: calc(100vw - 410px);
		display: block;
		unicode-bidi: embed;
		font-family: monospace;
		white-space: pre;
		font-size: 14px;
		height: calc(100vh - 235px);
		overflow: auto;
	}
</style>


