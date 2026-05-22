<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'competenceEvaluation.configureEvaluations' }"></AppButtonBack>

      <AppButton style="color: white;" :disabled="exceeds100Percent" label="core.saveAndExit" @click="save(false)"></AppButton>
    </template>

    <template #content>
      <div>
        <section>
          <div class="form-row">
            <AppFormField class="col-3" :form-control="v$.form.academicPeriodId" label="competenceEvaluation.configureEvaluations.form.validity">
              <AppAutocomplete input-id="academicPeriodId" v-model="v$.form.academicPeriodId.$model" :options="academicPeriods"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.unitOrganizationalId" label="competenceEvaluation.configureEvaluations.form.organizationalUnit">
              <AppAutocomplete input-id="unitOrganizationalId" v-model="v$.form.unitOrganizationalId.$model" :options="organizationalUnits"></AppAutocomplete>
            </AppFormField>

            <AppFormField class="col-2" :form-control="v$.form.startDate" label="core.time.since">
              <input v-model="v$.form.startDate.$model" id="startDate" class="form-control" type="date" />
            </AppFormField>

            <AppFormField class="col-2" :form-control="v$.form.endDate" label="core.time.until">
              <input v-model="v$.form.endDate.$model" id="endDate" class="form-control" type="date" />
              <span v-if="invalidDates" class="text-danger">{{ t('competenceEvaluation.configureEvaluations.form.invalidDates') }}</span>
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.name" label="Nombre">
              <input v-model="v$.form.name.$model" id="Nombre" class="form-control" type="text" />
            </AppFormField>

            <AppFormField :form-control="v$.form.surveyId" label="competenceEvaluation.configureEvaluations.form.test">
              <AppAutocomplete input-id="surveyId" v-model="v$.form.surveyId.$model" :options="evaluations" label="title"></AppAutocomplete>
            </AppFormField>

            <AppFormField class="col-3" :form-control="v$.form.active" label="competenceEvaluation.configureEvaluations.form.accessToEvaluations">
              <div class="mt-2 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isBudget" v-model="v$.form.active.$model" />
                <label class="form-check-label" for="isBudget">{{ v$.form.active.$model ? t('Sí') : t('No') }}</label>
              </div>
            </AppFormField>

            <!-- <div class="col-6 d-flex align-items-end">
                <AppFormField class="form-check form-switch" :form-control="v$.form.active" label="competenceEvaluation.configureEvaluations.form.accessToEvaluations">
                  <input class="form-check-input" type="checkbox" id="active" v-model="v$.form.active.$model" />
                </AppFormField>
              </div> -->
          </div>
        </section>

        <hr />

        <section class="row">
          <div class="col-5">
            <h5>
              {{ t('competenceEvaluation.configureEvaluations.form.EmployeesOrganizationalUnit') }}
            </h5>

            <AppEmptyResponse v-if="!employees.length" :subtitle="false"></AppEmptyResponse>

            <div class="form-check" v-for="(employee, index) in employees" :key="index">
              <input class="form-check-input" type="checkbox" :id="`${index}`" :value="employee.employeeId" v-model="v$.form.employeeIds.$model" />
              <label class="form-check-label" :for="`${index}`">{{ employee.nameEmployee }}</label>
            </div>
          </div>

          <div class="col">
            <h5 class="mb-0">
              {{ t('competenceEvaluation.configureEvaluations.form.NumberEvaluatorsPerEmployee') }}
            </h5>
            <span v-if="exceeds100Percent" class="text-danger">{{ t('competenceEvaluation.configureEvaluations.form.exceeds100Percent') }}</span>

            <table class="table">
              <thead>
                <tr>
                  <th class="col-5">
                    {{ t('competenceEvaluation.configureEvaluations.formTable.position') }}
                  </th>
                  <th class="text-center">
                    {{ t('competenceEvaluation.configureEvaluations.formTable.quantity') }}
                  </th>
                  <th class="text-center">
                    {{ t('competenceEvaluation.configureEvaluations.formTable.weight') }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    {{ t('competenceEvaluation.configureEvaluations.formTable.superior') }}
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.numberSeniorPosition">
                      <input :disabled="data?.evaluatorsDefined" class="form-control" type="number" v-model="v$.form.numberSeniorPosition.$model" />
                    </AppFormField>
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.percentSeniorPosition">
                      <input class="form-control" type="number" v-model="v$.form.percentSeniorPosition.$model" />
                    </AppFormField>
                  </td>
                </tr>
                <tr>
                  <td>
                    {{ t('competenceEvaluation.configureEvaluations.formTable.equal') }}
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.numberSamePosition">
                      <input :disabled="data?.evaluatorsDefined" class="form-control" type="number" v-model="v$.form.numberSamePosition.$model" />
                    </AppFormField>
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.percentSamePosition">
                      <input class="form-control" type="number" v-model="v$.form.percentSamePosition.$model" />
                    </AppFormField>
                  </td>
                </tr>
                <tr>
                  <td>
                    {{ t('competenceEvaluation.configureEvaluations.formTable.subordinates') }}
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.numberLowerPosition">
                      <input :disabled="data?.evaluatorsDefined" class="form-control" type="number" v-model="v$.form.numberLowerPosition.$model" />
                    </AppFormField>
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.percentLowerPosition">
                      <input class="form-control" type="number" v-model="v$.form.percentLowerPosition.$model" />
                    </AppFormField>
                  </td>
                </tr>
                <tr>
                  <td>
                    {{ t('competenceEvaluation.configureEvaluations.formTable.external') }}
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.numberExternalEvaluators">
                      <input :disabled="data?.evaluatorsDefined" class="form-control" type="number" v-model="v$.form.numberExternalEvaluators.$model" />
                    </AppFormField>
                  </td>
                  <td>
                    <AppFormField :form-control="v$.form.percentExternalEvaluators">
                      <input class="form-control" type="number" v-model="v$.form.percentExternalEvaluators.$model" />
                    </AppFormField>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="d-flex justify-content-end">
              <AppButton
                :disabled="exceeds100Percent || !v$.form.employeeIds.$model.length"
                label="competenceEvaluation.configureEvaluations.formBtn.specifyEvaluators"
                @click="save(true)"
              ></AppButton>
            </div>
          </div>
        </section>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { SurveyDto } from '../dtos/configureEvaluations.dto';
import { EmployeeDto } from '../dtos/configureEvaluations.dto';
import { AcademicPeriodDto } from '../dtos/configureEvaluations.dto';
import { OrganizationalInitDto } from '../dtos/configureEvaluations.dto';

import { GetSurveysService } from '../services/getSurveys.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetOrganizationalUnitsService } from '../services/getOrganizationalUnits.service';
import { GetOrganizationalUnitEmployeeService } from '../services/getOrganizationalUnitEmployee.service';
import { CreateOrUpdateCorporateEvaluationPeriodsService } from '../services/createOrUpdateCorporateEvaluationPeriods.service';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateCorporateEvaluationPeriodsService = new CreateOrUpdateCorporateEvaluationPeriodsService();
const getOrganizationalUnitEmployeeService = new GetOrganizationalUnitEmployeeService();
const getOrganizationalUnitsService = new GetOrganizationalUnitsService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const getSurveysService = new GetSurveysService();

export default defineComponent({
  name: 'ConfigureEvaluationsForm',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
      required: true,
    },
    data: {
      type: Object as PropType<any>,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const router = useRouter();

    const organizationalUnits: Ref<OrganizationalInitDto[]> = ref([]);
    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const evaluations: Ref<SurveyDto[]> = ref([]);
    const employees: Ref<EmployeeDto[]> = ref([]);

    const loading = ref(true);

    const exceeds100Percent = computed(() => {
      let percentage = 0;

      if (form.percentSeniorPosition) percentage += form.percentSeniorPosition;
      if (form.percentSamePosition) percentage += form.percentSamePosition;
      if (form.percentLowerPosition) percentage += form.percentLowerPosition;
      if (form.percentExternalEvaluators) percentage += form.percentExternalEvaluators;

      return percentage > 100;
    });

    const invalidDates = computed(() => {
      let invalidDate = false;

      if (form.startDate && form.endDate && !dayjs(form.startDate).isSame(dayjs(form.endDate))) {
        invalidDate = dayjs(form.startDate).isAfter(dayjs(form.endDate));
      }

      return invalidDate;
    });

    const form = reactive({
      academicPeriodId: props.data?.academicPeriodId ?? null,
      unitOrganizationalId: props.data?.unitOrganizationalId ?? null,
      startDate: props.data?.startDate ?? null,
      endDate: props.data?.endDate ?? null,

      name: props.data?.name ?? null,
      surveyId: props.data?.surveyId ?? null,
      active: props.data?.active ? (props.data?.active ? true : false) : false,

      numberSeniorPosition: props.data?.numberSeniorPosition ?? 0,
      percentSeniorPosition: props.data?.percentSeniorPosition ?? 0,
      numberSamePosition: props.data?.numberSamePosition ?? 0,
      percentSamePosition: props.data?.percentSamePosition ?? 0,
      numberLowerPosition: props.data?.numberLowerPosition ?? 0,
      percentLowerPosition: props.data?.percentLowerPosition ?? 0,
      numberExternalEvaluators: props.data?.numberExternalEvaluators ?? 0,
      percentExternalEvaluators: props.data?.percentExternalEvaluators ?? 0,
      employeeIds: [] as number[],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          unitOrganizationalId: { required },
          startDate: { required },
          endDate: { required },

          name: { required },
          surveyId: { required },
          active: {},

          numberSeniorPosition: { required },
          percentSeniorPosition: { required },
          numberSamePosition: { required },
          percentSamePosition: { required },
          numberLowerPosition: { required },
          percentLowerPosition: { required },
          numberExternalEvaluators: { required },
          percentExternalEvaluators: { required },
          employeeIds: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        academicPeriods.value = await getAcademicPeriodsService.run();
        const response = await getOrganizationalUnitsService.run();
        evaluations.value = await getSurveysService.run();

        organizationalUnits.value = response.data;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Evaluación de Desempeño', url: '' };
        headerStorage.moduleItem = { name: 'Configurar evaluaciones', url: '' };
        headerStorage.moduleSubItem = { name: props.title, url: '' };

        if (props.data && props.data.unitOrganizationalId) await getEmployees(props.data.unitOrganizationalId);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.unitOrganizationalId,
      async (value) => {
        form.employeeIds = [];

        if (value) await getEmployees(value);
        else employees.value = [];
      }
    );

    const getEmployees = async (unitOrganizationalId: number) => {
      let params = {};
      if (props.data) {
        params = { corporateEvaluationPeriodId: props.data.id };
      }

      employees.value = await getOrganizationalUnitEmployeeService.run(unitOrganizationalId, params);

      employees.value.forEach((employee) => {
        if (employee.checked) form.employeeIds.push(employee.employeeId);
      });
    };

    const save = async (goToSpecifyEvaluators: boolean = false) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid || exceeds100Percent.value || invalidDates.value) return;

      try {
        const response = await createOrUpdateCorporateEvaluationPeriodsService.run(form, props.data?.id);

        if (goToSpecifyEvaluators) {
          await router.push({
            name: 'competenceEvaluation.specifyEvaluators',
            params: { corporateEvaluationPeriodId: response.data.id },
          });
        } else {
          await router.push({
            name: 'competenceEvaluation.configureEvaluations',
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,
      t,

      organizationalUnits,
      exceeds100Percent,
      academicPeriods,
      invalidDates,
      evaluations,
      employees,

      save,
    };
  },
});
</script>

<style scoped></style>
