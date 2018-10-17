import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        projects: { items: [] },
        tasks: { items: [], enabled: true },
        launchers: {
            compiler: { items: [] },
            game: { items: [] },
            bspc: { items: [] },
            master: { items: [] }
        },
        presets: { items: [] },
        output: {
            items: []
        }
    },
    mutations: {},
    actions: {}
});
