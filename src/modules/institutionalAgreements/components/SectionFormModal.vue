<template>
  <AppFormModal :title="isEdit ? 'Editar Sección' : 'Crear Sección del Formulario'" size="md">
    <template #content>
      <div class="sectionForm">
        <!-- Nombre -->
        <div class="formGroup">
          <label class="formLabel" for="sectionName">
            Nombre de la sección
            <span class="required">*</span>
          </label>
          <AppInput id="sectionName" v-model="form.name" placeholder="Ej: Información Personal" :error="errors.name" />
          <div v-if="errors.name" class="errorText">{{ errors.name }}</div>
        </div>

        <!-- ID Componente Visualización -->
        <div class="formGroup">
          <label class="formLabel" for="displayComponentTypeId">
            Tipo de Componente de Visualización
            <span class="optional">(opcional)</span>
          </label>
          <AppInput id="displayComponentTypeId" v-model.number="form.displayComponentTypeId" type="number" placeholder="Ej: 1" />
          <p class="formHint">ID del componente para renderizar esta sección</p>
        </div>

        <!-- Visible -->
        <div class="switchRow">
          <div class="switchRow__info">
            <span class="switchRow__label">Sección Visible</span>
            <span class="switchRow__desc">Mostrar esta sección en el formulario</span>
          </div>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" role="switch" v-model="form.visible" />
          </div>
        </div>

        <!-- Requerida -->
        <div class="switchRow">
          <div class="switchRow__info">
            <span class="switchRow__label">Sección Obligatoria</span>
            <span class="switchRow__desc">Los usuarios deben completar los campos de esta sección</span>
          </div>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" role="switch" v-model="form.required" />
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton label="Cancelar" outlined @click="onCancel" />
      <AppButton :label="isEdit ? 'Actualizar' : 'Crear Sección'" :disabled="!isFormValid" @click="onSave" />
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, computed, watch } from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';

import { AgreementTypeSectionDto, CreateAgreementTypeSectionDto } from '../dtos/agreementTypeSection.dto';

export default defineComponent({
  name: 'SectionFormModal',
  components: {
    AppFormModal,
    AppButton,
    AppInput,
  },
  props: {
    section: {
      type: Object as PropType<AgreementTypeSectionDto | null>,
      default: null,
    },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const isEdit = computed(() => !!props.section);

    const form = reactive<CreateAgreementTypeSectionDto>({
      sectionInstanceId: props.section?.sectionInstanceId,
      name: props.section?.name || '',
      visible: props.section?.visible ?? true,
      required: props.section?.required || false,
      displayComponentTypeId: props.section?.displayComponentTypeId || 1,
    });

    const errors = reactive({
      name: '',
    });

    const isFormValid = computed(() => {
      return form.name.trim().length > 0;
    });

    // Reset form when section prop changes
    watch(
      () => props.section,
      (newVal) => {
        if (newVal) {
          form.sectionInstanceId = newVal.sectionInstanceId;
          form.name = newVal.name;
          form.visible = newVal.visible;
          form.required = newVal.required;
          form.displayComponentTypeId = newVal.displayComponentTypeId || 1;
        } else {
          form.sectionInstanceId = undefined;
          form.name = '';
          form.visible = true;
          form.required = false;
          form.displayComponentTypeId = 1;
        }
      }
    );

    const validateForm = (): boolean => {
      errors.name = form.name.trim().length === 0 ? 'El nombre es requerido' : '';
      return isFormValid.value;
    };

    const onSave = () => {
      if (validateForm()) {
        emit('save', form);
      }
    };

    const onCancel = () => {
      emit('cancel');
    };

    return {
      isEdit,
      form,
      errors,
      isFormValid,
      onSave,
      onCancel,
    };
  },
});
</script>

<style scoped>
.sectionForm {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.formLabel {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-dark, #111827);
  margin-bottom: 0.25rem;
}

.required {
  color: #dc2626;
}

.formHint {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: var(--color-gray-600, #6b7280);
  font-style: italic;
}

.errorText {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.switchRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: rgba(var(--color-primary-rgb), 0.04);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 6px;
  gap: 1rem;
}

.switchRow__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.switchRow__label {
  font-weight: 600;
  color: var(--color-dark, #111827);
}

.switchRow__desc {
  font-size: 0.8rem;
  color: var(--color-gray-600, #6b7280);
}
</style>
