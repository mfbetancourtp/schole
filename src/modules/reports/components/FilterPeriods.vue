<!-- eslint-disable vue/no-mutating-props -->
<template>
  <AppFormField :form-control="v$.form.periodId" label="core.generalTerms.academic.period.singular">
    <AppAutocomplete input-id="academicPeriodGroupId" :options="periods" v-model="v$.form.periodId.$model" :disabled="!v$.form.academicPeriodId.$model"></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { PeriodDto } from '../../../shared/dto/period.dto';

export default defineComponent({
  name: 'FilterPeriods',
  components: { AppAutocomplete, AppFormField },
  props: {
    v$: {
      type: Object,
      required: true,
    },
    academicPeriods: {
      type: Array as PropType<AcademicPeriodDto[]>,
      required: true,
    },
  },
  emits: ['selectedPeriod', 'getPeriods'],

  setup(props, { emit }) {
    const periods = ref<PeriodDto[]>([]);

    watch(
      () => props.v$.form.academicPeriodId.$model,
      async (value) => {
        if (value) {
          getPeriods(value);
        } else {
          periods.value = [];
        }

        emit('getPeriods', periods.value);
      }
    );
    watch(
      () => props.v$.form.periodId.$model,
      async (value) => {
        if (value) {
          emit(
            'selectedPeriod',
            periods.value.find((period) => period.id === value)
          );
        }
      }
    );

    const getPeriods = (academicPeriodId: number) => {
      props.academicPeriods.map((academicPeriod) => {
        if (academicPeriodId === academicPeriod.id) {
          periods.value = academicPeriod.periods ?? [];
        }
      });
    };

    return {
      periods,
    };
  },
});
</script>

<style scoped></style>
