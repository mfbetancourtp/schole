<template>
  <AppLoading v-if="loading"></AppLoading>

  <section v-else>
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

  <div v-if="responseObject" class="mt-3">
    <section v-if="keyService == 'academicOffer'">
      <h4>Resultados:</h4>

      <p class="ms-2">
        {{ t('core.generalTerms.academic.journey.plural') }} creadas:
        {{ responseObject?.resultValidateJourneyer.countJourneysCreated }}
      </p>
      <p class="ms-2">
        {{ t('core.generalTerms.academic.level.plural') }} creados:
        {{ responseObject?.resultValidateLevels.countLevelsCreated }}
      </p>
      <p class="ms-2">
        {{ t('core.generalTerms.academic.degree.plural') }} creados:
        {{ responseObject?.resultValidateDegrees.countDegreesCreated }}
      </p>
      <p class="ms-2">
        {{ t('core.generalTerms.academic.group.plural') }} creados:
        {{ responseObject?.resultValidateGroups.newRecordGroup }}
      </p>
      <p class="ms-2">
        Cursos creados:
        {{ responseObject?.resultValidateCourses.countCoursesCreated }}
      </p>

      <div v-if="responseObject?.resultValidateCourses.errors">
        <table class="table">
          <thead>
            <tr>
              <th>Código Jornada</th>
              <th>Código Grado</th>
              <th>Código Grupo</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in responseObject.resultValidateCourses.errors" :key="index">
              <td>{{ data.codeJourney }}</td>
              <td>{{ data.codeDegree }}</td>
              <td>{{ data.codeGroup }}</td>
              <td>
                <p v-for="(observation, index) in data.observations" :key="index">
                  {{ observation }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="keyService == 'teacher' || keyService == 'student'">
      <h4>Resultados:</h4>
      <p class="ms-2">Registros actualizados: {{ responseObject?.countUpdates }}</p>
      <p class="ms-2">Registros creados: {{ responseObject?.countCreated }}</p>

      <div v-if="responseObject?.errors">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('academicAdministration.people.identification') }}</th>
              <th>{{ t('academicAdministration.people.name') }}</th>
              <th>{{ t('academicAdministration.people.lastname') }}</th>
              <th>{{ t('academicAdministration.people.email') }}</th>
              <th>{{ t('academicAdministration.people.direction') }}</th>
              <th>{{ t('academicAdministration.people.mobile') }}</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in responseObject.errors" :key="index">
              <td>{{ data.identification }}</td>
              <td>{{ data.names }}</td>
              <td>{{ data.lastnames }}</td>
              <td>{{ data.email }}</td>
              <td>{{ data.direction }}</td>
              <td>{{ data.mobile }}</td>
              <td>
                <p v-for="(observation, index) in data.observations" :key="index">
                  {{ observation }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="keyService == 'subjectAssignments'">
      <h4>Resultados:</h4>

      <p class="ms-2">Registros actualizados: {{ responseObject?.countUpdate }}</p>
      <p class="ms-2">Registros creados: {{ responseObject?.countNew }}</p>

      <div v-if="responseObject?.errors">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('Curso') }}</th>
              <th>{{ t('Asignatura') }}</th>
              <th>{{ t('academicAdministration.people.identification') }}</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in responseObject.errors" :key="index">
              <td>{{ data.grade }}</td>
              <td>{{ data.subject }}</td>
              <td>{{ data.identification }}</td>
              <td>
                <p v-for="(observation, index) in data.observations" :key="index">
                  {{ observation }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section v-if="keyService == 'financingSystems'">
      <h5 v-if="responseObject.length" class="under__line">Resultados</h5>

      <div v-if="responseObject.resultValidateFinancingSources.length > 1" class="alert alert-success" role="alert">
        <AppIcon icon="check-circle" class="me-1" size="lg"></AppIcon>
        <strong>Plantilla subida exitosamente</strong>.
      </div>
    </section>
    <section v-if="keyService == 'suppliers'">
      <h5 v-if="responseObject.length" class="under__line">Resultados</h5>

      <div v-if="responseObject === true" class="alert alert-success" role="alert">
        <AppIcon icon="check-circle" class="me-1" size="lg"></AppIcon>
        <strong>Plantilla subida exitosamente</strong>.
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GenerateTeacherTemplateService } from '../services/generateTeacherTemplate.service';
import { GenerateStudentTemplateService } from '../services/generateStudentTemplate.service';
import { GenerateTemplateAcademicOfferService } from '../services/generateTemplateAcademicOffer.service';
import { GenerateTemplateSubjectAssignmentsService } from '../services/generateTemplateSubjectAssignments.service';
import { GetAcademicPeriodsClasroomWithPeriodsService } from '../services/getAcademicPeriodsClasroomWithPeriods.service';
import { GetExportFinancigSystemsService } from '../../budget/services/getExportFinancingSystems.service';

import { ImportSubjectAssignmentsService } from '../services/importSubjectAssignments.service';
import { ImportStudentsFromTemplateService } from '../services/importStudentsFromTemplate.service';
import { ImportTeachersFromTemplateService } from '../services/importTeachersFromTemplate.service';
import { ImportAcademicOfferFromTemplateService } from '../services/importAcademicOfferFromTemplate.service';
import { ImportClasroomFromTemplateService } from '../services/importClasroomFromTemplate.service';
import { ImportFinancingSystemsTemplateService } from '../../budget/services/importFinancingSystemsTemplate.service';
import { GetExportSuppliersService } from '../../budget/services/getExportSuppliers.service';
import { ImportSuppliersService } from '../../budget/services/importSuppliers.service';

export default defineComponent({
  name: 'DownloadAndUploadTemplate',
  components: {
    AppUploadFile,
    AppLoading,
    AppIcon,
  },

  props: {
    keyService: {
      type: String,
      required: true,
    },
    academicPeriodId: {
      type: Number,
      required: false,
      default: 0,
    },
  },

  setup(props) {
    const { t } = useI18n();

    const templateGenerationService = ref();
    const serviceImportTemplate = ref();
    const responseObject: any = ref();
    const loadingResult = ref(false);
    const loading = ref(true);
    const academicPeriodId = ref();
    const urlTemplate = ref();
    const route = useRoute();
    const standardizedAccountingSystemId = ref();
    onMounted(async () => {
      try {
        await loadService();
        standardizedAccountingSystemId.value = Number(localStorage.getItem('standardizedAccountingSystemId'));
        academicPeriodId.value = parseInt(route.params.academicPeriodId?.toString() || '0', 10);

        console.log(props.academicPeriodId);
        if (props.academicPeriodId) {
          academicPeriodId.value = props.academicPeriodId;
        }

        let res: any = {};
        let response: any = {};

        if (props.keyService == 'subjectAssignments') {
          res = await templateGenerationService.value.run({
            academicPeriodId: academicPeriodId.value,
          });
        } else if (props.keyService == 'subjectClasroom') {
          response = await templateGenerationService.value.run({
            academicPeriodId: academicPeriodId.value,
          });
        } else if (props.keyService == 'financingSystems') {
          response = await templateGenerationService.value.run({
            standardizedAccountingSystemId: standardizedAccountingSystemId.value,
          });
        } else if (props.keyService == 'suppliers') {
          response = await templateGenerationService.value.run();
        } else {
          response = await templateGenerationService.value.run();
          res = await templateGenerationService.value.run();
        }

        if (res?.file) {
          urlTemplate.value = res.file;
        } else if (response?.file) {
          urlTemplate.value = response.file;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const loadService = () => {
      if (props.keyService == 'subjectAssignments') {
        templateGenerationService.value = new GenerateTemplateSubjectAssignmentsService();
        serviceImportTemplate.value = new ImportSubjectAssignmentsService();
      } else if (props.keyService == 'academicOffer') {
        templateGenerationService.value = new GenerateTemplateAcademicOfferService();
        serviceImportTemplate.value = new ImportAcademicOfferFromTemplateService();
      } else if (props.keyService == 'teacher') {
        templateGenerationService.value = new GenerateTeacherTemplateService();
        serviceImportTemplate.value = new ImportTeachersFromTemplateService();
      } else if (props.keyService == 'student') {
        templateGenerationService.value = new GenerateStudentTemplateService();
        serviceImportTemplate.value = new ImportStudentsFromTemplateService();
      } else if (props.keyService == 'subjectClasroom') {
        templateGenerationService.value = new GetAcademicPeriodsClasroomWithPeriodsService();
        serviceImportTemplate.value = new ImportClasroomFromTemplateService();
      } else if (props.keyService == 'financingSystems') {
        templateGenerationService.value = new GetExportFinancigSystemsService();
        serviceImportTemplate.value = new ImportFinancingSystemsTemplateService();
      } else if (props.keyService === 'suppliers') {
        templateGenerationService.value = new GetExportSuppliersService();
        serviceImportTemplate.value = new ImportSuppliersService();
      }
    };

    const uploadTemplate = async (file: any) => {
      loadingResult.value = true;
      console.log('hola');

      let dataSend = { files: file };
      let params: any = {};

      if (props.keyService == 'academicOffer' || props.keyService == 'student') {
        params = { academicPeriodId: academicPeriodId.value };
      } else if (props.keyService == 'financingSystems') {
        params = {
          standardizedAccountingSystemId: standardizedAccountingSystemId.value,
        };
      }
      console.log('Datos enviados:', { dataSend, params });

      try {
        let res: any = await serviceImportTemplate.value.run(dataSend, params);
        responseObject.value = res;

        if (props.keyService == 'subjectAssignments' || props.keyService == 'subjectClasroom') {
          let errAux: any[] = [];

          responseObject.value.errors.forEach((err: any) => {
            let key = Object.keys(err)[0];

            err[key].forEach((detailErr: any) => {
              errAux.push(detailErr);
            });
          });

          responseObject.value.errors = errAux;
        }
      } catch (e) {
        console.log(e);
      }

      loadingResult.value = false;
    };

    return {
      responseObject,
      loadingResult,
      urlTemplate,
      loading,
      t,

      uploadTemplate,
    };
  },
});
</script>

<style scoped>
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
}
</style>
