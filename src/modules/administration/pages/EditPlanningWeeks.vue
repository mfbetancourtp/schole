<template>
  <AppLoading v-if="loading"></AppLoading>

  <PlanningWeeksForm v-if="!loading && relatedData" :title="title" :routes="routes" :related-data="relatedData" :planning-week-with-detail="planningWeekWithDetails"></PlanningWeeksForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import PlanningWeeksForm from '../components/PlanningWeeksForm.vue';

import { RelatedDataDto } from '../dtos/planningWeek.dto';
import { PlanningWeekWithDetailDto } from '../dtos/planningWeek.dto';

import { GetSessionByIdService } from '../services/getSessionById.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';
import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';
import { GetPlanningWeeksWithDetailsService } from '../services/getPlanningWeeksWithDetails.service';

const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();
const getSessionByIdService = new GetSessionByIdService();

export default defineComponent({
  name: 'EditPlanningWeeks',
  components: {
    PlanningWeeksForm,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const titleAux = `Editar Planeación`;
    const courseId = parseInt(route.params.courseId as string, 10);
    const planningWeekId = parseInt(route.params.planningWeekId as string, 10);
    const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId as string, 10);

    useMeta({ title: t(titleAux) });
    const routes = [
      {
        name: 'core.menu.home-teacher',
        url: { name: 'administration.homeTeacher' },
      },
      {
        name: 'Diario de campo',
        url: {
          name: 'administration.homeTeacherPlanningWeeks',
          params: { academicPeriodGroupId: academicPeriodGroupId },
        },
      },
      { name: titleAux },
    ];

    const planningWeekWithDetails: Ref<PlanningWeekWithDetailDto | null> = ref(null);
    const relatedData: Ref<RelatedDataDto | null> = ref(null);
    const title: Ref<string> = ref('');

    const loading = ref(true);

    onMounted(async () => {
      try {
        planningWeekWithDetails.value = await getPlanningWeeksWithDetailsService.run(planningWeekId);
        const relatedDataSession = await getSessionsRelatedDataFormService.run(courseId);
        relatedData.value = await getRelatedDataPlanningWeeksService.run({
          courseId: courseId,
        });

        title.value = `Editar Planeación "${relatedData.value?.courseData.subjectName}"`;

        const topics: any[] = relatedDataSession.topics;

        if (planningWeekWithDetails.value && planningWeekWithDetails.value.sessions.length) {
          for (let i = 0; i < planningWeekWithDetails.value.sessions.length; i++) {
            const sessionId = planningWeekWithDetails.value.sessions[i].id;
            const currentSession = await getSessionByIdService.run(sessionId);
            const topicIds: any[] = currentSession.topicIds;
            const lcTopics: any[] = [];

            for (let j = 0; j < topicIds.length; j++) {
              const currentTopic = topics.filter((item) => item.id == topicIds[j]);

              if (currentTopic.length) lcTopics.push(currentTopic[0]);
            }

            if (lcTopics.length) planningWeekWithDetails.value.sessions[i].topics = lcTopics;
            else planningWeekWithDetails.value.sessions[i].topics = [];
          }
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,

      planningWeekWithDetails,
      relatedData,
    };
  },
});
</script>

<style scoped></style>
