<template>
  <AppLoading v-if="loading"></AppLoading>
  <ConvocationForm v-else :title="title" :routes="routes" :data="data"></ConvocationForm>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import ConvocationForm from '../components/ConvocationForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import {GetConvocationByIdService} from '../services/getConvocationById.service';
import {useRoute} from 'vue-router';

const getConvocationByIdService = new GetConvocationByIdService();

export default defineComponent({
  name: 'ConvocationEdit',
  components: {AppLoading, ConvocationForm},
  setup() {
    const title = 'Editar proceso de matriculación';
    const routes = [
      {
        name: 'Procesos de matriculación',
        url: {
          name: 'surveys.convocationsList',
        },
      },
      {
        name: title,
      },
    ];
    const loading = ref(true);
    const data = ref();

    const route = useRoute();

    onMounted(async () => {
      data.value = await getConvocationByIdService.run(parseInt(route.params.convocationId.toString()));
      loading.value = false;
    });

    return {
      title,
      routes,
      loading,
      data,
    };
  },
});
</script>

<style scoped>

</style>