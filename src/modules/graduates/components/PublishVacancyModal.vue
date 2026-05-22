<template>
  <AppFormModal title="Publicar vacante">
    <template #content>
      <form @submit.prevent="save">
        <div class="row g-3">
          <!-- Title -->
          <div class="col-12">
            <label class="form-label fw-semibold">Título del cargo <span class="required">*</span></label>
            <input type="text" class="form-control" v-model="form.title" placeholder="ej. Desarrollador Backend Senior" :class="{ 'is-invalid': errors.title }" />
            <div class="invalid-feedback">{{ errors.title }}</div>
          </div>

          <!-- Company -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Empresa <span class="required">*</span></label>
            <input type="text" class="form-control" v-model="form.company" placeholder="Nombre de la empresa" :class="{ 'is-invalid': errors.company }" />
            <div class="invalid-feedback">{{ errors.company }}</div>
          </div>

          <!-- City -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Ciudad <span class="required">*</span></label>
            <input type="text" class="form-control" v-model="form.city" placeholder="ej. Bogotá" :class="{ 'is-invalid': errors.city }" />
            <div class="invalid-feedback">{{ errors.city }}</div>
          </div>

          <!-- Modality -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Modalidad <span class="required">*</span></label>
            <select class="form-select" v-model="form.modality" :class="{ 'is-invalid': errors.modality }">
              <option value="">Seleccionar</option>
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <div class="invalid-feedback">{{ errors.modality }}</div>
          </div>

          <!-- Contract type -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Tipo de contrato <span class="required">*</span></label>
            <select class="form-select" v-model="form.contractType" :class="{ 'is-invalid': errors.contractType }">
              <option value="">Seleccionar</option>
              <option value="full-time">Tiempo completo</option>
              <option value="part-time">Medio tiempo</option>
              <option value="contract">Contrato</option>
              <option value="internship">Pasantía</option>
              <option value="freelance">Freelance</option>
            </select>
            <div class="invalid-feedback">{{ errors.contractType }}</div>
          </div>

          <!-- Experience level -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Nivel de experiencia</label>
            <select class="form-select" v-model="form.experienceLevel">
              <option value="">Seleccionar</option>
              <option value="junior">Junior</option>
              <option value="semi-senior">Semi-senior</option>
              <option value="senior">Senior</option>
              <option value="lider">Líder / Manager</option>
            </select>
          </div>

          <!-- Professional area -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Área profesional</label>
            <input type="text" class="form-control" v-model="form.professionalArea" placeholder="ej. Tecnología" />
          </div>

          <!-- Salary range -->
          <div class="col-12">
            <label class="form-label fw-semibold">Rango salarial (opcional)</label>
            <div class="row g-2">
              <div class="col-5">
                <input type="number" class="form-control" v-model="form.salaryMin" placeholder="Mínimo" min="0" />
              </div>
              <div class="col-2 d-flex align-items-center justify-content-center">
                <span class="text-muted">–</span>
              </div>
              <div class="col-5">
                <input type="number" class="form-control" v-model="form.salaryMax" placeholder="Máximo" min="0" />
              </div>
            </div>
            <small class="text-muted">Valores en COP. Dejar vacío si prefieres no mostrar salario.</small>
          </div>

          <!-- Skills -->
          <div class="col-12">
            <label class="form-label fw-semibold">Habilidades requeridas</label>
            <div class="pv-skills-input-wrap">
              <input type="text" class="form-control" v-model="skillInput" placeholder="Escribe una habilidad y presiona Enter" @keydown.enter.prevent="addSkill" />
              <button type="button" class="pv-skill-add-btn" @click="addSkill">
                <AppIcon icon="plus" />
              </button>
            </div>
            <div class="pv-skill-tags" v-if="form.skills.length > 0">
              <span v-for="(skill, i) in form.skills" :key="i" class="pv-skill-tag">
                {{ skill }}
                <button type="button" class="pv-skill-remove" @click="removeSkill(i)">
                  <AppIcon icon="times" />
                </button>
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="col-12">
            <label class="form-label fw-semibold">Descripción del cargo <span class="required">*</span></label>
            <textarea
              class="form-control"
              v-model="form.description"
              rows="4"
              placeholder="Describe las responsabilidades y el rol dentro de la empresa..."
              :class="{ 'is-invalid': errors.description }"
            ></textarea>
            <div class="invalid-feedback">{{ errors.description }}</div>
          </div>

          <!-- Requirements -->
          <div class="col-12">
            <label class="form-label fw-semibold">Requisitos <span class="required">*</span></label>
            <textarea
              class="form-control"
              v-model="form.requirements"
              rows="4"
              placeholder="Formación académica, experiencia mínima, conocimientos específicos..."
              :class="{ 'is-invalid': errors.requirements }"
            ></textarea>
            <div class="invalid-feedback">{{ errors.requirements }}</div>
          </div>

          <!-- Benefits -->
          <div class="col-12">
            <label class="form-label fw-semibold">Beneficios</label>
            <textarea class="form-control" v-model="form.benefits" rows="3" placeholder="Auxilio de transporte, seguros, plan carrera, bonificaciones..."></textarea>
          </div>

          <!-- Expiry -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Fecha de cierre</label>
            <input type="date" class="form-control" v-model="form.expiresAt" :min="today" />
          </div>
        </div>
      </form>
    </template>

    <template #actions>
      <AppButton variant="primary" @click="save" :loading="saving"> <AppIcon icon="bullhorn" /> Publicar vacante </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'PublishVacancyModal',
  components: { AppFormModal, AppButton, AppIcon },
  emits: ['save'],
  setup(_, { emit }) {
    const saving = ref(false);
    const skillInput = ref('');
    const today = new Date().toISOString().split('T')[0];

    const form = reactive({
      title: '',
      company: '',
      city: '',
      modality: '',
      contractType: '',
      experienceLevel: '',
      professionalArea: '',
      salaryMin: null as number | null,
      salaryMax: null as number | null,
      skills: [] as string[],
      description: '',
      requirements: '',
      benefits: '',
      expiresAt: '',
    });

    const errors = reactive({
      title: '',
      company: '',
      city: '',
      modality: '',
      contractType: '',
      description: '',
      requirements: '',
    });

    const addSkill = () => {
      const s = skillInput.value.trim();
      if (s && !form.skills.includes(s)) form.skills.push(s);
      skillInput.value = '';
    };

    const removeSkill = (index: number) => {
      form.skills.splice(index, 1);
    };

    const validate = () => {
      Object.keys(errors).forEach((k) => ((errors as any)[k] = ''));
      let valid = true;
      if (!form.title.trim()) {
        errors.title = 'El título es requerido';
        valid = false;
      }
      if (!form.company.trim()) {
        errors.company = 'La empresa es requerida';
        valid = false;
      }
      if (!form.city.trim()) {
        errors.city = 'La ciudad es requerida';
        valid = false;
      }
      if (!form.modality) {
        errors.modality = 'La modalidad es requerida';
        valid = false;
      }
      if (!form.contractType) {
        errors.contractType = 'El tipo de contrato es requerido';
        valid = false;
      }
      if (!form.description.trim()) {
        errors.description = 'La descripción es requerida';
        valid = false;
      }
      if (!form.requirements.trim()) {
        errors.requirements = 'Los requisitos son requeridos';
        valid = false;
      }
      return valid;
    };

    const save = () => {
      if (!validate()) return;
      emit('save', { ...form });
    };

    return {
      form,
      errors,
      saving,
      skillInput,
      today,
      addSkill,
      removeSkill,
      save,
    };
  },
});
</script>

<style scoped>
.required {
  color: #ef4444;
}
.pv-skills-input-wrap {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.pv-skill-add-btn {
  padding: 6px 12px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.pv-skill-add-btn:hover {
  background: #1d4ed8;
}
.pv-skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pv-skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.82rem;
}
.pv-skill-remove {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-size: 0.75rem;
}
.pv-skill-remove:hover {
  color: #dc3545;
}
</style>
