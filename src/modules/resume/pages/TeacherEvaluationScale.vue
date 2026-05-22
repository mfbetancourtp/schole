<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton
        style="color: white"
        type="button"
        class="btnPrimary"
        :to="{
          name: 'resume.teacherEvaluationScaleCreate',
        }"
      >
        <AppIcon icon="plus" />
        Nueva Escala
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="teacherEvaluationScalePage">
        <div class="sectionHead">
          <div class="contentIconTitle">
            <div class="sectionHead__icon">
              <AppIcon icon="balance-scale" />
            </div>
            <div>
              <h2 class="sectionHead__title">Escala de Evaluación Docente</h2>
              <p class="sectionHead__subtitle">Configure los rangos de clasificación según el puntaje total obtenido por los docentes.</p>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <div v-for="card in summaryCards" :key="card.label" class="col-12 col-md-4">
            <AppStatCard :label="card.label" :value="card.value" :caption="card.caption" :icon="card.icon" :variant="card.variant" />
          </div>
        </div>

        <AppDatatable name="teacher-evaluation-scale" :service="getTeacherEvaluationScalesService" :params="tableParams" :enable-search-filter="true" :show-filter-steps="true" :default-per-page="10">
          <AppDatatableColumn field="name" label="Nombre" sortable v-slot="props">
            <div class="nameCell">
              <div class="nameCell__title">{{ props.row.name }}</div>
              <div class="nameCell__meta">
                {{ props.row.description || 'Sin descripción registrada' }}
              </div>
              <div class="nameCell__meta">Creada el {{ formatScaleDate(props.row.createdAt) }}</div>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn field="minimumOverallScore" label="Puntaje Mínimo" sortable v-slot="props">
            <span>{{ props.row.minimumOverallScore }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="maximumOverallScore" label="Puntaje Máximo" sortable v-slot="props">
            <span>{{ props.row.maximumOverallScore }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="tieStanding" label="Empate" sortable v-slot="props">
            <AppBadge :label="props.row.tieStanding ? 'Sí' : 'No'" :variant="props.row.tieStanding ? 'success' : 'secondary'" />
          </AppDatatableColumn>

          <AppDatatableColumn field="isActive" label="Estado" sortable v-slot="props">
            <AppBadge :label="props.row.isActive ? 'Activa' : 'Inactiva'" :variant="props.row.isActive ? 'success' : 'secondary'" />
          </AppDatatableColumn>

          <AppDatatableColumn label="Acciones" position="centered" v-slot="props">
            <div class="actionsCell">
              <AppButton
                v-tooltip="'Editar escala'"
                outlined
                icon="pencil-alt"
                :disabled="isMutatingScale(props.row.id)"
                :to="{
                  name: 'resume.teacherEvaluationScaleEdit',
                  params: {
                    teacherEvaluationScaleId: props.row.id,
                  },
                }"
              />

              <AppButton
                v-if="!props.row.isActive"
                v-tooltip="'Activar escala'"
                outlined
                icon="check-circle"
                class="btnAction--success"
                :disabled="isMutatingScale(props.row.id)"
                @click="handleActivar(props.row)"
              />

              <AppButton
                v-if="props.row.isActive"
                v-tooltip="'Desactivar escala'"
                outlined
                icon="ban"
                class="btnAction--warning"
                :disabled="isMutatingScale(props.row.id)"
                @click="handleDesactivar(props.row)"
              />

              <AppButton v-tooltip="'Duplicar escala'" outlined icon="copy" disabled />

              <AppButton
                v-if="!props.row.isActive"
                v-tooltip="'Eliminar escala'"
                outlined
                icon="trash"
                class="btnAction--danger"
                :disabled="isMutatingScale(props.row.id)"
                @click="openModalDelete(props.row)"
              />
            </div>
          </AppDatatableColumn>
        </AppDatatable>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="escala de evaluación docente" @confirmDelete="deleteEscala" />
        </AppModal>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { useCheckDataTableStore } from '../../../stores/checkDataTable.store';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import { TeacherEvaluationScaleDto as TeacherEvaluationScaleApiDto } from '../dtos/teacherEvaluationScale.dto';
import { CreateOrUpdateTeacherEvaluationScalePayload, CreateOrUpdateTeacherEvaluationScaleService } from '../services/createOrUpdateTeacherEvaluationScale.service';
import { DeleteTeacherEvaluationScaleService } from '../services/deleteTeacherEvaluationScale.service';
import { GetTeacherEvaluationScalesService } from '../services/getTeacherEvaluationScales.service';

const getTeacherEvaluationScalesService = new GetTeacherEvaluationScalesService();
const createOrUpdateTeacherEvaluationScaleService = new CreateOrUpdateTeacherEvaluationScaleService();
const deleteTeacherEvaluationScaleService = new DeleteTeacherEvaluationScaleService();
const updateDatatableService = new UpdateDatatableService();

type StatCardVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'white';

interface SummaryCard {
  label: string;
  value: string | number;
  caption: string;
  icon: string;
  variant: StatCardVariant;
}

export default defineComponent({
  name: 'TeacherEvaluationScalePage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppBadge,
    AppStatCard,
    AppModal,
    AppConfirmDeleteModal,
  },
  setup() {
    const title = 'Escala de Evaluación Docente';
    useMeta({ title });

    const checkStore = useCheckDataTableStore();
    const loading = ref(true);
    const modalDelete = ref(false);
    const currentTeacherEvaluationScale = ref<TeacherEvaluationScaleApiDto | null>(null);
    const pendingScaleId = ref<number | null>(null);
    const isDeletingScale = ref(false);
    const tableParams = ref({});

    const teacherEvaluationScales = computed<TeacherEvaluationScaleApiDto[]>(() => {
      const data = checkStore.isCheckData?.dataTable?.data;
      return Array.isArray(data) ? data : [];
    });

    const totalTeacherEvaluationScales = computed(() => {
      const total = Number(checkStore.isCheckData?.dataTable?.pagination?.total);
      return Number.isFinite(total) && total > 0 ? total : teacherEvaluationScales.value.length;
    });

    const activeTeacherEvaluationScalesCount = computed(() => teacherEvaluationScales.value.filter((item) => item.isActive).length);
    const inactiveTeacherEvaluationScalesCount = computed(() => teacherEvaluationScales.value.filter((item) => !item.isActive).length);
    const summaryCards = computed<SummaryCard[]>(() => [
      {
        label: 'Total escalas',
        value: totalTeacherEvaluationScales.value,
        caption: 'Escalas registradas',
        icon: 'layer-group',
        variant: 'blue',
      },
      {
        label: 'Escalas activas',
        value: activeTeacherEvaluationScalesCount.value,
        caption: 'Configuraciones vigentes',
        icon: 'check-circle',
        variant: 'green',
      },
      {
        label: 'Escalas inactivas',
        value: inactiveTeacherEvaluationScalesCount.value,
        caption: 'Disponibles',
        icon: 'ban',
        variant: 'gray',
      },
    ]);

    const formatScaleDate = (dateValue?: string | null) => {
      if (!dateValue) return '-';
      return dayjs(dateValue).isValid() ? dayjs(dateValue).format('DD/MMM/YYYY') : '-';
    };

    const openModalDelete = (teacherEvaluationScale: TeacherEvaluationScaleApiDto) => {
      currentTeacherEvaluationScale.value = teacherEvaluationScale;
      modalDelete.value = true;
    };

    const closeModalDelete = () => {
      modalDelete.value = false;
      currentTeacherEvaluationScale.value = null;
    };

    const deleteEscala = async () => {
      try {
        if (!currentTeacherEvaluationScale.value) return;

        isDeletingScale.value = true;
        await deleteTeacherEvaluationScaleService.run(Number(currentTeacherEvaluationScale.value.id));
        closeModalDelete();
        updateDatatableService.run();
      } catch (e) {
        console.log('this error', e);
      } finally {
        isDeletingScale.value = false;
      }
    };

    const updateScaleStatus = async (teacherEvaluationScale: TeacherEvaluationScaleApiDto, isActive: boolean) => {
      try {
        pendingScaleId.value = teacherEvaluationScale.id;

        const payload: CreateOrUpdateTeacherEvaluationScalePayload = {
          isActive,
          name: teacherEvaluationScale.name,
          description: teacherEvaluationScale.description || '',
          minimumOverallScore: Number(teacherEvaluationScale.minimumOverallScore ?? 0),
          maximumOverallScore: Number(teacherEvaluationScale.maximumOverallScore ?? 0),
          tieStanding: Boolean(teacherEvaluationScale.tieStanding),
        };

        await createOrUpdateTeacherEvaluationScaleService.run(payload, Number(teacherEvaluationScale.id));
        updateDatatableService.run();
      } finally {
        pendingScaleId.value = null;
      }
    };

    const handleActivar = async (teacherEvaluationScale: TeacherEvaluationScaleApiDto) => {
      try {
        await updateScaleStatus(teacherEvaluationScale, true);
      } catch (error) {
        console.log('error', error);
      }
    };

    const handleDesactivar = async (teacherEvaluationScale: TeacherEvaluationScaleApiDto) => {
      try {
        await updateScaleStatus(teacherEvaluationScale, false);
      } catch (error) {
        console.log('error', error);
      }
    };

    const isMutatingScale = (id: number) => {
      if (pendingScaleId.value === id) return true;
      if (isDeletingScale.value && currentTeacherEvaluationScale.value?.id === id) {
        return true;
      }
      return false;
    };

    onMounted(async () => {
      loading.value = true;

      try {
        checkStore.isCheckData.dataTable = { data: [] };

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Configuración General', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log('error', e);
      } finally {
        loading.value = false;
      }
    });

    return {
      title,
      loading,
      modalDelete,
      tableParams,
      getTeacherEvaluationScalesService,
      totalTeacherEvaluationScales,
      teacherEvaluationScales,
      currentTeacherEvaluationScale,
      pendingScaleId,
      isDeletingScale,
      activeTeacherEvaluationScalesCount,
      inactiveTeacherEvaluationScalesCount,
      summaryCards,
      formatScaleDate,
      openModalDelete,
      closeModalDelete,
      deleteEscala,
      handleActivar,
      handleDesactivar,
      isMutatingScale,
    };
  },
});
</script>

<style scoped>
.teacherEvaluationScalePage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sectionHead__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.14), rgba(var(--color-primary-rgb), 0.05));
  color: var(--color-primary);
}

.sectionHead__title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-dark, #1f2937);
}

.sectionHead__subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.95rem;
}

.nameCell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.nameCell__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.nameCell__meta {
  font-size: 0.8rem;
  color: #6b7280;
}

.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.btnAction--success {
  border-color: #bbf7d0;
  color: #16a34a;
}

.btnAction--warning {
  border-color: #fde68a;
  color: #d97706;
}

.btnAction--danger {
  border-color: #fecaca;
  color: #dc2626;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
</style>
