<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton outlined variant="light" nativeType="button" @click="openCreate">
        <AppIcon icon="plus" class="items-action-icon" />
        Nuevo item
      </AppButton>
    </template>

    <template #content>
      <div class="items-page">
        <header class="items-heading">
          <div>
            <h2>Items del menú</h2>
            <p>Administra la estructura de navegación, visibilidad, rutas y permisos por item.</p>
          </div>
        </header>

        <section class="items-summary">
          <article v-for="card in summaryCards" :key="card.label" class="summary-card">
            <div class="summary-card__icon" :class="card.className">
              <AppIcon :icon="card.icon" />
            </div>
            <div>
              <span>{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
            </div>
          </article>
        </section>

        <section class="items-toolbar">
          <div class="filters-grid">
            <AppFormField label="Buscar">
              <input v-model.trim="filters.search" class="form-control" type="search" placeholder="Nombre, código o ruta" />
            </AppFormField>

            <AppFormField label="Módulo">
              <v-select input-id="itemsModuleFilter" v-model="filters.moduleId" :options="modules" label="name" :reduce="(module) => module.id" placeholder="Todos" clearable />
            </AppFormField>

            <AppFormField label="Estado">
              <v-select input-id="itemsActiveFilter" v-model="filters.isActive" :options="activeOptions" label="name" :reduce="(option) => option.id" placeholder="Todos" clearable />
            </AppFormField>

            <AppFormField label="Menú">
              <v-select input-id="itemsShowMenuFilter" v-model="filters.showMenu" :options="menuOptions" label="name" :reduce="(option) => option.id" placeholder="Todos" clearable />
            </AppFormField>

            <AppFormField label="Reporte">
              <v-select input-id="itemsReportFilter" v-model="filters.isReport" :options="reportOptions" label="name" :reduce="(option) => option.id" placeholder="Todos" clearable />
            </AppFormField>
          </div>

          <AppButton nativeType="button" variant="ghost" class="filters-reset" @click="resetFilters">
            <AppIcon icon="sync-alt" />
            Limpiar
          </AppButton>
        </section>

        <AppLoading v-if="loading" />

        <section v-else class="items-tree-panel">
          <header class="tree-panel-head">
            <div>
              <h3>Estructura del menú</h3>
              <p>{{ filteredFlatItems.length }} items encontrados</p>
            </div>

            <AppButton nativeType="button" variant="ghost" @click="loadInitialData">
              <AppIcon icon="sync" />
              Actualizar
            </AppButton>
          </header>

          <div v-if="filteredTree.length" class="items-tree"></div>

          <div v-else class="empty-state">
            <div class="empty-state__icon">
              <AppIcon icon="search" />
            </div>
            <h4>No hay items para mostrar</h4>
            <p>Ajusta los filtros o crea un nuevo item de menú.</p>
          </div>
        </section>
      </div>

      <MenuItemFormDrawer
        v-if="showFormDrawer"
        :isVisible="showFormDrawer"
        :data="selectedItem"
        :modules="modules"
        :parent-items="parentItemOptions"
        :permissions="permissions"
        :default-parent-id="defaultParentId"
        :default-module-id="defaultModuleId"
        :saving="isSaving"
        @close="closeForm"
        @save="saveItem"
      />

      <AppModal v-model="showDeleteModal" @close="closeDelete">
        <AppConfirmDeleteModal v-if="showDeleteModal" :entity="deleteEntity" @confirmDelete="deleteItem" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import MenuItemFormDrawer from '../components/MenuItemFormDrawer.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { GetModulesResponse, GetModulesService } from '../services/getModules.service';
import { GetMenuItemsResponse, GetMenuItemsService } from '../services/getMenuItems.service';
import { GetMenuPermissionsService } from '../services/getMenuPermissions.service';
import { CreateOrUpdateMenuItemService } from '../services/createOrUpdateMenuItem.service';
import { DeleteMenuItemService } from '../services/deleteMenuItem.service';
import { MenuModuleDto } from '../dtos/menuModule.dto';
import { CreateOrUpdateMenuItemDto, MenuItemDto, MenuItemTreeOptionDto, MenuItemViewDto, MenuPermissionDto } from '../dtos/menuItem.dto';

const getMenuItemsService = new GetMenuItemsService();
const getModulesService = new GetModulesService();
const getMenuPermissionsService = new GetMenuPermissionsService();
const createOrUpdateMenuItemService = new CreateOrUpdateMenuItemService();
const deleteMenuItemService = new DeleteMenuItemService();

const getMenuItemsData = (response: GetMenuItemsResponse): MenuItemDto[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
};

const getModulesData = (response: GetModulesResponse): MenuModuleDto[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
};

const cloneMenuItem = (item: MenuItemDto): MenuItemDto => ({
  ...item,
  permissions: [...(item.permissions ?? [])],
  children: (item.children ?? []).map(cloneMenuItem),
});

const findItemById = (items: MenuItemDto[], itemId: number): MenuItemDto | null => {
  for (const item of items) {
    if (item.id === itemId) return item;

    const child = findItemById(item.children ?? [], itemId);
    if (child) return child;
  }

  return null;
};

const flattenMenuItems = (nodes: MenuItemViewDto[]): MenuItemViewDto[] => {
  const flat: MenuItemViewDto[] = [];
  const walk = (items: MenuItemViewDto[]) => {
    items.forEach((item) => {
      flat.push(item);
      walk(item.children);
    });
  };

  walk(nodes);
  return flat;
};

export default defineComponent({
  name: 'ItemsPage',
  components: {
    AppBaseList,
    AppButton,
    AppFormField,
    AppIcon,
    AppLoading,
    AppModal,
    AppConfirmDeleteModal,
    MenuItemFormDrawer,
  },
  setup() {
    const title = 'Items';
    useMeta({ title });

    const headerStorage = useHeaderStore();
    const items = ref<MenuItemDto[]>([]);
    const modules = ref<MenuModuleDto[]>([]);
    const permissions = ref<MenuPermissionDto[]>([]);
    const loading = ref(false);
    const isSaving = ref(false);
    const showFormDrawer = ref(false);
    const showDeleteModal = ref(false);
    const selectedItem = ref<MenuItemDto | null>(null);
    const itemToDelete = ref<MenuItemDto | null>(null);
    const defaultParentId = ref<number | null>(null);
    const defaultModuleId = ref<number | null>(null);

    const filters = reactive<{
      search: string;
      moduleId: number | null;
      isActive: number | null;
      showMenu: number | null;
      isReport: number | null;
    }>({
      search: '',
      moduleId: null,
      isActive: null,
      showMenu: null,
      isReport: null,
    });

    const activeOptions = [
      { id: 1, name: 'Activo' },
      { id: 0, name: 'Inactivo' },
    ];

    const menuOptions = [
      { id: 1, name: 'Visible' },
      { id: 0, name: 'Oculto' },
    ];

    const reportOptions = [
      { id: 1, name: 'Reporte' },
      { id: 0, name: 'No reporte' },
    ];

    const moduleMap = computed(() => new Map(modules.value.map((module) => [module.id, module.name])));

    const buildViewTree = (nodes: MenuItemDto[], depth = 0): MenuItemViewDto[] => {
      return nodes.map((item) => ({
        ...item,
        depth,
        moduleName: moduleMap.value.get(item.moduleId) || `Módulo ${item.moduleId}`,
        permissions: item.permissions ?? [],
        children: buildViewTree(item.children ?? [], depth + 1),
      }));
    };

    const itemTree = computed(() => buildViewTree(items.value));
    const flatItems = computed(() => flattenMenuItems(itemTree.value));

    const parentItemOptions = computed<MenuItemTreeOptionDto[]>(() =>
      flatItems.value.map((item) => ({
        id: item.id,
        moduleId: item.moduleId,
        name: item.name,
        code: item.code,
        depth: item.depth,
        moduleName: item.moduleName,
        treeLabel: `${'— '.repeat(item.depth)}${item.name || item.code} (#${item.id})`,
      }))
    );

    const matchesFilters = (item: MenuItemViewDto): boolean => {
      const search = filters.search.trim().toLowerCase();
      const matchesSearch =
        !search || [item.id, item.name, item.code, item.route, item.moduleName].filter((value) => value !== null && value !== undefined).some((value) => String(value).toLowerCase().includes(search));

      const matchesModule = filters.moduleId === null || item.moduleId === filters.moduleId;
      const matchesActive = filters.isActive === null || Number(item.isActive) === filters.isActive;
      const matchesMenu = filters.showMenu === null || Number(item.showMenu) === filters.showMenu;
      const matchesReport = filters.isReport === null || Number(item.isReport) === filters.isReport;

      return matchesSearch && matchesModule && matchesActive && matchesMenu && matchesReport;
    };

    const filterTree = (nodes: MenuItemViewDto[]): MenuItemViewDto[] => {
      return nodes.reduce<MenuItemViewDto[]>((filtered, item) => {
        const children = filterTree(item.children);
        if (matchesFilters(item) || children.length) {
          filtered.push({
            ...item,
            children,
          });
        }

        return filtered;
      }, []);
    };

    const filteredTree = computed(() => filterTree(itemTree.value));
    const filteredFlatItems = computed(() => flattenMenuItems(filteredTree.value));

    const summaryCards = computed(() => [
      {
        label: 'Total items',
        value: flatItems.value.length,
        icon: 'stream',
        className: 'summary-card__icon--blue',
      },
      {
        label: 'Principales',
        value: items.value.length,
        icon: 'sitemap',
        className: 'summary-card__icon--green',
      },
      {
        label: 'Activos',
        value: flatItems.value.filter((item) => Number(item.isActive) === 1).length,
        icon: 'check-circle',
        className: 'summary-card__icon--amber',
      },
      {
        label: 'Visibles',
        value: flatItems.value.filter((item) => Number(item.showMenu) === 1).length,
        icon: 'eye',
        className: 'summary-card__icon--slate',
      },
    ]);

    const loadInitialData = async () => {
      try {
        loading.value = true;
        const [itemsResponse, modulesResponse, permissionsResponse] = await Promise.all([
          getMenuItemsService.run({
            sort: 'id',
            order: 'DESC',
            noPag: true,
          }),
          getModulesService.run({
            sort: 'id',
            order: 'DESC',
            noPag: true,
          }),
          getMenuPermissionsService.run(),
        ]);

        items.value = getMenuItemsData(itemsResponse);
        modules.value = getModulesData(modulesResponse);
        permissions.value = permissionsResponse;
      } catch (error) {
        console.error('Error al cargar items de menú:', error);
      } finally {
        loading.value = false;
      }
    };

    const resetFilters = () => {
      filters.search = '';
      filters.moduleId = null;
      filters.isActive = null;
      filters.showMenu = null;
      filters.isReport = null;
    };

    const openCreate = () => {
      selectedItem.value = null;
      defaultParentId.value = null;
      defaultModuleId.value = filters.moduleId;
      showFormDrawer.value = true;
    };

    const openCreateChild = (item: MenuItemViewDto) => {
      selectedItem.value = null;
      defaultParentId.value = item.id;
      defaultModuleId.value = item.moduleId;
      showFormDrawer.value = true;
    };

    const openEdit = (item: MenuItemViewDto) => {
      const originalItem = findItemById(items.value, item.id);
      selectedItem.value = originalItem ? cloneMenuItem(originalItem) : null;
      defaultParentId.value = null;
      defaultModuleId.value = null;
      showFormDrawer.value = true;
    };

    const closeForm = () => {
      showFormDrawer.value = false;
      selectedItem.value = null;
      defaultParentId.value = null;
      defaultModuleId.value = null;
    };

    const saveItem = async (payload: CreateOrUpdateMenuItemDto, itemId: number | null) => {
      try {
        isSaving.value = true;
        await createOrUpdateMenuItemService.run(payload, itemId ?? undefined);
        closeForm();
        await loadInitialData();
      } catch (error) {
        console.error('Error al guardar item de menú:', error);
      } finally {
        isSaving.value = false;
      }
    };

    const openDelete = (item: MenuItemViewDto) => {
      const originalItem = findItemById(items.value, item.id);
      itemToDelete.value = originalItem || item;
      showDeleteModal.value = true;
    };

    const closeDelete = () => {
      showDeleteModal.value = false;
      itemToDelete.value = null;
    };

    const deleteItem = async () => {
      if (!itemToDelete.value?.id) return;

      try {
        await deleteMenuItemService.run(itemToDelete.value.id);
        closeDelete();
        await loadInitialData();
      } catch (error) {
        console.error('Error al eliminar item de menú:', error);
      }
    };

    const deleteEntity = computed(() => (itemToDelete.value?.name ? `item ${itemToDelete.value.name}` : 'item'));

    onMounted(() => {
      headerStorage.module = { name: 'Casurid', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      loadInitialData();
    });

    return {
      title,
      filters,
      modules,
      permissions,
      activeOptions,
      menuOptions,
      reportOptions,
      loading,
      isSaving,
      summaryCards,
      filteredTree,
      filteredFlatItems,
      parentItemOptions,
      showFormDrawer,
      showDeleteModal,
      selectedItem,
      defaultParentId,
      defaultModuleId,
      deleteEntity,
      loadInitialData,
      resetFilters,
      openCreate,
      openCreateChild,
      openEdit,
      closeForm,
      saveItem,
      openDelete,
      closeDelete,
      deleteItem,
    };
  },
});
</script>

<style scoped>
.items-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.items-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.items-heading h2 {
  margin: 0;
  color: #111827;
  font-size: 1.35rem;
  font-weight: 800;
}

.items-heading p {
  margin: 0.25rem 0 0;
  color: #64748b;
  line-height: 1.45;
}

.items-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  padding: 0.95rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.summary-card__icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
}

.summary-card__icon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.summary-card__icon--green {
  background: #dcfce7;
  color: #15803d;
}

.summary-card__icon--amber {
  background: #fef3c7;
  color: #b45309;
}

.summary-card__icon--slate {
  background: #e2e8f0;
  color: #334155;
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
}

.summary-card strong {
  display: block;
  color: #0f172a;
  font-size: 1.35rem;
  line-height: 1.15;
}

.items-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(14rem, 1.4fr) repeat(4, minmax(9rem, 1fr));
  gap: 0.75rem;
  flex: 1;
}

.filters-reset {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.items-tree-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.tree-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tree-panel-head h3 {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 800;
}

.tree-panel-head p {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.84rem;
}

.items-tree {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 18rem;
  padding: 2rem;
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
}

.empty-state__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  background: #eef6ff;
  color: #1d4ed8;
}

.empty-state h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.empty-state p {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.items-action-icon {
  margin-right: 0.4rem;
}

@media (max-width: 1200px) {
  .items-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .items-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }
}

@media (max-width: 576px) {
  .items-summary,
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .items-heading h2 {
    font-size: 1.15rem;
  }

  .tree-panel-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
