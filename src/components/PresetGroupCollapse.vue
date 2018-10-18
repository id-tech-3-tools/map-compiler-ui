<template>
	<div class="collapse">
		<vertical-collapse v-model="expanded" @expanded="toggle" :ext-style="style">
			<template slot="header">
				<div :class="[`collapse-header`, bulgeClass]" >
					<div class="collapse-header-body">
						<div class="collapse-header-label">
							<span class="collapse-header-label-icon" v-if="iconLeft">
								<VueIcon class="medium" :icon="iconLeft"/>
								&nbsp;
							</span>
							<span>{{ label }}</span>
						</div>
						<div class="collapse-header-indicator">
							<VueIcon v-if="expanded" class="medium" icon="remove"/>
							<VueIcon v-else class="medium" icon="add"/>
						</div>
					</div>
				</div>
			</template>
			<template slot="body">
				<div class="collapse-body">
					<slot></slot>
				</div>
			</template>
		</vertical-collapse>
	</div>
</template>

<script>
	import VerticalCollapse from "./VerticalCollapse"

	export default {
		data() {
			return { bulgeClass: "" }
		},
		props: { 
			label: { type: String, default: "" },
			iconLeft: { type: String, default: ""},
			collapsers: { type: Object, required: true },
			name: { type: String, required: true }
		},
		computed: {
			style() {
				return { opacity: Number(this.expanded), transition: `height .5s ease, opacity 0.5s ease` };
			},
			expanded: {
				get() {
					return this.collapsers[this.name] !== undefined ? this.collapsers[this.name] : true;
				},
				set(value) {
					const newCollapers = Object.assign({}, this.collapsers, { [this.name]: value });
					this.$emit('update:collapsers', newCollapers);
				}
			}
		},
		methods: {
			toggle() {
				this.bulgeClass = this.expanded ? "bulge1" : "bulge2";
			}
		},
		components: { VerticalCollapse }
	}
</script>

<style scoped>
	.collapse {
		margin: 10px 0;
	}
	.collapse-header-body {
		display: grid;
		grid-gap: 10px;
		grid-template-columns: auto 24px;
		cursor: pointer;
		background: #1d2935;
		padding-left: 10px;
		border-radius: 3px;
	}
	.collapse-header-label {
		font-size: 16px;
		color: #b4c7d0;
		height: 24px;
		margin: 5px 0;
		transition: color .3s ease;
	}
	.collapse-header-label:hover {
		color: #daecf5;
	}
	.collapse-header-indicator {
		line-height: 25px;
	}
	.collapse-body {
		margin-top: 10px;
	}

	@keyframes bulger1 {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.995);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes bulger2 {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.995);
		}
		100% {
			transform: scale(1);
		}
	}
	.bulge1 {
		animation: bulger1 .3s;
		animation-iteration-count: 1;
	}
	.bulge2 {
		animation: bulger2 .3s;
		animation-iteration-count: 1;
	}
</style>

<style>
	.collapse-header-label-icon svg {
		fill: #b4c7d0 !important;
	}
</style>

