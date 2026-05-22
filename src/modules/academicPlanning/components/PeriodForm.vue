<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name">
          <label for="name">Nombre</label>
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.abbreviation">
          <label for="abbreviation">Abreviatura</label>
          <input class="form-control" type="text" id="abbreviation" v-model="v$.form.abbreviation.$model" />
        </AppFormField>

        <h5 class="under__line">Período acádemico</h5>

        <div class="form-row">
          <AppFormField :form-control="v$.form.startDate">
            <label for="startDate">Inicia</label>
            <input class="form-control" type="date" id="startDate" v-model="v$.form.startDate.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.endDate">
            <label for="endDate">Termina</label>
            <input class="form-control" type="date" id="endDate" v-model="v$.form.endDate.$model" />
          </AppFormField>
        </div>
        <h5 class="under__line">Cargue notas</h5>
        <div class="form-row">
          <AppFormField :form-control="v$.form.startDateScoreUpload">
            <label for="startDateScoreUpload">Inicia</label>
            <input class="form-control" type="date" id="startDateScoreUpload" v-model="v$.form.startDateScoreUpload.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.endDateScoreUpload">
            <label for="endDateScoreUpload">Termina</label>
            <input class="form-control" type="date" id="endDateScoreUpload" v-model="v$.form.endDateScoreUpload.$model" />
          </AppFormField>
        </div>
        <h5 class="under__line">Bloqueo nivelaciones</h5>
        <div class="form-row">
          <AppFormField :form-control="v$.form.startDateRetrievalLock">
            <label for="startDateRetrievalLock">Inicia</label>
            <input class="form-control" type="date" id="startDateRetrievalLock" v-model="v$.form.startDateRetrievalLock.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.endDateRetrievalLock">
            <label for="endDateRetrievalLock">Termina</label>
            <input class="form-control" type="date" id="endDateRetrievalLock" v-model="v$.form.endDateRetrievalLock.$model" />
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.percent">
          <label for="percent">Porcentaje</label>
          <input class="form-control" type="number" id="percent" v-model="v$.form.percent.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.order">
          <label for="order">Orden</label>
          <input class="form-control" type="number" id="order" v-model="v$.form.order.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.active">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="active" v-model="v$.form.active.$model" @change="active.value = !active.value" />
            <label class="form-check-label" for="active">
              {{ v$.form.active.$model ? 'Activo' : 'Inactivo' }}
            </label>
          </div>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required, maxLength } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { CreateOrUpdatePeriodService } from '../services/createOrUpdatePeriod.service';

const createOrUpdatePeriodService = new CreateOrUpdatePeriodService();

export default defineComponent({
  name: 'PeriodForm',
  components: { AppFormModal, AppFormField, AppButton },

  props: ['data', 'academicPeriodId'],
  emits: ['close'],

  setup(props, { emit }) {
    const periodTranslation = 'core.generalTerms.academic.period.singular';
    const data = props.data ?? {};
    let title = data?.id ? `core.edit ${periodTranslation}` : `core.newMale ${periodTranslation}`;

    const active: { value: boolean } = reactive({
      value: false,
    });

    const form = reactive({
      academicPeriodId: data?.academicPeriodId ?? props.academicPeriodId,
      active: !!data?.active,
      abbreviation: data?.abbreviation,
      startDate: data?.startDate,
      percent: data?.percent,
      startDateScoreUpload: data?.startDateScoreUpload,
      endDateScoreUpload: data?.endDateScoreUpload,
      startDateRetrievalLock: data?.startDateRetrievalLock,
      endDateRetrievalLock: data?.endDateRetrievalLock,
      endDate: data?.endDate,
      name: data?.name,
      order: data?.order,
    });
    const v$ = useVuelidate(
      {
        form: {
          abbreviation: { required, maxLength: maxLength(10) },
          academicPeriodId: { required },
          startDate: { required },
          endDate: { required },
          startDateScoreUpload: { required },
          endDateScoreUpload: { required },
          startDateRetrievalLock: {},
          endDateRetrievalLock: {},
          percent: { required },
          name: { required },
          active: {},
          order: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let dataForm = {
          name: form.name,
          academicPeriodId: form.academicPeriodId,
          abbreviation: form.abbreviation,
          percent: form.percent,
          startDate: form.startDate,
          endDate: form.endDate,
          startDateScoreUpload: form.startDateScoreUpload,
          endDateScoreUpload: form.endDateScoreUpload,
          startDateRetrievalLock: form.startDateRetrievalLock,
          endDateRetrievalLock: form.endDateRetrievalLock,
          active: form.active ? 1 : 0,
          order: form.order,
        };
        await createOrUpdatePeriodService.run(dataForm, data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      active,
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped>
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
}
</style>
