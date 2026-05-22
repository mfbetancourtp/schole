<template>
  <AppBaseList :title="title">
    <template #actions> </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <div v-if="!studyPlans.value.length">
          <AppCheckPermission permission="academicPrograms.studyPlan.create">
            <AppButtonNewContainer @click="openStudyPlanModal(null)"></AppButtonNewContainer>
          </AppCheckPermission>

          <AppEmptyResponse></AppEmptyResponse>
        </div>

        <div v-else class="grid-cards">
          <AppCheckPermission permission="academicPrograms.studyPlan.create">
            <AppButtonNewContainer @click="openStudyPlanModal(null)"></AppButtonNewContainer>
          </AppCheckPermission>

          <AppCard v-for="(studyPlan, index) in studyPlans.value" :key="index">
            <template #title>
              <div>{{ studyPlan.name }}</div>
            </template>
            <template #body>
              <p class="mb-0">{{ studyPlan.administrativeResolution }}</p>
              <p>{{ studyPlan.resolutionDate }}</p>
            </template>

            <template #footer>
              <div class="d-flex justify-content-between">
                <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.list">
                  <AppButton
                    outlined
                    icon="calendar-week"
                    v-tooltip="'academicPrograms.studyPlan.subjectAdmin'"
                    :to="{
                      name: 'academicPrograms.subjectsStudyPlan',
                      params: { studyPlanId: studyPlan.id },
                    }"
                  ></AppButton>
                </AppCheckPermission>

                <AppButtonGroup>
                  <AppCheckPermission permission="academicPrograms.studyPlan.edit">
                    <AppButtonEdit @click="openStudyPlanModal(studyPlan)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="academicPrograms.studyPlan.delete">
                    <AppButtonDelete @click="openConfirmDelete(studyPlan)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>
      </div>

      <AppModal v-model="studyPlanModal">
        <StudyPlanForm v-if="studyPlanModal" :data="currentStudyPlan.value" @close="closeStudyPlanModal"></StudyPlanForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="core.generalTerms.academic.studyPlan.singular" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import StudyPlanForm from '../components/StudyPlanForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { CurriculumsDto } from '../dtos/studyPlan/Curriculums.dto';

// import { GetStudyPlansService } from '../services/getStudyPlans.service';
import { DeleteStudyPlanService } from '../services/deleteStudyPlan.service';
import { GetAllCurriculumsService } from '../services/studyPlan/getAllCurriculums.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteStudyPlanService = new DeleteStudyPlanService();
// const getStudyPlansService = new GetStudyPlansService();
const getAllCurriculumsService = new GetAllCurriculumsService();

export default defineComponent({
  name: 'StudyPlan',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    StudyPlanForm,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'core.menu.studyPlan';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const studyPlanModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    const currentStudyPlan: { value: CurriculumsDto | null } = reactive({
      value: null,
    });
    const studyPlans: { value: CurriculumsDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      await getStudyPlans();
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Estructura Académica', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loading.value = false;
    });

    const getStudyPlans = async () => {
      studyPlans.value = await getAllCurriculumsService.run();
    };

    const openStudyPlanModal = (studyPlan: CurriculumsDto | null) => {
      currentStudyPlan.value = studyPlan;
      studyPlanModal.value = true;
    };
    const closeStudyPlanModal = async () => {
      studyPlanModal.value = false;
      await getStudyPlans();
    };

    const openConfirmDelete = async (data: CurriculumsDto) => {
      modalDelete.value = true;
      currentStudyPlan.value = data;
    };
    const confirmDelete = async () => {
      const studyPlanId = currentStudyPlan?.value?.id ?? 0;
      await deleteStudyPlanService.run(studyPlanId);

      modalDelete.value = false;
      await getStudyPlans();
    };

    return {
      studyPlans,
      loading,
      routes,
      title,
      t,

      closeStudyPlanModal,
      openStudyPlanModal,
      openConfirmDelete,
      confirmDelete,

      currentStudyPlan,
      studyPlanModal,
      modalDelete,
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
</style>
