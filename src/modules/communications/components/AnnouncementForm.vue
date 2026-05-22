<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'communications.announcements' }"></AppButtonBack>

      <AppButton style="color: white;" :disabled="noReceivers" @click="saveRecipients" label="communications.announcements.form.save"></AppButton>
    </template>

    <template #content>
      <div>
        <section>
            <AppFormField :form-control="v$.form.title" :label="'communications.announcements.form.title'">
              <input
                id="title"
                type="text"
                class="form-control"
                v-model="v$.form.title.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>

            <AppFormField :form-control="v$.form.body" :label="'communications.announcements.form.body'">
              <AppEditorDocument style="max-height: 70vh" v-model="v$.form.body.$model"></AppEditorDocument>
            </AppFormField>
          </section>

        <hr />

        <section>
          <h5>{{ t('communications.announcements.form.attachments') }}</h5>

          <div class="d-flex align-items-center">
            <AppButton v-tooltip="'communications.announcements.form.addAttachment'" icon="paperclip" outlined @click="openFormAttachment"></AppButton>

            <template v-for="(file, index) in files" :key="index">
              <span class="badge rounded-pill border border-primary text-primary ps-3 pe-3 pt-2 pb-2 ms-2">
                <div class="d-flex align-items-center">
                  <span class="me-3" style="font-size: 1rem">{{ file.name }}</span>

                  <AppIcon class="fs-5 me-1" v-tooltip="'Ver archivo'" icon="eye" @click="openLink(file.url)"></AppIcon>

                  <AppIcon class="fs-5 pointer" icon="times-circle" @click="openDeleteAttachment(index)"></AppIcon>
                </div>
              </span>
            </template>
          </div>
        </section>

        <hr />

        <ReceiversMessagesForm :is-student-or-parent="isStudentOrParent" @update-receivers="updateReceivers"></ReceiversMessagesForm>
      </div>

      <AppModal v-model="attachedFormModal">
        <AttachedForm v-if="attachedFormModal" :announcement-id="data?.id" @close="closeFormAttachment"></AttachedForm>
      </AppModal>

      <AppModal v-model="modalDeleteAttachment">
        <AppConfirmDeleteModal v-if="modalDeleteAttachment" entity="communications.attachments.singular" @confirmDelete="confirmDeleteAttachment"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AttachedForm from './AttachedForm.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import ReceiversMessagesForm from './ReceiversMessagesForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppEditorDocument from '../../../shared/components/Editor/AppEditorDocument.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { CreateOrUpdateAnnouncementsService } from '../services/createOrUpdateAnnouncements.service';
import { CreateAnnouncementReceiversService } from '../services/createAnnouncementReceivers.service';
import { DeleteAnnouncementAttachmentService } from '../services/deleteAnnouncementAttachment.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteAnnouncementAttachmentService = new DeleteAnnouncementAttachmentService();
const createAnnouncementReceiversService = new CreateAnnouncementReceiversService();
const createOrUpdateAnnouncementsService = new CreateOrUpdateAnnouncementsService();

export default defineComponent({
  name: 'AnnouncementForm',
  components: {
    ReceiversMessagesForm,
    AppConfirmDeleteModal,
    AppEditorDocument,
    AppButtonBack,
    AppFormField,
    AttachedForm,
    AppBaseList,
    AppButton,
    AppModal,
    AppIcon,
  },

  props: ['title', 'routes'],

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const title = 'Nuevo Anuncio';

    const files: Ref<any[]> = ref([]);
    const data: Ref<any> = ref();

    const indexAttachment = ref();

    const modalDeleteAttachment = ref(false);
    const isStudentOrParent = ref(false);
    const attachedFormModal = ref(false);
    const noReceivers = ref(true);

    const form = reactive({
      title: '',
      body: '',
      receivers: {
        courses: [],
        students: [],
        peoples: [],
      },
    });
    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          body: { required },
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
        headerStorage.moduleItem = { name: 'Anuncios', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };
        await studentOrParent();
      } catch (e) {
        console.log(e);
      }
    });

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        const dataSend = {
          title: form.title,
          body: form.body,
        };

        const response = await createOrUpdateAnnouncementsService.run(dataSend, data.value?.id);

        data.value = {
          ...data.value,
          id: response.data.id,
        };
      } catch (e) {
        console.log(e);
      }
    };

    const saveRecipients = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      let isValidCheck = true;

      if (isValidCheck) {
        await save();

        try {
          const dataSend = {
            notificationType: 1,
            announcementId: data.value?.id,
            courses: form.receivers.courses,
            students: form.receivers.students,
            peoples: form.receivers.peoples,
          };

          await createAnnouncementReceiversService.run(dataSend);

          await router.push({
            name: 'communications.announcements',
          });
        } catch (e) {
          console.log(e);

          await router.push({
            name: 'communications.announcements',
          });
        }
      }
    };

    const openFormAttachment = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      await save();

      attachedFormModal.value = true;
    };
    const closeFormAttachment = async (dataClose: any) => {
      files.value.push(dataClose);
      attachedFormModal.value = false;
    };

    const openDeleteAttachment = (index: number) => {
      indexAttachment.value = index;
      modalDeleteAttachment.value = true;
    };
    const confirmDeleteAttachment = async () => {
      try {
        await deleteAnnouncementAttachmentService.run(files.value[indexAttachment.value].id);
        files.value.splice(indexAttachment.value, 1);
      } catch (e) {
        console.log(e);
      }

      modalDeleteAttachment.value = false;
    };

    const studentOrParent = async () => {
      const roles: any[] = JSON.parse(localStorage.getItem('roles') ?? '[]');
      isStudentOrParent.value = roles[0].profile.code == 'student' || roles[0].profile.code == 'tutor';
    };

    const updateReceivers = async (receivers: any) => {
      form.receivers.courses = receivers.courses;
      form.receivers.students = receivers.students;
      form.receivers.peoples = receivers.peoples;

      if (form.receivers.courses.length || form.receivers.students.length || form.receivers.peoples.length) {
        noReceivers.value = false;
      }
    };

    const openLink = (link: string) => {
      window.open(link, '_blank');
    };

    return {
      v$,
      t,

      modalDeleteAttachment,
      isStudentOrParent,
      attachedFormModal,
      noReceivers,
      files,
      data,

      confirmDeleteAttachment,
      openDeleteAttachment,
      closeFormAttachment,
      openFormAttachment,
      updateReceivers,
      saveRecipients,
      openLink,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
