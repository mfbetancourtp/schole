<template>
  <div class="stats-grid">
    <div v-for="stat in stats" :key="stat.label" class="stats-card">
      <div class="stats-card__icon" :class="`stats-card__icon--${stat.color}`">
        <AppIcon :icon="stat.icon" size="lg" />
      </div>
      <div class="stats-card__content">
        <h4 class="stats-card__value">{{ stat.value }}</h4>
        <p class="stats-card__label">{{ stat.label }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { ScheduleStatsDto } from '../dtos/classSchedule.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'ScheduleStats',
  components: { AppIcon },
  props: {
    data: {
      type: Object as PropType<ScheduleStatsDto>,
      required: true,
    },
  },
  setup(props) {
    const stats = computed(() => [
      {
        label: 'Clases Cumplidas',
        value: props.data.completed,
        icon: 'check-circle',
        color: 'success',
      },
      {
        label: 'En Curso',
        value: props.data.inProgress,
        icon: 'play-circle',
        color: 'primary',
      },
      {
        label: 'Pendientes',
        value: props.data.pending,
        icon: 'clock',
        color: 'secondary', // Gray
      },
      {
        label: 'Horas Semanales',
        value: `${props.data.weeklyHours}h`,
        icon: 'chart-pie', // Or clock
        color: 'purple',
      },
    ]);

    return { stats };
  },
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.stats-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.2rem;
}

.stats-card__icon--success {
  background: #dcfce7;
  color: #16a34a;
}

.stats-card__icon--primary {
  background: #dbeafe;
  color: #2563eb;
}

.stats-card__icon--secondary {
  background: #f1f5f9;
  color: #64748b;
}

/* Gray */
.stats-card__icon--purple {
  background: #f3e8ff;
  color: #9333ea;
}

.stats-card__content {
  display: flex;
  flex-direction: column;
}

.stats-card__value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: #1e293b;
}

.stats-card__label {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}
</style>
