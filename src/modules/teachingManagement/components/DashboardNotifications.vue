<template>
  <div class="notif">
    <!-- Header -->
    <div class="notif__header">
      <div class="notif__header-left">
        <div class="notif__icon">
          <AppIcon icon="bell" />
        </div>
        <div>
          <h3 class="notif__title">Notificaciones y Alertas</h3>
          <p class="notif__count">{{ notifications.length }} nuevas</p>
        </div>
      </div>
      <a href="#" class="notif__link">Ver todas</a>
    </div>

    <!-- Notification Items -->
    <div class="notif__list">
      <div v-for="(item, index) in notifications" :key="index" class="notif__item" :class="'notif__item--' + item.type">
        <div class="notif__item-left">
          <AppIcon :icon="item.icon" class="notif__item-icon" />
          <div>
            <h4 class="notif__item-title">{{ item.title }}</h4>
            <p class="notif__item-desc">{{ item.description }}</p>
            <span class="notif__item-time">{{ item.time }}</span>
          </div>
        </div>
        <a href="#" class="notif__item-action">{{ item.actionLabel }} →</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'DashboardNotifications',
  components: { AppIcon },
  setup() {
    const notifications = [
      {
        type: 'warning',
        icon: 'exclamation-circle',
        title: 'Solicitud de corrección pendiente',
        description: 'Tienes 1 solicitud de corrección de asistencia en revisión',
        time: 'Hace 2 horas',
        actionLabel: 'Ver solicitud',
      },
      {
        type: 'info',
        icon: 'bell',
        title: 'Actualización de horarios',
        description: 'Se ha actualizado el horario del curso Base de Datos',
        time: 'Hace 5 horas',
        actionLabel: 'Ver horario',
      },
      {
        type: 'reminder',
        icon: 'clock',
        title: 'Próxima evaluación',
        description: 'Recuerda que tienes evaluaciones programadas para esta semana',
        time: 'Ayer',
        actionLabel: 'Ver calendario',
      },
    ];

    return { notifications };
  },
});
</script>

<style scoped>
.notif {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

/* Header */
.notif__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.notif__header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.notif__icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #dbeafe;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.notif__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.notif__count {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 2px 0 0;
}
.notif__link {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
}
.notif__link:hover {
  text-decoration: underline;
}

/* List */
.notif__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Item */
.notif__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: 14px;
  border-left: 4px solid transparent;
}
.notif__item--warning {
  background: #fefce8;
  border-left-color: #f59e0b;
}
.notif__item--info {
  background: #eff6ff;
  border-left-color: #3b82f6;
}
.notif__item--reminder {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.notif__item-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}
.notif__item-icon {
  font-size: 1rem;
  margin-top: 3px;
}
.notif__item--warning .notif__item-icon {
  color: #f59e0b;
}
.notif__item--info .notif__item-icon {
  color: #3b82f6;
}
.notif__item--reminder .notif__item-icon {
  color: #3b82f6;
}

.notif__item-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}
.notif__item-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 4px;
  line-height: 1.4;
}
.notif__item-time {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 500;
}

.notif__item-action {
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: 16px;
}
.notif__item--warning .notif__item-action {
  color: #ea580c;
}
.notif__item--info .notif__item-action {
  color: #3b82f6;
}
.notif__item--reminder .notif__item-action {
  color: #3b82f6;
}

.notif__item-action:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .notif__item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .notif__item-action {
    margin-left: 0;
  }
}
</style>
