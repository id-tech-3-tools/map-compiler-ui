<template>
	<div class="wrapper">
		<div v-for="exec in executables" :key="exec.value" class="radio-entry">	
			<label v-tooltip="exec.value">
				<input type="radio" :value="exec.value" :name="name" v-model="executable" class="radio-btn">
				<span class="radio-base">{{exec.label}}</span>
			</label>
		</div>
		<div>
			<label>
				<input type="radio" value="" :name="name" v-model="executable" class="radio-btn">
				<span class="radio-base">
					<file-dialog v-model="customExecutable" title="Select custom executable">Custom</file-dialog>
				</span>
			</label>
		</div>
	</div>	
</template>

<script>
	import FileDialog from "@/components/FileDialog"
	import { generateId } from "@/utils"

	export default {
		props: {
			executables: { type: Array, required: true },
			path: { type: String, required: true },
			custom: { type: String, required: true }
		},
		data() {
			return { 
				name: generateId("exe")
			 }
		},
		computed: {
			executable: {
				get() {
					return this.path;
				},
				set(value) {
					this.$emit("update:path", value);
				}
			},
			customExecutable: {
				get() {
					return this.custom;
				},
				set(value) {
					this.$emit("update:custom", value);
				}
			}
		},
		components: { FileDialog }
	}
</script>

<style scoped>
	.wrapper {
		margin: 20px 0;
	}
	.radio-btn {
		display: none;
	}
	.radio-entry {
		height: 25px;
	}
	.radio-base {
		/* padding-left: 30px; */
		cursor: pointer;
	}
	.radio-btn + .radio-base:before {
		box-sizing: border-box;
		background: #1d2935;
		border: 1px solid #2c3e50;
		width: 12px;
		height: 12px;
		content: "";
		display: inline-block;
		margin: 0px 18px 0 16px;
		border-radius: 100%; 
		transition: background-color .3s ease;
	}
	.radio-btn:checked + .radio-base:before {
		background: #42b983;
		border: none;
	}
</style>


