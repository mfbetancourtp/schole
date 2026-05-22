<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButtonBack :to="{ name: 'administration.courseSchedule' }"></AppButtonBack>

      <AppButton :disabled="!editInterface" class="text-white" label="core.save" @click="save"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <table class="table bg-white">
          <thead>
            <tr>
              <th class="col-4">
                {{ t('academicAdministration.notesByPeriod.table.student') }}
              </th>
              <th class="text-center col-1">
                {{ t('academicAdministration.notesByPeriod.table.note') }}
              </th>
              <th class="text-center col-1">
                {{ t('academicAdministration.notesByPeriod.table.lack') }}
              </th>
              <th>
                {{ t('academicAdministration.notesByPeriod.table.observation') }}
              </th>
            </tr>
          </thead>

          <tbody>
            <template v-if="!students.length">
              <tr>
                <td colspan="4">
                  <AppEmptyResponse :show-image="false" :subtitle="false"></AppEmptyResponse>
                </td>
              </tr>
            </template>

            <tr v-else v-for="(item, index) in students" :key="index">
              <td class="align-middle">{{ item.nameStudent }}</td>

              <td class="p-1 align-middle">
                <input :disabled="!editInterface" class="form-control text-center" type="number" v-model="item.matriculateSubjectPeriod.finalPeriod" />
              </td>
              <td class="p-1 align-middle">
                <input :disabled="!editInterface" class="form-control text-center" type="number" v-model="item.matriculateSubjectPeriod.lack" />
              </td>

              <td>

                <AppVoiceInput :disabled="!editInterface" v-model="item.matriculateSubjectPeriod.observation" textareaClass="form-control" />
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetMatriculateSubjectsWithPeriodNoteByCourseService } from '../services/getMatriculateSubjectsWithPeriodNoteByCourse.service';
import { CreateOrUpdateMatriculateSubjectsWithPeriodNoteService } from '../../academicAdministration/services/createOrUpdateMatriculateSubjectsWithPeriodNote.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateMatriculateSubjectsWithPeriodNoteService = new CreateOrUpdateMatriculateSubjectsWithPeriodNoteService();
const getMatriculateSubjectsService = new GetMatriculateSubjectsWithPeriodNoteByCourseService();
const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'CourseScheduleNotesByPeriod',
  components: {
    AppEmptyResponse,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppVoiceInput,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Calificaciones por Periodo';
    const courseId = parseInt(route.params.courseId.toString(), 10);

    useMeta({ title: t('Inscritos') });
    const routes = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'administration.courseSchedule' },
      },
      {
        name: title,
      },
    ];

    const students: Ref<any[]> = ref([]);
    const course: Ref<any> = ref(null);

    const editInterface = ref(true);
    const loading = ref(true);

    onMounted(async () => {
      try {
        course.value = await getCourseByIdService.run(courseId);

        const params: any = { courseId: courseId };
        if (course.value.periodId !== null) params.periodId = course.value.periodId;
        else editInterface.value = false;

        students.value = await getMatriculateSubjectsService.run(params);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      if (!editInterface.value) return;

      const grades: any[] = [];

      students.value.forEach((value, index) => {
        if (Object.keys(value.matriculateSubjectPeriod).length !== 0) {
          value.matriculateSubjectPeriod.matriculateSubjectId = students.value[index].id;
          grades.push(value.matriculateSubjectPeriod);
        }
      });

      const matriculateSubjectPeriods = {
        periodId: course.value.periodId,
        matriculateSubjectPeriods: grades,
      };

      try {
        await createOrUpdateMatriculateSubjectsWithPeriodNoteService.run(matriculateSubjectPeriods);
      } catch (e) {
        console.log(e);
      }
    };

    return {
      editInterface,
      loading,
      routes,
      title,
      save,
      t,

      students,
    };
  },
});
</script>

<style scoped></style>
