<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="handleVisibilityChange">
    <template #head>
      <AppDrawerHeader
        class="ms-2 pt-2"
        variant="view"
        icon="user-tie"
        :title="detail?.teacherName || 'Detalle del docente'"
        :subtitle="detail?.contractType || 'Consulta el resumen de carga y los contratos asociados.'"
      >
        <template v-if="detail" #meta>
          <AppBadge :label="statusLabel" :variant="statusVariant" />
        </template>
      </AppDrawerHeader>
    </template>

    <template #body>
      <div v-if="isLoading" class="tbDrawer__loading">
        <span class="text-muted">Cargando información del docente...</span>
      </div>

      <div v-else-if="detail" class="tbDrawer px-4 py-4">
        <!-- ── Información General ── -->
        <div class="tbDrawer__infoSection">
          <div class="tbDrawer__infoRow">
            <span class="tbDrawer__infoLabel">Nombre completo</span>
            <strong class="tbDrawer__infoValue">{{ detail.teacherName }}</strong>
          </div>
          <div v-if="detail.identification" class="tbDrawer__infoRow">
            <span class="tbDrawer__infoLabel">Identificación</span>
            <span class="tbDrawer__infoValue">{{ detail.identification }}</span>
          </div>
          <div v-if="detail.contractType" class="tbDrawer__infoRow">
            <span class="tbDrawer__infoLabel">Tipo de contrato</span>
            <span class="tbDrawer__infoValue">{{ detail.contractType }}</span>
          </div>
        </div>

        <!-- ── Resumen de Carga Actual ── -->
        <div class="mt-4">
          <div class="tbDrawer__sectionTitle mb-3">Resumen de Carga Actual</div>

          <div class="tbDrawer__loadBar" :class="`tbDrawer__loadBar--${statusKey}`">
            <div class="tbDrawer__loadBarHead">
              <span>Carga actual</span>
              <strong>{{ detail.loadSummary.percentage }}%</strong>
            </div>
            <div class="tbDrawer__progress">
              <div class="tbDrawer__progressFill" :style="{ width: `${detail.loadSummary.percentage}%` }"></div>
            </div>
          </div>

          <div class="row g-3 mt-1">
            <div class="col-6">
              <div class="tbDrawer__metric">
                <small>Horas Asignadas</small>
                <strong>{{ detail.loadSummary.assignedHours }}h</strong>
                <span class="text-muted">de {{ detail.loadSummary.totalMaxHours }}h</span>
              </div>
            </div>
            <div class="col-6">
              <div class="tbDrawer__metric">
                <small>Horas Disponibles</small>
                <strong :class="`tbDrawer__available--${statusKey}`">{{ detail.loadSummary.availableHours }}h</strong>
              </div>
            </div>
          </div>

          <div class="tbDrawer__courseCount mt-3">
            <span>Total de Asignaturas</span>
            <strong>{{ detail.loadSummary.courseCount }}</strong>
          </div>
        </div>

        <!-- ── Asignaturas Asignadas ── -->
        <div class="mt-4">
          <div class="tbDrawer__sectionTitle mb-3">Asignaturas Asignadas</div>

          <div v-if="detail.assignedSubjects?.length" class="tbDrawer__subjectList">
            <div v-for="(subject, i) in detail.assignedSubjects" :key="`${subject.code}-${i}`" class="tbDrawer__subjectItem">
              <div class="tbDrawer__subjectHead">
                <span class="fw-semibold">{{ subject.name }}</span>
                <strong class="tbDrawer__subjectHours">{{ subject.hours }}h</strong>
              </div>
              <small v-if="subject.code" class="text-muted">{{ subject.code }}</small>
            </div>
          </div>

          <AppEmptyResponse v-else :show-image="false" title="Sin asignaciones actuales" subtitle="Este docente todavía no tiene asignaturas registradas." size="xs" />
        </div>

        <!-- ── Contratos por Periodo ── -->
        <div class="mt-4">
          <div class="tbDrawer__cardHead mb-3">
            <span class="tbDrawer__sectionTitle">Contratos por Periodo</span>
            <button v-if="!contracts.length && !showContractForm" type="button" class="tbDrawer__assignBtn" @click="openContractForm()">
              <AppIcon icon="plus" class="me-1" />
              Asignar contrato
            </button>
          </div>

          <!-- Formulario nuevo / editar contrato -->
          <div v-if="showContractForm" class="tbDrawer__contractForm">
            <strong class="tbDrawer__formTitle">{{ editingContractId ? 'Editar Contrato' : 'Nuevo Contrato' }}</strong>

            <AppFormField label="Tipo de contrato">
              <AppAutocomplete v-model="newContractTypeId" :options="contractTypeOptions" label="name" :reduce="(o: any) => o.id" :clearable="false" placeholder="Seleccionar tipo" />
            </AppFormField>

            <div class="tbDrawer__formActions">
              <AppButton variant="primary" :disabled="isSaving || !newContractTypeId" @click="saveContract">Guardar</AppButton>
              <AppButton variant="primary" outlined @click="cancelContractForm">Cancelar</AppButton>
            </div>
          </div>

          <!-- Lista de contratos -->
          <div v-if="contracts.length" class="tbDrawer__contractList">
            <div
              v-for="contract in contracts"
              :key="contract.id"
              class="tbDrawer__contractItem"
              :class="{
                'tbDrawer__contractItem--active': contract.academicPeriod?.active === 1,
              }"
            >
              <div class="tbDrawer__contractHeader">
                <div class="tbDrawer__contractPeriod">
                  <span class="fw-semibold">{{ contract.academicPeriod?.code || contract.academicPeriod?.name || contract.academicPeriodId }}</span>
                  <AppBadge v-if="contract.academicPeriod?.active === 1" label="Periodo actual" variant="success" />
                </div>
                <AppBadge :label="contract.academicPeriod?.active === 1 ? 'Activo' : 'Finalizado'" :variant="contract.academicPeriod?.active === 1 ? 'success' : 'ghost'" />
              </div>

              <div class="tbDrawer__contractMeta">
                <span>Tipo: {{ contract.contractType?.name || '-' }}</span>
                <span>Horas máximas: {{ contract.contractType?.maxHours ?? '-' }}h</span>
              </div>

              <div class="tbDrawer__contractActions">
                <AppButtonGroup size="sm">
                  <AppButtonEdit @click="openContractForm(contract)" />
                  <AppButtonDelete @click="deleteContract(contract.id)" />
                </AppButtonGroup>
              </div>
            </div>
          </div>

          <AppEmptyResponse v-else-if="!showContractForm" :show-image="false" title="Sin contratos registrados" subtitle="Este docente no tiene contratos asociados aún." size="xs" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="tbDrawer__footer">
        <AppButton variant="primary" @click="handleVisibilityChange(false)">Cerrar</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import type { TeacherBankTeacher } from '../dtos/academicLoadManagement.dto';
import { GetTeacherContractDetailService } from '../services/getTeacherContractDetail.service';
import { GetTeacherContractsByTeacherService } from '../services/getTeacherContractsByTeacher.service';
import { CreateOrUpdateTeacherContractService } from '../services/createOrUpdateTeacherContract.service';
import { DeleteTeacherContractService } from '../services/deleteTeacherContract.service';
import { GetContractTypesService } from '../services/getContractTypes.service';

const getTeacherContractDetailService = new GetTeacherContractDetailService();
const getTeacherContractsByTeacherService = new GetTeacherContractsByTeacherService();
const createOrUpdateTeacherContractService = new CreateOrUpdateTeacherContractService();
const deleteTeacherContractService = new DeleteTeacherContractService();
const getContractTypesService = new GetContractTypesService();

type TeacherBankDetailStatusKey = 'disponible' | 'cercano' | 'completo' | 'sin-contrato';

interface TeacherBankDrawerDetail {
  teacherName: string;
  identification?: string | null;
  contractType?: string | null;
  loadSummary: {
    statusLabel: string;
    percentage: number;
    assignedHours: number;
    totalMaxHours: number;
    availableHours: number;
    courseCount: number;
  };
  assignedSubjects: Array<{
    code?: string | null;
    name: string;
    hours: number;
  }>;
}

const getLoadPercentage = (assignedHours = 0, totalMaxHours = 0) => {
  if (!totalMaxHours) return 0;

  return Math.min(Math.round((assignedHours / totalMaxHours) * 100), 100);
};

const buildBasicDetail = (teacherSummary?: TeacherBankTeacher | null, options?: { forceNoContract?: boolean }): TeacherBankDrawerDetail | null => {
  if (!teacherSummary) return null;

  const forceNoContract = options?.forceNoContract ?? false;
  const assignedHours = forceNoContract ? 0 : teacherSummary.horasAsignadas ?? 0;
  const totalMaxHours = forceNoContract ? 0 : teacherSummary.horasMaximas ?? 0;
  const availableHours = forceNoContract ? 0 : teacherSummary.horasDisponibles ?? 0;
  const assignedSubjects = forceNoContract ? [] : teacherSummary.asignaturas ?? [];

  return {
    teacherName: teacherSummary.nombre,
    identification: teacherSummary.identification ?? null,
    contractType: forceNoContract ? null : teacherSummary.tipoContrato || null,
    loadSummary: {
      statusLabel: forceNoContract ? 'Sin contrato' : teacherSummary.statusLabel || 'Sin contrato',
      percentage: getLoadPercentage(assignedHours, totalMaxHours),
      assignedHours,
      totalMaxHours,
      availableHours,
      courseCount: assignedSubjects.length,
    },
    assignedSubjects: assignedSubjects.map((subject) => ({
      code: subject.codigo ?? null,
      name: subject.nombre,
      hours: subject.horas,
    })),
  };
};

const resolveStatusKey = (label: string): TeacherBankDetailStatusKey => {
  const normalized = (label ?? '').toLowerCase();

  if (normalized.includes('sin contrato')) return 'sin-contrato';
  if (normalized.includes('normal') || normalized.includes('disponible')) return 'disponible';
  if (normalized.includes('cercano') || normalized.includes('límite') || normalized.includes('limite')) return 'cercano';

  return 'completo';
};

const STATUS_VARIANT: Record<TeacherBankDetailStatusKey, string> = {
  disponible: 'success',
  cercano: 'warning',
  completo: 'danger',
  'sin-contrato': 'ghost',
};

export default defineComponent({
  name: 'TeacherBankDetailDrawer',
  components: {
    AppAutocomplete,
    AppBadge,
    AppButton,
    AppButtonDelete,
    AppButtonEdit,
    AppButtonGroup,
    AppDrawer,
    AppDrawerHeader,
    AppEmptyResponse,
    AppFormField,
    AppIcon,
  },
  props: {
    isVisible: { type: Boolean, default: false },
    teacherUserId: { type: Number as any, default: null },
    teacherId: { type: Number as any, default: null },
    teacherSummary: {
      type: Object as PropType<TeacherBankTeacher | null>,
      default: null,
    },
    academicPeriodId: { type: Number as any, default: null },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const detail = ref<TeacherBankDrawerDetail | null>(null);
    const contracts = ref<any[]>([]);
    const contractTypeOptions = ref<any[]>([]);
    const isLoading = ref(false);
    const showContractForm = ref(false);
    const editingContractId = ref<number | null>(null);
    const newContractTypeId = ref<number | null>(null);
    const isSaving = ref(false);

    const resolvedTeacherId = computed(() => props.teacherId ?? props.teacherSummary?.teacherId ?? props.teacherSummary?.peopleId ?? props.teacherSummary?.userId ?? props.teacherSummary?.id ?? null);
    const hasSelectedContract = computed(() => Boolean(props.teacherSummary?.contractRecordId));
    const fallbackDetail = (forceNoContract = false) => buildBasicDetail(props.teacherSummary, { forceNoContract });
    const hasContractsInSelectedPeriod = (items: any[]) => items.some((contract) => !props.academicPeriodId || contract?.academicPeriodId === props.academicPeriodId);

    const statusKey = computed(() => resolveStatusKey(detail.value?.loadSummary?.statusLabel ?? ''));
    const statusLabel = computed(() => detail.value?.loadSummary?.statusLabel || '');
    const statusVariant = computed(() => STATUS_VARIANT[statusKey.value] ?? 'dark');

    const loadAll = async () => {
      if (!props.teacherUserId || !props.academicPeriodId) {
        detail.value = null;
        contracts.value = [];
        return;
      }

      isLoading.value = true;
      try {
        const [contractsResult, contractTypes] = await Promise.all([
          resolvedTeacherId.value
            ? getTeacherContractsByTeacherService.run(resolvedTeacherId.value, {
                academicPeriodId: props.academicPeriodId,
              })
            : Promise.resolve([]),
          getContractTypesService.run({
            noPag: true,
            isActive: true,
            type: 'academic_load_rules',
          }),
        ]);

        const shouldLoadDetail = hasSelectedContract.value || hasContractsInSelectedPeriod(contractsResult);

        detail.value = shouldLoadDetail ? await getTeacherContractDetailService.run(props.teacherUserId, props.academicPeriodId) : fallbackDetail();
        contracts.value = contractsResult;
        contractTypeOptions.value = Array.isArray(contractTypes) ? contractTypes : [];
      } catch (error) {
        console.log(error);
        detail.value = fallbackDetail();
        contracts.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const cancelContractForm = () => {
      showContractForm.value = false;
      editingContractId.value = null;
      newContractTypeId.value = null;
    };

    const openContractForm = (contract?: any) => {
      editingContractId.value = contract?.id ?? null;
      newContractTypeId.value = contract?.contractTypeId ?? null;
      showContractForm.value = true;
    };

    const reloadContracts = async () => {
      if (!resolvedTeacherId.value || !props.academicPeriodId) {
        detail.value = fallbackDetail();
        contracts.value = [];
        return;
      }

      const contractsResult = await getTeacherContractsByTeacherService.run(resolvedTeacherId.value, {
        academicPeriodId: props.academicPeriodId,
      });

      contracts.value = contractsResult;

      if (hasContractsInSelectedPeriod(contractsResult) && props.teacherUserId) {
        detail.value = await getTeacherContractDetailService.run(props.teacherUserId, props.academicPeriodId);
        return;
      }

      detail.value = fallbackDetail(true);
    };

    const saveContract = async () => {
      if (!newContractTypeId.value || !resolvedTeacherId.value || !props.academicPeriodId) return;

      isSaving.value = true;
      try {
        await createOrUpdateTeacherContractService.run(
          {
            teacherId: resolvedTeacherId.value,
            academicPeriodId: props.academicPeriodId,
            contractTypeId: newContractTypeId.value,
          },
          editingContractId.value ?? undefined
        );

        cancelContractForm();
        await reloadContracts();
      } catch (error) {
        console.log(error);
      } finally {
        isSaving.value = false;
      }
    };

    const deleteContract = async (contractId: number) => {
      try {
        await deleteTeacherContractService.run(contractId);
        await reloadContracts();
      } catch (error) {
        console.log(error);
      }
    };

    watch(
      () => [props.isVisible, props.teacherUserId, resolvedTeacherId.value, props.academicPeriodId, props.teacherSummary?.contractRecordId],
      ([visible]) => {
        if (visible) void loadAll();
        else {
          detail.value = null;
          contracts.value = [];
          cancelContractForm();
        }
      },
      { immediate: true }
    );

    const handleVisibilityChange = (visible: boolean) => {
      if (!visible) emit('saved');
      emit('update:isVisible', visible);
    };

    return {
      contractTypeOptions,
      contracts,
      detail,
      isLoading,
      isSaving,
      newContractTypeId,
      showContractForm,
      statusKey,
      statusLabel,
      statusVariant,
      cancelContractForm,
      deleteContract,
      openContractForm,
      saveContract,
      handleVisibilityChange,
    };
  },
});
</script>

<style scoped>
.tbDrawer__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.tbDrawer {
  display: grid;
  gap: 0;
}

.tbDrawer__cardHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
}

.tbDrawer__infoSection {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tbDrawer__infoRow {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.tbDrawer__infoLabel {
  font-size: 0.8rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tbDrawer__infoValue {
  font-size: 0.95rem;
  color: #0f172a;
}

.tbDrawer__sectionTitle {
  font-weight: 600;
  color: #0f172a;
}

.tbDrawer__cardTitle {
  font-weight: 600;
  color: #0f172a;
}

.tbDrawer__assignBtn {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.tbDrawer__assignBtn:hover {
  opacity: 0.85;
}

/* Formulario nuevo contrato */
.tbDrawer__contractForm {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  background: #f8fafc;
  margin-bottom: 1rem;
  display: grid;
  gap: 0.75rem;
}

.tbDrawer__formTitle {
  font-size: 0.95rem;
  color: #0f172a;
}

.tbDrawer__formActions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Lista contratos */
.tbDrawer__contractList {
  display: grid;
  gap: 0.75rem;
}

.tbDrawer__contractItem {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  background: #f8fafc;
}

.tbDrawer__contractItem--active {
  border-color: #bbf7d0;
  background: linear-gradient(135deg, #ecfdf3, #ffffff);
}

.tbDrawer__contractHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tbDrawer__contractPeriod {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tbDrawer__contractActions {
  display: flex;
  margin-top: 0.75rem;
}

.tbDrawer__contractMeta {
  display: flex;
  gap: 1.25rem;
  margin-top: 0.5rem;
  font-size: 0.88rem;
  color: #64748b;
  flex-wrap: wrap;
}

/* Barra de carga */
.tbDrawer__loadBar {
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tbDrawer__loadBar--cercano {
  background: linear-gradient(135deg, #fffbeb, #ffffff);
  border-color: #fde68a;
}

.tbDrawer__loadBar--completo {
  background: linear-gradient(135deg, #fef2f2, #ffffff);
  border-color: #fecaca;
}

.tbDrawer__loadBar--sin-contrato {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-color: #cbd5e1;
}

.tbDrawer__loadBarHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
  font-size: 0.92rem;
  color: #475569;
}

.tbDrawer__loadBarHead strong {
  font-size: 1.5rem;
  color: #d97706;
}

.tbDrawer__progress {
  width: 100%;
  height: 0.65rem;
  background: rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  overflow: hidden;
}

.tbDrawer__progressFill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.tbDrawer__metric {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.85rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.tbDrawer__metric small {
  font-size: 0.82rem;
  color: #64748b;
}

.tbDrawer__metric strong {
  font-size: 1.5rem;
  color: #0f172a;
}

.tbDrawer__metric span {
  font-size: 0.82rem;
  color: #94a3b8;
}

.tbDrawer__available--disponible {
  color: #16a34a;
}
.tbDrawer__available--cercano {
  color: #d97706;
}
.tbDrawer__available--completo {
  color: #dc2626;
}

.tbDrawer__available--sin-contrato {
  color: #475569;
}

.tbDrawer__courseCount {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  color: var(--color-primary);
  font-size: 0.95rem;
}

.tbDrawer__courseCount strong {
  font-size: 1.15rem;
}

/* Asignaturas */
.tbDrawer__subjectList {
  display: grid;
  gap: 0.65rem;
}

.tbDrawer__subjectItem {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  background: #f8fafc;
}

.tbDrawer__subjectHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.tbDrawer__subjectHours {
  color: var(--color-primary);
  white-space: nowrap;
}

.tbDrawer__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
