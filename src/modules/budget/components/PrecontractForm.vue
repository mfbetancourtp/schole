<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <div>
            <!-- Accodion Form-->
            <AppAccordion class="mt-2" v-slot="{ accordionId }" :styleType="'clean'">
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head><h5 class="fw-bold text-primary">Información general del movimiento</h5></template>
                <template v-slot:content>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.contractNumber" label="Número de contrato">
                      <input class="form-control" type="number" id="contractNumber" v-model="v$.form.contractNumber.$model" />
                    </AppFormField>
                    <AppFormField :form-control="v$.form.suscriptionDate" label="Fecha y hora de suscripción">
                      <input class="form-control" type="datetime-local" id="date" v-model="v$.form.suscriptionDate.$model" />
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.starDate" label="Fecha de inicio del precontrato">
                      <input class="form-control" type="date" id="starDate" v-model="v$.form.starDate.$model" />
                    </AppFormField>
                    <AppFormField :form-control="v$.form.endDate" label="Fecha de fin del precontrato">
                      <input class="form-control" type="date" id="endDate" v-model="v$.form.endDate.$model" />
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.legalRepresentativeRolId" label="Rol del representante legal">
                      <AppAutocomplete v-model="v$.form.legalRepresentativeRolId.$model" :options="rolUsers" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.legalRepresentativeId" label="Representante legal">
                      <AppAutocomplete
                        v-model="v$.form.legalRepresentativeId.$model"
                        :options="allLegalRepresentatives"
                        label="names"
                        :clearable="false"
                        :reduce="(d:any) => d.peopleId"
                        :loading="loadingLegalRepresentative"
                      ></AppAutocomplete>
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.supervisorRolId" label="Rol del supervisor">
                      <AppAutocomplete v-model="v$.form.supervisorRolId.$model" :options="rolUsers" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.supervisorId" label="Supervisor">
                      <AppAutocomplete
                        v-model="v$.form.supervisorId.$model"
                        :options="allSupervisors"
                        label="names"
                        :clearable="false"
                        :reduce="(d:any) => d.peopleId"
                        :loading="loadingSupervisor"
                      ></AppAutocomplete>
                    </AppFormField>
                  </div>

                  <div class="form-row">
                    <AppFormField :form-control="v$.form.countryId" label="País">
                      <AppGeographicSearch :search-key="'country'" :id="v$.form.countryId.$model" @geographic-data="(data:any) => (v$.form.countryId.$model = data.id)"> </AppGeographicSearch>
                    </AppFormField>
                  </div>
                  <div class="row">
                    <AppFormField :form-control="v$.form.regionId" label="Departamento">
                      <AppGeographicSearch
                        :search-key="'region'"
                        :country-id="v$.form.countryId.$model"
                        :id="v$.form.regionId.$model"
                        @geographic-data="(data:any) => (v$.form.regionId.$model = data.id)"
                        :disabled="!v$.form.countryId.$model"
                      >
                      </AppGeographicSearch>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.municipalityId" label="Municipio">
                      <AppGeographicSearch
                        :search-key="'city'"
                        :country-id="v$.form.countryId.$model"
                        :region-id="v$.form.regionId.$model"
                        :id="v$.form.municipalityId.$model"
                        @geographic-data="(data:any) => (v$.form.municipalityId.$model = data.id)"
                        :disabled="!v$.form.regionId.$model"
                      >
                      </AppGeographicSearch>
                    </AppFormField>
                  </div>

                  <div class="container-fluid">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Monto comprometido</label>
                        <p class="form-control-plaintext">{{ data.value }}</p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Programa</label>
                        <p class="form-control-plaintext">
                          {{ data.programName }}
                        </p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Subprograma</label>
                        <p class="form-control-plaintext">
                          {{ data.subProgramName }}
                        </p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Proyecto</label>
                        <p class="form-control-plaintext">
                          {{ data.projectName }}
                        </p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Representante legal</label>
                        <p class="form-control-plaintext">
                          {{ data.nameLegalRepresentative }}
                        </p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Período académico</label>
                        <p class="form-control-plaintext">
                          {{ data.academicPeriodsName }}
                        </p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Fecha y hora</label>
                        <p class="form-control-plaintext">
                          {{ dayjs(data.date).format('DD/MM/YYYY') }}
                        </p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Concepto</label>
                        <p class="form-control-plaintext">{{ data.concept }}</p>
                      </div>
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head><h5 class="fw-bold text-primary">Códigos UNSPSC</h5></template>
                <template v-slot:content>
                  <div class="form-row">
                    <div class="w-100">
                      <AppFormField :form-control="v$.form.unspscoCodes" label="Códigos UNSPSC">
                        <div class="d-flex">
                          <input class="form-control me-2" type="number" v-model="newUnspscCode" placeholder="Agregar código UNSPSC" />
                          <AppButton @click="addUnspscCode" style="padding: 0.375rem 1.25rem">Agregar</AppButton>
                        </div>
                      </AppFormField>
                      <div class="mt-3 d-flex flex-wrap gap-2">
                        <div v-for="code in form.unspscoCodes" :key="code" class="d-flex align-items-center gap-2">
                          <template v-if="editCode === code">
                            <AppChipPrime :removable="false">
                              <template #content>
                                <input v-model="editedValue" type="number" class="form-control" style="width: 100px; padding: 0rem 0.4rem" />
                                <AppIcon icon="check-circle" @click="saveEditCode()" class="ms-1 tw-cursor-pointer" />
                                <AppIcon icon="times" @click="cancelEditCode" class="ms-1 tw-cursor-pointer" />
                              </template>
                            </AppChipPrime>
                          </template>
                          <template v-else>
                            <AppChipPrime :label="code" @remove="removeUnspscCode(code)">
                              <template #content>
                                <AppIcon icon="edit" @click="startEditCode(code)" class="ms-1 tw-cursor-pointer"></AppIcon>
                              </template>
                            </AppChipPrime>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head><h5 class="fw-bold text-primary">Actividades requeridas</h5></template>
                <template v-slot:content>
                  <div>
                    <div class="d-flex justify-content-end w-100">
                      <AppButton @click="openActivitiePrecontractModal()" style="padding: 0.375rem 1.25rem">Agregar</AppButton>
                    </div>
                    <div>
                      <div class="grid-cards">
                        <AppCard v-for="activitie in form.activities" :key="activitie">
                          <template #body>
                            <div class="content-card">{{ activitie }}</div>
                          </template>

                          <template #footer>
                            <div class="d-flex justify-content-end">
                              <AppButtonEdit @click="openActivitiePrecontractModal(activitie)" />
                              <AppButtonDelete @click="openDeleteModal(activitie, 'actividad')" />
                            </div>
                          </template>
                        </AppCard>
                      </div>
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head><h5 class="fw-bold text-primary">Habilidades requeridas</h5></template>
                <template v-slot:content>
                  <div>
                    <div class="d-flex justify-content-end w-100">
                      <AppButton @click="openSkillPrecontractModal()" style="padding: 0.375rem 1.25rem">Agregar</AppButton>
                    </div>
                    <div>
                      <div class="grid-cards">
                        <AppCard v-for="skill in form.skills" :key="skill">
                          <template #body>
                            <div class="content-card">{{ skill }}</div>
                          </template>

                          <template #footer>
                            <div class="d-flex justify-content-end">
                              <AppButtonEdit @click="openSkillPrecontractModal(skill)" />
                              <AppButtonDelete @click="openDeleteModal(skill, 'habilidad')" />
                            </div>
                          </template>
                        </AppCard>
                      </div>
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head><h5 class="fw-bold text-primary">Distribución del registro presupuestal</h5></template>
                <template v-slot:content>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Proveedor</label>
                      <p class="form-control-plaintext">
                        {{ data.businessName }}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div class="row mb-3">
                      <div class="col-md-4 mb-1">
                        <label class="form-label fw-bold mb-0">Forma de pago</label>
                        <p class="form-control-plaintext">
                          {{ data?.BudgetPaymentFormName }}
                        </p>
                      </div>
                      <div class="col-md-4 mb-1">
                        <label class="form-label fw-bold mb-0">Distribución</label>
                        <p class="form-control-plaintext">
                          {{ data?.distributionMoney }}
                        </p>
                      </div>
                      <div class="col-md-4 mb-1">
                        <label class="form-label fw-bold mb-0">Cantidad de pagos</label>
                        <p class="form-control-plaintext">
                          {{ data?.countPayments }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="card-body table-responsive p-2 mt-3">
                    <table class="table table-bordered table align-middle text-center">
                      <thead>
                        <tr>
                          <th colspan="5">Distribución de proveedores</th>
                        </tr>
                        <tr>
                          <th>#</th>
                          <th>Proveedores</th>
                          <th>Monto</th>
                          <th>Monto Inicial</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody style="border-top: none">
                        <tr v-for="(row, index) in form.supplierId" :key="index">
                          <td>{{ index + 1 }}</td>
                          <td>{{ row.businessName }}</td>
                          <td>
                            <input type="number" v-model.number="row.value" class="form-control text-center" :disabled="true" min="1" @input="updateInitial(row)" />
                          </td>
                          <td>
                            <input
                              type="number"
                              v-model.number="row.valueInitial"
                              class="form-control text-center"
                              :disabled="distributionMoneyValidation || budgetPaymentValidation"
                              min="1"
                              :max="row.value - 1"
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                      <tfoot v-if="form.supplierId.length > 0" style="border-top: none" class="fw-bold">
                        <tr>
                          <td colspan="2">Total</td>
                          <td class="text-center">
                            {{ n(totalCommitted ?? 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(totalCommittedInitial ?? 0) }}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </template>
              </AppAccordionItem>
            </AppAccordion>
          </div>
        </template>
        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" :entity="entityCurrent" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
        </AppModal>
        <AppModal v-model="activitiePrecontractModal">
          <ActivitiePrecontractModal v-if="activitiePrecontractModal" :data="currentActivitiePrecontract" @close="closeActivitiePrecontractModal"></ActivitiePrecontractModal>
        </AppModal>
        <AppModal v-model="skillPrecontractModal">
          <SkillPrecontractModal v-if="skillPrecontractModal" :data="currentSkillPrecontract" @close="closeSkillPrecontractModal"></SkillPrecontractModal>
        </AppModal>
      </template>
      <template v-slot:actions>
        <div class="action-button-form">
          <AppButton label="core.save" :nativeType="'submit'"></AppButton>
        </div>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, computed, ref, onMounted, watch, onUnmounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AppChipPrime from '../../../shared/components/AppChipPrime.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import ActivitiePrecontractModal from './ActivitiePrecontractModal.vue';
import SkillPrecontractModal from './SkillPrecontractModal.vue';
import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { GetBudgetReportItemsService } from '../services/getBudgetReportItems.service';
import { CreateOrUpdateBudgetCdtService } from '../services/createOrUpdateBudgetCdt.service';
import { GetTablesBudgetsService } from '../services/getTablesBudgets.service';
import { GetAllRolesAdministrativeService } from '../../access/services/getAllRolesAdministrative.service';
import { GetAllPaymentMethodsService } from '../services/getAllPaymentMethods.service';
import { GetDistributionMoneyService } from '../services/getDistributionMoney.service';
import { GetStatusReportQueueService } from '../../reports/services/getStatusReportQueue.service';
import { GetUserByRoleService } from '../../reports/services/reports/getUserByRole.service';

import { ToastService } from '../../../shared/services/toast.service';
import { paymentMethodsDto } from '../dtos/paymentMethods.dto';

const getBudgetReportItemsService = new GetBudgetReportItemsService();
const createOrUpdateBudgetCdtService = new CreateOrUpdateBudgetCdtService();
const getTablesBudgetsService = new GetTablesBudgetsService();
const getAllRolesAdministrativeService = new GetAllRolesAdministrativeService();
const getAllPaymentMethodsService = new GetAllPaymentMethodsService();
const getDistributionMoneyService = new GetDistributionMoneyService();
const getUserByRoleService = new GetUserByRoleService();
const toastService = new ToastService();
const getStatusReportQueueService = new GetStatusReportQueueService();

export default defineComponent({
  name: 'PrecontractForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppAutocomplete,
    AppLoading,
    AppAccordion,
    AppButtonDelete,
    AppAccordionItem,
    AppGeographicSearch,
    AppChipPrime,
    AppIcon,
    AppCard,
    AppButtonEdit,
    AppConfirmDeleteModal,
    AppModal,
    ActivitiePrecontractModal,
    SkillPrecontractModal,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t, n } = useI18n();
    const loading = ref(true);
    const loadingLegalRepresentative = ref(false);
    const loadingSupervisor = ref(false);
    const title = ref('Crear precontrato');
    const optionsAcademicPeriod = ref();
    const optionsSupplier = ref();
    const optionsDocumentsGenerate = ref();
    const optionsReportItems = ref();
    const distributionSuppliers = ref<any>([]);
    const loadingSupplier = ref(false);
    const nameTables = ref();
    const rolUsers = ref();
    const allLegalRepresentatives = ref();
    const allSupervisors = ref();
    const distributionMoneys = ref();
    const budgetPaymentForms = ref<paymentMethodsDto[]>([]);
    const report = ref<any>();
    const editCode = ref<number | null>(null);
    const editedValue = ref<number | null>(null);
    const activitiePrecontractModal = ref(false);
    const currentActivitiePrecontract = ref<string | undefined>(undefined);
    const modalDelete = ref(false);
    const skillPrecontractModal = ref(false);
    const currentSkillPrecontract = ref<string | undefined>(undefined);
    const entityCurrent = ref('');
    const status = ref('IN_PROGRESS'); // Estado inicial
    let timer: ReturnType<typeof setTimeout> | undefined = undefined; // Para guardar el id del setTimeout
    const newUnspscCode = ref<number | null>(null); // Variable para el código ingresado
    const totalCommitted = computed(() => form.supplierId.reduce((sum, row) => sum + Number(row.value || 0), 0));
    const totalCommittedInitial = computed(() => {
      const total = form.supplierId.reduce((sum, row) => sum + Number(row.valueInitial || 0), 0);
      return parseFloat(total.toFixed(2));
    });
    const budgetPaymentValidation = computed(() => {
      const selected = budgetPaymentForms.value.find((item: paymentMethodsDto) => form.budgetPaymentFormId === item.id);
      return selected?.code === 'UNICO';
    });
    const distributionMoneyValidation = computed(() => {
      const selected = distributionMoneys.value.find((item: any) => form.distributionMoneyId === item.id);
      return selected?.id === 1; //Iguales
    });

    onMounted(async () => {
      loading.value = true;
      console.log(props);
      try {
        //optionsAcademicPeriod.value = await getAcademicPeriodsService.run();
        optionsReportItems.value = await getBudgetReportItemsService.run();
        //distributionSuppliers.value = await getDistributionSuppliersService.run();
        //optionsDocumentsGenerate.value = await getOptionsCdpsService.run();
        nameTables.value = await getTablesBudgetsService.run();
        rolUsers.value = await getAllRolesAdministrativeService.run();
        budgetPaymentForms.value = await getAllPaymentMethodsService.run();
        distributionMoneys.value = await getDistributionMoneyService.run();
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    });
    const supplier = {
      businessName: props.data?.businessName,
      id: props.data?.supplierId,
      value: props.data?.value,
    };
    const form = reactive({
      contractNumber: null,
      supervisorId: null,
      starDate: null,
      endDate: null,
      suscriptionDate: null,
      DescriptionOfNeed: null,
      municipalityId: undefined,
      regionId: undefined,
      countryId: undefined,
      unspscoCodes: [] as number[],
      activities: [] as string[],
      skills: [] as string[],
      suitability: null,
      generalExperience: null,
      specificExperience: null,

      priceNew: props.data?.value ?? null,
      //date: props.data?.dateCreate ? dayjs(props.data?.dateCreate).format('YYYY-MM-DDTHH:mm') : null,
      programId: props.data?.programId ?? null,
      subProgramId: props.data?.subProgramId ?? null,
      projectId: props.data?.projectId ?? null,
      concept: props.data?.concept ?? null,
      academicPeriodId: props.data?.academicPeriodId ?? null,
      supplierId: [supplier] as any[],
      distributionSuppliersId: props.data?.distributionSupplier ?? null,
      legalRepresentativeId: props.data?.legalRepresentativeId ?? null,
      budgetPaymentFormId: props.data?.budgetPaymentFormId ?? null,
      distributionMoneyId: props.data?.distributionMoney ?? null,
      countPayment: props.data?.countPayments ?? null,

      legalRepresentativeRolId: null,
      supervisorRolId: null,
    });
    // Reglas de validación
    const rules = computed(() => ({
      form: {
        contractNumber: { required },
        supervisorId: { required },
        starDate: { required },
        endDate: { required },
        suscriptionDate: { required },
        DescriptionOfNeed: { required },
        municipalityId: { required },
        regionId: { required },
        countryId: { required },
        unspscoCodes: [],
        activities: [],
        skills: [],
        suitability: { required },
        generalExperience: { required },
        specificExperience: { required },

        priceOld: {},
        priceNew: { required },
        //date: { required },
        programId: {},
        subProgramId: {},
        projectId: {},
        concept: {},
        academicPeriodId: { required },
        supplierId: { required },
        legalRepresentativeId: { required },
        //supervisorId: { required },
        budgetPaymentFormId: { required },
        distributionMoneyId: !budgetPaymentValidation.value ? { required } : {},
        countPayment: !budgetPaymentValidation.value ? { required } : {},
        legalRepresentativeRolId: {},
        supervisorRolId: {},
      },
    }));
    const v$ = useVuelidate(rules, { form });
    const updateInitial = (row: any) => {
      if (budgetPaymentValidation.value) {
        row.valueInitial = row.value;
      } else {
        if (distributionMoneyValidation.value) {
          row.valueInitial = parseFloat((row.value / (form.countPayment ?? 1)).toFixed(2)); //Monto inicial: Monto comprometido / cantidad de pagos
        }
      }
    };

    const addUnspscCode = () => {
      const result = validateCode(newUnspscCode.value, form.unspscoCodes);
      if (!result.valid) {
        showWarningToast(result.error!);
        return;
      }
      form.unspscoCodes.push(Number(newUnspscCode.value));
      newUnspscCode.value = null;
    };
    const removeUnspscCode = (codeToRemove: number) => {
      form.unspscoCodes = form.unspscoCodes.filter((code) => code !== codeToRemove);
    };
    const startEditCode = (code: number) => {
      editCode.value = code;
      editedValue.value = code;
    };
    const saveEditCode = () => {
      const result = validateCode(editedValue.value, form.unspscoCodes, true, editCode.value);
      if (!result.valid) {
        showWarningToast(result.error!);
        return;
      }
      const index = form.unspscoCodes.findIndex((c) => c === editCode.value);
      if (index !== -1) {
        form.unspscoCodes[index] = Number(editedValue.value);
        cancelEditCode();
      }
    };
    const cancelEditCode = () => {
      editCode.value = null;
      editedValue.value = null;
    };
    const validateCode = (code: unknown, list: number[], allowDuplicate = false, originalValue?: number | null): { valid: boolean; error?: string } => {
      if (code === null || code === undefined || String(code).trim() === '') {
        return { valid: false, error: 'El código no puede estar vacío.' };
      }
      const number = Number(code);
      if (!Number.isInteger(number)) {
        return { valid: false, error: 'Solo se permiten números enteros.' };
      }
      const exists = list.includes(number);
      if (exists && (!allowDuplicate || number !== originalValue)) {
        return { valid: false, error: 'El código ya existe.' };
      }
      return { valid: true };
    };
    const openActivitiePrecontractModal = (activitie?: string) => {
      activitiePrecontractModal.value = true;
      currentActivitiePrecontract.value = activitie;
    };
    const closeActivitiePrecontractModal = (activitie?: string, editActivitie?: string) => {
      console.log(activitie);
      if (activitie && editActivitie) {
        const index = form.activities.findIndex((c) => c === editActivitie);
        if (index !== -1) {
          form.activities[index] = activitie;
        }
      } else if (activitie) {
        form.activities.push(activitie);
      }
      activitiePrecontractModal.value = false;
      currentActivitiePrecontract.value = undefined;
    };
    const confirmDelete = () => {
      modalDelete.value = false;
      if (entityCurrent.value === 'actividad') {
        deleteActivitiePrecontract(currentActivitiePrecontract.value!);
        currentActivitiePrecontract.value = undefined;
      } else if (entityCurrent.value === 'habilidad') {
        deleteSkillPrecontract(currentSkillPrecontract.value!);
        currentSkillPrecontract.value = undefined;
      }
      entityCurrent.value = '';
    };
    const openDeleteModal = (activitie: string, entity: string) => {
      if (entity === 'actividad') {
        currentActivitiePrecontract.value = activitie;
      } else if (entity === 'habilidad') {
        currentSkillPrecontract.value = activitie;
      }
      modalDelete.value = true;
      entityCurrent.value = entity;
    };
    const deleteActivitiePrecontract = (activitie: string) => {
      form.activities = form.activities.filter((item) => item !== activitie);
    };

    const openSkillPrecontractModal = (skill?: string) => {
      skillPrecontractModal.value = true;
      currentSkillPrecontract.value = skill;
    };
    const closeSkillPrecontractModal = (skill?: string, editSkill?: string) => {
      if (skill && editSkill) {
        const index = form.skills.findIndex((c) => c === editSkill);
        if (index !== -1) {
          form.skills[index] = skill;
        }
      } else if (skill) {
        form.skills.push(skill);
      }
      skillPrecontractModal.value = false;
      currentSkillPrecontract.value = undefined;
    };
    const deleteSkillPrecontract = (skill: string) => {
      form.skills = form.skills.filter((item) => item !== skill);
    };

    watch(
      () => form.legalRepresentativeRolId,
      async () => {
        if (form.legalRepresentativeRolId) {
          loadingLegalRepresentative.value = true;
          try {
            allLegalRepresentatives.value = await getUserByRoleService.run(form.legalRepresentativeRolId);
          } catch (e) {
            console.error(e);
          }
          loadingLegalRepresentative.value = false;
        }
      }
    );
    watch(
      () => form.supervisorRolId,
      async () => {
        if (form.supervisorRolId) {
          loadingSupervisor.value = true;
          try {
            allSupervisors.value = await getUserByRoleService.run(form.supervisorRolId);
          } catch (e) {
            console.error(e);
          }
          loadingSupervisor.value = false;
        }
      }
    );
    watch(
      () => form.budgetPaymentFormId,
      async () => {
        if (budgetPaymentValidation.value) {
          //Pago unico
          form.distributionMoneyId = null;
          form.countPayment = null;
          if (form.supplierId.length > 0) {
            form.supplierId.forEach((row) => {
              row.valueInitial = row.value;
            });
          }
        }
      }
    );
    watch(
      () => form.countPayment,
      async (newVal) => {
        if (newVal) {
          if (form.supplierId.length > 0 && distributionMoneyValidation.value) {
            //Distribución iguales
            form.supplierId.forEach((row: any) => {
              row.valueInitial = parseFloat((row.value / newVal).toFixed(2)); //Monto inicial: Monto comprometido / cantidad de pagos
            });
          }
        }
      }
    );

    const verifyStatus = async (maxRetries = 10) => {
      let retries = 0;

      const checkStatus = async () => {
        if (retries >= maxRetries) {
          console.error('Máximo de intentos alcanzado.');
          return;
        }

        if (report.value.reportId) {
          const response = await getStatusReportQueueService.run(report.value.reportId);

          if (response) {
            status.value = response.status; // Estado actual ("IN_PROGRESS", "OK", etc.)

            if (status.value === 'OK') {
              loading.value = false;
              emit('close');
              return;
            }
          }
        }

        // Si el reporte sigue en proceso, intentar nuevamente
        if (status.value === 'IN_PROGRESS') {
          retries++;
          timer = setTimeout(async () => {
            await checkStatus(); // Vuelve a consultar después de 1 segundo
          }, 1000);
        }
      };
      checkStatus(); // Inicia la verificación del estado
      // Limpiar el timeout cuando el componente se desmonta
      onUnmounted(() => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };

    const showWarningToast = (message: string) => {
      toastService.hide();
      toastService.show(message, 'warning');
    };

    const save = async () => {
      console.log(form);
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) {
        showWarningToast('Valida los campos del formulario.');
        return;
      }
      if (totalCommitted.value !== form.priceNew) {
        showWarningToast('El monto total de los proveedores debe ser igual al nuevo monto comprometido.');
        return;
      }
      const validateValueSupplier = form.supplierId.every((supplier: any) => supplier.value > 0);
      if (validateValueSupplier === false) {
        showWarningToast('El monto de cada proveedor debe ser mayor a 0.');
        return;
      }
      loading.value = true;
      const dataCdt = {
        value: form.priceNew,
        concept: form.concept,
        convertTo: 'pdf',
        itemCodeCdt: optionsReportItems.value?.[0]?.code,
        itemCodeBudget: optionsReportItems.value?.[1]?.code,
        programId: form.programId,
        subProgramId: form.subProgramId,
        projectId: form.projectId,
        //dateProject: dayjs(form.date).format('YYYY-MM-DD HH:mm'),
        academicPeriodId: form.academicPeriodId,
        actionId: props.data?.actionId,
        nameTable: nameTables.value?.find((item: any) => item.id === 3)?.label,
        legalRepresentativeId: form.legalRepresentativeId,
        statusId: 0, //Estado CDT
        dataSupplier: form.supplierId.map((item: any) => ({
          supplierId: item.id,
          value: item.value,
        })),
        numberReportCdt: props.data?.codeReport ?? null,
        distributionSupplier: form.distributionSuppliersId ?? null,
      };
      const dataCdtWithRp = {
        ...dataCdt,
        dataRegister: [
          {
            budgetPaymentFormId: form.budgetPaymentFormId,
            distributionMoney: distributionMoneys.value?.find((item: any) => item.id === form.distributionMoneyId)?.label || null,
            countPayments: form.countPayment || null,
            statusId: 0,
            suppliers: form.supplierId.map((item: any) => ({
              supplierId: item.id,
              value: item.value,
              valueInitial: item.valueInitial,
            })),
          },
        ],
      };

      try {
        //CDT + RP
        report.value = await createOrUpdateBudgetCdtService.run(dataCdtWithRp);
        await verifyStatus();
      } catch (e) {
        console.error(e);
        loading.value = false;
      }
    };

    return {
      t,
      n,
      title,
      save,
      v$,
      dayjs,
      loading,
      BudgetExecutionConstants,
      optionsAcademicPeriod,
      optionsSupplier,
      distributionSuppliers,
      optionsDocumentsGenerate,
      loadingSupplier,
      form,
      totalCommitted,
      totalCommittedInitial,
      rolUsers,
      allLegalRepresentatives,
      allSupervisors,
      budgetPaymentForms,
      distributionMoneys,
      budgetPaymentValidation,
      distributionMoneyValidation,
      updateInitial,
      loadingLegalRepresentative,
      loadingSupervisor,
      newUnspscCode,
      addUnspscCode,
      removeUnspscCode,
      editCode,
      editedValue,
      startEditCode,
      saveEditCode,
      cancelEditCode,
      closeActivitiePrecontractModal,
      openActivitiePrecontractModal,
      activitiePrecontractModal,
      currentActivitiePrecontract,
      openDeleteModal,
      modalDelete,
      confirmDelete,
      closeSkillPrecontractModal,
      openSkillPrecontractModal,
      skillPrecontractModal,
      currentSkillPrecontract,
      entityCurrent,
    };
  },
});
</script>
<style scoped>
:deep(.accordion .o-accordion-button) {
  font-size: 18px;
}
.app-chip--edit-mode {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}
</style>
