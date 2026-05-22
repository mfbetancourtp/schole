<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.roleId">
            <label for="roles">Roles</label>
            <AppAutocomplete
              v-model="v$.form.roleId.$model"
              :input-id="'roleId'"
              :options="roles"
              :clearable="false"
              class="bg-white"
            ></AppAutocomplete>
          </AppFormField>
          <AppFormField :form-control="v$.form.userId">
            <label for="roles">Usuarios</label>
            <AppAutocomplete
              v-model="v$.form.userId.$model"
              :input-id="'userID'"
              label="names"
              :options="usersByRole"
              :clearable="false"
              class="bg-white"
            ></AppAutocomplete>
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, Ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
// import AppButtonLoading from '../../../shared/components/Buttons/AppButtonLoading.vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
// import { CreateOrUpdateProductTypesService } from '../../Contracts/services/AdministrationsContracts/createOrUpdateProductTypes.service';

import { GetUserByRoleService } from '../../reports/services/reports/getUserByRole.service';
import { CreateOrUpdateResponsiblesInstitutionalActivitiesService } from '../services/createOrUpdateResponsiblesInstitutionalActivities.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

const createOrUpdateResponsiblesInstitutionalActivitiesService = new CreateOrUpdateResponsiblesInstitutionalActivitiesService();
const getUserByRoleService = new GetUserByRoleService();


export default defineComponent({
  name: 'StorageModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppAutocomplete,
    // AppButtonLoading,
  },
  props: {
    roles: {
      type: Object as PropType<any | null>,
    },

    scaleUnitsList: {
      type: Array as PropType<any[]>,
    },
    activitiesId: {
      type: Number,
    },
    responsiblesList:{
      type: Array as PropType<any[]>,
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const usersByRole: Ref<any[]> = ref([]);
    let title = 'Agregar Responsable';
  
    const loading = ref(true);
    const form = reactive({
      roleId: null,
      userId: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          roleId: { required },
          userId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {

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

       
      } catch (e) {
        console.log(e);
      }
    });
    watch(
        () => form.roleId,
        async (value) => {
          if (value) await selectUsersByRole(form.roleId);
        }
      );
      loading.value = false;

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;
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
        emit('close');

      } catch (e) {
        console.log(e);
      }
    };
    const selectUsersByRole = async (roleId: any) => {
      usersByRole.value = await getUserByRoleService.run(roleId);
    };
    return {
      title,
      loading,
      v$,
      save,
      usersByRole,
      emit,
    };
  },
});
</script>
