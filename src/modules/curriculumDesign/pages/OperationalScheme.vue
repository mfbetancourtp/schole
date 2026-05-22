<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack
        :to="{
          name: 'curriculumDesign.levelTypeVersions',
          params: { programTypeId: programTypeIdParams },
        }"
      />
    </template>

    <template #content>
      <AppPulseLoading v-if="loading" />

      <div class="containerContent" v-else>
        <div class="title">{{ operationalScheme.name }}</div>

        <div style="padding: 20px">
          <div class="header-info">
            <div class="d-flex justify-content-around">
              <table>
                <tr>
                  <th>Semanas de clase</th>
                  <td
                    :class="{
                      'finish-error': finishError && !v$.form.classWeeks.$model,
                    }"
                  >
                    <input type="number" :min="0" v-model="v$.form.classWeeks.$model" @blur="saveGeneralInfo" />
                  </td>

                  <th>Semanas de evaluación</th>
                  <td
                    :class="{
                      'finish-error': finishError && !v$.form.evaluationWeeks.$model,
                    }"
                  >
                    <input type="number" :min="0" v-model="v$.form.evaluationWeeks.$model" @blur="saveGeneralInfo" />
                  </td>
                </tr>

                <tr>
                  <th>Número de periodos</th>
                  <td
                    :class="{
                      'finish-error': finishError && !v$.form.numberSemesters.$model,
                    }"
                  >
                    <input type="number" :min="0" v-model="v$.form.numberSemesters.$model" @blur="saveGeneralInfo" />
                  </td>

                  <th>Horas por periodo</th>
                  <td
                    :class="{
                      'finish-error': finishError && !v$.form.semesterHours.$model,
                    }"
                  >
                    <input type="number" :min="0" v-model="v$.form.semesterHours.$model" @blur="saveGeneralInfo" />
                  </td>
                </tr>

                <tr>
                  <th>Número de creditos programa</th>
                  <td
                    :class="{
                      'finish-error': finishError && !v$.form.credits.$model,
                    }"
                  >
                    <input type="number" :min="0" v-model="v$.form.credits.$model" @blur="saveGeneralInfo" />
                  </td>

                  <th>Carga máxima de créditos por periodo</th>
                  <td>
                    <input type="number" :min="0" v-model="v$.form.maximumCredits.$model" @blur="saveGeneralInfo" />
                  </td>
                </tr>

                <tr>
                  <th>Tipo de periodo</th>
                  <td colspan="3" style="padding: 8px; min-width: 220px">
                    <AppAutocomplete
                      input-id="periodTypeId"
                      v-model="v$.form.periodTypeId.$model"
                      :options="periodTypeData"
                      label="name"
                      :multiple="false"
                      :reduce="(option: any) => option.id"
                      @update:modelValue="saveGeneralInfo"
                    />
                  </td>
                </tr>
              </table>

              <table>
                <tr>
                  <th colspan="2">Formación en centro</th>
                </tr>
                <tr>
                  <th>Semanas</th>
                  <td>
                    <input type="number" :min="0" v-model="v$.form.weeks.$model" @blur="saveGeneralInfo" />
                  </td>
                </tr>
                <tr>
                  <th>Seminario</th>
                  <td>
                    <input type="number" :min="0" v-model="v$.form.seminar.$model" @blur="saveGeneralInfo" />
                  </td>
                </tr>
                <tr>
                  <th>Horas Prácticas</th>
                  <td>
                    <input type="number" :min="0" v-model="v$.form.practicalHours.$model" @blur="saveGeneralInfo" />
                  </td>
                </tr>
              </table>
            </div>
            <div class="steps-table-wrapper">
              <table class="steps-table">
                <tr>
                  <th>Texto paso 1</th>
                  <th>Texto paso 2</th>
                  <th>Texto paso 3</th>
                  <!-- <th>Mostrar tipos</th> -->
                </tr>
                <tr>
                  <td>
                    <input type="text" class="step-input" v-model="v$.form.textOne.$model" @blur="saveGeneralInfo" />
                  </td>
                  <td>
                    <input type="text" class="step-input" v-model="v$.form.textTwo.$model" @blur="saveGeneralInfo" />
                  </td>
                  <td>
                    <input type="text" class="step-input" v-model="v$.form.textThree.$model" @blur="saveGeneralInfo" />
                  </td>
                  <!-- <td>
                    <div class="d-flex justify-content-center">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        style="
                          height: 20px;
                          width: 20px;
                          border: 1px solid gray;
                        "
                        :checked="v$.form.showTypes.$model === 1"
                        @change="handleShowTypesChange"
                      />
                    </div>
                  </td> -->
                </tr>
              </table>
            </div>
          </div>

          <hr class="mt-4 mb-5" />

          <!-- <div style="width: 100%; overflow-x: scroll">
            <OperationalSchemeGraph :operationalScheme="operationalScheme" />
          </div> -->

          <!-- <hr /> -->

          <div class="semesters">
            <div class="d-flex justify-content-end">
              <AppCheckPermission permission="administationsConfigurationInstitucional.operationalSchemes.create">
                <AppButton @click="openModalSemesterTemplate()" :disabled="configuredSemesterLimit > 0 && !canCreateSemesterTemplate">
                  <AppIcon icon="plus" class="me-2" />
                  Crear
                  {{ operationalScheme.moduleName?.toLowerCase() || 'semestre' }}
                </AppButton>
              </AppCheckPermission>
            </div>
            <AppAccordion v-slot="{ accordionId }" class="pt-4 pb-5">
              <div>
                <AppAccordionItem v-for="(semester, index) in operationalScheme.periodTemplates" :key="semester.id ?? index" :accordion-id="accordionId" class="mt-4">
                  <template #head>
                    <div class="header">
                      <div class="d-flex fw-bold">
                        {{ semester?.name }}
                      </div>

                      <div class="d-flex">
                        <AppCheckPermission permission="administationsConfigurationInstitucional.operationalSchemes.edit">
                          <AppCustomButton v-tooltip="'core.edit'" :icon-name="'pencil'" @click.stop="openModalSemesterTemplate(semester)" />
                        </AppCheckPermission>

                        <AppCheckPermission permission="administationsConfigurationInstitucional.operationalSchemes.delete">
                          <AppCustomButton v-tooltip="'core.delete'" :icon-name="'trash'" @click.stop="confirmDelete(semester)" />
                        </AppCheckPermission>
                      </div>
                    </div>
                  </template>

                  <template #content>
                    <div class="semesterContent">
                      <div class="semesterContent__item">
                        <span class="semesterContent__label">Nombre</span>
                        <span class="semesterContent__value">
                          {{ semester?.name || 'Sin nombre' }}
                        </span>
                      </div>

                      <div class="semesterContent__item">
                        <span class="semesterContent__label">Código</span>
                        <span class="semesterContent__value">
                          {{ semester?.code || 'Sin código' }}
                        </span>
                      </div>

                      <div class="semesterContent__item semesterContent__item--full">
                        <span class="semesterContent__label">Descripción</span>
                        <span class="semesterContent__value">
                          {{ semester?.description || 'Sin descripción' }}
                        </span>
                      </div>
                    </div>
                  </template>
                </AppAccordionItem>
              </div>
            </AppAccordion>
          </div>
        </div>
      </div>

      <AppModal v-model="modalSemesterTemplate" size="lg">
        <ManageSemesterTemplateForm
          v-if="modalSemesterTemplate"
          @close="closeModalSemesterTemplate"
          :semesterTemplate="currentSemesterTemplate"
          :numberSemesters="configuredSemesterLimit"
          :operational-scheme="operationalScheme"
        />
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="core.curriculum.semester.singular" @confirmDelete="deleteSemesterTemplate" />
      </AppModal>

      <AppModal v-model="modalConfirmFinish" size="lg">
        <AppConfirmActionModal v-if="modalConfirmFinish" title="Terminar diseño de esquema operativo" @confirmAction="finishDesign">
          <template #content>
            <div class="d-flex gap-4">
              <AppIcon icon="exclamation-circle" size="3x" class="text-warning" />
              <h4 style="text-align: left">¿Desea marcar este esquema operativo como terminado? Después de realizar esta acción no se podrá editar.</h4>
            </div>
          </template>
        </AppConfirmActionModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCustomButton from '../../../shared/components/Buttons/AppCustomButton.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppConfirmActionModal from '../../../shared/components/Modal/AppConfirmActionModal.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import ManageSemesterTemplateForm from '../components/ManageSemesterTemplateForm.vue';

import { ToastService } from '../../../shared/services/toast.service';

import { GetAllOperationalSchemesService } from '../services/getAllOperationalSchemes.service';
import { CreateOrUpdateOperationalSchemesService } from '../services/createOrUpdateOperationalSchemes.service';
import { GetAllPeriodClasificationsService } from '../services/getAllPeriodClasifications.service';
import { GetOperationalShemesWhithPaginationService } from '../services/getAllModuleTypeWhithPagination.service';
import { CreateOrUpdatePeriodTemplateService } from '../services/createOrUpdateSmesterTemplate.service';
import { DeletePeriodTemplateService } from '../services/deletePeriodTemplate.service';
import { GetAllPeriodTypesService } from '../services/getAllPeriodTypes.service';
import { GetAllMandatoyModulesService } from '../services/getAllMandatoyModules.service';

const toastService = new ToastService();

const getAllPeriodClasificationsService = new GetAllPeriodClasificationsService();
const getAllPeriodTypesService = new GetAllPeriodTypesService();
const getAllOperationalSchemesService = new GetAllOperationalSchemesService();
const getOperationalShemesWhithPaginationService = new GetOperationalShemesWhithPaginationService();
const createOrUpdatePeriodTemplateService = new CreateOrUpdatePeriodTemplateService();
const createOrUpdateOperationalSchemesService = new CreateOrUpdateOperationalSchemesService();
const deletePeriodTemplateService = new DeletePeriodTemplateService();
const getAllMandatoyModulesService = new GetAllMandatoyModulesService();

export default defineComponent({
  name: 'OperationalScheme',
  components: {
    AppBaseList,
    AppCheckPermission,
    AppButtonBack,
    AppPulseLoading,
    AppButton,
    AppCustomButton,
    AppIcon,
    AppAutocomplete,
    AppModal,
    AppConfirmDeleteModal,
    AppConfirmActionModal,
    AppAccordion,
    AppAccordionItem,
    ManageSemesterTemplateForm,
  },
  setup() {
    const { t } = useI18n();
    const loading = ref(true);
    const headerStorage = useHeaderStore();
    const route = useRoute();
    const title = 'Esquema operativo';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const programTypeIdParams = ref(Number(route.params.programTypeId || 0));
    let initialForm: any = null;

    const form: any = reactive({
      classWeeks: null,
      credits: null,
      maximumCredits: null,
      evaluationWeeks: null,
      semesterHours: null,
      numberSemesters: null,
      weeks: null,
      seminar: null,
      practicalHours: null,
      periodTypeId: null,
      theoryOperation: null,
      workshopOperation: null,
      virtualOperation: null,
      textOne: null,
      textThree: null,
      textTwo: null,
      showTypes: 0,
    });
    const v$ = useVuelidate(
      {
        form: {
          classWeeks: {},
          credits: {},
          maximumCredits: {},
          evaluationWeeks: {},
          semesterHours: {},
          numberSemesters: {},
          weeks: {},
          seminar: {},
          practicalHours: {},
          periodTypeId: {},
          theoryOperation: {},
          workshopOperation: {},
          virtualOperation: {},
          textOne: {},
          textThree: {},
          textTwo: {},
          showTypes: {},
        },
      },
      { form }
    );

    const operationalScheme = ref<any>({});
    const periodTypeData = ref<any>();
    const currentSemesterTemplate = ref<any>(null);
    const modalSemesterTemplate = ref(false);
    const modalDelete = ref(false);
    const modalConfirmFinish = ref(false);
    const finishError = ref(false);

    const periodClasificationOptions = ref<any[]>([]);
    const mandatoryModuleOptions = ref<any[]>([]);

    const createdSemesterCount = computed(() => Number(operationalScheme.value?.periodTemplates?.length || 0));
    const configuredSemesterLimit = computed(() => Number(form.numberSemesters ?? operationalScheme.value?.semesterNumber ?? operationalScheme.value?.numberSemesters ?? 0));
    const canCreateSemesterTemplate = computed(() => configuredSemesterLimit.value > 0 && createdSemesterCount.value < configuredSemesterLimit.value);

    const normalizeResponseData = (response: any) => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    };

    const mergeOptions = (current: any[], incoming: any[]) => {
      const map = new Map();

      [...current, ...incoming].forEach((item: any) => {
        if (item?.id != null) {
          map.set(item.id, item);
        }
      });

      return Array.from(map.values());
    };

    onMounted(async () => {
      try {
        headerStorage.module = {
          name: 'Diseño curricular',
          url: '',
        };
        headerStorage.moduleItem = {
          name: 'Tipos de programas',
          url: '',
        };
        headerStorage.moduleSubItem = { name: 'Esquema operativo', url: '' };

        await getData();
      } catch (e) {
        console.log('error', e);
      } finally {
        loading.value = false;
      }
    });

    const getData = async () => {
      try {
        const response = await getAllOperationalSchemesService.run({
          id: parseInt(route.params.operationalSchemeId.toString()),
        });

        const scheme = response?.data?.[0] || {};
        operationalScheme.value = scheme;
        form.name = scheme.name ?? null;
        form.code = scheme.code ?? null;
        form.classWeeks = scheme.classWeeks ?? null;
        form.credits = scheme.creditsNumber ?? null;
        form.maximumCredits = scheme.maximumCredits ?? null;
        form.evaluationWeeks = scheme.evaluationWeeks ?? null;
        form.semesterHours = scheme.semesterHours ?? null;
        form.numberSemesters = scheme.semesterNumber ?? null;
        form.weeks = scheme.weeks ?? null;
        form.seminar = scheme.seminar ?? null;
        form.practicalHours = scheme.practicalHours ?? null;
        form.periodTypeId = scheme.periodTypeId ?? null;
        form.theoryOperation = scheme.theoryOperation ?? null;
        form.workshopOperation = scheme.workshopOperation ?? null;
        form.virtualOperation = scheme.virtualOperation ?? null;
        form.textOne = scheme.stepOne ?? null;
        form.textTwo = scheme.stepTwo ?? null;
        form.textThree = scheme.stepThree ?? null;
        form.showTypes = Number(scheme.showTypes ?? 0);

        const currentPeriodClasifications = (scheme.periodTemplates || []).map((item: any) => item.periodClasification).filter(Boolean);

        const currentMandatoryModules = (scheme.periodTemplates || []).flatMap((item: any) => item.mandatoryModules || item.moduleTypes || []).filter(Boolean);

        periodClasificationOptions.value = mergeOptions(periodClasificationOptions.value, currentPeriodClasifications);

        mandatoryModuleOptions.value = mergeOptions(mandatoryModuleOptions.value, currentMandatoryModules);
        const responsePeriodType = await getAllPeriodTypesService.run({
          noPag: true,
        });

        periodTypeData.value = normalizeResponseData(responsePeriodType);

        initialForm = JSON.parse(JSON.stringify(form));
      } catch (error) {
        console.log(error);
      }
    };

    const getValueOrNull = (value: any) => {
      return value === '' ? null : value;
    };

    const saveGeneralInfo = async () => {
      try {
        console.log('holaa dis', operationalScheme.value);

        const data = {
          id: operationalScheme.value.id,
          name: form.name,
          code: form.code,
          description: operationalScheme.value.description,
          isActive: operationalScheme.value.isActive,
          classWeeks: getValueOrNull(form.classWeeks),
          evaluationWeeks: getValueOrNull(form.evaluationWeeks),
          semesterHours: getValueOrNull(form.semesterHours),
          creditsNumber: getValueOrNull(form.credits),
          maximumCredits: getValueOrNull(form.maximumCredits),
          semesterNumber: getValueOrNull(form.numberSemesters),
          programTypeId: operationalScheme.value.programTypeId,
          periodTypeId: getValueOrNull(form.periodTypeId),
          stepOne: getValueOrNull(form.textOne),
          stepTwo: getValueOrNull(form.textTwo),
          stepThree: getValueOrNull(form.textThree),
          showTypes: Number(form.showTypes ? 1 : 0),
          status: operationalScheme.value.status,
          weeks: getValueOrNull(form.weeks),
          seminar: getValueOrNull(form.seminar),
          practicalHours: getValueOrNull(form.practicalHours),
          theoryOperation: getValueOrNull(form.theoryOperation),
          workshopOperation: getValueOrNull(form.workshopOperation),
          virtualOperation: getValueOrNull(form.virtualOperation),
        };

        await createOrUpdateOperationalSchemesService.run(data, operationalScheme.value.id);

        await getData();
      } catch (e) {
        console.log(e);
      }
    };

    const handleShowTypesChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      form.showTypes = target.checked ? 1 : 0;
      await saveGeneralInfo();
    };

    const showSemesterLimitError = (message: string) => {
      toastService.show(message, 'error');
      setTimeout(() => toastService.hide(), 100);
    };

    const openModalSemesterTemplate = (semesterTemplate: any | null = null) => {
      if (!semesterTemplate) {
        if (!configuredSemesterLimit.value) {
          showSemesterLimitError('Debes configurar el número de semestres antes de crear semestres.');
          return;
        }

        if (createdSemesterCount.value >= configuredSemesterLimit.value) {
          showSemesterLimitError('Ya alcanzaste la cantidad máxima de semestres configurada.');
          return;
        }
      }

      currentSemesterTemplate.value = semesterTemplate
        ? {
            ...semesterTemplate,
            operationalSchemeId: operationalScheme.value.id,
          }
        : {
            operationalSchemeId: operationalScheme.value.id,
          };

      modalSemesterTemplate.value = true;
    };

    const closeModalSemesterTemplate = async () => {
      modalSemesterTemplate.value = false;
      currentSemesterTemplate.value = null;
      await getData();
    };

    const confirmDelete = (semesterTemplate: any) => {
      currentSemesterTemplate.value = semesterTemplate;
      modalDelete.value = true;
    };

    const deleteSemesterTemplate = async () => {
      try {
        await deletePeriodTemplateService.run(currentSemesterTemplate.value?.id as number);
        modalDelete.value = false;
        currentSemesterTemplate.value = null;
        await getData();
      } catch (e) {
        console.log('error', e);
      }
    };

    const openModalFinish = () => {
      const requiredFields: string[] = ['classWeeks', 'credits', 'evaluationWeeks', 'semesterHours', 'numberSemesters', 'theoryOperation', 'workshopOperation', 'virtualOperation'];

      const isFormValid = requiredFields.every((field: string) => form[field] !== null && form[field] !== undefined);

      if (operationalScheme.value?.periodTemplates?.length !== operationalScheme.value.numberSemesters) {
        toastService.show('La cantidad de semestres no coincide con el número de semestres configurado.', 'error');
        setTimeout(() => toastService.hide(), 100);
        return;
      }

      if (!isFormValid) {
        finishError.value = true;
        toastService.show('Se deben completar los campos obligatorios para terminar este esquema operativo', 'error');
        setTimeout(() => toastService.hide(), 100);
        return;
      }

      modalConfirmFinish.value = true;
    };

    const finishDesign = async () => {
      modalConfirmFinish.value = false;
      loading.value = true;
      try {
        await createOrUpdateOperationalSchemesService.run({
          id: operationalScheme.value.id,
          isCompleted: 1,
        });
        await getData();
      } catch (error) {
        console.log(error);
      } finally {
        loading.value = false;
      }
    };

    return {
      t,
      v$,
      loading,
      routes,
      title,
      finishError,
      operationalScheme,
      currentSemesterTemplate,
      modalSemesterTemplate,
      modalDelete,
      modalConfirmFinish,
      saveGeneralInfo,
      handleShowTypesChange,
      openModalSemesterTemplate,
      closeModalSemesterTemplate,
      confirmDelete,
      deleteSemesterTemplate,
      periodClasificationOptions,
      mandatoryModuleOptions,
      openModalFinish,
      finishDesign,
      periodTypeData,
      programTypeIdParams,
      canCreateSemesterTemplate,
      configuredSemesterLimit,
    };
  },
});
</script>

<style scoped>
.title {
  overflow: hidden;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-size: 25px;
  padding: 30px 0 10px 30px;
  line-height: 28px;
  color: #2e3135;
  border-radius: 4px;
}
.containerContent {
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.45) 1px 2px 6px;
  height: calc(-200px + 100vh);
  overflow: auto;
}
.header-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  font-weight: 600;
  padding: 10px;
}

.header-info table {
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.header-info th {
  border: 1px solid black;
  padding: 8px 15px;
  text-align: left;
}

.header-info td {
  border: 1px solid black;
  padding: 0;
  text-align: center;
  width: 80px;
}

.header-info td input {
  border: none;
  text-align: center;
  width: 100%;
  height: 35px;
  padding: 10px;
}

.header-info th {
  background-color: #f2f2f2;
}

.hours-row-1 {
  display: flex;
}

.hours-row-1 div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hours-row-2 {
  display: flex;
  justify-content: start;
  width: 47%;
}

.hours-row-2 div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hours-row-1 .center-training {
  display: flex;
  flex-direction: column;
  width: 30%;
}

.hours-row-1 .center-label {
  display: flex;
  flex-direction: column;
  height: 0;
  width: 100%;
}

.hours-row-1 .center-label label {
  position: relative;
  top: -30px;
}

.hours-row-1 .center-training .center-training-inputs {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 98%;
  font-size: 18px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
}

.header .description {
  display: flex;
}

.finish-error {
  border-radius: 5px !important;
  border: 3px solid var(--color-secondary) !important;
  background-color: rgb(249, 203, 203);
}

.finish-error input {
  background-color: rgb(249, 203, 203);
}
.steps-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-top: 12px;
}

.steps-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 14px;
  background: #fff;
}

.steps-table th {
  border: 1px solid black;
  padding: 10px 12px;
  text-align: center;
  background-color: #f2f2f2;
  white-space: nowrap;
}

.steps-table td {
  border: 1px solid black;
  padding: 8px;
  vertical-align: middle;
}

.step-input {
  width: 100%;
  min-width: 260px;
  height: 40px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 0 12px;
  text-align: left;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.step-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.12);
}

.checkbox-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 90px;
}

.step-checkbox {
  height: 20px;
  width: 20px;
  border: 1px solid gray;
  cursor: pointer;
}

/* tablet */
@media (max-width: 1024px) {
  .steps-table {
    min-width: 780px;
  }

  .step-input {
    min-width: 220px;
  }
}

/* mobile */
@media (max-width: 768px) {
  .steps-table {
    min-width: 720px;
    font-size: 13px;
  }

  .steps-table th,
  .steps-table td {
    padding: 6px;
  }

  .step-input {
    min-width: 200px;
    height: 38px;
    font-size: 13px;
  }

  .checkbox-cell {
    min-width: 70px;
  }
}

/* very small */
@media (max-width: 480px) {
  .steps-table {
    min-width: 660px;
  }

  .step-input {
    min-width: 180px;
    font-size: 12px;
  }
}
.semesterContent {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.semesterContent__item {
  display: flex;
  flex-direction: column;
}

.semesterContent__item--full {
  grid-column: span 2;
}

.semesterContent__label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

.semesterContent__value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}
</style>
