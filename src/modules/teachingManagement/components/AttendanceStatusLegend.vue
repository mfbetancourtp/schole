<template>
  <div class="status-legend">
    <div class="status-legend__header">
      <AppIcon icon="info-circle" class="status-legend__header-icon" />
      <h4 class="status-legend__title">Leyenda de Estados</h4>
    </div>

    <div class="status-legend__grid">
      <div class="status-legend__item">
        <span class="status-legend__icon status-legend__icon--success">
          <AppIcon icon="check-circle" />
        </span>
        <div class="status-legend__text">
          <span class="status-legend__label">Puntual</span>
          <span class="status-legend__desc">Asistencia registrada en horario establecido</span>
        </div>
      </div>

      <div class="status-legend__item">
        <span class="status-legend__icon status-legend__icon--danger">
          <AppIcon icon="times-circle" />
        </span>
        <div class="status-legend__text">
          <span class="status-legend__label">Falta</span>
          <span class="status-legend__desc">Sin registro de asistencia</span>
        </div>
      </div>

      <div class="status-legend__item">
        <span class="status-legend__icon status-legend__icon--warning">
          <AppIcon icon="exclamation-circle" />
        </span>
        <div class="status-legend__text">
          <span class="status-legend__label">Tardanza</span>
          <span class="status-legend__desc">Ingreso posterior al horario establecido</span>
        </div>
      </div>

      <div class="status-legend__item">
        <span class="status-legend__icon status-legend__icon--info">
          <AppIcon icon="check-double" />
        </span>
        <div class="status-legend__text">
          <span class="status-legend__label">Justificado</span>
          <span class="status-legend__desc">Inasistencia con justificación aprobada</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'AttendanceStatusLegend',
  components: { AppIcon },
});
</script>

<style scoped>
.status-legend {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 0 2px rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12);
}

.status-legend__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-legend__header-icon {
  color: #637381;
  font-size: 0.9rem;
}

.status-legend__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.status-legend__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.status-legend__item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.status-legend__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 1.15rem;
}

.status-legend__icon--success {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.status-legend__icon--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.status-legend__icon--danger {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.status-legend__icon--info {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.status-legend__text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.status-legend__label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #212b36;
}

.status-legend__desc {
  font-size: 0.73rem;
  color: #919eab;
  line-height: 1.4;
}
</style>
