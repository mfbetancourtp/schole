<template>
    <AppLoading v-if="loading"></AppLoading>
  
    <form v-else @submit.prevent="save">
       <AppFormModal :title="title" @closed="emit('close')">
        <template v-slot:content>
          <div v-if="data.description">
            <h6 class="m-0">Descripción</h6>
            <p>{{ data.description }}</p>
          </div>

          <AppFormField :form-control="v$.form.peoplesSigner" :label="'Quien firma?'">
          <AppAutocomplete :options="peoplesSigners" :reduce="(d) => d" :label="'label'" v-model="v$.form.peoplesSigner.$model"></AppAutocomplete>
        </AppFormField>

        <hr />

        <template v-for="(field, index) in additionalFields" :key="index">
          <AppFormField :form-control="v$.form[field]" :label="`reports.filters.${field}`">
            <AppAutocomplete v-if="field == 'country'" v-model="v$.form[field].$model" :reduce="(d: any) => d.name" :options="countries.value" @search="searchCountry"></AppAutocomplete>

            <input
              v-else
              v-model="v$.form[field].$model"
              class="form-control"
              type="text"
              pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
              title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
            />
          </AppFormField>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { debounce } from 'ts-debounce';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { AddSignerService } from '../services/addSigner.service';
import { RelatedDataSpecifySignaturesService } from '../services/relatedDtaSpecifySignatures.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';

const relatedDataSpecifySignaturesService = new RelatedDataSpecifySignaturesService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();
const addSignerService = new AddSignerService();

export default defineComponent({
  name: 'SignDocument',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppLoading,
  },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = `Especificar "${props.data.code}"`;

    const additionalFields: Ref<any[]> = ref([]);
    const peoplesSigners: Ref<any[]> = ref([]);
    const peoplesSigner: Ref<any> = ref();
    const loading = ref(true);

    const countries: { value: any[] } = reactive({
      value: [],
    });

    const form: any = reactive({
      peoplesSigner: null,
      ...props.data.dataForm,
    });
    const v$: any = useVuelidate(
      {
        form: {
          peoplesSigner: { required },
          ...props.data.dataV$,
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        let params = {
          documentSignerId: props.data.id,
          convocationEnrolId: props.data.convocationEnrolId,
          documentSignatureId: props.data.documentSignatureId,
        };

        let res: any = await relatedDataSpecifySignaturesService.run(params);

        res.peoplesSigners.forEach((people: any) => {
          if (!people.fullname) {
            people['fullname'] = `${people.names} ${people.lastnames}`;
          }

          peoplesSigners.value.push({
            ...people,
            label: `${people.typeSigner}: ${people.names} ${people.lastnames}`,
          });
        });

        peoplesSigners.value.push({ id: null, label: 'Otro' });
        additionalFields.value = props.data.additionalFields.split(',');

        // if (!additionalFields.value.includes('indicative')) {
        //   additionalFields.value.push('indicative');
        // }

        // if (!additionalFields.value.includes('country')) {
        //   additionalFields.value.push('country');
        // }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.peoplesSigner,
      (value) => {
        if (value) {
          additionalFields.value.forEach((field: any) => {
            form[field] = value[field];
          });
        }
      }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const peopleId = form.peoplesSigner ? form.peoplesSigner.id : null;
      delete form.peoplesSigner;

      const dataSend = {
        convocationEnrolId: props.data.convocationEnrolId,
        convocationStepId: props.data.convocationStepId,
        documentId: props.data.documentId,
        documentSignature: {
          id: props.data.documentSignatureId,
          documentSignerId: props.data.id,
          peopleId: peopleId,
          convocationEnrolDocumentId: props.data.convocationEnrolDocumentId,
          jsonData: form,
        },
      };

      try {
        await addSignerService.run(dataSend);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

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

    return {
      loading,
      title,
      v$,
      emit,

      additionalFields,
      peoplesSigners,
      peoplesSigner,
      searchCountry,
      countries,

      save,
    };
  },
});
</script>

<style scoped></style>
