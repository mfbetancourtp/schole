<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack
        :to="{ name: 'institutionalEvents.institutionalTimeline' }"
      ></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppCard>
        <template #body>
          <h4>{{ data.title }}</h4>

          <hr />

          <div class="d-flex justify-content-between">
            <h6 class="mb-3">
              <!-- Responsable:
              <span style="font-weight: 400">
                {{ data.responsible.map((item: any) => item).join(', ') }}
              </span> -->
            </h6>

            <h6 class="mb-3">
              Fecha:
              <span style="font-weight: 400"
                >{{ data.startDate }} - {{ data.endDate }}</span
              >
            </h6>
          </div>

          <div
            class="shadow-sm bg-card bg-white"
            style="overflow: auto; max-height: 300px"
          >
            <table class="w-100 table table-striped table-bordered">
              <thead class="sticky-top">
                <tr>
                  <th class="text-center w-auto">#</th>
                  <th class="text-center w-100">Resonsables</th>
                </tr>
              </thead>
              <tbody>
                <AppPulseLoading v-if="loading" />
                <tr v-if="data.responsible.length === 0">
                  <td colspan="10">
                    <div class="text-center alert alert-warning" role="alert">
                      <AppIcon
                        icon="exclamation-triangle"
                        class="me-1"
                        size="lg"
                      ></AppIcon>
                      <strong>Aún no tienes Responsables del Evento.</strong>
                    </div>
                  </td>
                </tr>
                <tr v-for="(item, index) in data.responsible" :key="index">
                  <td class="text-center w-auto">
                    {{ index + 1 }}
                  </td>
                  <td class="text-center">
                    {{ item }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />

          <h6 class="mt-2 mb-1">Orden del día</h6>
          <p v-html="data.objective.replace(/\n/g, '<br>')"></p>

          <hr />
          <div class="d-flex align-items-center">
            <p class="mb-0 me-2">Tareas a visualizar:</p>
            <select v-model="filter" class="mb-0">
              <option value="all">Todas</option>
              <option value="mine">Mias</option>
            </select>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Inicia</th>
                <th>Duración</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in tasksToShow" :key="task.id">
                <td>{{ task.description }}</td>
                <td>{{ task.startDate }}</td>
                <td>{{ task.minutesDuration }}</td>
                <td>
                  {{ task.responsible.map((item: any) => item).join(', ') }}
                </td>
              </tr>
            </tbody>
          </table>
          <AppChat
            v-if="!loadingComments"
            :row-table="'InstitutionalActivities'"
            :comments-res="comments.value"
            :row-id="data.id"
            @newComment="getData"
          ></AppChat>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  Ref,
  ref,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppChat from '../../../shared/components/AppChat.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetSummaryInstitutionalActivityService } from '../services/getSummaryInstitutionalActivity.service';

const getSummaryInstitutionalActivityService =
  new GetSummaryInstitutionalActivityService();

export default defineComponent({
  name: 'InstitutionalTimelineInstitutionalActivitySummary',
  components: {
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppCard,
    AppChat,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Resumen de actividad institucional';
    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Cronograma institucional',
        url: { name: 'institutionalEvents.institutionalTimeline' },
      },
      {
        name: title,
      },
    ];

    const data: Ref<any> = ref(null);

    const loading = ref(true);
    const filter = ref('all');
    const loadingComments = ref(false);
    const comments: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        await getData();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const tasksToShow = computed(() => {
      if (filter.value === 'all') {
        return data.value?.allTasks || [];
      } else if (filter.value === 'mine') {
        return data.value?.myTasks || [];
      }
      return [];
    });
    const updateComments = async () => {
      loadingComments.value = true;

      comments.value = data.value.comments;

      loadingComments.value = false;

    };
    const getData = async () => {
      const institutionalActivityId = parseInt(
        route.params.institutionalActivityId.toString(),
        10
      );
      data.value = await getSummaryInstitutionalActivityService.run(
        institutionalActivityId
      );
    };
    watch(
      () => data.value?.comments,
      () => {
        updateComments();
      }
    );

    return {
      loading,
      routes,
      title,
      t,

      data,
      filter,
      tasksToShow,
      loadingComments,
      comments,
      updateComments,
      getData,
    };
  },
});
</script>

<style scoped></style>
