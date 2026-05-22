<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission v-if="activeTab === 'types'" permission="physicalResources.resourceTypes.create">
        <AppButton style="color: white" @click="openCreateResourceTypeModal"> <AppIcon icon="plus" class="me-1" /> Crear tipo de recurso </AppButton>
      </AppCheckPermission>
      <AppCheckPermission v-if="activeTab === 'categories'" permission="physicalResources.resourceTypes.create">
        <AppButton style="color: white" @click="openCreateCategoryModal"> <AppIcon icon="plus" class="me-1" /> Crear categoría </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <!-- Page Header -->
      <div class="tw-px-6 tw-pt-3 tw-pb-1">
        <h1 class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-1">Categorías y Tipos de Recursos</h1>
        <p class="tw-text-sm tw-text-gray-500">Administra y configura los recursos físicos académicos de tu institución</p>
      </div>

      <!-- Tabs + Tables -->
      <nav>
        <div class="nav nav-tabs tw-px-4" style="border-radius: 20px 0px 0px 2px" id="resource-types-tab" role="tablist">
          <button class="nav-link active d-flex align-items-center gap-2" data-bs-toggle="tab" data-bs-target="#resource-types-pane" type="button" role="tab" @click="activeTab = 'types'">
            <AppIcon icon="box" />
            Tipos de recursos
          </button>
          <button class="nav-link d-flex align-items-center gap-2" data-bs-toggle="tab" data-bs-target="#categories-pane" type="button" role="tab" @click="activeTab = 'categories'">
            <AppIcon icon="folder" />
            Categorías
          </button>
        </div>
      </nav>

      <div class="tab-content">
        <!-- ── Tab 1: Tipos de recursos ── -->
        <div class="tab-pane fade show active" id="resource-types-pane" role="tabpanel">
          <AppDatatable name="resource-types" :service="getResourceTypesService">
            <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
              {{ row.code }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
              {{ row.name }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Descripción" field="description" :sortable="true" v-slot="{ row }">
              {{ row.description }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Categoría" field="categoryName" :sortable="true" v-slot="{ row }">
              {{ row.resourceCategory?.name ?? row.categoryName }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Requiere Serial" field="serialIsRequired" :position="'centered'" v-slot="{ row }">
              {{ row.serialIsRequired ? 'Sí' : 'No' }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Estado" field="isActive" v-slot="{ row }">
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" :checked="!!row.isActive" @change="toggleResourceTypeStatus(row)" />
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn label="Acciones" :position="'right'" v-slot="{ row }">
              <AppButtonGroup>
                <AppCheckPermission permission="physicalResources.resourceTypes.edit">
                  <AppButtonEdit @click="openEditResourceTypeModal(row)" />
                </AppCheckPermission>
                <AppCheckPermission permission="physicalResources.resourceTypes.delete">
                  <AppButtonDelete @click="confirmDeleteResourceType(row)" />
                </AppCheckPermission>
              </AppButtonGroup>
            </AppDatatableColumn>
          </AppDatatable>
        </div>

        <!-- ── Tab 2: Categorías ── -->
        <div class="tab-pane fade" id="categories-pane" role="tabpanel">
          <AppDatatable name="resource-categories" :service="getResourceCategoriesService">
            <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
              {{ row.code }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
              {{ row.name }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Descripción" field="description" :sortable="true" v-slot="{ row }">
              {{ row.description }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Estado" field="isActive" v-slot="{ row }">
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" :checked="row.isActive" @change="toggleCategoryStatus(row)" />
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn label="Acciones" :position="'right'" v-slot="{ row }">
              <AppButtonGroup>
                <AppCheckPermission permission="physicalResources.resourceTypes.edit">
                  <AppButtonEdit @click="openEditCategoryModal(row)" />
                </AppCheckPermission>
                <AppCheckPermission permission="physicalResources.resourceTypes.delete">
                  <AppButtonDelete @click="confirmDeleteCategory(row)" />
                </AppCheckPermission>
              </AppButtonGroup>
            </AppDatatableColumn>
          </AppDatatable>
        </div>
      </div>

      <!-- Modals -->
      <AppModal v-model="showResourceTypeModal">
        <ResourceTypeForm v-if="showResourceTypeModal" :data="selectedResourceType" :categories="categories" @save="handleResourceTypeSave" />
      </AppModal>

      <AppModal v-model="showCategoryModal">
        <ResourceCategoryForm v-if="showCategoryModal" :data="selectedCategory" @save="handleCategorySave" />
      </AppModal>

      <AppModal v-model="showDeleteResourceTypeModal">
        <AppConfirmDeleteModal v-if="showDeleteResourceTypeModal" entity="tipo de recurso" @confirmDelete="handleDeleteResourceType" />
      </AppModal>

      <AppModal v-model="showDeleteCategoryModal">
        <AppConfirmDeleteModal v-if="showDeleteCategoryModal" entity="categoría" @confirmDelete="handleDeleteCategory" />
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

import ResourceTypeForm from '../components/ResourceTypeForm.vue';
import ResourceCategoryForm from '../components/ResourceCategoryForm.vue';

import { ResourceTypeDto } from '../dtos/resourceType.dto';
import { ResourceCategoryDto } from '../dtos/resourceCategory.dto';
import { GetResourceTypesService } from '../services/getResourceTypes.service';
import { CreateOrUpdateResourceTypeService } from '../services/createOrUpdateResourceType.service';
import { DeleteResourceTypeService } from '../services/deleteResourceType.service';
import { GetResourceCategoriesService } from '../services/getResourceCategories.service';
import { CreateOrUpdateResourceCategoryService } from '../services/createOrUpdateResourceCategory.service';
import { DeleteResourceCategoryService } from '../services/deleteResourceCategory.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

const getResourceTypesService = new GetResourceTypesService();
const createOrUpdateResourceTypeService = new CreateOrUpdateResourceTypeService();
const deleteResourceTypeService = new DeleteResourceTypeService();
const getResourceCategoriesService = new GetResourceCategoriesService();
const createOrUpdateResourceCategoryService = new CreateOrUpdateResourceCategoryService();
const deleteResourceCategoryService = new DeleteResourceCategoryService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'ResourceTypes',

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
    ResourceTypeForm,
    ResourceCategoryForm,
  },

  setup() {
    const title = 'Categorías y Tipos de Recursos';

    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Recursos físicos académicos', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const activeTab = ref<'types' | 'categories'>('types');

    // ── Categorías (se cargan para el form de ResourceType) ─────────
    const categories = ref<ResourceCategoryDto[]>([]);
    const showCategoryModal = ref(false);
    const showDeleteCategoryModal = ref(false);
    const selectedCategory = ref<ResourceCategoryDto | null>(null);
    const categoryToDelete = ref<number | null>(null);

    const loadCategories = async () => {
      try {
        const response = await getResourceCategoriesService.run();
        const data = response?.data ?? response;
        categories.value = Array.isArray(data) ? data : [];
      } catch (e) {
        console.error('Error cargando categorías:', e);
      }
    };

    onMounted(() => {
      loadCategories();
    });

    const refreshData = () => {
      updateDatatableService.run();
    };

    const openCreateCategoryModal = () => {
      selectedCategory.value = null;
      showCategoryModal.value = true;
    };
    const openEditCategoryModal = (c: ResourceCategoryDto) => {
      selectedCategory.value = c;
      showCategoryModal.value = true;
    };

    const handleCategorySave = async (form: any) => {
      try {
        const id = selectedCategory.value?.id;
        await createOrUpdateResourceCategoryService.run(form, id);
        showCategoryModal.value = false;
        await loadCategories();
        refreshData();
      } catch (e) {
        console.error('Error guardando categoría:', e);
      }
    };

    const confirmDeleteCategory = (c: ResourceCategoryDto) => {
      categoryToDelete.value = c.id;
      showDeleteCategoryModal.value = true;
    };
    const handleDeleteCategory = async () => {
      try {
        if (categoryToDelete.value) {
          await deleteResourceCategoryService.run(categoryToDelete.value);
        }
        showDeleteCategoryModal.value = false;
        categoryToDelete.value = null;
        await loadCategories();
        refreshData();
      } catch (e) {
        console.error('Error eliminando categoría:', e);
      }
    };
    const toggleCategoryStatus = async (c: ResourceCategoryDto) => {
      try {
        await createOrUpdateResourceCategoryService.run({ ...c, isActive: !c.isActive }, c.id);
        refreshData();
      } catch (e) {
        console.error('Error cambiando estado:', e);
      }
    };

    // ── Tipos de recursos ────────────────────────────────────────────
    const showResourceTypeModal = ref(false);
    const showDeleteResourceTypeModal = ref(false);
    const selectedResourceType = ref<ResourceTypeDto | null>(null);
    const resourceTypeToDelete = ref<number | null>(null);

    const openCreateResourceTypeModal = () => {
      selectedResourceType.value = null;
      showResourceTypeModal.value = true;
    };
    const openEditResourceTypeModal = (r: ResourceTypeDto) => {
      selectedResourceType.value = r;
      showResourceTypeModal.value = true;
    };

    const handleResourceTypeSave = async (form: any) => {
      try {
        const id = selectedResourceType.value?.id;
        await createOrUpdateResourceTypeService.run(form, id);
        showResourceTypeModal.value = false;
        refreshData();
      } catch (e) {
        console.error('Error guardando tipo de recurso:', e);
      }
    };

    const confirmDeleteResourceType = (r: ResourceTypeDto) => {
      resourceTypeToDelete.value = r.id;
      showDeleteResourceTypeModal.value = true;
    };
    const handleDeleteResourceType = async () => {
      try {
        if (resourceTypeToDelete.value) {
          await deleteResourceTypeService.run(resourceTypeToDelete.value);
        }
        showDeleteResourceTypeModal.value = false;
        resourceTypeToDelete.value = null;
        refreshData();
      } catch (e) {
        console.error('Error eliminando tipo de recurso:', e);
      }
    };
    const toggleResourceTypeStatus = async (r: ResourceTypeDto) => {
      try {
        await createOrUpdateResourceTypeService.run({ ...r, isActive: !r.isActive }, r.id);
        refreshData();
      } catch (e) {
        console.error('Error cambiando estado:', e);
      }
    };

    return {
      title,
      activeTab,
      getResourceTypesService,
      getResourceCategoriesService,
      categories,
      showCategoryModal,
      showDeleteCategoryModal,
      selectedCategory,
      openCreateCategoryModal,
      openEditCategoryModal,
      handleCategorySave,
      confirmDeleteCategory,
      handleDeleteCategory,
      toggleCategoryStatus,
      showResourceTypeModal,
      showDeleteResourceTypeModal,
      selectedResourceType,
      openCreateResourceTypeModal,
      openEditResourceTypeModal,
      handleResourceTypeSave,
      confirmDeleteResourceType,
      handleDeleteResourceType,
      toggleResourceTypeStatus,
    };
  },
});
</script>
