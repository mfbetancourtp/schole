<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.courseAdministration' }"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <section>
          <div class="mb-2 d-flex align-items-center gap-3">
            <span>Paso 1: Descargar Plantilla</span>

            <a :href="urlTemplate" class="btn bg-primary text-white">Descargar</a>
          </div>

          <div class="d-flex align-items-center gap-3">
            <span>Paso 2: Subir Plantilla</span>

            <div class="col-5">
              <AppUploadFile v-if="!loadingResult" v-model="template"></AppUploadFile>
            </div>
          </div>
        </section>

        <AppLoading v-if="loadingResult"></AppLoading>

        <section v-if="!loadingResult && responseObject" class="mt-3">
          <h4>Resultados:</h4>

          <p class="ms-2 mb-0">Registros actualizados: {{ responseObject.numberRecordsUpdate }}</p>

          <div v-if="responseObject.errors.length">
            <hr />

            <table class="table">
              <thead>
                <tr>
                  <th colspan="3" class="text-center">Errores</th>
                </tr>
                <tr>
                  <th>Identificación</th>
                  <th>Nombre completo</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(data, index) in responseObject.errors" :key="index">
                  <td></td>
                  <td></td>
                  <td>{{ data.observation ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GenerateNotesTemplateService } from '../services/generateNotesTemplate.service';
import { ImportNotesFromTemplateService } from '../services/importNotesFromTemplate.service';
import { useHeaderStore } from '../../../stores/header.store';

const generateNotesTemplateService = new GenerateNotesTemplateService();
const importNotesFromTemplateService = new ImportNotesFromTemplateService();

export default defineComponent({
  name: 'ImportTemplateParents',
  components: {
    AppUploadFile,
    AppButtonBack,
    AppBaseList,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Importar notas';

    const routes: any[] = [{ name: title }];
    useMeta({ title: 'Importar notas' });

    const responseObject: Ref<any> = ref(null);
    const urlTemplate: Ref<string> = ref('');
    const template: Ref<any> = ref(null);

    const academicPeriodGroupId = ref();

    const loadingResult = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        academicPeriodGroupId.value = parseInt(route.params.academicPeriodGroupId.toString(), 10);

        const res = await generateNotesTemplateService.run(academicPeriodGroupId.value);
        urlTemplate.value = res.file;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Administración académica', url: '' };
        headerStorage.moduleItem = {
          name: 'Administración de cursos',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title, url: '' };

        await loadRoutes();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    watch(template, async (newValue) => {
      if (newValue) await uploadTemplate(newValue);
      template.value = null;
    });

    const uploadTemplate = async (file: any) => {
      responseObject.value = null;
      loadingResult.value = true;

      let dataSend = { files: file };

      try {
        let res: any = await importNotesFromTemplateService.run(dataSend);
        responseObject.value = res;
      } catch (e) {
        console.log('error', e);
      }

      loadingResult.value = false;
    };

    const loadRoutes = async () => {
      try {
        // const academicPeriodsWithPeriods: any = await getAcademicPeriodsWithPeriodsService.run();
        // let nameRoute: string = "";

        // academicPeriodsWithPeriods.academicPeriods.forEach((academicPeriod: any) => {
        //   if (academicPeriodId.value == academicPeriod.id) {
        //     nameRoute = `Importar información a "${academicPeriod.name}"`;
        //   }
        // });

        routes.unshift({
          name: `Ciclos académicos`,
          url: { name: 'academicAdministration.courseAdministration' },
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      responseObject,
      loadingResult,
      urlTemplate,
      template,

      uploadTemplate,
    };
  },
});
</script>

<style scoped></style>
