<template>
  <form @submit.prevent="save">
     <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <div v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.title" :label="'Descripción'">
              <input
                id="title"
                type="text"
                class="form-control"
                v-model="v$.form.title.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>

            <AppFormField :form-control="v$.form.unitValue" :label="'Valor'">
              <input type="number" class="form-control" v-model="v$.form.unitValue.$model" />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.degreeIds" :label="'Aplica para los grados'">
            <AppAutocomplete v-model="v$.form.degreeIds.$model" :options="degrees" :multiple="true"></AppAutocomplete>
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetDegreesForPricesPortfolioService } from '../services/getDegreesForPricesPortfolio.service';
import { CreateOrUpdatePriceToProductPortfolioService } from '../services/createOrUpdatePriceToProductPortfolio.service';

const createOrUpdatePriceToProductPortfolioService = new CreateOrUpdatePriceToProductPortfolioService();
const getDegreesForPricesPortfolioService = new GetDegreesForPricesPortfolioService();

export default defineComponent({
  name: 'PriceForm',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppLoading,
  },

  props: ['data', 'productId'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = !props.data?.id ? 'Agregar precio' : 'Editar precio';

    const loading = ref(true);
    const degrees = ref();

    const form = reactive({
      productId: props.productId,
      title: props.data?.title ?? null,
      unitValue: props.data?.unitValue ?? null,
      degreeIds: [] as any,
    });
    const v$ = useVuelidate(
      {
        form: {
          productId: { required },
          title: { required },
          unitValue: { required },
          degreeIds: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        degrees.value = await getDegreesForPricesPortfolioService.run();

        let ids = props.data?.degreeIds ? props.data?.degreeIds.split(',') : [];

        ids.forEach((id: any) => {
          let ide = parseInt(id);
          form.degreeIds.push(ide);
        });
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          productId: form.productId,
          title: form.title,
          unitValue: form.unitValue,
          degreeIds: form.degreeIds.toString(),
        };

        await createOrUpdatePriceToProductPortfolioService.run(dataSend, props.data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      degrees,
      loading,
      title,
      save,
      emit,
      v$,
    };
  },
});
</script>

<style scoped></style>
