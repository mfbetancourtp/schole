<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'surveys.previewInscritos' }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <section v-if="convocationwithEnrols" class="grid-cards mb-2">
        <AppCard>
          <template #body>
            <div class="d-flex gap-2 mb-2 align-items-center">
              <div>
                <AppIcon style="font-size: 1.2rem" class="text-primary" icon="users" />
              </div>

              <span style="font-weight: 500; font-size: 1.1rem">Estudiantes Nuevos</span>
            </div>

            <div>
              <p class="mb-0 fs-4">{{ convocationwithEnrols.numberNews }}</p>
              <span class="text-muted">Estudiantes</span>
            </div>
          </template>
        </AppCard>
        <AppCard>
          <template #body>
            <div class="d-flex gap-2 mb-2 align-items-center">
              <div>
                <AppIcon style="font-size: 1.2rem" class="text-primary" icon="users" />
              </div>

              <span style="font-weight: 500; font-size: 1.1rem">Estudiantes Antiguos</span>
            </div>

            <div>
              <p class="mb-0 fs-4">
                {{ convocationwithEnrols.numberPrevious }}
              </p>
              <span class="text-muted">Estudiantes</span>
            </div>
          </template>
        </AppCard>
        <AppCard>
          <template #body>
            <div class="d-flex gap-2 mb-2 align-items-center">
              <div>
                <AppIcon style="font-size: 1.2rem" class="text-primary" icon="users" />
              </div>

              <span style="font-weight: 500; font-size: 1.1rem">Pendientes Por Matrícula</span>
            </div>

            <div>
              <p class="mb-0 fs-4">
                {{ convocationwithEnrols.countEarringConvocation }}
              </p>
              <span class="text-muted">Estudiantes</span>
            </div>
          </template>
        </AppCard>
      </section>

      <section v-if="convocationwithEnrols" class="grid-cards-2 mb-2">
        <AppCard>
          <template #body>
            <div class="d-flex gap-2 mb-2 align-items-center">
              <div>
                <AppIcon style="font-size: 1.2rem" class="text-primary" icon="users" />
              </div>

              <span style="font-weight: 500; font-size: 1.1rem">Estudiantes Matrículados</span>
            </div>

            <div>
              <p class="mb-0 fs-4">
                {{ convocationwithEnrols.countMatriculatesConvocation }}
              </p>
              <span class="text-muted">Estudiantes</span>
            </div>
          </template>
        </AppCard>
        <AppCard>
          <template #body>
            <div class="d-flex gap-2 mb-2 align-items-center">
              <div>
                <AppIcon style="font-size: 1.2rem" class="text-primary" icon="users" />
              </div>

              <span style="font-weight: 500; font-size: 1.1rem">Total de inscritos</span>
            </div>

            <div>
              <p class="mb-0 fs-4">{{ convocationwithEnrols.enrols.length }}</p>
              <span class="text-muted">Estudiantes</span>
            </div>
          </template>
        </AppCard>
      </section>

      <AppCard v-if="convocationwithEnrols">
        <template #body>
          <div class="mb-2">
            <div class="content-buttons d-flex justify-content-end gap-2">
              <AppButton :label="!showFilters ? 'classroom.homeTeacher.showFilter' : 'Ocultar filtros'" icon-left="sliders-h" outlined @click="showFilters = !showFilters" />

              <template v-if="convocationwithEnrols">
                <ACSIEnrollStudentsBtn :academicPeriodId="convocationwithEnrols.academicPeriodId" :convocationId="convocationId" @update-data="loadData" />
              </template>
            </div>

            <div v-if="showFilters" class="filter-container">
              <div class="d-flex gap-3">
                <AppFormField label="Grado">
                  <AppAutocomplete class="bg-white" :input-id="'degreeId'" :options="degrees" v-model="degreeId" :clearable="false"></AppAutocomplete>
                </AppFormField>

                <AppFormField label="Paso">
                  <AppAutocomplete class="bg-white" :input-id="'stepId'" :options="steps" v-model="stepId" :clearable="false"> </AppAutocomplete>
                </AppFormField>
              </div>

              <div class="d-flex gap-3">
                <AppFormField label="Estado de matrícula">
                  <AppAutocomplete class="bg-white" :input-id="'enrollmentStatus'" :options="matriculationStatus" v-model="enrollmentStatus" :clearable="false" />
                </AppFormField>

                <AppFormField label="Estado por paso">
                  <AppAutocomplete class="bg-white" :input-id="'statusPerStep'" :options="stepStates" v-model="stepStatus" :clearable="false"></AppAutocomplete>
                </AppFormField>
              </div>

              <hr />
            </div>
          </div>

          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th rowspan="2" scope="col" class="col-2 pe-0" style="min-width: 10rem; max-width: 10rem">Identificación</th>
                  <th rowspan="2" scope="col" class="col-4" style="min-width: 20rem; max-width: 20rem">Nombre Aspirante</th>
                  <th rowspan="2" scope="col" class="text-center" style="min-width: 6rem; max-width: 6rem">Grado</th>
                  <th rowspan="2" scope="col" class="text-center">Estado</th>

                  <th scope="col" class="text-center" :colspan="stepId == 0 ? convocationwithEnrols.enrols[0].statusSteps.length : 1">Pasos</th>

                  <th rowspan="2" scope="col" class="text-center col ps-0 pe-0">
                    {{ t('core.actions') }}
                  </th>
                </tr>

                <tr>
                  <template v-for="index in convocationwithEnrols.enrols[0].statusSteps.length" :key="index">
                    <th class="text-center p-0 border" style="min-width: 3rem" v-if="stepId == 0 || stepId == index">
                      {{ index }}
                    </th>
                  </template>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!convocationwithEnrols.enrols.length">
                  <td colspan="4">
                    <AppEmptyResponse :subtitle="false"></AppEmptyResponse>
                  </td>
                </tr>

                <template v-else v-for="(enrol, index) in convocationwithEnrols.enrols" :key="index">
                  <template v-if="enrollmentStatus == 10 || enrollmentStatus == enrol.stateMatriculate">
                    <template v-if="filterStepStatus(enrol.statusSteps)">
                      <tr v-if="degreeId == 0 || degreeId == enrol.nameDegree">
                        <td class="pe-0">{{ enrol.identification }}</td>
                        <td class="">{{ enrol.nameEnrol }}</td>
                        <td class="text-center">
                          {{ enrol.nameDegree ?? '---' }}
                        </td>
                        <td class="text-center">
                          <template v-if="enrol.stateMatriculate === null">
                            <span class="badge rounded-pill text-bg-danger bg-danger">No Matriculado</span>
                          </template>

                          <template v-if="enrol.stateMatriculate === 0">
                            <span class="badge rounded-pill text-bg-dark bg-dark">Pre-matriculado</span>
                          </template>

                          <template v-if="enrol.stateMatriculate === 1">
                            <span
                              class="badge rounded-pill"
                              :style="{
                                backgroundColor: '#00b0da',
                                color: '#fff',
                              }"
                              >Matriculado</span
                            >
                          </template>
                        </td>

                        <template v-for="statusStepsIndex in convocationwithEnrols.enrols[0].statusSteps.length" :key="statusStepsIndex">
                          <td class="text-center p-0 align-middle border" v-if="stepId == 0 || stepId == statusStepsIndex">
                            <template v-if="enrol.statusSteps[statusStepsIndex - 1]">
                              <template v-if="enrol.statusSteps[statusStepsIndex - 1].status == 'approved'">
                                <AppIcon style="font-size: 1.2rem" class="text-success" v-tooltip="'Aprobado'" icon="check-circle"></AppIcon>
                              </template>

                              <template v-else-if="enrol.statusSteps[statusStepsIndex - 1].status == 'reproved'">
                                <AppIcon style="font-size: 1.2rem" class="text-danger" v-tooltip="'Detenido'" icon="times-circle"></AppIcon>
                              </template>

                              <template v-else-if="enrol.statusSteps[statusStepsIndex - 1].status == 'pending'">
                                <AppIcon v-tooltip="'Pendiente'" style="font-size: 1.2rem" icon="minus-circle"></AppIcon>
                              </template>

                              <template v-else-if="enrol.statusSteps[statusStepsIndex - 1].status == 'in review'">
                                <AppIcon v-tooltip="'En revisión'" style="font-size: 1.2rem" icon="eye"></AppIcon>
                              </template>

                              <template v-else-if="enrol.statusSteps[statusStepsIndex - 1].status == 'finalized'">
                                <AppIcon v-tooltip="'Finalizado'" style="font-size: 1.2rem" class="text-success" icon="check-double"></AppIcon>
                              </template>

                              <AppIcon v-else class="text-white" style="font-size: 1.2rem" icon="circle"></AppIcon>
                            </template>
                          </td>
                        </template>

                        <td class="text-center ps-0 pe-0">
                          <AppButtonGroup :size="'sm'">
                            <AppButtonDelete @click="openConfirmDelete(enrol)"></AppButtonDelete>

                            <AppButton v-tooltip="'Acceder como estudiante'" icon="user-secret" @click="enterAsRegistered(enrol)" outlined></AppButton>
                          </AppButtonGroup>
                        </td>
                      </tr>
                    </template>
                  </template>
                </template>
              </tbody>
            </table>
          </div>

          <ACSITotalsTable :convocationwithEnrols="convocationwithEnrols" :stepId="stepId" :degreeId="degreeId" />

          <div class="content-buttons mt-2 d-flex justify-content-end gap-2">
            <AppButton
              label="Asignación de grupos"
              :to="{
                name: 'surveys.enrollEnrollees',
                params: { convocationId: convocationId },
              }"
            ></AppButton>

            <AppButton @click="downloadExcel()" label="Exportar datos a excel" outlined></AppButton>
          </div>
        </template>
      </AppCard>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Inscrito" @confirmDelete="confirmDelete" @close="modalDelete = false"> </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import exportFromJSON from 'export-from-json';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppIcon from '../../../shared/components/AppIcon.vue';
import ACSITotalsTable from '../components/ACSITotalsTable.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import ACSIEnrollStudentsBtn from '../components/ACSIEnrollStudentsBtn.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { ConvocationwithEnrolsDto } from '../dtos/convocation.dto';
import { convocationEnrolDto } from '../dtos/convocationEnrol.dto';

import { DeleteConvocationsEnrollsService } from '../services/deleteConvocationsEnrolls.service';
import { GetConvocationSummaryRegisteredByIdService } from '../services/getConvocationSummaryRegisteredById.service';
import { useHeaderStore } from '../../../stores/header.store';

const getSummaryRegisteredService = new GetConvocationSummaryRegisteredByIdService();
const deleteConvocationsEnrollsService = new DeleteConvocationsEnrollsService();

export default defineComponent({
  name: 'AdminConvocationSummaryInscritos',
  components: {
    AppConfirmDeleteModal,
    ACSIEnrollStudentsBtn,
    AppEmptyResponse,
    AppButtonDelete,
    ACSITotalsTable,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    AppIcon,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const title = `Resumen detallado de inscritos`;

    const routes: any = [{ name: title }];
    useMeta({ title: 'Resumen detallado de Inscritos' });

    const matriculationStatus: Ref<any[]> = ref([
      { id: 10, name: 'Todos los estados' },
      { id: null, name: 'No Matriculado' },
      { id: 0, name: 'Pre-matriculado' },
      { id: 1, name: 'Matriculado' },
    ]);
    const stepStates: Ref<any[]> = ref([
      { id: '0', name: 'Todos los estados' },
      { id: 'approved', name: 'Aprobado' },
      { id: 'reproved', name: 'Detenido' },
      { id: 'pending', name: 'Pendiente' },
      { id: 'in review', name: 'En revisión' },
      { id: 'finalized', name: 'Finalizado' },
    ]);

    const convocationwithEnrols: Ref<ConvocationwithEnrolsDto | null> = ref(null);
    const degrees: Ref<any[]> = ref([{ id: 0, name: 'Todos los grados' }]);
    const steps: Ref<any[]> = ref([{ id: 0, name: 'Todos los pasos' }]);
    const currentEnrol: Ref<convocationEnrolDto | null> = ref(null);
    const totalsPerStep: Ref<any> = ref(null);

    const convocationId = ref<number>(parseInt(route.params.convocationId.toString(), 10));
    const enrollmentStatus = ref<any>(10);
    const stepStatus = ref<any>('0');
    const degreeId = ref<any>(0);
    const stepId = ref<any>(0);

    const loadingEnrols = ref(true);
    const showFilters = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Admisión y Registro', url: '' };
        headerStorage.moduleItem = {
          name: 'Configuración y procesos de admisión',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title, url: '' };

        loadingEnrols.value = true;

        convocationwithEnrols.value = await getSummaryRegisteredService.run(convocationId.value);

        await loadData();
        await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
      loadingEnrols.value = false;
    });

    const loadData = async () => {
      loadingEnrols.value = true;

      convocationwithEnrols.value = await getSummaryRegisteredService.run(convocationId.value);

      if (convocationwithEnrols.value.enrols.length && convocationwithEnrols.value.enrols[0].statusSteps.length) {
        const degreesAux: any[] = [];
        degrees.value = [{ id: 0, name: 'Todos los grados' }];
        steps.value = [{ id: 0, name: 'Todos los pasos' }];

        convocationwithEnrols.value.enrols[0].statusSteps.forEach((statusStep, index) => {
          steps.value.push({ id: index + 1, name: `Paso ${index + 1}` });
        });

        convocationwithEnrols.value.enrols.forEach((enrol) => {
          if (!degreesAux.includes(enrol.nameDegree)) degreesAux.push(enrol.nameDegree);
        });

        degreesAux.forEach((item) => {
          degrees.value.push({
            id: item,
            name: item === null ? 'Sin grado' : item,
          });
        });

        const indexNull = degrees.value.findIndex((item: any) => item.id === null);

        if (indexNull >= 0 && indexNull < degrees.value.length) {
          const element = degrees.value.splice(indexNull, 1)[0];
          degrees.value.push(element);
        }
      }

      loadingEnrols.value = false;
    };

    const enterAsRegistered = async (enrol: convocationEnrolDto) => {
      if (convocationwithEnrols.value) {
        localStorage.setItem('administratorAsStudent', '1');

        // Utiliza window.open() para abrir la ruta en una nueva pestaña
        window.open(
          router.resolve({
            name: 'surveys.userConvocations.registrationModern',
            params: {
              institutionId: convocationwithEnrols.value.institutionId,
              convocationId: convocationwithEnrols.value.id,
              convocationEnrollId: enrol.convocationEnrolId,
            },
          }).href,
          '_blank' // Especifica '_blank' como el nombre de destino para abrir en una nueva pestaña
        );
      }
    };

    const downloadExcel = async () => {
      const exportType = exportFromJSON.types.xls;
      const fileName = 'resumenDetalladoDeInscritos';
      let data: any[] = [];

      convocationwithEnrols.value?.enrols.forEach((enrol) => {
        const steps: any = {};

        enrol.statusSteps.forEach((statusStep, index) => {
          steps[`Paso ${index + 1}`] = statusStep.status == 'pending' ? 'Pendiente' : statusStep.status == 'reproved' ? 'Detenido' : statusStep.status == 'approved' ? 'Aprobado' : '';
        });

        data.push({
          Identificación: enrol.identification ?? '',
          'Nombre Aspirante': enrol.nameEnrol ?? '',
          Grado: enrol.nameDegree ?? '',
          ...steps,
        });
      });

      exportFromJSON({ data, fileName, exportType });
    };

    const loadRoutes = async () => {
      routes.unshift(
        {
          name: `Procesos de matriculación`,
          url: { name: 'surveys.convocationsList' },
        },
        {
          name: `Resumen inscritos "${convocationwithEnrols.value?.title}"`,
          url: {
            name: 'surveys.previewInscritos',
            params: { convocationId: convocationId.value },
          },
        }
      );
    };

    const filterStepStatus = (statusSteps: any[]): boolean => {
      if (stepStatus.value === '0') return true;

      if (stepId.value == 0) return statusSteps.map((item) => item.status).includes(stepStatus.value);
      else return statusSteps[stepId.value - 1].status === stepStatus.value;
    };

    const openConfirmDelete = async (enrol: convocationEnrolDto) => {
      currentEnrol.value = enrol;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentEnrol.value?.convocationEnrolId) {
        await deleteConvocationsEnrollsService.run(currentEnrol.value.convocationEnrolId);

        currentEnrol.value = null;
        await loadData();
      }

      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      convocationwithEnrols,
      matriculationStatus,
      enrollmentStatus,
      loadingEnrols,
      totalsPerStep,
      convocationId,
      currentEnrol,
      showFilters,
      modalDelete,
      stepStates,
      stepStatus,
      degreeId,
      degrees,
      stepId,
      steps,

      openConfirmDelete,
      enterAsRegistered,
      filterStepStatus,
      confirmDelete,
      loadRoutes,
      downloadExcel,
      loadData,
    };
  },
});
</script>

<style scoped>
.grid-cards :deep(.o-card),
.grid-cards-2 :deep(.o-card) {
  border-left: 0.2rem solid var(--color-primary);
}
.container-table {
  width: 100%;
  overflow-x: scroll;
}

.grid-cards {
  display: grid;
  gap: var(--gap-1);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
}
.grid-cards-2 {
  display: grid;
  gap: var(--gap-1);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
}

.custom-table {
  border-top: 1px solid #ddd;
  border-spacing: 0;
  width: 100%;
  max-height: 300px;
}

.custom-table thead tr {
  background: #eee;
  border-bottom: 1px solid #ddd;
}

.custom-table th,
.custom-table td {
  border-right: 1px solid #ddd;
  /* min-width: 150px; */
  padding: 0 0.5rem;
}

.custom-table th:last-child,
.custom-table td:last-child {
  border-right: 0;
}

.custom-table td {
  border: 1px solid #ddd;
  border-left: 0;
}

.custom-table .sticky {
  position: sticky;
  left: 0;
  top: 0;
}

.custom-table thead tr .sticky {
  background: #eee;
}

.custom-table tbody tr .sticky {
  background: #fff;
}

.custom-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.table-container {
  width: 100%;
  max-height: 25rem;
  overflow-x: scroll;
  margin: 0 auto;
  border-right: 1px solid #ddd;
  border-left: 1px solid #ddd;
}

/* @media screen and (min-width: 1000px) {
  .table-container {
    max-width: 700px;
  }
} */

/* @media screen and (min-width: 1200px) {
  .table-container {
    max-width: 850px;
  }
} */
/* 
@media screen and (min-width: 1300px) {
  .table-container {
    max-width: 1000px;
  }
}

@media screen and (min-width: 1500px) {
  .table-container {
    max-width: 1100px;
  }
}

@media screen and (min-width: 1700px) {
  .table-container {
    max-width: 1300px;
  }
}

@media screen and (min-width: 1800px) {
  .table-container {
    max-width: 1700px;
  }
}

@media screen and (min-width: 2000px) {
  .table-container {
    max-width: 1900px;
  }
} */

:deep(.w-15) {
  min-width: 15rem;
}

:deep(.z-3) {
  z-index: 3;
}

@media screen and (max-width: 720px) {
  .content-buttons {
    display: flex;
    flex-direction: column;
  }
}
</style>
