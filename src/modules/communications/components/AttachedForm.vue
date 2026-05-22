<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'communications.announcements.form.nameAttachment'">
          <input
            id="name"
            type="text"
            class="form-control"
            v-model="v$.form.name.$model"
            pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
            title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
          />
        </AppFormField>

        <AppFormField :form-control="v$.form.file" :label="'core.upload'">
          <AppUploadFile input-id="file" v-model="v$.form.file.$model"></AppUploadFile>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>{{ t('core.save') }}</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { CreateAnnouncementAttachmentsService } from '../services/createAnnouncementAttachments.service';

const createAnnouncementAttachmentsService = new CreateAnnouncementAttachmentsService();

export default defineComponent({
  name: 'AttachedForm',
  components: { AppFormModal, AppButton, AppUploadFile, AppFormField },

  props: ['announcementId'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    let title = 'communications.announcements.form.addAttachment';

    const form = reactive({
      announcementId: props.announcementId,
      name: '',
      file: '',
    });
    const v$ = useVuelidate(
      {
        form: {
          announcementId: { required },
          name: { required },
          file: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const data = { ...form };
        const response = await createAnnouncementAttachmentsService.run(data);

        emit('close', {
          ...data,
          ...response.data,
        });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      t,
    };
  },
});
</script>

<style scoped></style>
