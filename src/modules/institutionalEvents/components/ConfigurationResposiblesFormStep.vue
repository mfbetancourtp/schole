<template>
  <div style="max-width: 100%; padding: 0 20px">
    <div class="col-12">
      <AppCard
        style="background-color: unset; border-radius: unset; box-shadow: unset"
      >
        <template #title>
          <div class="d-flex justify-content-between" style="font-weight: bold">
            Responsables de la actividad
            <AppButton
              @click="openModalResponsibles(null)"
              variant="primary"
              label="Agregar"
              :disabled="!institutionalActivityId"
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
                  <th class="text-center w-auto">#</th>
                  <th class="text-center w-50">Rol</th>
                  <th class="text-center w-50">Usuario</th>
                  <th class="text-center w-auto sticky-column">Opciones</th>
                </tr>
              </thead>
              <tbody>
                <AppPulseLoading v-if="loading" />
                <tr v-if="responsiblesList.length === 0">
                  <td
                    colspan="10"
                   
                  >
                  <div  class="text-center alert alert-warning"
                    role="alert">
                    <AppIcon
                      icon="exclamation-triangle"
                      class="me-1"
                      size="lg"
                    ></AppIcon>
                    <strong>Aún no tienes Responsables del Evento.</strong>
                  </div>
                  </td>
                </tr>
                <tr v-for="(item, index) in responsiblesList" :key="index">
                  <td class="text-center w-auto">
                    {{ index + 1 }}
                  </td>
                  <td class="text-center">
                    {{ item.roleName }}
                  </td>
                  <td class="text-center">
                    {{ item.peopleName }}
                  </td>
                  <td class="sticky-column text-center">
                    <div class="d-flex justify-content-between">
                      <AppButtonDelete
                        @click="deleteResposible(item)"
                      ></AppButtonDelete>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </AppCard>
    </div>
    <div
      v-if="!institutionalActivityId"
      class="alert alert-warning"
      role="alert"
    >
      <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
      <strong
        >Antes de asignar responsables al evento, Recuerda que se debe Crear el
        evento.</strong
      >
    </div>
  </div>

  <div class="form-row d-flex justify-content-end mb-3">
    <AppButton
      class=" buttons"
      label="Actualizar"
      @click="saveUpdate"
    >
    </AppButton>
  </div>

  <AppModal v-model="modalResponsibles">
    <ResponsiblesModal
      v-if="modalResponsibles"
      @close="closeModalResponsibles"
      :roles="roles"
    >
    </ResponsiblesModal>
  </AppModal>
  <!-- <AppModal v-model="modalDeleteResponsibles">
    <AppConfirmDeleteModal
      v-if="modalDeleteResponsibles"
      entity="Tarea"
      @confirmDelete="deleteResponsibles"
    >
    </AppConfirmDeleteModal>
  </AppModal> -->
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
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
// import ScheduleParticipantsForm from '../components/ScheduleParticipantsForm.vue';
import ResponsiblesModal from '../components/ResponsiblesModal.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetAllRolesService } from '../../access/services/getAllRoles.service';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';

import { CreateOrUpdateInstitutionalActivitiesService } from '../services/createOrUpdateInstitutionalActivities.service';
import { CreateOrUpdateResponsiblesInstitutionalActivitiesService } from '../services/createOrUpdateResponsiblesInstitutionalActivities.service';
import { GetResponsiblesInstitutionalActivitiesService } from '../services/getResponsiblesInstitutionalActivities.service';
import { DeleteResponsiblesInstitutionalActivitiesByIdService } from '../services/deleteResponsiblesInstitutionalActivitiesById.service';

import AppIcon from '../../../shared/components/AppIcon.vue';
import { GetInstitutionalActivityWithTasksService } from '../services/getInstitutionalActivityWithTasks.service';
import { useHeaderStore } from '../../../stores/header.store';

const getInstitutionalActivityWithTasksService =
  new GetInstitutionalActivityWithTasksService();

const getAllRolesService = new GetAllRolesService();

const getResponsiblesInstitutionalActivitiesService =
  new GetResponsiblesInstitutionalActivitiesService();

const createOrUpdateResponsiblesInstitutionalActivitiesService =
  new CreateOrUpdateResponsiblesInstitutionalActivitiesService();
const createOrUpdateInstitutionalActivitiesService =
  new CreateOrUpdateInstitutionalActivitiesService();

const deleteResponsiblesInstitutionalActivitiesByIdService =
  new DeleteResponsiblesInstitutionalActivitiesByIdService();
export default defineComponent({
  name: 'InstitutionalTimelineForm',
  components: {

    AppButton,
    AppCard,
    AppModal,
    AppButtonDelete,
    AppPulseLoading,
    ResponsiblesModal,
    AppIcon,
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
    let title = Number(localStorage.getItem('institutionalActivityId'))
      ? 'Editar Evento Institucional'
      : 'Nuevo Evento Institucional';
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const data = ref();
    const academicPeriodId = ref(route.query.academicPeriodId);
    const loading = ref(true);

    const responsiblesList = ref<any[]>([]);
    const dataEvent = ref<any[]>([]);
    const usersByRole: Ref<any[]> = ref([]);
    const roles: Ref<any[]> = ref([]);
    const currentResponsible = ref<any>(null);

    const institutionalActivityId = ref(
      localStorage.getItem('institutionalActivityId')
    );
    const modalResponsibles = ref(false);
    const modalDeleteResponsibles = ref(false);
    const modalDelete = ref(false);

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
          academicPeriodId: {  },
          title: {  },
          requiresEvent: {},
          roleId: {},
          userId: {},
          color: {},
          startDate: {  },
          endDate: {  },
          supervisorUserId: {  },
          objective: {  },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Eventos', url: '' };
      headerStorage.moduleItem = { name: 'Cronograma institucional', url: '' };
      headerStorage.moduleSubItem = { name: title, url: '' };
        // if (Number(localStorage.getItem('institutionalActivityId'))) {
        await getDataResposible();
        await getDataUpdate();

        // }
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

        roles.value = await getAllRolesService.run();
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

    const saveUpdate = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          academicPeriodId:  Number(academicPeriodId.value),
          title: dataEvent.value.title,
          requiresEvent: dataEvent.value?.requiresEvent ? 1 : 0,
          // supervisorUserId: form.supervisorUserId,
          startDate: dataEvent.value?.startDate,
          endDate: dataEvent.value?.endDate,
          color: dataEvent.value?.color,
          responsibleInstitutionalActivityIds: responsiblesList.value.map(
            (item: any) => item.id
          ),
          // viewsInstitutionalActivityId: "",
          objective: dataEvent.value?.objective,
        };
        let response = await createOrUpdateInstitutionalActivitiesService.run(
          dataSend,
          Number(
            localStorage.getItem('institutionalActivityId')
          )
        );
        form.id = response.data.id;
        // await router.push({
        //   name: 'institutionalEvents.institutionalTimeline',
        // });
      } catch (e) {
        console.log(e);
      }
    };
    const saveResponsible = async () => {
      // const formIsValid = await v$.value.$validate();
      // if (!formIsValid) return;

      try {
        const dataSend = {
          userId: form.userId,
          roleId: form.roleId,
          institutionalActivityId: Number(
            localStorage.getItem('institutionalActivityId')
          ),
        };
        console.log('datasend:', dataSend);
        await createOrUpdateResponsiblesInstitutionalActivitiesService.run(
          dataSend
        );
        // await resetForm();
        await getDataResposible();
        await getDataUpdate();
      } catch (e) {
        console.log(e);
      }
    };

    const getDataResposible = async () => {
      let responseResponsible =
        await getResponsiblesInstitutionalActivitiesService.run(
          Number(localStorage.getItem('institutionalActivityId'))
        );
      responsiblesList.value = responseResponsible;


    };
    const getDataUpdate = async () => {
      let responseEvent = await getInstitutionalActivityWithTasksService.run(
        Number(localStorage.getItem('institutionalActivityId'))
      );
      dataEvent.value = responseEvent;
    };

    const deleteResposible = async (Responsible: any) => {
      try {
        currentResponsible.value = Responsible;

        if (currentResponsible.value) {
          await deleteResponsiblesInstitutionalActivitiesByIdService.run(
            currentResponsible.value.id
          );
        }
        currentResponsible.value = null;
        await getDataResposible();
      } catch (e) {
        console.log(e);
      }
    };

    const openModalResponsibles = (dataSelected: any | null) => {
      modalResponsibles.value = true;
    };
    // const openModalDeleteResponsibles = (dataProductTypes: any) => {
    //   modalDeleteResponsibles.value = true;
    //   currentDataResponsibles.value = dataProductTypes;
    // };
    // const deleteResponsibles = async () => {
    //   try {
    //     await deleteTaskByIdService.run(
    //       currentDataResponsibles.value?.id as number
    //     );
    //     await closeModalResponsibles();
    //   } catch (e) {
    //     console.log('This is error', e);
    //     loading.value = false;
    //   }
    // };
    const closeModalResponsibles = async () => {
      modalDeleteResponsibles.value = false;
      modalResponsibles.value = false;
      await getDataResposible();

      // productTask.value = await getAllProductTypesService.run();
    };
    return {
      loading,
      v$,
      t,
      saveUpdate,
      data,
      academicPeriodId,

      responsiblesList,
      deleteResposible,
      saveResponsible,
      roles,
      usersByRole,

      modalResponsibles,
      modalDeleteResponsibles,
      openModalResponsibles,
      // openModalDeleteResponsibles,
      // deleteResponsibles,
      closeModalResponsibles,
      institutionalActivityId,
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
