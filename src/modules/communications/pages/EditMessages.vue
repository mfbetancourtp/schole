<template>
  <AppLoading v-if="loading"></AppLoading>

  <MessagesForm
    v-if="message"
    :title="title"
    :routes="routes"
    :message="message"
    :is-student-or-parent="isStudentOrParent"
    :owner-people="ownerPeople"
    :replicated-or-forwarded-message="replicatedOrForwardedMessage"
    :type-message="typeMessage"
  ></MessagesForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import MessagesForm from '../components/MessagesForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { MessageDto } from '../dtos/message.dto';

import { GetMessagesOwnerPeopleService } from '../services/getMessagesOwnerPeople.service';
import { CreateOrUpdateMessagesService } from '../services/createOrUpdateMessages.service';
import { GetMessageWithAttachmentsByMessageIdService } from '../services/getMessageWithAttachmentsByMessageId.service';

const getMessageWithAttachmentsService = new GetMessageWithAttachmentsByMessageIdService();
const createOrUpdateMessagesService = new CreateOrUpdateMessagesService();
const getMessagesOwnerPeopleService = new GetMessagesOwnerPeopleService();

export default defineComponent({
  name: 'EditMessages',
  components: { MessagesForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const typeMessage = (route.query.typeMessage as string) ?? null;
    const typeMessageTitle = typeMessage ? (typeMessage == 'Reply' ? 'Responder Mensaje' : 'Reenviar Mensaje') : '';

    const title = typeMessageTitle ? typeMessageTitle : `${t('core.edit')} Mensaje`;

    useMeta({ title });

    const routes = [
      {
        name: 'Mensajes',
        url: { name: 'communications.messagesList' },
      },
      {
        name: title,
      },
    ];

    const replicatedOrForwardedMessage: Ref<MessageDto | null> = ref(null);
    const message: Ref<MessageDto | null> = ref(null);
    const ownerPeople: Ref<any> = ref(null);

    const isStudentOrParent = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        if (route.params.messageId) {
          let messageId = parseInt(route.params.messageId.toString(), 10);

          message.value = await getMessageWithAttachmentsService.run(messageId);

          if (message.value.parentMessageId) {
            const parentMessageId = message.value.parentMessageId;

            ownerPeople.value = await getMessagesOwnerPeopleService.run(parentMessageId);
            replicatedOrForwardedMessage.value = await getMessageWithAttachmentsService.run(parentMessageId);
          }
        }

        if (route.query.messageId) {
          const messageId = parseInt(route.query.messageId as string);

          ownerPeople.value = await getMessagesOwnerPeopleService.run(messageId);
          replicatedOrForwardedMessage.value = await getMessageWithAttachmentsService.run(messageId);

          await createMessagesForwardedOrReply(messageId);
        }

        await studentOrParent();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const studentOrParent = async () => {
      const roles: any[] = JSON.parse(localStorage.getItem('roles') ?? '[]');
      isStudentOrParent.value = roles[0].profile.code == 'student' || roles[0].profile.code == 'tutor';
    };

    const createMessagesForwardedOrReply = async (parentMessageId: number) => {
      const title = replicatedOrForwardedMessage.value?.title ?? '';
      const originalBody = replicatedOrForwardedMessage.value?.body || '';
      const attachments = replicatedOrForwardedMessage.value?.attachments ?? [];
      const matriculateParentsIds = null; // Puedes ajustar este valor según tus necesidades

      const form = {
        sendNotificationToMail: false,
        message: {
          parentMessageId: parentMessageId,
          title: typeMessage == 'Reply' ? `RE: ${title}` : `RV: ${title}`,
          body: originalBody,
          isDraft: true,
          typeMessage: typeMessage,
          attachments: attachments,
          matriculateParentsIds: matriculateParentsIds, // Incluye esta propiedad
        },
        receivers: { courses: [], students: [], peoples: [] },
      };
      const response = await createOrUpdateMessagesService.run(form);
      // Obtener el nuevo messageId del response
      const newMessageId = response.data.id;

      // Actualizar el messageId en cada attachment
      const updatedAttachments = attachments.map((attachment) => ({
        ...attachment,
        messageId: newMessageId,
      }));

      // Crear el nuevo formulario con attachments actualizados
      // const updatedForm = {
      //   sendNotificationToMail: false,
      //   message: {
      //     parentMessageId: parentMessageId,
      //     title: typeMessage == 'Reply' ? `RE: ${title}` : `RV: ${title}`,
      //     body: originalBody,
      //     isDraft: true,
      //     typeMessage: typeMessage,
      //     attachments: updatedAttachments, // Adjuntar attachments actualizados
      //     matriculateParentsIds: matriculateParentsIds,
      //   },
      //   receivers: { courses: [], students: [], peoples: [] },
      // };
      // await createOrUpdateMessagesService.run(updatedForm, newMessageId);

      message.value = await getMessageWithAttachmentsService.run(response.data.id);
    };

    return {
      loading,
      routes,
      title,

      isStudentOrParent,
      message,

      replicatedOrForwardedMessage,
      ownerPeople,
      typeMessage,
    };
  },
});
</script>

<style scoped></style>
