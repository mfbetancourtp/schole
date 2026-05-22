<template>
  <div class="form-row">
    <AppFormField :form-control="v$.form.startDate" label="reports.filters.startDate">
      <input id="startDate" type="date" class="form-control" v-model="v$.form.startDate.$model">
    </AppFormField>

    <AppFormField :form-control="v$.form.endDate" label="reports.filters.endDate">
      <input id="endDate" type="date" class="form-control" v-model="v$.form.endDate.$model">
    </AppFormField>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, PropType} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import {GetStartAndEndDateMonthService} from '../../../shared/services/getStartAndEndDateMonth.service';
import {GetStartAndEndDateWeekService} from '../../../shared/services/getStartAndEndDateWeek.service';

const getStartAndEndDateMonthService = new GetStartAndEndDateMonthService();
const getStartAndEndDateWeekService = new GetStartAndEndDateWeekService();

type interval = 'month' | 'week';

export default defineComponent({
  name: 'FilterDateRange',
  components: {AppFormField},
  props: {
    v$: {
      type: Object,
      required: true,
    },
    interval: {
      type: String as PropType<interval>,
      default: 'month',
    },
  },
  setup(props) {
    onMounted(() => {
      let date = getStartAndEndDateMonthService.run();

      if (props.interval === 'week') {
        date = getStartAndEndDateWeekService.run();
      }

      props.v$.form.startDate.$model = date.startDate;
      props.v$.form.endDate.$model = date.endDate;
    });
  },
});
</script>

<style scoped>

</style>
