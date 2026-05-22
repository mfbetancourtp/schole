<template>
  <template v-if="route.query.organizationalJobId && route.query.employeeId">
    <developmentMapList></developmentMapList>
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import developmentMapList from '../../publicModule/pages/organizational/developmentMap.vue';

import { GetEmplWithOrgaJobsCurreUserService } from '../services/getEmplWithOrgaJobsCurreUser.service';

const getEmplWithOrgaJobsCurreUserService = new GetEmplWithOrgaJobsCurreUserService();

export default defineComponent({
  name: 'MyMap',

  components: { developmentMapList },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    useMeta({ title: t('Mi Mapa') });

    const loading = ref(true);

    onMounted(async () => {
      const user: any = await getEmplWithOrgaJobsCurreUserService.run();

      if (user.employee && user.employee?.id && user.organizationalJobs?.length) {
        const currentRouting = route.path;
        const queryParameters = {
          organizationalJobId: user.organizationalJobs[0].id,
          employeeId: user.employee.id,
        };

        router.push({ path: currentRouting, query: queryParameters });
      }

      loading.value = false;
    });

    return {
      loading,
      route,
      t,
    };
  },
});
</script>

<style scoped></style>
