<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButtonBack :to="{ name: 'communications.messagesList' }"></AppButtonBack>
    </template>

    <template #content>
      <template v-if="profileId != null && profileId === 4">
        <SelectionStudentsByParent @matriculate-parent-id="updateStudentUserId"></SelectionStudentsByParent>
      </template>
      <template v-if="replicatedOrForwardedMessage">
        <AppAccordion v-slot="{ accordionId }" class="mb-2">
          <AppAccordionItem :accordion-id="accordionId">
            <template v-slot:head>
              <div>
                <div class="m-0" style="font-weight: 500; font-size: 0.9rem">
                  {{ ownerPeople.fullName }}
                </div>

                <p class="m-0" style="font-size: 0.85rem">
                  {{ ownerPeople.email }}
                </p>
              </div>
            </template>

            <template v-slot:content>
              <div v-html="replicatedOrForwardedMessage.body"></div>
              <section v-if="replicatedOrForwardedMessage.attachments.length">
                <hr />

                <h5>Adjuntos</h5>

                <!-- VOY A PASARLE POR PROPS LAS URLS DE LOS ARCHIVOS ACA -->
                <span
                  v-for="(attachment, index) in replicatedOrForwardedMessage.attachments"
                  :key="index"
                  class="badge rounded-pill border border-primary text-primary ps-3 pe-3 pt-2 pb-2 ms-2 pointer"
                  @click="downloadFile(attachment.urlAttachmentFile, attachment.name)"
                  >{{ attachment.name }}</span
                >
              </section>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </template>

      <AppCard>
        <template #body>
          <div>
            <AppFormField :form-control="v$.form.message.title" :label="'Asunto'">
              <input
                type="text"
                class="form-control"
                v-model="v$.form.message.title.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>

            <AppFormField :form-control="v$.form.message.body" :label="'Descripción'">
              <AppEditorDocument v-model="v$.form.message.body.$model" style="max-height: 60vh"></AppEditorDocument>
            </AppFormField>

            <div class="buttons-send-and-others">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="sendNotificationToMail" v-model="v$.form.sendNotificationToMail.$model" />

                <label class="form-check-label" for="sendNotificationToMail">Enviar notificación al correo</label>
              </div>

              <AppButtonGroup class="buttons-group">
                <AppButton @click="deleteMessage" label="Eliminar" outlined></AppButton>

                <AppButton :disabled="!v$.form.message.body.$model" label="Guardar Borrador" @click="saveDraft" outlined> </AppButton>

                <AppButton :disabled="(!v$.form.message.body.$model || noReceivers) && !typeMessage && !isReplyOrForwarded" @click="saveMessage" label="Enviar" outlined></AppButton>
              </AppButtonGroup>
            </div>
          </div>

          <hr />

          <AttachedMessagesForm class="ms-1" :message-id="message?.id" :attachments="message?.attachments"> </AttachedMessagesForm>

          <hr />
          <ReceiversMessagesForm v-if="typeMessage != 'Reply'" @update-receivers="updateReceivers"></ReceiversMessagesForm>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, reactive, ref, watch, Ref, computed, watchEffect } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AttachedMessagesForm from './AttachedMessagesForm.vue';
import ReceiversMessagesForm from './ReceiversMessagesForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppEditorDocument from '../../../shared/components/Editor/AppEditorDocument.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';

import { MessageDto } from '../dtos/message.dto';
import { OwnerPeopleSummaryDto } from '../dtos/message.dto';

import { DeleteMessagesService } from '../services/deleteMessages.service';
import { CreateOrUpdateMessagesService } from '../services/createOrUpdateMessages.service';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateMessagesService = new CreateOrUpdateMessagesService();
const deleteMessagesService = new DeleteMessagesService();

export default defineComponent({
  name: 'MessagesForm',
  components: {
    ReceiversMessagesForm,
    AttachedMessagesForm,
    AppEditorDocument,
    AppAccordionItem,
    AppButtonGroup,
    AppButtonBack,
    AppAccordion,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppCard,
    SelectionStudentsByParent,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
    isStudentOrParent: {
      type: Boolean,
      required: true,
    },
    message: {
      type: Object as PropType<MessageDto>,
      default: null,
    },

    replicatedOrForwardedMessage: {
      type: Object as PropType<MessageDto | null>,
      default: null,
    },
    ownerPeople: {
      type: Object as PropType<OwnerPeopleSummaryDto>,
      default: null,
    },
    typeMessage: {
      type: String as PropType<string | null>,
      default: null,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const message = props.message ?? null;
    console.log('message.value', message);

    let intervalSave: any = null;

    const isReplyOrForwarded = ref(false);
    const noReceivers = ref(true);
    const loading = ref(true);
    const notificationsNotOpen: Ref<any[]> = ref([]);
    const activitiesByCourse: Ref<any[]> = ref([]);
    const loadingActivities = ref(false);

    const form = reactive({
      notificationType: 2,
      sendNotificationToMail: false,
      message: {
        parentMessageId: message?.parentMessageId ?? null,
        title: message ? (message.title == 'Sin asunto' ? '' : message.title) : '',
        body: message ? (message.body == '-null-' ? '' : message.body) : '',
        isDraft: message ? (message.isDraft ? true : false) : true,
        isUpdate: true,
        typeMessage: props.typeMessage ?? null,
        matriculateParentsIds: null,
      },
      receivers: { courses: [], students: [], peoples: [] },
    });
    const v$ = useVuelidate(
      {
        form: {
          notificationType: {},
          sendNotificationToMail: {},
          message: {
            parentMessageId: {},
            title: { required },
            body: { required },
            isDraft: {},
            typeMessage: {},
            isUpdate: {},
            matriculateParentsIds: {},
          },
          receivers: {
            courses: {},
            students: {},
            peoples: {},
          },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Comunicaciones', url: '' };
        headerStorage.moduleItem = { name: 'Mensajes', url: '' };
        headerStorage.moduleSubItem = { name: props.title, url: '' };
        if (props.typeMessage === 'Forwarded' || (route.params.messageId && props.typeMessage !== 'Reply')) {
          form.message.body = props.message?.body;
        } else {
          form.message.body = 'ㅤ';
          await saveDraft();
        }

        if (message?.id) {
          intervalSave = setInterval(async () => {
            await saveDraft();
          }, 120000);
        }
        console.log('log', props.isStudentOrParent);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    const getProfileIdFromLocalStorage = () => {
      const profileId = localStorage.getItem('profileId');
      return profileId ? parseInt(profileId) : null;
    };
    const profileId = ref(getProfileIdFromLocalStorage());
    watchEffect(() => {
      profileId.value = getProfileIdFromLocalStorage();
    });

    watch(
      () => form.message.typeMessage,
      async (value) => {
        isReplyOrForwarded.value = value ? true : false;
      }
    );
    const saveDraft = async () => {
      try {
        if (form.message.title) {
          if (!form.message.typeMessage) form.message.typeMessage = form.message.title.search('RE:') >= 0 ? 'Reply' : null;
          if (!form.message.typeMessage) form.message.typeMessage = form.message.title.search('RV:') >= 0 ? 'Forwarded' : null;
        }
        const response = await createOrUpdateMessagesService.run(form, message?.id);
        if (form.message.body == '-null-' || form.message.body == '<p>-null-</p>') form.message.body = '';
        if (!route.params.messageId || !message) {
          await router.push({
            name: 'communications.messagesEdit',
            params: { messageId: response.data.id },
          });
        }
      } catch (e) {
        console.log(e);
      }
    };
    const receiversValid = computed(() => {
      return form.receivers.courses.length > 0 || form.receivers.students.length > 0 || form.receivers.peoples.length > 0;
    });

    const saveMessage = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;
      if (form.message.typeMessage === 'Reply') {
        try {
          form.message.isDraft = false;
          form.sendNotificationToMail = form.sendNotificationToMail ? 1 : 0;

          await createOrUpdateMessagesService.run(form, message?.id);
          await router.push({ name: 'communications.messagesList' });
        } catch (e) {
          console.log(e);
        }
      } else {
        if (!receiversValid.value) {
          alert('Debe seleccionar al menos un destinatario.');
          return;
        }

        try {
          form.message.isDraft = false;
          form.sendNotificationToMail = form.sendNotificationToMail ? 1 : 0;

          await createOrUpdateMessagesService.run(form, message?.id);
          await router.push({ name: 'communications.messagesList' });
        } catch (e) {
          console.log(e);
        }
      }
    };

    const updateReceivers = async (receivers: any) => {
      form.receivers = receivers;

      if (form.receivers.courses.length || form.receivers.students.length || form.receivers.peoples.length) {
        noReceivers.value = false;
      }
    };

    const downloadFile = (downloadUrl: string, name: string) => {
      fetch(downloadUrl)
        .then((response) => response.blob())
        .then((blob) => {
          console.log(blob);
          // const extencion = mimeTypesConstant[blob.type];

          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', name);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    };

    const deleteMessage = async () => {
      try {
        if (message?.id) {
          await deleteMessagesService.run(message.id);
          await router.push({ name: 'communications.messagesList' });
        }
      } catch (e) {
        console.log(e);
      }
    };

    const updateStudentUserId = async (studentUserId: any) => {
      loadingActivities.value = true;

      if (studentUserId) {
        form.message.matriculateParentsIds = studentUserId;
      }
      loadingActivities.value = false;
    };

    onUnmounted(() => {
      if (intervalSave) {
        clearInterval(intervalSave);
      }
    });

    return {
      loading,
      v$,
      t,

      isReplyOrForwarded,
      noReceivers,

      updateReceivers,
      deleteMessage,
      downloadFile,
      saveMessage,
      saveDraft,
      notificationsNotOpen,
      activitiesByCourse,
      loadingActivities,

      updateStudentUserId,
      profileId,
    };
  },
});
</script>

<style scoped>
.w-70 {
  width: 70%;
}

@media screen and (max-width: 720px) {
  .buttons-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
  }

  .buttons-send-and-others {
    flex-direction: column;
  }
}
</style>
