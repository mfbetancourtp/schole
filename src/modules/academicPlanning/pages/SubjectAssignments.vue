<template>
  <AppBaseList>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'academicPlanning.academicOffer' }"></AppButtonBack>

      <AppCheckPermission permission="academicPlanning.subjectAssignments.create">
        <AppButton style="color: white;" label="core.new" @click="openNewAssignmentModal(null)"></AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppEmptyResponse v-if="empty" :show-image="true"></AppEmptyResponse>
        <div class="grid-cards">
          <AppCard v-for="item in dataCards.value" :key="item.id">
            <template #title>
              <div>{{ item.curriculumSubject?.subject.name }}</div>
            </template>

            <template #body>
              <h6 class="card-title mb-0">Profesor</h6>
              <div class="d-flex align-items-center" style="color: #6c757d">
                <AppIcon class="icon-size-8 m-1" icon="graduation-cap"></AppIcon>

                <p class="m-0" style="font-size: 0.9rem">
                  {{ item.teacherPeople?.names }}
                  {{ item.teacherPeople?.lastnames }}
                </p>
              </div>

              <div class="d-flex align-items-center flex-wrap" style="color: #6c757d">
  <AppIcon class="icon-size-8 m-1" icon="envelope"></AppIcon>
  <p class="m-0 ps-1" style="font-size: 0.9rem; word-break: break-word;">
    {{ item.teacherPeople?.email }}
  </p>
</div>

            </template>

            <template #footer>
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex gap-2">
                  <AppButtonGroup size="sm">
                    <AppCheckPermission permission="academicPlanning.subjectAssignments.edit">
                      <AppButton :to="{
                        name: 'academicPlanning.subjectAssignments.schedule',
                        params: { userId: item.teacherPeople.userId },
                        query: { academicPeriodId: academicPeriodId },
                      }" v-tooltip="'Configurar Horario'" icon="calendar-minus" outlined></AppButton>
                    </AppCheckPermission>
                  </AppButtonGroup>

                  <AppCheckPermission permission="academicPlanning.subjectAssignments.edit">
                    <AppDropdown>
                      <template v-slot:button>
                        <AppButton v-tooltip="'academicPlanning.subjectAssignments.sync'" icon="sync" outlined
                          :size="'sm'"></AppButton>
                      </template>

                      <template v-slot:items>
                        <li>
                          <span class="dropdown-item pointer" @click="copyInTheClassroom(item.id)">Copiar a
                            Classroom</span>
                        </li>
                        <li>
                          <span class="dropdown-item pointer"
                            @click="openCustomizeSynchronizationModal(item.id)">Personalizar sincronización</span>
                        </li>
                      </template>
                    </AppDropdown>
                  </AppCheckPermission>
                </div>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="academicPlanning.subjectAssignments.edit">
                    <AppButtonEdit @click="openNewAssignmentModal(item)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="academicPlanning.subjectAssignments.delete">
                    <AppButtonDelete @click="openConfirmDelete(item)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>

        <AppModal v-model="assignmentModal">
          <SubjectsAssignmentsForm v-if="assignmentModal" :current-academic-period-group-id="currentAcademicPeriodGroupId"
            :related-data-form="relatedDataForm.value" :subject="subject.value" @close="closeNewAssignmentModal">
          </SubjectsAssignmentsForm>
        </AppModal>

        <AppModal v-model="customizeSynchronizationModal" :size="'lg'">
          <CustomizeSynchronization
            v-if="customizeSynchronizationModal"
            :data="dataCards"
            :subject-assignment-id="subjectAssignmentId"
            @close="CloseCustomizeSynchronizationModal"
          ></CustomizeSynchronization>
        </AppModal>

        <AppModal v-model="synchronizationReportModal" :size="'xl'">
          <SynchronizationReport v-if="synchronizationReportModal" :data="currentData.value"></SynchronizationReport>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="core.generalTerms.academic.subjectAssignment.singular"
            @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDropdown from '../../../shared/components/AppDropdown.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import SynchronizationReport from '../components/SynchronizationReport.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import CustomizeSynchronization from '../components/CustomizeSynchronization.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import SubjectsAssignmentsForm from '../components/SubjectsAssignmentsForm.vue';

import { GetSubjectAssignmentsService } from '../services/getSubjectAssignments.service';
import { DeleteSubjectAssignmentsService } from '../services/deleteSubjectAssignments.service';
import { CopyClassroomSubjectAssignmentsService } from '../services/copyClassroomSubjectAssignments.service';
import { GetSubjectAssignmentsRelatedDataFormService } from '../services/getSubjectAssignmentsRelatedDataForm.service';
import { useHeaderStore } from '../../../stores/header.store';

const getSubjectAssignmentsRelatedDataFormService = new GetSubjectAssignmentsRelatedDataFormService();
const copyClassroomSubjectAssignmentsService = new CopyClassroomSubjectAssignmentsService();
const deleteSubjectAssignmentsService = new DeleteSubjectAssignmentsService();
const getSubjectAssignmentsService = new GetSubjectAssignmentsService();

export default defineComponent({
  name: 'SubjectAssignments',
  components: {
    CustomizeSynchronization,
    SubjectsAssignmentsForm,
    SynchronizationReport,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppBaseList,
    AppDropdown,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    AppIcon,
  },

  setup() {
    const { t } = useI18n();
    const title = (t('academicPlanning.subjectAssignments.title'));

    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'core.menu.academicOffer',
        url: { name: 'academicPlanning.academicOffer' },
      },
      {
        name: title,
      },
    ];

    const currentAcademicPeriodGroupId = ref();
    const assignmentModal = ref(false);
    const modalDelete = ref(false);
    const currentCourse = ref();
    const currentGroup = ref();
    const loading = ref(true);
    const route = useRoute();
    const empty = ref(true);
    const subtitle = ref();

    const subjectAssignmentId = ref();
    const academicPeriodId = ref();

    const customizeSynchronizationModal = ref(false);
    const synchronizationReportModal = ref(false);

    const currentData: { value: any } = reactive({
      value: null,
    });
    const relatedDataForm: { value: any } = reactive({
      value: null,
    });
    const subject: { value: any | null } = reactive({
      value: null,
    });
    const dataCards: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      loading.value = true;
      try {
        currentAcademicPeriodGroupId.value = route.params.academicPeriodGroupId;
        await getSubjectAssignmentsRelatedDataForm();
        await getSubjectAssignments();

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Oferta académica', url: '' };
        headerStorage.moduleSubItem = { name: title+ " " +subtitle.value, url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getSubjectAssignmentsRelatedDataForm = async () => {
      relatedDataForm.value = await getSubjectAssignmentsRelatedDataFormService.run(currentAcademicPeriodGroupId.value);

      academicPeriodId.value = relatedDataForm.value.academicPeriodGroup.academicPeriodId;
      currentCourse.value = relatedDataForm.value.academicPeriodGroup.degree.name;
      currentGroup.value = relatedDataForm.value.academicPeriodGroup.group.name;

      subtitle.value = currentCourse.value + ' ' + currentGroup.value;
      console.log("subtitle.value", subtitle.value);

    };

    const getSubjectAssignments = async () => {
      dataCards.value = await getSubjectAssignmentsService.run(currentAcademicPeriodGroupId.value);

      empty.value = !dataCards.value.length;
    };

    const openNewAssignmentModal = (subjec: any | null) => {
      subject.value = subjec;
      assignmentModal.value = true;
    };
    const closeNewAssignmentModal = async () => {
      assignmentModal.value = false;
      await getSubjectAssignmentsRelatedDataForm();
      await getSubjectAssignments();
    };

    const openCustomizeSynchronizationModal = (itemSubjectAssignmentId: number) => {
      subjectAssignmentId.value = itemSubjectAssignmentId;
      customizeSynchronizationModal.value = true;
    };
    const CloseCustomizeSynchronizationModal = async (data: any) => {
      customizeSynchronizationModal.value = false;

      await openSynchronizationReportModal(data);
    };

    const openSynchronizationReportModal = (data: any) => {
      currentData.value = data;
      synchronizationReportModal.value = true;
    };

    const openConfirmDelete = async (data: any) => {
      modalDelete.value = true;
      currentData.value = data;
    };
    const confirmDelete = async () => {
      await deleteSubjectAssignmentsService.run(currentData.value.id);

      await getSubjectAssignmentsRelatedDataForm();
      await getSubjectAssignments();

      modalDelete.value = false;
    };

    const copyInTheClassroom = async (subjectAssignmentId: number) => {
      await copyClassroomSubjectAssignmentsService.run(subjectAssignmentId);
    };

    return {
      t,
      subtitle,
      loading,
      routes,
      title,

      customizeSynchronizationModal,
      currentAcademicPeriodGroupId,
      synchronizationReportModal,
      subjectAssignmentId,
      academicPeriodId,
      relatedDataForm,
      assignmentModal,
      currentCourse,
      currentGroup,
      currentData,
      modalDelete,
      dataCards,
      subject,
      empty,

      CloseCustomizeSynchronizationModal,
      openCustomizeSynchronizationModal,
      closeNewAssignmentModal,
      openNewAssignmentModal,
      copyInTheClassroom,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}

.pointer {
  cursor: pointer;
}
</style>
