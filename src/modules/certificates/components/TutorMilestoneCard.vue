<template>
  <AppCardDashboard>
    <template #body>
      <div class="tutor-project-card">
        <div class="tutor-project-card__header">
          <AppBadge :label="leftChipLabel" :variant="leftChipVariant" />
          <AppBadge v-if="milestone.pendingDeliveries > 0" :label="pendingLabel" variant="warning" />
        </div>

        <h3 class="tutor-project-card__title">
          {{ milestone.applicationProject?.name ?? '-' }}
        </h3>

        <div class="tutor-project-card__students">
          <div class="student-avatars">
            <AppAvatar v-for="student in students" :key="student.initials + student.name" :name="student.initials" size="sm" />
          </div>
          <div class="student-info">
            <span class="student-info__names">{{ studentNames }}</span>
            <span v-if="teamSize > 1" class="student-info__team">
              <AppIcon icon="users" size="xs" />
              {{ t('Equipo de') }} {{ teamSize }}
            </span>
          </div>
        </div>

        <div class="tutor-project-card__progress">
          <div class="progress-header">
            <span class="progress-header__label">{{ t('Progreso del proyecto') }}</span>
            <span class="progress-header__value">{{ progressPercent }}%</span>
          </div>
          <DashboardProgressBar :percent="progressPercent" />
        </div>

        <div class="tutor-project-card__chapter">
          <AppIcon icon="clock" class="chapter-icon" />
          <div class="chapter-info">
            <span class="chapter-info__name">{{ milestone.scheduleSettingsMilestone?.name ?? '-' }}</span>
            <span class="chapter-info__date">{{ t('Última actualización:') }} {{ formattedUpdatedAt }}</span>
          </div>
        </div>

        <div class="tutor-project-card__status">
          <AppBadge :label="String(milestone.status ?? '-')" :variant="statusVariant" />
        </div>

        <div v-if="showReviewButton" class="tutor-project-card__actions">
          <AppButton :label="t('Revisar Entregas')" variant="secondary" outlined @click="$emit('review', milestone)" />
        </div>
      </div>
    </template>
  </AppCardDashboard>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import DashboardProgressBar from './DashboardProgressBar.vue';
import type { TutorPanelMilestoneDto, TutorPanelMilestoneStatus, StudentInfo } from '../dtos/tutorPanel.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';

const normalizeStatus = (value: unknown): TutorPanelMilestoneStatus | string => {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('pendien')) return 'Pendiente';
  if (normalized.includes('progres')) return 'En Progreso';
  if (normalized.includes('revisi') || normalized.includes('revis')) return 'En Revisión';
  if (normalized.includes('complet')) return 'Completado';
  return String(value ?? '');
};

export default defineComponent({
  name: 'TutorMilestoneCard',
  components: {
    AppBadge,
    AppIcon,
    AppButton,
    AppAvatar,
    AppCardDashboard,
    DashboardProgressBar,
  },
  props: {
    milestone: {
      type: Object as PropType<TutorPanelMilestoneDto>,
      required: true,
    },
    students: {
      type: Array as PropType<StudentInfo[]>,
      default: () => [],
    },
  },
  emits: ['review'],
  setup(props) {
    const { t } = useI18n();

    const leftChipLabel = computed(() => {
      const scheduleName = props.milestone.applicationProject?.scheduleSettingsName;
      if (scheduleName) return scheduleName;
      return 'Proyecto de Grado';
    });

    const leftChipVariant = computed<VariantsConstant>(() => 'ghost');

    const pendingLabel = computed(() => {
      const count = props.milestone.pendingDeliveries ?? 0;
      return count === 1 ? '1 Entrega pendiente' : `${count} Entregas pendientes`;
    });

    const studentNames = computed(() => {
      const names = props.students.map((s) => s.name).filter(Boolean);
      if (names.length === 0) return '-';
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} y ${names[1]}`;
      return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
    });

    const teamSize = computed(() => props.students.length);

    const progressPercent = computed(() => {
      const raw = Number(props.milestone.scheduleSettingsMilestone?.approvalDeadline ?? 0);
      if (!Number.isFinite(raw)) return 0;
      return Math.max(0, Math.min(100, raw));
    });

    const formattedUpdatedAt = computed(() => {
      const iso = props.milestone.updatedAt;
      if (!iso) return '-';
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    });

    const statusVariant = computed<VariantsConstant>(() => {
      const status = normalizeStatus(props.milestone.status);
      if (status === 'Pendiente') return 'warning';
      if (status === 'En Progreso') return 'ghost';
      if (status === 'En Revisión') return 'warning';
      if (status === 'Completado') return 'success';
      return 'primary';
    });

    const showReviewButton = computed(() => normalizeStatus(props.milestone.status) === 'En Revisión');

    return {
      t,
      leftChipLabel,
      leftChipVariant,
      pendingLabel,
      studentNames,
      teamSize,
      progressPercent,
      formattedUpdatedAt,
      statusVariant,
      showReviewButton,
    };
  },
});
</script>

<style scoped>
.tutor-project-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
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
  font-weight: 600;
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

.tutor-project-card__status {
  display: flex;
}

.tutor-project-card__actions {
  margin-top: 4px;
}

.tutor-project-card__actions :deep(.o-btn) {
  width: 100%;
  justify-content: center;
}
</style>
