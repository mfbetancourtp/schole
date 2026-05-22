<template>
  <AppLoading v-if="loading"></AppLoading>
  <UserForm v-else :title="title" :routes="routes" :data="data.value"></UserForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';

import UserForm from '../components/UserForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { GetUserToEditByIdService } from '../services/getUserToEditById.service';
import { useRoute } from 'vue-router';

const getUserToEditByIdService = new GetUserToEditByIdService();

export default defineComponent({
  name: 'UserEdit',
  components: { AppLoading, UserForm },
  setup() {
    const title = 'Editar usuario';
    const routes = [
      {
        name: 'Usuarios',
        url: {
          name: 'access.usersList',
        },
      },
      {
        name: title,
      },
    ];
    const loading = ref(true);
    const route = useRoute();
    const data: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      data.value = await getUserToEditByIdService.run(parseInt(route.params.userId.toString()));
      loading.value = false;
    });

    useMeta({
      title,
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

<style scoped></style>
