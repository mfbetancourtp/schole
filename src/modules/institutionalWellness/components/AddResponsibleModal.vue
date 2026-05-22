<template>
  <AppModal v-model="show">
    <div class="modal-box">
      <!-- Header -->
      <div class="modal-box__header">
        <div>
          <h3 class="modal-box__title">Agregar Responsable</h3>
          <p class="modal-box__subtitle">Asigne un responsable al servicio</p>
        </div>
        <button class="modal-box__close" @click="close">
          <AppIcon icon="times" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-box__body">
        <div class="form-field">
          <label class="form-label">
            <AppIcon icon="user" />
            Nombre Completo
          </label>
          <input type="text" class="o-form-control" placeholder="Ej: María González Pérez" v-model="form.name" />
        </div>

        <div class="form-field">
          <label class="form-label">
            <AppIcon icon="envelope" />
            Correo Electrónico
          </label>
          <input type="email" class="o-form-control" placeholder="maria.gonzalez@universidad.edu" v-model="form.email" />
        </div>

        <div class="form-field">
          <label class="form-label">
            <AppIcon icon="id-badge" />
            Rol
          </label>
          <AppSelect v-model="form.role" placeholder="Seleccionar rol">
            <option value="">Seleccionar rol</option>
            <option v-for="role in roles" :key="role" :value="role">
              {{ role }}
            </option>
          </AppSelect>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-box__footer">
        <AppButton variant="ghost" @click="close">Cancelar</AppButton>
        <AppButton :disabled="!isValid" @click="submit">Agregar</AppButton>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import { ServiceResponsible, RESPONSIBLE_ROLES } from '../dtos/serviceConfig.dto';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'add', responsible: ServiceResponsible): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const roles = RESPONSIBLE_ROLES;

const form = reactive<ServiceResponsible>({ name: '', email: '', role: '' });

const isValid = computed(() => form.name.trim() && form.email.trim() && form.role);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.name = '';
      form.email = '';
      form.role = '';
    }
  }
);

function close() {
  emit('update:modelValue', false);
}

function submit() {
  if (!isValid.value) return;
  emit('add', { ...form });
  close();
}
</script>

<style scoped>
.modal-box {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  width: 420px;
  max-width: 100%;
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
  color: #637381;
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
  gap: 16px;
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
  gap: 6px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #212b36;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
