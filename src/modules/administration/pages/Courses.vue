<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <section>
          <AppButton class="mb-4" @click="toggleDrawerCreate()">
            <AppIcon icon="sliders-h"></AppIcon>
            {{ t('classroom.homeTeacher.showFilter') }}
          </AppButton>

          <!-- Drawer for create/edit -->
          <AppDrawer size="md" :overlayUnset="true" :isVisible="showDrawerCreate" @update:isVisible="toggleDrawerCreate">
            <template #head>
              <span class="title-form">{{ t(title) }}</span>
            </template>
            <template #body>
              <AppPulseLoading v-if="loading"></AppPulseLoading>
              <template v-else>
                <!-- Section tabs -->

                <!-- Section content -->
                <div class="content-form">
                  <!-- Cursos Section -->
                  <div>
                    <AppFilter v-model="academicPeriodId" filter-name="homeTeacher.academicPeriodId">
                      <label for="academicPeriodId">{{ t('academicPlanning.academicPeriods.singular') }}</label>
                      <AppAutocomplete
                        v-model="academicPeriodId"
                        :options="activeAcademicPeriods"
                        input-id="academicPeriodId"
                        label="name"
                        :reduce="(ap: any) => ap.id"
                        clearable
                        class="bg-white"
                        @update:modelValue="getLevelsFromAcademicPeriodId()"
                      />
                    </AppFilter>
                    <AppFilter v-model="levelId">
                      <label for="levelId">{{ t('academicPrograms.levels.singular') }}</label>
                      <AppAutocomplete
                        v-model="levelId"
                        :options="levels"
                        input-id="levelId"
                        label="name"
                        :reduce="(lvl: any) => lvl.id"
                        multiple
                        clearable
                        class="bg-white"
                        @update:modelValue="getDegrees()"
                      />
                    </AppFilter>

                    <AppFilter v-model="degreeId">
                      <label for="degreeId">{{ t('academicPrograms.degrees.singular') }}</label>
                      <AppAutocomplete
                        v-model="degreeId"
                        :options="degrees"
                        input-id="degreeId"
                        label="name"
                        :reduce="(deg: any) => deg.id"
                        multiple
                        clearable
                        class="bg-white"
                        @update:modelValue="getGroups()"
                      />
                    </AppFilter>

                    <AppFilter v-model="groupId">
                      <label for="groupId">{{ t('institutionalConfiguration.auxiliaryInformation.groups.singular') }}</label>
                      <AppAutocomplete v-model="groupId" :options="groups" input-id="groupId" label="name" :reduce="(grp: any) => grp.id" multiple clearable class="bg-white" />
                    </AppFilter>

                    <AppFilter v-model="courseIds">
                      <label for="courseIds">{{ t('classroom.homeTeacher.course') }}</label>
                      <AppAutocomplete v-model="courseIds" :options="courseList" input-id="courseIds" label="name" :reduce="(tchr: any) => tchr.id" multiple clearable class="bg-white" />
                    </AppFilter>
                    <!-- <AppButton @click="loadCourses()">
                  {{ t('classroom.homeTeacher.filter') }}
                </AppButton> -->

                    <AppFormField>
                      <label for="courseIds">{{ t('core.generalTerms.academic.teacher.plural') }}</label>
                      <div class="course-card-container mt-3">
                        <div
                          v-for="teacher in teachers"
                          :key="teacher.id"
                          class="course-card"
                          :class="{
                            selected: teacherSelected.includes(teacher.id),
                          }"
                          @click="toggleCourseSelection(teacher.id)"
                        >
                          <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                            <AppAvatar :size="'sm'" :avatar="teacher.avatar" :name="`${teacher['people.names'] ?? ''}`.trim()"> </AppAvatar>
                            <div class="tw-min-w-0 tw-ml-4">
                              <div class="tw-font-medium tw-leading-5 tw-truncate">
                                {{ `${teacher['people.names'] ?? ''} `.trim() }}
                              </div>
                              <div class="tw-leading-5 tw-truncate tw-font-light">
                                {{ ` ${teacher['people.lastnames'] ?? ''}`.trim() }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AppFormField>
                  </div>
                </div>
              </template>
            </template>

            <template #footer>
              <div class="footer-buttons">
                <!-- <AppButton @click="buttonFilter">
              {{ t('core.next') }}
            </AppButton> -->
              </div>
            </template>
          </AppDrawer>
        </section>

        <div class="cards">
          <div class="card__subjects">
            <AppCard v-for="(item, index) in courses.value" :key="index">
              <template #title>
                <div class="content-header">
                  <h3 class="title-content">{{ item.degree.name }} {{ item.group.name }}</h3>
                  <div class="d-flex flex-wrap justify-content-end gap-2">
                    <AppCheckPermission permission="classroom.observationGeneral.list" :notSee="true">
                      <AppButton
                        label="classroom.observationGeneral.title"
                        :to="{
                          name: 'administration.homeTeacher.observationGeneral',
                          params: {
                            courseId: item.courses[0].id,
                            academicPeriodGroupId: item.courses[0].academicPeriodGroupId,
                          },
                        }"
                      >
                      </AppButton>
                    </AppCheckPermission>
                    <AppCheckPermission permission="classroom.attendanceGeneral.list" :notSee="true">
                      <AppButton
                        label="classroom.attendance.attendanceGeneral.title"
                        :to="{
                          name: 'administration.homeTeacher.attendanceGeneral',
                          params: {
                            courseId: item.courses[0].id,
                            academicPeriodGroupId: item.courses[0].academicPeriodGroupId,
                          },
                        }"
                      >
                      </AppButton>
                    </AppCheckPermission>
                  </div>
                </div>
              </template>
              <template #body>
                <AppLoading v-if="loading"></AppLoading>
                <template v-else>
                  <AppEmptyResponse v-if="!courses.value.length" :show-image="true"></AppEmptyResponse>
                  <div class="card-container" v-else>
                    <div class="container-items" v-for="(subjet, index) in item?.courses" :key="index">
                      <AppCardSubjects
                        :titleCard="subjet.name"
                        :nameTeacherName="subjet.teacher.names"
                        :nameTeacherLastName="subjet.teacher.lastnames"
                        :titleProgress="subjet.teacher ? 'Progreso Académico' : 'Actividades Recientes'"
                      >
                        <template #icon-teacher>
                          <div>
                            <AppAvatar :size="'lg'" :name="`${subjet?.teacher?.names}`" :avatar="subjet.teacher.avatar"> </AppAvatar>
                          </div>
                        </template>
                        <template #buttons-activitys>
                          <AppCheckPermission permission="classroom.activitiesTeacher.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacher.activities.activitySummary',
                                params: { courseId: subjet.id },
                              }"
                              @click="
                                selectTabsStore(
                                  'activities',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                    subjectAssignmentId: subjet.subjectAssignmentId,
                                  },
                                  'administration.homeTeacher.activities.activitySummary'
                                )
                              "
                            >
                              <div class="button__house button-container buttons-activitys">
                                <AppGetIcon name="activities" />
                                <span class="hover-text">Actividades</span>
                              </div>
                            </router-link>
                          </AppCheckPermission>
                          <AppCheckPermission permission="classroom.attendance.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacher.attendance',
                                params: { courseId: subjet.id },
                              }"
                              @click="
                                selectTabsStore(
                                  'atendence',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                    subjectAssignmentId: subjet.subjectAssignmentId,
                                  },
                                  'administration.homeTeacher.attendance'
                                )
                              "
                            >
                              <div class="button__course button-container buttons-activitys">
                                <AppGetIcon name="attendance" />
                                <span class="hover-text">Asistencia</span>
                              </div>
                            </router-link>
                          </AppCheckPermission>
                          <AppCheckPermission permission="classroom.competencies.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacher.competencies',
                                params: {
                                  courseId: subjet.id,
                                  academicPeriodGroupId: subjet.academicPeriodGroupId,
                                },
                              }"
                              @click="
                                selectTabsStore(
                                  'settingStudy',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                    subjectAssignmentId: subjet.subjectAssignmentId,
                                  },
                                  'administration.homeTeacher.competencies'
                                )
                              "
                            >
                              <div class="button__asist button-container buttons-activitys">
                                <AppGetIcon name="settings" />
                                <span class="hover-text">Competencias</span>
                              </div>
                            </router-link>
                          </AppCheckPermission>
                          <AppCheckPermission permission="classroom.activitiesClassification.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacher.activitiesClassification',
                                params: {
                                  courseId: subjet.id,
                                  academicPeriodGroupId: subjet.academicPeriodGroupId,
                                },
                              }"
                              @click="
                                selectTabsStore(
                                  'activitiesClassification',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                    subjectAssignmentId: subjet.subjectAssignmentId,
                                  },
                                  'administration.homeTeacher.activitiesClassification'
                                )
                              "
                            >
                              <div class="button__classification button-container buttons-activitys">
                                <AppGetIcon name="classification" />
                                <span class="hover-text">Clasificación de Actividades</span>
                              </div>
                            </router-link>
                          </AppCheckPermission>
                          <AppCheckPermission permission="classroom.planningWeeks.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacherPlanningWeeks',
                                params: {
                                  courseId: subjet.id,
                                  academicPeriodGroupId: subjet.academicPeriodGroupId,
                                },
                              }"
                              @click="
                                selectTabsStore(
                                  'planingClassrom',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                    subjectAssignmentId: subjet.subjectAssignmentId,
                                  },
                                  'administration.homeTeacherPlanningWeeks'
                                )
                              "
                            >
                              <div class="button__activity button-container buttons-activitys">
                                <AppGetIcon name="calendar" />
                                <span class="hover-text">Planeador de Clases</span>
                              </div>
                            </router-link>
                          </AppCheckPermission>
                          <!-- <AppCheckPermission permission="classroom.followUpToTopics.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacher.followUpToTopics',
                                params: { courseId: subjet.id },
                              }"
                              @click="
                                selectTabsStore(
                                  'reports',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                  },
                                  'administration.homeTeacher.followUpToTopics'
                                )
                              "
                            >
                              <div class="button__reports button-container buttons-activitys">
                                <AppGetIcon name="reports" />
                                <span class="hover-text">Reportes</span>
                              </div>
                            </router-link>
                          </AppCheckPermission> -->

                          <AppCheckPermission permission="classroom.newSletters.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacher.newSletters',
                                params: { courseId: subjet.id },
                              }"
                              @click="
                                selectTabsStore(
                                  'newSletters',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                    subjectAssignmentId: subjet.subjectAssignmentId,
                                  },
                                  'administration.homeTeacher.newSletters.list'
                                )
                              "
                            >
                              <div class="button__certificate button-container buttons-activitys">
                                <AppGetIcon name="certificateFile" />
                                <span class="hover-text">Observaciones</span>
                              </div>
                            </router-link>
                          </AppCheckPermission>
                          <AppCheckPermission permission="classroom.homeTeacher.leveling.list" :notSee="true">
                            <router-link
                              :to="{
                                name: 'administration.homeTeacher.leveling',
                                params: {
                                  courseId: subjet.id,
                                  subjectAssignmentId: subjet?.subjectAssignmentId,
                                },
                              }"
                              @click="
                                selectTabsStore(
                                  'leveling',
                                  {
                                    courseId: subjet.id,
                                    academicPeriodGroupId: subjet.academicPeriodGroupId,
                                    subjectAssignmentId: subjet.subjectAssignmentId,
                                  },
                                  'administration.leveling.list'
                                )
                              "
                            >
                              <div class="button__leveling button-container buttons-activitys">
                                <AppGetIcon name="leveling" strokeColor="#000" />
                                <span class="hover-text">{{ t('classroom.homeTeacher.leveling.title') }}</span>
                              </div>
                            </router-link>
                          </AppCheckPermission>
                          <AppCheckPermission permission="classroom.followUpToTopics.list">
                            <div v-if="subjet.syncOnlyFinalQuality === 1">
                              <router-link
                                :to="{
                                  name: 'administration.homeTeacherFinalReportCard',
                                  params: { courseId: subjet.id },
                                }"
                              >
                                <div class="button__reports button-container buttons-activitys">
                                  <AppGetIcon name="endNotes" />
                                  <span class="hover-text">Notas Finales</span>
                                </div>
                              </router-link>
                            </div>
                          </AppCheckPermission>

                          <div v-if="subjet.lmsInstitutionPlatformId && subjet.lmsCourseId">
                            <div v-if="subjet?.sso === true">
                              <a style="cursor: pointer" class="p-2 text-dark text-decoration-none pe-1" target="_blank" @click="goToSingleSignOn(subjet.id)"
                                ><div class="button__house button-container buttons-activitys">
                                  <AppGetIcon name="iconHose" />
                                  <span class="hover-text">Abrir Curso LMS</span>
                                </div></a
                              >
                            </div>
                            <div v-else>
                              <a style="cursor: pointer" class="p-2 text-dark text-decoration-none pe-1" :href="subjet.urlLms" target="_blank">
                                <div class="button__house button-container buttons-activitys">
                                  <AppGetIcon name="iconHose" />
                                  <span class="hover-text">Abrir Curso LMS</span>
                                </div></a
                              >
                            </div>
                          </div>
                        </template>
                        <template #graph>
                          <div class="graph__container">
                            <span class="title-graph">Niveles de desempeño</span>
                            <div class="bar__container">
                              <div class="bar__progress progress">
                                <div
                                  class="progress-bar"
                                  :style="{
                                    width: subjet.percentageLearningOutcomes + '%',
                                  }"
                                >
                                  {{ subjet.percentageLearningOutcomes.split('.')[0] }}%
                                </div>
                                <span class="text__hover">Porcentaje Avance de Indicadores</span>
                              </div>
                            </div>
                          </div>
                          <!-- <div class="graph__container">
                            <span class="title-graph">Temas</span>
                            <div class="bar__container">
                              <div class="bar__progress progress">
                                <div
                                  class="progress-bar"
                                  :style="{
                                    width: subjet.percentageTopics + '%',
                                  }"
                                >
                                  {{ subjet.percentageTopics.split('.')[0] }}%
                                </div>
                                <span class="text__hover">Porcentaje Avance de Temas</span>
                              </div>
                            </div>
                          </div> -->
                        </template>
                      </AppCardSubjects>
                    </div>
                  </div>
                </template>
              </template>
            </AppCard>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { debounce } from 'ts-debounce';
import { defineComponent, onMounted, reactive, ref, watch, watchEffect, computed } from 'vue';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
// import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { HomeTeacherCoursesDto } from '../dtos/homeTeacherCourses.dto';

import { GetActiveCoursesService } from '../services/getActiveCourses.service';
import { GetTeachersSelectService } from '../services/getTeachersSelect.service';
import { GetFiltersAttendanceService } from '../services/getFiltersAttendance.service';
import { GetLevelsByAcademicPeriodIdService } from '../services/getLevelsByAcademicPeriodId.service';
import { useHeaderStore } from '../../../stores/header.store';
import { useFiltersTeacherStore } from '../../../stores/filtersTeacher.store';
import { useTabsTeacherStore } from '../../../stores/tabsTeacher.store ';
import { PostLoginSSOService } from '../services/postLoginSSO.service';

import AppCardSubjects from '../../../shared/components/Card/AppCardSubjects.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

const postLoginSSOService = new PostLoginSSOService();
const getLevelsByAcademicPeriodIdService = new GetLevelsByAcademicPeriodIdService();
const getFiltersAttendanceService = new GetFiltersAttendanceService();
const getTeachersSelectService = new GetTeachersSelectService();
const getActiveCoursesService = new GetActiveCoursesService();

export default defineComponent({
  name: 'CoursesList',
  components: {
    AppCheckPermission,
    AppEmptyResponse,
    // AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppIcon,
    AppCard,
    AppCardSubjects,
    AppGetIcon,
    AppAvatar,
    AppDrawer,
    AppPulseLoading,
    AppAutocomplete,
  },

  setup() {
    const { t } = useI18n();
    const title = 'core.menu.home-teacher';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const filtersStore = useFiltersTeacherStore();
    const loadingCourses = ref(false);
    const loading = ref(true);

    const academicPeriodId = ref(filtersStore.academicPeriodId);
    const levelId = ref(filtersStore.levelId);
    const degreeId = ref(filtersStore.degreeId);
    const groupId = ref(filtersStore.groupId);
    const courseIds = ref(filtersStore.courseIds);
    const teacherId = ref(filtersStore.teacherId);

    const activeAcademicPeriods = ref([]);

    // filtro
    const showDrawerCreate = ref(false);
    const teacherSelected = ref<number[]>([]);
    /** Devuelve true si la referencia tiene “algo” seleccionado             */
    const hasValue = (v: any) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== 0 && v !== '');

    const courses: { value: HomeTeacherCoursesDto[] } = reactive({
      value: [],
    });
    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });
    const levels = ref<any[]>([]);
    const degrees = ref<any[]>([]);
    const groups = ref<any[]>([]);
    const teachers = ref<any[]>([]);
    const courseList = ref<any[]>([]);
    /* ---------- 1.  Agrupa filtros principales en un computed ---------- */
    const mainFiltersKey = computed(() =>
      [
        academicPeriodId.value,
        levelId.value, // observamos el *contenido*
        degreeId.value,
        groupId.value,
      ].join('|')
    );
    const tabsStore = useTabsTeacherStore();
    const selectTabsStore = (selectTabs: string, params: any, router: string) => {
      (tabsStore.planingClassrom = {
        active: selectTabs === 'planingClassrom',
        params: params,
        router: (router = 'administration.homeTeacherPlanningWeeks'),
      }),
        (tabsStore.activitiesClassification = {
          active: selectTabs === 'activitiesClassification',
          params: params,
          router: (router = 'administration.homeTeacher.activitiesClassification'),
        }),
        (tabsStore.settingStudy = {
          active: selectTabs === 'settingStudy',
          params: params,
          router: (router = 'administration.homeTeacher.competencies'),
        }),
        (tabsStore.activities = {
          active: selectTabs === 'activities',
          params: params,
          router: (router = 'administration.homeTeacher.activities.activitySummary'),
        }),
        (tabsStore.atendence = {
          active: selectTabs === 'atendence',
          params: params,
          router: (router = 'administration.homeTeacher.attendance'),
        }),
        // (tabsStore.reports = {
        //   active: selectTabs === 'reports',
        //   params: params,
        //   router: (router = 'administration.homeTeacher.followUpToTopics'),
        // }),
        (tabsStore.newSletters = {
          active: selectTabs === 'newSletters',
          params: params,
          router: (router = 'administration.homeTeacher.newSletters'),
        });
      tabsStore.leveling = {
        active: selectTabs === 'leveling',
        params: params,
        router: (router = 'administration.homeTeacher.leveling'),
      };
    };

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        // 🔁 Obtener filtros del estado global
        console.log('filtersStore', filtersStore);

        academicPeriodId.value = filtersStore.academicPeriodId;
        levelId.value = filtersStore.levelId;
        degreeId.value = filtersStore.degreeId;
        groupId.value = filtersStore.groupId;
        courseIds.value = filtersStore.courseIds;
        teacherId.value = filtersStore.teacherId;
        teacherSelected.value = filtersStore.teacherId;
        console.log('filtersStore', filtersStore);

        // 🔍 Cargar catálogo de periodos académicos
        const filters: any = await getFiltersAttendanceService.run();
        academicPeriods.value = filters.academicPeriods;
        activeAcademicPeriods.value = filters.academicPeriods.filter((p: any) => p.active === 1);

        // 🧠 Si no hay periodo académico guardado, usar el primero activo
        if (!academicPeriodId.value && activeAcademicPeriods.value.length > 0) {
          academicPeriodId.value = activeAcademicPeriods.value[0]?.id;
        }

        // 🔁 Si ya hay filtros previos, carga sus catálogos dependientes
        if (academicPeriodId.value) await getLevelsFromAcademicPeriodId();
        if (levelId.value?.length) await getDegrees();
        if (degreeId.value?.length) getGroups();
        searchTeachers('', () => {});

        // 📚 Cargar cursos y docentes
        await getCourses();
        await loadCourses('', () => {});
      } catch (e) {
        console.error('Error al montar el componente:', e);
      }

      loading.value = false;
    });

    const getCourses = async () => {
      let params = {
        academicPeriodId: Array.isArray(academicPeriodId.value) ? academicPeriodId.value.join(',') : academicPeriodId.value,

        levelIds: Array.isArray(levelId.value) ? String(levelId.value.join(',')) : String(levelId.value) === '' ? levelId.value : levelId.value,

        degreeIds: Array.isArray(degreeId.value) ? degreeId.value.join(',') : degreeId.value,

        groupIds: Array.isArray(groupId.value) ? groupId.value.join(',') : groupId.value,

        coursesIds: Array.isArray(courseIds.value) ? courseIds.value.join(',') : courseIds.value,

        teacherIds: Array.isArray(teacherId.value) ? teacherId.value.join(',') : teacherId.value,
      };

      const response = await getActiveCoursesService.run(params);
      courses.value = response;
      loadingCourses.value = false;
    };

    const getLevelsFromAcademicPeriodId = async (academicPeriodIdFilter: any = null) => {
      levels.value = [];
      degrees.value = [];
      groups.value = [];

      let permission = 'classroom-administration.home-teacher';

      levels.value = await getLevelsByAcademicPeriodIdService.run(academicPeriodId.value ?? academicPeriodIdFilter, permission);
    };

    const getDegrees = async (extraIds: number[] | number | null = null) => {
      degrees.value = [];
      groups.value = [];

      /* 🔗 construye el set de IDs a filtrar */
      const ids = new Set<number>([
        ...levelId.value, // lo que venga del selector
        ...(Array.isArray(extraIds) ? extraIds : extraIds ? [extraIds] : []),
      ]);

      /* 🔍 recorre niveles y agrega degrees que correspondan */
      levels.value.forEach((lvl: any) => {
        if (ids.has(lvl.id)) {
          degrees.value.push(...lvl.degrees);
        }
      });

      /* 🗑️  elimina duplicados por id */
      const unique = new Map<number, any>();
      degrees.value.forEach((d: any) => unique.set(d.id, d));
      degrees.value = Array.from(unique.values());
    };

    const getGroups = (extraIds: number[] | number | null = null) => {
      groups.value = [];

      const ids = new Set<number>([...degreeId.value, ...(Array.isArray(extraIds) ? extraIds : extraIds ? [extraIds] : [])]);

      degrees.value.forEach((deg: any) => {
        if (ids.has(deg.id)) {
          groups.value.push(...deg.groups);
        }
      });

      /* quitar duplicados */
      const unique = new Map<number, any>();
      groups.value.forEach((g: any) => unique.set(g.id, g));
      groups.value = Array.from(unique.values());
    };

    const searchTeachers = debounce(async (search: string, loading: Function) => {
      // if (search) {
      loading(true);

      // if (search.length >= 2) {
      teachers.value = [];
      const response = await getTeachersSelectService.run({
        academicPeriodId: Array.isArray(academicPeriodId.value) ? academicPeriodId.value.join(',') : academicPeriodId.value,
        levelIds: Array.isArray(levelId.value) ? levelId.value.join(',') : levelId.value,
        degreeIds: Array.isArray(degreeId.value) ? degreeId.value.join(',') : degreeId.value,
        groupIds: Array.isArray(groupId.value) ? groupId.value.join(',') : groupId.value,
        courseIds: Array.isArray(courseIds.value) ? courseIds.value.join(',') : courseIds.value,
        search: search,
        noPag: true,
        itemCode: 'classroomAdministration.homeTeacher',
      });
      response.forEach((teacher: any) => {
        teachers.value.push({
          ...teacher,
          name: `${teacher['people.names'] ?? ''} ${teacher['people.lastnames'] ?? ''}`.trim(),
        });
      });

      // } else {
      //   teachers.value = [];
      // }

      loading(false);
      // }
    }, 800);
    const openLmsCourse = (url: string) => {
      window.open(url, '_blank');
    };

    const goToSingleSignOn = async (id: number) => {
      if (courses.value.length > 0) {
        const response = await postLoginSSOService.run({ courseId: id });
        if (response) {
          openLmsCourse(response);
        }
      }
    };
    const getProfileIdFromLocalStorage = () => {
      const profileId = localStorage.getItem('profileId');
      return profileId ? parseInt(profileId) : null;
    };
    const profileId = ref(getProfileIdFromLocalStorage());
    watchEffect(() => {
      profileId.value = getProfileIdFromLocalStorage();
    });
    /* ---------- 1. watch de filtros “padre” ---------- */
    watch(
      mainFiltersKey,
      async () => {
        /* ⬇⬇ LIMPIA selección de docente si existía */
        if (hasValue(teacherId.value)) {
          teacherId.value = []; // ref que usa v-model
          teacherSelected.value = []; // array que pintas en las cards
        }

        /* recarga catálogos y lista de docentes */
        await Promise.all([getCourses(), loadCourses('', () => {}), searchTeachers('', () => {})]);
      },
      { flush: 'post' }
    );

    /* ---------- 2.  Cambio SOLO de `courseIds` ---------- */
    watch(
      courseIds,
      async () => {
        await searchTeachers('', () => {}); // sólo refresca docentes
        getCourses(); // mantiene cards actualizadas
      },
      { flush: 'post', deep: true }
    );

    /* ---------- 3.  Cambio SOLO de `teacherId` ---------- */
    watch(
      teacherId,
      async (n, o) => {
        if (n !== o) {
          // basta con que cambie el valor
          await getCourses();
        }
      },
      { flush: 'post' }
    );
    watch(
      [academicPeriodId, levelId, degreeId, groupId, courseIds, teacherId],
      () => {
        filtersStore.setFilters({
          academicPeriodId: academicPeriodId.value,
          levelId: levelId.value,
          degreeId: degreeId.value,
          groupId: groupId.value,
          courseIds: courseIds.value,
          teacherId: teacherId.value,
        });
      },
      { deep: true }
    );

    // filtro
    const toggleDrawerCreate = async () => {
      showDrawerCreate.value = !showDrawerCreate.value;
      if (showDrawerCreate.value === true && !levelId.value && !degreeId.value && !groupId.value && !courseIds.value && !teacherId.value) {
        await getLevelsFromAcademicPeriodId(academicPeriodId.value);
      }
      // await loadCourses();
    };

    // Methods
    const loadCourses = debounce(async (search: string, loading: Function) => {
      const response = await getActiveCoursesService.run({
        academicPeriodId: Array.isArray(academicPeriodId.value) ? academicPeriodId.value.join(',') : academicPeriodId.value,

        levelIds: Array.isArray(levelId.value) ? levelId.value.join(',') : levelId.value,

        degreeIds: Array.isArray(degreeId.value) ? degreeId.value.join(',') : degreeId.value,

        groupIds: Array.isArray(groupId.value) ? groupId.value.join(',') : groupId.value,

        teacherIds: Array.isArray(teacherId.value) ? teacherId.value.join(',') : teacherId.value,
      });

      courseList.value = response.flatMap((g: any) => g.courses);
    });

    // toggleCourseSelection de asignaturas
    const toggleCourseSelection = (courseId: number) => {
      const i = teacherSelected.value.indexOf(courseId);
      if (i >= 0) teacherSelected.value.splice(i, 1);
      else teacherSelected.value.push(courseId);
      teacherId.value = [...teacherSelected.value];
    };
    return {
      loading,
      routes,
      title,
      t,

      activeAcademicPeriods,
      loadingCourses,
      teachers,
      courses,
      degrees,
      levels,
      groups,

      academicPeriodId,
      levelId,
      degreeId,
      groupId,
      teacherId,
      courseIds,
      profileId,

      getLevelsFromAcademicPeriodId,
      searchTeachers,
      getDegrees,
      getCourses,
      getGroups,
      tabsStore,
      selectTabsStore,
      openLmsCourse,
      goToSingleSignOn,
      showDrawerCreate,
      toggleDrawerCreate,
      courseList,
      teacherSelected,
      toggleCourseSelection,
      loadCourses,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

.border-top-primary {
  border-top: 2px solid #00b0da;
}

.opc:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* .item-card {
  margin-bottom: 15px;
} */

.content-header {
  display: flex;
  padding: 0px 0px 15px 0px;
  justify-content: space-between;
  align-items: center;
}

.title-content {
  font-size: 22px;
  line-height: 20px;
  letter-spacing: 0.1px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: black;
}

.cards {
  width: 100%;
  gap: 7px;
  display: flex;
}

.card__subjects {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-container {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
}

.button__activity {
  background: #ffefc4;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__activity:hover {
  background: #ffe399;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.4);
}

.button__house {
  background: #bcedcc;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__house:hover {
  background: #91deaa;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}

.button__classification {
  background: #fbe2ff;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__classification:hover {
  background: #efb3f9;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}

.button__asist {
  background: #ffaeae;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__asist:hover {
  background: #fd8686;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}

.button__course {
  background: #f1f1f1;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__course:hover {
  background: #dfdfdf;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}

.button__reports {
  background: #ace6f1;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__reports:hover {
  background: #59cae0;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}
.button__certificate {
  color: #000;
  background: #f9a9ea;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__certificate:hover {
  background: #eb7ae9;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}
.button__leveling {
  color: #000;
  background: #ace6f1;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 7px;
}

.button__leveling:hover {
  background: #8ae1ef;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}
.buttons-activitys {
  position: relative;
}

.button-container:hover .hover-text {
  display: block;
}

.button-container {
  display: flex;
  justify-content: center;
}

.hover-text {
  position: absolute;
  left: 25%;
  top: -40%;
  z-index: 99;
  display: none;
  width: auto;
  padding: 6px 10px;
  white-space: nowrap;
  transform: translateY(-50%);
  background: white;
  color: black;
  border-radius: 4px;
  box-shadow: 1px 2px 6px #0006;
}

.title-graph {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: #3c4248;
}

.bar__container {
  position: relative;
  width: 100%;
}

.bar__container:hover .text__hover {
  display: block;
}

.bar__progress {
  background: #cdecf4;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  margin-bottom: 0.5rem;
}

.bar__progress:hover {
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}

.text__hover {
  position: absolute;
  left: 35%;
  top: -10%;
  z-index: 99;
  display: none;
  width: auto;
  padding: 6px 10px;
  white-space: nowrap;
  transform: translateY(-100%);
  background: white;
  color: black;
  border-radius: 4px;
  box-shadow: 1px 2px 6px #0006;
}

.content-filter {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  padding: 24px;
  height: auto;
  gap: 5px;
  justify-content: center;
  width: 100%;
}

@media (max-width: 550px) {
  .row {
    display: flex;
    flex-direction: column;
  }
}
.title-form {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}
.content-form {
  padding: 20px;
  /* max-height: 76vh;*/
  overflow-y: auto;
}
.course-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.course-card {
  flex: 0 0 calc(50% - 0.25rem);
  box-sizing: border-box;
  padding: 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  min-height: 80px; /* ajusta a tu gusto */
}

.course-card .tw-font-medium,
.course-card .tw-leading-5 {
  white-space: normal; /* PERMITIR que se vaya abajo */
  overflow: visible;
  text-overflow: unset;
}
.course-card.selected {
  background: var(--color-primary);
  color: #fff;
}
</style>
