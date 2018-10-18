<template>
	<div class="body" ref="body" :style="style">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				style: {
					height: "auto"
				}, 
				timer: null
			}
		},
		props: {
			toggled: { type: Boolean, default: true }
		},
		watch: {
			toggled: {
				handler(value){
					if (this.timer) {
						clearTimeout(this.timer);
						this.timer = null;
					}
					if (value) {
						this.timer = setTimeout(() => this.style.height = "auto", 2000);
						this.style.height = `${this.$refs.body.scrollHeight}px`;
					}
					else {
						if (this.style.height == "auto") {
							this.style.height = `${this.$refs.body.scrollHeight}px`;
							setTimeout(() => this.style.height = `0px`, 0);
						}
						else {
							this.style.height = `0px`;
						}
					}
				}
			}
		},
		mounted() {
			if (this.toggled) {
				this.style.height = "auto";
			}
			else {
				this.style.height = 0;
			}
		}
	}
</script>

<style scoped>
	.body {
		overflow: hidden;
	}
</style>


