<template>
    <div class="project-window">
        <div class="projects-wrapper">
            <div class="projects-header">
                <div>
                    <h3>Project List ({{ projects.length }})</h3>
                </div>
                <div>
                    <VueButton @click="add" class="primary" icon-left="note_add">Add project</VueButton>
                </div>
            </div>
            <div v-if="hasProjects">
                <div v-for="project of projects" :key="project.id" class="project-wrapper">
                    <project :project="project"/>
                </div>
            </div>
            <div v-else>No projects were added yet!</div>
        </div>
    </div>
</template>

<script>
    import Project from '@/components/Project'
    import { mapField } from '@/libs/vuex-field-mapper.js'

    export default {
        inject: ['api'],
        name: "projects",
        computed: {
            hasProjects() {
                return this.$store.state.projects.items.length > 0;
            },
            projects() {
                return this.$store.state.projects.items;
            }
        },
        methods: {
            add() {
                this.api.post('/projects/create');
            }
        },
        components: { Project }
    };
</script>

<style scoped>
    .project-window {
        box-sizing: border-box;
        overflow: auto;
        height: 100vh;
    }
    .projects-wrapper {
        width: 600px;
        margin: 40px auto;
    }
    .projects-header {
        margin-bottom: 20px;
        display: grid;
        grid-template-columns: auto 125px;
		grid-gap: 10px;
    }
    .project-wrapper {
        margin-bottom: 20px;
    }
</style>
