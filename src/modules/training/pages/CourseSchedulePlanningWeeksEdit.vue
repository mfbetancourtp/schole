<template>
  <AppLoading v-if="loading"></AppLoading>

  <CourseSchedulePlanningWeeksForm
    v-if="!loading && relatedData"
    :title="title"
    :routes="routes"
    :related-data="relatedData"
    :planning-week-with-detail="planningWeekWithDetails"
  ></CourseSchedulePlanningWeeksForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import CourseSchedulePlanningWeeksForm from '../components/CourseSchedulePlanningWeeksForm.vue';

// import { RelatedDataDto } from '../dtos/planningWeek.dto';
// import { PlanningWeekWithDetailDto } from '../dtos/planningWeek.dto';

// import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';
// import { GetPlanningWeeksWithDetailsService } from '../services/getPlanningWeeksWithDetails.service';
import { GetRelatedDataPlanningWeeksService } from '../../administration/services/getRelatedDataPlanningWeeks.service';
import { GetPlanningWeeksWithDetailsService } from '../../administration/services/getPlanningWeeksWithDetails.service';
import { GetPlanningWeeksByCourseIdService } from '../services/getPlanningWeeksByCourseId.service';
import { useHeaderStore } from '../../../stores/header.store';

const getPlanningWeeksByCourseIdService = new GetPlanningWeeksByCourseIdService();
const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();

export default defineComponent({
  name: 'EditPlanningWeeks',
  components: {
    CourseSchedulePlanningWeeksForm,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const titleAux = `Editar Planeación`;
    const courseId = parseInt(route.params.courseId as string, 10);
    const planningWeekId = parseInt(route.params.planningWeekId as string, 10);

    useMeta({ title: t(titleAux) });
    const routes = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'training.courseSchedule' },
      },
      {
        name: 'Planeación',
        url: {
          name: 'training.courseSchedulePlanningWeeks',
          params: { courseId: courseId },
        },
      },
      { name: titleAux },
    ];

    const planningWeekWithDetails: Ref<any> = ref(null);
    const relatedData: Ref<any> = ref(null);
    const title: Ref<string> = ref('');

    const loading = ref(true);

    onMounted(async () => {
      try {
        planningWeekWithDetails.value = await getPlanningWeeksWithDetailsService.run(planningWeekId);
        relatedData.value = await getRelatedDataPlanningWeeksService.run({
          courseId: courseId,
        });

        const course = await getPlanningWeeksByCourseIdService.run(courseId);

        title.value = `Editar planeación "${course.name}"`;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Capacitación', url: '' };
        headerStorage.moduleItem = { name: 'Cronograma de cursos', url: '' };
        headerStorage.moduleSubItem = { name: title.value, url: '' };
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
