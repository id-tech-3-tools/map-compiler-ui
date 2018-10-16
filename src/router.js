import Vue from "vue";
import Router from "vue-router";
import Projects from "./views/Projects.vue";
import Project from "./views/Project.vue";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "/",
            name: "home",
            component: Projects
        },
        {
            path: "/project/:id",
            name: "project",
            component: Project
        }
    ]
});
