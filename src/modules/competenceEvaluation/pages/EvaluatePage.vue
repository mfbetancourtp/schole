<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <AppEmptyResponse v-if="!academicPeriods.length" :show-image="true" title="Sin vigencias configuradas" :subtitle="false"></AppEmptyResponse>

        <template v-else>
          <div class="d-flex flex-row-reverse">
            <div class="w-25">
              <AppFilter v-model="academicPeriodId" :filter-name="'evaluatePage.academicPeriodId'">
                <label>Vigencia</label>
                <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"></AppAutocomplete>
              </AppFilter>
            </div>
          </div>

          <AppLoading v-if="loadingEvaluations"></AppLoading>

          <template v-else>
            <AppEmptyResponse v-if="!corporateEvaluations.length" :show-image="true" :subtitle="false"></AppEmptyResponse>

            <div v-else class="grid-cards">
              <AppCard v-for="(evaluation, index) in corporateEvaluations" :key="index">
                <template #body>
                  <div class="text-muted d-flex gap-1 justify-content-end" style="font-size: 0.95rem">
                    <span>Fecha límite:</span>

                    <span>{{ dayjs(evaluation.corporateEvaluationPeriod.endDate).format('D MMM YYYY') }}</span>
                  </div>

                  <h5 class="m-0">
                    {{ evaluation.corporateEvaluationPeriod.name }}
                  </h5>

                  <hr />

                  <h6 class="m-0">Persona evaluada:</h6>

                  <div class="d-flex align-items-center" style="color: #6c757d">
                    <AppIcon class="icon-size-8 m-1" icon="user" v-tooltip="'Nombre y Apellidos'"></AppIcon>

                    <p class="m-0 ms-1" style="font-size: 0.9rem">
                      {{ `${evaluation.peopleEvaluated.names} ${evaluation.peopleEvaluated.lastnames}` }}
                    </p>
                  </div>
                  <div class="d-flex align-items-center" style="color: #6c757d">
                    <AppIcon class="icon-size-8 m-1" icon="address-card" v-tooltip="'Cargo'"></AppIcon>

                    <p class="m-0" style="font-size: 0.9rem">
                      {{ evaluation.jobNamePosition }}
                    </p>
                  </div>

                  <div class="mt-2 d-flex justify-content-between">
                    <p class="m-0">Competencias evaluadas</p>

                    <span class="badge rounded-pill text-bg-primary bg-primary"> {{ evaluation.quantityEvaluatedCompetences }}/{{ evaluation.quantitySectionsSurvey }} </span>
                  </div>
                </template>

                <template #footer>
                  <div class="d-flex justify-content-end">
                    <template v-if="!evaluation.quantityEvaluatedCompetences">
                      <AppButton v-tooltip="'Iniciar evaluación'" icon="newspaper" outlined></AppButton>
                    </template>

                    <AppButton v-else v-tooltip="'Continuar evaluación'" icon="newspaper" outlined></AppButton>
                  </div>
                </template>
              </AppCard>
            </div>
          </template>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { AcademicPeriodDto } from '../dtos/configureEvaluations.dto';

import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetCorporateEvaluationsService } from '../services/getCorporateEvaluations.service';
import { useHeaderStore } from '../../../stores/header.store';

const getCorporateEvaluationsService = new GetCorporateEvaluationsService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();

export default defineComponent({
  name: 'EvaluatePage',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppBaseList,
    AppLoading,
    AppFilter,
    AppButton,
    AppCard,
    AppIcon,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Realizar evaluaciones';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const corporateEvaluations: Ref<any[]> = ref([]);

    const academicPeriodId = ref();

    const loadingEvaluations = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        academicPeriods.value = await getAcademicPeriodsService.run();

        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['evaluatePage.academicPeriodId']) {
          if (academicPeriods.value.length) {
            academicPeriods.value.forEach((academicPeriod) => {
              if (localfilters['evaluatePage.academicPeriodId'] == academicPeriod.id) {
                academicPeriodId.value = academicPeriod.id;
              }
            });
          }
        } else {
          if (academicPeriods.value.length) academicPeriodId.value = academicPeriods.value[0].id;
        }

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Evaluación de Desempeño', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(academicPeriodId, async () => {
      await getCorporateEvaluations();
    });

    const getCorporateEvaluations = async () => {
      loadingEvaluations.value = true;

      if (academicPeriodId.value >= 0) {
        corporateEvaluations.value = await getCorporateEvaluationsService.run(academicPeriodId.value as number);
      }

      loadingEvaluations.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      corporateEvaluations,
      loadingEvaluations,
      academicPeriodId,
      academicPeriods,

      dayjs,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
</style>
