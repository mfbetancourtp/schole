<template>
  <div class="subject-card bg-white border rounded-3 p-3 d-flex flex-column" style="width: 260px; min-height: 140px; position: relative">
    <!-- Acciones al pasar el ratón para modo editable -->
    <div v-if="isEditable" class="hover-actions position-absolute top-0 end-0 mt-2 me-2 d-none gap-2">
      <AppIcon icon="trash" class="text-danger cursor-pointer" style="font-size: 14px" @click="$emit('delete', subject)" />
    </div>

    <!-- Cabecera -->
    <div class="text-muted mb-1" style="font-size: 10px">
      {{ subject.code }}
    </div>
    <div class="fw-bold text-dark mb-3" style="font-size: 14px; line-height: 1.3; padding-right: 30px">
      {{ subject.name }}
    </div>

    <!-- Indicador de tipo -->
    <div class="d-flex align-items-center gap-2 mb-3 mt-auto">
      <div class="d-flex align-items-center gap-1" :class="subject.type === 'Obligatoria' ? 'text-primary' : 'text-fuchsia'">
        <div class="rounded-circle" :class="subject.type === 'Obligatoria' ? 'bg-primary' : 'bg-fuchsia'" style="width: 4px; height: 4px"></div>
        <span style="font-size: 11px">{{ subject.type }}</span>
      </div>
    </div>

    <!-- Métricas -->
    <div class="d-flex flex-wrap gap-3 align-items-center text-muted" style="font-size: 12px">
      <div class="d-flex align-items-center gap-1 text-success">
        <AppIcon icon="graduation-cap" style="font-size: 11px" />
        <span class="text-muted">{{ subject.credits }} créditos</span>
      </div>
      <div class="d-flex align-items-center gap-1 text-warning">
        <AppIcon icon="clock" style="font-size: 11px" />
        <span class="text-muted">{{ subject.hours }} hrs</span>
      </div>
    </div>

    <div v-if="showPrerequisites" class="mt-3 pt-3 border-top">
      <div class="d-flex align-items-center justify-content-between mb-1">
        <div class="text-muted" style="font-size: 10px">Prerrequisitos</div>
        <AppIcon v-if="isEditable" icon="pen" class="text-muted cursor-pointer" style="font-size: 11px" @click="$emit('edit', subject)" />
      </div>
      <div v-if="subject.prerequisites?.length" class="d-flex flex-wrap gap-1">
        <AppBadge v-for="prereq in subject.prerequisites" :key="prereq" :label="prereq" style="font-size: 10px; font-weight: normal; padding: 2px 6px" />
      </div>
      <div v-else class="text-muted" style="font-size: 10px">Sin prerrequisitos</div>
    </div>

    <!-- Etiquetas para modo lectura (si hay) -->
    <div v-if="!isEditable && subject.tags && subject.tags.length > 0" class="mt-3 d-flex flex-wrap gap-2">
      <span
        v-for="tag in subject.tags"
        :key="tag.text"
        class="badge bg-light text-primary border px-2 py-1 rounded"
        :class="'text-' + tag.color + ' border-' + tag.color + '-light bg-' + tag.color + '-light'"
        style="font-size: 10px; font-weight: 500"
      >
        <AppIcon :icon="tag.icon" v-if="tag.icon" class="me-1" style="font-size: 9px" />
        {{ tag.text }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';

export interface Tag {
  text: string;
  icon: string;
  color: string;
}

export interface SubjectItem {
  code: string;
  name: string;
  type: string;
  credits: number;
  hours: number;
  tags?: Tag[];
  prerequisites?: string[];
}

export default defineComponent({
  name: 'SubjectCard',
  components: {
    AppIcon,
    AppBadge,
  },
  props: {
    subject: {
      type: Object as PropType<SubjectItem>,
      required: true,
    },
    isEditable: {
      type: Boolean,
      default: false,
    },
    showPrerequisites: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['edit', 'delete'],
});
</script>

<style scoped>
/* Color para el indicador "Electiva" */
.bg-fuchsia {
  background-color: #d946ef !important;
}
.text-fuchsia {
  color: #d946ef !important;
}

/* Estilos de etiquetas */
.border-primary-light {
  border-color: #bfdbfe !important;
}
.bg-primary-light {
  background-color: #eff6ff !important;
}
.border-success-light {
  border-color: #bbf7d0 !important;
}
.bg-success-light {
  background-color: #f0fdf4 !important;
}

.subject-card {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.subject-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1 !important;
}

/* Lógica de acciones hover */
.subject-card:hover .hover-actions {
  display: flex !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
