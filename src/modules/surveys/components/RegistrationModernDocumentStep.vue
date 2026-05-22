<template>
  <AppLoading v-if="loading" />

  <div v-else class="modern-document-step">
    <RegistrationModernHelpAccordion :description="resolvedTutorialDescription" :video-url="resolvedTutorialVideoUrl" :default-open="true" />

    <template v-if="step?.detail?.length">
      <section class="modern-document-step__header">
        <div class="modern-document-step__headerCopy">
          <div class="modern-document-step__titleRow">
            <h2>
              {{ currentDocument?.title || step?.title || 'Legalización de matrícula' }}
            </h2>

            <AppChipPrime v-if="currentDocument" :label="activeDocumentStatus.label" :icon="activeDocumentStatus.icon" :variant="activeDocumentStatus.variant" :removable="false" />
          </div>

          <p>{{ headerDescription }}</p>
        </div>

        <div class="modern-document-step__headerMeta">
          <div class="modern-document-step__summaryPill">
            <AppIcon icon="file-signature" />

            <div>
              <strong>{{ completedDocuments }}/{{ totalDocuments }}</strong>
              <span>documentos con avance</span>
            </div>
          </div>

          <AppChipPrime :label="summaryStatus.label" :icon="summaryStatus.icon" :variant="summaryStatus.variant" :removable="false" />
        </div>
      </section>

      <section v-if="totalDocuments > 1" class="modern-document-step__documentSelector">
        <div class="modern-document-step__sectionIntro">
          <div>
            <span class="modern-document-step__eyebrow">Documentos</span>
            <h3>Selecciona el documento a revisar</h3>
          </div>

          <span class="modern-document-step__counter">{{ totalDocuments }}</span>
        </div>

        <div class="modern-document-step__documentGrid">
          <button
            v-for="detail in step.detail"
            :key="detail.id"
            type="button"
            :class="['modern-document-step__documentButton', { 'is-active': currentDocument?.id === detail.id }]"
            @click="changeCurrentDocument(detail)"
          >
            <div class="modern-document-step__documentIdentity">
              <div :class="['modern-document-step__documentIcon', `modern-document-step__documentIcon--${statusMeta(detail).tone}`]">
                <AppIcon :icon="statusMeta(detail).icon" />
              </div>

              <div class="modern-document-step__documentInfo">
                <strong>{{ detail.title }}</strong>
                <span>{{ statusMeta(detail).description }}</span>
              </div>
            </div>

            <AppChipPrime :label="statusMeta(detail).label" :icon="statusMeta(detail).icon" :variant="statusMeta(detail).variant" :removable="false" />
          </button>
        </div>
      </section>

      <AppCard>
        <template #body>
          <section class="modern-document-step__viewerCard">
            <div class="modern-document-step__viewerHeader">
              <div class="modern-document-step__viewerIdentity">
                <div class="modern-document-step__viewerIcon">
                  <AppIcon icon="file-alt" />
                </div>

                <div>
                  <h3>{{ currentDocument?.title || 'Documento' }}</h3>
                  <p v-if="currentDocument?.description" class="modern-document-step__description" v-html="currentDocument.description"></p>
                  <p v-else class="modern-document-step__description">Revisa el PDF completo antes de continuar con la firma o la carga del documento final.</p>
                </div>
              </div>

              <div class="modern-document-step__viewerTools">
                <AppButton v-if="hasDocumentViewer" :href="documentViewerUrl" target="_blank" outlined>
                  <AppIcon icon="download" class="me-2" />
                  Descargar PDF
                </AppButton>

                <AppButton variant="secondary" outlined @click="expandedViewer = !expandedViewer">
                  <AppIcon :icon="expandedViewer ? 'compress' : 'expand'" class="me-2" />
                  {{ expandedViewer ? 'Contraer' : 'Expandir' }}
                </AppButton>
              </div>
            </div>

            <div v-if="hasDocumentViewer" :class="['modern-document-step__viewerShell', { 'is-expanded': expandedViewer }]">
              <iframe :key="documentViewerUrl" :src="documentViewerUrl" title="Documento de inscripción"></iframe>
            </div>

            <AppEmptyResponse
              v-else
              title="No hay un archivo disponible"
              subtitle="Este documento aún no tiene un archivo configurado para su visualización o el archivo base no fue generado."
              :show-image="false"
              size="xs"
            />
          </section>
        </template>
      </AppCard>

      <section v-if="statusBanner" :class="['modern-document-step__stateBox', `modern-document-step__stateBox--${statusBanner.tone}`]">
        <AppIcon :icon="statusBanner.icon" />
        <span>{{ statusBanner.text }}</span>
      </section>

      <AppCard>
        <template #body>
          <section class="modern-document-step__signatureSection">
            <div class="modern-document-step__sectionIntro">
              <div>
                <span class="modern-document-step__eyebrow">Firma</span>
                <h3>
                  {{ step?.electronicSignature ? 'Firma electrónica' : 'Subir documento firmado' }}
                </h3>
                <p>{{ signatureDescription }}</p>
              </div>

              <AppChipPrime
                :label="step?.electronicSignature ? 'Firma electrónica' : 'Firma manual'"
                :icon="step?.electronicSignature ? 'bolt' : 'upload'"
                :variant="step?.electronicSignature ? 'primary' : 'secondary'"
                :removable="false"
              />
            </div>

            <div class="modern-document-step__signaturePrimary">
              <div v-if="filteredSigners.length" class="modern-document-step__signersCompact">
                <AppAccordion v-slot="{ accordionId }" styleType="rounded">
                  <AppAccordionItem :accordion-id="accordionId">
                    <template #head>
                      <div class="modern-document-step__signersCompactHead">
                        <div>
                          <strong>Firmantes requeridos</strong>
                          <span>Completa solo este bloque si el documento necesita asignación previa.</span>
                        </div>

                        <AppChipPrime
                          :label="allowToSign ? 'Listo para continuar' : 'Pendiente por completar'"
                          :icon="allowToSign ? 'check-circle' : 'clock'"
                          :variant="allowToSign ? 'success' : 'warning'"
                          :removable="false"
                        />
                      </div>
                    </template>

                    <template #content>
                      <div class="modern-document-step__signerCompactList">
                        <article v-for="signer in filteredSigners" :key="signer.id" class="modern-document-step__signerCompactItem">
                          <div class="modern-document-step__signerIdentity">
                            <div class="modern-document-step__signerAvatar">
                              <AppIcon icon="user-circle" />
                            </div>

                            <div>
                              <strong>{{ signer.code }}</strong>
                              <p>{{ signer.description }}</p>
                            </div>
                          </div>

                          <div class="modern-document-step__signerCompactActions">
                            <AppChipPrime
                              :label="signer.assigned ? 'Asignado' : 'Pendiente'"
                              :icon="signer.assigned ? 'check-circle' : 'clock'"
                              :variant="signer.assigned ? 'success' : 'secondary'"
                              :removable="false"
                            />

                            <AppButton :disabled="Boolean(currentDocument?.enrolDocument?.isAccept) || approvedStep" variant="secondary" outlined @click="openModalSignDocument(signer)">
                              <AppIcon icon="file-signature" class="me-2" />
                              {{ signer.assigned ? 'Editar' : 'Asignar' }}
                            </AppButton>
                          </div>
                        </article>
                      </div>
                    </template>
                  </AppAccordionItem>
                </AppAccordion>
              </div>

              <div v-if="filteredSigners.length && !allowToSign" class="modern-document-step__stateBox modern-document-step__stateBox--warning">
                <AppIcon icon="exclamation-triangle" />
                <span>Debes completar la asignación de todos los firmantes antes de enviar el documento firmado.</span>
              </div>

              <div v-if="currentDocument?.enrolDocument?.urlSignedDocument" class="modern-document-step__stateBox modern-document-step__stateBox--success">
                <AppIcon icon="check-circle" />
                <span>Este documento ya fue firmado o cargado. Puedes revisarlo antes de continuar.</span>
              </div>

              <template v-if="filteredSigners.length && step?.electronicSignature">
                <div class="modern-document-step__signaturePanel">
                  <div class="modern-document-step__signaturePanelBody">
                    <strong>Ejecuta la firma del documento</strong>
                    <p>Cuando toda la información de firmantes esté completa, podrás ejecutar la firma electrónica sobre el documento actual.</p>
                  </div>

                  <div class="modern-document-step__signatureActions">
                    <AppButton :disabled="Boolean(currentDocument?.enrolDocument?.isAccept) || !allowToSign || approvedStep || loadingStep" @click="signDocument">
                      <AppIcon icon="file-signature" class="me-2" />
                      {{ loadingStep ? 'Firmando...' : 'Firmar documento' }}
                    </AppButton>

                    <AppButton v-if="currentDocument?.enrolDocument?.urlSignedDocument" :href="currentDocument.enrolDocument.urlSignedDocument" target="_blank" outlined>
                      <AppIcon icon="eye" class="me-2" />
                      Ver firmado
                    </AppButton>
                  </div>
                </div>
              </template>

              <template v-else-if="filteredSigners.length">
                <div class="modern-document-step__signaturePanel">
                  <div class="modern-document-step__signaturePanelBody">
                    <strong>Sube el PDF firmado</strong>
                    <p>Descarga el documento con firmantes, complétalo y súbelo nuevamente en PDF firmado para enviarlo a validación.</p>
                  </div>

                  <AppAttachmentDropzone
                    :model-value="signedDocumentDraft"
                    :certificate-url="currentDocument?.enrolDocument?.urlSignedDocument ?? ''"
                    :is-show-delete="Boolean(signedDocumentDraft)"
                    :is-title="'Documento firmado'"
                    :is-helper="'Solo PDF (máx. 10MB)'"
                    :is-accept="'.pdf'"
                    :is-max-size-m-b="10"
                    @update:modelValue="signedDocumentDraft = $event"
                    @delete="signedDocumentDraft = null"
                  />

                  <div class="modern-document-step__signatureActions">
                    <AppButton :disabled="!signedDocumentDraft || Boolean(currentDocument?.enrolDocument?.isAccept) || !allowToSign || approvedStep || loadingStep" @click="uploadSignedDocument">
                      <AppIcon icon="upload" class="me-2" />
                      {{ loadingStep ? 'Enviando...' : 'Subir documento firmado' }}
                    </AppButton>

                    <AppButton v-if="currentDocument?.enrolDocument?.urlSignedDocument" :href="currentDocument.enrolDocument.urlSignedDocument" target="_blank" outlined>
                      <AppIcon icon="eye" class="me-2" />
                      Ver archivo
                    </AppButton>
                  </div>
                </div>
              </template>

              <div v-else class="modern-document-step__stateBox modern-document-step__stateBox--info">
                <AppIcon icon="info-circle" />
                <span>Revisa el documento y descárgalo si necesitas una copia. No se requieren firmas adicionales.</span>
              </div>

              <div class="modern-document-step__summaryCard">
                <div class="modern-document-step__summaryCardIcon">
                  <AppIcon icon="info-circle" />
                </div>

                <div>
                  <strong>Recomendaciones importantes</strong>

                  <ul>
                    <li v-for="item in recommendationItems" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </template>
      </AppCard>
    </template>

    <AppCard v-else>
      <template #body>
        <AppEmptyResponse title="No hay documentos configurados" subtitle="Este paso aún no tiene documentos asociados." :show-image="false" size="xs" />
      </template>
    </AppCard>

    <AppModal v-model="modalSignDocument" :size="'lg'">
      <SignDocument v-if="modalSignDocument && currentSigner" :data="currentSigner" @close="closeModalSignDocument" />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, type Ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppChipPrime from '../../../shared/components/AppChipPrime.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import RegistrationModernHelpAccordion from './RegistrationModernHelpAccordion.vue';
import SignDocument from '../components/SignDocument.vue';
import { DetailDto, SignerDto, StepTypeDocumentoDto } from '../dtos/stepTypeDocumento.dto';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { SignDocumentService } from '../services/signDocument.service';
import { UploadFileStepDocumentService } from '../services/uploadFileStepDocument.service';

const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();
const uploadFileStepDocumentService = new UploadFileStepDocumentService();
const signDocumentService = new SignDocumentService();

export default defineComponent({
  name: 'RegistrationModernDocumentStep',
  components: {
    AppAccordion,
    AppAccordionItem,
    AppAttachmentDropzone,
    AppButton,
    AppCard,
    AppChipPrime,
    AppEmptyResponse,
    AppIcon,
    AppLoading,
    AppModal,
    RegistrationModernHelpAccordion,
    SignDocument,
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

    const step: Ref<StepTypeDocumentoDto | null> = ref(null);
    const loading = ref(true);
    const loadingStep = ref(false);
    const modalSignDocument = ref(false);
    const approvedStep = ref(false);
    const expandedViewer = ref(false);
    const tutorialDescription = ref('');
    const tutorialVideoUrl = ref('');
    const resolvedTutorialVideoUrl = computed(() => props.videoUrl || tutorialVideoUrl.value);

    const convocationEnrolId = ref(0);
    const convocationId = ref(0);
    const stepId = ref(0);
    const currentDocumentId = ref<number | null>(null);
    const currentSigner = ref<any | null>(null);
    const signedDocumentDraft = ref<File | null>(null);

    const parseRouteId = (param: unknown) => Number.parseInt(String(param ?? 0), 10) || 0;

    const currentDocument = computed(() => step.value?.detail?.find((detail) => detail.id === currentDocumentId.value) ?? step.value?.detail?.[0] ?? null);
    const filteredSigners = computed(() => currentDocument.value?.signers?.filter((signer) => !signer.isInstitutional) ?? []);
    const totalDocuments = computed(() => step.value?.detail?.length ?? 0);
    const completedDocuments = computed(() => step.value?.detail?.filter((detail) => documentStatus(detail) !== 'Pendiente').length ?? 0);
    const normalizeViewerUrl = (url: string) => {
      if (!url) return '';

      try {
        return url.includes(' ') ? encodeURI(url) : url;
      } catch {
        return url;
      }
    };
    const resolveDocumentViewerUrl = (detail: DetailDto | null) => {
      if (!detail) return '';

      const rawUrl =
        detail.enrolDocument?.urlSignedDocument ??
        detail.enrolDocument?.urlDocumentWithSigners ??
        detail.enrolDocument?.urlDocument ??
        (detail as any)?.urlAttachment ??
        (detail as any)?.filePdf?.file ??
        detail.file?.file ??
        '';

      return normalizeViewerUrl(rawUrl);
    };
    const documentViewerUrl = computed(() => resolveDocumentViewerUrl(currentDocument.value));
    const hasDocumentViewer = computed(() => Boolean(documentViewerUrl.value));
    const allowToSign = computed(() => filteredSigners.value.every((signer) => signer.assigned));

    const summaryStatus = computed(() => {
      if (!totalDocuments.value)
        return {
          label: 'Sin documentos',
          icon: 'info-circle',
          variant: 'secondary',
        };
      if (completedDocuments.value === totalDocuments.value)
        return {
          label: 'Con avance completo',
          icon: 'check-circle',
          variant: 'success',
        };
      if (completedDocuments.value > 0) return { label: 'En progreso', icon: 'clock', variant: 'warning' };

      return { label: 'Pendiente', icon: 'file-alt', variant: 'secondary' };
    });

    const documentStatus = (detail: DetailDto) => {
      if (detail.enrolDocument == null) return 'Pendiente';
      if (!step.value?.requiresApproval) return 'Finalizado';
      if (detail.enrolDocument.isAccept == null && !detail.enrolDocument.urlSignedDocument) return 'Pendiente';
      if (detail.enrolDocument.isAccept == null) return 'En revisión';
      if (detail.enrolDocument.isAccept === 0) return 'Rechazado';

      return 'Aprobado';
    };

    const statusMeta = (detail: DetailDto) => {
      const status = documentStatus(detail);

      if (status === 'Aprobado' || status === 'Finalizado') {
        return {
          label: status,
          icon: 'check-circle',
          variant: 'success',
          tone: 'success',
          description: 'Documento listo y validado.',
        };
      }

      if (status === 'Rechazado') {
        return {
          label: status,
          icon: 'times-circle',
          variant: 'danger',
          tone: 'danger',
          description: 'Se requieren ajustes antes de continuar.',
        };
      }

      if (status === 'En revisión') {
        return {
          label: status,
          icon: 'clock',
          variant: 'warning',
          tone: 'warning',
          description: 'El documento fue enviado a validación.',
        };
      }

      return {
        label: status,
        icon: 'file-signature',
        variant: 'secondary',
        tone: 'neutral',
        description: 'Aún falta completar la firma o la carga.',
      };
    };

    const activeDocumentStatus = computed(
      () =>
        (currentDocument.value && statusMeta(currentDocument.value)) || {
          label: 'Pendiente',
          icon: 'file-signature',
          variant: 'secondary',
          tone: 'neutral',
          description: 'Aún no hay avance en este documento.',
        }
    );

    const headerDescription = computed(() => {
      if (!currentDocument.value) {
        return 'Lee cuidadosamente el documento y complétalo antes de continuar con tu proceso.';
      }

      if (activeDocumentStatus.value.label === 'Aprobado' || activeDocumentStatus.value.label === 'Finalizado') {
        return 'Has completado este documento correctamente. Puedes descargar la versión final si necesitas conservar una copia.';
      }

      if (activeDocumentStatus.value.label === 'En revisión') {
        return 'Tu documento ya fue enviado a validación. Mientras tanto puedes revisar la versión generada o descargar una copia.';
      }

      if (activeDocumentStatus.value.label === 'Rechazado') {
        return 'Este documento requiere ajustes. Revisa el archivo, corrige la información necesaria y vuelve a enviarlo.';
      }

      if (filteredSigners.value.length && !allowToSign.value) {
        return 'Asigna primero los firmantes requeridos y luego completa la firma para continuar con la legalización.';
      }

      return step.value?.electronicSignature
        ? 'Lee el documento completo y ejecuta la firma electrónica cuando toda la información requerida esté lista.'
        : 'Lee el documento completo, descárgalo si lo necesitas y sube la versión firmada para continuar.';
    });

    const signatureDescription = computed(() =>
      step.value?.electronicSignature
        ? 'Cuando la asignación de firmantes esté completa, podrás ejecutar la firma electrónica sobre este documento.'
        : 'Descarga el PDF generado, fírmalo y vuelve a subir la versión final para enviarla a validación.'
    );

    const recommendationItems = computed(() => {
      const items = ['Verifica que el contenido del PDF corresponda al documento que vas a firmar.', 'Descarga una copia antes de enviarlo si necesitas conservar respaldo.'];

      if (filteredSigners.value.length) {
        items.push('Completa la asignación de firmantes antes de intentar enviar el documento.');
      }

      if (step.value?.electronicSignature) {
        items.push('La firma electrónica se ejecuta sobre el documento actualmente visible.');
      } else {
        items.push('El archivo firmado debe subirse en formato PDF y con toda la información legible.');
      }

      items.push('Una vez enviado, el documento puede quedar en revisión administrativa.');

      return items;
    });

    const statusBanner = computed(() => {
      if (!currentDocument.value) return null;

      if (filteredSigners.value.length && !allowToSign.value) {
        return {
          tone: 'warning',
          icon: 'exclamation-triangle',
          text: 'Debes completar la asignación de todos los firmantes para habilitar la firma o la carga del documento final.',
        };
      }

      if (currentDocument.value.enrolDocument?.isAccept === 0) {
        return {
          tone: 'danger',
          icon: 'times-circle',
          text: 'El documento fue rechazado. Revisa las observaciones correspondientes, corrige el archivo y vuelve a enviarlo.',
        };
      }

      if (currentDocument.value.enrolDocument?.urlSignedDocument && currentDocument.value.enrolDocument?.isAccept == null) {
        return {
          tone: 'info',
          icon: 'clock',
          text: 'El documento firmado ya fue enviado y está pendiente de validación administrativa.',
        };
      }

      if (currentDocument.value.enrolDocument?.isAccept === 1 || activeDocumentStatus.value.label === 'Finalizado') {
        return {
          tone: 'success',
          icon: 'check-circle',
          text: 'Este documento ya se encuentra completado y aprobado dentro del proceso.',
        };
      }

      return {
        tone: 'info',
        icon: 'info-circle',
        text: 'Revisa el documento completo antes de descargarlo, asignar firmantes o enviar la versión firmada.',
      };
    });

    const defaultTutorialDescription =
      'Lee cuidadosamente el documento de legalización de matrícula antes de continuar.<br /><br />' +
      '• Revisa el PDF completo y valida que la información sea correcta<br />' +
      '• Puedes descargar una copia del documento para conservarla<br />' +
      '• Si hay firmantes requeridos, asígnalos antes de enviar la firma<br />' +
      '• Si la firma es manual, descarga el documento, fírmalo y súbelo nuevamente en PDF<br />' +
      '• Una vez enviado, el documento quedará en validación administrativa';

    const resolvedTutorialDescription = computed(() => String(tutorialDescription.value || defaultTutorialDescription).replace(/\n/g, '<br />'));

    const getDetailStep = async (preferredDocumentId: number | null = currentDocumentId.value) => {
      step.value = await getConvocationStepWithDetailService.run({
        id: stepId.value,
        convocationEnrolId: convocationEnrolId.value,
      });

      const nextDocument = step.value?.detail?.find((detail) => detail.id === preferredDocumentId) ?? step.value?.detail?.[0] ?? null;
      currentDocumentId.value = nextDocument?.id ?? null;
    };

    const changeCurrentDocument = (document: DetailDto) => {
      currentDocumentId.value = document.id;
      signedDocumentDraft.value = null;
    };

    const openModalSignDocument = (currentData: SignerDto) => {
      const additionalFields = currentData.additionalFields ? currentData.additionalFields.split(',') : [];
      const dataForm: Record<string, null> = {};
      const dataV: Record<string, { required: typeof required }> = {};

      additionalFields.forEach((field) => {
        dataV[field] = { required };
        dataForm[field] = null;
      });

      currentSigner.value = {
        ...currentData,
        convocationEnrolDocumentId: currentDocument.value?.enrolDocument?.id ?? null,
        convocationEnrolId: convocationEnrolId.value,
        convocationStepId: stepId.value,
        documentId: currentDocument.value?.id,
        dataForm,
        dataV$: dataV,
      };

      modalSignDocument.value = true;
    };

    const closeModalSignDocument = async () => {
      await getDetailStep(currentDocument.value?.id ?? null);
      modalSignDocument.value = false;
      emit('refresh');
    };

    const uploadSignedDocument = async () => {
      if (!signedDocumentDraft.value || !currentDocument.value) return;

      loadingStep.value = true;

      try {
        await uploadFileStepDocumentService.run({
          id: currentDocument.value.enrolDocument?.id ?? null,
          convocationEnrolId: convocationEnrolId.value,
          convocationStepId: stepId.value,
          documentId: currentDocument.value.id,
          file: signedDocumentDraft.value,
        });

        signedDocumentDraft.value = null;
        await getDetailStep(currentDocument.value.id);
        emit('refresh');
      } catch (error) {
        console.log(error);
      }

      loadingStep.value = false;
    };

    const signDocument = async () => {
      if (!currentDocument.value) return;

      loadingStep.value = true;

      try {
        await signDocumentService.run({
          convocationEnrolId: convocationEnrolId.value,
          convocationStepId: stepId.value,
          documentId: currentDocument.value.id,
          convocationEnrolDocumentId: currentDocument.value.enrolDocument?.id ?? null,
        });

        await getDetailStep(currentDocument.value.id);
        emit('refresh');
      } catch (error) {
        console.log(error);
      }

      loadingStep.value = false;
    };

    watch(currentDocumentId, () => {
      signedDocumentDraft.value = null;
    });

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
        approvedStep.value = Boolean(stepAux?.requiresApproval === 1 && (stepAux?.isApproved === 1 || stepAux?.isApproved == null));
        tutorialDescription.value = stepAux?.description ?? '';
        tutorialVideoUrl.value = stepAux?.urlVideoConvocationStep ?? '';

        await getDetailStep();
      } catch (error) {
        console.log(error);
      }

      loading.value = false;
    });

    return {
      activeDocumentStatus,
      allowToSign,
      approvedStep,
      changeCurrentDocument,
      closeModalSignDocument,
      completedDocuments,
      currentDocument,
      currentSigner,
      documentViewerUrl,
      expandedViewer,
      filteredSigners,
      hasDocumentViewer,
      headerDescription,
      loading,
      loadingStep,
      modalSignDocument,
      openModalSignDocument,
      recommendationItems,
      signDocument,
      signatureDescription,
      signedDocumentDraft,
      statusBanner,
      statusMeta,
      step,
      summaryStatus,
      totalDocuments,
      resolvedTutorialDescription,
      resolvedTutorialVideoUrl,
      tutorialDescription,
      tutorialVideoUrl,
      uploadSignedDocument,
    };
  },
});
</script>

<style scoped>
.modern-document-step {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

.modern-document-step__help :deep(.o-accordion-item) {
  border: none;
  box-shadow: none;
  background: transparent;
}

.modern-document-step__help :deep(.o-accordion-button) {
  padding: 0;
  background: transparent;
}

.modern-document-step__help :deep(.o-accordion-button:not(.collapsed)) {
  padding: 0;
}

.modern-document-step__help :deep(.o-accordion-button::after) {
  margin-right: 1.2rem;
  border-color: #2563eb;
}

.modern-document-step__help :deep(.o-accordion-body) {
  padding: 0;
}

.modern-document-step__helpHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem;
  color: #1e3a8a;
  background: transparent;
}

.modern-document-step__helpTitleBlock {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modern-document-step__helpIcon {
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

.modern-document-step__helpHeader h3,
.modern-document-step__header h2,
.modern-document-step__sectionIntro h3,
.modern-document-step__viewerHeader h3 {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.modern-document-step__helpHeader h3 {
  font-size: 0.96rem;
}

.modern-document-step__helpHeader p,
.modern-document-step__header p,
.modern-document-step__sectionIntro p,
.modern-document-step__description,
.modern-document-step__documentInfo span,
.modern-document-step__accordionHead span,
.modern-document-step__signersCompactHead span,
.modern-document-step__signerIdentity p,
.modern-document-step__summaryPill span,
.modern-document-step__signaturePanel p,
.modern-document-step__summaryCard li {
  margin: 0.2rem 0 0;
  color: #64748b;
}

.modern-document-step__helpHeader p {
  font-size: 0.82rem;
}

.modern-document-step__helpBody {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1.2rem 1.2rem;
}

.modern-document-step__helpCopy,
.modern-document-step__videoPreview,
.modern-document-step__videoPlayer {
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.modern-document-step__helpCopy {
  padding: 1rem;
  color: #1e3a8a;
  font-size: 0.95rem;
  line-height: 1.7;
}

.modern-document-step__videoPreview,
.modern-document-step__videoPlayer {
  width: 100%;
}

.modern-document-step__videoPreview {
  position: relative;
  aspect-ratio: 16 / 9;
}

.modern-document-step__videoPreview img,
.modern-document-step__videoPlayer iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
}

.modern-document-step__videoFallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  font-weight: 700;
}

.modern-document-step__videoOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.22);
}

.modern-document-step__videoPlay {
  width: 4rem;
  height: 4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 12px 35px rgba(37, 99, 235, 0.35);
}

.modern-document-step__videoPlay :deep(svg) {
  font-size: 1.6rem;
}

.modern-document-step__closeVideo {
  width: 100%;
  border: none;
  border-top: 1px solid #bfdbfe;
  padding: 0.85rem 1rem;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

.modern-document-step__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modern-document-step__headerCopy,
.modern-document-step__headerMeta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modern-document-step__headerCopy {
  flex: 1;
  min-width: 0;
}

.modern-document-step__titleRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modern-document-step__header h2 {
  font-size: 1.45rem;
  font-weight: 800;
}

.modern-document-step__summaryPill {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1e3a8a;
}

.modern-document-step__summaryPill strong,
.modern-document-step__summaryPill span {
  display: block;
}

.modern-document-step__summaryPill span {
  color: #64748b;
  font-size: 0.8rem;
}

.modern-document-step__sectionIntro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modern-document-step__eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1d4ed8;
  background: #dbeafe;
}

.modern-document-step__counter {
  min-width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 700;
}

.modern-document-step__documentSelector {
  padding: 1rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #f8fafc;
}

.modern-document-step__documentGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.85rem;
}

.modern-document-step__documentButton {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  text-align: left;
  transition: all 0.2s ease;
}

.modern-document-step__documentButton:hover,
.modern-document-step__documentButton.is-active {
  border-color: #93c5fd;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.08);
}

.modern-document-step__documentButton.is-active {
  background: #eff6ff;
}

.modern-document-step__documentIdentity,
.modern-document-step__viewerIdentity,
.modern-document-step__signerIdentity {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  min-width: 0;
}

.modern-document-step__documentIcon,
.modern-document-step__viewerIcon,
.modern-document-step__signerAvatar,
.modern-document-step__summaryCardIcon {
  width: 2.8rem;
  height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  flex-shrink: 0;
}

.modern-document-step__documentIcon--success {
  background: #dcfce7;
  color: #15803d;
}

.modern-document-step__documentIcon--warning {
  background: #fef3c7;
  color: #b45309;
}

.modern-document-step__documentIcon--danger {
  background: #fee2e2;
  color: #dc2626;
}

.modern-document-step__documentIcon--neutral,
.modern-document-step__viewerIcon,
.modern-document-step__signerAvatar,
.modern-document-step__summaryCardIcon {
  background: #dbeafe;
  color: #2563eb;
}

.modern-document-step__documentInfo,
.modern-document-step__viewerIdentity > div {
  min-width: 0;
}

.modern-document-step__documentInfo strong,
.modern-document-step__signerIdentity strong,
.modern-document-step__signaturePanel strong,
.modern-document-step__summaryCard strong {
  display: block;
  color: #0f172a;
}

.modern-document-step__viewerHeader,
.modern-document-step__viewerTools,
.modern-document-step__accordionHead,
.modern-document-step__signerHeader,
.modern-document-step__signerFooter,
.modern-document-step__signatureActions,
.modern-document-step__stateBox {
  display: flex;
}

.modern-document-step__viewerHeader,
.modern-document-step__accordionHead,
.modern-document-step__signerHeader {
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modern-document-step__viewerTools,
.modern-document-step__signerFooter,
.modern-document-step__signatureActions {
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modern-document-step__viewerShell {
  width: 100%;
  height: 38rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  overflow: hidden;
  background: #ffffff;
}

.modern-document-step__viewerShell.is-expanded {
  height: 58rem;
}

.modern-document-step__viewerShell iframe {
  width: 100%;
  height: 100%;
  min-height: inherit;
  border: none;
  background: #ffffff;
}

.modern-document-step__stateBox {
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  font-size: 0.92rem;
}

.modern-document-step__stateBox--warning {
  background: #fffbeb;
  color: #92400e;
}

.modern-document-step__stateBox--success {
  background: #f0fdf4;
  color: #166534;
}

.modern-document-step__stateBox--info {
  background: #eff6ff;
  color: #1d4ed8;
}

.modern-document-step__stateBox--danger {
  background: #fef2f2;
  color: #b91c1c;
}

.modern-document-step__signersSection,
.modern-document-step__signatureSection {
  display: flex;
  flex-direction: column;
}

.modern-document-step__signerGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.85rem;
}

.modern-document-step__signerIdentity p {
  margin-top: 0.25rem;
}

.modern-document-step__signatureLayout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
  gap: 1rem;
}

.modern-document-step__signaturePrimary {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.modern-document-step__signaturePanel,
.modern-document-step__summaryCard {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
}

.modern-document-step__signaturePanel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
}

.modern-document-step__summaryCard {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.modern-document-step__signersCompact :deep(.o-accordion-item) {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: none;
}

.modern-document-step__signersCompact :deep(.o-accordion-button) {
  padding: 1rem;
  background: #ffffff;
}

.modern-document-step__signersCompact :deep(.o-accordion-button:not(.collapsed)) {
  padding: 1rem;
  box-shadow: none;
}

.modern-document-step__signersCompact :deep(.o-accordion-body) {
  padding: 0 1rem 1rem;
}

.modern-document-step__signersCompactHead,
.modern-document-step__signerCompactActions {
  display: flex;
}

.modern-document-step__signersCompactHead {
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modern-document-step__signerCompactList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modern-document-step__signerCompactItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.modern-document-step__signerCompactActions {
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modern-document-step__summaryCard ul {
  margin: 0.75rem 0 0;
  padding-left: 1rem;
}

.modern-document-step__summaryCard li + li {
  margin-top: 0.45rem;
}

@media (max-width: 1024px) {
  .modern-document-step__signatureLayout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .modern-document-step__header,
  .modern-document-step__viewerHeader,
  .modern-document-step__sectionIntro,
  .modern-document-step__accordionHead,
  .modern-document-step__signerHeader {
    flex-direction: column;
  }

  .modern-document-step__viewerTools,
  .modern-document-step__signerFooter,
  .modern-document-step__signatureActions {
    width: 100%;
    justify-content: flex-start;
  }

  .modern-document-step__viewerShell {
    height: 30rem;
  }

  .modern-document-step__signersCompactHead,
  .modern-document-step__signerCompactItem {
    flex-direction: column;
  }

  .modern-document-step__signerCompactActions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
