<template>
  <AppBaseList>
    <template #content>
      <AppLoading v-if="loading" />

      <div v-if="!loading">
        <!-- 🔹 Filtros -->
        <section class="bg-white border rounded p-3 form-row">
          <AppFormField label="Año Académico">
            <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" />
          </AppFormField>

          <AppFormField label="Grupo">
            <AppAutocomplete v-model="academicPeriodGroupId" :options="academicPeriodGroups" :clearable="false" />
          </AppFormField>

          <AppFormField label="Asignatura">
            <AppAutocomplete v-model="courseId" :options="subjectsByCourseGroup" />
          </AppFormField>
        </section>

        <!-- 🔹 Mensajes vacíos -->
        <template v-if="!academicPeriodGroupId">
          <AppEmptyResponse subtitle="Por favor, selecciona un grupo para ver el horario." showImage />
        </template>

        <!-- 🔹 Horario -->
        <template v-else>
          <AppLoading v-if="loadingSchedule" />

          <template v-else>
            <template v-if="!schedule.length">
              <AppEmptyResponse :subtitle="false" showImage />
            </template>

            <!-- 🔹 Grilla de días -->
            <div v-else class="grid-cards mt-3">
              <div v-for="(item, index) in schedule" :key="index" class="card-day rounded shadow-sm p-4">
                <!-- Título del día -->
                <h3 class="day-title">{{ item.day.toUpperCase() }}</h3>

                <div v-if="item.schedulesCourses.length" class="mt-3">
                  <div
                    v-for="(subject, i) in insertRecesses(item.schedulesCourses)"
                    :key="i"
                    class="subject-card"
                    :class="{ 'recess-card': subject.isRecess }"
                    :style="{
                      borderRight: subject.isRecess ? '6px solid #71C63D' : `6px solid ${subject.color || '#007BFF'}`,
                    }"
                  >
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
          </template>
        </template>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayjs from 'dayjs';
dayjs.extend(isoWeek);

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { GetTimeTableByCourseGroupService } from '../services/getTimeTableByCourseGroup.service';
import { GetAcadPeriLevelAllCoursesService } from '../../../shared/services/classroom/getAcadLevelAllCour.service';
import { GetAttendanceFilterOptionsService } from '../../../shared/services/reports/getAttendanceFilterOptions.service';
import { GetAcademicPeriodGroupsFromAcademicPeriodIdService } from '../../../shared/services/reports/getAcademicPeriodGroupsFromAcademicPeriodId.service';

export default defineComponent({
  name: 'SchedulePage',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppFormField,
    AppBaseList,
    AppLoading,
  },
  setup() {
    const academicPeriodId = ref<number | null>(null);
    const academicPeriodGroupId = ref<number | null>(null);
    const courseId = ref<number | null>(null);
    const academicPeriods = ref<any[]>([]);
    const academicPeriodGroups = ref<any[]>([]);
    const subjectsByCourseGroup = ref<any[]>([]);
    const schedule = ref<any[]>([]);
    const loading = ref(false);
    const loadingSchedule = ref(false);

    const getTimeTableByCourseGroupService = new GetTimeTableByCourseGroupService();
    const getAcadPeriLevelAllCoursesService = new GetAcadPeriLevelAllCoursesService();
    const getAttendanceFilterOptionsService = new GetAttendanceFilterOptionsService();
    const getAcademicPeriodGroupsFromAcademicPeriodIdService = new GetAcademicPeriodGroupsFromAcademicPeriodIdService();

    const formatTime = (time: string) => dayjs(`2000-01-01 ${time}`).format('h:mm A');

    const insertRecesses = (courses: any[]) => {
      if (!courses || !courses.length) return [];

      const sorted = [...courses].sort((a, b) => dayjs(`2000-01-01 ${a.startTime}`).valueOf() - dayjs(`2000-01-01 ${b.startTime}`).valueOf());

      const withRecesses: any[] = [];

      for (let i = 0; i < sorted.length; i++) {
        withRecesses.push(sorted[i]);

        if (i < sorted.length - 1) {
          const currentEnd = dayjs(`2000-01-01 ${sorted[i].endTime}`);
          const nextStart = dayjs(`2000-01-01 ${sorted[i + 1].startTime}`);

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

    const getSchedule = async () => {
      if (!academicPeriodGroupId.value) return;
      loadingSchedule.value = true;

      const params: any = {};
      if (courseId.value) params.courseId = courseId.value;

      schedule.value = await getTimeTableByCourseGroupService.run(academicPeriodGroupId.value, params);

      loadingSchedule.value = false;
    };

    onMounted(async () => {
      loading.value = true;
      const response = await getAttendanceFilterOptionsService.run();
      academicPeriods.value = response.academicPeriods.filter((i) => i.active);
      academicPeriodId.value = academicPeriods.value[0]?.id || null;
      loading.value = false;
    });

    watch(academicPeriodId, async () => {
      if (!academicPeriodId.value) return;
      academicPeriodGroups.value = await getAcademicPeriodGroupsFromAcademicPeriodIdService.run(academicPeriodId.value);
      academicPeriodGroupId.value = academicPeriodGroups.value[0]?.id || null;
    });

    watch(academicPeriodGroupId, async () => {
      if (academicPeriodGroupId.value) {
        subjectsByCourseGroup.value = await getAcadPeriLevelAllCoursesService.run(academicPeriodGroupId.value);
        await getSchedule();
      }
    });

    return {
      academicPeriodId,
      academicPeriodGroupId,
      academicPeriods,
      academicPeriodGroups,
      subjectsByCourseGroup,
      courseId,
      schedule,
      loading,
      loadingSchedule,
      formatTime,
      insertRecesses,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
