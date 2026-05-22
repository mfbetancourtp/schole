<template>
  <div class="card">
    <!-- Header -->
    <div class="card__header">
      <div class="card__icon">
        <AppIcon icon="camera" />
      </div>
      <div>
        <h3 class="card__title">Mi Código QR</h3>
        <p class="card__subtitle">
          Estado: <span class="card__status">{{ data.status }}</span>
        </p>
      </div>
    </div>

    <!-- QR Display -->
    <div class="card__qr-wrapper">
      <div class="card__qr-box">
        <div class="card__qr-placeholder">
          <img :src="data.qrImageUrl" alt="Código QR" class="card__qr-img" />
          <div class="card__qr-corner card__qr-corner--tl"></div>
          <div class="card__qr-corner card__qr-corner--tr"></div>
          <div class="card__qr-corner card__qr-corner--bl"></div>
          <div class="card__qr-corner card__qr-corner--br"></div>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="card__info">
      <div class="card__info-row">
        <span class="card__info-label">Código Docente</span>
        <span class="card__info-value">{{ data.code }}</span>
      </div>
      <div class="card__info-divider"></div>
      <div class="card__info-row">
        <span class="card__info-label">Fecha de Expiración</span>
        <span class="card__info-value">{{ data.expirationDate }}</span>
      </div>
      <div class="card__info-badge">
        <span>Días Restantes</span>
        <span class="card__info-days">{{ data.remainingDays }} días</span>
      </div>
    </div>

    <!-- Alert -->
    <div class="card__alert">
      <AppIcon icon="info-circle" class="card__alert-icon" />
      <p class="card__alert-text">Usa este código QR para registrar tu entrada y salida diaria</p>
    </div>

    <!-- Actions -->
    <div class="card__actions">
      <button class="card__btn card__btn--primary">
        <AppIcon icon="eye" />
        Ver QR
      </button>
      <button class="card__btn card__btn--secondary">
        <AppIcon icon="download" />
        Descargar
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { TeacherQRDto } from '../dtos/teacherDashboard.dto';

export default defineComponent({
  name: 'DashboardQRCard',
  components: { AppIcon },
  props: {
    data: {
      type: Object as PropType<TeacherQRDto>,
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
  background: #e0e7ff;
  color: #6366f1;
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
.card__status {
  color: #22c55e;
  font-weight: 700;
}

/* QR */
.card__qr-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.card__qr-box {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
}
.card__qr-placeholder {
  width: 120px;
  height: 120px;
  background: #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.card__qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}
.card__qr-corner {
  position: absolute;
  width: 14px;
  height: 14px;
}
.card__qr-corner--tl {
  top: 4px;
  left: 4px;
  border-top: 2.5px solid #64748b;
  border-left: 2.5px solid #64748b;
  border-radius: 3px 0 0 0;
}
.card__qr-corner--tr {
  top: 4px;
  right: 4px;
  border-top: 2.5px solid #64748b;
  border-right: 2.5px solid #64748b;
  border-radius: 0 3px 0 0;
}
.card__qr-corner--bl {
  bottom: 4px;
  left: 4px;
  border-bottom: 2.5px solid #64748b;
  border-left: 2.5px solid #64748b;
  border-radius: 0 0 0 3px;
}
.card__qr-corner--br {
  bottom: 4px;
  right: 4px;
  border-bottom: 2.5px solid #64748b;
  border-right: 2.5px solid #64748b;
  border-radius: 0 0 3px 0;
}

/* Info */
.card__info {
  margin-bottom: 16px;
}
.card__info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.card__info-label {
  font-size: 0.8rem;
  color: #64748b;
}
.card__info-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
}
.card__info-divider {
  height: 1px;
  background: #f1f5f9;
}
.card__info-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4;
  border-radius: 10px;
  padding: 10px 14px;
  margin-top: 10px;
  font-size: 0.8rem;
  color: #15803d;
  font-weight: 500;
}
.card__info-days {
  font-weight: 700;
  color: #16a34a;
}

/* Alert */
.card__alert {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
}
.card__alert-icon {
  color: #6366f1;
  font-size: 0.85rem;
  margin-top: 1px;
  flex-shrink: 0;
}
.card__alert-text {
  font-size: 0.72rem;
  color: #4338ca;
  margin: 0;
  line-height: 1.5;
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
