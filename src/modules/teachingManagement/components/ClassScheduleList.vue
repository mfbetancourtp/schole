<template>
  <div class="schedule-list">
    <!-- Header -->
    <div class="schedule-list__header">
      <AppIcon icon="calendar-alt" class="schedule-list__header-icon" />
      <h3 class="schedule-list__title">Lista de Clases de la Semana</h3>
    </div>

    <!-- List Items -->
    <div class="schedule-list__items">
      <div v-for="item in classes" :key="item.id" class="schedule-item">
        <!-- Icon -->
        <div class="schedule-item__icon-wrapper" :class="`schedule-item__icon-wrapper--${getStatusColor(item.status)}`">
          <AppIcon :icon="getStatusIcon(item.status)" />
        </div>

        <!-- Content -->
        <div class="schedule-item__content">
          <h4 class="schedule-item__title">{{ item.courseCode }} - {{ item.courseName }}</h4>
          <p class="schedule-item__time">{{ item.day }} • {{ item.startTime }} - {{ item.endTime }}</p>
          <div class="schedule-item__location">
            <AppIcon :icon="getModalityIcon(item.modality)" size="xs" />
            <span>{{ item.location }}</span>
            <span class="schedule-item__divider" v-if="item.modality">•</span>
            <span class="schedule-item__modality" v-if="item.modality">{{ item.modality }}</span>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="schedule-item__status">
          <span class="status-badge" :class="`status-badge--${getStatusColor(item.status)}`">
            {{ item.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ClassScheduleDto } from '../dtos/classSchedule.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'ClassScheduleList',
  components: { AppIcon },
  props: {
    classes: {
      type: Array as PropType<ClassScheduleDto[]>,
      required: true,
    },
  },
  setup() {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Cumplida':
          return 'success';
        case 'En Curso':
          return 'primary'; // Blue
        case 'Pendiente':
          return 'secondary'; // Gray
        default:
          return 'secondary';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'Cumplida':
          return 'check-circle';
        case 'En Curso':
          return 'play-circle';
        case 'Pendiente':
          return 'clock';
        default:
          return 'clock';
      }
    };

    const getModalityIcon = (modality: string) => {
      switch (modality) {
        case 'Presencial':
          return 'map-marker-alt';
        case 'Híbrido':
          return 'desktop';
        case 'Virtual':
          return 'desktop';
        default:
          return 'map-marker-alt';
      }
    };

    return { getStatusColor, getStatusIcon, getModalityIcon };
  },
});
</script>

<style scoped>
.schedule-list {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.schedule-list__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.schedule-list__header-icon {
  color: #3b82f6;
  /* Blue icon like image */
  font-size: 1.2rem;
}

.schedule-list__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.schedule-list__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem;
  background-color: #f8fafc;
  border-radius: 12px;
  transition: background-color 0.2s;
  border: 1px solid transparent;
}

.schedule-item:hover {
  background-color: #eff6ff;
  border-color: #dbeafe;
}

/* Icon Wrapper */
.schedule-item__icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  /* Squirrel/Rounded square */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  color: white;
}

.schedule-item__icon-wrapper--success {
  background-color: #22c55e;
}

.schedule-item__icon-wrapper--primary {
  background-color: #3b82f6;
}

.schedule-item__icon-wrapper--secondary {
  background-color: #94a3b8;
}

/* Content */
.schedule-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.schedule-item__title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.schedule-item__time {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.schedule-item__location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #475569;
}

.schedule-item__divider {
  color: #cbd5e1;
}

.schedule-item__modality {
  background: white;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  font-size: 0.75rem;
}

/* Badge */
.schedule-item__status {
  margin-left: auto;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge--success {
  background-color: #dcfce7;
  color: #15803d;
}

.status-badge--primary {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.status-badge--secondary {
  background-color: #f1f5f9;
  color: #475569;
}
</style>
