<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <template v-for="(item, index) in Object.keys(data)" :key="index">
        <table class="table">
          <thead>
            <tr>
              <th colspan="3" class="text-center">Proceso: {{ data[item][0].process }}</th>
            </tr>
            <tr>
              <th>Resultado</th>
              <th class="col-1 text-center">Estado</th>
              <th class="col-6">Respuesta Moodle</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item2, index2) in data[item]" :key="index2">
              <td>{{ item2.result }}</td>
              <td class="text-center">
                <span v-if="item2.status == 'ERROR'" class="badge rounded-pill text-bg-primary bg-danger">{{ item2.status }}</span>

                <span v-if="item2.status == 'OK'" class="badge rounded-pill text-bg-primary bg-success">{{ item2.status }}</span>
              </td>
              <td>
                {{ item2.responseModdle?.message ? item2.responseModdle.message + `: ${item2.responseModdle.debuginfo}` : '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

export default defineComponent({
  name: 'SynchronizationReport',
  components: { AppFormModal },

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  setup() {
    const title = 'Informe de sincronización';

    return {
      title,
    };
  },
});
</script>

<style scoped></style>
