<template>
  <AppBaseList :title="t(title)">
    <template #actions>
      <AppCheckPermission permission="administationsConfigurationInstitucional.operationalSchemes.create">
        <AppButton style="color: white" @click="openModalOperationalScheme()">
          <AppIcon icon="plus" class="me-2"></AppIcon>
          Crear Nueva Versión
        </AppButton>
      </AppCheckPermission>
      <AppButtonBack :to="{ name: 'curriculumDesign.programType' }"></AppButtonBack>
    </template>

    <template #content>
      <AppPulseLoading v-if="loading" />

      <div v-else>
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="title">{{ programType?.name }}</h2>
        </div>

        <div class="mt-3">
          <AppAccordion v-slot="{ accordionId }">
            <AppAccordionItem v-for="(operationalScheme, index) in operationalSchemes" :accordion-id="accordionId" :key="operationalScheme.id ?? index">
              <template v-slot:head>
                <div class="header">
                  <div class="description">
                    <span>{{ operationalScheme.name }}</span>
                    <AppCheckPermission permission="curriculumDesign.operationalScheme.create">
                      <AppCustomButton v-tooltip="'Estructura'" :icon-name="'tasks'" @click.stop="goToOperationalScheme(operationalScheme)" />
                    </AppCheckPermission>
                    <AppCheckPermission permission="administationsConfigurationInstitucional.operationalSchemes.edit">
                      <AppCustomButton v-tooltip="'core.edit'" :icon-name="'pencil'" @click.stop="openModalOperationalScheme(operationalScheme)" />
                    </AppCheckPermission>
                    <AppCheckPermission permission="administationsConfigurationInstitucional.operationalSchemes.delete">
                      <AppCustomButton v-tooltip="'core.delete'" :icon-name="'trash'" @click.stop="confirmDelete(operationalScheme)" />
                    </AppCheckPermission>
                  </div>
                  <div>
                    {{ operationalScheme.isActive == 1 ? 'Activa' : 'Inactiva' }}
                  </div>
                </div>
              </template>

              <template v-slot:content>
                <h5 class="under__line">Información general</h5>

                <div class="content">
                  <div class="info-row">
                    <p>Semanas de clase: {{ operationalScheme.classWeeks || 0 }}</p>
                    <p>
                      Semanas de evaluación:
                      {{ operationalScheme.evaluationWeeks || 0 }}
                    </p>
                    <p>
                      Número de creditos:
                      {{ operationalScheme.creditsNumber || 0 }}
                    </p>
                  </div>
                  <div class="info-row">
                    <p>
                      Horas por semestre:
                      {{ operationalScheme.semesterHours || 0 }}
                    </p>
                    <p>
                      Número de semestres:
                      {{ operationalScheme.semesterNumber || 0 }}
                    </p>
                    <p></p>
                  </div>
                </div>
                <h5 class="under__line">
                  {{ t('academicPlanning.periods.name') }}
                </h5>

                <div :class="{ 'grid-cards': operationalScheme.periods.length }">
                  <AppCheckPermission permission="academicPlanning.academicPeriods.create">
                    <AppButtonNewContainer @click="openPeriodModal(operationalScheme, null)"></AppButtonNewContainer>
                  </AppCheckPermission>

                  <AppEmptyResponse v-if="!operationalScheme.periods.length"></AppEmptyResponse>

                  <AppCard v-for="(period, index) in operationalScheme.periods" :key="index">
                    <template #title>
                      <div>{{ period.name }}</div>
                    </template>

                    <template #body>
                      <p class="m-0 semibold">
                        {{ t('academicPlanning.periods.code') }}:
                        <span class="fw-normal">{{ period.code }}</span>
                      </p>
                      <!-- <p class="m-0 semibold">
                      {{ t('academicPlanning.periods.form_start_date') }}:
                      <span class="fw-normal">{{ period.startDate }}</span>
                    </p>
                    <p class="m-0 semibold">
                      {{ t('academicPlanning.periods.form_end_date') }}:
                      <span class="fw-normal">{{ period.endDate }}</span>
                    </p> -->
                      <p class="m-0 semibold">
                        {{ t('academicPlanning.periods.form_percent') }}:
                        <span class="fw-normal">{{ period.percent }}</span>
                      </p>

                      <AppCheckPermission permission="academicPlanning.academicPeriods.edit">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="active" :checked="!!period.active" @change="statusUpdate(period)" />

                          <label class="form-check-label" for="active">
                            {{ period.active ? t('academicPlanning.periods.form_active') : t('academicPlanning.periods.form_inactive') }}
                          </label>
                        </div>
                      </AppCheckPermission>
                    </template>

                    <template #footer>
                      <div class="d-flex justify-content-end">
                        <AppButtonGroup>
                          <!-- <AppCheckPermission permission="academicPlanning.ExtraordinaryGradePeriods.list">
                          <AppButton
                            variant="primary"
                            outlined
                            icon="book-open"
                            :to="{
                              name: 'academicPlanning.extraordinaryGradePeriods',
                              params: {
                                academicPeriodId: academicPeriod.id,
                                periodId: period.id,
                              },
                            }"
                            v-tooltip="'academicPeriod.Extended'"
                          >
                          </AppButton>
                        </AppCheckPermission> -->
                          <AppCheckPermission permission="academicPlanning.academicPeriods.edit">
                            <AppButtonEdit @click="openPeriodModal(operationalScheme, period)"></AppButtonEdit>
                          </AppCheckPermission>

                          <AppCheckPermission permission="academicPlanning.academicPeriods.delete">
                            <AppButtonDelete @click="openConfirmDelete('corte', period)"> </AppButtonDelete>
                          </AppCheckPermission>
                        </AppButtonGroup>
                      </div>
                    </template>
                  </AppCard>
                </div>
              </template>
            </AppAccordionItem>
          </AppAccordion>
        </div>
      </div>

      <AppModal v-model="modalOperationalScheme">
        <ManageOperationalSchemeForm v-if="modalOperationalScheme" @close="closeModalOperationalScheme" :operationalScheme="currentOperationalScheme" />
      </AppModal>
      <AppModal v-model="periodModal" :size="'lg'">
        <PeriodForm v-if="periodModal" :data="currentPeriod.value" :academic-period-id="academicPeriodId.value" @close="closePeriodModal"></PeriodForm>
      </AppModal>
      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Formación técnica profesional" @confirmDelete="deleteOperationalScheme" @close="closeDeleteOperationalSchemeModal"> </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalDeletePeriod">
        <AppConfirmDeleteModal v-if="modalDeletePeriod" :entity="currentEntity" @confirmDelete="confirmDeletePeriods" @close="closeDeletePeriodModal"> </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCustomButton from '../../../shared/components/Buttons/AppCustomButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import ManageOperationalSchemeForm from '../components/ManageOperationalSchemeForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { GetAllOperationalSchemesService } from '../services/getAllOperationalSchemes.service';
import { CreateOrUpdateOperationalSchemesService } from '../services/createOrUpdateOperationalSchemes.service';
import { DeleteOperationalSchemesService } from '../services/deleteOperationalSchemes.service';
import { GetProgramTypesService } from '../services/getProgramTypes.service';
import { CreateOrUpdatePeriodService } from '../services/createOrUpdatePeriod.service';
import { DeletePeriodService } from '../services/deletePeriod.service';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import PeriodForm from '../components/PeriodForm.vue';

const getAllOperationalSchemesService = new GetAllOperationalSchemesService();
const getProgramTypesService = new GetProgramTypesService();
const createOrUpdateOperationalSchemesService = new CreateOrUpdateOperationalSchemesService();
const deleteOperationalSchemesService = new DeleteOperationalSchemesService();
const updatePeriodService = new CreateOrUpdatePeriodService();
const deletePeriodService = new DeletePeriodService();

export default defineComponent({
  name: 'LevelTypeVersions',
  components: {
    AppBaseList,
    AppCheckPermission,
    AppButtonBack,
    AppPulseLoading,
    AppButton,
    AppCustomButton,
    AppIcon,
    ManageOperationalSchemeForm,
    AppModal,
    AppConfirmDeleteModal,
    AppAccordion,
    AppAccordionItem,
    AppCard,
    AppButtonNewContainer,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonDelete,
    PeriodForm,
  },
  setup() {
    const { t } = useI18n();
    const loading = ref(true);
    const headerStorage = useHeaderStore();
    const route = useRoute();
    const router = useRouter();
    const title = 'Esquema operativo';
    useMeta({ title: t(title) });
    const currentEntity = ref<any>(null);

    const programType = ref<any>(null);
    const operationalSchemes = ref<any[]>([]);
    const currentOperationalScheme = ref<any>(null);
    const modalOperationalScheme = ref(false);
    const modalDelete = ref(false);
    const modalDeletePeriod = ref(false);
    const academicPeriodId: { value: any } = reactive({
      value: null,
    });
    const currentPeriod: { value: any | null } = reactive({
      value: null,
    });
    const periodModal = ref(false);
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });

    const normalizeCollection = (response: any) => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    };

    const buildOperationalSchemePayload = (operationalScheme: any, overrides: Record<string, any> = {}) => ({
      id: operationalScheme?.id ?? null,
      code: operationalScheme?.code ?? '',
      name: operationalScheme?.name ?? '',
      description: operationalScheme?.description ?? null,
      isActive: operationalScheme?.isActive ?? 1,
      programTypeId: operationalScheme?.programTypeId ?? Number(route.params.programTypeId),
      status: operationalScheme?.status ?? 'draft',
      classWeeks: operationalScheme?.classWeeks ?? null,
      evaluationWeeks: operationalScheme?.evaluationWeeks ?? null,
      semesterHours: operationalScheme?.semesterHours ?? null,
      creditsNumber: operationalScheme?.creditsNumber ?? null,
      maximumCredits: operationalScheme?.maximumCredits ?? null,
      semesterNumber: operationalScheme?.semesterNumber ?? null,
      weeks: operationalScheme?.weeks ?? null,
      seminar: operationalScheme?.seminar ?? null,
      practicalHours: operationalScheme?.practicalHours ?? null,
      periodTypeId: operationalScheme?.periodTypeId ?? null,
      theoryOperation: operationalScheme?.theoryOperation ?? null,
      workshopOperation: operationalScheme?.workshopOperation ?? null,
      virtualOperation: operationalScheme?.virtualOperation ?? null,
      stepOne: operationalScheme?.stepOne ?? null,
      stepTwo: operationalScheme?.stepTwo ?? null,
      stepThree: operationalScheme?.stepThree ?? null,
      showTypes: Number(operationalScheme?.showTypes ?? 0),
      ...overrides,
    });

    const refreshData = async () => {
      await getData();
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

        await refreshData();
      } catch (e) {
        console.log('error', e);
      } finally {
        loading.value = false;
      }
    });

    const getData = async () => {
      loading.value = true;
      try {
        const levelTypeResponse = await getProgramTypesService.run({
          id: parseInt(route.params.programTypeId.toString()),
          noPag: true,
        });

        programType.value = normalizeCollection(levelTypeResponse)[0] ?? null;

        const versions = await getAllOperationalSchemesService.run({
          programTypeId: parseInt(route.params.programTypeId.toString()),
          noPag: true,
        });
        operationalSchemes.value = normalizeCollection(versions);
      } catch (error) {
        console.log(error);
      }
      loading.value = false;
    };

    const openModalOperationalScheme = (operationalScheme: any | null) => {
      currentOperationalScheme.value = buildOperationalSchemePayload(operationalScheme, {
        programTypeId: programType.value?.id ?? Number(route.params.programTypeId),
      });
      modalOperationalScheme.value = true;
    };

    const closeModalOperationalScheme = async () => {
      modalOperationalScheme.value = false;
      currentOperationalScheme.value = null;
      await refreshData();
    };

    const confirmDelete = (operationalScheme: any) => {
      currentOperationalScheme.value = operationalScheme;
      modalDelete.value = true;
    };

    const closeDeleteOperationalSchemeModal = () => {
      modalDelete.value = false;
      currentOperationalScheme.value = null;
    };

    const deleteOperationalScheme = async () => {
      try {
        await deleteOperationalSchemesService.run(currentOperationalScheme.value?.id as number);

        const versionsResponse = await getAllOperationalSchemesService.run({
          programTypeId: parseInt(route.params.programTypeId.toString()),
          noPag: true,
        });
        const versions = normalizeCollection(versionsResponse);
        const latestVersion = versions[versions.length - 1];

        if (latestVersion) {
          await createOrUpdateOperationalSchemesService.run(
            buildOperationalSchemePayload(latestVersion, {
              isActive: 1,
              status: latestVersion.status ?? 'draft',
            }),
            latestVersion.id
          );
        }

        closeDeleteOperationalSchemeModal();
        await refreshData();
      } catch (e) {
        console.log('error', e);
      }
    };

    const goToOperationalScheme = (operationalScheme: any) => {
      const params = {
        operationalSchemeId: operationalScheme?.id.toString(),
        programTypeId: parseInt(route.params.programTypeId.toString()),
      };
      router.push({ name: 'curriculumDesign.operationalScheme', params });
    };
    const openPeriodModal = (academicPeriod: any, period: any | null) => {
      academicPeriodId.value = academicPeriod?.id ?? null;
      currentPeriod.value = period ?? null;
      periodModal.value = true;
    };
    const closePeriodModal = async () => {
      periodModal.value = false;
      currentPeriod.value = null;
      academicPeriodId.value = null;
      await refreshData();
    };
    const statusUpdate = async (period: any) => {
      try {
        period.active = period.active ? 0 : 1;
        await updatePeriodService.run(period, period.id);
      } catch (e) {
        console.log('error', e);
      }
    };
    const openConfirmDelete = (entity: string, data: any | any) => {
      currentDataDelete.value = data ?? null;
      currentEntity.value = entity;
      modalDeletePeriod.value = true;
    };

    const closeDeletePeriodModal = () => {
      modalDeletePeriod.value = false;
      currentDataDelete.value = null;
      currentEntity.value = null;
    };

    const confirmDeletePeriods = async () => {
      try {
        await deletePeriodService.run(currentDataDelete.value.id);
        closeDeletePeriodModal();
        await refreshData();
      } catch (error) {
        console.log(error);
      }
    };

    watch(modalOperationalScheme, (value) => {
      if (!value) {
        currentOperationalScheme.value = null;
      }
    });

    watch(modalDelete, (value) => {
      if (!value) {
        currentOperationalScheme.value = null;
      }
    });

    watch(modalDeletePeriod, (value) => {
      if (!value) {
        currentDataDelete.value = null;
        currentEntity.value = null;
      }
    });
    return {
      t,
      loading,
      title,
      programType,

      operationalSchemes,
      currentOperationalScheme,
      modalOperationalScheme,
      modalDelete,
      confirmDelete,
      closeDeleteOperationalSchemeModal,
      deleteOperationalScheme,
      openModalOperationalScheme,
      closeModalOperationalScheme,
      goToOperationalScheme,
      openPeriodModal,
      statusUpdate,
      openConfirmDelete,
      confirmDeletePeriods,
      closeDeletePeriodModal,
      modalDeletePeriod,
      currentEntity,
      periodModal,
      closePeriodModal,
      currentPeriod,
      academicPeriodId,
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
  line-height: 28px;
  color: #2e3135;
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 95%;
  font-size: 18px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
}

.header .description {
  display: flex;
}

.description span {
  padding-right: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-row p {
  text-align: start;
  width: 33%;
  font-weight: 600;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}

.semibold {
  font-weight: 500;
}
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
}
</style>
