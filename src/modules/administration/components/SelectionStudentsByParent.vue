<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppFormField v-if="!loading && students.length" :label="'Estudiante'">
    <AppAutocomplete
      :disabled="students.length === 1"
      v-model="currentStudentUserId"
      :options="students"
      :clearable="false"
      class="bg-white"
    ></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetTutorStudentsService } from '../services/getTutorStudents.service';
import { useInitDataStore } from '../../../stores/initData.store';

const getTutorStudentsService = new GetTutorStudentsService();

export default defineComponent({
  name: 'SelectionStudentsByParent',
  components: {
    AppAutocomplete,
    AppFormField,
    AppLoading,
  },

  emits: ['updateStudentUserId'],

  setup(props, { emit }) {
    const students: Ref<any[]> = ref([]);

    const currentStudentUserId = ref();

    const loading = ref(true);
    const initStore = useInitDataStore();

    onMounted(async () => {
      try {
            console.log('🔍 Todo el localStorage:', { ...localStorage });

        students.value = await getTutorStudentsService.run();

        students.value.forEach((student: any) => {
          student.name = student.people.names + ' ' + student.people.lastnames;
          student.id = student.people.userId;
          student.matriculateId = student.matriculateId; // ✅ agregar esto
        });


        if (students.value.length) {
          let updateStudentUserIdLS: null | number = null;

          if (localStorage.getItem('currentStudentUserId')) {
            updateStudentUserIdLS = JSON.parse(
              localStorage.getItem('currentStudentUserId') ?? '0'
            ) as number;
          }

          const student = updateStudentUserIdLS
            ? null
            : students.value[students.value.length - 1];
          currentStudentUserId.value = updateStudentUserIdLS ?? student.id;
        } else {
          const student = JSON.parse(localStorage.getItem('user') ?? '{}');
          emit('updateStudentUserId', student.people.userId);
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(currentStudentUserId, async (value) => {
      localStorage.setItem('currentStudentUserId', String(value));

      // ✅ buscar el estudiante seleccionado
      const selectedStudent = students.value.find(
        (student) => student.id === value
      );

      if (selectedStudent) {
        localStorage.setItem('matriculateId', String(selectedStudent.matriculateId));
        initStore.updateMatriculateId(selectedStudent.matriculateId);
          

      }

      emit('updateStudentUserId', value);
    });


    return {
      loading,

      currentStudentUserId,
      students,
    };
  },
});
</script>

<style scoped></style>
