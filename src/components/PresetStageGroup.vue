<template>
	<div>
		<div class="stage-group-name">{{ name }}</div>
		<slot></slot>
	</div>
</template>

<script>
	export default {
		props: {
			name: { type: String, required: true },
			description: { type: String, required: true },
			switches: {}
		}
	}
</script>

<style>
	.stage-group-name {
		font-size: 16px;
		color: #b4c7d0;
		height: 30px;
		margin: 5px 0;
	}
</style>

