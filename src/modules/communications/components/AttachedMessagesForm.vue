<template>
  <div class="w-100">
    <section class="d-flex justify-content-between align-items-center">
      <h5>Adjuntos</h5>

      <div>
        <input type="file" id="inputFile" style="display: none" @change="selectFile($event)" />
        <AppIcon class="text-primary pointer icon-size-8" @click="clickInputFile()" icon="plus"></AppIcon>
      </div>
    </section>

    <AppLoading v-if="loading"></AppLoading>

    <section v-else>
      <div v-if="!messageId" style="font-size: 0.8rem" class="d-flex justify-content-end align-items-center gap-1">
        <AppIcon icon="info-circle" class="text-muted" />
        <span class="text-muted">Aun no puedes usar esta opción</span>
      </div>

      <div v-else-if="!attachmentsLc.length" class="text-center">
        <p>No se han agregado adjuntos</p>
      </div>

      <div v-else>
        <div v-for="(attachment, index) in attachmentsLc" :key="index" style="font-size: 0.9rem">
          <AppIcon icon="trash" @click="deleteAttachment(attachment.id)" class="text-primary pointer me-2" />

          <span class="text-decoration-underline text-primary pointer" @click="downloadFile(attachment.urlAttachmentFile, attachment.name)">{{ attachment.name }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref } from 'vue';
// import { useI18n } from 'vue-i18n';

import { mimeTypesConstant } from '../../../shared/constant/mimeTypes.constant';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateMessageAttachmentsService } from '../services/createMessageAttachments.service';
import { DeleteMessageAttachmentsService } from '../services/deleteMessageAttachments.service';
import { GetMessageWithAttachmentsByMessageIdService } from '../services/getMessageWithAttachmentsByMessageId.service';

const getMessageWithAttachmentsService = new GetMessageWithAttachmentsByMessageIdService();
const deleteMessageAttachmentsService = new DeleteMessageAttachmentsService();
const createMessageAttachmentsService = new CreateMessageAttachmentsService();

export default defineComponent({
  name: 'AttachedMessagesForm',
  components: {
    AppLoading,
    AppIcon,
  },

  props: {
    messageId: {
      type: Number,
    },
    attachments: {
      type: Array as PropType<any[]>,
    },
  },

  setup(props) {
    const attachmentsLc: Ref<any[]> = ref(props.attachments ?? []);

    const loading = ref(false);

    const getAttachments = async () => {
      loading.value = true;

      if (props.messageId) {
        const response = await getMessageWithAttachmentsService.run(props.messageId);
        attachmentsLc.value = response.attachments;
      }

      loading.value = false;
    };

    const clickInputFile = () => {
      if (!props.messageId) return;

      let inputFile = document.getElementById('inputFile');
      if (inputFile != null) {
        inputFile.click();
      }
    };
    const selectFile = async (event: any) => {
      const files = event.target.files;
      if (!files.length) return;

      try {
        if (props.messageId) {
          const dataSend = {
            messageId: props.messageId,
            file: files[0],
          };

          createMessageAttachmentsService.isFormData = true;
          await createMessageAttachmentsService.run(dataSend);

          await getAttachments();
        }
      } catch (e) {
        console.log(e);
      }
    };

    const downloadFile = (downloadUrl: string, name: string) => {
      fetch(downloadUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const extension = mimeTypesConstant[blob.type];
          const time = new Date().getTime();

          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');

          link.href = url;
          link.setAttribute('download', name ?? `file_${time}.${extension}`);

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    };

    const deleteAttachment = async (id: number) => {
      try {
        await deleteMessageAttachmentsService.run(id);

        await getAttachments();
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,

      attachmentsLc,

      deleteAttachment,
      clickInputFile,
      downloadFile,
      selectFile,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
