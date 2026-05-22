<template>
  <template v-if="totalsPerStep != null">
    <hr />

    <div class="table-container table-responsive">
      <table class="table-content" cellpadding="10">
        <thead>
          <tr>
            <th rowspan="2" class="col-2"></th>
            <th scope="col" class="text-center" :colspan="stepId == 0 ? convocationwithEnrols.enrols[0].statusSteps.length : 1">Pasos</th>
            <th rowspan="2" class="col-1 text-center">Total</th>
          </tr>

          <tr>
            <template v-if="!convocationwithEnrols.enrols[0].statusSteps.length">
              <th class="text-center p-0 border">---</th>
            </template>

            <template v-for="index in convocationwithEnrols.enrols[0].statusSteps.length" :key="index">
              <th v-if="stepId == 0 || stepId == index" class="text-center p-0 border">
                {{ index }}
              </th>
            </template>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th>Aprobados</th>

            <template v-if="!convocationwithEnrols.steps.length">
              <td class="text-center border">---</td>
            </template>

            <template v-for="(step, index) in convocationwithEnrols.steps" :key="index">
              <td v-if="stepId == 0 || stepId == index + 1" class="text-center border">
                {{ totalsPerStep[`stepId-${step.id}`].approved }}
              </td>
            </template>

            <td class="text-center">
              {{ totalsPerStep['totalApproved'] ?? 0 }}
            </td>
          </tr>

          <tr>
            <th>Finalizados</th>

            <template v-if="!convocationwithEnrols.steps.length">
              <td class="text-center border">---</td>
            </template>

            <template v-for="(step, index) in convocationwithEnrols.steps" :key="index">
              <td v-if="stepId == 0 || stepId == index + 1" class="text-center border">
                {{ totalsPerStep[`stepId-${step.id}`].finalized }}
              </td>
            </template>

            <td class="text-center">
              {{ totalsPerStep['totalFinalized'] ?? 0 }}
            </td>
          </tr>

          <tr>
            <th>Detenidos</th>

            <template v-if="!convocationwithEnrols.steps.length">
              <td class="text-center border">---</td>
            </template>

            <template v-for="(step, index) in convocationwithEnrols.steps" :key="index">
              <td v-if="stepId == 0 || stepId == index + 1" class="text-center border">
                {{ totalsPerStep[`stepId-${step.id}`].reproved }}
              </td>
            </template>

            <td class="text-center">
              {{ totalsPerStep['totalReproved'] ?? 0 }}
            </td>
          </tr>

          <tr>
            <th>En revisión</th>

            <template v-if="!convocationwithEnrols.steps.length">
              <td class="text-center border">---</td>
            </template>

            <template v-for="(step, index) in convocationwithEnrols.steps" :key="index">
              <td v-if="stepId == 0 || stepId == index + 1" class="text-center border">
                {{ totalsPerStep[`stepId-${step.id}`].inReview }}
              </td>
            </template>

            <td class="text-center">
              {{ totalsPerStep['totalInReview'] ?? 0 }}
            </td>
          </tr>

          <tr>
            <th>Pendientes</th>

            <template v-if="!convocationwithEnrols.steps.length">
              <td class="text-center border">---</td>
            </template>

            <template v-for="(step, index) in convocationwithEnrols.steps" :key="index">
              <td v-if="stepId == 0 || stepId == index + 1" class="text-center border">
                {{ totalsPerStep[`stepId-${step.id}`].notDone }}
              </td>
            </template>

            <td class="text-center">
              {{ totalsPerStep['totalNotDone'] ?? 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>

<script lang="ts">
import { Ref, defineComponent, ref, PropType, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'ACSITotalsTable', // AdminConvocationSummaryInscritosTotalsTable

  props: {
    convocationwithEnrols: {
      type: Object as PropType<any>,
      required: true,
    },
    stepId: {
      type: Number,
      required: true,
    },
    degreeId: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();

    const totalsPerStep: Ref<any> = ref(null);

    onMounted(() => {
      loadTotals();
    });

    const loadTotals = () => {
      if (props.convocationwithEnrols.enrols.length) {
        const formatData: any = {};

        props.convocationwithEnrols.steps.forEach((step: any) => {
          formatData[`stepId-${step.id}`] = {
            approved: 0,
            finalized: 0,
            reproved: 0,
            inReview: 0,
            pending: 0,
            notDone: 0,
          };

          formatData['totalNotDone'] = 0;
          formatData['totalFinalized'] = 0;
          formatData['totalApproved'] = 0;
          formatData['totalReproved'] = 0;
          formatData['totalInReview'] = 0;
          formatData['totalPending'] = 0;
        });

        totalsPerStep.value = formatData;

        if (totalsPerStep.value) {
          props.convocationwithEnrols.enrols.forEach((enrol: any) => {
            if (props.degreeId == 0 || props.degreeId == enrol.nameDegree) {
              enrol.statusSteps.forEach((statusStep: any, index: any) => {
                if (props.stepId == 0 || props.stepId == index + 1) {
                  totalsPerStep.value[`stepId-${statusStep.convocationStepId}`].notDone += statusStep.status == null ? 1 : 0;
                  totalsPerStep.value[`stepId-${statusStep.convocationStepId}`].approved += statusStep.status == 'approved' ? 1 : 0;
                  totalsPerStep.value[`stepId-${statusStep.convocationStepId}`].finalized += statusStep.status == 'finalized' ? 1 : 0;
                  totalsPerStep.value[`stepId-${statusStep.convocationStepId}`].reproved += statusStep.status == 'reproved' ? 1 : 0;
                  totalsPerStep.value[`stepId-${statusStep.convocationStepId}`].inReview += statusStep.status == 'in review' ? 1 : 0;
                  totalsPerStep.value[`stepId-${statusStep.convocationStepId}`].pending += statusStep.status == 'pending' ? 1 : 0;

                  totalsPerStep.value['totalNotDone'] += statusStep.status == null ? 1 : 0;
                  totalsPerStep.value['totalFinalized'] += statusStep.status == 'finalized' ? 1 : 0;
                  totalsPerStep.value['totalApproved'] += statusStep.status == 'approved' ? 1 : 0;
                  totalsPerStep.value['totalReproved'] += statusStep.status == 'reproved' ? 1 : 0;
                  totalsPerStep.value['totalInReview'] += statusStep.status == 'in review' ? 1 : 0;
                  totalsPerStep.value['totalPending'] += statusStep.status == 'pending' ? 1 : 0;
                }
              });
            }
          });
        }
      }
    };

    return {
      t,

      totalsPerStep,
    };
  },
});
</script>

<style scoped>
.table-content {
  width: 100%;
}
</style>
