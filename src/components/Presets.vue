<template>
	<div class="preset-panel">
		<!-- <h4>Presets</h4> -->
		<div class="preset-manager-panel">
			<preset-manager></preset-manager>
		</div>
		<div>
			<preset-stages></preset-stages>
		</div>
	</div>
</template>

<script>
	import PresetManager from './PresetManager';
	import PresetStages from './PresetStages'

	export default {
		components: { PresetManager, PresetStages }
	}
</script>

<style scoped>
	.preset-panel {
		margin: 20px 0;
	}
	.preset-manager-panel {
		margin-bottom: 20px;
	}
</style>

