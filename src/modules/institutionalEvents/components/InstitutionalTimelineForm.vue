<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack
        :to="{ name: 'institutionalEvents.institutionalTimeline' }"
      ></AppButtonBack>
    </template>

    <template v-slot:content>
      <div style="background-color: rgb(255, 255, 255); box-shadow: rgba(0, 0, 0, 0.45) 1px 2px 6px; height: calc(-230px + 100vh); overflow: auto;">
      <AppVerticalStepper>
        <AppVerticalStep name="Actividad Institucional" >
          <ConfigurationEventFormStep ref="generalCurriculumStepRef" :isDocExpanded="isPreviewExpanded" :data="data">
          </ConfigurationEventFormStep>
        </AppVerticalStep>
        <AppVerticalStep v-if="institutionalActivityId" name="Asignar Responsables">
          <ConfigurationResposiblesFormStep :isDocExpanded="isPreviewExpanded"></ConfigurationResposiblesFormStep>

         
        </AppVerticalStep>

        <AppVerticalStep v-if="institutionalActivityId" name="Participantes" items="Administrativos">
          <ConfigurationParticipantsFormStep :isDocExpanded="isPreviewExpanded"></ConfigurationParticipantsFormStep>
        </AppVerticalStep>

        <AppVerticalStep v-if="institutionalActivityId" name="Tareas">
          <ConfigurationTaskEventFormStep :isDocExpanded="isPreviewExpanded"></ConfigurationTaskEventFormStep>
        </AppVerticalStep>
      </AppVerticalStepper>
    </div>
    </template>
  </AppBaseList>
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

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetAllRolesService } from '../../access/services/getAllRoles.service';
import { GetUserByRoleService } from '../../reports/services/reports/getUserByRole.service';
import AppVerticalStepper from '../../../shared/components/VerticalStepper/AppVerticalStepper.vue';
import AppVerticalStep from '../../../shared/components/VerticalStepper/AppVerticalStep.vue';
import ConfigurationEventFormStep from '../components/ConfigurationEventFormStep.vue';
import ConfigurationResposiblesFormStep from '../components/ConfigurationResposiblesFormStep.vue';
import ConfigurationParticipantsFormStep from '../components/ConfigurationParticipantsFormStep.vue';
import ConfigurationTaskEventFormStep from '../components/ConfigurationTaskEventFormStep.vue';


import { CreateOrUpdateInstitutionalActivitiesService } from '../services/createOrUpdateInstitutionalActivities.service';
import { CreateOrUpdateResponsiblesInstitutionalActivitiesService } from '../services/createOrUpdateResponsiblesInstitutionalActivities.service';
import { GetResponsiblesInstitutionalActivitiesService } from '../services/getResponsiblesInstitutionalActivities.service';
import { DeleteResponsiblesInstitutionalActivitiesByIdService } from '../services/deleteResponsiblesInstitutionalActivitiesById.service';
import { DeleteTaskByIdService } from '../services/deleteTaskById.service';






import { GetInstitutionalActivityWithTasksService } from '../services/getInstitutionalActivityWithTasks.service';


const getInstitutionalActivityWithTasksService = new GetInstitutionalActivityWithTasksService();





const getAllRolesService = new GetAllRolesService();
const getUserByRoleService = new GetUserByRoleService();

const createOrUpdateInstitutionalActivitiesService =
  new CreateOrUpdateInstitutionalActivitiesService();
const createOrUpdateResponsiblesInstitutionalActivitiesService =
  new CreateOrUpdateResponsiblesInstitutionalActivitiesService();
const getResponsiblesInstitutionalActivitiesService =
  new GetResponsiblesInstitutionalActivitiesService();
const deleteResponsiblesInstitutionalActivitiesByIdService =
  new DeleteResponsiblesInstitutionalActivitiesByIdService();

const deleteTaskByIdService = new DeleteTaskByIdService();
export default defineComponent({
  name: 'InstitutionalTimelineForm',
  components: {
    AppButtonBack,
    AppBaseList,
    AppLoading,
    ConfigurationEventFormStep,
    ConfigurationResposiblesFormStep,
    ConfigurationParticipantsFormStep,
    ConfigurationTaskEventFormStep,
    AppVerticalStepper,
    AppVerticalStep,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
      required: true,
    },
    institutionalActivityId: {
      type: Number,
    }
  },

  setup(props) {
    // let title = props.data?.id
    //   ? 'Editar Evento Institucional'
    //   : 'Nuevo Evento Institucional';
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();




    const data: Ref<any> = ref(null);






    const isPreviewExpanded = ref(false);
    const togglePreview = () => {
        isPreviewExpanded.value = !isPreviewExpanded.value;
    };
    const generalEvenStepRef = ref<InstanceType<typeof ConfigurationEventFormStep> | null>(null);


    const academicPeriodId = ref(route.query.academicPeriodId);
    const showTasksSection = ref(false);
    const roles: Ref<any[]> = ref([]);
    const usersByRole: Ref<any[]> = ref([]);

    const loading = ref(true);
    const currentInstitutionalActivities: Ref<any | null> = ref(null);
    const InstitutionalActivitiesForm = ref(false);
    const scheduleParticipantsModal = ref(false);
    const modalDelete = ref(false);

    const productTask = ref<any[]>([]);
    const currentDataTask = ref<any | null>();
    const modalTask = ref(false);
    const modalDeleteTask = ref(false);


    const responsiblesList = ref<any[]>([]);
    const currentResponsible = ref<any>(null);
      const institutionalActivityId = ref(
        props.institutionalActivityId
        );

    onMounted(async () => {
      try {
        
        if (Number(props.institutionalActivityId)){

        const institutionalActivityId = Number(props.institutionalActivityId);
        data.value = await getInstitutionalActivityWithTasksService.run(institutionalActivityId);
        localStorage.setItem('institutionalActivityId', institutionalActivityId.toString());
      }else{
        localStorage.setItem('institutionalActivityId', ''.toString());

      }


      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
  

    
    return {
      loading,
      t,

      data,
      InstitutionalActivitiesForm,
      currentInstitutionalActivities,
      scheduleParticipantsModal,

      showTasksSection,
      modalDelete,
      roles,
      academicPeriodId,
      usersByRole,
      responsiblesList,

      productTask,
      currentDataTask,
      modalTask,
      modalDeleteTask,
      isPreviewExpanded,
      generalEvenStepRef,
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
.content-body{
  padding: unset!important;
}

</style>
