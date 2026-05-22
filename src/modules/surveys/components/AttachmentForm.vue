<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.title">
          <label for="title">Nombre</label>
          <input type="text" class="form-control" v-model="v$.form.title.$model" id="title"/>
        </AppFormField>

        <AppFormField :form-control="v$.form.description">
          <label for="description">Descripción</label>
          <AppVoiceInput v-model="v$.form.description.$model" id="description" textareaClass="form-control"  />
        </AppFormField>

        <AppFormField :form-control="v$.form.file">
          <label for="file">Plantilla</label>
          <AppUploadFile input-id="file" :current-file="currentFile" v-model="v$.form.file.$model"></AppUploadFile>
        </AppFormField>

      </template>
      <template v-slot:actions>
        <AppButton>
          Guardar
        </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import {defineComponent, reactive} from 'vue';
import {useVuelidate} from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';

import {required, maxSize} from '../../../shared/plugins/vuelidate.plugin';
import {CreateOrUpdateAttachmentService} from '../services/createOrUpdateAttachment.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateAttachmentService = new CreateOrUpdateAttachmentService();

export default defineComponent({
  name: 'AttachmentForm',
  components: {AppUploadFile, AppButton, AppFormField, AppFormModal, AppVoiceInput},
  props: ['data'],
  emits: ['close'],
  setup(props, {emit}) {
    const data = props.data;
    let title = 'Nuevo adjunto';

    if (data?.id) {
      title = 'Editar adjunto';
    }

    const currentFile = data?.urlTemplate;

    const form = reactive({
      title: data?.title,
      description: data?.description ?? null,
      file: null,
    });

    const v$ = useVuelidate({
      form: {
        title: {required},
        description: {required},
        file: {
          maxSize: maxSize(),
        },
      },
    }, {form});

    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      try {
        await createOrUpdateAttachmentService.run(form, data?.id);

        emit('close');
      } catch (e) {

      }

    };

    return {
      title,
      v$,
      currentFile,
      save,
    };
  },
});
</script>

<style scoped>

</style>