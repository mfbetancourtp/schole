<template>
  <AppLoading v-if="loading" />

  <form v-else @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.userId" label="core.generalTerms.academic.student.singular">
          <AppAutocomplete v-model="v$.form.userId.$model" @search="searchUserForSelect" :options="users.value" />
        </AppFormField>

        <AppFormField :form-control="v$.form.annotations" label="access.medicalRecord.form.annotations">
          <AppVoiceInput v-model="v$.form.annotations.$model" textareaClass="form-control" />

        </AppFormField>

        <AppFormField :form-control="v$.form.consultationDate" label="access.medicalRecord.form.consultationDate">
          <input v-model="v$.form.consultationDate.$model" class="form-control" type="datetime-local" />
        </AppFormField>
        <AppFormField  :form-control="v$.form.wellnessAreaId" label="core.generalTerms.academic.wellnessAreas.singular">
          <v-select input-id="journey-id" v-model="v$.form.wellnessAreaId.$model" :reduce="(wellnessArea: any) => wellnessArea.id" :options="wellnessAreasList" label="name"></v-select>
      </AppFormField>
      </template>
      <template v-slot:actions>
        <AppButton :label="'core.save'" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { MedicalRecordDto } from '../dtos/medicalRecord.dto';

import { GetUsersForSelectStudentService } from '../services/getUsersForSelectStudent.service';
import { CreateOrUpdateMedicalRecordService } from '../services/createOrUpdateMedicalRecord.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateMedicalRecordService = new CreateOrUpdateMedicalRecordService();
const getUsersForSelectStudentService = new GetUsersForSelectStudentService();

export default defineComponent({
  name: 'MedicalRecordsForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppLoading,
    AppAutocomplete,
    AppVoiceInput,
  },

  props: {
    medicalRecord: {
      type: Object as PropType<MedicalRecordDto | null>,
      default: null,
    },
    wellnessAreasList: {
      type: Array,
      required: true,
    }
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const medicalRecord = props.medicalRecord ?? null;
    const title = medicalRecord ? 'core.edit access.medicalRecord.singular' : 'core.new access.medicalRecord.singular';

    const loading = ref(true);

    const form = reactive({
      userId: medicalRecord?.userId ?? null,
      annotations: medicalRecord?.annotations ?? '',
      consultationDate: medicalRecord ? dayjs(medicalRecord.consultationDate).format('YYYY-MM-DD HH:mm') : null,
      wellnessAreaId:  medicalRecord?.wellnessAreaId ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },
          annotations: { required },
          consultationDate: { required },
          wellnessAreaId: { required }
        },
      },
      { form }
    );

    const users: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      if (medicalRecord) await searchUser(medicalRecord.user.people.names);

      loading.value = false;
    });

    const searchUser = async (name: string) => {
      users.value = [];

      try {
        const response = await getUsersForSelectStudentService.run({ search: name });

        response.data.forEach((user: any) => {
          users.value.push({
            ...user,
            name: user.people.names + ' ' + user.people.lastnames,
          });
        });
      } catch (e) {
        console.log(e);
      }
    };

    const searchUserForSelect = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) await searchUser(search);
        else users.value = [];

        loading(false);
      }
    }, 800);

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          userId: form.userId,
          annotations: form.annotations,
          wellnessAreaId: form.wellnessAreaId,
          consultationDate: `${form.consultationDate?.replace('T', ' ')}:00`,
        };

        await createOrUpdateMedicalRecordService.run(dataSend, medicalRecord?.id);
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
      t,

      users,

      searchUserForSelect,
    };
  },
});
</script>
