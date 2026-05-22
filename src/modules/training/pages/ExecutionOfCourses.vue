<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template #content>
      <AppEmptyResponse v-if="!academicPeriods.length" :show-image="true" title="Sin vigencias configuradas" :subtitle="false"></AppEmptyResponse>

      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="academicPeriodId" :filter-name="'executionOfCourses.academicPeriodId'">
              <label>Vigencia</label>
              <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"></AppAutocomplete>
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

                  <div class="d-flex justify-content-between">
                    <p class="m-0">Inscritos</p>

                    <span class="badge rounded-pill text-bg-primary bg-primary">{{ course.quantityInscriptions }}/{{ course.quota }}</span>
                  </div>
                </template>

                <template #footer>
                  <div class="d-flex justify-content-end">
                    <a class="opc text-decoration-none p-2 ps-3 pe-3 text-dark" href="#" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                      {{ t('classroom.homeTeacher.options') }}
                    </a>

                    <ul class="dropdown-menu p-0" aria-labelledby="navbarDropdown">
                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.executionOfCoursesAttendance',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Sesiones') }}</router-link
                        >
                      </li>

                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.executionOfCoursesActivities',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Actividades') }}</router-link
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
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { AcademicPeriodDto } from '../dtos/courseSchedule.dto';
import { CourseScheduleDto } from '../dtos/courseSchedule.dto';

import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';

import { GetMyCoursesService } from '../services/getMyCourses.service';

const getAcademicPeriodsService = new GetAcademicPeriodsService();
const getMyCoursesService = new GetMyCoursesService();

export default defineComponent({
  name: 'ExecutionOfCourses',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppBaseList,
    AppLoading,
    AppFilter,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Ejecución de cursos';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const dataCourses: Ref<CourseScheduleDto[]> = ref([]);

    const academicPeriodId = ref();

    const loadingCourses = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        academicPeriods.value = await getAcademicPeriodsService.run();

        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['executionOfCourses.academicPeriodId']) {
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
        dataCourses.value = await getMyCoursesService.run(academicPeriodId.value as number);
      }

      loadingCourses.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      academicPeriodId,
      academicPeriods,
      loadingCourses,
      dataCourses,
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
