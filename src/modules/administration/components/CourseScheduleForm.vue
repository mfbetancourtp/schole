<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'administration.courseSchedule' }"></AppButtonBack>

      <AppButton style="color: white;" class="text-white" label="core.save" @click="save()"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppCard>
          <template #body>
            <template v-if="synchronizedCourse">
              <p class="m-0 text-danger">
                Este curso ya ha sido sincronizado y no puede ser editado en este momento. Si necesita realizar cambios en
                el curso, póngase en contacto con el administrador del sistema.
              </p>
              <hr />
            </template>

            <template v-if="courseWithSameConfiguration">
              <p class="m-0 text-danger">
                {{ t('classroom.courseSchedule.form.duplicateCourseMessage') }}
              </p>
              <hr />
            </template>

            <section>
              <div class="form-row">
                <AppFormField class="" label="Grupo">
                  <AppAutocomplete :disabled="synchronizedCourse" v-model="academicPeriodGroupId"
                    :options="academicPeriodGroups"></AppAutocomplete>
                </AppFormField>

                <AppFormField :form-control="v$.form.subjectAssignmentId" label="Asignatura">
                  <AppAutocomplete :disabled="synchronizedCourse" v-model="v$.form.subjectAssignmentId.$model"
                    :options="subjectAssignments"></AppAutocomplete>
                </AppFormField>

                <AppFormField :form-control="v$.form.periodId">
                  <div class="d-flex justify-content-between">
                    <label>{{ t('core.generalTerms.academic.period.singular') }}</label>

                    <div>
                      <span v-if="currentPeriod" style="font-size: 0.9rem">{{ `(${currentPeriod.startDate} -
                                              ${currentPeriod.endDate})` }}</span>
                    </div>
                  </div>
                  <AppAutocomplete v-model="v$.form.periodId.$model" :options="periods"></AppAutocomplete>
                </AppFormField>
              </div>

              <div class="form-row">
                <AppFormField :form-control="v$.form.ownerUserId" label="Creador del Curso*">
                  <template v-if="!loadingTeacher">
                    <AppSearchTeachers :id="v$.form.ownerUserId.$model"
                      @user-data="(data) => (v$.form.ownerUserId.$model = data.id)"></AppSearchTeachers>
                  </template>
                </AppFormField>

                <AppFormField :form-control="v$.form.name" label="Nombre del curso">
                  <input :disabled="synchronizedCourse" v-model="v$.form.name.$model" class="form-control" type="text"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @" />
                </AppFormField>

                <AppFormField class="" :form-control="v$.form.quota" label="Cupo">
                  <input v-model="v$.form.quota.$model" class="form-control" type="number" />
                </AppFormField>
              </div>

              <div class="form-row">
                <AppFormField class="" :form-control="v$.form.startDate" label="Inicia">
                  <input v-model="v$.form.startDate.$model" id="startDate" class="form-control" type="date" />
                  <span v-if="startDateOutOfRange" class="text-danger" style="font-size: 0.9rem">Fecha fuera del
                    rango</span>
                </AppFormField>

                <AppFormField class="" :form-control="v$.form.endDate" label="Termina">
                  <input v-model="v$.form.endDate.$model" id="endDate" class="form-control" type="date" />
                  <span v-if="invalidDates" class="text-danger" style="font-size: 0.9rem">{{ t('Fecha no valida')
                  }}</span>
                  <span v-else-if="endDateOutOfRange" class="text-danger" style="font-size: 0.9rem">Fecha fuera del
                    rango</span>
                </AppFormField>

                <AppFormField class="col-3" :form-control="v$.form.isTooCourseLMS" label="Sincronizar el curso con LMS?">
                  <div class="mt-2 form-check form-switch">
                    <input :disabled="synchronizedCourse" class="form-check-input" type="checkbox" id="isTooCourseLMS"
                      v-model="v$.form.isTooCourseLMS.$model" />
                    <label class="form-check-label" for="isTooCourseLMS">{{ v$.form.isTooCourseLMS.$model ? t('Sí') :
                      t('No') }}</label>
                  </div>
                </AppFormField>

                <AppFormField :form-control="v$.form.lmsInstitutionPlatformId" label="LMS a utilizar">
                  <AppAutocomplete v-model="v$.form.lmsInstitutionPlatformId.$model" :options="lmsPlatforms">
                  </AppAutocomplete>
                </AppFormField>
              </div>

              <template v-if="v$.form.lmsInstitutionPlatformId.$model">
                <hr />

                <div class="form-row">
                  <AppFormField :form-control="v$.form.actionInLMS" label="Tipo de sincronización">
                    <AppAutocomplete v-model="v$.form.actionInLMS.$model" :options="actionsInLMS"></AppAutocomplete>
                  </AppFormField>

                  <template v-if="v$.form.actionInLMS.$model == 'createCourse'">
                    <AppFormField :form-control="v$.form.categoryIdLMS" label="Categoria destino en el LMS">
                      <AppAutocomplete v-model="v$.form.categoryIdLMS.$model" :options="categoriesLms"></AppAutocomplete>
                    </AppFormField>
                  </template>

                  <template v-if="v$.form.actionInLMS.$model == 'useCourse'">
                    <AppFormField :form-control="v$.form.templateCourseCodeLMS" label="Curso destino en el LMS">
                      <input v-model="v$.form.templateCourseCodeLMS.$model" class="form-control" type="text"
                        pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                        title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @" />
                    </AppFormField>
                  </template>

                  <AppFormField class="col-3" :form-control="v$.form.syncOnlyFinalQuality"
                    label="Sincronizar solo notas finales?">
                    <div class="mt-2 form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="syncOnlyFinalQuality"
                        v-model="v$.form.syncOnlyFinalQuality.$model" />
                      <label class="form-check-label" for="syncOnlyFinalQuality">{{ v$.form.syncOnlyFinalQuality.$model ?
                        t('Sí') : t('No') }}</label>
                    </div>
                  </AppFormField>
                </div>
              </template>
            </section>
          </template>
        </AppCard>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppSearchTeachers from '../../../shared/components/Forms/AppSearchTeachers.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { CreateOrUpdateCoursesService } from '../services/createOrUpdateCourses.service';
import { GetRelatedDataFormCourService } from '../services/getRelatedDataFormCour.service';
import { GetCoursesByAcadPeriIdService } from '../services/getCoursesByAcadPeriId.service';
import { GetCategoriesMoodleService } from '../../academicPlanning/services/getCategoriesMoodle.service';
import { useHeaderStore } from '../../../stores/header.store';

const getCoursesByAcadPeriIdService = new GetCoursesByAcadPeriIdService();
const getRelatedDataFormCourService = new GetRelatedDataFormCourService();
const createOrUpdateCoursesService = new CreateOrUpdateCoursesService();
const getCategoriesMoodleService = new GetCategoriesMoodleService();

export default defineComponent({
  name: 'CourseScheduleForm',
  components: {
    AppSearchTeachers,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppCard,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
      required: true,
    },
    data: {
      type: Object as PropType<any>,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const academicPeriodGroups: Ref<any[]> = ref([]);
    const subjectAssignments: Ref<any[]> = ref([]);
    const currentPeriod: Ref<any> = ref(null);
    const categoriesLms: Ref<any[]> = ref([]);
    const lmsPlatforms: Ref<any[]> = ref([]);
    const actionsInLMS: Ref<any[]> = ref([]);
    const dataCourses: Ref<any[]> = ref([]);
    const periods: Ref<any[]> = ref([]);

    const academicPeriodGroupId = ref();
    const academicPeriodId = ref();

    const courseWithSameConfiguration = ref(false);
    const startDateOutOfRange = ref(false);
    const synchronizedCourse = ref(false);
    const endDateOutOfRange = ref(false);
    const loadingTeacher = ref(false);
    const loading = ref(true);

    const form = reactive({
      academicPeriodId: props.data ? props.data.academicPeriodId : academicPeriodId,
      subjectAssignmentId: props.data ? props.data.subjectAssignmentId : null,
      periodId: props.data ? props.data.periodId : null,
      createdScheduleCourses: 1,

      ownerUserId: props.data ? props.data.ownerUserId : null,
      name: props.data ? props.data.name : null,
      quota: props.data ? props.data.quota : null,

      startDate: props.data ? props.data.startDate : null,
      endDate: props.data ? props.data.endDate : null,
      isTooCourseLMS: props.data ? (props.data.isTooCourseLMS ? true : false) : false,
      lmsInstitutionPlatformId: props.data ? props.data.lmsInstitutionPlatformId : null,

      actionInLMS: props.data ? props.data.actionInLMS : null,
      categoryIdLMS: props.data ? props.data.categoryIdLMS : null,
      templateCourseCodeLMS: props.data ? props.data.templateCourseCodeLMS : null,
      syncOnlyFinalQuality: props.data ? (props.data.syncOnlyFinalQuality ? true : false) : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: {},
          subjectAssignmentId: { required },
          periodId: {},
          createdScheduleCourses: {},

          ownerUserId: { required },
          name: { required },
          quota: {},

          startDate: { required },
          endDate: { required },
          isTooCourseLMS: {},
          lmsInstitutionPlatformId: {},

          actionInLMS: {},
          categoryIdLMS: {},
          templateCourseCodeLMS: {},
          syncOnlyFinalQuality: {},
        },
      },
      { form }
    );

    const invalidDates = computed(() => {
      let invalidDate = false;

      if (form.startDate && form.endDate && !dayjs(form.startDate).isSame(dayjs(form.endDate))) {
        invalidDate = dayjs(form.startDate).isAfter(dayjs(form.endDate));
      }

      return invalidDate;
    });

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Cronograma de cursos', url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        if (route.query.academicPeriodId) academicPeriodId.value = parseInt(route.query.academicPeriodId.toString(), 10);
        else if (props.data && props.data.academicPeriodId) academicPeriodId.value = props.data.academicPeriodId;

        if (academicPeriodId.value) {
          const response: any = await getRelatedDataFormCourService.run(academicPeriodId.value);

          academicPeriodGroups.value = response.academicPeriodGroups;
          actionsInLMS.value = response.actionsInLMS;
          lmsPlatforms.value = response.lmsPlatforms;
          periods.value = response.periods;

          academicPeriodGroups.value.forEach((item) => {
            item.name = `${item.degree.name} - ${item.group.name}`;
          });
          actionsInLMS.value.forEach((item) => {
            item.id = item.value;
            item.name = item.label;
          });
        }

        if (form.subjectAssignmentId) {
          academicPeriodGroups.value.forEach((item) => {
            item.subjectAssignments.forEach((item2: any) => {
              if (form.subjectAssignmentId == item2.id) {
                subjectAssignments.value = item.subjectAssignments;
                academicPeriodGroupId.value = item.id;
              }
            });
          });
        }

        if (props.data && form.lmsInstitutionPlatformId >= 0) await getCategoriesLms();

        // Existing course data to validate that a new course is not created with the same configuration.
        const response: any[] = await getCoursesByAcadPeriIdService.run(academicPeriodId.value as number, {});

        for (let i = 0; i < response.length; i++) {
          let courses: any[] = await response[i].courses;

          for (let j = 0; j < courses.length; j++) {
            dataCourses.value.push(courses[j]);
          }
        }

        if (props.data && props.data.lmsCourseId != null) synchronizedCourse.value = true;

        if (form.periodId) {
          currentPeriod.value = periods.value.filter((item) => item.id == form.periodId)[0];

          if (!props.data) {
            form.startDate = currentPeriod.value.startDate;
            form.endDate = currentPeriod.value.endDate;
          }

          if (form.startDate) dateOutOfRange(form.startDate, true);
          if (form.endDate) dateOutOfRange(form.endDate, false);
        } else {
          currentPeriod.value = null;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.lmsInstitutionPlatformId,
      async (value) => {
        if (value) await getCategoriesLms();
        else {
          form.actionInLMS = null;
          form.categoryIdLMS = null;
          form.templateCourseCodeLMS = null;
        }
      }
    );
    watch(
      () => form.actionInLMS,
      async (value) => {
        if (!value) {
          form.categoryIdLMS = null;
          form.templateCourseCodeLMS = null;
        }

        if (value == 'createCourse') form.templateCourseCodeLMS = null;
        if (value == 'useCourse') form.categoryIdLMS = null;
      }
    );
    watch(
      () => form.subjectAssignmentId,
      async (value) => {
        courseWithSameConfiguration.value = false;

        if (value) {
          const subjectAssignment = subjectAssignments.value.filter((item) => item.id == value)[0];
          if (subjectAssignment.people) {
            loadingTeacher.value = true;

            const teacherUserId = await subjectAssignment.people.userId;

            form.ownerUserId = teacherUserId;

            loadingTeacher.value = false;
          }
        }
      }
    );
    watch(
      () => form.periodId,
      () => {
        courseWithSameConfiguration.value = false;

        if (form.periodId) {
          currentPeriod.value = periods.value.filter((item) => item.id == form.periodId)[0];

          if (!props.data) {
            form.startDate = currentPeriod.value.startDate;
            form.endDate = currentPeriod.value.endDate;
          }

          if (form.startDate) dateOutOfRange(form.startDate, true);
          if (form.endDate) dateOutOfRange(form.endDate, false);
        } else {
          currentPeriod.value = null;
        }
      }
    );
    watch(academicPeriodGroupId, async () => {
      if (academicPeriodGroupId.value) await loadsubjectAssignments();
      else {
        subjectAssignments.value = [];
      }
    });
    watch(
      () => form.startDate,
      () => {
        if (form.startDate) dateOutOfRange(form.startDate, true);
        else startDateOutOfRange.value = false;
      }
    );
    watch(
      () => form.endDate,
      () => {
        if (form.endDate) dateOutOfRange(form.endDate, false);
        else endDateOutOfRange.value = false;
      }
    );
    watch(
      () => form.subjectAssignmentId,
      async () => {
        await loadNameField();
      }
    );
    watch(
      () => form.periodId,
      async () => {
        await loadNameField();
      }
    );

    const loadNameField = async () => {
      if (!props.data?.id) {
        let name = '';
        form.name = '';

        if (form.subjectAssignmentId && form.periodId) {
          const subjectAssignmentName = subjectAssignments.value.filter((item) => item.id == form.subjectAssignmentId)[0].name;
          const periodName = periods.value.filter((item) => item.id == form.periodId)[0].name;

          name = `${subjectAssignmentName} - ${periodName}`;
        }

        if (form.subjectAssignmentId && !form.periodId) {
          const subjectAssignmentName = subjectAssignments.value.filter((item) => item.id == form.subjectAssignmentId)[0].name;

          name = `${subjectAssignmentName}`;
        }

        if (form.periodId && !form.subjectAssignmentId) {
          const periodName = periods.value.filter((item) => item.id == form.periodId)[0].name;

          name = `${periodName}`;
        }

        form.name = name;
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

    const getCategoriesLms = async () => {
      if (form.lmsInstitutionPlatformId) {
        const params = {
          lmsInstitutionPlatformId: form.lmsInstitutionPlatformId,
        };
        categoriesLms.value = await getCategoriesMoodleService.run(params);

        categoriesLms.value.forEach((item) => (item.id = `${item.id}`));
      }
    };

    const loadsubjectAssignments = async () => {
      if (academicPeriodGroupId.value) {
        academicPeriodGroups.value.forEach((item) => {
          if (academicPeriodGroupId.value == item.id) {
            subjectAssignments.value = item.subjectAssignments;
          }
        });

        if (subjectAssignments.value.length) {
          subjectAssignments.value.forEach((item) => {
            item.name = item.subject.name;
          });
        }
      }
    };

    // Function to validate whether an existing course has the same configuration
    const courseExists = async () => {
      let courses: any[] = await dataCourses.value.filter((item) => item.subjectAssignmentId == form.subjectAssignmentId && item.periodId == form.periodId);

      if (courses.length) {
        if (props.data && props.data?.id == courses[0].id) courses = [];
      }

      courseWithSameConfiguration.value = !!courses.length;
    };

    const save = async () => {
      await courseExists();

      const formIsValid = await v$.value.$validate();
      if (form.periodId) {
        if (endDateOutOfRange.value || startDateOutOfRange.value) return;
      }
      if (!formIsValid || courseWithSameConfiguration.value) return;

      try {
        if (!form.lmsInstitutionPlatformId) {
          form.actionInLMS = null;
          form.categoryIdLMS = null;
          form.templateCourseCodeLMS = null;
        }

        const dataSend = {
          academicPeriodId: form.academicPeriodId,
          subjectAssignmentId: form.subjectAssignmentId,
          periodId: form.periodId,
          createdScheduleCourses: form.createdScheduleCourses,

          ownerUserId: form.ownerUserId,
          name: form.name,
          quota: form.quota,

          startDate: form.startDate,
          endDate: form.endDate,
          isTooCourseLMS: form.isTooCourseLMS ? 1 : 0,
          lmsInstitutionPlatformId: form.lmsInstitutionPlatformId,

          actionInLMS: form.actionInLMS,
          categoryIdLMS: form.categoryIdLMS,
          templateCourseCodeLMS: form.templateCourseCodeLMS,
          syncOnlyFinalQuality: form.syncOnlyFinalQuality ? 1 : 0,
        };

        await createOrUpdateCoursesService.run(dataSend, props.data?.id);
        await router.push({ name: 'administration.courseSchedule' });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      synchronizedCourse,
      loading,
      v$,
      t,

      courseWithSameConfiguration,
      academicPeriodGroupId,
      academicPeriodGroups,
      startDateOutOfRange,
      subjectAssignments,
      endDateOutOfRange,
      loadingTeacher,
      currentPeriod,
      categoriesLms,
      actionsInLMS,
      lmsPlatforms,
      periods,

      invalidDates,
      save,
    };
  },
});
</script>

<style scoped></style>
