<template>
  <div class="form-check" :class="{ 'form-switch': variant === 'switch' }">
    <input
      :id="resolvedId"
      class="form-check-input"
      type="checkbox"
      :role="variant === 'switch' ? 'switch' : undefined"
      :checked="isChecked"
      :disabled="disabled"
      @change="onChange(($event.target as HTMLInputElement).checked)"
    />
    <label v-if="label || $slots.default" :for="resolvedId" class="form-check-label">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';

let uidCounter = 0;

type CheckboxValue = boolean | 0 | 1;

/**
 * AppCheckbox — wrapper unificado sobre la primitiva `<input type="checkbox">`
 * con clases Bootstrap del design system de Akademia.
 *
 * Soporta dos formas de `v-model`:
 *  - `boolean` (por defecto).
 *  - `0 | 1` cuando la API del backend almacena banderas como enteros
 *    (ej. `activo`, `obligatoria`). Se activa pasando `:integer="true"`.
 *
 * Usa `variant="switch"` para renderizarlo como Bootstrap switch.
 */
export default defineComponent({
  name: 'AppCheckbox',

  props: {
    modelValue: {
      type: [Boolean, Number] as PropType<CheckboxValue>,
      default: false,
    },
    label: { type: String, default: '' },
    id: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    /** Cuando es true, emite 0/1 en lugar de boolean. */
    integer: { type: Boolean, default: false },
    /** 'default' = checkbox estándar; 'switch' = interruptor tipo toggle. */
    variant: {
      type: String as PropType<'default' | 'switch'>,
      default: 'default',
    },
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    const resolvedId = computed(() => props.id || `app-checkbox-${++uidCounter}`);

    const isChecked = computed(() => (props.integer ? Number(props.modelValue) === 1 : Boolean(props.modelValue)));

    const onChange = (checked: boolean): void => {
      const next: CheckboxValue = props.integer ? (checked ? 1 : 0) : checked;
      emit('update:modelValue', next);
      emit('change', next);
    };

    return { resolvedId, isChecked, onChange };
  },
});
</script>
