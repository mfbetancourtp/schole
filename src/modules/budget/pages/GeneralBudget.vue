<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template #actions>
      <AppButton style="color: white;" label="core.save" @click="save()"></AppButton>
    </template>

    <template v-slot:content>
      <AppEmptyResponse v-if="!academicPeriods.length" :show-image="true" title="Sin vigencias configuradas" :subtitle="false"></AppEmptyResponse>

      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="academicPeriodId" :filter-name="'courseSchedule.academicPeriodId'">
              <label>Vigencia</label>
              <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"></AppAutocomplete>
            </AppFilter>
          </div>
        </div>

        <AppLoading v-if="loadingData"></AppLoading>
        <template v-else>
          <AppCard>
            <template #body>
              <table class="table">
                <thead>
                  <th class="col-4">Rubro</th>
                  <th>Coordinador</th>
                  <th class="col-2">Valor</th>
                </thead>

                <tbody>
                  <tr v-for="(item, index) in data" :key="index">
                    <td>{{ item.headings }}</td>
                    <td>
                      <AppAutocomplete v-model="item.supervisorUserId" :options="users" label="supervisorUser"></AppAutocomplete>
                    </td>
                    <td>
                      <input class="form-control" type="number" v-model="item.value" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
          </AppCard>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetBudgetLinesService } from '../services/getBudgetLines.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetAllPeopleByUsersService } from '../services/getAllPeopleByUsers.service';
import { GetAcademicPeriodBudgetsService } from '../services/getAcademicPeriodBudgets.service';
import { CreateOrUpdateAcademicPeriodBudgetsService } from '../services/createOrUpdateAcademicPeriodBudgets.service';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateAcademicPeriodBudgetsService = new CreateOrUpdateAcademicPeriodBudgetsService();
const getAcademicPeriodBudgetsService = new GetAcademicPeriodBudgetsService();
const getAllPeopleByUsersService = new GetAllPeopleByUsersService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const getBudgetLinesService = new GetBudgetLinesService();

export default defineComponent({
  name: 'GeneralBudget',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Rubros presupuestales';

    const academicPeriods: Ref<any[]> = ref([]);
    const users: Ref<any[]> = ref([]);
    const data: Ref<any[]> = ref([]);

    const academicPeriodId = ref();

    const loadingData = ref(false);
    const loading = ref(true);

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    onMounted(async () => {
      try {
        academicPeriods.value = await getAcademicPeriodsService.run();

        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['GeneralBudget.academicPeriodId']) {
          if (academicPeriods.value.length) {
            for (let i = 0; i < academicPeriods.value.length; i++) {
              if (localfilters['GeneralBudget.academicPeriodId'] == academicPeriods.value[i].id) {
                academicPeriodId.value = await academicPeriods.value[i].id;
              }
            }
          }
        } else {
          if (academicPeriods.value.length) academicPeriodId.value = await academicPeriods.value[0].id;
        }

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Presupuestos', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(academicPeriodId, async () => {
      await getdata();
    });

    const getdata = async () => {
      loadingData.value = true;

      users.value = await getAllPeopleByUsersService.run();
      data.value = await getAcademicPeriodBudgetsService.run(academicPeriodId.value as number);

      loadingData.value = false;
    };

    const save = async () => {
      const budgetLines: any[] = await getBudgetLinesService.run();

      for (let i = 0; i < data.value.length; i++) {
        if (data.value[i].supervisorUserId && data.value[i].value) {
          const dataSend = {
            budgetLineId: await budgetLines.filter((item) => item.name == data.value[i].headings)[0].id,
            academicPeriodId: academicPeriodId.value,
            budgetValue: data.value[i].value,
            supervisorUserId: data.value[i].supervisorUserId,
          };

          await createOrUpdateAcademicPeriodBudgetsService.run(dataSend, data.value[i].id);
        }
      }

      await getdata();
    };

    return {
      loading,
      routes,
      title,
      t,

      academicPeriodId,
      academicPeriods,
      loadingData,
      users,
      data,

      save,
    };
  },
});
</script>

<style scoped></style>
