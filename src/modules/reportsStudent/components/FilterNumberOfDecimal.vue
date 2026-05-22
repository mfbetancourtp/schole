<template>
  <AppFormField :form-control="v$.form.numberOfDecimals"
                label="reports.filters.numberOfDecimals">
    <input id="numberOfDecimal" type="number" class="form-control" v-model="v$.form.numberOfDecimals.$model">
  </AppFormField>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'FilterNumberOfDecimal',
  components: {AppFormField},
  props: {
    v$: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style scoped>

</style>
