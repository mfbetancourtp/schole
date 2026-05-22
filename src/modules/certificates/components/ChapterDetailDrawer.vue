<template>
  <div class="chapter-detail">
    <!-- Title and description -->
    <div class="chapter-detail__header">
      <h3 class="chapter-detail__title">{{ detail.title }}</h3>
      <p class="chapter-detail__description">{{ detail.description }}</p>
    </div>

    <!-- Status -->
    <div class="chapter-detail__section">
      <span class="chapter-detail__label">{{ t('Estado') }}</span>
      <div class="chapter-detail__status">
        <AppBadge :label="statusLabel" :variant="statusVariant" />
      </div>
    </div>

    <!-- Date -->
    <div class="chapter-detail__section">
      <span class="chapter-detail__label">{{ t(detail.dateLabel) }}</span>
      <span class="chapter-detail__date">{{ detail.date }}</span>
    </div>

    <!-- Deliverables -->
    <div v-if="detail.deliverables.length > 0" class="chapter-detail__section">
      <span class="chapter-detail__label">{{ t('Entregables') }}</span>
      <div class="chapter-detail__deliverables">
        <div v-for="deliverable in detail.deliverables" :key="deliverable.id" class="deliverable-item">
          <div class="deliverable-item__info">
            <AppIcon icon="file-alt" class="deliverable-item__icon" />
            <span class="deliverable-item__name">{{ deliverable.name }}</span>
          </div>
          <AppButton :label="t('Ver')" variant="primary" outlined size="sm" />
        </div>
      </div>
    </div>

    <!-- Tutor Comments -->
    <div v-if="detail.comments.length > 0" class="chapter-detail__section">
      <span class="chapter-detail__label">{{ t('Comentarios del Tutor') }}</span>
      <div class="chapter-detail__comments">
        <div v-for="comment in detail.comments" :key="comment.id" class="comment-card">
          <div class="comment-card__header">
            <div class="comment-card__author">
              <span class="comment-card__name">{{ comment.author }}</span>
              <span class="comment-card__role" :class="`comment-card__role--${comment.role.toLowerCase()}`">
                {{ comment.role }}
              </span>
            </div>
            <div class="comment-card__date">
              <span>{{ comment.date }}</span>
              <span>{{ comment.time }}</span>
            </div>
          </div>
          <p class="comment-card__message">{{ comment.message }}</p>
        </div>
      </div>
    </div>

    <!-- Add Reply -->
    <div v-if="showReply" class="chapter-detail__section">
      <AppFormField :label="t('Agregar Respuesta')">
        <textarea v-model="newReply" class="form-control" :placeholder="t('Escriba su respuesta o consulta...')" rows="3"></textarea>
      </AppFormField>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ChapterDetail, ChapterStatus } from '../dtos/tracking.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

const statusConfig: Record<ChapterStatus, { label: string; variant: VariantsConstant }> = {
  completed: { label: 'Completado', variant: 'success' },
  in_review: { label: 'En Revisión', variant: 'warning' },
  in_progress: { label: 'En Progreso', variant: 'ghost' },
  pending: { label: 'Pendiente', variant: 'dark' },
};

export default defineComponent({
  name: 'ChapterDetailDrawer',
  components: { AppBadge, AppIcon, AppButton, AppFormField },
  props: {
    detail: {
      type: Object as PropType<ChapterDetail>,
      required: true,
    },
  },
  emits: ['submit-reply'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const newReply = ref('');

    const statusLabel = computed(() => statusConfig[props.detail.status]?.label ?? '');
    const statusVariant = computed(() => statusConfig[props.detail.status]?.variant ?? 'primary');

    const showReply = computed(() => {
      return props.detail.status !== 'pending';
    });

    const submitReply = () => {
      if (!newReply.value.trim()) return;
      emit('submit-reply', {
        chapterId: props.detail.id,
        message: newReply.value.trim(),
      });
      newReply.value = '';
    };

    return { t, statusLabel, statusVariant, showReply, newReply, submitReply };
  },
});
</script>

<style scoped>
.chapter-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.chapter-detail__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chapter-detail__title {
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.chapter-detail__description {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

.chapter-detail__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chapter-detail__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
}

.chapter-detail__status {
  display: flex;
}

.chapter-detail__date {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
}

/* Deliverables */
.chapter-detail__deliverables {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.deliverable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 8px;
  padding: 12px 16px;
}

.deliverable-item__info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deliverable-item__icon {
  font-size: 16px;
  color: #919eab;
}

.deliverable-item__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
}

/* Comments */
.chapter-detail__comments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-card {
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-card__author {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-card__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
}

.comment-card__role {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.comment-card__role--tutor {
  color: var(--color-secondary, #e74c3c);
}

.comment-card__role--estudiante {
  color: var(--color-primary, #1b2e83);
}

.comment-card__date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.comment-card__message {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
  line-height: 1.5;
}

.chapter-detail__submit {
  display: flex;
  margin-top: 4px;
}
</style>
