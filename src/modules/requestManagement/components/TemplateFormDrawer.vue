<template>
  <form class="tpl-form" @submit.prevent="submitForm">
    <!-- Información de la plantilla -->
    <div class="tpl-form__card">
      <div class="tpl-form__card-header">
        <div class="tpl-form__card-icon" style="background-color: #ebf5ff">
          <AppIcon icon="file-alt" style="color: #2563eb" />
        </div>
        <h5 class="tpl-form__section-title">
          {{ t('INFORMACIÓN DE LA PLANTILLA') }}
        </h5>
      </div>

      <AppFormField :form-control="v$.form.code" label="Código">
        <input type="text" class="form-control" :placeholder="t('Ej: CNO001')" v-model="v$.form.code.$model" />
      </AppFormField>

      <AppFormField :form-control="v$.form.name" label="Nombre de la Plantilla">
        <input type="text" class="form-control" :placeholder="t('Ej: Certificado de Notas Oficial')" v-model="v$.form.name.$model" />
      </AppFormField>

      <AppFormField :form-control="v$.form.documentTemplatesTypeId" label="Tipo de Documento">
        <AppAutocomplete
          v-model="v$.form.documentTemplatesTypeId.$model"
          :options="templateTypes"
          label="name"
          :reduce="(opt: DocumentTemplateTypeDto) => opt.id"
          :clearable="false"
          :placeholder="t('Selecciona el tipo')"
        />
      </AppFormField>
    </div>

    <!-- Estado -->
    <div class="tpl-form__card">
      <h5 class="tpl-form__section-title">{{ t('ESTADO') }}</h5>
      <div class="tpl-form__toggle-row">
        <div class="tpl-form__toggle-info">
          <span class="tpl-form__toggle-label">{{ t('Estado') }}</span>
          <span class="tpl-form__toggle-desc">{{ t('Activar o desactivar esta plantilla') }}</span>
        </div>
        <div class="form-check form-switch mb-0">
          <input type="checkbox" class="form-check-input" role="switch" :checked="form.status === 1" @change="form.status = form.status === 1 ? 0 : 1" />
        </div>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, PropType, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetDocumentTemplatesTypesService } from '../services/getDocumentTemplatesTypes.service';
import type { DocumentTemplateDto, DocumentTemplateTypeDto, CreateOrUpdateDocumentTemplateDto } from '../dtos/documentTemplates.dto';

const getDocumentTemplatesTypesService = new GetDocumentTemplatesTypesService();

export default defineComponent({
  name: 'TemplateFormDrawer',
  components: { AppIcon, AppFormField, AppAutocomplete },
  props: {
    initialData: {
      type: Object as PropType<DocumentTemplateDto | null>,
      default: null,
    },
  },
  emits: ['submit'],
  setup(props, { emit, expose }) {
    const { t } = useI18n();

    const templateTypes = ref<DocumentTemplateTypeDto[]>([]);

    const form = reactive<CreateOrUpdateDocumentTemplateDto>({
      code: '',
      name: '',
      documentTemplatesTypeId: null,
      contentsHtml: '',
      status: 1,
    });

    const v$ = useVuelidate(
      {
        form: {
          code: { required },
          name: { required },
          documentTemplatesTypeId: { required },
          contentsHtml: {},
          status: {},
        },
      },
      { form }
    );

    const resetForm = () => {
      form.code = '';
      form.name = '';
      form.documentTemplatesTypeId = null;
      form.contentsHtml = '';
      form.status = 1;
      v$.value.$reset();
    };

    watch(
      () => props.initialData,
      (data) => {
        if (data) {
          form.code = data.code;
          form.name = data.name;
          form.documentTemplatesTypeId = data.documentTemplatesTypeId;
          form.contentsHtml = data.contentsHtml ?? '';
          form.status = data.status;
        } else {
          resetForm();
        }
      },
      { immediate: true }
    );

    onMounted(async () => {
      try {
        templateTypes.value = await getDocumentTemplatesTypesService.run();
      } catch (e) {
        console.error(e);
      }
    });

    const submitForm = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;
      emit('submit', { ...form });
    };

    expose({ submitForm });

    return {
      t,
      v$,
      form,
      templateTypes,
      submitForm,
    };
  },
});
</script>

<style scoped>
.tpl-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tpl-form__card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tpl-form__card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tpl-form__card-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.tpl-form__section-title {
  font-size: 13px;
  font-weight: 700;
  color: #212b36;
  letter-spacing: 0.5px;
  margin: 0;
  text-transform: uppercase;
}

.tpl-form__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.tpl-form__toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tpl-form__toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.tpl-form__toggle-desc {
  font-size: 12px;
  color: #919eab;
}
</style>
