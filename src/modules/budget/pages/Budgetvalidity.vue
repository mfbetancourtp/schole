<template>
  <AppBaseList :title="title">
    <template v-slot:actions>
      <template v-if="academicPeriods.length">
        <AppCheckPermission permission="budget.budgetValidity.Created">
          <AppButton style="color: white" label="Agregar Vigencia" @click="openFormModal"></AppButton>
        </AppCheckPermission>
      </template>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <AppEmptyResponse v-else-if="!academicPeriods.length" :show-image="true" title="Sin periodos configurados" :subtitle="false"></AppEmptyResponse>

      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="academicPeriodId" :filter-name="'institutionalTimeline.academicPeriodId'" @isNotInitialized="notFilterAcademicPeriodId">
              <label>Año vigencia</label>
              <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"></AppAutocomplete>
            </AppFilter>
          </div>
        </div>

        <AppLoading v-if="loadingBudgetValidity"></AppLoading>

        <template v-else>
          <AppEmptyResponse v-if="!BudgetValidity.length" :show-image="true" :subtitle="false"></AppEmptyResponse>

          <template v-else>
            <div class="box">
              <ul id="first-list">
                <template v-for="(item, index) in BudgetValidity" :key="index">
                  <li>
                    <span></span>
                    <div class="container-infocards">
                      <h5 class="m-0">{{ item.name }}</h5>
                      <div>Código: {{ item.code }}</div>
                      <div>
                        Fecha:
                        <span style="font-weight: 400">{{ item.startDate }} - {{ item.endDate }}</span>
                      </div>
                      <!-- Agregar estados -->
                      <div class="d-flex gap-2 flex-wrap">
                        <div v-for="(status, statusIndex) in item.statusBudgetValidatesDate.filter((status: any) => status.isActive !== 0)" :key="statusIndex">
                          <div class="type-chip" :class="getTypeClass(status.statusBudgetValidates[0]?.type)">
                            {{ status.statusBudgetValidates[0]?.name }}
                          </div>
                        </div>
                      </div>

                      <div class="d-flex justify-content-between">
                        <div></div>

                        <AppButtonGroup>
                          <AppButton
                            :to="{
                              name: 'budget.budgetValiditySumamry',
                              params: { StatusId: item.id },
                            }"
                            v-tooltip="'Resumen de vigencia presupuestal'"
                            icon="tasks"
                            outlined
                          ></AppButton>
                          <AppCheckPermission permission="events.institutionalTimeline.edit">
                            <AppButtonEdit @click="openFormModal(item)"></AppButtonEdit>
                          </AppCheckPermission>

                          <AppButtonDelete @click="openConfirmDelete(item.id)"></AppButtonDelete>
                        </AppButtonGroup>
                      </div>
                    </div>

                    <div class="time">
                      <span>{{ item.startDate }}</span>
                      <span></span>
                    </div>
                  </li>
                </template>
              </ul>
            </div>
          </template>
        </template>
      </template>
      <AppModal v-model="modalForm">
        <BudgetvalidityForm v-if="modalForm" :data="currentStatus.value" @close="closeModalForm"> </BudgetvalidityForm>
      </AppModal>

      <AppModal v-model="signatureDelete">
        <AppConfirmDeleteModal v-if="signatureDelete" :entity="'vigencia'" @confirmDelete="confirmDelete" @close="signatureDelete = false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, Ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import BudgetvalidityForm from '../components/BudgetvalidityForm.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { GetAcademicPeriodsService } from '../../administration/services/getAcademicPeriods.service';
import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { GetListBudgetValidity } from '../services/getListBudgetValidity';
import { DeleteBudgetValidityService } from '../services/deleteBudgetValidity.service';

const getListBudgetValidity = new GetListBudgetValidity();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const deleteBudgetValidityService = new DeleteBudgetValidityService();

export default defineComponent({
  name: 'BudgetValidity',
  components: {
    AppConfirmDeleteModal,
    BudgetvalidityForm,
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppFilter,
    AppCheckPermission,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Vigencia Presupuestal';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const BudgetValidity: Ref<any[]> = ref([]);
    const academicPeriods: Ref<any> = ref([]);
    const academicPeriodId = ref();
    const activeAcademicPeriods = ref([]);
    const loadingBudgetValidity = ref(false);
    const loading = ref(true);
    const signatureDelete = ref(false);
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const modalForm = ref(false);
    const currentStatus: { value: any | null } = reactive({
      value: null,
    });

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Presupuesto', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      const allAcademicPeriods: any = await getAcademicPeriodsService.run();
      activeAcademicPeriods.value = allAcademicPeriods.filter((period: any) => period.active === 1);
      await getListBudgetValidity.run();

      if (activeAcademicPeriods.value.length > 0) {
        academicPeriodId.value = null;
      }

      loading.value = false;
    });
    const getTypeClass = (type: number) => {
      switch (type) {
        case 1:
          return 'chip-started'; // Clase para "Iniciado"
        case 2:
          return 'chip-in-progress'; // Clase para "En proceso"
        case 3:
          return 'chip-finished'; // Clase para "Finalizada"
        default:
          return 'chip-default'; // Clase predeterminada
      }
    };
    const notFilterAcademicPeriodId = () => {
      if (academicPeriods.value.length) {
        academicPeriods.value = null;
      }
    };

    watch(academicPeriodId, async () => {
      await getBudgetValidity();
    });

    const getBudgetValidity = async () => {
      loadingBudgetValidity.value = true;

      BudgetValidity.value = await getListBudgetValidity.run();

      loadingBudgetValidity.value = false;
    };

    const openConfirmDelete = async (signatureId: number) => {
      signatureDelete.value = true;
      currentDataDelete.value = signatureId;
    };

    const confirmDelete = async () => {
      try {
        if (currentDataDelete.value) {
          await deleteBudgetValidityService.run(currentDataDelete.value);

          currentDataDelete.value = null;
          await getBudgetValidity();
        }
        console.log('Respuesta de confirmación de eliminación:');
      } catch (error) {
        console.error('Error al confirmar eliminación:', error);
      }
      signatureDelete.value = false;
    };

    const openFormModal = (status: any | null = null) => {
      currentStatus.value = status;
      modalForm.value = true;
    };

    const closeModalForm = () => {
      modalForm.value = false;
      getBudgetValidity();
    };

    return {
      loading,
      routes,
      title,
      modalForm,
      currentStatus,

      loadingBudgetValidity,
      BudgetValidity,
      academicPeriodId,
      signatureDelete,
      academicPeriods: activeAcademicPeriods,
      notFilterAcademicPeriodId,
      openConfirmDelete,
      confirmDelete,
      closeModalForm,
      openFormModal,
      t,
      getTypeClass,
    };
  },
});
</script>

<style scoped>
.box {
  padding: 0px 0 40px 70px;
}

.box ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  position: relative;
  top: 0;
}

.box ul:last-of-type {
  top: 0px;
}

.box ul:before {
  content: '';
  display: block;
  width: 0;
  height: 100%;
  border: 1px dashed #00b0da;
  position: absolute;
  top: 0;
  left: 30px;
}

.box ul li {
  margin: 20px 60px 60px;
  position: relative;
  padding: 10px 20px;
  background: #fff;
  color: #111;
  border-radius: 20px;
  line-height: 20px;
  width: 95%;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.2);
}

.box ul li > span {
  content: '';
  display: block;
  width: 0;
  height: 100%;
  border: 1px solid #00b0da;
  position: absolute;
  top: 0;
  left: -30px;
}

.box ul li > span:before,
.box ul li > span:after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0f6fc5;
  border: 2px solid #0f6fc5;
  position: absolute;
  left: -5px;
}

.box ul li > span:before {
  top: -10px;
}
.box ul li > span:after {
  top: 95%;
}

.box .title {
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 5px;
}

.box .info:first-letter {
  text-transform: capitalize;
  line-height: 6;
}

.box .name {
  margin-top: 10px;
  text-transform: capitalize;
  font-style: italic;
  text-align: right;
  margin-right: 20px;
}

.box .time span {
  position: absolute;
  left: -110px;
  color: #111;
  font-size: 80%;
  font-weight: bold;
}
.box .time span:first-child {
  top: -16px;
}
.box .time span:last-child {
  top: 94%;
}
.container-infocards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.type-chip {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-align: center;
}

.chip-started {
  background-color: #4caf50; /* Verde para "Iniciado" */
}

.chip-in-progress {
  background-color: #ff9800; /* Naranja para "En proceso" */
}

.chip-finished {
  background-color: #f44336; /* Rojo para "Finalizada" */
}

.chip-default {
  background-color: #9e9e9e; /* Gris para cualquier otro caso */
}
</style>
