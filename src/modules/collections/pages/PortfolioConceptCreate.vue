<template>
  <ConceptFormPortfolio :title="title" :routes="routes"></ConceptFormPortfolio>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ConceptFormPortfolio from '../components/ConceptFormPortfolio.vue';

export default defineComponent({
  name: 'ConceptCreate',
  components: { ConceptFormPortfolio },

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

<style scoped></style>
