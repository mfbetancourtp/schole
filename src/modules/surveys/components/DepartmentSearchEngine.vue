<template>
  <div v-if="loading"></div>

  <div v-else class="p-1 ps-2 pe-2 mb-2">
    <div class="row">
      <AppFormField :form-control="v$.form.country" :label="'core.geography.country'">
        <AppAutocomplete :disabled="approvedStep" v-model="v$.form.country.$model" :options="countries.value" @search="searchCountry"></AppAutocomplete>
      </AppFormField>

      <AppFormField :form-control="v$.form.region" :label="defaultLabelDepartment">
        <AppAutocomplete :disabled="approvedStep" v-model="v$.form.region.$model" :options="regions.value" @search="searchRegions"></AppAutocomplete>
      </AppFormField>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { FindAllRegionsForSelectService } from '../../../shared/services/findAllRegionsForSelect.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';

const findAllCountriesForSelectService = new FindAllCountriesForSelectService();
const findAllRegionsForSelectService = new FindAllRegionsForSelectService();

export default defineComponent({
  name: 'DepartmentSearchEngine',
  components: { AppFormField, AppAutocomplete },

  emits: ['selectedDepartment'],
  props: {
    defaultLabelDepartment: {
      type: String,
      required: true,
    },
    fieldKey: {
      type: String,
      required: true,
    },
    departmentId: {
      type: Number,
      required: false,
    },
    isRequired: {
      type: Object,
      default: () => {},
    },
    approvedStep: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const countries: { value: any[] } = reactive({
      value: [],
    });
    const regions: { value: any[] } = reactive({
      value: [],
    });

    const loading = ref(true);

    const form: any = reactive({
      country: null,
      region: null,
    });
    const v$: any = useVuelidate(
      {
        form: {
          country: {},
          region: props.isRequired,
        },
      },
      { form }
    );

    onMounted(async () => {
      loading.value = true;

      try {
        if (props.departmentId) {
          const region = await findAllRegionsForSelectService.run({
            regionId: props.departmentId,
          });
          const country = await findAllCountriesForSelectService.run({
            countryId: region.data[0].countryId,
          });

          countries.value.push(country.data[0]);
          regions.value.push(region.data[0]);

          form.country = country.data[0].id;
          form.region = region.data[0].id;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.region,
      async (value) => {
        let selectedOption: any = {
          key: props.fieldKey,
          value: value ?? null,
        };

        emit('selectedDepartment', selectedOption);
      }
    );

    const searchCountry = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          countries.value = [];
          const response = await findAllCountriesForSelectService.run({
            search: search,
          });

          response.data.forEach((country: any) => {
            countries.value.push(country);
          });
        } else {
          countries.value = [];
        }

        loading(false);
      }
    }, 800);

    const searchRegions = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          regions.value = [];
          let params = {
            search: search,
            countryId: form.country,
          };
          const response = await findAllRegionsForSelectService.run(params);

          response.data.forEach((region: any) => {
            regions.value.push(region);
          });
        } else {
          regions.value = [];
        }

        loading(false);
      }
    }, 800);

    return {
      v$,

      countries,
      regions,
      loading,

      searchCountry,
      searchRegions,
    };
  },
});
</script>
