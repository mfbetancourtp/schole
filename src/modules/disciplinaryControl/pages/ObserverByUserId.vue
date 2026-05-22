<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <!-- Botones de reporte general del estudiante -->
      <div class="d-flex gap-2">
        <AppButton style="color: white" variant="secondary" :label="'Exportar observador'" @click="generateGeneralReport(data)" />
        <AppButton style="color: white" variant="secondary" v-if="reportId" label="Enviar observador por email" @click="sendGeneralMail(data.id)" />
      </div>
      <AppButtonBack :to="{ name: 'disciplinaryControl.observer' }" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <div class="container-form-nav">
          <div v-if="data" class="content-form-info-nav">
            <div class="personal-info-nav">
              <div class="text-title-form-nav">
                {{ data?.userNames }}
              </div>

              <div class="student-info-nav">
                <span> Estudiante - {{ data?.studentCode || 'No found' }} </span>

                <span class="state-tag" :class="data?.userInstitutionIsActive === 1 ? 'state-active' : 'state-inactive'">
                  {{ data?.userInstitutionIsActive === 1 ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>

            <div class="academy-info-nav">
              <div class="academy-info-item">
                <div class="container-academic-periods">
                  <AppAutocomplete v-model="academicPeriodId" label="academicPeriodName" :clearable="false" :options="academicPeriods.value" :reduce="(item: any) => item.academicPeriodId" />
                </div>
                <span>Ciclo Academico</span>
              </div>

              <hr />

              <div class="academy-info-item">
                <span class="text-title-form-nav">{{ academicPeriodEnrollment.value.degreeName }} - {{ academicPeriodEnrollment.value.journeyName }}</span>
                <span>Curso</span>

                <span
                  class="state-tag"
                  :class="
                    academicPeriodEnrollment.value.isPreEnrolled === 0 && academicPeriodEnrollment.value.isRetired === 0
                      ? 'state-active'
                      : academicPeriodEnrollment.value.isPreEnrolled === 1 && academicPeriodEnrollment.value.isRetired === 0
                      ? 'state-inactive'
                      : 'state-retired'
                  "
                >
                  {{
                    academicPeriodEnrollment.value.isPreEnrolled === 0 && academicPeriodEnrollment.value.isRetired === 0
                      ? 'Activo'
                      : academicPeriodEnrollment.value.isPreEnrolled === 1 && academicPeriodEnrollment.value.isRetired === 0
                      ? 'Oculto'
                      : 'Retirado'
                  }}
                </span>
              </div>
            </div>
          </div>

          <div :class="{ 'cards-no-border': !data }" class="content-form-nav">
            <div v-if="data" class="contetn-avatar-form-nav">
              <div class="avatar-form-nav avatar-shadow">
                <AppAvatar class="avatar-nav" :size="'lg'" :avatar="data?.avatar" :name="data?.userNames ?? '?'" />
              </div>
            </div>

            <div class="form-navigation">
              <template v-for="(section, index) in sectionsForm" :key="index">
                <AppButton :class="{ active: currentSectionForm === section.key }" @click="goToSectionForm(section.key)">
                  <AppGetIcon class="icon-form-nav" :name="section.icon" :style="{ width: section.width, height: section.height }" />
                  {{ section.name }}
                </AppButton>
              </template>
            </div>
          </div>
        </div>

        <!-- ReportProgress -->
        <div class="mt-2" v-if="reportId">
          <ReportProgress :report-id="reportId" />
        </div>

        <div v-if="currentSectionForm === 'disciplinaryOffenses'">
          <template v-if="!loadingInfo">
            <AppLoading v-if="loadingInfo" />

            <AppCard>
              <template #body>
                <section>
                  <div class="cards-dashboard-container">
                    <AppCardDashboard class="container-custom-card">
                      <template #title>
                        <span>Observaciones</span>
                      </template>

                      <template #body>
                        <div class="card-graph">
                          <div class="content-icon">
                            <h3>
                              {{ offensesSummary?.disciplinaryOffenses.length }}
                            </h3>
                          </div>

                          <AppGetIcon class="form-icon__graph" name="stats-dots" />
                        </div>
                      </template>
                    </AppCardDashboard>

                    <template v-for="(item, index) in offensesSummary?.stats" :key="index">
                      <AppCardDashboard
                        class="container-custom-card"
                        :style="{
                          backgroundColor: item.levelOffenseColor ?? '#ddd',
                        }"
                      >
                        <template #title>
                          <span>{{ item.levelOffenseName }}</span>
                        </template>

                        <template #body>
                          <div class="card-graph">
                            <div class="content-icon">
                              <h3>{{ item.total }}</h3>
                            </div>

                            <AppGetIcon class="form-icon__graph" name="stats-dots" />
                          </div>
                        </template>
                      </AppCardDashboard>
                    </template>
                  </div>
                </section>

                <section>
                  <AppCheckPermission permission="disciplinaryControl.observerByUserId.disciplinaryOffense.create" :hide="true">
                    <AppButtonNewContainer class="mb-3" @click="toggleDrawer()" />
                  </AppCheckPermission>

                  <AppEmptyResponse v-if="!offensesSummary?.disciplinaryOffenses.length" />

                  <template v-else>
                    <!-- ANTES: v-for con el nivel al final -->
                    <!-- AHORA: nivel primero + avatar alineado con el nombre -->
                    <div v-for="(offense, index) in offensesSummary?.disciplinaryOffenses" :key="index" class="observation-card-custom d-flex">
                      <!-- NIVEL / COLOR AL INICIO -->
                      <div
                        class="level-offense d-flex justify-content-center align-items-center text-center fw-bold"
                        :style="{
                          backgroundColor: offense.levelOffenseColor ?? '#ddd',
                        }"
                      >
                        <span>{{ offense.levelOffenseName ?? 'Sin nivel asignado' }}</span>
                      </div>

                      <!-- CONTENIDO -->
                      <div class="w-100">
                        <div class="contentControlDisciplinary">
                          <div class="p-2 w-100">
                            <!-- fila superior: avatar + docente / fecha + estado -->
                            <div class="contentRow justify-content-between align-items-center mb-2">
                              <div class="teacher-row">
                                <AppAvatar class="avatar-cell" :size="'md'" :avatar="offense?.avatar" :name="offense?.adviser ?? '?'" />
                                <div class="teacher-text">
                                  <span class="label">Docente:</span>
                                  <span class="value">{{ offense.adviser }}</span>
                                </div>
                              </div>

                              <div class="top-right d-flex align-items-center gap-2">
                                <span :class="['is-sent', 'text-white', 'rounded-pill', 'px-2', offense.isSentParents ? 'bg-primary' : 'bg-dark']">
                                  {{ offense.isSentParents ? 'Enviado' : 'Cargada' }}
                                </span>
                                <span class="text-nowrap">
                                  {{ dayjs(`${offense.dateTimeOffense}`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD hh:mm a') }}
                                </span>
                              </div>
                            </div>

                            <div class="observation-field">
                              <span class="label">Observación:</span>
                              <span class="value">{{ offense.offenseTemplateName }}</span>
                            </div>

                            <div class="observation-field">
                              <span class="label">Descripción:</span>
                              <span class="value">{{ offense.description }}</span>
                            </div>

                            <div class="observation-field">
                              <span class="label">Clase donde se dió la falta:</span>
                              <span class="value">{{ offense.courseName ?? offense.playTimeName ?? offense.scenery ?? '---' }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="offense-actions d-flex flex-row-reverse">
                          <AppButtonGroup size="lg">
                            <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.sendMail.list">
                              <AppButton
                                variant="primary"
                                icon="envelope"
                                outlined
                                v-tooltip="offense.isSentParents ? 'Volver a enviar email' : 'Enviar email'"
                                @click="openSendMailModalModal(offense)"
                              />
                            </AppCheckPermission>

                            <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.generateDocument.list">
                              <AppButton variant="primary" outlined v-tooltip="'Generar documento'" icon="file-alt" @click="generateDocument(offense)" />
                            </AppCheckPermission>

                            <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.edit">
                              <AppButtonEdit @click="toggleDrawer(offense)" />
                            </AppCheckPermission>

                            <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.delete">
                              <AppButtonDelete @click="openConfirmDelete(offense)" />
                            </AppCheckPermission>
                          </AppButtonGroup>
                        </div>
                      </div>
                    </div>
                  </template>
                </section>
              </template>
            </AppCard>
          </template>
        </div>

        <div v-if="currentSectionForm === 'behavior'">
          <ObseByUserIdBehavior
            :params="{
              userId: Number(userId),
              groupId: academicPeriodEnrollment.value.groupId,
              degreeId: academicPeriodEnrollment.value.degreeId,
              academicPeriodId: academicPeriodEnrollment.value.academicPeriodId,
              isQualitativeGrading: academicPeriodEnrollment.value.isQualitativeGrading,
            }"
          />
        </div>

        <div v-if="currentSectionForm === 'studentWellness'">
          <ObseByUserIdMedicalRecords :userId="Number(userId)" :permission="'disciplinaryControl.observerByUserId.medicalRecords'" />
        </div>
      </template>
      <AppModal v-model="sendMailObserverModal">
        <ConfirmSendMailReportObservation v-if="sendMailObserverModal" :filters="filtersAux.value" @close="closeSendMailModal"> </ConfirmSendMailReportObservation>
      </AppModal>
      <AppModal v-model="sendMailModal">
        <ConfirmSendMailParentsDisciplinaryOffenses
          v-if="sendMailModal && disciplinaryOffense?.disciplinaryOffenseId"
          :offenseDisciplinaryId="disciplinaryOffense.disciplinaryOffenseId"
          @close="closeSendMailModalModal"
        />
      </AppModal>
    </template>
  </AppBaseList>

  <AppModal v-model="modalDelete">
    <AppConfirmDeleteModal v-if="modalDelete" :entity="'Obcerbación'" @confirmDelete="confirmDelete" />
  </AppModal>

  <DisciplinaryOffensesFormDrawer
    v-if="academicPeriodId"
    v-model:isVisible="isVisibleDrawer"
    :params="{
      userId: Number(userId),
      userNames: data?.userNames ?? '',
      academicPeriodId: academicPeriodEnrollment.value.academicPeriodId,
    }"
    :discplinaryOffenseId="disciplinaryOffense?.disciplinaryOffenseId"
    @reload-data="getOffensesSummary(academicPeriodId)"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import { useHeaderStore } from '../../../stores/header.store';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import ObseByUserIdBehavior from '../components/ObseByUserIdBehavior.vue';
import ObseByUserIdMedicalRecords from '../components/ObseByUserIdMedicalRecords.vue';
import DisciplinaryOffensesFormDrawer from '../components/DisciplinaryOffensesFormDrawer.vue';
import ConfirmSendMailParentsDisciplinaryOffenses from '../components/ConfirmSendMailParentsDisciplinaryOffenses.vue';

import { GetStudentForObserverService } from '../services/getStudentForObserver.service';
import { GetStudentOffensesSummaryService } from '../services/getStudentOffensesSummary.service';
import { DeleteDisciplinaryOffensesService } from '../services/deleteDisciplinaryOffenses.service';
import { GenerateDocumentoDisciplinaryOffenseService } from '../services/generateDocumentoDisciplinaryOffense.service';
import { GenerateObserverReportByMatriculateService } from '../../reports/services/reports/generateObserverReportByMatriculate.service';
import ReportProgress from '../../reports/components/ReportProgress.vue';
import ConfirmSendMailReportObservation from '../../reports/components/ConfirmSendMailReportObservation.vue';

const getStudentForObserverService = new GetStudentForObserverService();
const getStudentOffensesSummaryService = new GetStudentOffensesSummaryService();
const deleteDisciplinaryOffensesService = new DeleteDisciplinaryOffensesService();
const generateDocumentoDisciplinaryOffenseService = new GenerateDocumentoDisciplinaryOffenseService();
const generateObserverReportByMatriculateService = new GenerateObserverReportByMatriculateService();

export default defineComponent({
  name: 'ObcerverByUserId',
  components: {
    AppConfirmDeleteModal,
    AppButtonNewContainer,
    AppCheckPermission,
    AppCardDashboard,
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonBack,
    AppBaseList,
    AppGetIcon,
    AppLoading,
    AppAvatar,
    AppButton,
    AppModal,
    AppCard,

    ConfirmSendMailParentsDisciplinaryOffenses,
    DisciplinaryOffensesFormDrawer,
    ObseByUserIdMedicalRecords,
    ObseByUserIdBehavior,
    ReportProgress,
    ConfirmSendMailReportObservation,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.observerByUser.title'); // Obcerbador por usuario

    useMeta({ title: t(title) });

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'core.menu.disciplinary-control', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    const academicPeriods: { value: any[] } = reactive({
      value: [],
    });
    const routes = [
      {
        name: t('core.menu.observer'),
        url: {
          name: 'disciplinaryControl.observer',
        },
      },
      {
        name: title,
      },
    ];
    const router = useRouter();
    const reportId = ref();
    const filtersAux: { value: any } = reactive({
      value: null,
    });
    const currentSectionForm = ref('disciplinaryOffenses');
    const sectionsForm = ref([
      {
        key: 'disciplinaryOffenses',
        name: 'Observaciones',
        icon: 'faSolidMessage',
        width: '37px',
        height: '37px',
      },
      {
        key: 'behavior',
        name: 'Comportamiento',
        icon: 'attitude',
        width: '50px',
        height: '50px',
      },
      {
        key: 'studentWellness',
        name: 'Bienestar estudiantil',
        icon: 'heart-hand-line',
        width: '47px',
        height: '47px',
      },
    ]);

    const userId = route.params.userId as string;

    const data = ref();
    const academicPeriodId = ref<number | null>(null);
    const disciplinaryOffense = ref<any | null>(null);
    const offensesSummary = ref<{
      disciplinaryOffenses: any[];
      stats: any[];
    } | null>(null);

    const academicPeriodEnrollment: { value: any } = reactive({
      value: null,
    });

    const loading = ref(true);
    const loadingInfo = ref(true);
    const modalDelete = ref(false);
    const sendMailModal = ref(false);
    const sendMailObserverModal = ref(false);
    const isVisibleDrawer = ref(false);

    onMounted(async () => {
      loading.value = true;
      data.value = await getStudentForObserverService.run(userId);

      if (Array.isArray(data.value.academicPeriodEnrollments) && data.value.academicPeriodEnrollments.length > 0) {
        const activeEnrollments = data.value.academicPeriodEnrollments.filter((enrollment: any) => enrollment.academicPeriodActive === 1);
        academicPeriods.value = activeEnrollments;
        if (activeEnrollments.length > 0) {
          const lastActive = activeEnrollments[activeEnrollments.length - 1];

          academicPeriodEnrollment.value = lastActive;
          academicPeriodId.value = lastActive.academicPeriodId;
        }
      }

      academicPeriodId.value && getOffensesSummary(academicPeriodId.value);

      loading.value = false;
    });

    watch(academicPeriodId, async (value) => {
      if (academicPeriodEnrollment.value && value !== academicPeriodEnrollment.value.academicPeriodId) {
        academicPeriodEnrollment.value = data.value.academicPeriodEnrollments.find((item: any) => item.academicPeriodId === value);
        value && getOffensesSummary(value);
      }
    });

    const getOffensesSummary = async (academicPeriodId: number) => {
      loadingInfo.value = true;

      offensesSummary.value = await getStudentOffensesSummaryService.run(userId, { academicPeriodId });

      loadingInfo.value = false;
    };

    const generateDocument = async (data: any) => {
      try {
        const response = await generateDocumentoDisciplinaryOffenseService.run(data.disciplinaryOffenseId);

        window.open(response.file, '_blank');
      } catch (e) {
        console.log(e);
      }
    };

    const toggleDrawer = (data: any = null) => {
      disciplinaryOffense.value = data;

      isVisibleDrawer.value = !isVisibleDrawer.value;
    };

    const openSendMailModalModal = (data: any) => {
      disciplinaryOffense.value = data;
      sendMailModal.value = true;
    };
    const closeSendMailModalModal = async () => {
      sendMailModal.value = false;
      disciplinaryOffense.value.academicPeriodId && getOffensesSummary(disciplinaryOffense.value.academicPeriodId);
    };

    const openConfirmDelete = async (data: any) => {
      disciplinaryOffense.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteDisciplinaryOffensesService.run(disciplinaryOffense.value.disciplinaryOffenseId);
      modalDelete.value = false;

      disciplinaryOffense.value.academicPeriodId && getOffensesSummary(disciplinaryOffense.value.academicPeriodId);
    };

    const goToSectionForm = async (section: any) => {
      currentSectionForm.value = section;
      console.log('🚀 ~ goToSectionForm ~ currentSectionForm.value:', currentSectionForm.value);
    };
    const generateGeneralReport = async (student: any) => {
      try {
        const response = await generateObserverReportByMatriculateService.run({
          userId: data.value.academicPeriodEnrollments[0].matriculateId, // asegúrate de usar el campo correcto
          itemCode: 'reports.discipline.observer',
        });
        reportId.value = response.reportId;
        console.log('Reporte general generado:', response);
      } catch (e) {
        console.error(e);
      }
    };
    const getFilterReports = () => {
      return {
        academicPeriodId: data.value.academicPeriodEnrollments[0].academicPeriodId,
        levelId: data.value.academicPeriodEnrollments[0].levelId,
        degreeId: data.value.academicPeriodEnrollments[0].degreeId,
        groupId: data.value.academicPeriodEnrollments[0].groupId,
        convertTo: 'pdf',
        itemCode: 'reports.discipline.observer',
      };
    };
    const sendGeneralMail = async (studentId: number) => {
      const matriculateId = data.value.academicPeriodEnrollments[0].matriculateId;
      try {
        filtersAux.value = {
          ...getFilterReports(),
          matriculateId,
        };
        sendMailObserverModal.value = true;
        console.log('Enviar por email reporte general del estudiante con id:', studentId);
      } catch (e) {
        console.error(e);
      }
    };

    const closeSendMailModal = () => {
      sendMailObserverModal.value = false;
    };
    return {
      routes,
      title,
      dayjs,
      data,
      t,
      isVisibleDrawer,
      sendMailModal,
      loadingInfo,
      modalDelete,
      loading,

      academicPeriodEnrollment,
      disciplinaryOffense,
      currentSectionForm,
      academicPeriodId,
      offensesSummary,
      sectionsForm,
      userId,

      closeSendMailModalModal,
      openSendMailModalModal,
      getOffensesSummary,
      openConfirmDelete,
      generateDocument,
      goToSectionForm,
      confirmDelete,
      toggleDrawer,
      academicPeriods,

      generateGeneralReport,
      sendGeneralMail,
      reportId,
      closeSendMailModal,
      filtersAux,
      sendMailObserverModal,
    };
  },
});
</script>

<style scoped>
/* observation-card-custom */
.observation-card-custom {
  background: #fff;
  border-radius: 8px;
  box-shadow: -2px 5px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  overflow: hidden;
  border: 1px solid #ccc;
  display: flex;
  align-items: stretch;
}
.observation-card-custom .level-offense {
  background: #9ede94;
  min-width: 150px;
  padding: 10px;
  order: -1; /* —> mueve el nivel al inicio (izq / arriba en móvil) */
  align-self: stretch; /* ocupa la altura completa del contenido */
  display: flex;
}
.observation-card-custom .offense-actions {
  background: #f4f4f4;
  padding: 5px 10px;
  gap: 10px;
}
.observation-card-custom .is-sent {
  font-size: 14px;
}
/* end observation-card-custom */

.cards-dashboard-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}
.cards-dashboard-container::-webkit-scrollbar {
  height: 6px;
}
.cards-dashboard-container::-webkit-scrollbar-track {
  background: transparent;
}
.cards-dashboard-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 6px;
}
.container-custom-card {
  min-width: 280px;
  flex: 0 0 auto;
  background: #9ede94;
  box-shadow: 1px 2px 6px 0px rgba(0, 0, 0, 0.4);
}
.card-graph {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.container-custom-card :deep(.container-icon) {
  width: 45px;
  height: 45px;
}

/* obcerbations */
.observation-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}
.observation-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}
.teacher-info {
  display: flex;
  gap: 0.5rem;
}
.status-tag {
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  background-color: #fee2e2;
  color: #991b1b;
}
.status-tag.Enviado {
  background-color: #e8f5e9;
  color: #1b5e20;
}
.observation-content {
  padding: 1rem;
}
.observation-field {
  margin-bottom: 0.75rem;
}
.label {
  font-weight: 600;
  color: #374151;
  margin-right: 0.5rem;
}
.value {
  color: #6b7280;
}
.observation-footer {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
}
.date {
  color: #6b7280;
  font-size: 0.875rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 4px;
  transition: all 0.2s;
}
.action-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}
/* end obcerbations */

.disabled {
  pointer-events: none;
  cursor: not-allowed;
  background-color: #dedede !important;
}

.disabledSelect {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6 !important;
  border-color: #d1dbe5;
}
.container-form-nav {
  /*background-color: #fff;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  margin-bottom: 10px;
  */

  background-color: #fff;
  box-shadow: 0px 0px 15px rgba(38, 45, 118, 0.15); /*0px 10px 60px rgba(38, 45, 118, 0.08);*/
  border-radius: 20px;
  margin-bottom: 15px;
}
.cards-form-form {
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.18);
  border-radius: 20px;
}
.cards-no-border {
  border: none !important;
  border-radius: 20px;
}
.content-form-info-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  background-color: var(--color-primary);
  padding: 17px 24px;
  border-top-left-radius: 20px; /*4px 4px*/
  border-top-right-radius: 20px;
  /*align-items: flex-end;*/
}
.personal-info-nav {
  display: flex;
  flex-direction: column;
  margin-left: 130px;
}
.academy-info-nav {
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.academy-info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.academy-info-nav hr {
  height: 80px;
  width: 1.5px;
  background-color: #fff;
  margin: 0 14px;
  opacity: 1;
}
.text-title-form-nav {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.3px;
}
.student-info-nav {
  display: flex;
  align-items: center;
}
.state-tag {
  font-size: 12px;
  padding: 1px 12px;
  border-radius: 10px;
  margin-left: 6px;
  border: 2px solid #fff;
  background-color: gray;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  color: #fff;
  background-color: black;
  letter-spacing: 0.3px;
}
.state-active {
  background-color: #00b74a;
}
.state-inactive {
  background-color: #9b9b9b;
}
.state-retired {
  background-color: #fcce01;
}
.content-form-nav {
  display: flex;
  padding: 27px 24px 0px 24px;
  /*new*/
  border: 5px solid var(--color-primary);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.form-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.contetn-avatar-form-nav {
  height: 0px;
}
.avatar-form-nav {
  transform: translate(0px, -100px);
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
  background-color: #ffffff;
}
.avatar-shadow {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
}
.avatar-nav {
  width: 120px;
  height: 120px;
}

.form-navigation button {
  background-color: transparent;
  color: gray;
  border: none;
  border-radius: 0;
  margin-bottom: 12px;
}
.form-navigation button:hover {
  background-color: transparent;
  color: gray;
  border-bottom: 3px solid gray;
}
.form-navigation button.active {
  background-color: transparent;
  color: black;
  border-bottom: 3px solid black;
  box-shadow: 0px 8px 8px -7px rgba(0, 0, 0, 0.3);
}
:deep(.form-navigation button .o-btn__label) {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.form-navigation .icon-form-nav {
  width: 34px;
  height: 26px;
}
.form-navigation .text-form-nav {
  display: block;
}
.content-cards-form {
  display: flex;
  flex-direction: row;
  gap: 15px;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.avatar-circle-form {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 2px solid rgb(180, 180, 180);
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 0 0 7px #ffffff, /* El borde medio, más ancho */ 0 0 0 8.5px rgb(190, 190, 190), /*Borde exterior*/ 0 8px 12px rgba(0, 0, 0, 0.5); /*sombra*/
  margin-bottom: 15px;
}
.avatar-form-form {
  width: 100%;
  height: 100%;
}

.text-info-type {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: gray;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
  justify-content: center;
  padding: 10px 4px;
}
.cards-tutor-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.content-status-end {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 6px 8px 0px 0px;
}
.card-tutor-name {
  text-align: center;
  padding: 1px 8px;
}
.footer-card-tutor {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 2px 10px;
  background: rgba(182, 182, 182, 0.15);
  border-bottom-left-radius: 19px;
  border-bottom-right-radius: 19px;
  border-top: 2px solid rgba(0, 0, 0, 0.02);
  margin-top: auto;
}
.scroll {
  max-height: 100vh;
  overflow-y: auto;
}
.container-card-history {
  gap: 15px;
  display: flex;
  flex-direction: column;
}

.card-header-color {
  height: 12px;
  width: 100%;
  /* background-color: #007bff; /* Color superior */
  border-top-left-radius: 13px;
  border-top-right-radius: 13px;
}
.title-degree {
  font-size: 40px;
  font-weight: bold;
  color: #2c3e50;
}
.subtitle-level {
  font-size: 24px;
  color: #7f8c8d;
  font-weight: normal;
}
.cards-form-history {
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.18);
  border-radius: 14px;
}
.item-card-history {
  text-align: center;
  padding: 4px 12px 0px 12px;
}
.footer-card-history {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 0px 12px;
  width: 100%;
  margin-top: auto;
}
:deep(.avatar-form-form div) {
  font-size: 2rem;
}
.action-button-form {
  display: flex;
  justify-content: flex-end;
}
/* ——— RESPONSIVE ——— */
@media (max-width: 600px) {
  .contentSpan {
    display: flex;
    flex-direction: column;
  }
  .observation-card-custom {
    display: flex;
    flex-direction: column;
  }
}
@media (max-width: 768px) {
  .academy-info-nav {
    flex-direction: column;
  }
  .content-form-nav {
    flex-direction: column;
  }
  .content-form-info-nav {
    flex-direction: column;
  }
  .personal-info-nav {
    text-align: center;
  }
  .student-info-nav {
    flex-direction: column;
  }
  .contetn-avatar-form-nav {
    height: 0px;
    display: flex;
    justify-content: center;
    margin-bottom: 58px;
  }
  .form-navigation .text-form-nav {
    max-width: 80px;
    min-width: 80px;
  }
  .contentControlDisciplinary {
    display: flex;
    flex-direction: column;
  }
}
@media (max-width: 1024px) {
  .content-form-info-nav {
    padding-bottom: 54px;
    gap: 10px;
  }
  .personal-info-nav {
    margin-left: 0px;
  }
  .academy-info-nav hr {
    display: none;
  }
  .avatar-form-nav {
    transform: translate(0px, -80px);
  }
  .content-cards-form {
    flex-direction: column;
  }
}
.contentControlDisciplinary {
  display: flex;
}
.container-academic-periods {
  max-width: 200px;
  min-width: 150px;
  font-size: 20px;
}
.container-academic-periods :deep(.v-select) {
  background-color: var(--color-light);
  border-radius: var(--border-radius-1);
}

/* ——— Móvil: <500px ——— */
@media (max-width: 500px) {
  .cards-dashboard-container {
    flex-direction: column; /* filas -> columna */
    align-items: stretch; /* que ocupen el ancho disponible */
    overflow-x: hidden; /* ya no necesitamos scroll horizontal */
    padding: 0.75rem; /* un poco más compacto en móvil (opcional) */
    gap: 0.75rem; /* separaciones más cortas (opcional) */
  }
}
/* ——— Móvil: >500px ——— */
@media (min-width: 500px) {
  .container-custom-card {
    min-width: 220px; /* lo que pediste */
    width: 100%; /* que se estire al ancho del contenedor */
    flex: 1 1 auto; /* que pueda crecer/encogerse en columna */
  }
}
/* ——— Fila superior: avatar alineado con nombre ——— */
.contentRow {
  display: flex;
  gap: 0.75rem;
}
.teacher-row {
  display: flex;
  align-items: center; /* alinea verticalmente avatar y texto */
  gap: 0.75rem;
  min-width: 0; /* para buen truncamiento en pantallas pequeñas */
}
.avatar-cell {
  flex: 0 0 auto;
}
.teacher-text {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.top-right {
  gap: 0.5rem;
}
/* ——— Responsive ——— */
@media (max-width: 900px) {
  .observation-card-custom {
    flex-direction: column;
  }
  .observation-card-custom .level-offense {
    order: -1; /* sigue “primero”, ahora arriba */
    min-width: 100%;
    border-bottom: 1px solid #e5e7eb;
  }
  .contentRow {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .top-right {
    align-self: stretch;
    justify-content: space-between;
  }
}

@media (max-width: 600px) {
  .teacher-row {
    width: 100%;
  }
}
</style>
