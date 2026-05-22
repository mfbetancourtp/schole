<template>
  <AppAutocomplete v-if="!loading" v-model="dataId" :label="label" :options="data" @search="searchData"></AppAutocomplete>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref, watch } from 'vue';
import { debounce } from 'ts-debounce';

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { FindAllRegionsForSelectService } from '../../services/findAllRegionsForSelect.service';
import { FindAllCountriesForSelectService } from '../../services/findAllCountriesForSelect.service';
import { FindAllMunicipalitiesForSelectService } from '../../services/findAllMunicipalitiesForSelect.service';

export default defineComponent({
  name: 'AppGeographicSearch',
  components: { AppAutocomplete },

  props: {
    id: {
      type: Number as PropType<any>,
    },
    label: {
      type: String,
      default: 'name',
    },
    countryId: {
      type: Number,
    },
    regionId: {
      type: Number,
    },
    searchKey: {
      type: String as PropType<'country' | 'region' | 'city'>,
      required: true,
    },
  },
  emits: ['geographicData'],

  setup(props, { emit }) {
    const loading = ref(true);

    const data: Ref<any[]> = ref([]);

    const dataId = ref();
    const service = ref();
    const currentData = ref();

    onMounted(async () => {
      const params: any = { perPage: 200 };

      if (props.searchKey == 'city') service.value = new FindAllMunicipalitiesForSelectService();
      if (props.searchKey == 'country') service.value = new FindAllCountriesForSelectService();
      if (props.searchKey == 'region') service.value = new FindAllRegionsForSelectService();

      if (props.id) {
        if (props.searchKey == 'country') params.countryId = props.id;
        if (props.searchKey == 'region') params.regionId = props.id;
        if (props.searchKey == 'city') params.municipalityId = props.id;

        const response = await service.value.run(params);
        if (response.data.length) {
          data.value.push(response.data[0]);
          dataId.value = response.data[0].id;
          currentData.value = response.data[0];
        }
      }

      loading.value = false;
    });

    watch(dataId, () => {
      data.value.forEach((item) => {
        if (item.id == dataId.value) {
          emit('geographicData', item);
        }
      });
    });

    const searchData = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          const params: any = { perPage: 200 };
          data.value = [];

          params.search = search;
          if (props.regionId) params.regionId = props.regionId;
          if (props.countryId) params.countryId = props.countryId;

          const response = await service.value.run(params);
          response.data.forEach((dataRes: any) => data.value.push(dataRes));
        } else {
          data.value = [];
        }

        loading(false);
      }
    }, 800);

    return {
      loading,

      dataId,
      data,

      searchData,
    };
  },
});
</script>
