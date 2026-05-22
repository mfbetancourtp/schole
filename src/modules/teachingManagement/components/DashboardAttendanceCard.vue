<template>
  <div class="card">
    <!-- Header -->
    <div class="card__header">
      <div class="card__header-left">
        <div class="card__icon card__icon--green">
          <AppIcon icon="check-circle" />
        </div>
        <div>
          <h3 class="card__title">Mi Asistencia</h3>
          <p class="card__subtitle">Resumen del mes</p>
        </div>
      </div>
      <div class="card__trend card__trend--up">
        <AppIcon icon="arrow-up" />
        +{{ data.trend }}%
      </div>
    </div>

    <!-- Punctuality -->
    <div class="card__punctuality">
      <div class="card__punctuality-header">
        <span class="card__punctuality-label">Puntualidad</span>
        <span class="card__punctuality-value">{{ data.punctualityPercentage }}%</span>
      </div>
      <div class="card__progress">
        <div class="card__progress-fill card__progress-fill--green" :style="{ width: data.punctualityPercentage + '%' }"></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="card__stats">
      <div class="card__stat">
        <AppIcon icon="check-circle" class="card__stat-icon card__stat-icon--green" />
        <div class="card__stat-value">{{ data.attendances }}</div>
        <div class="card__stat-label">Asistencias</div>
      </div>
      <div class="card__stat">
        <AppIcon icon="clock" class="card__stat-icon card__stat-icon--orange" />
        <div class="card__stat-value">{{ data.delays }}</div>
        <div class="card__stat-label">Retrasos</div>
      </div>
      <div class="card__stat">
        <AppIcon icon="times-circle" class="card__stat-icon card__stat-icon--red" />
        <div class="card__stat-value">{{ data.absences }}</div>
        <div class="card__stat-label">Inasistencias</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="card__actions">
      <button class="card__btn card__btn--primary">
        <AppIcon icon="eye" />
        Ver Detalle
      </button>
      <button class="card__btn card__btn--secondary">
        <AppIcon icon="file" />
        Solicitar Corrección
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { AttendanceSummaryDto } from '../dtos/teacherDashboard.dto';

export default defineComponent({
  name: 'DashboardAttendanceCard',
  components: { AppIcon },
  props: {
    data: {
      type: Object as PropType<AttendanceSummaryDto>,
      required: true,
    },
  },
});
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.card__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card__icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.card__icon--green {
  background: #dcfce7;
  color: #22c55e;
}
.card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}
.card__subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 2px 0 0;
}
.card__trend {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}
.card__trend--up {
  color: #22c55e;
}

/* Punctuality */
.card__punctuality {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 20px;
}
.card__punctuality-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}
.card__punctuality-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
}
.card__punctuality-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #16a34a;
}
.card__progress {
  height: 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  overflow: hidden;
}
.card__progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
}
.card__progress-fill--green {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

/* Stats */
.card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
.card__stat {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.card__stat-icon {
  font-size: 1.15rem;
}
.card__stat-icon--green {
  color: #22c55e;
}
.card__stat-icon--orange {
  color: #f59e0b;
}
.card__stat-icon--red {
  color: #ef4444;
}
.card__stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}
.card__stat-label {
  font-size: 0.6rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Actions */
.card__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: auto;
}
.card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.card__btn--primary {
  background: #eef2ff;
  color: #4f46e5;
}
.card__btn--primary:hover {
  background: #e0e7ff;
}
.card__btn--secondary {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.card__btn--secondary:hover {
  background: #f8fafc;
}
</style>
