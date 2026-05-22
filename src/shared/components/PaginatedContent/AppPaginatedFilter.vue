<template>
  <div class="apf" :style="containerStyle">
    <label v-if="label" :for="inputId" class="apf__label">
      {{ label }}
    </label>
    <div class="apf__control">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Etiqueta visible encima del control de filtro */
  label?: string;
  /**
   * ID del input interno al que apunta el label (para accesibilidad).
   * Si no se provee, el label no tendrá `for`.
   */
  inputId?: string;
  /** Ancho fijo del bloque de filtro (ej: '160px', '200px') */
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  inputId: undefined,
  width: undefined,
});

// ─── Computed ─────────────────────────────────────────────────────────────────

const containerStyle = computed(() => (props.width ? { width: props.width, flexShrink: '0' } : {}));
</script>

<style scoped>
.apf {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0; /* Evita overflow en flex */
}

.apf__label {
  font-size: var(--font-size-2, 0.8rem);
  font-weight: 600;
  color: var(--bs-gray-700, #495057);
  white-space: nowrap;
  margin-bottom: 0;
}

.apf__control {
  display: flex;
  align-items: center;
}
</style>
