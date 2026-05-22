<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="grid-cards">
          <AppCheckPermission permission="usersManagement.roles.create">
            <AppButtonNewContainer @click="openFormModal"></AppButtonNewContainer>
          </AppCheckPermission>
          <AppCard v-for="period in periods.value" :key="period.id">
            <!-- nombre de la card principal -->
            <template #title>
              <div class="title-card">{{ period.name }}</div>
            </template>
            <template #body>
              <div class="content-card">{{ period.description }}</div>
              <div class="content-card">Número de meses: {{ period.numberPeriods }}</div>
            </template>

            <template #footer>
              <div class="buttons-card">
                <div class="button-left">
                  <AppCheckPermission permission="usersManagement.roles.edit">
                    <AppButtonEdit @click="openFormModal(period)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="usersManagement.roles.delete">
                    <AppButtonDelete @click="openModalDelete(period)"></AppButtonDelete>
                  </AppCheckPermission>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
        <AppModal v-model="modalForm">
          <periodsAdministrationForm v-if="modalForm" :data="currentPeriod.value" @close="closeModalForm"> </periodsAdministrationForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="Periodo" @confirmDelete="deleteRole"></AppConfirmDeleteModal>
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
import periodsAdministrationForm from '../components/periodsAdministrationForm.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetAllPeriodsAdministrationService } from '../services/getAllPeriodsAdministration.service';
import { DeletePeriodsAdministrationmService } from '../services/deletePeriodsAdministration.service';

const getAllPeriodsAdministrationService = new GetAllPeriodsAdministrationService();
const deletePeriodsAdministrationmService = new DeletePeriodsAdministrationmService();

export default defineComponent({
  components: {
    AppConfirmDeleteModal,
    AppModal,
    periodsAdministrationForm,
    AppButtonDelete,
    AppButtonEdit,
    AppLoading,
    AppBaseList,
    AppButtonNewContainer,
    AppCheckPermission,
    AppCard,
  },
  name: 'PeriodAdministration',
  setup() {
    const title = 'Período';
    const routes = [
      {
        name: title,
      },
    ];

    useMeta({
      title,
    });

    const loading = ref(true);
    const periods: { value: any } = reactive({ value: [] });

    onMounted(async () => {
      await getData();
      loading.value = false;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Administrar Períodos', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    const getData = async () => {
      periods.value = await getAllPeriodsAdministrationService.run();
    };

    const modalForm = ref(false);
    const currentPeriod: { value: any | null } = reactive({
      value: null,
    });

    const openFormModal = (period: any | null = null) => {
      currentPeriod.value = period;
      modalForm.value = true;
    };

    const closeModalForm = () => {
      modalForm.value = false;
      getData();
    };

    const modalDelete = ref(false);

    const openModalDelete = (period: any) => {
      modalDelete.value = true;
      currentPeriod.value = period;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getData();
    };

    const deleteRole = async () => {
      try {
        await deletePeriodsAdministrationmService.run(currentPeriod.value?.id as number);
        await closeModalDelete();
      } catch (e) {
        console.log('this error', e);
      }
    };
    return {
      title,
      routes,
      loading,
      periods,
      modalForm,
      currentPeriod,
      modalDelete,
      openFormModal,
      closeModalForm,
      openModalDelete,
      closeModalDelete,
      deleteRole,
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
</style>
