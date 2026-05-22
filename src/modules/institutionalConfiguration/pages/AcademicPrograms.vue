<template>
  <AppBaseList title="Programas Académicos">
    <template #content>
      <div class="programs-page">
        <div class="mb-4">
          <h2 class="h4 fw-bold text-dark mb-1">Programas Académicos</h2>
          <p class="text-muted mb-0">Gestiona todos los programas académicos de la institución</p>
        </div>

        <AppDatatable :name="'programs-table'" :service="service" :params="tableParams">
          <template #filters>
            <AppFilter v-model="filters.levelId" filter-name="programs-table.levelId">
              <label>Nivel académico</label>
              <v-select v-model="filters.levelId" :options="educationLevels" label="name" :reduce="(opt: any) => opt.id" placeholder="Nivel académico" />
            </AppFilter>

            <AppFilter v-model="filters.status" filter-name="programs-table.status">
              <label>Estado</label>
              <v-select
                v-model="filters.status"
                :options="[
                  { id: 'Activo', name: 'Activo' },
                  { id: 'Inactivo', name: 'Inactivo' },
                  { id: 'En diseño', name: 'En diseño' },
                ]"
                label="name"
                :reduce="(opt: any) => opt.id"
                placeholder="Estado"
              />
            </AppFilter>
          </template>
          <AppDatatableColumn v-slot="{ row }" field="name" label="Nombre" sortable>
            <span class="fw-medium">{{ row.name || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" field="code" label="Código" sortable>
            <span class="text-muted">{{ row.code || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" field="programTitle" label="Título" sortable>
            <span>{{ row.programTitle || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" field="department.faculty.name" label="Facultad" sortable>
            <span>{{ row.department?.faculty?.name || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" field="department.name" label="Departamento" sortable>
            <span>{{ row.department?.name || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" field="operationalScheme.name" label="Esquema" sortable>
            <span>{{ row.operationalScheme?.name || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" field="state" label="Estado" sortable>
            <span class="badge rounded-pill px-3 py-2" :class="getStatusClass(row.state)">
              {{ row.state || '-' }}
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" field="expirationDate" label="Vigencia" sortable>
            <span class="text-muted">{{ formatDate(row.expirationDate) }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" label="Acciones" :thAttrs="() => ({ class: 'text-end pe-4' })" :tdAttrs="() => ({ class: 'actions-cell' })">
            <div class="actions-cell w-100 h-100">
              <AppButton class="me-3" outlined variant="info" v-tooltip="'Plan de estudios'" size="sm" :disabled="row.state !== 'Activo'" @click="goToCurricularGrids(row)">
                <AppIcon icon="sitemap" class="me-2" />
                Plan de estudios
              </AppButton>

              <AppButtonGroup size="sm">
                <AppButton icon="eye" outlined variant="secondary" v-tooltip="'Ver'" size="sm" @click="openDetail(row)" />

                <AppButtonEdit @click="openForm(row)" />

                <AppButton
                  v-if="row.state === 'Activo'"
                  class="text-danger border-danger action-icon-btn"
                  icon="power-off"
                  outlined
                  variant="danger"
                  v-tooltip="'Desactivar'"
                  size="sm"
                  @click="openDeactivateModal(row)"
                />

                <AppButton v-else class="text-success border-success action-icon-btn" icon="undo" outlined variant="success" v-tooltip="'Activar'" size="sm" @click="activateProgram(row)" />
              </AppButtonGroup>
            </div>
          </AppDatatableColumn>
        </AppDatatable>
      </div>

      <ProgramDetailDrawer :isVisible="isDetailVisible" :loading="isDetailLoading" :program="selectedProgram" @close="closeDetail" @edit="openForm" @deactivate="openDeactivateModal" />

      <ProgramForm
        v-if="isFormVisible"
        :isVisible="isFormVisible"
        :data="selectedProgram"
        :programsData="programsData"
        :programsTypesData="programsTypes"
        :ratingScalesData="ratingScalesData"
        :isEditing="!!selectedProgram"
        @saved="handleProgramSaved"
        @close="closeForm"
      />

      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" :entity="'Programa Académico'" @confirmDelete="handleDelete" />
      </AppModal>

      <AppModal v-model="showDeactivateModal" size="md">
        <ProgramDeactivateModal v-if="showDeactivateModal" :program="programToDeactivate" @close="closeDeactivateModal" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import ProgramDetailDrawer from '../components/ProgramDetailDrawer.vue';
import ProgramForm from '../components/ProgramForm.vue';
import ProgramDeactivateModal from '../components/ProgramDeactivateModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';

import { GetProgramsService } from '../services/getPrograms.service';
import { DeleteProgramsService } from '../services/deletePrograms.service';
import { GetEducationTypesService } from '../services/getEducationTypes.service';
import { GetModalityTypesService } from '../services/getModalityTypes.service';
import { GetPeriodTypesService } from '../services/getPeriodTypes.service';
import { ProgramDto } from '../dtos/programs.dto';
import { useHeaderStore } from '../../../stores/header.store';
import { GetProgramTypesService } from '../../curriculumDesign/services/getProgramTypes.service';
import { GetRatingScalesService } from '../services/getRatingScales.service';
import { CreateOrUpdateProgramsService } from '../services/createOrUpdatePrograms.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

const deleteProgramsService = new DeleteProgramsService();
const createOrUpdateProgramsService = new CreateOrUpdateProgramsService();
const service = new GetProgramsService();
const getProgramsService = new GetProgramsService();
const getProgramTypesService = new GetProgramTypesService();
const getRatingScalesService = new GetRatingScalesService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'AcademicPrograms',
  components: {
    AppDatatable,
    AppDatatableColumn,
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonGroup,
    AppModal,
    AppConfirmDeleteModal,
    AppIcon,
    ProgramDetailDrawer,
    ProgramForm,
    ProgramDeactivateModal,
    AppFilter,
  },
  setup() {
    const selectedProgram = ref<ProgramDto | null>(null);
    const programsData = ref<any | null>(null);
    const programsTypes = ref<any | null>(null);
    const ratingScalesData = ref<any[]>([]);
    const programToDelete = ref<ProgramDto | null>(null);
    const router = useRouter();
    const headerStorage = useHeaderStore();

    const isDetailVisible = ref(false);
    const isDetailLoading = ref(false);
    const isFormVisible = ref(false);
    const showDeleteModal = ref(false);
    const showDeactivateModal = ref(false);
    const programToDeactivate = ref<ProgramDto | null>(null);

    const educationLevels = ref<any[]>([]);
    const modalityTypes = ref<any[]>([]);
    const periodTypes = ref<any[]>([]);

    const filters = reactive({
      search: '',
      levelId: null as number | null,
      status: null as string | null,
    });

    const activeFiltersCount = computed(() => {
      let count = 0;
      if (filters.search) count++;
      if (filters.levelId) count++;
      if (filters.status) count++;
      return count;
    });

    const tableParams = computed(() => ({
      state: filters.status || undefined,
      levelId: filters.levelId || undefined,
    }));

    const loadRefData = async () => {
      try {
        const [levels, modalities, periods] = await Promise.all([
          new GetEducationTypesService().run({ noPag: true }),
          new GetModalityTypesService().run({ noPag: true }),
          new GetPeriodTypesService().run({ noPag: true }),
        ]);

        educationLevels.value = levels.data || levels;
        modalityTypes.value = modalities.data || modalities;
        periodTypes.value = periods.data || periods;
      } catch (error) {
        console.error('Error loading filters data', error);
      }
    };

    const formatDate = (date: string | null) => {
      if (!date) return '-';

      return new Date(date).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const getStatusClass = (status: string) => {
      switch (status) {
        case 'Activo':
          return 'bg-success-light text-success';
        case 'Inactivo':
          return 'bg-secondary-light text-secondary';
        case 'En diseño':
          return 'bg-warning-light text-warning';
        case 'En actualización':
          return 'bg-info-light text-info';
        default:
          return 'bg-secondary-light text-secondary';
      }
    };

    const clearFilters = () => {
      filters.search = '';
      filters.levelId = null;
      filters.status = null;
    };

    const openForm = async (program: ProgramDto | null) => {
      selectedProgram.value = program ? { ...program } : null;
      const responsePrograms = await getProgramsService.run({ noPag: true });
      const responseProgramsType = await getProgramTypesService.run({
        noPag: true,
      });
      const responseRatingScales = await getRatingScalesService.run({
        noPag: true,
      });

      programsData.value = responsePrograms;
      programsTypes.value = responseProgramsType;
      ratingScalesData.value = responseRatingScales?.data ?? responseRatingScales ?? [];

      isFormVisible.value = true;
      isDetailVisible.value = false;
    };

    const closeForm = () => {
      isFormVisible.value = false;
      selectedProgram.value = null;
    };

    const handleProgramSaved = () => {
      updateDatatableService.run();
    };

    const openDetail = async (program: ProgramDto) => {
      isDetailVisible.value = true;
      isDetailLoading.value = true;
      selectedProgram.value = null;

      try {
        const response = await getProgramsService.run({
          noPag: true,
          id: program.id,
        });

        const detailedProgram = Array.isArray(response) ? response[0] : Array.isArray(response?.data) ? response.data[0] : null;

        selectedProgram.value = detailedProgram || program;
      } catch (error) {
        console.error('Error al cargar el detalle del programa:', error);
        selectedProgram.value = program;
      } finally {
        isDetailLoading.value = false;
      }

      isDetailVisible.value = true;
    };

    const closeDetail = () => {
      isDetailVisible.value = false;
      isDetailLoading.value = false;
      selectedProgram.value = null;
    };

    const openDeactivateModal = (program: ProgramDto) => {
      programToDeactivate.value = program;
      showDeactivateModal.value = true;
    };

    const closeDeactivateModal = () => {
      showDeactivateModal.value = false;
      programToDeactivate.value = null;
      document.dispatchEvent(new CustomEvent('updateDatatable'));
    };

    const activateProgram = async (program: ProgramDto) => {
      if (!program?.id) return;
      try {
        await createOrUpdateProgramsService.run(
          {
            inactivationReasonId: null,
            inactivationObservations: null,
            state: 'Activo',
          },
          program.id
        );
        document.dispatchEvent(new CustomEvent('updateDatatable'));
      } catch (error) {
        console.error('Error al activar el programa:', error);
      }
    };

    const confirmDelete = (program: ProgramDto) => {
      programToDelete.value = program;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      if (!programToDelete.value?.id) return;

      try {
        await deleteProgramsService.run(programToDelete.value.id);
        closeDeleteModal();
      } catch (error) {
        console.error('Error al eliminar el programa:', error);
      }
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      programToDelete.value = null;
    };

    const goToCurricularGrids = (program: ProgramDto) => {
      if (program.id) {
        const query: Record<string, string> = {
          programsId: program.id.toString(),
        };

        const operationalSchemeId = program.operationalSchemeId ?? program.operationalScheme?.id;

        if (operationalSchemeId) {
          query.operationalSchemeId = operationalSchemeId.toString();
        }

        router.push({
          name: 'institutionalConfiguration.curricularGrids',
          params: { id: program.id },
          query,
        });
      }
    };

    onMounted(() => {
      headerStorage.module = { name: 'Diseño Curricular', url: '' };
      headerStorage.moduleItem = {
        name: 'Programas académicos',
        url: '/academicPrograms',
      };
      headerStorage.moduleSubItem = { name: '', url: '' };

      loadRefData();
    });

    return {
      activeFiltersCount,
      filters,
      tableParams,
      educationLevels,
      modalityTypes,
      periodTypes,
      isDetailVisible,
      isDetailLoading,
      isFormVisible,
      showDeleteModal,
      selectedProgram,
      programsData,
      programsTypes,
      ratingScalesData,
      getStatusClass,
      formatDate,
      clearFilters,
      openForm,
      closeForm,
      handleProgramSaved,
      openDetail,
      closeDetail,
      activateProgram,
      confirmDelete,
      handleDelete,
      showDeactivateModal,
      programToDeactivate,
      openDeactivateModal,
      closeDeactivateModal,
      goToCurricularGrids,
      service,
    };
  },
});
</script>

<style scoped>
.programs-page {
  padding: 0;
}

.filters-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.filters-inputs {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.btn-plan-estudios {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #bfdbfe;
  background-color: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-plan-estudios:hover {
  background-color: #dbeafe;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  color: #111827 !important;
}

.pagination-wrapper {
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.btn-paginate {
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  padding: 4px 8px;
  cursor: pointer;
}

.btn-paginate:hover:not(:disabled) {
  color: #111827;
}

.btn-paginate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .filters-inputs {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .filters-inputs {
    grid-template-columns: 1fr;
  }
}

.action-icon-btn:hover {
  background-color: transparent !important;
  color: inherit !important;
}

.bg-success-light {
  background-color: #e6f4ea;
}

.bg-secondary-light {
  background-color: #f1f3f4;
}

.bg-danger-light {
  background-color: #fce8e6;
}
</style>
