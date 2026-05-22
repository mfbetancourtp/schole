<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template #content>
        <AppLoading v-if="loading" />

        <template v-else>
          <AppFormField :form-control="v$.form.description" :label="'Descripción'">
            <AppVoiceInput v-model="v$.form.description.$model"
                 textareaClass="form-control"  />
          </AppFormField>

          <AppFormField :form-control="v$.form.urlVideoConvocationStep" :label="'URL Video'">
            <input v-model="v$.form.urlVideoConvocationStep.$model" type="text" class="form-control" />
          </AppFormField>

          <div class="form-row">
            <AppFormField :form-control="v$.form.surveyId" :label="'Formulario'">
              <AppAutocomplete v-model="v$.form.surveyId.$model" :options="surveys" :label="'title'" :disabled="data?.id" />
            </AppFormField>

            <div class="col-4 d-flex align-items-end">
              <AppFormField class="form-check form-switch" :form-control="v$.form.isProfile" :label="'Mostrar en el perfil'">
                <input class="form-check-input" type="checkbox" role="switch" id="isProfile" v-model="v$.form.isProfile.$model" />
              </AppFormField>
            </div>
          </div>
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
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CustomFormDto } from '../dtos/customForm.dto';

import { GetActiveCustomFormsService } from '../services/getActiveCustomForms.service';
import { CreateOrUpdateConvocationStepService } from '../services/createOrUpdateConvocationStep.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateConvocationStepService = new CreateOrUpdateConvocationStepService();
const getActiveCustomFormsService = new GetActiveCustomFormsService();

export default defineComponent({
  name: 'StepForm',

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
    const title = `${props.data?.id ? 'Editar' : 'Nuevo'} paso ${props.stepType?.name ?? '---'}`;

    const surveys: Ref<CustomFormDto[]> = ref([]);

    const loading = ref(true);

    onMounted(async () => {
      surveys.value = await getActiveCustomFormsService.run();

      loading.value = false;
    });

    const form = reactive({
      convocationId: props.convocation?.id,
      convocationStepTypeId: props.stepType?.id,

      description: props.data?.description ?? '',
      urlVideoConvocationStep: props.data?.urlVideoConvocationStep ?? null,
      surveyId: props.data?.surveyId ?? null,
      isProfile: props.data?.isProfile ? true : false,

      order: props.data?.order ?? props.convocation?.steps.length + 1,
    });
    const v$ = useVuelidate(
      {
        form: {
          convocationId: { required },
          convocationStepTypeId: { required },

          description: {},
          urlVideoConvocationStep: {},
          surveyId: { required },
          isProfile: {},

          order: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const isValid = v$.value.$validate();
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
        console.log('err', e);
      }
    };

    return {
      loading,
      title,
      v$,

      surveys,

      save,
    };
  },
});
</script>
