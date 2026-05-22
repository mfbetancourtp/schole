<template>
  <AppLoading v-if="loading" />

  <div v-else class="Body__developmentMap">
    <DevelopmentMapList :employeeId="employeeId" :organizationalJobId="organizationalJobId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../../shared/components/AppLoading.vue';
import DevelopmentMapList from '../../components/organizational/developmentMapList.vue';

import { GetEmployeeWithOrgaJobsCurrentUserService } from '../../services/organizational/getEmployeeWithOrgaJobsCurrentUser.service';

const getEmployeeWithOrgaJobsCurrentUserService = new GetEmployeeWithOrgaJobsCurrentUserService();

export default defineComponent({
  name: 'developmentMapList',
  components: { AppLoading, DevelopmentMapList },

  setup() {
    const route = useRoute();
    const title = 'Estructura organizacional';

    useMeta({ title });

    const organizationalJobId = ref<any>(0);
    const employeeId = ref<any>(0);

    const loading = ref(true);

    onMounted(async () => {
      try {
        const response = await getEmployeeWithOrgaJobsCurrentUserService.run();

        organizationalJobId.value = route.query.organizationalJobId ?? response.organizationalJobs[0].id;
        employeeId.value = route.query.employeeId ?? response.employee.id;
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    });

    return {
      loading,

      organizationalJobId,
      employeeId,
    };
  },
});
</script>
<style scoped>
.Body__developmentMap {
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  padding: var(--padding-4);
}
.Body__developmentMap::-webkit-scrollbar {
  width: 0.1rem;
}
.Body__developmentMap::-webkit-scrollbar-track {
  background: transparent;
}
.Body__developmentMap::-webkit-scrollbar-thumb {
  border-radius: 20px;
  border: none;
}
</style>
