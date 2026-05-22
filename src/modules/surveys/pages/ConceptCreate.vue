<template>
    <ConceptForm :title="title" :routes="routes"></ConceptForm>
</template>
  
<script lang="ts">
import {defineComponent} from 'vue';

import ConceptForm from '../components/ConceptForm.vue';

export default defineComponent({
    name: 'ConceptCreate',
    components: {ConceptForm},

    setup() {
        const title = 'Crear concepto de cobro';
        const routes = [
            {
                name: 'Conceptos de cobro',
                url: {
                    name: 'surveys.conceptsList',
                },
            },
            {
                name: title,
            },
        ];

        return {
            title,
            routes,
        };
    },
});
</script>

<style scoped>

</style>