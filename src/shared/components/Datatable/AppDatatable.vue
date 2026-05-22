<template>
  <AppCard>
    <template #title v-if="tableTitle">
      <h5 class="title">{{ tableTitle }}</h5>
    </template>

    <template #body>
      <slot name="additionalContent"></slot>

      <AppFilter
        v-if="enableSearchFilter || showButtonFilter || refreshBtn"
        v-model="search"
        :filter-name="`${name}.search`"
        class="d-flex flex-md-row align-items-center gap-2 pt-table px-table"
        v-bind:class="{ 'justify-content-end': !enableSearchFilter }"
      >
        <input v-if="enableSearchFilter" id="search" type="text" class="o-form-control" placeholder="Buscar..." v-model="search" @input="(e: any) => searchData()" />

        <AppDatatableFilters v-show="showButtonFilter" @filter="filterData" @cancel="cancelFilterData" @open="openFilterData" @close="closeFilterData">
          <div ref="filtersRef">
            <slot name="filters"></slot>
          </div>
        </AppDatatableFilters>

        <AppButton v-if="refreshBtn" outlined icon="sync" @click="refreshData" v-tooltip="'Refrescar tabla'"></AppButton>
      </AppFilter>

      <AppProgressBar v-if="loading"></AppProgressBar>
      <div>
        <o-table
          :data="paginatedData"
          v-bind="propsOTable"
          :per-page="perPage"
          @sort="sortData"
          sort-icon="caret-up"
          mobile-sort-class="sort-mobile"
          :default-sort="defaultSort"
          :default-sort-direction="defaultSortDirection"
          :searchable="isLocalData"
          :debounce-search="isLocalData ? 300 : 0"
        >
          <slot></slot>

          <template #detail="props" v-if="$slots.detail">
            <slot name="detail" :row="props.row" :index="props.index"></slot>
          </template>

          <template #empty> No se encontraron registros </template>

          <template #pagination>
            <div class="pagination-container">
              <!-- filtro de perPage -->
              <div class="per-page-filter d-flex align-items-center gap-2">
                <AppFilter v-if="showFilterSteps" v-model="perPage" :filter-name="`${name}.perPage`" class="d-flex align-items-center gap-1" style="margin-bottom: 0 !important">
                  <span>Mostrar</span>
                  <AppSelect v-model="perPage">
                    <option v-for="perPageOption in perPageOptions" :key="perPageOption">
                      {{ perPageOption }}
                    </option>
                  </AppSelect>
                </AppFilter>

                <span class="record-info ms-1">
                  {{ (currentPage - 1) * perPage + 1 }} -
                  {{ perPage * currentPage < total ? perPage * currentPage : total }}
                  de {{ total }} registros
                </span>
              </div>

              <!-- paginación -->
              <div class="pagination-controls">
                <AppPagination @update:current="currentPage = $event" :loading="loading" class="border-0" :total="total" :current="currentPage" :per-page="perPage" />
              </div>
            </div>
          </template>
        </o-table>
      </div>
    </template>
  </AppCard>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getValueByPath } from '@oruga-ui/oruga-next/src/utils/helpers';
import { getOptions } from '@oruga-ui/oruga-next/src/utils/config';
import { debounce } from 'ts-debounce';

import AppPagination from '../AppPagination.vue';
import AppProgressBar from '../AppProgressBar.vue';
// import AppEmptyResponse from '../AppEmptyResponse.vue';
// import AppFormField from '../Forms/AppFormField.vue';
import AppSelect from '../Forms/AppSelect.vue';
import AppFilter from '../AppFilter.vue';
import AppButton from '../Buttons/AppButton.vue';
import AppDatatableFilters from './AppDatatableFilters.vue';
import AppCard from '../Card/AppCard.vue';

import { ParamsPaginationDto } from '../../dto/paramsPagination.dto';
import { useCheckDataTableStore } from '../../../stores/checkDataTable.store';

export default defineComponent({
  name: 'AppDatatable',
  emits: ['filter', 'filter-cancel', 'filter-open'],
  components: {
    AppDatatableFilters,
    AppButton,
    AppFilter,
    AppSelect,
    // AppFormField,
    // AppEmptyResponse,
    AppProgressBar,
    AppPagination,
    AppCard,
  },
  props: {
    /** Table columns */
    columns: {
      type: Array,
      default: () => [],
    },
    /* Custom Props */
    service: {
      type: Object,
      default: null,
    },
    serviceMethod: {
      type: String,
      default: 'run',
    },
    params: {
      type: Object,
      default() {
        return {};
      },
    },
    showSubtitleNotFound: {
      type: Boolean,
      default: undefined,
    },
    defaultPerPage: {
      type: Number,
      default: 10,
    },
    name: {
      type: String,
      default: null,
      required: true,
    },
    refreshBtn: {
      type: Boolean,
      default: false,
    },
    enableSearchFilter: {
      type: Boolean,
      default: true,
    },
    /** Table data */
    data: {
      type: Array,
      default: () => [],
    },

    /** Sets the default sort column and order — e.g. ['first_name', 'desc']   */
    defaultSort: [String, Array],
    /**
     * Sets the default sort column direction on the first click
     * @values asc, desc
     */
    defaultSortDirection: {
      type: String,
      default: 'asc',
    },
    /** Sets the header sorting icon */
    sortIcon: {
      type: String,
      default: () => {
        return (getValueByPath as any)(getOptions(), 'table.sortIcon', 'arrow-up');
      },
    },
    /**
     * Sets the size of the sorting icon
     * @values small, medium, large
     */
    sortIconSize: {
      type: String,
      default: () => {
        return (getValueByPath as any)(getOptions(), 'table.sortIconSize', 'small');
      },
    },
    /** Adds pagination to the table */
    paginated: Boolean,

    /* Transition name to use when toggling row details. */
    detailTransition: {
      type: String,
      default: '',
    },
    showFilterSteps: {
      type: Boolean,
      default: true,
    },
    /** Table fixed height */
    height: [Number, String],
    /**
     * Key for search local
     */
    filterKeyLocal: {
      type: String,
      default: null,
      required: false,
    },
    tableTitle: {
      type: String,
      default: '',
    },
    forceShowFilter: {
      type: Boolean,
      default: false,
    },
    detailed: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const data2 = ref(props.data);
    const checkStore = useCheckDataTableStore();

    const paginated = ref(props.paginated);
    let backendPagination = false;
    let backendSorting = false;
    const perPage = ref(props.defaultPerPage);
    const total = ref(0);
    const currentPage = ref(1);
    const perPageOptions = ref([10, 20, 30]);
    const search = ref('');
    const showButtonFilter = ref(false);
    const filtersRef = ref<Element>();
    const showSectionFilter = ref(false);
    const defaultSortField = Array.isArray(props.defaultSort) ? props.defaultSort[0] ?? '' : (props.defaultSort as string) ?? '';
    const defaultSortOrder = Array.isArray(props.defaultSort) ? props.defaultSort[1] ?? props.defaultSortDirection ?? '' : props.defaultSortDirection ?? '';
    const sort = ref<string>(defaultSortField);
    const order = ref<string>(defaultSortOrder);

    if (props.service) {
      paginated.value = true;
      backendPagination = true;
      backendSorting = true;
    }

    const propsOTable = computed(() => ({
      hoverable: true,
      mobileCards: true,
      paginated: paginated.value,
      backendPagination,
      backendSorting,
      detailed: props.detailed,
    }));

    const loading = ref(true);
    const notFound = ref(false);

    const route = useRoute();
    const router = useRouter();

    const setParamsOnRoutes = (paramsDatatable: any) => {
      setTimeout(() => {
        if (!paramsDatatable) return;

        const query: any = {
          ...route.query,
          page: paramsDatatable.page,
        };

        router.push({
          query,
        });
      }, 500);
    };

    const params: any = computed(() => {
      let params: ParamsPaginationDto = {
        perPage: perPage.value,
        page: currentPage.value,
      };

      if (search.value) {
        params.search = search.value;
      }

      if (sort.value) {
        params.sort = sort.value;
      }

      if (order.value) {
        params.order = order.value ?? 'asc';
      }

      if (props.params) {
        params = {
          ...params,
          ...props.params,
        };
      }

      setParamsOnRoutes(params);

      return params;
    });

    const getData = debounce(async () => {
      if (!props.service) return;

      loading.value = true;
      try {
        const methodName = props.serviceMethod || 'run';

        if (!(methodName in props.service) || typeof props.service[methodName] !== 'function') {
          throw new Error(`Method '${methodName}' does not exist on service`);
        }

        const response = await props.service[methodName](params.value);
        console.log('response', response);

        data2.value = response.data;
        total.value = response?.total ?? response?.pagination?.total;
        currentPage.value = response?.page ?? response?.pagination?.page;

        checkStore.isCheckData.dataTable = response;

        notFound.value = !data2.value.length;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    }, 400);

    if (props.service) {
      watch(currentPage, async () => {
        await getData();
      });

      watch(perPage, async () => {
        currentPage.value = 1;
        await getData();
      });

      watch(
        () => props.params,
        async () => {
          currentPage.value = 1;
          await getData();
        },
        { deep: true }
      );
    }

    const refreshData = async () => {
      await getData();
    };
    onMounted(async () => {
      await getData();
      document.removeEventListener('updateDatatable', refreshData, true);
      document.addEventListener('updateDatatable', refreshData, true);

      if (filtersRef.value) {
        showButtonFilter.value = props.forceShowFilter || !!filtersRef.value.children.length;
      }
    });

    onUnmounted(() => {
      document.removeEventListener('updateDatatable', refreshData, true);
    });

    const searchData = debounce(async () => {
      await getData();
    }, 400).bind(this);

    const filterData = async () => {
      emit('filter');
      await getData();
    };

    const openFilterData = () => {
      emit('filter-open');
    };

    const cancelFilterData = () => {
      emit('filter-cancel');
    };

    const closeFilterData = () => {
      emit('filter-cancel');
    };

    const sortData = async (field: string, orderSort: string) => {
      sort.value = field;
      order.value = orderSort;

      await getData();
    };

    /**
     * Datatable with data local for data smaller or temporary
     *
     */
    const isLocalData = computed(() => !props.service);
    watch(
      () => props.data,
      (newData) => {
        if (isLocalData.value) {
          loading.value = true;
          data2.value = newData;
          total.value = newData.length;
          currentPage.value = 1; // Reinicia la paginación local al recibir nueva data
          loading.value = false;
        }
      },
      { immediate: true }
    );
    /**
     * Local paging and filters
     */
    const paginatedData = computed(() => {
      if (!isLocalData.value) return data2.value;
      return filteredData.value.slice((currentPage.value - 1) * perPage.value, currentPage.value * perPage.value);
    });

    const filteredData = computed(() => {
      if (!isLocalData.value) return data2.value;

      const dataFilter = data2.value.filter((item: any) => {
        if (typeof item === 'object' && props.filterKeyLocal) {
          // Si es un objeto y hay una clave específica, filtra solo en esa clave
          return String(item[props.filterKeyLocal] || '')
            .toLowerCase()
            .includes(search.value.toLowerCase());
        }

        // Si no hay clave específica, busca en todas las propiedades
        return Object.values(item).some((value) => String(value).toLowerCase().includes(search.value.toLowerCase()));
      });
      return dataFilter;
    });

    watch(
      filteredData,
      (newFilteredData) => {
        if (isLocalData.value) {
          total.value = newFilteredData.length;
          currentPage.value = 1;
        }
      },
      { immediate: true }
    );

    return {
      currentPage,
      total,
      data2,
      perPage,
      loading,
      notFound,
      perPageOptions,
      search,
      showButtonFilter,
      filtersRef,
      propsOTable,
      showSectionFilter,
      getData,
      searchData,
      filterData,
      openFilterData,
      cancelFilterData,
      closeFilterData,
      sortData,
      refreshData,
      paginatedData,
      isLocalData,
    };
  },
});
</script>

<style scoped>
:deep(.pagination) {
  border: 0;
}

:deep(.o-table__th-current-sort) {
  border-bottom: 2px solid var(--bs-gray-600);
}
.pt-table {
  padding-top: var(--padding-table-filter);
}
.px-table {
  padding-left: var(--padding-table-filter);
  padding-right: var(--padding-table-filter);
}
.o-form-control {
  display: block;
  width: 100%;
  padding: var(--padding-1);
  border-radius: var(--border-radius-1);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-3);
  color: rgba(var(--color-gray-900-rgb), var(--opacity-color-80));
  background-color: var(--color-light);
  border-color: rgba(var(--color-gray-600-rgb), var(--opacity-color-60));
  border-width: var(--border-1);
}
.o-form-control:focus {
  border-color: rgba(var(--color-gray-600-rgb), var(--opacity-color-100));
  outline: 0;
}
.ms-1 {
  border-bottom: none;
}
option {
  border-radius: 0.75rem;
}
.o-table__wrapper--mobile {
  overflow: unset !important;
}

:deep(.o-table__wrapper) {
  overflow-x: auto;
  overflow-y: visible; /* Permitir scroll vertical de la página */
  width: 100%;
}

.o-table {
  min-width: 1000px; /* Ajusta el ancho mínimo según sea necesario */
}
.o-table {
  min-width: 1000px; /* Ajusta el ancho mínimo según sea necesario */
}
/* Anular en modo celular */
@media (max-width: 768px) {
  .pt-table {
    padding-top: 0;
  }

  .px-table {
    padding-left: 0;
    padding-right: 0;
  }
}
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

/* Cada parte ocupa su espacio en móviles */
.per-page-filter,
.pagination-controls {
  flex: 1 1 auto;
}
.title {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-start;
  font-size: 1.75rem;
  font-weight: 800;
  color: black;
}
/* Alineación en desktop: filtro a la izquierda, controles a la derecha */
@media (min-width: 576px) {
  .per-page-filter {
    justify-content: flex-start;
  }
  .pagination-controls {
    display: flex;
    justify-content: flex-end;
  }
}

/* En pantallas muy pequeñas, apilar verticalmente */
@media (max-width: 575px) {
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }
  .per-page-filter,
  .pagination-controls {
    width: 100%;
  }
  .per-page-filter {
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  .title {
    font-size: 1.25rem;
  }
}
</style>
