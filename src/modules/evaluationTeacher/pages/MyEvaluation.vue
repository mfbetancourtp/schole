<template>
  <AppBaseList title="Mis Evaluaciones">
    <template #content>
      <div class="my-evals-page">
        <div class="page-header">
          <div class="page-header__title">Mis Evaluaciones</div>
          <div class="page-header__sub">Completa las evaluaciones de tus docentes para el periodo académico actual</div>
        </div>
        <!-- Top progress card -->
        <div class="top-progress card">
          <div class="tp-icon">
            <AppGetIcon name="grafBar" />
          </div>
          <div class="tp-content">
            <div class="tp-content__top">
              <div>
                <div class="tp-title">Progreso Global</div>
                <div class="tp-sub">
                  Has completado <strong>{{ completedCount }}</strong> de <strong>{{ courses.length }}</strong> encuestas
                </div>
              </div>
              <div class="tp-right">{{ overallProgress }}%</div>
            </div>

            <div class="progress-bar" role="presentation">
              <div
                class="progress"
                :style="{ width: overallProgress + '%' }"
                role="progressbar"
                :aria-valuenow="overallProgress"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`Progreso global ${overallProgress}%`"
              ></div>
            </div>
          </div>
        </div>

        <!-- Section -->
        <h3 class="section-title">Evaluaciones por Asignatura</h3>

        <div v-if="loading" class="loading-wrapper">
          <AppLoading />
        </div>
        <div v-else class="grid-cards">
          <div v-for="course in courses" :key="course.executionId" class="course-card" :class="{ completed: course.status === 'completed' }">
            <div class="card-row">
              <div class="card-title">{{ course.title }}</div>
              <div class="card-badge" v-if="course.status === 'completed'">Completada</div>
              <div class="card-badge expired" v-else-if="isExpired(course)">Vencida</div>
              <div class="card-badge not-started" v-else-if="isNotYetStarted(course)">No disponible</div>
              <div class="card-badge pending" v-else>Pendiente</div>
            </div>

            <div class="card-teacher">Docente: {{ course.teacher }}</div>

            <div class="card-date-block">
              <AppIcon icon="calendar" class="card-date-block__icon" />
              <div class="card-date-block__text">
                <span class="card-date-block__label">
                  {{ course.status === 'completed' ? 'Completado el' : 'Fecha de cierre' }}
                </span>
                <strong class="card-date-block__value">
                  {{ course.status === 'completed' ? course.completedDate : course.dueDate }}
                </strong>
              </div>
            </div>

            <div class="small-progress">
              <div class="small-progress-bar" role="presentation">
                <div
                  class="small-progress-fill"
                  :style="{ width: course.progress + '%' }"
                  role="progressbar"
                  :aria-valuenow="course.progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="`Progreso ${course.progress}%`"
                ></div>
              </div>
              <div class="small-progress-text">Progreso {{ course.progress }}%</div>
            </div>

            <div class="card-actions">
              <span v-if="course.status === 'completed'" class="completed-text">Evaluación completada</span>
              <span v-else-if="isExpired(course)" class="expired-text">Fuera del período de evaluación</span>
              <span v-else-if="isNotYetStarted(course)" class="expired-text">La evaluación aún no ha iniciado</span>
              <AppButton v-else color="primary" @click="start(course)">Iniciar Evaluación</AppButton>
            </div>
          </div>
        </div>

        <div class="reminder">Recordatorio: Tienes {{ pendingCount }} evaluaciones pendientes. Por favor, complétalas antes de la fecha límite.</div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { useRouter } from 'vue-router';
import { GetEvaluationsListService } from '../services/getEvaluationsList.service';
import { GetEvaluatorStatsService } from '../services/getEvaluatorStats.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import type { EvaluationExecutionDto, EvaluatorStatsDto } from '../dtos/evaluationExecution.dto';

type Course = {
  id: number;
  executionId: number;
  title: string;
  teacher: string;
  status: 'completed' | 'pending';
  completedDate?: string;
  dueDate?: string;
  progress: number;
  evaluationStartDate?: string;
  evaluationEndDate?: string;
};

export default defineComponent({
  name: 'MyEvaluations',
  components: {
    AppBaseList,
    AppButton,
    AppGetIcon,
    AppIcon,
    AppLoading,
  },
  setup() {
    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Evaluación Docente', url: '' };
    headerStore.moduleItem = { name: 'Mis Evaluaciones', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const loading = ref(true);
    const courses = ref<Course[]>([]);
    const stats = ref<EvaluatorStatsDto | null>(null);
    const institutionsService = new InstitutionsService();

    const completedCount = computed(() => courses.value.filter((c) => c.status === 'completed').length);
    const pendingCount = computed(() => courses.value.filter((c) => c.status === 'pending').length);

    const overallProgress = computed(() => {
      if (!stats.value) return 0;
      return Math.round(stats.value.percentage);
    });

    const router = useRouter();

    function isExpired(course: Course): boolean {
      if (!course.evaluationEndDate) return false;
      return new Date() > new Date(course.evaluationEndDate);
    }

    function isNotYetStarted(course: Course): boolean {
      if (!course.evaluationStartDate) return false;
      return new Date() < new Date(course.evaluationStartDate);
    }

    function start(course: Course) {
      // Guardar las fechas de evaluación en sessionStorage para validación en EvaluationExecution
      if (course.evaluationStartDate || course.evaluationEndDate) {
        sessionStorage.setItem(
          `evaluation_dates_${course.executionId}`,
          JSON.stringify({
            startDate: course.evaluationStartDate,
            endDate: course.evaluationEndDate,
          })
        );
      }

      router.push({
        name: 'evaluation-teacher.EvaluationExecution',
        params: { assignmentId: course.executionId },
      });
    }

    function mapExecutionToCourse(execution: EvaluationExecutionDto): Course {
      const formattedDate = execution.completedAt
        ? new Date(execution.completedAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : undefined;

      const formattedDueDate = execution.evaluation?.endDate
        ? new Date(execution.evaluation.endDate).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : undefined;

      return {
        id: execution.offeringSubjectId,
        executionId: execution.id,
        title: execution.subjectName,
        teacher: execution.evaluedName,
        status: execution.status === 'COMPLETED' ? 'completed' : 'pending',
        completedDate: formattedDate,
        dueDate: formattedDueDate,
        progress: execution.progress,
        evaluationStartDate: execution.evaluation?.startDate,
        evaluationEndDate: execution.evaluation?.endDate,
      };
    }

    async function loadData() {
      loading.value = true;
      try {
        const listService = new GetEvaluationsListService();
        const statsService = new GetEvaluatorStatsService();

        const [listResponse, statsResponse] = await Promise.all([
          listService.run({ page: 1, perPage: 100 }),
          statsService.run({
            institutionId: institutionsService.getSelectedInstitution()?.id,
          }),
        ]);

        courses.value = listResponse.data.map(mapExecutionToCourse);
        stats.value = statsResponse.data;
      } catch (error) {
        console.error('Error al cargar evaluaciones:', error);
      } finally {
        loading.value = false;
      }
    }

    onMounted(loadData);

    return {
      courses,
      completedCount,
      pendingCount,
      overallProgress,
      isExpired,
      isNotYetStarted,
      start,
      loading,
    };
  },
});
</script>

<style scoped lang="scss">
.my-evals-page {
  .page-header {
    margin-bottom: 12px;
  }
  .page-header__title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 6px;
  }
  .page-header__sub {
    color: #6b7280;
    font-size: 13px;
  }
  .top-progress {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 12px;
    align-items: center;
    padding: 16px;
    background: #ffffff;
    border-radius: 12px;
    margin-bottom: 18px;
    box-shadow: 0 6px 18px rgba(14, 30, 64, 0.06);
  }

  .tp-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
    color: #fff;
  }
  .tp-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  .tp-content__top {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .tp-title {
    font-weight: 700;
    font-size: 16px;
  }
  .tp-sub {
    color: #6b7280;
    margin: 6px 0;
    font-size: 13px;
  }
  .tp-right {
    font-weight: 700;
    color: #2563eb;
    font-size: 16px;
    min-width: 56px;
    text-align: right;
  }
  .progress-bar {
    background: #e9eafc;
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    width: 100%;
  }
  .progress {
    height: 10px;
    background: linear-gradient(90deg, #6b46ff, #8b5cf6);
    border-radius: 999px;
    box-shadow: 0 4px 12px rgba(107, 70, 255, 0.18);
    margin-left: 0;
  }

  .section-title {
    margin: 18px 0;
    font-size: 18px;
  }

  .grid-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .course-card {
    background: #fff;
    padding: 14px;
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(14, 30, 64, 0.06);
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-title {
    font-weight: 600;
  }
  .card-badge {
    background: #ecfdf5;
    color: #059669;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 12px;
  }
  .card-badge.pending {
    background: #fff7ed;
    color: #d97706;
  }
  .card-badge.expired {
    background: #fef2f2;
    color: #dc2626;
  }
  .card-badge.not-started {
    background: #f3f4f6;
    color: #6b7280;
  }

  .card-teacher {
    color: #6b7280;
    font-size: 13px;
  }
  .card-date-block {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 10px;
    margin-top: auto;

    &__icon {
      color: #9ca3af;
      font-size: 14px;
      flex-shrink: 0;
    }

    &__text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    &__label {
      font-size: 11px;
      color: #9ca3af;
      line-height: 1.3;
    }

    &__value {
      font-size: 12px;
      color: #1f2937;
      line-height: 1.3;
    }
  }

  .small-progress {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .small-progress-bar {
    background: #f3f4f6;
    height: 6px;
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
  }
  .small-progress-fill {
    height: 6px;
    background: #10b981;
  }
  .small-progress-text {
    font-size: 12px;
    color: #6b7280;
  }

  .card-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    margin-top: 6px;
  }
  .completed-text {
    color: #10b981;
    font-weight: 600;
  }
  .expired-text {
    color: #dc2626;
    font-size: 13px;
    font-weight: 500;
  }

  .reminder {
    margin-top: 14px;
    padding: 12px;
    background: #fff7ed;
    border-radius: 8px;
    color: #92400e;
  }

  .loading-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
}

@media (max-width: 1024px) {
  .my-evals-page {
    .grid-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .top-progress {
      grid-template-columns: 48px 1fr 56px;
      gap: 10px;
      padding: 12px;
    }

    .tp-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
    }
    .tp-right {
      font-size: 16px;
      min-width: 48px;
    }
  }
}

@media (max-width: 600px) {
  .my-evals-page {
    .grid-cards {
      grid-template-columns: 1fr;
    }

    .top-progress {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      gap: 10px;
      align-items: start;
      padding: 12px;
    }

    .tp-icon {
      width: 44px;
      height: 44px;
    }
    .tp-content {
      width: 100%;
    }
    .tp-right {
      justify-self: end;
      font-size: 16px;
    }

    .course-card {
      padding: 12px;
    }
    .page-header__title {
      font-size: 18px;
    }
    .page-header__sub {
      font-size: 12px;
    }
  }
}
</style>
