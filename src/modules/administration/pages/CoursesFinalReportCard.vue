<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'administration.homeTeacher' }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppCard>
        <template #body>
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('core.generalTerms.academic.student.plural') }}</th>
                <th class="col-3 text-center">{{ t('Nota') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!studentFinalNotes.length">
                <td colspan="2">
                  <AppEmptyResponse :subtitle="false" :show-image="true"></AppEmptyResponse>
                </td>
              </tr>

              <tr v-for="(item, index) in studentFinalNotes" :key="index">
                <td>{{ item.student }}</td>
                <td
                  class="text-center"
                  :style="{
                    backgroundColor: item.isEdit === 1 ? '#ffaa' : 'unset',
                  }"
                >
                  {{ item.finalPercent ?? '---' }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetFinalPercentCourseInscriptionsService } from '../services/getFinalPercentCourseInscriptions.service';

const getFinalPercentCourseInscriptionsService = new GetFinalPercentCourseInscriptionsService();
const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'CoursesFinalReportCard',
  components: {
    AppEmptyResponse,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'classroom.homeTeacher.finalReportCard';
    const courseId = parseInt(route.params.courseId.toString(), 10);

    useMeta({ title: t(title) });
    const routes: any = [
      {
        name: `core.menu.home-teacher`,
        url: { name: 'administration.homeTeacher' },
      },
      {
        name: title,
      },
    ];

    const studentFinalNotes: Ref<any[]> = ref([]);

    const subtitle = ref();

    const loading = ref(true);

    onMounted(async () => {
      try {
        let course = await getCourseByIdService.run(courseId);
        studentFinalNotes.value = await getFinalPercentCourseInscriptionsService.run(courseId);

        subtitle.value = course.name;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      subtitle,
      courseId,
      loading,
      routes,
      title,
      t,

      studentFinalNotes,
    };
  },
});
</script>

<style scoped></style>
