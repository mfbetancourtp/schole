<template>
  <AppModal v-model="show" size="lg">
    <div class="modal-box">
      <!-- Header -->
      <div class="modal-box__header">
        <div>
          <h3 class="modal-box__title">
            {{ isEdit ? 'Editar Servicio' : 'Crear Nuevo Servicio' }}
          </h3>
          <p class="modal-box__subtitle">Complete los campos para configurar el servicio</p>
        </div>
        <button class="modal-box__close" @click="close">
          <AppIcon icon="times" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-box__body">
        <!-- Service name -->
        <div class="form-field">
          <label class="form-label">Nombre del Servicio</label>
          <input type="text" class="o-form-control" placeholder="Ej: Apoyo Psicológico individual" v-model="form.name" />
        </div>

        <!-- Description -->
        <div class="form-field">
          <label class="form-label">Descripción</label>
          <textarea class="o-form-control form-textarea" placeholder="Describe el servicio que se ofrecerá a los estudiantes..." v-model="form.description"></textarea>
        </div>

        <!-- Icon picker -->
        <div class="form-field">
          <label class="form-label">Seleccionar Icono</label>
          <div class="icon-grid">
            <button v-for="opt in iconOptions" :key="opt.icon" type="button" class="icon-option" :class="{ 'icon-option--selected': form.icon === opt.icon }" @click="form.icon = opt.icon">
              <AppIcon :icon="opt.icon" class="icon-option__icon" />
              <span class="icon-option__label">{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <!-- Requirements -->
        <div class="form-field">
          <label class="form-label">Requisitos para el Estudiante</label>
          <div class="requirements-list">
            <label v-for="req in allRequirements" :key="req" class="requirement-row">
              <input type="checkbox" :value="req" v-model="form.requirements" class="requirement-checkbox" />
              <span>{{ req }}</span>
            </label>
          </div>
        </div>

        <!-- Responsibles -->
        <div class="form-field">
          <label class="form-label">Responsables del Servicio</label>

          <div v-if="form.responsibles.length" class="responsibles-list">
            <div v-for="(resp, i) in form.responsibles" :key="i" class="responsible-item">
              <div class="responsible-item__info">
                <span class="responsible-item__name">{{ resp.name }}</span>
                <span class="responsible-item__meta">{{ resp.email }} · {{ resp.role }}</span>
              </div>
              <button class="responsible-item__remove" @click="removeResponsible(i)">
                <AppIcon icon="times" />
              </button>
            </div>
          </div>

          <button type="button" class="add-responsible-btn" @click="showAddResponsible = true">
            <AppIcon icon="user-plus" />
            Agregar Responsable
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-box__footer">
        <AppButton variant="ghost" @click="close">Cancelar</AppButton>
        <AppButton :disabled="!isValid" @click="submit">Guardar Servicio</AppButton>
      </div>
    </div>
  </AppModal>

  <!-- Sub-modal -->
  <AddResponsibleModal v-model="showAddResponsible" @add="onAddResponsible" />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AddResponsibleModal from './AddResponsibleModal.vue';
import { ServiceConfig, ServiceConfigForm, ServiceResponsible, SERVICE_ICON_OPTIONS, STUDENT_REQUIREMENTS } from '../dtos/serviceConfig.dto';

const props = defineProps<{
  modelValue: boolean;
  service: ServiceConfig | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved', form: ServiceConfigForm): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const isEdit = computed(() => !!props.service);
const iconOptions = SERVICE_ICON_OPTIONS;
const allRequirements = STUDENT_REQUIREMENTS;
const showAddResponsible = ref(false);

const emptyForm = (): ServiceConfigForm => ({
  name: '',
  description: '',
  icon: 'brain',
  requirements: [],
  responsibles: [],
});

const form = reactive<ServiceConfigForm>(emptyForm());

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.service) {
        form.name = props.service.name;
        form.description = props.service.description;
        form.icon = props.service.icon;
        form.requirements = [...props.service.requirements];
        form.responsibles = props.service.responsibles.map((r) => ({ ...r }));
      } else {
        Object.assign(form, emptyForm());
      }
    }
  }
);

const isValid = computed(() => form.name.trim() && form.icon);

function close() {
  emit('update:modelValue', false);
}

function onAddResponsible(resp: ServiceResponsible) {
  form.responsibles.push(resp);
}

function removeResponsible(index: number) {
  form.responsibles.splice(index, 1);
}

function submit() {
  if (!isValid.value) return;
  emit('saved', {
    ...form,
    responsibles: form.responsibles.map((r) => ({ ...r })),
  });
  close();
}
</script>

<style scoped>
.modal-box {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.modal-box__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e8eb;
}

.modal-box__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #212b36;
  margin: 0 0 4px;
}

.modal-box__subtitle {
  font-size: 0.82rem;
  color: var(--color-primary);
  margin: 0;
}

.modal-box__close {
  background: none;
  border: none;
  color: #637381;
  cursor: pointer;
  padding: 4px;
  font-size: 1rem;
  line-height: 1;
}

.modal-box__body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
}

.modal-box__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid #e5e8eb;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212b36;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Icon grid */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px;
  border: 1.5px solid #e5e8eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.icon-option:hover {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.04);
}

.icon-option--selected {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
}

.icon-option__icon {
  font-size: 1.4rem;
}

.icon-option__label {
  font-size: 0.72rem;
  color: #637381;
}

.icon-option--selected .icon-option__label {
  color: var(--color-primary);
}

/* Requirements */
.requirements-list {
  border: 1px solid #e5e8eb;
  border-radius: 8px;
  overflow: hidden;
}

.requirement-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-bottom: 1px solid #f0f2f4;
  cursor: pointer;
  font-size: 0.87rem;
  color: #212b36;
}

.requirement-row:last-child {
  border-bottom: none;
}

.requirement-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

/* Responsibles */
.responsibles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.responsible-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #e5e8eb;
  border-radius: 8px;
}

.responsible-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.responsible-item__name {
  font-size: 0.87rem;
  font-weight: 600;
  color: #212b36;
}

.responsible-item__meta {
  font-size: 0.78rem;
  color: #637381;
}

.responsible-item__remove {
  background: none;
  border: none;
  color: #637381;
  cursor: pointer;
  padding: 4px;
}

.add-responsible-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 1.5px dashed #cbd5e1;
  border-radius: 8px;
  background: none;
  color: var(--color-primary);
  font-size: 0.87rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.add-responsible-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.04);
}
</style>
