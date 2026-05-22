<template>
  <ContentsImportForm :title="title" :routes="routes"></ContentsImportForm>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

import ContentsImportForm from '../components/ContentsImportForm.vue';

export default defineComponent({
  name: 'ContentsImportCreate',
  components: {
    ContentsImportForm,
  },
  setup() {
    const title = 'Crear contenidos';

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
table {
  --num-columns-table-import-contents: 3;
}

.table-contents > thead > tr > th {
  width: calc(100% / var(--num-columns-table-import-contents));
  max-width: calc(100% / var(--num-columns-table-import-contents));
}
</style>
