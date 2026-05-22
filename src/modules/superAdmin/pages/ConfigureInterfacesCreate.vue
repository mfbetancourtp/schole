<template>
  <ConfigureInterfacesForm :title="title" :routes="routes"></ConfigureInterfacesForm>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

import ConfigureInterfacesForm from '../components/ConfigureInterfacesForm.vue';

export default defineComponent({
  name: 'ConfigureInterfacesFormCreate',
  components: {ConfigureInterfacesForm},
  setup() {
    const title = 'Nueva interfaz';
    const routes = [
      {
        name: 'Administrar interfaces',
        url: {
          name: 'superAdmin.configureInterfaces',
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

<style scoped>

</style>