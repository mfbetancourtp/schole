<template>
  <AppBaseList>
    <template #actions>
      <AppButtonBack
        v-if="$route.params.academicPeriodGroupId"
        style="color: white"
        :to="{
          name: 'academicAdministration.enrolledByCourse',
          params: {
            academicPeriodGroupId: $route.params.academicPeriodGroupId,
          },
        }"
        >Nuevo</AppButtonBack
      >
    </template>
    <template #content>
      <StudentFormFull :title="title" :routes="routes"></StudentFormFull>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import StudentFormFull from '../components/StudentFormFull.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

export default defineComponent({
  name: 'EnrollStudent',
  components: { AppBaseList, StudentFormFull, AppButtonBack },

  setup() {
    const { t } = useI18n();
    const title = 'academicAdministration.matriculates.create.title';

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Administración académica', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };

    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    return {
      title,
      routes,
    };
  },
});
</script>

<style scoped></style>
