<template>
  <TeacherEvaluationScaleForm :title="title" :routes="routes" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TeacherEvaluationScaleForm from '../components/assessmentModels/TeacherEvaluationScaleForm.vue';

export default defineComponent({
  name: 'CreateTeacherEvaluationScale',
  components: { TeacherEvaluationScaleForm },
  setup() {
    const title = 'Crear Escala de Evaluación Docente';
    const routes = [
      {
        name: 'Escala de Evaluación Docente',
        url: {
          name: 'resume.teacherEvaluationScale',
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
