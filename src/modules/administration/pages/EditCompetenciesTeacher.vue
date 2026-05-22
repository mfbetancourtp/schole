<template>
  <AppLoading v-if="loading"></AppLoading>

  <template v-else-if="!loading && competence && level">
    <Competencies-form :title="title" :subtitle="subtitle" :routes="routes" :competence="competence" :level="level"></Competencies-form>
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
import { CompetencyWithLearningOutcomeAndTopicDto } from '../dtos/competency.dto';

import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
import { GetCompetenceByIdService } from '../services/getCompetenceById.service';
import { GetCourseByIdService } from '../services/getCourseById.service';
import { useHeaderStore } from '../../../stores/header.store';

const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getCompetenceByIdService = new GetCompetenceByIdService();
const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'EditCompetenciesTeacher',
  components: { CompetenciesForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `classroom.competence.edit`;

    const routes: any = [{ name: t(title) }];
    useMeta({ title: t(title) });

    const competence: Ref<CompetencyWithLearningOutcomeAndTopicDto | null> = ref(null);
    const level: Ref<LevelDto | null> = ref(null);

    const subtitle = ref();

    const loading = ref(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };

        const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId.toString(), 10);
        const competenceId = parseInt(route.params.competenceId.toString(), 10);
        const courseId = parseInt(route.params.courseId.toString(), 10);

        competence.value = await getCompetenceByIdService.run(competenceId);
        level.value = await getLevelByCourseIdService.run(courseId);
        const course = await getCourseByIdService.run(courseId);

        subtitle.value = course.name;

        if (route.query.planningWeekId) {
          routes.unshift(
            {
              name: `classroom.homeTeacher.title`,
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
                  courseId,
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

      competence,
      level,
    };
  },
});
</script>
