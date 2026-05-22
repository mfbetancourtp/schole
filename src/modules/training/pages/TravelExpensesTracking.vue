<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template v-slot:content>
      <AppEmptyResponse v-if="!periodsNames.length" :show-image="true" subtitle="Sin periodo de planeacion asignado"> </AppEmptyResponse>
      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="periodsNamesId" :filter-name="'TravelExpensesTracking.periodsNamesId'">
              <label>Selecciona el periodo de planeación</label>
              <AppAutocomplete :options="periodsNames" label="title" v-model="periodsNamesId"></AppAutocomplete>
            </AppFilter>
          </div>
        </div>
        <AppEmptyResponse v-if="!dataTravel.length" :show-image="true" subtitle="Sin viaticos asignados"> </AppEmptyResponse>
        <template v-else>
          <div class="d-flex gap-1 justify-content-end">
            <span style="font-weight: 500">Ciudad de realización:</span>
            <span>{{ meetingMunicipality }}</span>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Empleado</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Origen</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Transporte</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Valor Ida</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Valor Regreso</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Hospedaje</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Estancia</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Total</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">A.Empleado</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">A.Empresa</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Total Real</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Evidencia</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in dataTravel" :key="index">
                <td class="p-1 pe-0 w-3">
                  <span style="font-size: 0.8rem">{{ item.employee }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ item.nameOriginMunicipality }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ item.transportType }}</span>
                </td>

                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem"> {{ n(item.departureValue, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem"> {{ n(item.returnValue, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem"> {{ n(item.hotelUnitValue, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem"> {{ item.numberDays }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem"> {{ n(item.total, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem"> {{ n(item.employeeContribution, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem"> {{ n(item.companyContribution, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0" style="width: 10%">
                  <input class="form-control form-control-sm p-1" @change="saveinputs(item)" type="number" v-model="item.finalCompanyContribution" />
                </td>
                <td>
                  <AppUpload v-if="!item.urlConsolidateEvidence" v-model="file" @update:model-value="(file: any) => getFile(item.id, file)"></AppUpload>
                  <AppButton v-else @click="openViewEvidencieModal(item)" v-tooltip="'Ver evidencia'" variant="primary" icon="eye"></AppButton>
                </td>
              </tr>
            </tbody>
          </table>
          <AppModal v-model="viewEvidencieModal" :size="'xl'">
            <ViewEvidencieModal v-if="viewEvidencieModal" :urlFile="currentEvidence.urlConsolidateEvidence" title-modal="Evidencia Viaticos" @delete="deleteFile"> </ViewEvidencieModal>
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
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppUpload from '../../../shared/components/Forms/AppUpload.vue';
import ViewEvidencieModal from '../components/ViewEvidencieModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';

import { TravelExpensesTrackingDto } from '../dtos/travelExpensesTracking.dto';

import { GetAllPeriodsWithPaginationService } from '../services/getAllPeriodsWithPagination.service';
import { GetTravelExpensesByCourseIdService } from '../services/getTravelExpensesByCourseId.service';
import { UpdateTravelExpensesService } from '../services/createOrUpdateTravelExpensesByParams.service';
import { LoadEvidenceTravelExpensesService } from '../services/loadEvidenceTravelExpenses.service';
import { DeleteEvidenceTravelExpensesService } from '../services/deleteEvidenceTravelExpenses.service';

const getAllPeriodsWithPaginationService = new GetAllPeriodsWithPaginationService();
const getTravelExpensesByCourseIdService = new GetTravelExpensesByCourseIdService();
const updateTravelExpensesService = new UpdateTravelExpensesService();
const loadEvidenceTravelExpensesService = new LoadEvidenceTravelExpensesService();
const deleteEvidenceTravelExpensesService = new DeleteEvidenceTravelExpensesService();

export default defineComponent({
  name: 'GeneralBudget',
  components: {
    AppBaseList,
    AppLoading,
    AppFilter,
    AppAutocomplete,
    AppEmptyResponse,
    AppUpload,
    ViewEvidencieModal,
    AppButton,
    AppModal,
  },

  setup() {
    const { t, n } = useI18n();
    const route = useRoute();
    const title = 'Evidencia de viaticos';

    const periodsNames = ref();
    const meetingMunicipality: Ref<string> = ref('');
    const dataTravel = ref<any[]>([]);
    const travel: Ref<TravelExpensesTrackingDto[]> = ref([]);

    const periodsNamesId = ref(null);
    const planningWeekId = ref();

    const courseId = parseInt(route.params.courseId.toString(), 10);

    const loadingData = ref(false);
    const loading = ref(true);
    const file: Ref<any> = ref(null);
    const viewEvidencieModal = ref(false);
    const currentEvidence = ref();

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
        meetingMunicipality.value = response.meetingMunicipality;

        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['TravelExpensesTracking.periodsNamesId']) {
          if (periodsNames.value.length) {
            for (let i = 0; i < periodsNames.value.length; i++) {
              if (localfilters['TravelExpensesTracking.periodsNamesId'] == periodsNames.value[i].id) {
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

    watch(periodsNamesId, async () => {
      await getdata();
    });

    const searchPeriods = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);
        const response = await getPeriodsNames(search);
        periodsNames.value = response.data;
        meetingMunicipality.value = response.meetingMunicipality;
        loading(false);
      }
    }, 800);

    const getPeriodsNames = (search?: string) => {
      return getAllPeriodsWithPaginationService.run({ search }, courseId);
    };

    const getdata = async () => {
      loadingData.value = true;
      console.log('data2', periodsNamesId.value);
      dataTravel.value = await getTravelExpensesByCourseIdService.run(courseId, periodsNamesId.value);
      console.log('travel', dataTravel.value);
      loadingData.value = false;
    };

    const saveinputs = async (item: TravelExpensesTrackingDto) => {
      console.log('numero', item);
      let dataSend = {
        finalCompanyContribution: item.finalCompanyContribution,
      };

      await updateTravelExpensesService.run(dataSend, item.id);
    };

    const getFile = async (travelExpenses: number, file: any) => {
      let fileSend: any = { files: file };
      await loadEvidenceTravelExpensesService.run(fileSend, travelExpenses);
      await getdata();
    };

    const openViewEvidencieModal = async (data: any) => {
      console.log('datos', data);
      currentEvidence.value = data;
      viewEvidencieModal.value = true;
    };

    const deleteFile = async () => {
      await deleteEvidenceTravelExpensesService.run(currentEvidence.value.id);
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
      meetingMunicipality,
      planningWeekId,
      loadingData,
      dataTravel,
      searchPeriods,
      travel,
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
