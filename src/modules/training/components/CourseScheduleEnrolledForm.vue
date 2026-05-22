<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <AppFormField label="Seleccione la unidad organizacional">
            <AppAutocomplete v-model="organizationalUnitId" :options="orgaUnitWithEmployees" :clearable="false"></AppAutocomplete>
          </AppFormField>

          <AppFormField :form-control="v$.form.courseInscriptions">
            <h5 class="mb-0">Colaboradores</h5>
          </AppFormField>

          <AppEmptyResponse v-if="!employees.length" :show-image="false" :subtitle="false"></AppEmptyResponse>

          <template v-else>
            <template v-for="(employee, index) in employees" :key="index">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="selectedEmployees"
                  :id="`${index}_employee`"
                  :value="{
                    userId: employee.people.userId,
                    employeeId: employee.id,
                  }"
                />

                <label :for="`${index}_employee`" class="form-check-label">
                  {{ `${employee.people.names ?? ''} ${employee.people.lastnames ?? ''} - ${employee.organizationalJob.name}` }}
                </label>
              </div>
            </template>
            <br />
            <div class="quotas">
              <h1>{{ quotasMessage }}</h1>
            </div>
          </template>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { PostCourseInscFromArrayService } from '../services/postCourseInscFromArray.service';
import { GetOrgaUnitWithEmployeesService } from '../services/getOrgaUnitWithEmployees.service';

const getOrgaUnitWithEmployeesService = new GetOrgaUnitWithEmployeesService();
const postCourseInscFromArrayService = new PostCourseInscFromArrayService();

export default defineComponent({
  name: 'CourseScheduleEnrolledForm',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
  },

  props: {
    courseId: {
      type: Number,
      required: true,
    },
    quotasAvailable: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const title = 'Agregar colaboradores';

    const orgaUnitWithEmployees: Ref<any[]> = ref([]);
    const selectedEmployees: Ref<any[]> = ref([]);
    const employees: Ref<any[]> = ref([]);
    const quotasMessage = ref('');

    const organizationalUnitId = ref();

    const loading = ref(true);

    const form = reactive({
      courseId: props.courseId,
      courseInscriptions: [] as any[],
    });
    const v$ = useVuelidate(
      {
        form: {
          courseId: { required },
          courseInscriptions: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        orgaUnitWithEmployees.value = await getOrgaUnitWithEmployeesService.run();

        if (orgaUnitWithEmployees.value.length) organizationalUnitId.value = orgaUnitWithEmployees.value[0].id;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(organizationalUnitId, async () => {
      orgaUnitWithEmployees.value.forEach((item) => {
        if (organizationalUnitId.value == item.id) {
          employees.value = item.employees;
        }
      });
    });

    const save = async () => {
      form.courseInscriptions = selectedEmployees.value;

      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      console.log('inscritos', form.courseInscriptions.length);
      console.log('quotas', props.quotasAvailable);
      if (form.courseInscriptions.length > props.quotasAvailable) {
        quotasMessage.value = 'Cupos Superados';
        return;
      }

      try {
        await postCourseInscFromArrayService.run(form);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      save,
      v$,

      orgaUnitWithEmployees,
      organizationalUnitId,
      selectedEmployees,
      employees,
      quotasMessage,
    };
  },
});
</script>

<style scoped>
.quotas {
  text-align: center;
}
</style>
