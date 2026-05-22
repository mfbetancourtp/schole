<template>
  <AppCard>
    <!-- Título opcional -->
    <template v-if="title || $slots.title" #title>
      <slot name="title">
        <h5 class="apc__title">{{ title }}</h5>
      </slot>
    </template>

    <template #body>
      <!-- Barra superior: búsqueda + acciones -->
      <div v-if="enableSearch || $slots.actions || refreshBtn" class="apc__topbar">
        <div class="apc__topbar-left">
          <input v-if="enableSearch" id="apc-search" v-model="search" type="text" class="apc__search-input" placeholder="Buscar..." aria-label="Buscar" @input="handleSearch" />
        </div>

        <div class="apc__topbar-right">
          <slot name="actions" />
          <button v-if="refreshBtn" type="button" class="apc__refresh-btn" title="Refrescar" @click="refresh">
            <AppIcon icon="sync" />
          </button>
        </div>
      </div>

      <!-- Barra de filtros inline -->
      <div v-if="$slots.filters" class="apc__filtersbar">
        <span class="apc__filtersbar-label">
          <AppIcon icon="filter" class="me-1" />
          Filtros:
        </span>
        <div class="apc__filtersbar-controls">
          <slot name="filters" />
        </div>
      </div>

      <!-- Indicador de carga -->
      <AppProgressBar v-if="loading" />

      <!-- Contenido principal (tabla, cards, árbol, etc.) -->
      <div class="apc__content">
        <slot />
      </div>

      <!-- Paginación inferior -->
      <div v-if="total > 0 || loading" class="apc__pagination">
        <!-- Selector de registros por página + info -->
        <div class="apc__per-page" v-if="showPerPageSelector">
          <span class="apc__per-page-label">Mostrar</span>
          <AppSelect v-model="perPage" style="width: auto">
            <option v-for="opt in PER_PAGE_OPTIONS" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </AppSelect>
          <span class="apc__record-info"> {{ total === 0 ? '0' : `${recordStart}–${recordEnd}` }} de {{ total }} registros </span>
        </div>

        <!-- Controles de página -->
        <div class="apc__pagination-controls">
          <AppPagination :total="total" :current="currentPage" :per-page="perPage" :loading="loading" class="border-0" @update:current="onPageChange" />
        </div>
      </div>
    </template>
  </AppCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { debounce } from 'ts-debounce';

import AppCard from '../Card/AppCard.vue';
import AppPagination from '../AppPagination.vue';
import AppProgressBar from '../AppProgressBar.vue';
import AppSelect from '../Forms/AppSelect.vue';
import AppIcon from '../AppIcon.vue';

// ─── Constantes ──────────────────────────────────────────────────────────────

const PER_PAGE_OPTIONS = [10, 20, 30, 50] as const;

// ─── Tipos públicos ───────────────────────────────────────────────────────────

/** Parámetros emitidos en cada cambio de paginación / búsqueda */
export interface FetchParams {
  page: number;
  perPage: number;
  search: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /**
   * Identificador único del componente.
   * Se usa para distinguir instancias en la misma página.
   */
  name: string;
  /** Total de registros devueltos por el servidor */
  total?: number;
  /** Cantidad de items por página al montar el componente */
  defaultPerPage?: number;
  /** Muestra el input de búsqueda */
  enableSearch?: boolean;
  /** Muestra el selector "Mostrar X por página" y el contador de registros */
  showPerPageSelector?: boolean;
  /** Estado de carga externo */
  loading?: boolean;
  /** Título de la tarjeta (también disponible como slot #title) */
  title?: string;
  /** Muestra el botón de refrescar */
  refreshBtn?: boolean;
  /**
   * Cuando es true el evento `fetch` NO se emite al montar.
   * Útil si el padre quiere controlar cuándo se hace la primera carga.
   */
  skipInitialFetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  defaultPerPage: 10,
  enableSearch: true,
  showPerPageSelector: true,
  loading: false,
  title: '',
  refreshBtn: false,
  skipInitialFetch: false,
});

// ─── Emits ────────────────────────────────────────────────────────────────────

interface Emits {
  /**
   * Se emite cuando cambia la página, perPage o el término de búsqueda.
   * El padre usa estos parámetros para llamar al servicio y actualizar `total`.
   */
  fetch: [params: FetchParams];
}

const emit = defineEmits<Emits>();

// ─── Estado interno ───────────────────────────────────────────────────────────

const currentPage = ref(1);
const perPage = ref(props.defaultPerPage);
const search = ref('');

// ─── Computed ─────────────────────────────────────────────────────────────────

const recordStart = computed(() => (props.total === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1));

const recordEnd = computed(() => Math.min(perPage.value * currentPage.value, props.total));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildParams(): FetchParams {
  return {
    page: currentPage.value,
    perPage: perPage.value,
    search: search.value,
  };
}

function emitFetch(): void {
  emit('fetch', buildParams());
}

// ─── Búsqueda con debounce ────────────────────────────────────────────────────

const debouncedSearchEmit = debounce(() => {
  currentPage.value = 1;
  emitFetch();
}, 400);

function handleSearch(): void {
  debouncedSearchEmit();
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(perPage, () => {
  currentPage.value = 1;
  emitFetch();
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

function onPageChange(page: number): void {
  currentPage.value = page;
  emitFetch();
}

/** Vuelve a emitir fetch con los parámetros actuales */
function refresh(): void {
  emitFetch();
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

const handleExternalRefresh = (): void => refresh();

onMounted(() => {
  if (!props.skipInitialFetch) {
    emitFetch();
  }
  document.addEventListener('updatePaginatedContent', handleExternalRefresh, true);
});

onUnmounted(() => {
  document.removeEventListener('updatePaginatedContent', handleExternalRefresh, true);
});

// ─── Expose (para uso con ref desde el padre) ─────────────────────────────────

defineExpose({
  /** Vuelve a emitir fetch con los parámetros actuales */
  refresh,
  /** Página actual */
  currentPage,
  /** Items por página */
  perPage,
  /** Término de búsqueda actual */
  search,
});
</script>

<style scoped>
/* ── Título ── */
.apc__title {
  font-size: 1.75rem;
  font-weight: 800;
  color: black;
  margin-bottom: 1rem;
}

/* ── Barra superior ── */
.apc__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: var(--padding-table-filter, 0.75rem) var(--padding-table-filter, 0.75rem) 0;
}

.apc__topbar-left {
  display: flex;
  align-items: center;
  flex: 1 1 200px;
}

.apc__topbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.apc__search-input {
  display: block;
  width: 100%;
  max-width: 300px;
  padding: var(--padding-1, 0.375rem 0.75rem);
  border-radius: var(--border-radius-1, 0.375rem);
  font-size: var(--font-size-2, 0.875rem);
  font-weight: var(--font-weight-normal, 400);
  line-height: var(--line-height-3, 1.5);
  color: rgba(var(--color-gray-900-rgb), var(--opacity-color-80, 0.8));
  background-color: var(--color-light, #fff);
  border: var(--border-1, 1px) solid rgba(var(--color-gray-600-rgb), var(--opacity-color-60, 0.6));
}

.apc__search-input:focus {
  border-color: rgba(var(--color-gray-600-rgb), 1);
  outline: 0;
}

.apc__refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: var(--border-radius-1, 0.375rem);
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  color: var(--bs-primary, #0d6efd);
  transition: opacity 0.2s;
}

.apc__refresh-btn:hover {
  opacity: 0.75;
}

/* ── Barra de filtros inline ── */
.apc__filtersbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem var(--padding-table-filter, 0.75rem);
  border-top: 1px solid rgba(var(--color-gray-300-rgb, 200, 200, 200), 0.5);
}

.apc__filtersbar-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: var(--font-size-2, 0.875rem);
  color: var(--bs-gray-700, #495057);
  white-space: nowrap;
}

.apc__filtersbar-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  flex: 1;
}

/* ── Contenido ── */
.apc__content {
  width: 100%;
}

/* ── Paginación ── */
.apc__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.apc__per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
}

.apc__per-page-label {
  font-size: var(--font-size-2, 0.875rem);
  white-space: nowrap;
}

.apc__record-info {
  font-size: var(--font-size-2, 0.875rem);
  color: var(--bs-gray-600, #6c757d);
  white-space: nowrap;
}

.apc__pagination-controls {
  display: flex;
  justify-content: flex-end;
  flex: 1 1 auto;
}

/* ── Responsive ── */
@media (max-width: 575px) {
  .apc__topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .apc__topbar-left,
  .apc__topbar-right {
    width: 100%;
  }

  .apc__search-input {
    max-width: 100%;
  }

  .apc__pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .apc__per-page {
    justify-content: center;
  }

  .apc__pagination-controls {
    justify-content: center;
  }

  .apc__title {
    font-size: 1.25rem;
  }
}
</style>
