<template>
  <MultiSelect
    v-model="value"
    :options="options"
    :display="display"
    :option-label="label"
    :option-value="reduce"
    :placeholder="placeholder"
    :filter="filter"
    :disabled="disabled"
    :show-clear="clearable"
    :loading="loading"
    :invalid="isInvalid"
    :selectionLimit="selectionLimit ?? undefined"
    class="w-100"
    v-bind="$attrs"
    @filter="onFilter"
  >
    <!-- Mensajes de estado -->
    <template #emptyfilter>
      <div class="text-gray-500">No se encontraron resultados.</div>
    </template>

    <template #empty>
      <div class="text-gray-500">No hay opciones disponibles.</div>
    </template>
  </MultiSelect>
</template>

<script lang="ts">
import { defineComponent, computed, watch, PropType, inject, ref } from 'vue';
import MultiSelect from 'primevue/multiselect';
import ValidationsErrorsStore from '../../stores/validationsErrors.store';

export default defineComponent({
  name: 'AppMultiSelect',
  components: { MultiSelect },
  props: {
    modelValue: {
      type: [String, Number, Array, Object],
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      default: 'name',
    },
    reduce: {
      type: Function as PropType<(value: any) => any>,
      default: (d: any) => d.id,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: 'Selecciona una opción',
    },
    filter: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    display: {
      type: String as () => 'chip' | 'comma' | undefined,
      default: 'chip',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    selectionLimit: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'search'],
  setup(props, { emit }) {
    const state = inject('state', ValidationsErrorsStore.state);
    const isInvalid = ref(false);
    // Computed para manejar el v-model
    const value = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit('update:modelValue', val);
      },
    });
    watch(
      () => state.errors,
      (errors) => {
        isInvalid.value = Object.keys(errors).length > 0;
      },
      { deep: true }
    );
    const onFilter = (event: { value: string }) => {
      emit('search', event.value);
    };

    return {
      value,
      isInvalid,
      onFilter,
    };
  },
});
</script>

<style scoped>
:deep(.p-multiselect) {
  width: 100%;
  max-width: 100%;
}

:deep(.p-multiselect-label) {
  white-space: normal !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 4px;
  max-height: 100px;
  overflow-y: auto;
}
</style>
