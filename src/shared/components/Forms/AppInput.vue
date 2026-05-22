<template>
  <div class="o-form__input_content" :class="{ 'o-form__input_checkbox': type === 'checkbox' }">
    <input :class="`o-form--${type}`" class="o-form-input" :type="type" v-model="value" :placeholder="placeholder" :disabled="disabled" />
    <span v-if="type === 'checkbox'" class="checkmark"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { TypesInputsContants } from '../../constant/typesInputs.contants';

export default defineComponent({
  name: 'AppInput',
  props: {
    type: {
      type: String as PropType<TypesInputsContants>,
      default: 'text',
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const value = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newValue) => {
        value.value = newValue;
      }
    );

    watch(value, (newValue) => {
      emit('update:modelValue', newValue);
    });

    return {
      value,
    };
  },
});
</script>
<style scoped>
.o-form-input {
  display: block;
  width: 100%;
  padding: var(--padding-1);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-3);
  color: var(--color-dark);
  background-color: var(--color-light);
  border-color: var(--color-gray-400);
  border-width: var(--border-1);
  border-radius: var(--border-radius-1);
}
.o-form-input:focus-visible {
  border-color: var(--color-primary);
  outline: 0;
}
.o-form__input_checkbox {
  display: flex;
  position: relative;
}
.o-form__input_checkbox input {
  display: flex;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
  height: 1rem;
  width: 1rem;
}
.checkmark {
  display: flex;
  position: absolute;
  height: 1rem;
  width: 1rem;
  background-color: var(--color-light);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: calc(var(--border-radius-1) - 0.2rem);
  justify-content: center;
}
.o-form__input_checkbox input:checked ~ .checkmark {
  background-color: var(--color-primary);
}
.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}
.o-form__input_checkbox input:checked ~ .checkmark:after {
  display: block;
}
.o-form__input_checkbox .checkmark:after {
  width: 5px;
  height: 10px;
  border: solid var(--color-light);
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
