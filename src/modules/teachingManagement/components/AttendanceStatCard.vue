<template>
  <div class="stat-card">
    <div class="stat-card__top">
      <!-- Icono Izquierda -->
      <div class="stat-card__icon" :style="{ backgroundColor: iconBg, color: iconColor }">
        <AppIcon :icon="icon" />
      </div>

      <!-- Valor Derecha (Número + Sufijo) -->
      <div class="stat-card__data">
        <span class="stat-card__number">{{ value }}</span>
        <span v-if="suffix" class="stat-card__suffix">{{ suffix }}</span>
      </div>
    </div>

    <!-- Título -->
    <div class="stat-card__label">{{ label }}</div>

    <!-- Footer: Barra de progreso o Texto auxiliar -->
    <div class="stat-card__footer">
      <!-- Barra de progreso -->
      <div v-if="showProgress" class="stat-card__progress">
        <div class="stat-card__progress-bar">
          <div class="stat-card__progress-fill" :style="{ width: `${percentage}%`, backgroundColor: progressColor }"></div>
        </div>
        <span class="stat-card__percentage" :style="{ color: progressColor }">{{ percentage }}%</span>
      </div>

      <!-- Texto auxiliar -->
      <div v-else-if="helperText" class="stat-card__helper" :style="{ color: helperColor }">
        {{ helperText }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'AttendanceStatCard',
  components: { AppIcon },

  props: {
    icon: {
      type: String,
      required: true,
    },
    iconBg: {
      type: String,
      default: 'rgba(34,197,94,0.12)',
    },
    iconColor: {
      type: String,
      default: '#22c55e',
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    suffix: {
      type: String,
      default: '',
    },
    showProgress: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    progressColor: {
      type: String,
      default: '#22c55e',
    },
    helperText: {
      type: String,
      default: '',
    },
    helperColor: {
      type: String,
      default: '#637381',
    },
  },
});
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 0 2px rgba(145, 158, 171, 0.2), 0 4px 12px -2px rgba(145, 158, 171, 0.1);
  flex: 1;
  min-width: 200px;
  height: 100%;
  justify-content: space-between;
}

/* Parte superior: Icono vs Data */
.stat-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  /* Redondo como en la imagen */
  font-size: 1.25rem;
}

.stat-card__data {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.stat-card__number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #212b36;
  line-height: 1;
}

.stat-card__suffix {
  font-size: 0.75rem;
  font-weight: 500;
  color: #919eab;
  margin-top: 2px;
}

/* Etiqueta */
.stat-card__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #637381;
  margin-bottom: 0.75rem;
}

/* Footer (Progress o Helper) */
.stat-card__footer {
  margin-top: auto;
}

/* Progress Bar */
.stat-card__progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-card__progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.stat-card__progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.stat-card__percentage {
  font-size: 0.8rem;
  font-weight: 700;
}

/* Helper Text */
.stat-card__helper {
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.stat-card__helper:hover {
  text-decoration: underline;
  opacity: 0.8;
}
</style>
