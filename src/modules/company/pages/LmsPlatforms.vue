<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <div v-if="!lmsInstitutionPlatforms.length">
          <AppButtonNewContainer @click="openLmsPlatformsForm(null)"></AppButtonNewContainer>

          <AppEmptyResponse :show-image="true"></AppEmptyResponse>
        </div>

        <div v-else class="grid-cards">
          <AppButtonNewContainer @click="openLmsPlatformsForm(null)"></AppButtonNewContainer>

          <AppCard v-for="(platform, index) in lmsInstitutionPlatforms" :key="index">
            <template #title>
              <div>{{ platform.name }}</div>
            </template>

            <template #body>
              <div class="name-plataform">{{ platform.lmsPlatformName }}</div>

              <div
                class="Url-plataform"
                v-html="
                  linkifyHtml(platform.lmsUrlApiRest ?? '', {
                    target: '_blank',
                  })
                "
              ></div>
            </template>

            <template #footer>
              <div class="d-flex justify-content-end">
                <AppButtonGroup>
                  <AppButtonEdit @click="openLmsPlatformsForm(platform.id)"></AppButtonEdit>

                  <AppButtonDelete @click="openConfirmDelete(platform.id)"></AppButtonDelete>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>
      </template>

      <AppModal v-model="lmsPlatformsFormModal" :size="'lg'">
        <LmsPlatformsForm v-if="lmsPlatformsFormModal" :data="currentLmsInstitutionPlatform" @close="closeLmsPlatformsForm"></LmsPlatformsForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Plataforma de aprendizaje LMS" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import linkifyHtml from 'linkify-html';
import * as linkify from 'linkifyjs';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import LmsPlatformsForm from '../components/LmsPlatformsForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { GetLmsInstitutionPlatformsService } from '../services/getLmsInstitutionPlatforms.service';
import { DeleteLmsInstitutionPlatformsService } from '../services/deleteLmsInstitutionPlatforms.service';
import { GetLmsInstitutionPlatformsByIdService } from '../services/getLmsInstitutionPlatformsById.service';
import { useHeaderStore } from '../../../stores/header.store';

const getLmsInstitutionPlatformsByIdService = new GetLmsInstitutionPlatformsByIdService();
const deleteLmsInstitutionPlatformsService = new DeleteLmsInstitutionPlatformsService();
const getLmsInstitutionPlatformsService = new GetLmsInstitutionPlatformsService();

export default defineComponent({
  name: 'LmsPlatforms',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    LmsPlatformsForm,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Plataformas de aprendizaje LMS';

    const currentLmsInstitutionPlatform: Ref<any> = ref(null);
    const lmsInstitutionPlatforms: Ref<any[]> = ref([]);

    const currentLmsInstitutionPlatformId = ref();

    const lmsPlatformsFormModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    onMounted(async () => {
      try {
        await getLmsInstitutionPlatforms();
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Empresa', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getLmsInstitutionPlatforms = async () => {
      loading.value = true;

      lmsInstitutionPlatforms.value = await getLmsInstitutionPlatformsService.run();

      loading.value = false;
    };

    const openLmsPlatformsForm = async (platformId: number | null = null) => {
      if (platformId) {
        currentLmsInstitutionPlatform.value = await getLmsInstitutionPlatformsByIdService.run(platformId);
      }

      lmsPlatformsFormModal.value = true;
    };
    const closeLmsPlatformsForm = async () => {
      lmsPlatformsFormModal.value = false;
      currentLmsInstitutionPlatform.value = null;

      await getLmsInstitutionPlatforms();
    };

    const openConfirmDelete = (platformId: number) => {
      currentLmsInstitutionPlatformId.value = platformId;

      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentLmsInstitutionPlatformId.value) {
          await deleteLmsInstitutionPlatformsService.run(currentLmsInstitutionPlatformId.value);

          currentLmsInstitutionPlatformId.value = null;

          await getLmsInstitutionPlatforms();
        }
      } catch (e) {
        console.log(e);
      }

      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      currentLmsInstitutionPlatform,
      lmsInstitutionPlatforms,
      lmsPlatformsFormModal,
      modalDelete,

      closeLmsPlatformsForm,
      openLmsPlatformsForm,
      openConfirmDelete,
      confirmDelete,

      linkifyHtml,
      linkify,
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
