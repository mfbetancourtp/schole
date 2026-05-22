<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="physicalResources.resourceConfiguration.create">
        <AppButton style="color: white" @click="openCreateSpaceTypeModal"> <AppIcon icon="plus" class="me-1" /> Crear tipo de espacio </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <!-- Page Header -->
      <div class="tw-px-6 tw-pt-3 tw-pb-1">
        <h1 class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-1">Tipos de Espacios</h1>
        <p class="tw-text-sm tw-text-gray-500">Administra y configura los recursos físicos académicos de tu institución</p>
      </div>

      <AppDatatable name="space-types" :service="getSpaceTypesService">
        <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
          <span class="tw-text-blue-500 tw-font-medium">{{ row.code }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="isActive" v-slot="{ row }">
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" role="switch" :checked="row.isActive" @change="toggleSpaceStatus(row)" />
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn label="Acciones" :position="'right'" v-slot="{ row }">
          <AppButtonGroup>
            <AppCheckPermission permission="physicalResources.resourceConfiguration.edit">
              <AppButtonEdit @click="openEditSpaceTypeModal(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="physicalResources.resourceConfiguration.delete">
              <AppButtonDelete @click="confirmDeleteSpaceType(row)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <!-- Modals -->
      <AppModal v-model="showSpaceTypeModal">
        <SpaceTypeForm v-if="showSpaceTypeModal" :data="selectedSpaceType" @save="handleSpaceTypeSave" />
      </AppModal>

      <AppModal v-model="showDeleteSpaceTypeModal">
        <AppConfirmDeleteModal v-if="showDeleteSpaceTypeModal" entity="tipo de espacio" @confirmDelete="handleDeleteSpaceType" />
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
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import SpaceTypeForm from '../components/SpaceTypeForm.vue';

import { SpaceTypeDto } from '../dtos/spaceType.dto';
import { GetSpaceTypesService } from '../services/getSpaceTypes.service';
import { CreateOrUpdateSpaceTypeService } from '../services/createOrUpdateSpaceType.service';
import { DeleteSpaceTypeService } from '../services/deleteSpaceType.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

const getSpaceTypesService = new GetSpaceTypesService();
const createOrUpdateSpaceTypeService = new CreateOrUpdateSpaceTypeService();
const deleteSpaceTypeService = new DeleteSpaceTypeService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'ResourceConfiguration',

  components: {
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppModal,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppDatatable,
    AppDatatableColumn,
    AppIcon,
    SpaceTypeForm,
  },

  setup() {
    const title = 'Tipos de Espacios';

    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Recursos físicos académicos', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const showSpaceTypeModal = ref(false);
    const showDeleteSpaceTypeModal = ref(false);
    const selectedSpaceType = ref<SpaceTypeDto | null>(null);
    const spaceTypeToDelete = ref<number | null>(null);

    const refreshData = () => {
      updateDatatableService.run();
    };

    // ── CRUD ─────────────────────────────────────────────────────────
    const openCreateSpaceTypeModal = () => {
      selectedSpaceType.value = null;
      showSpaceTypeModal.value = true;
    };
    const openEditSpaceTypeModal = (s: SpaceTypeDto) => {
      selectedSpaceType.value = s;
      showSpaceTypeModal.value = true;
    };

    const handleSpaceTypeSave = async (form: any) => {
      try {
        const id = selectedSpaceType.value?.id;
        await createOrUpdateSpaceTypeService.run(form, id);
        showSpaceTypeModal.value = false;
        refreshData();
      } catch (e) {
        console.error('Error guardando tipo de espacio:', e);
      }
    };

    const confirmDeleteSpaceType = (s: SpaceTypeDto) => {
      spaceTypeToDelete.value = s.id;
      showDeleteSpaceTypeModal.value = true;
    };
    const handleDeleteSpaceType = async () => {
      try {
        if (spaceTypeToDelete.value) {
          await deleteSpaceTypeService.run(spaceTypeToDelete.value);
        }
        showDeleteSpaceTypeModal.value = false;
        spaceTypeToDelete.value = null;
        refreshData();
      } catch (e) {
        console.error('Error eliminando tipo de espacio:', e);
      }
    };
    const toggleSpaceStatus = async (s: SpaceTypeDto) => {
      try {
        await createOrUpdateSpaceTypeService.run({ ...s, isActive: !s.isActive }, s.id);
        refreshData();
      } catch (e) {
        console.error('Error cambiando estado:', e);
      }
    };

    return {
      title,
      getSpaceTypesService,
      showSpaceTypeModal,
      showDeleteSpaceTypeModal,
      selectedSpaceType,
      openCreateSpaceTypeModal,
      openEditSpaceTypeModal,
      handleSpaceTypeSave,
      confirmDeleteSpaceType,
      handleDeleteSpaceType,
      toggleSpaceStatus,
    };
  },
});
</script>

<style scoped>
.nav-tabs {
  border-bottom: 1px solid #e2e8f0;
}

.nav-tabs .nav-link {
  color: #64748b;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.875rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0;
}

.nav-tabs .nav-link:hover {
  color: #3b82f6;
  border-bottom-color: #bfdbfe;
  background: transparent;
}
.nav-tabs .nav-link.active {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  background: transparent;
  font-weight: 600;
}

.form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}
.form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>
