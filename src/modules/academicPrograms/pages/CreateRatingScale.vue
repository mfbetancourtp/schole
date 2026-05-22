<template>
    <RatingScaleForm :title="title" :routes="routes"></RatingScaleForm>
</template>
  
<script lang="ts">
import {defineComponent} from 'vue';

import RatingScaleForm from '../components/RatingScaleForm.vue';

export default defineComponent({
    name: 'CreateRatingScale',
    components: {RatingScaleForm},

    setup() {
        const title = 'Agregar escalas de valoración';
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

        return {
            title,
            routes,
        };
    },
});
</script>

<style scoped>

</style>