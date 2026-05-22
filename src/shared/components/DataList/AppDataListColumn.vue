<template>
  <span style="display: none" aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, watch, useSlots } from 'vue';
import { DATA_LIST_KEY, generateColumnId } from './useDataList';
import type { ColumnPosition } from './useDataList';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Texto de la cabecera de la columna */
  label?: string;
  /**
   * Campo del objeto de datos al que aplica esta columna.
   * Requerido si `sortable` es true.
   */
  field?: string;
  /** Ancho fijo (número = px, string = valor CSS) */
  width?: string | number;
  /** Permite ordenar la tabla por esta columna al hacer click en la cabecera */
  sortable?: boolean;
  /** Alineación del contenido de la celda y la cabecera */
  position?: ColumnPosition;
  /** Fija la columna al lado izquierdo usando sticky */
  sticky?: boolean;
  /** Oculta la columna sin desregistrarla (útil para mostrar/ocultar condicionalmente) */
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  field: undefined,
  width: undefined,
  sortable: false,
  position: undefined,
  sticky: false,
  visible: true,
});

// ─── Slots ────────────────────────────────────────────────────────────────────

const slots = useSlots();

// ─── Inject del contexto padre ────────────────────────────────────────────────

const context = inject(DATA_LIST_KEY);

if (!context) {
  throw new Error('[AppDataListColumn] Debe usarse dentro de un <AppDataList>.');
}

// ─── Registro en el padre ─────────────────────────────────────────────────────

const columnId = generateColumnId();

onMounted(() => {
  context.registerColumn({
    id: columnId,
    label: props.label ?? '',
    field: props.field,
    width: props.width,
    sortable: props.sortable,
    position: props.position,
    sticky: props.sticky,
    visible: props.visible,
    // Render de celda: llama al slot default con el row e index
    renderCell: (row, index) => slots.default?.({ row, index }),
    // Render de cabecera personalizada (slot #header)
    renderHeader: slots.header ? () => slots.header!({}) : undefined,
  });
});

onUnmounted(() => {
  context.unregisterColumn(columnId);
});

// ─── Sincronización de props reactivas ───────────────────────────────────────
// Si el padre cambia `label`, `visible`, etc. después del mount, el padre se actualiza.

watch(
  () => ({
    label: props.label,
    field: props.field,
    width: props.width,
    sortable: props.sortable,
    position: props.position,
    sticky: props.sticky,
    visible: props.visible,
  }),
  (updated) => {
    context.updateColumn(columnId, updated);
  }
);
</script>
