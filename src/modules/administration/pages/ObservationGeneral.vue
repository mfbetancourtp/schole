<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="routes[routes.length - 2].url"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppPulseLoading v-if="loading"></AppPulseLoading>
      <template v-else>
        <div class="container-tables">
          <div class="d-flex flex-wrap align-items-center mb-4">
            <!-- Título centrado -->
            <h3 class="bg-white fw-bold px-3 py-1" style="color: var(--color-primary)">Observación director de grupo {{ subtitle }}</h3>
            <div class="ms-auto tw-flex tw-justify-end">
              <div class="mb-3 md:tw-w-72 tw-w-full">
                <label>{{ t('academicPlanning.periods.name') }}</label>
                <AppAutocomplete v-model="periodId" :options="periods" :label="'name'" :clearable="false" class="bg-white"> </AppAutocomplete>
              </div>
            </div>
          </div>

          <AppPulseLoading v-if="loadingTable"></AppPulseLoading>

          <div class="table-responsive" style="overflow-x: auto">
            <div class="mb-3">
              <AppButton v-if="!isEditing" label="classroom.activitiesTeacher.qualify" @click="enableEditing"></AppButton>
              <div v-else class="d-flex flex-wrap gap-2">
                <AppButton label="core.save" @click="save"></AppButton>
                <AppButton label="core.cancel" @click="enableEditing"></AppButton>
              </div>
            </div>
            <AppDatatable :name="title" :data="observationData.directorObservations" :filterKeyLocal="'studentLastnames'">
              <AppDatatableColumn label="ESTUDIANTE" :sortable="true" v-slot="{ row }"> {{ row.studentNames }} {{ row.studentLastnames }} </AppDatatableColumn>

              <AppDatatableColumn label="CALIFICACIÓN DISCIPLINARIA" :sortable="true" v-slot="{ row }" :position="'centered'">
                <div class="text-center" v-if="isQualitativeGradingId === 0">
                  <input v-if="isEditing" v-model="row.disciplineNote" class="form-control" type="number" />
                  <span v-else>{{ row.disciplineNote || '-' }}</span>
                </div>

                <div class="text-center" v-else>
                  <!-- <AppAutocomplete
                    v-if="isEditing"
                    v-model="row.disciplineNote"
                    class="app-autocomplete-fixed"
                    :options="ratingScalesList"
                    :reduce="(ratingScale: any) => ratingScale.maximumValue"
                    label="description"
                  />
                  <span v-if="!isEditing">{{ row?.disciplinaryQualification.disciplinaryRating || row?.qualificationConvert?.qualitativeQualification || '-' }}</span> -->
                  <span>
                    {{ row?.qualificationConvert?.qualitativeQualification || '-' }}
                  </span>
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn label="observation.disiplinary" :sortable="true" v-slot="{ row }" :position="'centered'">
                <div class="text-center">
                  <AppVoiceInput v-if="isEditing" v-model="row.disciplineObservations" textareaClass="form-control" :cols="40" :rows="3" id="disciplineObservations"></AppVoiceInput>

                  <span v-else>{{ row.disciplineObservations }}</span>
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn label="observation.general" :sortable="true" v-slot="{ row }" :position="'centered'">
                <div class="text-center">
                  <AppVoiceInput v-if="isEditing" v-model="row.generalObservations" textareaClass="form-control" :cols="40" :rows="3" id="generalObservations"></AppVoiceInput>
                  <span v-else>{{ row.generalObservations }}</span>
                </div>
              </AppDatatableColumn>
            </AppDatatable>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch, computed } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useRoute } from 'vue-router';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
//import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
//import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { CourseDto } from '../dtos/course.dto';
import { GetActivitiesSummaryService } from '../services/getActivitiesSummary.service';
import { GetActivitiesSummaryByPeriodIdService } from '../services/getActivitiesSummaryByPeriodId.service';

import { useHeaderStore } from '../../../stores/header.store';
import { GetCourseByIdService } from '../services/getCourseById.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { GetDirectorObservationsService } from '../services/getDirectorObservations.service';
import { ObservationGeneralDto } from '../dtos/observationGeneral.dto';
import { CreateOrUpdateDirectorObservationsService } from '../services/createOrUpdateDirectorObservations.service';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';

const getActivitiesSummaryByPeriodIdService = new GetActivitiesSummaryByPeriodIdService();
const getActivitiesSummaryService = new GetActivitiesSummaryService();
const getCourseByIdService = new GetCourseByIdService();
const getDirectorObservationsService = new GetDirectorObservationsService();
const createOrUpdateDirectorObservationsService = new CreateOrUpdateDirectorObservationsService();
export default defineComponent({
  name: 'ObservationGeneralPage',
  components: {
    AppAutocomplete,
    AppButtonBack,
    AppButton,
    AppBaseList,
    AppPulseLoading,
    //AppCheckPermission,
    AppDatatable,
    AppDatatableColumn,
    AppVoiceInput,
  },

  setup() {
    //const router = useRouter();
    const { t } = useI18n();
    const route = useRoute();
    const title = t('Observación General');
    const learningOutcomes = ref();

    useMeta({ title: t(title) });
    const routes: BreadCrumbsType[] = [
      {
        name: `classroom.homeTeacher.title`,
        url: {
          name: 'administration.homeTeacher',
        },
      },
      {
        name: title,
      },
    ];

    const course: Ref<CourseDto | null> = ref(null);
    const consolidate: Ref<any[]> = ref([]);
    const subtitle: Ref<string> = ref('');
    const periods: Ref<any[]> = ref([]);
    const syncLmsNew = ref();
    const periodId = ref();
    const isEditing = ref(false);
    const observationData: Ref<ObservationGeneralDto> = ref({
      directorObservations: [],
    });
    const academicPeriodGroupId = ref(parseInt(route.params.academicPeriodGroupId.toString(), 10));
    const courseId = ref(parseInt(route.params.courseId.toString(), 10));
    const ratingScalesList: Ref<any[]> = ref([]);
    const isQualitativeGradingId = ref();
    const loadingTable = ref(false);
    const loading = ref(true);

    //const serviceTable = new GetActivitiesSummaryNewTable();

    const params = computed(() => ({
      courseId: courseId.value,
      periodId: periodId.value,
    }));

    onMounted(async () => {
      try {
        //courseId.value = parseInt(route.params.courseId.toString(), 10);
        const courses = await getCourseByIdService.run(courseId.value);

        isQualitativeGradingId.value = courses?.level.isQualitativeGrading;
        ratingScalesList.value = courses?.ratingScales;

        await getRelatedDataActivitiesSummary();
        await getObservations();
        subtitle.value = `${course.value?.degreeName} ${course.value?.groupName}`;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        await getActivitySummaryByPeriod();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(periodId, async () => {
      console.log('periodId.value', periodId.value);
      if (periodId.value == typeof 'object') {
        periodId.value = null;
      }

      reloadData();
    });

    const getRelatedDataActivitiesSummary = async () => {
      try {
        let params = {
          unassigned: 0,
        };
        courseId.value = parseInt(route.params.courseId.toString(), 10);
        let response = await getActivitiesSummaryService.run(courseId.value, params);
        syncLmsNew.value = response.courseData.syncLmsNew;
        periodId.value = response.periods[0]?.id;
        course.value = response.courseData;
        // Manipular los datos
        periods.value = response.periods.map((period: any) => {
          return {
            ...period,
            name: syncLmsNew.value === 1 && period.periodLmsName ? period.periodLmsName : period.name,
          };
        });
        periods.value.push({
          id: 'null',
          institutionId: 127,
          academicPeriodId: null,
          abbreviation: 'PF',
          startDate: null,
          endDate: null,
          percent: null,
          percentRepproved: null,
          order: null,
          active: null,
          startDateScoreUpload: null,
          endDateScoreUpload: null,
          startDateRetrievalLock: null,
          endDateRetrievalLock: null,
          createdAt: null,
          updatedAt: null,
          periodLmsName: null,
          name: 'Periodo final',
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    const getActivitySummaryByPeriod = async () => {
      //loadingTable.value = true;

      try {
        const response = await getActivitiesSummaryByPeriodIdService.run(courseId.value, periodId.value!);
        consolidate.value = response?.activitiesSummary?.consolidate || [];
        learningOutcomes.value = response?.learningOutcomes || [];
      } catch (error) {
        console.error(error);
      }
      //loadingTable.value = false;
    };

    const consolidatedData = computed(() =>
      consolidate.value.map((record) => {
        const userId = record[1]; // El ID del usuario está en la posición 1

        // Buscar observación en learningOutcomes
        const matchedOutcome = learningOutcomes.value.find((outcome: any) => outcome.userId === userId && outcome.id === null);

        // Devolvemos el nuevo array con la observación agregada
        return [...record, matchedOutcome?.observations ?? null];
      })
    );

    const getObservations = async () => {
      try {
        let Iparams: any = {};

        if (periodId.value === 'null') {
          Iparams = {
            academicPeriodGroupId: academicPeriodGroupId.value,
          };
        } else {
          Iparams = {
            periodId: periodId.value,
            academicPeriodGroupId: academicPeriodGroupId.value,
            periodStartDate: periods.value.find((period: any) => period.id === periodId.value)?.startDate,
            periodEndDate: periods.value.find((period: any) => period.id === periodId.value)?.endDate,
          };
        }

        observationData.value = await getDirectorObservationsService.run(Iparams);
      } catch (error) {
        console.error(error);
      }
    };

    const enableEditing = () => {
      isEditing.value = !isEditing.value;
    };

    const reloadData = async () => {
      try {
        loadingTable.value = true;

        if (periodId.value !== 'null') {
          await getActivitySummaryByPeriod();
        }

        await getObservations();

        loadingTable.value = false;
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    };
    const save = async () => {
      try {
        const filteredData = observationData.value?.directorObservations?.map((observation: any) => ({
          studentUserId: observation.userId,
          disciplineNote: Number(observation.disciplineNote) ?? null,
          disciplineObservations: observation.disciplineObservations,
          generalObservations: observation.generalObservations,
        }));
        const sendData = {
          degreeId: observationData.value.degreeId,
          groupId: observationData.value.groupId,
          directorObservations: filteredData,
          periodId: typeof periodId.value === 'number' ? periodId.value : null,
        };

        await createOrUpdateDirectorObservationsService.run(sendData);

        console.log(sendData);
        isEditing.value = false;
        reloadData();
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    return {
      params,
      subtitle,
      loading,
      routes,
      title,
      t,
      loadingTable,
      consolidatedData,
      periods,
      periodId,
      courseId,

      isQualitativeGradingId,
      ratingScalesList,
      //getRelatedDataActivitiesSummary,
      getActivitySummaryByPeriod,
      observationData,
      enableEditing,
      isEditing,
      save,
    };
  },
});
</script>

<style scoped>
.container-tables {
  background-color: white;
  padding: 23px 22px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

.table-responsive {
  overflow-x: auto;
}
</style>
