<template>
    <AppLoading v-if="loading"></AppLoading>
    <ConceptForm v-else :title="title" :routes="routes" :data="data"></ConceptForm>
</template>
  
<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';

import ConceptForm from '../components/ConceptForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import {GetConceptByIdService} from '../services/getConceptById.service';

const getConceptByIdService = new GetConceptByIdService();
  
export default defineComponent({
    name: 'ConceptEdit',
    components: {AppLoading, ConceptForm},

    setup() {
        const title = 'Editar concepto de cobro';
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

        const loading = ref(true);
        const route = useRoute();
        const data = ref();

        onMounted(async () => {
            data.value = await getConceptByIdService.run(parseInt(route.params.conceptId.toString()));
            loading.value = false;
        });

        return {
            loading,
            routes,
            title,
            data,
        };
    },
});
</script>
  
<style scoped>

</style>