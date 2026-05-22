<template>
  <AppBaseList :title="title">
    <template #actions>
      <div class="d-flex align-items-center gap-2">
        <AppButton style="color: white" @click="downloadTemplate"> <AppIcon icon="download" class="me-1" /> Descargar plantilla </AppButton>
        <AppCheckPermission permission="physicalResources.resourceInventory.create">
          <AppButton style="color: white" @click="openUploadModal"> <AppIcon icon="cloud-upload-alt" class="me-1" /> Carga masiva (Excel) </AppButton>
        </AppCheckPermission>
        <AppCheckPermission permission="physicalResources.resourceInventory.create">
          <AppButton style="color: white" @click="openCreateDrawer"> <AppIcon icon="plus" class="me-1" /> Crear recurso </AppButton>
        </AppCheckPermission>
      </div>
    </template>

    <template #content>
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-header__title">Inventario de recursos</h1>
        <p class="page-header__subtitle">Administra y configura los recursos físicos académicos de tu institución</p>
      </div>

      <AppDatatable name="resource-inventory" :service="getResourceInventoryService">
        <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
          {{ row.code }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Tipo" field="typeName" :sortable="true" v-slot="{ row }">
          {{ row.resourceType?.name ?? row.typeName }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Marca/Modelo" field="make" :sortable="true" v-slot="{ row }">
          <div>{{ row.make }}</div>
          <div class="model-hint">{{ row.model }}</div>
        </AppDatatableColumn>

        <AppDatatableColumn label="Serial" field="serial" :sortable="true" v-slot="{ row }">
          {{ row.serial || '—' }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="status" v-slot="{ row }">
          {{ statusLabel(row.status) }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Fecha Compra" field="purchaseDate" :sortable="true" v-slot="{ row }">
          {{ formatDate(row.purchaseDate) }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Valor" field="purchaseValue" :sortable="true" v-slot="{ row }">
          {{ formatValue(row.purchaseValue) }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Acciones" :position="'right'" v-slot="{ row }">
          <AppButtonGroup>
            <AppCheckPermission permission="physicalResources.resourceInventory.edit">
              <AppButtonEdit @click="openEditDrawer(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="physicalResources.resourceInventory.delete">
              <AppButtonDelete @click="confirmDelete(row)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <!-- Drawer: Crear / Editar recurso -->
      <ResourceInventoryDrawer
        :isVisible="showFormDrawer"
        @update:isVisible="showFormDrawer = $event"
        :data="selectedItem"
        :resource-types="resourceTypes"
        :initial-states="initialStates"
        @save="handleSave"
      />

      <!-- Modal: Carga masiva Excel -->
      <AppModal v-model="showUploadModal">
        <ResourceInventoryUploadForm v-if="showUploadModal" @uploaded="handleUploaded" />
      </AppModal>

      <!-- Modal: Confirmar eliminar -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" entity="recurso" @confirmDelete="handleDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
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

import ResourceInventoryDrawer from '../components/ResourceInventoryDrawer.vue';
import ResourceInventoryUploadForm from '../components/ResourceInventoryUploadForm.vue';

import { ResourceInventoryDto, ResourceInventoryStatus } from '../dtos/resourceInventory.dto';
import { ResourceTypeDto } from '../dtos/resourceType.dto';
import { InitialStateDto } from '../dtos/initialState.dto';
import { GetResourceInventoryService } from '../services/getResourceInventory.service';
import { GetResourceTypesService } from '../services/getResourceTypes.service';
import { GetInitialStatesService } from '../services/getInitialStates.service';
import { CreateOrUpdateResourceInventoryService } from '../services/createOrUpdateResourceInventory.service';
import { DeleteResourceInventoryService } from '../services/deleteResourceInventory.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

const getResourceInventoryService = new GetResourceInventoryService();
const getResourceTypesService = new GetResourceTypesService();
const getInitialStatesService = new GetInitialStatesService();
const createOrUpdateResourceInventoryService = new CreateOrUpdateResourceInventoryService();
const deleteResourceInventoryService = new DeleteResourceInventoryService();
const updateDatatableService = new UpdateDatatableService();

const STATUS_LABELS: Record<ResourceInventoryStatus, string> = {
  available: 'Disponible',
  assigned: 'Asignado',
  maintenance: 'Mantenimiento',
  damaged: 'Dañado',
};

export default defineComponent({
  name: 'ResourceInventory',

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
    ResourceInventoryDrawer,
    ResourceInventoryUploadForm,
  },

  setup() {
    const title = 'Inventario de recursos';

    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Recursos físicos académicos', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    // ── Resource types (se cargan para el drawer form) ───────────────
    const resourceTypes = ref<ResourceTypeDto[]>([]);
    const initialStates = ref<InitialStateDto[]>([]);

    const loadResourceTypes = async () => {
      try {
        const response = await getResourceTypesService.run({ noPag: true });
        const data = response?.data ?? response;
        resourceTypes.value = Array.isArray(data) ? data.map((t: any) => ({ ...t, id: t._id ?? t.id })) : [];
      } catch (e) {
        console.error('Error cargando tipos de recursos:', e);
      }
    };

    const loadInitialStates = async () => {
      try {
        initialStates.value = await getInitialStatesService.run({
          sort: 'id',
          order: 'ASC',
          noPag: true,
        });
      } catch (e) {
        console.error('Error cargando estados iniciales:', e);
      }
    };

    onMounted(() => {
      loadResourceTypes();
      loadInitialStates();
    });

    const refreshData = () => {
      updateDatatableService.run();
    };

    // ── Helpers ──────────────────────────────────────────────────────
    const statusLabel = (s: ResourceInventoryStatus) => STATUS_LABELS[s] ?? s;

    const formatDate = (d: string) => {
      if (!d) return '—';
      const [y, m, day] = d.split('-');
      return `${parseInt(day)}/${parseInt(m)}/${y}`;
    };
    const formatValue = (v: number) => (v ? `$ ${v.toLocaleString('es-CO')}` : '—');

    // ── Drawer / Modal state ─────────────────────────────────────────
    const showFormDrawer = ref(false);
    const showUploadModal = ref(false);
    const showDeleteModal = ref(false);
    const selectedItem = ref<ResourceInventoryDto | null>(null);
    const itemToDelete = ref<number | null>(null);

    const openCreateDrawer = () => {
      selectedItem.value = null;
      showFormDrawer.value = true;
    };
    const openEditDrawer = (item: ResourceInventoryDto) => {
      selectedItem.value = item;
      showFormDrawer.value = true;
    };
    const openUploadModal = () => {
      showUploadModal.value = true;
    };

    const handleSave = async (form: any) => {
      try {
        const id = selectedItem.value?.id;
        await createOrUpdateResourceInventoryService.run(
          {
            code: form.code,
            resourceTypeId: form.typeId,
            name: form.name,
            make: form.brand,
            model: form.model,
            serial: form.serial,
            quantity: form.quantity,
            initialStateId: form.status,
            purchaseDate: form.purchaseDate,
            purchaseValue: form.value,
          },
          id
        );
        showFormDrawer.value = false;
        refreshData();
      } catch (e) {
        console.error('Error guardando recurso:', e);
      }
    };

    const handleUploaded = () => {
      showUploadModal.value = false;
      refreshData();
    };

    const confirmDelete = (item: ResourceInventoryDto) => {
      itemToDelete.value = item.id;
      showDeleteModal.value = true;
    };
    const handleDelete = async () => {
      try {
        if (itemToDelete.value) {
          await deleteResourceInventoryService.run(itemToDelete.value);
        }
        showDeleteModal.value = false;
        itemToDelete.value = null;
        refreshData();
      } catch (e) {
        console.error('Error eliminando recurso:', e);
      }
    };

    const downloadTemplate = () => {
      const headers = ['codigo_base', 'tipo_recurso_id', 'nombre', 'marca', 'modelo', 'serial', 'estado', 'fecha_compra', 'valor_cop'];
      const example = ['PROJ-2024', '1', 'Proyector Epson EB-X41', 'Epson', 'EB-X41', 'X4L1234567', 'available', '2024-01-14', '1200000'];
      const csvContent = [headers.join(','), example.join(',')].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_inventario_recursos.csv';
      link.click();
      URL.revokeObjectURL(url);
    };

    return {
      title,
      getResourceInventoryService,
      resourceTypes,
      initialStates,
      showFormDrawer,
      showUploadModal,
      showDeleteModal,
      selectedItem,
      openCreateDrawer,
      openEditDrawer,
      openUploadModal,
      handleSave,
      handleUploaded,
      confirmDelete,
      handleDelete,
      downloadTemplate,
      statusLabel,
      formatDate,
      formatValue,
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
.model-hint {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #9ca3af;
}
</style>
