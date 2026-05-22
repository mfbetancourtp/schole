<template>
  <AppBaseList :title="pageTitle" :subtitle="pageSubtitle">
    <template #actions>
      <AppButton variant="light" outlined @click="goBack" label="Volver" />

      <AppButton variant="primary" outline label="Crear malla curricular" style="color: white" @click="createNewGrid" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="grids-page">
        <div class="mb-4 d-flex align-items-center gap-3">
          <div>
            <h2 class="h4 fw-bold text-dark mb-1">Mallas Curriculares</h2>
          </div>
        </div>

        <AppEmptyResponse v-if="!grids.length" :show-image="false" />

        <AppAccordion v-else v-slot="{ accordionId }">
          <AppAccordionItem v-for="grid in grids" :key="grid.id" :accordion-id="accordionId">
            <template #head>
              <div class="gridAccordionHeader">
                <div class="gridAccordionHeader__left">
                  <div class="gridAccordionIcon">
                    <AppIcon icon="sitemap" />
                  </div>

                  <div class="gridAccordionMain">
                    <div class="gridTitleRow">
                      <h5 class="gridTitle">{{ grid.name || '-' }}</h5>
                      <span class="badge rounded-pill px-3 py-1 fw-medium border" :class="getStatusClass(grid.state)">
                        {{ grid.state || '-' }}
                      </span>
                    </div>

                    <div class="gridMeta">
                      <span class="mono">Código: {{ grid.code || '-' }}</span>
                      <span>Versión: {{ grid.version || '-' }}</span>
                    </div>

                    <div class="gridHeaderStats">
                      <div class="stat-box">
                        <div class="stat-label text-muted small mb-1">
                          {{ periodStatLabel }}
                        </div>
                        <div class="stat-value fw-medium text-dark d-flex align-items-center gap-2">
                          <AppIcon icon="layer-group" class="text-primary-blue" />
                          {{ getDisplayedPeriodCount(grid) }}
                        </div>
                      </div>

                      <div class="stat-box">
                        <div class="stat-label text-muted small mb-1">Asignaturas</div>
                        <div class="stat-value fw-medium text-dark d-flex align-items-center gap-2">
                          <AppIcon icon="book" class="text-success-green" />
                          {{ getDisplayedSubjectCount(grid) }}
                        </div>
                      </div>

                      <div class="stat-box">
                        <div class="stat-label text-muted small mb-1">Créditos totales</div>
                        <div class="stat-value fw-medium text-dark d-flex align-items-center gap-2">
                          <AppIcon icon="graduation-cap" class="text-purple" />
                          {{ getDisplayedCredits(grid) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="gridAccordionActions" @click.stop>
                  <AppButton variant="primary" outlined @click="manageGrid(grid.id)">
                    <AppIcon icon="edit" />
                    Gestionar
                  </AppButton>

                  <AppButton variant="primary" outlined @click="openEditDrawer(grid)">
                    <AppIcon icon="pen" />
                    Editar
                  </AppButton>

                  <AppButton variant="primary" outlined @click="viewGrid(grid.id)">
                    <AppIcon icon="eye" />
                    Ver
                  </AppButton>

                  <span class="gridActionTooltipWrapper" v-tooltip="getDeleteTooltip(grid)">
                    <AppButton variant="danger" outlined :disabled="hasCurriculumPeriods(grid)" @click="openDeleteModal(grid)">
                      <AppIcon icon="trash" />
                      Eliminar
                    </AppButton>
                  </span>
                </div>
              </div>
            </template>

            <template #content>
              <div class="gridAccordionContent">
                <div class="gridSummaryRow">
                  <!-- <div class="gridSummaryPill">
                    <span class="gridSummaryPill__label">Modalidad</span>
                    <span class="gridSummaryPill__value">
                      {{ grid.modalityType?.name || '-' }}
                    </span>
                  </div> -->

                  <div class="gridSummaryPill">
                    <span class="gridSummaryPill__label">Créditos totales</span>
                    <span class="gridSummaryPill__value">
                      {{ grid.totalCredits ?? '-' }}
                    </span>
                  </div>

                  <div class="gridSummaryPill">
                    <span class="gridSummaryPill__label">Fecha inicio</span>
                    <span class="gridSummaryPill__value">
                      {{ formatDisplayDate(grid.startDate) }}
                    </span>
                  </div>

                  <div class="gridSummaryPill">
                    <span class="gridSummaryPill__label">Fecha fin</span>
                    <span class="gridSummaryPill__value">
                      {{ formatDisplayDate(grid.endDate) }}
                    </span>
                  </div>
                </div>

                <div class="row g-4">
                  <div class="col-12">
                    <div class="grid-detail-label">Descripción</div>
                    <div class="grid-detail-value">
                      {{ grid.description || '-' }}
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="grid-detail-label">Registro calificado</div>
                    <div class="grid-detail-value">
                      {{ grid.qualifiedRegistration || '-' }}
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="grid-detail-label">Registro interno</div>
                    <div class="grid-detail-value">
                      {{ grid.internalRegistration || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </AppAccordionItem>
        </AppAccordion>

        <div class="alert-info-box d-flex gap-3 p-3 rounded-3 border mt-3">
          <div class="alert-icon mt-1">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; font-size: 12px">
              <AppIcon icon="info" />
            </div>
          </div>
          <div class="alert-content">
            <h6 class="fw-bold text-primary mb-1" style="font-size: 14px">Gestión de versiones</h6>
            <p class="mb-0 text-primary opacity-75 small" style="font-size: 13px">
              Solo puede existir una malla curricular activa por programa. Puedes crear nuevas versiones y activarlas cuando estén listas. Las mallas anteriores pasarán automáticamente a estado
              histórico.
            </p>
          </div>
        </div>
      </div>
    </template>
  </AppBaseList>

  <CurricularGridFormDrawer v-if="isDrawerVisible" :isVisible="isDrawerVisible" :programId="programId" :grid="gridToEdit" @close="closeDrawer" @saved="onGridSaved" />

  <AppModal v-model="showDeleteModal">
    <AppConfirmDeleteModal v-if="showDeleteModal" entity="malla curricular" @confirmDelete="handleDelete" />
  </AppModal>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import CurricularGridFormDrawer from '../components/CurricularGridFormDrawer.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetProgramCurriculumsService } from '../services/getProgramCurriculums.service';
import { DeleteProgramCurriculumsService } from '../services/deleteProgramCurriculums.service';
import { GetProgramsService } from '../services/getPrograms.service';
import { ProgramCurriculumDto } from '../dtos/programCurriculum.dto';

dayjs.extend(customParseFormat);
dayjs.locale('es');

const getProgramCurriculumsService = new GetProgramCurriculumsService();
const deleteProgramCurriculumsService = new DeleteProgramCurriculumsService();
const getProgramsService = new GetProgramsService();

export default defineComponent({
  name: 'CurricularGrids',
  components: {
    AppBaseList,
    AppAccordion,
    AppAccordionItem,
    AppButton,
    AppIcon,
    AppLoading,
    AppEmptyResponse,
    AppModal,
    AppConfirmDeleteModal,
    CurricularGridFormDrawer,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const headerStorage = useHeaderStore();

    const loading = ref(true);
    const isDrawerVisible = ref(false);
    const showDeleteModal = ref(false);
    const grids = ref<ProgramCurriculumDto[]>([]);
    const gridToDelete = ref<ProgramCurriculumDto | null>(null);
    const gridToEdit = ref<ProgramCurriculumDto | null>(null);

    const getRouteValue = (value: unknown) => {
      if (Array.isArray(value)) {
        return value[0] || '';
      }

      return typeof value === 'string' ? value : '';
    };

    const programId = computed(() => {
      return Number(getRouteValue(route.query.programsId)) || Number(getRouteValue(route.params.id)) || 0;
    });
    const programName = ref(`Programa ${programId.value || '-'}`);

    const pageTitle = computed(() => 'Mallas Curriculares');
    const pageSubtitle = computed(() => `${programName.value} · ID: ${programId.value || '-'}`);
    const periodStatLabel = computed(() => getRouteValue(route.query.periodLabel) || 'Semestres');

    const formatDisplayDate = (dateString?: string | null) => {
      if (!dateString || dateString.startsWith('0000-00-00')) return '-';

      const parsedDate = dayjs(dateString).isValid()
        ? dayjs(dateString)
        : dayjs(dateString, ['DD/MM/YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'], true);

      if (!parsedDate.isValid()) return '-';

      return parsedDate.format('DD/MM/YYYY HH:mm');
    };

    const getStatusClass = (status: string) => {
      switch (status) {
        case 'Activo':
          return 'bg-success-light text-success border-success-subtle';
        case 'Histórico':
          return 'bg-primary-light text-primary border-primary-subtle';
        case 'Borrador':
          return 'bg-warning-light text-warning border-warning-subtle';
        default:
          return 'bg-secondary-light text-secondary border-secondary-subtle';
      }
    };

    const formatCount = (value: number, singularLabel: string, pluralLabel: string) => {
      return `${value} ${value === 1 ? singularLabel : pluralLabel}`;
    };

    const getPeriodCount = (grid: ProgramCurriculumDto) => {
      return grid.curriculumPeriods?.length || 0;
    };

    const getSubjectCount = (grid: ProgramCurriculumDto) => {
      return (
        grid.curriculumPeriods?.reduce((total, period) => {
          return total + (period.periodSubjects?.length || 0);
        }, 0) || 0
      );
    };

    const getDisplayedPeriodCount = (grid: ProgramCurriculumDto) => {
      return grid.semesterNumber ?? getPeriodCount(grid);
    };

    const getDisplayedSubjectCount = (grid: ProgramCurriculumDto) => {
      return grid.subjectNumber ?? getSubjectCount(grid);
    };

    const getDisplayedCredits = (grid: ProgramCurriculumDto) => {
      return grid.totalCredits ?? '-';
    };

    const hasCurriculumPeriods = (grid: ProgramCurriculumDto) => {
      return Boolean(grid.curriculumPeriods?.length);
    };

    const getDeleteTooltip = (grid: ProgramCurriculumDto) => {
      return hasCurriculumPeriods(grid) ? 'No se puede eliminar la malla curricular: existen registros relacionados.' : '';
    };

    const loadProgramCurriculums = async () => {
      if (!programId.value) {
        grids.value = [];
        loading.value = false;
        return;
      }

      loading.value = true;

      try {
        const response = await getProgramCurriculumsService.run({
          programId: programId.value,
          noPag: true,
          order: 'DESC',
        });

        grids.value = Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error al obtener las mallas curriculares del programa:', error);
        grids.value = [];
      } finally {
        loading.value = false;
      }
    };

    const loadProgramName = async () => {
      if (!programId.value) return;

      try {
        const response = await getProgramsService.run({
          noPag: true,
          id: programId.value,
        });
        const program = Array.isArray(response) ? response[0] : Array.isArray(response?.data) ? response.data[0] : null;
        programName.value = program?.name || program?.shortName || `Programa ${programId.value}`;
      } catch {
        programName.value = `Programa ${programId.value}`;
      }
    };

    onMounted(async () => {
      headerStorage.module = { name: 'Diseño Curricular', url: '' };
      headerStorage.moduleItem = {
        name: 'Programas académicos',
        url: '/academicPrograms',
      };
      headerStorage.moduleSubItem = {
        name: 'Mallas Curriculares',
        url: '',
      };

      await Promise.all([loadProgramName(), loadProgramCurriculums()]);
    });

    const createNewGrid = () => {
      gridToEdit.value = null;
      isDrawerVisible.value = true;
    };

    const openEditDrawer = (grid: ProgramCurriculumDto) => {
      gridToEdit.value = grid;
      isDrawerVisible.value = true;
    };

    const closeDrawer = () => {
      isDrawerVisible.value = false;
      gridToEdit.value = null;
    };

    const onGridSaved = async () => {
      closeDrawer();
      await loadProgramCurriculums();
    };

    const openDeleteModal = (grid: ProgramCurriculumDto) => {
      if (hasCurriculumPeriods(grid)) return;

      gridToDelete.value = grid;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      gridToDelete.value = null;
    };

    const handleDelete = async () => {
      if (!gridToDelete.value?.id) return;

      try {
        await deleteProgramCurriculumsService.run(gridToDelete.value.id);
        closeDeleteModal();
        await loadProgramCurriculums();
      } catch (error) {
        console.error('Error al eliminar la malla curricular:', error);
      }
    };

    const manageGrid = (gridId: number) => {
      if (!gridId) return;

      const { programName: _ignored, ...queryWithoutProgramName } = route.query;

      router.push({
        name: 'institutionalConfiguration.curricularGridManage',
        params: { id: programId.value, gridId: gridId.toString() },
        query: queryWithoutProgramName,
      });
    };

    const viewGrid = (gridId: number) => {
      if (!gridId) return;

      router.push({
        name: 'institutionalConfiguration.curricularGridDetail',
        params: { id: programId.value, gridId },
        query: {
          ...route.query,
        },
      });
    };

    const goBack = () => {
      router.push({ name: 'institutionalConfiguration.academicPrograms' });
    };

    watch(programId, (newProgramId, oldProgramId) => {
      if (newProgramId !== oldProgramId) {
        loadProgramCurriculums();
      }
    });

    return {
      loading,
      grids,
      programId,
      programName,
      pageTitle,
      pageSubtitle,
      periodStatLabel,
      isDrawerVisible,
      showDeleteModal,
      formatDisplayDate,
      getStatusClass,
      formatCount,
      getPeriodCount,
      getSubjectCount,
      getDisplayedPeriodCount,
      getDisplayedSubjectCount,
      getDisplayedCredits,
      hasCurriculumPeriods,
      getDeleteTooltip,
      createNewGrid,
      openEditDrawer,
      closeDrawer,
      onGridSaved,
      openDeleteModal,
      closeDeleteModal,
      handleDelete,
      viewGrid,
      manageGrid,
      goBack,
      gridToEdit,
    };
  },
});
</script>

<style scoped>
.gridsAccordion {
  display: block;
}

.gridAccordionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.gridAccordionHeader__left {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 0;
  width: 100%;
}

.gridAccordionIcon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.gridAccordionMain {
  min-width: 0;
  flex: 1;
}

.gridTitleRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
}

.gridTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.gridMeta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 0.85rem;
}

.gridHeaderStats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-box {
  min-width: 0;
  padding: 0.8rem 0.9rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
}

.stat-value {
  font-size: 0.95rem;
}

.text-primary-blue {
  color: #2563eb;
}

.text-success-green {
  color: #16a34a;
}

.text-purple {
  color: #9333ea;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
}

.gridAccordionActions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.gridActionButton {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.gridActionTooltipWrapper {
  display: inline-flex;
}

.gridAccordionContent {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.gridSummaryRow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.gridSummaryPill {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.gridSummaryPill__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
}

.gridSummaryPill__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.grid-detail-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.grid-detail-value {
  color: #111827;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.bg-success-light {
  background-color: #e6f4ea !important;
}

.bg-primary-light {
  background-color: #eff6ff !important;
}

.bg-warning-light {
  background-color: #fff7e6 !important;
}

.bg-secondary-light {
  background-color: #f3f4f6 !important;
}

.alert-info-box {
  background-color: #eff6ff;
  border-color: #bfdbfe !important;
}

:deep(.gridAccordionItem .o-accordion-button) {
  align-items: flex-start;
}

:deep(.gridAccordionItem .o-accordion-body) {
  padding-top: 0;
}

@media (max-width: 992px) {
  .gridAccordionHeader {
    flex-direction: column;
  }

  .gridAccordionMain {
    width: 100%;
  }

  .gridAccordionActions {
    width: 100%;
  }

  .gridHeaderStats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gridSummaryRow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 576px) {
  .gridAccordionHeader__left {
    width: 100%;
  }

  .gridAccordionActions {
    flex-direction: column;
    align-items: stretch;
  }

  .gridHeaderStats {
    grid-template-columns: 1fr;
  }

  .gridSummaryRow {
    grid-template-columns: 1fr;
  }
}
</style>
