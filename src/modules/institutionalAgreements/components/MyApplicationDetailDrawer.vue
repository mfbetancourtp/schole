<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="xl">
    <!-- HEAD -->
    <template #head>
      <div class="drawerHead">
        <div class="drawerHead__icon">
          <AppIcon icon="paper-plane" />
        </div>
        <div class="drawerHead__info">
          <span class="drawerHead__title">{{ programName }}</span>
          <span class="drawerHead__subtitle">{{ institutionPartner !== '—' ? institutionPartner : 'Mi postulación' }}</span>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="drawerBody">
        <!-- Alert: documentos pendientes -->
        <div class="pendingAlert" v-if="hasMissingDocs">
          <div class="pendingAlert__iconWrap">
            <AppIcon icon="exclamation-triangle" />
          </div>
          <div class="pendingAlert__text">
            <span class="pendingAlert__title">Documentos pendientes</span>
            <span class="pendingAlert__msg">Tienes documentos pendientes de carga. Debes subirlos para avanzar en el proceso de postulación.</span>
          </div>
        </div>

        <!-- 1. Información del Convenio -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--blue">
              <AppIcon icon="building" />
            </div>
            <span class="detailSection__title">Información del Convenio</span>
          </div>
          <div class="detailSection__card">
            <div class="infoGrid">
              <div class="infoField">
                <span class="infoField__label">Institución aliada</span>
                <span class="infoField__value infoField__value--bold">{{ institutionPartner }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">País</span>
                <span class="infoField__value">
                  <AppIcon icon="globe" class="infoField__icon" />
                  {{ countryName }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Tipo de convenio</span>
                <span class="convenioBadge" :class="typeBadgeClass">{{ typeName || '—' }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Código</span>
                <span class="infoField__value infoField__value--mono">{{ agreeCode }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Cupos máximos</span>
                <span class="infoField__value infoField__value--primary">{{ maximumCapacity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sectionDivider"></div>

        <!-- 2. Información de la Postulación -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--blue">
              <AppIcon icon="file-alt" />
            </div>
            <span class="detailSection__title">Información de la Postulación</span>
          </div>
          <div class="detailSection__card">
            <!-- Campos disponibles desde API -->
            <div class="infoGrid">
              <div class="infoField" v-if="createdAt">
                <span class="infoField__label">Fecha de postulación</span>
                <span class="infoField__value">
                  <AppIcon icon="calendar-alt" class="infoField__icon" />
                  {{ formatDateTime(createdAt) }}
                </span>
              </div>
              <div class="infoField" v-if="areaName !== '—'">
                <span class="infoField__label">Área de interés</span>
                <span class="infoField__value">{{ areaName }}</span>
              </div>
              <div class="infoField" v-if="estimatedStartDate">
                <span class="infoField__label">Fecha estimada de inicio</span>
                <span class="infoField__value">
                  <AppIcon icon="calendar-alt" class="infoField__icon" />
                  {{ formatDate(estimatedStartDate) }}
                </span>
              </div>
              <div class="infoField" v-if="estimatedDuration">
                <span class="infoField__label">Duración estimada</span>
                <span class="infoField__value">{{ estimatedDuration }}</span>
              </div>
              <div class="infoField" v-if="languageLevel">
                <span class="infoField__label">Nivel de idioma</span>
                <span class="infoField__value">{{ languageLevel }}</span>
              </div>
            </div>
            <template v-if="previousExperience">
              <div class="infoSeparator"></div>
              <div class="infoField">
                <span class="infoField__label">Experiencia previa</span>
                <div class="motivationBox">{{ previousExperience }}</div>
              </div>
            </template>
            <template v-if="motivation">
              <div class="infoSeparator"></div>
              <div class="infoField">
                <span class="infoField__label">Motivación enviada</span>
                <div class="motivationBox">{{ motivation }}</div>
              </div>
            </template>
            <!-- Fallback si no hay ningún campo -->
            <div v-if="!createdAt && areaName === '—' && !estimatedStartDate && !estimatedDuration && !languageLevel && !motivation && !previousExperience" class="small text-muted py-2">
              Sin información adicional registrada.
            </div>
          </div>
        </div>

        <div class="sectionDivider"></div>

        <!-- 3. Documentos Enviados -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--indigo">
              <AppIcon icon="folder-open" />
            </div>
            <span class="detailSection__title">Documentos Enviados</span>
          </div>
          <div class="docsList">
            <div v-if="loadingDocs" class="small text-muted py-3">Cargando documentos...</div>
            <template v-else-if="documents.length > 0">
              <div v-for="doc in documents" :key="doc.id" class="docItem" :class="`docItem--${getDocumentStatus(doc).toLowerCase()}`">
                <div class="docItem__left">
                  <div
                    class="docItem__icon"
                    :class="getDocumentStatus(doc) === 'Aprobado' ? 'docItem__icon--green' : getDocumentStatus(doc) === 'Cargado' ? 'docItem__icon--blue' : 'docItem__icon--orange'"
                  >
                    <AppIcon :icon="getDocumentStatus(doc) === 'Aprobado' ? 'check' : getDocumentStatus(doc) === 'Cargado' ? 'file-alt' : 'clock'" />
                  </div>
                  <div class="docItem__info">
                    <span class="docItem__name">
                      {{ doc.agreementsInstitutionalDocument?.name || doc.agreementsTypesAttachment?.name || docFileName(doc.fileUrl) }}
                    </span>
                    <span :class="`docItem__status docItem__status--${getDocumentStatus(doc).toLowerCase()}`">{{ getDocumentStatus(doc) }}</span>
                  </div>
                </div>
                <a :href="doc.fileUrl" target="_blank" rel="noopener" class="btnDownload">
                  <AppButton outlined style="font-size: 0.82rem">
                    <AppIcon icon="download" />
                    Ver
                  </AppButton>
                </a>
              </div>
            </template>
            <div v-else class="docItem docItem--pending">
              <div class="docItem__left">
                <div class="docItem__icon docItem__icon--orange">
                  <AppIcon icon="info-circle" />
                </div>
                <div class="docItem__info">
                  <span class="docItem__name">Sin documentos cargados</span>
                  <span class="docItem__pending">Usa el botón "Subir documentos" para adjuntar archivos requeridos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sectionDivider"></div>

        <!-- 4. Seguimiento del Proceso -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--orange">
              <AppIcon icon="clock" />
            </div>
            <span class="detailSection__title">Seguimiento del Proceso</span>
          </div>
          <div class="detailSection__card">
            <div class="timelineList">
              <div class="timelineItem" v-for="(step, idx) in timeline" :key="idx">
                <div class="timelineItem__track">
                  <div class="timelineItem__dot" :class="step.completed ? 'timelineItem__dot--done' : 'timelineItem__dot--pending'">
                    <AppIcon :icon="step.completed ? 'check' : 'clock'" />
                  </div>
                  <div
                    class="timelineItem__line"
                    v-if="idx < timeline.length - 1"
                    :class="{
                      'timelineItem__line--done': timeline[idx + 1]?.completed,
                    }"
                  ></div>
                </div>
                <div class="timelineItem__content">
                  <span class="timelineItem__label" :class="step.completed ? 'timelineItem__label--done' : 'timelineItem__label--pending'">
                    {{ step.label }}
                  </span>
                  <span class="timelineItem__date" v-if="step.date">
                    <AppIcon icon="calendar-alt" />
                    {{ step.date }}
                  </span>
                  <span class="timelineItem__note" v-if="step.note">{{ step.note }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="drawerFooter">
        <div class="d-flex gap-2">
          <AppButton outlined @click="$emit('update:isVisible', false)">Cerrar</AppButton>
          <AppButton v-if="canCancel" outlined class="btnCancel" @click="onCancel"> Cancelar postulación </AppButton>
          <AppButton v-if="hasMissingDocs" class="btnUploadDocs">
            <AppIcon icon="upload" />
            Subir documentos
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { ApplicationWithRelationsDto } from '../dtos/agreementsApplication.dto';
import { AgreementsApplicationDocumentDto } from '../dtos/agreementsApplicationDocument.dto';
import { GetAgreementsApplicationDocumentsService } from '../services/getAgreementsApplicationDocuments.service';
import { GetAgreementsApplicationByIdService } from '../services/getAgreementsApplicationById.service';

const getAgreementsApplicationDocumentsService = new GetAgreementsApplicationDocumentsService();
const getAgreementsApplicationByIdService = new GetAgreementsApplicationByIdService();

export default defineComponent({
  name: 'MyApplicationDetailDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, required: true },
    application: {
      type: Object as PropType<ApplicationWithRelationsDto | null>,
      default: null,
    },
  },
  emits: ['update:isVisible', 'cancel'],
  setup(props, { emit }) {
    const documents = ref<AgreementsApplicationDocumentDto[]>([]);
    const loadingDocs = ref(false);
    const applicationDetails = ref<ApplicationWithRelationsDto | null>(null);

    // Cargar detalles completos desde la API
    const loadApplicationDetails = async (app: ApplicationWithRelationsDto) => {
      if (app?.id) {
        try {
          const details = await getAgreementsApplicationByIdService.run(app.id);
          applicationDetails.value = details;
        } catch (error) {
          console.error('Error loading application details:', error);
        }
      }
    };

    const formatDate = (dateStr?: string): string => {
      if (!dateStr) return '—';
      const [year, month, day] = dateStr.split('-');
      return `${parseInt(day)}/${parseInt(month)}/${year}`;
    };

    const formatDateTime = (isoStr: string): string => {
      const d = new Date(isoStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    // Usamos applicationDetails (cargado desde API) o props.application como fallback
    // Campos del convenio
    const programName = computed(() => (applicationDetails.value as any)?.agreementsInstitutional?.name || props.application?.agreementName || `Convenio #${props.application?.id}`);
    const institutionPartner = computed(() => applicationDetails.value?.institutionPartner || (applicationDetails.value as any)?.agreementsInstitutional?.institutionPartner || '—');
    const countryName = computed(() => {
      // props.application.countryName is already translated by the list page via countryOptions
      const propFlat = (props.application as any)?.countryName;
      if (propFlat) return propFlat;

      // Try nested country object with translations
      const country = applicationDetails.value?.agreementsInstitutional?.country;
      if (country) {
        try {
          const t = typeof country.translations === 'string' ? JSON.parse(country.translations) : country.translations;
          if (t?.es) return t.es;
        } catch {
          /* noop */
        }
        return country.name || '—';
      }

      // applicationDetails.countryName comes from API — may be English
      return applicationDetails.value?.countryName || '—';
    });
    const typeName = computed(() => applicationDetails.value?.typeName || (applicationDetails.value as any)?.agreementsInstitutional?.agreementsType?.name || '');
    const agreeCode = computed(() => (applicationDetails.value as any)?.agreementsInstitutional?.code ?? (props.application as any)?.agreementsInstitutional?.code ?? '—');
    const maximumCapacity = computed(() => (applicationDetails.value as any)?.agreementsInstitutional?.maximumCapacity ?? (props.application as any)?.agreementsInstitutional?.maximumCapacity ?? '—');

    // Campos de la postulación
    const areaName = computed(() => (applicationDetails.value as any)?.area?.name || '—');
    const createdAt = computed(() => (applicationDetails.value as any)?.createdAt || '');
    const motivation = computed(() => applicationDetails.value?.motivation || '');
    const languageLevel = computed(() => applicationDetails.value?.languageLevel || '');
    const estimatedStartDate = computed(() => applicationDetails.value?.estimatedStartDate || '');
    const estimatedDuration = computed(() => applicationDetails.value?.estimatedDuration || '');
    const previousExperience = computed(() => applicationDetails.value?.previousExperience || '');

    const docFileName = (url: string) => {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1]) || url;
    };

    const getDocumentStatus = (doc: AgreementsApplicationDocumentDto): string => {
      if (doc.status === 'Aprobado') return 'Aprobado';
      if (doc.status === 'Rechazado') return 'Rechazado';
      if (doc.fileUrl) return 'Cargado';
      return 'Faltante';
    };

    // Cargamos los documentos desde la API
    const loadDocuments = async (app: ApplicationWithRelationsDto) => {
      loadingDocs.value = true;
      documents.value = [];
      try {
        const res = await getAgreementsApplicationDocumentsService.run({
          agreementsApplicationId: app.id,
          perPage: 100,
        });
        documents.value = (res as any)?.data || [];
      } finally {
        loadingDocs.value = false;
      }
    };

    watch(
      () => props.application,
      (app) => {
        if (app?.id) {
          loadApplicationDetails(app);
          loadDocuments(app);
        } else {
          applicationDetails.value = null;
          documents.value = [];
        }
      },
      { immediate: true }
    );

    // ── Status / badge helpers ──
    const appStatus = computed(() => props.application?.status ?? '');
    const hasMissingDocs = computed(() => appStatus.value === 'Pendiente de documentos');

    const canCancel = computed(() => {
      const s = appStatus.value;
      return !!props.application && s !== 'Aprobada' && s !== 'Rechazada';
    });

    const onCancel = () => {
      emit('cancel', props.application);
      emit('update:isVisible', false);
    };

    const statusBadgeClass = computed(() => {
      const map: Record<string, string> = {
        'Pendiente de documentos': 'myAppHead__statusBadge--pending',
        Aprobada: 'myAppHead__statusBadge--approved',
        Rechazada: 'myAppHead__statusBadge--rejected',
        Pendiente: 'myAppHead__statusBadge--pending',
      };
      return map[appStatus.value] ?? '';
    });

    const statusIcon = computed(() => {
      const map: Record<string, string> = {
        'Pendiente de documentos': 'exclamation-circle',
        Aprobada: 'check-circle',
        Rechazada: 'times-circle',
        Pendiente: 'clock',
      };
      return map[appStatus.value] ?? 'circle';
    });

    const typeBadgeClass = computed(() => {
      const name = typeName.value.toLowerCase();
      if (name.includes('movilidad')) return 'badge--academica';
      if (name.includes('práctica') || name.includes('practica')) return 'badge--practica';
      if (name.includes('investigación') || name.includes('investigacion')) return 'badge--investigacion';
      return 'badge--default';
    });

    const timeline = computed(() => {
      const tracking: any[] = (applicationDetails.value as any)?.tracking || [];
      if (!tracking.length) return [];

      const steps = tracking.map((t: any) => ({
        label: t.stage,
        completed: !!t.isCompleted,
        date: t.completedAt ? formatDateTime(t.completedAt) : '',
        note: t.description || '',
      }));

      // En un flujo secuencial, si el paso N está completado todos los anteriores también lo están.
      // Encontrar el índice del último paso completado y marcar todos los previos.
      let lastCompletedIdx = -1;
      for (let i = steps.length - 1; i >= 0; i--) {
        if (steps[i].completed) {
          lastCompletedIdx = i;
          break;
        }
      }
      for (let i = 0; i < lastCompletedIdx; i++) {
        steps[i].completed = true;
      }

      return steps;
    });

    return {
      props,
      programName,
      institutionPartner,
      countryName,
      typeName,
      agreeCode,
      maximumCapacity,
      areaName,
      motivation,
      languageLevel,
      estimatedStartDate,
      estimatedDuration,
      previousExperience,
      hasMissingDocs,
      canCancel,
      onCancel,
      appStatus,
      statusBadgeClass,
      statusIcon,
      typeBadgeClass,
      timeline,
      formatDate,
      documents,
      loadingDocs,
      docFileName,
      getDocumentStatus,
      createdAt,
      formatDateTime,
      applicationDetails,
    };
  },
});
</script>

<style scoped>
/* ── Head ── */
.drawerHead {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.drawerHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff;
  flex-shrink: 0;
}

.drawerHead__info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.drawerHead__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawerHead__subtitle {
  font-size: 0.83rem;
  color: rgba(255, 255, 255, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawerHead__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Type badge in head */
.myAppHead__typeBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1.5px solid transparent;
}

.myAppHead__typeBadge.badge--academica {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.myAppHead__typeBadge.badge--practica {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.myAppHead__typeBadge.badge--investigacion {
  background: #faf5ff;
  color: #7c3aed;
  border-color: #ddd6fe;
}
.myAppHead__typeBadge.badge--default {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

/* Status badge in head */
.myAppHead__statusBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.myAppHead__statusBadge--pending {
  background: #fff7ed;
  color: #c2410c;
}
.myAppHead__statusBadge--review {
  background: #eff6ff;
  color: #2563eb;
}
.myAppHead__statusBadge--approved {
  background: #dcfce7;
  color: #16a34a;
}
.myAppHead__statusBadge--rejected {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Body ── */
.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem;
}

/* ── Alert ── */
.pendingAlert {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.pendingAlert__iconWrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffedd5;
  color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.pendingAlert__text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.pendingAlert__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #92400e;
}

.pendingAlert__msg {
  font-size: 0.82rem;
  color: #92400e;
  line-height: 1.5;
}

/* ── Section ── */
.detailSection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detailSection__head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.detailSection__icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.detailSection__icon--blue {
  background: #eff6ff;
  color: #2563eb;
}
.detailSection__icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.detailSection__icon--orange {
  background: #fff7ed;
  color: #ea580c;
}

.detailSection__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.detailSection__card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Info grid ── */
.infoGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
}

.infoGrid--1col {
  grid-template-columns: 1fr;
}

.infoField {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.infoField__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.infoField__value {
  font-size: 0.88rem;
  color: #374151;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.infoField__value--bold {
  font-weight: 700;
  color: #111827;
}

.infoField__value--mono {
  font-family: monospace;
  font-size: 0.9rem;
}

.infoField__value--primary {
  color: var(--color-primary, #2563eb);
  font-weight: 700;
  font-size: 0.95rem;
}

.infoField__icon {
  color: #9ca3af;
  font-size: 0.82rem;
}

.infoSeparator {
  width: 100%;
  height: 1px;
  background: #f3f4f6;
}

/* ── Convenio type badge (inside card) ── */
.convenioBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 4px;
  font-size: 0.88rem;
  font-weight: 500;
  border: 1px solid transparent;
  width: fit-content;
  line-height: 1.2;
}

/* ── Motivation box ── */
.motivationBox {
  background: #f9fafb;
  border-left: 3px solid #d1d5db;
  border-radius: 0 6px 6px 0;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #374151;
  line-height: 1.65;
  font-style: italic;
}

/* ── Section divider ── */
.sectionDivider {
  width: 100%;
  height: 1px;
  background: #f3f4f6;
}

/* ── Documents list ── */
.docsList {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.docItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  border: 1px solid transparent;
  border-left-width: 4px;
}

.docItem--uploaded {
  background: #f0fdf4;
  border-color: #bbf7d0;
  border-left-color: #22c55e;
}

.docItem--pending {
  background: #fff7ed;
  border-color: #fed7aa;
  border-left-color: #f97316;
}

.docItem__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.docItem__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.docItem__icon--green {
  background: #dcfce7;
  color: #16a34a;
}

.docItem__icon--orange {
  background: #ffedd5;
  color: #ea580c;
}

.docItem__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.docItem__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #111827;
}

.docItem__status {
  font-size: 0.78rem;
}

.docItem__status--aprobado {
  color: #16a34a;
}

.docItem__status--cargado {
  color: #2563eb;
}

.docItem__status--faltante {
  color: #ea580c;
}

.docItem__date {
  font-size: 0.78rem;
  color: #16a34a;
}

.docItem__pending {
  font-size: 0.78rem;
  color: #ea580c;
}

.btnDownload {
  flex-shrink: 0;
  font-size: 0.82rem;
}

.btnUploadDoc {
  flex-shrink: 0;
  font-size: 0.82rem;
  background: #111827;
  color: #fff;
  border-color: #111827;
}

/* ── Timeline ── */
.timelineList {
  display: flex;
  flex-direction: column;
}

.timelineItem {
  display: flex;
  gap: 1rem;
}

.timelineItem__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.timelineItem__dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
  border: 2px solid transparent;
}

.timelineItem__dot--done {
  background: #dcfce7;
  color: #16a34a;
  border-color: #86efac;
}

.timelineItem__dot--pending {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}

.timelineItem__line {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  margin: 4px 0;
  min-height: 28px;
}

.timelineItem__line--done {
  background: #86efac;
}

.timelineItem__content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 0.45rem;
  padding-bottom: 1.25rem;
  min-width: 0;
}

.timelineItem__label {
  font-size: 0.9rem;
  font-weight: 600;
}

.timelineItem__label--done {
  color: #111827;
}

.timelineItem__label--pending {
  color: #9ca3af;
}

.timelineItem__date {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #6b7280;
}

.timelineItem__note {
  font-size: 0.78rem;
  color: #2563eb;
  font-style: italic;
  margin-top: 0.1rem;
}

/* ── Footer ── */
.drawerFooter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 0 0.25rem;
  gap: 0.5rem;
}

.btnCancel {
  border-color: #fecaca;
  color: #dc2626;
}

.btnUploadDocs {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

@media (max-width: 480px) {
  .myAppFooter {
    flex-direction: column;
    align-items: flex-end;
  }

  .infoGrid {
    grid-template-columns: 1fr;
  }
}
</style>
