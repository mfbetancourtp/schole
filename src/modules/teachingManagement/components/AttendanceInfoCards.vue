<template>
  <div class="info-cards">
    <!-- Validación de Registros -->
    <div class="info-card info-card--validation">
      <div class="info-card__header">
        <span class="info-card__icon info-card__icon--success">
          <AppIcon icon="check-circle" />
        </span>
        <h4 class="info-card__title" style="color: #065f46">Validación de Registros</h4>
      </div>
      <p class="info-card__text" style="color: #047857">
        <strong style="color: #065f46">{{ validatedRecords }} de {{ totalRecords }}</strong>
        registros han sido validados por el sistema.
      </p>
      <div class="info-card__progress">
        <div class="info-card__progress-bar">
          <div class="info-card__progress-fill" :style="{ width: `${validationPercentage}%` }"></div>
        </div>
        <span class="info-card__progress-label">{{ validationPercentage }}%</span>
      </div>
    </div>

    <!-- Consideración para Honorarios -->
    <div class="info-card info-card--honorarios">
      <div class="info-card__header">
        <span class="info-card__icon info-card__icon--primary">
          <AppIcon icon="dollar-sign" />
        </span>
        <h4 class="info-card__title" style="color: #1e40af">Consideración para Honorarios</h4>
      </div>
      <p class="info-card__text" style="color: #1e3a8a">Los registros validados y con asistencia completa son considerados automáticamente para el cálculo de honorarios del período.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'AttendanceInfoCards',
  components: { AppIcon },

  props: {
    validatedRecords: {
      type: Number,
      required: true,
    },
    totalRecords: {
      type: Number,
      required: true,
    },
    validationPercentage: {
      type: Number,
      required: true,
    },
  },
});
</script>

<style scoped>
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid transparent;
}

/* Validación Variant */
.info-card--validation {
  background-color: #f0fdf4;
  /* green-50 */
  border-color: #bbf7d0;
  /* green-200 */
}

/* Honorarios Variant */
.info-card--honorarios {
  background-color: #eff6ff;
  /* blue-50 */
  border-color: #bfdbfe;
  /* blue-200 */
}

.info-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.info-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  /* Increased from 32px */
  height: 42px;
  /* Increased from 32px */
  border-radius: 50%;
  font-size: 1.2rem;
  /* Increased from 0.85rem */
  flex-shrink: 0;
  /* background: transparent; En el diseño parece que solo el icono tiene color o borde, pero usaremos el estilo previo */
}

.info-card__icon--success {
  color: #10b981;
  /* green-500 */
}

.info-card__icon--primary {
  color: #3b82f6;
  /* blue-500 */
}

/* Títulos con color específico en línea style para forzar override */
.info-card__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.info-card__text {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem;
}

.info-card__progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-card__progress-bar {
  flex: 1;
  height: 8px;
  background-color: #dcfce7;
  /* green-100 */
  border-radius: 4px;
  overflow: hidden;
}

.info-card__progress-fill {
  height: 100%;
  border-radius: 4px;
  background-color: #10b981;
  /* green-500 */
  transition: width 0.6s ease;
}

.info-card__progress-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #065f46;
  /* green-800 */
}

.info-card--honorarios .info-card__text {
  margin-bottom: 0;
}
</style>
