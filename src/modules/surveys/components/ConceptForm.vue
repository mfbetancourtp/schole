<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" isCard>
      <template #actions>
        <AppButtonBack :to="{ name: 'surveys.conceptsList' }"></AppButtonBack>
        <AppButton style="color: white"> Guardar </AppButton>
      </template>

      <template #content>
        <div>
          <div class="form-row">
            <AppFormField :form-control="v$.form.title" :label="'Titulo'">
              <input id="title" type="text" class="form-control" v-model="v$.form.title.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.code" :label="'Cuenta'">
              <input type="text" class="form-control" v-model="v$.form.code.$model" />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.slug" :label="'Tipo de concepto'">
            <AppAutocomplete v-model="v$.form.slug.$model" :options="productTypes" label="label" :reduce="(o: any) => o.value" :filterable="true" />
          </AppFormField>

          <AppFormField :form-control="v$.form.description" :label="'classroom.activitiesTeacher.form.description'">
            <AppVoiceInput v-model="v$.form.description.$model" id="description" textareaClass="form-control" />
          </AppFormField>

          <div class="form-row">
            <AppFormField :form-control="v$.form.defaultUnitValue" :label="'Valor por defecto'">
              <input type="number" class="form-control" v-model="v$.form.defaultUnitValue.$model" />
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
        </div>

        <AppModal v-model="modalForm" size="lg">
          <PriceForm v-if="modalForm" :productId="data?.id" :data="currentData" @close="closeModalForm"></PriceForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="precio" @confirmDelete="closeModalDelete"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useMeta } from 'vue-meta';

import { required } from '../../../shared/plugins/vuelidate.plugin';

import PriceForm from './PriceForm.vue';
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
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { DeletePriceService } from '../services/deletePrice.service';
import { GetConceptByIdService } from '../services/getConceptById.service';
import { CreateOrUpdateConceptService } from '../services/createOrUpdateConcept.service';
import { GetRelatedDataProductsAcademicService } from '../services/getRelatedDataProductsAcademic.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateConceptService = new CreateOrUpdateConceptService();
const getConceptByIdService = new GetConceptByIdService();
const deletePriceService = new DeletePriceService();
const getRelatedDataProductsAcademicService = new GetRelatedDataProductsAcademicService();

export default defineComponent({
  name: 'ConceptForm',
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
    PriceForm,
    AppButton,
    AppModal,
    AppVoiceInput,
    AppAutocomplete,
  },

  props: ['title', 'routes', 'data'],

  setup(props) {
    useMeta({ title: props.title });

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Formularios', url: '' };
    headerStorage.moduleItem = { name: 'Conceptos de cobro', url: '' };
    headerStorage.moduleSubItem = { name: props.title, url: '' };

    const values: Ref<any[]> = ref(props.data?.values);
    const modalDelete = ref(false);
    const modalForm = ref(false);
    const router = useRouter();
    const loading = ref(false);
    const currentData = ref();

    const productTypes = ref<{ label: string; value: string }[]>([]);

    const form = reactive({
      productTypeId: 3,
      slug: props.data?.slug || null,

      title: props.data?.title || null,
      code: props.data?.code || null,
      description: props.data?.description || '',
      defaultUnitValue: props.data?.defaultUnitValue || 0,
      validityPeriod: props.data?.validityPeriod || 0,
    });
    const v$ = useVuelidate(
      {
        form: {
          productTypeId: { required },
          slug: { required },

          title: { required },
          code: { required },
          description: {},
          defaultUnitValue: { required },
          validityPeriod: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        productTypes.value = await getRelatedDataProductsAcademicService.run();
      } catch (e) {
        console.log('error cargando tipos de concepto', e);
      }
    });

    const getData = async () => {
      loading.value = true;

      try {
        let res = await getConceptByIdService.run(props.data?.id);

        values.value = res.values;
      } catch (e) {
        console.log('error', e);
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
        await deletePriceService.run(currentData.value.id);

        modalDelete.value = false;
        await getData();
      } catch (e) {
        console.log('error', e);
      }
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        let res = await createOrUpdateConceptService.run(form, props.data?.id);

        if (props.data?.id) {
          await router.push({
            name: 'surveys.conceptsList',
          });
        } else {
          await router.push({
            name: 'surveys.conceptEdit',
            params: { conceptId: res.data.id },
          });
        }
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      loading,
      save,
      v$,

      productTypes,
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
