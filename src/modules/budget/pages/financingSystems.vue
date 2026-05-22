<template>
  <AppBaseList>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <h2 class="tw-text-lg tw-font-light">
          {{ entitySystem }}
        </h2>
        <AppCheckPermission permission="">
          <AppButtonNewContainer @click="openfinancingSystemsModal"></AppButtonNewContainer>
        </AppCheckPermission>
        <AppEmptyResponse v-if="!financingSystems?.length"></AppEmptyResponse>
        <AppAccordion v-else class="mt-2" v-slot="{ accordionId }">
          <AppAccordionItem :accordion-id="accordionId" v-for="financingSystem in financingSystems" :key="financingSystem.id" @open="getConstantFinancing(financingSystem.id)">
            <template v-slot:head>{{ financingSystem.name }}</template>

            <template v-slot:content>
              <h6 class="tw-text-lg tw-font-light">
                {{ entityLevel }}
              </h6>
              <AppLoading v-if="loadingLevels"></AppLoading>
              <template v-else>
                <div>
                  <AppCheckPermission permission="">
                    <AppButtonNewContainer @click="openLevelSystemModal(financingSystem)"></AppButtonNewContainer>
                  </AppCheckPermission>
                  <AppEmptyResponse v-if="!currentConstantfinancingSystems?.[0]?.levelsStandardizedAccountingSystem?.length"></AppEmptyResponse>
                  <DataTable v-else :value="currentConstantfinancingSystems?.[0]?.levelsStandardizedAccountingSystem">
                    <Column field="label" header="Nombre"></Column>
                    <Column field="level" header="Nivel"></Column>
                    <Column header="Acciones">
                      <template #body="slotProps">
                        <!-- Botón de carga para cargar subniveles -->
                        <AppButtonEdit @click="openLevelSystemModal(financingSystem, slotProps.data)"></AppButtonEdit>
                        <AppButtonDelete @click="openConfirmDelete(entityLevel, slotProps.data)"></AppButtonDelete>
                      </template>
                    </Column>
                  </DataTable>
                </div>
                <hr />
                <div class="d-flex justify-content-end">
                  <AppButtonGroup>
                    <AppCheckPermission permission="">
                      <AppButton
                        label="core.import"
                        outlined
                        :to="{
                          name: 'budget.importTemplateFinancingSistems',
                          params: {
                            standardizedAccountingSystemId: financingSystem.id,
                          },
                        }"
                      ></AppButton>
                    </AppCheckPermission>
                    <AppCheckPermission permission="">
                      <AppButton label="core.bankAccount" v-tooltip="'core.associateBankAccount'" @click="openBankAccountsModal(financingSystem)"></AppButton>
                      <AppCheckPermission permission="">
                        <AppButton icon="tags" v-tooltip="'Asociar core.menu.discounts'" @click="openDiscountModal(financingSystem)"></AppButton>
                      </AppCheckPermission>
                      <AppCheckPermission permission="">
                        <AppButton icon="file-invoice-dollar" v-tooltip="'Asociar clases de pago'" @click="openClassPaymentModal(financingSystem)"></AppButton>
                      </AppCheckPermission>
                    </AppCheckPermission>
                    <AppCheckPermission permission="">
                      <AppButtonEdit @click="openfinancingSystemsModal(financingSystem)"></AppButtonEdit>
                    </AppCheckPermission>

                    <AppCheckPermission permission="">
                      <!--v-if="!currentConstantfinancingSystems?.[0]?.levelsStandardizedAccountingSystem?.length"-->
                      <AppButtonDelete @click="openConfirmDelete(entitySystem, financingSystem)"></AppButtonDelete>
                    </AppCheckPermission>

                    <AppCheckPermission permission="">
                      <AppButton
                        v-if="currentConstantfinancingSystems?.[0]?.levelsStandardizedAccountingSystem?.length"
                        @click="redirecFinancingView(financingSystem.id)"
                        icon="cog"
                        v-tooltip="'core.setting'"
                      ></AppButton>
                    </AppCheckPermission>
                  </AppButtonGroup>
                </div>
              </template>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </template>
      <AppModal v-model="financingSystemsModal">
        <FinancingSystemsForm v-if="financingSystemsModal" :data="currentfinancingSystem" @close="closefinancingSystemsModal"></FinancingSystemsForm>
      </AppModal>
      <AppModal v-model="levelSystemModal">
        <LevelSystemForm v-if="levelSystemModal" :data="currentLevelSystem" :level="currentLevelEdit" @close="closeLevelSystemModal"></LevelSystemForm>
      </AppModal>
      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="currentEntity" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
      <AppModal v-model="bankAccountsModal" :size="'xl'">
        <BankAccountList v-if="bankAccountsModal" :data="currentBankAccounts" @close="closeBankAccountsModal"></BankAccountList>
      </AppModal>
      <AppModal v-model="classPaymentModal" :size="'xl'">
        <ClassPaymentList v-if="classPaymentModal" :data="currentClassPayment" @close="closeClassPaymentModal"></ClassPaymentList>
      </AppModal>
      <AppModal v-model="discountModal" :size="'xl'">
        <DiscountList v-if="discountModal" :data="currentDiscount" @close="closeDiscountModal"></DiscountList>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
//import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import FinancingSystemsForm from '../components/FinancingSystemsForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import LevelSystemForm from '../components/LevelSystemForm.vue';
import ClassPaymentList from '../components/ClassPaymentList.vue';
import DiscountList from '../components/DiscountList.vue';
import { useHeaderStore } from '../../../stores/header.store';

import { GetFinancingClassificationSystemService } from '../services/getFinancingClassificationSystems.service';
import { GetConstantTypesFinancingBySystemIdService } from '../services/getConstantTypesFinancingBySystemId.service';
import { DeleteFinancingSystemsService } from '../services/deleteFinancingSystems.service';
import { DeleteLevelByFinancingSystemService } from '../services/deleteLevelByFinancingSystem.service';
import BankAccountList from '../components/BankAccountList.vue';

const getFinancingClassificationSystemService = new GetFinancingClassificationSystemService();
const deleteFinancingSystemsService = new DeleteFinancingSystemsService();
const getConstantTypesFinancingBySystemIdService = new GetConstantTypesFinancingBySystemIdService();
const deleteLevelByFinancingSystemService = new DeleteLevelByFinancingSystemService();

export default defineComponent({
  name: 'financingSystemsPage',
  components: {
    AppBaseList,
    AppAccordion,
    AppAccordionItem,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonGroup,
    AppButtonNewContainer,
    AppLoading,
    DataTable,
    Column,
    AppButtonEdit,
    AppButtonDelete,
    AppButton,
    FinancingSystemsForm,
    AppModal,
    AppConfirmDeleteModal,
    LevelSystemForm,
    BankAccountList,
    ClassPaymentList,
    DiscountList,
  },
  setup() {
    const router = useRouter();
    const financingSystems = ref<any>([]);
    const currentConstantfinancingSystems = ref<any>([]);
    const loading = ref(true);
    const loadingLevels = ref(true);
    const financingSystemsModal = ref(false);
    const levelSystemModal = ref(false);
    const modalDelete = ref(false);
    const currentfinancingSystem = ref();
    const currentLevelSystem = ref();
    const currentLevelEdit = ref();
    const currentDataDelete = ref();
    const currentEntity = ref('');
    const entitySystem = 'Sistemas de clasificación de financiación';
    const entityLevel = 'Niveles del sistema';
    const bankAccountsModal = ref(false);
    const currentBankAccounts = ref<any>(null);
    const discountModal = ref(false);
    const currentDiscount = ref<any>(null);
    const classPaymentModal = ref(false);
    const currentClassPayment = ref<any>(null);
    const getData = async () => {
      try {
        financingSystems.value = await getFinancingClassificationSystemService.run();
        loading.value = false;
      } catch (e) {
        console.log('error getData', e);
      }
    };
    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Presupuestos', url: '' };
      headerStorage.moduleItem = { name: entitySystem, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      getData();
    });
    const openfinancingSystemsModal = (data: any) => {
      currentfinancingSystem.value = data;
      financingSystemsModal.value = true;
    };
    const openLevelSystemModal = (data: any, level?: any) => {
      currentLevelSystem.value = data;
      currentLevelEdit.value = level;
      levelSystemModal.value = true;
    };
    const closeLevelSystemModal = async () => {
      try {
        levelSystemModal.value = false;
        //Actualizar data
        currentConstantfinancingSystems.value = await getConstantTypesFinancingBySystemIdService.run(currentConstantfinancingSystems.value?.[0]?.id);
      } catch (e) {
        console.log('error closeLevel', e);
      }
    };
    const closefinancingSystemsModal = async () => {
      financingSystemsModal.value = false;
      await getData();
    };
    const getConstantFinancing = async (systemId: any) => {
      if (systemId === currentConstantfinancingSystems.value?.[0]?.id) {
        return;
      }
      try {
        loadingLevels.value = true;
        currentConstantfinancingSystems.value = await getConstantTypesFinancingBySystemIdService.run(systemId);
        loadingLevels.value = false;
      } catch (e) {
        console.log('error getConstant', e);
      }
    };
    const redirecFinancingView = async (systemId: any) => {
      await router.push({
        name: 'budget.typesFinancingSources',
        params: {
          financingSystemId: systemId,
        },
      });
    };
    const openConfirmDelete = async (entity: string, data: any) => {
      currentDataDelete.value = data;
      currentEntity.value = entity;
      modalDelete.value = true;
    };

    const confirmDelete = async () => {
      try {
        if (currentEntity.value === entitySystem) {
          await deleteFinancingSystemsService.run(currentDataDelete.value.id);
        } else if (currentEntity.value === entityLevel) {
          await deleteLevelByFinancingSystemService.run(currentDataDelete.value.id);
        }
        modalDelete.value = false;
        //actualizar data
        currentConstantfinancingSystems.value = await getConstantTypesFinancingBySystemIdService.run(currentConstantfinancingSystems.value?.[0]?.id);
        await getData();
      } catch (e) {
        console.log('error', e);
      }
    };
    const openBankAccountsModal = async (financingSystem: any) => {
      currentBankAccounts.value = financingSystem;
      bankAccountsModal.value = true;
      console.log(financingSystem);
    };
    const closeBankAccountsModal = async () => {
      bankAccountsModal.value = false;
      currentBankAccounts.value = null;

      //updateDatatableService.run();
    };
    const openDiscountModal = async (financingSystem: any) => {
      currentDiscount.value = financingSystem;
      discountModal.value = true;
    };
    const closeDiscountModal = async () => {
      discountModal.value = false;
      currentDiscount.value = null;
    };
    const openClassPaymentModal = async (financingSystem: any) => {
      currentClassPayment.value = financingSystem;
      classPaymentModal.value = true;
      console.log(financingSystem);
    };
    const closeClassPaymentModal = async () => {
      classPaymentModal.value = false;
      currentClassPayment.value = null;
    };

    return {
      financingSystems,
      loading,
      loadingLevels,

      financingSystemsModal,
      currentfinancingSystem,
      openfinancingSystemsModal,
      closefinancingSystemsModal,
      openLevelSystemModal,
      levelSystemModal,
      currentLevelSystem,
      currentLevelEdit,
      closeLevelSystemModal,
      redirecFinancingView,

      modalDelete,
      confirmDelete,
      openConfirmDelete,
      currentEntity,
      getConstantFinancing,
      currentConstantfinancingSystems,
      entitySystem,
      entityLevel,
      openBankAccountsModal,
      closeBankAccountsModal,
      bankAccountsModal,
      currentBankAccounts,

      openDiscountModal,
      closeDiscountModal,
      currentDiscount,
      discountModal,

      openClassPaymentModal,
      closeClassPaymentModal,
      classPaymentModal,
      currentClassPayment,
    };
  },
});
</script>

<style scoped></style>
