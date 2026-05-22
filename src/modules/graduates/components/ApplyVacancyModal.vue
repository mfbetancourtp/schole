<template>
  <AppFormModal title="Aplicar a vacante">
    <template #content>
      <form @submit.prevent="save">
        <!-- Vacancy summary -->
        <div v-if="vacancy" class="apply-vacancy-info">
          <div class="apply-vacancy-logo">
            <img v-if="vacancy.companyLogo" :src="vacancy.companyLogo" :alt="vacancy.company" />
            <span v-else class="apply-logo-placeholder">{{ vacancy.company.charAt(0) }}</span>
          </div>
          <div>
            <p class="apply-vacancy-title">{{ vacancy.title }}</p>
            <p class="apply-vacancy-company">{{ vacancy.company }} · {{ vacancy.city }}</p>
          </div>
        </div>

        <hr class="apply-divider" />

        <div class="row g-3">
          <!-- CV selection -->
          <div class="col-12">
            <label class="form-label fw-semibold">
              <AppIcon icon="file-pdf" /> Selecciona tu CV
              <span class="required">*</span>
            </label>
            <div v-if="cvFiles.length > 0" class="apply-cv-list">
              <div
                v-for="file in cvFiles"
                :key="file.id"
                class="apply-cv-item"
                :class="{
                  'apply-cv-item--selected': form.cvFileId === file.id,
                }"
                @click="form.cvFileId = file.id"
              >
                <AppIcon icon="file-alt" class="apply-cv-icon" />
                <div class="apply-cv-name">{{ file.name }}</div>
                <AppIcon v-if="form.cvFileId === file.id" icon="check-circle" class="apply-cv-check" />
              </div>
            </div>
            <div v-else class="apply-no-cv">
              <AppIcon icon="exclamation-triangle" />
              No tienes CVs cargados. Ve a la pestaña Archivos de tu perfil para subir uno.
            </div>
            <div v-if="errors.cvFileId" class="text-danger small mt-1">
              {{ errors.cvFileId }}
            </div>
          </div>

          <!-- Cover letter -->
          <div class="col-12">
            <label class="form-label fw-semibold"> <AppIcon icon="pen" /> Carta de presentación </label>
            <textarea
              class="form-control"
              v-model="form.coverLetter"
              rows="5"
              placeholder="Escribe una breve carta de presentación dirigida a la empresa. Menciona por qué eres el candidato ideal y cuáles son tus motivaciones..."
            ></textarea>
            <small class="text-muted">Recomendado para aumentar tus posibilidades. Máx. 1000 caracteres.</small>
          </div>

          <!-- Portfolio -->
          <div class="col-12">
            <label class="form-label fw-semibold"> <AppIcon icon="globe" /> Portafolio o enlace relevante </label>
            <input type="url" class="form-control" v-model="form.portfolioUrl" placeholder="https://mi-portafolio.com" />
          </div>

          <!-- Confirmation -->
          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="applyConsent" v-model="form.consent" />
              <label class="form-check-label" for="applyConsent"> Autorizo a que mis datos sean compartidos con la empresa para fines de este proceso de selección. </label>
            </div>
            <div v-if="errors.consent" class="text-danger small mt-1">
              {{ errors.consent }}
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #actions>
      <AppButton variant="primary" @click="save" :loading="saving"> <AppIcon icon="paper-plane" /> Enviar postulación </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { VacancyDto } from '../dtos/vacancy.dto';

interface CvFile {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'ApplyVacancyModal',
  components: { AppFormModal, AppButton, AppIcon },
  props: {
    vacancy: { type: Object as PropType<VacancyDto | null>, default: null },
    cvFiles: { type: Array as PropType<CvFile[]>, default: () => [] },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const saving = ref(false);

    const form = reactive({
      cvFileId: null as number | null,
      coverLetter: '',
      portfolioUrl: '',
      consent: false,
    });

    const errors = reactive({
      cvFileId: '',
      consent: '',
    });

    const validate = () => {
      errors.cvFileId = '';
      errors.consent = '';
      let valid = true;
      if (!form.cvFileId) {
        errors.cvFileId = 'Debes seleccionar un CV';
        valid = false;
      }
      if (!form.consent) {
        errors.consent = 'Debes aceptar la autorización de datos';
        valid = false;
      }
      return valid;
    };

    const save = () => {
      if (!validate()) return;
      emit('save', { ...form, vacancyId: props.vacancy?.id });
    };

    return { form, errors, saving, save };
  },
});
</script>

<style scoped>
.required {
  color: #ef4444;
}
.apply-vacancy-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 4px;
}
.apply-vacancy-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.apply-vacancy-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.apply-logo-placeholder {
  font-size: 1.2rem;
  font-weight: 700;
  color: #6c757d;
}
.apply-vacancy-title {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2px;
  font-size: 0.95rem;
}
.apply-vacancy-company {
  color: #6c757d;
  font-size: 0.83rem;
  margin: 0;
}
.apply-divider {
  border-color: #e9ecef;
  margin: 12px 0;
}
.apply-cv-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}
.apply-cv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.apply-cv-item:hover {
  border-color: #2563eb;
  background: #eff6ff;
}
.apply-cv-item--selected {
  border-color: #2563eb;
  background: #eff6ff;
}
.apply-cv-icon {
  color: #e53e3e;
  font-size: 1.1rem;
}
.apply-cv-name {
  flex: 1;
  font-size: 0.88rem;
  color: #374151;
}
.apply-cv-check {
  color: #2563eb;
}
.apply-no-cv {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #856404;
  margin-top: 6px;
}
</style>
