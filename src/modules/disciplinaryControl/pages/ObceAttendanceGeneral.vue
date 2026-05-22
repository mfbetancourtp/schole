<template>
  <AppLoading v-if="loading" />

  <template v-if="!loading && session && attendanceGeneralDate">
    <AttendanceGeneralForm :title="title" :routes="routes" :attendanceGeneralDate="attendanceGeneralDate" :dataCalender="dataCalender" :attendance="session" />
  </template>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';

import AttendanceGeneralForm from '../../administration/components/AttendanceGeneralForm.vue';

import { GetAttendancesGeneralByDateService } from '../../administration/services/getAttendancesGeneralByDate.service';
import { GetSessionGeneralByIdService } from '../../administration/services/getSessionGeneralById.service';

const getAttendancesGeneralByDateService = new GetAttendancesGeneralByDateService();
const getSessionGeneralByIdService = new GetSessionGeneralByIdService();

export default defineComponent({
  name: 'ObceAttendanceGeneral',
  components: {
    AttendanceGeneralForm,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();

    const title = `classroom.attendanceGeneral.edit`;

    useMeta({ title: t(title) });
    const routes: any = [{ name: t(title) }];

    const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId.toString(), 10);
    const sessionId = parseInt(route.params.sessionId.toString(), 10);

    const dataCalender: Ref<any | null> = ref(null);
    const session: Ref<any | null> = ref(null);
    const attendanceGeneralDate = ref([]);

    const loading = ref(true);

    onMounted(async () => {
      try {
        attendanceGeneralDate.value = await getAttendancesGeneralByDateService.run(academicPeriodGroupId);
        session.value = await getSessionGeneralByIdService.run(sessionId);
        dataCalender.value = session.value.dataCalender;

        await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const loadRoutes = () => {
      routes.unshift({
        name: `core.menu.observer`,
        url: {
          name: 'disciplinaryControl.observer',
        },
      });
    };

    return {
      loading,
      routes,
      title,

      attendanceGeneralDate,
      dataCalender,
      session,
    };
  },
});
</script>
