<template>
  <ContentsImportForm :title="title" :routes="routes"></ContentsImportForm>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

import ContentsImportForm from '../components/ContentsImportForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

export default defineComponent({
  name: 'ContentsImportUpdate',
  components: {
    AppLoading,
    ContentsImportForm,
  },
  setup() {
    const title = 'Editar contenidos';
    const routes = [
      {
        name: 'Contenidos',
        url: {
          name: 'casurid.contentsList',
        },
      },
      {
        name: 'Historial importación de contenidos',
        url: {
          name: 'casurid.contentsImportList',
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
