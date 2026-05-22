<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.statusId" label="Estados">
          <AppAutocomplete v-model="v$.form.statusId.$model" :input-id="'statusId'" :options="relationships" :disabled="data?.statusId"> </AppAutocomplete>
        </AppFormField>

        <div>
          <label></label>
        </div>

        <div class="d-flex align-items-center">
          <label for="isActive" class="me-2">Inactivo</label>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="isActive" v-model="v$.form.isActive.$model" />
          </div>
          <label for="isActive" class="ms-2">Activo</label>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetAllStatusAdministrationService } from '../services/getAllStatusAdministration.service';
import { CreateOrUpdateStatusBudgetValidityService } from '../services/createOrUpdateStatusBudgetValidityService';

const createOrUpdateStatusBudgetValidityService = new CreateOrUpdateStatusBudgetValidityService();
const getAllStatusAdministrationService = new GetAllStatusAdministrationService();

export default defineComponent({
  name: 'RoleForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppButton,
  },

  props: ['data', 'profiles'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'Nuevo estado';
    const data = props.data ?? null;
    const relationships = ref();
    const loading = ref(true);
    const states = ref(null);
    const route = useRoute();
    const budgetValidityId = parseInt(route.params.StatusId.toString(), 10);

    if (props.data?.id) title = 'Editar estado';

    const form = reactive({
      statusId: props.data?.statusId,
      budgetValidityId: budgetValidityId,
      isActive: props.data?.isActive ? true : false,
    });

    const v$ = useVuelidate(
      {
        form: {
          statusId: { required },
          budgetValidityId: {},
          isActive: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        let relatedDataForm = await getAllStatusAdministrationService.run();
        relationships.value = relatedDataForm;
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) return;

      try {
        await createOrUpdateStatusBudgetValidityService.run(form, data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      relationships,
      states,
      title,
      save,
      v$,
      emit,
    };
  },
});
</script>

<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.modal-container {
  background: #fff; /* Fondo blanco para el contenido */
  border-radius: 8px;
  padding: 20px;
  z-index: 1000;
  position: relative;
}
</style>
