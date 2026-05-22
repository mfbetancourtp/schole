<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title">
    <template #actions>
      <AppButtonBack :to="{ name: 'training.courseSchedule' }"></AppButtonBack>
    </template>

    <template #content>
      <div v-if="course.isBudget" class="text-end">
        <h4>Gran total: {{ n(totalBudget, 'currency') }}</h4>
      </div>

      <div :class="{ 'grid-cards': course.planningWeeks.length }">
        <AppButtonNewContainer @click="create()"></AppButtonNewContainer>

        <AppEmptyResponse v-if="!course.planningWeeks.length"></AppEmptyResponse>

        <AppCard v-for="(item, index) in course.planningWeeks" :key="index">
          <template #title>
            <div class="d-flex justify-content-end">
              <AppIcon v-if="item.isApproved == 1" class="text-success" style="font-size: 1.2rem" icon="check-circle" v-tooltip="'Aprobado'"></AppIcon>
              <AppIcon v-else-if="item.isApproved == 0" class="text-danger" style="font-size: 1.2rem" icon="times-circle" v-tooltip="'No Aprobado'"></AppIcon>
              <AppIcon v-else-if="item.isApproved == null" style="font-size: 1.2rem" icon="minus-circle" v-tooltip="'Pendiente'"></AppIcon>
            </div>

            <div>{{ item.title }}</div>
          </template>

          <template #body>
            <p class="m-0 text-muted" style="font-size: 0.8rem">
              {{ dayjs(item.starDate).format('D MMM') }} -
              {{ dayjs(item.endDate).format('D MMM') }}
            </p>

            <hr />

            <p class="m-0">
              Competencias:
              <span class="badge rounded-pill text-bg-primary bg-primary">{{ item.numberCompetencies }}</span>
            </p>
            <p class="m-0">
              Temas:
              <span class="badge rounded-pill text-bg-primary bg-primary">{{ item.numberTopics }}</span>
            </p>
            <p class="m-0">
              Clases:
              <span class="badge rounded-pill text-bg-primary bg-primary">{{ item.numberSessions }}</span>
            </p>
            <p class="m-0">
              Actividades:
              <span class="badge rounded-pill text-bg-primary bg-primary">{{ item.numberActivities }}</span>
            </p>
            <p v-if="course.isBudget" class="m-0">
              Presupuesto total:
              <span class="badge rounded-pill text-bg-primary bg-primary">{{ n(item.total, 'currency') }}</span>
            </p>
          </template>

          <template #footer>
            <div class="d-flex justify-content-end">
              <AppButtonGroup>
                <AppButtonEdit
                  :to="{
                    name: 'training.courseSchedulePlanningWeeksEdit',
                    params: {
                      courseId: course.id,
                      planningWeekId: item.id,
                    },
                  }"
                ></AppButtonEdit>

                <AppButtonChat
                  :number-comments="`${item.numberComments == 0 ? '' : item.numberComments}`"
                  :comments="comments.value[`planningWeek_${item.id}`]"
                  :row-table="'PlanningWeeks'"
                  :row-id="item.id"
                  @new-comment="updateComments()"
                ></AppButtonChat>
              </AppButtonGroup>
            </div>
          </template>
        </AppCard>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonChat from '../../../shared/components/Buttons/AppButtonChat.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { GetPlanningWeeksByCourseIdService } from '../services/getPlanningWeeksByCourseId.service';
import { GetPlanningWeeksWithDetailsService } from '../../administration/services/getPlanningWeeksWithDetails.service';
import { useHeaderStore } from '../../../stores/header.store';

const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const getPlanningWeeksByCourseIdService = new GetPlanningWeeksByCourseIdService();

export default defineComponent({
  name: 'CourseSchedulePlanningWeeks',

  components: {
    AppButtonNewContainer,
    AppEmptyResponse,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonChat,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppIcon,
    AppCard,
  },

  setup() {
    const { t, n } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const titleAux = 'Planeación';
    const courseId = parseInt(route.params.courseId as string, 10);

    useMeta({ title: t(titleAux) });
    const routes = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'training.courseSchedule' },
      },
      {
        name: titleAux,
      },
    ];

    const course: Ref<any> = ref(null);
    const title: Ref<string> = ref('');

    const loading = ref(true);

    const comments: { value: any } = reactive({
      value: {},
    });

    const totalBudget = computed(() => {
      let total = 0;

      if (course.value?.planningWeeks) {
        const planningWeeks: any[] = course.value?.planningWeeks;

        planningWeeks.forEach((item) => (total += item.total));
      }

      return total;
    });

    onMounted(async () => {
      course.value = await getPlanningWeeksByCourseIdService.run(courseId);
      title.value = `Planeación "${course.value.name}"`;

      await updateComments();

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Capacitación', url: '' };
      headerStorage.moduleItem = { name: 'Cronograma de cursos', url: '' };
      headerStorage.moduleSubItem = { name: title.value, url: '' };

      loading.value = false;
    });

    const getData = async () => {
      course.value = await getPlanningWeeksByCourseIdService.run(courseId);
    };

    const create = async () => {
      await router.push({
        name: 'training.courseSchedulePlanningWeeksCreate',
        params: { courseId: courseId },
      });
    };

    const updateComments = async () => {
      await getData();

      const planningWeeks = course.value.planningWeeks;

      for (let i = 0; i < planningWeeks.length; i++) {
        const response = await getPlanningWeeksWithDetailsService.run(planningWeeks[i].id);
        comments.value[`planningWeek_${planningWeeks[i].id}`] = response.comments;
      }
    };

    return {
      loading,
      routes,
      title,
      t,
      n,

      totalBudget,
      comments,
      course,

      updateComments,
      create,

      dayjs,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
</style>
