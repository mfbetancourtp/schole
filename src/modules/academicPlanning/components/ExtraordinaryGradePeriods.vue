<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicPlanning.academicPeriods' }" />
      <AppCheckPermission permission="academicPlanning.ExtraordinaryGradePeriods.create">
        <AppButton style="color: white" variant="primary" label="core.new" @click="toggleDrawerCreate(null)" />
      </AppCheckPermission>
    </template>

    <template #content>
      <AppDatatable :service="getExtraordinaryGradePeriods" :params="datatableParams" :name="name">
        <template v-slot:filters>
          <AppFilter v-model="levelId">
            <label for="levelId">{{ t('academicPrograms.levels.singular') }}</label>
            <v-select @option:selected="getDegrees()" :reduce="(level: any) => level.id" :options="levels" input-id="levelId" v-model="levelId" class="bg-white" label="name"></v-select>
          </AppFilter>

          <AppFilter v-model="degreeId">
            <label for="degreeId">{{ t('academicPrograms.degrees.singular') }}</label>
            <v-select @option:selected="getGroups()" :reduce="(degree: any) => degree.id" :options="degrees" input-id="degreeId" v-model="degreeId" class="bg-white" label="name"></v-select>
          </AppFilter>

          <AppFilter v-model="groupId">
            <label for="groupId">{{ t('institutionalConfiguration.auxiliaryInformation.groups.singular') }}</label>
            <v-select :reduce="(group: any) => group.id" :options="groups" input-id="groupId" v-model="groupId" class="bg-white" label="name"></v-select>
          </AppFilter>
          <AppFilter v-model="teacherId">
            <label for="teacherId">{{ t('core.generalTerms.academic.teacher.singular') }}</label>
            <v-select
              :placeholder="`${t('core.remoteSelect.start')}2${t('core.remoteSelect.end')}`"
              :reduce="(teacher: any) => teacher.id"
              :options="teachers"
              @search="searchTeachers"
              input-id="teacherId"
              v-model="teacherId"
              class="bg-white"
              label="name"
            ></v-select>
          </AppFilter>
        </template>

        <AppDatatableColumn :label="t('core.menu.name')" field="name" :sortable="true" v-slot="{ row }">
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('core.start')" field="extendedStartDateTime" :sortable="true" v-slot="{ row }">
          {{ formatDate(row.extendedStartDateTime) }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('academicPlanning.academicPeriods.form_end_date')" field="extendedEndDateTime" :sortable="true" v-slot="{ row }">
          {{ formatDate(row.extendedEndDateTime) }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('core.generalTerms.academic.course.plural')" :sortable="false" v-slot="{ row }">
          <div v-for="group in groupCoursesByTeacher(row.courses)" :key="group.teacher" class="teacher-group mb-1">
            <span class="fw-semibold me-1">{{ group.teacher }}:</span>
            <AppBadge v-for="course in group.courses" :key="course" :label="course" class="me-1 mb-1" />
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('core.table.actions')" v-slot="{ row }">
          <AppButtonGroup size="sm">
            <AppCheckPermission permission="academicPlanning.ExtraordinaryGradePeriods.edit">
              <AppButtonEdit @click="toggleDrawerCreate(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="academicPlanning.ExtraordinaryGradePeriods.delete">
              <AppButtonDelete @click="openConfirmDelete(row)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <!-- Drawer for create/edit -->
      <AppDrawer size="lg" :isVisible="showDrawerCreate" @update:isVisible="toggleDrawerCreate">
        <template #head>
          <span class="title-form">{{ t(title) }}</span>
        </template>
        <template #body>
          <AppPulseLoading v-if="loading"></AppPulseLoading>
          <template v-else>
            <!-- Section tabs -->
            <div class="section-form" style="position: sticky; top: 0; z-index: 2" ref="sectionTabs">
              <div class="section-content">
                <button :class="{ selected: activeSection === 'cursos' }" @click="setActive('cursos')">
                  {{ t('course.section.cursos') }}
                </button>
                <button :class="{ selected: activeSection === 'general' }" @click="setActive('general')">
                  {{ t('course.section.general') }}
                </button>
              </div>
            </div>

            <!-- Section content -->
            <div class="content-form">
              <!-- Cursos Section -->
              <div v-if="activeSection === 'cursos'">
                <AppFilter v-model="levelId">
                  <label for="levelId">{{ t('academicPrograms.levels.singular') }}</label>
                  <v-select @option:selected="getDegrees()" :reduce="(level: any) => level.id" :options="levels" input-id="levelId" v-model="levelId" class="bg-white" label="name"></v-select>
                </AppFilter>

                <AppFilter v-model="degreeId">
                  <label for="degreeId">{{ t('academicPrograms.degrees.singular') }}</label>
                  <v-select @option:selected="getGroups()" :reduce="(degree: any) => degree.id" :options="degrees" input-id="degreeId" v-model="degreeId" class="bg-white" label="name"></v-select>
                </AppFilter>

                <AppFilter v-model="groupId">
                  <label for="groupId">{{ t('institutionalConfiguration.auxiliaryInformation.groups.singular') }}</label>
                  <v-select :reduce="(group: any) => group.id" :options="groups" input-id="groupId" v-model="groupId" class="bg-white" label="name"></v-select>
                </AppFilter>
                <AppFilter v-model="teacherId">
                  <label for="teacherId">{{ t('core.generalTerms.academic.teacher.singular') }}</label>
                  <v-select
                    :placeholder="`${t('core.remoteSelect.start')}2${t('core.remoteSelect.end')}`"
                    :reduce="(teacher: any) => teacher.id"
                    :options="teachers"
                    @search="searchTeachers"
                    input-id="teacherId"
                    v-model="teacherId"
                    class="bg-white"
                    label="name"
                  ></v-select>
                </AppFilter>

                <!-- <AppButton @click="loadCourses()">
                  {{ t('classroom.homeTeacher.filter') }}
                </AppButton> -->

                <div v-if="showCourseAlert" ref="courseAlert" class="alert alert-warning mt-3 text-center" role="alert">
                  <AppIcon icon="exclamation-triangle" size="lg" class="me-1" />
                  <strong>{{ t('course.alert.select') }}</strong>
                </div>

                <AppFormField>
                  <div class="course-card-container mt-3">
                    <div v-for="course in courseList" :key="course.id" class="course-card" :class="{ selected: courseSelected.includes(course.id) }" @click="toggleCourseSelection(course.id)">
                      <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                        <AppAvatar :size="'sm'" :avatar="course.teacher.avatar" :name="course.teacher.names || '?'"> </AppAvatar>
                        <div class="tw-min-w-0 tw-ml-4">
                          <div class="tw-font-medium tw-leading-5 tw-truncate">
                            {{ course.teacher.names }}
                          </div>
                          <div class="tw-leading-5 tw-truncate tw-font-light">
                            {{ course.teacher.lastnames }}
                          </div>
                        </div>
                      </div>
                      {{ course.name }}
                    </div>
                  </div>
                </AppFormField>
              </div>

              <!-- General Section -->
              <div v-if="activeSection === 'general'">
                <AppFormField :form-control="v$.form.name">
                  <label for="name">{{ t('core.name') }}</label>
                  <input id="name" v-model="form.name" type="text" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.extendedStartDateTime">
                  <label for="start">{{ t('academicPlanning.academicPeriods.start_date') }}</label>
                  <input id="start" v-model="form.extendedStartDateTime" type="datetime-local" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.extendedEndDateTime">
                  <label for="end">{{ t('academicPlanning.academicPeriods.end_date') }}</label>
                  <input id="end" v-model="form.extendedEndDateTime" type="datetime-local" class="form-control" />
                </AppFormField>
              </div>
            </div>
          </template>
        </template>

        <template #footer>
          <div class="footer-buttons">
            <AppButton v-if="activeSection === 'cursos'" @click="nextSection">
              {{ t('core.next') }}
            </AppButton>
            <AppButton v-else @click="save" label="core.save" />
          </div>
        </template>
      </AppDrawer>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal @confirmDelete="confirmDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { debounce } from 'ts-debounce';

import dayjs from 'dayjs';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

// Components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';

// Services and stores
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetExtraordinaryGradePeriods } from '../services/getExtraordinaryGradePeriods.service';
import { CreateOrUpdateExtraordinaryGradePeriodService } from '../services/createOrUpdateExtraordinaryGradePeriod.service';
import { DeleteExtraordinaryGradePeriodOffensesService } from '../services/deleteExtraordinaryGradePeriodOffenses.service';
import { GetActiveCoursesService } from '../../administration/services/getActiveCourses.service';
import { GetLevelsByAcademicPeriodIdService } from '../../administration/services/getLevelsByAcademicPeriodId.service';
import { GetTeachersSelectService } from '../services/getTeachersSelect.service';
import { useHeaderStore } from '../../../stores/header.store';

// DTOs
import type { CourseDto } from '../dtos/schedule.dto';
import AppAvatar from '../../../shared/components/AppAvatar.vue';

export default defineComponent({
  name: 'ExtraordinaryGradePeriods',
  components: {
    AppBaseList,
    AppDatatable,
    AppDatatableColumn,
    AppDrawer,
    AppButton,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppButtonDelete,
    AppCheckPermission,
    AppModal,
    AppConfirmDeleteModal,
    AppFormField,
    AppFilter,
    AppBadge,
    AppIcon,
    AppPulseLoading,
    AppAvatar,
  },
  setup() {
    const { t } = useI18n();
    const title = t('course.uploadExtraordinaryNotes');
    useMeta({ title });

    const route = useRoute();
    const periodId = ref<number>(Number(route.params.periodId));

    // UI state
    const loading = ref(true);
    const showDrawerCreate = ref(false);
    const activeSection = ref<'cursos' | 'general'>('cursos');
    const modalDelete = ref(false);
    const showCourseAlert = ref(false);
    const courseAlert = ref<HTMLElement | null>(null);

    // Data lists
    const courseList = ref<CourseDto[]>([]);
    const courseSelected = ref<number[]>([]);

    // Form state
    const form: any = reactive({
      id: null,
      name: '' as string,
      extendedStartDateTime: '' as string,
      extendedEndDateTime: '' as string,
      courses: [] as number[],
    });

    // Validation
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          extendedStartDateTime: { required },
          extendedEndDateTime: { required },
        },
      },
      { form }
    );

    // Services
    const updateDatatableService = new UpdateDatatableService();
    const getExtraordinaryGradePeriods = new GetExtraordinaryGradePeriods();
    const createOrUpdateExtraordinaryGradePeriodService = new CreateOrUpdateExtraordinaryGradePeriodService();
    const deleteExtraordinaryGradePeriodOffensesService = new DeleteExtraordinaryGradePeriodOffensesService();
    const getActiveCoursesService = new GetActiveCoursesService();
    const getLevelsByAcademicPeriodIdService = new GetLevelsByAcademicPeriodIdService();
    const getTeachersSelectService = new GetTeachersSelectService();

    const headerStore = useHeaderStore();

    // Filters

    const levels = ref<any[]>([]);
    const degrees = ref<any[]>([]);
    const groups = ref<any[]>([]);
    const teachers = ref<any[]>([]);
    const levelId = ref<number | null>(null);
    const degreeId = ref<number | null>(null);
    const groupId = ref<number | null>(null);
    const teacherId = ref<number | null>(null);

    const datatableParams = computed(() => {
      return {
        periodId: periodId.value?? undefined,
        levelId: levelId.value?? undefined,
        degreeId: degreeId.value?? undefined,
        groupId: groupId.value?? undefined,
        teacherId: teacherId.value?? undefined,
      };
    });

    // Formatting
    const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm');

    // Fetch initial data
    onMounted(async () => {
      const id = Number(route.params.academicPeriodId);
      if (id) {
        await getLevelsFromAcademicPeriodId(id);
      }

      await loadCourses();

      headerStore.module = { name: 'Planeación académica', url: '' };
      headerStore.moduleItem = {
        name: t('core.menu.academicPeriods'),
        url: '',
      };
      headerStore.moduleSubItem = { name: title, url: '' };
      try {
        await loadCourses();
      } finally {
        loading.value = false;
      }
    });

    // Methods
    const loadCourses = async () => {
      const response = await getActiveCoursesService.run({
        academicPeriodId: Number(route.params.academicPeriodId),
        levelIds: levelId.value,
        degreeIds: degreeId.value,
        groupIds: groupId.value,
        teacherIds: teacherId.value,
      });
      courseList.value = response.flatMap((g: any) => g.courses);
    };

    const groupCoursesByTeacher = (courses: any[]) => {
      const map = new Map<string, string[]>();
      courses.forEach((c) => {
        const list = map.get(c.teacherName) || [];
        list.push(c.courseName);
        map.set(c.teacherName, list);
      });
      return Array.from(map, ([teacher, courses]) => ({ teacher, courses }));
    };

    const scrollTo = async (el: HTMLElement | null) => {
      await nextTick();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const getLevelsFromAcademicPeriodId = async (academicPeriodIdFilter: any = null) => {
      console.log('holaa');

      levels.value = [];
      degrees.value = [];
      groups.value = [];
      teachers.value = [];

      levelId.value = null;
      degreeId.value = null;
      groupId.value = null;
      teacherId.value = null;

      let permission = 'classroom-administration.home-teacher';
      let id = Number(route.params.academicPeriodId) ?? academicPeriodIdFilter;
      const response = await getLevelsByAcademicPeriodIdService.run(id, permission);
      console.log('hola response', response);

      levels.value = response;
    };
    const getDegrees = async (levelIdFilter: any = null) => {
      degrees.value = [];
      groups.value = [];
      teachers.value = [];

      degreeId.value = null;
      groupId.value = null;
      teacherId.value = null;

      levels.value.map((level: any) => {
        if (level.id == levelId.value || level.id == levelIdFilter) {
          degrees.value = level.degrees;
        }
      });
    };

    const getGroups = (degreeIdFilter: any = null) => {
      groups.value = [];

      degrees.value.map((degree: any) => {
        if (degree.id == degreeId.value || degree.id == degreeIdFilter) {
          groups.value = degree.groups;
        }
      });
    };
    const searchTeachers = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          teachers.value = [];
          const response = await getTeachersSelectService.run({
            search: search,
          });

          response.data.forEach((teacher: any) => {
            teachers.value.push({
              ...teacher,
              name: teacher.people.names + ' ' + teacher.people.lastnames,
            });
          });
        } else {
          teachers.value = [];
        }

        loading(false);
      }
    }, 800);
    const openLmsCourse = (url: string) => {
      window.open(url, '_blank');
    };
    const scrollToCourseAlert = async () => {
      await nextTick();
      courseAlert.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };

    const setActive = (section: 'cursos' | 'general') => {
      if (section === 'general' && !courseSelected.value.length) {
        showCourseAlert.value = true;
        scrollTo(courseAlert.value);
        return;
      }
      activeSection.value = section;
    };

    const nextSection = () => setActive('general');

    const toggleDrawerCreate = async (data: any | null) => {
      showDrawerCreate.value = !showDrawerCreate.value;
      activeSection.value = 'cursos';
      if (data) {
        Object.assign(form, {
          id: data.id,
          name: data.name,
          extendedStartDateTime: data.extendedStartDateTime,
          extendedEndDateTime: data.extendedEndDateTime,
          courses: data.courses.map((c: any) => c.courseId),
        });
        courseSelected.value = form.courses;
      } else {
        Object.assign(form, {
          id: null,
          name: '',
          extendedStartDateTime: '',
          extendedEndDateTime: '',
          courses: [],
        });
        courseSelected.value = [];
      }
      await getLevelsFromAcademicPeriodId(periodId.value);
    };

    const toggleCourseSelection = (courseId: number) => {
      const i = courseSelected.value.indexOf(courseId);
      if (i >= 0) courseSelected.value.splice(i, 1);
      else courseSelected.value.push(courseId);
      form.courses = [...courseSelected.value];
      if (courseSelected.value.length) showCourseAlert.value = false;
    };

    const save = async () => {
      if (!courseSelected.value.length) return setActive('cursos');
      const valid = await v$.value.$validate();
      if (!valid) return;
      levelId.value = null;
      degreeId.value = null;
      groupId.value = null;
      teacherId.value = null;
      const payload = {
        periodId: periodId.value,
        ...form,
      };
      await createOrUpdateExtraordinaryGradePeriodService.run(payload, form?.id);

      await updateDatatableService.run();
      showDrawerCreate.value = false;
      showCourseAlert.value = false;
      v$.value.$reset();
    };

    const openConfirmDelete = (row: any) => (modalDelete.value = true) && (form.id = row.id);

    const confirmDelete = async () => {
      await deleteExtraordinaryGradePeriodOffensesService.run(form.id as number);
      await updateDatatableService.run();
      modalDelete.value = false;
    };

    // Watchers
    watch([levelId, degreeId, groupId, teacherId], loadCourses);
    // al cerrar el drawer, ocultamos siempre la alerta de cursos
    watch(showDrawerCreate, (visible) => {
      if (!visible) {
        showCourseAlert.value = false;
        v$.value.$reset();
      }
    });

    return {
      t,
      title,
      name: title,
      loading,
      getExtraordinaryGradePeriods,
      datatableParams,
      courseList,
      courseSelected,
      form,
      v$,
      levels,
      degrees,
      groups,
      teachers,
      levelId,
      degreeId,
      groupId,
      teacherId,
      showDrawerCreate,
      activeSection,
      showCourseAlert,
      modalDelete,
      toggleDrawerCreate,
      formatDate,
      groupCoursesByTeacher,
      setActive,
      nextSection,
      loadCourses,
      toggleCourseSelection,
      save,
      openConfirmDelete,
      confirmDelete,
      courseAlert,
      getDegrees,
      getGroups,
      searchTeachers,
      scrollToCourseAlert,
    };
  },
});
</script>

<style scoped>
.title-form {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}
.section-tabs {
  display: flex;
  background: #f4f6f8;
}
.section-tabs button {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s;
}
.section-tabs button.selected {
  background: var(--color-primary);
  color: #fff;
  transform: translateY(-2px);
  font-weight: bold;
}
/* .content-form {
  padding: 1rem;
  overflow-y: auto;
} */
.course-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.course-card {
  box-sizing: border-box;
  flex: 0 0 calc(50% - 0.25rem); /* 0.5rem gap dividido entre 2 columnas */
  padding: 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
}
.course-card.selected {
  background: var(--color-primary);
  color: #fff;
}
.teacher-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.section-content {
  min-height: 38px;
  background-color: #f4f6f8;
  padding: 10px 8px;
  display: flex;
}

.section-content button {
  padding: 8px 0px;

  /*margin-right: 10px;
  border: 1px solid #ccc;
  background-color: white;*/
  cursor: pointer;
  border-radius: 12px;
  flex: 1 1 0px;
  color: #8d8d8d;
  transition: all 0.55s ease;
  font-size: 0.875rem;
  /*font-weight: bold;*/
  letter-spacing: 0.2px;
  transform: translatey(0);
}

.section-content button.selected {
  background-color: var(--color-primary);
  color: #fff;
  border-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translatey(-2px);
  font-weight: bold;
}
.content-form {
  padding: 20px;
  /* max-height: 76vh;*/
  overflow-y: auto;
}
</style>
