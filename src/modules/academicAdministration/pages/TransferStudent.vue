<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.enrolledByCourse' }"></AppButtonBack>

      <AppButton style="color: white;" label="core.save" @click="save()"></AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <h6>Grupo Actual: {{ courseName }}</h6>
        

        <h6>Trasladar A:</h6>
        <div class="form-row col-6">
          <AppFormField :form-control="v$.form.academicPeriodId" label="academicPlanning.academicPeriods.singular">
            <AppAutocomplete v-model="v$.form.academicPeriodId.$model" :options="academicPeriods.value"
              :input-id="'academicPeriodId'" class="bg-white"></AppAutocomplete>
          </AppFormField>

          <AppFormField :form-control="v$.form.changeAPGId"
            label="academicAdministration.courseAdministration.table.course">
            <AppAutocomplete v-bind:class="{ disabledSelect: loadingGroups }" v-model="v$.form.changeAPGId.$model"
              :input-id="'changeAPGId'" :options="groups.value" class="bg-white"></AppAutocomplete>
          </AppFormField>
        </div>

        <div>
          <div class="card-body">
            <h6>Asignaturas para traslado de notas</h6>

            <!-- <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="activityNotes" v-model="activityNotes" />
              <label class="form-check-label" for="activityNotes"> Crear notas por actividades </label>
            </div> -->

            <table class="table">
              <thead>
                <tr>
                  <th>Asignatura Actual</th>
                  <th>Asignatura Destino</th>
                  <th class="text-center col-2">Trasladar Notas</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!subjects.value.newSubjects.length">
                  <td colspan="3">
                    <AppEmptyResponse :subtitle="false"></AppEmptyResponse>
                  </td>
                </tr>
                <tr v-else v-for="(element, index) in subjects.value.newSubjects" :key="index">
                  <td>
                    <v-select :options="subjects.value.oldSubjects"
                      :reduce="(subject) => (currentSubject.value = subject)"
                      @option:selected="matriculateSubjectIdTransfer(element.curriculumSubjectId)"
                      label="nameSubject"></v-select>
                  </td>
                  <td>{{ element.nameSubject }}</td>
                  <td>
                    <div class="d-flex justify-content-center">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" input-id="index"
                          v-model="element.transferNotes" />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { PostTransferStudentService } from '../services/postTransferStudent.service';
import { GetSubjectsForTransferService } from '../services/getSubjectsForTransfer.service';
import { GetAcademicGroupsByAcademicPeriodIdService } from '../services/getAcademicGroupsByAcademicPeriodId.service';
import { GetEnrollmentAndAcademicCyclesByEnrollmentIdService } from '../services/getEnrollmentAndAcademicCyclesByEnrollmentId.service';
import { useHeaderStore } from '../../../stores/header.store';

const getEnrollmentAndAcademicCyclesByEnrollmentIdService = new GetEnrollmentAndAcademicCyclesByEnrollmentIdService();
const getAcademicGroupsByAcademicPeriodIdService = new GetAcademicGroupsByAcademicPeriodIdService();
const getSubjectsForTransferService = new GetSubjectsForTransferService();
const postTransferStudentService = new PostTransferStudentService();

export default defineComponent({
  name: 'TransferStudent',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();

    useMeta({ title: 'Trasladar Estudiante' });
    const routes = [
      {
        name: 'Administración de Cursos',
        url: { name: 'academicAdministration.courseAdministration' },
      },
      {
        name: 'Matriculados',
        url: { name: 'academicAdministration.enrolledByCourse' },
      },
      {
        name: 'Trasladar Estudiante',
      },
    ];

    const enrollmentId = ref();

    const activityNotes = ref(false);
    const loadingGroups = ref(true);
    const loading = ref(true);

    const courseName = ref();
    const title = ref();

    const academicPeriods: { value: any[] } = reactive({
      value: [],
    });
    const subjects: { value: any } = reactive({
      value: null,
    });
    const groups: { value: any[] } = reactive({
      value: [],
    });
    const groupId: { value: any } = reactive({
      value: null,
    });
    const currentSubject: { value: any } = reactive({
      value: null,
    });

    const form = reactive({
      academicPeriodId: null,
      changeAPGId: null as number | null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          changeAPGId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        form.changeAPGId = parseInt(route.params.academicPeriodGroupId.toString(), 10);
        enrollmentId.value = parseInt(route.params.enrollmentId.toString(), 10);

        let response: any = await getEnrollmentAndAcademicCyclesByEnrollmentIdService.run(enrollmentId.value);
        form.academicPeriodId = response.matriculate?.academicPeriodGroup?.academicPeriodId;
        courseName.value = response.matriculate?.academicPeriodGroup?.courseName;
        academicPeriods.value = response.academicPeriods;
        const student = response.matriculate?.student;

        title.value = `Trasladar Estudiante ${student.people?.names} ${student.people?.lastnames}`;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Administración académica', url: '' };
        headerStorage.moduleItem = {
          name: 'Administración de cursos',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title.value, url: '' };
        await getGroups();
        await getSubjects();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.academicPeriodId,
      async (value) => {
        if (value) await getGroups();
      }
    );
    watch(
      () => form.changeAPGId,
      async (value) => {
        if (value) await getSubjects();
      }
    );

    const getGroups = async () => {
      loadingGroups.value = true;

      let response: any[] = await getAcademicGroupsByAcademicPeriodIdService.run(form.academicPeriodId);
      groups.value = [];

      response.forEach((group) => {
        groups.value.push({
          ...group,
          name: `${group.degreeName} ${group.GroupName}`,
        });
      });

      loadingGroups.value = false;
    };

    const getSubjects = async () => {
      subjects.value = await getSubjectsForTransferService.run(enrollmentId.value, form.changeAPGId);
      subjects.value.oldSubjects.push({
        nameSubject: 'Ninguna',
        subjectId: 'null',
      });
    };

    const matriculateSubjectIdTransfer = (recordId: any) => {
      let subjectId = currentSubject.value.matriculateSubjectId;

      if (subjectId === 'null' || !subjectId) {
        subjectId = null;
      }

      subjects.value.newSubjects.forEach((subject: any) => {
        if (subject.curriculumSubjectId === recordId) {
          subject.matriculateSubjectIdTransfer = subjectId;
        }
      });

      currentSubject.value = null;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const data = {
        matriculateId: enrollmentId.value,
        academicPeriodGroupId: form.changeAPGId,
        activityNotes: activityNotes.value,
        subjects: subjects.value.newSubjects,
      };

      await postTransferStudentService.run(data);
    };

    return {
      loading,
      routes,
      title,
      v$,
      t,

      academicPeriods,
      currentSubject,
      loadingGroups,
      activityNotes,
      courseName,
      subjects,
      groupId,
      groups,

      matriculateSubjectIdTransfer,
      getSubjects,
      getGroups,
      save,
    };
  },
});
</script>

<style scoped>
.disabledSelect {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6 !important;
  border-color: #d1dbe5;
}
</style>
