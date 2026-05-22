<template>
  <AppBaseList :title="t('Dashboard de Grados')">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="degrees-dashboard">
        <!-- Welcome -->
        <div class="degrees-dashboard__welcome">
          <h2 class="degrees-dashboard__title">
            {{ t('Dashboard de Grados') }}
          </h2>
          <p class="degrees-dashboard__subtitle">
            {{ t('Bienvenido de nuevo, Juan. Aquí está el estado de tu proyecto.') }}
          </p>
        </div>

        <!-- Summary cards -->
        <div class="degrees-dashboard__stats">
          <AppStatCard :label="t('Estado')" :value="data.summary.status" :caption="data.summary.statusDate" icon="file-alt" variant="white" />

          <AppCardDashboard class="stat-progress">
            <template #title>
              <div class="stat-progress__head">
                <span class="stat-progress__label">{{ t('Progreso') }}</span>
                <AppIcon icon="clock" class="stat-progress__icon" />
              </div>
            </template>
            <template #body>
              <strong class="stat-progress__value">{{ data.summary.progress }}%</strong>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: data.summary.progress + '%' }" />
              </div>
            </template>
          </AppCardDashboard>

          <AppStatCard :label="t('Modalidad')" :value="data.summary.modality" :caption="data.summary.modalityDetail" icon="check-circle" variant="white" />

          <AppStatCard :label="t('Tutor')" :value="data.summary.tutorName" :caption="data.summary.tutorStatus" icon="info-circle" variant="white" />
        </div>

        <!-- Bottom section: Project + Activities -->
        <div class="degrees-dashboard__bottom">
          <!-- Project Summary -->
          <AppCardDashboard class="degrees-dashboard__project">
            <template #title>
              <div class="section-header">
                <div class="section-header__text">
                  <h3 class="section-header__title">
                    {{ t('Resumen del Proyecto') }}
                  </h3>
                  <p class="section-header__subtitle">
                    {{ t('Información general de tu proyecto de grado') }}
                  </p>
                </div>

                <!-- Multi-project navigator -->
                <div v-if="data.projects.length > 1" class="project-nav">
                  <button class="project-nav__btn" :disabled="activeIndex === 0" @click="activeIndex--">
                    <AppIcon icon="chevron-left" />
                  </button>
                  <span class="project-nav__counter">{{ activeIndex + 1 }} / {{ data.projects.length }}</span>
                  <button class="project-nav__btn" :disabled="activeIndex === data.projects.length - 1" @click="activeIndex++">
                    <AppIcon icon="chevron-right" />
                  </button>
                </div>
              </div>
            </template>

            <template #body>
              <div v-if="activeProject" class="project-body">
                <!-- Urgency alert -->
                <div v-if="activeProject.status === 'Pendiente'" class="project-body__alert">
                  <AppIcon icon="exclamation-triangle" />
                  <span>{{ t('Este proyecto requiere tu atención') }}</span>
                </div>

                <div class="project-body__field">
                  <span class="project-body__label">{{ t('Título del Proyecto') }}</span>
                  <span class="project-body__value">{{ activeProject.title }}</span>
                </div>

                <div class="project-body__tags">
                  <AppBadge v-for="tag in activeProject.tags" :key="tag" :label="tag" variant="ghost" />
                  <AppBadge :label="activeProject.status" :variant="statusVariant(activeProject.status)" />
                </div>

                <div class="project-body__info">
                  <div class="project-body__info-item">
                    <span class="project-body__info-label">{{ t('Fecha de Inscripción') }}</span>
                    <span class="project-body__info-value">{{ activeProject.enrollmentDate }}</span>
                  </div>
                  <div class="project-body__info-item">
                    <span class="project-body__info-label">{{ t('Tutor Asignado') }}</span>
                    <span class="project-body__info-value">{{ activeProject.assignedTutor }}</span>
                  </div>
                  <div v-if="activeProject.dueDate" class="project-body__info-item">
                    <span class="project-body__info-label">{{ t('Próxima entrega') }}</span>
                    <span class="project-body__info-value">{{ activeProject.dueDate }}</span>
                  </div>
                </div>

                <div class="project-body__actions">
                  <AppButton :label="t('Ver Seguimiento')" variant="secondary" @click="goToTracking" />
                </div>
              </div>
            </template>
          </AppCardDashboard>

          <!-- Recent Activities -->
          <AppCardDashboard class="degrees-dashboard__activities">
            <template #title>
              <div class="section-header">
                <div class="section-header__text">
                  <h3 class="section-header__title">
                    {{ t('Actividades Recientes') }}
                  </h3>
                  <p class="section-header__subtitle">
                    {{ t('Últimas actualizaciones') }}
                  </p>
                </div>
              </div>
            </template>
            <template #body>
              <TimelineList :items="data.activities" :getDotIcon="getActivityIcon" :getDotVariant="getActivityVariant" :getLineVariant="getActivityVariant" :dotSize="40" :gap="16">
                <template #item="{ item }">
                  <div class="activity-item">
                    <span class="activity-item__title">{{ item.title }}</span>
                    <span class="activity-item__description">{{ item.description }}</span>
                    <span class="activity-item__time">{{ item.timeAgo }}</span>
                  </div>
                </template>
              </TimelineList>
            </template>
          </AppCardDashboard>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import TimelineList from '../../../shared/components/TimeLine/TimelineList.vue';

import { dashboardService } from '../services/dashboard.service';
import type { DashboardData, RecentActivity, DegreeProjectStatus } from '../dtos/dashboard.dto';
import type { TimelineVariant } from '../../../shared/components/TimeLine/TimelineList.vue';

const STATUS_PRIORITY: Record<DegreeProjectStatus, number> = {
  Pendiente: 0,
  'En Revisión': 1,
  Activo: 2,
  Completado: 3,
};

export default defineComponent({
  name: 'DegreesDashboard',
  components: {
    AppBaseList,
    AppButton,
    AppBadge,
    AppLoading,
    AppCardDashboard,
    AppStatCard,
    AppIcon,
    TimelineList,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    useMeta({ title: 'Dashboard de Grados' });

    const loading = ref(true);
    const data = ref<DashboardData>({
      summary: {
        status: '',
        statusDate: '',
        progress: 0,
        modality: '',
        modalityDetail: '',
        tutorName: '',
        tutorStatus: '',
      },
      projects: [],
      activities: [],
    });

    const sortedProjects = computed(() => [...data.value.projects].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]));

    const activeIndex = ref(0);
    const activeProject = computed(() => sortedProjects.value[activeIndex.value] ?? null);

    const iconMap: Record<RecentActivity['type'], string> = {
      comment: 'exclamation-circle',
      approval: 'check-circle',
      pending: 'clock',
    };

    const variantMap: Record<RecentActivity['type'], TimelineVariant> = {
      comment: 'warning',
      approval: 'success',
      pending: 'primary',
    };

    const getActivityIcon = (item: RecentActivity) => iconMap[item.type] || 'circle';
    const getActivityVariant = (item: RecentActivity) => variantMap[item.type] || 'primary';

    const statusVariant = (status: DegreeProjectStatus) => {
      const map: Record<DegreeProjectStatus, string> = {
        Pendiente: 'warning',
        'En Revisión': 'primary',
        Activo: 'success',
        Completado: 'secondary',
      };
      return map[status] ?? 'secondary';
    };

    const goToTracking = () => {
      router.push({
        name: 'certificates.progressTracking',
        params: { id: activeProject.value?.id ?? 1 },
      });
    };

    const loadDashboard = async () => {
      loading.value = true;
      try {
        data.value = await dashboardService.getDashboardData();
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Dashboard de Grados', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadDashboard();
    });

    return {
      t,
      loading,
      data,
      sortedProjects,
      activeIndex,
      activeProject,
      getActivityIcon,
      getActivityVariant,
      statusVariant,
      goToTracking,
    };
  },
});
</script>

<style scoped>
.degrees-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.degrees-dashboard__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.degrees-dashboard__title {
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.degrees-dashboard__subtitle {
  font-size: 14px;
  color: #637381;
  margin: 0;
}

.degrees-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .degrees-dashboard__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .degrees-dashboard__stats {
    grid-template-columns: 1fr;
  }
}

.degrees-dashboard__bottom {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .degrees-dashboard__bottom {
    grid-template-columns: 1fr;
  }
}

.degrees-dashboard__project,
.degrees-dashboard__activities {
  height: fit-content;
}

/* Progress stat card */
.stat-progress {
  display: flex;
  flex-direction: column;
}

.stat-progress__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.stat-progress__label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.stat-progress__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  color: #64748b;
  flex-shrink: 0;
}

.stat-progress__value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

/* Progress bar */
.progress-track {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary, #1b2e83);
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Section header shared */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.section-header__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-header__title {
  font-size: 18px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.section-header__subtitle {
  font-size: 13px;
  color: #919eab;
  margin: 0;
}

/* Multi-project navigator */
.project-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.project-nav__btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #637381;
  transition: background 0.15s, color 0.15s;
}

.project-nav__btn:hover:not(:disabled) {
  background: var(--color-primary, #1b2e83);
  color: #fff;
  border-color: var(--color-primary, #1b2e83);
}

.project-nav__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.project-nav__counter {
  font-size: 12px;
  font-weight: 600;
  color: #637381;
  min-width: 36px;
  text-align: center;
}

/* Project body */
.project-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.project-body__alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #b45309;
}

.project-body__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-body__label {
  font-size: 13px;
  font-weight: 700;
  color: #212b36;
}

.project-body__value {
  font-size: 14px;
  color: #637381;
}

.project-body__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-body__info {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.project-body__info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-body__info-label {
  font-size: 12px;
  color: var(--color-secondary, #e74c3c);
  font-weight: 500;
}

.project-body__info-value {
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.project-body__actions {
  margin-top: 4px;
}

/* Timeline wrapper */
:deep(.timelineList) {
  padding-left: 16px;
}

/* Activity item */
.activity-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 4px;
}

.activity-item__title {
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.activity-item__description {
  font-size: 13px;
  color: #637381;
}

.activity-item__time {
  font-size: 12px;
  color: #919eab;
  margin-top: 2px;
}
</style>
