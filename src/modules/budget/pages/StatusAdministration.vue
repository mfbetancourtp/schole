<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="grid-cards">
          <AppCheckPermission permission="usersManagement.roles.create">
            <AppButtonNewContainer @click="openFormModal"></AppButtonNewContainer>
          </AppCheckPermission>
          <AppCard v-for="status in status.value" :key="status.id">
            <!-- nombre de la card principal -->
            <template #title>
              <div class="title-card">
                <div class="d-flex align-items-center justify-content-between">
                  {{ status.name }}
                  <div class="type-chip" :class="getTypeClass(status.type)">
                    {{ status.typeName }}
                  </div>
                </div>
              </div>
            </template>
            <template #body>
              <div class="content-card">{{ status.description }}</div>
            </template>

            <template #footer>
              <div class="buttons-card">
                <div class="button-left">
                  <AppCheckPermission permission="usersManagement.roles.edit">
                    <AppButtonEdit @click="openFormModal(status)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="usersManagement.roles.delete">
                    <AppButtonDelete @click="openModalDelete(status)"></AppButtonDelete>
                  </AppCheckPermission>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
        <AppModal v-model="modalForm">
          <StatusAdministrationForm v-if="modalForm" :data="currentStatus.value" :typeStatus="typeStatus" @close="closeModalForm"> </StatusAdministrationForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="Estado" @confirmDelete="deleteStatus"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import StatusAdministrationForm from '../components/StatusAdministrationForm.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetAllStatusAdministrationService } from '../services/getAllStatusAdministration.service';
import { GetAllTypeStatusAdministrationService } from '../services/getAllTypeStatusAdministration.service';
import { DeleteStatusAdministrationService } from '../services/deleteStatusAdministration.service';

const getAllStatusAdministrationService = new GetAllStatusAdministrationService();
const getAllTypeStatusAdministrationService = new GetAllTypeStatusAdministrationService();
const deleteStatusAdministrationService = new DeleteStatusAdministrationService();

export default defineComponent({
  components: {
    AppConfirmDeleteModal,
    AppModal,
    StatusAdministrationForm,
    AppButtonDelete,
    AppButtonEdit,
    AppLoading,
    AppBaseList,
    AppButtonNewContainer,
    AppCheckPermission,
    AppCard,
  },
  name: 'StatusAdministration',
  setup() {
    const title = 'Estado';
    const routes = [
      {
        name: title,
      },
    ];

    useMeta({
      title,
    });

    const loading = ref(true);
    const status: { value: any } = reactive({ value: [] });
    const typeStatus = ref<any[]>([]);

    onMounted(async () => {
      typeStatus.value = await getAllTypeStatusAdministrationService.run();
      await getData();
      loading.value = false;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Administrar Estados', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });
    const getTypeClass = (type: number) => {
      switch (type) {
        case 1:
          return 'chip-started'; // Clase para "Iniciado"
        case 2:
          return 'chip-in-progress'; // Clase para "En proceso"
        case 3:
          return 'chip-finished'; // Clase para "Finalizada"
        default:
          return 'chip-default'; // Clase predeterminada
      }
    };
    const getData = async () => {
      status.value = await getAllStatusAdministrationService.run();
    };

    const modalForm = ref(false);
    const currentStatus: { value: any | null } = reactive({
      value: null,
    });

    const openFormModal = (status: any | null = null) => {
      currentStatus.value = status;
      modalForm.value = true;
    };

    const closeModalForm = () => {
      modalForm.value = false;
      getData();
    };

    const modalDelete = ref(false);

    const openModalDelete = (status: any) => {
      modalDelete.value = true;
      currentStatus.value = status;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getData();
    };

    const deleteStatus = async () => {
      try {
        await deleteStatusAdministrationService.run(currentStatus.value?.id as number);
        await closeModalDelete();
      } catch (e) {
        console.log('this error', e);
      }
    };
    return {
      title,
      routes,
      loading,
      status,
      modalForm,
      currentStatus,
      modalDelete,
      openFormModal,
      closeModalForm,
      openModalDelete,
      closeModalDelete,
      deleteStatus,
      typeStatus,
      getTypeClass,
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

.container-items {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 320px;
  min-width: 287px;
}

.container-new {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.buttons-card {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.button-righ {
  display: flex;
  justify-content: space-between;
}

.button-left {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.content-card {
  width: 100%;
  word-wrap: break-word;
}
.type-chip {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-align: center;
}

.chip-started {
  background-color: #4caf50; /* Verde para "Iniciado" */
}

.chip-in-progress {
  background-color: #ff9800; /* Naranja para "En proceso" */
}

.chip-finished {
  background-color: #f44336; /* Rojo para "Finalizada" */
}

.chip-default {
  background-color: #9e9e9e; /* Gris para cualquier otro caso */
}
</style>
