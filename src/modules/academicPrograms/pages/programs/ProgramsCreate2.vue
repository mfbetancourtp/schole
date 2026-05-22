<template>
  <ProgramsForm2 :title="title" :routes="routes"></ProgramsForm2>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProgramsForm2 from '../../components/programs/ProgramForm2.vue';

export default defineComponent({
  name: 'ProgramsCreate2',
  components: { ProgramsForm2 },
  setup() {
    const title = 'Crear Semestre';

    const routes = [
      {
        name: 'Programas',
        url: {
          name: 'academicPrograms.programCreate2',
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
