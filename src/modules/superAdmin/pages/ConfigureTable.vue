<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else class="grid-cards">
        <AppCard class="col-6" style="padding: 10px 20px !important">
          <template #title>
            <div
              class="d-flex justify-content-between align-items-center h-100 fs-5"
            >
              <span>{{ t(`core.menu.language`) }}</span>

              <!-- <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openModalLanguage""> </AppButton>
              </AppCheckPermission> -->
              <AppCheckPermission
                permission="institutionalConfiguration.auxiliaryInformation.create"
              >
                <AppButton
                  variant="primary"
                  outlined
                  icon="plus"
                  size="sm"
                  @click="openModalLanguage"
                >
                </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <div
              class="shadow-sm bg-card bg-white"
              style="overflow: auto; max-height: 300px"
            >
              <table class="w-100 table table-striped table-bordered">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">Código</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AppEmptyResponse
                    v-if="!languageList.length"
                    :show-image="false"
                  ></AppEmptyResponse>

                  <tr v-else v-for="(item, index) in languageList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.code }}</td>
                    <td>{{ item.name }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCheckPermission
                          permission="institutionalConfiguration.auxiliaryInformation.edit"
                        >
                          <AppButtonEdit
                            @click="openModalLanguage(item)"
                          ></AppButtonEdit>
                        </AppCheckPermission>

                        <AppCheckPermission
                          permission="institutionalConfiguration.auxiliaryInformation.delete"
                        >
                          <AppButtonDelete
                            @click="openModalDeleteLanguage(item)"
                          ></AppButtonDelete>
                        </AppCheckPermission>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>

        <AppCard class="col-6" style="padding: 10px 20px !important">
          <template #title>
            <div
              class="d-flex justify-content-between align-items-center h-100 fs-5"
            >
              <span>{{ t(`core.menu.module`) }}</span>

              <!-- <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openModalLanguage""> </AppButton>
              </AppCheckPermission> -->
              <AppCheckPermission
                permission="institutionalConfiguration.auxiliaryInformation.create"
              >
                <AppButton
                  variant="primary"
                  outlined
                  icon="plus"
                  size="sm"
                  @click="openModalModule"
                >
                </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <div
              class="shadow-sm bg-card bg-white"
              style="overflow: auto; max-height: 300px"
            >
              <table class="w-100 table table-striped table-bordered">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col" style="width: unset">#</th>
                    <th scope="col" style="width: unset">BasePath</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AppEmptyResponse
                    v-if="!moduleList.length"
                    :show-image="false"
                  ></AppEmptyResponse>

                  <tr v-else v-for="(item, index) in moduleList" :key="index">
                    <th style="text-align: unset">{{ index + 1 }}</th>
                    <td>{{ item.basePath }}</td>
                    <td>{{ item.name }}</td>
                    <td class="text-center mx-auto">
                      <AppButtonGroup size="sm">
                        <AppCheckPermission
                          permission="institutionalConfiguration.auxiliaryInformation.edit"
                        >
                          <AppButtonEdit
                            @click="openModalModule(item)"
                          ></AppButtonEdit>
                        </AppCheckPermission>

                        <AppCheckPermission
                          permission="institutionalConfiguration.auxiliaryInformation.delete"
                        >
                          <AppButtonDelete
                            @click="openModalDeleteModule(item)"
                          ></AppButtonDelete>
                        </AppCheckPermission>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="modalLanguage">
        <TableLanguageModal
          v-if="modalLanguage"
          @close="closeModalLanguage"
          :data="currentDataLanguage"
        ></TableLanguageModal>
      </AppModal>
      <AppModal v-model="modalDeleteLanguage">
        <AppConfirmDeleteModal
          v-if="modalDeleteLanguage"
          entity="core.menu.language"
          @confirmDelete="deleteLanguage"
        >
        </AppConfirmDeleteModal>
      </AppModal>

      <AppModal v-model="modalModule" size="lg">
        <TableModuleModal
          v-if="modalModule"
          @close="closeModalModule"
          :data="currentDataModule"
        ></TableModuleModal>
      </AppModal>
      <AppModal v-model="modalDeleteModule">
        <AppConfirmDeleteModal
          v-if="modalDeleteModule"
          entity="core.menu.module"
          @confirmDelete="deleteModule"
        >
        </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import TableLanguageModal from '../components/TableLanguageModal.vue';
import TableModuleModal from '../components/TableModuleModal.vue';

// import { DeleteJourneyService } from '../services/deleteJourney.service';
// import { DeletePlayTimesService } from '../services/deletePlayTimes.service';

// import { GetAuxiliaryInformationService } from '../services/getAuxiliaryInformation.service';

// import { CreateOrUpdateJourneyService } from '../services/createOrUpdateJourney.service';
// import { CreateOrUpdatePlayTimesService } from '../services/createOrUpdatePlayTimes.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppCustomButton from '../../../shared/components/Buttons/AppCustomButton.vue';

// const getAuxiliaryInformationService = new GetAuxiliaryInformationService();

export default defineComponent({
  name: 'AuxiliaryInformation',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppCustomButton,
    AppModal,
    AppCard,
    TableLanguageModal,
    TableModuleModal,
  },

  setup() {
    const { t } = useI18n();

    const title = 'core.menu.administrationTables';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const languageList = ref<any[]>([]);
    const currentDataLanguage = ref<any | null>();
    const modalLanguage = ref(false);
    const modalDeleteLanguage = ref(false);

    const moduleList = ref<any[]>([]);
    const currentDataModule = ref<any | null>();
    const modalModule = ref(false);
    const modalDeleteModule = ref(false);

    const loading = ref(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Super Administrador', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        // languageList.value = await getAllDryPlacesService.run({ campusId: 0 });
        // moduleList.value = await getAllDryPlacesService.run({ campusId: 0 });
        languageList.value = [
          {
            id: 1,
            code: 123,
            name: 'español',
          },
          {
            id: 2,
            code: 1233,
            name: 'Ingles',
          },
          {
            id: 3,
            code: 12334,
            name: 'Ruso',
          },
        ];
        moduleList.value = [
          {
            basePath: 123,
            name: 'español',
            description: 'español',
            icon: 'español',
            classCss: 'español',
          },
          {
            basePath: 123,
            name: 'español',
            description: 'español',
            icon: 'español',
            classCss: 'español',
          },
          {
            basePath: 123,
            name: 'español',
            description: 'español',
            icon: 'español',
            classCss: 'español',
          },
        ];
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const openModalLanguage = (dataSelected: any) => {
      currentDataLanguage.value = dataSelected;
      modalLanguage.value = true;
    };
    const openModalDeleteLanguage = (dataLanguage: any) => {
      modalDeleteLanguage.value = true;
      currentDataLanguage.value = dataLanguage;
    };
    const deleteLanguage = async () => {
      try {
        // await deleteDryplaceByIdService.run(currentDataLanguage.value?.id as number);
        await closeModalLanguage();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalLanguage = async () => {
      modalDeleteLanguage.value = false;
      modalLanguage.value = false;
      // languageList.value = await getAllDryPlacesService.run({ campusId: 0 });
    };

    const openModalModule = (dataSelected: any) => {
      currentDataModule.value = dataSelected;
      modalModule.value = true;
    };
    const openModalDeleteModule = (dataModule: any) => {
      modalDeleteModule.value = true;
      currentDataModule.value = dataModule;
    };
    const deleteModule = async () => {
      try {
        // await deleteDryplaceByIdService.run(currentDataLanguage.value?.id as number);
        await closeModalModule();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalModule = async () => {
      modalDeleteModule.value = false;
      modalModule.value = false;
      // languageList.value = await getAllDryPlacesService.run({ campusId: 0 });
    };
    return {
      t,
      loading,
      routes,
      title,

      languageList,
      currentDataLanguage,
      modalLanguage,
      openModalLanguage,
      openModalDeleteLanguage,
      deleteLanguage,
      modalDeleteLanguage,
      closeModalLanguage,

      moduleList,
      currentDataModule,
      modalModule,
      openModalModule,
      openModalDeleteModule,
      deleteModule,
      modalDeleteModule,
      closeModalModule,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, calc(50% - 0.5rem)), 1fr)
  );
  /* 50% de ancho y restando el espacio entre las tarjetas */
}

.sticky-top {
  z-index: 5 !important;
}

.container__body {
  width: 100%;
  max-height: 300px;
  overflow: auto;
}

table thead tr th {
  color: black;
  font-size: 14px;
  padding: 0.5rem;
  /* width: 200px; */
  white-space: nowrap;
  word-wrap: break-word;
  text-align: center;
}

table thead tr {
  background-color: #e4e4e4;
}

table tbody tr td {
  font-size: 14px;
  text-align: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eedd;
}

@media (max-width: 750px) {
  .grid-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
