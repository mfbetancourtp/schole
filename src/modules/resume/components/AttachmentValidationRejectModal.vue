<template>
  <AppFormModal title="Rechazar soporte">
    <template #content>
      <div class="rejectModalBody">
        <div v-if="target" class="rejectModalTarget">
          <strong>{{ target.title }}</strong>
          <p>{{ target.subtitle }}</p>
        </div>

        <AppFormField label="Observación">
          <textarea v-model="observation" class="form-control rejectTextarea" placeholder="Describe el motivo del rechazo para dejar trazabilidad en la validación."></textarea>
        </AppFormField>
      </div>
    </template>

    <template #actions>
      <AppButton type="button" variant="danger" :outlined="false" :disabled="!observation.trim() || isSubmittingStatus" @click="confirmReject"> Confirmar rechazo </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

interface RejectDocument {
  title: string;
  subtitle: string;
}

export default defineComponent({
  name: 'AttachmentValidationRejectModal',
  components: {
    AppButton,
    AppFormField,
    AppFormModal,
  },
  props: {
    target: {
      type: Object as PropType<RejectDocument | null>,
      default: null,
    },
    isSubmittingStatus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['confirmReject'],
  setup(props, { emit }) {
    const observation = ref('');

    watch(
      () => props.target,
      () => {
        observation.value = '';
      },
      { immediate: true }
    );

    const confirmReject = () => {
      if (!props.target || !observation.value.trim()) return;

      emit('confirmReject', {
        document: props.target,
        observation: observation.value.trim(),
      });
    };

    return {
      observation,
      confirmReject,
    };
  },
});
</script>

<style scoped>
.rejectModalBody {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rejectModalTarget {
  padding: 1rem;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.rejectModalTarget p {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.rejectTextarea {
  min-height: 120px;
  resize: vertical;
}

:deep(.form-control) {
  width: 100%;
  min-height: 44px;
}
</style>
