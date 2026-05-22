<template>
  <AppFormField v-if="showFieldsStudent" :form-control="v$.form.showFieldsStudent">
    <label>Secciones ({{ t('core.generalTerms.academic.student.plural') }})</label>

    <AppAutocomplete :options="showFields" v-model="selectedFields" multiple></AppAutocomplete>
  </AppFormField>
  <AppFormField v-else-if="showFieldsTutor" :form-control="v$.form.showFieldsTutor">
    <label>Secciones ({{ t('core.generalTerms.academic.tutor.plural') }})</label>

    <AppAutocomplete :options="showFields" v-model="selectedFields" multiple></AppAutocomplete>
  </AppFormField>

  <AppFormField v-else-if="showFieldsCampus" :form-control="v$.form.showFields" label="reports.filters.showFields">
    <AppAutocomplete :options="showFields" v-model="selectedFields" multiple></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'FilterShowFields',
  components: { AppAutocomplete, AppFormField },
  props: {
    v$: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    showFieldsStudent: {
      type: Boolean,
      required: false,
    },
    showFieldsTutor: {
      type: Boolean,
      required: false,
    },
    showFieldsCampus: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const fields = Object.keys(props.options);
    const selectedFields = ref<string[]>([]);

    watch(selectedFields, (value) => {
      buildShowFields();
    });

    const buildShowFields = () => {
      const defaultShowFields: any = {};

      const keys = Object.keys(props.options);

      keys.map((key) => {
        defaultShowFields[key] = selectedFields.value.includes(key);
      });
      // eslint-disable-next-line vue/no-mutating-props
      if (props.showFieldsStudent) props.v$.form.showFieldsStudent.$model = defaultShowFields;
      // eslint-disable-next-line vue/no-mutating-props
      else if (props.showFieldsTutor) props.v$.form.showFieldsTutor.$model = defaultShowFields;
      // eslint-disable-next-line vue/no-mutating-props
      else props.v$.form.showFields.$model = defaultShowFields;
    };

    const showFields = ref(
      fields.map((field) => {
        if (props.options[field]) {
          selectedFields.value.push(field);
        }

        return {
          id: field,
          name: t(`reports.filters.${field}`),
        };
      })
    );

    buildShowFields();

    return {
      t,
      showFields,
      selectedFields,
    };
  },
});
</script>

<style scoped></style>
