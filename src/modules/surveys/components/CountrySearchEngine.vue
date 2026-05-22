<template>
  <div v-if="loading"></div>

  <AppFormField v-else :form-control="v$.form.country" :label="defaultLabelCountry">
    <AppAutocomplete :disabled="approvedStep" v-model="v$.form.country.$model" :options="countries.value" @search="searchCountry"></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';

const findAllCountriesForSelectService = new FindAllCountriesForSelectService();

export default defineComponent({
  name: 'CountrySearchEngine',

  components: { AppFormField, AppAutocomplete },

  emits: ['selectedCountry'],
  props: {
    defaultLabelCountry: {
      type: String,
      required: true,
    },
    fieldKey: {
      type: String,
      required: true,
    },
    countryId: {
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

    const loading = ref(true);

    const form: any = reactive({
      country: null,
    });
    const v$: any = useVuelidate(
      {
        form: {
          country: props.isRequired,
        },
      },
      { form }
    );

    onMounted(async () => {
      loading.value = true;

      try {
        if (props.countryId) {
          const country = await findAllCountriesForSelectService.run({
            countryId: props.countryId,
          });

          countries.value.push(country.data[0]);

          form.country = country.data[0].id;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.country,
      async (value) => {
        let selectedOption: any = { key: props.fieldKey, value: value ?? null };

        emit('selectedCountry', selectedOption);
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

          response.data.forEach((country: any) => countries.value.push(country));
        } else {
          countries.value = [];
        }

        loading(false);
      }
    }, 800);

    return {
      v$,

      countries,
      loading,

      searchCountry,
    };
  },
});
</script>
