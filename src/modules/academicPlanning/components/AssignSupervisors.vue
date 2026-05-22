<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <h6>
          {{ academicPeriodGroup.journey.name }}
          {{ academicPeriodGroup.degree.level.name }}
        </h6>

        <AppFormField :form-control="v$.form.supervisorUserId" label="core.generalTerms.academic.coordinator">
          <v-select
            input-id="supervisorId"
            placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
            v-model="v$.form.supervisorUserId.$model"
            :reduce="(supervisor: any) => supervisor.id"
            :options="supervisors.value"
            @search="searchSupervisor"
            label="name"
          ></v-select>
        </AppFormField>

        <AppFormField :form-control="v$.form.academicPeriodGroupIds" label="core.generalTerms.academic.group.plural">
          <v-select input-id="groupId" v-model="v$.form.academicPeriodGroupIds.$model" :reduce="(course: any) => course.id" :options="courses.value" label="name" multiple></v-select>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { debounce } from 'ts-debounce';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetAllUsersWithPaginationService } from '../services/getAllUsersWithPagination.service';
import { CreateAcademicPeriodGroupSupervisorsService } from '../services/createAcademicPeriodGroupSupervisors.service';

const getAllUsersWithPaginationService = new GetAllUsersWithPaginationService();
const createAcademicPeriodGroupSupervisorsService = new CreateAcademicPeriodGroupSupervisorsService();

export default defineComponent({
  name: 'AssignSupervisorsForm',
  components: { AppFormModal, AppButton, AppFormField },

  props: ['academicPeriodGroup'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'core.new core.generalTerms.academic.coordinator';

    const form = reactive({
      supervisorUserId: null,
      academicPeriodGroupIds: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          supervisorUserId: { required },
          academicPeriodGroupIds: { required },
        },
      },
      { form }
    );

    const courses: { value: any[] } = reactive({
      value: [],
    });
    const supervisors: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      props.academicPeriodGroup.courses.forEach((course: any) => {
        courses.value.push({
          ...course,
          name: course.degree.name + ' ' + course.group.name,
        });
      });
    });

    const searchSupervisor = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length < 2) {
          supervisors.value = [];
        }

        if (search.length >= 2) {
          supervisors.value = [];
          const response = await getAllUsersWithPaginationService.run({
            search: search,
          });

          response.data.forEach((supervisor: any) => {
            supervisors.value.push({
              ...supervisor,
              name: supervisor.people.names + ' ' + supervisor.people.lastnames,
            });
          });
        }

        loading(false);
      }
    }, 800);

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createAcademicPeriodGroupSupervisorsService.run(form);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      supervisors,
      courses,
      title,
      save,
      v$,

      searchSupervisor,
    };
  },
});
</script>

<style scoped></style>
