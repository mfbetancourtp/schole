<template>
  <div class="chapter-card" @click="$emit('click', chapter)">
    <div class="chapter-card__content">
      <div class="chapter-card__header">
        <span class="chapter-card__title">{{ chapter.title }}</span>
        <AppBadge :label="statusLabel" :variant="statusVariant" />
      </div>

      <p class="chapter-card__description">{{ chapter.description }}</p>

      <div class="chapter-card__meta">
        <span class="chapter-card__meta-item">
          <AppIcon icon="calendar-alt" class="chapter-card__meta-icon" />
          {{ chapter.date }}
        </span>
        <span v-if="chapter.comments > 0" class="chapter-card__meta-item">
          <AppIcon icon="comment" class="chapter-card__meta-icon" />
          {{ chapter.comments }} {{ t('comentarios') }}
        </span>
        <span v-if="chapter.files > 0" class="chapter-card__meta-item">
          <AppIcon icon="file-alt" class="chapter-card__meta-icon" />
          {{ chapter.files }} {{ t('archivos') }}
        </span>
      </div>
    </div>

    <div v-if="chapter.status === 'in_progress'" class="chapter-card__action" @click.stop>
      <AppButton :label="t('Subir Avance')" variant="primary" outlined @click="$emit('upload', chapter)" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ChapterTimeline, ChapterStatus } from '../dtos/tracking.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

const statusConfig: Record<ChapterStatus, { label: string; variant: VariantsConstant }> = {
  completed: { label: 'Completado', variant: 'success' },
  in_review: { label: 'En Revisión', variant: 'warning' },
  in_progress: { label: 'En Progreso', variant: 'ghost' },
  pending: { label: 'Pendiente', variant: 'dark' },
};

export default defineComponent({
  name: 'ChapterTimelineCard',
  components: { AppBadge, AppIcon, AppButton },
  props: {
    chapter: {
      type: Object as PropType<ChapterTimeline>,
      required: true,
    },
  },
  emits: ['click', 'upload'],
  setup(props) {
    const { t } = useI18n();
    const statusLabel = computed(() => statusConfig[props.chapter.status]?.label ?? '');
    const statusVariant = computed(() => statusConfig[props.chapter.status]?.variant ?? 'primary');

    return { t, statusLabel, statusVariant };
  },
});
</script>

<style scoped>
.chapter-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: #ffffff;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 20px 24px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  gap: 16px;
}

.chapter-card:hover {
  box-shadow: 0 4px 16px rgba(145, 158, 171, 0.2);
}

.chapter-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.chapter-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.chapter-card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
}

.chapter-card__description {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
}

.chapter-card__meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.chapter-card__meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
}

.chapter-card__meta-icon {
  font-size: 13px;
  color: #919eab;
}

.chapter-card__action {
  flex-shrink: 0;
}
</style>
