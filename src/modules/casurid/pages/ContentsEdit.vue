<template>
  <AppLoading v-if="loading"></AppLoading>
  <ContentsForm v-else :title="title" :routes="routes" :data="data.value"></ContentsForm>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';
import ContentsForm from '../components/ContentsForm.vue';
import {GetContentByIdService} from '../services/getContentById.service';
import {useRoute} from 'vue-router';
import AppLoading from '../../../shared/components/AppLoading.vue';

const getContentByIdService = new GetContentByIdService();

export default defineComponent({
  name: 'ContentsUpdate',
  components: {AppLoading, ContentsForm},
  setup() {
    const title = 'Editar contenido';

    const routes = [
      {
        name: 'Contenidos',
        url: {
          name: 'casurid.contentsList',
        },
      },
      {
        name: title,
      },
    ];

    const loading = ref(true);

    const data = reactive({
      value: {},
    });

    const route = useRoute();

    onMounted(async () => {
      try {
        data.value = await getContentByIdService.run(route.params.contentId as string);
      } catch (e) {

      }
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