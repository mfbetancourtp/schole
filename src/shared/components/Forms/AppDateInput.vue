<template>
  <div class="app-date-input input-group">
    <input ref="inputRef" :id="id" type="date" class="form-control app-date-input__field" :value="modelValue" :disabled="disabled" @input="onInput" />
    <button type="button" class="btn btn-outline-secondary app-date-input__btn" :disabled="disabled" aria-label="Abrir calendario" @click.prevent="openPicker">
      <AppIcon icon="calendar" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, defineExpose } from 'vue';
import AppIcon from '../AppIcon.vue';

export default defineComponent({
  name: 'AppDateInput',
  components: { AppIcon },
  props: {
    modelValue: { type: String, default: '' },
    id: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement | null>(null);

    function onInput(e: Event) {
      const val = (e.target as HTMLInputElement).value;
      emit('update:modelValue', val);
    }

    function openPicker() {
      const elAny: any = inputRef.value as any;
      if (!inputRef.value) return;
      if (typeof elAny.showPicker === 'function') {
        try {
          elAny.showPicker();
          return;
        } catch (e) {
          /* ignore */
        }
      }
      inputRef.value.focus();
    }

    defineExpose({ openPicker });

    watch(
      () => props.modelValue,
      (v) => {
        if (inputRef.value && inputRef.value.value !== (v ?? '')) inputRef.value.value = v ?? '';
      }
    );

    return { inputRef, onInput, openPicker };
  },
});
</script>

<style scoped>
/* Uniformiza la apariencia con el resto de inputs del sistema (Bootstrap
   `form-control` + `input-group`), ocultando el indicador nativo de calendario
   porque lo reemplazamos por nuestro propio botón. */
.app-date-input__field {
  -webkit-appearance: textfield;
  appearance: textfield;
  min-height: 38px;
}

.app-date-input__field::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

.app-date-input__field::-moz-focus-inner {
  border: 0;
}

.app-date-input__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
