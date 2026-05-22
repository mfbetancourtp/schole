<template>
  <AppFormModal :title="isEdit ? 'Editar Adjunto' : 'Crear Adjunto Requerido'" size="md">
    <template #content>
      <div class="attachmentForm">
        <!-- Nombre del documento -->
        <AppFormField :form-control="v$.name">
          <label class="formLabel" for="attachmentName">Nombre del documento</label>
          <input id="attachmentName" v-model="v$.name.$model" type="text" class="formInput form-field" placeholder="Ej: Hoja de vida" />
        </AppFormField>

        <!-- Descripción -->
        <AppFormField :form-control="v$.description">
          <label class="formLabel" for="attachmentDescription">Descripción</label>
          <textarea id="attachmentDescription" v-model="v$.description.$model" class="formTextarea form-field" placeholder="Breve descripción del documento requerido" rows="3" />
        </AppFormField>

        <!-- Obligatorio -->
        <div class="switchRow">
          <div class="switchRow__info">
            <span class="switchRow__label">Documento Obligatorio</span>
            <span class="switchRow__desc">El usuario deberá adjuntar este documento para postularse</span>
          </div>
          <div class="switchToggle">
            <input type="checkbox" role="switch" v-model="form.required" />
          </div>
        </div>

        <!-- Estado Activo -->
        <div class="switchRow">
          <div class="switchRow__info">
            <span class="switchRow__label">Estado Activo</span>
            <span class="switchRow__desc">{{ form.isActive ? 'Activo' : 'Inactivo' }} — visible en el formulario</span>
          </div>
          <div class="switchToggle">
            <input type="checkbox" role="switch" v-model="form.isActive" />
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton :label="isEdit ? 'Actualizar' : 'Crear Adjunto'" @click="onSave" />
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, computed, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { AgreementTypeAttachmentDto, CreateAgreementTypeAttachmentDto } from '../dtos/agreementTypeAttachment.dto';

export default defineComponent({
  name: 'AttachmentFormModal',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
  },
  props: {
    agreementTypeId: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    attachment: {
      type: Object as PropType<AgreementTypeAttachmentDto | null>,
      default: null,
    },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const isEdit = computed(() => !!props.attachment);

    const form = reactive<CreateAgreementTypeAttachmentDto>({
      agreementsTypesId: props.agreementTypeId,
      name: props.attachment?.name || '',
      description: props.attachment?.description || '',
      required: props.attachment ? Boolean(props.attachment.required) : false,
      isActive: props.attachment ? Boolean(props.attachment.isActive) : true,
    });

    const rules = {
      name: { required },
      description: { required },
    };

    const v$ = useVuelidate(rules, form);

    watch(
      () => props.attachment,
      (newVal) => {
        if (newVal) {
          form.name = newVal.name;
          form.description = newVal.description;
          form.required = Boolean(newVal.required);
          form.isActive = Boolean(newVal.isActive);
        } else {
          form.name = '';
          form.description = '';
          form.required = false;
          form.isActive = true;
        }
        v$.value.$reset();
      }
    );

    const onSave = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      emit('save', { ...form, id: props.attachment?.id });
    };

    return {
      isEdit,
      form,
      v$,
      onSave,
    };
  },
});
</script>

<style scoped>
.attachmentForm {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.formLabel {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-gray-700, #374151);
  margin-bottom: 0.3rem;
}

.formInput {
  display: block;
  width: 100%;
  padding: var(--padding-1);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-3);
  color: var(--color-dark);
  background-color: var(--color-light);
  border: var(--border-1) solid var(--color-gray-400);
  border-radius: var(--border-radius-1);
  font-family: inherit;
}

.formInput:focus-visible {
  border-color: var(--color-primary);
  outline: 0;
}

.formTextarea {
  display: block;
  width: 100%;
  padding: var(--padding-1);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-3);
  color: var(--color-dark);
  background-color: var(--color-light);
  border: var(--border-1) solid var(--color-gray-400);
  border-radius: var(--border-radius-1);
  resize: vertical;
  font-family: inherit;
}

.formTextarea:focus-visible {
  border-color: var(--color-primary);
  outline: 0;
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

.switchToggle {
  display: flex;
  align-items: center;
}

.switchToggle input[type='checkbox'] {
  width: 2.5rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--color-primary);
}
</style>
