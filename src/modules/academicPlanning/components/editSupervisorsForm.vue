<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <p class="m-0">{{ academicPeriodGroup.journey.name }} {{ academicPeriodGroup.degree.level.name }}</p>
        <p class="m-0">{{ academicPeriodGroup.degree.name }} {{ academicPeriodGroup.group.name }}</p>

        <hr>

        <AppLoading v-if="loading"></AppLoading>

        <AppEmptyResponse
            v-if="notFound"
            :show-image="false"
        ></AppEmptyResponse>

        <span class="h6">{{ t('core.generalTerms.academic.supervisor.plural') }}</span>
        <ul class="ps-0">
          <li
              v-for="(supervisor, index) in v$.form.academicPeriodGroupSupervisors.$model" :key="supervisor.id"
              class="mb-1"
          >
            <div class="d-flex justify-content-between">
                            <span class="border w-85 p-2 rounded">
                                {{
                                supervisor.supervisorUserId?.people.names
                              }} {{ supervisor.supervisorUserId?.people.lastnames }}
                            </span>

              <AppButtonDelete
                  @click="openConfirmDelete(supervisor, index)"
              ></AppButtonDelete>
            </div>
          </li>
        </ul>

        <div v-if="showSelect">
          <label>{{ t('core.generalTerms.academic.supervisor.singular') }}*</label>

          <div class="d-flex justify-content-between">
            <v-select
                placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
                :reduce="(supervisor) => supervisor.id"
                :options="supervisors.value"
                v-model="supervisorUserId"
                @search="searchSupervisor"
                class="w-85"
                label="name"
            ></v-select>

            <AppButtonDelete
                @click="addSupervisor(false)"
            ></AppButtonDelete>
          </div>
        </div>

        <AppButtonNewContainer @click="addSupervisor(true)" class="mt-3"></AppButtonNewContainer>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal
              v-if="modalDelete"
              entity="core.generalTerms.academic.supervisor.singular"
              @confirmDelete="confirmDelete"
          ></AppConfirmDeleteModal>
        </AppModal>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';

import {debounce} from 'ts-debounce';
import {useVuelidate} from '@vuelidate/core';
import {required} from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import {SupervisorDto} from '../dtos/supervisor.dto';

import {GetAllUsersWithPaginationService} from '../services/getAllUsersWithPagination.service';
import {UpdateAcademicPeriodGroupSupervisorsService} from '../services/updateAcademicPeriodGroupSupervisors.service';
import {DeleteAcademicPeriodGroupSupervisorsService} from '../services/deleteAcademicPeriodGroupSupervisors.service';
import {GetSupervisorsByAcademicPeriodGroupIdService} from '../services/getSupervisorsByAcademicPeriodGroupId.service';
import {useI18n} from 'vue-i18n';

const getSupervisorsByAcademicPeriodGroupIdService = new GetSupervisorsByAcademicPeriodGroupIdService();
const updateAcademicPeriodGroupSupervisorsService = new UpdateAcademicPeriodGroupSupervisorsService();
const deleteAcademicPeriodGroupSupervisorsService = new DeleteAcademicPeriodGroupSupervisorsService();
const getAllUsersWithPaginationService = new GetAllUsersWithPaginationService();

export default defineComponent({
  name: 'EditSupervisorsForm',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    AppButton,
    AppEmptyResponse,
    AppButtonDelete,
    AppFormModal,
    AppLoading,
    AppModal,
  },

  props: ['academicPeriodGroup'],
  emits: ['close'],

  setup(props, {emit}) {
    const {t} = useI18n();
    const academicPeriodGroup = props.academicPeriodGroup;
    let title = 'core.edit core.generalTerms.academic.supervisor.plural';

    const form = reactive({
      academicPeriodGroupSupervisors: [] as any,
    });
    const v$ = useVuelidate({
      form: {
        academicPeriodGroupSupervisors: {},
      },
    }, {form});

    const modalDelete = ref(false);
    const supervisorUserId = ref();
    const showSelect = ref(false);
    const notFound = ref(false);
    const indexToDelete = ref();
    const loading = ref(true);

    const currentDataDelete: { value: SupervisorDto | null } = reactive({
      value: null,
    });
    const supervisors: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      loading.value = true;

      await getSupervisors();

      loading.value = false;
    });

    const getSupervisors = async () => {
      const supervisorsByAcademicPeriodGroupId = await getSupervisorsByAcademicPeriodGroupIdService.run(academicPeriodGroup.id);

      notFound.value = !supervisorsByAcademicPeriodGroupId.length;
      supervisorsByAcademicPeriodGroupId.forEach((supervisor: any) => {
        form.academicPeriodGroupSupervisors.push(createSupervisorForm(supervisor));
      });
    };

    const createSupervisorForm = (data: any) => {
      return {
        academicPeriodGroupId: academicPeriodGroup.id,
        supervisorUserId: data?.user,
        id: data?.id,
      };
    };

    const addSupervisor = async (show: boolean) => {
      showSelect.value = show;

      if (supervisors.value.length && show) {
        form.academicPeriodGroupSupervisors.push(createSupervisorForm(null));

        supervisors.value.forEach((user) => {
          if (user.id == supervisorUserId.value) {
            let index = form.academicPeriodGroupSupervisors.length - 1;
            form.academicPeriodGroupSupervisors[index].supervisorUserId = user;
          }
        });
      }

      supervisors.value = [];
      supervisorUserId.value = null;
    };

    const searchSupervisor = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          supervisors.value = [];
          const response = await getAllUsersWithPaginationService.run({search: search});

          response.data.forEach((supervisor: any) => {
            supervisors.value.push({
              ...supervisor,
              name: supervisor.people.names + ' ' + supervisor.people.lastnames,
            });
          });
        } else {
          supervisors.value = [];
        }

        loading(false);
      }
    }, 800);

    const save = async () => {
      if (supervisorUserId.value) {
        addSupervisor(true);
      }

      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        form.academicPeriodGroupSupervisors.forEach((data: any) => {
          data.id = data.id ?? null;
          data.supervisorUserId = data.supervisorUserId.id;
        });

        await updateAcademicPeriodGroupSupervisorsService.run(form);
        emit('close');
      } catch (e) {
      }
    };

    const openConfirmDelete = async (data: SupervisorDto, index: number | string | null) => {
      indexToDelete.value = index;
      modalDelete.value = true;
      currentDataDelete.value = data;
    };
    const confirmDelete = async () => {
      if (currentDataDelete.value?.id) {
        await deleteAcademicPeriodGroupSupervisorsService.run(currentDataDelete.value.id);
      }

      form.academicPeriodGroupSupervisors.splice(indexToDelete.value, 1);

      modalDelete.value = false;
    };

    return {
      t,
      academicPeriodGroup,
      title,
      save,
      v$,

      supervisorUserId,
      modalDelete,
      supervisors,
      showSelect,
      notFound,
      loading,

      openConfirmDelete,
      searchSupervisor,
      addSupervisor,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.w-85 {
  width: 85%;
}
</style>