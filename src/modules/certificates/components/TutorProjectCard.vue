<template>
  <div class="tutor-project-card">
    <!-- Header: modality badge + pending deliveries -->
    <div class="tutor-project-card__header">
      <AppBadge :label="modalityLabel" :variant="project.modality === 'thesis' ? 'dark' : 'ghost'" />
      <AppBadge v-if="project.pendingDeliveries > 0" :label="pendingLabel" variant="warning" />
    </div>

    <!-- Title -->
    <h3 class="tutor-project-card__title">{{ project.title }}</h3>

    <!-- Students -->
    <div class="tutor-project-card__students">
      <div class="student-avatars">
        <AppAvatar v-for="student in project.students" :key="student.initials" :name="student.initials" size="sm" />
      </div>
      <div class="student-info">
        <span class="student-info__names">{{ studentNames }}</span>
        <span v-if="project.teamSize > 1" class="student-info__team">
          <AppIcon icon="users" size="xs" />
          {{ t('Equipo de') }} {{ project.teamSize }}
        </span>
      </div>
    </div>

    <!-- Progress -->
    <div class="tutor-project-card__progress">
      <div class="progress-header">
        <span class="progress-header__label">{{ t('Progreso del proyecto') }}</span>
        <span class="progress-header__value">{{ project.progress }}%</span>
      </div>
      <DashboardProgressBar :percent="project.progress" />
    </div>

    <!-- Current chapter -->
    <div class="tutor-project-card__chapter">
      <AppIcon icon="clock" class="chapter-icon" />
      <div class="chapter-info">
        <span class="chapter-info__name">{{ project.currentChapter }}</span>
        <span class="chapter-info__date">{{ t('Última actualización:') }} {{ project.lastUpdate }}</span>
      </div>
    </div>

    <!-- Status badge -->
    <div class="tutor-project-card__status">
      <AppBadge :label="statusLabel" :variant="statusVariant" />
    </div>

    <!-- Review button (only for pending_review) -->
    <div v-if="project.status === 'pending_review'" class="tutor-project-card__actions">
      <AppButton :label="t('Revisar Entregas')" variant="secondary" @click="$emit('review', project)" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TutorProject, ProjectStatus } from '../dtos/tutorPanel.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import DashboardProgressBar from './DashboardProgressBar.vue';

const statusConfig: Record<ProjectStatus, { label: string; variant: VariantsConstant }> = {
  pending_review: { label: 'Pendiente de Revisión', variant: 'warning' },
  in_progress: { label: 'En Curso', variant: 'ghost' },
  completed: { label: 'Completado', variant: 'success' },
};

export default defineComponent({
  name: 'TutorProjectCard',
  components: { AppBadge, AppIcon, AppButton, AppAvatar, DashboardProgressBar },
  props: {
    project: {
      type: Object as PropType<TutorProject>,
      required: true,
    },
  },
  emits: ['review'],
  setup(props) {
    const { t } = useI18n();

    const modalityLabel = computed(() => (props.project.modality === 'thesis' ? 'Tesis' : 'Proyecto de Grado'));

    const pendingLabel = computed(() => {
      const count = props.project.pendingDeliveries;
      return count === 1 ? '1 Entrega pendiente' : `${count} Entregas pendientes`;
    });

    const studentNames = computed(() => props.project.students.map((s) => s.name).join(' y '));

    const statusLabel = computed(() => statusConfig[props.project.status]?.label ?? '');
    const statusVariant = computed(() => statusConfig[props.project.status]?.variant ?? 'primary');

    return {
      t,
      modalityLabel,
      pendingLabel,
      studentNames,
      statusLabel,
      statusVariant,
    };
  },
});
</script>

<style scoped>
.tutor-project-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.tutor-project-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tutor-project-card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
  line-height: 1.4;
}

/* Students */
.tutor-project-card__students {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatars {
  display: flex;
  gap: 0;
}

.student-avatars :deep(> *) + :deep(> *) {
  margin-left: -8px;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-info__names {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #212b36;
}

.student-info__team {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Progress */
.tutor-project-card__progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-header__label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #637381;
  font-style: italic;
}

.progress-header__value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
}

/* Chapter */
.tutor-project-card__chapter {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chapter-icon {
  font-size: 14px;
  color: #919eab;
  margin-top: 2px;
}

.chapter-info {
  display: flex;
  flex-direction: column;
}

.chapter-info__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.chapter-info__date {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

/* Status */
.tutor-project-card__status {
  display: flex;
}

/* Actions */
.tutor-project-card__actions {
  margin-top: 4px;
}

.tutor-project-card__actions :deep(.o-btn) {
  width: 100%;
  justify-content: center;
}
</style>
