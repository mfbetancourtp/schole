<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack 
        :to="{ name: 'reports.list' }"
      ></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppCard>
        <template #body>
          <FilterAcademicPeriodWithGroups 
            :academic-periods="filters.academicPeriods" :v$="v$"
          ></FilterAcademicPeriodWithGroups>

          <div class="d-flex justify-content-end">
            <AppButton
              @click="generate"
              label="Generar"
            ></AppButton>
          </div>

          <div v-if="!loadingGenerate && urlFile">
            <AppEmptyResponse
              v-if="!data.length"
            ></AppEmptyResponse>

            <div v-else>
              <table class="table">
                <thead>
                  <tr>
                
                    <th>Nombre</th>
                    <th>Nombre del Curso</th>
                    <th>Código Personal</th>
                    <th>Código Curso</th>
                    <th>Nota</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item, index in data" :key="index">
                    
                    <td>{{ item.Nombre }}</td>
                    <td>{{ item.Nombre_del_Curso }}</td>
                    <td>{{ item.Codigo_Personal }}</td>
                    <td>{{ item.Cod_Curso }}</td>
                    <td>{{ item.Nota }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="d-flex justify-content-end">
                <AppButton
                  @click="downloadFile"
                  label="Exportar XML"
                ></AppButton>
              </div>
            </div>
          </div>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppCard from "../../../shared/components/Card/AppCard.vue";
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';

import { GetFiltersDisciplinaryRecordService } from '../services/filters/getFiltersDisciplinaryRecord.service';
import { GenerateEducationMinisteriesService } from '../services/reports/generateEducationMinisteries.service';

const getFiltersDisciplinaryRecordService = new GetFiltersDisciplinaryRecordService();
const generateEducationMinisteriesService = new GenerateEducationMinisteriesService();

export default defineComponent({
  name: 'EducationMinistries',
  components: { AppFormField, AppLoading, AppButtonBack, AppBaseList, FilterAcademicPeriodWithGroups, AppCard, AppButton, AppEmptyResponse },
  setup() {
    const {t} = useI18n();
    const route = useRoute();
    const title = 'reports.educationMinistries';

    const routes = [
      {
        name: 'reports.name',
        url: { name: 'reports.list'},
      },
      {
        name: title,
      },
    ];
    useMeta({ title: t(title) });

    const filters = ref<any>({ academicPeriods: [] });

    const loadingGenerate = ref(false);
    const loading = ref(true);

    const data = ref<any[]>([]);
    const urlFile = ref('');
    
    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
    });
    const v$ = useVuelidate({
      form: {
        academicPeriodId: {required},
        academicPeriodGroupId: {required},
      },
    }, {form});

    onMounted(async () => {
      const response = await getFiltersDisciplinaryRecordService.run();
      filters.value.academicPeriods = response.academicPeriods;

      loading.value = false;
    });

    const generate = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      loadingGenerate.value = true;

      try {
        if (form.academicPeriodGroupId) {
          const response = await generateEducationMinisteriesService.run(form.academicPeriodGroupId);
          data.value = response.result;
          urlFile.value = response.urlFile;
        }
      } catch (e) {}

      loadingGenerate.value = false;
    };

    const downloadFile = () => {
      fetch(urlFile.value)
      .then(response => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;

        link.setAttribute('download', 'file.xml');
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
      })
    };

    return {
      filters,
      loading,
      routes,
      title,
      v$,
      t,

      loadingGenerate,
      downloadFile,
      urlFile,
      data,

      generate,
    };
  },
});
</script>

<style scoped>

</style>
