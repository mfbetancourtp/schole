<template>
  <AppBaseList>
    <template #actions>
      <AppButton v-if="unreadCount > 0" variant="primary" icon="check-double" label="Marcar todas como leídas" outlined @click="handleMarkAllAsRead" />
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <!-- Stats Cards -->
        <div class="container-cards mb-3">
          <AppCardDashboard size="small">
            <template #title><span>Total</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ notifications.length }}</h3>
                <AppIcon icon="bell" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard size="small">
            <template #title><span>No leídas</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ unreadCount }}</h3>
                <AppIcon icon="envelope" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard size="small">
            <template #title><span>Advertencias</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ warningCount }}</h3>
                <AppIcon icon="exclamation-triangle" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard size="small">
            <template #title><span>Información</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ infoCount }}</h3>
                <AppIcon icon="info-circle" />
              </div>
            </template>
          </AppCardDashboard>
        </div>

        <!-- Filters -->
        <div class="filters-bar mb-3">
          <button v-for="f in filters" :key="f.key" :class="['filter-chip', { 'filter-chip--active': activeFilter === f.key }]" @click="activeFilter = f.key">
            {{ f.label }}
            <span v-if="f.count > 0" class="filter-count">{{ f.count }}</span>
          </button>
        </div>

        <!-- Notification List -->
        <div v-if="filteredNotifications.length > 0" class="notification-list">
          <div
            v-for="notification in filteredNotifications"
            :key="notification._id"
            :class="['notification-card', { 'notification-card--unread': !notification.isRead }]"
            @click="handleMarkAsRead(notification)"
          >
            <!-- Icon -->
            <div :class="['notification-icon', typeConfig(notification.type).iconClass]">
              <AppIcon :icon="typeConfig(notification.type).icon" />
            </div>

            <!-- Body -->
            <div class="notification-body">
              <div class="notification-top-row">
                <span :class="['type-badge', typeConfig(notification.type).badgeClass]">
                  {{ typeConfig(notification.type).label }}
                </span>
                <span :class="['priority-dot', priorityConfig(notification.priority).dotClass]"></span>
                <span class="priority-label">{{ priorityConfig(notification.priority).label }}</span>
                <span v-if="!notification.isRead" class="unread-dot"></span>
              </div>
              <h6 class="notification-title">{{ notification.title }}</h6>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ formatRelativeDate(notification.createdAt) }}</span>
            </div>

            <!-- Time right -->
            <span class="notification-time-right">{{ formatRelativeDate(notification.createdAt) }}</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <AppIcon icon="bell-slash" class="empty-icon" />
          <p class="empty-title">Sin notificaciones</p>
          <p class="empty-text">
            {{ activeFilter === 'todas' ? 'No hay notificaciones por el momento.' : 'No hay notificaciones que coincidan con este filtro.' }}
          </p>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetAllNotificationsService } from '../services/getAllNotifications.service';
import { MarkNotificationAsReadService } from '../services/markNotificationAsRead.service';
import type { NotificationDto, NotificationType, NotificationPriority } from '../dtos';

type FilterType = 'todas' | 'no-leidas' | 'warning' | 'info';

const headerStore = useHeaderStore();
const getAllNotificationsService = new GetAllNotificationsService();
const markNotificationAsReadService = new MarkNotificationAsReadService();

const notifications = ref<NotificationDto[]>([]);
const isLoading = ref(true);
const activeFilter = ref<FilterType>('todas');

// Stats
const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);
const warningCount = computed(() => notifications.value.filter((n) => n.type === 'warning').length);
const infoCount = computed(() => notifications.value.filter((n) => n.type === 'info').length);

// Filters
const filters = computed(() => [
  {
    key: 'todas' as FilterType,
    label: 'Todas',
    count: notifications.value.length,
  },
  {
    key: 'no-leidas' as FilterType,
    label: 'No leídas',
    count: unreadCount.value,
  },
  {
    key: 'warning' as FilterType,
    label: 'Advertencias',
    count: warningCount.value,
  },
  { key: 'info' as FilterType, label: 'Información', count: infoCount.value },
]);

const filteredNotifications = computed(() => {
  switch (activeFilter.value) {
    case 'no-leidas':
      return notifications.value.filter((n) => !n.isRead);
    case 'warning':
      return notifications.value.filter((n) => n.type === 'warning');
    case 'info':
      return notifications.value.filter((n) => n.type === 'info');
    default:
      return notifications.value;
  }
});

// Config maps
const TYPE_MAP: Record<NotificationType, { label: string; icon: string; badgeClass: string; iconClass: string }> = {
  info: {
    label: 'Información',
    icon: 'info-circle',
    badgeClass: 'badge-info',
    iconClass: 'icon-info',
  },
  success: {
    label: 'Éxito',
    icon: 'check-circle',
    badgeClass: 'badge-success',
    iconClass: 'icon-success',
  },
  warning: {
    label: 'Advertencia',
    icon: 'exclamation-triangle',
    badgeClass: 'badge-warning',
    iconClass: 'icon-warning',
  },
  error: {
    label: 'Error',
    icon: 'times-circle',
    badgeClass: 'badge-error',
    iconClass: 'icon-error',
  },
};

const PRIORITY_MAP: Record<NotificationPriority, { label: string; dotClass: string }> = {
  high: { label: 'Alta', dotClass: 'dot-high' },
  medium: { label: 'Media', dotClass: 'dot-medium' },
  low: { label: 'Baja', dotClass: 'dot-low' },
};

function typeConfig(type: NotificationType) {
  return TYPE_MAP[type] || TYPE_MAP.info;
}

function priorityConfig(priority: NotificationPriority) {
  return PRIORITY_MAP[priority] || PRIORITY_MAP.low;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Actions
async function loadNotifications() {
  try {
    isLoading.value = true;
    notifications.value = await getAllNotificationsService.run();
  } catch (err) {
    console.error('Error loading notifications:', err);
  } finally {
    isLoading.value = false;
  }
}

async function handleMarkAsRead(notification: NotificationDto) {
  if (notification.isRead) return;
  try {
    await markNotificationAsReadService.run(notification._id);
    notification.isRead = true;
  } catch (err) {
    console.error('Error marking as read:', err);
  }
}

async function handleMarkAllAsRead() {
  try {
    const unread = notifications.value.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markNotificationAsReadService.run(n._id)));
    unread.forEach((n) => (n.isRead = true));
  } catch (err) {
    console.error('Error marking all as read:', err);
  }
}

onMounted(() => {
  headerStore.module = { name: 'Smart Classroom', url: '' };
  headerStore.moduleItem = { name: 'Notificaciones', url: '' };
  headerStore.moduleSubItem = { name: '', url: '' };
  loadNotifications();
});
</script>

<style scoped>
.container-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.card-graph {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Filters */
.filters-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  border-color: var(--color-primary, #f43f5e);
  color: var(--color-primary, #f43f5e);
}

.filter-chip--active {
  background: var(--color-primary, #f43f5e);
  border-color: var(--color-primary, #f43f5e);
  color: #fff;
}

.filter-chip--active .filter-count {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.filter-count {
  font-size: 11px;
  font-weight: 600;
  background: #f0f0f0;
  color: #888;
  border-radius: 10px;
  padding: 0 6px;
  min-width: 18px;
  text-align: center;
  line-height: 18px;
}

/* Notification List */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.notification-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notification-card--unread {
  background: #fafbff;
  border-left: 3px solid var(--color-primary, #f43f5e);
}

/* Icon circle */
.notification-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.icon-info {
  background: #dbeafe;
  color: #2563eb;
}
.icon-success {
  background: #dcfce7;
  color: #16a34a;
}
.icon-warning {
  background: #fef3c7;
  color: #d97706;
}
.icon-error {
  background: #fee2e2;
  color: #dc2626;
}

/* Body */
.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-top-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}
.badge-success {
  background: #dcfce7;
  color: #166534;
}
.badge-warning {
  background: #fef3c7;
  color: #92400e;
}
.badge-error {
  background: #fee2e2;
  color: #991b1b;
}

/* Priority */
.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-high {
  background: #dc2626;
}
.dot-medium {
  background: #d97706;
}
.dot-low {
  background: #16a34a;
}

.priority-label {
  font-size: 11px;
  color: #888;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary, #f43f5e);
  margin-left: auto;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #1e293b;
}

.notification-message {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 6px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 11px;
  color: #94a3b8;
}

.notification-time-right {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 4px;
}

.empty-text {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-time-right {
    display: none;
  }

  .notification-card {
    padding: 12px;
    gap: 10px;
  }

  .notification-icon {
    width: 32px;
    height: 32px;
    min-width: 32px;
    font-size: 14px;
  }
}
</style>
