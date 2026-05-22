<template>
  <AppLoading v-if="loading"></AppLoading>

  <template v-if="!loading && session && relatedData">
    <AttendanceForm :title="title" :subtitle="subtitle" :routes="routes" :related-data="relatedData" :attendance="session"></AttendanceForm>
  </template>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AttendanceForm from '../components/AttendanceForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { AttendanceFormDto } from '../dtos/attendance.dto';
import { AttendanceRelatedDataDto } from '../dtos/attendance.dto';

import { GetSessionByIdService } from '../services/getSessionById.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';

const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();
const getSessionByIdService = new GetSessionByIdService();

export default defineComponent({
  name: 'EditAttendance',
  components: { AttendanceForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `classroom.attendance.edit`;
    const courseId = parseInt(route.params.courseId.toString(), 10);
    const sessionId = parseInt(route.params.sessionId.toString(), 10);

    useMeta({ title: t(title) });
    const routes: any = [{ name: t(title) }];

    const relatedData: Ref<AttendanceRelatedDataDto | null> = ref(null);
    const session: Ref<AttendanceFormDto | null> = ref(null);
    const subtitle: Ref<string> = ref('');

    const loading = ref(true);

    onMounted(async () => {
      try {
        relatedData.value = await getSessionsRelatedDataFormService.run(courseId);
        session.value = await getSessionByIdService.run(sessionId);

        subtitle.value = relatedData.value.courseData.name;

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
            name: `classroom.homeTeacher.attendance`,
            url: {
              name: 'administration.homeTeacher.attendance',
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

      relatedData,
      session,
    };
  },
});
</script>
