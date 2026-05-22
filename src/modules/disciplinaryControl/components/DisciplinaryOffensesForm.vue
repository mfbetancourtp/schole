<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'disciplinaryControl.disciplinaryOffenses' }"></AppButtonBack>

      <AppButton style="color: white" @click="save()">{{ t('core.save') }}</AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <div v-else>
        <div class="card-body">
          <div class="row g-3">
            <!-- Año Académico -->
            <div class="col-12 col-md-6">
              <AppFormField :form-control="v$.form.academicPeriodId">
                <label>Año Académico</label>
                <AppAutocomplete v-model="v$.form.academicPeriodId.$model" :options="academicPeriods" :clearable="false" class="bg-white" />
              </AppFormField>
            </div>

            <!-- Estudiante -->
            <div class="col-12 col-md-6">
              <AppFormField :form-control="v$.form.userId" label="core.generalTerms.academic.student.singular">
                <v-select
                  :placeholder="`${t('core.remoteSelect.start')} 2 ${t('core.remoteSelect.end')}`"
                  v-model="v$.form.userId.$model"
                  :reduce="(student: any) => student.id"
                  :options="students.value"
                  @search="searchStudents"
                  label="name"
                />
              </AppFormField>
            </div>

            <!-- Fecha y hora -->
            <div class="col-12 col-md-6">
              <AppFormField :form-control="v$.form.dateTimeOffense" label="disciplinaryControl.disciplinaryOffenses.form.dateTimeOffense">
                <input v-model="v$.form.dateTimeOffense.$model" type="datetime-local" class="form-control" />
              </AppFormField>
            </div>

            <!-- Observación + icono -->
            <div class="col-12 col-md-6 d-flex align-items-center gap-2">
              <AppFormField :form-control="v$.form.offenseTemplateId" label="Observación" class="flex-fill">
                <AppAutocomplete v-model="v$.form.offenseTemplateId.$model" :options="offense" @search="searchOffense" label="nameShown" />
              </AppFormField>
              <div>
                <template v-if="v$.form.offenseTemplateId.$model">
                  <AppGetIcon v-if="!isFrown(v$.form.offenseTemplateId.$model)" class="text-danger" name="frown" />
                  <AppGetIcon v-else class="text-success" name="smile" />
                </template>
              </div>
            </div>

            <!-- Descripción Observación -->
            <div class="col-12">
              <AppFormField v-model="selectedOffense" label="Descripción de la Observación">

                <AppVoiceInput v-model="selectedOffense" readonly textareaClass="form-control"  />
              </AppFormField>
            </div>

            <!-- Descripción general -->
            <div class="col-12">
              <AppFormField :form-control="v$.form.description" label="disciplinaryControl.disciplinaryOffenses.form.description">
              <AppVoiceInput v-model="v$.form.description.$model" :cols="40" :rows="3" textareaClass="form-control"  />
              </AppFormField>
            </div>

            <!-- SelectItem -->
            <div class="col-12 col-md-6" v-if="!hideSelectItem">
              <AppFormField :form-control="v$.form.selectItem" label="disciplinaryControl.disciplinaryOffenses.form.whereWasDisciplinaryOffense">
                <v-select v-model="v$.form.selectItem.$model" :options="courses.value" label="nameShown" item-value="id" return-object />
              </AppFormField>
            </div>

            <!-- Estado -->
            <div class="col-12 col-md-6" v-if="dataPage">
              <AppFormField :form-control="v$.form.isSentParents" label="Estado">
                <div class="d-flex gap-2">
                  <label class="form-check-label">Cargada</label>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="activeForm" v-model="v$.form.isSentParents.$model" />
                  </div>
                  <label class="form-check-label">Enviada</label>
                </div>
              </AppFormField>
            </div>

            <!-- Escenario -->
            <div class="col-12" v-if="!hideScenery">
              <AppFormField :form-control="v$.form.scenery" label="Escenario de observación">
                <AppVoiceInput  v-model="v$.form.scenery.$model" textareaClass="form-control"  />
              </AppFormField>
            </div>
          </div>


      </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { debounce } from 'ts-debounce';
import { useRouter } from 'vue-router';
import { defineComponent, onMounted, reactive, ref, Ref, watch, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import dayjs from 'dayjs';

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
//import AppSearchStudentsNew from '../../../shared/components/Forms/AppSearchStudentsNew.vue';

import { CourseDto } from '../dtos/course.dto';
import { OffenseTemplateDto } from '../dtos/offenseTemplate';
import { DisciplinaryOffenseDto } from '../dtos/disciplinaryOffense.dto';

import { GetStudentsForSelectByDisciplinaryControlService } from '../../../shared/services/getStudentsForSelectByDisciplinaryControl.service';
import { CreateOrUpdateDisciplinaryOffensesService } from '../services/createOrUpdateDisciplinaryOffenses.service';
import { GetDisciplinaryOffensesRelatedDataFormService } from '../services/getDisciplinaryOffensesRelatedDataForm.service';
import { GetLevelOffensesService } from '../services/getLevelOffenses.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetOffenseTemplatesService } from '../services/getOffenseTemplates.service';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getDisciplinaryOffensesRelatedDataFormService = new GetDisciplinaryOffensesRelatedDataFormService();
const createOrUpdateDisciplinaryOffensesService = new CreateOrUpdateDisciplinaryOffensesService();
const getStudentsForSelectByDisciplinaryControlService = new GetStudentsForSelectByDisciplinaryControlService();
const getOffenseTemplatesService = new GetOffenseTemplatesService();
const getPeriodsService = new GetAcademicPeriodsService();
const getLevelOffensesService = new GetLevelOffensesService();

export default defineComponent({
  name: 'DisciplinaryOffensesForm',
  components: {
    //AppSearchStudentsNew,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppGetIcon,
    AppVoiceInput,
  },

  props: ['title', 'data'],

  setup(props) {
    const { t } = useI18n();
    const dataPage: DisciplinaryOffenseDto | null = props.data ?? null;
    const router = useRouter();
    const routes = [
      {
        name: t('disciplinaryControl.disciplinaryOffenses.name'),
        url: { name: 'disciplinaryControl.disciplinaryOffenses' },
      },
      {
        name: props.title,
      },
    ];
    const levelOffenses: Ref<any[]> = ref([]);
    const offense: Ref<any[]> = ref([]);
    const users: { value: any[] } = reactive({
      value: [],
    });

    const loading = ref(true);
    //const academicPeriods: Ref<any[]> = ref([]);
    const activeAcademicPeriods = ref([]);
    const academicPeriodId = ref();
    const academicPeriodGroupId = ref();
    // Dentro de setup(), junto a tus otras declaraciones:

    const offenseTemplates: { value: OffenseTemplateDto[] } = reactive({
      value: [],
    });
    const courses: { value: CourseDto[] } = reactive({
      value: [],
    });
    const students: { value: any[] } = reactive({
      value: [],
    });
    const formatCourseName = (item: any): string => {
      if (!item) return '';
      const teacherName = item.teacher ? `${item.teacher.lastnames ?? ''} ${item.teacher.names ?? ''}`.trim() : '';
      return teacherName ? `${item.name} - ${teacherName}` : item.name;
    };

    const form = reactive({
      userId: dataPage ? dataPage.userId : null,
      dateTimeOffense: dataPage ? dataPage.dateTimeOffense : dayjs(new Date().toISOString()).format('YYYY-MM-DD HH:mm'),
      offenseTemplateId: dataPage ? dataPage.offenseTemplateId : null,
      description: dataPage ? dataPage.description : '',
      isSentParents: dataPage && dataPage.isSentParents ? true : false,
      scenery: dataPage ? dataPage.scenery : null,
      selectItem: dataPage?.course?.id
        ? {
            ...dataPage.course,
            nameShown: formatCourseName(dataPage.course),
            type: 'course',
          }
        : dataPage?.playTime?.id
        ? {
            ...dataPage.playTime,
            nameShown: formatCourseName(dataPage.playTime),
            type: 'playTime',
          }
        : null,
      academicPeriodId: dataPage ? dataPage.academicPeriodId : null,
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },
          dateTimeOffense: { required },
          offenseTemplateId: { required },
          description: { required },
          isSentParents: {},
          academicPeriodId: { required },
          selectItem: {},
          scenery: {},
        },
      },
      { form }
    );
    // Dentro de setup(), junto a tus otras declaraciones:
    const hideSelectItem = computed(() => {
      // Si hay texto en scenery, ocultamos el select
      return form.scenery !== null && form.scenery.trim() !== '';
    });

    const hideScenery = computed(() => {
      return form.selectItem !== null;
    });

    onMounted(async () => {
      try {
        console.log('prups', dataPage);
        const allAcademicPeriods: any = await getPeriodsService.run();
        activeAcademicPeriods.value = allAcademicPeriods.filter((period: any) => period.active === 1);
        getOffense('');
        levelOffenses.value = await getLevelOffensesService.run();
        if (dataPage) {
          form.userId = dataPage.userId;
          await getStudents(dataPage.student.people.names);
          await fetchCourses();
          console.log('aid', academicPeriodGroupId.value);
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.scenery,
      (newVal) => {
        if (newVal && newVal.trim() !== '') {
          form.selectItem = null;
        }
      }
    );

    watch(
      () => form.selectItem,
      (newVal) => {
        if (newVal) {
          form.scenery = null;
        }
      }
    );

    watch(
      () => form.userId,
      async (newUserId, oldUserId) => {
        if (newUserId != oldUserId) {
          if (newUserId) {
            const selectedStudent = students.value.find((student: any) => student.id === newUserId);
            if (selectedStudent) {
              console.log('entro en la condición');
              academicPeriodGroupId.value = selectedStudent.matriculate?.academicPeriodGroupId;
              console.log('academicPeriodGroupId', academicPeriodGroupId.value);
              await fetchCourses();
            }
          }
        }
      }
    );
    watch(
      () => form.dateTimeOffense, // Observamos el cambio en dateTimeOffense
      async (newDateTimeOffense, oldDateTimeOffense) => {
        if (newDateTimeOffense !== oldDateTimeOffense) {
          await fetchCourses();
        }
      }
    );
    async function fetchCourses() {
      const academicPeriodGroupIdForUser = academicPeriodGroupId.value;

      if (!academicPeriodGroupIdForUser) return; // Evita ejecutar si el valor es inválido

      const formattedDateTimeOffense = dayjs(form.dateTimeOffense).format('YYYY-MM-DD HH:mm:ss');

      const response = await getDisciplinaryOffensesRelatedDataFormService.run({
        academicPeriodGroupId: academicPeriodGroupIdForUser,
        dateTimeOffense: formattedDateTimeOffense, // Enviamos la fecha correctamente formateada
      });

      courses.value = response.courses.map((item: any) => ({
        ...item,
        nameShown: formatCourseName(item),
      }));
    }

    const isFrown = (offenseTemplateId: any) => {
      let res = false;

      const aux: any = offense.value.filter((item: any) => item.id == offenseTemplateId)[0];

      res = aux.isPositive ? true : false;

      return res;
    };

    const getStudents = async (search: string) => {
      const response = await getStudentsForSelectByDisciplinaryControlService.run({
        search: search,
      });
      (academicPeriodGroupId.value = response.data[0].matriculate.academicPeriodGroupId),
        response.data.forEach((data: any) => {
          students.value.push({
            ...data,
            id: data.people.userId,
            name: data.people.names + ' ' + data.people.lastnames,
          });
        });
    };
    const searchStudents = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          students.value = [];
          await getStudents(search);
        } else {
          students.value = [];
        }

        loading(false);
      }
    }, 800);

    const getOffense = async (search: string) => {
      const response = await getOffenseTemplatesService.run({
        search: search,
      });
      offense.value = response.map((item: any) => ({
        ...item,
        nameShown: `${item.code} - ${item.searchName ?? ''}`,
      }));
    };
    const searchOffense = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 1) {
          offense.value = [];
          await getOffense(search);
        } else {
          students.value = [];
        }

        loading(false);
      }
    }, 800);
    const selectedOffense = computed(() => {
      const selectedId = form.offenseTemplateId;
      const selected = offense.value.find((item) => item.id === selectedId);
      return selected ? selected.name : '';
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      let dataSend: any = {
        userId: form.userId,
        dateTimeOffense: form.dateTimeOffense,
        offenseTemplateId: form.offenseTemplateId,
        description: form.description,
        scenery: form.scenery,
        isSentParents: form.isSentParents ? 1 : 0,
        academicPeriodId: form.academicPeriodId,
        courseId: null,
        playTimeId: null,
      };

      if (form.selectItem?.type === 'course') {
        dataSend.courseId = form.selectItem?.id;
      } else if (form.selectItem?.type === 'playTime') {
        dataSend.playTimeId = form.selectItem?.id;
      }

      try {
        await createOrUpdateDisciplinaryOffensesService.run(dataSend, dataPage?.id);

        await router.push({
          name: 'disciplinaryControl.disciplinaryOffenses',
        });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      routes,
      v$,
      t,

      offenseTemplates,
      levelOffenses,
      offense,
      courses,
      loading,
      academicPeriods: activeAcademicPeriods,
      academicPeriodId,
      academicPeriodGroupId,
      dataPage,
      isFrown,
      save,
      searchStudents,
      students,
      users,
      searchOffense,
      selectedOffense,
      hideSelectItem,
      hideScenery,
    };
  },
});
</script>

<style scoped></style>
