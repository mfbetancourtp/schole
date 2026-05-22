<template>
  <form @submit.prevent="save">
     <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <AppLoading v-if="loading"></AppLoading>
        <template v-else>
          <AppFormField :form-control="v$.form.title">
            <label for="title">Nombre</label>
            <input
              id="title"
              class="form-control"
              type="text"
              v-model="v$.form.title.$model"
              pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
              title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
            />
          </AppFormField>

          <AppFormField :form-control="v$.form.description" :label="'Descripción'">
            <AppVoiceInput v-model="v$.form.description.$model"
                 id="description" textareaClass="form-control"  />
          </AppFormField>
          <AppFormField :form-control="v$.form.urlVideoConvocationStep" :label="'URL Video'">
            <input v-model="v$.form.urlVideoConvocationStep.$model" type="text" class="form-control" />
          </AppFormField>

          <AppFormField :form-control="v$.form.requirementIds" :label="'Adjuntos'">
            <AppAutocomplete v-model="v$.form.requirementIds.$model" :options="attachments" :label="'title'" :multiple="true"></AppAutocomplete>
          </AppFormField>
          <AppFormField class="form-check form-switch" :form-control="v$.form.isProfile" :label="'Mostrar en el perfil'">
            <input class="form-check-input" type="checkbox" role="switch" id="isProfile" v-model="v$.form.isProfile.$model" />
          </AppFormField>
        </template>
      </template>
      <template #actions>
        <AppButton> Guardar </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { AttachmentDto } from '../dtos/attachment.dto';

import { GetAttachmentsService } from '../services/getAttachments.service';
import { CreateOrUpdateConvocationStepService } from '../services/createOrUpdateConvocationStep.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getAttachmentsService = new GetAttachmentsService();
const createOrUpdateConvocationStepService = new CreateOrUpdateConvocationStepService();

export default defineComponent({
  name: 'StepAttachment',
  components: {
    AppButton,
    AppFormField,
    AppLoading,
    AppFormModal,
    AppAutocomplete,
    AppVoiceInput
  },
  props: ['data', 'stepType', 'convocation'],
  emits: ['close'],
  setup(props, { emit }) {
    const stepType = props.stepType ?? null;
    const convocation = props.convocation ?? null;
    const title = `${props.data?.id ? 'Editar' : 'Nuevo'} paso ${stepType?.name}`;
    const loading = ref(true);
    const attachments: Ref<AttachmentDto[]> = ref([]);

    onMounted(async () => {
      attachments.value = await getAttachmentsService.run();
      loading.value = false;
    });

    const form = reactive({
      title: props.data?.title ?? null,
      convocationId: convocation?.id,
      convocationStepTypeId: stepType?.id,
      requirementIds: props.data && props.data?.details ? props.data?.details.map((attachment: any) => attachment.id) : [],
      order: props.data?.order ?? convocation?.steps.length + 1,
      isProfile: props.data?.isProfile ? (props.data.isProfile == 1 ? true : false) : false,
      description: props.data?.description ?? '',
      urlVideoConvocationStep: props.data?.urlVideoConvocationStep ?? null,
    });

    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          convocationId: { required },
          convocationStepTypeId: { required },
          requirementIds: { required },
          isProfile: {},
          description: {},
          urlVideoConvocationStep: {},
        },
      },
      { form }
    );
    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      try {
        if (form.urlVideoConvocationStep && form.urlVideoConvocationStep.includes('youtube.com')) {
          const urlActual = form.urlVideoConvocationStep;
          const urlObjeto = new URL(urlActual);
          const parametrosConsulta = urlObjeto.searchParams;
          const videoId = parametrosConsulta.get('v');

          if (videoId) form.urlVideoConvocationStep = `https://www.youtube.com/embed/${videoId}`;

          console.log('videoId', videoId);
        }

        await createOrUpdateConvocationStepService.run(form, props.data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      loading,
      v$,
      attachments,
      save,
      emit,
    };
  },
});
</script>

<style scoped></style>
