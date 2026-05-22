<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title + (v$.form.name.$model === undefined ? '' : v$.form.name.$model)">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'contract' }" @click="activeTab = 'contract'">Tipo de contrato</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'reports' }" @click="activeTab = 'reports'">Asociar reportes</a>
            </li>
          </ul>
          <div class="tab-content mt-3">
            <div v-if="activeTab === 'contract'">
              <div class="form-row">
                <AppFormField :form-control="v$.form.name">
                  <label for="name">Nombre</label>
                  <input type="text" class="form-control" v-model="v$.form.name.$model" />
                </AppFormField>
                <AppFormField :form-control="v$.form.description">
                  <label for="description">Descripción</label>
                  <input type="text" class="form-control" v-model="v$.form.description.$model" />
                </AppFormField>
              </div>
              <div class="form-row">
                <AppFormField :form-control="v$.form.code" label="Código">
                  <AppAutocomplete v-model="v$.form.code.$model" label="value" :options="contractConstants" :reduce="(d: any) => d.code"></AppAutocomplete>
                </AppFormField>
              </div>
            </div>
            <div v-if="activeTab === 'reports'">
              <div v-if="!form.id" class="text-center alert alert-warning" role="alert">
                <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
                <strong>Debes guardar el tipo de contrato antes de asociar reportes.</strong>
              </div>
              <div v-else>
                <div class="form-row flex-row align-items-center">
                  <AppFormField label="Reporte">
                    <AppAutocomplete v-model="currentReports" label="nameItem" :options="optionsReports" :reduce="(d: any) => d.itemId"></AppAutocomplete>
                  </AppFormField>
                  <AppButton variant="primary" label="Agregar Reporte" class="mt-1" @click="addReport"> </AppButton>
                </div>
                <div>
                  <h5>Lista de reportes</h5>
                  <div class="table-responsive">
                    <table class="table table-bordered table-hover align-middle">
                      <thead class="bg-light text-dark text-center">
                        <tr>
                          <th style="width: 5%">#</th>
                          <th style="width: 70%">Nombre de Reporte</th>
                          <th style="width: 20%">Es un solo documento?</th>
                          <th style="width: 5%"></th>
                        </tr>
                      </thead>
                      <draggable v-model="selectedReports" @end="updateOrder" tag="tbody" item-key="id" handle=".drag-handle">
                        <template #item="{ element, index }">
                          <tr class="text-center">
                            <td class="drag-handle" style="cursor: grab">
                              <div class="d-flex align-items-center gap-2"><AppIcon icon="arrows-alt" class="me-2"></AppIcon>{{ index + 1 }}.</div>
                            </td>
                            <td class="text-start">{{ element.nameItem }}</td>
                            <td>
                              <input class="form-check-input" type="checkbox" v-model="element.singleReport" @change="updateSingleValidation(element)" />
                            </td>
                            <td>
                              <AppButtonDelete :disabled="element.isRequired" @click="openConfirmDelete(element)"></AppButtonDelete>
                            </td>
                          </tr>
                        </template>
                      </draggable>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <AppModal v-model="modalDeleteTypeContract">
          <AppConfirmDeleteModal v-if="modalDeleteTypeContract" entity="Tipo de contrato" @confirmDelete="deleteTypeContract" />
        </AppModal>
      </template>
      <template v-slot:actions>
        <AppButton v-if="activeTab === 'contract'" :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, toRefs, computed } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import draggable from 'vuedraggable';

import { typeContractReportsDto } from '../dtos/typeContractReports.dto';

import { GetBudgetReportItemsService } from '../services/getBudgetReportItems.service';
import { GetTypeContractReportsService } from '../services/getTypeContractReports.service';
import { CreateOrUpdateTypeContractService } from '../services/createOrUpdateTypeContract.service';
import { GetTypeContractConstantService } from '../services/getTypeContractConstant.service';
import { PostTypeContractReportsService } from '../services/postTypeContractReports.service';
import { DeleteTypeContractReportsService } from '../services/deleteTypeContractReports.service';
import { UpdateTypeContractReportsUpdateService } from '../services/updateTypeContractReportsUpdate.service';

import { ToastService } from '../../../shared/services/toast.service';
const toastService = new ToastService();

const createOrUpdateTypeContractService = new CreateOrUpdateTypeContractService();
const getContractConstantsService = new GetTypeContractConstantService();
const getBudgetReportItemsService = new GetBudgetReportItemsService();
const getTypeContractReportsService = new GetTypeContractReportsService();
const postTypeContractReportsService = new PostTypeContractReportsService();
const deleteTypeContractReportsService = new DeleteTypeContractReportsService();
const updateTypeContractReportsUpdateService = new UpdateTypeContractReportsUpdateService();

export default defineComponent({
  name: 'TypeContractModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppLoading,
    AppAutocomplete,
    AppIcon,
    draggable,
    AppButtonDelete,
    AppModal,
    AppConfirmDeleteModal,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const { data } = toRefs(props);
    let title = 'Agregar tipo de contrato';
    if (props.data?.id) {
      title = 'Editar tipo de contrato ';
    }

    const loading = ref(true);
    const modalDeleteTypeContract = ref(false);
    const currentReportsSelected = ref();
    const contractConstants = ref([]);
    const activeTab = ref('contract');
    const optionsReports = ref([]);
    const currentReports = ref<number | null>();
    const selectedReports = ref<typeContractReportsDto[]>([]);
    const conflictCodes = ['reports.budgets.contractOfSale', 'reports.budgets.contractForProvisionOfServices'];

    const form: any = reactive({
      id: data.value?.id ?? null,
      name: data.value?.name,
      description: data.value?.description,
      code: data.value?.code,
    });

    const v$ = useVuelidate(
      {
        form: {
          id: {},
          name: { required },
          description: { required },
          code: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        contractConstants.value = await getContractConstantsService.run();
        const res = await getBudgetReportItemsService.run();
        optionsReports.value = res?.map((item: any) => ({
          ...item,
          itemId: item.id,
        }));
        getReportsSelected();
      } catch (error) {
        console.log('This is error', error);
      }
      loading.value = false;
    });

    const getReportsSelected = async () => {
      try {
        if (form.id) {
          const params = { typeContractId: form.id };
          const res = await getTypeContractReportsService.run(params);
          selectedReports.value = res
            .map((item: any) => ({
              ...item,
              singleReport: !!item.singleReport,
              order: item.orderReport,
            }))
            .sort((a, b) => a.orderReport - b.orderReport);
        } else {
          selectedReports.value = optionsReports.value.filter((item: any) => !!item.isRequired === true).map((item: any) => ({ ...item, order: item.orderReport }));
          updateOrderIndex();
        }
      } catch (error) {
        console.log('This is error', error);
      }
    };
    const openConfirmDelete = (item: typeContractReportsDto) => {
      currentReportsSelected.value = item.id;
      modalDeleteTypeContract.value = true;
    };
    const deleteTypeContract = async () => {
      try {
        await deleteTypeContractReportsService.run(currentReportsSelected.value);
        await getReportsSelected();
        updateOrder();
      } catch (e) {
        console.log('This is error', e);
      }
      modalDeleteTypeContract.value = false;
      currentReportsSelected.value = null;
    };
    const addReport = async () => {
      const selectId = currentReports.value;
      const selectReportExist = selectedReports.value.some((item: any) => item.itemId === selectId);
      if (selectReportExist) {
        showWarningToast('Este reporte ya ha sido seleccionado.');
        return;
      }

      const reportSelect = optionsReports.value.find((item: any) => item.itemId === selectId);
      if (reportSelect) {
        await saveReportSingle(reportSelect);
        getReportsSelected();
      }
    };
    const updateOrder = async () => {
      updateOrderIndex();
      console.log(selectedReports.value);
      const dataSend = {
        typeContractReports: [
          ...selectedReports.value.map((item: any) => ({
            id: item.id,
            orderReport: item.order,
          })),
        ],
      };
      await updateTypeContractReportsUpdateService.run(dataSend);
    };
    const updateOrderIndex = async () => {
      selectedReports.value.forEach((report, index) => {
        report.order = index + 1;
      });
    };
    const buildReportData = (items: any[], orderOverride?: number) => ({
      typeContractId: form.id,
      itemsData: items.map((item: any, index: number) => ({
        itemId: item.itemId,
        orderReport: orderOverride ?? item.order ?? index + 1,
        isProofOfDischarge: item.code === 'reports.budgets.proofOfGraduation' ? 1 : 0,
        settlementCertificate: item.code === 'reports.budgets.liquidationRecord' ? 1 : 0,
        singleReport: item.singleReport ?? false,
        name: item.nameItem,
      })),
    });

    const sendReportData = async (items: any[], orderOverride?: number) => {
      try {
        const dataSendReports = buildReportData(items, orderOverride);
        await postTypeContractReportsService.run(dataSendReports);
      } catch (error) {
        console.error('This is error', error);
      }
    };

    const updateSingleValidation = async (item: any) => {
      await sendReportData([item]);
    };

    const saveReportSingle = async (item: any) => {
      //validar si hace conflicto
      const validate = validateSingleReport(selectedReports.value, item, form.code);
      console.log('validate', selectedReports.value, item, form.code);
      if (validate) {
        await sendReportData([item], selectedReports.value.length + 1);
      } else {
        showWarningToast('Solo puedes elegir un tipo de contrato. Puedes modificarlo en la sección correspondiente.');
      }
    };

    const saveReport = async () => {
      selectedReports.value = resolveConflictsCodes(selectedReports.value, form.code);
      await sendReportData(selectedReports.value);
    };
    const validateSingleReport = (selectedReports: typeContractReportsDto[], item: typeContractReportsDto, formCode: string) => {
      const existItemConflict = conflictCodes.includes(item.code);
      if (!existItemConflict) return true;

      const conflictingItems = selectedReports.filter((r) => conflictCodes.includes(r.code));
      if (conflictingItems.length > 0) {
        return false;
      } else {
        return true;
      }
    };
    const resolveConflictsCodes = (selectedReports: typeContractReportsDto[], formCode: string) => {
      const conflictingItems = selectedReports.filter((r) => conflictCodes.includes(r.code));
      if (conflictingItems.length > 1) {
        return selectedReports?.filter((r) => !conflictCodes.includes(r.code) || r.code === formCode);
      }
      return selectedReports;
    };
    const showWarningToast = (message: string) => {
      toastService.hide();
      toastService.show(message, 'warning');
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;
      try {
        if (activeTab.value === 'contract') {
          const res = await createOrUpdateTypeContractService.run(form, form.id);
          if (!form.id) {
            form.id = res.data?.contractType;
            saveReport();
          }
          const contractSelectOld = selectedReports.value.find((item: typeContractReportsDto) => item.code === form.code);
          if (!contractSelectOld?.itemId) {
            console.log('actualizar tipo de contrato cambio entonces');
            const conflictingReport = selectedReports.value.find(
              (report) => conflictCodes.includes(report.code) // Verifica coincidencia exacta
            );
            console.log(conflictingReport);
            await deleteTypeContractReportsService.run(conflictingReport?.id);
            await getReportsSelected();
            const newItem = optionsReports.value.find((item: any) => item.code === form.code);
            await saveReportSingle(newItem);
            getReportsSelected();
          }
          activeTab.value = 'reports'; // Pasar automáticamente a la siguiente pestaña
          emit('update');
        }
      } catch (error) {
        console.log('This is error', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      title,
      loading,
      v$,
      save,
      contractConstants,
      activeTab,
      form,
      selectedReports,
      optionsReports,
      openConfirmDelete,
      addReport,
      updateOrder,
      updateSingleValidation,
      currentReports,

      deleteTypeContract,
      modalDeleteTypeContract,
    };
  },
});
</script>
