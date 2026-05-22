<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template v-slot:actions>
      <AppButtonBack v-if="!isStudent" :to="{ name: 'administration.homeTeacher' }"></AppButtonBack>
      <AppButtonBack v-else :to="{ name: 'administration.homeStudent' }"></AppButtonBack>

      <template v-if="dataSource && dataSource.url">
        <AppButton style="color: white" label="classroom.followUpToTopics.print" :href="dataSource.url" target="_blank"> </AppButton>
      </template>
    </template>

    <template v-slot:content>
      <TabsTeacher></TabsTeacher>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <section>
          <div class="form-row">
            <AppFormField>
              <div class="d-flex flex-column">
                <label>{{ t('classroom.followUpToTopics.takeWeeksOf') }}</label>
                <AppButtonGroup class="bg-white">
                  <AppButton label="classroom.followUpToTopics.classSessions" :outlined="type === 'sessions' ? false : true" @click="type = 'sessions'"></AppButton>

                  <AppButton label="classroom.followUpToTopics.activities" :outlined="type === 'activities' ? false : true" @click="type = 'activities'"></AppButton>
                </AppButtonGroup>
              </div>
            </AppFormField>

            <AppFormField>
              <div class="d-flex justify-content-between">
                <label>{{ t('core.generalTerms.academic.period.singular') }}</label>

                <div>
                  <span v-if="currentPeriod" style="font-size: 0.9rem">{{
                    `(${currentPeriod.startDate} -
                                      ${currentPeriod.endDate})`
                  }}</span>
                </div>
              </div>
              <AppAutocomplete class="bg-white" v-model="periodId" :options="periods" :clearable="false"> </AppAutocomplete>
            </AppFormField>

            <AppFormField :label="'core.time.since'">
              <input v-model="dateSince" type="date" class="form-control" />
              <span v-if="startDateOutOfRange" class="text-danger" style="font-size: 0.9rem">Fecha fuera del rango</span>
            </AppFormField>

            <AppFormField :label="'core.time.until'">
              <input v-model="dateUntil" type="date" class="form-control" />
              <span v-if="invalidDate" class="text-danger">{{ t('Fecha no valida') }}</span>
              <span v-else-if="endDateOutOfRange" class="text-danger" style="font-size: 0.9rem">Fecha fuera del rango</span>
            </AppFormField>
          </div>

          <div class="d-flex justify-content-end">
            <AppButton :disabled="startDateOutOfRange || invalidDate || endDateOutOfRange" label="core.generate" @click="getData()"></AppButton>
          </div>
        </section>

        <AppLoading v-if="loadingData"></AppLoading>

        <AppEmptyResponse v-else-if="!loadingData && !dataSource" :size="'sm'" :subtitle="false"></AppEmptyResponse>

        <section v-else-if="!loadingData && dataSource" class="bg-white mt-3">
          <table class="table">
            <thead>
              <tr>
                <th class="text-capitalize text-center col-1">
                  {{ t('classroom.followUpToTopics.table.weekYear') }}
                </th>
                <th class="text-capitalize align-middle col-2">
                  {{ t('core.time.day') }}
                </th>
                <th class="text-capitalize align-middle">
                  {{ t('core.theme') }}
                </th>
                <th class="text-capitalize align-middle">
                  {{ t('classroom.followUpToTopics.table.learningResults') }}
                </th>
                <th class="text-capitalize align-middle">
                  {{ t('classroom.activitiesTeacher.singular') }}
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!dataSource.consolidates.length">
                <td colspan="5">
                  <AppEmptyResponse :size="'sm'" :subtitle="false"></AppEmptyResponse>
                </td>
              </tr>

              <tr v-for="(item, index) in dataSource.consolidates" :key="index">
                <td class="text-center align-middle">{{ item.numberWeek }}</td>
                <td class="align-middle">{{ item.day }}</td>
                <td>
                  <template v-for="(topic, index) in item.topics" :key="index">
                    <p class="m-0">{{ topic }}</p>
                  </template>
                </td>

                <td>
                  <template v-for="(learningOutcome, index) in item.learningOutcomes" :key="index">
                    <p class="m-0">{{ learningOutcome }}</p>
                  </template>
                </td>

                <td>
                  <template v-for="(activity, index) in item.activities" :key="index">
                    <p class="m-0">{{ activity }}</p>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="text-end">
            <div class="d-flex justify-content-end align-items-center">
              <div ref="containerTopics" @mouseenter="showTooltipTopics" @mouseleave="hideTooltipTopics">
                <AppIcon icon="info-circle" />
              </div>

              <div ref="tooltipTopics" style="display: none" class="container-tooltip">
                <p class="m-0">
                  {{ t('classroom.followUpToTopics.configuredTopics') }}:
                  {{ dataSource.quantityTopics }}
                </p>
                <p class="m-0">
                  {{ t('classroom.followUpToTopics.topicsEvaluated') }}:
                  {{ dataSource.quantityTopicsEvaluated }}
                </p>
              </div>

              <p class="mb-1 pe-2">
                {{ t('classroom.followUpToTopics.percentageProgressTopics') }}:
                <span class="h5 m-0">{{ dataSource.percentageTopics }}%</span>
              </p>
            </div>

            <div class="d-flex justify-content-end align-items-center">
              <div ref="containerLearningOutcomes" @mouseenter="showTooltipLearningOutcomes" @mouseleave="hideTooltipLearningOutcomes">
                <AppIcon icon="info-circle" />
              </div>

              <div ref="tooltipLearningOutcomes" style="display: none" class="container-tooltip">
                <p class="m-0">{{ t('classroom.followUpToTopics.configuredLearningOutcomes') }}: {{ dataSource.quantityLearningOutcomes }}</p>
                <p class="m-0">
                  {{ t('classroom.followUpToTopics.learningOutcomesEvaluated') }}:
                  {{ dataSource.quantityLearningOutcomesEvaluated }}
                </p>
              </div>

              <p class="mb-1 pe-2">
                {{ t('classroom.followUpToTopics.percentageProgressLearningOutcomes') }}:
                <span class="h5 m-0">{{ dataSource.percentageLearningOutcomes }}%</span>
              </p>
            </div>
          </div>
        </section>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { createPopper } from '@popperjs/core';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { PeriodDto } from '../dtos/followUpToTopics.dto';
import { MonitoringReportDto } from '../dtos/followUpToTopics.dto';
import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetMonitoringReportService } from '../services/getMonitoringReport.service';
import { GetActivitiesSummaryService } from '../services/getActivitiesSummary.service';
import { useHeaderStore } from '../../../stores/header.store';
import TabsTeacher from '../components/TabsTeacher.vue';

const getActivitiesSummaryService = new GetActivitiesSummaryService();
const getMonitoringReportService = new GetMonitoringReportService();

export default defineComponent({
  name: 'FollowUpToTopics',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    TabsTeacher,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.followUpToTopics.title');
    const courseId = parseInt(route.params.courseId.toString(), 10);

    useMeta({ title: t(title) });
    const routes: BreadCrumbsType[] = [{ name: title }];

    const dataSource: Ref<MonitoringReportDto | null> = ref(null);
    const type: Ref<'sessions' | 'activities'> = ref('sessions');
    const currentPeriod: Ref<PeriodDto | null> = ref(null);
    const periodId: Ref<number | null> = ref(null);
    const periods: Ref<PeriodDto[]> = ref([]);
    const dateSince: Ref<string> = ref('');
    const dateUntil: Ref<string> = ref('');
    const subtitle: Ref<string> = ref('');

    const containerLearningOutcomes = ref<any>(null);
    const tooltipLearningOutcomes = ref<any>(null);
    const containerTopics = ref<any>(null);
    const tooltipTopics = ref<any>(null);

    let popperInstanceLearningOutcomes: any = null;
    let popperInstanceTopics: any = null;

    const startDateOutOfRange = ref(false);
    const endDateOutOfRange = ref(false);
    const invalidDate = ref(false);
    const loadingData = ref(false);
    const isStudent = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        let response = await getActivitiesSummaryService.run(courseId);
        subtitle.value = response.courseData.name;
        periods.value = response.periods;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        periodId.value = periods.value.length ? periods.value[0].id : null;

        await loadRoutes();

        if (tooltipTopics.value) tooltipTopics.value.style.display = 'none';
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(periodId, async (value) => {
      if (value) {
        currentPeriod.value = periods.value.filter((item) => item.id == value)[0];
        dateSince.value = currentPeriod.value.startDate;
        dateUntil.value = currentPeriod.value.endDate;
      }
    });
    watch(dateSince, () => {
      if (dateSince.value) dateOutOfRange(dateSince.value, true);
      else startDateOutOfRange.value = false;
    });
    watch(dateUntil, () => {
      if (dateUntil.value) {
        dateOutOfRange(dateUntil.value, false);
        invalidDates();
      } else endDateOutOfRange.value = false;
    });

    const invalidDates = () => {
      invalidDate.value = false;

      if (dateSince.value && dateUntil.value && !dayjs(dateSince.value).isSame(dayjs(dateUntil.value))) {
        invalidDate.value = dayjs(dateSince.value).isAfter(dayjs(dateUntil.value));
      }
    };

    const dateOutOfRange = (date: any, startDate: boolean) => {
      if (currentPeriod.value && date) {
        let startDatePeriod = dayjs(currentPeriod.value.startDate);
        let endDatePeriod = dayjs(currentPeriod.value.endDate);
        if (startDate) {
          let startDateForm = dayjs(date);
          startDateOutOfRange.value = startDateForm.isBefore(startDatePeriod) || startDateForm.isAfter(endDatePeriod);
        } else {
          let endDatePeriod = dayjs(currentPeriod.value.endDate);
          let endDateForm = dayjs(date);
          endDateOutOfRange.value = endDateForm.isAfter(endDatePeriod) || endDateForm.isBefore(startDatePeriod);
        }
      }
    };

    const getData = async () => {
      loadingData.value = true;

      try {
        if (type.value && periodId.value && dateSince.value && dateUntil.value && !startDateOutOfRange.value && !invalidDate.value && !endDateOutOfRange.value) {
          const params = {
            dateSince: dateSince.value,
            dateUntil: dateUntil.value,
            periodId: periodId.value,
            type: type.value,
          };

          dataSource.value = await getMonitoringReportService.run(courseId, params);
        }
      } catch (e) {
        console.log(e);
      }

      loadingData.value = false;
    };

    const showTooltipTopics = () => {
      if (containerTopics.value && tooltipTopics.value) {
        popperInstanceTopics = createPopper(containerTopics.value, tooltipTopics.value, {
          placement: 'top',
        });
      }

      if (tooltipTopics.value) tooltipTopics.value.style.display = 'block';
    };
    const hideTooltipTopics = () => {
      if (popperInstanceTopics) popperInstanceTopics.destroy();
      if (tooltipTopics.value) tooltipTopics.value.style.display = 'none';
    };

    const showTooltipLearningOutcomes = () => {
      if (containerLearningOutcomes.value && tooltipLearningOutcomes.value) {
        popperInstanceLearningOutcomes = createPopper(containerLearningOutcomes.value, tooltipLearningOutcomes.value, {
          placement: 'top',
        });
      }

      if (tooltipLearningOutcomes.value) tooltipLearningOutcomes.value.style.display = 'block';
    };
    const hideTooltipLearningOutcomes = () => {
      if (popperInstanceLearningOutcomes) popperInstanceLearningOutcomes.destroy();
      if (tooltipLearningOutcomes.value) tooltipLearningOutcomes.value.style.display = 'none';
    };

    const loadRoutes = async () => {
      const index = route.fullPath.indexOf('home-student');
      isStudent.value = index >= 0 ? true : false;

      if (isStudent.value) {
        routes.unshift({
          name: `${t('core.start')} (${t('core.generalTerms.academic.student.plural')})`,
          url: { name: 'administration.homeStudent' },
        });
      } else {
        routes.unshift({
          name: `${t('core.start')} (${t('core.generalTerms.academic.teacher.plural')})`,
          url: { name: 'administration.homeTeacher' },
        });
      }
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      t,

      containerLearningOutcomes,
      tooltipLearningOutcomes,
      startDateOutOfRange,
      endDateOutOfRange,
      containerTopics,
      currentPeriod,
      tooltipTopics,
      loadingData,
      invalidDate,
      dataSource,
      isStudent,
      dateSince,
      dateUntil,
      periodId,
      periods,
      type,

      showTooltipLearningOutcomes,
      hideTooltipLearningOutcomes,
      showTooltipTopics,
      hideTooltipTopics,
      getData,
    };
  },
});
</script>

<style scoped>
.container-tooltip {
  background-color: #111;
  color: #eee;
  padding: 4px 8px;
  border-radius: 4px;

  .selected {
    background-color: blue;
  }
}
</style>
