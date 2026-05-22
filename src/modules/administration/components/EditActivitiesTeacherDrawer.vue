<template>
  <ActivitiesTeacherDrawerForm
    :isVisible="isVisible"
    @update:isVisible="updateVisibility"
    :title="title"
    :subtitle="subtitle"
    :activity="activity"
    :level="level"
    :competencies-by-period="competenciesByPeriod"
    @reload-data="reloadData"
    :loadingP="loading"
  ></ActivitiesTeacherDrawerForm>
</template>

<script lang="ts">
import { Ref, defineComponent, ref, toRefs, watch } from 'vue';
//import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

//import AppLoading from '../../../shared/components/AppLoading.vue';
//import ActivitiesTeacherForm from '../components/ActivitiesTeacherForm.vue';
import ActivitiesTeacherDrawerForm from './ActivitiesTeacherDrawerForm.vue';

import { LevelDto } from '../dtos/level.dto';
import { ActivityDetailDto } from '../dtos/activity.dto';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetActivityByIdService } from '../services/getActivityById.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
import { GetListCompetencesService } from '../services/getListCompetences.service';
import { GetActivitiesRelatedDataFormService } from '../services/getActivitiesRelatedDataForm.service';

const getActivitiesRelatedDataFormService = new GetActivitiesRelatedDataFormService();
const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getListCompetencesService = new GetListCompetencesService();
const getActivityByIdService = new GetActivityByIdService();
const getCourseByIdService = new GetCourseByIdService();

import { GetActiveCoursesService } from '../services/getActiveCourses.service';
import { GetSubjectAssignmentsService } from '../../academicPlanning/services/getSubjectAssignments.service';
//import { integer } from 'vuelidate/lib/validators';
const getSubjectAssignmentsService = new GetSubjectAssignmentsService();
const getActiveCoursesService = new GetActiveCoursesService();

export default defineComponent({
  name: 'EditActivitiesTeacherDrawer',
  components: { ActivitiesTeacherDrawerForm },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    courseId: {
      type: Number,
      required: true,
    },
    activityId: {
      type: Number,
      required: true,
    },
    isMounted: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],
  setup(props, { emit }) {
    const { t } = useI18n();
    //const route = useRoute();
    const title = `classroom.activitiesTeacher.edit.title`;
    //const courseId = parseInt(route.params.courseId.toString(), 10);
    //const courseId = props.courseId;
    const { courseId } = toRefs(props);
    //const isCourseExecution = route.path.search('execution-of-courses') >= 0;

    //const routes: any = [{ name: t(title) }];
    useMeta({ title: t(title) });

    const activity: Ref<ActivityDetailDto | null> = ref(null);
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
    watch(
      () => props.isMounted,
      async () => {
        loading.value = true;
        try {
          // Obtener IDs necesarios del curso
          const courses = await getActiveCoursesService.run({});
          const courseData = courses.find((data: any) => data.courses.some((course: any) => course.id === props.courseId));

          if (courseData) {
            const currentCourse = courseData.courses.find((course: any) => course.id === props.courseId);
            const academicPeriodGroupId = courseData.id;
            const subjectAssignmentId = currentCourse.subjectAssignmentId;

            // Obtener curriculumSubjectId si es necesario
            const resp = academicPeriodGroupId ? await getSubjectAssignmentsService.run(academicPeriodGroupId) : [];
            const subjectAssignment = resp.find((assignment: any) => assignment.id === subjectAssignmentId);
            const curriculumSubjectId = subjectAssignment ? subjectAssignment.curriculumSubjectId : null;

            // Ejecutar múltiples llamadas de servicio en paralelo
            const [activityData, competences, levelData, course] = await Promise.all([
              getActivityByIdService.run(props.activityId),
              curriculumSubjectId ? getListCompetencesService.run(curriculumSubjectId, props?.courseId) : Promise.resolve([]),
              getLevelByCourseIdService.run(props.courseId),
              getCourseByIdService.run(props.courseId),
            ]);

            // Asignar valores recibidos
            activity.value = activityData;
            level.value = levelData;
            subtitle.value = course.name;

            // Obtener y procesar datos relacionados con resultados de aprendizaje
            const response = await getActivitiesRelatedDataFormService.run(props.courseId, props.activityId);
            const learningOutcomesIds = response.learningOutcomes.filter((elem: any) => elem.checked).map((elem: any) => elem.id);
            activity.value['learningOutcomesIds'] = learningOutcomesIds;

            const learningOutcomes = response.learningOutcomes;
            const periods = response.periods;
            const topics = response.topics;

            // Procesar competencias y resultados de aprendizaje
            competenciesByPeriod.value = periods.map((period: any) => {
              const periodCompetences = competences.filter((competence: any) => competence.periodId === period.id);

              const competenceWithLearningOutcomesAndTopics = periodCompetences.map((competency: any) => {
                const currentLearningOutcomes = learningOutcomes.filter((outcome: any) => outcome.competencyId === competency.id);
                const currentTopics = topics.filter((topic: any) => topic.competencyId === competency.id);

                return {
                  id: competency.id,
                  name: competency.description,
                  learningOutcomes: currentLearningOutcomes,
                  topics: currentTopics,
                };
              });

              return {
                periodId: period.id,
                competences: competenceWithLearningOutcomesAndTopics,
              };
            });
          }
        } catch (e) {
          console.error(e);
        }

        loading.value = false;
        // }
      }
    );

    return {
      subtitle,
      loading,
      //routes,
      title,

      competenciesByPeriod,
      activity,
      level,

      updateVisibility,
      reloadData,
    };
  },
});
</script>
