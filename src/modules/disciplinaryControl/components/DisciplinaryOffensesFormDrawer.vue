<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility" :size="'lg'">
    <template #head>
      <span class="title-form px-3"> {{ discplinaryOffenseId ? 'Editar' : 'Crear' }} observación </span>
    </template>

    <template #body>
      <div class="card-body">
        <AppLoading v-if="loading" class="d-flex align-items-center h-80" />

        <template v-else>
          <div class="row">
            <div class="col-12">
              <AppFormField label="disciplinaryControl.disciplinaryOffenses.form.dateTimeOffense" :form-control="v$.form.dateTimeOffense">
                <input v-model="v$.form.dateTimeOffense.$model" type="datetime-local" class="form-control" />
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="d-flex gap-4 align-items-center tw-flex-1">
              <AppFormField label="Observación" :form-control="v$.form.offenseTemplateId">
                <AppAutocomplete v-model="v$.form.offenseTemplateId.$model" label="nameShown" :options="offenseTemplates" @search="searchOffenseTemplate" />
              </AppFormField>

              <template v-if="v$.form.offenseTemplateId.$model">
                <AppGetIcon v-if="!isFrown(v$.form.offenseTemplateId.$model)" class="m-1 text-danger" name="frown" />
                <AppGetIcon v-else class="m-1 text-success" name="smile" />
              </template>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField label="disciplinaryControl.disciplinaryOffenses.form.description" :form-control="v$.form.description">
                <AppVoiceInput v-model="v$.form.description.$model" :rows="3" placeholder="Escribe o dicta tu observación…" textareaClass="form-control" />
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField v-if="!hideSelectItem" :form-control="v$.form.selectItem" label="disciplinaryControl.disciplinaryOffenses.form.whereWasDisciplinaryOffense">
                <v-select v-model="v$.form.selectItem.$model" :options="courses.value" label="nameShown" item-value="id" return-object />
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField :form-control="v$.form.isSentParents" label="Estado" v-if="discplinaryOffenseId">
                <div class="d-flex gap-1">
                  <label class="form-check-label">Cargada</label>

                  <div class="form-check form-switch">
                    <input v-model="v$.form.isSentParents.$model" class="form-check-input" type="checkbox" id="activeForm" />
                  </div>

                  <label class="form-check-label">Enviada</label>
                </div>
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField v-if="!hideScenery" :form-control="v$.form.scenery" label="Escenario de observación">
                <AppVoiceInput v-model="v$.form.scenery.$model" textareaClass="form-control" />
              </AppFormField>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="buttons-form d-flex gap-3 justify-content-between">
        <div>
          <AppButton label="core.save" @click="save()" />
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch, PropType, Ref } from 'vue';
import { debounce } from 'ts-debounce';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { CourseDto } from '../dtos/course.dto';

import { GetOffenseTemplatesService } from '../services/getOffenseTemplates.service';
import { GetDisciplinaryOffensesByIdService } from '../services/getDisciplinaryOffensesById.service';
import { CreateOrUpdateDisciplinaryOffensesService } from '../services/createOrUpdateDisciplinaryOffenses.service';
import { GetDisciplinaryOffensesRelatedDataFormService } from '../services/getDisciplinaryOffensesRelatedDataForm.service';
import { GetStudentsForSelectByDisciplinaryControlService } from '../../../shared/services/getStudentsForSelectByDisciplinaryControl.service';

const getOffenseTemplatesService = new GetOffenseTemplatesService();
const getDisciplinaryOffensesByIdService = new GetDisciplinaryOffensesByIdService();
const createOrUpdateDisciplinaryOffensesService = new CreateOrUpdateDisciplinaryOffensesService();
const getDisciplinaryOffensesRelatedDataFormService = new GetDisciplinaryOffensesRelatedDataFormService();
const getStudentsForSelectByDisciplinaryControlService = new GetStudentsForSelectByDisciplinaryControlService();

export default defineComponent({
  name: 'DisciplinaryOffensesFormDrawer',
  components: {
    AppAutocomplete,
    AppFormField,
    AppGetIcon,
    AppLoading,
    AppDrawer,
    AppButton,
    AppVoiceInput,
  },

  props: {
    params: {
      type: Object as PropType<{
        userId: number;
        userNames: string;
        academicPeriodId: number;
      }>,
      required: true,
    },
    discplinaryOffenseId: {
      type: [Number, null] as PropType<number | null>,
      required: false,
      default: null,
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const form = reactive<any>({
      userId: props.params.userId,
      academicPeriodId: props.params.academicPeriodId,

      dateTimeOffense: null,
      offenseTemplateId: null,
      description: '',
      isSentParents: false,
      scenery: '',

      selectItem: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },
          academicPeriodId: { required },

          dateTimeOffense: { required },
          offenseTemplateId: { required },
          description: { required },
          isSentParents: {},
          scenery: {},

          selectItem: {},
        },
      },
      { form }
    );

    const offenseTemplates: Ref<any[]> = ref([]);
    const disciplinaryOffense: Ref<any | null> = ref(null);
    const academicPeriodGroupId: Ref<number | null> = ref(null);

    const loading = ref(true);

    const courses: { value: CourseDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      await getOffenseTemplates();

      loading.value = false;
    });

    watch(
      () => props.isVisible,
      async (newVal) => {
        if (newVal) {
          loading.value = true;
          disciplinaryOffense.value = null;

          await getStudent();
          await resetForm();

          if (props.discplinaryOffenseId) {
            disciplinaryOffense.value = await getDisciplinaryOffensesByIdService.run(props.discplinaryOffenseId);
            await loadForm(disciplinaryOffense.value);
          }

          loading.value = false;
        }
      }
    );
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
      () => form.dateTimeOffense,
      async (newDateTimeOffense, oldDateTimeOffense) => {
        if (newDateTimeOffense !== oldDateTimeOffense) {
          await fetchCourses();
        }
      }
    );

    const searchOffenseTemplate = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 1) {
          offenseTemplates.value = [];
          await getOffenseTemplates(search);
        } else {
          offenseTemplates.value = [];
        }

        loading(false);
      }
    }, 800);
    const hideSelectItem = computed(() => {
      return form.scenery !== null && form.scenery.trim() !== '';
    });
    const hideScenery = computed(() => {
      return form.selectItem !== null;
    });

    const getOffenseTemplates = async (search: string = '') => {
      const params = { search };
      const res = await getOffenseTemplatesService.run(params);

      offenseTemplates.value = res.map((item: any) => ({
        ...item,
        nameShown: `${item.code} - ${item.searchName ?? ''}`,
      }));
    };
    const getStudent = async () => {
      const response = await getStudentsForSelectByDisciplinaryControlService.run({
        search: props.params.userNames,
        academicPeriodId: props.params.academicPeriodId,
      });

      if (!response.data.length) {
        updateVisibility(false);
        return;
      }

      academicPeriodGroupId.value = response.data[0].matriculate.academicPeriodGroupId;
    };
    async function fetchCourses() {
      if (!academicPeriodGroupId.value || !form.dateTimeOffense) return;

      const formattedDateTimeOffense = dayjs(form.dateTimeOffense).format('YYYY-MM-DD HH:mm:ss');

      const response = await getDisciplinaryOffensesRelatedDataFormService.run({
        academicPeriodGroupId: academicPeriodGroupId.value,
        dateTimeOffense: formattedDateTimeOffense,
      });

      courses.value = response.courses.map((item: any) => ({
        ...item,
        nameShown: formatCourseName(item),
        type: 'course',
      }));
    }

    const isFrown = (offenseTemplateId: number): boolean => {
      const offenseTemplate = offenseTemplates.value.find((item) => item.id === offenseTemplateId);

      return offenseTemplate?.isPositive ?? false;
    };
    const formatCourseName = (item: any): string => {
      if (!item) return '';

      const teacherName = item.teacher ? `${item.teacher.lastnames ?? ''} ${item.teacher.names ?? ''}`.trim() : '';
      return teacherName ? `${item.name} - ${teacherName}` : item.name;
    };

    const loadForm = async (disciplinaryOffense: any) => {
      form.dateTimeOffense = disciplinaryOffense.dateTimeOffense;
      form.offenseTemplateId = disciplinaryOffense.offenseTemplateId;
      form.description = disciplinaryOffense.description;
      form.isSentParents = !!disciplinaryOffense.isSentParents;
      form.scenery = disciplinaryOffense.scenery;

      form.selectItem = disciplinaryOffense.course?.id
        ? {
            ...disciplinaryOffense.course,
            nameShown: formatCourseName(disciplinaryOffense.course),
            type: 'course',
          }
        : disciplinaryOffense.playTime?.id
        ? {
            ...disciplinaryOffense.playTime,
            nameShown: formatCourseName(disciplinaryOffense.playTime),
            type: 'playTime',
          }
        : null;
    };
    const resetForm = () => {
      form.academicPeriodId = props.params.academicPeriodId;

      form.dateTimeOffense = dayjs(new Date().toISOString()).format('YYYY-MM-DD HH:mm');
      form.offenseTemplateId = null;
      form.description = '';
      form.isSentParents = false;
      form.scenery = '';
      form.selectItem = null;

      v$.value.$reset();
    };

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value);

      if (!value) {
        setTimeout(() => {
          resetForm();
        }, 300);
      }
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      let dataSend: any = {
        userId: form.userId,
        academicPeriodId: form.academicPeriodId,

        dateTimeOffense: form.dateTimeOffense,
        offenseTemplateId: form.offenseTemplateId,
        description: form.description,
        isSentParents: form.isSentParents ? 1 : 0,

        scenery: form.scenery,
        courseId: null,
        playTimeId: null,
      };

      if (form.selectItem?.type === 'course') {
        dataSend.courseId = form.selectItem?.id;
      } else if (form.selectItem?.type === 'playTime') {
        dataSend.playTimeId = form.selectItem?.id;
      }

      try {
        await createOrUpdateDisciplinaryOffensesService.run(dataSend, disciplinaryOffense.value?.id);

        updateVisibility(false);

        emit('reload-data');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      v$,
      t,

      hideSelectItem,
      hideScenery,
      loading,

      searchOffenseTemplate,
      courses,

      offenseTemplates,

      // Funtions
      updateVisibility,
      isFrown,
      save,
    };
  },
});
</script>

<style scoped>
.title-form {
  margin-left: auto;
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
}
.h-80 {
  height: 80% !important;
}
.overflow-clip {
  overflow-x: clip;
}
</style>
