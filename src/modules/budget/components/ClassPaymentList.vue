<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <AppLoading v-if="loading" />
      <template v-else>
        <div style="display: flex; justify-content: end">
          <AppButton label="Agregar" @click="openBudgetModal()"></AppButton>
        </div>
        <div class="card-body table-responsive p-2 mt-3">
          <table class="table table-bordered table align-middle">
            <thead>
              <tr class="w-100">
                <th class="text-center">#</th>
                <th class="text-center">Clases de pago</th>
                <th class="text-center">Descripción</th>
                <th class="text-center sticky-column">Opciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="classPayments.length === 0">
                <td colspan="10" class="text-center alert alert-warning" role="alert">
                  <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
                  <strong>No hay clases de pagos asociadas</strong>
                </td>
              </tr>
              <tr v-for="(item, index) in classPayments" :key="index">
                <td class="text-center" scope="col">{{ index + 1 }}</td>

                <td>
                  <div class="text-center input-xl">
                    {{ item.name }}
                  </div>
                </td>
                <td>
                  <div class="text-center input-xl">
                    {{ item.description }}
                  </div>
                </td>
                <td class="sticky-column">
                  <div class="d-flex justify-content-center">
                    <AppButtonEdit @click="openBudgetModal(item)"> </AppButtonEdit>
                    <AppButtonDelete @click="openModalDelete(item)"></AppButtonDelete>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>

    <template v-slot:actions> </template>
  </AppFormModal>
  <AppModal v-model="classPaymentModal">
    <ClassPaymentForm v-if="classPaymentModal" :data="currentClassPayment" :financingSystemId="data.id" @close="closeBudgeModal" />
  </AppModal>
  <AppModal v-model="modalDelete">
    <AppConfirmDeleteModal v-if="modalDelete" entity="clase de pago" @confirmDelete="deleteClass"></AppConfirmDeleteModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';

import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import ClassPaymentForm from './ClassPaymentForm.vue';

import { GetAllClassPaymentService } from '../services/getAllClassPayment.service';
import { DeleteClassPaymentByIdService } from '../services/deleteClassPaymentById.service';

const getAllClassPaymentService = new GetAllClassPaymentService();
const deleteClassPaymentByIdService = new DeleteClassPaymentByIdService();

export default defineComponent({
  name: 'ClassPaymentList',
  components: {
    AppFormModal,
    AppButton,
    AppLoading,
    AppModal,
    AppButtonEdit,
    AppIcon,
    AppConfirmDeleteModal,
    AppButtonDelete,
    ClassPaymentForm,
  },

  props: ['data'],

  //emits: ['close'],

  setup(props) {
    const title = `Asociar clases de pago ${props.data.name}`;
    const { t } = useI18n();

    const classPayments = ref<any>([]);
    const classPaymentModal = ref(false);
    const currentClassPayment: Ref<any | null> = ref(null);
    const modalDelete = ref(false);

    //const dynamicText = ref('');

    const loading = ref(true);

    onMounted(async () => {
      loading.value = true;
      try {
        await getData();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    const getData = async () => {
      loading.value = true;
      try {
        classPayments.value = await getAllClassPaymentService.run(props.data.id);
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    };

    const openBudgetModal = async (data?: any) => {
      currentClassPayment.value = data;
      console.log(currentClassPayment.value);
      classPaymentModal.value = true;
    };
    const closeBudgeModal = async () => {
      await getData();
      classPaymentModal.value = false;
    };

    const openModalDelete = (status: any) => {
      modalDelete.value = true;
      currentClassPayment.value = status;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getData();
    };

    const deleteClass = async () => {
      try {
        await deleteClassPaymentByIdService.run(currentClassPayment.value?.id as number);
        await closeModalDelete();
      } catch (e) {
        console.log('this error', e);
      }
    };
    return {
      loading,
      title,
      t,
      classPayments,
      classPaymentModal,
      openBudgetModal,
      closeBudgeModal,
      currentClassPayment,
      modalDelete,
      openModalDelete,
      deleteClass,
    };
  },
});
</script>

<style scoped></style>
