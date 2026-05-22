<template>
  <AppLoading v-if="loading"></AppLoading>
  <DocumentForm v-else :title="title" :routes="routes" :data="data"></DocumentForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';

import DocumentForm from '../components/DocumentForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { DocumentDto } from '../dtos/document.dto';

import { GetDocumentByIdService } from '../services/getDocumentById.service';

const getDocumentByIdService = new GetDocumentByIdService();

export default defineComponent({
  name: 'DocumentsEdit',
  components: { DocumentForm, AppLoading },
  setup() {
    const route = useRoute();

    const title = 'Editar documento';
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

    const data: Ref<DocumentDto | null> = ref(null);

    const loading = ref(true);

    onMounted(async () => {
      try {
        const documentId = parseInt(route.params.documentId.toString())

        data.value = await getDocumentByIdService.run(documentId);
      } catch (e) {}

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