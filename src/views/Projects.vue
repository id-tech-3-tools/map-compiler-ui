<template>
    <div>
        <h2>Project List<button @click="add">Add</button></h2>
        <div v-if="hasProjects">
            <div v-for="project of projects" :key="project.id">
                <project :project="project"/>
            </div>
        </div>
        <div v-else>No projects were added yet!</div>
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
