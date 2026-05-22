<template>
  <table class="table table-hover">
    <thead>
    <tr>
      <th>Documento</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="document in data">
      <td>
        {{ document.title }}
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'StepDocumentsList',
  props: ['data'],
  setup() {
    return {};
  },
});
</script>

<style scoped>

</style>