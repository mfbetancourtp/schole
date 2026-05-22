<template>
  <form @submit.prevent="saveLearningOutcome">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.code">
          <label>{{ t('classroom.activitiesClassification.form.abbreviation') }}</label>
          <input v-model="v$.form.code.$model" class="form-control" type="text" />
        </AppFormField>

        <AppFormField :form-control="v$.form.description">
          <label>{{ t('access.roles.form.description') }}</label>
          <input v-model="v$.form.description.$model" class="form-control" type="text" />
        </AppFormField>

        <AppFormField :form-control="v$.form.percentage" :label="'Porcentaje'" v-if="level?.percentageLearningOutcomes">
          <input v-model="v$.form.percentage.$model" class="form-control" type="number" />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, PropType, reactive } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { LevelDto } from '../dtos/level.dto';

import { CreateOrUpdateLearningOutComesService } from '../services/createOrUpdateLearningOutComes.service';

const createOrUpdateLearningOutComesService = new CreateOrUpdateLearningOutComesService();

export default defineComponent({
  name: 'LearningOutcomeForm',
  components: { AppFormModal, AppButton, AppFormField },

  emits: ['close'],
  // props: ['learningOutcome', 'competencyId'],
  props: {
    learningOutcome: {
      type: Object as PropType<any>,
      required: true,
    },
    competencyId: {
      type: Number,
      required: true,
    },
    level: {
      type: Object as PropType<LevelDto>,
      // required: true,
    },
  },

  setup(props, { emit }) {
    const { t } = useI18n();
    const learningOutcome = props.learningOutcome ?? null;
    const competencyId = props.competencyId ?? null;
    let title = `${!learningOutcome ? t('core.newMale') : t('core.edit')} Indicador de Logro`;

    const form = reactive({
      code: learningOutcome ? learningOutcome.code : null,
      description: learningOutcome ? learningOutcome.description : null,
      percentage: learningOutcome ? learningOutcome.percentage : null,
      competencyId: competencyId,
    });
    const v$ = useVuelidate(
      {
        form: {
          code: {},
          description: { required },
          competencyId: { required },
          percentage: {
            requiredIf: requiredIf(() => {
              return props.level?.percentageLearningOutcomes == 1;
            }),
          },
        },
      },
      { form }
    );

    const saveLearningOutcome = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let learningOutcomeId = props.learningOutcome ? props.learningOutcome.id : null;
        await createOrUpdateLearningOutComesService.run(form, learningOutcomeId);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      v$,
      t,

      saveLearningOutcome,
    };
  },
});
</script>

<style scoped></style>
