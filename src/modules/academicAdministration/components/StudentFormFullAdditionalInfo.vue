<template>
  <AppLoading v-if="loading" />

  <template v-else>
    <form @submit.prevent="save">
      <template v-for="surveySection in surveySections" :key="`survey-section-${surveySection.surveySectionId}`">
        <h4 class="mb-4">{{ surveySection.title }}</h4>

        <div class="row">
          <template v-for="field in surveySection.fields" :key="`custom-field-${field.questionId}`">
            <div class="col-md-6 mb-3">
              <DynamicFormField
                :field-id="`custom-field-${field.questionId}`"
                :label="field.field"
                :input-type="getInputType(field)"
                :select-options="getSelectOptions(field)"
                :is-required="field.isRequired === 1"
                :form-control="v$.form.customFieldsData[`field_${field.questionId}`]"
                v-model="v$.form.customFieldsData[`field_${field.questionId}`].$model"
              />
            </div>
          </template>
        </div>

        <hr />
      </template>

      <div class="d-flex justify-content-end mt-4">
        <AppButton type="submit" label="core.save" />
      </div>
    </form>
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive, computed } from 'vue';

import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import DynamicFormField from '../../../shared/components/Forms/DynamicFormField.vue';

import { CustomFieldDto, SurveySectionDto } from '../dto/enrolledStudent.dto';

export default defineComponent({
  name: 'StudentFormFullAdditionalInfo',
  components: {
    AppButton,
    AppLoading,
    DynamicFormField,
  },

  props: {
    surveySections: {
      type: Array as () => SurveySectionDto[],
      required: true,
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['update:modelValue', 'save'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const loading = ref(true);

    const form = reactive({
      customFieldsData: {} as Record<string, string | null>,
    });
    const validationRules = computed(() => {
      const rules: any = {
        form: {
          customFieldsData: {} as Record<string, any>,
        },
      };

      props.surveySections.forEach((section) => {
        section.fields.forEach((field) => {
          const fieldKey = `field_${field.questionId}`;
          rules.form.customFieldsData[fieldKey] = field.isRequired === 1 ? { required } : {};
        });
      });

      return rules;
    });
    const v$ = useVuelidate(validationRules, { form });

    onMounted(() => {
      initializeForm();

      loading.value = false;
    });

    const initializeForm = () => {
      props.surveySections.forEach((section) => {
        section.fields.forEach((field) => {
          const fieldKey = `field_${field.questionId}`;

          if (field.answerOptions.length > 0) {
            form.customFieldsData[fieldKey] = field.answerOptionId || '';
          } else if (field.typeData === 'falso_verdadero') {
            form.customFieldsData[fieldKey] = field.value == '1' ? true : false;
          } else {
            form.customFieldsData[fieldKey] = field.value || null;
          }
        });
      });
    };

    const getInputType = (field: CustomFieldDto) => {
      if (field.answerOptions.length > 0) return 'select';
      if (field.typeData === 'texto_corto') return 'text';
      if (field.typeData === 'texto_largo') return 'textarea';
      if (field.typeData === 'fecha') return 'date';
      if (field.typeData === 'fecha_hora') return 'datetime-local';
      if (field.typeData === 'correo') return 'email';
      if (field.typeData === 'numerico') return 'number';
      if (field.typeData === 'falso_verdadero') return 'checkbox';

      return 'text';
    };

    const getSelectOptions = (field: CustomFieldDto) => {
      return field.answerOptions.map((option) => ({
        value: option.id,
        label: option.value,
      }));
    };

    const save = async () => {
      const isFormCorrect = await v$.value.$validate();
      if (!isFormCorrect) return;

      const customFieldsToSave = props.surveySections.map((section) => {
        const fields = section.fields.map((field) => {
          const fieldKey = `field_${field.questionId}`;
          const formData = field;

          formData.value = form.customFieldsData[fieldKey] || null;

          if (getInputType(field) === 'select') {
            formData.answerOptionId = formData.value || null;
            formData.value = null;
          } else if (getInputType(field) === 'checkbox') {
            formData.value = formData.value ? 1 : 0;
          }

          return formData;
        });

        return {
          ...section,
          fields,
        };
      });

      emit('update:modelValue', customFieldsToSave);
      emit('save', customFieldsToSave);
    };

    return {
      form,
      v$,
      t,

      loading,

      getSelectOptions,
      getInputType,
      save,
    };
  },
});
</script>

<style scoped>
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .col-md-6 {
    width: 100%;
  }
}
</style>
