<template>
  <div class="modality-card">
    <!-- Colored header -->
    <div class="modality-card__header" :style="{ backgroundColor: headerBg }">
      <div class="modality-card__icon-wrapper" :style="{ backgroundColor: iconBg }">
        <AppIcon :icon="template.icon" class="modality-card__icon" :style="{ color: template.color }" />
      </div>
      <div class="modality-card__header-text">
        <h3 class="modality-card__title" :style="{ color: template.color }">
          {{ template.name }}
        </h3>
        <p class="modality-card__description">{{ template.description }}</p>
      </div>
    </div>

    <!-- White body -->
    <div class="modality-card__body">
      <!-- Stats -->
      <div class="modality-card__stats">
        <div class="modality-card__stat">
          <span class="modality-card__stat-label">Hitos configurados</span>
          <span class="modality-card__stat-value">{{ template.totalMilestones }}</span>
        </div>
        <div class="modality-card__stat modality-card__stat--right">
          <span class="modality-card__stat-label">Duración estimada</span>
          <span class="modality-card__stat-value">{{ template.maxApprovalDeadline }} días</span>
        </div>
      </div>

      <!-- Top milestones preview -->
      <div v-if="topMilestones.length" class="modality-card__milestones">
        <span class="modality-card__milestones-label">Hitos principales:</span>
        <div v-for="(milestone, index) in topMilestones" :key="milestone.id" class="modality-card__milestone-row">
          <span class="modality-card__milestone-order" :style="{ backgroundColor: iconBg, color: template.color }">{{ index + 1 }}</span>
          <span class="modality-card__milestone-name">{{ milestone.name }}</span>
          <span class="modality-card__milestone-days">{{ milestone.approvalDeadline }}d</span>
        </div>
        <span v-if="remainingCount > 0" class="modality-card__remaining">+{{ remainingCount }} hitos más...</span>
      </div>

      <!-- Actions -->
      <div class="modality-card__actions">
        <AppButton :label="t('Configurar Plantilla')" variant="primary" outlined class="modality-card__btn-configure" @click="$emit('configure', template)" />
        <AppButton variant="danger" outlined icon="trash" @click="$emit('delete', template)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ScheduleSettingDto } from '../dtos/scheduleConfig.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = (hex || '#1b55e2').replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16) || 27;
  const g = parseInt(cleaned.slice(2, 4), 16) || 85;
  const b = parseInt(cleaned.slice(4, 6), 16) || 226;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default defineComponent({
  name: 'ModalityTemplateCard',
  components: { AppIcon, AppButton },
  props: {
    template: {
      type: Object as PropType<ScheduleSettingDto>,
      required: true,
    },
  },
  emits: ['configure', 'delete'],
  setup(props) {
    const { t } = useI18n();

    const headerBg = computed(() => hexToRgba(props.template.color, 0.07));
    const iconBg = computed(() => hexToRgba(props.template.color, 0.12));
    const topMilestones = computed(() => (props.template.milestones ?? []).slice(0, 3));
    const remainingCount = computed(() => Math.max(0, (props.template.milestones?.length ?? 0) - 3));

    return { t, headerBg, iconBg, topMilestones, remainingCount };
  },
});
</script>

<style scoped>
.modality-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 2;
  row-gap: 0;
  overflow: hidden;
  min-width: 0;
}

.modality-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(145, 158, 171, 0.16);
}

.modality-card__icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modality-card__icon {
  font-size: 20px;
}

.modality-card__header-text {
  min-width: 0;
}

.modality-card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.modality-card__description {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 4px 0 0 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.modality-card__body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px;
}

.modality-card__stats {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.modality-card__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modality-card__stat--right {
  text-align: right;
}

.modality-card__stat-label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.modality-card__stat-value {
  font-family: 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #212b36;
}

.modality-card__milestones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modality-card__milestones-label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin-bottom: 2px;
}

.modality-card__milestone-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modality-card__milestone-order {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.modality-card__milestone-name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  flex: 1;
}

.modality-card__milestone-days {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  flex-shrink: 0;
}

.modality-card__remaining {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  font-style: italic;
  padding-left: 34px;
}

.modality-card__actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.modality-card__btn-configure {
  flex: 1;
}

:deep(.o-btn) {
  justify-content: center;
}
</style>
