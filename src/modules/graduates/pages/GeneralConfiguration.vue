<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="grid-cards">
        <!-- Áreas profesionales -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>Áreas profesionales</span>
              <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.professionalArea)" />
            </div>
          </template>
          <template #body>
            <AppEmptyResponse v-if="!professionalAreas.length" :show-image="false" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="item in professionalAreas" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                <span
                  >{{ item.name }}<span v-if="item.code" class="item-code">{{ item.code }}</span></span
                >
                <AppButtonGroup size="sm">
                  <AppButtonEdit @click="openFormModal(entities.professionalArea, item)" />
                  <AppButtonDelete @click="openConfirmDelete(entities.professionalArea, item)" />
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Niveles de experiencia -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>Niveles de experiencia</span>
              <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.experienceLevel)" />
            </div>
          </template>
          <template #body>
            <AppEmptyResponse v-if="!experienceLevels.length" :show-image="false" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="item in experienceLevels" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                <span
                  >{{ item.name }}<span v-if="item.code" class="item-code">{{ item.code }}</span></span
                >
                <AppButtonGroup size="sm">
                  <AppButtonEdit @click="openFormModal(entities.experienceLevel, item)" />
                  <AppButtonDelete @click="openConfirmDelete(entities.experienceLevel, item)" />
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Industrias -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>Industrias</span>
              <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.industry)" />
            </div>
          </template>
          <template #body>
            <AppEmptyResponse v-if="!industries.length" :show-image="false" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="item in industries" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                <span
                  >{{ item.name }}<span v-if="item.code" class="item-code">{{ item.code }}</span></span
                >
                <AppButtonGroup size="sm">
                  <AppButtonEdit @click="openFormModal(entities.industry, item)" />
                  <AppButtonDelete @click="openConfirmDelete(entities.industry, item)" />
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Tamaños de empresa -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>Tamaños de empresa</span>
              <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.companySize)" />
            </div>
          </template>
          <template #body>
            <AppEmptyResponse v-if="!companySizes.length" :show-image="false" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="item in companySizes" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                <span
                  >{{ item.name }}<span v-if="item.code" class="item-code">{{ item.code }}</span></span
                >
                <AppButtonGroup size="sm">
                  <AppButtonEdit @click="openFormModal(entities.companySize, item)" />
                  <AppButtonDelete @click="openConfirmDelete(entities.companySize, item)" />
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Categorías de habilidades -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>Categorías de habilidades</span>
              <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.skillCategory)" />
            </div>
          </template>
          <template #body>
            <AppEmptyResponse v-if="!skillCategories.length" :show-image="false" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="item in skillCategories" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                <span
                  >{{ item.name }}<span v-if="item.code" class="item-code">{{ item.code }}</span></span
                >
                <AppButtonGroup size="sm">
                  <AppButtonEdit @click="openFormModal(entities.skillCategory, item)" />
                  <AppButtonDelete @click="openConfirmDelete(entities.skillCategory, item)" />
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Idiomas -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>Idiomas</span>
              <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.languageCatalog)" />
            </div>
          </template>
          <template #body>
            <AppEmptyResponse v-if="!languages.length" :show-image="false" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="item in languages" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                <span
                  >{{ item.name }}<span v-if="item.key" class="item-code">{{ item.key }}</span></span
                >
                <AppButtonGroup size="sm">
                  <AppButtonEdit @click="openFormModal(entities.languageCatalog, item)" />
                  <AppButtonDelete @click="openConfirmDelete(entities.languageCatalog, item)" />
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="openModal">
        <GraduatesConfigForm v-if="openModal" :data="currentData" :current-entity="currentEntity" @close="closeModalForm" />
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="currentEntity?.singularName ?? currentEntity?.name ?? 'elemento'" @confirmDelete="confirmDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { useHeaderStore } from '../../../stores/header.store';

import GraduatesConfigForm from '../components/configurationGeneral/GraduatesConfigForm.vue';
import { GetProfessionalAreasService } from '../services/getProfessionalAreas.service';
import { CreateOrUpdateProfessionalAreaService } from '../services/createOrUpdateProfessionalArea.service';
import { DeleteProfessionalAreaService } from '../services/deleteProfessionalArea.service';
import { GetExperienceLevelsService } from '../services/getExperienceLevels.service';
import { CreateOrUpdateExperienceLevelService } from '../services/createOrUpdateExperienceLevel.service';
import { DeleteExperienceLevelService } from '../services/deleteExperienceLevel.service';
import { GetIndustriesService } from '../services/getIndustries.service';
import { CreateOrUpdateIndustryService } from '../services/createOrUpdateIndustry.service';
import { DeleteIndustryService } from '../services/deleteIndustry.service';
import { GetCompanySizesService } from '../services/getCompanySizes.service';
import { CreateOrUpdateCompanySizeService } from '../services/createOrUpdateCompanySize.service';
import { DeleteCompanySizeService } from '../services/deleteCompanySize.service';
import { GetSkillCategoriesService } from '../services/getSkillCategories.service';
import { CreateOrUpdateSkillCategoryService } from '../services/createOrUpdateSkillCategory.service';
import { DeleteSkillCategoryService } from '../services/deleteSkillCategory.service';
import { GetLanguagesCatalogService } from '../services/getLanguagesCatalog.service';
import { CreateOrUpdateLanguageCatalogService } from '../services/createOrUpdateLanguageCatalog.service';
import { DeleteLanguageCatalogService } from '../services/deleteLanguageCatalog.service';
import { JobVacancyCatalogItem } from '../dtos/vacancy.dto';
import { IndustryDto, CompanySizeDto } from '../dtos/company.dto';
import { GraduateSkillCategoryDto } from '../dtos/graduateProfile.dto';
import { LanguageCatalogItemDto } from '../dtos/language.dto';
import { useUserStore } from '../../../stores/user';

const getProfessionalAreasService = new GetProfessionalAreasService();
const getExperienceLevelsService = new GetExperienceLevelsService();
const getIndustriesService = new GetIndustriesService();
const getCompanySizesService = new GetCompanySizesService();
const getSkillCategoriesService = new GetSkillCategoriesService();
const getLanguagesCatalogService = new GetLanguagesCatalogService();

export default defineComponent({
  name: 'GeneralConfiguration',
  components: {
    GraduatesConfigForm,
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup() {
    const title = 'Configuración general';
    useMeta({ title });

    const userStore = useUserStore();
    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Egresados', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const loading = ref(true);
    const openModal = ref(false);
    const modalDelete = ref(false);
    const currentEntity = ref<any>(null);
    const currentData = ref<any>(null);

    const professionalAreas = ref<JobVacancyCatalogItem[]>([]);
    const experienceLevels = ref<JobVacancyCatalogItem[]>([]);
    const industries = ref<IndustryDto[]>([]);
    const companySizes = ref<CompanySizeDto[]>([]);
    const skillCategories = ref<GraduateSkillCategoryDto[]>([]);
    const languages = ref<LanguageCatalogItemDto[]>([]);

    const entities = {
      professionalArea: {
        name: 'Áreas profesionales',
        singularName: 'Área profesional',
        useCode: true,
        serviceCreateOrUpdate: new CreateOrUpdateProfessionalAreaService(),
        serviceDelete: new DeleteProfessionalAreaService(),
      },
      experienceLevel: {
        name: 'Niveles de experiencia',
        singularName: 'Nivel de experiencia',
        useCode: true,
        serviceCreateOrUpdate: new CreateOrUpdateExperienceLevelService(),
        serviceDelete: new DeleteExperienceLevelService(),
      },
      industry: {
        name: 'Industrias',
        singularName: 'Industria',
        useCode: true,
        serviceCreateOrUpdate: new CreateOrUpdateIndustryService(),
        serviceDelete: new DeleteIndustryService(),
      },
      companySize: {
        name: 'Tamaños de empresa',
        singularName: 'Tamaño de empresa',
        useCode: true,
        serviceCreateOrUpdate: new CreateOrUpdateCompanySizeService(),
        serviceDelete: new DeleteCompanySizeService(),
      },
      skillCategory: {
        name: 'Categorías de habilidades',
        singularName: 'Categoría de habilidades',
        useCode: true,
        serviceCreateOrUpdate: new CreateOrUpdateSkillCategoryService(),
        serviceDelete: new DeleteSkillCategoryService(),
      },
      languageCatalog: {
        name: 'Idiomas',
        singularName: 'Idioma',
        useKey: true,
        useIsActive: true,
        serviceCreateOrUpdate: new CreateOrUpdateLanguageCatalogService(),
        serviceDelete: new DeleteLanguageCatalogService(),
      },
    };

    const loadProfessionalAreas = async () => {
      try {
        const res = await getProfessionalAreasService.run();
        professionalAreas.value = res?.data ?? [];
      } catch {
        professionalAreas.value = [];
      }
    };

    const loadExperienceLevels = async () => {
      try {
        const res = await getExperienceLevelsService.run();
        experienceLevels.value = res?.data ?? [];
      } catch {
        experienceLevels.value = [];
      }
    };

    const loadIndustries = async () => {
      try {
        industries.value = (await getIndustriesService.run()) ?? [];
      } catch {
        industries.value = [];
      }
    };

    const loadCompanySizes = async () => {
      try {
        companySizes.value = (await getCompanySizesService.run()) ?? [];
      } catch {
        companySizes.value = [];
      }
    };

    const loadSkillCategories = async () => {
      try {
        const institutionId = Number(userStore.user?.people?.institutionId ?? 0);
        if (!institutionId) return;
        const res = await getSkillCategoriesService.run({ institutionId });
        skillCategories.value = res?.data ?? [];
      } catch {
        skillCategories.value = [];
      }
    };

    const loadLanguages = async () => {
      try {
        const res = await getLanguagesCatalogService.run();
        languages.value = res?.data ?? res ?? [];
      } catch {
        languages.value = [];
      }
    };

    const reloadAll = async () => {
      await Promise.all([loadProfessionalAreas(), loadExperienceLevels(), loadIndustries(), loadCompanySizes(), loadSkillCategories(), loadLanguages()]);
    };

    onMounted(async () => {
      await reloadAll();
      loading.value = false;
    });

    const openFormModal = (entity: any, data?: any) => {
      currentEntity.value = entity;
      currentData.value = data ?? null;
      openModal.value = true;
    };

    const closeModalForm = async () => {
      openModal.value = false;
      await reloadAll();
    };

    const openConfirmDelete = (entity: any, data: any) => {
      currentEntity.value = entity;
      currentData.value = data;
      modalDelete.value = true;
    };

    const confirmDelete = async () => {
      try {
        await currentEntity.value.serviceDelete.run(currentData.value.id);
        await reloadAll();
      } catch {
        // interceptor muestra el error del backend
      } finally {
        modalDelete.value = false;
      }
    };

    return {
      title,
      loading,
      openModal,
      modalDelete,
      currentEntity,
      currentData,
      entities,
      professionalAreas,
      experienceLevels,
      industries,
      companySizes,
      skillCategories,
      languages,
      openFormModal,
      closeModalForm,
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
}
.item-code {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
