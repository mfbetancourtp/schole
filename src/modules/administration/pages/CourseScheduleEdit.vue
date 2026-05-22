<template>
  <AppLoading v-if="loading"></AppLoading>
  <CourseScheduleForm v-else :title="title" :routes="routes" :data="data"></CourseScheduleForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import CourseScheduleForm from '../components/CourseScheduleForm.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetCourseByIdService } from '../services/getCourseById.service';

const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'CourseScheduleEdit',
  components: { CourseScheduleForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `${t('core.edit')} Curso`;

    useMeta({ title: title });

    const routes: BreadCrumbsType[] = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'administration.courseSchedule' },
      },
      {
        name: title,
      },
    ];

    const data: Ref<any> = ref(null);

    const loading = ref(true);

    onMounted(async () => {
      try {
        const courseId = parseInt(route.params.courseId.toString(), 10);
        data.value = await getCourseByIdService.run(courseId);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,
      data,
    };
  },
});
</script>

<style scoped></style>
