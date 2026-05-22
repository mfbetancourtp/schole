<template>
  <div class="request-detail" v-if="detail">
    <div class="request-detail__status-banner" :style="{ backgroundColor: statusColor.bg }">
      <div class="request-detail__status-left">
        <span class="request-detail__status-label">{{ t('Estado actual') }}</span>
        <AppBadge :label="detail.requestStatus?.name || '—'" :variant="statusBadgeVariant" />
      </div>
      <AppIcon :icon="statusColor.icon" class="request-detail__status-icon" :style="{ color: statusColor.text }" />
    </div>

    <div class="request-detail__card">
      <h5 class="request-detail__card-title">
        {{ t('Información del Documento') }}
      </h5>
      <div class="request-detail__doc-row">
        <div class="request-detail__doc-icon">
          <AppIcon icon="file-alt" />
        </div>
        <div class="request-detail__doc-info">
          <span class="request-detail__doc-name">{{ detail.applicationType?.name || '—' }}</span>
          <span class="request-detail__doc-desc">{{ detail.description || '—' }}</span>
        </div>
      </div>
    </div>

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
          <span class="request-detail__info-value">{{ formatDate(detail.createdAt) }}</span>
        </div>
        <div class="request-detail__info-item request-detail__info-item--full">
          <span class="request-detail__info-label">{{ t('Observaciones') }}</span>
          <span class="request-detail__info-value">{{ detail.observations || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="request-detail__card" v-if="normalizedAttachments.length">
      <h5 class="request-detail__card-title">{{ t('Adjuntos') }}</h5>
      <div class="request-detail__attachments">
        <div v-for="att in normalizedAttachments" :key="att.id" class="request-detail__attachment">
          <div class="request-detail__attachment-left">
            <div class="request-detail__attachment-title">
              {{ att.applicationDocumentRequired?.name || t('Documento') }}
            </div>
            <div class="request-detail__attachment-meta">
              {{ att.applicationDocumentRequired?.code || '' }}
            </div>
          </div>
          <div class="request-detail__attachment-right">
            <a :href="att.fileUrl" target="_blank" rel="noopener" class="request-detail__attachment-link">{{ t('Ver / Descargar') }}</a>
          </div>
          <div v-if="isImageUrl(att.fileUrl)" class="request-detail__attachment-preview">
            <img :src="att.fileUrl" alt="" class="request-detail__attachment-img" />
          </div>
        </div>
      </div>
    </div>

    <div class="request-detail__card">
      <h5 class="request-detail__card-title">
        {{ t('Seguimiento del Proceso') }}
      </h5>
      <div v-if="!detail.history?.length" class="request-detail__empty">
        {{ t('Sin eventos') }}
      </div>
      <div v-else class="request-detail__timeline">
        <div v-for="(entry, index) in detail.history" :key="entry.id" class="request-detail__timeline-item">
          <div class="request-detail__timeline-dot-col">
            <div class="request-detail__timeline-dot" :class="{ 'request-detail__timeline-dot--active': index === 0 }"></div>
            <div v-if="index < detail.history.length - 1" class="request-detail__timeline-line"></div>
          </div>
          <div class="request-detail__timeline-content">
            <span class="request-detail__timeline-title">{{ entry.requestStatus?.name || '—' }}</span>
            <span class="request-detail__timeline-date">{{ formatDate(entry.createdAt) }}</span>
            <span class="request-detail__timeline-desc">{{ entry.description || '—' }}</span>
          </div>
        </div>
      </div>
    </div>

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
import type { DocumentRequestDetailDTO, DocumentRequestAttachmentDTO } from '../dtos/documentRequest.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';

const cleanUrl = (value: string) =>
  value
    .trim()
    .replace(/^`+|`+$/g, '')
    .replace(/^"+|"+$/g, '')
    .replace(/^'+|'+$/g, '');

const isImageUrl = (value: string) => /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(value);

const resolveStatus = (raw: string): { bg: string; text: string; icon: string; badge: VariantsConstant } => {
  const v = raw.toLowerCase();
  if (v.includes('final') || v.includes('termin'))
    return {
      bg: '#E8F5E9',
      text: '#2E7D32',
      icon: 'check-circle',
      badge: 'success',
    };
  if (v.includes('aprob') || v.includes('approved'))
    return {
      bg: '#E8F5E9',
      text: '#2E7D32',
      icon: 'check-circle',
      badge: 'success',
    };
  if (v.includes('pago') || v.includes('pay'))
    return {
      bg: '#FFF3E0',
      text: '#E65100',
      icon: 'exclamation-circle',
      badge: 'warning',
    };
  if (v.includes('rech') || v.includes('reject') || v.includes('neg'))
    return {
      bg: '#FFEBEE',
      text: '#C62828',
      icon: 'times-circle',
      badge: 'danger',
    };
  if (v.includes('pend') || v.includes('review') || v.includes('revis')) return { bg: '#E3F2FD', text: '#1565C0', icon: 'clock', badge: 'primary' };
  return { bg: '#E3F2FD', text: '#1565C0', icon: 'clock', badge: 'primary' };
};

export default defineComponent({
  name: 'DocumentRequestDetailDrawer',
  components: { AppIcon, AppBadge },
  props: {
    detail: {
      type: Object as PropType<DocumentRequestDetailDTO>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const statusColor = computed(() => resolveStatus(String(props.detail?.requestStatus?.name ?? '')));
    const statusBadgeVariant = computed(() => statusColor.value.badge);

    const normalizedAttachments = computed<DocumentRequestAttachmentDTO[]>(() =>
      (props.detail.attachments ?? []).map((a) => ({
        ...a,
        fileUrl: cleanUrl(String(a.fileUrl ?? '')),
      }))
    );

    const formatDate = (iso: string) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    };

    return {
      t,
      statusColor,
      statusBadgeVariant,
      normalizedAttachments,
      formatDate,
      isImageUrl,
    };
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

.request-detail__doc-row {
  display: flex;
  gap: 12px;
  align-items: center;
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
  background: #ebf5ff;
  color: #2563eb;
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

.request-detail__attachments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-detail__attachment {
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.request-detail__attachment-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.request-detail__attachment-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.request-detail__attachment-meta {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.request-detail__attachment-right {
  display: flex;
  align-items: center;
}

.request-detail__attachment-link {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}

.request-detail__attachment-preview {
  grid-column: 1 / -1;
}

.request-detail__attachment-img {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #eef2f7;
}

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

.request-detail__empty {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

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
