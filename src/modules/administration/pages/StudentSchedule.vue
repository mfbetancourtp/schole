<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack @click="goBack" />
    </template>
    <template v-slot:content>
      <SelectionStudentsByParent @update-student-user-id="updateStudentUserId"></SelectionStudentsByParent>
      <AppLoading v-if="loading"></AppLoading>
      <div v-if="!loading && relatedData">
        <section class="mt-3 justify-content-end">
          <section class="d-flex justify-content-end align-items-center">
            <AppDatatableFilters v-show="true">
              <div class="mb-3 tw-flex-1">
                <label for="courseId">{{ t('Asignaturas') }}</label>
                <AppAutocomplete :options="relatedData.courses" :input-id="'courseId'" v-model="courseId"></AppAutocomplete>
              </div>
            </AppDatatableFilters>
          </section>
        </section>
        <AppEmptyResponse v-if="notFound" :size="'sm'" :subtitle="false"></AppEmptyResponse>
        <div v-else class="grid-cards mt-3">
          <div v-for="(item, index) in schedule" :key="index" class="card-day rounded shadow-sm p-4">
            <h3 class="day-title">{{ item.nameDay.toUpperCase() }}</h3>

            <div v-if="item.subjects.length">
              <div
                v-for="(subject, index) in insertRecesses(item.subjects)"
                :key="index"
                class="subject-card"
                :class="{ 'recess-card': subject.isRecess }"
                :style="{
                  borderRight: subject.isRecess ? '6px solid #71C63D' : `6px solid ${subject.color || '#007BFF'}`,
                }"
              >
                <!-- 🔹 Clase -->
                <!-- 🔹 Clase -->
                <template v-if="!subject.isRecess">
                  <div class="subject-content">
                    <div class="subject-info">
                      <div class="subject-header">
                        <p class="subject-name">
                          {{ subject.courseName.toUpperCase() }}
                        </p>
                      </div>
                      <div class="subject-body">
                        <div class="subject-body-avatar">
                          <img v-if="subject.avatar" :src="subject.avatar" class="avatar" alt="Docente" />
                          <div>
                            <p v-if="subject.teacher" class="teacher-name">
                              {{ subject.teacher }}
                            </p>
                            <p class="time-text">
                              {{ formatTime(subject.startTime) + ' - ' + formatTime(subject.endTime) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 🔹 Receso -->
                <template v-else>
                  <p class="subject-name text-center m-0">RECESO</p>
                  <p class="time-text text-center m-0">
                    {{ formatTime(subject.startTime) + ' - ' + formatTime(subject.endTime) }}
                  </p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';
import AppDatatableFilters from '../../../shared/components/Datatable/AppDatatableFilters.vue';

import { GetTimetablesUserService } from '../services/getTimetablesUser.service';
import { GetRelatedDataHomeStudentService } from '../services/getRelatedDataHomeStudent.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

const getRelatedDataHomeStudentService = new GetRelatedDataHomeStudentService();
const getTimetablesUserService = new GetTimetablesUserService();

dayjs.extend(isoWeek);

export default defineComponent({
  name: 'StudentSchedule',
  components: {
    SelectionStudentsByParent,
    AppDatatableFilters,
    AppEmptyResponse,
    AppAutocomplete,
    AppBaseList,
    AppLoading,
    AppButtonBack,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.studentSchedule.title');
    const subtitle = t('classroom.studentSchedule.subtitle');

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Salón de clases', url: '' };
    headerStorage.moduleItem = { name: 'Inicio Estudiante', url: '' };
    headerStorage.moduleSubItem = { name: title, url: '' };

    const routes = [{ name: title }];
    useMeta({ title: title });

    const relatedData: Ref<any> = ref(null);
    const schedule: Ref<any[]> = ref([]);
    const filter = ref(0);

    const notFound = ref(false);
    const loading = ref(false);

    const courseId = ref();
    const userId = ref();
    const router = useRouter();

    const params: any = computed(() => {
      const params: any = {};

      const date: any = calculateFilterDate();

      if (date.dateSince) {
        params.fecIni = date.dateSince;
      }

      if (date.dateUntil) {
        params.fecFin = date.dateUntil;
      }

      params.userId = userId.value;
      params.courseId = courseId.value;

      return params;
    });
    // función para volver atrás
    const goBack = () => {
      if (window.history.length > 1) {
        router.back();
      } else {
        // si no hay historial, redirige al inicio de estudiante
        router.push({ name: 'administration.homeStudent' });
      }
    };
    watch(courseId, async () => {
      await getTimetables();
    });
    watch(filter, async () => {
      await getTimetables();
    });
    const formatTime = (time: string) => dayjs(`2000-01-01 ${time}`).format('h:mm A');
    const insertRecesses = (subjects: any[]) => {
      if (!subjects || !subjects.length) return [];

      const sorted = [...subjects].sort((a, b) => dayjs(`2000-01-01 ${a.startTime}`).valueOf() - dayjs(`2000-01-01 ${b.startTime}`).valueOf());

      const withRecesses: any[] = [];

      for (let i = 0; i < sorted.length; i++) {
        withRecesses.push({ ...sorted[i], isRecess: false });

        if (i < sorted.length - 1) {
          const currentEnd = dayjs(`2000-01-01 ${sorted[i].endTime}`);
          const nextStart = dayjs(`2000-01-01 ${sorted[i + 1].startTime}`);

          // 🔹 Agregamos receso (>= 30 minutos)
          if (nextStart.diff(currentEnd, 'minute') >= 30) {
            withRecesses.push({
              isRecess: true,
              startTime: sorted[i].endTime,
              endTime: sorted[i + 1].startTime,
            });
          }
        }
      }

      return withRecesses;
    };

    const updateStudentUserId = async (studentUserId: any) => {
      loading.value = true;

      if (route.query.courseId) {
        // courseId.value = parseInt(route.query.courseId as string, 10);
        courseId.value = null;
      }
      if (studentUserId) {
        userId.value = studentUserId as number;
      }

      if (userId.value) {
        const params = { userId: userId.value as number };

        relatedData.value = await getRelatedDataHomeStudentService.run(params);
      } else {
        relatedData.value = await getRelatedDataHomeStudentService.run();
      }

      await getTimetables();

      loading.value = false;
    };

    const calculateFilterDate = () => {
      const filterC = filter.value;
      const currentDate = dayjs();

      let weekStart = currentDate.clone().startOf('isoWeek');
      let weekEnd = currentDate.clone().endOf('isoWeek').subtract(1, 'day');

      if (filterC === 0) {
        return {
          dateSince: weekStart.toISOString().split('T')[0],
          dateUntil: weekEnd.toISOString().split('T')[0],
        };
      } else if (filterC >= 1 && filterC <= 4) {
        weekStart = weekStart.subtract(filterC, 'week');
        weekEnd = weekEnd.subtract(filterC, 'week');
        weekEnd.subtract(1, 'day');

        return {
          dateSince: weekStart.toISOString().split('T')[0],
          dateUntil: weekEnd.toISOString().split('T')[0],
        };
      }

      return {
        dateSince: null,
        dateUntil: null,
      };
    };

    const getTimetables = async () => {
      try {
        notFound.value = false;

        const response = await getTimetablesUserService.run(params.value);
        schedule.value = response;

        if (!schedule.value.length) {
          notFound.value = true;
        }
      } catch (e) {
        console.log(e);
      }
    };

    const changeFilter = async () => {
      await getTimetables();
    };

    return {
      subtitle,
      routes,
      title,
      t,

      relatedData,
      courseId,
      notFound,
      schedule,
      loading,
      filter,

      updateStudentUserId,
      changeFilter,
      insertRecesses,
      formatTime,
      dayjs,
      goBack,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
}
.contentFilter .filter {
  background: #fff;
  margin-right: 1rem;
  padding: 0.3rem 1rem;
  border-radius: 28px;
  cursor: pointer;
}

.fs-8 {
  font-size: 0.8rem;
}
.fs-7 {
  font-size: 0.9rem;
}

.fw-bolder {
  font-weight: 600 !important;
}
.focus {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.focus:hover {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.card-day {
  background: #fff;
  border: 1px solid #e5e7eb;
}

.day-title {
  text-align: center;
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.3rem;
  letter-spacing: 2px;
}

.subject-card {
  border-right: 6px solid transparent;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
  transition: transform 0.2s;
}

.subject-card:hover {
  transform: translateY(-2px);
}

.subject-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.subject-body-avatar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.subject-name {
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.teacher-name {
  font-size: 0.9rem;
  color: #555;
  margin: 0.25rem 0;
}

.time-text {
  font-size: 0.85rem;
  color: #777;
  margin: 0;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.recess-card {
  border-right: 6px solid #71c63d;
  background: #f9fff9;
  text-align: center;
  font-weight: 600;
}
</style>
