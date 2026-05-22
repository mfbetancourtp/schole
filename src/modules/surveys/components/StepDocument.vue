<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template #content>
        <AppLoading v-if="loading" />

        <template v-else>
          <AppFormField :form-control="v$.form.title" label="Nombre">
            <input id="title" class="form-control" type="text" v-model="v$.form.title.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.description" :label="'Descripción'">
            <AppVoiceInput v-model="v$.form.description.$model"
               id="description" textareaClass="form-control"  />
          </AppFormField>

          <AppFormField :form-control="v$.form.urlVideoConvocationStep" :label="'URL Video'">
            <input v-model="v$.form.urlVideoConvocationStep.$model" type="text" class="form-control" />
          </AppFormField>

          <AppFormField :form-control="v$.form.documentIds" :label="'Documentos'">
            <AppAutocomplete v-model="v$.form.documentIds.$model" :options="documents" :label="'title'" :multiple="true" />
          </AppFormField>

          <AppFormField :form-control="v$.form.electronicSignature">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="electronicSignature" v-model="v$.form.electronicSignature.$model" />
              <label class="form-check-label" for="electronicSignature">Usar firmas electrónicas</label>
            </div>
          </AppFormField>

          <AppFormField class="form-check form-switch" :form-control="v$.form.isProfile" :label="'Mostrar en el perfil'">
            <input class="form-check-input" type="checkbox" role="switch" id="isProfile" v-model="v$.form.isProfile.$model" />
          </AppFormField>
        </template>
      </template>

      <template #actions>
        <AppButton label="core.save" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { DocumentDto } from '../dtos/document.dto';

import { GetActiveDocumentsService } from '../services/getActiveDocuments.service';
import { CreateOrUpdateConvocationStepService } from '../services/createOrUpdateConvocationStep.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateConvocationStepService = new CreateOrUpdateConvocationStepService();
const getActiveDocumentsService = new GetActiveDocumentsService();

export default defineComponent({
  name: 'StepDocument',

  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
    AppVoiceInput,
  },

  props: {
    data: {
      type: Object as PropType<any>,
      default: null,
    },
    stepType: {
      type: Object as PropType<any>,
      default: null,
    },
    convocation: {
      type: Object as PropType<any>,
      default: null,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const title = `${props.data?.id ? 'Editar' : 'Nuevo'} paso ${props.stepType?.name}`;

    const documents: Ref<DocumentDto[]> = ref([]);

    const loading = ref(true);

    onMounted(async () => {
      documents.value = await getActiveDocumentsService.run();
      loading.value = false;
    });

    const form = reactive({
      convocationId: props.convocation?.id,
      convocationStepTypeId: props.stepType?.id,
      order: props.data?.order ?? props.convocation?.steps.length + 1,

      title: props.data?.title ?? null,
      description: props.data?.description ?? '',
      urlVideoConvocationStep: props.data?.urlVideoConvocationStep ?? null,

      documentIds: props.data && props.data?.details ? props.data?.details.map((document: any) => document.id) : [],

      electronicSignature: props.data?.electronicSignature ? true : false,
      isProfile: props.data?.isProfile ? (props.data.isProfile == 1 ? true : false) : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          convocationId: { required },
          convocationStepTypeId: { required },
          order: { required },

          title: { required },
          description: {},
          urlVideoConvocationStep: {},

          documentIds: { required },

          electronicSignature: {},
          isProfile: {},
        },
      },
      { form }
    );

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      if (form.description) form.description = form.description.replace(/\n/g, '<br />');

      if (form.urlVideoConvocationStep && form.urlVideoConvocationStep.includes('youtube.com')) {
        const urlActual = form.urlVideoConvocationStep;
        const urlObjeto = new URL(urlActual);
        const parametrosConsulta = urlObjeto.searchParams;
        const videoId = parametrosConsulta.get('v');

        if (videoId) form.urlVideoConvocationStep = `https://www.youtube.com/embed/${videoId}`;
      }

      try {
        await createOrUpdateConvocationStepService.run(form, props.data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      v$,

      documents,
      save,
    };
  },
});
</script>
