<template>
  <AppLoading v-if="loading"></AppLoading>

  <form v-else @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <template v-if="keyData == 'competencies'">
          <h5>Competencias</h5>

          <AppEmptyResponse v-if="!competencies.length" :subtitle="false"></AppEmptyResponse>

          <template v-for="(item, index) in competencies" :key="index">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="`${index}`" :value="item.id" v-model="v$.form.competencies.$model" />
              <label class="form-check-label" :for="`${index}`">{{ item.description }}</label>
            </div>
          </template>
        </template>

        <template v-if="keyData == 'activities'">
          <h5>Actividades</h5>

          <AppEmptyResponse v-if="!activities.length" :subtitle="false"></AppEmptyResponse>

          <template v-for="(item, index) in activities" :key="index">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="`${index}`" :value="item.id" v-model="v$.form.activities.$model" />
              <label class="form-check-label" :for="`${index}`">{{ item.name }}</label>
            </div>
          </template>
        </template>

        <template v-if="keyData == 'sessions'">
          <h5>Sesiones de Clases</h5>

          <AppEmptyResponse v-if="!sessions.length" :subtitle="false"></AppEmptyResponse>

          <template v-for="(item, index) in sessions" :key="index">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="`${index}`" :value="item.id" v-model="v$.form.sessions.$model" />
              <label class="form-check-label" :for="`${index}`">
                {{ dayjs(item.dateSince, 'YYYY-MM-DD HH:mm').format('D MMM YYYY h:mm A') }}
                a
                {{ dayjs(item.dateUntil, 'YYYY-MM-DD HH:mm').format('h:mm A') }}
                <template v-if="item.name">{{ `${item.name}` }}</template>
              </label>
            </div>
          </template>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { SessionDto } from '../dtos/planningWeek.dto';
import { ActivityDto } from '../dtos/planningWeek.dto';
import { CompetencyDto } from '../dtos/planningWeek.dto';

import { PostSaveDefaultPlanningService } from '../services/postSaveDefaultPlanning.service';
import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';

const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const postSaveDefaultPlanningService = new PostSaveDefaultPlanningService();

export default defineComponent({
  name: 'SelectCompetenciesActivitiesSessions',
  components: { AppFormModal, AppButton, AppLoading, AppEmptyResponse },

  props: {
    planningWeekId: {
      type: Number,
      required: true,
    },
    keyData: {
      type: String as PropType<'activities' | 'competencies' | 'sessions'>,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const title = ref('Seleccionar');
    const courseId = parseInt(route.params.courseId as string, 10);

    const competencies: Ref<CompetencyDto[]> = ref([]);
    const activities: Ref<ActivityDto[]> = ref([]);
    const sessions: Ref<SessionDto[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      planningWeekId: props.planningWeekId,
      competencies: [],
      sessions: [],
      activities: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          planningWeekId: {},
          competencies: {},
          sessions: {},
          activities: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        if (props.keyData == 'competencies') title.value += ' competencias';
        if (props.keyData == 'activities') title.value += ' actividades';
        if (props.keyData == 'sessions') title.value += ' sesiones';

        const relatedData = await getRelatedDataPlanningWeeksService.run({
          courseId: courseId,
        });

        competencies.value = relatedData.competencies;
        activities.value = relatedData.activities;
        sessions.value = relatedData.sessions;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await postSaveDefaultPlanningService.run(form);

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

      competencies,
      activities,
      sessions,

      save,

      dayjs,
    };
  },
});
</script>
