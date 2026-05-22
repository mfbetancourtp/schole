<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <div class="drawer-header">
        <div class="drawer-header__left">
          <div class="drawer-header__icon">
            <AppIcon icon="heart" />
          </div>
          <div>
            <h3 class="drawer-header__title">Detalles de Solicitud</h3>
            <span class="drawer-header__id">ID: #{{ row?.id }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="row" class="detail-body">
        <!-- Status row -->
        <div class="detail-status-row">
          <AppBadge :label="row.statusLabel" :variant="statusVariant(row.status)" />
          <span class="detail-request-date">Fecha de solicitud: {{ row.requestDate }}</span>
        </div>

        <!-- Student info -->
        <div class="detail-section">
          <div class="detail-section__header">
            <AppIcon icon="user" class="detail-section__icon" />
            <h4 class="detail-section__title">Información del Estudiante</h4>
          </div>
          <div class="detail-section__body">
            <div class="detail-grid">
              <div class="detail-field detail-field--full">
                <label class="detail-label">Nombre Completo</label>
                <div class="student-name-row">
                  <div class="student-avatar">{{ row.student.initials }}</div>
                  <span class="detail-value detail-value--strong">{{ row.student.name }}</span>
                </div>
              </div>
              <div class="detail-field">
                <label class="detail-label">Código Estudiantil</label>
                <span class="detail-value detail-value--strong">{{ row.student.code }}</span>
              </div>
              <div class="detail-field">
                <label class="detail-label">Correo Electrónico</label>
                <span class="detail-value">{{ row.student.email }}</span>
              </div>
              <div class="detail-field">
                <label class="detail-label">Programa Académico</label>
                <span class="detail-value detail-value--strong">{{ row.student.program }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Service info -->
        <div class="detail-section">
          <div class="detail-section__header">
            <AppIcon icon="file-alt" class="detail-section__icon" />
            <h4 class="detail-section__title">Información del Servicio</h4>
          </div>
          <div class="detail-section__body">
            <div class="detail-field detail-field--full">
              <label class="detail-label">Servicio Solicitado</label>
              <span class="detail-value detail-value--strong">{{ row.service }}</span>
            </div>
            <div class="detail-grid">
              <div class="detail-field">
                <label class="detail-label">
                  <AppIcon icon="calendar-alt" />
                  Fecha Programada
                </label>
                <span class="detail-value">{{ row.date }}</span>
              </div>
              <div class="detail-field">
                <label class="detail-label">
                  <AppIcon icon="clock" />
                  Hora Programada
                </label>
                <span class="detail-value">{{ row.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reason -->
        <div class="detail-section">
          <div class="detail-section__header">
            <AppIcon icon="comment-alt" class="detail-section__icon" />
            <h4 class="detail-section__title">Motivo de la Consulta</h4>
          </div>
          <div class="detail-section__body">
            <p class="detail-reason">{{ row.reason }}</p>
          </div>
        </div>

        <!-- Requirements -->
        <div class="detail-section">
          <div class="detail-section__header">
            <AppIcon icon="check-circle" class="detail-section__icon detail-section__icon--success" />
            <h4 class="detail-section__title">Requisitos Aceptados</h4>
          </div>
          <div class="detail-section__body">
            <div v-for="req in row.requirements" :key="req" class="requirement-item">
              <AppIcon icon="check-circle" class="requirement-item__icon" />
              <span>{{ req }}</span>
            </div>
          </div>
        </div>

        <!-- Session notes -->
        <div v-if="row.sessionNotes" class="detail-section detail-section--notes">
          <div class="detail-section__header">
            <AppIcon icon="info-circle" class="detail-section__icon detail-section__icon--info" />
            <h4 class="detail-section__title">Notas de la Sesión</h4>
          </div>
          <div class="detail-section__body">
            <p class="detail-notes-text">{{ row.sessionNotes }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <AppButton expanded @click="$emit('update:isVisible', false)">Cerrar</AppButton>
    </template>
  </AppDrawer>
</template>

<script setup lang="ts">
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { RequestTrackingRow, RequestStatus } from '../dtos/requestTracking.dto';

defineProps<{
  isVisible: boolean;
  row: RequestTrackingRow | null;
}>();

defineEmits<{
  (e: 'update:isVisible', value: boolean): void;
}>();

function statusVariant(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return map[status];
}
</script>

<style scoped>
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.drawer-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-header__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.drawer-header__title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.drawer-header__id {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Body */
.detail-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-request-date {
  font-size: 0.82rem;
  color: #637381;
}

/* Sections */
.detail-section {
  background: #fff;
  border: 1px solid #e5e8eb;
  border-radius: 10px;
  overflow: hidden;
}

.detail-section--notes {
  background: #eff8ff;
  border-color: #bee3f8;
}

.detail-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f4;
  background: #fafafa;
}

.detail-section--notes .detail-section__header {
  background: transparent;
  border-bottom-color: #bee3f8;
}

.detail-section__icon {
  color: #637381;
  font-size: 0.9rem;
}

.detail-section__icon--success {
  color: #22c55e;
}

.detail-section__icon--info {
  color: #3b82f6;
}

.detail-section__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #212b36;
  margin: 0;
}

.detail-section__body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Grid layout for fields */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-field--full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.75rem;
  color: #637381;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-value {
  font-size: 0.88rem;
  color: #212b36;
}

.detail-value--strong {
  font-weight: 600;
}

/* Student name row */
.student-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Reason */
.detail-reason {
  font-size: 0.87rem;
  color: #444;
  line-height: 1.6;
  margin: 0;
}

/* Requirements */
.requirement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #e5e8eb;
  border-radius: 8px;
  font-size: 0.87rem;
  color: #212b36;
}

.requirement-item__icon {
  color: #22c55e;
  flex-shrink: 0;
}

/* Notes */
.detail-notes-text {
  font-size: 0.87rem;
  color: #1e40af;
  line-height: 1.6;
  margin: 0;
}
</style>
