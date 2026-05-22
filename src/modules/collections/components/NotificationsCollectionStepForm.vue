<template>
  <form @submit.prevent="save">
     <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.numberDay" label="collections.collectionSteps.form.notifications.form.numberDay">
            <input class="form-control" type="number" id="numberDay" v-model="v$.form.numberDay.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.channel" label="collections.collectionSteps.form.notifications.form.channel">
            <AppAutocomplete v-model="v$.form.channel.$model" :options="channels" :input-id="'channel'"></AppAutocomplete>
          </AppFormField>
        </div>

        <AppFormField v-if="v$.form.channel.$model == 'sms'" :form-control="v$.form.message" :label="'collections.collectionSteps.form.notifications.form.message'">
          <AppVoiceInput v-model="v$.form.message.$model" id="message"  textareaClass="form-control"  />
        </AppFormField>

        <div v-else>
          <AppFormField :form-control="v$.form.title" label="collections.collectionSteps.form.notifications.form.title">
            <input
              class="form-control"
              type="text"
              id="title"
              v-model="v$.form.title.$model"
              pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
              title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
            />
          </AppFormField>

          <AppFormField :form-control="v$.form.message" :label="'collections.collectionSteps.form.notifications.form.message'">
            <AppEditorDocument v-model="v$.form.message.$model" @editorRef="getEditorRef"></AppEditorDocument>
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.configReceiver" label="collections.collectionSteps.form.notifications.form.configReceiver">
          <AppAutocomplete v-model="v$.form.configReceiver.$model" :options="configReceivers" :input-id="'configReceiver'"></AppAutocomplete>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, minValue } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, PropType, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppEditorDocument from '../../../shared/components/Editor/AppEditorDocument.vue';

import { NotificationDto } from '../dtos/collectionStep.dto';

import { CreateOrUpdateNotificationCollectionStepService } from '../services/createOrUpdateNotificationCollectionStep.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateNotificationCollectionStepService = new CreateOrUpdateNotificationCollectionStepService();

export default defineComponent({
  name: 'NotificationsCollectionStepForm',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppEditorDocument,
    AppVoiceInput
  },

  emits: ['close'],
  props: {
    data: {
      type: Object as PropType<NotificationDto | null>,
    },
    collectionStepId: {
      type: Number,
      required: true,
    },
    configReceivers: {
      type: Array,
      default() {
        return [];
      },
    },
    channels: {
      type: Array,
      default() {
        return [];
      },
    },
  },

  setup(props, { emit }) {
    const data: NotificationDto | null = props.data ?? null;
    let title = data ? 'Editar Notificación' : 'Agregar Notificación';

    const form = reactive({
      collectionStepId: props.collectionStepId,
      title: data?.title ?? '',
      message: data?.message ?? '',
      numberDay: data?.numberDay ?? 0,
      channel: data?.channel ?? null,
      configReceiver: data?.configReceiver ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          collectionStepId: { required },
          title: {},
          message: { required },
          numberDay: { required, minValue: minValue(0) },
          channel: { required },
          configReceiver: { required },
        },
      },
      { form }
    );

    const editorRef: any = ref(null);

    const getEditorRef = (editor: any) => {
      editorRef.value = editor;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateNotificationCollectionStepService.run(form, data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      emit,
      getEditorRef,
    };
  },
});
</script>

<style scoped></style>
