<template>
  <div v-for="section in data">
    <h4 class="fs-5 f-w-bold" style="color: var(--color-primary)">{{ section.title }} ({{
        section.predefinedFormId ? 'Predefinida' : 'Personalizada'
      }})</h4>

    <table class="table table-hover">
      <thead>
      <tr>
        <th>Campo</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="field in section.fields">
        <td>{{ field.label }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'StepCustomFormList',
  props: ['data'],
  setup() {
    return {};
  },
});
</script>

<style scoped>

</style>