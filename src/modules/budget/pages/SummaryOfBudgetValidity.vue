<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButton style="color: white" label="Agregar Estado" @click="openFormModal"></AppButton>
      <AppButtonBack :to="{ name: 'budget.budgetValidity' }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppCard>
        <template #body>
          <h4>Resumen vigencia presupuestal</h4>

          <hr />
          <div class="d-flex justify-content-between">
            <h6 class="mb-3"></h6>

            <h6 class="mb-3">
              Fecha:
              <span style="font-weight: 400">{{ data[0].startDate }} - {{ data[0].endDate }}</span>
            </h6>
          </div>
          <div class="shadow-sm bg-card bg-white" style="overflow: auto; max-height: 300px">
            <table class="w-100 table table-striped table-bordered">
              <thead>
                <tr style="background-color: rgb(228, 228, 228)">
                  <th class="text-center w-auto">#</th>
                  <th class="text-center w-100">Estados</th>
                  <th class="text-center w-100">Opciones</th>
                </tr>
              </thead>
              <tbody>
                <AppPulseLoading v-if="loading" />
                <tr v-if="data[0].statusBudgetValidatesDate[0].statusBudgetValidates[0].name === 0">
                  <td colspan="10">
                    <div class="text-center alert alert-warning" role="alert">
                      <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
                      <strong>Aún no tines Estados Asociados .</strong>
                    </div>
                  </td>
                </tr>
                <tr v-for="(item, index) in data[0].statusBudgetValidatesDate" :key="index">
                  <td class="text-center w-auto">
                    {{ index + 1 }}
                  </td>
                  <td class="text-center">
                    {{ item.statusBudgetValidates[0].name }}
                  </td>
                  <td class="text-center">
                    <AppButtonGroup>
                      <AppButtonEdit @click="openFormModal(item)"></AppButtonEdit>
                      <AppButtonDelete @click="openConfirmDelete(item.id)"></AppButtonDelete>
                    </AppButtonGroup>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
        </template>
      </AppCard>
      <AppModal v-model="modalForm">
        <AssociateStatusForm v-if="modalForm" :data="currentStatus.value" @close="closeModalForm"> </AssociateStatusForm>
      </AppModal>

      <AppModal v-model="signatureDelete">
        <AppConfirmDeleteModal v-if="signatureDelete" :entity="'Estado'" @confirmDelete="confirmDelete" @close="signatureDelete = false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AssociateStatusForm from '../components/AssociateStatusForm.vue';

import { GetSummaryOfBudgetValidityService } from '../services/getSummaryOfBudgetValidity.service';
import { DeleteStatusBudgetValidityService } from '../services/deleteStatusBudgetValidity.service';

const getSummaryOfBudgetValidityService = new GetSummaryOfBudgetValidityService();
const deleteStatusBudgetValidityService = new DeleteStatusBudgetValidityService();

export default defineComponent({
  name: 'SummaryOfBudgetValidity',
  components: {
    AppConfirmDeleteModal,
    AssociateStatusForm,
    AppButtonBack,
    AppBaseList,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppButton,
    AppLoading,
    AppModal,
    AppCard,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Resumen de vigencia presupuestal';
    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Cronograma institucional',
        url: { name: 'institutionalEvents.institutionalTimeline' },
      },
      {
        name: title,
      },
    ];

    const data: Ref<any> = ref(null);
    const signatureDelete = ref(false);
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const modalForm = ref(false);
    const currentStatus: { value: any | null } = reactive({
      value: null,
    });

    const loading = ref(true);
    const filter = ref('all');
    const loadingComments = ref(false);
    const comments: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        await getData();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const tasksToShow = computed(() => {
      if (filter.value === 'all') {
        return data.value?.allTasks || [];
      } else if (filter.value === 'mine') {
        return data.value?.myTasks || [];
      }
      return [];
    });
    const updateComments = async () => {
      loadingComments.value = true;

      comments.value = data.value.comments;

      loadingComments.value = false;
    };
    const getData = async () => {
      const StatusId = parseInt(route.params.StatusId.toString(), 10);
      const params = {
        budgetValidateId: StatusId,
      };
      data.value = await getSummaryOfBudgetValidityService.run(params);
    };
    watch(
      () => data.value?.comments,
      () => {
        updateComments();
      }
    );

    const openConfirmDelete = async (signatureId: number) => {
      signatureDelete.value = true;
      currentDataDelete.value = signatureId;
    };

    const confirmDelete = async () => {
      try {
        if (currentDataDelete.value) {
          await deleteStatusBudgetValidityService.run(currentDataDelete.value);

          currentDataDelete.value = null;
        }
        await getData();
        console.log('Respuesta de confirmación de eliminación:');
      } catch (error) {
        console.error('Error al confirmar eliminación:', error);
      }
      signatureDelete.value = false;
    };

    const openFormModal = (status: any | null = null) => {
      currentStatus.value = status;
      modalForm.value = true;
    };

    const closeModalForm = () => {
      modalForm.value = false;
      getData();
    };

    return {
      loading,
      routes,
      title,
      t,

      data,
      filter,
      tasksToShow,
      loadingComments,
      comments,
      updateComments,
      getData,
      openConfirmDelete,
      confirmDelete,
      signatureDelete,
      closeModalForm,
      openFormModal,
      modalForm,
      currentStatus,
    };
  },
});
</script>

<style scoped></style>
