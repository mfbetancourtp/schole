<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="surveys.attachments.create">
        <AppButton style="color: white;" variant="primary" label="core.new" @click="openFormAttachment"></AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppCard v-if="!attachments.value.length">
          <template #body>
            <AppEmptyResponse :show-image="true"></AppEmptyResponse>
          </template>
        </AppCard>

        <div v-else class="grid-cards">
          <AppCard v-for="attachment in attachments.value" :key="attachment.id">
            <template #title>
              <div>{{ attachment.title }}</div>
            </template>

            <template #body>
              {{ attachment.description || 'Aun no se ha agregado una descripción' }}
            </template>

            <template #footer>
              <div class="d-flex justify-content-between">
                <div>
                  <AppButton variant="primary" outlined icon="cloud-download-alt" v-if="attachment.urlTemplate"
                    v-tooltip="'Descargar plantilla'" :href="attachment.urlTemplate" target="_blank"></AppButton>
                </div>
                <div class="d-flex gap-1">
                  <AppCheckPermission permission="surveys.attachments.edit">
                    <AppButtonEdit @click="openFormAttachment(attachment)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="surveys.attachments.delete">
                    <AppButtonDelete @click="openModalDelete(attachment)"></AppButtonDelete>
                  </AppCheckPermission>
                </div>
              </div>
            </template>
          </AppCard>
        </div>

        <AppModal v-model="modalForm">
          <AttachmentForm v-if="modalForm" :data="currentAttachment.value" @close="closeModalForm"></AttachmentForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="adjunto" @confirmDelete="deleteAttachment">
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
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AttachmentForm from '../components/AttachmentForm.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetAttachmentsService } from '../services/getAttachments.service';
import { AttachmentDto } from '../dtos/attachment.dto';
import { DeleteAttachmentService } from '../services/deleteAttachment.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAttachmentsService = new GetAttachmentsService();
const deleteAttachmentService = new DeleteAttachmentService();

export default defineComponent({
  name: 'AttachmentsPage',
  components: {
    AppButton,
    AppEmptyResponse,
    AppCheckPermission,
    AppConfirmDeleteModal,
    AttachmentForm,
    AppModal,
    AppButtonDelete,
    AppButtonEdit,
    AppCard,
    AppLoading,
    AppBaseList,
  },
  setup() {
    const title = 'Adjuntos';
    const routes = [
      {
        name: title,
      },
    ];
    const loading = ref(true);
    const modalForm = ref(false);
    const modalDelete = ref(false);
    const currentAttachment: { value: AttachmentDto | null } = reactive({
      value: null,
    });

    useMeta({
      title,
    });

    const attachments: { value: AttachmentDto[] } = reactive({
      value: [],
    });

    const getData = async () => {
      attachments.value = await getAttachmentsService.run();
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      await getData();

      loading.value = false;
    });

    const openFormAttachment = (attachment: AttachmentDto) => {
      currentAttachment.value = attachment;
      modalForm.value = true;
    };

    const closeModalForm = async () => {
      modalForm.value = false;
      await getData();
    };

    const openModalDelete = (attachment: AttachmentDto) => {
      currentAttachment.value = attachment;
      modalDelete.value = true;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getData();
    };

    const deleteAttachment = async () => {
      try {
        await deleteAttachmentService.run(currentAttachment.value?.id as number);
        await closeModalDelete();
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      title,
      routes,
      loading,
      attachments,
      modalForm,
      currentAttachment,
      modalDelete,
      openFormAttachment,
      closeModalForm,
      openModalDelete,
      deleteAttachment,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}
</style>
