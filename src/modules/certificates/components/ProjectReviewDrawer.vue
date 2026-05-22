<template>
  <div class="project-review">
    <!-- Header -->
    <div class="project-review__header">
      <h3 class="project-review__title">{{ detail.title }}</h3>
      <p class="project-review__students">{{ detail.students }}</p>
    </div>

    <!-- Info card -->
    <div class="project-review__info-card">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-item__label">{{ t('Modalidad') }}</span>
          <span class="info-item__value">{{ detail.modality }}</span>
        </div>
        <div class="info-item">
          <span class="info-item__label">{{ t('Progreso') }}</span>
          <span class="info-item__value">{{ detail.progress }}%</span>
        </div>
        <div class="info-item">
          <span class="info-item__label">{{ t('Hito Actual') }}</span>
          <span class="info-item__value">{{ detail.currentChapter }}</span>
        </div>
        <div class="info-item">
          <span class="info-item__label">{{ t('Integrantes') }}</span>
          <span class="info-item__value">{{ detail.teamSize }}</span>
        </div>
      </div>
    </div>

    <!-- Pending deliveries -->
    <div class="project-review__section">
      <h4 class="project-review__section-title">
        {{ t('Entregas Pendientes de Revisión') }}
      </h4>

      <div v-for="delivery in detail.deliveries" :key="delivery.id" class="delivery-card">
        <!-- File info -->
        <div class="delivery-card__file">
          <div class="delivery-card__file-info">
            <AppIcon icon="file-alt" class="delivery-card__file-icon" />
            <div class="delivery-card__file-text">
              <span class="delivery-card__file-name">{{ fileNameFromUrl(delivery.fileUrl) }}</span>
              <span class="delivery-card__file-chapter">{{ delivery.milestone?.scheduleSettingsMilestone?.name ?? '' }}</span>
            </div>
          </div>
          <AppButton :label="t('Descargar')" variant="primary" outlined size="sm" @click="download(delivery.fileUrl)" />
        </div>

        <!-- Student comment -->
        <div class="delivery-card__comment">
          <div class="delivery-card__comment-header">
            <AppIcon icon="comment-alt" class="delivery-card__comment-icon" />
            <div class="delivery-card__comment-meta">
              <span class="delivery-card__comment-author">{{ defaultAuthor }}</span>
              <span class="delivery-card__comment-date">{{ formatCreatedAt(delivery.createdAt) }}</span>
            </div>
          </div>
          <p class="delivery-card__comment-text">{{ delivery.comment }}</p>
        </div>
      </div>
    </div>

    <!-- Feedback -->
    <div class="project-review__section">
      <AppFormField :label="t('Retroalimentación')">
        <textarea v-model="feedback" class="form-control" :placeholder="t('Escriba sus comentarios, observaciones o sugerencias para el equipo...')" rows="4"></textarea>
      </AppFormField>
    </div>

    <!-- Note -->
    <div class="project-review__note">
      <span class="project-review__note-label">{{ t('Nota:') }}</span>
      {{ t('Este comentario será visible para todos los integrantes del equipo') }}
      ({{ detail.students }}).
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ProjectReviewDetail } from '../dtos/tutorPanel.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'ProjectReviewDrawer',
  components: { AppIcon, AppButton, AppFormField },
  props: {
    detail: {
      type: Object as PropType<ProjectReviewDetail>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const feedback = ref('');

    const sanitizeUrl = (url: string) =>
      String(url ?? '')
        .replace(/`/g, '')
        .trim();

    const fileNameFromUrl = (url: string) => {
      try {
        const clean = sanitizeUrl(url);
        const last = clean.split('/').pop() ?? clean;
        return decodeURIComponent(last.split('?')[0] ?? last);
      } catch {
        return sanitizeUrl(url);
      }
    };

    const formatCreatedAt = (iso: string) => {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      const datePart = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `${datePart} - ${timePart}`;
    };

    const download = (url: string) => {
      const target = sanitizeUrl(url);
      if (!target) return;
      window.open(target, '_blank');
    };

    const defaultAuthor = computed(() => {
      const raw = String(props.detail?.students ?? '').trim();
      if (!raw) return '';
      if (raw.includes(' y ')) return raw.split(' y ')[0];
      if (raw.includes(',')) return raw.split(',')[0];
      return raw;
    });

    const getFeedback = () => feedback.value;

    return {
      t,
      feedback,
      getFeedback,
      fileNameFromUrl,
      formatCreatedAt,
      download,
      defaultAuthor,
    };
  },
});
</script>

<style scoped>
.project-review {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

/* Header */
.project-review__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-review__title {
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.project-review__students {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

/* Info card */
.project-review__info-card {
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item__label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item__value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

/* Section */
.project-review__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-review__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

/* Delivery card */
.delivery-card {
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.delivery-card__file {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delivery-card__file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delivery-card__file-icon {
  font-size: 24px;
  color: #3b82f6;
}

.delivery-card__file-text {
  display: flex;
  flex-direction: column;
}

.delivery-card__file-name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.delivery-card__file-chapter {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

/* Comment */
.delivery-card__comment {
  border-top: 1px solid rgba(145, 158, 171, 0.12);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.delivery-card__comment-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.delivery-card__comment-icon {
  font-size: 14px;
  color: #919eab;
  margin-top: 2px;
}

.delivery-card__comment-meta {
  display: flex;
  flex-direction: column;
}

.delivery-card__comment-author {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.delivery-card__comment-date {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.delivery-card__comment-text {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
  line-height: 1.5;
}

/* Note */
.project-review__note {
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  line-height: 1.5;
}

.project-review__note-label {
  font-weight: 700;
  color: #e65100;
}
</style>
