<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="academicPrograms.areasSubjects.create">
        <AppButton style="color: white" variant="secondary" @click="openAreaDrawer('create')">
          <AppIcon icon="plus" />
          {{ t('academicPrograms.areasSubjects.createArea') }}
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppPulseLoading v-if="loading" />

      <div class="areasSubjectsPage">
        <div class="pageHero">
          <div class="pageHero__left">
            <div class="pageHero__icon">
              <AppIcon icon="book" />
            </div>
            <div>
              <h2 class="pageHero__title">
                {{ t('academicPrograms.areasSubjects.title') }}
              </h2>
              <p class="pageHero__subtitle">
                {{ t('academicPrograms.areasSubjects.subtitle') }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="!filteredAreas.length" class="emptyWrap">
          <AppEmptyResponse :title="t('academicPrograms.areasSubjects.emptyAreasTitle')" :subtitle="t('academicPrograms.areasSubjects.emptyAreasSubtitle')" />
        </div>

        <div v-else class="areasList">
          <AppAccordion styleType="rounded">
            <template #default="{ accordionId }">
              <AppAccordionItem v-for="(area, index) in filteredAreas" :key="area.id" :accordionId="accordionId" :initOpen="index === 0" class="areaAccordionItem">
                <template #head>
                  <div class="areaCard__header areaCard__header--accordion">
                    <div class="areaCard__left">
                      <div class="areaAvatar">
                        <AppIcon icon="graduation-cap" />
                      </div>

                      <div class="areaMainInfo">
                        <div class="areaTitleRow">
                          <h3 class="areaTitle">{{ area.name }}</h3>
                        </div>

                        <div class="areaMeta">
                          <span class="mono">{{ area.code }}</span>
                          <span>•</span>
                          <span>
                            {{ area.subjects.length }}
                            {{ area.subjects.length === 1 ? t('academicPrograms.areasSubjects.subjectSingular') : t('academicPrograms.areasSubjects.subjectPlural') }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="areaCard__actions" @click.stop>
                      <AppCheckPermission permission="academicPrograms.areasSubjects.create">
                        <AppButton variant="primary" @click="openSubjectDrawer('create', area)">
                          <AppIcon icon="plus" />
                          {{ t('academicPrograms.areasSubjects.subject') }}
                        </AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicPrograms.areasSubjects.list">
                        <AppButton variant="primary" @click="openAreaDrawer('view', area)" icon="eye" />
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicPrograms.areasSubjects.edit">
                        <AppButton variant="primary" @click="openAreaDrawer('edit', area)" icon="edit" />
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicPrograms.areasSubjects.delete">
                        <AppButton variant="danger" @click="openDeleteAreaModal(area)" icon="trash" />
                      </AppCheckPermission>
                    </div>
                  </div>
                </template>

                <template #content>
                  <div class="areaAccordionContent">
                    <div class="areaDescription areaDescription--accordion">
                      {{ area.description || t('academicPrograms.areasSubjects.withoutDescription') }}
                    </div>

                    <div class="subjectsBlock subjectsBlock--accordion">
                      <div v-if="!area.subjects.length" class="subjectsEmpty">
                        <div class="subjectsEmpty__icon">
                          <AppIcon icon="book-open" />
                        </div>
                        <p>
                          {{ t('academicPrograms.areasSubjects.emptySubjects') }}
                        </p>
                        <AppCheckPermission permission="academicPrograms.areasSubjects.create">
                          <AppButton variant="secondary" @click="openSubjectDrawer('create', area)">
                            <AppIcon icon="plus" />
                            {{ t('academicPrograms.areasSubjects.createFirstSubject') }}
                          </AppButton>
                        </AppCheckPermission>
                      </div>

                      <div v-else class="tableWrap">
                        <table class="subjectsTable">
                          <thead>
                            <tr>
                              <th>
                                {{ t('academicPrograms.areasSubjects.code') }}
                              </th>
                              <th>
                                {{ t('academicPrograms.areasSubjects.shortName') }}
                              </th>
                              <th>
                                {{ t('academicPrograms.areasSubjects.credits') }}
                              </th>
                              <th>
                                {{ t('academicPrograms.areasSubjects.hours') }}
                              </th>
                              <th>
                                {{ t('academicPrograms.areasSubjects.type') }}
                              </th>
                              <th>
                                {{ t('academicPrograms.areasSubjects.degreeRequirementShort') }}
                              </th>
                              <th class="thActions">
                                {{ t('academicPrograms.areasSubjects.actions') }}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="subject in area.subjects" :key="subject.id">
                              <td class="mono">
                                {{ subject.code || t('academicPrograms.areasSubjects.emptyValue') }}
                              </td>
                              <td>
                                {{ subject.shortName || t('academicPrograms.areasSubjects.emptyValue') }}
                              </td>
                              <td>{{ subject.credits ?? 0 }}</td>
                              <td>{{ subject.theoricalHours + subject.practicalHours }}h</td>
                              <td>
                                {{ subject.subjectCategory?.name || t('academicPrograms.areasSubjects.emptyValue') }}
                              </td>

                              <td>
                                <AppBadge
                                  :label="subject.isDegreeRequirement ? t('academicPrograms.areasSubjects.yes') : t('academicPrograms.areasSubjects.no')"
                                  :variant="subject.isDegreeRequirement ? 'success' : 'ghost'"
                                />
                              </td>
                              <td>
                                <div class="tableActions">
                                  <AppCheckPermission permission="academicPrograms.areasSubjects.list">
                                    <AppButton outlined variant="primary" @click="openSubjectDrawer('view', area, subject)" icon="eye" />
                                  </AppCheckPermission>

                                  <AppCheckPermission permission="academicPrograms.areasSubjects.edit">
                                    <AppButton outlined variant="primary" @click="openSubjectDrawer('edit', area, subject)" icon="edit" />
                                  </AppCheckPermission>

                                  <AppCheckPermission permission="academicPrograms.areasSubjects.delete">
                                    <AppButton outlined variant="danger" @click="openDeleteSubjectModal(area, subject)" icon="trash" />
                                  </AppCheckPermission>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
            </template>
          </AppAccordion>
        </div>
      </div>

      <AreaDrawer v-if="areaDraw" :isVisibleDrawer="areaDraw" :formData="areaForm" :mode="areaDrawerMode" @update:isVisible="areaDraw = $event" @close="closeAreaDrawer" @reload-data="getAreas()" />

      <SubjectDrawer
        v-if="subjectDrawerVisible"
        :isVisible="subjectDrawerVisible"
        :formData="subjectForm"
        :mode="subjectDrawerMode"
        :areaName="selectedArea?.name || t('academicPrograms.areasSubjects.unassignedArea')"
        :areaId="selectedArea?.id"
        :spaceTypesData="spaceTypesData"
        :subjectCategoriesData="subjectCategoriesData"
        :programsData="programsData"
        :competencyTypesData="competencyTypes"
        @update:isVisible="handleSubjectDrawerVisible"
        @close="closeSubjectDrawer"
        @reload-data="getAreas()"
      />

      <AppModal v-model="deleteAreaModalVisible">
        <AppConfirmDeleteModal
          v-if="deleteAreaModalVisible"
          :entity="areaToDelete?.name || t('academicPrograms.areasSubjects.area')"
          @confirmDelete="confirmDeleteArea"
          @close="closeDeleteAreaModal"
        />
      </AppModal>

      <AppModal v-model="deleteSubjectModalVisible">
        <AppConfirmDeleteModal
          v-if="deleteSubjectModalVisible"
          :entity="subjectToDelete?.shortName || subjectToDelete?.name || t('academicPrograms.areasSubjects.subjectSingular')"
          @confirmDelete="confirmDeleteSubject"
          @close="closeDeleteSubjectModal"
        />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AreaDrawer from '../components/AreaDrawer.vue';
import SubjectDrawer from '../components/SubjectDrawer.vue';

import { GetAreasWithSubjectsService } from '../services/getAreasWithSubjects.service';
import { DeleteAreaService } from '../services/deleteArea.service';
import { DeleteSubjectService } from '../services/deleteSubject.service';

import { useHeaderStore } from '../../../stores/header.store';
import { GetSpaceTypesService } from '../services/getSpaceTypes.service';
import { GetSubjectCategoriesService } from '../services/getSubjectCategories.service';
import { GetProgramsService } from '../services/getPrograms.service';
import { GetTypesCompetenciesService } from '../services/getTypesCompetencies.service';

const deleteSubjectService = new DeleteSubjectService();
const deleteAreaService = new DeleteAreaService();
const getAreasWithSubjectsService = new GetAreasWithSubjectsService();

//tipos de espacios
const getSpaceTypesService = new GetSpaceTypesService();
//tipos de asignaturas
const getSubjectCategoriesService = new GetSubjectCategoriesService();
// lista todos los programas
const getProgramsService = new GetProgramsService();
// tipos de competencias
const getTypesCompetenciesService = new GetTypesCompetenciesService();

type DrawerMode = 'create' | 'edit' | 'view';

export default defineComponent({
  name: 'AreasSubjectsPage',
  components: {
    AppBaseList,
    AppBadge,
    AppButton,
    AppIcon,
    AppEmptyResponse,
    AppModal,
    AppConfirmDeleteModal,
    AppAccordion,
    AppAccordionItem,
    AreaDrawer,
    SubjectDrawer,
    AppPulseLoading,
    AppCheckPermission,
  },

  setup() {
    const { t } = useI18n();

    const title = computed(() => t('academicPrograms.areasSubjects.title'));
    const search = ref('');
    const selectedStatus = ref('');
    const selectedSubjectsFilter = ref('');
    const loading = ref(true);

    const areas = ref<any[]>([]);
    const spaceTypesData = ref<any[]>([]);
    const subjectCategoriesData = ref<any[]>([]);
    const programsData = ref<any[]>([]);
    const competencyTypes = ref<any[]>([]);

    const areaDraw = ref(false);
    const areaDrawerMode = ref<DrawerMode>('create');

    const subjectDrawerVisible = ref(false);
    const subjectDrawerMode = ref<DrawerMode>('create');

    const selectedArea = ref<any | null>(null);
    const selectedSubject = ref<any | null>(null);

    const areaForm = ref<Record<string, any>>({});

    const subjectForm = ref<any>();

    const deleteAreaModalVisible = ref(false);
    const areaToDelete = ref<any | null>(null);

    const deleteSubjectModalVisible = ref(false);
    const subjectToDelete = ref<any | null>(null);
    const subjectParentArea = ref<any | null>(null);

    const getAreas = async () => {
      loading.value = true;

      try {
        const response = await getAreasWithSubjectsService.run({
          noPag: true,
          order: 'DESC',
        });

        areas.value = response;
        console.log('llega data areas', response);

        areaForm.value = {};
      } catch (error) {
        console.log('error get areas', error);
        areas.value = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Diseño curricular', url: '' };
      headerStorage.moduleItem = { name: title.value, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      spaceTypesData.value = await getSpaceTypesService.run({ noPag: true });
      subjectCategoriesData.value = await getSubjectCategoriesService.run({
        noPag: true,
      });
      programsData.value = await getProgramsService.run({ noPag: true });
      competencyTypes.value = await getTypesCompetenciesService.run({
        noPag: true,
      });

      await getAreas();
    });

    const filteredAreas = computed(() => {
      return areas.value.filter((area) => {
        const term = search.value.trim().toLowerCase();

        const matchesSearch =
          !term ||
          area.name.toLowerCase().includes(term) ||
          area.code.toLowerCase().includes(term) ||
          area.subjects.some((subject: any) => subject.shortName.toLowerCase().includes(term) || subject.code.toLowerCase().includes(term));

        const matchesSubjects =
          !selectedSubjectsFilter.value || (selectedSubjectsFilter.value === 'with' && area.subjects.length > 0) || (selectedSubjectsFilter.value === 'without' && area.subjects.length === 0);

        return matchesSearch && matchesSubjects;
      });
    });

    const openAreaDrawer = (mode: DrawerMode, area?: any) => {
      areaDrawerMode.value = mode;
      areaForm.value = area ? { ...area } : {};
      areaDraw.value = true;
    };

    const closeAreaDrawer = async () => {
      areaDraw.value = false;
      await getAreas();
      areaForm.value = {};
    };

    const openSubjectDrawer = (mode: DrawerMode, area?: any, subject?: any) => {
      subjectDrawerMode.value = mode;
      selectedArea.value = area || null;
      selectedSubject.value = subject || null;
      console.log('sisubject', subject);
      console.log('sisarea', area);

      if (subject) {
        subjectForm.value = {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          shortName: subject.shortName,
          credits: subject.credits,
          theoricalHours: subject.theoricalHours,
          maximumHours: subject.maximumHours,
          totalHours: subject.totalHours,
          practicalHours: subject.practicalHours,
          subjectCategoryId: subject.subjectCategoryId,
          spaceTypeId: subject.spaceTypeId,
          isDegreeRequirement: subject.isDegreeRequirement,

          // 🔥 AGREGAR ESTO
          programIds: Array.isArray(subject.programIds) ? [...subject.programIds] : [],
          allPrograms: Number(subject.allPrograms) === 1 ? 1 : 0,

          competencies: subject.competencies ? [...subject.competencies] : [],
          learningResults: subject.learningResults ? [...subject.learningResults] : [],
        };
      } else {
        subjectForm.value = {
          id: '',
          code: '',
          name: '',
          shortName: '',
          credits: 0,
          theoricalHours: 0,
          totalHours: 0,
          maximumHours: 0,
          practicalHours: 0,
          subjectCategoryId: '',
          spaceTypeId: '',
          isDegreeRequirement: false,

          // 🔥 AGREGAR ESTO
          programIds: [],
          allPrograms: 0,

          competencies: [],
          learningResults: [],
        };
      }

      subjectDrawerVisible.value = true;
    };
    const closeSubjectDrawer = async () => {
      subjectDrawerVisible.value = false;
      await getAreas();

      selectedArea.value = null;
      selectedSubject.value = null;
    };

    const openDeleteAreaModal = (area: any) => {
      areaToDelete.value = area;
      deleteAreaModalVisible.value = true;
    };

    const closeDeleteAreaModal = () => {
      deleteAreaModalVisible.value = false;
      areaToDelete.value = null;
    };
    const handleSubjectDrawerVisible = async (value: boolean) => {
      subjectDrawerVisible.value = value;

      if (!value) {
        selectedArea.value = null;
        selectedSubject.value = null;
        await getAreas();
      }
    };
    const confirmDeleteArea = async () => {
      try {
        if (!areaToDelete.value?.id) return;

        await deleteAreaService.run(Number(areaToDelete.value.id));

        closeDeleteAreaModal();
        await getAreas();
      } catch (error) {
        console.error('Error deleting area', error);
      }
    };

    const openDeleteSubjectModal = (area: any, subject: any) => {
      subjectParentArea.value = area;
      subjectToDelete.value = subject;
      deleteSubjectModalVisible.value = true;
    };

    const closeDeleteSubjectModal = () => {
      deleteSubjectModalVisible.value = false;
      subjectToDelete.value = null;
      subjectParentArea.value = null;
    };

    const confirmDeleteSubject = async () => {
      try {
        if (!subjectToDelete.value?.id) return;

        await deleteSubjectService.run(Number(subjectToDelete.value.id));

        closeDeleteSubjectModal();
        await getAreas();
      } catch (error) {
        console.error('Error deleting subject', error);
      }
    };

    return {
      t,
      title,
      search,
      selectedStatus,
      selectedSubjectsFilter,
      loading,
      areas,
      filteredAreas,

      areaDraw,
      areaDrawerMode,
      subjectDrawerVisible,
      subjectDrawerMode,

      selectedArea,
      selectedSubject,
      areaForm,
      subjectForm,

      deleteAreaModalVisible,
      areaToDelete,
      deleteSubjectModalVisible,
      subjectToDelete,

      openAreaDrawer,
      closeAreaDrawer,
      openSubjectDrawer,
      closeSubjectDrawer,

      openDeleteAreaModal,
      closeDeleteAreaModal,
      confirmDeleteArea,

      openDeleteSubjectModal,
      closeDeleteSubjectModal,
      confirmDeleteSubject,

      getAreas,

      spaceTypesData,
      subjectCategoriesData,
      programsData,
      competencyTypes,
      handleSubjectDrawerVisible,
    };
  },
});
</script>

<style scoped>
.areasSubjectsPage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pageHero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.08) 0%, rgba(var(--color-secondary-rgb), 0.05) 100%);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.pageHero__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pageHero__icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  font-size: 1.2rem;
}

.pageHero__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #172033;
}

.pageHero__subtitle {
  margin: 0.25rem 0 0 0;
  color: #667085;
}

.areasList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.areaCard__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.areaCard__left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}

.areaAvatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 1) 0%, rgba(var(--color-secondary-rgb), 1) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.areaTitleRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.areaTitle {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #172033;
}

.areaMeta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: #667085;
  font-size: 0.88rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;
}

.mono {
  font-family: monospace;
  font-weight: 700;
}

.areaCard__actions {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-left: auto;
}

.areaCard__actions :deep(button) {
  position: relative;
  z-index: 2;
}

.areaAccordionItem {
  overflow: hidden;
}

.areaCard__header--accordion {
  width: 100%;
}

.areaMainInfo {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.areaAccordionContent {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.areaDescription {
  margin-top: 1rem;
  color: #475467;
  font-size: 0.95rem;
  line-height: 1.5;
  padding-left: 3.8rem;
}

.areaDescription--accordion {
  margin-top: 0;
  padding-left: 0;
}

.subjectsBlock {
  margin-top: 1rem;
  border-top: 1px solid #eaecf0;
  padding-top: 1rem;
}

.subjectsBlock--accordion {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.subjectsEmpty {
  padding: 2rem 1rem;
  text-align: center;
  border: 1px dashed #d0d5dd;
  border-radius: 16px;
  background: #fcfcfd;
}

.subjectsEmpty__icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 0.8rem auto;
  border-radius: 999px;
  background: #f2f4f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tableWrap {
  overflow-x: auto;
  border: 1px solid #eaecf0;
  border-radius: 16px;
}

.subjectsTable {
  width: 100%;
  border-collapse: collapse;
}

.subjectsTable thead tr {
  background: #f9fafb;
}

.subjectsTable th,
.subjectsTable td {
  padding: 0.9rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eaecf0;
  font-size: 0.92rem;
}

.thActions {
  text-align: center !important;
}

.tableActions {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
}

.emptyWrap {
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .pageHero,
  .areaCard__header {
    flex-direction: column;
    align-items: stretch;
  }

  .pageHero__actions,
  .areaCard__actions {
    width: 100%;
  }

  .areaDescription {
    padding-left: 0;
  }
}
</style>
