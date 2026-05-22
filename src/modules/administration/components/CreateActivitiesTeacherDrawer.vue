<template>
  <ActivitiesTeacherDrawerForm
    :isVisible="isVisible"
    @update:isVisible="updateVisibility"
    :title="title"
    :subtitle="subtitle"
    :level="level"
    :competencies-by-period="competenciesByPeriod"
    @reload-data="reloadData"
    :loadingP="false"
  ></ActivitiesTeacherDrawerForm>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

//import AppLoading from '../../../shared/components/AppLoading.vue';
//import ActivitiesTeacherForm from '../components/ActivitiesTeacherForm.vue';
import ActivitiesTeacherDrawerForm from '../components/ActivitiesTeacherDrawerForm.vue';
import { LevelDto } from '../dtos/level.dto';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
import { GetListCompetencesService } from '../services/getListCompetences.service';
import { GetActivitiesRelatedDataFormService } from '../services/getActivitiesRelatedDataForm.service';

const getActivitiesRelatedDataFormService = new GetActivitiesRelatedDataFormService();
const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getListCompetencesService = new GetListCompetencesService();
const getCourseByIdService = new GetCourseByIdService();

import { GetActiveCoursesService } from '../services/getActiveCourses.service';
import { GetSubjectAssignmentsService } from '../../academicPlanning/services/getSubjectAssignments.service';
const getSubjectAssignmentsService = new GetSubjectAssignmentsService();
const getActiveCoursesService = new GetActiveCoursesService();

export default defineComponent({
  name: 'CreateActivitiesTeacherDrawer',
  components: { ActivitiesTeacherDrawerForm },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const title = `classroom.activitiesTeacher.create.title`;
    const courseId = parseInt(route.params.courseId.toString(), 10);
    //const isCourseExecution = route.path.search('execution-of-courses') >= 0;

    //const routes: any = [{ name: t(title) }];
    useMeta({ title: t(title) });

    const competenciesByPeriod: Ref<any[]> = ref([]);
    const level: Ref<LevelDto | null> = ref(null);

    const subtitle = ref();

    const loading = ref(true);

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value); // Emitimos el evento para v-model
    };
    const reloadData = () => {
      emit('reload-data');
    };

    onMounted(async () => {
      try {
        let courses: any[] = await getActiveCoursesService.run({});
        let academicPeriodGroupId: number | null = null;
        let subjectAssignmentId: number | null = null;
        let curriculumSubjectId: number | null = null;

        for (let i = 0; i < courses.length; i++) {
          let currentData: any = await courses[i];

          for (let j = 0; j < currentData.courses.length; j++) {
            let currentCourse: any = await currentData.courses[j];

            if (currentCourse.id == courseId) {
              academicPeriodGroupId = currentData.id;
              subjectAssignmentId = currentCourse.subjectAssignmentId;
              break;
            }
          }
        }

        if (academicPeriodGroupId) {
          let resp = await getSubjectAssignmentsService.run(academicPeriodGroupId);
          resp.forEach((subjectAssignment: any) => {
            if (subjectAssignment.id === subjectAssignmentId) {
              curriculumSubjectId = subjectAssignment.curriculumSubjectId;
            }
          });
        }

        const response = await getActivitiesRelatedDataFormService.run(courseId);

        const competences = await getListCompetencesService.run(curriculumSubjectId);
        // const competences = await getListCompetencesService.run(courseId);

        level.value = await getLevelByCourseIdService.run(courseId);
        const course = await getCourseByIdService.run(courseId);

        subtitle.value = course.name;

        // load competencies with learning outcomes and topics by period
        const learningOutcomes: any[] = response.learningOutcomes;
        const periods: any[] = response.periods;
        const topics: any[] = response.topics;

        for (let i = 0; i < periods.length; i++) {
          const periodId = periods[i].id;

          const currentCompetences: any[] = await competences.filter((item) => item.periodId == periodId);
          let competenceWithLearningOutcomesAndTopics: any[] = [];

          for (let j = 0; j < currentCompetences.length; j++) {
            const competencyId = currentCompetences[j].id;

            const currentLearningOutcomes: any[] = await learningOutcomes.filter((item: any) => item.competencyId == competencyId);
            const currentTopics: any[] = await topics.filter((item: any) => item.competencyId == competencyId);

            competenceWithLearningOutcomesAndTopics.push({
              id: competencyId,
              name: currentCompetences[j].description,
              learningOutcomes: currentLearningOutcomes,
              topics: currentTopics,
            });
          }

          competenciesByPeriod.value.push({
            periodId,
            competences: competenceWithLearningOutcomesAndTopics,
          });

          competenceWithLearningOutcomesAndTopics = [];
        }

        //await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    /*
    const loadRoutes = () => {
      if (!isCourseExecution) {
        if (route.query.planningWeekId && route.query.aplication) {
          routes.unshift(
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
            {
              name: 'Editar Planeación',
              url: {
                name: 'training.courseSchedulePlanningWeeksEdit',
                params: {
                  planningWeekId: route.query.planningWeekId,
                  courseId: courseId,
                },
              },
            }
          );
        } else if (route.query.planningWeekId) {
          routes.unshift(
            {
              name: 'classroom.homeTeacher.title',
              url: { name: 'administration.homeTeacher' },
            },
            {
              name: 'Diario de campo',
              url: {
                name: 'administration.homeTeacherPlanningWeeks',
                params: {
                  academicPeriodGroupId: route.query.academicPeriodGroupId,
                },
              },
            },
            {
              name: 'Editar Planeación',
              url: {
                name: 'administration.homeTeacherPlanningWeeksEdit',
                params: {
                  academicPeriodGroupId: route.query.academicPeriodGroupId,
                  planningWeekId: route.query.planningWeekId,
                  courseId: courseId,
                },
              },
            }
          );
        } else {
          routes.unshift(
            {
              name: 'classroom.homeTeacher.title',
              url: { name: 'administration.homeTeacher' },
            },
            {
              name: `${t('core.menu.studentActivities')} (${t('core.generalTerms.academic.teacher.plural')})`,
              url: {
                name: 'administration.homeTeacher.activities',
                params: { courseId: courseId },
              },
            }
          );
        }
      } else {
        routes.unshift(
          {
            name: `Ejecución de cursos`,
            url: { name: 'training.executionOfCourses' },
          },
          {
            name: `${t('core.menu.studentActivities')} (${t('core.generalTerms.academic.teacher.plural')})`,
            url: {
              name: 'training.executionOfCoursesActivities',
              params: { courseId: courseId },
            },
          }
        );
      }
    };
*/
    return {
      subtitle,
      loading,
      //routes,
      title,
      updateVisibility,
      reloadData,

      competenciesByPeriod,
      level,
    };
  },
});
</script>
