<template>
  <AppBaseList :title="title">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <div>
          <h2 class="tw-text-lg tw-font-light">
            {{ t('academicProgramsLevelsDegrees.Levels') }}
          </h2>
          <AppCheckPermission permission="academicPrograms.levelsDegrees.create">
            <AppButtonNewContainer @click="openLevelModal"></AppButtonNewContainer>
          </AppCheckPermission>
        </div>

        <AppAccordion class="mt-2" v-slot="{ accordionId }">
          <AppAccordionItem :accordion-id="accordionId" v-for="(level, index) in levelsWithDegrees.value" :key="index">
            <template v-slot:head>{{ level.name }}</template>

            <template #content>
              <h3 class="tw-text-lg tw-font-light">
                {{ t('core.generalTerms.academic.degree.plural') }}
              </h3>

              <div :class="{ 'grid-cards': level.degrees.length }">
                <AppCheckPermission permission="academicPrograms.levelsDegrees.create">
                  <AppButtonNewContainer @click="openDegreeModal(level.id, null)"></AppButtonNewContainer>
                </AppCheckPermission>

                <AppEmptyResponse v-if="!level.degrees.length"></AppEmptyResponse>

                <AppCard v-for="(degree, index) in level.degrees" :key="index">
                  <template #title>
                    <div>{{ degree.name }}</div>
                  </template>

                  <template #footer>
                    <div class="d-flex justify-content-end">
                      <AppButtonGroup>
                        <AppCheckPermission permission="academicPrograms.levelsDegrees.edit">
                          <AppButtonEdit @click="openDegreeModal(level.id, degree)"></AppButtonEdit>
                        </AppCheckPermission>

                        <AppCheckPermission permission="academicPrograms.levelsDegrees.delete">
                          <AppButtonDelete @click="openConfirmDelete(entityDegree, degree)"></AppButtonDelete>
                        </AppCheckPermission>
                      </AppButtonGroup>
                    </div>
                  </template>
                </AppCard>
              </div>

              <hr />

              <div class="d-flex justify-content-end">
                <AppButtonGroup>
                  <AppCheckPermission permission="academicPrograms.levelsDegrees.edit">
                    <AppButtonEdit @click="openLevelModal(level)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="academicPrograms.levelsDegrees.delete">
                    <AppButtonDelete v-if="!level.degrees.length" @click="openConfirmDelete(entityLevel, level)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </template>

      <AppModal v-model="levelModal" :size="'lg'">
        <LevelForm v-if="levelModal" :data="currentLevel.value" @close="closeLevelModal"></LevelForm>
      </AppModal>

      <AppModal v-model="degreeModal">
        <DegreeForm v-if="degreeModal" :data="currentDegree.value" :level-id="currentLevelId" @close="closeDegreeModal"></DegreeForm>
      </AppModal>

      <AppModal v-model="deleteModal">
        <AppConfirmDeleteModal v-if="deleteModal" :entity="currentEntity" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import LevelForm from '../components/LevelForm.vue';
import DegreeForm from '../components/DegreeForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { LevelsWithDegreesDto, DegreeDto } from '../../../shared/dto/levelsWithDegrees.dto';

import { DeleteLevelService } from '../services/deleteLevel.service';
import { DeleteDegreeService } from '../services/deleteDegree.service';
import { GetLevelsWithDegreesService } from '../../../shared/services/getLevelsWithDegrees.service';
import { useHeaderStore } from '../../../stores/header.store';

const getLevelsWithDegreesService = new GetLevelsWithDegreesService();
const deleteDegreeService = new DeleteDegreeService();
const deleteLevelService = new DeleteLevelService();

export default defineComponent({
  name: 'LevelsDegrees',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppAccordionItem,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppAccordion,
    AppBaseList,
    AppLoading,
    DegreeForm,
    LevelForm,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'core.menu.levelsDegrees';
    const entityLevel = 'core.generalTerms.academic.level.singular';
    const entityDegree = 'core.generalTerms.academic.degree.singular';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const levelsWithDegrees: { value: LevelsWithDegreesDto[] } = reactive({
      value: [],
    });
    const currentLevel: { value: LevelsWithDegreesDto | null } = reactive({
      value: null,
    });
    const currentDegree: { value: DegreeDto | null } = reactive({
      value: null,
    });
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });

    const currentEntity = ref();
    const currentLevelId = ref();

    const loading = ref(true);
    const levelModal = ref(false);
    const degreeModal = ref(false);
    const deleteModal = ref(false);

    onMounted(async () => {
      await getData();
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Estructura Académica', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loading.value = false;
    });

    const getData = async () => {
      try {
        levelsWithDegrees.value = await getLevelsWithDegreesService.run();
      } catch (e) {
        console.log('error', e);
      }
    };

    const openLevelModal = (level: LevelsWithDegreesDto | null) => {
      currentLevel.value = level;
      levelModal.value = true;
    };
    const closeLevelModal = async () => {
      levelModal.value = false;
      await getData();
    };

    const openDegreeModal = (levelId: number, degree: DegreeDto | null) => {
      currentLevelId.value = levelId;
      currentDegree.value = degree;
      degreeModal.value = true;
    };
    const closeDegreeModal = async () => {
      degreeModal.value = false;
      await getData();
    };

    const openConfirmDelete = (entity: string, data: LevelsWithDegreesDto | DegreeDto) => {
      currentDataDelete.value = data;
      currentEntity.value = entity;
      deleteModal.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentEntity.value === entityLevel) {
          await deleteLevelService.run(currentDataDelete.value.id);
        } else if (currentEntity.value === entityDegree) {
          await deleteDegreeService.run(currentDataDelete.value.id);
        }

        deleteModal.value = false;
        await getData();
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      levelsWithDegrees,
      currentLevelId,
      currentEntity,
      currentDegree,
      currentLevel,
      entityDegree,
      degreeModal,
      deleteModal,
      entityLevel,
      levelModal,

      openConfirmDelete,
      closeDegreeModal,
      openDegreeModal,
      closeLevelModal,
      openLevelModal,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
</style>
