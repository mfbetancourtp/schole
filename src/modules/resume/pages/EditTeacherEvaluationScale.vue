<template>
  <AppLoading v-if="loading" />

  <template v-else-if="data?.id">
    <TeacherEvaluationScaleForm :title="title" :routes="routes" :data="data" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useRoute } from 'vue-router';

import AppLoading from '../../../shared/components/AppLoading.vue';
import TeacherEvaluationScaleForm from '../components/assessmentModels/TeacherEvaluationScaleForm.vue';

import { TeacherEvaluationScaleDto } from '../dtos/teacherEvaluationScale.dto';
import { GetTeacherEvaluationScaleService } from '../services/getTeacherEvaluationScale.service';

const getTeacherEvaluationScaleService = new GetTeacherEvaluationScaleService();

export default defineComponent({
  name: 'EditTeacherEvaluationScale',
  components: {
    AppLoading,
    TeacherEvaluationScaleForm,
  },
  setup() {
    const title = 'Editar Escala de Evaluación Docente';
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

    const route = useRoute();
    const loading = ref(true);
    const data: Ref<TeacherEvaluationScaleDto | null> = ref(null);

    onMounted(async () => {
      try {
        const teacherEvaluationScaleId = Number(route.params.teacherEvaluationScaleId);

        if (teacherEvaluationScaleId) {
          data.value = await getTeacherEvaluationScaleService.run(teacherEvaluationScaleId);
        }
      } catch (error) {
        console.log('error', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      data,
      loading,
      title,
      routes,
    };
  },
});
</script>
