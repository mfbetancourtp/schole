<!-- eslint-disable vue/no-dupe-keys -->
<!-- eslint-disable prettier/prettier -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <AppFormField
    :form-control="formControl"
    :label="inputType !== 'checkbox' ? label : ''"
  >
    <!-- Input de texto -->
    <input
      v-if="
        inputType === 'text' ||
        inputType === 'email' ||
        inputType === 'tel' ||
        inputType === 'datetime-local'
      "
      :id="fieldId"
      :type="inputType"
      class="form-control"
      v-model="modelValue2"
      :placeholder="placeholder"
    />
    <!-- Input numérico -->
    <input
      v-else-if="inputType === 'number'"
      :id="fieldId"
      type="number"
      class="form-control"
      v-model.number="modelValue2"
      :placeholder="placeholder"
      :min="minValue"
      :max="maxValue"
    />

    <!-- Textarea para textos largos -->
    <!-- <textarea
      v-else-if="inputType === 'textarea'"
      :id="fieldId"
      class="form-control"
      v-model="modelValue2"
      :placeholder="placeholder"
      :rows="textareaRows"
    ></textarea> -->
    <AppVoiceInput
      v-else-if="inputType === 'textarea'"
      :id="fieldId"
      textareaClass="form-control"
      v-model="modelValue2"
      :placeholder="placeholder"
      :rows="textareaRows"
    />

    <!-- Select/Dropdown -->
    <!-- <select
      v-else-if="inputType === 'select'"
      :id="fieldId"
      class="form-control"
      v-model="modelValue2"
      :required="isRequired"
    >
      <option value="">{{ t('core.select') }}</option>
      <option
        v-for="option in selectOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select> -->

    <AppAutocomplete
      v-else-if="inputType === 'select'"
      v-model="modelValue2"
      :id="fieldId"
      :input-id="fieldId"
      :options="selectOptions"
      label="label"
      :reduce="(item: any) => item.value"
      class="bg-white"
    />

    <!-- Checkbox -->
    <div v-else-if="inputType === 'checkbox'" class="form-check form-switch">
      <!-- <input
        :id="fieldId"
        type="checkbox"
        class="form-check-input"
        v-model="modelValue2"
      /> -->
      <input
        :id="fieldId"
        type="checkbox"
        class="form-check-input"
        v-model="modelValue2"
        :checked="modelValue2"
      />

      <label :for="fieldId" class="form-check-label">
        {{ checkboxLabel || label }}
      </label>
    </div>

    <!-- Input de fecha -->
    <input
      v-else-if="inputType === 'date'"
      :id="fieldId"
      type="date"
      class="form-control"
      v-model="modelValue2"
    />

    <!-- Input por defecto (text) -->
    <input
      v-else
      :id="fieldId"
      type="text"
      class="form-control"
      v-model="modelValue2"
      :placeholder="placeholder"
    />
  </AppFormField>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AppFormField from './AppFormField.vue';
import AppAutocomplete from './AppAutocomplete.vue';
import AppVoiceInput from '../VoiceInput/AppVoiceInput.vue';

interface SelectOption {
  value: string | number;
  label: string;
}
export default defineComponent({
  name: 'DynamicFormField',
  components: {
    AppAutocomplete,
    AppVoiceInput,
    AppFormField,
  },
  props: {
    fieldId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: '',
    },
    inputType: {
      type: String,
      default: 'text',
      validator: (value: string) => ['text', 'email', 'tel', 'number', 'textarea', 'select', 'checkbox', 'date'].includes(value),
    },
    placeholder: {
      type: String,
      default: '',
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    formControl: {
      type: Object,
      required: false,
    }, // Props específicos para diferentes tipos de input
    minValue: {
      type: Number,
      default: undefined,
    },
    maxValue: {
      type: Number,
      default: undefined,
    },
    textareaRows: {
      type: Number,
      default: 3,
    },
    selectOptions: {
      type: Array as () => SelectOption[],
      default: () => [],
    },
    checkboxLabel: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const modelValue2 = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    return {
      t,

      modelValue2,
    };
  },
});
</script>

<style scoped>
.form-check {
  padding-left: 2.4em !important;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  cursor: pointer;
}

textarea.form-control {
  resize: vertical;
  min-height: calc(1.5em + 0.75rem + 2px);
}
</style>
