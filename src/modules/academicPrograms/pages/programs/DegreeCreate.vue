<template>
  <DegreesForm :title="title" :routes="routes"></DegreesForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import DegreesForm from '../../components/programs/DegreesForm.vue';

export default defineComponent({
  name: 'DegreeCreate',
  components: { DegreesForm },
  setup() {
    const title = 'Crear Semestre';

    const routes = [
      {
        name: 'Programas',
        url: {
          name: 'academicPrograms.degreesCreate',
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
