<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack
        :to="{
          name: 'academicAdministration.subjectsByCourse',
          params: {
            academicPeriodGroupId: academicPeriodGroupId,
          },
        }"
      ></AppButtonBack>

      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
        <AppButton style="color: white" @click="save()">Guardar</AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="d-flex flex-row-reverse">
          <!-- <div class="w-25">
            <label for="academicPeriod" class="text-capitalize">{{ t('academicPlanning.periods.name') }}</label>

            <v-select :reduce="(period) => period.id" @option:selected="getNotes()" v-model="currentPeriodId"
              :options="periods.value" input-id="group" class="bg-white shadow-sm" label="name"></v-select>
              
          </div> -->

          <div class="tw-w-full" style="width: 12rem">
            <!-- <label>{{ t('academicPlanning.periods.name') }}</label> -->
            <AppAutocomplete v-model="currentPeriodId" :options="periods.value" :label="'name'" :clearable="false" class="bg-white"> </AppAutocomplete>
          </div>
        </div>

        <div class="mt-3">
          <div class="card-body table-container">
            <table class="table responsive-table">
              <thead>
                <tr>
                  <th class="w-40">
                    {{ t('academicAdministration.notesByPeriod.table.student') }}
                  </th>
                  <th class="text-center">
                    {{ t('academicAdministration.notesByPeriod.table.note') }}
                  </th>
                  <th class="text-center">
                    {{ t('academicAdministration.notesByPeriod.table.lack') }}
                  </th>
                  <th class="w-40">
                    {{ t('academicAdministration.notesByPeriod.table.observation') }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in matriculateWithPeriodNote.value" :key="item.id">
                  <td :title="t('academicAdministration.notesByPeriod.table.student')">
                    <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                      <AppAvatar :size="'sm'" :name="item.matriculate.student.people.names ?? '?'"></AppAvatar>

                      <div class="tw-min-w-0 tw-ml-4">
                        <div class="tw-font-medium tw-leading-5 tw-truncate">
                          {{ item.matriculate.student.people.names }}
                        </div>
                        <div class="tw-leading-5 tw-truncate tw-font-light">
                          {{ item.matriculate.student.people.lastnames }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td :title="t('academicAdministration.notesByPeriod.table.note')">
                    <div class="tw-flex tw-items-center tw-py-2">
                      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
                        <input class="form-control text-center" type="number" v-model="item.matriculateSubjectPeriod.finalPeriod" />
                      </AppCheckPermission>
                    </div>
                  </td>
                  <td :title="t('academicAdministration.notesByPeriod.table.lack')">
                    <div class="tw-flex tw-items-center tw-py-2">
                      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
                        <input class="form-control text-center" type="number" v-model="item.matriculateSubjectPeriod.lack" />
                      </AppCheckPermission>
                    </div>
                  </td>
                  <td :title="t('academicAdministration.notesByPeriod.table.observation')">
                    <div class="tw-flex tw-items-center tw-py-2">
                      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">

                        <AppVoiceInput v-model="item.matriculateSubjectPeriod.observation" textareaClass="form-control" />

                      </AppCheckPermission>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="mt-2 d-flex flex-row-reverse">
              <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
                <AppButton @click="save()">Guardar</AppButton>
              </AppCheckPermission>
            </div>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { PeriodDto } from '../../../shared/dto/period.dto';

import { GetNotesByPeriodRelatedDataFormService } from '../services/getNotesByPeriodRelatedDataForm.service';
import { GetMatriculateSubjectsWithPeriodNoteService } from '../services/getMatriculateSubjectsWithPeriodNote.service';
import { CreateOrUpdateMatriculateSubjectsWithPeriodNoteService } from '../services/createOrUpdateMatriculateSubjectsWithPeriodNote.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateMatriculateSubjectsWithPeriodNoteService = new CreateOrUpdateMatriculateSubjectsWithPeriodNoteService();
const getMatriculateSubjectsWithPeriodNoteService = new GetMatriculateSubjectsWithPeriodNoteService();
const getNotesByPeriodRelatedDataFormService = new GetNotesByPeriodRelatedDataFormService();

export default defineComponent({
  name: 'MatriculateSubjectsByPeriod',
  components: {
    AppCheckPermission,
    AppButton,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppAvatar,
    AppAutocomplete,
    AppVoiceInput,
  },

  setup() {
    const title = 'Mis Calificaciones';
    useMeta({ title: title });
    const routes = [
      {
        name: 'Administración de Cursos',
        url: {
          name: 'academicAdministration.courseAdministration',
        },
      },
      {
        name: 'Asignaturas por Curso',
        url: {
          name: 'academicAdministration.subjectsByCourse',
        },
      },
      {
        name: title,
      },
    ];

    const academicPeriodGroupId = ref();
    const subjectAssignmentsId = ref();
    const currentPeriodId = ref();
    const currentSubject = ref();
    const currentGroup = ref();
    const loading = ref(true);
    const route = useRoute();
    const subtitle = ref();
    const { t } = useI18n();

    const matriculateWithPeriodNote: { value: any[] } = reactive({
      value: [],
    });
    const periods: { value: PeriodDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        academicPeriodGroupId.value = parseInt(route.params.academicPeriodGroupId.toString(), 10);
        subjectAssignmentsId.value = parseInt(route.params.subjectAssignmentId.toString(), 10);

        const params = { subjectAssignmentId: subjectAssignmentsId.value };
        let response = await getNotesByPeriodRelatedDataFormService.run(params);

        currentGroup.value = response.subjectAssignment.academicPeriodGroup.degree.name + ' ' + response.subjectAssignment.academicPeriodGroup.group.name;
        currentSubject.value = response.subjectAssignment.curriculumSubject.subject.name;
        periods.value = response.periods;

        currentPeriodId.value = periods.value[0].id;
        subtitle.value = `${currentSubject.value} del curso: ${currentGroup.value}`;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Administración académica', url: '' };
        headerStorage.moduleItem = {
          name: 'Administración de cursos',
          url: '',
        };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        await getNotes();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getNotes = async () => {
      let params = {
        subjectAssignmentId: subjectAssignmentsId.value,
        periodId: currentPeriodId.value,
      };

      matriculateWithPeriodNote.value = await getMatriculateSubjectsWithPeriodNoteService.run(params);
    };

    const save = async () => {
      const grades: any[] = [];

      matriculateWithPeriodNote.value.forEach((value, index) => {
        if (Object.keys(value.matriculateSubjectPeriod).length !== 0) {
          value.matriculateSubjectPeriod.matriculateSubjectId = matriculateWithPeriodNote.value[index].id;
          grades.push(value.matriculateSubjectPeriod);
        }
      });

      const matriculateSubjectPeriods = {
        periodId: currentPeriodId.value,
        matriculateSubjectPeriods: grades,
      };

      try {
        await createOrUpdateMatriculateSubjectsWithPeriodNoteService.run(matriculateSubjectPeriods);
        await getNotes();
      } catch (e) {
        console.log(e);
      }
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      t,

      matriculateWithPeriodNote,
      academicPeriodGroupId,
      currentPeriodId,
      periods,

      getNotes,
      save,
    };
  },
});
</script>

<style scoped>
table {
  all: unset;
  border-color: #e5e7eb;
}

.w-40 {
  width: 40%;
}
.table-container {
  max-height: 400px; /* Ajusta la altura según necesites */
  overflow-y: auto; /* Activa el scroll vertical si el contenido excede la altura */
  overflow-x: auto; /* Activa el scroll horizontal si la tabla es ancha */
  scrollbar-gutter: stable; /* Reserva espacio para la scrollbar */
}
.responsive-table {
  min-width: 100%;
  /* Si es necesario, puedes ajustar el table-layout:
     table-layout: fixed;
  */
}
</style>
