<template>
    <AppLoading v-if="loading"></AppLoading>

    <template v-else-if="data?.id">
        <CollectionStepForm 
            :title="title" :routes="routes" :data="data"
        ></CollectionStepForm>
    </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from "../../../shared/components/AppLoading.vue";
import CollectionStepForm from '../components/CollectionStepForm.vue';

import { CollectionStepDto } from '../dtos/collectionStep.dto';
import { GetCollectionStepByIdService } from '../services/getCollectionStepById.service';

const getCollectionStepByIdService = new GetCollectionStepByIdService();

export default defineComponent({
    name: 'CreateCollectionSteps',
    components: {AppLoading, CollectionStepForm},

    setup() {
        const { t } = useI18n();
        
        const title = 'collections.collectionSteps.edit.title';
        useMeta({ title: t(title) });

        const routes = [
            {
                name: 'collections.collectionSteps.name',
                url: {
                    name: 'collections.collectionStepsList',
                },
            },
            {
                name: title
            },
        ];

        const data: Ref<CollectionStepDto | null> = ref(null);
        const loading = ref(true);
        const route = useRoute();

        onMounted(async () => {
            try {
                let collectionStepId = parseInt(route.params.collectionStepId.toString(), 10);
                data.value = await getCollectionStepByIdService.run(collectionStepId);
            } catch (e) {}

            loading.value = false;
        });

        return {
            data,
            title,
            routes,
            loading,
        };
    },
});
</script>

<style scoped>

</style>