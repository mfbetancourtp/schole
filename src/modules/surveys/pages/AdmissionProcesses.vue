<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton style="color: white" variant="primary" @click="openCreateDrawer">
        <AppIcon icon="plus" class="me-2" />
        Crear proceso
      </AppButton>
    </template>

    <template #content>
      <AppPulseLoading v-if="loading" />

      <div class="admissionProcesses">
        <div class="row g-3 mb-4">
          <div v-for="card in summaryCards" :key="card.label" class="col-12 col-md-6 col-xl-3">
            <AppStatCard :label="card.label" :value="card.value" :caption="card.caption" :icon="card.icon" :variant="card.variant" />
          </div>
        </div>

        <AppDatatable name="surveys-admission-processes" :service="service" :params="tableParams" :paginated="true" :default-per-page="10">
          <template #additionalContent>
            <div class="admissionProcesses__tableHead">
              <div class="admissionProcesses__title">
                <div class="admissionProcesses__titleLabel">
                  <AppIcon icon="project-diagram" class="me-2" />
                  Procesos de admisión
                </div>

                <AppBadge :label="`${convocationsSummary?.totalProcesses ?? 0} registros`" variant="ghost" />
              </div>

              <p class="admissionProcesses__tableHint">Consulta, filtra y administra los procesos de admisión configurados para cada periodo académico.</p>
            </div>
          </template>

          <template #filters>
            <AppFilter v-model="selectedPeriodId" filter-name="admissionProcesses.period">
              <label>Periodo académico</label>
              <AppAutocomplete
                input-id="admission-process-period-filter"
                :options="periodFilterOptions"
                label="name"
                :reduce="(o: any) => Number(o.id)"
                :clearable="true"
                placeholder="Todos los periodos"
                v-model="selectedPeriodId"
              />
            </AppFilter>

            <AppFilter v-model="selectedStatus" filter-name="admissionProcesses.status">
              <label>Estado</label>
              <AppAutocomplete input-id="admission-process-status-filter" :options="statusFilterOptions" label="name" :reduce="(o: any) => o.id" :clearable="false" v-model="selectedStatus" />
            </AppFilter>
          </template>

          <AppDatatableColumn label="Nombre del proceso" field="title" sortable width="320" v-slot="{ row }">
            <div class="admissionProcesses__processCell">
              <div class="fw-semibold text-dark">{{ row.title }}</div>
              <small class="text-muted">{{ row.startDate }} - {{ row.endDate }}</small>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Programas" field="programs" width="260" v-slot="{ row }">
            <div class="admissionProcesses__programsCell">
              <span v-for="program in row.programs" :key="program.id" class="admissionProcesses__programTag">
                {{ program.name }}
              </span>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Número de pasos" field="stepsCount" sortable width="150" position="centered" v-slot="{ row }">
            <span class="admissionProcesses__stepCount">
              {{ row.stepsCount }}
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Postulantes" field="applicantsCount" sortable width="140" position="centered" v-slot="{ row }">
            <strong class="text-dark">{{ row.applicantsCount }}</strong>
          </AppDatatableColumn>

          <AppDatatableColumn label="Estado" field="statusLabel" sortable width="150" v-slot="{ row }">
            <AppBadge :label="row.statusLabel" :variant="row.status === 'active' ? 'success' : 'secondary'" />
          </AppDatatableColumn>

          <AppDatatableColumn label="Acciones" width="160" position="centered" v-slot="{ row }">
            <div class="admissionProcesses__actionsCell">
              <AppButtonGroup>
                <AppButton icon="eye" v-tooltip="t('core.seeDetail')" @click="goToDetail(row.id)" />
                <AppButton icon="file-pdf" v-tooltip="'Ver PDF'" @click="generatePdf(row)" />
                <AppButtonEdit @click="openEditDrawer(row)" />
                <AppButtonDelete @click="openDeleteModal(row)" />
              </AppButtonGroup>
            </div>
          </AppDatatableColumn>
        </AppDatatable>
      </div>

      <AdmissionProcessDrawer
        :isVisible="isDrawerVisible"
        :process="selectedProcess"
        :academic-periods="academicPeriods"
        :status-options="convocationsSummary?.statusOptions || []"
        :applies-to-options="referenceData?.appliesToOptions || []"
        :elements-by-type="referenceData?.elementsByType || emptyElementsByType"
        :workflow-reference-steps="workflowReferenceSteps"
        @update:isVisible="isDrawerVisible = $event"
        @saved="handleSavedProcess"
      />

      <AppModal v-model="deleteModalVisible">
        <AppConfirmDeleteModal v-if="deleteModalVisible" entity="Proceso de admisión" @confirmDelete="deleteProcess" @close="deleteModalVisible = false" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import AdmissionProcessDrawer from '../components/AdmissionProcessDrawer.vue';
import type { AdmissionProcessReferenceData, AdmissionSelectOption } from '../dtos/admissionProcess.dto';
import type { ConvocationStepForConfigureStepsDto } from '../dtos/convocationStep.dto';
import type { ConvocationWithStepsDto } from '../dtos/convocation.dto';
import type { ConvocationListItemDto } from '../dtos/convocationsList.dto';
import type { AcademicLoadPeriod } from '../../academicPlanning/dtos/academicLoadManagement.dto';
import { GetAdmissionProcessReferenceDataService } from '../services/getAdmissionProcessReferenceData.service';

import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import { GetConvocationsListService } from '../services/getConvocationsList.service';
import { GetConvocationsSummaryService, type ConvocationSummaryDto } from '../services/getConvocationsSummary.service';
import { DeleteConvocationService } from '../services/deleteConvocation.service';
import { useHeaderStore } from '../../../stores/header.store';
import { useI18n } from 'vue-i18n';
import { GetPlanningAcademicPeriodsService } from '../../academicPlanning/services/getPlanningAcademicPeriods.service';

const getAdmissionProcessReferenceDataService = new GetAdmissionProcessReferenceDataService();
const getAcademicPeriodsService = new GetPlanningAcademicPeriodsService();
const service = new GetConvocationsListService();
const getConvocationsSummaryService = new GetConvocationsSummaryService();
const deleteConvocationService = new DeleteConvocationService();

export default defineComponent({
  name: 'AdmissionProcessesPage',
  components: {
    AppBadge,
    AppBaseList,
    AppButton,
    AppButtonDelete,
    AppButtonEdit,
    AppButtonGroup,
    AppStatCard,
    AppDatatable,
    AppDatatableColumn,
    AppAutocomplete,
    AppFilter,
    AppIcon,
    AppPulseLoading,
    AppModal,
    AppConfirmDeleteModal,
    AdmissionProcessDrawer,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const title = 'Procesos de admisión';
    const routes = [{ name: title }];
    const { t } = useI18n();

    useMeta({ title });

    const loading = ref(true);
    const referenceData: Ref<AdmissionProcessReferenceData | null> = ref(null);
    const convocationsSummary: Ref<ConvocationSummaryDto | null> = ref(null);
    const academicPeriods: Ref<AcademicLoadPeriod[]> = ref([]);
    const selectedPeriodId = ref<number | null>(null);
    const selectedProcess: Ref<ConvocationWithStepsDto | null> = ref(null);
    const convocationToDelete: Ref<{ id: number } | null> = ref(null);
    const workflowReferenceSteps: Ref<ConvocationStepForConfigureStepsDto[]> = ref([]);
    const isDrawerVisible = ref(false);
    const deleteModalVisible = ref(false);
    const selectedStatus = ref<string>('all');

    const headerStorage = useHeaderStore();

    const emptyElementsByType = {
      formulario: [],
      cobro: [],
      documento: [],
      adjunto: [],
    };

    const getInitialData = async () => {
      loading.value = true;
      try {
        const [referenceResponse, periodsResponse, summaryResponse] = await Promise.all([
          getAdmissionProcessReferenceDataService.run(),
          getAcademicPeriodsService.run({ active: 1 }),
          getConvocationsSummaryService.run().catch(() => null),
        ]);

        convocationsSummary.value = summaryResponse;
        academicPeriods.value = periodsResponse;
        referenceData.value = referenceResponse;
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      await getInitialData();
    });

    const periodFilterOptions = computed<AdmissionSelectOption<string>[]>(() => academicPeriods.value.map((p) => ({ id: String(p.id), name: p.name })));

    const statusFilterOptions = computed<AdmissionSelectOption<string>[]>(() => {
      const apiOptions = convocationsSummary.value?.statusOptions ?? [];
      const mapped = apiOptions.map((o) => ({ id: o.key, name: o.label }));
      return [{ id: 'all', name: 'Todos los estados' }, ...mapped];
    });

    const tableParams = computed(() => ({
      academicPeriodId: selectedPeriodId.value || undefined,
      order: 'DESC',

      status: selectedStatus.value !== 'all' ? selectedStatus.value : undefined,
    }));

    const summaryCards = computed(() => [
      {
        label: 'Total procesos',
        value: convocationsSummary.value?.totalProcesses ?? 0,
        icon: 'project-diagram',
        variant: 'blue',
      },
      {
        label: 'Activos',
        value: convocationsSummary.value?.activeProcesses ?? 0,
        icon: 'check-circle',
        variant: 'green',
      },
      {
        label: 'Total postulantes',
        value: convocationsSummary.value?.totalApplicants ?? 0,
        icon: 'users',
        variant: 'yellow',
      },
      {
        label: 'Promedio de pasos',
        value: convocationsSummary.value?.averageSteps ?? 0,
        icon: 'stream',
        variant: 'gray',
      },
    ]);

    const institutionsService = new InstitutionsService();

    const goToDetail = (convocationId: number) => {
      router.push({
        name: 'surveys.previewInscritos',
        params: { convocationId },
      });
    };

    const loadImageAsBase64 = async (url: string): Promise<string | null> => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };

    const formatDate = (date?: string) => {
      if (!date) return '—';
      return new Date(date + 'T00:00:00').toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    };

    const generatePdf = async (row: ConvocationListItemDto) => {
      try {
        const institutionId = institutionsService.getSelectedInstitution()?.id;
        const inscripcionUrl = `${window.location.origin}/surveys/user-convocations/${institutionId}/convocation/${row.id}/inscripcion`;

        const [qrDataUrl, thumbnailBase64] = await Promise.all([
          (QRCode as any).toDataURL(inscripcionUrl, {
            width: 400,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: { dark: '#1e3a8a', light: '#ffffff' },
          }),
          row.thumbnail ? loadImageAsBase64(row.thumbnail) : Promise.resolve(null),
        ]);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const W = pdf.internal.pageSize.getWidth(); // 210
        const H = pdf.internal.pageSize.getHeight(); // 297

        // ── HEADER ──────────────────────────────────────────────────────────
        // Fondo azul oscuro
        pdf.setFillColor(30, 58, 138);
        pdf.rect(0, 0, W, 48, 'F');
        // Franja decorativa inferior del header
        pdf.setFillColor(29, 78, 216);
        pdf.rect(0, 42, W, 6, 'F');

        // Etiqueta superior
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(147, 197, 253);
        pdf.text('AKADEMIA UNIVERSITY', W / 2, 12, { align: 'center' });

        // Título principal
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.setTextColor(255, 255, 255);
        pdf.text('CONVOCATORIA DE INSCRIPCIÓN', W / 2, 26, { align: 'center' });

        // Subtítulo
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(191, 219, 254);
        pdf.text('Sistema de Matriculación Académica', W / 2, 36, {
          align: 'center',
        });

        // ── THUMBNAIL ────────────────────────────────────────────────────────
        let contentStartY = 58;
        if (thumbnailBase64) {
          const imgW = W - 40;
          const imgH = 42;
          pdf.addImage(thumbnailBase64, 'PNG', 20, 52, imgW, imgH, undefined, 'FAST');
          // Overlay semitransparente sobre la imagen
          pdf.setFillColor(30, 58, 138);
          pdf.setGState(pdf.GState({ opacity: 0.15 }));
          pdf.rect(20, 52, imgW, imgH, 'F');
          pdf.setGState(pdf.GState({ opacity: 1 }));
          contentStartY = 100;
        }

        // ── TÍTULO CONVOCATORIA ───────────────────────────────────────────────
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.setTextColor(15, 23, 42);
        const titleLines = pdf.splitTextToSize(row.title, W - 40);
        pdf.text(titleLines, W / 2, contentStartY, { align: 'center' });
        contentStartY += titleLines.length * 8 + 4;

        // Badge periodo académico
        if (row.academicPeriod?.name) {
          const periodText = row.academicPeriod.name;
          const periodW = pdf.getTextWidth(periodText) + 10;
          const periodX = (W - periodW) / 2;
          pdf.setFillColor(239, 246, 255);
          pdf.setDrawColor(147, 197, 253);
          pdf.roundedRect(periodX, contentStartY, periodW, 8, 2, 2, 'FD');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(29, 78, 216);
          pdf.text(periodText, W / 2, contentStartY + 5.5, { align: 'center' });
          contentStartY += 13;
        }

        // Programas
        if (row.programs?.length) {
          const programsText = row.programs.map((p) => p.name).join('  ·  ');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(100, 116, 139);
          pdf.text(programsText, W / 2, contentStartY, { align: 'center' });
          contentStartY += 8;
        }

        // ── LÍNEA DIVISORA ────────────────────────────────────────────────────
        contentStartY += 3;
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.4);
        pdf.line(20, contentStartY, W - 20, contentStartY);
        contentStartY += 8;

        // ── TARJETAS DE ESTADÍSTICAS (fila de 4) ─────────────────────────────
        const cards = [
          { label: 'Inicio', value: formatDate(row.startDate) },
          { label: 'Cierre', value: formatDate(row.endDate) },
          { label: 'Pasos', value: String(row.stepsCount ?? 0) },
          { label: 'Postulantes', value: String(row.applicantsCount ?? 0) },
        ];
        const cardW = (W - 44) / 4;
        const cardH = 22;
        const cardGap = 4;
        cards.forEach((card, i) => {
          const cx = 20 + i * (cardW + cardGap);
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(226, 232, 240);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(cx, contentStartY, cardW, cardH, 2, 2, 'FD');

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139);
          pdf.text(card.label.toUpperCase(), cx + cardW / 2, contentStartY + 6, { align: 'center' });

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(card.label === 'Inicio' || card.label === 'Cierre' ? 7 : 13);
          pdf.setTextColor(15, 23, 42);
          pdf.text(card.value, cx + cardW / 2, contentStartY + 16, {
            align: 'center',
          });
        });
        contentStartY += cardH + 8;

        // Estado badge
        const isActive = row.status === 'active';
        const badgeColor = isActive ? [220, 252, 231] : [243, 244, 246];
        const badgeTextColor = isActive ? [22, 101, 52] : [75, 85, 99];
        const badgeBorderColor = isActive ? [134, 239, 172] : [209, 213, 219];
        const statusText = row.statusLabel ?? (isActive ? 'Activo' : 'Inactivo');
        const bW = pdf.getTextWidth(statusText) + 12;
        pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        pdf.setDrawColor(badgeBorderColor[0], badgeBorderColor[1], badgeBorderColor[2]);
        pdf.setLineWidth(0.3);
        pdf.roundedRect((W - bW) / 2, contentStartY, bW, 7, 2, 2, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(badgeTextColor[0], badgeTextColor[1], badgeTextColor[2]);
        pdf.text(statusText, W / 2, contentStartY + 4.8, { align: 'center' });
        contentStartY += 14;

        // ── SECCIÓN QR ────────────────────────────────────────────────────────
        const qrBoxY = contentStartY;
        const qrBoxH = H - qrBoxY - 26;
        pdf.setFillColor(239, 246, 255);
        pdf.setDrawColor(191, 219, 254);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(15, qrBoxY, W - 30, qrBoxH, 4, 4, 'FD');

        // Franja superior de la caja QR
        pdf.setFillColor(29, 78, 216);
        pdf.roundedRect(15, qrBoxY, W - 30, 12, 4, 4, 'F');
        pdf.rect(15, qrBoxY + 6, W - 30, 6, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        pdf.text('ESCANEA PARA INSCRIBIRTE', W / 2, qrBoxY + 8.5, {
          align: 'center',
        });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text('Apunta la cámara de tu dispositivo al código QR', W / 2, qrBoxY + 20, { align: 'center' });
        pdf.text('para acceder directamente al formulario de inscripción.', W / 2, qrBoxY + 26, { align: 'center' });

        // QR imagen centrada
        const qrSize = Math.min(qrBoxH - 52, 70);
        const qrX = (W - qrSize) / 2;
        const qrY = qrBoxY + 31;
        // Marco blanco alrededor del QR
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(191, 219, 254);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 3, 3, 'FD');
        pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // URL texto
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(29, 78, 216);
        const urlLines = pdf.splitTextToSize(inscripcionUrl, W - 50);
        pdf.text(urlLines, W / 2, qrY + qrSize + 10, { align: 'center' });

        // ── FOOTER ────────────────────────────────────────────────────────────
        pdf.setFillColor(30, 58, 138);
        pdf.rect(0, H - 18, W, 18, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(191, 219, 254);
        pdf.text('Akademia University', 20, H - 10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(147, 197, 253);
        pdf.text(
          `Generado el ${new Date().toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}`,
          W - 20,
          H - 10,
          { align: 'right' }
        );

        pdf.save(`convocatoria-${row.id}-${row.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      } catch (e) {
        console.error('[AdmissionProcesses] generatePdf', e);
      }
    };

    const openCreateDrawer = () => {
      selectedProcess.value = null;
      isDrawerVisible.value = true;
    };

    const openEditDrawer = (process: any) => {
      selectedProcess.value = process;
      isDrawerVisible.value = true;
    };

    const handleSavedProcess = () => {
      isDrawerVisible.value = false;
      selectedProcess.value = null;
      document.dispatchEvent(new CustomEvent('updateDatatable'));
    };

    const openDeleteModal = (process: ConvocationListItemDto) => {
      convocationToDelete.value = process;
      deleteModalVisible.value = true;
    };

    const deleteProcess = async () => {
      if (!convocationToDelete.value) return;
      await deleteConvocationService.run(convocationToDelete.value.id);
      deleteModalVisible.value = false;
      convocationToDelete.value = null;
      document.dispatchEvent(new CustomEvent('updateDatatable'));
    };

    return {
      title,
      t,
      routes,
      loading,
      referenceData,
      workflowReferenceSteps,
      summaryCards,
      tableParams,
      selectedProcess,
      isDrawerVisible,
      deleteModalVisible,
      selectedPeriodId,
      selectedStatus,
      periodFilterOptions,
      statusFilterOptions,
      convocationsSummary,
      emptyElementsByType,
      academicPeriods,
      goToDetail,
      generatePdf,
      openCreateDrawer,
      openEditDrawer,
      handleSavedProcess,
      openDeleteModal,
      deleteProcess,
      service,
    };
  },
});
</script>

<style scoped>
.admissionProcesses {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admissionProcesses__tableHead {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.25rem 1.5rem 0;
}

.admissionProcesses__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.admissionProcesses__titleLabel {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  color: #0f172a;
}

.admissionProcesses__tableHint {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
}

.admissionProcesses__processCell {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.admissionProcesses__periodTag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.82rem;
  font-weight: 600;
}

.admissionProcesses__programsCell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.admissionProcesses__programTag {
  display: inline-flex;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: #f5f3ff;
  color: #7e22ce;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.admissionProcesses__programsCount {
  display: inline-flex;
  width: fit-content;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: #f5f3ff;
  color: #7e22ce;
  font-size: 0.78rem;
  font-weight: 700;
}

.admissionProcesses__stepCount {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 700;
}

@media (max-width: 768px) {
  .admissionProcesses__title {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
