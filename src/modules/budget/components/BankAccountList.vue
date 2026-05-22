<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <AppLoading v-if="loading" />
      <template v-else>
        <div style="display: flex; justify-content: end">
          <AppButton
            label="Agregar"
            @click="openBudgetPlanningPeriodsModal('')"
          ></AppButton>
        </div>
        <div class="card-body table-responsive p-2 mt-3">
          <table class="table table-bordered table align-middle">
            <thead>
              <tr class="w-100">
                <th class="text-center">#</th>
                <th class="text-center">Banco</th>
                <th class="text-center">N° cuenta</th>
                <th class="text-center sticky-column">Opciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="budgetPlanningPeriods.length === 0">
                <td
                  colspan="10"
                  class="text-center alert alert-warning"
                  role="alert"
                >
                  <AppIcon
                    icon="exclamation-triangle"
                    class="me-1"
                    size="lg"
                  ></AppIcon>
                  <strong>No hay cuentas bancarias asociadas</strong>
                </td>
              </tr>
              <tr v-for="(item, index) in budgetPlanningPeriods" :key="index">
                <td class="text-center" scope="col">{{ index + 1 }}</td>

                <td>
                  <div class="text-center input-xl">
                    {{ item.name }}
                  </div>
                </td>
                <td>
                  <div class="text-center input-xl">
                    {{ item.numberAccount }}
                  </div>
                </td>
                <td class="sticky-column">
                  <div class="d-flex justify-content-center">
                    <AppButtonEdit
                      @click="openBudgetPlanningPeriodsModal(item)"
                    >
                    </AppButtonEdit>
                    <AppButtonDelete
                      @click="openModalDelete(item)"
                    ></AppButtonDelete>
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
  <AppModal v-model="budgetPlanningPeriodsModal">
    <BankAccountForm
      v-if="budgetPlanningPeriodsModal"
      :data="currentBankAccounts"
      :financingSystemId="data.id"
      @close="closeBudgetPlanningPeriodsModal"
    />
  </AppModal>
  <AppModal v-model="modalDelete">
    <AppConfirmDeleteModal
      v-if="modalDelete"
      entity="cuenta"
      @confirmDelete="deleteBankAccount"
    ></AppConfirmDeleteModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';

import BankAccountForm from './BankAccountForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { GetAllBankAccountService } from '../services/getAllBankAccount.service';
import { DeleteBankAccountService } from '../services/deleteBankAccount.service';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';

const getAllBankAccountService = new GetAllBankAccountService();
const deleteBankAccountService = new DeleteBankAccountService();

export default defineComponent({
  name: 'BudgetExecutionForm',
  components: {
    AppFormModal,
    AppButton,
    AppLoading,
    BankAccountForm,
    AppModal,
    AppButtonEdit,
    AppIcon,
    AppConfirmDeleteModal,
    AppButtonDelete,
  },

  props: ['data'],

  emits: ['close'],

  setup(props, { emit }) {
    const title = `Asociar cuentas bancarias ${props.data.name}`;
    const { t } = useI18n();

    const budgetPlanningPeriods = ref<any>([]);
    const budgetPlanningPeriodsModal = ref(false);
    const currentBankAccounts: Ref<any | null> = ref(null);
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
        budgetPlanningPeriods.value = await getAllBankAccountService.run(
          props.data.id
        );
        console.log(
          'budgetPlanningPeriods.length',
          budgetPlanningPeriods.value.length
        );
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    };

    const openBudgetPlanningPeriodsModal = async (data: any) => {
      const dataSelected = data;
      currentBankAccounts.value = dataSelected;
      console.log('data,', data);
      console.log('dataSelected,', dataSelected);
      console.log('currentBankAccounts,', currentBankAccounts.value);

      budgetPlanningPeriodsModal.value = true;
    };
    const closeBudgetPlanningPeriodsModal = async () => {
      await getData();
      budgetPlanningPeriodsModal.value = false;
    };

    const openModalDelete = (status: any) => {
      modalDelete.value = true;
      currentBankAccounts.value = status;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getData();
    };

    const deleteBankAccount = async () => {
      try {
        await deleteBankAccountService.run(
          currentBankAccounts.value?.id as number
        );
        await closeModalDelete();
      } catch (e) {
        console.log('this error', e);
      }
    };
    return {
      loading,
      title,
      t,
      budgetPlanningPeriods,
      budgetPlanningPeriodsModal,
      openBudgetPlanningPeriodsModal,
      closeBudgetPlanningPeriodsModal,
      currentBankAccounts,
      modalDelete,
      openModalDelete,
      deleteBankAccount,
    };
  },
});
</script>

<style scoped></style>
