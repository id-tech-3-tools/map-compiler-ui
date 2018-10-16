<template>
	<div>
		<div v-for="exec in executables" :key="exec.value">	
			<label :title="exec.value">
				<input type="radio" :value="exec.value" :name="name" v-model="executable">{{exec.label}}
			</label>
		</div>
		<div>
			<label>
				<input type="radio" value="" :name="name" v-model="executable">
				<file-dialog v-model="customExecutable">Custom</file-dialog>
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

