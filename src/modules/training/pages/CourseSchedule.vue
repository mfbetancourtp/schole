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
                  <div>{{ course.name }}</div>
                </template>
                <template #body>
                  <h6 class="m-0">{{ course.degree.name }}</h6>

                  <hr />

                  <div class="d-flex justify-content-between">
                    <p class="m-0">Inscritos</p>

                    <span class="badge rounded-pill text-bg-primary bg-primary">{{ course.quantityInscriptions }}/{{ course.countQuotas }}</span>
                  </div>
                </template>

                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>
                      <AppButton v-if="course.isTooCourseLMS" v-tooltip="'Sincronizar'" icon="sync" outlined @click="openCustomizeSynchronizationModal(course.id)"></AppButton>
                    </div>

                    <a class="opc text-decoration-none p-2 ps-3 pe-3 text-dark" href="#" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                      {{ t('classroom.homeTeacher.options') }}
                    </a>

                    <ul class="dropdown-menu p-0" aria-labelledby="navbarDropdown">
                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.courseSchedulePlanningWeeks',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Planeación') }}</router-link
                        >
                      </li>

                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.courseScheduleTravelExpenses',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Administración de costos de viaje') }}</router-link
                        >
                      </li>

                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.courseScheduleEnrolled',
                            params: { courseId: course.id },
                          }"
                          >{{ t('Inscritos') }}</router-link
                        >
                      </li>

                      <li class="opc d-grid">
                        <router-link
                          class="text-decoration-none p-2 pe-1 text-dark"
                          :to="{
                            name: 'training.courseScheduleEdit',
                            params: { courseId: course.id },
                          }"
                          >{{ t('core.edit') }}</router-link
                        >
                      </li>

                      <li class="opc d-grid">
                        <span class="text-decoration-none p-2 pe-1 text-dark" @click="openConfirmDelete(course)">{{ t('core.delete') }}</span>
                      </li>
                    </ul>
                  </div>
                </template>
              </AppCard>
            </div>
          </div>
        </template>
      </template>

      <AppModal v-model="customizeSynchronizationModal" :size="'lg'">
        <CourseScheduleCustomizeSync v-if="customizeSynchronizationModal" :course-id="currentCourseId" @close="CloseCustomizeSynchronizationModal"></CourseScheduleCustomizeSync>
      </AppModal>

      <AppModal v-model="synchronizationReportModal" :size="'xl'">
        <SynchronizationReport v-if="synchronizationReportModal" :data="currentData.value"></SynchronizationReport>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Curso" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
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
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import CourseScheduleCustomizeSync from '../components/CourseScheduleCustomizeSync.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import SynchronizationReport from '../../academicPlanning/components/SynchronizationReport.vue';

import { CourseDto } from '../dtos/courseSchedule.dto';
import { AcademicPeriodDto } from '../dtos/courseSchedule.dto';
import { CourseScheduleDto } from '../dtos/courseSchedule.dto';

import { DeleteCourseService } from '../services/deleteCourse.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetCoursesByAcadPeriIdService } from '../services/getCoursesByAcadPeriId.service';
import { useHeaderStore } from '../../../stores/header.store';

const getCoursesByAcadPeriIdService = new GetCoursesByAcadPeriIdService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const deleteCourseService = new DeleteCourseService();

export default defineComponent({
  name: 'CourseSchedule',
  components: {
    CourseScheduleCustomizeSync,
    AppConfirmDeleteModal,
    SynchronizationReport,
    AppEmptyResponse,
    AppAutocomplete,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppModal,
    AppCard,
  },
  setup() {
    const { t } = useI18n();
    const title = 'Cronograma de cursos';
    const subtitle = 'Programa los cursos a desarrollar por vigencia';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const currentCourse: Ref<CourseDto | null> = ref(null);
    const dataCourses: Ref<CourseScheduleDto[]> = ref([]);

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

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Capacitación', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
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
        dataCourses.value = await getCoursesByAcadPeriIdService.run(academicPeriodId.value as number);
      }

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
