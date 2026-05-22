<template>
  <PlanningWeeksForm :title="titleAux" :routes="routes"></PlanningWeeksForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import PlanningWeeksForm from '../components/PlanningWeeksForm.vue';

import { RelatedDataDto } from '../dtos/planningWeek.dto';

import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';

const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();

export default defineComponent({
  name: 'CreatePlanningWeek',
  components: {
    PlanningWeeksForm,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const titleAux = `Agregar Planeación`;
    const courseId = parseInt(route.params.courseId as string, 10);
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

    const relatedData: Ref<RelatedDataDto | null> = ref(null);
    const title: Ref<string> = ref('');


    onMounted(async () => {
      try {
        relatedData.value = await getRelatedDataPlanningWeeksService.run({
          courseId: courseId,
        });

        title.value = 'Agregar Planeación';
        console.log("title.value",title.value);
        

      } catch (e) {
        console.log(e);
      }

    });

    return {
      routes,
      title,
      titleAux
    };
  },
});
</script>

<style scoped></style>
