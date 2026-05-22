<template>
  <UserForm :title="title"></UserForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserForm from '../components/UserForm.vue';
import { useMeta } from 'vue-meta';

export default defineComponent({
  name: 'UserCreate',
  components: { UserForm },
  setup() {
    const title = 'Nuevo usuario';
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

    useMeta({
      title,
    });

    return {
      title,
      routes,
    };
  },
});
</script>
