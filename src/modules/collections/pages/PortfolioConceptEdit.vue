<template>
  <AppLoading v-if="loading"></AppLoading>
  <ConceptFormPortfolio v-else :title="title" :routes="routes" :data="data"></ConceptFormPortfolio>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import ConceptFormPortfolio from '../components/ConceptFormPortfolio.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { GetConceptByIdPortfolioService } from '../services/getConceptByIdPortfolio.service';

const getConceptByIdPortfolioService = new GetConceptByIdPortfolioService();

export default defineComponent({
  name: 'ConceptEdit',
  components: { AppLoading, ConceptFormPortfolio },

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
      data.value = await getConceptByIdPortfolioService.run(parseInt(route.params.conceptId.toString()));
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

<style scoped></style>
