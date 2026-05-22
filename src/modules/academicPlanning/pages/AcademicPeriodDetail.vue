<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton style="color: white" :to="{ name: 'academicPlanning.academicPeriodsList' }"> Volver </AppButton>
      <AppCheckPermission permission="academicPlanning.academicPeriods.create">
        <AppButton style="color: white" @click="openAddProgramsModal">
          <AppIcon icon="plus" class="me-1" />
          Agregar Programas
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <div class="detail-container">
          <!-- Header with period info -->
          <div class="detail-header">
            <div class="detail-header-content">
              <div>
                <h1 class="detail-title">
                  {{ academicPeriodDetail.name }}
                </h1>
                <p class="detail-subtitle">
                  {{ academicPeriodDetail.startDate }} -
                  {{ academicPeriodDetail.endDate }}
                </p>
              </div>
              <div class="status-badge" :class="academicPeriodDetail.active ? 'status-active' : 'status-inactive'">
                {{ academicPeriodDetail.active ? 'Activo' : 'Inactivo' }}
              </div>
            </div>

            <!-- Oferta Académica Title -->
            <div class="detail-section-header">
              <h2 class="detail-section-title">Oferta Académica</h2>
              <p class="detail-section-subtitle">Gestiona los programas del período académico</p>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="statistics-grid">
            <AppCard>
              <template #body>
                <div class="stat-card">
                  <div class="stat-icon stat-icon-primary">
                    <AppIcon icon="graduation-cap" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">
                      {{ statistics?.totalPrograms || 0 }}
                    </div>
                    <div class="stat-label">Programas</div>
                  </div>
                </div>
              </template>
            </AppCard>

            <AppCard>
              <template #body>
                <div class="stat-card">
                  <div class="stat-icon stat-icon-success">
                    <AppIcon icon="users" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">
                      {{ statistics?.totalQuota || 0 }}
                    </div>
                    <div class="stat-label">Cupos Totales</div>
                  </div>
                </div>
              </template>
            </AppCard>

            <AppCard>
              <template #body>
                <div class="stat-card">
                  <div class="stat-icon stat-icon-warning">
                    <AppIcon icon="dollar-sign" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">${{ formatNumber(statistics?.averageValue || 0) }}</div>
                    <div class="stat-label">Valor Promedio</div>
                  </div>
                </div>
              </template>
            </AppCard>

            <AppCard>
              <template #body>
                <div class="stat-card">
                  <div class="stat-icon stat-icon-info">
                    <AppIcon icon="chart-line" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">
                      {{ statistics?.totalCuts || 0 }}
                    </div>
                    <div class="stat-label">Total Cortes</div>
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <!-- Programs List -->
          <div class="tw-mx-6 tw-mb-6 tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-overflow-hidden">
            <div class="tw-p-4">
              <!-- Header with title and toggle -->
              <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-0">Programas Asociados</h3>
                <!-- Toggle view: Table or Cards -->
                <div class="btn-group" role="group">
                  <button type="button" class="btn btn-sm" :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'" @click="viewMode = 'table'">
                    <AppIcon icon="list" />
                  </button>
                  <button type="button" class="btn btn-sm" :class="viewMode === 'cards' ? 'btn-primary' : 'btn-outline-secondary'" @click="viewMode = 'cards'">
                    <AppIcon icon="th" />
                  </button>
                </div>
              </div>

              <!-- Table View -->
              <AppDatatable
                v-if="viewMode === 'table'"
                name="academicPeriodPrograms"
                :data="filteredPrograms"
                :enable-search-filter="true"
                :paginated="true"
                :default-per-page="10"
                :show-filter-steps="true"
              >
                <template #filters>
                  <AppFilter v-if="programTypes && programTypes.length > 0" v-model="filters.programTypeId" filter-name="academicPeriodPrograms.programType">
                    <AppFormField label="Tipo de Programa">
                      <AppAutocomplete v-model="filters.programTypeId" :options="programTypes" input-id="programTypeId" />
                    </AppFormField>
                  </AppFilter>
                </template>

                <AppDatatableColumn label="Programa" field="programName" :sortable="true" v-slot="{ row }">
                  <div class="cell-code">{{ row.programName }}</div>
                </AppDatatableColumn>

                <AppDatatableColumn label="Tipo de Programa" field="programTypeName" :sortable="true" v-slot="{ row }">
                  <div class="cell-muted">{{ row.programTypeName || '-' }}</div>
                </AppDatatableColumn>

                <AppDatatableColumn label="Sede" field="campusName" :sortable="true" v-slot="{ row }">
                  <div class="cell-text">{{ row.campusName }}</div>
                </AppDatatableColumn>

                <AppDatatableColumn label="Facultad" field="facultieName" :sortable="true" v-slot="{ row }">
                  <div class="cell-muted">{{ row.facultieName || '-' }}</div>
                </AppDatatableColumn>

                <AppDatatableColumn label="Departamento" field="departmentName" :sortable="true" v-slot="{ row }">
                  <div class="cell-muted">{{ row.departmentName || '-' }}</div>
                </AppDatatableColumn>

                <AppDatatableColumn label="Director" field="directorProgramName" :sortable="true" v-slot="{ row }">
                  <div class="cell-text">
                    {{ row.directorProgramName || '-' }}
                  </div>
                </AppDatatableColumn>

                <AppDatatableColumn label="Cupos Min/Max" field="minCapacity" :sortable="true" v-slot="{ row }">
                  <div class="cell-text">{{ row.minCapacity }} / {{ row.maxCapacity }}</div>
                </AppDatatableColumn>

                <AppDatatableColumn label="Valor Período" field="periodValue" :sortable="true" v-slot="{ row }"> ${{ formatNumber(row.periodValue) }} </AppDatatableColumn>

                <AppDatatableColumn label="N° Cortes" field="totalCuts" :sortable="true" v-slot="{ row }">
                  {{ row.totalCuts }}
                </AppDatatableColumn>

                <AppDatatableColumn label="Acciones" v-slot="{ row }">
                  <AppButtonGroup>
                    <AppCheckPermission permission="academicPlanning.academicPeriods.update">
                      <AppButton variant="primary" outlined icon="cog" @click="openProgramConfigModal(row)" v-tooltip="'Configurar'" />
                    </AppCheckPermission>
                    <AppCheckPermission permission="academicPlanning.academicPeriods.delete">
                      <AppButtonDelete @click="openConfirmDeleteProgram(row)" />
                    </AppCheckPermission>
                  </AppButtonGroup>
                </AppDatatableColumn>
              </AppDatatable>

              <!-- Cards View -->
              <div v-else class="programs-cards-grid">
                <AppCard v-for="program in filteredPrograms" :key="program.id">
                  <template #title>
                    <div class="tw-flex tw-justify-between tw-items-start">
                      <div class="tw-flex-1">
                        <div class="tw-font-semibold">
                          {{ program.programName }}
                        </div>
                        <div class="tw-text-xs tw-text-gray-500 tw-mt-1">
                          {{ program.programTypeName }}
                        </div>
                      </div>
                    </div>
                  </template>

                  <template #body>
                    <div class="program-card-details">
                      <div class="program-detail-item">
                        <AppIcon icon="map-marker-alt" class="text-primary" />
                        <div>
                          <div class="tw-text-xs tw-text-gray-500">Sede</div>
                          <div class="tw-font-medium tw-text-sm">
                            {{ program.campusName }}
                          </div>
                        </div>
                      </div>

                      <div class="program-detail-item">
                        <AppIcon icon="building" class="text-info" />
                        <div>
                          <div class="tw-text-xs tw-text-gray-500">Facultad</div>
                          <div class="tw-font-medium tw-text-sm">
                            {{ program.facultieName || '-' }}
                          </div>
                        </div>
                      </div>

                      <div class="program-detail-item">
                        <AppIcon icon="university" class="text-secondary" />
                        <div>
                          <div class="tw-text-xs tw-text-gray-500">Departamento</div>
                          <div class="tw-font-medium tw-text-sm">
                            {{ program.departmentName || '-' }}
                          </div>
                        </div>
                      </div>

                      <div class="program-detail-item">
                        <AppIcon icon="user-tie" class="text-warning" />
                        <div>
                          <div class="tw-text-xs tw-text-gray-500">Director</div>
                          <div class="tw-font-medium tw-text-sm">
                            {{ program.directorProgramName || '-' }}
                          </div>
                        </div>
                      </div>

                      <div class="tw-grid tw-grid-cols-3 tw-gap-3 tw-mt-3 tw-pt-3 tw-border-t">
                        <div class="program-stat-compact">
                          <div class="tw-text-xs tw-text-gray-500">Cupos</div>
                          <div class="tw-font-semibold tw-text-primary">{{ program.minCapacity }}-{{ program.maxCapacity }}</div>
                        </div>
                        <div class="program-stat-compact">
                          <div class="tw-text-xs tw-text-gray-500">Valor</div>
                          <div class="tw-font-semibold tw-text-success">${{ formatNumber(program.periodValue) }}</div>
                        </div>
                        <div class="program-stat-compact">
                          <div class="tw-text-xs tw-text-gray-500">Cortes</div>
                          <div class="tw-font-semibold tw-text-info">
                            {{ program.totalCuts }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template #footer>
                    <div class="tw-flex tw-justify-end">
                      <AppButtonGroup>
                        <AppCheckPermission permission="academicPlanning.academicPeriods.update">
                          <AppButton variant="primary" outlined icon="cog" @click="openProgramConfigModal(program)" v-tooltip="'Configurar'" />
                        </AppCheckPermission>
                        <AppCheckPermission permission="academicPlanning.academicPeriods.delete">
                          <AppButtonDelete @click="openConfirmDeleteProgram(program)" />
                        </AppCheckPermission>
                      </AppButtonGroup>
                    </div>
                  </template>
                </AppCard>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Agregar Programas -->
        <AddProgramsDrawer
          :isVisible="addProgramsModal"
          @update:isVisible="addProgramsModal = $event"
          :academic-period-id="academicPeriodId"
          :academic-period-name="academicPeriodDetail.name"
          :existing-program-ids="existingProgramIds"
          @saved="handleProgramsAdded"
        />

        <!-- Drawer Configurar Programa -->
        <ProgramConfigurationDrawer
          v-if="currentProgram"
          :isVisible="programConfigModal"
          @update:isVisible="programConfigModal = $event"
          :academic-period-id="academicPeriodId"
          :data="currentProgram"
          @saved="closeProgramConfigModal"
        />

        <!-- Modal Confirmar Eliminar Programa -->
        <AppModal v-model="deleteProgramModal" :size="'sm'">
          <AppConfirmDeleteModal v-if="deleteProgramModal" entity="Programa" @confirmDelete="confirmDeleteProgram" />
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

import ProgramConfigurationDrawer from '../components/ProgramConfigurationDrawer.vue';
import AddProgramsDrawer from '../components/AddProgramsDrawer.vue';

import { AcademicPeriodStatisticsDto } from '../dtos/academicPeriodDetail.dto';
import { useHeaderStore } from '../../../stores/header.store';
import { GetAcademicPeriodDetailFullService } from '../services/getAcademicPeriodDetailFull.service';
import { GetProgramTypesService, ProgramTypeDto } from '../services/getProgramTypes.service';
import { GetCurriculumOfferingsService, CurriculumOfferingDto } from '../services/getCurriculumOfferings.service';
import { DeleteCurriculumOfferingService } from '../services/deleteCurriculumOffering.service';
import { ToastService } from '../../../shared/services/toast.service';

const getAcademicPeriodDetailService = new GetAcademicPeriodDetailFullService();
const getProgramTypesService = new GetProgramTypesService();
const getCurriculumOfferingsService = new GetCurriculumOfferingsService();
const deleteCurriculumOfferingService = new DeleteCurriculumOfferingService();
const toastService = new ToastService();

export default defineComponent({
  name: 'AcademicPeriodDetail',
  components: {
    AppBaseList,
    AppButton,
    AppButtonDelete,
    AppButtonGroup,
    AppCard,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppFormField,
    AppLoading,
    AppModal,
    AppConfirmDeleteModal,
    AppIcon,
    AppAutocomplete,
    AppCheckPermission,
    ProgramConfigurationDrawer,
    AddProgramsDrawer,
  },
  setup() {
    const route = useRoute();
    const title = 'Detalle Período Académico';
    useMeta({ title });

    const loading = ref(true);
    const academicPeriodId = ref(Number(route.params.academicPeriodId));

    const academicPeriodDetail = ref<any>({});
    const statistics = ref<AcademicPeriodStatisticsDto>({
      totalPrograms: 0,
      totalQuota: 0,
      averageValue: 0,
      totalCuts: 0,
    });
    const programs = ref<CurriculumOfferingDto[]>([]);
    const programTypes = ref<ProgramTypeDto[]>([]);
    const viewMode = ref<'table' | 'cards'>('table');

    const addProgramsModal = ref(false);
    const programConfigModal = ref(false);
    const deleteProgramModal = ref(false);
    const currentProgram = ref<CurriculumOfferingDto | null>(null);

    const filters = reactive({
      programTypeId: null as any,
    });

    const existingProgramIds = computed(() => {
      return programs.value.map((p) => `${p.programId}_${p.campusId}`).filter((id) => id !== undefined && id !== 'undefined_undefined') as string[];
    });

    const filteredPrograms = computed(() => {
      let data = programs.value;

      if (filters.programTypeId) {
        // filters.programTypeId es el id directamente (number)
        // Buscar el nombre del tipo de programa por id
        const selectedType = programTypes.value.find((pt) => pt.id === filters.programTypeId);

        if (selectedType) {
          data = data.filter((program) => program.programTypeName === selectedType.name);
        }
      }

      return data;
    });

    const loadDetail = async () => {
      try {
        loading.value = true;
        const [detail, programTypesResponse, curriculumOfferingsResponse] = await Promise.all([
          getAcademicPeriodDetailService.run(academicPeriodId.value),
          getProgramTypesService.run(),
          getCurriculumOfferingsService.run({
            academicPeriodId: academicPeriodId.value,
            perPage: 1000,
          }),
        ]);

        academicPeriodDetail.value = detail;
        statistics.value = detail.statistics;
        programTypes.value = programTypesResponse.data || programTypesResponse;

        // Use curriculum offerings data
        const offerings = curriculumOfferingsResponse.data || curriculumOfferingsResponse;
        // Ordenar programas descendentemente por ID para que los nuevos aparezcan al inicio
        programs.value = (Array.isArray(offerings) ? offerings : []).sort((a, b) => b.id - a.id);
      } catch (error) {
        console.error('Error loading academic period detail:', error);
        toastService.show('Error al cargar los datos del período académico', 'error');
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Planeación académica', url: '' };
      headerStorage.moduleItem = { name: 'Periodos Académicos', url: '' };
      headerStorage.moduleSubItem = { name: title, url: '' };

      await loadDetail();
    });

    const formatNumber = (value: number) => {
      return new Intl.NumberFormat('es-CO').format(value);
    };

    const openAddProgramsModal = () => {
      addProgramsModal.value = true;
    };

    const handleProgramsAdded = async () => {
      await loadDetail();
      // Reset filters to show all programs
      filters.programTypeId = null;
    };

    const openProgramConfigModal = (program: CurriculumOfferingDto | null) => {
      currentProgram.value = program;
      programConfigModal.value = true;
    };

    const closeProgramConfigModal = async () => {
      programConfigModal.value = false;
      currentProgram.value = null;
      // Reload data to reflect any changes
      await loadDetail();
    };

    const openConfirmDeleteProgram = (program: CurriculumOfferingDto) => {
      currentProgram.value = program;
      deleteProgramModal.value = true;
    };

    const confirmDeleteProgram = async () => {
      if (!currentProgram.value) return;

      try {
        await deleteCurriculumOfferingService.run(currentProgram.value.id);

        // Remover localmente el programa eliminado
        programs.value = programs.value.filter((p) => p.id !== currentProgram.value!.id);

        // Recalcular estadísticas localmente con los programas restantes
        statistics.value.totalPrograms = programs.value.length;
        statistics.value.totalQuota = programs.value.reduce((sum, p) => sum + (p.maxCapacity || 0), 0);
        statistics.value.averageValue = programs.value.length > 0 ? programs.value.reduce((sum, p) => sum + (p.periodValue || 0), 0) / programs.value.length : 0;
        statistics.value.totalCuts = programs.value.reduce((sum, p) => sum + (p.totalCuts || 0), 0);

        toastService.show('Programa eliminado exitosamente', 'success');
        filters.programTypeId = '';
      } catch (error: any) {
        console.error('Error deleting program:', error);
        const message = error?.response?.data?.message || 'Error al eliminar el programa';
        toastService.show(message, 'error');
      } finally {
        deleteProgramModal.value = false;
        currentProgram.value = null;
      }
    };

    return {
      title,
      loading,
      academicPeriodId,
      academicPeriodDetail,
      statistics,
      programs,
      programTypes,
      existingProgramIds,
      filteredPrograms,
      filters,
      viewMode,
      addProgramsModal,
      programConfigModal,
      deleteProgramModal,
      currentProgram,
      formatNumber,
      openAddProgramsModal,
      handleProgramsAdded,
      openProgramConfigModal,
      closeProgramConfigModal,
      openConfirmDeleteProgram,
      confirmDeleteProgram,
    };
  },
});
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-header {
  padding: 1.5rem;
}

.detail-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
  margin-top: 0;
}

.detail-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.detail-section-header {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.detail-section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0;
}

.detail-section-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background-color: #e5e7eb;
  color: #4b5563;
}

.cell-code {
  font-weight: 600;
  color: #1f2937;
}

.cell-text {
  color: #374151;
}

.cell-muted {
  color: #6b7280;
  font-size: 0.875rem;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-icon-primary {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
}

.stat-icon-success {
  background-color: rgba(var(--bs-success-rgb), 0.1);
  color: var(--bs-success);
}

.stat-icon-warning {
  background-color: rgba(var(--bs-warning-rgb), 0.1);
  color: var(--bs-warning);
}

.stat-icon-info {
  background-color: rgba(var(--bs-info-rgb), 0.1);
  color: var(--bs-info);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  color: #2e3135;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.programs-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.program-card-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.program-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.program-card-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.program-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.program-detail-item > svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.program-stat-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
</style>
