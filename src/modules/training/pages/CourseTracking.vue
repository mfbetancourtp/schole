<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButton
      style="color: white;"
        v-if="academicPeriods.length"
        label="core.newMale"
        :to="{
          name: 'training.courseScheduleCreate',
          query: { academicPeriodId },
        }"
      ></AppButton>
    </template>

    <template #content>
      <AppEmptyResponse v-if="!academicPeriods.length" :show-image="true" title="Sin vigencias configuradas" :subtitle="false"></AppEmptyResponse>

      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="academicPeriodId" :filter-name="'courseSchedule.academicPeriodId'">
              <label>Vigencia</label>
              <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"> </AppAutocomplete>
            </AppFilter>
          </div>
        </div>

        <AppLoading v-if="loadingCourses"></AppLoading>

        <template v-else>
          <AppEmptyResponse v-if="!dataCourses.length" :show-image="true" :subtitle="false"></AppEmptyResponse>

          <div v-else v-for="(dataCourse, index) in dataCourses" :key="index" class="border-bottom pb-2 mb-3">
            <h5 class="fw-semibold m-0" style="color: #64748b">
              {{ dataCourse.label }}
            </h5>

            <div class="grid-cards">
              <AppCard v-for="(course, index2) in dataCourse.courses" :key="index2">
                <template #title>
                  <div class="m-0">{{ course.name }}</div>
                </template>

                <template #body>
                  <h6 class="m-0">{{ course.degree.name }}</h6>

                  <hr />

                  <div class="d-flex justify-content-between mt-1">
                    <p class="m-0">Sesiones</p>
                    <span class="badge rounded-pill text-bg-primary bg-primary">{{ course.Sessions.quantityWithListCallSessions }} / {{ course.Sessions.quantityScheduledSessions }}</span>
                  </div>

                  <div class="d-flex justify-content-between mt-1">
                    <p class="m-0">Viaticos</p>
                    <span class="badge rounded-pill text-bg-primary bg-primary">{{ course.Viatics.finalCompanyContribution }} / {{ course.Viatics.companyContribution }}</span>
                  </div>

                  <div class="d-flex justify-content-between mt-1">
                    <p class="m-0">Presupuesto</p>
                    <span class="badge rounded-pill text-bg-primary bg-primary">{{ course.Budgets.finalTotalValue }} / {{ course.Budgets.budgetTotalValue }}</span>
                  </div>
                </template>

                <template #footer>
                  <div class="d-flex justify-content-between">
                    <a class="opc text-decoration-none p-2 ps-3 pe-3 text-dark" href="#" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                      {{ t('classroom.homeTeacher.options') }}
                    </a>

                    <ul class="dropdown-menu p-0" aria-labelledby="navbarDropdown">
                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.sessionsTracking',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Sesiones') }}</router-link
                        >
                      </li>

                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.travelExpensesTracking',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Viaticos') }}</router-link
                        >
                      </li>

                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.budgetTracking',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Presupuesto') }}</router-link
                        >
                      </li>
                    </ul>
                  </div>
                </template>
              </AppCard>
            </div>
          </div>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CourseDto } from '../dtos/courseTracking.dto';
import { AcademicPeriodDto } from '../dtos/courseSchedule.dto';
import { CourseTrackingDto } from '../dtos/courseTracking.dto';

import { DeleteCourseService } from '../services/deleteCourse.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetFollowUpCoursesByAcademicPeriodIdService } from '../services/getFollowUpCoursesByAcademicPeriodId.service';

const getFollowUpCoursesByAcademicPeriodIdService = new GetFollowUpCoursesByAcademicPeriodIdService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const deleteCourseService = new DeleteCourseService();

export default defineComponent({
  name: 'CourseTracking',
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
    const title = 'Seguimiento de cursos';
    const subtitle = 'Registra las evidencias de los cursos programados';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const currentCourse: Ref<CourseDto | null> = ref(null);
    const dataCourses: Ref<CourseTrackingDto[]> = ref([]);

    const academicPeriodId = ref();
    const currentCourseId = ref();

    const customizeSynchronizationModal = ref(false);
    const synchronizationReportModal = ref(false);
    const loadingCourses = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    const currentData: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        academicPeriods.value = await getAcademicPeriodsService.run();

        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['courseSchedule.academicPeriodId']) {
          if (academicPeriods.value.length) {
            academicPeriods.value.forEach((academicPeriod) => {
              if (localfilters['courseSchedule.academicPeriodId'] == academicPeriod.id) {
                academicPeriodId.value = academicPeriod.id;
              }
            });
          }
        } else {
          if (academicPeriods.value.length) academicPeriodId.value = academicPeriods.value[0].id;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(academicPeriodId, async () => {
      await getCourses();
    });

    const getCourses = async () => {
      loadingCourses.value = true;

      if (academicPeriodId.value >= 0) {
        dataCourses.value = await getFollowUpCoursesByAcademicPeriodIdService.run(academicPeriodId.value as number);
      }
      console.log('prueba', dataCourses.value);
      loadingCourses.value = false;
    };

    const openConfirmDelete = async (course: CourseDto) => {
      currentCourse.value = course;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentCourse.value) await deleteCourseService.run(currentCourse.value.id);

      modalDelete.value = false;

      await getCourses();
    };

    const openCustomizeSynchronizationModal = (courseId: number) => {
      currentCourseId.value = courseId;
      customizeSynchronizationModal.value = true;
    };
    const CloseCustomizeSynchronizationModal = async (data: any) => {
      customizeSynchronizationModal.value = false;

      await openSynchronizationReportModal(data);
    };

    const openSynchronizationReportModal = (data: any) => {
      currentData.value = data;
      synchronizationReportModal.value = true;
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      t,

      customizeSynchronizationModal,
      synchronizationReportModal,
      academicPeriodId,
      academicPeriods,
      currentCourseId,
      loadingCourses,
      modalDelete,
      currentData,
      dataCourses,

      CloseCustomizeSynchronizationModal,
      openCustomizeSynchronizationModal,
      openConfirmDelete,
      confirmDelete,
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

.opc:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
