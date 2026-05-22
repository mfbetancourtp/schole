<template>
  <div class="request-detail">
    <!-- Status Banner -->
    <div class="request-detail__status-banner" :style="{ backgroundColor: statusColor.bg }">
      <div class="request-detail__status-left">
        <span class="request-detail__status-label">{{ t('Estado actual') }}</span>
        <AppBadge :label="detail.statusLabel" :variant="statusBadgeVariant" />
      </div>
      <AppIcon :icon="statusColor.icon" class="request-detail__status-icon" :style="{ color: statusColor.text }" />
    </div>

    <!-- Document Info -->
    <div class="request-detail__card">
      <h5 class="request-detail__card-title">
        {{ t('Información del Documento') }}
      </h5>
      <div class="request-detail__doc-row">
        <div class="request-detail__doc-icon" :style="{ backgroundColor: detail.documentIconBgColor }">
          <AppIcon :icon="detail.documentIcon" :style="{ color: detail.documentIconColor }" />
        </div>
        <div class="request-detail__doc-info">
          <span class="request-detail__doc-name">{{ t(detail.documentType) }}</span>
          <span class="request-detail__doc-desc">{{ t(detail.documentDescription) }}</span>
        </div>
      </div>
      <div class="request-detail__doc-meta">
        <div class="request-detail__meta-item">
          <span class="request-detail__meta-label">{{ t('Costo') }}</span>
          <span class="request-detail__meta-value">{{ detail.documentCost }}</span>
        </div>
        <div class="request-detail__meta-item">
          <span class="request-detail__meta-label">{{ t('Tiempo estimado') }}</span>
          <span class="request-detail__meta-value">{{ detail.documentTime }}</span>
        </div>
      </div>
    </div>

    <!-- Request Info -->
    <div class="request-detail__card">
      <h5 class="request-detail__card-title">
        {{ t('Información de la Solicitud') }}
      </h5>
      <div class="request-detail__info-grid">
        <div class="request-detail__info-item">
          <span class="request-detail__info-label">{{ t('ID Solicitud') }}</span>
          <span class="request-detail__info-value">{{ detail.id }}</span>
        </div>
        <div class="request-detail__info-item">
          <span class="request-detail__info-label">{{ t('Fecha de solicitud') }}</span>
          <span class="request-detail__info-value">{{ detail.requestDate }}</span>
        </div>
        <div class="request-detail__info-item request-detail__info-item--full">
          <span class="request-detail__info-label">{{ t('Observaciones') }}</span>
          <span class="request-detail__info-value">{{ t(detail.observations) }}</span>
        </div>
      </div>
    </div>

    <!-- Process Tracking -->
    <div class="request-detail__card">
      <h5 class="request-detail__card-title">
        {{ t('Seguimiento del Proceso') }}
      </h5>
      <div class="request-detail__timeline">
        <div v-for="(entry, index) in detail.tracking" :key="entry.id" class="request-detail__timeline-item">
          <div class="request-detail__timeline-dot-col">
            <div class="request-detail__timeline-dot" :class="{ 'request-detail__timeline-dot--active': index === 0 }"></div>
            <div v-if="index < detail.tracking.length - 1" class="request-detail__timeline-line"></div>
          </div>
          <div class="request-detail__timeline-content">
            <span class="request-detail__timeline-title">{{ t(entry.title) }}</span>
            <span class="request-detail__timeline-actor">{{ entry.actor }}</span>
            <span class="request-detail__timeline-date">{{ entry.date }}</span>
            <span class="request-detail__timeline-desc">{{ t(entry.description) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Help -->
    <div class="request-detail__help">
      <AppIcon icon="question-circle" class="request-detail__help-icon" />
      <div class="request-detail__help-text">
        <strong>{{ t('¿Necesitas ayuda?') }}</strong>
        <span>{{ t('Contacta a soporte académico para cualquier consulta sobre tu solicitud.') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import type { RequestDetail, DocumentRequestStatus } from '../dtos/documentRequest.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';

const statusConfig: Record<DocumentRequestStatus, { bg: string; text: string; icon: string; badge: VariantsConstant }> = {
  finalized: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    icon: 'check-circle',
    badge: 'success',
  },
  approved: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    icon: 'check-circle',
    badge: 'success',
  },
  in_review: {
    bg: '#E3F2FD',
    text: '#1565C0',
    icon: 'clock',
    badge: 'primary',
  },
  pending_payment: {
    bg: '#FFF3E0',
    text: '#E65100',
    icon: 'exclamation-circle',
    badge: 'warning',
  },
  rejected: {
    bg: '#FFEBEE',
    text: '#C62828',
    icon: 'times-circle',
    badge: 'danger',
  },
};

export default defineComponent({
  name: 'RequestDetailDrawer',
  components: { AppIcon, AppBadge },
  props: {
    detail: {
      type: Object as PropType<RequestDetail>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const statusColor = computed(() => statusConfig[props.detail.status] || statusConfig.in_review);
    const statusBadgeVariant = computed(() => statusColor.value.badge);

    return { t, statusColor, statusBadgeVariant };
  },
});
</script>

<style scoped>
.request-detail {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Status Banner */
.request-detail__status-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
}

.request-detail__status-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.request-detail__status-label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.request-detail__status-icon {
  font-size: 24px;
}

/* Cards */
.request-detail__card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.request-detail__card-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
  margin: 0 0 16px 0;
}

/* Document Row */
.request-detail__doc-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.request-detail__doc-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.request-detail__doc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.request-detail__doc-name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.request-detail__doc-desc {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.request-detail__doc-meta {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #f4f6f8;
}

.request-detail__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.request-detail__meta-label {
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.request-detail__meta-value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

/* Info Grid */
.request-detail__info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.request-detail__info-item--full {
  grid-column: 1 / -1;
}

.request-detail__info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.request-detail__info-label {
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.request-detail__info-value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
}

/* Timeline */
.request-detail__timeline {
  display: flex;
  flex-direction: column;
}

.request-detail__timeline-item {
  display: flex;
  gap: 12px;
}

.request-detail__timeline-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 16px;
}

.request-detail__timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c4cdd5;
  margin-top: 4px;
  flex-shrink: 0;
}

.request-detail__timeline-dot--active {
  background: var(--color-primary);
}

.request-detail__timeline-line {
  width: 2px;
  flex: 1;
  background: #e2e8f0;
  min-height: 24px;
}

.request-detail__timeline-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 20px;
}

.request-detail__timeline-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.request-detail__timeline-actor {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.request-detail__timeline-date {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.request-detail__timeline-desc {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin-top: 4px;
}

/* Help */
.request-detail__help {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.request-detail__help-icon {
  color: #919eab;
  font-size: 18px;
  margin-top: 2px;
}

.request-detail__help-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.request-detail__help-text strong {
  color: #212b36;
}
</style>
