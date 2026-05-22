<template>
  <CourseScheduleForm :title="title" :routes="routes"></CourseScheduleForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import CourseScheduleForm from '../components/CourseScheduleForm.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

export default defineComponent({
  name: 'CourseScheduleCreate',
  components: { CourseScheduleForm },

  setup() {
    const { t } = useI18n();
    const title = `${t('core.new')} Curso`;

    useMeta({ title: title });
    const routes: BreadCrumbsType[] = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'training.courseSchedule' },
      },
      {
        name: title,
      },
    ];

    return {
      title,
      routes,
    };
  },
});
</script>

<style scoped></style>
