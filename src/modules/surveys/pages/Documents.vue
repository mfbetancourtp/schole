<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="surveys.documents.create">
        <AppButton style="color: white;" variant="primary" :label="'core.newMale'"
          :to="{ name: 'surveys.documentsCreate' }"></AppButton>
      </AppCheckPermission>
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppCard v-if="!documents.value.length">
          <template #body>
            <AppEmptyResponse :show-image="true"></AppEmptyResponse>
          </template>
        </AppCard>

        <div v-else class="grid-cards">
          <AppCard   v-for="document in documents.value" :key="document.id">
            <template #title>
              <div>{{ document.title }}</div>
            </template>

            <template #body>
              <p class="tw-line-clamp-3">
                {{ document.description || 'Aun no se ha agregado una descripción' }}
              </p>
            </template>

            <template #footer>
              <div class="d-flex justify-content-between">
                <div></div>
                <div class="d-flex gap-1">
                  <AppCheckPermission permission="surveys.documents.edit">
                    <AppButtonEdit :to="{
                      name: 'surveys.documentsEdit',
                      params: { documentId: document.id },
                    }">
                    </AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="surveys.documents.delete">
                    <AppButtonDelete @click="openModalDelete(document)"></AppButtonDelete>
                  </AppCheckPermission>
                </div>
              </div>
            </template>
          </AppCard>
        </div>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="documento" @confirmDelete="deleteDocument">
          </AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetDocumentsService } from '../services/getDocuments.service';
import { DocumentDto } from '../dtos/document.dto';
import { DeleteDocumentService } from '../services/deleteDocument.service';
import { useHeaderStore } from '../../../stores/header.store';

const getDocumentsService = new GetDocumentsService();
const deleteDocumentService = new DeleteDocumentService();

export default defineComponent({
  name: 'DocumentsPage',
  components: {
    AppButton,
    AppCheckPermission,
    AppConfirmDeleteModal,
    AppModal,
    AppButtonDelete,
    AppButtonEdit,
    AppCard,
    AppEmptyResponse,
    AppLoading,
    AppBaseList,
  },
  setup() {
    const title = 'Documentos';
    const routes = [
      {
        name: title,
      },
    ];

    useMeta({
      title,
    });

    const loading = ref(true);
    const documents: { value: DocumentDto[] } = reactive({
      value: [],
    });
    const currentDocument: { value: DocumentDto | null } = reactive({
      value: null,
    });
    const modalDelete = ref(false);

    const getData = async () => {
      documents.value = await getDocumentsService.run();
    };

    onMounted(async () => {
      await getData();
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loading.value = false;
    });

    const openModalDelete = (document: DocumentDto) => {
      currentDocument.value = document;
      modalDelete.value = true;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getData();
    };

    const deleteDocument = async () => {
      try {
        await deleteDocumentService.run(currentDocument.value?.id as number);
        await closeModalDelete();
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      title,
      routes,
      loading,
      documents,
      modalDelete,
      currentDocument,
      openModalDelete,
      deleteDocument,
    };
  },
});
</script>

<style scoped></style>
