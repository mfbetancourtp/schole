<template>
  <AppLoading v-if="loading"></AppLoading>

  <form v-else @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <template v-if="parentOrganizationalJob?.name">
          <h5 class="text-end">
            <span style="font-size: 1rem">Cargo superior:</span>
            <span style="font-weight: 400">{{ parentOrganizationalJob.name }}</span>
          </h5>

          <hr />
        </template>

        <div class="form-row">
          <AppFormField :form-control="v$.form.organizationalUnitId" label="Unidad organizacional">
            <AppAutocomplete v-model="v$.form.organizationalUnitId.$model" :input-id="'organizationalUnitId'" :options="organizationalUnits"></AppAutocomplete>
          </AppFormField>

          <AppFormField :form-control="v$.form.hierarchicalLevel" label="Nivel" class="col-3">
            <input disabled type="number" class="form-control" id="hierarchicalLevel" v-model="v$.form.hierarchicalLevel.$model" />
          </AppFormField>
        </div>

        <div class="form-row">
          <AppFormField :form-control="v$.form.code" label="Código" class="col-3">
            <input type="text" class="form-control" id="code" v-model="v$.form.code.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.name" label="Nombre">
            <input type="text" class="form-control" id="name" v-model="v$.form.name.$model" />
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'"></AppButton>
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
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetOrganizationalJobByIdService } from '../services/getOrganizationalJobById.service';
import { CreateOrUpdateOrganizationalJobsService } from '../services/createOrUpdateOrganizationalJobs.service';

const createOrUpdateOrganizationalJobsService = new CreateOrUpdateOrganizationalJobsService();
const getOrganizationalJobByIdService = new GetOrganizationalJobByIdService();

export default defineComponent({
  name: 'OrganizationChartForm',
  components: {
    AppAutocomplete,
    AppFormModal,
    AppFormField,
    AppLoading,
    AppButton,
  },

  props: ['organizationalJobId', 'levelKey', 'organizationalUnits'],
  emits: ['close'],

  setup(props, { emit }) {
    const title = props.levelKey == 'edit' ? 'Editar cargo' : 'Crear cargo';

    const parentOrganizationalJob: Ref<any> = ref(null);

    const organizationalJobId = ref();

    const loading = ref(true);

    const form = reactive({
      organizationalUnitId: null,
      code: '',
      name: '',
      hierarchicalLevel: null,
      parentOrganizationalJobId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          organizationalUnitId: { required },
          code: { required },
          name: { required },
          hierarchicalLevel: { required },
          parentOrganizationalJobId: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        let currentOrganizationalJob: any = {};

        if (props.organizationalJobId != 'undefined') {
          currentOrganizationalJob = await getOrganizationalJobByIdService.run(props.organizationalJobId);
        }

        if (props.levelKey == 'edit') {
          organizationalJobId.value = currentOrganizationalJob.id;

          form.organizationalUnitId = currentOrganizationalJob.organizationalUnitId ?? null;
          form.code = currentOrganizationalJob.code ?? '';
          form.name = currentOrganizationalJob.name ?? '';
          form.hierarchicalLevel = currentOrganizationalJob.hierarchicalLevel ?? null;
          form.parentOrganizationalJobId = currentOrganizationalJob.parentOrganizationalJobId ?? null;
        } else if (props.levelKey == 'brother') {
          parentOrganizationalJob.value = await getOrganizationalJobByIdService.run(currentOrganizationalJob.parentOrganizationalJobId);

          form.hierarchicalLevel = parentOrganizationalJob.value?.hierarchicalLevel ? parentOrganizationalJob.value.hierarchicalLevel + 1 : 1;
          form.parentOrganizationalJobId = currentOrganizationalJob.parentOrganizationalJobId ?? null;
        } else if (props.levelKey == 'child') {
          parentOrganizationalJob.value = currentOrganizationalJob;

          form.hierarchicalLevel = parentOrganizationalJob.value?.hierarchicalLevel ? parentOrganizationalJob.value.hierarchicalLevel + 1 : 1;
          form.parentOrganizationalJobId = parentOrganizationalJob.value.id ?? null;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateOrganizationalJobsService.run(form, organizationalJobId.value);
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

      parentOrganizationalJob,
    };
  },
});
</script>

<style scoped></style>
