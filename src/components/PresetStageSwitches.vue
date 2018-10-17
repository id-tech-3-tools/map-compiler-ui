<template>
	<div class="switches-panel">
		<slot></slot>
	</div>
</template>

<script>
	export default {}
</script>

<style scoped>
	.switches-panel {
		display: grid;
	}
	@media (min-width: 600px) {
		.switches-panel {
			grid-template-columns: auto;
		}
	}

	@media (min-width: 900px) {
		.switches-panel {
			grid-template-columns: auto auto;
		}
	}

	@media (min-width: 1200px) {
		.switches-panel {
			grid-template-columns: auto auto auto;
		}
	}

	@media (min-width: 1400px) {
		.switches-panel {
			grid-template-columns: auto auto auto auto;
		}
	}

	@media (min-width: 1600px) {
		.switches-panel {
			grid-template-columns: auto auto auto auto auto;
		}
	}

	@media (min-width: 1800px) {
		.switches-panel {
			grid-template-columns: auto auto auto auto auto auto;
		}
	}
</style>

