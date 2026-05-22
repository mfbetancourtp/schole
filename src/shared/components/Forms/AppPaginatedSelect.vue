<template>
  <v-select
    v-model="selectedOptions"
    :options="options.value"
    :filterable="false"
    :label="label"
    @search="search"
    multiple
    :selectable="(option: any) => !selectedOptions.includes(option)"
    @click="getData"
    class="custom"
    :disabled="disabled"
  >
    <template #list-footer>
      <li class="pagination" v-if="options.value.length == 10 || currentPage != 1">
        <button :disabled="currentPage === 1" @click.stop="prevPage">Anterior</button>
        <button :disabled="!hasNextPage" @click.stop="nextPage">Siguiente</button>
      </li>
    </template>
  </v-select>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, reactive, watchEffect } from 'vue';
import { debounce } from 'ts-debounce';

export default defineComponent({
  name: 'AppPaginatedSelect',
  props: ['modelValue', 'service', 'paramsService', 'label', 'disabled'],
  emits: ['update:modelValue', 'search', 'item-added', 'item-removed'],

  setup(props, { emit }) {
    const loading = ref(false);
    const selectedOptions = ref(props.modelValue ?? []);
    const currentPage = ref(1);
    const options: { value: any[] } = reactive({
      value: [],
    });
    const params = ref();

    const getData = debounce(async () => {
      loading.value = true;
      options.value = [];
      const response = await props.service.run({
        page: currentPage.value,
        perPage: 10,
        ...params.value,
      });
      options.value = response.data.filter((option: any) => !selectedOptions.value.some((o: any) => option.id == o.id));
      loading.value = false;
    });

    const search = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);
        const response = await props.service.run({
          search,
          page: 1,
          perPage: 25,
          ...params.value,
        });
        options.value = response.data;
        loading(false);
      }
      emit('search', search);
    }, 800);

    watchEffect(() => {
      if (JSON.stringify(params.value) !== JSON.stringify(props.paramsService)) {
        params.value = props.paramsService;
      }
    });
    watch(params, async (newParams, oldParams) => {
      if (newParams !== oldParams) {
        currentPage.value = 1;
        await getData();
      }
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        selectedOptions.value = newValue;
      }
    );

    onMounted(async () => {
      await getData();
    });

    watch(selectedOptions, (newValue, oldValue) => {
      const addedItems = newValue.filter((item: any) => !oldValue.includes(item));
      const removedItems = oldValue.filter((item: any) => !newValue.includes(item));

      if (addedItems.length > 0) {
        emit('item-added', addedItems[0]);
      } else if (removedItems.length > 0) {
        emit('item-removed', removedItems[0]);
      }

      emit('update:modelValue', newValue);
    });

    const hasNextPage = computed(() => {
      return options.value.length === 10;
    });

    const hasPrevPage = computed(() => currentPage.value > 1);

    const prevPage = async () => {
      if (hasPrevPage.value) {
        currentPage.value--;
        await getData();
      }
    };

    const nextPage = async () => {
      if (hasNextPage.value) {
        currentPage.value++;
        await getData();
      }
    };

    return {
      loading,
      options,
      search,
      hasNextPage,
      hasPrevPage,
      prevPage,
      nextPage,
      selectedOptions,
      currentPage,
      getData,
    };
  },
});
</script>

<style scoped>
.pagination {
  display: flex;
  margin: 0.4rem 0.25rem 0;
  gap: 10px;
}

.custom ul {
  background-color: blueviolet;
  z-index: 1000;
}

.pagination button {
  flex-grow: 1;
  border: solid 1px var(--color-primary);
  color: var(--color-primary);
  border-radius: var(--border-radius-1);
}

.pagination button:disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.7;
}

.pagination button:hover {
  cursor: pointer;
  color: var(--color-light);
  border: solid 1px var(--color-secondary);
  background-color: var(--color-secondary);
}
/* .vs__dropdown-menu {    
    z-index:10030 !important;
} */
</style>
