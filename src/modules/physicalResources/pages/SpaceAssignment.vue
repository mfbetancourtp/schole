<template>
  <AppBaseList :title="title">
    <template #actions>
      <div class="d-flex align-items-center gap-2">
        <AppButton style="color: white" @click="openImportModal"> <AppIcon icon="upload" class="me-1" /> Importar </AppButton>
        <AppButton style="color: white" @click="handleExport"> <AppIcon icon="download" class="me-1" /> Exportar </AppButton>
        <AppCheckPermission permission="physicalResources.spaceAssignment.create">
          <AppButton style="color: white" @click="openCreateDrawer"> <AppIcon icon="plus" class="me-1" /> Crear espacio </AppButton>
        </AppCheckPermission>
      </div>
    </template>

    <template #content>
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-header__title">Asignación de espacios y recursos</h1>
        <p class="page-header__subtitle">Administra y configura los recursos físicos académicos de tu institución</p>
      </div>

      <AppDatatable name="space-assignment" :service="getSpacesService">
        <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
          {{ row.code }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Tipo de Espacio" field="spaceTypeName" :sortable="true" v-slot="{ row }">
          {{ row.spaceTypeName }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Ruta Jerárquica" field="hierarchicalPath" v-slot="{ row }">
          {{ row.hierarchicalPath }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Capacidad" field="capacity" :sortable="true" v-slot="{ row }">
          {{ row.capacity ?? '—' }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="isActive" v-slot="{ row }">
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" role="switch" :checked="row.isActive" @change="handleStatusToggle(row)" />
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn label="Disponibilidad" field="availability" v-slot="{ row }">
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="openAvailabilityModal(row)"><AppIcon icon="clock" class="me-1" /> Configurar</button>
        </AppDatatableColumn>

        <AppDatatableColumn label="Asignar Recursos" field="assignResources" v-slot="{ row }">
          <AppCheckPermission permission="physicalResources.spaceAssignment.assign">
            <button class="btn btn-primary btn-sm" style="color: white" @click="openAssignDrawer(row)">Asignar</button>
          </AppCheckPermission>
        </AppDatatableColumn>

        <AppDatatableColumn label="Acciones" :position="'right'" v-slot="{ row }">
          <AppButtonGroup>
            <AppCheckPermission permission="physicalResources.spaceAssignment.edit">
              <AppButtonEdit @click="openEditDrawer(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="physicalResources.spaceAssignment.delete">
              <AppButtonDelete @click="confirmDelete(row)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <!-- Drawer: Crear / Editar espacio -->
      <SpaceAssignmentDrawer v-model:isVisible="showFormDrawer" :data="selectedSpace" @save="handleSave" />

      <!-- Drawer: Asignar recursos -->
      <SpaceAssignResourcesDrawer v-model:isVisible="showAssignDrawer" :space="assignSpace" @save="handleAssignSave" />

      <!-- Modal: Importar -->
      <AppModal v-model="showImportModal">
        <SpaceImportModal v-if="showImportModal" @imported="handleImported" />
      </AppModal>

      <!-- Modal: Configurar disponibilidad -->
      <AppModal v-model="showAvailabilityModal">
        <SpaceAvailabilityModal v-if="showAvailabilityModal && availabilitySpace" :space="availabilitySpace" @save="handleAvailabilitySave" />
      </AppModal>

      <!-- Modal: Confirmar eliminar -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" entity="espacio" @confirmDelete="handleDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import SpaceAssignmentDrawer from '../components/SpaceAssignmentDrawer.vue';
import SpaceAssignResourcesDrawer from '../components/SpaceAssignResourcesDrawer.vue';
import SpaceAvailabilityModal from '../components/SpaceAvailabilityModal.vue';
import SpaceImportModal from '../components/SpaceImportModal.vue';

import { SpaceDto } from '../dtos/spaceAssignment.dto';
import { ToastService } from '../../../shared/services/toast.service';
import { GetSpacesService } from '../services/getSpaces.service';
import { CreateOrUpdateSpaceService } from '../services/createOrUpdateSpace.service';
import { DeleteSpaceService } from '../services/deleteSpace.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

const toastService = new ToastService();
const getSpacesService = new GetSpacesService();
const createOrUpdateSpaceService = new CreateOrUpdateSpaceService();
const deleteSpaceService = new DeleteSpaceService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'SpaceAssignment',

  components: {
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppModal,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    SpaceAssignmentDrawer,
    SpaceAssignResourcesDrawer,
    SpaceAvailabilityModal,
    SpaceImportModal,
  },

  setup() {
    const title = 'Asignación de espacios y recursos';
    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Recursos físicos académicos', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const refreshData = () => {
      updateDatatableService.run();
    };

    // ── Drawer / Modal state ─────────────────────────────────────────
    const showFormDrawer = ref(false);
    const showAssignDrawer = ref(false);
    const showDeleteModal = ref(false);
    const showAvailabilityModal = ref(false);
    const showImportModal = ref(false);
    const selectedSpace = ref<SpaceDto | null>(null);
    const availabilitySpace = ref<SpaceDto | null>(null);
    const assignSpace = ref<SpaceDto | null>(null);
    const spaceToDelete = ref<number | null>(null);

    // ── CRUD ─────────────────────────────────────────────────────────
    const handleStatusToggle = async (space: SpaceDto) => {
      try {
        const backendPayload = {
          code: space.code,
          name: space.name,
          spaceTypeId: space.spaceTypeId,
          floorId: space.floorId,
          responsibleUserId: space.responsibleUserId,
          capacity: space.capacity,
          area: space.area,
          isActive: !space.isActive,
        };
        await createOrUpdateSpaceService.run(backendPayload, space.id);
        refreshData();
        toastService.show(`Espacio "${space.name}" ${!space.isActive ? 'activado' : 'desactivado'} correctamente`, 'success');
      } catch (e) {
        console.error('Error cambiando estado:', e);
      }
    };

    const openCreateDrawer = () => {
      selectedSpace.value = null;
      showFormDrawer.value = true;
    };
    const openEditDrawer = (space: SpaceDto) => {
      selectedSpace.value = space;
      showFormDrawer.value = true;
    };

    const openAvailabilityModal = (space: SpaceDto) => {
      availabilitySpace.value = space;
      showAvailabilityModal.value = true;
    };
    const handleAvailabilitySave = () => {
      showAvailabilityModal.value = false;
      toastService.show('Disponibilidad configurada correctamente', 'success');
    };

    const openAssignDrawer = (space: SpaceDto) => {
      assignSpace.value = space;
      showAssignDrawer.value = true;
    };
    const handleAssignSave = () => {
      showAssignDrawer.value = false;
      refreshData();
      toastService.show('Recursos asignados correctamente', 'success');
    };

    const openImportModal = () => {
      showImportModal.value = true;
    };
    const handleImported = () => {
      showImportModal.value = false;
      refreshData();
    };

    const handleExport = () => {
      // Export will be handled by the backend in the future
      toastService.show('Exportación iniciada', 'success');
    };

    const handleSave = async (form: any) => {
      try {
        const id = selectedSpace.value?.id;
        const backendPayload = {
          code: form.code,
          name: form.name,
          spaceTypeId: form.spaceTypeId,
          floorId: form.floorId,
          responsibleUserId: form.responsibleId,
          capacity: form.capacity,
          area: form.area,
          isActive: form.isActive,
        };
        await createOrUpdateSpaceService.run(backendPayload, id);
        showFormDrawer.value = false;
        refreshData();
      } catch (e) {
        console.error('Error guardando espacio:', e);
      }
    };

    const confirmDelete = (space: SpaceDto) => {
      spaceToDelete.value = space.id;
      showDeleteModal.value = true;
    };
    const handleDelete = async () => {
      try {
        if (spaceToDelete.value) {
          await deleteSpaceService.run(spaceToDelete.value);
        }
        showDeleteModal.value = false;
        spaceToDelete.value = null;
        refreshData();
      } catch (e) {
        console.error('Error eliminando espacio:', e);
      }
    };

    return {
      title,
      getSpacesService,
      showFormDrawer,
      showAssignDrawer,
      showDeleteModal,
      showAvailabilityModal,
      showImportModal,
      selectedSpace,
      availabilitySpace,
      assignSpace,
      handleStatusToggle,
      openCreateDrawer,
      openEditDrawer,
      openAvailabilityModal,
      handleAvailabilitySave,
      openAssignDrawer,
      handleAssignSave,
      openImportModal,
      handleImported,
      handleExport,
      handleSave,
      confirmDelete,
      handleDelete,
    };
  },
});
</script>

<style scoped>
.page-header {
  padding: 0.75rem 1.5rem 0.25rem;
}
.page-header__title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}
.page-header__subtitle {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
  margin-bottom: 0;
}
</style>
