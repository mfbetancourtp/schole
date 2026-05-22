<template>
  <ProgramsForm :title="title" :routes="routes"></ProgramsForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProgramsForm from '../../components/programs/ProgramsForm.vue';

export default defineComponent({
  name: 'ProgramsCreate',
  components: { ProgramsForm },
  setup() {
    const title = 'Crear Semestre';

    const routes = [
      {
        name: 'Programas',
        url: {
          name: 'academicPrograms.programCreate',
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
