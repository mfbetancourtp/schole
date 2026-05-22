<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'training.courseSchedule' }"></AppButtonBack>

      <AppButton style="color: white;" label="core.save" @click="save"></AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <section>
          <div class="d-flex gap-1 justify-content-end">
            <span style="font-weight: 500">Ciudad de realización:</span>
            <span>{{ meetingMunicipality }}</span>
          </div>

          <div class="d-flex gap-1 justify-content-end">
            <span style="font-weight: 500">Días de estancia:</span>
            <span>{{ daysOfStay }}</span>
          </div>
        </section>

        <hr />

        <!-- <div class="scroll-container"> -->
        <table class="table">
          <thead>
            <tr>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Empleado</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Origen</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Transporte</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Valor ida</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Valor regreso</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Hospedaje</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Hospedaje Total</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0 text-center">Total</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">A. Empleado</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">A. Empresa</th>
              <th style="font-size: 0.8rem" class="p-1 pe-0">Autorizado</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in travelExpenses" :key="index">
              <td class="p-1 pe-0 w-3">
                <span style="font-size: 0.8rem">{{ item.userNames }}</span>
              </td>

              <td class="p-1 pe-0 w-2">
                <span style="font-size: 0.8rem">{{ item.homeMunicipality }}</span>
              </td>

              <td class="p-1 pe-0 w-2">
                <AppAutocomplete style="font-size: 0.8rem" v-model="item.transportType" :options="transportTypes" label="label"></AppAutocomplete>
              </td>

              <td class="p-1 pe-0 w-1">
                <input class="form-control form-control-sm p-1" type="number" v-model="item.departureValue" />
              </td>

              <td class="p-1 pe-0 w-1">
                <input class="form-control form-control-sm p-1" type="number" v-model="item.returnValue" />
              </td>

              <td class="p-1 pe-0 w-1">
                <input class="form-control form-control-sm p-1" type="number" v-model="item.hotelUnitValue" />
              </td>

              <td class="p-1 pe-0" style="width: 15%">
                <div class="form-control form-control-sm p-1" type="number">
                  {{ n(getTotalHotel(item.hotelUnitValue, index)) }}
                </div>
              </td>
              <td class="p-1 pe-0 text-center w-1">
                <span style="font-size: 0.8rem">{{ n(getTotal(item.departureValue, item.returnValue, item.hotelUnitValue, daysOfStay, index), 'currency') }}</span>
              </td>

              <td class="p-1 pe-0 w-1">
                <input class="form-control form-control-sm p-1" type="number" v-model="item.employeeContribution" />
              </td>

              <td class="p-1 pe-0 w-1">
                <input class="form-control form-control-sm p-1" type="number" v-model="item.companyContribution" />
              </td>

              <td class="p-1 pe-0 text-center w-1-1">
                <input class="form-check-input" type="checkbox" v-model="item.isApproved" />
              </td>
            </tr>
          </tbody>
        </table>
        <!-- </div> -->
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetTravelExpensesService } from '../services/getTravelExpenses.service';
import { CreateOrUpdateTravelExpensesService } from '../services/createOrUpdateTravelExpenses.service';
import { GetTravelExpensesTransportTypesService } from '../services/getTravelExpensesTransportTypes.service';
import { useHeaderStore } from '../../../stores/header.store';

const getTravelExpensesTransportTypesService = new GetTravelExpensesTransportTypesService();
const createOrUpdateTravelExpensesService = new CreateOrUpdateTravelExpensesService();
const getTravelExpensesService = new GetTravelExpensesService();

export default defineComponent({
  name: 'CourseScheduleTravelExpenses',
  components: {
    AppAutocomplete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
  },
  setup() {
    const { t, n } = useI18n();
    const route = useRoute();
    const title = 'Administración de costos de viaje';
    const courseId = parseInt(route.params.courseId as string, 10);

    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'training.courseSchedule' },
      },
      {
        name: title,
      },
    ];

    const meetingMunicipalityId: Ref<number | null> = ref(null);
    const meetingMunicipality: Ref<string> = ref('');
    const departureDate: Ref<string> = ref('');
    const transportTypes: Ref<any[]> = ref([]);
    const travelExpenses: Ref<any[]> = ref([]);
    const returnDate: Ref<string> = ref('');
    const daysOfStay: Ref<number> = ref(0);

    const loading = ref(true);
    onMounted(async () => {
      try {
        transportTypes.value = await getTravelExpensesTransportTypesService.run();
        const response = await getTravelExpensesService.run(courseId);

        meetingMunicipalityId.value = response.meetingMunicipalityId;
        meetingMunicipality.value = response.meetingMunicipality;
        daysOfStay.value = response.diferenceDate.daysOfStay;
        travelExpenses.value = response.travelExpenses;
        departureDate.value = response.departureDate;
        returnDate.value = response.returnDate;

        travelExpenses.value.forEach((travelExpense) => (travelExpense.isApproved = travelExpense.isApproved ? true : false));
        transportTypes.value.forEach((transportType) => (transportType.id = transportType.label));

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Capacitación', url: '' };
        headerStorage.moduleItem = { name: 'Cronograma de cursos', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getTotal = (departureValue: number, returnValue: number, hotelUnitValue: number, daysOfStay: number, index: number) => {
      let total = 0;
      if (departureValue) total += departureValue;
      if (hotelUnitValue) total += hotelUnitValue * daysOfStay;
      if (returnValue) total += returnValue;
      travelExpenses.value[index].total = total;
      return total;
    };

    const getTotalHotel = (hotelUnitValue: number, index: number) => {
      let total = hotelUnitValue * daysOfStay.value;
      travelExpenses.value[index].hotelTotalValue = total;
      return total;
    };
    const save = async () => {
      const dataSend: any[] = [];

      for (let i = 0; i < travelExpenses.value.length; i++) {
        dataSend.push({
          id: travelExpenses.value[i].id,
          courseInscriptionId: travelExpenses.value[i].courseInscriptionId,
          departureDate: departureDate.value,
          originMunicipalityId: travelExpenses.value[i].homeMunicipalityId,
          destinationMunicipalityId: meetingMunicipalityId.value,
          returnDate: returnDate.value,
          departureValue: travelExpenses.value[i].departureValue,
          returnValue: travelExpenses.value[i].returnValue,
          isApproved: travelExpenses.value[i].isApproved ? 1 : 0,
          transportType: travelExpenses.value[i].transportType,
          employeeContribution: travelExpenses.value[i].employeeContribution,
          companyContribution: travelExpenses.value[i].companyContribution,
          hotelUnitValue: travelExpenses.value[i].hotelUnitValue,
          total: travelExpenses.value[i].total,
        });
      }
      await createOrUpdateTravelExpensesService.run(dataSend);
    };

    return {
      loading,
      routes,
      title,
      save,
      t,
      n,

      meetingMunicipality,
      transportTypes,
      travelExpenses,
      daysOfStay,

      getTotal,
      getTotalHotel,
    };
  },
});
</script>

<style scoped>
/* .scroll-container {
  max-width: 72rem;
  overflow-x: scroll;
  margin: 0 auto;
} */

.w-1-1 {
  min-width: 5rem;
}
.w-1 {
  min-width: 7rem;
}
.w-2 {
  min-width: 10rem;
}
.w-3 {
  min-width: 15rem;
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
