<template>
  <AppLoading v-if="loading"></AppLoading>

  <form @submit.prevent="save" style="max-width: 100%; padding: 0 20px">

    <div class="form-row">
      <AppFormField :form-control="v$.form.title" label="Titulo">
        <input
          v-model="v$.form.title.$model"
          id="title"
          class="form-control"
          type="text"
          pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
          title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
        />
      </AppFormField>
      <!-- {{ academicPeriodId }} -->
      <AppFormField :form-control="v$.form.color" label="Color" class="col-1">
        <input
          class="form-control form-control-color"
          type="color"
          id="title"
          v-model="v$.form.color.$model"
        />
      </AppFormField>
      <AppFormField
        class="col-2"
        :form-control="v$.form.requiresEvent"
        label="Mostrar en agenda?"
      >
        <div class="mt-2 form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="requiresEvent"
            v-model="v$.form.requiresEvent.$model"
          />
        </div>
      </AppFormField>
    </div>
    <div class="form-row">
      <AppFormField :form-control="v$.form.startDate" label="Desde">
        <input
          v-model="v$.form.startDate.$model"
          id="startDate"
          class="form-control"
          type="date"
        />
      </AppFormField>

      <AppFormField :form-control="v$.form.endDate" label="Hasta">
        <input
          v-model="v$.form.endDate.$model"
          id="endDate"
          class="form-control"
          type="date"
        />
      </AppFormField>
    </div>
    <div>
      <AppFormField :form-control="v$.form.objective" :label="'Orden del día'">
        <AppVoiceInput v-model="v$.form.objective.$model"
          id="objective"
          :rows="3"
              textareaClass="form-control"  />
      </AppFormField>
    </div>
    <div class="form-row d-flex justify-content-end mb-3">
      <AppButton
        class=" buttons"
        label="Guardar"
        @click="save"
      >
      </AppButton>
    </div>
  </form>
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
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
// import ScheduleParticipantsForm from '../components/ScheduleParticipantsForm.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetAllRolesService } from '../../access/services/getAllRoles.service';
import { GetUserByRoleService } from '../../reports/services/reports/getUserByRole.service';

import { CreateOrUpdateInstitutionalActivitiesService } from '../services/createOrUpdateInstitutionalActivities.service';
import { GetResponsiblesInstitutionalActivitiesService } from '../services/getResponsiblesInstitutionalActivities.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateInstitutionalActivitiesService =
  new CreateOrUpdateInstitutionalActivitiesService();
export default defineComponent({
  name: 'InstitutionalTimelineForm',
  components: {
    AppFormField,
    AppLoading,
    AppButton,
    AppVoiceInput
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
    const academicPeriodGeneralId = ref(route.query.academicPeriodId);
    const loading = ref(true);
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
        const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Eventos', url: '' };
      headerStorage.moduleItem = { name: 'Cronograma institucional', url: '' };
      headerStorage.moduleSubItem = { name: title, url: '' };
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

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          academicPeriodId: form.academicPeriodId,
          title: form.title,
          requiresEvent: form.requiresEvent ? 1 : 0,
          // supervisorUserId: form.supervisorUserId,
          startDate: form.startDate,
          endDate: form.endDate,
          color: form.color,
          objective: form.objective,
        };
        console.log('datasend:', dataSend);
        let response = await createOrUpdateInstitutionalActivitiesService.run(
          dataSend,
          form.id
        );
        localStorage.setItem('institutionalActivityId', response.data.id.toString());
        await router.push({ name: 'institutionalEvents.institutionalTimelineEdit', params: { institutionalActivityId: response.data.id },query:  {academicPeriodId: academicPeriodGeneralId.value}  });

        form.id = response.data.id;
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,
      t,

      save,
      data,
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
