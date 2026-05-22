<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="xl">
    <!-- HEAD -->
    <template #head>
      <div class="drawerHead">
        <div class="drawerHead__icon">
          <AppIcon icon="file-alt" />
        </div>
        <div class="drawerHead__info">
          <span class="drawerHead__title">Postulación #{{ application?.id }}</span>
          <span class="drawerHead__subtitle">{{ applicationDetails?.agreementsInstitutional?.name ?? agreement?.name ?? '—' }}</span>
        </div>
        <span class="appStatusBadge" :class="statusBadgeClass">{{ applicationDetails?.status ?? application?.status }}</span>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="drawerBody">
        <!-- Alerta documentos pendientes -->
        <div class="pendingDocsAlert" v-if="applicationDetails?.documentProgress && applicationDetails.documentProgress.uploaded < applicationDetails.documentProgress.totalRequired">
          <AppIcon icon="exclamation-triangle" class="pendingDocsAlert__icon" />
          <div class="pendingDocsAlert__text">
            <span class="pendingDocsAlert__title">Documentos pendientes</span>
            <span class="pendingDocsAlert__msg"> Hay documentos pendientes de revisión. Verifique el estado de los documentos antes de aprobar. </span>
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
            <div class="infoGrid infoGrid--1col">
              <div class="infoField">
                <span class="infoField__label">Nombre del convenio</span>
                <span class="infoField__value infoField__value--bold">{{ applicationDetails?.agreementsInstitutional?.name ?? agreement?.name ?? '—' }}</span>
              </div>
            </div>
            <hr class="infoFieldDivider" />
            <div class="infoGrid">
              <div class="infoField">
                <span class="infoField__label">Tipo de convenio</span>
                <span
                  class="tipoBadge"
                  :class="tipoClass(applicationDetails?.agreementsInstitutional?.agreementsType?.name || (application as any)?.agreementsInstitutional?.agreementsType?.name || agreement?.agreementsType?.name)"
                >
                  {{
                    applicationDetails?.agreementsInstitutional?.agreementsType?.name || (application as any)?.agreementsInstitutional?.agreementsType?.name || agreement?.agreementsType?.name || '—'
                  }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Código</span>
                <span class="infoField__value infoField__value--mono">{{ (applicationDetails?.agreementsInstitutional as any)?.code ?? agreement?.code ?? '—' }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Institución aliada</span>
                <span class="infoField__value">{{ applicationDetails?.agreementsInstitutional?.institutionPartner ?? agreement?.institutionPartner ?? '—' }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">País</span>
                <span class="infoField__value">
                  <AppIcon icon="globe" class="infoField__icon" />
                  {{ countryName }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Vigencia</span>
                <span class="infoField__value">
                  <AppIcon icon="calendar-alt" class="infoField__icon" />
                  {{ formatDate((applicationDetails?.agreementsInstitutional as any)?.starDay ?? agreement?.starDay) }}
                  –
                  {{ formatDate((applicationDetails?.agreementsInstitutional as any)?.endDate ?? agreement?.endDate) }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Cupos máximos</span>
                <span class="infoField__value infoField__value--primary">
                  {{ (applicationDetails?.agreementsInstitutional as any)?.maximumCapacity ?? availableSlots }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Información del Solicitante -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--purple">
              <AppIcon icon="user" />
            </div>
            <span class="detailSection__title">Información del Solicitante</span>
          </div>
          <div class="detailSection__card">
            <div class="infoGrid">
              <div class="infoField">
                <span class="infoField__label">Nombre completo</span>
                <span class="infoField__value infoField__value--bold">
                  {{
                    (applicationDetails as any)?.user?.people
                      ? `${(applicationDetails as any).user.people.names} ${(applicationDetails as any).user.people.lastnames}`
                      : (application as any)?.user?.people
                      ? `${(application as any).user.people.names} ${(application as any).user.people.lastnames}`
                      : '—'
                  }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Identificación</span>
                <span class="infoField__value infoField__value--mono">{{
                  (applicationDetails as any)?.user?.people?.identification || (application as any)?.user?.people?.identification || '—'
                }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Correo</span>
                <span class="infoField__value">{{ (applicationDetails as any)?.user?.userToken || (application as any)?.user?.userToken || '—' }}</span>
              </div>
              <div class="infoField" v-if="applicationDetails?.languageLevel || application?.languageLevel">
                <span class="infoField__label">Nivel de idioma</span>
                <span class="infoField__value">{{ applicationDetails?.languageLevel || application?.languageLevel }}</span>
              </div>
              <div class="infoField" v-if="applicationDetails?.previousExperience || application?.previousExperience">
                <span class="infoField__label">Experiencia previa</span>
                <span class="infoField__value">{{ applicationDetails?.previousExperience || application?.previousExperience }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Información de la Postulación -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--green">
              <AppIcon icon="file-alt" />
            </div>
            <span class="detailSection__title">Información de la Postulación</span>
          </div>
          <div class="detailSection__card">
            <div class="infoGrid">
              <div class="infoField">
                <span class="infoField__label">Fecha estimada de inicio</span>
                <span class="infoField__value">
                  <AppIcon icon="calendar-alt" class="infoField__icon" />
                  {{ formatDate((applicationDetails?.agreementsInstitutional as any)?.starDay ?? agreement?.starDay) }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Duración estimada</span>
                <span class="infoField__value">
                  <AppIcon icon="calendar-alt" class="infoField__icon" />
                  {{ formatDate((applicationDetails?.agreementsInstitutional as any)?.endDate ?? agreement?.endDate) }}
                </span>
              </div>
              <div class="infoField" v-if="applicationDetails?.languageLevel || application?.languageLevel">
                <span class="infoField__label">Nivel de idioma</span>
                <span class="infoField__value">{{ applicationDetails?.languageLevel || application?.languageLevel }}</span>
              </div>
              <div class="infoField" v-if="(applicationDetails as any)?.area?.name || (application as any)?.area?.name">
                <span class="infoField__label">Área de interés</span>
                <span class="infoField__value">{{ (applicationDetails as any)?.area?.name || (application as any)?.area?.name }}</span>
              </div>
            </div>
            <hr class="infoFieldDivider" />
            <div class="infoGrid infoGrid--1col">
              <div class="infoField">
                <span class="infoField__label">Motivación</span>
                <div class="motivationBox">
                  {{ applicationDetails?.motivation || application?.motivation || '—' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Evaluación Administrativa -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--purple">
              <AppIcon icon="clipboard-check" />
            </div>
            <span class="detailSection__title">Evaluación Administrativa</span>
          </div>
          <div class="detailSection__card">
            <!-- Estado de la postulación -->
            <div class="evaluationGroup">
              <label class="evaluationLabel">Estado de la postulación</label>
              <select v-model="evaluationStatus" class="evaluationSelect">
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </div>

            <!-- Comentarios de evaluación -->
            <div class="evaluationGroup">
              <label class="evaluationLabel">Comentarios de evaluación</label>
              <textarea v-model="evaluationComment" placeholder="Ingrese observaciones del comité o evaluador..." class="evaluationTextarea" />
              <p class="evaluationHint">Estos comentarios se compartirán con el estudiante</p>
            </div>
          </div>
        </div>

        <!-- 6. Documentos Cargados -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--orange">
              <AppIcon icon="cloud-upload-alt" />
            </div>
            <span class="detailSection__title">Documentos Cargados</span>
            <span class="documentProgress" v-if="applicationDetails?.documentProgress">
              Progreso:
              <span class="documentProgress__number">{{ applicationDetails.documentProgress.uploaded }}/{{ applicationDetails.documentProgress.totalRequired }}</span>
              <span class="documentProgress__percent">({{ docsPercent }}%)</span>
            </span>
          </div>
          <div class="detailSection__card">
            <!-- Progress bar -->
            <div v-if="applicationDetails?.documentProgress" class="progressBar">
              <div class="progressBar__track">
                <div class="progressBar__fill" :style="{ width: docsPercent + '%' }"></div>
              </div>
            </div>

            <!-- Documents list -->
            <div v-if="loadingDocuments" class="text-center py-4">
              <AppIcon icon="circle-notch" class="spinner-border spinner-border-sm" />
              <p class="small text-muted mt-2">Cargando documentos...</p>
            </div>
            <div v-else-if="!documents.length" class="small text-muted py-2">Sin documentos para evaluar.</div>
            <div v-else class="documentsList">
              <div v-for="doc in documents" :key="doc.id" class="documentCard" :class="`documentCard--${getDocumentStatus(doc).toLowerCase()}`">
                <div class="documentCard__content">
                  <div class="documentCard__icon">
                    <AppIcon
                      :icon="
                        getDocumentStatus(doc) === 'Aprobado' ? 'check-circle' : getDocumentStatus(doc) === 'Rechazado' ? 'times-circle' : getDocumentStatus(doc) === 'Cargado' ? 'file-alt' : 'clock'
                      "
                    />
                  </div>
                  <div class="documentCard__info">
                    <span class="documentCard__name">
                      {{ doc.agreementsInstitutionalDocument?.name || doc.agreementsTypesAttachment?.name || 'Documento sin nombre' }}
                    </span>
                    <span class="documentCard__badge" :class="`badge--${getDocumentStatus(doc).toLowerCase()}`">
                      {{ getDocumentStatus(doc) }}
                    </span>
                  </div>
                </div>
                <div class="documentCard__actions">
                  <button v-if="doc.fileUrl" @click="openFile(doc.fileUrl)" class="documentAction" title="Ver documento">
                    <AppIcon icon="eye" />
                    Ver
                  </button>
                  <button v-if="doc.fileUrl" @click="openFile(doc.fileUrl)" class="documentAction" title="Descargar documento">
                    <AppIcon icon="download" />
                    Descargar
                  </button>
                  <button v-if="!doc.fileUrl || doc.status === 'Rechazado'" class="documentAction documentAction--request" title="Solicitar documento">
                    <AppIcon icon="paper-plane" />
                    Solicitar documento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. Historial del Proceso -->
        <div class="detailSection">
          <div class="detailSection__head">
            <div class="detailSection__icon detailSection__icon--blue">
              <AppIcon icon="history" />
            </div>
            <span class="detailSection__title">Historial del Proceso</span>
          </div>
          <div class="detailSection__card">
            <div v-if="!processedTracking.length" class="small text-muted py-2">Sin historial registrado.</div>
            <div v-else class="trackingList">
              <div v-for="(step, idx) in processedTracking" :key="step.id" class="trackingItem">
                <div class="trackingItem__track">
                  <div class="trackingItem__dot" :class="step.isCompleted ? 'trackingItem__dot--done' : 'trackingItem__dot--pending'">
                    <AppIcon :icon="step.isCompleted ? 'check' : 'clock'" />
                  </div>
                  <div class="trackingItem__line" v-if="idx < processedTracking.length - 1" :class="processedTracking[idx + 1]?.isCompleted ? 'trackingItem__line--done' : ''"></div>
                </div>
                <div class="trackingItem__content">
                  <span class="trackingItem__stage" :class="step.isCompleted ? 'trackingItem__stage--done' : 'trackingItem__stage--pending'">{{ step.stage }}</span>
                  <span v-if="step.completedAt" class="trackingItem__date">
                    <AppIcon icon="calendar-alt" />
                    {{ formatDate(step.completedAt) }}
                  </span>
                  <span v-if="step.description" class="trackingItem__desc">{{ step.description }}</span>
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
        <AppButton outlined @click="onClose"> Cerrar </AppButton>
        <div class="d-flex gap-2">
          <AppButton outlined class="btnRejectApp" :disabled="isRejectDisabled" v-tooltip="isRejectDisabled ? 'Debe agregar comentarios para rechazar' : ''" @click="onReject">
            <AppIcon icon="times-circle" />
            Rechazar postulación
          </AppButton>
          <AppButton variant="success" @click="onApprove">
            <AppIcon icon="check-circle" />
            Aprobar postulación
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

import { InstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';
import { AgreementsApplicationDto, ApplicationWithRelationsDto } from '../dtos/agreementsApplication.dto';
import { AgreementsApplicationDocumentDto } from '../dtos/agreementsApplicationDocument.dto';
import { GetAgreementsApplicationByIdService } from '../services/getAgreementsApplicationById.service';
import { GetAgreementsApplicationDocumentsService } from '../services/getAgreementsApplicationDocuments.service';
import { GetAgreementsApplicationTrackingService } from '../services/getAgreementsApplicationTracking.service';
import { CreateOrUpdateAgreementsApplicationService } from '../services/createOrUpdateAgreementsApplication.service';

const getAgreementsApplicationByIdService = new GetAgreementsApplicationByIdService();
const getAgreementsApplicationDocumentsService = new GetAgreementsApplicationDocumentsService();
const getAgreementsApplicationTrackingService = new GetAgreementsApplicationTrackingService();
const createOrUpdateAgreementsApplicationService = new CreateOrUpdateAgreementsApplicationService();

export default defineComponent({
  name: 'ApplicationDetailDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, required: true },
    application: {
      type: Object as PropType<AgreementsApplicationDto | null>,
      default: null,
    },
    agreement: {
      type: Object as PropType<InstitutionalAgreementDto | null>,
      default: null,
    },
    resolvedCountryName: {
      type: String,
      default: '',
    },
  },
  emits: ['update:isVisible', 'approve', 'reject', 'statusChanged'],
  setup(props, { emit }) {
    const evaluationStatus = ref<string>('Pendiente');
    const evaluationComment = ref('');
    const loadingApplicationDetails = ref(false);
    const applicationDetails = ref<ApplicationWithRelationsDto | null>(null);
    const documents = ref<AgreementsApplicationDocumentDto[]>([]);
    const loadingDocuments = ref(false);

    watch(
      () => props.application,
      async (app) => {
        evaluationStatus.value = app?.status ?? 'Pendiente';
        evaluationComment.value = '';
        applicationDetails.value = null;
        documents.value = [];
        if (app?.id) {
          loadingApplicationDetails.value = true;
          loadingDocuments.value = true;
          try {
            const [detailsRes, docsRes, trackingRes] = await Promise.all([
              getAgreementsApplicationByIdService.run(app.id),
              getAgreementsApplicationDocumentsService.getByApplicationId(app.id),
              getAgreementsApplicationTrackingService.run(app.id),
            ]);
            applicationDetails.value = detailsRes || null;
            documents.value = docsRes || [];
            if (applicationDetails.value) {
              applicationDetails.value.tracking = trackingRes || [];
            }
          } finally {
            loadingApplicationDetails.value = false;
            loadingDocuments.value = false;
          }
        }
      },
      { immediate: true }
    );

    const countryName = computed(() => {
      // resolvedCountryName comes from the parent page which loads filterCountries (Spanish names by ID)
      if (props.resolvedCountryName) return props.resolvedCountryName;
      // Last resort: flat English field
      return (props.application as any)?.countryName || applicationDetails.value?.countryName || '—';
    });

    const availableSlots = computed(() => {
      if (!((applicationDetails.value?.agreementsInstitutional as any)?.maximumCapacity ?? props.agreement?.maximumCapacity)) return '—';
      return (applicationDetails.value?.agreementsInstitutional as any)?.maximumCapacity ?? props.agreement?.maximumCapacity;
    });

    const docsPercent = computed(() => {
      const progress = applicationDetails.value?.documentProgress;
      if (!progress) return 0;
      // Usar el porcentaje que viene del backend, o calcularlo si no existe
      return progress.percentage ?? Math.round((progress.uploaded / progress.totalRequired) * 100) ?? 0;
    });

    const docsProgressLabelClass = computed(() => {
      if (docsPercent.value === 100) return 'docsProgressLabel--complete';
      if (docsPercent.value > 0) return 'docsProgressLabel--partial';
      return 'docsProgressLabel--empty';
    });

    const getDocumentStatus = (doc: AgreementsApplicationDocumentDto): string => {
      if (doc.status === 'Aprobado') return 'Aprobado';
      if (doc.status === 'Rechazado') return 'Rechazado';
      if (doc.fileUrl) return 'Cargado';
      return 'Faltante';
    };

    const processedTracking = computed(() => {
      const tracking = applicationDetails.value?.tracking ?? [];
      if (!tracking.length) return tracking;

      const steps = tracking.map((t) => ({
        ...t,
        isCompleted: !!t.isCompleted,
      }));

      let lastCompletedIdx = -1;
      for (let i = steps.length - 1; i >= 0; i--) {
        if (steps[i].isCompleted) {
          lastCompletedIdx = i;
          break;
        }
      }
      for (let i = 0; i < lastCompletedIdx; i++) {
        steps[i].isCompleted = true;
      }

      return steps;
    });

    const isRejectDisabled = computed(() => !evaluationComment.value.trim());

    const statusBadgeClass = computed(() => {
      const map: Record<string, string> = {
        Pendiente: 'appStatusBadge--pending',
        Aprobada: 'appStatusBadge--approved',
        Rechazada: 'appStatusBadge--rejected',
      };
      return map[props.application?.status ?? ''] ?? '';
    });

    const tipoClass = (tipo?: string): string => {
      const map: Record<string, string> = {
        'Práctica Profesional': 'tipoBadge--practice',
        'Movilidad Internacional': 'tipoBadge--mobility',
        'Investigación Conjunta': 'tipoBadge--research',
        'Intercambio Cultural': 'tipoBadge--cultural',
      };
      return map[tipo ?? ''] ?? '';
    };

    const formatDate = (dateStr?: string | null): string => {
      if (!dateStr) return '—';
      try {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(day)}/${parseInt(month)}/${year}`;
      } catch {
        return dateStr;
      }
    };

    const docStatusClass = (status: string): string => {
      const map: Record<string, string> = {
        Aprobado: 'docCard--uploaded',
        Pendiente: 'docCard--pending',
        Rechazado: 'docCard--missing',
      };
      return map[status] ?? 'docCard--pending';
    };

    const docIconWrapClass = (status: string): string => {
      const map: Record<string, string> = {
        Aprobado: 'docCard__iconWrap--green',
        Pendiente: 'docCard__iconWrap--orange',
        Rechazado: 'docCard__iconWrap--red',
      };
      return map[status] ?? 'docCard__iconWrap--orange';
    };

    const docIcon = (status: string): string => {
      const map: Record<string, string> = {
        Aprobado: 'check-circle',
        Pendiente: 'clock',
        Rechazado: 'times-circle',
      };
      return map[status] ?? 'file-alt';
    };

    const reloadApplicationData = async () => {
      if (!props.application?.id) return;
      try {
        const [detailsRes, docsRes, trackingRes] = await Promise.all([
          getAgreementsApplicationByIdService.run(props.application.id),
          getAgreementsApplicationDocumentsService.getByApplicationId(props.application.id),
          getAgreementsApplicationTrackingService.run(props.application.id),
        ]);
        applicationDetails.value = detailsRes || null;
        documents.value = docsRes || [];
        if (applicationDetails.value) {
          applicationDetails.value.tracking = trackingRes || [];
        }
        evaluationStatus.value = detailsRes?.status ?? 'Pendiente';
      } catch (error) {
        console.error('Error al recargar datos:', error);
      }
    };

    const emitStatusChanged = (newStatus: string) => {
      emit('statusChanged', {
        application: { ...props.application, status: newStatus },
        comment: evaluationComment.value,
      });
    };

    const onApprove = async () => {
      if (!props.application?.id) return;
      try {
        const payload: any = {
          status: 'Aprobada',
        };
        if (evaluationComment.value) {
          payload.motivation = evaluationComment.value;
        }
        await createOrUpdateAgreementsApplicationService.run(payload, props.application.id);
        await reloadApplicationData();
      } catch {
        // interceptor maneja el toast de error
      }
      emit('approve', {
        application: { ...props.application, status: 'Aprobada' },
        comment: evaluationComment.value,
      });
      emitStatusChanged('Aprobada');
      emit('update:isVisible', false);
    };

    const onReject = async () => {
      if (isRejectDisabled.value || !props.application?.id) return;
      try {
        const payload: any = {
          status: 'Rechazada',
        };
        if (evaluationComment.value) {
          payload.motivation = evaluationComment.value;
        }
        await createOrUpdateAgreementsApplicationService.run(payload, props.application.id);
        await reloadApplicationData();
      } catch {
        // interceptor maneja el toast de error
      }
      emit('reject', {
        application: { ...props.application, status: 'Rechazada' },
        comment: evaluationComment.value,
      });
      emitStatusChanged('Rechazada');
      emit('update:isVisible', false);
    };

    const onClose = async () => {
      // Si el estado cambió desde que se abrió, guardar el cambio
      if (evaluationStatus.value !== (props.application?.status ?? 'Pendiente')) {
        if (!props.application?.id) return;
        try {
          const payload: any = {
            status: evaluationStatus.value,
          };
          await createOrUpdateAgreementsApplicationService.run(payload, props.application.id);
          await reloadApplicationData();
        } catch {
          // interceptor maneja el toast de error
        }
        emitStatusChanged(evaluationStatus.value);
      }
      emit('update:isVisible', false);
    };

    return {
      evaluationStatus,
      evaluationComment,
      loadingApplicationDetails,
      loadingDocuments,
      applicationDetails,
      documents,
      countryName,
      availableSlots,
      docsPercent,
      docsProgressLabelClass,
      processedTracking,
      isRejectDisabled,
      statusBadgeClass,
      tipoClass,
      formatDate,
      docStatusClass,
      docIconWrapClass,
      docIcon,
      getDocumentStatus,
      openFile: (url: string) => window.open(url, '_blank'),
      reloadApplicationData,
      onApprove,
      onReject,
      onClose,
    };
  },
});
</script>

<style scoped>
/* ── Drawer head ── */
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

/* Status badge in head */
.appStatusBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.appStatusBadge--pending {
  background: #fef3c7;
  color: #d97706;
}
.appStatusBadge--approved {
  background: #dcfce7;
  color: #16a34a;
}
.appStatusBadge--rejected {
  background: #fee2e2;
  color: #dc2626;
}
.appStatusBadge--review {
  background: #eff6ff;
  color: #2563eb;
}

/* ── Body ── */
.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

/* ── Pending docs alert ── */
.pendingDocsAlert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  margin-bottom: 1.1rem;
}

.pendingDocsAlert__icon {
  color: #d97706;
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.pendingDocsAlert__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.pendingDocsAlert__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #92400e;
}

.pendingDocsAlert__msg {
  font-size: 0.82rem;
  color: #b45309;
  line-height: 1.45;
}

/* ── Section ── */
.detailSection {
  margin-bottom: 1.25rem;
}

.detailSection__head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.6rem;
}

.detailSection__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.detailSection__icon--blue {
  background: #eff6ff;
  color: #2563eb;
}
.detailSection__icon--purple {
  background: #faf5ff;
  color: #7c3aed;
}
.detailSection__icon--green {
  background: #f0fdf4;
  color: #15803d;
}
.detailSection__icon--orange {
  background: #fff7ed;
  color: #c2410c;
}
.detailSection__icon--gray {
  background: #f3f4f6;
  color: #6b7280;
}

.detailSection__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  flex: 1;
}

.detailSection__card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

/* ── Info grid ── */
.infoGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.9rem 1.5rem;
}

.infoGrid--1col {
  grid-template-columns: 1fr;
}

.infoField {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: flex-start;
}

.infoField__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.infoField__value {
  font-size: 0.88rem;
  color: #111827;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.infoField__value--bold {
  font-weight: 700;
  font-size: 0.95rem;
}
.infoField__value--mono {
  font-family: monospace;
  font-size: 0.9rem;
}
.infoField__value--primary {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.95rem;
}

.infoField__sub {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
}
.infoField__sub--primary {
  font-size: 0.78rem;
  color: var(--color-primary);
  font-weight: 600;
}

.infoField__icon {
  font-size: 0.82rem;
  color: #6b7280;
}
.infoField__icon--gold {
  color: #d97706;
}

.infoFieldDivider {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0.75rem 0;
}

/* ── Tipo badge ── */
.tipoBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 4px;
  font-size: 0.88rem;
  font-weight: 500;
  border: 1px solid transparent;
  width: fit-content;
  white-space: nowrap;
  line-height: 1.2;
}
.tipoBadge--practice {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.tipoBadge--mobility {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.tipoBadge--research {
  background: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}
.tipoBadge--cultural {
  background: #faf5ff;
  color: #7c3aed;
  border-color: #ddd6fe;
}

/* ── Academic status badge ── */
.academicBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  width: fit-content;
}

.academicBadge--active {
  background: #dcfce7;
  color: #15803d;
}
.academicBadge--inactive {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Motivation box ── */
.motivationBox {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.87rem;
  color: #0369a1;
  line-height: 1.55;
}

/* ── Docs progress ── */
.docsProgressLabel {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
}

.docsProgressLabel--complete {
  color: #16a34a;
}
.docsProgressLabel--partial {
  color: #d97706;
}
.docsProgressLabel--empty {
  color: #dc2626;
}

.docsProgressBar {
  height: 7px;
  background: #e5e7eb;
  border-radius: 999px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.docsProgressBar__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.docsProgressBar__fill--complete {
  background: #16a34a;
}
.docsProgressBar__fill--partial {
  background: #d97706;
}
.docsProgressBar__fill--empty {
  background: #dc2626;
}

/* ── Doc cards ── */
.docCardList {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.docCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid;
}

.docCard--uploaded {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.docCard--pending {
  background: #fffbeb;
  border-color: #fcd34d;
}
.docCard--missing {
  background: #fef2f2;
  border-color: #fecaca;
}

.docCard__left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 0;
}

.docCard__iconWrap {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.docCard__iconWrap--green {
  background: #dcfce7;
  color: #16a34a;
}
.docCard__iconWrap--orange {
  background: #fff7ed;
  color: #c2410c;
}
.docCard__iconWrap--red {
  background: #fee2e2;
  color: #dc2626;
}

.docCard__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.docCard__name {
  font-size: 0.87rem;
  font-weight: 600;
  color: #111827;
}

.docCard__name--missing {
  color: #9ca3af;
  font-style: italic;
}

.docCard__status {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  width: fit-content;
}

.docCard__status--uploaded {
  background: #dcfce7;
  color: #16a34a;
}
.docCard__status--missing {
  background: #fee2e2;
  color: #dc2626;
}

.docCard__actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.btnRequestDoc {
  border-color: #fecaca;
  color: #dc2626;
}

.btnRequestDoc:hover {
  background: #fee2e2;
}

/* ── Evaluation ── */
.evalFieldGroup {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.evalFieldGroup:last-child {
  margin-bottom: 0;
}

.evalHint {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 0.2rem;
}

/* ── History timeline ── */
.historyList {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.historyItem {
  display: flex;
  gap: 1rem;
}

.historyItem__iconWrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.historyItem__iconCircle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  border: 2px solid transparent;
}

.historyItem__iconCircle--blue {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}
.historyItem__iconCircle--green {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}
.historyItem__iconCircle--orange {
  background: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}
.historyItem__iconCircle--red {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}
.historyItem__iconCircle--purple {
  background: #faf5ff;
  color: #7c3aed;
  border-color: #ddd6fe;
}
.historyItem__iconCircle--gray {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

.historyItem__line {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  margin: 4px 0;
  min-height: 24px;
}

.historyItem__content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-bottom: 1.25rem;
  padding-top: 0.6rem;
}

.historyItem__event {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
}

.historyItem__date {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #6b7280;
}

.historyItem__author {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #9ca3af;
}

/* ── Footer ── */
.drawerFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0.25rem;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .appDetailFooter {
    flex-direction: column;
    align-items: flex-end;
  }
}

.btnRejectApp {
  border-color: #fecaca;
  color: #dc2626;
}

.btnRejectApp:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Tracking timeline ── */
.trackingList {
  display: flex;
  flex-direction: column;
}

.trackingItem {
  display: flex;
  gap: 1rem;
}

.trackingItem__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.trackingItem__dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
  border: 2px solid transparent;
}

.trackingItem__dot--done {
  background: #dcfce7;
  color: #16a34a;
  border-color: #86efac;
}

.trackingItem__dot--pending {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}

.trackingItem__line {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  margin: 4px 0;
  min-height: 24px;
}

.trackingItem__line--done {
  background: #86efac;
}

.trackingItem__content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 0.4rem;
  padding-bottom: 1.1rem;
}

.trackingItem__stage {
  font-size: 0.9rem;
  font-weight: 600;
}

.trackingItem__stage--done {
  color: #111827;
}

.trackingItem__stage--pending {
  color: #9ca3af;
}

.trackingItem__date {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #6b7280;
}

.trackingItem__desc {
  font-size: 0.78rem;
  color: #2563eb;
  font-style: italic;
}

/* ── Evaluation Section ── */
.detailSection__icon--purple {
  background: #f3e8ff;
  color: #a855f7;
}

.detailSection__icon--orange {
  background: #fed7aa;
  color: #ea580c;
}

.evaluationGroup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.evaluationGroup:last-child {
  margin-bottom: 0;
}

.evaluationLabel {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.evaluationSelect {
  padding: 0.6rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  background: #f9fafb;
  cursor: pointer;
  transition: border-color 0.2s;
}

.evaluationSelect:hover {
  border-color: #9ca3af;
}

.evaluationSelect:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.evaluationTextarea {
  min-height: 80px;
  padding: 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.evaluationTextarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.evaluationHint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

/* ── Documents Section ── */
.documentProgress {
  font-size: 0.85rem;
  color: #6b7280;
  margin-left: auto;
}

.documentProgress__number {
  font-weight: 600;
  color: #111827;
}

.documentProgress__percent {
  font-weight: 700;
  color: #dc2626;
}

.progressBar {
  margin-bottom: 1.2rem;
}

.progressBar__track {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progressBar__fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.documentsList {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.documentCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
  gap: 1rem;
}

.documentCard--aprobado {
  background: #f0fdf4;
  border-color: #86efac;
}

.documentCard--rechazado {
  background: #fef2f2;
  border-color: #fca5a5;
}

.documentCard--pendiente {
  background: #fffbeb;
  border-color: #fde68a;
}

.documentCard--cargado {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.documentCard--faltante {
  background: #fef2f2;
  border-color: #fca5a5;
}

.documentCard__content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
  min-width: 0;
}

.documentCard__icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.documentCard--aprobado .documentCard__icon {
  color: #16a34a;
}

.documentCard--rechazado .documentCard__icon {
  color: #dc2626;
}

.documentCard--pendiente .documentCard__icon {
  color: #f59e0b;
}

.documentCard--cargado .documentCard__icon {
  color: #0ea5e9;
}

.documentCard--faltante .documentCard__icon {
  color: #dc2626;
}

.documentCard__info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.documentCard__name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.documentCard__badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.25rem 0.6rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge--aprobado {
  background: #dcfce7;
  color: #16a34a;
}

.badge--rechazado {
  background: #fee2e2;
  color: #dc2626;
}

.badge--pendiente {
  background: #fef3c7;
  color: #d97706;
}

.badge--cargado {
  background: #e0f2fe;
  color: #0369a1;
}

.badge--faltante {
  background: #fee2e2;
  color: #dc2626;
}

.documentCard__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.documentAction {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: #2563eb;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.documentAction:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.documentAction--request {
  color: #dc2626;
  border-color: #fca5a5;
}

.documentAction--request:hover {
  background: #fef2f2;
  border-color: #dc2626;
}
</style>
