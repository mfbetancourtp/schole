<template>
  <v-select class="min-width-select" v-model="value" :filterable="false" @search="search" :options="options.value" :label="label" :reduce="reduce" @option:selected="optionSelected"> </v-select>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { debounce } from 'ts-debounce';

export default defineComponent({
  name: 'AppAutocompleteRemote',
  props: ['modelValue', 'service', 'label', 'reduce', 'init', 'paramsService', 'selectFirst', 'filterFunction'],
  emits: ['update:modelValue', 'search', 'option:selected', 'loading-finished'],
  setup(props, { emit }) {
    const isObjectValue = (option: any) => option !== null && typeof option === 'object' && !Array.isArray(option);
    const getComparableValue = (option: any) => {
      if (!isObjectValue(option)) return option;
      return typeof props.reduce === 'function' ? props.reduce(option) : option.id ?? option;
    };
    const getSelectValue = (option: any) => {
      if (!isObjectValue(option)) return option;
      return typeof props.reduce === 'function' ? props.reduce(option) : option;
    };
    const getInitialValue = () => {
      if (props.init) return getSelectValue(props.init);
      return props.modelValue ? props.modelValue : '';
    };

    const value = ref(getInitialValue());
    const options: { value: any[] } = reactive({
      value: [],
    });
    const params = ref();
    const loading = ref(true);
    watchEffect(() => {
      if (JSON.stringify(params.value) !== JSON.stringify(props.paramsService)) {
        params.value = props.paramsService;
      }
    });
    onMounted(async () => {
      await getData();
      // document.removeEventListener('updateAutocompleteRemote', refreshData, true);
      // document.addEventListener('updateAutocompleteRemote', refreshData, true);
    });
    const getData = debounce(async () => {
      loading.value = true;
      const response = await props.service.run({
        page: 1,
        perPage: 10,
        ...params.value,
      });
      const responseOptions = Array.isArray(response.data) ? response.data : [];
      const initValue = getComparableValue(props.init);
      options.value = props.init && isObjectValue(props.init) && !responseOptions.some((item: any) => getComparableValue(item) === initValue) ? [props.init, ...responseOptions] : responseOptions;

      if (props.selectFirst) {
        value.value = options.value[0] ? getSelectValue(options.value[0]) : '';
      } else if (props.init) {
        const selectedOption = options.value.find((item: any) => getComparableValue(item) === initValue);
        value.value = selectedOption ? getSelectValue(selectedOption) : initValue;
      } else {
        value.value = props.modelValue ? props.modelValue : '';
      }

      if (props.label) {
        options.value = options.value.reduce((acc, option) => {
          if (option[props.label] !== null) {
            acc.push(option);
          }
          return acc;
        }, []);
      }

      if (props.filterFunction) {
        options.value = props.filterFunction(options.value);
      }

      loading.value = false;
    }, 400);
    const refreshData = async () => {
      await getData();
    };
    watch(params, async (newParams, oldParams) => {
      if (newParams !== oldParams) {
        // Ajusta esta comparación según sea necesario
        // const response = await props.service.run({
        //   page: 1,
        //   perPage: 10,
        //   ...params.value,
        // });
        // options.value = response.data;
        await getData();
      }
    });
    watch(loading, (newVal) => {
      if (!newVal) {
        emit('loading-finished');
      }
    });
    watch(
      () => props.modelValue,
      (modelValue) => {
        value.value = modelValue || '';
      }
    );
    const search = debounce(async (search: string, loading: Function) => {
      if (search || search == '') {
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

    watch(value, (newValue) => {
      emit('update:modelValue', newValue);
    });

    const optionSelected = (value: any) => {
      // console.log('value', value);
      emit('option:selected', value);
      // document.dispatchEvent(new CustomEvent('updateAutocompleteRemote', { detail: value }));
    };
    onUnmounted(() => {
      document.removeEventListener('updateAutocompleteRemote', refreshData, true);
    });
    return {
      value,
      options,
      search,
      optionSelected,
    };
  },
});
</script>

<style scoped>
.min-width-select {
  min-width: 260px;
}
</style>
