<template>
	<div>
		<h2>Presets</h2>
		<div>
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

