<template>
  <ConvocationForm :title="title" :routes="routes"></ConvocationForm>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import ConvocationForm from '../components/ConvocationForm.vue';

export default defineComponent({
  name: 'ConvocationCreate',
  components: {ConvocationForm},
  setup() {
    const title = 'Nuevo proceso de matriculación';
    const routes = [
      {
        name: 'procesos de matriculación',
        url: {
          name: 'surveys.convocationsList',
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