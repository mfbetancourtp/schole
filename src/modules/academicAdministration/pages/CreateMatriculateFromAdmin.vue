<template>
  <StudentForm :title="title" :from-admin="true"></StudentForm>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { defineComponent } from 'vue';
import StudentForm from '../components/StudentForm.vue';

export default defineComponent({
  name: 'CreateMatriculateFromAdmin',
  components: { StudentForm },

  setup() {
    const title = 'Matricular Estudiante';
    useMeta({ title });
    const routes = [
      {
        name: 'Administración de Cursos',
        url: {
          name: 'academicAdministration.courseAdministration',
        },
      },
      {
        name: 'Matriculados',
        url: {
          name: 'academicAdministration.enrolledByCourse',
        },
      },
      {
        name: title,
      },
    ];

    return {
      title,
      routes,
    };
  },
});
</script>

<style scoped></style>
