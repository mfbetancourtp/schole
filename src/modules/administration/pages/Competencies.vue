<template>
  <AppBaseList :title="title" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'administration.homeTeacher' }"></AppButtonBack>
    </template>
    <template #content>
      <TabsTeacher></TabsTeacher>

      <AppPulseLoading v-if="loading"></AppPulseLoading>

      <div style="background-color: rgb(255, 255, 255); box-shadow: rgba(0, 0, 0, 0.45) 1px 2px 6px; height: calc(-251px + 100vh)">
        <AppVerticalStepper :showFinishBtn="false" :showFooter="false" @changeStep="selectedPeriod">
          <AppVerticalStep v-for="(period, index) in periods" :key="index" :name="period.name" :id="period.id">
            <AppCheckPermission permission="classroom.competencies.create">
              <div class="grid-cards">
                <AppButtonNewContainer :text="'Crear competencia'" @click="toggleDrawerCreate()"></AppButtonNewContainer>

                <AppDrawer :isVisible="showDrawerCreate" @update:isVisible="toggleDrawerCreate">
                  <template #head>
                    <span class="title-form">{{ t(title) }} </span>
                  </template>
                  <template #body>
                    <AppPulseLoading v-if="loading"></AppPulseLoading>
                    <template v-else>
                      <div class="section-form" style="position: sticky; top: 0; z-index: 2">
                        <div class="section-content">
                          <button
                            :class="{
                              selected: activeSection === 'competencias',
                            }"
                            @click="setActive('competencias')"
                          >
                            Competencia
                          </button>
                          <button :class="{ selected: activeSection === 'general' }" @click="setActive('general')">Información General</button>
                        </div>
                      </div>
                      <div class="content-form">
                        <div v-if="activeSection === 'competencias'" class="form-section">
                          <AppFormField :form-control="v$.form.planName" :label="'classroom.competence.planName'">
                            <input
                              v-model="v$.form.planName.$model"
                              class="form-control"
                              type="text"
                              id="name"
                              pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                              title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                            />
                          </AppFormField>
                          <AppFormField :form-control="v$.form.code" :label="'classroom.competence.form.code'">
                            <input
                              v-model="v$.form.code.$model"
                              class="form-control"
                              type="text"
                              id="name"
                              pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                              title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                            />
                          </AppFormField>
                          <AppFormField v-if="courseData?.percentageCompetencies === 1" :form-control="v$.form.percentage" :label="'classroom.competence.form.percentage'">
                            <input type="number" class="form-control" v-model="v$.form.percentage.$model" />
                          </AppFormField>

                          <AppFormField :form-control="v$.form.description" :label="'classroom.competence.form.description'">
                            <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" :cols="40" :rows="3" id="description"></AppVoiceInput>
                          </AppFormField>
                        </div>
                        <div v-if="activeSection === 'general'" class="form-section">
                          <AppFormField :form-control="v$.form.standard" :label="'classroom.competence.standard'">
                            <AppVoiceInput v-model="v$.form.standard.$model" textareaClass="form-control" :cols="40" :rows="3" id="standard"></AppVoiceInput>
                          </AppFormField>
                          <AppFormField :form-control="v$.form.dba" :label="'classroom.competence.dba'">
                            <AppVoiceInput v-model="v$.form.dba.$model" textareaClass="form-control" :cols="40" :rows="3" id="dba"></AppVoiceInput>
                          </AppFormField>
                          <AppFormField :form-control="v$.form.learning" :label="'classroom.competence.learning'">
                            <AppVoiceInput v-model="v$.form.learning.$model" textareaClass="form-control" :cols="40" :rows="3" id="learning"></AppVoiceInput>
                          </AppFormField>
                          <AppFormField :form-control="v$.form.evidence" :label="'classroom.competence.evidence'">
                            <AppVoiceInput v-model="v$.form.evidence.$model" textareaClass="form-control" :cols="40" :rows="3" id="evidence"></AppVoiceInput>
                          </AppFormField>
                          <AppFormField :form-control="v$.form.purposes" :label="'classroom.competence.purposes'">
                            <AppVoiceInput v-model="v$.form.purposes.$model" textareaClass="form-control" :cols="40" :rows="3" id="purposes"></AppVoiceInput>
                          </AppFormField>
                          <AppFormField :form-control="v$.form.components" :label="'classroom.competence.components'">
                            <AppVoiceInput v-model="v$.form.components.$model" textareaClass="form-control" :cols="40" :rows="3" id="components"></AppVoiceInput>
                          </AppFormField>
                        </div>
                      </div>
                    </template>
                  </template>
                  <template #footer>
                    <div class="buttons-form">
                      <div v-if="activeSection === 'competencias'">
                        <AppButton @click="nextSection">Siguiente</AppButton>
                      </div>
                      <div v-if="activeSection === 'general'">
                        <AppButton @click="save()" label="core.save"></AppButton>
                      </div>
                    </div>
                  </template>
                </AppDrawer>
              </div>
            </AppCheckPermission>

            <AppEmptyResponse v-if="!competences.length" :size="'xs'"></AppEmptyResponse>

            <section class="item-card" v-else v-for="(competence, competenceIndex) in competences" :key="competenceIndex">
              <AppCard>
                <template #title>
                  <div>{{ competence.description }}</div>
                </template>
                <template #body>
                  <AppAccordion v-slot="{ accordionId }">
                    <AppAccordionItem class="mb-0" :accordion-id="accordionId">
                      <template v-slot:head>
                        <p class="title">Información General</p>
                      </template>
                      <template v-slot:content>
                        <div class="table-responsive w-100">
                          <table class="content-table">
                            <thead>
                              <tr>
                                <th>DESCRIPCIÓN</th>
                                <th class="d-flex justify-content-center">OPCIONES</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <div>
                                    <strong>Nombre:</strong>
                                    {{ competence.description }}
                                  </div>
                                  <div v-if="courseData?.percentageCompetencies === 1">
                                    <strong>Porcentaje:</strong>
                                    {{ competence.percentage }}
                                  </div>
                                  <div>
                                    <strong>Estándar:</strong>
                                    {{ competence.standard }}
                                  </div>
                                  <div><strong>DBA:</strong> {{ competence.dba }}</div>
                                  <div>
                                    <strong>Aprendizaje:</strong>
                                    {{ competence.learning }}
                                  </div>
                                  <div>
                                    <strong>Evidencias de aprendizaje:</strong>
                                    {{ competence.evidence }}
                                  </div>
                                  <div>
                                    <strong>Propósitos:</strong>
                                    {{ competence.purposes }}
                                  </div>
                                  <div>
                                    <strong>Componentes y/o pensamientos:</strong>
                                    {{ competence.components }}
                                  </div>
                                </td>
                                <td class="opciones text-center">
                                  <AppButtonGroup>
                                    <AppCheckPermission permission="classroom.competencies.edit">
                                      <AppButtonEdit @click="toggleDrawerCreate(competence)"></AppButtonEdit>
                                    </AppCheckPermission>
                                    <AppCheckPermission permission="classroom.competencies.delete">
                                      <AppButtonDelete :disabled="competence.cant_LearningOutcomes || competence.cant_topics" @click="openConfirmDeleteCompetence(competence)"></AppButtonDelete>
                                    </AppCheckPermission>
                                  </AppButtonGroup>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </template>
                    </AppAccordionItem>
                  </AppAccordion>

                  <AppAccordion v-slot="{ accordionId }">
                    <AppAccordionItem class="mb-0" :accordion-id="accordionId">
                      <template v-slot:head>
                        <div class="header">
                          <p class="title">Desempeños</p>
                          <div class="d-flex gap-4">
                            <AppCheckPermission permission="classroom.competencies.create">
                              <AppButton
                                @click.stop="
                                  openPerformancesModal({
                                    competencyId: competence.id,
                                  })
                                "
                                icon="plus"
                              >
                              </AppButton>
                            </AppCheckPermission>
                          </div>
                        </div>
                      </template>
                      <template v-slot:content>
                        <div class="table-responsive w-100">
                          <AppEmptyResponse v-if="!competence?.learningOutcomes.length" :show-image="true"> </AppEmptyResponse>
                          <table v-else class="content-table">
                            <thead>
                              <tr>
                                <th>DESCRIPCIÓN</th>
                                <th class="d-flex justify-content-center">OPCIONES</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(outcome, index) in competence?.learningOutcomes" :key="index">
                                <td>
                                  <p>{{ outcome.description }}</p>
                                </td>
                                <td class="opciones text-center">
                                  <AppButtonGroup>
                                    <AppCheckPermission permission="classroom.competencies.edit">
                                      <AppButtonEdit @click="openPerformancesModal(outcome)"></AppButtonEdit>
                                    </AppCheckPermission>
                                    <AppCheckPermission permission="classroom.competencies.delete">
                                      <AppButtonDelete @click="openConfirmDelete(outcome)"></AppButtonDelete>
                                    </AppCheckPermission>
                                  </AppButtonGroup>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </template>
                    </AppAccordionItem>
                  </AppAccordion>
                  <hr />
                  <AppButtonGroup class="d-flex justify-content-end">
                    <AppCheckPermission permission="classroom.competencies.edit">
                      <AppButtonEdit @click="toggleDrawerCreate(competence)"></AppButtonEdit>
                    </AppCheckPermission>
                    <AppCheckPermission permission="classroom.competencies.delete">
                      <AppButtonDelete :disabled="competence.cant_LearningOutcomes || competence.cant_topics" @click="openConfirmDeleteCompetence(competence)"></AppButtonDelete>
                    </AppCheckPermission>
                  </AppButtonGroup>
                </template>
              </AppCard>
            </section>

            <div class="d-flex mt-3 justify-content-end">
              <AppButton label="Descargar" @click="downloadReport"></AppButton>
            </div>
          </AppVerticalStep>
        </AppVerticalStepper>
      </div>
      <PerfomanceDrawerForm
        v-if="performanceModal"
        v-model:isVisible="performanceModal"
        @reload-data="getListCompetences"
        :data="performanceData"
        :courseData="courseData"
        :competenceLevels="competenceLevels"
      ></PerfomanceDrawerForm>
      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Desempeño" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
      </AppModal>
      <AppModal v-model="modalDeleteCompetence">
        <template v-if="modalDeleteCompetence">
          <AppConfirmDeleteModal entity="classroom.competence.singular" @confirmDelete="confirmDeleteCompetence"> </AppConfirmDeleteModal>
        </template>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';

import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { useHeaderStore } from '../../../stores/header.store';
import TabsTeacher from '../components/TabsTeacher.vue';
import { DetailedCompetenceDto, LearningOutcomeDto } from '../dtos/competency.dto';
import { LevelDto } from '../dtos/homeTeacherCourses.dto';
import { CompetencyLevelDto } from '../../institutionalConfiguration/dtos/competencyLevel.dto';
import { PeriodDto } from '../dtos/followUpToTopics.dto';

import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppVerticalStepper from '../../../shared/components/VerticalStepper/AppVerticalStepper.vue';
import AppVerticalStep from '../../../shared/components/VerticalStepper/AppVerticalStep.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import useVuelidate from '@vuelidate/core';
import PerfomanceDrawerForm from '../components/PerfomanceDrawerForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { GetListCompetencesService } from '../services/getListCompetences.service';
import { GetSubjectAssignmentsService } from '../../academicPlanning/services/getSubjectAssignments.service';
import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetCompetenceByIdService } from '../services/getCompetenceById.service';
import { GetActivitiesSummaryService } from '../services/getActivitiesSummary.service';
import { CreateOrUpdateCompetenciesService } from '../services/createOrUpdateCompetencies.service';
import { GetCompetencyLevelsService } from '../../institutionalConfiguration/services/getCompetencyLevels.service';
import { DeleteLearningOutComesService } from '../services/deleteLearningOutComes.service';
import { DeleteCompetencieService } from '../services/deleteCompetencie.service';
import { GetLearningPlanReportService } from '../services/getLearningPlanReport.service';

const getSubjectAssignmentsService = new GetSubjectAssignmentsService();
const getListCompetencesService = new GetListCompetencesService();
const getCourseByIdService = new GetCourseByIdService();
const getCompetenceByIdService = new GetCompetenceByIdService();
const getActivitiesSummaryService = new GetActivitiesSummaryService();
const createOrUpdateCompetenciesService = new CreateOrUpdateCompetenciesService();
const getCompetencyLevelsService = new GetCompetencyLevelsService();
const getLearningPlanReportService = new GetLearningPlanReportService();

const deleteLearningOutComesService = new DeleteLearningOutComesService();
const deleteCompetencieService = new DeleteCompetencieService();

export default defineComponent({
  name: 'SubjectsStudyPlan',
  components: {
    AppButton,
    AppModal,
    AppBaseList,
    AppAccordion,
    AppButtonBack,
    AppButtonDelete,
    AppEmptyResponse,
    AppAccordionItem,
    AppCheckPermission,
    AppConfirmDeleteModal,
    AppCard,
    TabsTeacher,
    AppButtonGroup,
    AppButtonEdit,
    AppVerticalStepper,
    AppVerticalStep,
    AppButtonNewContainer,
    AppDrawer,
    AppFormField,
    PerfomanceDrawerForm,
    AppPulseLoading,
    AppVoiceInput,
  },

  setup() {
    const { t } = useI18n();

    const route = useRoute();
    const title = t('classroom.competence.title');
    const subtitle = ref('');
    const courseId = parseInt(route.params.courseId.toString(), 10);
    const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId.toString(), 10);

    const competences: Ref<DetailedCompetenceDto[]> = ref([]);
    const curriculumSubject = ref<any>({});
    const level: Ref<LevelDto | null> = ref(null);
    const learningOutcomes: { value: LearningOutcomeDto[] | any } = reactive({
      value: [],
    });
    const periods: Ref<PeriodDto[]> = ref([]);
    const courseData = ref<any>({});
    const periodIdSelected = ref();

    const curriculumSubjectId = ref();

    const performanceData = ref();
    const competenciesId = ref();
    const performanceModal = ref(false);

    const showDrawerCreate = ref(false);

    const sections = ['competencias', 'general'];
    const activeSection = ref('competencias');

    const loading = ref(true);
    const loadingLearningOutcomes = ref(false);

    const competenceLevels = ref<CompetencyLevelDto[]>([]);
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const modalDelete = ref(false);

    const currentCompetenceId = ref();
    const modalDeleteCompetence = ref(false);

    const setActive = (section: string) => {
      activeSection.value = section;
    };
    const nextSection = () => {
      const currentIndex = sections.indexOf(activeSection.value);
      const nextIndex = (currentIndex + 1) % sections.length;
      activeSection.value = sections[nextIndex];
    };
    const form: any = reactive({
      id: null,
      standard: null,
      dba: null,
      learning: null,
      evidence: null,
      purposes: null,
      components: null,
      planName: null,
      code: null,
      percentage: null,
      description: null,
      periodId: null,
      courseId: courseId,
      curriculumSubjectId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          standard: {},
          dba: {},
          learning: {},
          evidence: {},
          purposes: {},
          components: {},
          planName: { required },
          code: { required },
          description: { required },
          periodId: {},
          courseId: {},
          curriculumSubjectId: {},
          percentage: {
            requiredIf: requiredIf(() => {
              return courseData.value?.percentageCompetencies === 1;
            }),
          },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const course = await getCourseByIdService.run(courseId);
        subtitle.value = course.name;
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        let resp = await getSubjectAssignmentsService.run(academicPeriodGroupId);
        resp.forEach((subjectAssignment: any) => {
          if (subjectAssignment.id === course.subjectAssignmentId) {
            curriculumSubjectId.value = subjectAssignment.curriculumSubjectId;
            form.curriculumSubjectId = subjectAssignment.curriculumSubjectId;
          }
        });
        const activitiesSummary = await getActivitiesSummaryService.run(courseId);

        periods.value = activitiesSummary.periods;
        courseData.value = activitiesSummary?.courseData?.level;

        periodIdSelected.value = periods.value[0].id;
        form.periodId = periodIdSelected.value;

        await getListCompetences();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });
    const selectedPeriod = async (item: any) => {
      periodIdSelected.value = item;
      form.periodId = item;
      await getListCompetences();
    };
    const getListCompetences = async () => {
      loading.value = true;
      try {
        const response: any = await getListCompetencesService.run(curriculumSubjectId.value, periodIdSelected.value);
        (competences.value = response.competencies), (curriculumSubject.value = response.curriculumSubject);
      } catch (e) {
        console.log('error', e);

        loading.value = false;
      }
      loading.value = false;
    };
    const getLearningOutcomes = async (competenceId: number) => {
      loadingLearningOutcomes.value = true;
      try {
        let res = await getCompetenceByIdService.run(competenceId);
        learningOutcomes.value = res.LearningOutcomes;
      } catch (e) {
        console.log('error', e);
      }
      loadingLearningOutcomes.value = false;
    };
    const toggleDrawerCreate = async (data: any | null = null) => {
      activeSection.value = 'competencias';
      showDrawerCreate.value = !showDrawerCreate.value;
      if (data) {
        form.id = data.id;
        form.standard = data.standard;
        form.dba = data.dba;
        form.learning = data.learning;
        form.evidence = data.evidence;
        form.purposes = data.purposes;
        form.components = data.components;
        form.planName = data.planName;
        form.code = data.code;
        form.percentage = data.percentage;
        form.description = data.description;
        form.periodId = data.periodId;
      } else {
        form.id = null;
        form.standard = null;
        form.dba = null;
        form.learning = null;
        form.evidence = null;
        form.purposes = null;
        form.components = null;
        form.planName = null;
        form.code = null;
        form.description = null;
        form.percentage = null;
      }
    };

    const openPerformancesModal = async (data: any | null = null) => {
      loading.value = true;

      performanceData.value = data;
      competenceLevels.value = await getCompetencyLevelsService.run();

      loading.value = false;
      performanceModal.value = true;
    };

    const save = async (/*goBack: any*/) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        await createOrUpdateCompetenciesService.run(form, form?.id);
        //goBack = router.go(-1);
        v$.value.$reset();

        showDrawerCreate.value = !showDrawerCreate.value; // Cambia el estado de visibilidad
        activeSection.value = 'competencias';
        getListCompetences();
      } catch (e) {
        console.log(e);
      }
    };

    const openConfirmDelete = async (data: any) => {
      currentDataDelete.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteLearningOutComesService.run(currentDataDelete.value.id);
      modalDelete.value = false;

      await getListCompetences();
    };

    const openConfirmDeleteCompetence = async (competence: DetailedCompetenceDto) => {
      currentCompetenceId.value = competence.id;

      modalDeleteCompetence.value = true;
    };
    const confirmDeleteCompetence = async () => {
      if (currentCompetenceId.value) {
        await deleteCompetencieService.run(currentCompetenceId.value);

        currentCompetenceId.value = null;
      }

      await getListCompetences();

      modalDeleteCompetence.value = false;
    };

    const downloadReport = async () => {
      try {
        const academicPeriodId = periods.value.find((p) => p.id === periodIdSelected.value)?.academicPeriodId;
        const degreeId = curriculumSubject.value?.degreeId;
        const subjectId = curriculumSubject.value?.subjectId;
        const response: any = await getLearningPlanReportService.run(academicPeriodId, courseData.value.id, periodIdSelected.value, degreeId, subjectId);

        console.log('URL del reporte:', response); // 👈 Verifica esto en la consola

        if (response?.url) {
          window.open(response.url, '_blank');
        } else {
          console.error('No se encontró la URL en la respuesta');
        }
      } catch (error) {
        console.error('Error al redirigir al reporte:', error);
      }
    };

    return {
      subtitle,
      loading,
      title,
      v$,
      t,
      save,
      competences,
      level,
      getLearningOutcomes,
      learningOutcomes,
      loadingLearningOutcomes,
      periods,
      courseData,
      toggleDrawerCreate,
      showDrawerCreate,
      sections,
      activeSection,
      setActive,
      nextSection,
      openPerformancesModal,
      competenceLevels,
      performanceData,
      performanceModal,
      getListCompetences,
      openConfirmDelete,
      confirmDelete,
      modalDelete,
      openConfirmDeleteCompetence,
      confirmDeleteCompetence,
      modalDeleteCompetence,
      periodIdSelected,
      selectedPeriod,
      getLearningPlanReportService,
      downloadReport,
    };
  },
});
</script>

<style scoped>
.w-10 {
  width: 10% !important;
}

.item-card {
  margin-bottom: 15px;
}

.content-scales {
  width: 70%;
}
.container-subjects {
  gap: 20px;
}
.max-subjects {
  width: 100%;
}
@media (max-width: 650px) {
  .container-subjects {
    display: flex;
    flex-direction: column;
  }
  .max-subjects {
    width: 100%;
  }
  .use-scale {
    width: 100% !important;
    display: flex;
    justify-content: flex-start !important;
  }
}
.content-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  border: 1px solid #ccc;
}

.content-table th,
.content-table td {
  padding: 0.75rem;
}
.content-table td {
  border-bottom: 1px solid #ccc;
}

.content-table thead {
  background-color: #f5f5f5;
}

.title-form {
  margin-left: auto;
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
}
.section-content {
  min-height: 38px;
  background-color: #f4f6f8;
  padding: 10px 8px;
  display: flex;
}

.section-content button {
  padding: 8px 0px;

  /*margin-right: 10px;
  border: 1px solid #ccc;
  background-color: white;*/
  cursor: pointer;
  border-radius: 12px;
  flex: 1 1 0px;
  color: #8d8d8d;
  transition: all 0.55s ease;
  font-size: 0.875rem;
  /*font-weight: bold;*/
  letter-spacing: 0.2px;
  transform: translatey(0);
}

.section-content button.selected {
  background-color: var(--color-primary);
  color: #fff;
  border-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translatey(-2px);
  font-weight: bold;
}
.content-form {
  padding: 20px;
  /* max-height: 76vh;*/
  overflow-y: auto;
}
.mb-0 {
  margin-bottom: 0 !important;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  margin-bottom: 15px;
}
.title {
  display: flex;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
  line-height: 28px;
  color: #2e3135;
  border-radius: 4px;
}
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  width: 95%;
}
</style>
