<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton outlined variant="light" nativeType="button" @click="openCreate">
        <AppIcon icon="plus" class="modules-action-icon" />
        Nuevo módulo
      </AppButton>
    </template>

    <template #content>
      <div class="modules-page">
        <header class="modules-heading">
          <div>
            <h2>Módulos del menú</h2>
            <p>Administra los módulos disponibles, sus rutas, orden de aparición y configuración base.</p>
          </div>
        </header>

        <section class="modules-summary">
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

        <AppDatatable name="casurid-modules" :service="modulesTableService" :params="tableParams" :default-sort="['id', 'desc']" refresh-btn>
          <template #filters>
            <AppFilter v-model="filters.internalBase" filter-name="casurid-modules.internalBase">
              <label for="moduleInternalBaseFilter">Base interna</label>
              <v-select input-id="moduleInternalBaseFilter" v-model="filters.internalBase" :options="internalBaseOptions" label="name" :reduce="(option) => option.id" placeholder="Todas" />
            </AppFilter>

            <AppFilter v-model="filters.routeState" filter-name="casurid-modules.routeState">
              <label for="moduleRouteStateFilter">Ruta</label>
              <v-select input-id="moduleRouteStateFilter" v-model="filters.routeState" :options="routeStateOptions" label="name" :reduce="(option) => option.id" placeholder="Todas" />
            </AppFilter>
          </template>

          <AppDatatableColumn label="Módulo" field="name" :sortable="true" v-slot="{ row }">
            <div class="module-cell">
              <div class="module-cell__icon">
                <AppIcon :icon="resolveIcon(row.icon)" />
              </div>

              <div class="module-cell__content">
                <span class="module-cell__name">{{ row.name || '-' }}</span>
                <span class="module-cell__description">{{ row.description || 'Sin descripción' }}</span>
              </div>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Ruta" field="route" :sortable="true" v-slot="{ row }">
            <span v-if="row.route" class="route-pill">{{ row.route }}</span>
            <span v-else class="muted-text">Sin ruta</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Icono" field="icon" :sortable="true" v-slot="{ row }">
            <span class="code-value">{{ row.icon || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Clase CSS" field="cssClass" :sortable="true" v-slot="{ row }">
            <span class="code-value">{{ row.cssClass || '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Orden" field="order" :sortable="true" numeric v-slot="{ row }">
            <span class="order-badge">{{ row.order }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Base" field="internalBase" :sortable="true" v-slot="{ row }">
            <span class="status-badge" :class="row.internalBase ? 'status-badge--success' : 'status-badge--neutral'">
              {{ row.internalBase ? 'Interna' : 'Configurable' }}
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Actualización" field="updatedAt" :sortable="true" v-slot="{ row }">
            <span class="muted-text">{{ formatDate(row.updatedAt || row.createdAt) }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Acciones" :position="'right'" v-slot="{ row }">
            <AppButtonGroup>
              <AppButtonEdit nativeType="button" @click="openEdit(row)" />
              <AppButtonDelete nativeType="button" @click="openDelete(row)" />
            </AppButtonGroup>
          </AppDatatableColumn>
        </AppDatatable>
      </div>

      <ModuleFormDrawer v-if="showFormDrawer" :isVisible="showFormDrawer" :data="selectedModule" :saving="isSaving" @close="closeForm" @save="saveModule" />

      <AppModal v-model="showDeleteModal" @close="closeDelete">
        <AppConfirmDeleteModal v-if="showDeleteModal" :entity="deleteEntity" @confirmDelete="deleteModule" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import ModuleFormDrawer from '../components/ModuleFormDrawer.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetModulesResponse, GetModulesService } from '../services/getModules.service';
import { CreateOrUpdateModuleService } from '../services/createOrUpdateModule.service';
import { DeleteModuleService } from '../services/deleteModule.service';
import { CreateOrUpdateMenuModuleDto, MenuModuleDto, MenuModuleRouteState } from '../dtos/menuModule.dto';

const modulesTableService = new GetModulesService();
const createOrUpdateModuleService = new CreateOrUpdateModuleService();
const deleteModuleService = new DeleteModuleService();
const updateDatatableService = new UpdateDatatableService();

const getModulesData = (response: GetModulesResponse): MenuModuleDto[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
};

const fallbackIcon = 'project-diagram';
const safeIconNames = new Set([
  'sitemap',
  'project-diagram',
  'book',
  'book-open',
  'university',
  'users',
  'user-cog',
  'cog',
  'cogs',
  'clipboard-list',
  'calendar-week',
  'layer-group',
  'graduation-cap',
  'poll',
  'wallet',
  'folder',
  'database',
  'globe',
  'shield-alt',
  'briefcase',
  'scroll',
  'chart-line',
  'chart-pie',
  'file-alt',
  'tags',
  'building',
]);

export default defineComponent({
  name: 'ModulesPage',
  components: {
    AppBaseList,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppIcon,
    AppModal,
    AppConfirmDeleteModal,
    ModuleFormDrawer,
  },
  setup() {
    const title = 'Módulos';
    useMeta({ title });

    const headerStorage = useHeaderStore();
    const summaryModules = ref<MenuModuleDto[]>([]);
    const selectedModule = ref<MenuModuleDto | null>(null);
    const moduleToDelete = ref<MenuModuleDto | null>(null);
    const showFormDrawer = ref(false);
    const showDeleteModal = ref(false);
    const isSaving = ref(false);

    const filters = reactive<{
      internalBase: number | null;
      routeState: MenuModuleRouteState | null;
    }>({
      internalBase: null,
      routeState: null,
    });

    const internalBaseOptions = [
      { id: 1, name: 'Interna' },
      { id: 0, name: 'Configurable' },
    ];

    const routeStateOptions: { id: MenuModuleRouteState; name: string }[] = [
      { id: 'withRoute', name: 'Con ruta' },
      { id: 'withoutRoute', name: 'Sin ruta' },
    ];

    const tableParams = computed(() => ({
      order: 'DESC',
      internalBase: filters.internalBase,
      routeState: filters.routeState,
    }));

    const latestModule = computed(() => [...summaryModules.value].sort((first, second) => second.id - first.id)[0] || null);

    const summaryCards = computed(() => [
      {
        label: 'Total módulos',
        value: summaryModules.value.length,
        icon: 'project-diagram',
        className: 'summary-card__icon--blue',
      },
      {
        label: 'Base interna',
        value: summaryModules.value.filter((module) => Number(module.internalBase) === 1).length,
        icon: 'shield-alt',
        className: 'summary-card__icon--green',
      },
      {
        label: 'Con ruta',
        value: summaryModules.value.filter((module) => Boolean(module.route?.trim())).length,
        icon: 'globe',
        className: 'summary-card__icon--amber',
      },
      {
        label: 'Último ID',
        value: latestModule.value?.id ?? '-',
        icon: 'hashtag',
        className: 'summary-card__icon--slate',
      },
    ]);

    const loadSummary = async () => {
      try {
        const response = await modulesTableService.run({
          sort: 'id',
          order: 'DESC',
          page: 1,
          perPage: 10,
        });

        summaryModules.value = getModulesData(response);
      } catch (error) {
        console.error('Error al cargar resumen de módulos:', error);
      }
    };

    const resolveIcon = (icon: string | null): string => {
      const clean = String(icon || '')
        .trim()
        .replace(/^fas\s+/i, '')
        .replace(/^fa\s+/i, '')
        .replace(/^fa-/i, '');

      return safeIconNames.has(clean) ? clean : fallbackIcon;
    };

    const formatDate = (date: string | null) => {
      if (!date) return '-';

      return new Date(date).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const openCreate = () => {
      selectedModule.value = null;
      showFormDrawer.value = true;
    };

    const openEdit = (module: MenuModuleDto) => {
      selectedModule.value = { ...module };
      showFormDrawer.value = true;
    };

    const closeForm = () => {
      showFormDrawer.value = false;
      selectedModule.value = null;
    };

    const saveModule = async (payload: CreateOrUpdateMenuModuleDto, moduleId: number | null) => {
      try {
        isSaving.value = true;
        await createOrUpdateModuleService.run(payload, moduleId ?? undefined);
        closeForm();
        updateDatatableService.run();
        await loadSummary();
      } catch (error) {
        console.error('Error al guardar módulo:', error);
      } finally {
        isSaving.value = false;
      }
    };

    const openDelete = (module: MenuModuleDto) => {
      moduleToDelete.value = module;
      showDeleteModal.value = true;
    };

    const closeDelete = () => {
      showDeleteModal.value = false;
      moduleToDelete.value = null;
    };

    const deleteModule = async () => {
      if (!moduleToDelete.value?.id) return;

      try {
        await deleteModuleService.run(moduleToDelete.value.id);
        closeDelete();
        updateDatatableService.run();
        await loadSummary();
      } catch (error) {
        console.error('Error al eliminar módulo:', error);
      }
    };

    const deleteEntity = computed(() => (moduleToDelete.value?.name ? `módulo ${moduleToDelete.value.name}` : 'módulo'));

    onMounted(() => {
      headerStorage.module = { name: 'Casurid', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      loadSummary();
    });

    return {
      title,
      filters,
      internalBaseOptions,
      routeStateOptions,
      tableParams,
      summaryCards,
      modulesTableService,
      showFormDrawer,
      showDeleteModal,
      selectedModule,
      isSaving,
      deleteEntity,
      resolveIcon,
      formatDate,
      openCreate,
      openEdit,
      closeForm,
      saveModule,
      openDelete,
      closeDelete,
      deleteModule,
    };
  },
});
</script>

<style scoped>
.modules-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modules-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.modules-heading h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
}

.modules-heading p {
  margin: 0.25rem 0 0;
  color: #64748b;
  line-height: 1.45;
}

.modules-summary {
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
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

.module-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 18rem;
}

.module-cell__icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #334155;
}

.module-cell__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.module-cell__name {
  color: #0f172a;
  font-weight: 700;
}

.module-cell__description {
  max-width: 24rem;
  color: #64748b;
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-pill,
.code-value {
  display: inline-flex;
  max-width: 18rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-pill {
  background: #eef6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.code-value {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-family: var(--bs-font-monospace);
  font-size: 0.78rem;
}

.order-badge {
  display: inline-flex;
  min-width: 2.25rem;
  justify-content: center;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: #f4f4f5;
  color: #27272a;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.status-badge--success {
  background: #ecfdf5;
  color: #047857;
}

.status-badge--neutral {
  background: #f1f5f9;
  color: #475569;
}

.muted-text {
  color: #94a3b8;
  font-size: 0.86rem;
}

.modules-action-icon {
  margin-right: 0.4rem;
}

@media (max-width: 1200px) {
  .modules-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 576px) {
  .modules-summary {
    grid-template-columns: 1fr;
  }

  .modules-heading h2 {
    font-size: 1.15rem;
  }
}
</style>
