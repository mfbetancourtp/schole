<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'academicPlanning.menuImportAcademicPeriod' }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div>
          <section>
            <div class="mb-2 d-flex align-items-center gap-3">
              <span>Paso 1: Descargar Plantilla</span>

              <a :href="urlTemplate" class="btn bg-primary text-white">Descargar</a>
            </div>

            <div class="d-flex align-items-center gap-3">
              <span>Paso 2: Subir Plantilla</span>
              <div class="col-5">
                <AppUploadFile @update:modelValue="uploadTemplate"></AppUploadFile>
              </div>
            </div>
          </section>

          <AppLoading v-if="loadingResult"></AppLoading>

          <section v-if="!loadingResult && responseObject" class="mt-3">
            <h4>Resultados:</h4>

            <p class="ms-2 mb-0">Registros actualizados: {{ responseObject.numberRecordsUpdate }}</p>
            <p class="ms-2">Registros creados: {{ responseObject.numberRecordsCreated }}</p>

            <div v-if="responseObject.errors.length">
              <hr />

              <table class="table">
                <thead>
                  <tr>
                    <th colspan="7" class="text-center">Errores</th>
                  </tr>
                  <tr>
                    <th>Identificación</th>
                    <th>Nombres*</th>
                    <th>Apellidos*</th>
                    <th>Email*</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(data, index) in responseObject.errors" :key="index">
                    <td>{{ data.identificationParent ?? '' }}</td>
                    <td>
                      {{ data.firstNameParent ?? '' }}
                      {{ data.secondNameParent ?? '' }}
                    </td>
                    <td>
                      {{ data.firstLastnameParent ?? '' }}
                      {{ data.secondLastnameParent ?? '' }}
                    </td>
                    <td>{{ data.emailParent ?? '' }}</td>
                    <td>{{ data.directionParent ?? '' }}</td>
                    <td>{{ data.mobileParent ?? '' }}</td>
                    <td>{{ data.observation ?? '' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { ImportParentsFromTemplateService } from '../services/importParentsFromTemplate.service';
import { GetAcademicPeriodsWithPeriodsService } from '../services/getAcademicPeriodsWithPeriods.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsWithPeriodsService = new GetAcademicPeriodsWithPeriodsService();
const importParentsFromTemplateService = new ImportParentsFromTemplateService();

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
    const title = 'Importar datos desde una plantilla de acudientes';
    const urlTemplate = 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/test/templates/plantilla_acudientes.xlsx';

    const routes: any[] = [{ name: title }];
    useMeta({ title: 'Importar acudientes' });

    const responseObject: any = ref(null);
    const academicPeriodId = ref();

    const loadingResult = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        academicPeriodId.value = parseInt(route.params.academicPeriodId.toString(), 10);
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Año Académico', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };
        await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const uploadTemplate = async (file: any) => {
      responseObject.value = null;
      loadingResult.value = true;

      let dataSend = { files: file };

      try {
        let res: any = await importParentsFromTemplateService.run(dataSend, academicPeriodId.value);
        responseObject.value = res;
      } catch (e) {
        console.log(e);
      }

      loadingResult.value = false;
    };

    const loadRoutes = async () => {
      try {
        const academicPeriodsWithPeriods: any = await getAcademicPeriodsWithPeriodsService.run();
        let nameRoute: string = '';

        academicPeriodsWithPeriods.academicPeriods.forEach((academicPeriod: any) => {
          if (academicPeriodId.value == academicPeriod.id) {
            nameRoute = `Importar información a "${academicPeriod.name}"`;
          }
        });

        routes.unshift(
          {
            name: `Ciclos académicos`,
            url: { name: 'academicPlanning.academicPeriods' },
          },
          {
            name: nameRoute,
            url: {
              name: 'academicPlanning.menuImportAcademicPeriod',
              params: { academicPeriodId: academicPeriodId.value },
            },
          }
        );
      } catch (e) {
        console.log(e);
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

      uploadTemplate,
    };
  },
});
</script>

<style scoped></style>
