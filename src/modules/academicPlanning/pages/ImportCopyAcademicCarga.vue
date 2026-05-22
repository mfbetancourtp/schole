<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{
        name: 'academicPlanning.menuImportAcademicPeriod',
        params: { academicPeriodId: academicPeriodId },
      }"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <section class="d-flex justify-content-end align-items-end gap-2">
          <div class="col-6">
            <div class="row">
              <div class="col p-0">
                <label>Seleccione el ciclo académico origen</label>

                <AppAutocomplete v-model="academicPeriodIdOrigin" :options="academicPeriods.value" class="bg-white">
                </AppAutocomplete>
              </div>

              <div class="col-6">
                <label>{{ t('core.generalTerms.academic.level.singular') }}</label>

                <AppAutocomplete v-model="levelIdOrigin" :options="levels.value" class="bg-white"></AppAutocomplete>
              </div>
            </div>
          </div>

          <AppButton :disabled="!levelIdOrigin" @click="loadData()" variant="primary" label="Cargar"></AppButton>
        </section>

        <AppLoading v-if="loadTable"></AppLoading>

        <section v-else>
          <AppEmptyResponse v-if="!data.value.length" :show-image="true"></AppEmptyResponse>

          <div v-if="data.value.length" class="mt-3">
            <p>Se cargaran solo los docentes sin asignar</p>

            <table class="table">
              <thead>
                <tr>
                  <th>{{ t('classroom.homeTeacher.course') }}</th>
                  <th>{{ t('core.generalTerms.academic.subject.singular') }}</th>
                  <th>{{ t('academicPlanning.subjectAssignments.teacher') }}</th>
                  <th>Observación</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(dat, index) in data.value" :key="index">
                  <td>{{ dat.courseGroupName }}</td>
                  <td>{{ dat.subjectName }}</td>
                  <td>
                    <SelectSearchTeacher :data="dat" :keyVModel="'teacherPeopleId'" :keyName="'teacherName'">
                    </SelectSearchTeacher>
                  </td>
                  <td>{{ dat.observation }}</td>
                </tr>
              </tbody>
            </table>

            <div class="d-flex justify-content-between align-items-center">
              <p class="m-0">La asignación no sera almacenada en "{{ academicPeriodName }}" hasta dar clic en Guardar.</p>

              <AppButton variant="primary" label="core.save" @click="save()"></AppButton>
            </div>
          </div>
        </section>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import SelectSearchTeacher from '../components/SelectSearchTeacher.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CopyAcademicCargaService } from '../services/copyAcademicCarga.service';
import { GetAcademicPeriodsWithPeriodsService } from '../services/getAcademicPeriodsWithPeriods.service';
import { GetDataSubjectAssignmentsForImportService } from '../services/getDataSubjectAssignmentsForImport.service';
import { GetRelatedDataImportSubjectAssignmentsService } from '../services/getRelatedDataImportSubjectAssignments.service';
import { useHeaderStore } from '../../../stores/header.store';

const getRelatedDataImportSubjectAssignmentsService = new GetRelatedDataImportSubjectAssignmentsService();
const getDataSubjectAssignmentsForImportService = new GetDataSubjectAssignmentsForImportService();
const getAcademicPeriodsWithPeriodsService = new GetAcademicPeriodsWithPeriodsService();
const copyAcademicCargaService = new CopyAcademicCargaService();

export default defineComponent({
  name: 'ImportCopyAcademicCarga',
  components: {
    SelectSearchTeacher,
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Importar datos desde otro ciclo académico';
    const routes: any[] = [{ name: title }];
    useMeta({ title: 'Copiar carga académica' });

    const academicPeriodIdOrigin = ref();
    const academicPeriodName = ref();
    const academicPeriodId = ref();
    const loadTable = ref(false);
    const levelIdOrigin = ref();
    const loading = ref(true);
    const route = useRoute();

    const academicPeriods: { value: any[] } = reactive({
      value: [],
    });
    const levels: { value: any[] } = reactive({
      value: [],
    });
    const data: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        academicPeriodId.value = parseInt(route.params.academicPeriodId.toString(), 10);

        let res: any = await getRelatedDataImportSubjectAssignmentsService.run();
        academicPeriods.value = res.academicPeriods;
        levels.value = res.levels;
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Año Académico', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };

        await loadRoutes();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const save = async () => {
      let dataSend: any = { subjectAssignments: [] };

      data.value.forEach((dat: any) => {
        dataSend.subjectAssignments.push({
          id: dat.id,
          academicPeriodGroupId: dat.academicPeriodGroupId,
          curriculumSubjectId: dat.curriculumSubjectId,
          teacherPeopleId: dat.teacherPeopleId,
        });
      });

      try {
        await copyAcademicCargaService.run(dataSend);
      } catch (e) {
        console.log('error', e);
      }
    };

    const loadData = async () => {
      loadTable.value = true;

      try {
        const params = {
          academicPeriodDestinationId: academicPeriodId.value,
          academicPeriodSourceId: academicPeriodIdOrigin.value,
          levelId: levelIdOrigin.value,
        };

        data.value = await getDataSubjectAssignmentsForImportService.run(params);
      } catch (e) {
        console.log('error', e);
      }

      loadTable.value = false;
    };

    const loadRoutes = async () => {
      try {
        const academicPeriodsWithPeriods: any = await getAcademicPeriodsWithPeriodsService.run();
        let nameRoute: string = '';

        academicPeriodsWithPeriods.academicPeriods.forEach((academicPeriod: any) => {
          if (academicPeriodId.value == academicPeriod.id) {
            (academicPeriodName.value = academicPeriod.name), (nameRoute = `Importar información a "${academicPeriod.name}"`);
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
        console.log('error', e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      academicPeriodIdOrigin,
      academicPeriodName,
      academicPeriodId,
      academicPeriods,
      levelIdOrigin,
      levels,
      data,

      loadTable,
      loadData,
      save,
    };
  },
});
</script>

<style scoped>
.row {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
</style>
