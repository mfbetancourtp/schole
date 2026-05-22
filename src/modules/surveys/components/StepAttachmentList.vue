<template>
  <table class="table table-hover">
    <thead>
    <tr>
      <th>Adjunto</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="attachment in data">
      <td>
        {{ attachment.title }}
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'StepAttachmentList',
  props: ['data'],
  setup() {
    return {};
  },
});
</script>

<style scoped>

</style>