<template>
  <o-select select-class="ak-form-control" v-model="computedValue" v-bind="$props" >
    <slot></slot>
  </o-select>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';

export default defineComponent({
  name: 'AppSelect',
  props: {
    /** @model */
    modelValue: {
      type: [String, Number, Boolean, Object, Array],
      default: null,
    },
    /**
     * Vertical size of input, optional
     * @values small, medium, large
     */
    size: String,
    /**
     * Color of the control, optional
     * @values primary, info, success, warning, danger, and any other custom color
     */
    variant: String,

    /** Text when nothing is selected */
    placeholder: String,
    multiple: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, {emit}) {
    const selected = ref(props.modelValue);

    const computedValue = computed({
      get() {
        return selected;
      },
      set(value: any) {
        selected.value = value;
        emit('update:modelValue', value);
      },
    });

    return {
      computedValue,
    };
  },
});
</script>

<style scoped>
:deep(.o-sel-arrow) {
  padding-right: calc(1rem * 2) !important;
  border-radius: calc(var(--border-radius-1) + 0.2rem);
}
.o-sel-arrow:focus{
  border-color: rgba(var(--color-primary-rgb), var(--opacity-color-100));
  outline: 0;
}
.o-ctrl-sel {
  display: inline-flex;
  border-bottom: none;
  padding: var(--padding-select);
}
</style>