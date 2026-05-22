<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:content>
      <AppLoading v-if="loading" />

      <template v-else>
        <!-- Welcome Banner -->
        <DashboardWelcomeBanner />

        <div class="dashboard-grid">
          <!-- Asistencia -->
          <DashboardAttendanceCard v-if="data" :data="data.attendance" />

          <!-- Carga Académica -->
          <DashboardAcademicLoadCard v-if="data" :data="data.academicLoad" />

          <!-- Horas -->
          <DashboardHoursCard v-if="data" :data="data.monthlyHours" />

          <!-- QR -->
          <DashboardQRCard v-if="data" :data="data.qr" />
        </div>

        <!-- Notifications & Quick Access -->
        <!-- <div class="dashboard-bottom">
          <DashboardNotifications />
          <DashboardQuickAccess />
        </div> -->
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

// Shared Components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

// Module Components
import DashboardAttendanceCard from '../components/DashboardAttendanceCard.vue';
import DashboardAcademicLoadCard from '../components/DashboardAcademicLoadCard.vue';
import DashboardHoursCard from '../components/DashboardHoursCard.vue';
import DashboardQRCard from '../components/DashboardQRCard.vue';
import DashboardWelcomeBanner from '../components/DashboardWelcomeBanner.vue';
// import DashboardNotifications from '../components/DashboardNotifications.vue';
// import DashboardQuickAccess from '../components/DashboardQuickAccess.vue';

// DTOs & Services
import { TeacherDashboardDto } from '../dtos/teacherDashboard.dto';
import { GetTeacherDashboardMockService } from '../services/getTeacherDashboard.mock';

const dashboardService = new GetTeacherDashboardMockService();

export default defineComponent({
  name: 'TeacherDashboardPage',

  components: {
    AppBaseList,
    AppLoading,
    DashboardAttendanceCard,
    DashboardAcademicLoadCard,
    DashboardHoursCard,
    DashboardQRCard,
    DashboardWelcomeBanner,
    // DashboardNotifications,
    // DashboardQuickAccess,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Dashboard General';

    useMeta({ title: t(title) });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Gestión Docente', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const routes = [{ name: title }];
    const loading = ref(true);
    const data: Ref<TeacherDashboardDto | null> = ref(null);

    const loadData = async () => {
      loading.value = true;
      try {
        data.value = await dashboardService.getDashboardData();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      loading.value = false;
    };

    onMounted(() => {
      loadData();
    });

    return {
      title,
      routes,
      loading,
      data,
    };
  },
});
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 8px 0;
}

.dashboard-bottom {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 900px) {
  .dashboard-grid,
  .dashboard-bottom {
    grid-template-columns: 1fr;
  }
}
</style>
