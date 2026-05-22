<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="academicPlanning.academicPeriods.create">
        <AppButton style="color: white" @click="openAcademicPeriodModal(null)">
          <AppIcon icon="plus" class="me-1" />
          Crear Período Académico
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="academicPeriodsList">
        <!-- Header -->
        <div class="academicPeriodsList__header">
          <h1 class="academicPeriodsList__title">Períodos Académicos</h1>
          <p class="academicPeriodsList__subtitle">Gestiona los períodos académicos y su oferta de programas</p>
        </div>

        <!-- Data Table -->
        <AppDatatable name="academicPeriodsList" :service="getAcademicPeriodsPaginatedService" :params="filterParams" :enable-search-filter="true" default-sort-direction="">
          <template #filters>
            <AppFilter v-model="filters.active" filter-name="academicPeriodsList.active">
              <AppFormField label="Estado" capitalize>
                <AppAutocomplete v-model="filters.active" :options="activeOptions" input-id="active" />
              </AppFormField>
            </AppFilter>

            <AppFilter v-model="filters.programTypeId" filter-name="academicPeriodsList.programType">
              <AppFormField label="Tipo" capitalize>
                <AppAutocomplete v-model="filters.programTypeId" :options="programTypes" input-id="programTypeId" />
              </AppFormField>
            </AppFilter>
          </template>

          <!-- Columna Codigo -->
          <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
            <div class="cell-code">{{ row.code }}</div>
          </AppDatatableColumn>

          <!-- Columna Nombre -->
          <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
            <div class="cell-text">{{ row.name }}</div>
          </AppDatatableColumn>

          <!-- Columna Fecha inicio - fin -->
          <AppDatatableColumn label="Fecha inicio - fin" field="startDate" :sortable="true" v-slot="{ row }">
            <div class="cell-date">{{ formatDate(row.startDate) }} - {{ formatDate(row.endDate) }}</div>
          </AppDatatableColumn>

          <!-- Columna Estado -->
          <AppDatatableColumn label="Estado" field="active" :sortable="true" v-slot="{ row }">
            <div class="status-badge" :class="row.active === 1 ? 'status-active' : 'status-inactive'">
              {{ row.active === 1 ? 'Activo' : 'Inactivo' }}
            </div>
          </AppDatatableColumn>

          <!-- Columna Tipo de programa -->
          <AppDatatableColumn label="Tipo de programa" field="programType" :sortable="true" v-slot="{ row }">
            <div class="cell-text">
              {{ row.programType?.name || getProgramTypeName(row.programTypeId) }}
            </div>
          </AppDatatableColumn>

          <!-- Columna N Programas -->
          <AppDatatableColumn label="N° Programas" field="programsCount" :sortable="true" v-slot="{ row }">
            <button class="program-count-link" @click="goToDetail(row.id)">
              {{ row.programsCount || 0 }}
            </button>
          </AppDatatableColumn>

          <!-- Columna Acciones -->
          <AppDatatableColumn label="Acciones" v-slot="{ row }">
            <AppButtonGroup>
              <AppButton variant="secondary" outlined icon="eye" @click="goToDetail(row.id)" v-tooltip="'Ver Detalle'" />
              <AppCheckPermission permission="academicPlanning.academicPeriods.update">
                <AppButtonEdit @click="openAcademicPeriodModal(row)" />
              </AppCheckPermission>
              <AppCheckPermission permission="academicPlanning.academicPeriods.update">
                <AppButton variant="secondary" outlined :icon="row.active === 1 ? 'check-circle' : 'times-circle'" @click="toggleStatus(row)" v-tooltip="row.active === 1 ? 'Desactivar' : 'Activar'" />
              </AppCheckPermission>
              <AppCheckPermission permission="academicPlanning.academicPeriods.delete">
                <AppButtonDelete @click="openDeleteModal(row)" />
              </AppCheckPermission>
            </AppButtonGroup>
          </AppDatatableColumn>
        </AppDatatable>
      </div>

      <!-- Drawer Crear/Editar Periodo Academico -->
      <AcademicPeriodFormDrawer :isVisible="academicPeriodModal" @update:isVisible="academicPeriodModal = $event" :data="currentAcademicPeriod" @saved="closeAcademicPeriodModal" />

      <!-- Modal Confirmar Eliminacion -->
      <AppModal v-model="deleteModal">
        <AppConfirmDeleteModal v-if="deleteModal" entity="core.generalTerms.academic.academicPeriod.singular" @confirmDelete="confirmDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

import AcademicPeriodFormDrawer from '../components/AcademicPeriodFormDrawer.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { GetAcademicPeriodsPaginatedService, AcademicPeriodItemDto } from '../services/getAcademicPeriodsPaginated.service';
import { GetProgramTypesService, ProgramTypeDto } from '../services/getProgramTypes.service';
import { GetAcademicPeriodByIdService } from '../services/getAcademicPeriodById.service';
import { DeleteAcademicPeriodService } from '../services/deleteAcademicPeriod.service';
import { ToggleAcademicPeriodStatusService } from '../services/toggleAcademicPeriodStatus.service';
import { ToastService } from '../../../shared/services/toast.service';

const getAcademicPeriodsPaginatedService = new GetAcademicPeriodsPaginatedService();
const getProgramTypesService = new GetProgramTypesService();
const deleteAcademicPeriodService = new DeleteAcademicPeriodService();
const getAcademicPeriodByIdService = new GetAcademicPeriodByIdService();
const toggleAcademicPeriodStatusService = new ToggleAcademicPeriodStatusService();
const toastService = new ToastService();

export default defineComponent({
  name: 'AcademicPeriodsList',
  components: {
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppModal,
    AppIcon,
    AppLoading,
    AppConfirmDeleteModal,
    AppAutocomplete,
    AppFormField,
    AppCheckPermission,
    AcademicPeriodFormDrawer,
  },
  setup() {
    const router = useRouter();
    const title = 'Periodos Academicos';
    useMeta({ title });

    const loading = ref(true);
    const academicPeriodModal = ref(false);
    const deleteModal = ref(false);
    const currentAcademicPeriod = ref<AcademicPeriodItemDto | null>(null);
    const academicPeriodToDelete = ref<AcademicPeriodItemDto | null>(null);
    const programTypes = ref<ProgramTypeDto[]>([]);

    const activeOptions = [
      { id: '', name: 'Todos' },
      { id: '1', name: 'Activo' },
      { id: '0', name: 'Inactivo' },
    ];

    const filters = reactive({
      active: null as any,
      programTypeId: null as any,
    });

    const filterParams = computed(() => {
      const params: Record<string, any> = {};

      // filters.active será el id directamente (string: '', '1', '0')
      if (filters.active && filters.active !== '') {
        const activeValue = parseInt(filters.active as string);
        if (!isNaN(activeValue)) params.active = activeValue;
      }

      // filters.programTypeId será el id directamente (number)
      if (filters.programTypeId) {
        params.programTypeId = filters.programTypeId;
      }

      return params;
    });

    const loadProgramTypes = async () => {
      try {
        const response = await getProgramTypesService.run();
        const types = response.data || response;
        programTypes.value = types.map((pt: any) => ({ ...pt, name: pt.name }));
      } catch (error) {
        toastService.show('Error al cargar los tipos de programas', 'error');
      } finally {
        loading.value = false;
      }
    };

    const refreshTable = () => {
      document.dispatchEvent(new CustomEvent('updateDatatable'));
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Planeacion academica', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      await loadProgramTypes();
    });

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${months[month - 1]} ${year}`;
    };

    const getProgramTypeName = (programTypeId: number) => {
      const pt = programTypes.value.find((p) => p.id === programTypeId);
      return pt?.name || '';
    };

    const goToDetail = (academicPeriodId: number) => {
      router.push({
        name: 'academicPlanning.academicPeriodsDetail',
        params: { academicPeriodId },
      });
    };

    const openAcademicPeriodModal = async (academicPeriod: AcademicPeriodItemDto | null) => {
      currentAcademicPeriod.value = null;

      if (academicPeriod?.id) {
        // Cargar detalle completo para obtener los programIds
        try {
          const detail = await getAcademicPeriodByIdService.run(academicPeriod.id);
          currentAcademicPeriod.value = detail as AcademicPeriodItemDto;
        } catch (error) {
          console.error('Error loading academic period detail:', error);
          toastService.show('Error al cargar el período académico', 'error');
          return;
        }
      }

      academicPeriodModal.value = true;
    };

    const closeAcademicPeriodModal = () => {
      academicPeriodModal.value = false;
      currentAcademicPeriod.value = null;
      refreshTable();
    };

    const openDeleteModal = (academicPeriod: AcademicPeriodItemDto) => {
      academicPeriodToDelete.value = academicPeriod;
      deleteModal.value = true;
    };

    const confirmDelete = async () => {
      if (academicPeriodToDelete.value) {
        try {
          await deleteAcademicPeriodService.run(academicPeriodToDelete.value.id);
          deleteModal.value = false;
          academicPeriodToDelete.value = null;
          toastService.show('Período académico eliminado exitosamente', 'success');
          refreshTable();
        } catch (error: any) {
          console.error('Error deleting academic period:', error);

          // Extract error message from backend response or use default
          const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'No se puede eliminar el período académico. Verifique que no tenga programas o datos asociados.';

          toastService.show(errorMessage, 'error');
        }
      }
    };

    const toggleStatus = async (academicPeriod: AcademicPeriodItemDto) => {
      try {
        const newStatus = academicPeriod.active === 1 ? 0 : 1;
        await toggleAcademicPeriodStatusService.run(academicPeriod.id, newStatus);
        toastService.show(newStatus === 1 ? 'Período académico activado' : 'Período académico desactivado', 'success');
        refreshTable();
      } catch (error: any) {
        console.error('Error toggling academic period status:', error);
        const message = error?.response?.data?.message || 'Error al cambiar el estado del período académico';
        toastService.show(message, 'error');
      }
    };

    return {
      activeOptions,
      title,
      loading,
      academicPeriodModal,
      deleteModal,
      currentAcademicPeriod,
      programTypes,
      filters,
      filterParams,
      getAcademicPeriodsPaginatedService,
      formatDate,
      getProgramTypeName,
      goToDetail,
      openAcademicPeriodModal,
      closeAcademicPeriodModal,
      openDeleteModal,
      confirmDelete,
      toggleStatus,
    };
  },
});
</script>

<style scoped>
.academicPeriodsList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.academicPeriodsList__header {
  padding: 1.5rem;
  padding-bottom: 0.5rem;
}

.academicPeriodsList__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.academicPeriodsList__subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.cell-code {
  font-weight: 600;
  color: #1f2937;
}

.cell-text {
  color: #374151;
}

.cell-date {
  color: #6b7280;
  font-size: 0.875rem;
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

.program-count-link {
  color: #3b82f6;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: color 0.2s;
}

.program-count-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.btn-outline-secondary {
  border-color: #d1d5db;
  color: #6b7280;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}
</style>
