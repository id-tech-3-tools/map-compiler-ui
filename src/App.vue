<template>
    <div>
        <router-view/>
    </div>
</template>

<script>
    import '@vue/ui/dist/vue-ui.css'
    export default {
        created() {
            const el = document.getElementsByTagName('html')[0];
            el.classList.add('vue-ui-dark-mode');
        }
    }
</script>


<style>
    body {
        margin: 0;
        overflow: hidden;
    }
</style>
