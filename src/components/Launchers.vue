<template>
	<div>
		<div class="launcher-panel">
			<compiler-launcher :launcher="launchers.compiler" @start="compilerStart" @stop="compilerStop"/>
		</div>
		<div v-if="allowBspc" class="launcher-panel">
			<bspc-launcher :launcher="launchers.bspc" @start="bspcStart" @stop="bspcStop"/>
		</div>
		<div class="launcher-panel">
			<game-launcher :launcher="launchers.game" @start="gameStart" @stop="gameStop" @restart="gameRestart" />
		</div>
	</div>
</template>

<script>
	import { find } from "lodash/collection"
	import { matches } from "lodash/util"
	import { mapField } from "@/libs/vuex-field-mapper.js"
	import CompilerLauncher from "@/components/CompilerLauncher"
	import BspcLauncher from "@/components/BspcLauncher"
	import GameLauncher from "@/components/GameLauncher"

	export default {
		inject: ["api"],
		data() {
			return { 
				gameDefinitions: this.api.get('/fs/game-definitions')
			}
		},
		computed: {
			projectId() {
				return this.$route.params.id;
			},
			...mapField({
				project (state) {
					return find(state.projects.items, matches({ id: this.projectId }));
				},
				launchers(state) {
					const matcher = matches({ parent: this.projectId });
					return { 
						compiler: find(state.launchers.compiler.items, matcher),  
						bspc: find(state.launchers.bspc.items, matcher),  
						game: find(state.launchers.game.items, matcher),  
					}
				}
			}),
			allowBspc() {
				const gameDefinition = find(this.gameDefinitions, matches({ gameId: this.project.game }));
				if (!gameDefinition) return false;
				return Boolean(gameDefinition.BSPC);
			}
		},
		methods: {
			compilerStart(id) {
				this.api.post("/launchers/compiler/start", { id });
			},
			compilerStop(id) {
				this.api.post("/launchers/compiler/stop", { id });
			},
			bspcStart(id) {
				this.api.post("/launchers/bspc/start", { id });
			},
			bspcStop(id) {
				this.api.post("/launchers/bspc/stop", { id });
			},
			gameStart(id) {
				this.api.post("/launchers/game/start", { id });
			},
			gameStop(id) {
				this.api.post("/launchers/game/stop", { id });
			},
			gameRestart(id) {
				this.api.post("/launchers/game/restart", { id });
			}
		},
		components: { CompilerLauncher, BspcLauncher, GameLauncher }
	}
</script>

<style scoped>
	.launcher-panel {
		border-bottom: 1px solid rgb(22, 31, 36);
		margin-bottom: 20px;
		padding-bottom: 10px;
	}
</style>


