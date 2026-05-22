<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template #content>
      <AppEmptyResponse v-if="!periodsNames.length" :show-image="true" subtitle="Sin periodo de planeacion asignado"> </AppEmptyResponse>
      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="periodsNamesId" :filter-name="'BudgetTracking.periodsNamesId'">
              <label>Selecciona el periodo de planeación</label>
              <AppAutocomplete :options="periodsNames" label="title" v-model="periodsNamesId"></AppAutocomplete>
            </AppFilter>
          </div>
        </div>
        <AppEmptyResponse v-if="!dataBudget.length" :show-image="true" subtitle="Sin presupuesto asignado"> </AppEmptyResponse>
        <template v-else>
          <table class="table">
            <thead>
              <tr>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Fecha</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Concepto-Detalle</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">V.Unitario (Cantidad)</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Subtotal</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Cantidad</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">V.Unitario</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0 text-center">Subtotal</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Evidencia</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in dataBudget" :key="index">
                <td class="p-1 pe-0 w-3">
                  <span style="font-size: 0.8rem">{{ item.requiredDate }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ item.budgetCategoriesName }} - {{ item.description }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ n(item.budgetUnitValue, 'currency') }} (x{{ item.budgetAmount }})</span>
                </td>

                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem">{{ n(item.budgetTotalValue, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0" style="width: 5%">
                  <input class="form-control form-control-sm p-1" @change="saveinputs(item)" type="number" v-model="item.finalAmount" />
                </td>

                <td class="p-1 pe-0" style="width: 10%">
                  <input class="form-control form-control-sm p-1" @change="saveinputs(item)" type="number" v-model="item.finalUnitValue" />
                </td>
                <td class="p-1 pe-0" style="width: 15%">
                  <div class="form-control form-control-sm p-1" @change="saveinputs(item)" type="number">
                    {{ item.finalAmount * item.finalUnitValue }}
                  </div>
                </td>
                <td>
                  <AppUpload v-if="!item.urlConsolidateEvidence" v-model="file" @update:model-value="(file: any) => getFile(item.id, file)"></AppUpload>
                  <AppButton v-else @click="openViewEvidencieModal(item)" v-tooltip="'Ver evidencia'" variant="primary" icon="eye"></AppButton>
                </td>
              </tr>
            </tbody>
          </table>
          <AppModal v-model="viewEvidencieModal" :size="'xl'">
            <ViewEvidencieModal v-if="viewEvidencieModal" :urlFile="currentEvidence.urlConsolidateEvidence" title-modal="Evidencia Presupuestos" @delete="deleteFile"> </ViewEvidencieModal>
          </AppModal>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { debounce } from 'ts-debounce';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import ViewEvidencieModal from '../components/ViewEvidencieModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppUpload from '../../../shared/components/Forms/AppUpload.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetAllPeriodsWithPaginationService } from '../services/getAllPeriodsWithPagination.service';
import { GetPlanningWeekByCourseIdService } from '../services/getPlanningWeekByCourseId.service';
import { UpdatePlanningWeekBudgetsByParamsService } from '../services/createOrUpdatePlanningWeekBudgetsByParams.service';
import { PlanningWeekDto } from '../dtos/budgetTracking.dto';
import { LoadEvidenceService } from '../services/loadEvidence.service';
import { DeleteEvidenceBudgetService } from '../services/deleteEvidenceBudget.service';

const getAllPeriodsWithPaginationService = new GetAllPeriodsWithPaginationService();
const getPlanningWeekByCourseIdService = new GetPlanningWeekByCourseIdService();
const updatePlanningWeekBudgetsByParamsService = new UpdatePlanningWeekBudgetsByParamsService();
const loadEvidenceService = new LoadEvidenceService();
const deleteEvidenceBudgetService = new DeleteEvidenceBudgetService();

export default defineComponent({
  name: 'GeneralBudget',
  components: {
    AppBaseList,
    AppLoading,
    AppFilter,
    AppAutocomplete,
    AppEmptyResponse,
    AppUpload,
    AppButton,
    ViewEvidencieModal,
    AppModal,
  },

  setup() {
    const { t, n } = useI18n();
    const route = useRoute();
    const title = 'Evidencia de presupuesto';

    const periodsNames = ref();
    const dataBudget = ref<any[]>([]);
    const budgets: Ref<PlanningWeekDto[]> = ref([]);

    const periodsNamesId = ref(null);
    const planningWeekId = ref();
    const viewEvidencieModal = ref(false);
    const currentEvidence = ref();

    const courseId = parseInt(route.params.courseId.toString(), 10);

    const loadingData = ref(false);
    const loading = ref(true);
    const file: Ref<any> = ref(null);

    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Seguimiento',
        url: { name: 'training.courseTracking' },
      },
      {
        name: title,
      },
    ];

    onMounted(async () => {
      try {
        let response = await getAllPeriodsWithPaginationService.run({ perPage: 100 }, courseId);
        periodsNames.value = response.data;

        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['BudgetTracking.periodsNamesId']) {
          if (periodsNames.value.length) {
            for (let i = 0; i < periodsNames.value.length; i++) {
              if (localfilters['BudgetTracking.periodsNamesId'] == periodsNames.value[i].id) {
                periodsNamesId.value = await periodsNames.value[i].id;
              }
            }
          }
        } else {
          if (periodsNames.value.length) periodsNamesId.value = await periodsNames.value[0].id;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(periodsNamesId, async (valor) => {
      await getdata();
      console.log('prueba', valor);
    });

    const searchPeriods = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);
        const response = await getPeriodsNames(search);
        periodsNames.value = response.data;
        loading(false);
      }
    }, 800);

    const getPeriodsNames = (search?: string) => {
      return getAllPeriodsWithPaginationService.run({ search }, courseId);
    };

    const getdata = async () => {
      loadingData.value = true;
      console.log('data2', periodsNames.value);
      dataBudget.value = await getPlanningWeekByCourseIdService.run(courseId, periodsNamesId.value);
      loadingData.value = false;
    };

    const saveinputs = async (item: PlanningWeekDto) => {
      console.log('numero', item);
      let dataSend = {
        finalAmount: item.finalAmount,
        finalUnitValue: item.finalUnitValue,
        finalTotalValue: item?.finalAmount * item?.finalUnitValue,
      };

      await updatePlanningWeekBudgetsByParamsService.run(dataSend, item.id);
    };

    const getFile = async (planningWeekBudgetsId: number, file: any) => {
      let fileSend: any = { files: file };
      await loadEvidenceService.run(fileSend, planningWeekBudgetsId);
      await getdata();
    };
    const openViewEvidencieModal = async (data: any) => {
      console.log('datos', data);
      currentEvidence.value = data;
      viewEvidencieModal.value = true;
    };

    const deleteFile = async () => {
      await deleteEvidenceBudgetService.run(currentEvidence.value.id);
      viewEvidencieModal.value = false;
      await getdata();
    };

    return {
      loading,
      routes,
      title,
      t,
      n,

      periodsNamesId,
      periodsNames,
      planningWeekId,
      loadingData,
      dataBudget,
      searchPeriods,
      budgets,
      saveinputs,
      getFile,
      file,
      viewEvidencieModal,
      openViewEvidencieModal,
      currentEvidence,
      deleteFile,
    };
  },
});
</script>

<style scoped>
.icon_Container {
  align-content: flex-start;
  display: block;
}

.table td {
  vertical-align: middle;
  text-align: center;
}

.table tr {
  vertical-align: middle;
  text-align: center;
}
</style>
