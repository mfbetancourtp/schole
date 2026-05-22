<template>
  <AppLoading v-if="loading"></AppLoading>

  <div style="max-width: 100%; padding: 0 20px">
    <div class="content-cards col-12">
      <AppCard
        style="background-color: unset; border-radius: unset; box-shadow: unset"
      >
        <template #title>
          <div class="d-flex justify-content-between" style="font-weight: bold">
            Especificar tareas a realizarse en la actividad
            <AppButton
              @click="openModalTask(null)"
              variant="primary"
              label="Agregar"
            ></AppButton>
          </div>
        </template>
        <template #body class="content-body" style="padding: unset !important">
          <div
            class="shadow-sm bg-card bg-white"
            style="overflow: auto; max-height: 300px"
          >
            <table class="w-100 table table-striped table-bordered">
              <thead class="sticky-top">
                <tr>
                  <th scope="col" style="width: unset">#</th>
                  <th scope="col" rowspan="2">Tarea</th>
                  <th scope="col" rowspan="2">Fecha Inicio</th>
                  <th scope="col" rowspan="2">Fecha Inicio</th>
                  <th scope="col" rowspan="2">Responsable</th>
                  <th class="text-center sticky-column" scope="col" rowspan="2">
                    Opciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in productTask" :key="index">
                  <th style="text-align: unset">{{ index + 1 }}</th>
                  <td class="text-center">
                    {{ item.description }}
                  </td>
                  <td class="text-center">
                    {{ item.startDate }}
                  </td>
                  <td class="text-center">
                    {{ item.endDate }}
                  </td>
                  <td class="text-center">
                    <AppButton
                      v-tooltip="item.responsible.map((responsible:any) => responsible.dataUser).join(', ')"
                      icon="eye"
                      outlined
                      @click="openListResponsibles(item)"
                    >
                    </AppButton>
                  </td>
                  <td class="sticky-column">
                    <AppButtonGroup>
                      <AppButtonEdit
                        @click="openModalTask(item)"
                      ></AppButtonEdit>
                      <AppButtonDelete
                        @click="openModalDeleteTask(item)"
                      ></AppButtonDelete>
                    </AppButtonGroup>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </AppCard>
    </div>
  </div>
  <AppModal v-model="modalTask">
    <TaskModal
      v-if="modalTask"
      @close="closeModalTask"
      :data="currentDataTask"
      :responsiblesList="responsiblesList"
    >
    </TaskModal>
  </AppModal>


  <AppModal v-model="modalListResponsibles">
    <ListResponsiblesModal
      v-if="modalListResponsibles"
      entity="Lista de Responsables"
      :data="currentDataTask"
      @close="closeModalTask"


    >
    </ListResponsiblesModal>
  </AppModal>


  <AppModal v-model="modalDeleteTask">
    <AppConfirmDeleteModal
      v-if="modalDeleteTask"
      entity="Tarea"
      @confirmDelete="deleteTask"
    >
    </AppConfirmDeleteModal>
  </AppModal>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  PropType,
  reactive,
  Ref,
  ref,
  watch,
} from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
// import ScheduleParticipantsForm from '../components/ScheduleParticipantsForm.vue';
import TaskModal from '../components/TaskModal.vue';
import ListResponsiblesModal from '../components/ListResponsiblesModal.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetAllRolesService } from '../../access/services/getAllRoles.service';
import { GetUserByRoleService } from '../../reports/services/reports/getUserByRole.service';

import { CreateOrUpdateInstitutionalActivitiesService } from '../services/createOrUpdateInstitutionalActivities.service';
import { GetResponsiblesInstitutionalActivitiesService } from '../services/getResponsiblesInstitutionalActivities.service';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import { DeleteTaskByIdService } from '../../institutionalEvents/services/deleteTaskById.service';
import { GetInstitutionalActivityWithTasksService } from '../services/getInstitutionalActivityWithTasks.service';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';

const getInstitutionalActivityWithTasksService =
  new GetInstitutionalActivityWithTasksService();

const getResponsiblesInstitutionalActivitiesService =
  new GetResponsiblesInstitutionalActivitiesService();
const deleteTaskByIdService = new DeleteTaskByIdService();

export default defineComponent({
  name: 'InstitutionalTimelineForm',
  components: {
    AppLoading,
    AppButton,
    AppCard,
    // ScheduleParticipantsForm,
    AppModal,
    AppButtonEdit,
    AppButtonGroup,
    AppConfirmDeleteModal,
    TaskModal,
    AppButtonDelete,
    ListResponsiblesModal,
  },

  props: {
    title: {
      type: String,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
    },
    data: {
      type: Object as PropType<any>,
    },
    isDocExpanded: {
      type: Boolean,
      required: true,
    },
  },

  setup(props) {
    let title = props.data?.id
      ? 'Editar Evento Institucional'
      : 'Nuevo Evento Institucional';
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const data = ref();
    const academicPeriodId = ref(route.query.academicPeriodId);
    const loading = ref(true);
    const responsiblesList = ref<any[]>([]);

    const productTask = ref<any[]>([]);
    const currentDataTask = ref<any | null>();
    const modalTask = ref(false);
    const modalDeleteTask = ref(false);
    const modalListResponsibles = ref(false);

    const form = reactive({
      id: props.data?.id ?? null,
      academicPeriodId: null as any,
      roleId: null,
      userId: null,

      color: props.data?.color ?? '',

      title: props.data?.title ?? null,
      requiresEvent: props.data
        ? props.data.requiresEvent
          ? true
          : false
        : false,

      startDate: props.data ? props.data.startDate : null,
      endDate: props.data ? props.data.endDate : null,
      supervisorUserId: props.data
        ? props.data.supervisorUserId
        : Number(localStorage.getItem('user')),
      objective: props.data ? props.data.objective : '',
    });
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          academicPeriodId: { required },
          title: { required },
          requiresEvent: {},
          roleId: {},
          userId: {},
          color: {},
          startDate: { required },
          endDate: { required },
          supervisorUserId: { required },
          objective: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        await getData();
        await getDataResposible();

        const userJson = localStorage.getItem('user');
        if (!userJson) {
          console.error('No user data found in localStorage');
          return;
        }

        const user = JSON.parse(userJson);
        if (!user || !user.id) {
          console.error('User data is not valid or ID is missing');
          return;
        }
        const supervisorUserId = user.id;
        form.supervisorUserId = supervisorUserId;

        data.value = props.data;
        if (route.query.academicPeriodId)
          form.academicPeriodId = parseInt(
            route.query.academicPeriodId.toString(),
            10
          );
        else if (props.data && props.data.academicPeriodId)
          form.academicPeriodId = props.data.academicPeriodId;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const openModalTask = (dataSelected: any | null) => {
      currentDataTask.value = dataSelected;
      modalTask.value = true;
    };
    const openModalDeleteTask = (dataProductTypes: any) => {
      modalDeleteTask.value = true;
      currentDataTask.value = dataProductTypes;
    };
    const openListResponsibles = (dataListResponsibles: any) => {
      modalListResponsibles.value = true;
      currentDataTask.value = dataListResponsibles;
    };
    const deleteTask = async () => {
      try {
        await deleteTaskByIdService.run(currentDataTask.value?.id as number);
        await closeModalTask();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };

    const getDataResposible = async () => {
      let responseResponsible =
        await getResponsiblesInstitutionalActivitiesService.run(
          Number(localStorage.getItem('institutionalActivityId'))
        );
      responsiblesList.value = responseResponsible;
      console.log('responsiblesList.value', responsiblesList.value);
    };

    const getData = async () => {
      let responseEvent = await getInstitutionalActivityWithTasksService.run(
        Number(localStorage.getItem('institutionalActivityId'))
      );
      productTask.value = responseEvent.tasks;
      console.log('responseEvenresponseEventt', responseEvent);

      let responseResponsible =
        await getResponsiblesInstitutionalActivitiesService.run(
          Number(localStorage.getItem('institutionalActivityId'))
        );
      responsiblesList.value = responseResponsible;
      console.log('responsiblesList.value', responsiblesList.value);
    };

    const closeModalTask = async () => {
      modalDeleteTask.value = false;
      modalTask.value = false;
      modalListResponsibles.value = false;
      await getData();
      await getDataResposible();
    };
    return {
      loading,
      v$,
      t,
      data,
      academicPeriodId,

      productTask,
      currentDataTask,
      modalTask,
      modalDeleteTask,
      openModalTask,
      openModalDeleteTask,
      openListResponsibles,
      deleteTask,
      closeModalTask,
      responsiblesList,
      modalListResponsibles,
    };
  },
});
</script>

<style scoped>
.buttons {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row-reverse;
}
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
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
.content-cards {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 1px 2px 6px #00000073;
  border-radius: 8px;
  padding: 10px 20px;
  /* width: 100%; */
  gap: 12px;
  justify-content: space-between;
}
.content-body {
  padding: unset !important;
}
</style>
