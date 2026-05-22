<template>
  <AppFormModal title="Eliminar Asignatura">
    <template #content>
      <!-- Icono + subtítulo -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="delete-icon-wrap">
          <AppIcon icon="exclamation-triangle" />
        </div>
        <p class="text-muted small mb-0">Esta acción no se puede deshacer</p>
      </div>

      <!-- Asignatura a eliminar -->
      <div class="subject-info-box mb-3">
        <p class="small text-muted mb-2">Asignatura:</p>
        <div class="fw-bold text-dark" style="font-size: 1rem">
          {{ subject.name }}
        </div>
        <div class="text-muted small">Código: {{ subject.code || subject.abbreviation || '—' }}</div>

        <!-- Badges de datos -->
        <div class="d-flex flex-wrap gap-2 mt-2">
          <span class="badge-detail" v-if="subject.credits !== null && subject.credits !== undefined"> {{ subject.credits }} créditos </span>
          <span class="badge-detail" v-if="subject.totalHours"> {{ subject.totalHours }}h </span>
          <span class="badge-detail" v-if="subject.subjectType">
            {{ subject.subjectType }}
          </span>
        </div>
      </div>

      <!-- Pregunta de confirmación -->
      <div class="confirm-box">
        <p class="small mb-0">
          ¿Estás seguro de que deseas eliminar la asignatura
          <strong>{{ subject.name }}</strong>
          <span v-if="subject.abbreviation"> ({{ subject.abbreviation }})</span>?
        </p>
      </div>
    </template>

    <template #actions>
      <AppButton label="Eliminar asignatura" variant="primary" @click="$emit('confirm')"></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { SubjectDto } from '../../../shared/dto/subject.dto';

export default defineComponent({
  name: 'SubjectDeleteModal',
  components: { AppFormModal, AppIcon, AppButton },
  props: {
    subject: {
      type: Object as PropType<SubjectDto>,
      required: true,
    },
  },
  emits: ['confirm'],
});
</script>

<style scoped>
.delete-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff7ed;
  color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.subject-info-box {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
}

.badge-detail {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 500;
}

.confirm-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.85rem;
  color: #92400e;
}
</style>
