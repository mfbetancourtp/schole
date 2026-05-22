<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" :routes="routes">
      <template #actions>
        <AppButtonBack :to="{ name: 'collections.portfolioConceptsList' }"></AppButtonBack>
        <AppButton style="color: white;"> Guardar </AppButton>
      </template>

      <template #content>
        <AppCard>
          <template #body>
            <div class="form-row">
              <AppFormField :form-control="v$.form.title" :label="'Titulo'">
                <input
                  id="title"
                  type="text"
                  class="form-control"
                  v-model="v$.form.title.$model"
                  pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                  title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.code" :label="'Codigo'">
                <input type="text" class="form-control" v-model="v$.form.code.$model" pattern="^[0-9]+$" title="Digite el valor sin signos, puntos ni espacios." />
              </AppFormField>
            </div>

            <AppFormField :form-control="v$.form.description" :label="'classroom.activitiesTeacher.form.description'">
              <AppVoiceInput id="description" v-model="v$.form.description.$model" textareaClass="form-control"  />
            </AppFormField>

            <div class="form-row">
              <AppFormField :form-control="v$.form.defaultUnitValue" :label="'Valor por defecto'">
                <input type="text" class="form-control" v-model="v$.form.defaultUnitValue.$model" pattern="^[0-9]+$" title="Digite el valor sin signos, puntos ni espacios." />
              </AppFormField>

              <AppFormField :form-control="v$.form.validityPeriod" :label="'Duración vigencia (meses)'">
                <input type="number" class="form-control" v-model="v$.form.validityPeriod.$model" />
              </AppFormField>
            </div>

            <AppLoading v-if="loading"></AppLoading>

            <div v-if="data?.id && !loading">
              <hr />

              <div class="d-flex justify-content-between">
                <h5>Lista de precios</h5>

                <AppButton @click="openPriceForm()" variant="primary" label="Agregar"></AppButton>
              </div>
              <table class="table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th class="col-1">Valor</th>
                    <th>Grados</th>
                    <th class="col-1"></th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="!values.length">
                    <td colspan="4">
                      <AppEmptyResponse></AppEmptyResponse>
                    </td>
                  </tr>

                  <tr v-else v-for="(value, index) in values" :key="index">
                    <td>{{ value.title }}</td>
                    <td>{{ value.unitValue }}</td>
                    <td>{{ value.grades }}</td>
                    <td>
                      <AppButtonGroup size="sm">
                        <AppButtonEdit @click="openPriceForm(value)"></AppButtonEdit>
                        <AppButtonDelete @click="openModalDelete(value)"></AppButtonDelete>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>

        <AppModal v-model="modalForm" size="lg">
          <PriceFormPortfolio v-if="modalForm" :productId="data?.id" :data="currentData" @close="closeModalForm"> </PriceFormPortfolio>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="precio" @confirmDelete="closeModalDelete" @close="modalDelete= false"> </AppConfirmDeleteModal>
        </AppModal>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useMeta } from 'vue-meta';

import { required } from '../../../shared/plugins/vuelidate.plugin';

import PriceFormPortfolio from './PriceFormPortfolio.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { DeletePricePortfolioService } from '../services/deletePricePortfolio.service';
import { GetConceptByIdPortfolioService } from '../services/getConceptByIdPortfolio.service';
import { CreateOrUpdateConceptPortfolioService } from '../services/createOrUpdateConceptPortfolio.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateConceptPortfolioService = new CreateOrUpdateConceptPortfolioService();
const getConceptByIdPortfolioService = new GetConceptByIdPortfolioService();
const deletePricePortfolioService = new DeletePricePortfolioService();

export default defineComponent({
  name: 'ConceptFormPortfolio',
  components: {
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    PriceFormPortfolio,
    AppButton,
    AppModal,
    AppCard,
  },

  props: ['title', 'routes', 'data'],

  setup(props) {
    useMeta({ title: props.title });

    const values: Ref<any[]> = ref(props.data?.values);
    const modalDelete = ref(false);
    const modalForm = ref(false);
    const router = useRouter();
    const loading = ref(false);
    const currentData = ref();

    const form = reactive({
      title: props.data?.title || null,
      description: props.data?.description || '',
      code: props.data?.code || null,
      defaultUnitValue: props.data?.defaultUnitValue || 0,
      validityPeriod: props.data?.validityPeriod || 0,
      productTypeId: 2,
    });
    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          description: {},
          code: { required },
          defaultUnitValue: { required },
          validityPeriod: {},
          productTypeId: 2,
        },
      },
      { form }
    );

    const getData = async () => {
      loading.value = true;

      try {
        let res = await getConceptByIdPortfolioService.run(props.data?.id);

        values.value = res.values;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    };

    const openPriceForm = (value: any = null) => {
      currentData.value = value;
      modalForm.value = true;
    };
    const closeModalForm = async () => {
      modalForm.value = false;
      await getData();
    };

    const openModalDelete = (value: any) => {
      currentData.value = value;
      modalDelete.value = true;
    };
    const closeModalDelete = async () => {
      try {
        await deletePricePortfolioService.run(currentData.value.id);

        modalDelete.value = false;
        await getData();
      } catch (e) {
        console.log(e);
      }
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        let res = await createOrUpdateConceptPortfolioService.run(form, props.data?.id);

        if (props.data?.id) {
          await router.push({
            name: 'collections.portfolioConceptsList',
          });
        } else {
          await router.push({
            name: 'collections.portfolioConceptEdit',
            params: { conceptId: res.data.id },
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      save,
      v$,

      currentData,
      modalDelete,
      modalForm,
      values,

      closeModalDelete,
      openModalDelete,
      closeModalForm,
      openPriceForm,
    };
  },
});
</script>

<style scoped></style>
