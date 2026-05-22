<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'surveys.customFormsList' }" />

      <AppButton style="color: white" @click="save">
        {{ data?.id ? t('core.save') : t('core.continue') }}
      </AppButton>
    </template>

    <template #content>
      <div>
        <div class="card-body">
          <div class="form-row">
            <AppFormField :form-control="v$.form.title" :label="'Título'">
              <input class="form-control" type="text" id="title" v-model="v$.form.title.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.thumbnail" :label="'Imagen'">
              <AppUploadImage input-id="thumbnail" v-model="v$.form.thumbnail.$model" :current-thumbnail="data?.urlImgHeader" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.description" :label="'Descripción'">
              <AppVoiceInput v-model="v$.form.description.$model"
                id="description" textareaClass="form-control"  />
            </AppFormField>

            <div class="tw-flex-1 pt-4">
              <AppFormField class="form-check form-switch" :form-control="v$.form.isCustomFieldSurvey" label="Formulario para complementar información del estudiante">
                <input class="form-check-input" type="checkbox" role="switch" id="isCustomFieldSurvey" v-model="v$.form.isCustomFieldSurvey.$model" />
              </AppFormField>
            </div>
          </div>

          <template v-if="data?.id">
            <hr />
            <CustomFormsFormSections :survey="data" />
          </template>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import CustomFormsFormSections from './CustomFormsFormSections.vue';

import { CustomFormDto, ParamsFormCustomFormDto } from '../dtos/customForm.dto';

import { CreateOrUpdateCustomFormService } from '../services/createOrUpdateCustomForm.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';


export default defineComponent({
  name: 'CustomFormsForm',
  components: {
    AppUploadImage,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppButton,
    AppVoiceInput,
    CustomFormsFormSections,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    data: {
      type: Object as () => CustomFormDto | null,
      default: () => null,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const router = useRouter();

    const createOrUpdateCustomFormService = new CreateOrUpdateCustomFormService();

    const form = reactive<ParamsFormCustomFormDto>({
      title: props.data?.title || '',
      thumbnail: '',
      description: props.data?.description || '',
      isCustomFieldSurvey: !!props.data?.isCustomFieldSurvey,
    });
    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          thumbnail: {},
          description: { required },
          isCustomFieldSurvey: {},
        },
      },
      { form }
    );

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return false;

      try {
        const dataSend: ParamsFormCustomFormDto = {
          title: form.title,
          description: form.description,
          isCustomFieldSurvey: form.isCustomFieldSurvey ? 1 : 0,
        };

        if (form.thumbnail) dataSend.thumbnail = form.thumbnail;

        const response = await createOrUpdateCustomFormService.run(dataSend, props.data?.id);

        if (!props.data?.id) {
          await router.push({
            name: 'surveys.customFormsEdit',
            params: { formId: response.data.id },
          });
        }
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      v$,
      t,

      save,
    };
  },
});
</script>
