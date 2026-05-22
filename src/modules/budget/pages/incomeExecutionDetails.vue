<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'budget.incomeExecution' }" />
    </template>
    <template #content>
      <AppPulseLoading v-if="loadingStatus"></AppPulseLoading>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <!--   <AppCard>
          <template #body> -->
        <div class="under__line mb-3">
          <div class="content-header">
            <h4 style="margin-bottom: 0px">{{ dataBudgetValidity[0].name }} /</h4>
            <h4 style="margin-bottom: 5px" v-for="(chip, index) in statusChips" :key="index" class="type-chip" :class="chip?.color">
              {{ chip?.name }}
            </h4>
          </div>
          <div>
            Fecha:
            <span style="font-weight: 400">{{ dataBudgetValidity[0].startDate }} - {{ dataBudgetValidity[0].endDate }}</span>
          </div>
        </div>
        <!-- Filtros -->

        <div class="filter mb-3">
          <div class="slider">
            <AppButton v-for="(option, index) in sizeOptions" :key="index" :class="{ active: currentSize === option }" @click="changeTableSize(option)">
              {{ option }}
            </AppButton>
          </div>
          <div class="d-flex gap-2">
            <div>
              <AppDropdown>
                <template #button>
                  <AppButton v-tooltip="'Administrar estados'" outlined :size="'sm'">Estados</AppButton>
                </template>
                <template #items>
                  <li class="mx-2">
                    <div v-for="item in dataBudgetValidity[0].statusBudgetValidatesDate" :key="item.id" class="form-check">
                      <input style="cursor: pointer" type="checkbox" :id="`item-${item.id}`" :checked="item.isActive === 1" @change="toggleActive(item)" class="form-check-input" />
                      <label style="cursor: pointer" :for="`item-${item.id}`" class="form-check-label">
                        {{ item.statusBudgetValidates[0]?.name }}
                      </label>
                    </div>
                  </li>
                </template>
              </AppDropdown>
            </div>
            <div>
              <AppDropdown>
                <template v-slot:button>
                  <AppButton v-tooltip="'Filtrar trimestres'" icon="filter"> </AppButton>
                </template>

                <template v-slot:items>
                  <li class="mx-2">
                    <div v-for="period in periodOptions" :key="period" class="form-check">
                      <input style="cursor: pointer" type="checkbox" :id="`period-${period.numberPeriod}`" :value="period.numberPeriod" v-model="selectedPeriods" class="form-check-input" />
                      <label :for="`period-${period}`" class="form-check-label">
                        {{ period.namePeriod }}
                      </label>
                    </div>
                  </li>
                </template>
              </AppDropdown>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered" :class="`size-${currentSize.toLowerCase()}`">
            <thead>
              <tr>
                <th class="sticky-column bg-white text-center static-colum"></th>
                <th class="sticky-column bg-white text-center static-colum s-colum-1"></th>
                <th class="sticky-column bg-white text-center static-colum s-colum-2"></th>
                <th class="sticky-column bg-white text-center static-colum s-colum-3"></th>
                <template v-for="(period, index) in filteredPeriods" :key="'period-' + index">
                  <!-- Ajustar colspan dinámico, (numero de columnas estaticas) + (numero de periodos/meses) - (resta las 2 columnas que no se muestran en el index 0) -->
                  <th class="text-center" :colspan="7 + (period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted?.length || 0) - (period.numberPeriod === 1 ? 2 : 0)"></th>
                  <!-- Nombre del Período -->
                  <th class="text-center" colspan="1" style="background-color: #ffff00">
                    {{ period.namePeriod }}
                  </th>
                </template>
              </tr>
              <tr>
                <!-- Encabezados de las columnas fijas -->
                <th class="sticky-column bg-white text-center static-colum">CÓDIGO</th>
                <th class="sticky-column bg-white text-center static-colum s-colum-1">CÓDIGO EXTERNO</th>
                <th class="sticky-column bg-white static-colum s-colum-2">DETALLE</th>
                <th class="sticky-column bg-white text-center static-colum s-colum-3" style="background-color: #ffd966 !important">Presupuesto Inicial</th>
                <!-- Encabezados dinámicos -->
                <template v-for="(period, index) in filteredPeriods" :key="index">
                  <th class="text-center">Adición</th>
                  <th v-if="period.numberPeriod != 1" class="text-center">Total Adición</th>
                  <th class="text-center">Reducción</th>
                  <th v-if="period.numberPeriod != 1" class="text-center">Total Reducción</th>
                  <th class="text-center" style="background-color: #99ff33">Ppto Final Aprobado</th>
                  <template v-for="(mes, index) in period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted" :key="index">
                    <th class="text-center">{{ mes.nameMonth }}</th>
                  </template>

                  <th class="text-center">Pagos Mensuales</th>
                  <th class="text-center">Ppto Ejecutado</th>
                  <th class="text-center" style="background-color: #ffff00">Ppto Por Ejecutar</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in dataBudgetPlanning" :key="rowIndex">
                <!-- Datos de las columnas fijas -->
                <td class="sticky-left bg-white static-colum text-center">
                  {{ row.financing_sources?.code || row.type_financing_sources?.code }}
                </td>
                <td class="sticky-left bg-white static-colum text-center s-colum-1">
                  {{ row.financing_sources?.externalCode || row.type_financing_sources?.externalCode }}
                </td>
                <td class="sticky-left bg-white static-colum text-center s-colum-2">
                  {{ row.financing_sources?.name || row.type_financing_sources?.name }}
                </td>
                <td class="sticky-left bg-white static-colum text-center s-colum-3">
                  <div class="content-edit text-center">
                    <div class="content-value">
                      {{ n(row.initialBudget ?? 0) }}
                    </div>
                    <div class="btn-edit">
                      <AppButtonEdit v-if="row.editValue" @click="openInitialBudgetForm(row)"></AppButtonEdit>
                    </div>
                  </div>
                </td>
                <!-- Datos dinámicos -->
                <template v-for="(period, periodIndex) in row.budgetPlanningPeriods" :key="periodIndex">
                  <template v-if="selectedPeriods.includes(period.numberPeriod)">
                    <td class="text-center">
                      <div class="content-edit text-center">
                        <div class="content-value">
                          {{ n(period.financingSourcesPeriods?.[0]?.additional ?? 0) }}
                        </div>
                        <div class="btn-edit">
                          <AppButtonEdit v-if="row.editValue" @click="openAdditionalOrReductionForm(period, row, 'additional')"></AppButtonEdit>
                        </div>
                      </div>
                    </td>
                    <td v-if="periodIndex > 0" class="text-center">
                      {{ n(period.financingSourcesPeriods?.[0]?.totalAdditional ?? 0) }}
                    </td>
                    <td class="text-center">
                      <div class="content-edit text-center">
                        <div class="content-value">
                          {{ n(period.financingSourcesPeriods?.[0]?.reduction ?? 0) }}
                        </div>
                        <div class="btn-edit">
                          <AppButtonEdit v-if="row.editValue" @click="openAdditionalOrReductionForm(period, row, 'reduction')"></AppButtonEdit>
                        </div>
                      </div>
                    </td>
                    <td v-if="periodIndex > 0" class="text-center">
                      {{ n(period.financingSourcesPeriods?.[0]?.totalReduction ?? 0) }}
                    </td>
                    <td class="text-center">
                      {{ n(period.financingSourcesPeriods?.[0]?.budgetFinalApproved ?? 0) }}
                    </td>
                    <template v-for="(mes, monthIndex) in period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted" :key="monthIndex">
                      <td class="text-center">
                        <div class="content-edit text-center">
                          <div class="content-value">
                            {{ n(mes.executedAmount ?? 0) }}
                          </div>
                          <div class="btn-edit">
                            <AppButtonEdit v-if="row.editValue" @click="openAmountMonthForm(mes, period, row)"></AppButtonEdit>
                          </div>
                        </div>
                      </td>
                    </template>
                    <td class="text-center">
                      {{ n(period.financingSourcesPeriods?.[0]?.totalBudgetMonths ?? 0) }}
                    </td>
                    <td class="text-center">
                      {{ n(period.financingSourcesPeriods?.[0]?.budgetExecuted ?? 0) }}
                    </td>
                    <td class="text-center">
                      {{ n(period.financingSourcesPeriods?.[0]?.budgetToExecuted ?? 0) }}
                    </td>
                  </template>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <!--   </template>
      </AppCard>-->
      </template>
      <AppModal v-model="initialBudgetModal" :size="'lg'">
        <InitialBudgetIncomeExecutionForm v-if="initialBudgetModal" :data="currentInitialBudget" @close="closeInitialBudgetForm"></InitialBudgetIncomeExecutionForm>
      </AppModal>
      <AppModal v-model="additionalOrReductionModal" :size="'lg'">
        <AdditionalOrReductionExecutionForm
          v-if="additionalOrReductionModal"
          :data="currentAdditionalOrReduction"
          :detailData="currentDetailAddOrRed"
          :entity="entityAdditionalOrReduction"
          @close="closeAdditionalOrReductionForm"
        ></AdditionalOrReductionExecutionForm>
      </AppModal>
      <AppModal v-model="amountMonthFormModal" :size="'lg'">
        <AmountMonthExecutionForm
          v-if="amountMonthFormModal"
          :data="currentAmountMonthForm"
          :detailData="currentDetailAmountMonth"
          :detailPeriod="currentDetailPeriod"
          @close="closeAmountMonthForm"
        ></AmountMonthExecutionForm>
      </AppModal>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
//import DataTable from 'primevue/datatable';
//import Column from 'primevue/column';

import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
//import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import { useHeaderStore } from '../../../stores/header.store';
//import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDropdown from '../../../shared/components/AppDropdown.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import InitialBudgetIncomeExecutionForm from '../components/InitialBudgetIncomeExecutionForm.vue';
import AdditionalOrReductionExecutionForm from '../components/AdditionalOrReductionExecutionForm.vue';
import AmountMonthExecutionForm from '../components/AmountMonthExecutionForm.vue';
//import { GetFinancingClassificationSystemService } from '../services/getFinancingClassificationSystems.service';
import { GetBudgetPlanningService } from '../services/getBudgetPlanning.service';
import { GetConstantReferencesExecutionService } from '../services/getConstantReferencesExecution.service';
import { GetAllParentsTypesFinancingService } from '../services/getAllParentsTypesFinancing.service';

import { GetSummaryOfBudgetValidityService } from '../services/getSummaryOfBudgetValidity.service';
import { CreateOrUpdateStatusBudgetValidityService } from '../services/createOrUpdateStatusBudgetValidityService';

const getBudgetPlanningService = new GetBudgetPlanningService();
const getConstantReferencesExecutionService = new GetConstantReferencesExecutionService();
const getAllParentsTypesFinancingService = new GetAllParentsTypesFinancingService();

const getSummaryOfBudgetValidityService = new GetSummaryOfBudgetValidityService();
const createOrUpdateStatusBudgetValidityService = new CreateOrUpdateStatusBudgetValidityService();

//const getFinancingClassificationSystemService = new GetFinancingClassificationSystemService();
export default defineComponent({
  components: {
    AppButton,
    AppLoading,
    AppPulseLoading,
    AppBaseList,
    //AppCard,
    AppButtonBack,
    AppButtonEdit,
    AppModal,
    //Column,
    //AppAutocomplete,
    AppDropdown,
    InitialBudgetIncomeExecutionForm,
    AdditionalOrReductionExecutionForm,
    AmountMonthExecutionForm,
  },
  name: 'incomeExecutionDetailsPage',
  setup() {
    const { n } = useI18n();
    const title = 'Ejecución de ingresos';
    const routes = [
      {
        name: title,
      },
    ];
    useMeta({
      title,
    });
    const route = useRoute();
    const loading = ref(true);
    const loadingStatus = ref(false);
    const dataBudgetPlanning = ref<any>([]);
    const isEditing = ref(false);
    const financingSystemId = parseInt(route.params.accountingSystemId as string);
    const sizeOptions = ['S', 'M', 'L'];
    const currentSize = ref('M');
    const selectedPeriods = ref<any>([]);
    const initialBudgetModal = ref(false);
    const currentInitialBudget = ref();
    const additionalOrReductionModal = ref(false);
    const currentAdditionalOrReduction = ref();
    const currentDetailAddOrRed = ref();
    const entityAdditionalOrReduction = ref();
    const amountMonthFormModal = ref(false);
    const currentAmountMonthForm = ref();
    const currentDetailPeriod = ref();
    const currentDetailAmountMonth = ref();
    const dataBudgetValidity = ref<any>(null);
    const statusChips = ref<{ name: string; color: string }[]>([]);

    const periodOptions = computed(() => {
      const allPeriods = dataBudgetPlanning.value?.[0]?.budgetPlanningPeriods || [];
      return allPeriods.map((period: any) => period);
    });
    // Computed para filtrar los períodos seleccionados
    const filteredPeriods = computed(() => {
      const allPeriods = dataBudgetPlanning.value?.[0]?.budgetPlanningPeriods || [];
      return allPeriods.filter((period: any) => selectedPeriods.value.includes(period.numberPeriod));
    });

    onMounted(async () => {
      await getData();
      loading.value = false;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Presupuesto', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      const allPeriods = dataBudgetPlanning.value?.[0]?.budgetPlanningPeriods || [];
      selectedPeriods.value = allPeriods.map((period: any) => period.numberPeriod);
    });
    const getData = async () => {
      try {
        const income = ref<any>([]);
        const filterSources = await getConstantReferencesExecutionService.run();
        const parentsAll = await getAllParentsTypesFinancingService.run(financingSystemId);
        //Obtener el label del id = 1 - income, en filterSources
        const labelForId1 = filterSources.find((item: any) => item.id === 1)?.label;
        if (labelForId1) {
          //Filtrar parentsAll con el label obtenido
          income.value = parentsAll.filter((parent: any) => parent.reference === labelForId1);
        } else {
          console.error('No label found for id = 1 in filterSources.');
        }
        const params = {
          standardizedAccountingSystemId: financingSystemId,
          typeFinancingSourceId: income.value?.[0]?.id,
        };
        dataBudgetPlanning.value = await getBudgetPlanningService.run(params);

        await getDataBudgetValidity();
      } catch (e) {
        console.log(e);
      }
    };

    const getDataBudgetValidity = async () => {
      try {
        const paramsBudgetValidity = {
          budgetValidateId: dataBudgetPlanning.value[0]?.budgetValidityId,
        };
        dataBudgetValidity.value = await getSummaryOfBudgetValidityService.run(paramsBudgetValidity);

        // Filtrar estados activos y asignar colores
        statusChips.value = dataBudgetValidity.value[0]?.statusBudgetValidatesDate
          ?.filter((item: any) => item.isActive === 1) // Filtrar solo estados activos
          ?.map((item: any) => {
            const status = item.statusBudgetValidates[0];
            let color = '';

            switch (status.type) {
              case 1:
                color = 'type-green'; // Verde
                break;
              case 2:
                color = 'type-yellow'; // Amarillo
                break;
              case 3:
                color = 'type-red'; // Rojo
                break;
              default:
                color = ''; // Sin color
            }

            return { name: status.name, color };
          });
      } catch (e) {
        console.log(e);
      }
    };
    /* const redirectView = async (systemId: number) => {
      await router.push({
        name: 'budget.typesFinancingSources',
        params: {
          financingSystemId: systemId,
        },
      });
    };*/

    const changeTableSize = (size: any) => {
      currentSize.value = size;
    };
    const toggleActive = async (item: any) => {
      // Cambiar el estado de `isActive`
      loadingStatus.value = true;
      item.isActive = item.isActive === 1 ? 0 : 1;

      console.log('Actualizando estado:', item.isActive);

      // Crear payload para el servicio
      const dataSend = {
        statusId: item.statusId,
        budgetValidityId: item.budgetValidityId,
        isActive: item.isActive,
      };

      console.log('Enviando datos al servicio:', dataSend);

      try {
        await createOrUpdateStatusBudgetValidityService.run(dataSend, item.id);
        await getDataBudgetValidity();
        console.log('Estado actualizado con éxito');
      } catch (error) {
        console.error('Error al actualizar el estado:', error);
      }
      loadingStatus.value = false;
    };
    const enableEditing = () => {
      isEditing.value = true;
    };

    const disableEditing = () => {
      isEditing.value = false;
    };
    const openInitialBudgetForm = (data: any) => {
      currentInitialBudget.value = data;
      initialBudgetModal.value = true;
    };
    const closeInitialBudgetForm = () => {
      currentInitialBudget.value = null;
      initialBudgetModal.value = false;
      getData();
    };
    const openAdditionalOrReductionForm = (data: any, detailData: any, entity: string) => {
      currentAdditionalOrReduction.value = data;
      currentDetailAddOrRed.value = detailData;
      entityAdditionalOrReduction.value = entity;
      additionalOrReductionModal.value = true;
    };
    const closeAdditionalOrReductionForm = () => {
      currentAdditionalOrReduction.value = null;
      additionalOrReductionModal.value = false;
      getData();
    };
    const openAmountMonthForm = (data: any, detailPeriod: any, detailData: any) => {
      currentAmountMonthForm.value = data;
      currentDetailPeriod.value = detailPeriod;
      currentDetailAmountMonth.value = detailData;
      amountMonthFormModal.value = true;
    };
    const closeAmountMonthForm = () => {
      currentAmountMonthForm.value = null;
      amountMonthFormModal.value = false;
      getData();
    };

    return {
      title,
      routes,
      loading,
      n,
      dataBudgetPlanning,
      //redirectView,
      isEditing,
      enableEditing,
      disableEditing,

      sizeOptions,
      changeTableSize,
      currentSize,
      filteredPeriods,
      selectedPeriods,
      periodOptions,

      initialBudgetModal,
      currentInitialBudget,
      openInitialBudgetForm,
      closeInitialBudgetForm,

      additionalOrReductionModal,
      currentAdditionalOrReduction,
      currentDetailAddOrRed,
      entityAdditionalOrReduction,
      openAdditionalOrReductionForm,
      closeAdditionalOrReductionForm,

      amountMonthFormModal,
      currentAmountMonthForm,
      currentDetailPeriod,
      currentDetailAmountMonth,
      openAmountMonthForm,
      closeAmountMonthForm,
      dataBudgetValidity,
      toggleActive,
      statusChips,
      loadingStatus,
    };
  },
});
</script>
<style scoped>
.table-responsive {
  max-height: 80vh;
}
.table {
  border-radius: 14px;
  font-family: 'Arial', sans-serif;
  background-color: white;
}
/* Hover en filas */
.table tbody tr:hover {
  background-color: #f7f7f7;
}
.table > :not(:first-child) {
  border-top: 2px solid #dbdbdb;
}
.table thead th {
  align-content: center;
  text-align: center;
}
.table tbody td {
  align-content: center;
}
.static-colum {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 100px;
}
.s-colum-1 {
  left: 99px;
  min-width: 100px;
}
.s-colum-2 {
  left: 198px;
  min-width: 150px;
}
.s-colum-3 {
  left: 347px;
  min-width: 100px;
}
/* Primera fila del thead */
table thead tr:nth-child(1) {
  position: sticky;
  top: 0px;
  background: #fff;
  z-index: 2;
}

/* Segunda fila del thead */
table thead tr:nth-child(2) {
  position: sticky;
  top: 40px;
  background: #fff;
  z-index: 2;
}
input {
  background: transparent;
}
.form-control {
  padding: 0.2rem 0.25rem;
  width: auto;
  text-align: center;
}
/** Revisar ccs new */
.table-size-control {
  text-align: center;
  margin-bottom: 1rem;
}
.filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.slider {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 0.4rem 0.5rem;
  position: relative;
  width: fit-content;
}

.slider button {
  background-color: transparent;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  transition: color 0.3s ease;
  border-radius: 10px;
}
.slider button:hover {
  background-color: #eaeaea;
  color: var(--color-primary);
}

.slider button.active {
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, color 0.3s ease;
}
.size-s {
  font-size: small;
}

.size-m {
  font-size: medium;
}

.size-l {
  font-size: larger;
}
.under__line {
  display: flex;
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
  align-items: center;
  justify-content: space-between;
}
.under__line::first-letter {
  text-transform: uppercase;
}
.content-header {
  display: flex;
  align-items: center;
  gap: 5px;
}
.content-edit {
  display: flex;
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /*Centra verticalmente */
}
.content-value {
  flex-grow: 1; /*Ocupar el espacio disponible */
  margin-left: 32px; /*margin de igual tamaño */
}
.content-edit .btn-edit {
  margin-left: 4px;
  width: 32px; /*tamaño del boton edit*/
}

.type-chip {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-align: center;
}

.type-green {
  background-color: #4caf50; /* Verde */
}

.type-yellow {
  background-color: #ffc107; /* Amarillo */
}

.type-red {
  background-color: #f44336; /* Rojo */
}

@media (max-width: 768px) {
  .static-colum {
    left: auto;
    z-index: 1;
    min-width: auto;
  }
  .s-colum-1 {
    left: auto;
    min-width: auto;
  }
  .s-colum-2 {
    left: auto;
    min-width: auto;
  }
  .s-colum-3 {
    left: auto;
    min-width: auto;
  }
}
</style>
