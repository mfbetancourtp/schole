<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'competenceEvaluation.configureEvaluationsEdit' }"></AppButtonBack>

      <AppButton style="color: white;" label="core.save" @click="save"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <table class="table bg-white">
          <thead>
            <tr>
              <th></th>
              <th v-if="corpEvalPeriodEmployees[0].evaluatorsSenior.length" scope="col" class="text-center border" :colspan="corpEvalPeriodEmployees[0].evaluatorsSenior.length">
                {{ t('competenceEvaluation.configureEvaluations.formTable.superior') }}
                {{ `(${corpEvalPeriod?.percentSeniorPosition}%)` }}
              </th>
              <th v-if="corpEvalPeriodEmployees[0].evaluatorsSamer.length" scope="col" class="text-center border" :colspan="corpEvalPeriodEmployees[0].evaluatorsSamer.length">
                {{ t('competenceEvaluation.configureEvaluations.formTable.equal') }}
                {{ `(${corpEvalPeriod?.percentSamePosition}%)` }}
              </th>
              <th v-if="corpEvalPeriodEmployees[0].evaluatorsLower.length" scope="col" class="text-center border" :colspan="corpEvalPeriodEmployees[0].evaluatorsLower.length">
                {{ t('competenceEvaluation.configureEvaluations.formTable.subordinates') }}
                {{ `(${corpEvalPeriod?.percentLowerPosition}%)` }}
              </th>
              <th v-if="corpEvalPeriodEmployees[0].evaluatorsExternal.length" scope="col" class="text-center border" :colspan="corpEvalPeriodEmployees[0].evaluatorsExternal.length">
                {{ t('competenceEvaluation.configureEvaluations.formTable.external') }}
                {{ `(${corpEvalPeriod?.percentExternalEvaluators}%)` }}
              </th>
            </tr>

            <tr>
              <th class="p-0 border ps-2">
                {{ t('competenceEvaluation.configureEvaluations.configureEvaluators.employee') }}
              </th>

              <template v-for="index in corpEvalPeriodEmployees[0].evaluatorsSenior.length" :key="index">
                <th class="text-center p-0 border">
                  {{ t('competenceEvaluation.configureEvaluations.formTable.superior') }}
                  {{ index }}
                </th>
              </template>

              <template v-for="index in corpEvalPeriodEmployees[0].evaluatorsSamer.length" :key="index">
                <th class="text-center p-0 border">
                  {{ t('competenceEvaluation.configureEvaluations.formTable.equal') }}
                  {{ index }}
                </th>
              </template>

              <template v-for="index in corpEvalPeriodEmployees[0].evaluatorsLower.length" :key="index">
                <th class="text-center p-0 border">
                  {{ t('competenceEvaluation.configureEvaluations.formTable.subordinates') }}
                  {{ index }}
                </th>
              </template>

              <template v-for="index in corpEvalPeriodEmployees[0].evaluatorsExternal.length" :key="index">
                <th class="text-center p-0 border">
                  {{ t('competenceEvaluation.configureEvaluations.formTable.external') }}
                  {{ index }}
                </th>
              </template>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in corpEvalPeriodEmployees" :key="index">
              <td class="p-1 border align-middle">{{ item.nameEmployee }}</td>

              <template v-for="(evaluator, index2) in item.evaluatorsSenior" :key="index2">
                <td class="p-1 border">
                  <AppAutocomplete :options="employees" v-model="evaluator.employeeEvaluatorId"></AppAutocomplete>
                </td>
              </template>

              <template v-for="(evaluator, index2) in item.evaluatorsSamer" :key="index2">
                <td class="p-1 border">
                  <AppAutocomplete :options="employees" v-model="evaluator.employeeEvaluatorId"></AppAutocomplete>
                </td>
              </template>

              <template v-for="(evaluator, index2) in item.evaluatorsLower" :key="index2">
                <td class="p-1 border">
                  <AppAutocomplete :options="employees" v-model="evaluator.employeeEvaluatorId"></AppAutocomplete>
                </td>
              </template>

              <template v-for="(evaluator, index2) in item.evaluatorsExternal" :key="index2">
                <td class="p-1 border">
                  <AppAutocomplete :options="employees" v-model="evaluator.employeeEvaluatorId"></AppAutocomplete>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { EmployeeDto } from '../dtos/configureEvaluations.dto';
import { EvaluationConfigurationDto } from '../dtos/configureEvaluations.dto';
import { CorporateEvaluationPeriodEmployeeDto } from '../dtos/configureEvaluations.dto';

import { GetOrganizationalUnitEmployeeService } from '../services/getOrganizationalUnitEmployee.service';
import { GetCorporateEvaluationPeriodByIdService } from '../services/getCorporateEvaluationPeriodById.service';
import { PostCorporateEvaluationsFromArrayService } from '../services/postCorporateEvaluationsFromArray.service';
import { GetCorporateEvaluationPeriodEmployeesConfigureEvaluatorsService } from '../services/getCorporateEvaluationPeriodEmployeesConfigureEvaluators.service';

const getCorporateEvaluationPeriodEmployeesService = new GetCorporateEvaluationPeriodEmployeesConfigureEvaluatorsService();
const postCorporateEvaluationsFromArrayService = new PostCorporateEvaluationsFromArrayService();
const getCorporateEvaluationPeriodByIdService = new GetCorporateEvaluationPeriodByIdService();
const getOrganizationalUnitEmployeeService = new GetOrganizationalUnitEmployeeService();

export default defineComponent({
  name: 'SpecifyEvaluators',
  components: {
    AppAutocomplete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const title = 'competenceEvaluation.configureEvaluations.configureEvaluators.title';
    const corporateEvaluationPeriodId = parseInt(route.params.corporateEvaluationPeriodId.toString(), 10);

    useMeta({ title: t(title) });

    const routes: BreadCrumbsType[] = [
      {
        name: 'competenceEvaluation.configureEvaluations.title',
        url: { name: 'competenceEvaluation.configureEvaluations' },
      },
      {
        name: `${t('core.edit')} ${t('competenceEvaluation.configureEvaluations.singular')}`,
        url: {
          name: 'competenceEvaluation.configureEvaluationsEdit',
          params: {
            corporateEvaluationPeriodId: route.params.corporateEvaluationPeriodId,
          },
        },
      },
      {
        name: title,
      },
    ];

    const corpEvalPeriodEmployees: Ref<CorporateEvaluationPeriodEmployeeDto[]> = ref([]);
    const corpEvalPeriod: Ref<EvaluationConfigurationDto | null> = ref(null);
    const employees: Ref<EmployeeDto[] | any[]> = ref([]);

    const loading = ref(true);

    onMounted(async () => {
      try {
        corpEvalPeriod.value = await getCorporateEvaluationPeriodByIdService.run(corporateEvaluationPeriodId);
        corpEvalPeriodEmployees.value = await getCorporateEvaluationPeriodEmployeesService.run(corporateEvaluationPeriodId);

        if (corpEvalPeriod.value) {
          employees.value = await getOrganizationalUnitEmployeeService.run(corpEvalPeriod.value.unitOrganizationalId);

          employees.value.forEach((employee) => {
            employee.id = employee.employeeId;
            employee.name = employee.nameEmployee;
          });
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      try {
        const dataSend: any[] = [];

        corpEvalPeriodEmployees.value.forEach((employee) => {
          dataSend.push({
            id: employee.id,
            evaluatorsSenior: employee.evaluatorsSenior,
            evaluatorsSamer: employee.evaluatorsSamer,
            evaluatorsLower: employee.evaluatorsLower,
            evaluatorsExternal: employee.evaluatorsExternal,
          });
        });

        await postCorporateEvaluationsFromArrayService.run(dataSend);

        await router.push({
          name: 'competenceEvaluation.configureEvaluationsEdit',
          params: { corporateEvaluationPeriodId: corporateEvaluationPeriodId },
        });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      corpEvalPeriodEmployees,
      corpEvalPeriod,
      employees,

      save,
    };
  },
});
</script>

<style scoped></style>
