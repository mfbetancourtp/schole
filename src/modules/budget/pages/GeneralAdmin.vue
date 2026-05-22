<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <div class="grid-cards" v-else>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Bancos
              <AppButton @click="openModalDryplace" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Código</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in banksList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td>{{ item.code }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalDryplace(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeleteDryplace(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Tipos de cuentas
              <AppButton @click="openModalStorage(null)" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col" rowspan="2">Description</th>
                    <th scope="col" rowspan="2">Code</th>
                    <th scope="col" rowspan="2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in typeAccountList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td>{{ item.code }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalStorage(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeleteStorage(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Categorización de fuentes
              <AppButton @click="openModalCategorization" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in sourceCategorizationList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalCategorization(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeleteCategorization(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Tipos de pagos
              <AppButton @click="openModalPaymentType" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paymentTypeList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalPaymentType(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeletePaymentType(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Formas de pagos
              <AppButton @click="openModalPaymentMethods" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paymentMethodsList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalPaymentMethods(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeletePaymentMethods(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Naturaleza del pagos
              <AppButton @click="openModalNaturePayment" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in naturePaymentList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalNaturePayment(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeleteNaturePayment(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Formas de contratación
              <AppButton @click="openModalContractForm" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in contractFormList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalContractForm(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeleteContractForm(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Tipos de factura
              <AppButton @click="openModalTypeInvoice(null)" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in typeInvoiceList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalTypeInvoice(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeleteTypeInvoice(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppCard class="col-6">
          <template #title>
            <div class="d-flex justify-content-between" style="font-weight: bold">
              Tipos de contrato
              <AppButton @click="openModalTypeContract" variant="primary" label="Agregar"></AppButton>
            </div>
          </template>
          <template #body>
            <div class="bg-card bg-white shadow-sm" style="overflow: auto; max-height: 300px">
              <table class="table table-bordered table-striped w-100">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Nombre</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in typeContractList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCustomButton icon-name="pencil" @click="openModalTypeContract(item)"> </AppCustomButton>
                        <AppCustomButton icon-name="trash" @click="openModalDeleteTypeContract(item)"> </AppCustomButton>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
      </div>
      <AppModal v-model="modalBanks">
        <BankModal v-if="modalBanks" @close="closeModalDryplace" :data="currentDataBanks"></BankModal>
      </AppModal>
      <AppModal v-model="modalDeleteBanks">
        <AppConfirmDeleteModal v-if="modalDeleteBanks" entity="Banco" @confirmDelete="deleteDryPlace"> </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalTypeAccount">
        <TypeAccountModal v-if="modalTypeAccount" @close="closeModalStorage" :data="currentDataTypeAccount"> </TypeAccountModal>
      </AppModal>
      <AppModal v-model="modalDeleteTypeAccount">
        <AppConfirmDeleteModal v-if="modalDeleteTypeAccount" entity="Tipo de cuenta" @confirmDelete="deleteStorage"> </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalCategorization">
        <SourceCategorizationModal v-if="modalCategorization" @close="closeModalCategorization" :data="currentSourceCategorization"></SourceCategorizationModal>
      </AppModal>
      <AppModal v-model="modalDeleteCategorization">
        <AppConfirmDeleteModal v-if="modalDeleteCategorization" entity="Categorización de fuentes" @confirmDelete="deleteCategorization"> </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalPaymentType">
        <PaymentTypeModal v-if="modalPaymentType" @close="closeModalPaymentType" :data="currentPaymentType"></PaymentTypeModal>
      </AppModal>
      <AppModal v-model="modalDeletePaymentType">
        <AppConfirmDeleteModal v-if="modalDeletePaymentType" entity="Tipo de pago" @confirmDelete="deletePaymentType"> </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalPaymentMethods">
        <PaymentMethodsModal v-if="modalPaymentMethods" @close="closeModalPaymentMethods" :data="currentPaymentMethods"></PaymentMethodsModal>
      </AppModal>
      <AppModal v-model="modalDeletePaymentMethods">
        <AppConfirmDeleteModal v-if="modalDeletePaymentMethods" entity="Forma de pago" @confirmDelete="deletePaymentMethods"> </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalNaturePayment">
        <NaturePaymentModal v-if="modalNaturePayment" @close="closeModalNaturePayment" :data="currentNaturePayment"></NaturePaymentModal>
      </AppModal>
      <AppModal v-model="modalDeleteNaturePayment">
        <AppConfirmDeleteModal v-if="modalDeleteNaturePayment" entity="Naturaleza del pago" @confirmDelete="deleteNaturePayment"> </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalContractForm" size="lg">
        <ContractFormModal v-if="modalContractForm" @close="closeModalContractForm" :data="currentContractForm"></ContractFormModal>
      </AppModal>
      <AppModal v-model="modalDeleteContractForm">
        <AppConfirmDeleteModal v-if="modalDeleteContractForm" entity="Forma de contratación" @confirmDelete="deleteContractForm"> </AppConfirmDeleteModal>
      </AppModal>
      <AppModal v-model="modalTypeInvoice">
        <TypeInvoiceModal v-if="modalTypeInvoice" @close="closeModalTypeInvoice" :data="currentTypeInvoice"></TypeInvoiceModal>
      </AppModal>
      <AppModal v-model="modalDeleteTypeInvoice">
        <AppConfirmDeleteModal v-if="modalDeleteTypeInvoice" entity="Tipo de factura" @confirmDelete="deleteTypeInvoice"> </AppConfirmDeleteModal>
      </AppModal>
      <AppModal v-model="modalTypeContract" size="lg">
        <TypeContractModal v-if="modalTypeContract" @close="closeModalTypeContract" @update="updateTypeContract" :data="currentTypeContract"></TypeContractModal>
      </AppModal>
      <AppModal v-model="modalDeleteTypeContract">
        <AppConfirmDeleteModal v-if="modalDeleteTypeContract" @confirmDelete="deleteTypeContract"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import BankModal from '../components/BankModal.vue';
import TypeAccountModal from '../components/TypeAccountModal.vue';
import SourceCategorizationModal from '../components/SourceCategorizationModal.vue';
import PaymentTypeModal from '../components/PaymentTypeModal.vue';
import PaymentMethodsModal from '../components/PaymentMethodsModal.vue';
import NaturePaymentModal from '../components/NaturePaymentModal.vue';
import ContractFormModal from '../components/ContractFormModal.vue';
import TypeInvoiceModal from '../components/TypeInvoiceModal.vue';
import TypeContractModal from '../components/TypeContractModal.vue';

import { typeAccountDto } from '../dtos/typeAccount.dto';
import { bankDto } from '../dtos/bank.dto';

import { GetAllBanksService } from '../services/getAllBanks.service';
import { DeleteBanksByIdService } from '../services/deleteBanksById.service';

import { GetAllTypeAccountService } from '../services/getAllTypeAccount.service';
import { DeleteTypeAccountByIdService } from '../services/deleteTypeAccountById.service';

import { GetAllSourceCategorizationBudgetService } from '../services/getAllSourceCategorizationBudget.service';
import { DeleteSourceCategorizationByIdService } from '../services/deleteSourceCategorizationById.service';

import { GetAllPaymentTypeService } from '../services/getAllPaymentType.service';
import { DeletePaymentTypeByIdService } from '../services/deletePaymentTypeById.service';

import { GetAllPaymentMethodsService } from '../services/getAllPaymentMethods.service';
import { DeletePaymentMethodsByIdService } from '../services/deletePaymentMethodsById.service';

import { GetAllNaturePaymentService } from '../services/getAllNaturePayment.service';
import { DeleteNaturePaymentByIdService } from '../services/deleteNaturePaymentById.service';

import { GetAllContractFormService } from '../services/getAllContractForm.service';
import { DeleteContractFormByIdService } from '../services/deleteContractFormById.service';

import { GetAllTypeInvoicesService } from '../services/getAllTypeInvoices.service';
import { DeleteTypeInvoicesByIdService } from '../services/deleteTypeInvoicesById.service';

import { GetTypeContractService } from '../services/getTypeContract.service';
import { DeleteTypeContractService } from '../services/deleteTypeContract.service';

import { sourceCategorizationDto } from '../dtos/sourceCategorization.dto';
import { paymentTypeDto } from '../dtos/paymentType.dto';
import { paymentMethodsDto } from '../dtos/paymentMethods.dto';
import { naturePaymentDto } from '../dtos/naturePayment.dto';
import { contractFormDto } from '../dtos/contractForm.dto';
import { typeInvoiceDto } from '../dtos/typeInvoices.dto';
import { typeContractDto } from '../dtos/typeContract.dto';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCustomButton from '../../../shared/components/Buttons/AppCustomButton.vue';
import { useHeaderStore } from '../../../stores/header.store';

export default defineComponent({
  name: 'GeneralAdmin',
  components: {
    AppLoading,
    AppBaseList,
    AppButton,
    AppModal,
    AppConfirmDeleteModal,
    BankModal,
    TypeAccountModal,
    SourceCategorizationModal,
    AppCard,
    AppButtonGroup,
    AppCustomButton,
    PaymentTypeModal,
    PaymentMethodsModal,
    NaturePaymentModal,
    ContractFormModal,
    TypeInvoiceModal,
    TypeContractModal,
  },
  setup() {
    const getAllBanksService = new GetAllBanksService();
    const deleteBanksByIdService = new DeleteBanksByIdService();

    const getAllTypeAccountService = new GetAllTypeAccountService();
    const deleteTypeAccountByIdService = new DeleteTypeAccountByIdService();

    const getAllSourceCategorizationBudgetService = new GetAllSourceCategorizationBudgetService();
    const deleteSourceCategorizationByIdService = new DeleteSourceCategorizationByIdService();

    const getAllPaymentTypeService = new GetAllPaymentTypeService();
    const deletePaymentTypeByIdService = new DeletePaymentTypeByIdService();

    const getAllPaymentMethodsService = new GetAllPaymentMethodsService();
    const deletePaymentMethodsByIdService = new DeletePaymentMethodsByIdService();

    const getAllNaturePaymentService = new GetAllNaturePaymentService();
    const deleteNaturePaymentByIdService = new DeleteNaturePaymentByIdService();

    const getAllContractFormService = new GetAllContractFormService();
    const deleteContractFormByIdService = new DeleteContractFormByIdService();

    const getAllTypeInvoicesService = new GetAllTypeInvoicesService();
    const deleteTypeInvoicesByIdService = new DeleteTypeInvoicesByIdService();

    const getTypeContractService = new GetTypeContractService();
    const deleteTypeContractService = new DeleteTypeContractService();

    const title = 'Administracion General';
    const loading = ref(true);

    const banksList = ref<bankDto[]>([]);
    const currentDataBanks = ref<bankDto | null>();
    const modalBanks = ref(false);
    const modalDeleteBanks = ref(false);

    const typeAccountList = ref<typeAccountDto[]>([]);
    const currentDataTypeAccount = ref<typeAccountDto | null>();
    const modalTypeAccount = ref(false);
    const modalDeleteTypeAccount = ref(false);

    const sourceCategorizationList = ref<sourceCategorizationDto[]>();
    const currentSourceCategorization = ref<sourceCategorizationDto | null>();
    const modalCategorization = ref(false);
    const modalDeleteCategorization = ref(false);

    const paymentTypeList = ref<paymentTypeDto[]>();
    const currentPaymentType = ref<paymentTypeDto | null>();
    const modalPaymentType = ref(false);
    const modalDeletePaymentType = ref(false);

    const paymentMethodsList = ref<paymentMethodsDto[]>();
    const currentPaymentMethods = ref<paymentMethodsDto | null>();
    const modalPaymentMethods = ref(false);
    const modalDeletePaymentMethods = ref(false);

    const naturePaymentList = ref<naturePaymentDto[]>();
    const currentNaturePayment = ref<naturePaymentDto | null>();
    const modalNaturePayment = ref(false);
    const modalDeleteNaturePayment = ref(false);

    const contractFormList = ref<contractFormDto[]>();
    const currentContractForm = ref<contractFormDto | null>();
    const modalContractForm = ref(false);
    const modalDeleteContractForm = ref(false);

    const typeInvoiceList = ref<typeInvoiceDto[]>();
    const currentTypeInvoice = ref<typeInvoiceDto | null>();
    const modalTypeInvoice = ref(false);
    const modalDeleteTypeInvoice = ref(false);

    const typeContractList = ref<typeContractDto[]>([]);
    const currentTypeContract = ref<typeContractDto | null>();
    const modalTypeContract = ref(false);
    const modalDeleteTypeContract = ref(false);

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Administración general', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      try {
        banksList.value = await getAllBanksService.run();
        typeAccountList.value = await getAllTypeAccountService.run();
        sourceCategorizationList.value = await getAllSourceCategorizationBudgetService.run();
        paymentTypeList.value = await getAllPaymentTypeService.run();
        paymentMethodsList.value = await getAllPaymentMethodsService.run();
        naturePaymentList.value = await getAllNaturePaymentService.run();
        contractFormList.value = await getAllContractFormService.run();
        typeInvoiceList.value = await getAllTypeInvoicesService.run();
        typeContractList.value = await getTypeContractService.run();
      } catch (error) {
        console.log('This is error', error);
        loading.value = false;
      }
      loading.value = false;
    });

    const openModalDryplace = (dataSelected: bankDto | null) => {
      currentDataBanks.value = dataSelected;
      modalBanks.value = true;
    };
    const openModalDeleteDryplace = (dataDryplace: bankDto) => {
      modalDeleteBanks.value = true;
      currentDataBanks.value = dataDryplace;
    };
    const deleteDryPlace = async () => {
      try {
        await deleteBanksByIdService.run(currentDataBanks.value?.id as number);
        await closeModalDryplace();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalDryplace = async () => {
      modalDeleteBanks.value = false;
      modalBanks.value = false;
      banksList.value = await getAllBanksService.run();
    };

    const openModalStorage = (dataSelected: typeAccountDto | null) => {
      currentDataTypeAccount.value = dataSelected;
      modalTypeAccount.value = true;
    };
    const openModalDeleteStorage = (dataStorage: typeAccountDto) => {
      modalDeleteTypeAccount.value = true;
      currentDataTypeAccount.value = dataStorage;
    };
    const deleteStorage = async () => {
      try {
        await deleteTypeAccountByIdService.run(currentDataTypeAccount.value?.id as number);
        await closeModalStorage();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalStorage = async () => {
      modalDeleteTypeAccount.value = false;
      modalTypeAccount.value = false;
      typeAccountList.value = await getAllTypeAccountService.run();
    };

    const openModalCategorization = (dataSelected: sourceCategorizationDto | null) => {
      currentSourceCategorization.value = dataSelected;
      modalCategorization.value = true;
    };
    const openModalDeleteCategorization = (dataSelected: sourceCategorizationDto) => {
      modalDeleteCategorization.value = true;
      currentSourceCategorization.value = dataSelected;
    };
    const deleteCategorization = async () => {
      try {
        await deleteSourceCategorizationByIdService.run(currentSourceCategorization.value?.id as number);
        await closeModalCategorization();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalCategorization = async () => {
      modalDeleteCategorization.value = false;
      modalCategorization.value = false;
      currentSourceCategorization.value = null;
      sourceCategorizationList.value = await getAllSourceCategorizationBudgetService.run();
    };

    const openModalPaymentType = (dataSelected: paymentTypeDto | null) => {
      currentPaymentType.value = dataSelected;
      modalPaymentType.value = true;
    };
    const openModalDeletePaymentType = (dataSelected: paymentTypeDto) => {
      modalDeletePaymentType.value = true;
      currentPaymentType.value = dataSelected;
    };
    const deletePaymentType = async () => {
      try {
        await deletePaymentTypeByIdService.run(currentPaymentType.value?.id as number);
        await closeModalPaymentType();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalPaymentType = async () => {
      modalDeletePaymentType.value = false;
      modalPaymentType.value = false;
      currentPaymentType.value = null;
      paymentTypeList.value = await getAllPaymentTypeService.run();
    };

    const openModalPaymentMethods = (dataSelected: paymentMethodsDto | null) => {
      currentPaymentMethods.value = dataSelected;
      modalPaymentMethods.value = true;
    };
    const openModalDeletePaymentMethods = (dataSelected: paymentMethodsDto) => {
      modalDeletePaymentMethods.value = true;
      currentPaymentMethods.value = dataSelected;
    };
    const deletePaymentMethods = async () => {
      try {
        await deletePaymentMethodsByIdService.run(currentPaymentMethods.value?.id as number);
        await closeModalPaymentMethods();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalPaymentMethods = async () => {
      modalDeletePaymentMethods.value = false;
      modalPaymentMethods.value = false;
      currentPaymentMethods.value = null;
      paymentMethodsList.value = await getAllPaymentMethodsService.run();
    };

    const openModalNaturePayment = (dataSelected: naturePaymentDto | null) => {
      currentNaturePayment.value = dataSelected;
      modalNaturePayment.value = true;
    };
    const openModalDeleteNaturePayment = (dataSelected: naturePaymentDto) => {
      modalDeleteNaturePayment.value = true;
      currentNaturePayment.value = dataSelected;
    };
    const deleteNaturePayment = async () => {
      try {
        await deleteNaturePaymentByIdService.run(currentNaturePayment.value?.id as number);
        await closeModalNaturePayment();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalNaturePayment = async () => {
      modalDeleteNaturePayment.value = false;
      modalNaturePayment.value = false;
      currentNaturePayment.value = null;
      naturePaymentList.value = await getAllNaturePaymentService.run();
    };

    const openModalContractForm = (dataSelected: contractFormDto | null) => {
      currentContractForm.value = dataSelected;
      modalContractForm.value = true;
    };
    const openModalDeleteContractForm = (dataSelected: contractFormDto) => {
      modalDeleteContractForm.value = true;
      currentContractForm.value = dataSelected;
    };
    const deleteContractForm = async () => {
      try {
        await deleteContractFormByIdService.run(currentContractForm.value?.id as number);
        await closeModalContractForm();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalContractForm = async () => {
      modalDeleteContractForm.value = false;
      modalContractForm.value = false;
      currentContractForm.value = null;
      contractFormList.value = await getAllContractFormService.run();
    };

    const openModalTypeInvoice = (dataSelected: typeInvoiceDto | null) => {
      currentTypeInvoice.value = dataSelected;
      modalTypeInvoice.value = true;
    };
    const openModalDeleteTypeInvoice = (dataSelected: typeInvoiceDto) => {
      modalDeleteTypeInvoice.value = true;
      currentTypeInvoice.value = dataSelected;
    };
    const deleteTypeInvoice = async () => {
      try {
        await deleteTypeInvoicesByIdService.run(currentTypeInvoice.value?.id);
        await closeModalTypeInvoice();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalTypeInvoice = async () => {
      modalDeleteTypeInvoice.value = false;
      modalTypeInvoice.value = false;
      typeInvoiceList.value = await getAllTypeInvoicesService.run();
    };
    const openModalTypeContract = (dataSelected: typeContractDto | null) => {
      currentTypeContract.value = dataSelected;
      modalTypeContract.value = true;
    };

    const openModalDeleteTypeContract = (dataSelected: typeContractDto) => {
      modalDeleteTypeContract.value = true;
      currentTypeContract.value = dataSelected;
    };
    const deleteTypeContract = async () => {
      try {
        await deleteTypeContractService.run(currentTypeContract.value?.id);
        closeModalTypeContract();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalTypeContract = async () => {
      modalDeleteTypeContract.value = false;
      modalTypeContract.value = false;
      currentTypeContract.value = null;
      updateTypeContract();
    };
    const updateTypeContract = async () => {
      try {
        typeContractList.value = await getTypeContractService.run();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };

    return {
      title,
      loading,

      banksList,
      currentDataBanks,
      modalBanks,
      openModalDryplace,
      openModalDeleteDryplace,
      deleteDryPlace,
      modalDeleteBanks,
      closeModalDryplace,

      typeAccountList,
      currentDataTypeAccount,
      modalTypeAccount,
      openModalStorage,
      openModalDeleteStorage,
      deleteStorage,
      modalDeleteTypeAccount,
      closeModalStorage,

      sourceCategorizationList,
      openModalCategorization,
      openModalDeleteCategorization,
      deleteCategorization,
      closeModalCategorization,
      modalCategorization,
      currentSourceCategorization,
      modalDeleteCategorization,

      paymentTypeList,
      openModalPaymentType,
      openModalDeletePaymentType,
      deletePaymentType,
      closeModalPaymentType,
      modalPaymentType,
      currentPaymentType,
      modalDeletePaymentType,

      paymentMethodsList,
      openModalPaymentMethods,
      openModalDeletePaymentMethods,
      deletePaymentMethods,
      closeModalPaymentMethods,
      modalPaymentMethods,
      currentPaymentMethods,
      modalDeletePaymentMethods,

      naturePaymentList,
      openModalNaturePayment,
      openModalDeleteNaturePayment,
      deleteNaturePayment,
      closeModalNaturePayment,
      modalNaturePayment,
      currentNaturePayment,
      modalDeleteNaturePayment,

      contractFormList,
      openModalContractForm,
      openModalDeleteContractForm,
      deleteContractForm,
      closeModalContractForm,
      modalContractForm,
      currentContractForm,
      modalDeleteContractForm,

      typeInvoiceList,
      currentTypeInvoice,
      modalTypeInvoice,
      openModalTypeInvoice,
      openModalDeleteTypeInvoice,
      deleteTypeInvoice,
      modalDeleteTypeInvoice,
      closeModalTypeInvoice,

      typeContractList,
      currentTypeContract,
      modalTypeContract,
      modalDeleteTypeContract,
      openModalTypeContract,
      openModalDeleteTypeContract,
      closeModalTypeContract,
      deleteTypeContract,
      updateTypeContract,
    };
  },
});
</script>
<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, calc(50% - 0.5rem)), 1fr));
  /* 50% de ancho y restando el espacio entre las tarjetas */
}

.sticky-top {
  z-index: 5 !important;
}

.container__body {
  width: 100%;
  max-height: 300px;
  overflow: auto;
}

table thead tr th {
  color: black;
  font-size: 14px;
  padding: 0.5rem;
  /* width: 200px; */
  white-space: nowrap;
  word-wrap: break-word;
  text-align: center;
}

table thead tr {
  background-color: #e4e4e4;
}

table tbody tr td {
  font-size: 14px;
  text-align: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eedd;
}

@media (max-width: 750px) {
  .grid-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
