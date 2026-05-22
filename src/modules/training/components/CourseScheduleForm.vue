<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'training.courseSchedule' }"></AppButtonBack>

      <AppButton style="color: white;" label="core.save" @click="save()"></AppButton>
    </template>

    <template v-slot:content>
      <div>
        <section>
          <div class="form-row">
            <AppFormField class="col-3" label="Programa">
              <AppAutocomplete v-model="currWithCurrDegrId" :options="curriculumsWithCurriculumDegrees"></AppAutocomplete>
            </AppFormField>

            <AppFormField label="Cluster">
              <AppAutocomplete v-model="currDegrId" :options="curriculumDegrees" label="degreeName"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.curriculumSubjectId" label="Curso base">
              <AppAutocomplete v-model="v$.form.curriculumSubjectId.$model" :options="curriculumSubjects" label="subjectName"></AppAutocomplete>
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.ownerUserId" label="Supervisor">
              <AppSearchUser :id="v$.form.ownerUserId.$model" @user-data="(data) => (v$.form.ownerUserId.$model = data.id)"></AppSearchUser>
            </AppFormField>

            <AppFormField :form-control="v$.form.name" label="Nombre del curso">
              <input v-model="v$.form.name.$model" class="form-control" type="text" />
            </AppFormField>

            <AppFormField class="col-2" :form-control="v$.form.quota" label="Cupo">
              <input v-model="v$.form.quota.$model" class="form-control" type="number" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.startDate" label="Inicia">
              <input v-model="v$.form.startDate.$model" id="startDate" class="form-control" type="date" />
            </AppFormField>

            <AppFormField :form-control="v$.form.endDate" label="Termina">
              <input v-model="v$.form.endDate.$model" id="endDate" class="form-control" type="date" />
              <span v-if="invalidDates" class="text-danger">{{ t('Fecha no valida') }}</span>
            </AppFormField>

            <template v-if="activeModuleBudget">
              <AppFormField :form-control="v$.form.country" label="País">
                <AppGeographicSearch :search-key="'country'" :id="v$.form.country.$model" @geographic-data="(data) => (v$.form.country.$model = data.id)"></AppGeographicSearch>
              </AppFormField>

              <AppFormField :form-control="v$.form.region" label="Departamento">
                <AppGeographicSearch
                  :search-key="'region'"
                  :country-id="v$.form.country.$model"
                  :id="v$.form.region.$model"
                  @geographic-data="(data) => (v$.form.region.$model = data.id)"
                ></AppGeographicSearch>
              </AppFormField>
              <AppFormField :form-control="v$.form.meetingMunicipalityId">
                <label for="homeMunicipality">Ciudad Realización</label>
                <AppGeographicSearch
                  :search-key="'city'"
                  :id="v$.form.meetingMunicipalityId.$model"
                  :country-id="v$.form.country.$model"
                  :region-id="v$.form.region.$model"
                  @geographic-data="(data) => (v$.form.meetingMunicipalityId.$model = data.id)"
                ></AppGeographicSearch>
              </AppFormField>
            </template>
          </div>

          <hr class="m-0 mb-2" />

          <div class="form-row">
            <AppFormField class="col-3" :form-control="v$.form.isTooCourseLMS" label="Sincronizar el curso con LMS?">
              <div class="mt-2 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isTooCourseLMS" v-model="v$.form.isTooCourseLMS.$model" />
                <label class="form-check-label" for="isTooCourseLMS">{{ v$.form.isTooCourseLMS.$model ? t('Sí') : t('No') }}</label>
              </div>
            </AppFormField>

            <AppFormField :form-control="v$.form.lmsInstitutionPlatformId" label="LMS a utilizar">
              <AppAutocomplete v-model="v$.form.lmsInstitutionPlatformId.$model" :options="lmsInstitutionPlatforms"></AppAutocomplete>
            </AppFormField>
          </div>

          <template v-if="v$.form.lmsInstitutionPlatformId.$model">
            <div class="form-row">
              <AppFormField :form-control="v$.form.actionInLMS" label="Tipo de sincronización">
                <AppAutocomplete v-model="v$.form.actionInLMS.$model" :options="actionsInLMS"></AppAutocomplete>
              </AppFormField>

              <AppFormField :form-control="v$.form.categoryIdLMS" label="Categoria destino en el LMS">
                <AppAutocomplete v-model="v$.form.categoryIdLMS.$model" :options="categoriesLms"></AppAutocomplete>
              </AppFormField>

              <AppFormField :form-control="v$.form.templateCourseCodeLMS" label="Curso destino en el LMS">
                <input v-model="v$.form.templateCourseCodeLMS.$model" class="form-control" type="text" />
              </AppFormField>
            </div>
          </template>

          <hr class="m-0 mb-2" />

          <div class="form-row">
            <AppFormField class="col-3" :form-control="v$.form.isCatalogCourse" label="Publicar curso en el catalogo?">
              <div class="mt-2 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isCatalogCourse" v-model="v$.form.isCatalogCourse.$model" />
                <label class="form-check-label" for="isCatalogCourse">{{ v$.form.isCatalogCourse.$model ? t('Sí') : t('No') }}</label>
              </div>
            </AppFormField>

            <template v-if="v$.form.isCatalogCourse.$model">
              <AppFormField :form-control="v$.form.collectOn" label="Proceso de cobro">
                <AppAutocomplete v-model="v$.form.collectOn.$model" :options="collectOn"></AppAutocomplete>
              </AppFormField>

              <AppFormField :form-control="v$.form.productUnitValue" label="Costo del curso">
                <input v-model="v$.form.productUnitValue.$model" class="form-control" type="number" />
              </AppFormField>
            </template>
          </div>

          <div class="form-row">
            <template v-if="v$.form.isCatalogCourse.$model && v$.form.isTooCourseLMS.$model">
              <AppFormField class="col-4" :form-control="v$.form.autoInscriptionLMS" label="Inscripción en el LMS tan pronto se recibe el pago?">
                <div class="mt-2 form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="autoInscriptionLMS" v-model="v$.form.autoInscriptionLMS.$model" />
                  <label class="form-check-label" for="autoInscriptionLMS">{{ v$.form.autoInscriptionLMS.$model ? t('Sí') : t('No') }}</label>
                </div>
              </AppFormField>
            </template>

            <AppFormField class="col-2" :form-control="v$.form.isBudget" label="Usar presupuesto?">
              <div class="mt-2 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isBudget" v-model="v$.form.isBudget.$model" />
                <label class="form-check-label" for="isBudget">{{ v$.form.isBudget.$model ? t('Sí') : t('No') }}</label>
              </div>
            </AppFormField>

            <template v-if="activeModuleBudget">
              <AppFormField :form-control="v$.form.academicPeriodBudgetId" label="Rubro presupuestal">
                <AppAutocomplete v-model="v$.form.academicPeriodBudgetId.$model" :options="academicPeriodBudgets" label="budgeLineName"></AppAutocomplete>
              </AppFormField>
            </template>
          </div>
        </section>
      </div>
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

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppSearchUser from '../../../shared/components/Forms/AppSearchUser.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { CourseFormDto } from '../dtos/courseSchedule.dto';
import { CurriculumSubject } from '../dtos/courseSchedule.dto';
import { CurriculumDegreeDto } from '../dtos/courseSchedule.dto';
import { CurriculumsWithCurriculumDegreesDto } from '../dtos/courseSchedule.dto';

import { CreateOrUpdateCoursesService } from '../services/createOrUpdateCourses.service';
import { GetRelatedDataFormCourService } from '../services/getRelatedDataFormCour.service';
import { GetCurriculumsWithCurrDegrService } from '../services/getCurriculumsWithCurrDegr.service';
import { GetLmsInstitutionPlatformsService } from '../services/getLmsInstitutionPlatforms.service';
import { GetCategoriesMoodleByLmsInstitutionPlatformIdService } from '../services/getCategoriesMoodleByLmsInstitutionPlatformId.service';
import { useHeaderStore } from '../../../stores/header.store';

const getCategoriesMoodleByLmsInstitutionPlatformIdService = new GetCategoriesMoodleByLmsInstitutionPlatformIdService();
const getLmsInstitutionPlatformsService = new GetLmsInstitutionPlatformsService();
const getCurriculumsWithCurrDegrService = new GetCurriculumsWithCurrDegrService();
const getRelatedDataFormCourService = new GetRelatedDataFormCourService();
const createOrUpdateCoursesService = new CreateOrUpdateCoursesService();

export default defineComponent({
  name: 'CourseScheduleForm',
  components: {
    AppGeographicSearch,
    AppAutocomplete,
    AppButtonBack,
    AppSearchUser,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
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
      type: Object as PropType<CourseFormDto>,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const curriculumsWithCurriculumDegrees: Ref<CurriculumsWithCurriculumDegreesDto[]> = ref([]);
    const academicPeriodBudgets: Ref<any[]> = ref([]);
    const curriculumSubjects: Ref<CurriculumSubject[]> = ref([]);
    const curriculumDegrees: Ref<CurriculumDegreeDto[]> = ref([]);
    const lmsInstitutionPlatforms: Ref<any[]> = ref([]);
    const categoriesLms: Ref<any[]> = ref([]);
    const actionsInLMS: Ref<any[]> = ref([]);
    const collectOn: Ref<any[]> = ref([]);

    const currWithCurrDegrId = ref();
    const academicPeriodId = ref();
    const currDegrId = ref();

    const activeModuleBudget = ref(false);
    const loading = ref(true);

    const form = reactive({
      academicPeriodId: props.data ? props.data.academicPeriodId : academicPeriodId,
      curriculumSubjectId: props.data ? props.data.curriculumSubjectId : null,

      ownerUserId: props.data ? props.data.ownerUserId : null,
      name: props.data ? props.data.name : null,
      quota: props.data ? props.data.quota : null,

      startDate: props.data ? props.data.startDate : null,
      endDate: props.data ? props.data.endDate : null,
      isBudget: props.data ? (props.data.isBudget ? true : false) : false,

      isTooCourseLMS: props.data ? (props.data.isTooCourseLMS ? true : false) : false,
      lmsInstitutionPlatformId: props.data ? props.data.lmsInstitutionPlatformId : null,

      actionInLMS: props.data ? props.data.actionInLMS : null,
      categoryIdLMS: props.data ? props.data.categoryIdLMS : null,
      templateCourseCodeLMS: props.data ? props.data.templateCourseCodeLMS : null,

      isCatalogCourse: props.data ? (props.data.isCatalogCourse ? true : false) : false,
      collectOn: props.data ? props.data.collectOn : null,
      productUnitValue: props.data ? props.data.productUnitValue : null,

      autoInscriptionLMS: props.data ? (props.data.autoInscriptionLMS ? true : false) : false,
      meetingMunicipalityId: props.data ? props.data.meetingMunicipalityId : null,
      academicPeriodBudgetId: props.data ? props.data.academicPeriodBudgetId : null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: {},
          curriculumSubjectId: { required },

          ownerUserId: { required },
          name: { required },
          quota: { required },

          startDate: { required },
          endDate: { required },
          isBudget: {},

          isTooCourseLMS: {},
          lmsInstitutionPlatformId: {},

          actionInLMS: {},
          categoryIdLMS: {},
          templateCourseCodeLMS: {},

          isCatalogCourse: {},
          collectOn: {},
          productUnitValue: {},

          autoInscriptionLMS: {},
          meetingMunicipalityId: { required },
          academicPeriodBudgetId: {},
          region: {},
          country: {},
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
        if (route.query.academicPeriodId) academicPeriodId.value = parseInt(route.query.academicPeriodId.toString(), 10);
        else if (props.data && props.data.academicPeriodId) academicPeriodId.value = props.data.academicPeriodId;

        if (academicPeriodId.value) {
          const response: any = await getRelatedDataFormCourService.run(academicPeriodId.value);

          academicPeriodBudgets.value = response.academicPeriodBudgets;
          activeModuleBudget.value = response.activeModuleBudget;
          actionsInLMS.value = response.actionsInLMS;
          collectOn.value = response.collectOn;

          actionsInLMS.value.forEach((item) => {
            item.id = item.value;
            item.name = item.label;
          });
          collectOn.value.forEach((item) => {
            item.id = item.value;
            item.name = item.label;
          });
        }

        curriculumsWithCurriculumDegrees.value = await getCurriculumsWithCurrDegrService.run();

        if (form.curriculumSubjectId) {
          curriculumsWithCurriculumDegrees.value.forEach((item) => {
            item.curriculumDegrees.forEach((item2) => {
              item2.curriculumSubjects.forEach((item3) => {
                if (form.curriculumSubjectId == item3.id) {
                  curriculumSubjects.value = item2.curriculumSubjects;
                  curriculumDegrees.value = item.curriculumDegrees;

                  currWithCurrDegrId.value = item.id;
                  currDegrId.value = item2.id;
                }
              });
            });
          });
        }

        lmsInstitutionPlatforms.value = await getLmsInstitutionPlatformsService.run();

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Capacitación', url: '' };
        headerStorage.moduleItem = { name: 'Cronograma de cursos', url: '' };
        headerStorage.moduleSubItem = { name: props.title, url: '' };
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    });

    watch(currWithCurrDegrId, async () => {
      if (currWithCurrDegrId.value) await loadCurriculumDegrees();
      else {
        curriculumSubjects.value = [];
        curriculumDegrees.value = [];
      }
    });
    watch(currDegrId, async () => {
      if (currDegrId.value) await loadCurriculumSubjects();
      else {
        curriculumSubjects.value = [];
      }
    });
    watch(
      () => form.lmsInstitutionPlatformId,
      async () => {
        if (form.lmsInstitutionPlatformId) {
          categoriesLms.value = await getCategoriesMoodleByLmsInstitutionPlatformIdService.run(form.lmsInstitutionPlatformId);

          categoriesLms.value.forEach((item) => (item.id = `${item.id}`));
        } else {
          categoriesLms.value = [];
        }
      }
    );
    watch(
      () => form.curriculumSubjectId,
      async () => {
        loadNameField();
      }
    );

    const loadNameField = () => {
      if (!props.data?.id && currWithCurrDegrId.value && form.curriculumSubjectId) {
        const programName = curriculumsWithCurriculumDegrees.value.filter((item) => item.id == currWithCurrDegrId.value)[0].name;
        const courseName = curriculumSubjects.value.filter((item) => item.id == form.curriculumSubjectId)[0].subjectName;

        form.name = `${programName} ${courseName}`;
      }
    };

    const loadCurriculumDegrees = async () => {
      if (currWithCurrDegrId.value) {
        curriculumsWithCurriculumDegrees.value.forEach((item) => {
          if (currWithCurrDegrId.value == item.id) {
            curriculumDegrees.value = item.curriculumDegrees;
          }
        });
      }
    };
    const loadCurriculumSubjects = async () => {
      if (currDegrId.value) {
        curriculumDegrees.value.forEach((item) => {
          if (currDegrId.value == item.id) {
            curriculumSubjects.value = item.curriculumSubjects;
          }
        });
      }
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        if (!form.lmsInstitutionPlatformId) {
          form.actionInLMS = null;
          form.categoryIdLMS = null;
          form.templateCourseCodeLMS = null;
        }

        if (!form.isTooCourseLMS || !form.isCatalogCourse) {
          form.autoInscriptionLMS = false;
        }

        const dataSend = {
          academicPeriodId: form.academicPeriodId,
          curriculumSubjectId: form.curriculumSubjectId,

          ownerUserId: form.ownerUserId,
          name: form.name,
          quota: form.quota,

          startDate: form.startDate,
          endDate: form.endDate,
          isBudget: form.isBudget ? 1 : 0,

          isTooCourseLMS: form.isTooCourseLMS ? 1 : 0,
          lmsInstitutionPlatformId: form.lmsInstitutionPlatformId,

          actionInLMS: form.actionInLMS,
          categoryIdLMS: form.categoryIdLMS,
          templateCourseCodeLMS: form.templateCourseCodeLMS,

          isCatalogCourse: form.isCatalogCourse ? 1 : 0,
          collectOn: form.collectOn,
          productUnitValue: form.productUnitValue,

          autoInscriptionLMS: form.autoInscriptionLMS ? 1 : 0,
          meetingMunicipalityId: form.meetingMunicipalityId,
          academicPeriodBudgetId: form.academicPeriodBudgetId,
        };

        await createOrUpdateCoursesService.run(dataSend, props.data?.id);

        await router.push({ name: 'training.courseSchedule' });
      } catch (e) {
        console.log(e);
      }
    };
    return {
      loading,
      v$,
      t,

      curriculumsWithCurriculumDegrees,
      lmsInstitutionPlatforms,
      academicPeriodBudgets,
      curriculumSubjects,
      curriculumDegrees,
      categoriesLms,
      actionsInLMS,
      collectOn,

      activeModuleBudget,
      currWithCurrDegrId,
      currDegrId,

      invalidDates,
      save,
    };
  },
});
</script>

<style scoped></style>
