<template>
  <AppLoading v-if="loading"></AppLoading>

  <template v-else-if="data?.id">
    <ProgramsForm :title="title" :routes="routes" :data="data"></ProgramsForm>
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import ProgramsForm from '../../components/programs/ProgramsForm.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';

import { GetAllDataProgramsService } from '../../services/programs/getAllDataPrograms.service';

const getAllDataProgramsService = new GetAllDataProgramsService();

export default defineComponent({
  name: 'ProgramsEdit',
  components: { AppLoading, ProgramsForm },

  setup() {
    const title = 'Editar Semestre';
    const routes = [
      {
        name: 'Programas',
        url: {
          name: 'academicPrograms.programEdit',
        },
      },
      {
        name: title,
      },
    ];

    const data = ref<any>();
    const loading = ref(true);
    const route = useRoute();
    const programsId = ref();

    onMounted(async () => {
      try {
        programsId.value = parseInt(route.params.programsId.toString());
        data.value = await getAllDataProgramsService.run(programsId.value);
        console.log('ProgramsID: ', programsId.value);
      } catch (e) {}

      loading.value = false;
    });

    return {
      data,
      title,
      routes,
      loading,
    };
  },
});
</script>

<style scoped></style>
