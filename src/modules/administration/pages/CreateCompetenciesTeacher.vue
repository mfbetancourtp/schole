<template>
  <AppLoading v-if="loading"></AppLoading>

  <template v-else-if="!loading && level">
    <CompetenciesForm :title="title" :subtitle="subtitle" :routes="routes" :level="level"></CompetenciesForm>
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import CompetenciesForm from '../components/CompetenciesForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { LevelDto } from '../dtos/level.dto';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';

const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'CreateCompetenciesTeacher',
  components: { CompetenciesForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `classroom.competence.create`;

    const routes: any = [{ name: t(title) }];
    useMeta({ title: t(title) });

    const level: Ref<LevelDto | null> = ref(null);

    const subtitle = ref();

    const loading = ref(true);

    onMounted(async () => {
      try {
        const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId.toString(), 10);
        const courseId = parseInt(route.params.courseId.toString(), 10);

        level.value = await getLevelByCourseIdService.run(courseId);
        const course = await getCourseByIdService.run(courseId);

        subtitle.value = course.name;

        if (route.query.planningWeekId) {
          routes.unshift(
            {
              name: 'classroom.homeTeacher.title',
              url: { name: 'administration.homeTeacher' },
            },
            {
              name: 'Diario de campo',
              url: {
                name: 'administration.homeTeacherPlanningWeeks',
                params: { academicPeriodGroupId },
              },
            },
            {
              name: 'Editar Planeación',
              url: {
                name: 'administration.homeTeacherPlanningWeeksEdit',
                params: {
                  planningWeekId: route.query.planningWeekId,
                  academicPeriodGroupId,
                  courseId: courseId,
                },
              },
            }
          );
        } else {
          routes.unshift(
            {
              name: `classroom.homeTeacher.title`,
              url: { name: 'administration.homeTeacher' },
            },
            {
              name: `classroom.competence.title`,
              url: { name: 'administration.homeTeacher.competencies' },
            }
          );
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      subtitle,
      loading,
      routes,
      title,

      level,
    };
  },
});
</script>
