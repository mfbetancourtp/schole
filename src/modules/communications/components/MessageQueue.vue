<template>
  <AppCard v-if="!messageQueue?.length">
    <template #body>
      <AppEmptyResponse :title="'Sin Mensajes'" :subtitle="false"></AppEmptyResponse>
    </template>
  </AppCard>

  <template v-else>
    <AppAccordion v-slot="{ accordionId }">
      <AppAccordionItem :accordion-id="accordionId" v-for="(message, index) in messageQueue" :key="index">
        <template v-slot:head>
          <div class="w-100">
            <div class="m-0" style="font-weight: 500; font-size: 0.9rem">
              <div class="d-flex justify-content-between">
                {{ message.ownerPeople.names }}
                {{ message.ownerPeople.lastnames }}
                <!-- <span class="text-muted" style="font-size: 0.85rem">Fecha</span> -->
                <span class="text-muted" style="font-size: 0.8rem">
                  {{
                    dayjs
                      .utc(message.sendDatetime ?? message.createdAt)
                      .locale('es')
                      .subtract(5, 'hour')
                      .format('DD/MM/YY hh:mm A')
                  }}
                </span>
              </div>
            </div>

            {{ message.nameStudent }}
            {{ message.nameDegree }}

            <p class="m-0" style="font-size: 0.85rem">
              {{ cleanKey(message.title) }}

              <template v-if="titleWithIcon(message.title)">
                <AppIcon v-if="titleWithIcon(message.title) == 'frown'" class="text-danger ms-1" icon="frown"></AppIcon>
                <AppIcon v-else-if="titleWithIcon(message.title) == 'smile'" class="text-success ms-1" icon="smile"> </AppIcon>
                <AppIcon v-else-if="titleWithIcon(message.title)" class="ms-1" :icon="titleWithIcon(message.title)"> </AppIcon>
              </template>
            </p>
          </div>
        </template>

        <template v-slot:content>
          <div v-html="message.body"></div>

          <section v-if="message.attachments.length">
            <hr />

            <h5>Adjuntos</h5>

            <span
              v-for="(attachment, index) in message.attachments"
              :key="index"
              class="badge rounded-pill border border-primary text-primary ps-3 pe-3 pt-2 pb-2 ms-2 pointer"
              @click="downloadFile(attachment.urlAttachmentFile, attachment.name)"
              >{{ attachment.name }}</span
            >
          </section>
        </template>
      </AppAccordionItem>
    </AppAccordion>

    <AppButtonGroup v-if="parentMessageId && btnId !== 2" class="mt-2 bg-white">
      <div class="buttons-group">
        <AppButton
          :to="{
            name: 'communications.messagesAction',
            query: { messageId: parentMessageId, typeMessage: 'Reply' },
          }"
          label="communications.messages.btnReply"
          outlined
        ></AppButton>

        <AppButton
          :to="{
            name: 'communications.messagesAction',
            query: { messageId: parentMessageId, typeMessage: 'Forwarded' },
          }"
          label="communications.messages.btnForwarded"
          outlined
        ></AppButton>
      </div>
    </AppButtonGroup>

    <AppButtonGroup v-if="parentMessageId && btnId === 2" class="mt-2 bg-white">
      <AppButton @click="deleteMessage(parentMessageId ?? null)" label="core.delete" outlined></AppButton>

      <AppButton
        :to="{
          name: 'communications.messagesEdit',
          params: { messageId: parentMessageId },
        }"
        label="core.edit"
        outlined
      ></AppButton>
    </AppButtonGroup>
  </template>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { mimeTypesConstant } from '../../../shared/constant/mimeTypes.constant';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';

import { MessageQueueDto } from '../dtos/message.dto';

import { DeleteMessagesService } from '../services/deleteMessages.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

const deleteMessagesService = new DeleteMessagesService();

dayjs.locale('es');
dayjs.extend(utc);
export default defineComponent({
  name: 'MessageQueue',
  components: {
    AppAccordionItem,
    AppEmptyResponse,
    AppButtonGroup,
    AppAccordion,
    AppButton,
    AppCard,
    AppIcon,
  },

  props: {
    parentMessageId: {
      type: Number,
    },
    btnId: {
      type: Number,
    },
    messageQueue: {
      type: Array as PropType<MessageQueueDto[]>,
    },
  },
  emits: ['loadMessage'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const getMimeTypeFromExtension = (extension: string): string | undefined => {
      const extensionMap: { [key: string]: string } = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        txt: 'text/plain',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        rar: 'application/vnd.rar',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
        svg: 'image/svg+xml',
        zip: 'application/zip',
      };

      return extensionMap[extension.toLowerCase()];
    };

    const downloadFile = (downloadUrl: string, name: string) => {
      const extension: any = name.split('.').pop();
      const mimeType = getMimeTypeFromExtension(extension);

      if (!mimeType) {
        console.error(`Tipo MIME no encontrado para la extensión ${extension}`);
        return;
      }

      fetch(downloadUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', name);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    };

    const deleteMessage = async (id: number | null) => {
      try {
        if (id) {
          await deleteMessagesService.run(id);
          emit('loadMessage');
        }
      } catch (e) {
        console.log(e);
      }
    };

    const titleWithIcon = (title: string) => {
      let icon = '';

      const indexStart = title.search('{icon.');
      const indexEnd = title.search('}');
      const key = !!indexStart && !!indexEnd ? title.slice(indexStart + 1, indexEnd) : '';

      icon = key ? key.split('.')[1] : '';

      return icon;
    };
    const cleanKey = (title: string) => {
      const indexStart = title.search('{icon.');
      const indexEnd = title.search('}');
      const key = !!indexStart && !!indexEnd ? title.slice(indexStart, indexEnd + 1) : '';

      return title.replace(key, '');
    };

    return {
      t,

      deleteMessage,
      titleWithIcon,
      downloadFile,
      cleanKey,
      dayjs,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
  width: auto;
}

.buttons-group {
  display: flex;
  gap: 5px;
}

@media screen and (max-width: 720px) {
  .buttons-group {
    display: grid;
    gap: 5px;
  }
}
</style>
