<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppCheckPermission permission="">
        <AppButton
          style="color: white"
          label="core.import"
          outlined
          :to="{
            name: 'budget.importSuppliers',
          }"
        ></AppButton>
      </AppCheckPermission>
      <AppCheckPermission permission="">
        <AppButton
          style="color: white"
          label="core.new"
          @click="openBudgetPlanningPeriodsModal('')"
        />
      </AppCheckPermission>
    </template>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <AppDatatable
          :service="getSuppliersService"
          :params="params"
          :name="name"
        >
          <AppDatatableColumn
            label="core.businessName"
            field="businessName"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.businessName }}
          </AppDatatableColumn>

          <AppDatatableColumn
            label="core.identification"
            field="identification"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.identification }}
          </AppDatatableColumn>

          <AppDatatableColumn
            label="core.address"
            field="address"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.address }}
          </AppDatatableColumn>

          <AppDatatableColumn
            label="core.phoneNumber"
            field="phoneNumber"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.phoneNumber }}
          </AppDatatableColumn>
          <AppDatatableColumn
            label="core.email"
            field="email"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.email }}
          </AppDatatableColumn>
          <AppDatatableColumn
            label="core.contactPerson"
            field="contactPerson"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.contactPerson }}
          </AppDatatableColumn>
          <AppDatatableColumn
            label="core.bankName"
            field="bankName"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.bankName }}
          </AppDatatableColumn>
          <AppDatatableColumn
            label="core.accountNumber"
            field="accountNumber"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.accountNumber }}
          </AppDatatableColumn>
          <AppDatatableColumn
            label="core.accountType"
            field="accountType"
            :sortable="true"
            v-slot="{ row }"
          >
            {{ row.accountType }}
          </AppDatatableColumn>

          <AppDatatableColumn
            :label="'Firma'"
            :sortable="true"
            v-slot="{ row }"
          >
            <a v-if="row.signature" :href="row.signature" target="_blank">
              Ver firma
            </a>
            <a v-else> Sin firma </a>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" :label="'Acciones'">
            <AppButtonGroup size="sm">
              <AppButtonEdit @click="openBudgetPlanningPeriodsModal(row)">
              </AppButtonEdit>
              <AppButtonDelete @click="openModalDelete(row)"></AppButtonDelete>
            </AppButtonGroup>
          </AppDatatableColumn>
        </AppDatatable>
      </template>
      <AppModal size="xl" v-model="budgetPlanningPeriodsModal">
        <SuppliersForm
          v-if="budgetPlanningPeriodsModal"
          :data="currentSuppliers"
          :typePersons="typePersons"
          :typeIdentifications="typeIdentifications"
          :accountTypes="accountTypes"
          :bankList="banksList"
          @close="closeBudgetPlanningPeriodsModal"
        />
      </AppModal>
      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal
          v-if="modalDelete"
          entity="Proveedor"
          @confirmDelete="deleteSuppliers"
        ></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { debounce } from 'ts-debounce';
import { useMeta } from 'vue-meta';
import { computed, defineComponent, onMounted, reactive, ref, Ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { GetSuppliersService } from '../services/getSuppliers.service';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import SuppliersForm from '../components/SuppliersForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import { GetIdentificactionTypeService } from '../services/getIdentificationType.service';
import { GetAccountTypeService } from '../services/getAccountType.service';
import { GetPersonTypeService } from '../services/getPersonType.service';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { DeleteSuppliersService } from '../services/deleteSuppliers.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GetAllBanksService } from '../services/getAllBanks.service';
import { bankDto } from '../dtos/bank.dto';

const updateDatatableService = new UpdateDatatableService();
const deleteSuppliersService = new DeleteSuppliersService();
const getIdentificactionTypeService = new GetIdentificactionTypeService();
const getAccountTypeService = new GetAccountTypeService();
const getAllBanksService = new GetAllBanksService();

const getPersonTypeService = new GetPersonTypeService();

export default defineComponent({
  name: 'SuppliersComponent',
  components: {
    AppButtonGroup,
    AppDatatableColumn,
    AppCheckPermission,
    AppModal,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    SuppliersForm,
    AppConfirmDeleteModal,
  },

  setup() {
    const { t } = useI18n();
    const title = 'core.menu.suppliers';
    const name = 'core.menu.suppliers';
    const refreshData = () => {
      updateDatatableService.run();
    };
    useMeta({
      title: t(title),
    });

    const academicPeriodId = ref();
    const searchValue = ref('');
    const loading = ref(true);
    const budgetPlanningPeriodsModal = ref(false);
    const currentSuppliers: Ref<any | null> = ref(null);
    const typePersons = ref([]);
    const accountTypes = ref([]);
    const banksList = ref<bankDto[]>([]);
    const typeIdentifications = ref([]);
    const modalDelete = ref(false);
    const getSuppliersService = new GetSuppliersService();
    const params = computed(() => {
      return {
        academicPeriodId: academicPeriodId.value,
        search: searchValue.value,
      };
    });

    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Presupuesto', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const search = debounce((event) => {
      searchValue.value = event.target.value;
    }, 800);

    const openBudgetPlanningPeriodsModal = async (data: any) => {
      const dataSelected = data;
      currentSuppliers.value = dataSelected;
      console.log('data,', data);
      console.log('dataSelected,', dataSelected);
      console.log('currentSuppliers,', currentSuppliers.value);

      budgetPlanningPeriodsModal.value = true;

      typePersons.value = await getPersonTypeService.run();
      typeIdentifications.value = await getIdentificactionTypeService.run();
      accountTypes.value = await getAccountTypeService.run();
      banksList.value = await getAllBanksService.run();
    };
    const closeBudgetPlanningPeriodsModal = async () => {
      await refreshData();
      budgetPlanningPeriodsModal.value = false;
    };

    const openModalDelete = (status: any) => {
      modalDelete.value = true;
      currentSuppliers.value = status;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await refreshData();
    };

    const deleteSuppliers = async () => {
      try {
        await deleteSuppliersService.run(currentSuppliers.value?.id as number);
        await closeModalDelete();
      } catch (e) {
        console.log('this error', e);
      }
    };

    return {
      loading,
      title,
      t,

      getSuppliersService,
      academicPeriodId,
      academicPeriods,
      searchValue,
      params,
      search,
      name,
      budgetPlanningPeriodsModal,
      openBudgetPlanningPeriodsModal,
      closeBudgetPlanningPeriodsModal,
      currentSuppliers,
      modalDelete,
      openModalDelete,
      deleteSuppliers,
      accountTypes,
      banksList,
      typeIdentifications,
      typePersons,
    };
  },
});
</script>

<style scoped>
.hover:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
.sticky-column-thead {
  position: sticky;
  left: 0;
  z-index: 2; /* Asegura que quede encima del contenido desplazable */
  background-color: rgb(
    228,
    228,
    228
  ); /* Fondo blanco para evitar superposición visual */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Añade una sombra para resaltar */
  z-index: 100;
}
tbody tr:nth-child(odd) .sticky-column-tbody {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: #ffffff; /* Fondo blanco para filas impares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

tbody tr:nth-child(even) .sticky-column-tbody {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: rgb(228, 228, 228); /* Fondo gris claro para filas pares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}
</style>
