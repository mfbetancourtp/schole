<template>
  <AppBaseList title="Postulación a Beca">
    <template #actions>
      <AppButton variant="light" nativeType="button" @click="goPrev">
        <AppIcon icon="arrow-left" class="sa-btn-icon-left" />
        {{ currentStep === 0 ? 'Volver al catálogo' : 'Anterior' }}
      </AppButton>
      <AppButton v-if="currentStep < steps.length - 1" variant="light" nativeType="button" @click="goNext">
        Continuar
        <AppIcon icon="arrow-right" class="sa-btn-icon-right" />
      </AppButton>
      <AppButton v-else variant="light" nativeType="button" :disabled="!truthDeclaration || isSubmitting" @click="submitApplication">
        <AppIcon v-if="isSubmitting" icon="circle-notch" class="sa-btn-icon-left sa-btn-spin" />
        {{ isSubmitting ? 'Enviando…' : 'Enviar Solicitud' }}
        <AppIcon v-if="!isSubmitting" icon="check" class="sa-btn-icon-right" />
      </AppButton>
    </template>

    <template #content>
      <!-- Page title bar -->
      <div class="sa-title-bar">
        <span class="sa-title-bar__icon">
          <AppIcon icon="graduation-cap" />
        </span>
        <div>
          <h2 class="sa-title-bar__title">Postulación a Beca</h2>
          <p class="sa-title-bar__subtitle">{{ scholarshipName }}</p>
        </div>
      </div>

      <!-- Horizontal Stepper -->
      <AppStepper v-model="currentStep">
        <template #header>
          <template v-for="(step, index) in steps" :key="step.key">
            <div
              class="sa-step-indicator"
              :class="{
                'sa-step-indicator--active': currentStep === index,
                'sa-step-indicator--done': currentStep > index,
              }"
              @click="currentStep > index && (currentStep = index)"
            >
              <div class="sa-step-circle">
                <AppIcon v-if="currentStep > index" icon="check" />
                <AppIcon v-else :icon="step.icon" />
              </div>
              <p class="sa-step-label">{{ step.name }}</p>
              <p class="sa-step-sub">{{ step.subtitle }}</p>
            </div>
            <div v-if="index < steps.length - 1" class="sa-step-line" :class="{ 'sa-step-line--done': currentStep > index }"></div>
          </template>
        </template>

        <template #items>
          <!-- STEP 0: Información Personal -->
          <div v-show="currentStep === 0" class="sa-step-body">
            <div class="sa-section-card sa-mb">
              <div class="sa-section-card__header">
                <span class="sa-section-card__icon sa-section-card__icon--blue"><AppIcon icon="user" /></span>
                <div>
                  <p class="sa-section-card__title">Datos Personales</p>
                  <p class="sa-section-card__subtitle">Información de contacto</p>
                </div>
              </div>
              <div class="sa-section-card__body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <AppFormField label="Nombre Completo">
                      <input class="form-control" :value="form.fullName" readonly />
                      <small class="sa-field-hint">Campo obtenido del sistema académico</small>
                    </AppFormField>
                  </div>
                  <div class="col-md-6">
                    <AppFormField label="Documento de Identidad">
                      <input class="form-control" :value="form.idDocument" readonly />
                      <small class="sa-field-hint">Campo obtenido del sistema académico</small>
                    </AppFormField>
                  </div>
                  <div class="col-md-6">
                    <AppFormField label="Correo Electrónico">
                      <input v-model="form.email" class="form-control" type="email" placeholder="correo@akademia.edu" />
                    </AppFormField>
                  </div>
                  <div class="col-md-6">
                    <AppFormField label="Teléfono de Contacto">
                      <input v-model="form.phone" class="form-control" placeholder="+57 300 123 4567" />
                    </AppFormField>
                  </div>
                  <div class="col-12">
                    <AppFormField label="Dirección de Residencia">
                      <input v-model="form.address" class="form-control" placeholder="Calle 123 #45-67, Bogotá" />
                    </AppFormField>
                  </div>
                </div>
              </div>
            </div>

            <div class="sa-section-card">
              <div class="sa-section-card__header">
                <span class="sa-section-card__icon sa-section-card__icon--indigo"><AppIcon icon="file-alt" /></span>
                <div>
                  <p class="sa-section-card__title">Carta de Motivación</p>
                  <p class="sa-section-card__subtitle">Explica por qué debes recibir esta beca</p>
                </div>
              </div>
              <div class="sa-section-card__body">
                <AppFormField label="Motivación y Expectativas" :formControl="v$.motivationLetter">
                  <textarea v-model="form.motivationLetter" class="form-control" rows="5" placeholder="Escribe aquí tu carta de motivación..." maxlength="2000"></textarea>
                </AppFormField>
              </div>
            </div>
          </div>

          <!-- STEP 1: Documentos -->
          <div v-show="currentStep === 1" class="sa-step-body">
            <div class="sa-section-card">
              <div class="sa-section-card__header">
                <span class="sa-section-card__icon sa-section-card__icon--blue"><AppIcon icon="folder-open" /></span>
                <div>
                  <p class="sa-section-card__title">Documentos Requeridos</p>
                  <p class="sa-section-card__subtitle">Adjunta los archivos necesarios para tu postulación</p>
                </div>
              </div>
              <div class="sa-section-card__body">
                <div v-if="requiredDocuments.length === 0" class="sa-docs-empty">No hay documentos requeridos para esta beca.</div>
                <div v-for="doc in requiredDocuments" :key="doc.id" class="sa-doc-field">
                  <AppFormField :label="doc.name">
                    <AppUploadFile v-model="docFiles[doc.id]" :input-id="`doc-${doc.id}`" />
                    <small v-if="doc.description" class="sa-field-hint">{{ doc.description }}</small>
                  </AppFormField>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: Revisión -->
          <div v-show="currentStep === 2" class="sa-step-body">
            <div class="sa-rv-header sa-mb">
              <h4 class="sa-rv-header__title">Revisión de Solicitud</h4>
              <p class="sa-rv-header__sub">Verifica que toda la información sea correcta antes de enviar</p>
            </div>

            <!-- Beca info -->
            <div class="sa-rv-card sa-rv-card--beca sa-mb">
              <div class="sa-rv-card__beca-top">
                <span class="sa-section-card__icon sa-section-card__icon--blue"><AppIcon icon="graduation-cap" /></span>
                <strong class="sa-rv-beca__name">{{ scholarshipName }}</strong>
              </div>
              <div class="sa-rv-beca__meta">
                <div>
                  <p class="sa-review__label">Tipo</p>
                  <p class="sa-review__value">
                    {{ scholarshipTypeLabel || 'Beca Universitaria' }}
                  </p>
                </div>
                <div>
                  <p class="sa-review__label">Beneficio</p>
                  <p class="sa-review__value">
                    {{ scholarshipCoverage || '—' }}
                  </p>
                </div>
                <div>
                  <p class="sa-review__label">Duración</p>
                  <p class="sa-review__value">
                    {{ benefitDuration ? `${benefitDuration} semestre${benefitDuration !== 1 ? 's' : ''}` : '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Información Personal -->
            <div class="sa-rv-card sa-mb">
              <div class="sa-rv-card__section-head">
                <AppIcon icon="user" class="sa-rv-sec-icon sa-rv-sec-icon--blue" />
                <span class="sa-rv-sec-title sa-rv-sec-title--blue">Información Personal</span>
              </div>
              <div class="sa-rv-card__body">
                <div class="row g-2">
                  <div class="col-md-6">
                    <p class="sa-review__label">Nombre Completo</p>
                    <p class="sa-review__value">{{ form.fullName }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="sa-review__label">Documento</p>
                    <p class="sa-review__value">{{ form.idDocument }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="sa-review__label">Email</p>
                    <p class="sa-review__value">{{ form.email }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="sa-review__label">Teléfono</p>
                    <p class="sa-review__value">{{ form.phone }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Carta de Motivación -->
            <div class="sa-rv-card sa-mb">
              <div class="sa-rv-card__section-head">
                <AppIcon icon="file-alt" class="sa-rv-sec-icon sa-rv-sec-icon--blue" />
                <span class="sa-rv-sec-title sa-rv-sec-title--blue">Carta de Motivación</span>
              </div>
              <div class="sa-rv-card__body">
                <p class="sa-rv-motivation">
                  {{ form.motivationLetter || '(Sin carta de motivación)' }}
                </p>
              </div>
            </div>

            <!-- Documentos Adjuntos -->
            <div class="sa-rv-card sa-mb">
              <div class="sa-rv-card__section-head">
                <AppIcon icon="upload" class="sa-rv-sec-icon sa-rv-sec-icon--blue" />
                <span class="sa-rv-sec-title sa-rv-sec-title--blue">Documentos Adjuntos</span>
              </div>
              <div class="sa-rv-doc-list">
                <div v-for="doc in docsList" :key="doc.key" class="sa-rv-doc-item">
                  <AppIcon icon="check-circle" class="sa-rv-doc-item__icon" :class="doc.file ? 'sa-rv-doc-item__icon--ok' : 'sa-rv-doc-item__icon--missing'" />
                  <span class="sa-rv-doc-item__name">{{ doc.label }}</span>
                  <span class="sa-rv-doc-item__size">{{ doc.file ? formatFileSize(doc.file.size) : 'No adjunto' }}</span>
                </div>
              </div>
            </div>

            <!-- Declaración de veracidad -->
            <div class="sa-truth-card sa-mb">
              <div class="sa-truth-card__head">
                <AppIcon icon="file-contract" class="sa-truth-card__icon" />
                <span class="sa-truth-card__title">Declaración de veracidad <span class="sa-truth-required">*</span></span>
              </div>
              <p class="sa-truth-card__text">
                Declaro bajo juramento que toda la información proporcionada en esta solicitud es verídica y completa. Entiendo que cualquier falsedad u omisión puede resultar en la descalificación
                inmediata de mi postulación o la revocación de la beca si ya ha sido otorgada. Acepto los términos y condiciones del programa de becas de Akademia University.
              </p>
              <label class="sa-truth-check">
                <input type="checkbox" v-model="truthDeclaration" class="sa-truth-check__input" />
                <span class="sa-truth-check__label">Acepto la declaración de veracidad</span>
              </label>
            </div>
          </div>
        </template>
      </AppStepper>

      <div v-if="currentStep === steps.length - 1 && showTruthWarning && !truthDeclaration" class="sa-truth-warning">
        <AppIcon icon="exclamation-triangle" class="sa-truth-warning__icon" />
        Acepta la declaración de veracidad para enviar
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useHeaderStore } from '../../../stores/header.store';
import { useUserStore } from '../../../stores/user';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppStepper from '../../../shared/components/Stepper/AppStepper.vue';
import { ToastService } from '../../../shared/services/toast.service';
import { ApplyScholarshipCatalogService } from '../services/applyScholarshipCatalog.service';
import { GetScholarshipApplicationInfoService } from '../services/getScholarshipApplicationInfo.service';
import { UploadScholarshipApplicationDocumentService } from '../services/uploadScholarshipApplicationDocument.service';
import { SubmitScholarshipApplicationService } from '../services/submitScholarshipApplication.service';
import type { ScholarshipApplicationRequiredDocumentDto } from '../dtos/scholarshipApplication.dto';

const toastService = new ToastService();
const applyService = new ApplyScholarshipCatalogService();
const applicationInfoService = new GetScholarshipApplicationInfoService();
const uploadDocumentService = new UploadScholarshipApplicationDocumentService();
const submitApplicationService = new SubmitScholarshipApplicationService();

export default defineComponent({
  name: 'ScholarshipApplication',
  components: {
    AppBaseList,
    AppIcon,
    AppButton,
    AppFormField,
    AppUploadFile,
    AppStepper,
  },

  setup() {
    useMeta({ title: 'Postulación a Beca' });

    const route = useRoute();
    const router = useRouter();

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = { name: 'Catálogo de Becas', url: '' };
    headerStore.moduleSubItem = { name: 'Postulación', url: '' };

    const scholarshipName = ref((route.query.name as string) || 'Beca');
    const scholarshipTypeLabel = ref((route.query.typeLabel as string) || '');
    const scholarshipCoverage = ref((route.query.coverage as string) || '');

    const steps = [
      {
        key: 'info',
        name: 'Información',
        subtitle: 'Datos personales',
        icon: 'user',
      },
      {
        key: 'docs',
        name: 'Documentos',
        subtitle: 'Archivos requeridos',
        icon: 'upload',
      },
      {
        key: 'review',
        name: 'Revisión',
        subtitle: 'Confirmar y enviar',
        icon: 'file-alt',
      },
    ];

    const userStore = useUserStore();

    const currentStep = ref(0);

    const form = reactive({
      fullName: '',
      idDocument: '',
      studentCode: '',
      email: '',
      phone: '',
      address: '',
      motivationLetter: '',
    });

    const v$ = useVuelidate({ motivationLetter: { required } }, form);

    const benefitDuration = ref<number | null>(null);
    const requiredDocuments = ref<ScholarshipApplicationRequiredDocumentDto[]>([]);
    const docFiles = ref<Record<number, File | null>>({});

    const attachedDocsCount = computed(() => Object.values(docFiles.value).filter(Boolean).length);

    const docsList = computed(() =>
      requiredDocuments.value.map((doc) => ({
        key: doc.id,
        label: doc.name,
        file: docFiles.value[doc.id] ?? null,
      }))
    );

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const truthDeclaration = ref(false);
    const showTruthWarning = ref(false);

    onMounted(async () => {
      const id = Number(route.query.id);
      if (!id) return;
      try {
        const response = await applicationInfoService.run(id);

        const people = response?.people;
        if (people) {
          form.fullName = `${people.names ?? ''} ${people.lastnames ?? ''}`.trim();
          form.idDocument = people.identification ?? '';
          form.email = people.email ?? '';
          form.phone = people.mobile ?? '';
          form.address = people.direction ?? '';
          form.studentCode = people.studentCode ?? '';
        }

        benefitDuration.value = response?.scholarship?.benefitDuration ?? null;

        const rawDocs = response?.scholarship?.typeScholarship?.requiredDocuments ?? [];
        const mapped: ScholarshipApplicationRequiredDocumentDto[] = rawDocs
          .filter((d) => d.scholarshipDocument)
          .map((d) => ({
            id: d.id,
            name: d.scholarshipDocument!.name ?? '',
            description: d.scholarshipDocument!.abjuntoType,
          }));
        requiredDocuments.value = mapped;
        docFiles.value = Object.fromEntries(mapped.map((d) => [d.id, null]));
      } catch {
        /* campos quedan vacíos */
      }
    });

    const goPrev = () => {
      if (currentStep.value > 0) currentStep.value--;
      else router.push({ name: 'studentWeldare.scholarshipCatalog' });
    };

    const goNext = async () => {
      if (currentStep.value === 0) {
        await v$.value.$validate();
        if (v$.value.$invalid) return;
      }
      if (currentStep.value === 1) {
        const missingDocs = requiredDocuments.value.some((doc) => !docFiles.value[doc.id]);
        if (missingDocs) {
          toastService.show('Debes adjuntar todos los documentos requeridos para continuar', 'warning');
          return;
        }
      }
      if (currentStep.value < steps.length - 1) currentStep.value++;
    };

    const isSubmitting = ref(false);

    const submitApplication = async () => {
      if (!truthDeclaration.value) {
        showTruthWarning.value = true;
        return;
      }
      isSubmitting.value = true;
      try {
        const peopleId = userStore.user?.people?.id;
        const scholarshipId = Number(route.query.id);

        // 1. Crear postulación con carta de motivación
        const applyResponse = await applyService.run(scholarshipId, form.motivationLetter, peopleId);
        const applicationId = applyResponse?.data?.id ?? applyResponse?.id;

        if (applicationId) {
          // 2. Subir documentos en paralelo
          const uploads = Object.entries(docFiles.value)
            .filter(([, file]) => file instanceof File)
            .map(([docId, file]) => uploadDocumentService.run(applicationId, file as File, Number(docId), peopleId));
          await Promise.allSettled(uploads);

          // 3. Confirmar declaración de veracidad y enviar
          await submitApplicationService.run(applicationId, true, peopleId);
        }

        toastService.show('¡Postulación enviada exitosamente! Recibirás notificación por correo.', 'success');
        router.push({ name: 'studentWeldare.scholarshipCatalog' });
      } catch {
        toastService.show('Error al enviar la postulación. Intenta nuevamente.', 'danger');
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      scholarshipName,
      scholarshipTypeLabel,
      scholarshipCoverage,
      benefitDuration,
      steps,
      currentStep,
      form,
      v$,
      requiredDocuments,
      docFiles,
      attachedDocsCount,
      docsList,
      formatFileSize,
      truthDeclaration,
      showTruthWarning,
      isSubmitting,
      goPrev,
      goNext,
      submitApplication,
    };
  },
});
</script>

<style scoped>
/* Title bar */
.sa-title-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.sa-title-bar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 22px;
  flex-shrink: 0;
}
.sa-title-bar__title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.sa-title-bar__subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Horizontal Step Indicators */
.sa-step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  cursor: default;
}
.sa-step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid #cbd5e1;
  background: #fff;
  color: #94a3b8;
  transition: all 0.25s;
}
.sa-step-indicator--active .sa-step-circle {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
.sa-step-indicator--done .sa-step-circle {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

.sa-step-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
}
.sa-step-indicator--active .sa-step-label {
  color: #2563eb;
}
.sa-step-indicator--done .sa-step-label {
  color: #1e293b;
}

.sa-step-sub {
  font-size: 10px;
  color: #cbd5e1;
  margin: 0;
  white-space: nowrap;
}
.sa-step-indicator--active .sa-step-sub {
  color: #2563eb;
}
.sa-step-indicator--done .sa-step-sub {
  color: #64748b;
}

.sa-step-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin-top: -24px;
  align-self: flex-start;
}
.sa-step-line--done {
  background: #16a34a;
}

/* Step body */
.sa-step-body {
  padding: 4px 0;
}
.sa-step-body__title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}
.sa-step-body__sub {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 20px;
}

/* Margin helper */
.sa-mb {
  margin-bottom: 16px;
}

/* Section Cards */
.sa-section-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.sa-section-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}
.sa-section-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 15px;
  flex-shrink: 0;
}
.sa-section-card__icon--blue {
  background: #eff6ff;
  color: #2563eb;
}
.sa-section-card__icon--teal {
  background: #f0fdfa;
  color: #0d9488;
}
.sa-section-card__icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.sa-section-card__title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.sa-section-card__subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}
.sa-section-card__body {
  padding: 16px 20px;
}

/* Dynamic doc fields */
.sa-doc-field {
  margin-bottom: 16px;
}
.sa-doc-field:last-child {
  margin-bottom: 0;
}
.sa-docs-empty {
  font-size: 13px;
  color: #94a3b8;
  padding: 8px 0;
}

/* Field hint */
.sa-field-hint {
  font-size: 11px;
  color: #94a3b8;
  display: block;
  margin-top: 2px;
}

/* Progress block */
.sa-progress-block {
  background: #f0f7ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 12px;
}
.sa-progress-block__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #475569;
}
.sa-progress-block__label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sa-progress-block__icon {
  color: #2563eb;
}
.sa-progress-block__gpa {
  font-weight: 700;
  color: #1e293b;
  margin-left: 4px;
}
.sa-progress-block__avance {
  font-size: 12px;
  color: #2563eb;
}

/* Table */
.sa-table-wrap {
  margin-bottom: 16px;
}
.sa-table thead th {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding: 8px 12px;
}
.sa-table tbody td {
  font-size: 13px;
  padding: 12px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}
.sa-table__th-right {
  text-align: right;
}
.sa-table__td-name {
  font-weight: 500;
  color: #1e293b;
}
.sa-table__td-muted {
  color: #64748b;
}
.sa-table__td-bold {
  font-weight: 600;
  color: #334155;
}
.sa-table__td-right {
  text-align: right;
}

/* Result */
.sa-result {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
}
.sa-result--pass {
  color: #16a34a;
}
.sa-result--fail {
  color: #dc2626;
}
.sa-result__icon {
  margin-right: 4px;
}

/* Alerts */
.sa-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-radius: 10px;
  padding: 14px 16px;
}
.sa-alert--success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.sa-alert--warn {
  background: #fff7ed;
  border: 1px solid #fed7aa;
}
.sa-alert__icon {
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}
.sa-alert--success .sa-alert__icon {
  color: #16a34a;
}
.sa-alert--warn .sa-alert__icon {
  color: #ea580c;
}
.sa-alert__title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
}
.sa-alert__sub {
  font-size: 12px;
  margin: 0;
}
.sa-alert--success .sa-alert__title,
.sa-alert--success .sa-alert__sub {
  color: #166534;
}
.sa-alert--warn .sa-alert__title,
.sa-alert--warn .sa-alert__sub {
  color: #9a3412;
}

/* Review labels (shared) */
.sa-review__label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
}
.sa-review__value {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Review step header */
.sa-rv-header {
}
.sa-rv-header__title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}
.sa-rv-header__sub {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Review cards */
.sa-rv-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.sa-rv-card__section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.sa-rv-sec-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.sa-rv-sec-icon--blue {
  color: #2563eb;
}
.sa-rv-sec-icon--teal {
  color: #0d9488;
}
.sa-rv-sec-title {
  font-size: 14px;
  font-weight: 600;
}
.sa-rv-sec-title--blue {
  color: #2563eb;
}
.sa-rv-sec-title--teal {
  color: #0d9488;
}

.sa-rv-card__body {
  padding: 14px 16px;
}

/* Beca card */
.sa-rv-card--beca {
}
.sa-rv-card__beca-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}
.sa-rv-beca__name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}
.sa-rv-beca__meta {
  display: flex;
  gap: 0;
  padding: 14px 16px;
}
.sa-rv-beca__meta > div {
  flex: 1;
  padding-right: 16px;
  border-right: 1px solid #e2e8f0;
  margin-right: 16px;
}
.sa-rv-beca__meta > div:last-child {
  border-right: none;
  margin-right: 0;
  padding-right: 0;
}

/* GPA with icon */
.sa-rv-gpa {
  display: flex;
  align-items: center;
  gap: 4px;
}
.sa-rv-gpa__icon {
  color: #2563eb;
  font-size: 12px;
}

/* Motivation text */
.sa-rv-motivation {
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Documents list */
.sa-rv-doc-list {
}
.sa-rv-doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
}
.sa-rv-doc-item:last-child {
  border-bottom: none;
}
.sa-rv-doc-item__icon {
  font-size: 14px;
  flex-shrink: 0;
}
.sa-rv-doc-item__icon--ok {
  color: #16a34a;
}
.sa-rv-doc-item__icon--missing {
  color: #cbd5e1;
}
.sa-rv-doc-item__name {
  flex: 1;
  color: #334155;
}
.sa-rv-doc-item__size {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

/* Truth declaration card */
.sa-truth-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 16px 20px;
}
.sa-truth-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.sa-truth-card__icon {
  color: #94a3b8;
  font-size: 16px;
}
.sa-truth-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}
.sa-truth-required {
  color: #f87171;
}
.sa-truth-card__text {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 14px;
}

.sa-truth-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.sa-truth-check__input {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
  flex-shrink: 0;
}
.sa-truth-check__label {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  cursor: pointer;
}

/* Truth warning bar */
.sa-truth-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: #854d0e;
  font-weight: 500;
  margin-top: 8px;
}
.sa-truth-warning__icon {
  color: #ca8a04;
}

.sa-btn-icon-left {
  margin-right: 6px;
}
.sa-btn-icon-right {
  margin-left: 6px;
}
.sa-btn-spin {
  animation: sa-spin 0.8s linear infinite;
}
@keyframes sa-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
