<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <table class="table table-bordered table-striped">
        <tbody>
          <tr>
            <th class="w-25">Título</th>
            <td>{{ activity.name }}</td>
          </tr>
          <tr>
            <th>Inicia</th>
            <td>{{ activity.dateSince }}</td>
          </tr>
          <tr>
            <th>Termina</th>
            <td>{{ activity.dateUntil }}</td>
          </tr>
          <tr v-if="activity.description">
            <th>Descripción</th>
            <td>{{ activity.description }}</td>
          </tr>
          <tr v-if="activity.competency">
            <th>Competencias</th>
            <td>{{ activity.competency.description }}</td>
          </tr>
          <tr v-if="activity.learningOutcomes.length > 0">
            <th>Desempeño</th>
            <td>
              <li v-for="(item, index) in activity.learningOutcomes" :key="index">
                {{ item.description }}
              </li>
            </td>
          </tr>

          <!-- <tr v-if="activity.topics.length > 0">
            <th>Tema</th>
            <td>
              <ul class="mb-0 ps-3">
                <li v-for="(item, index) in activity.topics" :key="index">
                  {{ item.name }}
                </li>
              </ul>
            </td>
          </tr> -->
          <tr v-if="activity.categoryName">
            <th>Tipo de Actividad</th>
            <td>{{ activity.categoryName }}</td>
          </tr>
          <tr v-if="activity.delivery.feedback">
            <th>Observaciones del docente</th>
            <td>{{ activity.delivery.feedback }}</td>
          </tr>
          <tr v-if="activity.attachmentUrl">
            <th>Archivo adjunto</th>
            <td>
              <p @click="downloadFile(activity.attachmentUrl)" class="text-decoration-underline text-primary m-0 mt-2 pointer fs-7">Archivo adjunto</p>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import { mimeTypesConstant } from '../../../shared/constant/mimeTypes.constant';

export default defineComponent({
  name: 'ActivitySummary',
  components: { AppFormModal },

  props: ['activity'],

  setup() {
    const { t } = useI18n();
    let title = `Resumen de la actividad`;
    const downloadFile = (urlFile: string) => {
      fetch(urlFile)
        .then((response) => response.blob())
        .then((blob) => {
          const extension = mimeTypesConstant[blob.type];
          const time = new Date().getTime();

          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;

          link.setAttribute('download', `file_${time}.${extension}`);
          document.body.appendChild(link);

          link.click();
          document.body.removeChild(link);
        });
    };
    return {
      title,
      t,
      downloadFile,
    };
  },
});
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

th {
  text-align: left;
  background-color: #f5f5f5;
  font-weight: 600;
  padding: 8px;
}

td {
  padding: 8px;
  vertical-align: top;
}

ul {
  margin: 0;
  padding-left: 1rem;
}
</style>
