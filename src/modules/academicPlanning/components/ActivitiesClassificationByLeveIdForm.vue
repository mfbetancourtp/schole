<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading" />

        <template v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.abbreviation" label="classroom.activitiesClassification.form.abbreviation">
              <input v-model="v$.form.abbreviation.$model" class="form-control" type="text" />
            </AppFormField>

            <template v-if="validPercentLevel">
              <AppFormField :form-control="v$.form.percent" label="classroom.activitiesClassification.form.percent">
                <input v-model="v$.form.percent.$model" class="form-control" type="number" />
              </AppFormField>
            </template>
          </div>

          <AppFormField :form-control="v$.form.name" label="classroom.activitiesClassification.form.name">
            <AppVoiceInput v-model="v$.form.name.$model" textareaClass="form-control" />

          </AppFormField>

          <AppFormField :form-control="v$.form.academicPeriodId" label="Ciclo académico">
            <AppAutocomplete v-model="v$.form.academicPeriodId.$model" :options="activeAcademicPeriods" />
          </AppFormField>

          <template v-if="!loadingPeriod">
            <AppFormField :form-control="v$.form.periodId" label="Periodo">
              <AppAutocomplete v-model="v$.form.periodId.$model" :options="periods" />
            </AppFormField>
          </template>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton v-if="!loading" label="core.save" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { LevelDto } from '../../administration/dtos/level.dto';
import { ActivityCategoryDto } from '../../administration/dtos/activityCategory.dto';

import { GetPeriodsByAcademicPeriodService } from '../../administration/services/getPeriodsByAcademicPeriod.service';
import { GetAcademicPeriodsForSelectService } from '../../administration/services/getAcademicPeriodsForSelect.service';
import { CreateOrUpdateActivitiesClassificationByLevelIdService } from '../services/createOrUpdateActivitiesClassificationByLevelId.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateActivitiesClassificationByLevelIdService = new CreateOrUpdateActivitiesClassificationByLevelIdService();
const getAcademicPeriodsForSelectService = new GetAcademicPeriodsForSelectService();
const getPeriodsByAcademicPeriodService = new GetPeriodsByAcademicPeriodService();

export default defineComponent({
  name: 'ActivitiesClassificationForm',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppLoading,
    AppAutocomplete,
    AppVoiceInput,
  },

  props: {
    activitiesClassification: {
      type: Object as PropType<ActivityCategoryDto | null>,
    },
    levelId: {
      type: Number,
      required: true,
    },
    validPercentLevel: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const levelId = props.levelId ?? null;
    const activityClassification: ActivityCategoryDto | null = props.activitiesClassification ?? null;

    let title = `${t('core.newFemale')} ${t('classroom.activitiesClassification.singular')}`;
    if (activityClassification) title = `${t('core.edit')} ${t('classroom.activitiesClassification.singular')}`;

    const academicPeriods: { value: [] } = reactive({
      value: [],
    });
    const activeAcademicPeriods = ref([]);

    const periods: Ref<any[]> = ref([]);
    //const level = ref();

    const form = reactive({
      abbreviation: activityClassification?.abbreviation ?? null,
      percent: activityClassification?.percent ?? null,
      name: activityClassification?.name ?? '',
      academicPeriodId: null as number | null,
      periodId: null as number | null,
    });
    const v$ = useVuelidate(
      {
        form: {
          abbreviation: { required },
          percent: {
            requiredIf: requiredIf(() => {
              return props.validPercentLevel == true;
            }),
          },

          name: { required },
          academicPeriodId: { required },
          periodId: {},
        },
      },
      { form }
    );

    const loadingPeriod = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        if (activityClassification && activityClassification.periodId) loadingPeriod.value = true;
        const params = { perPage: 100 };
        const resAcademicPeriods = await getAcademicPeriodsForSelectService.run(params);

        academicPeriods.value = resAcademicPeriods.data;
        activeAcademicPeriods.value = resAcademicPeriods.data.filter((period: any) => period.active === 1);

        if (activityClassification) form.academicPeriodId = activityClassification.academicPeriodId;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.academicPeriodId,
      async (value) => {
        if (value) {
          const params = { academicPeriodId: value, perPage: 100 };
          const resPeriods = await getPeriodsByAcademicPeriodService.run(params);

          periods.value = await resPeriods.data;

          if (activityClassification && activityClassification.periodId) {
            form.periodId = activityClassification.periodId;

            loadingPeriod.value = false;
          }
        } else {
          periods.value = [];
        }
      }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const data: any = { ...form };
        data.levelId = levelId;
        if (activityClassification) {
          data.nameOld = activityClassification?.name ?? '';
          await createOrUpdateActivitiesClassificationByLevelIdService.run(data, levelId);
        } else {
          await createOrUpdateActivitiesClassificationByLevelIdService.run(data);
        }

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      v$,
      t,

      activeAcademicPeriods,
      loadingPeriod,
      periods,
      //level,

      save,
    };
  },
});
</script>
