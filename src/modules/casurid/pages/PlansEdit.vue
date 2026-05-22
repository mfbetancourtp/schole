<template>
  <AppLoading v-if="loading"></AppLoading>
  <PlansForm v-else :title="title" :routes="routes" :data="data.value"></PlansForm>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import PlansForm from '../components/PlansForm.vue';

import {GetPlanByIdService} from '../services/getPlanById.service';
import {useRoute} from 'vue-router';

const getPlanByIdService = new GetPlanByIdService();

export default defineComponent({
  name: 'PlansEdit',
  components: {PlansForm, AppLoading},
  setup() {
    const loading = ref(true);
    const title = 'Editar libro';
    const route = useRoute();
    const routes = [
      {
        name: 'Libros',
        url: {
          name: 'casurid.plansList',
        },
      },
      {
        name: title,
      },
    ];
    const data = reactive({
      value: {},
    });

    onMounted(async () => {
      try {
        data.value = await getPlanByIdService.run(parseInt(route.params.planId.toString()));
      } catch (e) {

      }
      loading.value = false;
    });

    return {
      loading,
      title,
      routes,
      data,
    };
  },
});
</script>

<style scoped>

</style>