<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <template v-if="quota !== null && availableQuotas >= 0">
            <span v-if="availableQuotas <= 0">No hay cupos disponibles para inscribir estudiantes en el curso.</span>
            <span>{{ availableQuotas }}</span>
          </template>

          <AppFormField label="Seleccione el grupo">
            <AppAutocomplete v-model="academicPeriodGroupId" :options="academicPeriodGroups" :clearable="false"> </AppAutocomplete>
          </AppFormField>
          <AppFormField label="Seleccione el curso">
            <AppAutocomplete v-model="academicLevelId" :options="academicLevelGroups" :clearable="true"> </AppAutocomplete>
          </AppFormField>

          <AppFormField :form-control="v$.form.courseInscriptions">
            <h5 class="mb-0">Estudiantes</h5>
          </AppFormField>

          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="selectAllStudents" id="selectAllStudents" @change="toggleSelectAllStudents" />
            <label for="selectAllStudents" class="form-check-label">Todos</label>
          </div>

          <AppEmptyResponse v-if="!students.length" :show-image="true" :subtitle="false"></AppEmptyResponse>

          <template v-else>
            <template v-for="(student, index) in students" :key="index">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="selectedStudents"
                  :id="`${index}_student`"
                  :value="{
                    userId: student.people.userId,
                    matriculateId: (student.matriculate && student.matriculate.id) || student.matriculateId || null,
                  }"
                />

                <label :for="`${index}_student`" class="form-check-label">
                  {{ `${student.people.names ?? ''} ${student.people.lastnames ?? ''}` }}
                </label>
              </div>
            </template>
          </template>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>
<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { PostCourseInscFromArrayService } from '../services/postCourseInscFromArray.service';
import { GetAcadPeriGrouAllByAcadPeriService } from '../services/getAcadPeriGrouAllByAcadPeri.service';
import { GetStudentsByAcademicPeriodGroupIdService } from '../services/getStudentsByAcademicPeriodGroupId.service';
import { GetStudentsByCourseAndLevelService } from '../services/getStudentsByCourseAndLevel.service';
import { GetAcadPeriLevelAllCoursesService } from '../services/getAcadLevelAllCour.service';

const getStudentsByAcademicPeriodGroupIdService = new GetStudentsByAcademicPeriodGroupIdService();
const getAcadPeriGrouAllByAcadPeriService = new GetAcadPeriGrouAllByAcadPeriService();
const postCourseInscFromArrayService = new PostCourseInscFromArrayService();
const getStudentsByCourseAndLevelService = new GetStudentsByCourseAndLevelService();
const getAcadPeriLevelAllCoursesService = new GetAcadPeriLevelAllCoursesService();

export default defineComponent({
  name: 'CourseScheduleEnrolledForm',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
  },

  props: {
    courseId: {
      type: Number,
      required: true,
    },
    academicPeriodId: {
      type: Number,
      required: true,
    },
    subjectAssignmentId: {
      type: Number,
      required: true,
    },
    periodId: {
      type: Number,
    },
    quota: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const title = 'Agregar estudiantes';

    const academicPeriodGroups: Ref<any[]> = ref([]);
    const academicLevelGroups: Ref<any[]> = ref([]);
    const academicLevelId = ref();

    const availableQuotas: Ref<number> = ref(props.quota != null ? props.quota : 0);
    const selectedStudents: Ref<any[]> = ref([]);
    const students: Ref<any[]> = ref([]);

    const academicPeriodGroupId = ref();
    const loading = ref(true);
    const selectAllStudents = ref(false);

    const form = reactive({
      courseId: props.courseId,
      courseInscriptions: [] as any[],
    });
    const v$ = useVuelidate(
      {
        form: {
          courseId: { required },
          courseInscriptions: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        academicPeriodGroups.value = await getAcadPeriGrouAllByAcadPeriService.run(props.academicPeriodId);

        academicPeriodGroups.value.forEach((item) => {
          item.name = `${item.degreeName} - ${item.GroupName}`;
        });

        if (academicPeriodGroups.value.length) academicPeriodGroupId.value = academicPeriodGroups.value[0].id;
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    });

    watch(selectedStudents, (value) => {
      if (props.quota != null) {
        if (value.length && availableQuotas.value <= 0) {
          selectedStudents.value.pop();
        }

        // } else if (oldValue.length && oldValue.length >= value.length) {
        //   if (availableQuotas.value - selectedStudents.value.length >= 0) {
        //     availableQuotas.value = props.quota - selectedStudents.value.length;
        //   } else {
        //     availableQuotas.value = 0;
        //   }

        //   return;
        // } else
      }
    });
    watch([academicPeriodGroupId, academicLevelId], async () => {
      if (academicPeriodGroupId.value) {
        const params: any = { subjectAssignmentId: props.subjectAssignmentId };

        if (props.periodId) params.periodId = props.periodId;

        if (!academicLevelId.value) {
          students.value = await getStudentsByAcademicPeriodGroupIdService.run(academicPeriodGroupId.value, params);
          console.log('Estudiantes solo con un filtro', students.value);
          academicLevelGroups.value = await getAcadPeriLevelAllCoursesService.run(academicPeriodGroupId.value);
        } else {
          const selectedCourseId = academicLevelId.value;

          if (selectedCourseId) {
            let response = await getStudentsByCourseAndLevelService.run(selectedCourseId);
            students.value = response.courseInscriptions;
            console.log('Estudiantes con dos filtros', students.value);
          } else {
            console.error('No se ha seleccionado un curso.');
          }
        }
      }
    });
    watch(academicPeriodGroupId, () => {
      academicLevelId.value = null;
    });
    const save = async () => {
      form.courseInscriptions = selectedStudents.value;
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await postCourseInscFromArrayService.run(form);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    const toggleSelectAllStudents = () => {
      if (selectAllStudents.value) {
        selectedStudents.value = students.value.map((student) => ({
          userId: student.people.userId,
          matriculateId: (student.matriculate && student.matriculate.id) || student.matriculatesId || null,
        }));
      } else {
        selectedStudents.value = [];
      }
    };

    return {
      loading,
      title,
      save,
      v$,
      emit,
      academicPeriodGroupId,
      academicLevelId,
      academicPeriodGroups,
      academicLevelGroups,
      selectedStudents,
      availableQuotas,
      students,
      toggleSelectAllStudents,
      selectAllStudents,
    };
  },
});
</script>

<style scoped>
.form-check-input {
  position: relative;
  left: 10px;
}

.form-check-label {
  position: relative;
  left: 10px;
}
</style>
