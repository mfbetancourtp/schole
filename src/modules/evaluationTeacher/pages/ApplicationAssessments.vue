<template>
  <AppBaseList title="Evaluaciones Docentes">
    <template #actions>
      <AppCheckPermission permission="assessmentApplication.create">
        <AppButton style="color: white" @click="openDrawer()">
          <AppIcon icon="plus" />
          Nueva Evaluación
        </AppButton>
      </AppCheckPermission>
    </template>
    <template #content>
      <!-- Header (acciones) -->
      <div class="pageHeader">
        <div class="pageHeader__left">
          <p class="pageHeader__subtitle">Gestiona y monitorea las evaluaciones del semestre</p>
        </div>
      </div>

      <div class="pageBody">
        <!-- Stats (como el ejemplo: 3 cards) -->
        <!-- Stats Dashboard (como tu ejemplo AppCardDashboard) -->
        <div class="cards-dashboard-container">
          <AppCardDashboard v-for="(card, index) in statsCards" :key="index" class="container-custom-card" :style="{ backgroundColor: card.color }">
            <template #title>
              <span class="dashCard__title">{{ card.title }}</span>
            </template>

            <template #body>
              <div class="dashCard__body">
                <div class="dashCard__left">
                  <h3 class="dashCard__value">{{ card.value }}</h3>

                  <p v-if="card.subtitle" class="dashCard__subtitle">
                    {{ card.subtitle }}
                  </p>

                  <p
                    v-if="card.trend"
                    class="dashCard__trend"
                    :class="{
                      'dashCard__trend--positive': card.trend.isPositive,
                    }"
                  >
                    ↑ {{ card.trend.value }}
                  </p>
                </div>

                <div class="dashCard__iconBox">
                  <AppGetIcon class="dashCard__icon" :name="card.icon" />
                </div>
              </div>
            </template>
          </AppCardDashboard>
        </div>

        <!-- Main Grid (2/1) -->
        <div class="mainGrid">
          <!-- Left: list -->
          <div class="leftCol">
            <div class="listHeader">
              <h2 class="listHeader__title">Encuestas Actuales</h2>
            </div>

            <!-- Search / filtros avanzados -->
            <div class="filtersRow">
              <EvaluationFilters v-model:search="search" v-model:status="status" :statuses="evaluationStatuses" />
            </div>

            <!-- List -->
            <div class="cardsList" style="position: relative">
              <AppLoading v-if="isLoading" />

              <div v-else>
                <EvaluationCard v-for="evaluation in filteredEvaluations" :key="evaluation.id" :evaluation="evaluation" @edit="editEvaluation" @delete="requestDelete" />
              </div>
            </div>

            <AppEmptyResponse v-if="!filteredEvaluations.length && !isLoading" title="Sin evaluaciones" subtitle="Prueba agregando una evaluación." />

            <div class="paginationWrapper">
              <AppPagination v-model:current="currentPage" :total="totalItems" :per-page="perPage" :loading="isLoading" />
            </div>
          </div>

          <!-- Right: participation -->
          <div class="rightCol">
            <ParticipationCard :completed="studentParticipationCompleted" :pending="studentParticipationPending" :rate="studentParticipationRate" />
          </div>
        </div>
      </div>

      <!-- Modal crear/editar ciclo de evaluación -->
      <EvaluationCycleFormModal v-model:isVisible="showDrawer" :evaluation="selectedEvaluation" @saved="handleSavedEvaluation" />

      <!-- Confirmar eliminación -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" entity="la evaluación" @confirmDelete="confirmDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

import EvaluationCard from '../components/EvaluationCard.vue';
import EvaluationCycleFormModal from '../components/EvaluationCycleFormModal.vue';
import EvaluationFilters from '../components/EvaluationFilters.vue';
import ParticipationCard from '../components/ParticipationCard.vue';
import AppPagination from '../../../shared/components/AppPagination.vue';

import type { EvaluationDto } from '../dtos/applicationAssessments.dto';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetEvaluationsService } from '../services/getEvaluations.service';
import { GetEvaluationByIdService } from '../services/getEvaluationById.service';
import { DeleteEvaluationService } from '../services/deleteEvaluation.service';
import { GetDashboardSummaryService } from '../services/getDashboardSummary.service';
import { GetStudentParticipationService } from '../services/getStudentParticipation.service';
import { GetEvaluationRelatedDataService } from '../services/getEvaluationRelatedData.service';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

export default defineComponent({
  name: 'ApplicationAssessments',
  components: {
    AppBaseList,
    AppButton,
    AppEmptyResponse,
    AppIcon,
    AppCheckPermission,

    EvaluationCard,
    EvaluationCycleFormModal,
    EvaluationFilters,
    ParticipationCard,
    AppPagination,
    AppCardDashboard,
    AppGetIcon,
    AppLoading,
    AppModal,
    AppConfirmDeleteModal,
  },

  setup() {
    const getEvaluationsService = new GetEvaluationsService();
    const getDashboardSummaryService = new GetDashboardSummaryService();
    const getStudentParticipationService = new GetStudentParticipationService();
    const getEvaluationRelatedDataService = new GetEvaluationRelatedDataService();

    const evaluations = ref<EvaluationDto[]>([]);
    const search = ref('');
    const status = ref<string | null>(null);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalItems = ref(0);
    const isLoading = ref(false);
    const evaluationStatuses = ref<Array<{ label: string; key: string }>>([]);

    // Participación estudiantil
    const studentParticipationCompleted = ref(0);
    const studentParticipationPending = ref(0);
    const studentParticipationRate = ref('0%');

    const showDrawer = ref(false);
    const selectedEvaluation = ref<EvaluationDto | null>(null);

    const statsCards = ref([
      {
        title: 'Evaluaciones Activas',
        value: 0 as string | number,
        subtitle: 'En proceso actualmente' as string | undefined,
        color: '#FFFFFF',
        icon: 'clipboard-list',
        trend: undefined as { value: string; isPositive: boolean } | undefined,
      },
      {
        title: 'Total de Respuestas',
        value: 0 as string | number,
        subtitle: undefined as string | undefined,
        color: '#FFFFFF',
        icon: 'users-cog',
        trend: { value: '+12% vs. mes anterior', isPositive: true },
      },
      {
        title: 'Tasa de Participación',
        value: '0%' as string | number,
        subtitle: undefined as string | undefined,
        color: '#FFFFFF',
        icon: 'grafBar',
        trend: { value: '+5% vs. mes anterior', isPositive: true },
      },
    ]);

    const resolveInstitutionId = (): number | null => {
      try {
        const fromStorage = localStorage.getItem('institutionId');
        return fromStorage ? Number(fromStorage) : null;
      } catch (error) {
        console.error('Error resolving institution ID:', error);
        return null;
      }
    };

    async function loadDashboardSummary() {
      try {
        const institutionId = resolveInstitutionId();
        if (!institutionId) return;

        const res = await getDashboardSummaryService.run(institutionId);
        const summary = res?.data;

        if (summary) {
          statsCards.value[0].value = summary.activeEvaluations ?? 0;
          statsCards.value[1].value = summary.totalResponses ?? 0;
          statsCards.value[2].value = `${summary.participationRate ?? 0}%`;

          if (summary.totalResponsesGrowth !== undefined && summary.totalResponsesGrowth !== null) {
            statsCards.value[1].trend = {
              value: `+${summary.totalResponsesGrowth}% vs. mes anterior`,
              isPositive: summary.totalResponsesGrowth > 0,
            };
          }

          if (summary.participationRateGrowth !== undefined && summary.participationRateGrowth !== null) {
            statsCards.value[2].trend = {
              value: `+${summary.participationRateGrowth}% vs. mes anterior`,
              isPositive: summary.participationRateGrowth > 0,
            };
          }
        }
      } catch (error) {
        console.error('Error loading dashboard summary:', error);
      }
    }

    async function loadStudentParticipation() {
      try {
        const res = await getStudentParticipationService.run();
        const participation = res?.data;

        if (participation) {
          studentParticipationCompleted.value = participation.completed ?? 0;
          studentParticipationPending.value = participation.pending ?? 0;
          studentParticipationRate.value = `${participation.completedPercentage ?? 0}%`;
        }
      } catch (error) {
        console.error('Error loading student participation:', error);
      }
    }

    const filteredEvaluations = computed(() =>
      evaluations.value.filter((e: any) => {
        // Solo filtrar por nombre (el status ya está filtrado por la API)
        const name = (e.name ?? e.title ?? '').toLowerCase();
        return name.includes(search.value.toLowerCase());
      })
    );

    const openDrawer = async () => {
      selectedEvaluation.value = null;
      showDrawer.value = true;
    };

    const editEvaluation = async (e: EvaluationDto) => {
      try {
        const svc = new GetEvaluationByIdService();
        const res: any = await svc.run(String(e.id));
        const evaluationData = res?.data ?? res;
        selectedEvaluation.value = evaluationData;
      } catch (err) {
        selectedEvaluation.value = e;
      }
      showDrawer.value = true;
    };
    const evaluationToDelete = ref<EvaluationDto | null>(null);
    const showDeleteModal = ref(false);
    const deleteEvaluationService = new DeleteEvaluationService();

    function requestDelete(e: EvaluationDto) {
      evaluationToDelete.value = e;
      showDeleteModal.value = true;
    }

    async function confirmDelete() {
      if (!evaluationToDelete.value) return;
      const id = Number((evaluationToDelete.value as any).id);
      try {
        await deleteEvaluationService.run(id);
        if (selectedEvaluation.value?.id && String(selectedEvaluation.value.id) === String(id)) {
          selectedEvaluation.value = null;
          showDrawer.value = false;
        }
        // Si era el último elemento de la página actual, retroceder una página
        const isLastOnPage = evaluations.value.length === 1 && currentPage.value > 1;
        if (isLastOnPage) {
          currentPage.value--;
        } else {
          currentPage.value = 1;
        }
        await loadData(currentPage.value);
        // Recargar también los resúmenes y participación
        await loadDashboardSummary();
        await loadStudentParticipation();
      } finally {
        evaluationToDelete.value = null;
        showDeleteModal.value = false;
      }
    }

    function formatDate(iso?: string) {
      if (!iso) return '—';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    async function loadData(page = 1) {
      isLoading.value = true;
      try {
        const params: Record<string, any> = {
          page,
          perPage: perPage.value,
          search: search.value || undefined,
          status: status.value || undefined,
        };

        const res = await getEvaluationsService.run(params);

        const items = res && res.data ? res.data : Array.isArray(res) ? res : [];

        // pagination support
        if (res && res.pagination) {
          totalItems.value = res.pagination.total ?? 0;
          currentPage.value = res.pagination.page ?? page;
          perPage.value = res.pagination.perPage ?? perPage.value;
        } else {
          totalItems.value = items.length;
        }

        if (!items || items.length === 0) {
          evaluations.value = [];
          isLoading.value = false;
          return;
        }

        evaluations.value = items.map((it: any) => {
          return {
            id: String(it.id),
            name: it.name ?? it.title ?? `Evaluación ${it.id}`,
            description: it.description ?? '',
            status: it.status ?? 'draft',
            statusLabel: it.statusLabel ?? it.status ?? '',
            isActive: it.status === 'published' || it.status === 'active',
            totalResponses: it.completedResponses ?? it.totalResponses ?? it.responses ?? 0,
            totalStudents: it.totalExpectedResponses ?? it.totalStudents ?? it.students ?? 0,
            startDate: formatDate(it.startDate ?? it.start_at ?? ''),
            endDate: formatDate(it.endDate ?? it.end_at ?? ''),
            teachersAssigned: it.assignedTeachersCount ?? it.teachersAssigned ?? it.assignedTeachers ?? 0,
            // New fields consumed directly from API
            assignedTeachersCount: it.assignedTeachersCount ?? 0,
            completedResponses: it.completedResponses ?? 0,
            totalExpectedResponses: it.totalExpectedResponses ?? 0,
            participationRate: it.participationPercentage ?? it.participationRate ?? 0,
          } as any;
        });
      } catch (error) {
        evaluations.value = [];
      } finally {
        isLoading.value = false;
      }
    }
    const handleSavedEvaluation = async (_payload: any) => {
      showDrawer.value = false;
      selectedEvaluation.value = null;
      currentPage.value = 1;
      await loadData(1);
      // Recargar también los resúmenes y participación
      await loadDashboardSummary();
      await loadStudentParticipation();
    };

    async function loadEvaluationStatuses() {
      try {
        const res = await getEvaluationRelatedDataService.run();
        const data = res?.data ?? res;
        if (data?.evaluationStatus) {
          evaluationStatuses.value = data.evaluationStatus;
        }
      } catch (error) {
        console.error('Error loading evaluation statuses:', error);
      }
    }

    onMounted(() => {
      loadEvaluationStatuses();
      loadDashboardSummary();
      loadStudentParticipation();
      loadData(currentPage.value);
    });

    // reload when page, search or status changes
    watch(currentPage, (val) => {
      if (val) loadData(val);
    });

    watch([search, status], () => {
      currentPage.value = 1;
      loadData(1);
    });

    // Configure header
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Evaluación Docente', url: '' };
    headerStorage.moduleItem = { name: 'Aplicación de Evaluaciones', url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    return {
      evaluations,
      search,
      status,
      evaluationStatuses,

      currentPage,
      perPage,
      totalItems,
      isLoading,

      filteredEvaluations,

      studentParticipationCompleted,
      studentParticipationPending,
      studentParticipationRate,

      openDrawer,
      editEvaluation,
      evaluationToDelete,
      showDeleteModal,
      requestDelete,
      confirmDelete,
      loadData,
      handleSavedEvaluation,
      showDrawer,
      selectedEvaluation,
      statsCards,
    };
  },
});
</script>

<style scoped>
/* =========================
   Anti scroll horizontal
========================= */

/* Evita overflow horizontal global (por barras, 100vw, etc.) */
:global(html),
:global(body) {
  overflow-x: hidden;
}

/* Clave para grids/flex: permite que los hijos se encojan y no empujen el ancho */
.pageBody,
.mainGrid,
.leftCol,
.rightCol,
.cards-dashboard-container,
.cardsList {
  min-width: 0;
}

/* Si algún contenido interno (svg/chart) empuja, lo limitamos */
.rightCol :deep(.apexcharts-canvas),
.rightCol :deep(.apexcharts-svg),
.rightCol :deep(svg) {
  max-width: 100%;
}

/* =========================
   Layout general
========================= */

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* Mejor padding responsive (evita desbordes por lados en mobile) */
.pageBody {
  padding: 18px 0px 22px;
}

@media (min-width: 768px) {
  .pageBody {
    padding: 18px 0px 22px;
  }
}

.pageHeader__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

/* =========================
   Dashboard cards (AppCardDashboard)
========================= */

.cards-dashboard-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 18px;
  padding: 0;
}

@media (min-width: 768px) {
  /* OJO: tú ahora tienes 4 cards en mock, entonces debe ser 4 columnas en desktop */
  .cards-dashboard-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 22px;
  }
}

.container-custom-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}

/* contenido interno */
.dashCard__title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.dashCard__body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.dashCard__left {
  min-width: 0; /* ✅ evita desbordes por textos largos */
}

.dashCard__value {
  margin: 6px 0 0;
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  word-break: break-word; /* ✅ por si “Plantilla Estándar” empuja */
}

.dashCard__iconBox {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #eaf2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dashCard__icon {
  font-size: 18px;
  color: #2563eb;
}

/* Pagination layout tweak: keep pagination visually close to the list */
.paginationWrapper {
  display: flex;
  justify-content: flex-start;
  padding: 12px 18px 28px; /* match pageBody horizontal padding */
}

/* Skeleton styles removed — using shared `AppLoading` component */

:deep(.pagination) {
  margin: 0; /* remove extra spacing applied by the pagination lib */
}

:deep(.o-pag__ellipsis) {
  margin-left: 6px;
}

/* =========================
   Main grid (list + right card)
========================= */

.mainGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Desktop: 2 columnas (list + card derecha fija) */
@media (min-width: 1024px) {
  .mainGrid {
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 18px;
    align-items: start;
  }

  .rightCol {
    width: 360px;
    flex: 0 0 360px;
  }

  .rightCol :deep(*) {
    max-width: 100%;
  }
}

/* Mobile/tablet: desactiva sticky para evitar “saltos” y overflow raros */
@media (max-width: 1023px) {
  .rightCol {
    position: static;
    top: auto;
    width: 100%;
  }
}

.leftCol {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rightCol {
  position: sticky;
  top: 12px;
  height: fit-content;
}

/* =========================
   Header lista + tabs
========================= */

.listHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap; /* ✅ evita overflow si tabs no caben */
}

.listHeader__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap; /* ✅ */
  min-width: 0;
}

.tab {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
  color: #334155;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.tab:hover {
  background: #f8fafc;
}

.tab--active {
  border-color: #2563eb;
  color: #1d4ed8;
  background: #eff6ff;
}

.filtersRow {
  margin-top: 2px;
}

/* =========================
   List cards
========================= */

.cardsList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* contenido interno */
.dashCard__title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.dashCard__body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.dashCard__value {
  margin: 6px 0 0;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

.dashCard__subtitle {
  margin: 8px 0 0;
  font-size: 13px;
  color: #64748b;
}

.dashCard__trend {
  margin: 10px 0 0;
  font-size: 13px;
  font-weight: 800;
  color: #64748b;
}

.dashCard__trend--positive {
  color: #16a34a;
}

.dashCard__iconBox {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #eaf2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dashCard__icon {
  font-size: 18px;
  color: #2563eb;
}
</style>
