<template>
  <AppLoading v-if="loading"></AppLoading>

  <template v-if="!loading && session && attendanceGeneralDate">
    <AttendanceGeneralForm
      :title="title"
      :subtitle="subtitle"
      :routes="routes"
      :attendanceGeneralDate="attendanceGeneralDate"
      :dataCalender="dataCalender"
      :attendance="session"
    ></AttendanceGeneralForm>
  </template>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetSessionGeneralByIdService } from '../services/getSessionGeneralById.service';
import AttendanceGeneralForm from '../components/AttendanceGeneralForm.vue';
import { GetAttendancesGeneralByDateService } from '../services/getAttendancesGeneralByDate.service';

const getAttendancesGeneralByDateService = new GetAttendancesGeneralByDateService();
const getCourseByIdService = new GetCourseByIdService();

const getSessionGeneralByIdService = new GetSessionGeneralByIdService();

export default defineComponent({
  name: 'EditAttendance',
  components: { AppLoading, AttendanceGeneralForm },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `classroom.attendanceGeneral.edit`;
    const courseId = parseInt(route.params.courseId.toString(), 10);
    const sessionId = parseInt(route.params.sessionId.toString(), 10);

    useMeta({ title: t(title) });
    const routes: any = [{ name: t(title) }];

    const session: Ref<any | null> = ref(null);
    const dataCalender: Ref<any | null> = ref(null);
    const subtitle: Ref<string> = ref('');
    const attendanceGeneralDate = ref([]);

    const loading = ref(true);

    onMounted(async () => {
      try {
        const course = await getCourseByIdService.run(courseId);
        attendanceGeneralDate.value = await getAttendancesGeneralByDateService.run(course.academicPeriodGroupId);
        const response = await getSessionGeneralByIdService.run(sessionId);
        session.value = response;
        dataCalender.value = response.dataCalender;
        // subtitle.value = relatedData.value.courseData.name;

        await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const loadRoutes = () => {
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
            name: `classroom.homeTeacher.title`,
            url: { name: 'administration.homeTeacher' },
          },
          {
            name: `classroom.attendanceGeneral.title`,
            url: {
              name: 'administration.homeTeacher.attendanceGeneral',
              params: { courseId },
            },
          }
        );
      }
    };

    return {
      subtitle,
      loading,
      routes,
      title,

      attendanceGeneralDate,
      session,
      dataCalender,
    };
  },
});
</script>
