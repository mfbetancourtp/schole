<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <h5>{{ step.ConvocationStepType.name }}: {{ step.title }}</h5>

        <div>
          <AppFormField :form-control="v$.form.applyOnlyOlds" class="form-check">
            <input v-model="v$.form.applyOnlyOlds.$model" id="applyOnlyOlds" class="form-check-input" type="checkbox" />

            <label class="form-check-label" for="applyOnlyOlds"> Aplica antiguos </label>
          </AppFormField>

          <AppFormField :form-control="v$.form.applyOnlyNew" class="form-check">
            <input v-model="v$.form.applyOnlyNew.$model" id="applyOnlyNew" class="form-check-input" type="checkbox" />

            <label class="form-check-label" for="applyOnlyNew"> Aplica para nuevos </label>
          </AppFormField>

          <AppFormField :form-control="v$.form.requiresApproval" class="form-check">
            <input v-model="v$.form.requiresApproval.$model" id="requiresApproval" class="form-check-input" type="checkbox" />

            <label class="form-check-label" for="requiresApproval"> Requiere aprobación </label>
          </AppFormField>

          <AppFormField :form-control="v$.form.solveAdmin" class="form-check">
            <input v-model="v$.form.solveAdmin.$model" id="solveAdmin" class="form-check-input" type="checkbox" />

            <label class="form-check-label" for="solveAdmin"> Resolver desde el administrador </label>
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, PropType, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { ConvocationStepForConfigureStepsDto } from '../dtos/convocationStep.dto';

import { UpdateConfigureStepSequenceService } from '../services/updateConfigureStepSequence.service';

const updateConfigureStepSequenceService = new UpdateConfigureStepSequenceService();

export default defineComponent({
  name: 'ConvStepConfigureSequence',
  components: { AppFormModal, AppFormField, AppButton },

  props: {
    step: {
      type: Object as PropType<ConvocationStepForConfigureStepsDto>,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const title = 'Configurar secuencia';

    const form = reactive({
      convocationStepId: props.step.id,
      requiresApproval: props.step.requiresApproval ? true : false,
      applyOnlyOlds: props.step.applyOnlyOlds ? true : false,
      applyOnlyNew: props.step.applyOnlyNew ? true : false,
      solveAdmin: props.step.solveAdmin ? true : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          convocationStepId: { required },
          requiresApproval: {},
          applyOnlyOlds: {},
          applyOnlyNew: {},
          solveAdmin: {},
        },
      },
      { form }
    );

    watch(
      () => form.solveAdmin,
      async (value) => {
        if (value) {
          form.applyOnlyOlds = false;
          form.applyOnlyNew = false;
        } else if (!form.applyOnlyOlds && !form.applyOnlyNew) {
          form.applyOnlyOlds = true;
          form.applyOnlyNew = true;
        }
      }
    );
    watch(
      () => form.applyOnlyOlds,
      async (value) => {
        if (value) form.solveAdmin = false;
        else if (!form.solveAdmin && !form.applyOnlyNew) form.applyOnlyNew = true;
      }
    );
    watch(
      () => form.applyOnlyNew,
      async (value) => {
        if (value) form.solveAdmin = false;
        else if (!form.solveAdmin && !form.applyOnlyOlds) form.applyOnlyOlds = true;
      }
    );

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        await updateConfigureStepSequenceService.run(form);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      v$,
      t,
      emit,

      save,
    };
  },
});
</script>

<style scoped></style>
