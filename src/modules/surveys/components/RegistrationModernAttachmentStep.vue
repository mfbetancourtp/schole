<template>
  <AppLoading v-if="loading" />

  <div v-else class="modern-attachment-step">
    <AppCard class="modern-attachment-step__shell">
      <template #body>
        <RegistrationModernHelpAccordion :description="resolvedTutorialDescription" :video-url="resolvedTutorialVideoUrl" :default-open="true" />

        <AppLoading v-if="loadingItems" />

        <template v-else-if="step?.detail?.length">
          <section class="modern-attachment-step__header">
            <div>
              <h2>Adjuntar documentos</h2>
              <p>Sube los documentos requeridos para completar tu solicitud</p>
            </div>

            <span class="modern-attachment-step__counter">{{ uploadedRequiredCount }}/{{ totalRequiredCount }} obligatorios</span>
          </section>

          <div class="modern-attachment-step__progressTrack">
            <div class="modern-attachment-step__progressBar" :style="{ width: `${progressPercentage}%` }"></div>
          </div>

          <div class="modern-attachment-step__requirements">
            <article v-for="detail in step.detail" :key="detail.id" :class="['modern-attachment-step__requirement', `modern-attachment-step__requirement--${statusMeta(detail).tone}`]">
              <div class="modern-attachment-step__requirementHeader">
                <div class="modern-attachment-step__identity">
                  <div :class="['modern-attachment-step__typeIcon', `modern-attachment-step__typeIcon--${requirementMeta(detail).tone}`]">
                    <AppIcon :icon="requirementMeta(detail).icon" />
                  </div>

                  <div class="modern-attachment-step__identityText">
                    <h3>{{ detail.title }}</h3>
                    <p
                      v-html="
                        linkifyHtml(detail.description ?? '', {
                          target: '_blank',
                        })
                      "
                    ></p>
                  </div>
                </div>

                <div class="modern-attachment-step__badges">
                  <span v-if="isRequiredDetail(detail)" class="modern-attachment-step__badge modern-attachment-step__badge--required">Obligatorio</span>
                  <span :class="['modern-attachment-step__badge', `modern-attachment-step__badge--${statusMeta(detail).tone}`]">
                    <AppIcon :icon="statusMeta(detail).icon" />
                    {{ statusMeta(detail).label }}
                  </span>
                </div>
              </div>

              <div v-if="detail.urlTemplate" class="modern-attachment-step__templateRow">
                <AppIcon icon="file-download" />
                <a :href="detail.urlTemplate" target="_blank" rel="noreferrer">Descargar plantilla</a>
              </div>

              <div v-if="uploadingIds[detail.id]" class="modern-attachment-step__uploading">
                <AppIcon icon="sync-alt" class="modern-attachment-step__spin" />
                <span>Cargando archivo...</span>
              </div>

              <div v-else-if="detail.enrolAttachment?.urlAttachment" class="modern-attachment-step__fileRow">
                <div class="modern-attachment-step__fileInfo">
                  <a :href="detail.enrolAttachment.urlAttachment" target="_blank" rel="noreferrer">{{ attachmentFileName(detail) }}</a>
                  <p>{{ attachmentSecondary(detail) }}</p>
                </div>

                <div class="modern-attachment-step__fileActions">
                  <a :href="detail.enrolAttachment.urlAttachment" target="_blank" rel="noreferrer" class="modern-attachment-step__iconAction" title="Ver documento">
                    <AppIcon icon="eye" />
                  </a>

                  <button v-if="canReplaceAttachment(detail)" type="button" class="modern-attachment-step__iconAction" title="Reemplazar archivo" @click="triggerFilePicker(detail.id)">
                    <AppIcon icon="redo" />
                  </button>

                  <button
                    v-if="canDeleteAttachment(detail)"
                    type="button"
                    class="modern-attachment-step__iconAction modern-attachment-step__iconAction--danger"
                    title="Eliminar archivo"
                    @click="openDelete(detail)"
                  >
                    <AppIcon icon="times" />
                  </button>
                </div>
              </div>

              <button
                v-else
                type="button"
                :class="[
                  'modern-attachment-step__dropzone',
                  {
                    'is-dragging': draggedDetailId === detail.id,
                    'is-disabled': uploadDisabled,
                  },
                ]"
                :disabled="uploadDisabled"
                @click="triggerFilePicker(detail.id)"
                @dragover.prevent="onDragOver(detail.id)"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onDrop($event, detail)"
              >
                <div class="modern-attachment-step__dropzoneIcon">
                  <AppIcon icon="upload" />
                </div>

                <div>
                  <p>
                    Arrastra tu archivo aquí o
                    <span>haz clic para seleccionar</span>
                  </p>
                  <small>{{ acceptedFormatsLabel(detail) }} · Máx. {{ maxFileSize(detail) }}MB</small>
                </div>
              </button>

              <input :id="`attachment-input-${detail.id}`" class="d-none" type="file" :accept="acceptedFormats(detail).join(',')" @change="handleFileInputChange($event, detail)" />

              <div v-if="detail.enrolAttachment?.isAccept === 0" class="modern-attachment-step__note modern-attachment-step__note--danger">
                <AppIcon icon="times-circle" />
                <span>Este soporte fue rechazado. Puedes reemplazarlo con un archivo corregido.</span>
              </div>

              <div v-else-if="detail.enrolAttachment?.isAccept === null && detail.enrolAttachment?.urlAttachment" class="modern-attachment-step__note modern-attachment-step__note--info">
                <AppIcon icon="clock" />
                <span>El archivo fue cargado y está pendiente de validación administrativa.</span>
              </div>
            </article>
          </div>

          <section class="modern-attachment-step__infoBox">
            <div class="modern-attachment-step__infoIcon">
              <AppIcon icon="info-circle" />
            </div>

            <div>
              <strong>Recomendaciones importantes:</strong>

              <ul>
                <li>Asegúrate de que los documentos sean legibles y estén completos.</li>
                <li>Los archivos PDF deben estar en orientación vertical.</li>
                <li>Las fotografías deben tener buena iluminación y fondo blanco.</li>
                <li>Una vez aprobados, los documentos no podrán ser modificados.</li>
              </ul>
            </div>
          </section>

          <section class="modern-attachment-step__summary">
            <div :class="['modern-attachment-step__summaryIcon', `modern-attachment-step__summaryIcon--${summaryStatus.tone}`]">
              <AppIcon :icon="summaryStatus.icon" />
            </div>

            <div>
              <strong>{{ summaryMessage }}</strong>
              <p>{{ uploadedRequiredCount }}/{{ totalRequiredCount }} documentos obligatorios · {{ uploadedOptionalCount }} opcionales cargados</p>
            </div>
          </section>
        </template>

        <AppEmptyResponse v-else title="No hay requisitos configurados" :show-image="false" subtitle="Aún no se han definido documentos para este paso." size="xs" />
      </template>
    </AppCard>

    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal
        v-if="modalDelete"
        :entity="currentDetailForDelete?.enrolAttachment?.title ?? currentDetailForDelete?.title"
        @confirmDelete="confirmDelete()"
        @close="modalDelete = false"
      />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, type Ref } from 'vue';
import linkifyHtml from 'linkify-html';
import { useRoute } from 'vue-router';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import RegistrationModernHelpAccordion from './RegistrationModernHelpAccordion.vue';
import { DetailDto, StepTypeAdjuntoDto } from '../dtos/stepTypeAdjunto.dto';
import { CreateOrUpdateStepTypeAttachmentService } from '../services/createOrUpdateStepTypeAttachment.service';
import { DeleteFileTypeAttachmentService } from '../services/deleteFileTypeAttachment.service';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';

const createOrUpdateStepTypeAttachmentService = new CreateOrUpdateStepTypeAttachmentService();
const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const deleteFileTypeAttachmentService = new DeleteFileTypeAttachmentService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();

export default defineComponent({
  name: 'RegistrationModernAttachmentStep',
  components: {
    AppCard,
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppIcon,
    AppLoading,
    AppModal,
    RegistrationModernHelpAccordion,
  },
  props: {
    embedded: {
      type: Boolean,
      default: true,
    },
    videoUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const route = useRoute();
    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const step: Ref<StepTypeAdjuntoDto | null> = ref(null);
    const loadingItems = ref(false);
    const loading = ref(true);
    const modalDelete = ref(false);
    const approvedOrInReviewStep = ref(false);
    const allFilesApproved = ref(false);
    const incompleteStep = ref(false);
    const tutorialDescription = ref('');
    const tutorialVideoUrl = ref('');
    const resolvedTutorialVideoUrl = computed(() => props.videoUrl || tutorialVideoUrl.value);
    const draggedDetailId = ref<number | null>(null);

    const convocationEnrolId = ref(0);
    const convocationId = ref(0);
    const stepId = ref(0);

    const currentDetailForDelete: Ref<DetailDto | null> = ref(null);
    const uploadingIds = reactive<Record<number, boolean>>({});

    const parseRouteId = (param: unknown) => Number.parseInt(String(param ?? 0), 10) || 0;

    const normalizeText = (detail: DetailDto) => `${detail.title} ${detail.description ?? ''}`.toLowerCase();

    const isRequiredDetail = (detail: DetailDto) => !/motivaci|opcional/.test(normalizeText(detail));

    const acceptedFormats = (detail: DetailDto) => {
      const text = normalizeText(detail);

      if (/foto|fotograf/.test(text)) return ['.jpg', '.jpeg', '.png'];
      if (/identidad|cedula|cédula/.test(text)) return ['.pdf', '.jpg', '.jpeg', '.png'];
      if (/motivaci/.test(text)) return ['.pdf', '.doc', '.docx'];

      return ['.pdf'];
    };

    const maxFileSize = (detail: DetailDto) => {
      const text = normalizeText(detail);

      if (/foto|fotograf/.test(text)) return 2;
      if (/motivaci/.test(text)) return 3;

      return 5;
    };

    const acceptedFormatsLabel = (detail: DetailDto) => acceptedFormats(detail).join(', ').toUpperCase();

    const requirementMeta = (detail: DetailDto) => {
      const text = normalizeText(detail);

      if (/foto|fotograf/.test(text)) return { icon: 'image', tone: 'success' };
      if (/identidad|cedula|cédula/.test(text)) return { icon: 'id-card', tone: 'info' };
      if (/médic|medic/.test(text)) return { icon: 'file-medical', tone: 'neutral' };

      return { icon: 'file-alt', tone: 'neutral' };
    };

    const getDetailStep = async () => {
      loadingItems.value = true;

      step.value = await getConvocationStepWithDetailService.run({
        id: stepId.value,
        convocationEnrolId: convocationEnrolId.value,
      });

      incompleteStep.value = false;

      if (step.value?.requiresApproval) {
        for (const detail of step.value.detail) {
          if (detail.enrolAttachment === null || detail.enrolAttachment?.isAccept === 0) {
            incompleteStep.value = true;
            break;
          }
        }
      }

      allFilesApproved.value = !!step.value?.detail?.length && step.value.detail.every((detail: any) => detail.enrolAttachment?.isAccept === 1);
      loadingItems.value = false;
    };

    const uploadedRequiredCount = computed(() => step.value?.detail?.filter((detail) => isRequiredDetail(detail) && !!detail.enrolAttachment)?.length ?? 0);
    const uploadedOptionalCount = computed(() => step.value?.detail?.filter((detail) => !isRequiredDetail(detail) && !!detail.enrolAttachment)?.length ?? 0);
    const totalRequiredCount = computed(() => step.value?.detail?.filter((detail) => isRequiredDetail(detail)).length ?? 0);

    const progressPercentage = computed(() => {
      if (!totalRequiredCount.value) return 0;

      return Math.round((uploadedRequiredCount.value / totalRequiredCount.value) * 100);
    });

    const summaryStatus = computed(() => {
      if (!totalRequiredCount.value) return { icon: 'info-circle', tone: 'neutral' };
      if (allFilesApproved.value || uploadedRequiredCount.value === totalRequiredCount.value) return { icon: 'check-circle', tone: 'success' };

      return { icon: 'exclamation-triangle', tone: 'warning' };
    });

    const summaryMessage = computed(() => {
      if (!totalRequiredCount.value) return 'No hay documentos obligatorios configurados.';
      if (uploadedRequiredCount.value === totalRequiredCount.value) return 'Todos los documentos obligatorios están cargados';

      const pending = totalRequiredCount.value - uploadedRequiredCount.value;
      return `Faltan ${pending} documento${pending === 1 ? '' : 's'} obligatorio${pending === 1 ? '' : 's'}`;
    });

    const defaultTutorialDescription =
      'Adjunta los documentos solicitados para validar tu información.<br /><br />' +
      '• Puedes arrastrar y soltar archivos o hacer clic para seleccionarlos<br />' +
      '• Los documentos obligatorios están marcados con una etiqueta roja<br />' +
      '• Formatos aceptados: PDF, JPG, PNG (máximo 5MB)<br />' +
      '• Asegúrate de que los documentos sean legibles y estén completos<br />' +
      '• Una vez aprobados, no podrán ser modificados';

    const resolvedTutorialDescription = computed(() => String(tutorialDescription.value || defaultTutorialDescription).replace(/\n/g, '<br />'));
    const uploadDisabled = computed(() => approvedOrInReviewStep.value && !incompleteStep.value);

    const statusMeta = (detail: DetailDto) => {
      const status =
        detail.enrolAttachment === null
          ? 'Pendiente'
          : !step.value?.requiresApproval
          ? 'Finalizado'
          : detail.enrolAttachment.isAccept === null
          ? 'En revisión'
          : detail.enrolAttachment.isAccept === 0
          ? 'Rechazado'
          : 'Aprobado';

      if (status === 'Aprobado' || status === 'Finalizado') {
        return {
          label: status === 'Finalizado' ? 'Aprobado' : status,
          icon: 'check-circle',
          tone: 'success',
        };
      }

      if (status === 'Rechazado') {
        return { label: status, icon: 'times-circle', tone: 'danger' };
      }

      if (status === 'En revisión') {
        return { label: status, icon: 'clock', tone: 'info' };
      }

      return { label: status, icon: 'exclamation-circle', tone: 'warning' };
    };

    const triggerFilePicker = (detailId: number) => {
      if (uploadDisabled.value) return;

      const input = document.getElementById(`attachment-input-${detailId}`) as HTMLInputElement | null;
      input?.click();
    };

    const validateFile = (detail: DetailDto, file: File) => {
      const allowedFormats = acceptedFormats(detail);
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;

      if (!allowedFormats.includes(fileExtension)) {
        window.alert(`Formato no válido. Formatos aceptados: ${allowedFormats.join(', ')}`);
        return false;
      }

      if (file.size > maxFileSize(detail) * 1024 * 1024) {
        window.alert(`El archivo excede el tamaño máximo de ${maxFileSize(detail)}MB`);
        return false;
      }

      return true;
    };

    const uploadAttachment = async (detail: DetailDto, file: File) => {
      uploadingIds[detail.id] = true;

      try {
        await createOrUpdateStepTypeAttachmentService.run({
          convocationEnrolId: convocationEnrolId.value,
          convocationStepId: stepId.value,
          requirementId: detail.id,
          file,
        });

        await getDetailStep();
        emit('refresh');
      } catch (error) {
        console.log(error);
      }

      uploadingIds[detail.id] = false;
    };

    const handleFileInputChange = async (event: Event, detail: DetailDto) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) return;

      if (validateFile(detail, file)) {
        await uploadAttachment(detail, file);
      }

      input.value = '';
    };

    const onDragOver = (detailId: number) => {
      if (uploadDisabled.value) return;

      draggedDetailId.value = detailId;
    };

    const onDragLeave = () => {
      draggedDetailId.value = null;
    };

    const onDrop = async (event: DragEvent, detail: DetailDto) => {
      draggedDetailId.value = null;

      if (uploadDisabled.value) return;

      const file = event.dataTransfer?.files?.[0];
      if (!file) return;

      if (validateFile(detail, file)) {
        await uploadAttachment(detail, file);
      }
    };

    const canDeleteAttachment = (detail: DetailDto) => !!detail.enrolAttachment?.urlAttachment && detail.enrolAttachment?.isAccept !== 1;

    const canReplaceAttachment = (detail: DetailDto) => !uploadDisabled.value && !!detail.enrolAttachment?.urlAttachment && detail.enrolAttachment?.isAccept !== 1;

    const openDelete = (detail: DetailDto) => {
      currentDetailForDelete.value = detail;
      modalDelete.value = true;
    };

    const confirmDelete = async () => {
      if (!currentDetailForDelete.value?.enrolAttachment?.id) return;

      await deleteFileTypeAttachmentService.run(currentDetailForDelete.value.enrolAttachment.id);
      modalDelete.value = false;
      await getDetailStep();
      emit('refresh');
    };

    const nameFromUrl = (url: string) => {
      try {
        const clean = url.split('?')[0].split('#')[0];
        return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1) || 'archivo');
      } catch {
        return 'archivo';
      }
    };

    const fileExtensionLabel = (detail: DetailDto) => {
      const fileName = attachmentFileName(detail);
      const extension = fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : null;

      return extension || 'Archivo';
    };

    const formatDate = (value?: string) => {
      if (!value) return '';

      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value));
    };

    const attachmentFileName = (detail: DetailDto) => detail.enrolAttachment?.title ?? nameFromUrl(detail.enrolAttachment?.urlAttachment ?? '');

    const attachmentSecondary = (detail: DetailDto) => {
      const uploadDate = formatDate(detail.enrolAttachment?.createdAt ?? detail.enrolAttachment?.updatedAt);

      if (uploadDate) return `${fileExtensionLabel(detail)} · Subido el ${uploadDate}`;

      return `${fileExtensionLabel(detail)} · Archivo cargado`;
    };

    onMounted(async () => {
      try {
        convocationEnrolId.value = parseRouteId(route.params.convocationEnrollId ?? route.query.convocationEnrollId);
        convocationId.value = parseRouteId(route.params.convocationId ?? route.query.convocationId);
        stepId.value = parseRouteId(route.params.stepId ?? route.query.stepId);

        const response = await getConvocationWithStepsService.run(convocationId.value, {
          convocationEnrolId: convocationEnrolId.value,
          isAdmin: isAdmin.value,
        });

        const stepAux = response.steps.find((item: any) => item.id == stepId.value);
        approvedOrInReviewStep.value = !!((stepAux?.isApproved == 1 && stepAux?.requiresApproval == 1) || (stepAux?.isApproved == null && stepAux?.requiresApproval == 1));
        tutorialDescription.value = stepAux?.description ?? '';
        tutorialVideoUrl.value = stepAux?.urlVideoConvocationStep ?? '';

        await getDetailStep();
      } catch (error) {
        console.log(error);
      }

      loading.value = false;
    });

    return {
      acceptedFormats,
      acceptedFormatsLabel,
      allFilesApproved,
      attachmentFileName,
      attachmentSecondary,
      canDeleteAttachment,
      canReplaceAttachment,
      confirmDelete,
      currentDetailForDelete,
      draggedDetailId,
      handleFileInputChange,
      incompleteStep,
      isRequiredDetail,
      linkifyHtml,
      loading,
      loadingItems,
      maxFileSize,
      modalDelete,
      onDragLeave,
      onDragOver,
      onDrop,
      openDelete,
      progressPercentage,
      requirementMeta,
      statusMeta,
      step,
      summaryMessage,
      summaryStatus,
      totalRequiredCount,
      triggerFilePicker,
      resolvedTutorialDescription,
      resolvedTutorialVideoUrl,
      tutorialDescription,
      tutorialVideoUrl,
      uploadedOptionalCount,
      uploadedRequiredCount,
      uploadDisabled,
      uploadingIds,
    };
  },
});
</script>

<style scoped>
.modern-attachment-step {
  display: flex;
  flex-direction: column;
}

.modern-attachment-step__shell :deep(.content) {
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: none;
}

.modern-attachment-step__shell :deep(.o-card-body) {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  padding: 1.35rem 1.5rem 1.5rem;
}

.modern-attachment-step__help :deep(.o-accordion-item) {
  border: none;
  box-shadow: none;
  background: transparent;
}

.modern-attachment-step__help :deep(.o-accordion-button) {
  padding: 0;
  background: transparent;
}

.modern-attachment-step__help :deep(.o-accordion-button:not(.collapsed)) {
  padding: 0;
}

.modern-attachment-step__help :deep(.o-accordion-button::after) {
  margin-right: 1.2rem;
  border-color: #2563eb;
}

.modern-attachment-step__help :deep(.o-accordion-body) {
  padding: 0;
}

.modern-attachment-step__helpHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem;
  color: #1e3a8a;
  background: transparent;
}

.modern-attachment-step__helpTitleBlock {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modern-attachment-step__helpIcon {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #dbeafe;
  color: #2563eb;
  flex-shrink: 0;
}

.modern-attachment-step__helpHeader h3,
.modern-attachment-step__header h2 {
  margin: 0;
  font-weight: 700;
  font-size: 0.96rem;
}

.modern-attachment-step__helpHeader p,
.modern-attachment-step__header p,
.modern-attachment-step__identityText p,
.modern-attachment-step__summary p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.82rem;
}

.modern-attachment-step__helpBody {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1.2rem 1.2rem;
}

.modern-attachment-step__helpCopy,
.modern-attachment-step__videoPreview,
.modern-attachment-step__videoPlayer {
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.modern-attachment-step__helpCopy {
  padding: 1rem;
  color: #1e3a8a;
  font-size: 0.95rem;
  line-height: 1.7;
}

.modern-attachment-step__videoPreview,
.modern-attachment-step__videoPlayer {
  width: 100%;
}

.modern-attachment-step__videoPreview {
  position: relative;
  aspect-ratio: 16 / 9;
}

.modern-attachment-step__videoPreview img,
.modern-attachment-step__videoPlayer iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
}

.modern-attachment-step__videoFallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  font-weight: 700;
}

.modern-attachment-step__videoOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.18);
}

.modern-attachment-step__videoPlay {
  width: 4rem;
  height: 4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font-size: 1.5rem;
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.35);
}

.modern-attachment-step__videoPlayer {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
}

.modern-attachment-step__closeVideo {
  padding: 0.85rem 1rem;
  color: #2563eb;
  text-align: left;
  background: #eff6ff;
  font-weight: 600;
}

.modern-attachment-step__header,
.modern-attachment-step__summary {
  display: flex;
  align-items: center;

  gap: 1rem;
}

.modern-attachment-step__header {
  padding: 0;
}

.modern-attachment-step__infoBox,
.modern-attachment-step__summary {
  border-radius: 18px;
  box-shadow: none;
}

.modern-attachment-step__infoBox {
  border: 1px solid #bfdbfe;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  padding: 1rem 1.15rem;
}

.modern-attachment-step__summary {
  padding: 1rem 1.1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.modern-attachment-step__counter {
  color: #111827;
  font-size: 0.92rem;
  font-weight: 700;
}

.modern-attachment-step__progressTrack {
  width: 100%;
  height: 0.38rem;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.modern-attachment-step__progressBar {
  height: 100%;
  border-radius: inherit;
  background: #111827;
  transition: width 0.3s ease;
}

.modern-attachment-step__requirements {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modern-attachment-step__requirement {
  padding: 1.15rem;
  border: 1px solid #e5e7eb;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
}

.modern-attachment-step__requirement--success {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}

.modern-attachment-step__requirement--info {
  border-color: #bfdbfe;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
}

.modern-attachment-step__requirement--danger {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%);
}

.modern-attachment-step__requirement--warning {
  border-color: #e5e7eb;
  background: #ffffff;
}

.modern-attachment-step__requirementHeader,
.modern-attachment-step__identity,
.modern-attachment-step__badges,
.modern-attachment-step__fileRow,
.modern-attachment-step__fileActions,
.modern-attachment-step__infoBox {
  display: flex;
}

.modern-attachment-step__requirementHeader {
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modern-attachment-step__identity {
  align-items: flex-start;
  gap: 0.8rem;
  min-width: 0;
}

.modern-attachment-step__typeIcon {
  width: 2.9rem;
  height: 2.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.modern-attachment-step__typeIcon--success {
  background: #dcfce7;
  color: #15803d;
}

.modern-attachment-step__typeIcon--info {
  background: #dbeafe;
  color: #2563eb;
}

.modern-attachment-step__typeIcon--neutral {
  background: #ede9fe;
  color: #6d28d9;
}

.modern-attachment-step__identityText {
  min-width: 0;
}

.modern-attachment-step__identityText h3 {
  margin: 0;
  color: #111827;
  font-size: 1.15rem;
  font-weight: 700;
}

.modern-attachment-step__badges {
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.modern-attachment-step__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.modern-attachment-step__badge--required {
  background: #fee2e2;
  color: #dc2626;
}

.modern-attachment-step__badge--success {
  background: #dcfce7;
  color: #15803d;
}

.modern-attachment-step__badge--info {
  background: #dbeafe;
  color: #2563eb;
}

.modern-attachment-step__badge--warning {
  background: #ffedd5;
  color: #ea580c;
}

.modern-attachment-step__badge--danger {
  background: #fee2e2;
  color: #dc2626;
}

.modern-attachment-step__templateRow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.9rem;
  color: #2563eb;
  font-size: 0.88rem;
  font-weight: 600;
}

.modern-attachment-step__uploading,
.modern-attachment-step__note {
  margin-top: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.modern-attachment-step__uploading {
  background: #eff6ff;
  color: #1d4ed8;
}

.modern-attachment-step__spin {
  animation: spin 1s linear infinite;
}

.modern-attachment-step__fileRow,
.modern-attachment-step__dropzone {
  margin-top: 0.95rem;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
}

.modern-attachment-step__fileRow {
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
}

.modern-attachment-step__fileInfo {
  min-width: 0;
}

.modern-attachment-step__fileInfo a {
  display: block;
  color: #111827;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modern-attachment-step__fileInfo p {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.76rem;
}

.modern-attachment-step__fileActions {
  align-items: center;
  gap: 0.35rem;
}

.modern-attachment-step__iconAction {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #64748b;
  background: transparent;
  transition: all 0.2s ease;
}

.modern-attachment-step__iconAction:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modern-attachment-step__iconAction--danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.modern-attachment-step__dropzone {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.7rem 1rem;
  text-align: center;
  border-style: dashed;
  transition: all 0.2s ease;
}

.modern-attachment-step__dropzone:hover,
.modern-attachment-step__dropzone.is-dragging {
  border-color: #3b82f6;
  background: #eff6ff;
}

.modern-attachment-step__dropzone.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.modern-attachment-step__dropzoneIcon {
  width: 2.55rem;
  height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e5e7eb;
  color: #111827;
}

.modern-attachment-step__dropzone p {
  margin: 0;
  color: #111827;
  font-size: 0.92rem;
  font-weight: 600;
}

.modern-attachment-step__dropzone span {
  color: #2563eb;
}

.modern-attachment-step__dropzone small {
  color: #6b7280;
}

.modern-attachment-step__note--danger {
  background: #fef2f2;
  color: #b91c1c;
}

.modern-attachment-step__note--info {
  background: #eff6ff;
  color: #1d4ed8;
}

.modern-attachment-step__infoBox {
  align-items: flex-start;
  gap: 0.9rem;
}

.modern-attachment-step__infoIcon,
.modern-attachment-step__summaryIcon {
  width: 2.55rem;
  height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  flex-shrink: 0;
}

.modern-attachment-step__infoIcon {
  background: #dbeafe;
  color: #2563eb;
}

.modern-attachment-step__infoBox strong,
.modern-attachment-step__summary strong {
  display: block;
  color: #111827;
}

.modern-attachment-step__infoBox ul {
  margin: 0.45rem 0 0;
  padding-left: 1rem;
  color: #1e3a8a;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.modern-attachment-step__summaryIcon--success {
  background: #dcfce7;
  color: #15803d;
}

.modern-attachment-step__summaryIcon--warning {
  background: #ffedd5;
  color: #ea580c;
}

.modern-attachment-step__summaryIcon--neutral {
  background: #e5e7eb;
  color: #475569;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .modern-attachment-step__shell :deep(.o-card-body) {
    padding: 1rem;
  }

  .modern-attachment-step__header,
  .modern-attachment-step__summary,
  .modern-attachment-step__requirementHeader {
    flex-direction: column;
    align-items: flex-start;
  }

  .modern-attachment-step__badges {
    justify-content: flex-start;
  }

  .modern-attachment-step__fileRow {
    flex-direction: column;
    align-items: flex-start;
  }

  .modern-attachment-step__fileActions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
