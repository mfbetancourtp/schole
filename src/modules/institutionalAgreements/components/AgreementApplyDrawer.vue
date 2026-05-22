<template>
  <AppDrawer size="xl" :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <div class="drawerHead">
        <div class="drawerHead__icon">
          <AppIcon icon="paper-plane" />
        </div>
        <div class="drawerHead__info">
          <span class="drawerHead__title">{{ agreement?.name || 'Postulación al Convenio' }}</span>
          <span class="drawerHead__subtitle" v-if="agreement">
            {{ agreement.institutionPartner }}<template v-if="countryName !== '—'"> · {{ countryName }}</template>
          </span>
        </div>
        <span v-if="agreement" class="categoryBadge categoryBadge--onDark" :class="typeBadgeClass(agreement.agreementsType?.name)">
          {{ agreement.agreementsType?.name || 'Convenio' }}
        </span>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="applyBody">
        <!-- Step wizard -->
        <div class="wizard">
          <template v-for="(step, i) in STEPS" :key="step.num">
            <div class="wizard__step" :class="wizardStepClass(step.num)">
              <div class="wizard__bullet">
                <AppIcon :icon="currentStep > step.num ? 'check' : step.icon" />
              </div>
              <span class="wizard__label">{{ step.label }}</span>
            </div>
            <div v-if="i < STEPS.length - 1" class="wizard__line" :class="{ 'wizard__line--done': currentStep > step.num }"></div>
          </template>
        </div>

        <!-- STEP 1: Información -->
        <div v-if="currentStep === 1" class="stepContent">
          <h4 class="sectionTitle">
            <AppIcon icon="user-circle" class="sectionTitle__icon" />
            Información del solicitante
          </h4>
          <div class="infoCard infoCard--shaded">
            <div class="infoGrid">
              <div class="infoField">
                <span class="infoField__label">Nombre completo</span>
                <span class="infoField__value">{{ userFullName }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Documento</span>
                <span class="infoField__value">{{ userIdentification }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Correo electrónico</span>
                <span class="infoField__value">{{ userEmail }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Teléfono</span>
                <span class="infoField__value">{{ userPhone }}</span>
              </div>
            </div>
          </div>

          <hr class="sectionDivider" />

          <h4 class="sectionTitle" v-if="agreement">
            <AppIcon icon="handshake" class="sectionTitle__icon" />
            Información del Convenio
          </h4>
          <div class="infoCard" v-if="agreement">
            <div class="infoGrid">
              <div class="infoField">
                <span class="infoField__label">Tipo de convenio</span>
                <span class="categoryBadge categoryBadge--sm" :class="typeBadgeClass(agreement.agreementsType?.name)">
                  {{ agreement.agreementsType?.name || 'Convenio' }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Institución aliada</span>
                <span class="infoField__value">{{ agreement.institutionPartner }}</span>
              </div>
              <div class="infoField">
                <span class="infoField__label">País</span>
                <span class="infoField__valueWithIcon">
                  <AppIcon icon="map-marker-alt" class="infoField__inlineIcon" />
                  {{ countryName }}
                </span>
              </div>
              <div class="infoField">
                <span class="infoField__label">Vigencia</span>
                <span class="infoField__value">{{ formatDate(agreement.starDay) }} – {{ formatDate(agreement.endDate) }}</span>
              </div>
              <div class="infoField" v-if="agreement.minimumSemester">
                <span class="infoField__label">Semestre mínimo</span>
                <span class="infoField__value">{{ agreement.minimumSemester }}°</span>
              </div>
              <div class="infoField" v-if="agreement.maximumAverage">
                <span class="infoField__label">Promedio mínimo requerido</span>
                <span class="infoField__value">{{ agreement.maximumAverage }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Datos de postulación -->
        <div v-else-if="currentStep === 2" class="stepContent">
          <div class="sectionHeader">
            <h4 class="sectionTitle">
              <AppIcon icon="file-alt" class="sectionTitle__icon" />
              Datos de postulación
            </h4>
            <div v-if="v$.form.$error" class="errorAlert">
              <AppIcon icon="exclamation-circle" />
              Por favor completa los campos requeridos para continuar.
            </div>
          </div>

          <!-- Motivación -->
          <AppFormField :form-control="v$.form.motivation">
            <div class="formField__labelRow">
              <AppIcon icon="comment-alt" class="formField__icon" />
              <label class="formField__label">
                Motivación para participar
                <span class="required">*</span>
              </label>
            </div>
            <textarea
              class="form-control formField__textarea"
              v-model="v$.form.motivation.$model"
              rows="4"
              placeholder="Describe las razones por las cuales deseas participar en este convenio"
            ></textarea>
            <span class="formField__hint">{{ form.motivation.length }}/1000 caracteres</span>
          </AppFormField>

          <!-- Área de interés -->
          <AppFormField :form-control="v$.form.areaId">
            <div class="formField__labelRow">
              <AppIcon icon="graduation-cap" class="formField__icon" />
              <label class="formField__label">Área de interés <span class="required">*</span></label>
            </div>
            <AppAutocomplete :options="areas" label="name" :reduce="(a: any) => a.id" v-model="v$.form.areaId.$model" input-id="areaId" />
          </AppFormField>

          <!-- Idioma -->
          <AppFormField :form-control="v$.form.languageLevel">
            <div class="formField__labelRow">
              <AppIcon icon="language" class="formField__icon" />
              <label class="formField__label">Nivel de idioma <span class="required">*</span></label>
            </div>
            <select class="form-select" v-model="v$.form.languageLevel.$model">
              <option value="">Seleccionar...</option>
              <option v-for="level in LANGUAGE_LEVELS" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
          </AppFormField>

          <!-- Experiencia previa -->
          <div class="formField">
            <div class="formField__labelRow">
              <AppIcon icon="briefcase" class="formField__icon" />
              <label class="formField__label">
                Experiencia previa relacionada
                <span class="optional">(opcional)</span>
              </label>
            </div>
            <textarea class="form-control formField__textarea" v-model="form.priorExperience" rows="3" placeholder="Describe tu experiencia previa relacionada con este convenio"></textarea>
          </div>

          <!-- Fecha + Duración -->
          <div class="formGrid">
            <AppFormField :form-control="v$.form.estimatedDate">
              <div class="formField__labelRow">
                <AppIcon icon="calendar-alt" class="formField__icon" />
                <label class="formField__label">Fecha estimada de participación <span class="required">*</span></label>
              </div>
              <input type="date" class="form-control" v-model="v$.form.estimatedDate.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.estimatedDuration">
              <div class="formField__labelRow">
                <AppIcon icon="clock" class="formField__icon" />
                <label class="formField__label">Duración estimada de participación <span class="required">*</span></label>
              </div>
              <select class="form-select" v-model="v$.form.estimatedDuration.$model">
                <option value="">Seleccionar...</option>
                <option v-for="d in DURATIONS" :key="d" :value="d">
                  {{ d }}
                </option>
              </select>
            </AppFormField>
          </div>
        </div>

        <!-- STEP 3: Documentos y confirmación -->
        <div v-else class="stepContent">
          <h4 class="sectionTitle">
            <AppIcon icon="paperclip" class="sectionTitle__icon" />
            Documentos requeridos
          </h4>

          <AppLoading v-if="loadingDocuments" />

          <div v-else-if="documents.length === 0" class="emptyDocs">
            <AppIcon icon="check-circle" class="emptyDocs__icon" />
            <span>Este convenio no requiere documentos adicionales.</span>
          </div>

          <div v-else class="docsGrid">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="docCard"
              :class="{
                'docCard--uploaded': doc.uploaded,
                'docCard--error': submitAttempted && doc.required && !doc.uploaded,
              }"
            >
              <div class="docCard__header">
                <div class="docCard__headerInfo">
                  <h5 class="docCard__title">{{ doc.title }}</h5>
                  <span v-if="doc.required" class="docCard__badge">Obligatorio</span>
                </div>
                <div class="docCard__iconWrap" :class="{ 'docCard__iconWrap--done': doc.uploaded }">
                  <AppIcon :icon="doc.uploaded ? 'check' : 'file-alt'" />
                </div>
              </div>
              <p class="docCard__desc">{{ doc.description }}</p>
              <div class="docCard__footer">
                <input :id="`fileInput-${doc.id}`" type="file" accept=".pdf,.doc,.docx,.jpg" style="display: none" @change="handleUpload(doc.id, $event)" />
                <button class="docCard__uploadBtn" :class="{ 'docCard__uploadBtn--done': doc.uploaded }" @click="triggerFileInput(doc.id)">
                  <AppIcon :icon="doc.uploaded ? 'check' : 'upload'" />
                  {{ doc.uploaded ? 'Archivo subido' : 'Subir archivo' }}
                </button>
                <span class="docCard__formats">PDF, DOC, JPG (Max. 5MB)</span>
              </div>
            </div>
          </div>

          <!-- Confirmación -->
          <div class="confirmCard">
            <h5 class="confirmCard__title">
              <AppIcon icon="shield-alt" class="confirmCard__icon" />
              Confirmación de requisitos
            </h5>
            <div class="confirmCard__checks">
              <!-- Siempre requeridos -->
              <div
                class="confirmCheck"
                :class="{
                  'confirmCheck--error': submitAttempted && !confirmsRequirements,
                }"
              >
                <input type="checkbox" id="confirmReq" v-model="confirmsRequirements" class="form-check-input confirmCheck__input" />
                <label for="confirmReq" class="confirmCheck__label">Confirmo que cumplo todos los requisitos establecidos para este convenio</label>
              </div>
              <div
                class="confirmCheck"
                :class="{
                  'confirmCheck--error': submitAttempted && !acceptsTerms,
                }"
              >
                <input type="checkbox" id="acceptTerms" v-model="acceptsTerms" class="form-check-input confirmCheck__input" />
                <label for="acceptTerms" class="confirmCheck__label">Acepto los términos y condiciones de la convocatoria y autorizo el uso de mis datos personales</label>
              </div>
            </div>
          </div>

          <!-- Submit alert — solo tras intentar enviar -->
          <div class="submitAlert" v-if="submitAttempted && !canSubmit">
            <AppIcon icon="exclamation-circle" class="submitAlert__icon" />
            <span>Debes cargar todos los documentos obligatorios y aceptar los requisitos para continuar.</span>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="drawerFooter">
        <AppButton outlined @click="handleLeft">
          <AppIcon :icon="currentStep === 1 ? 'times' : 'chevron-left'" />
          {{ currentStep === 1 ? 'Cancelar' : 'Anterior' }}
        </AppButton>
        <AppButton v-if="currentStep < 3" @click="handleNext">
          Siguiente
          <AppIcon icon="chevron-right" />
        </AppButton>
        <AppButton v-else @click="submit" :disabled="!canSubmit || submitting">
          <span v-if="submitting">Enviando...</span>
          <template v-else>
            <AppIcon icon="paper-plane" />
            Enviar postulación
          </template>
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, markRaw, onBeforeUnmount, PropType, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { required, maxLength } from '../../../shared/plugins/vuelidate.plugin';

import { InstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';
import { GetAgreementsInstitutionalDocumentsService } from '../services/getAgreementsInstitutionalDocuments.service';
import { GetAreasWithSubjectsService } from '../../academicPrograms/services/getAreasWithSubjects.service';
import { useUserStore } from '../../../stores/user';

const getAreasWithSubjectsService = new GetAreasWithSubjectsService();

const STEPS = [
  { num: 1, label: 'Información', icon: 'user' },
  { num: 2, label: 'Datos de postulación', icon: 'file-alt' },
  { num: 3, label: 'Documentos y confirmación', icon: 'upload' },
];

const LANGUAGE_LEVELS = ['A1 - Principiante', 'A2 - Elemental', 'B1 - Intermedio', 'B2 - Intermedio alto', 'C1 - Avanzado', 'C2 - Dominio'];

const DURATIONS = ['1 mes', '2 meses', '3 meses', '6 meses', '1 año'];

interface DocumentItem {
  id: number | string;
  institutionalDocumentId?: number; // Store the institutional document ID
  title: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
}

const getAgreementsInstitutionalDocumentsService = new GetAgreementsInstitutionalDocumentsService();

export default defineComponent({
  name: 'AgreementApplyDrawer',
  components: {
    AppDrawer,
    AppButton,
    AppIcon,
    AppLoading,
    AppFormField,
    AppAutocomplete,
  },
  props: {
    isVisible: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    agreement: {
      type: Object as PropType<InstitutionalAgreementDto | null>,
      default: null,
    },
    filterCountries: {
      type: Array as PropType<{ id: number; name: string }[]>,
      default: () => [],
    },
  },
  emits: ['update:isVisible', 'submitted'],
  setup(props, { emit }) {
    const countryName = computed(() => {
      const id = props.agreement?.country?.id ?? (props.agreement as any)?.countryId;
      return props.filterCountries.find((c) => c.id === id)?.name ?? props.agreement?.country?.name ?? '—';
    });
    const userStore = useUserStore();
    const currentStep = ref(1);

    // Real user data from store
    const userFullName = computed(() => {
      const p = userStore.user?.people;
      if (p) return [p.names, p.lastnames].filter(Boolean).join(' ') || userStore.user?.fullName || '-';
      return userStore.user?.fullName || '-';
    });
    const userIdentification = computed(() => userStore.user?.people?.identification || '-');
    const userEmail = computed(() => userStore.user?.people?.email || '-');
    const userPhone = computed(() => userStore.user?.people?.mobile || '-');

    // Form
    const form = reactive({
      motivation: '',
      areaId: null as number | null,
      languageLevel: '',
      priorExperience: '',
      estimatedDate: '',
      estimatedDuration: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          motivation: { required, maxLength: maxLength(1000) },
          areaId: { required },
          languageLevel: { required },
          estimatedDate: { required },
          estimatedDuration: { required },
          priorExperience: {},
        },
      },
      { form }
    );

    const areas = ref<{ id: number; name: string }[]>([]);

    const loadAreas = async () => {
      try {
        const res = await getAreasWithSubjectsService.run({ perPage: 100 });
        const data = res.data ?? res ?? [];
        areas.value = data.map((a: any) => ({ id: a.id, name: a.name }));
      } catch {
        areas.value = [];
      }
    };

    // Documents loaded from backend
    const documents = ref<DocumentItem[]>([]);
    const loadingDocuments = ref(false);

    const loadDocuments = async (agreementsInstitutionalId: number) => {
      loadingDocuments.value = true;
      try {
        const res = await getAgreementsInstitutionalDocumentsService.run({
          agreementsInstitutionalId,
          perPage: 100,
          page: 1,
        });
        const data = res.data ?? (res as any) ?? [];
        documents.value = data.map((a: any) => ({
          id: a.id, // Keep id for key binding
          institutionalDocumentId: a.id, // Store the actual institutional document ID
          title: a.name,
          description: '',
          required: Boolean(a.required),
          uploaded: false,
        }));
      } catch {
        documents.value = [];
      } finally {
        loadingDocuments.value = false;
      }
    };

    // Confirmation
    const confirmsRequirements = ref(false);
    const acceptsTerms = ref(false);
    const submitAttempted = ref(false);
    const submitting = ref(false);

    const canSubmit = computed(() => {
      const requiredDone = documents.value.filter((d) => d.required).every((d) => d.uploaded);
      return requiredDone && confirmsRequirements.value && acceptsTerms.value;
    });

    const resetForm = () => {
      currentStep.value = 1;
      form.motivation = '';
      form.areaId = null;
      form.languageLevel = '';
      form.priorExperience = '';
      form.estimatedDate = '';
      form.estimatedDuration = '';
      v$.value.$reset();
      confirmsRequirements.value = false;
      acceptsTerms.value = false;
      submitAttempted.value = false;
      submitting.value = false;
    };

    // Reset and load documents + areas on open
    watch(
      () => props.isVisible,
      (val) => {
        if (val) {
          resetForm();
          documents.value = [];
          if (props.agreement?.id) {
            loadDocuments(props.agreement.id);
          }
          if (!areas.value.length) {
            loadAreas();
          }
        } else {
          resetForm();
        }
      }
    );

    const handleLeft = () => {
      if (currentStep.value === 1) {
        emit('update:isVisible', false);
      } else {
        currentStep.value--;
      }
    };

    const handleNext = async () => {
      if (currentStep.value === 2) {
        const isValid = await v$.value.$validate();
        if (!isValid) return;
      }
      currentStep.value++;
    };

    const submit = () => {
      submitAttempted.value = true;
      if (!canSubmit.value) return;
      submitting.value = true;
      const payload = {
        agreementId: props.agreement?.id,
        motivation: form.motivation,
        areaId: form.areaId,
        languageLevel: form.languageLevel,
        priorExperience: form.priorExperience,
        estimatedDate: form.estimatedDate,
        estimatedDuration: form.estimatedDuration,
        confirmsRequirements: confirmsRequirements.value,
        acceptsTerms: acceptsTerms.value,
        documents: documents.value
          .filter((d) => d.file)
          .map((d) => ({
            institutionalDocumentId: d.institutionalDocumentId,
            file: d.file as File,
          })),
      };
      emit('submitted', payload);
      // el padre cierra el drawer tras completar las operaciones async
    };

    const triggerFileInput = (docId: number | string) => {
      if (!props.isVisible) return;
      try {
        const el = document.getElementById(`fileInput-${docId}`) as HTMLInputElement | null;
        if (el && el.parentNode) el.click();
      } catch (error) {
        console.warn(`Error triggering file input for docId ${docId}:`, error);
      }
    };

    const handleUpload = (docId: number | string, e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input?.files?.[0];
      if (file) {
        const doc = documents.value.find((d) => d.id === docId);
        if (doc) {
          doc.uploaded = true;
          doc.file = markRaw(file); // evita que Vue proxifique el File (rompería FormData)
        }
      }
    };

    const wizardStepClass = (stepNum: number) => ({
      'wizard__step--active': currentStep.value === stepNum,
      'wizard__step--done': currentStep.value > stepNum,
    });

    const typeBadgeClass = (typeName?: string): string => {
      const name = (typeName || '').toLowerCase();
      if (name.includes('movilidad')) return 'categoryBadge--academica';
      if (name.includes('práctica') || name.includes('practica')) return 'categoryBadge--practica';
      if (name.includes('investigación') || name.includes('investigacion')) return 'categoryBadge--investigacion';
      if (name.includes('deportivo')) return 'categoryBadge--deportivo';
      if (name.includes('educación') || name.includes('educacion')) return 'categoryBadge--educacion';
      return 'categoryBadge--academica';
    };

    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '—';
      const datePart = dateStr.substring(0, 10);
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return '—';
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${parseInt(day)} ${months[parseInt(month) - 1]}. ${year}`;
    };

    onBeforeUnmount(() => {
      resetForm();
    });

    return {
      STEPS,
      LANGUAGE_LEVELS,
      DURATIONS,
      currentStep,
      countryName,
      userFullName,
      userIdentification,
      userEmail,
      userPhone,
      form,
      v$,
      areas,
      documents,
      loadingDocuments,
      confirmsRequirements,
      acceptsTerms,
      submitAttempted,
      submitting,
      canSubmit,
      handleLeft,
      handleNext,
      submit,
      triggerFileInput,
      handleUpload,
      wizardStepClass,
      typeBadgeClass,
      formatDate,
    };
  },
});
</script>

<style scoped>
/* ====== HEAD ====== */
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

/* ====== BODY ====== */
.applyBody {
  display: flex;
  flex-direction: column;
}

/* ====== WIZARD ====== */
.wizard {
  display: flex;
  align-items: flex-start;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.wizard__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.wizard__bullet {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.2s, color 0.2s;
}

.wizard__step--active .wizard__bullet {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.15);
}

.wizard__step--done .wizard__bullet {
  background: #16a34a;
  color: #fff;
}

.wizard__label {
  font-size: 0.73rem;
  text-align: center;
  color: #9ca3af;
  max-width: 90px;
  line-height: 1.3;
  font-weight: 500;
}

.wizard__step--active .wizard__label {
  color: var(--color-primary);
  font-weight: 700;
}

.wizard__step--done .wizard__label {
  color: #16a34a;
  font-weight: 600;
}

.wizard__line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin-top: 18px;
  margin-bottom: auto;
  transition: background 0.2s;
}

.wizard__line--done {
  background: #16a34a;
}

/* ====== STEP CONTENT ====== */
.stepContent {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sectionHeader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sectionTitle {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.sectionTitle__icon {
  color: var(--color-primary);
  font-size: 1rem;
}

.sectionDivider {
  border: none;
  border-top: 2px dashed #e5e7eb;
  margin: 0;
}

/* ====== INFO CARDS ====== */
.infoCard {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.125rem;
}

.infoCard--shaded {
  background: #f8fafc;
}

.infoGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem 1.5rem;
}

.infoField {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.infoField__label {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.infoField__value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
}

.infoField__valueWithIcon {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
}

.infoField__inlineIcon {
  font-size: 0.8rem;
  color: var(--color-primary);
}

/* ====== CATEGORY BADGES ====== */
.categoryBadge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.categoryBadge--sm {
  font-size: 0.7rem;
  padding: 3px 9px;
}

.categoryBadge--academica {
  background: #dbeafe;
  color: #1d4ed8;
}
.categoryBadge--practica {
  background: #dcfce7;
  color: #15803d;
}
.categoryBadge--investigacion {
  background: #ede9fe;
  color: #6d28d9;
}
.categoryBadge--deportivo {
  background: #ffedd5;
  color: #c2410c;
}
.categoryBadge--educacion {
  background: #ccfbf1;
  color: #0f766e;
}

.categoryBadge--onDark {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* ====== ERROR ALERT ====== */
.errorAlert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 0.625rem 0.875rem;
  font-size: 0.82rem;
  color: #dc2626;
  font-weight: 500;
}

/* ====== FORM FIELDS ====== */
.formField {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.formField__labelRow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.formField__icon {
  color: var(--color-primary);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.formField__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.optional {
  color: #9ca3af;
  font-weight: 400;
  font-size: 0.78rem;
}

.formField__textarea {
  resize: vertical;
  min-height: 90px;
}

.formField__hint {
  font-size: 0.75rem;
  color: #9ca3af;
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ====== DOCUMENTS ====== */
.docsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.emptyDocs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.125rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #15803d;
  font-weight: 500;
}

.emptyDocs__icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.docCard {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  transition: border-color 0.2s, background 0.2s;
}

.docCard--uploaded {
  border-color: #86efac;
  background: #f0fdf4;
}

.docCard--error {
  border-color: #fca5a5;
  background: #fef2f2;
}

.docCard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.docCard__headerInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.docCard__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.docCard__badge {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 600;
}

.docCard__iconWrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.docCard__iconWrap--done {
  background: #dcfce7;
  color: #16a34a;
}

.docCard__desc {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.docCard__footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
}

.docCard__uploadBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.45rem 0.875rem;
  border: 1.5px solid var(--color-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.docCard__uploadBtn:hover {
  background: var(--color-primary);
  color: #fff;
}

.docCard__uploadBtn--done {
  border-color: #16a34a;
  color: #16a34a;
}

.docCard__uploadBtn--done:hover {
  background: #16a34a;
  color: #fff;
}

.docCard__formats {
  font-size: 0.7rem;
  color: #9ca3af;
}

/* ====== CONFIRMATION CARD ====== */
.confirmCard {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.confirmCard__title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.confirmCard__icon {
  color: var(--color-primary);
  font-size: 0.85rem;
}

.confirmCard__checks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.confirmCheck {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.confirmCheck__input {
  margin-top: 2px;
  flex-shrink: 0;
}

.confirmCheck__label {
  font-size: 0.83rem;
  color: #374151;
  line-height: 1.5;
  cursor: pointer;
}

.confirmCheck--error .confirmCheck__label {
  color: #dc2626;
}

/* ====== SUBMIT ALERT ====== */
.submitAlert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.82rem;
  color: #dc2626;
  font-weight: 500;
  line-height: 1.5;
}

.submitAlert__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ====== FOOTER ====== */
.drawerFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.75rem;
}
</style>
