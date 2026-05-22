<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:content>
      <AppEmptyResponse v-if="!academicPeriods.length" :show-image="true" title="Sin vigencias configuradas" :subtitle="false"></AppEmptyResponse>

      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="academicPeriodId" :filter-name="'courseScheduleEmployee.academicPeriodId'">
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
                  <div class="text-muted d-flex gap-1 justify-content-end" style="font-size: 0.95rem">
                    <span>Realizado en:</span>

                    <span>{{ course.meetingMunicipalityName }}</span>
                  </div>

                  <div>{{ course.name }}</div>
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
                    <template v-if="!course.courseInscriptionId">
                      <AppButton v-tooltip="'Inscribirse'" icon="hand-paper" outlined @click="openCourseScheduleEmployeForm(course)"></AppButton>
                    </template>

                    <template v-else-if="course.meetingMunicipalityId && !course.sameMunicipality">
                      <AppButton v-tooltip="'Viáticos'" icon="car" outlined @click="openCourseScheduleEmployeForm(course)"></AppButton>
                    </template>
                  </div>
                </template>
              </AppCard>
            </div>
          </div>
        </template>
      </template>

      <AppModal v-model="courseScheduleEmployeFormModal" size="lg">
        <CourseScheduleEmployeForm v-if="courseScheduleEmployeFormModal && currentCourse" :course="currentCourse" @close="closeCourseScheduleEmployeForm"></CourseScheduleEmployeForm>
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
import CourseScheduleEmployeForm from '../components/CourseScheduleEmployeForm.vue';

import { CourseDto } from '../dtos/courseSchedule.dto';
import { AcademicPeriodDto } from '../dtos/courseSchedule.dto';
import { CourseScheduleDto } from '../dtos/courseSchedule.dto';

import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetCoursesByAcadPeriIdService } from '../services/getCoursesByAcadPeriId.service';
import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';

const findAllMunicipalitiesForSelectService = new FindAllMunicipalitiesForSelectService();
const getCoursesByAcadPeriIdService = new GetCoursesByAcadPeriIdService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();

export default defineComponent({
  name: 'CourseScheduleEmployee',
  components: {
    CourseScheduleEmployeForm,
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

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const currentCourse: Ref<CourseDto | null> = ref(null);
    const dataCourses: Ref<CourseScheduleDto[]> = ref([]);

    const academicPeriodId = ref();
    const currentCourseId = ref();

    const courseScheduleEmployeFormModal = ref(false);
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

        if (localfilters && !!localfilters['courseScheduleEmployee.academicPeriodId']) {
          if (academicPeriods.value.length) {
            academicPeriods.value.forEach((academicPeriod) => {
              if (localfilters['courseScheduleEmployee.academicPeriodId'] == academicPeriod.id) {
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
        dataCourses.value = await getCoursesByAcadPeriIdService.run(academicPeriodId.value as number);

        for (let i = 0; i < dataCourses.value.length; i++) {
          for (let j = 0; j < dataCourses.value[i].courses.length; j++) {
            if (dataCourses.value[i].courses[j].meetingMunicipalityId) {
              dataCourses.value[i].courses[j].meetingMunicipalityName = await getMunicipalityById(dataCourses.value[i].courses[j].meetingMunicipalityId);
            } else {
              dataCourses.value[i].courses[j].meetingMunicipalityName = 'Sin asignar';
            }
          }
        }
      }

      loadingCourses.value = false;
    };

    const getMunicipalityById = async (municipalityId: number) => {
      const municipality: any = await findAllMunicipalitiesForSelectService.run({ municipalityId });

      return municipality.data[0].name;
    };

    const openCourseScheduleEmployeForm = async (course: CourseDto) => {
      currentCourse.value = await course;
      courseScheduleEmployeFormModal.value = true;
    };
    const closeCourseScheduleEmployeForm = async () => {
      courseScheduleEmployeFormModal.value = false;

      await getCourses();
    };

    return {
      loading,
      routes,
      title,
      t,

      courseScheduleEmployeFormModal,
      academicPeriodId,
      academicPeriods,
      currentCourseId,
      loadingCourses,
      currentCourse,
      modalDelete,
      currentData,
      dataCourses,

      closeCourseScheduleEmployeForm,
      openCourseScheduleEmployeForm,
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
