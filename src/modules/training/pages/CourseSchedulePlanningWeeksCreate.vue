<template>
  <AppLoading v-if="loading"></AppLoading>

  <CourseSchedulePlanningWeeksForm v-if="!loading && relatedData" :title="title" :routes="routes" :related-data="relatedData"></CourseSchedulePlanningWeeksForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import CourseSchedulePlanningWeeksForm from '../components/CourseSchedulePlanningWeeksForm.vue';

import { GetPlanningWeeksByCourseIdService } from '../services/getPlanningWeeksByCourseId.service';
import { GetRelatedDataPlanningWeeksService } from '../../administration/services/getRelatedDataPlanningWeeks.service';

const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const getPlanningWeeksByCourseIdService = new GetPlanningWeeksByCourseIdService();

export default defineComponent({
  name: 'CourseSchedulePlanningWeeksCreate',
  components: {
    CourseSchedulePlanningWeeksForm,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const titleAux = `Agregar Planeación`;
    const courseId = parseInt(route.params.courseId as string, 10);

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

    const relatedData: Ref<any> = ref(null);
    const title: Ref<string> = ref('');

    const loading = ref(true);

    onMounted(async () => {
      try {
        relatedData.value = await getRelatedDataPlanningWeeksService.run({
          courseId: courseId,
        });
        const course = await getPlanningWeeksByCourseIdService.run(courseId);

        title.value = `Agregar planeación "${course.name}"`;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,

      relatedData,
    };
  },
});
</script>

<style scoped></style>
