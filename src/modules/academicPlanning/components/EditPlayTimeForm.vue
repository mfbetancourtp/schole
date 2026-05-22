<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.playTimeIds" label="core.generalTerms.academic.playTimes.plural">
          <AppAutocomplete v-model="v$.form.playTimeIds.$model" :options="dataPlayTimes" label="name" multiple></AppAutocomplete>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, Ref, onMounted } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute } from 'vue-router';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { AcademicPeriodGroupsRelatedDataFormDto } from '../dtos/academicPeriodGroupsRelatedDataForm.dto';

import { CreateOrUpdatePlayTimesService } from '../services/createOrUpdatePlayTimes.service';
import { CreateOrUpdateTimesTablesService } from '../services/createOrUpdateTimesTables.service';
import { GetAcademicPeriodGroupsRelatedDataFormService } from '../services/getAcademicPeriodGroupsRelatedDataForm.service';
import { GetUserToEditByIdService } from '../../access/services/getUserToEditById.service';

const createOrUpdatePlayTimesService = new CreateOrUpdatePlayTimesService();
const createOrUpdateTimesTablesService = new CreateOrUpdateTimesTablesService();
const getAcademicPeriodGroupsRelatedDataFormService = new GetAcademicPeriodGroupsRelatedDataFormService();
const getUserToEditByIdService = new GetUserToEditByIdService();

export default defineComponent({
  name: 'EditQuotaForm',
  components: { AppFormModal, AppButton, AppFormField, AppAutocomplete },

  props: ['relatedDataForm', 'academicPeriodGroup', 'dataPlayTimes', 'academicPeriodGroupId'],
  emits: ['close'],

  setup(props, { emit }) {
    const data = props.academicPeriodGroup ?? null;
    const service: Ref<any[]> = ref([]);
    const route = useRoute();
    const userId = ref();

    let title = 'Editar Recesos';
    const relatedDataForms: {
      value: AcademicPeriodGroupsRelatedDataFormDto | any;
    } = reactive({
      value: null,
    });
    console.log('data', data);
    console.log('academicPeriodGroupId', props.academicPeriodGroupId);

    const form = reactive({
      playTimeIds: data?.playTimeIds ? data.playTimeIds.split(',').map((id: any) => parseInt(id, 10)) : [],
      academicPeriodGroupId: props.academicPeriodGroupId,
      dayWeek: data?.dayWeek ?? 0,
      startTime: data?.startTime ?? null,
      endTime: data?.endTime ?? null,
      courseId: data?.id ?? null,
    });
    console.log('form', form);

    const v$ = useVuelidate(
      {
        form: {
          playTimeIds: {},
          academicPeriodGroupId: { required },
        },
      },
      { form }
    );
    onMounted(async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser); // Convierte la cadena JSON a un objeto
            userId.value = user.id; // Accede al `id`
            console.log('userId:', userId.value);
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        } else {
          console.warn('No user found in localStorage');
        }
        // let responsive = await getAcademicPeriodGroupsRelatedDataFormService.run({
        //   journeyId: data.journeyId,
        // });

        // playTimes.value = responsive.playTimes;
      } catch (e) {
        console.log(e);
      }
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        // userId.value = parseInt(route.params.userId.toString());
        const userData = await getUserToEditByIdService.run(parseInt(userId.value));
        console.log('userDatauserData', userData);

        service.value = [userData];

        const params = {
          dayWeek: form.dayWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          courseId: form.courseId,
          teacherPeopleId: service.value[0].people.id,
          academicPeriodGroupId: form.academicPeriodGroupId,
          change: 1,
        };

        await createOrUpdatePlayTimesService.run(form, data?.id);
        await createOrUpdateTimesTablesService.run(params);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      emit,
    };
  },
});
</script>

<style scoped>
.quotas {
  text-align: center;
}
</style>
