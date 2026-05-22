<template>
    <AppLoading v-if="loading"></AppLoading>

    <template v-else-if="data?.id">
        <RatingScaleForm :title="title" :routes="routes" :data="data"></RatingScaleForm>
    </template>
</template>

<script lang="ts">
import {defineComponent, onMounted, Ref, ref} from 'vue';
import {useRoute} from 'vue-router';

import RatingScaleForm from '../components/RatingScaleForm.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";

import { RatingScaleDto } from '../dtos/ratingScale.dto';

import { GetRatingScaleByIdService } from '../services/getRatingScaleById.service';

const getRatingScaleByIdService = new GetRatingScaleByIdService();

export default defineComponent({
    name: 'CreateCollectionSteps',
    components: {AppLoading, RatingScaleForm},

    setup() {
        const title = 'Editar escalas de valoración';
        const routes = [
            {
                name: 'Escalas de valoración',
                url: {
                    name: 'academicPrograms.ratingScales',
                },
            },
            {
                name: title,
            },
        ];

        const data: Ref<RatingScaleDto | null> = ref(null);
        const loading = ref(true);
        const route = useRoute();

        onMounted(async () => {
            try {
                let ratingScaleId = parseInt(route.params.ratingScaleId.toString(), 10);
                data.value = await getRatingScaleByIdService.run(ratingScaleId);
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