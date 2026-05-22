<template>
  <AppFormField v-if="showOptionsStudent" :form-control="v$.form.optionsStudent" label="Opciones de estudiante">
    <AppAutocomplete :options="computedOptions" v-model="selectedFields" multiple></AppAutocomplete>
  </AppFormField>
  <AppFormField v-else-if="showOptionsTutor" :form-control="v$.form.optionsTutor" label="Opciones del Tutor">
    <AppAutocomplete :options="computedOptions" v-model="selectedFields" multiple></AppAutocomplete>
  </AppFormField>
  <AppFormField v-else :form-control="v$.form.options" label="Opciones">
    <AppAutocomplete :options="computedOptions" v-model="selectedFields" multiple></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'FilterShowOptions',
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
    showOptionsStudent: {
      type: Boolean,
      required: false,
    },
    showOptionsTutor: {
      type: Boolean,
      required: false,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const selectedFields = ref<string[]>([]);

    watch(selectedFields, (value) => {
      buildOptions();
    });

    const buildOptions = () => {
      const defaultOptions: any = {};

      const keys = Object.keys(props.options);

      keys.map((key) => {
        defaultOptions[key] = selectedFields.value.includes(key);
      });
      // eslint-disable-next-line vue/no-mutating-props
      if (props.showOptionsStudent) props.v$.form.optionsStudent.$model = defaultOptions;
      // eslint-disable-next-line vue/no-mutating-props
      else if (props.showOptionsTutor) props.v$.form.optionsTutor.$model = defaultOptions;
      // eslint-disable-next-line vue/no-mutating-props
      else props.v$.form.options.$model = defaultOptions;
    };

    const computedOptions = computed(() => {
      return Object.keys(props.options).map((field) => {
        return {
          id: field,
          name: t(`reports.filters.${field}`),
        };
      });
    });

    buildOptions();

    return {
      t,
      computedOptions,
      selectedFields,
    };
  },
});
</script>

<style scoped></style>
