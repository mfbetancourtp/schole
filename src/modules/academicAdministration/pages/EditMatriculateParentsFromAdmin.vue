<template>
  <AppLoading v-if="loading"></AppLoading>

  <MatriculateParentsFormFromAdmin v-else :data="data" :title="title" :routes="routes"></MatriculateParentsFormFromAdmin>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import MatriculateParentsFormFromAdmin from '../components/MatriculateParentsFormFromAdmin.vue';

import { GetMatriculatesParentsByIdService } from '../services/getMatriculatesParentsById.service';

const getMatriculatesParentsByIdService = new GetMatriculatesParentsByIdService();

export default defineComponent({
  name: 'EditMatriculateParentsFromAdmin',
  components: { AppLoading, MatriculateParentsFormFromAdmin },

  setup() {
    const title = 'Editar Acudiente';
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

    const loading = ref(true);
    const route = useRoute();
    const data = ref();

    onMounted(async () => {
      loading.value = true;

      const currentMatriculateId = route.params.matriculateParentId;
      data.value = await getMatriculatesParentsByIdService.run(currentMatriculateId);
      console.log('auieeasd', data.value);

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,
      data,
    };
  },
});
</script>

<style scoped></style>
