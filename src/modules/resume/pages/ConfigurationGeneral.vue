<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else class="grid-cards">
        <!-- eventTypes -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.eventType.name}`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.eventType)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!eventTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-if="eventTypes.length">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="group in eventTypes" :key="group.id">
                <span>{{ group.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.eventType, group)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.eventType, group)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.eventRoles.name}`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.eventRoles)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!eventRoles.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-if="eventRoles.length">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="group in eventRoles" :key="group.id">
                <span>{{ group.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.eventRoles, group)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.eventRoles, group)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.productionTypes.name}`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.productionTypes)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!productionTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-if="productionTypes.length">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="productionType in productionTypes" :key="productionType.id">
                <span>{{ productionType.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.productionTypes, productionType)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.productionTypes, productionType)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="openModal">
        <AuxiliaryInformationForm v-if="openModal" :data="currentData" :current-entity="currentEntity" :dataAuxiliary="dataAuxiliary" @close="closeModalForm"></AuxiliaryInformationForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="`${currentEntity.singularName || currentEntity.name}`" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
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

import { useHeaderStore } from '../../../stores/header.store';
import AuxiliaryInformationForm from '../components/configurationGeneral/AuxiliaryInformationForm.vue';
import { DeleteEventTypeService } from '../services/deleteEventType.service';
import { CreateOrUpdateEventTypeService } from '../services/createOrUpdateEventType.service';
import { CreateOrUpdateEventRolesService } from '../services/createOrUpdateEventRoles.service';
import { DeleteEventRolesService } from '../services/deleteEventRoles.service';
import { GetEventTypesService } from '../services/getEventTypes.service';
import { GetEventRolesService } from '../services/getEventRoles.service';
import { GetProductionTypesService } from '../services/getProductionTypes.service';
import { CreateOrUpdateProductionTypesService } from '../services/createOrUpdateProductionTypes.service';
import { DeleteProductionTypesService } from '../services/deleteProductionTypes.service';

const getEventTypesService = new GetEventTypesService();
const getEventRolesService = new GetEventRolesService();
const getProductionTypesService = new GetProductionTypesService();

export default defineComponent({
  name: 'ConfirgurationGeneral',
  components: {
    AuxiliaryInformationForm,
    AppConfirmDeleteModal,
    AppCheckPermission,
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
    const { t } = useI18n();

    const title = 'Configuración General';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const currentEntity = ref<any>(null);
    const modalDelete = ref(false);
    const openModal = ref(false);
    const loading = ref(true);
    const dataAuxiliary = ref<any>([]);

    const currentData = ref<any>(null);
    const eventTypes = ref<any[]>([]);
    const eventRoles = ref<any[]>([]);
    const productionTypes = ref<any[]>([]);
    const entities = {
      eventType: {
        name: 'core.configurationGeneralEventType',
        singularName: 'Tipo de evento',
        serviceCreateOrUpdate: new CreateOrUpdateEventTypeService(),
        serviceDelete: new DeleteEventTypeService(),
        useAbbreviation: true,
        useDescription: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      eventRoles: {
        name: 'core.configurationGeneralEventRoles',
        singularName: 'Rol de evento',
        serviceCreateOrUpdate: new CreateOrUpdateEventRolesService(),
        serviceDelete: new DeleteEventRolesService(),
        useAbbreviation: true,
        useDescription: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      productionTypes: {
        name: 'Tipos de producción',
        singularName: 'Tipo de producción',
        serviceCreateOrUpdate: new CreateOrUpdateProductionTypesService(),
        serviceDelete: new DeleteProductionTypesService(),
        useAbbreviation: false,
        useDescription: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
    };
    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Hoja de vida', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log('error', e);
      }
      await getEventType();
      await getEventRoles();
      await getProductionTypes();

      loading.value = false;
    });

    const openFormModal = async (entity: any, data?: any) => {
      currentEntity.value = entity;
      currentData.value = data;
      openModal.value = true;
    };
    const getEventType = async () => {
      try {
        eventTypes.value = await getEventTypesService.run({ noPag: true });
      } catch (error) {
        console.error('Error al obtener tipos de periodo:', error);
        eventTypes.value = [];
      }
    };
    const getEventRoles = async () => {
      try {
        eventRoles.value = await getEventRolesService.run({ noPag: true });
      } catch (error) {
        console.error('Error al obtener tipos de periodo:', error);
        eventRoles.value = [];
      }
    };
    const getProductionTypes = async () => {
      try {
        productionTypes.value = await getProductionTypesService.run({
          noPag: true,
        });
      } catch (error) {
        console.error('Error al obtener tipos de producción:', error);
        productionTypes.value = [];
      }
    };
    const closeModalForm = async () => {
      openModal.value = false;
      await getEventType();
      await getEventRoles();
      await getProductionTypes();
    };

    const openConfirmDelete = async (entity: any, data: any) => {
      currentEntity.value = entity;
      currentData.value = data;

      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await currentEntity.value.serviceDelete.run(currentData.value.id);
      await getEventType();
      await getEventRoles();
      await getProductionTypes();
      modalDelete.value = false;
    };

    return {
      t,
      loading,
      routes,
      title,

      currentEntity,
      currentData,
      modalDelete,
      openModal,

      openConfirmDelete,
      closeModalForm,
      openFormModal,
      confirmDelete,

      dataAuxiliary,
      entities,
      eventTypes,
      eventRoles,
      productionTypes,
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

/* .o-btn--icon.o-btn--outlined-light {
  color: var(--color-light);
}
.o-btn--icon.o-btn--outlined-light:hover {
  color: var(--color-primary);
  background: rgba(var(--color-light-rgb), var(--opacity-color-80));
} */
</style>
