<template>
  <div class="mgmt-detail">
    <!-- Status Banner -->
    <div class="mgmt-detail__status-banner" :style="{ backgroundColor: statusConfig.bg }">
      <div class="mgmt-detail__status-left">
        <span class="mgmt-detail__status-label">{{ t('Estado actual') }}</span>
        <AppBadge :label="detail.requestStatus.name" :variant="statusConfig.badge" />
      </div>
      <AppIcon icon="clipboard-check" class="mgmt-detail__status-icon" :style="{ color: statusConfig.text }" />
    </div>

    <!-- Applicant Info -->
    <div class="mgmt-detail__card">
      <div class="mgmt-detail__card-header">
        <div class="mgmt-detail__card-icon-wrap" style="background-color: #ebf5ff">
          <AppIcon icon="user" style="color: #2563eb" />
        </div>
        <h5 class="mgmt-detail__card-title">
          {{ t('Información del Solicitante') }}
        </h5>
      </div>
      <div class="mgmt-detail__info-grid">
        <div class="mgmt-detail__info-item">
          <span class="mgmt-detail__info-label">{{ t('NOMBRE') }}</span>
          <span class="mgmt-detail__info-value mgmt-detail__info-value--bold">{{ [detail.applicant?.names, detail.applicant?.lastnames].filter(Boolean).join(' ') || 'N/A' }}</span>
        </div>
        <div class="mgmt-detail__info-item">
          <span class="mgmt-detail__info-label">{{ t('CÓDIGO') }}</span>
          <span class="mgmt-detail__info-value">{{ detail.applicant?.code ?? 'N/A' }}</span>
        </div>
        <div class="mgmt-detail__info-item mgmt-detail__info-item--full">
          <span class="mgmt-detail__info-label">{{ t('CORREO ELECTRÓNICO') }}</span>
          <span class="mgmt-detail__info-value">{{ detail.applicant?.email ?? 'N/A' }}</span>
        </div>
      </div>
    </div>

    <!-- Request Info -->
    <div class="mgmt-detail__card">
      <div class="mgmt-detail__card-header">
        <div class="mgmt-detail__card-icon-wrap" style="background-color: #ebf5ff">
          <AppIcon icon="file-alt" style="color: #2563eb" />
        </div>
        <h5 class="mgmt-detail__card-title">
          {{ t('Información de la Solicitud') }}
        </h5>
      </div>
      <div class="mgmt-detail__info-grid">
        <div class="mgmt-detail__info-item">
          <span class="mgmt-detail__info-label">{{ t('TIPO') }}</span>
          <span class="mgmt-detail__info-value">{{ detail.applicationType.name }}</span>
        </div>
        <div class="mgmt-detail__info-item">
          <span class="mgmt-detail__info-label">{{ t('FECHA') }}</span>
          <span class="mgmt-detail__info-value">{{ formatDate(detail.createdAt) }}</span>
        </div>
        <div class="mgmt-detail__info-item mgmt-detail__info-item--full">
          <span class="mgmt-detail__info-label">{{ t('DESCRIPCIÓN') }}</span>
          <span class="mgmt-detail__info-value">{{ detail.description }}</span>
        </div>
        <div v-if="detail.observations" class="mgmt-detail__info-item mgmt-detail__info-item--full">
          <span class="mgmt-detail__info-label">{{ t('OBSERVACIONES') }}</span>
          <span class="mgmt-detail__info-value">{{ detail.observations }}</span>
        </div>
      </div>
    </div>

    <!-- Attachments -->
    <div class="mgmt-detail__card">
      <div class="mgmt-detail__card-header">
        <div class="mgmt-detail__card-icon-wrap" style="background-color: #fff3e0">
          <AppIcon icon="paperclip" style="color: #e65100" />
        </div>
        <h5 class="mgmt-detail__card-title">{{ t('Documentos Adjuntos') }}</h5>
      </div>

      <div v-if="detail.attachments.length > 0" class="mgmt-detail__attachments">
        <div v-for="file in detail.attachments" :key="file.id" class="mgmt-detail__file-row">
          <div class="mgmt-detail__file-info">
            <div class="mgmt-detail__file-icon-wrap">
              <AppIcon icon="file-alt" class="mgmt-detail__file-icon" />
            </div>
            <div class="mgmt-detail__file-meta">
              <span class="mgmt-detail__file-name">{{ file.applicationDocumentRequired.name }}</span>
              <span class="mgmt-detail__file-code">{{ file.applicationDocumentRequired.code }}</span>
            </div>
          </div>
          <a :href="file.fileUrl" target="_blank" class="mgmt-detail__file-download">
            <AppIcon icon="download" class="mgmt-detail__file-download-icon" />
            {{ t('Descargar') }}
          </a>
        </div>
      </div>

      <div v-else class="mgmt-detail__attachments-empty">
        <AppIcon icon="file-alt" class="mgmt-detail__attachments-empty-icon" />
        <span class="mgmt-detail__attachments-empty-text">{{ t('No hay documentos adjuntos') }}</span>
      </div>
    </div>

    <!-- Process History -->
    <div class="mgmt-detail__card">
      <div class="mgmt-detail__card-header">
        <div class="mgmt-detail__card-icon-wrap" style="background-color: #fff3e0">
          <AppIcon icon="history" style="color: #e65100" />
        </div>
        <h5 class="mgmt-detail__card-title">
          {{ t('Historial del Proceso') }}
        </h5>
      </div>
      <div class="mgmt-detail__timeline">
        <div v-for="(entry, index) in detail.history" :key="entry.id" class="mgmt-detail__timeline-item">
          <div class="mgmt-detail__timeline-dot-col">
            <div class="mgmt-detail__timeline-dot"></div>
            <div v-if="index < detail.history.length - 1" class="mgmt-detail__timeline-line"></div>
          </div>
          <div class="mgmt-detail__timeline-content">
            <div class="mgmt-detail__timeline-top">
              <span class="mgmt-detail__timeline-title">
                {{ entry.requestStatus?.name ?? t('Sin estado') }}
              </span>
              <span class="mgmt-detail__timeline-date">{{ formatDate(entry.createdAt) }}</span>
            </div>
            <span class="mgmt-detail__timeline-desc">{{ entry.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import type { RequestDocumentDetailDto } from '../dtos/requestManagement.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';

interface StatusConfig {
  bg: string;
  text: string;
  badge: VariantsConstant;
}

const statusMap: Record<string, StatusConfig> = {
  Pendiente: { bg: '#FFF3E0', text: '#E65100', badge: 'warning' },
  'En revisión': { bg: '#E3F2FD', text: '#1565C0', badge: 'primary' },
  'Pendiente de pago': { bg: '#FFEBEE', text: '#C62828', badge: 'danger' },
  Aprobado: { bg: '#E8F5E9', text: '#2E7D32', badge: 'success' },
  Finalizado: { bg: '#F4F6F8', text: '#637381', badge: 'dark' },
  Rechazado: { bg: '#FFEBEE', text: '#C62828', badge: 'danger' },
};

const fallbackStatus: StatusConfig = {
  bg: '#F4F6F8',
  text: '#637381',
  badge: 'secondary',
};

export default defineComponent({
  name: 'RequestManagementDetailDrawer',
  components: { AppIcon, AppBadge },
  props: {
    detail: {
      type: Object as PropType<RequestDocumentDetailDto>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const statusConfig = computed<StatusConfig>(() => statusMap[props.detail.requestStatus.name] ?? fallbackStatus);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return { t, statusConfig, formatDate };
  },
});
</script>

<style scoped>
.mgmt-detail {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mgmt-detail__status-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
}

.mgmt-detail__status-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mgmt-detail__status-label {
  font-size: 12px;
  font-weight: 600;
  color: #637381;
}

.mgmt-detail__status-icon {
  font-size: 28px;
}

.mgmt-detail__card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.mgmt-detail__card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.mgmt-detail__card-icon-wrap {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.mgmt-detail__card-title {
  font-size: 15px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.mgmt-detail__info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.mgmt-detail__info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mgmt-detail__info-item--full {
  grid-column: 1 / -1;
}

.mgmt-detail__info-label {
  font-size: 11px;
  font-weight: 600;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.mgmt-detail__info-value {
  font-size: 14px;
  color: #212b36;
}

.mgmt-detail__info-value--bold {
  font-weight: 700;
}

.mgmt-detail__attachments {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mgmt-detail__file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.mgmt-detail__file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mgmt-detail__file-icon-wrap {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  background: #ebf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mgmt-detail__file-icon {
  font-size: 14px;
  color: #2563eb;
}

.mgmt-detail__file-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.mgmt-detail__file-name {
  font-size: 14px;
  color: #212b36;
  font-weight: 500;
}

.mgmt-detail__file-code {
  font-size: 12px;
  color: #919eab;
}

.mgmt-detail__file-download {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  padding: 4px 8px;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.15s;
}

.mgmt-detail__file-download:hover {
  background: rgba(37, 99, 235, 0.08);
}

.mgmt-detail__file-download-icon {
  font-size: 14px;
}

.mgmt-detail__attachments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: #919eab;
}

.mgmt-detail__attachments-empty-icon {
  font-size: 36px;
  opacity: 0.5;
}

.mgmt-detail__attachments-empty-text {
  font-size: 14px;
}

.mgmt-detail__timeline {
  display: flex;
  flex-direction: column;
}

.mgmt-detail__timeline-item {
  display: flex;
  gap: 12px;
}

.mgmt-detail__timeline-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 16px;
}

.mgmt-detail__timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  margin-top: 4px;
  flex-shrink: 0;
}

.mgmt-detail__timeline-line {
  width: 2px;
  flex: 1;
  background: #e2e8f0;
  min-height: 20px;
}

.mgmt-detail__timeline-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 20px;
  flex: 1;
}

.mgmt-detail__timeline-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.mgmt-detail__timeline-title {
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
}

.mgmt-detail__timeline-date {
  font-size: 12px;
  color: #919eab;
  white-space: nowrap;
}

.mgmt-detail__timeline-desc {
  font-size: 13px;
  color: #637381;
  margin-top: 2px;
}
</style>
