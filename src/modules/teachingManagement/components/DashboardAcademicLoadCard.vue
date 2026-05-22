<template>
  <div class="card">
    <!-- Header -->
    <div class="card__header">
      <div class="card__icon card__icon--purple">
        <AppIcon icon="book-open" />
      </div>
      <div>
        <h3 class="card__title">Carga Académica</h3>
        <p class="card__subtitle">{{ data.activeCourses }} cursos activos</p>
      </div>
    </div>

    <!-- Hours Stats -->
    <div class="card__hours">
      <div class="card__hours-col">
        <span class="card__hours-label">Horas Asignadas</span>
        <span class="card__hours-value">{{ data.assignedHours }}h</span>
        <span class="card__hours-sub">por semana</span>
      </div>
      <div class="card__hours-divider"></div>
      <div class="card__hours-col">
        <span class="card__hours-label">Horas Dictadas</span>
        <span class="card__hours-value card__hours-value--purple">{{ data.taughtHours }}h</span>
        <span class="card__hours-sub card__hours-sub--purple">{{ data.taughtPercentage }}% cumplido</span>
      </div>
    </div>

    <!-- Progress -->
    <div class="card__progress-section">
      <div class="card__progress-header">
        <span class="card__progress-label">Progreso Semanal</span>
        <span class="card__progress-pct">{{ data.semesterProgress }}%</span>
      </div>
      <div class="card__progress-bar">
        <div class="card__progress-fill" :style="{ width: data.semesterProgress + '%' }"></div>
      </div>
    </div>

    <!-- Next Class -->
    <div class="card__next-class">
      <div class="card__next-header">
        <span class="card__next-label">PRÓXIMA CLASE</span>
        <span v-if="data.nextClass.isToday" class="card__next-badge">Hoy</span>
      </div>
      <h4 class="card__next-name">{{ data.nextClass.courseCode }} • {{ data.nextClass.courseName }}</h4>
      <div class="card__next-info">
        <div class="card__next-detail">
          <AppIcon icon="clock" />
          <span>{{ data.nextClass.time }}</span>
        </div>
        <div class="card__next-detail">
          <AppIcon icon="map-marker-alt" />
          <span>{{ data.nextClass.location }}</span>
        </div>
      </div>
    </div>

    <!-- Action -->
    <div class="card__action">
      <button class="card__btn card__btn--purple">
        <AppIcon icon="calendar-alt" />
        Ver Horario Completo
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { AcademicLoadDto } from '../dtos/teacherDashboard.dto';

export default defineComponent({
  name: 'DashboardAcademicLoadCard',
  components: { AppIcon },
  props: {
    data: {
      type: Object as PropType<AcademicLoadDto>,
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
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
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
.card__icon--purple {
  background: #f3e8ff;
  color: #9333ea;
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

/* Hours Stats */
.card__hours {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.card__hours-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.card__hours-divider {
  width: 1px;
  height: 50px;
  background: #e2e8f0;
}
.card__hours-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.card__hours-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}
.card__hours-value--purple {
  color: #9333ea;
}
.card__hours-sub {
  font-size: 0.7rem;
  color: #94a3b8;
}
.card__hours-sub--purple {
  color: #9333ea;
  font-weight: 600;
}

/* Progress */
.card__progress-section {
  margin-bottom: 20px;
}
.card__progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.card__progress-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
}
.card__progress-pct {
  font-size: 0.85rem;
  font-weight: 700;
  color: #9333ea;
}
.card__progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}
.card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a855f7, #7c3aed);
  border-radius: 4px;
  transition: width 0.6s ease;
}

/* Next Class */
.card__next-class {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}
.card__next-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.card__next-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #3b82f6;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.card__next-badge {
  background: #3b82f6;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;
}
.card__next-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px;
}
.card__next-info {
  display: flex;
  gap: 16px;
}
.card__next-detail {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: #475569;
}
.card__next-detail svg,
.card__next-detail i {
  color: #3b82f6;
  font-size: 0.85rem;
}

/* Action */
.card__action {
  margin-top: auto;
}
.card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.card__btn--purple {
  background: #f3e8ff;
  color: #7c3aed;
}
.card__btn--purple:hover {
  background: #e9d5ff;
}
</style>
