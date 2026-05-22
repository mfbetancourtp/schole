<template>

  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButton
        style="color: white;"
        v-if="academicPeriods.length"
        label="core.newMale"
        :to="{
          name: 'administration.courseScheduleCreate',
          query: { academicPeriodId },
        }"
      ></AppButton>
    </template>

    <template v-slot:content>
  <AppLoading v-if="loading"></AppLoading>

      <AppEmptyResponse v-else-if="!academicPeriods.length" :show-image="true" title="Sin periodos configurados" :subtitle="false"></AppEmptyResponse>

      <template v-else>
        <div class="form-row">
          <AppFilter v-model="academicPeriodId" :filter-name="'courseSchedule.academicPeriodId'">
            <label>Año escolar</label>
            <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"> </AppAutocomplete>
          </AppFilter>

          <AppFilter v-model="academicPeriodGroupId" :filter-name="'courseSchedule.academicPeriodGroupId'">
            <label>Grupo</label>
            <AppAutocomplete v-model="academicPeriodGroupId" :options="academicPeriodGroups" class="bg-white"> </AppAutocomplete>
          </AppFilter>

          <AppFilter v-model="ownerUserId" :filter-name="'courseSchedule.ownerUserId'">
            <label>Docente</label>
            <AppSearchTeachers :id="ownerUserId" @user-data="(data) => (ownerUserId = data.id)" class="bg-white"> </AppSearchTeachers>
          </AppFilter>
        </div>

        <AppLoading v-if="loadingCourses"></AppLoading>

        <template v-else>
          <AppEmptyResponse v-if="!dataCourses.length" :show-image="true" :subtitle="false"></AppEmptyResponse>

          <div v-else v-for="(dataCourse, index) in dataCourses" :key="index" class="border-bottom pb-2 mb-3">
            <h5 class="fw-semibold m-0" style="color: #64748b">
              {{ dataCourse.name }}
            </h5>

            <div class="grid-cards">
              <AppCard v-for="(course, index2) in dataCourse.courses" :key="index2">
                <template #body>
                  <h5 class="m-0">{{ course.name }}</h5>
                  <h6 class="m-0">{{ course.group.name }}</h6>

                  <hr />

                  <h6 class="card-title mb-0">
                    {{ t('core.generalTerms.academic.teacher.singular') }}
                  </h6>

                  <div class="d-flex align-items-center mb-2" style="color: #6c757d">
                    <AppIcon class="icon-size-8 m-1" icon="graduation-cap"></AppIcon>

                    <p class="m-0" style="font-size: 0.9rem">
                      {{ course.teacherPeople?.names }}
                      {{ course.teacherPeople?.lastnames }}
                    </p>
                  </div>

                  <div class="d-flex justify-content-between">
                    <p class="m-0">Inscritos</p>

                    <span class="badge rounded-pill text-bg-primary bg-primary">{{ course.quantityInscriptions ?? '--' }}/{{ course.quota ?? '--' }}</span>
                  </div>
                </template>

                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>
                      <AppDropdown v-if="course.isTooCourseLMS">
                        <template v-slot:button>
                          <AppButton v-tooltip="'academicPlanning.subjectAssignments.sync'" icon="sync" outlined> </AppButton>
                        </template>

                        <template v-slot:items>
                          <li>
                            <span class="dropdown-item pointer" @click="openCustomizeSynchronizationModal(course.id)">Sincronizar</span>
                          </li>
                          <li>
                            <span class="dropdown-item pointer" @click="syncLMS(course.id)">Sincronizar notas</span>
                          </li>
                        </template>
                      </AppDropdown>
                    </div>

                    <AppButtonGroup v-if="!syncingInProgress">
                      <AppButton
                        v-tooltip="'Inscritos'"
                        icon="clipboard-check"
                        outlined
                        :to="{
                          name: 'administration.courseScheduleEnrolled',
                          params: { courseId: course.id },
                          query: { academicPeriodId: academicPeriodId },
                        }"
                      ></AppButton>

                      <AppButton
                        v-tooltip="'Calificaciones por periodo'"
                        icon="file-alt"
                        :to="{
                          name: 'administration.courseScheduleNotesByPeriod',
                          params: { courseId: course.id },
                        }"
                        outlined
                      ></AppButton>

                      <AppButtonEdit
                        :to="{
                          name: 'administration.courseScheduleEdit',
                          params: { courseId: course.id },
                          query: { academicPeriodId: academicPeriodId },
                        }"
                      ></AppButtonEdit>

                      <AppButtonDelete @click="openConfirmDelete(course)"></AppButtonDelete>
                    </AppButtonGroup>
                  </div>
                  <div class="mt-2" v-if="syncingCourseId === course.id">
                    <SyncProgress :report-id="reportId" :course-id="course.id"></SyncProgress>
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
        <SynchronizationReport v-if="synchronizationReportModal" :data="currentData.value" @close="closeSynchronizationReportModal"></SynchronizationReport>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Curso" @confirmDelete="confirmDelete" @close="modalDelete = false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppDropdown from '../../../shared/components/AppDropdown.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppSearchTeachers from '../../../shared/components/Forms/AppSearchTeachers.vue';
import CourseScheduleCustomizeSync from '../components/CourseScheduleCustomizeSync.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import SynchronizationReport from '../../academicPlanning/components/SynchronizationReport.vue';
import SyncProgress from '../components/SyncProgress.vue';

import { ToastService } from '../../../shared/services/toast.service';
import { DeleteCourseService } from '../services/deleteCourse.service';
import { SyncActivitiesLmsService } from '../services/syncActivitiesLms.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetCoursesByAcadPeriIdService } from '../services/getCoursesByAcadPeriId.service';
import { GetAcadPeriGrouAllByAcadPeriService } from '../services/getAcadPeriGrouAllByAcadPeri.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcadPeriGrouAllByAcadPeriService = new GetAcadPeriGrouAllByAcadPeriService();
const getCoursesByAcadPeriIdService = new GetCoursesByAcadPeriIdService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const syncActivitiesLmsService = new SyncActivitiesLmsService();
const deleteCourseService = new DeleteCourseService();
const toastService = new ToastService();

export default defineComponent({
  name: 'CourseSchedule',
  components: {
    CourseScheduleCustomizeSync,
    AppConfirmDeleteModal,
    SynchronizationReport,
    AppSearchTeachers,
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppDropdown,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppModal,
    AppCard,
    SyncProgress,
    AppIcon,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Cronograma de cursos';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const academicPeriodGroups: Ref<any[]> = ref([]);
    const academicPeriods: Ref<any[]> = ref([]);
    const currentCourse: Ref<any> = ref(null);
    const dataCourses: Ref<any[]> = ref([]);

    const academicPeriodGroupId = ref();
    const academicPeriodId = ref();
    const currentCourseId = ref();
    const ownerUserId = ref();
    const activeAcademicPeriods = ref([]);
    const reportId = ref();
    const syncingCourseId = ref();
    const syncingInProgress = ref(false);

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
        const allAcademicPeriods: any = await getAcademicPeriodsService.run();
        activeAcademicPeriods.value = allAcademicPeriods.filter((period: any) => period.active === 1);

      
        if (activeAcademicPeriods.value.length > 0) {
        academicPeriodId.value = activeAcademicPeriods.value[0].id;
      }

       const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '');
        
        if (localfilters && !!localfilters['courseSchedule.academicPeriodGroupId']) {
          if (academicPeriodId.value) await getAcademicPeriodGroups();

          if (academicPeriodGroups.value.length) {
            academicPeriodGroups.value.forEach((academicPeriodGroup) => {
              if (localfilters['courseSchedule.academicPeriodGroupId'] == academicPeriodGroup.id) {
                academicPeriodGroupId.value = academicPeriodGroup.id;
              }
            });
          }
        }

        if (localfilters && !!localfilters['courseSchedule.ownerUserId']) {
          ownerUserId.value = localfilters['courseSchedule.ownerUserId'] as number;
        }
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    
    watch(academicPeriodId, async () => {
      await getCourses();
      await getAcademicPeriodGroups();
    });

    watch(academicPeriodGroupId, async () => {
      await getCourses();
    });

    watch(ownerUserId, async () => {
      await getCourses();
    });

    const getCourses = async () => {
      loadingCourses.value = true;

      if (academicPeriodId.value >= 0) {
        const params: any = {};

        if (academicPeriodGroupId.value) params.academicPeriodGroupId = academicPeriodGroupId.value;
        if (ownerUserId.value) params.userId = ownerUserId.value;

        dataCourses.value = await getCoursesByAcadPeriIdService.run(academicPeriodId.value as number, params);
      }

      loadingCourses.value = false;
    };

    const getAcademicPeriodGroups = async () => {
      loadingCourses.value = true;

      if (academicPeriodId.value >= 0) {
        academicPeriodGroups.value = await getAcadPeriGrouAllByAcadPeriService.run(academicPeriodId.value as number);

        academicPeriodGroups.value.forEach((item) => (item.name = `${item.degreeName} - ${item.GroupName}`));
      }

      loadingCourses.value = false;
    };

    const openCustomizeSynchronizationModal = (courseId: number) => {
      currentCourseId.value = courseId;
      customizeSynchronizationModal.value = true;
    };
    const CloseCustomizeSynchronizationModal = async (data: any) => {
      customizeSynchronizationModal.value = false;
      if (data) {
        await openSynchronizationReportModal(data);
      }
    };
    const openSynchronizationReportModal = (data: any) => {
      currentData.value = data;
      synchronizationReportModal.value = true;
    };
    const closeSynchronizationReportModal = (data: any) => {
      synchronizationReportModal.value = false;
    };

    const openConfirmDelete = async (course: any) => {
      currentCourse.value = course;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentCourse.value) await deleteCourseService.run(currentCourse.value.id);

      modalDelete.value = false;

      await getCourses();
    };

    const syncLMS = async (courseId: number) => {
      try {
        syncingInProgress.value = true;
        syncingCourseId.value = courseId;

        const response = await syncActivitiesLmsService.run(courseId);
        reportId.value = response.reportId;

        toastService.show('¡Listo! Notas sincronizadas correctamente.');
        setTimeout(() => toastService.hide(), 1000);
      } catch (e) {
        console.error(e);
      } finally {
        syncingCourseId.value = null;
        syncingInProgress.value = false;
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      customizeSynchronizationModal,
      synchronizationReportModal,
      academicPeriodGroupId,
      academicPeriodGroups,
      academicPeriodId,
      currentCourseId,
      loadingCourses,
      currentData,
      ownerUserId,
      modalDelete,
      dataCourses,
      reportId,

      CloseCustomizeSynchronizationModal,
      openCustomizeSynchronizationModal,
      closeSynchronizationReportModal,
      openConfirmDelete,
      confirmDelete,
      syncLMS,
      syncingCourseId,
      syncingInProgress,
      academicPeriods: activeAcademicPeriods,
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
