<template>
  <DocumentForm :title="title" :routes="routes"></DocumentForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import DocumentForm from '../components/DocumentForm.vue';

export default defineComponent({
  name: 'DocumentsCreate',
  components: { DocumentForm },
  setup() {
    const title = 'Nuevo documento';
    const routes = [
      {
        name: 'Documentos',
        url: {
          name: 'surveys.documentsList',
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