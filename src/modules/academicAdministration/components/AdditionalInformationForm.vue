<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <AppFormField :form-control="v$.form.convocationId" label="Seleccione la convocatoria donde se solicitó la información complementaria">
            <AppAutocomplete v-model="v$.form.convocationId.$model" label="title" :options="listConvocations" :clearable="false"></AppAutocomplete>
          </AppFormField>
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
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetListConvocationsService } from '../services/getListConvocatios.service';
import { PostEnrolMatriculateService } from '../services/postEnrolMatriculate.service';

const getListConvocationsService = new GetListConvocationsService();
const postEnrolMatriculateService = new PostEnrolMatriculateService();

export default defineComponent({
  name: 'AdditionalInformationForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
  },

  props: {
    matriculateId: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const title = 'Inscribir en la convovatoria';

    const listConvocations: Ref<any[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      convocationId: null,
      matriculateId: props.matriculateId,
    });
    const v$ = useVuelidate(
      {
        form: {
          convocationId: { required },
          matriculateId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        listConvocations.value = await getListConvocationsService.run();

        if (listConvocations.value.length) form.convocationId = listConvocations.value[0].id;
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
          convocationId: form.convocationId,
          matriculateId: form.matriculateId,
        };
        await postEnrolMatriculateService.run(dataSend);
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

      listConvocations,
    };
  },
});
</script>

<style scoped></style>
