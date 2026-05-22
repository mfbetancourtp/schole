<template>
  <table class="table table-hover">
    <thead>
    <tr>
      <th>Código</th>
      <th>Nombre</th>
      <th>Valor</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="payment in data">
      <td>{{ payment.code }}</td>
      <td>{{ payment.title }}</td>
      <td>{{ n(payment.defaultUnitValue, 'currency') }}</td>
    </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useI18n} from 'vue-i18n';

export default defineComponent({
  name: 'StepPaymentList',
  props: ['data'],
  setup() {
    const {n} = useI18n();

    return {
      n,
    };
  },
});
</script>

<style scoped>

</style>