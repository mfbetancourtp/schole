<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButtonBack :to="{ name: 'academicPrograms.subjectsStudyPlan' }" />
    </template>

    <template #content>
      <AppCard>
        <template #body>
          <AppLoading v-if="loading" />

          <template v-else>
            <section>
              <div class="mb-2 d-flex align-items-center gap-3">
                <span>Paso 1: Descargar Plantilla</span>

                <AppButton :href="urlTemplate" label="core.download" />
              </div>

              <div class="d-flex align-items-center gap-3">
                <span>Paso 2: Subir Plantilla</span>

                <div class="col-5">
                  <AppUploadFile @update:modelValue="uploadTemplate" />
                </div>
              </div>
            </section>

            <AppLoading v-if="loadingResult" />

            <section v-else-if="!loadingResult && showResult && responseObject" class="mt-3">
              
              <div v-if=" responseObject.created > 0 && responseObject.updated === 0 && responseObject.errors.length === 0" >
                  <p>Datos creados correctamente.</p>
              </div>

              <div v-if=" responseObject.created === 0 && responseObject.updated > 0 && responseObject.errors.length === 0" >
                  <p>Datos actualizados correctamente.</p>
              </div>

              <div v-if=" responseObject.errors && responseObject.errors.length > 0 && !responseObject.errors[0].row " >
                
                <table  class="table">
                <thead>
                  <tr>
                  
                    <th>Observaciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(data, index) in responseObject.errors" :key="index">
                  
                    <td >{{ data.observations }}</td>

                  </tr>
                </tbody>
              </table>
              </div>

              <table v-if=" responseObject.created === 0 && responseObject.updated === 0 && responseObject.errors[0].row && responseObject.errors[0].observations " class="table">
                <thead>
                  <tr>
                    <th>Código tipo de asignatura </th>
                    <th>Código grado</th>
                    <th>Código asignatura</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(data, index) in responseObject.errors" :key="index">
                  
                    <td>{{ data.row.codigo_de_tipo_de_asignatura ?? '---' }}</td>
                    <td>{{ data.row.codigo_del_grado ?? '---' }}</td>
                    <td>{{ data.row.codigo_de_la_asignatura ?? '---' }}</td>
                    <td style="white-space: pre-wrap;">{{ data.observations.join('\n') ?? '---' }}</td>

                  </tr>
                </tbody>
              </table>

              
          
         

           
            </section>
          </template>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { ImportCurriculumsService } from '../services/importCurriculums.service';
import { GetTemplateCurriculumsService } from '../services/getTemplateCurriculums.service';

const getTemplateCurriculumsService = new GetTemplateCurriculumsService();
const importCurriculumsService = new ImportCurriculumsService();

export default defineComponent({
  name: 'StudyPlanImportCurriculums',

  components: {
    AppButtonBack,
    AppUploadFile,
    AppBaseList,
    AppLoading,
    AppButton,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Importar plan de estudios';
    const route = useRoute();

    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'core.menu.subjectsStudyPlan',
        url: { name: 'academicPrograms.subjectsStudyPlan' },
      },
      {
        name: title,
      },
    ];

    const responseObject: Ref<any> = ref(null);
    const urlTemplate: Ref<string> = ref('');

    const loadingResult = ref(false);
    const showResult = ref(false);
    const loading = ref(true);
    const studyPlanId = Number(route.params.studyPlanId);

    onMounted(async () => {
      try {
        const response = await getTemplateCurriculumsService.run();

        urlTemplate.value = response.file;
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    });

    const uploadTemplate = async (file: any) => {
      loadingResult.value = true;
      showResult.value = true;

      const dataSend = { files: file };

      try {
        const res: any = await importCurriculumsService.run(studyPlanId, dataSend);
        responseObject.value = res.data;
        console.log('data', res.data.errors[0].row );
        
        
      } catch (e) {
        console.log('err', e);
      }

      loadingResult.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      responseObject,
      loadingResult,
      urlTemplate,
      showResult,

      uploadTemplate,
    };
  },
});
</script>

<style scoped></style>
