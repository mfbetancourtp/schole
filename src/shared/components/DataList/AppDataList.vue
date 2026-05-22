<template>
  <AppCard>
    <!-- Título opcional -->
    <template v-if="title || $slots.title" #title>
      <div class="adl__titlebar">
        <div class="adl__titlebar-content">
          <slot name="title">
            <h5 class="adl__title">{{ title }}</h5>
          </slot>
        </div>

        <div v-if="showButtonFilter && filterTriggerPlacement === 'title'" class="adl__filter-wrapper" ref="filtersWrapperRef">
          <AppButton variant="primary" outlined icon="sliders-h" :aria-expanded="showFiltersPanel" title="Filtros" @click="toggleFiltersPanel" />

          <div v-show="showFiltersPanel" class="adl__filters-panel" role="dialog" aria-label="Filtros">
            <span class="adl__filters-panel-title fw-bold">Filtros</span>

            <div>
              <slot name="filters" />
            </div>

            <div class="adl__filters-panel-actions">
              <AppButton variant="primary" expanded @click="applyFilters"> Aplicar </AppButton>
              <AppButton variant="primary" outlined expanded @click="closeFiltersPanel"> Cancelar </AppButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <!-- Slot de contenido adicional sobre la tabla -->
      <slot name="additionalContent" />

      <!-- ── Barra superior: búsqueda + botón filtros + acciones ── -->
      <div v-if="enableSearch || showTopbarFilter || refreshBtn || $slots.actions" class="adl__topbar">
        <!-- Búsqueda -->
        <div class="adl__topbar-left">
          <input v-if="enableSearch" v-model="search" type="text" class="adl__search-input" placeholder="Buscar..." aria-label="Buscar" @input="handleSearch" />
        </div>

        <!-- Filtros dropdown + acciones + refresh -->
        <div class="adl__topbar-right">
          <!-- Panel de filtros (dropdown, igual que AppDatatableFilters) -->
          <div v-if="showTopbarFilter" class="adl__filter-wrapper" ref="filtersWrapperRef">
            <AppButton variant="primary" outlined icon="sliders-h" :aria-expanded="showFiltersPanel" title="Filtros" @click="toggleFiltersPanel" />

            <div v-show="showFiltersPanel" class="adl__filters-panel" role="dialog" aria-label="Filtros">
              <span class="adl__filters-panel-title fw-bold">Filtros</span>

              <div>
                <slot name="filters" />
              </div>

              <div class="adl__filters-panel-actions">
                <AppButton variant="primary" expanded @click="applyFilters"> Aplicar </AppButton>
                <AppButton variant="primary" outlined expanded @click="closeFiltersPanel"> Cancelar </AppButton>
              </div>
            </div>
          </div>

          <!-- Acciones custom del padre -->
          <slot name="actions" />

          <!-- Botón refrescar -->
          <button v-if="refreshBtn" type="button" class="adl__refresh-btn" title="Refrescar tabla" @click="refresh">
            <AppIcon icon="sync" />
          </button>
        </div>
      </div>

      <!-- ── Indicador de carga ── -->
      <AppProgressBar v-if="loading" />

      <!-- ── Tabla HTML pura con CSS ── -->
      <div class="adl__table-wrapper">
        <table class="adl__table" role="grid" aria-label="Tabla de datos">
          <!-- Cabecera -->
          <thead class="adl__thead">
            <tr>
              <th
                v-for="col in visibleColumns"
                :key="col.id"
                class="adl__th"
                :class="{
                  'adl__th--sortable': col.sortable,
                  'adl__th--sorted': sortField === col.field && !!col.field,
                  'adl__th--sticky': col.sticky,
                  [`adl__th--${col.position}`]: !!col.position,
                }"
                :style="colWidthStyle(col.width)"
                :aria-sort="col.sortable && col.field && sortField === col.field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined"
                @click="col.sortable && col.field ? toggleSort(col.field) : undefined"
              >
                <div class="adl__th-inner">
                  <!-- Cabecera personalizada vía slot #header del hijo -->
                  <component v-if="col.renderHeader" :is="cellRenderer(col.renderHeader)" />
                  <span v-else>{{ col.label }}</span>

                  <!-- Icono de ordenamiento -->
                  <span
                    v-if="col.sortable"
                    class="adl__sort-icon"
                    :class="{
                      'adl__sort-icon--active': sortField === col.field,
                      'adl__sort-icon--desc': sortField === col.field && sortOrder === 'desc',
                    }"
                    aria-hidden="true"
                  >
                    <AppIcon icon="caret-up" />
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Cuerpo -->
          <tbody class="adl__tbody">
            <!-- Estado vacío / cargando -->
            <tr v-if="!paginatedData.length">
              <td :colspan="visibleColumns.length" class="adl__empty-cell">
                <span v-if="loading">Cargando...</span>
                <span v-else>No se encontraron registros</span>
              </td>
            </tr>

            <!-- Filas de datos -->
            <tr
              v-else
              v-for="(row, rowIndex) in paginatedData"
              :key="getRowKey(row, rowIndex)"
              class="adl__row"
              :class="{ 'adl__row--clickable': !!onRowClick }"
              @click="onRowClick ? onRowClick(row) : undefined"
            >
              <td
                v-for="col in visibleColumns"
                :key="col.id"
                class="adl__td"
                :class="{
                  'adl__td--sticky': col.sticky,
                  [`adl__td--${col.position}`]: !!col.position,
                }"
              >
                <!-- Renderiza el contenido del slot del AppDataListColumn hijo -->
                <component :is="cellRenderer(() => col.renderCell(row, rowIndex))" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Paginación inferior ── -->
      <div v-if="total > 0 || loading" class="adl__pagination">
        <!-- Selector perPage + info de registros -->
        <div v-if="showFilterSteps" class="adl__per-page">
          <span class="adl__per-page-label">Mostrar</span>
          <AppSelect v-model="perPage">
            <option v-for="opt in perPageOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </AppSelect>
          <span class="adl__record-info"> {{ total === 0 ? '0' : `${recordStart}–${recordEnd}` }} de {{ total }} registros </span>
        </div>

        <!-- Controles de página -->
        <div class="adl__pagination-controls">
          <AppPagination :total="total" :current="currentPage" :per-page="perPage" :loading="loading" class="border-0" @update:current="onPageChange" />
        </div>
      </div>

      <!--
        Slot invisible: aquí se montan los AppDataListColumn hijos.
        Ellos se registran en el contexto vía provide/inject.
      -->
      <div style="display: none" aria-hidden="true">
        <slot />
      </div>
    </template>
  </AppCard>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, ref, computed, provide, reactive, watch, onMounted, onUnmounted, defineComponent, useSlots, type VNode } from 'vue';
import { debounce } from 'ts-debounce';

import AppCard from '../Card/AppCard.vue';
import AppButton from '../Buttons/AppButton.vue';
import AppPagination from '../AppPagination.vue';
import AppProgressBar from '../AppProgressBar.vue';
import AppSelect from '../Forms/AppSelect.vue';
import AppIcon from '../AppIcon.vue';

import { DATA_LIST_KEY, createDataListContext, type ColumnDef } from './useDataList';

// ─── Constantes ───────────────────────────────────────────────────────────────

const PER_PAGE_OPTIONS = [10, 20, 30, 50] as const;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface FetchParams {
  page: number;
  perPage: number;
  search: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Identificador único — usado para distinguir instancias */
  name: string;
  /** Total de registros del servidor (modo remoto) */
  total?: number;
  /**
   * Datos locales (modo local).
   * Si se pasan datos, el componente pagina y filtra internamente.
   */
  data?: unknown[];
  /**
   * Servicio con método fetch (modo remoto alternativo).
   * Debe tener el método indicado en `serviceMethod` que acepte `FetchParams`.
   */
  service?: Record<string, (...args: unknown[]) => Promise<{ data: unknown[]; total: number }>>;
  /** Nombre del método del servicio a llamar (default: 'run') */
  serviceMethod?: string;
  /** Parámetros extra que se combinan con los de paginación al llamar al servicio */
  params?: Record<string, unknown>;
  /** Items por página al montar */
  defaultPerPage?: number;
  /** Muestra el input de búsqueda */
  enableSearch?: boolean;
  /** Muestra el selector "Mostrar N" y el contador de registros */
  showFilterSteps?: boolean;
  /** Estado de carga externo (modo remoto sin servicio) */
  loading?: boolean;
  /** Total externo (modo remoto sin servicio — usado con @fetch) */
  title?: string;
  /** Muestra el botón de refrescar */
  refreshBtn?: boolean;
  /** Ubicación del disparador del panel de filtros */
  filterTriggerPlacement?: 'topbar' | 'title';
  /** Clave del campo para búsqueda local (filtra solo esa propiedad) */
  filterKeyLocal?: string;
  /** Clave única por fila (mejora rendimiento del diff del DOM) */
  rowKey?: string;
  /** Callback al hacer click en una fila */
  onRowClick?: (row: unknown) => void;
  /**
   * Si es true, NO emite `fetch` al montar.
   * Útil cuando el padre controla la carga inicial.
   */
  skipInitialFetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  data: () => [],
  service: undefined,
  serviceMethod: 'run',
  params: () => ({}),
  defaultPerPage: 10,
  enableSearch: true,
  showFilterSteps: true,
  loading: false,
  title: '',
  refreshBtn: false,
  filterTriggerPlacement: 'topbar',
  filterKeyLocal: undefined,
  rowKey: undefined,
  onRowClick: undefined,
  skipInitialFetch: false,
});

// ─── Emits ────────────────────────────────────────────────────────────────────

interface Emits {
  /**
   * Emitido al cambiar página, perPage, búsqueda u ordenamiento.
   * El padre llama al servicio con estos params y actualiza `total`.
   */
  fetch: [params: FetchParams];
  /** Emitido al hacer click en "Aplicar" en el panel de filtros */
  filter: [];
  /** Emitido cuando se abre el panel de filtros */
  filterOpen: [];
  /** Emitido cuando se cierra el panel sin aplicar */
  filterCancel: [];
}

const emit = defineEmits<Emits>();
const slots = useSlots();

// ─── Columnas (registradas por hijos) ────────────────────────────────────────

const columns = reactive<ColumnDef[]>([]);
provide(DATA_LIST_KEY, createDataListContext(columns));

const visibleColumns = computed(() => columns.filter((c) => c.visible !== false));

// ─── Estado de paginación ─────────────────────────────────────────────────────

const currentPage = ref(1);
const perPage = ref(props.defaultPerPage);
const perPageOptions = ref([...PER_PAGE_OPTIONS]);

// ─── Estado de búsqueda y ordenamiento ───────────────────────────────────────

const search = ref('');
const sortField = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

// ─── Estado de carga interna (modo servicio) ──────────────────────────────────

const internalLoading = ref(false);
const internalData = ref<unknown[]>([]);
const internalTotal = ref(0);

// ─── Modo de operación ────────────────────────────────────────────────────────

const isLocalMode = computed(() => !props.service && props.data.length >= 0 && !props.skipInitialFetch);
const isServiceMode = computed(() => !!props.service);

// En modo externo puro (ni data ni service), el padre controla loading y total
const effectiveTotal = computed(() => (isServiceMode.value ? internalTotal.value : isLocalMode.value ? filteredLocalData.value.length : props.total));

// ─── Datos locales con filtro y paginación ────────────────────────────────────

const filteredLocalData = computed(() => {
  if (!isLocalMode.value) return [];

  const term = search.value.toLowerCase();
  if (!term) return props.data;

  return props.data.filter((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const obj = item as Record<string, unknown>;

    if (props.filterKeyLocal) {
      return String(obj[props.filterKeyLocal] ?? '')
        .toLowerCase()
        .includes(term);
    }
    return Object.values(obj).some((val) =>
      String(val ?? '')
        .toLowerCase()
        .includes(term)
    );
  });
});

function getFieldValue(item: unknown, field: string): unknown {
  if (!field || typeof item !== 'object' || item === null) return undefined;

  return field.split('.').reduce<unknown>((currentValue, key) => {
    if (typeof currentValue !== 'object' || currentValue === null) return undefined;
    return (currentValue as Record<string, unknown>)[key];
  }, item);
}

function compareValues(leftValue: unknown, rightValue: unknown): number {
  if (leftValue == null && rightValue == null) return 0;
  if (leftValue == null) return 1;
  if (rightValue == null) return -1;

  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue;
  }

  return String(leftValue).localeCompare(String(rightValue), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

const sortedLocalData = computed(() => {
  if (!isLocalMode.value) return [];

  const localData = [...filteredLocalData.value];
  if (!sortField.value) return localData;

  localData.sort((leftRow, rightRow) => {
    const sortResult = compareValues(getFieldValue(leftRow, sortField.value), getFieldValue(rightRow, sortField.value));

    return sortOrder.value === 'asc' ? sortResult : -sortResult;
  });

  return localData;
});

const paginatedLocalData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return sortedLocalData.value.slice(start, start + perPage.value);
});

const paginatedData = computed(() => (isServiceMode.value ? internalData.value : isLocalMode.value ? paginatedLocalData.value : props.data));

// ─── Info de registros ────────────────────────────────────────────────────────

const total = computed(() => effectiveTotal.value);

const recordStart = computed(() => (total.value === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1));
const recordEnd = computed(() => Math.min(perPage.value * currentPage.value, total.value));

// ─── Row key ─────────────────────────────────────────────────────────────────

function getRowKey(row: unknown, index: number): string | number {
  if (props.rowKey && typeof row === 'object' && row !== null) {
    return (row as Record<string, unknown>)[props.rowKey] as string | number;
  }
  return index;
}

// ─── Ordenamiento ─────────────────────────────────────────────────────────────

function toggleSort(field: string): void {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
  if (!isLocalMode.value) fetchData();
}

// ─── Parámetros de fetch ──────────────────────────────────────────────────────

function buildParams(): FetchParams {
  const p: FetchParams = {
    page: currentPage.value,
    perPage: perPage.value,
    search: search.value,
  };
  if (sortField.value) {
    p.sort = sortField.value;
    p.order = sortOrder.value;
  }
  return p;
}

// ─── Fetch con servicio ───────────────────────────────────────────────────────

const fetchData = debounce(async (): Promise<void> => {
  if (isServiceMode.value) {
    internalLoading.value = true;
    try {
      const methodName = props.serviceMethod ?? 'run';
      const svc = props.service!;
      if (!(methodName in svc) || typeof svc[methodName] !== 'function') {
        throw new Error(`Método '${methodName}' no existe en el servicio`);
      }
      const mergedParams = { ...buildParams(), ...props.params };
      const response = await svc[methodName](mergedParams);
      internalData.value = response.data;
      internalTotal.value = response.total ?? 0;
    } catch (err) {
      console.error('[AppDataList] Error al obtener datos:', err);
    } finally {
      internalLoading.value = false;
    }
  } else {
    // Modo externo puro: solo emite params para que el padre haga el fetch
    emit('fetch', buildParams());
  }
}, 400);

// ─── Búsqueda ─────────────────────────────────────────────────────────────────

const debouncedSearch = debounce((): void => {
  currentPage.value = 1;
  fetchData();
}, 400);

function handleSearch(): void {
  if (isLocalMode.value) return; // Local filtra en computed, no hace fetch
  debouncedSearch();
}

// En modo local, resetear página cuando cambie el filtro
watch(filteredLocalData, () => {
  if (isLocalMode.value) currentPage.value = 1;
});

// Re-fetch cuando cambien los params externos (modo servicio)
watch(
  () => props.params,
  () => {
    currentPage.value = 1;
    fetchData();
  },
  { deep: true }
);

// ─── Paginación ───────────────────────────────────────────────────────────────

function onPageChange(page: number): void {
  currentPage.value = page;
  if (!isLocalMode.value) fetchData();
}

watch(perPage, () => {
  currentPage.value = 1;
  if (!isLocalMode.value) fetchData();
});

// ─── Refresco externo ─────────────────────────────────────────────────────────

function refresh(): void {
  fetchData();
}

const handleExternalEvent = (): void => refresh();

function setData(data: unknown[], totalValue?: number): void {
  internalData.value = data;

  if (typeof totalValue === 'number') {
    internalTotal.value = totalValue;
  }
}

// ─── Panel de filtros ─────────────────────────────────────────────────────────

const filtersWrapperRef = ref<HTMLElement | null>(null);
const showFiltersPanel = ref(false);

function hasRenderableSlotContent(nodes: VNode[] = []): boolean {
  return nodes.some((node) => {
    if (!node) return false;

    if (node.type === Comment) return false;

    if (node.type === Text) {
      return String(node.children ?? '').trim().length > 0;
    }

    if (node.type === Fragment) {
      return hasRenderableSlotContent(Array.isArray(node.children) ? (node.children as VNode[]) : []);
    }

    return true;
  });
}

const showButtonFilter = computed(() => hasRenderableSlotContent(slots.filters?.() as VNode[] | undefined));

const showTopbarFilter = computed(() => showButtonFilter.value && props.filterTriggerPlacement === 'topbar');

function toggleFiltersPanel(): void {
  if (showFiltersPanel.value) {
    closeFiltersPanel();
    return;
  }

  emit('filterOpen');
  showFiltersPanel.value = true;
}

function closeFiltersPanel(): void {
  if (!showFiltersPanel.value) return;

  showFiltersPanel.value = false;
  emit('filterCancel');
}

function applyFilters(): void {
  currentPage.value = 1;
  emit('filter');
  fetchData();
  showFiltersPanel.value = false;
}

function handleClickOutside(event: MouseEvent): void {
  if (filtersWrapperRef.value && !filtersWrapperRef.value.contains(event.target as Node)) {
    closeFiltersPanel();
  }
}

// ─── Column width style ───────────────────────────────────────────────────────

function colWidthStyle(width: string | number | undefined): Record<string, string> {
  if (!width) return {};
  return { width: typeof width === 'number' ? `${width}px` : width };
}

// ─── Cell renderer helper ─────────────────────────────────────────────────────
/**
 * Convierte una función que devuelve VNodes en un componente funcional
 * que puede usarse con <component :is="...">.
 */
function cellRenderer(renderFn: () => VNode[] | undefined) {
  return defineComponent({
    setup() {
      return () => renderFn() ?? [];
    },
  });
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!props.skipInitialFetch && !isLocalMode.value) {
    fetchData();
  }

  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('updateDataList', handleExternalEvent, true);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('updateDataList', handleExternalEvent, true);
});

// ─── Expose ───────────────────────────────────────────────────────────────────

defineExpose({
  /** Fuerza un re-fetch con los parámetros actuales */
  refresh,
  setData,
  currentPage,
  perPage,
  search,
  sortField,
  sortOrder,
});
</script>

<style scoped>
/* ── Título ─────────────────────────────────────────── */
.adl__titlebar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.adl__titlebar-content {
  flex: 1 1 auto;
  min-width: 0;
}

.adl__title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #000;
  margin-bottom: 0;
}

/* ── Barra superior ──────────────────────────────────── */
.adl__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: var(--padding-table-filter, 0.75rem);
}

.adl__topbar-left {
  display: flex;
  align-items: center;
  flex: 1 1 200px;
}

.adl__topbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  position: relative;
}

/* Input de búsqueda */
.adl__search-input {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  border-radius: var(--border-radius-1, 0.375rem);
  font-size: var(--font-size-2, 0.875rem);
  line-height: 1.5;
  color: rgba(var(--color-gray-900-rgb), 0.8);
  background-color: var(--color-light, #fff);
  border: 1px solid rgba(var(--color-gray-600-rgb), 0.6);
  transition: border-color 0.15s ease;
}

.adl__search-input:focus {
  outline: none;
  border-color: rgba(var(--color-gray-600-rgb), 1);
}

/* ── Botón de filtros ────────────────────────────────── */
.adl__filter-wrapper {
  position: relative;
  color: initial;
  font-size: initial;
  font-weight: initial;
  line-height: normal;
}

/* Panel dropdown de filtros */
.adl__filters-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 50;
  min-width: 350px;
  background: #f9f9f9;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  padding: 17px 24px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #212529;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
}

.adl__filters-panel-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bs-gray-800, #343a40);
}

.adl__filters-panel :deep(label) {
  margin-bottom: 0.5rem;
  color: #212529;
  font-size: 1rem;
  font-weight: 400;
  width: 100%;
  line-height: 1.5;
}

.adl__filters-panel :deep(.vs__selected),
.adl__filters-panel :deep(.vs__dropdown-option) {
  color: #212529;
  font-size: 1rem;
  font-weight: 400;
}

.adl__filters-panel-actions {
  display: flex;
  gap: 0.5rem;
}

/* Botón refresh */
.adl__refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--bs-primary, #0d6efd);
  border-radius: var(--border-radius-1, 0.375rem);
  background: transparent;
  color: var(--bs-primary, #0d6efd);
  cursor: pointer;
  transition: opacity 0.15s;
}

.adl__refresh-btn:hover {
  opacity: 0.75;
}

/* ── Tabla ────────────────────────────────────────────── */
.adl__table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
}

.adl__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-2, 0.875rem);
  background-color: var(--color-light, #fff);
}

/* Cabecera */
.adl__thead {
  background-color: var(--bs-gray-100, #f8f9fa);
}

.adl__th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--bs-gray-700, #495057);
  border-bottom: 2px solid var(--bs-gray-200, #e9ecef);
  white-space: nowrap;
  user-select: none;
}

.adl__th--right {
  text-align: right;
}
.adl__th--center {
  text-align: center;
}

.adl__th--sortable {
  cursor: pointer;
}

.adl__th--sortable:hover {
  background-color: var(--bs-gray-200, #e9ecef);
}

.adl__th--sorted {
  border-bottom: 2px solid var(--bs-gray-600, #6c757d);
  color: var(--bs-gray-900, #212529);
}

.adl__th--sticky {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: var(--bs-gray-100, #f8f9fa);
}

.adl__th-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

/* Icono de ordenamiento */
.adl__sort-icon {
  display: inline-flex;
  align-items: center;
  opacity: 0.35;
  transition: opacity 0.15s, transform 0.2s;
  font-size: 0.7rem;
}

.adl__sort-icon--active {
  opacity: 1;
}

.adl__sort-icon--desc {
  transform: rotate(180deg);
}

/* Cuerpo */
.adl__row {
  border-bottom: 1px solid var(--bs-gray-200, #e9ecef);
  transition: background-color 0.1s;
}

.adl__row:nth-child(even) {
  background-color: rgba(var(--bs-light-rgb, 248, 249, 250), 0.5);
}

.adl__row:hover {
  background-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.04);
}

.adl__row--clickable {
  cursor: pointer;
}

.adl__td {
  padding: 0.75rem 1rem;
  color: var(--bs-gray-800, #343a40);
  vertical-align: middle;
}

.adl__td--right {
  text-align: right;
}
.adl__td--center {
  text-align: center;
}

.adl__td--sticky {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: inherit;
}

/* Estado vacío */
.adl__empty-cell {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--bs-gray-500, #adb5bd);
  font-size: 0.875rem;
}

/* ── Paginación ───────────────────────────────────────── */
.adl__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.adl__per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
}

.adl__per-page-label {
  font-size: var(--font-size-2, 0.875rem);
  white-space: nowrap;
}

.adl__record-info {
  font-size: var(--font-size-2, 0.875rem);
  color: var(--bs-gray-600, #6c757d);
  white-space: nowrap;
}

.adl__pagination-controls {
  display: flex;
  justify-content: flex-end;
  flex: 1 1 auto;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 768px) {
  .adl__topbar {
    padding: 0.5rem 0;
  }

  .adl__filters-panel {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    min-width: unset;
    border-radius: 0.75rem 0.75rem 0 0;
  }
}

@media (max-width: 575px) {
  .adl__title {
    font-size: 1.25rem;
  }

  .adl__titlebar {
    align-items: stretch;
    flex-direction: column;
  }

  .adl__topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .adl__topbar-left,
  .adl__topbar-right {
    width: 100%;
    justify-content: flex-end;
  }

  .adl__search-input {
    max-width: 100%;
  }

  .adl__pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .adl__per-page {
    justify-content: center;
  }
  .adl__pagination-controls {
    justify-content: center;
  }
}
</style>
