<template>
  <AppFormModal title="Eliminar Área Académica">
    <template #content>
      <!-- Icono + subtítulo -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="delete-icon-wrap">
          <AppIcon icon="exclamation-triangle" />
        </div>
        <p class="text-muted small mb-0">Esta acción no se puede deshacer</p>
      </div>

      <!-- Área a eliminar -->
      <div class="area-info-box mb-3">
        <p class="small text-muted mb-1">Área a eliminar:</p>
        <div class="fw-bold text-dark" style="font-size: 1rem">
          {{ area.name }}
        </div>
        <div class="text-muted small">Código: {{ area.abbreviation || '—' }}</div>
      </div>

      <!-- Advertencia si tiene asignaturas -->
      <div v-if="area.subjects?.length" class="warning-box mb-3">
        <div class="d-flex align-items-start gap-2">
          <AppIcon icon="exclamation-triangle" class="warning-icon mt-1" />
          <div>
            <p class="fw-bold mb-1 warning-title">Advertencia</p>
            <p class="mb-0 small warning-text">
              Esta área contiene
              <strong>{{ area.subjects.length }} asignaturas</strong>. Al eliminar el área, todas las asignaturas asociadas también serán eliminadas.
            </p>
          </div>
        </div>
      </div>

      <!-- Pregunta -->
      <p class="text-muted small mb-0">¿Estás seguro de que deseas eliminar esta área académica?</p>
    </template>

    <template #actions>
      <AppButton label="Eliminar área" variant="primary" @click="$emit('confirm')"></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { AreaDto } from '../../../shared/dto/area.dto';

export default defineComponent({
  name: 'AreaDeleteModal',
  components: { AppFormModal, AppIcon, AppButton },
  props: {
    area: {
      type: Object as PropType<AreaDto>,
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
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.area-info-box {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
}

.warning-box {
  background: #fff5f5;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  padding: 14px 16px;
}
.warning-icon {
  color: #dc2626;
  font-size: 0.9rem;
}
.warning-title {
  color: #991b1b;
  font-size: 0.88rem;
}
.warning-text {
  color: #7f1d1d;
}
</style>
