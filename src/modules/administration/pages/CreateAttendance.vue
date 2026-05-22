<template>
    <AttendanceForm  :title="title" :subtitle="subtitle" :routes="routes"></AttendanceForm>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AttendanceForm from '../components/AttendanceForm.vue';

import { AttendanceRelatedDataDto } from '../dtos/attendance.dto';

import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';

const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();

export default defineComponent({
  name: 'CreateAttendance',
  components: { AttendanceForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `classroom.attendance.new`;
    const courseId = parseInt(route.params.courseId.toString(), 10);

    useMeta({ title: t(title) });
    const routes: any = [{ name: t(title) }];

    const relatedData: Ref<AttendanceRelatedDataDto | null> = ref(null);
    const subtitle: Ref<string> = ref('');

    const loading = ref(true);

    onMounted(async () => {
      try {
        relatedData.value = await getSessionsRelatedDataFormService.run(courseId);

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
    };
  },
});
</script>
