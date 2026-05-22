<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack v-if="!isCourseExecution" :to="{ name: 'administration.homeTeacher.attendance' }"></AppButtonBack>
      <AppButtonBack v-else :to="{ name: 'training.executionOfCoursesAttendance' }"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="d-flex justify-content-end">
          <section class="row" style="width: 55%">
            <div class="d-flex gap-2 align-items-center">
              <AppFormField :form-control="v$.form.dateSince" :label="'classroom.activitiesTeacher.form.dateSince'">
                <input v-model="v$.form.dateSince.$model" class="form-control" type="date" />
              </AppFormField>

              <AppFormField :form-control="v$.form.dateUntil" :label="'classroom.activitiesTeacher.form.dateUntil'">
                <input v-model="v$.form.dateUntil.$model" class="form-control" type="date" />
              </AppFormField>

              <div>
                <AppButton @click="getAttedance()" label="Aplicar"></AppButton>
              </div>
            </div>
          </section>
        </div>

        <div class="bg-white mt-3">
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th colspan="3" class="border-start text-center">
                  {{ t('reports.filters.unattendances') }}
                </th>
                <th colspan="3" class="border-start text-center">
                  {{ t('reports.filters.delayArrival') }}
                </th>
              </tr>

              <tr>
                <th class="w-50">
                  {{ t('core.generalTerms.academic.student.singular') }}
                </th>
                <th class="text-center border-start">CE</th>
                <th class="text-center border-start">SE</th>
                <th class="text-center border-start">Total</th>
                <th class="text-center border-start">CE</th>
                <th class="text-center border-start">SE</th>
                <th class="text-center border-start">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(element, index) in consolidate.value" :key="index">
                <td v-for="(elemen, index) in element" :key="index" :class="index ? 'text-center border-start' : ''">
                  {{ elemen }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="ps-2 pb-2">
            <h6>CE : Con Excusa</h6>
            <h6>SE : Sin Excusa</h6>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetAttendanceSummaryService } from '../services/getAttendanceSummary.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAttendanceSummaryService = new GetAttendanceSummaryService();
const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'AttendanceSummary',
  components: {
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Resumen de Asistencia';
    const isCourseExecution = route.path.search('execution-of-courses') >= 0;

    useMeta({ title: title });
    const routes: any = [{ name: title }];

    const courseId = ref();
    const subtitle = ref();

    const loading = ref(true);

    const consolidate: { value: any[] } = reactive({
      value: [],
    });

    const form: any = reactive({
      dateSince: null,
      dateUntil: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          dateSince: { required },
          dateUntil: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };

        courseId.value = parseInt(route.params.courseId.toString(), 10);

        let course = await getCourseByIdService.run(courseId.value);
        subtitle.value = course.name;

        if (!isCourseExecution) {
          routes.unshift(
            {
              name: `${t('core.start')} (${t('core.generalTerms.academic.teacher.plural')})`,
              url: { name: 'administration.homeTeacher' },
            },
            {
              name: `${t('classroom.homeTeacher.attendance')}`,
              url: {
                name: 'administration.homeTeacher.attendance',
                params: { courseId: courseId.value },
              },
            }
          );
        } else {
          routes.unshift(
            {
              name: `Ejecución de cursos`,
              url: { name: 'training.executionOfCourses' },
            },
            {
              name: `${t('classroom.homeTeacher.attendance')}`,
              url: {
                name: 'training.executionOfCoursesAttendance',
                params: { courseId: courseId.value },
              },
            }
          );
        }

        form.dateSince = dayjs().startOf('month').format('YYYY-MM-DD');
        form.dateUntil = dayjs().endOf('month').format('YYYY-MM-DD');

        await getAttedance();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getAttedance = async () => {
      let dataSend = {
        start: dayjs(form.dateSince).format('YYYY-MM-DD'),
        end: dayjs(form.dateUntil).format('YYYY-MM-DD'),
      };

      let response = await getAttendanceSummaryService.run(courseId.value, dataSend);
      consolidate.value = response.consolidate;
    };

    return {
      isCourseExecution,
      subtitle,
      routes,
      title,
      v$,
      t,

      consolidate,
      courseId,
      loading,

      getAttedance,
    };
  },
});
</script>

<style scoped></style>
