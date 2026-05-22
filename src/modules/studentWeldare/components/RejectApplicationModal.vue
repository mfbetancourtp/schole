<template>
  <AppFormModal title="Rechazar Solicitud">
    <template #content>
      <p class="rm-subid">
        <AppIcon icon="times-circle" class="rm-subid__icon" />
        ID: {{ application.displayId }} &nbsp;·&nbsp;
        {{ application.studentName }}
      </p>

      <p class="rm-desc">Esta acción rechazará todos los documentos de la solicitud. Por favor, proporciona una razón detallada que quedará registrada.</p>

      <div class="rm-field">
        <label class="rm-field__label">Motivo del Rechazo <span class="rm-field__required">*</span></label>
        <textarea
          v-model="reason"
          class="form-control rm-textarea"
          :class="{ 'rm-textarea--error': showError }"
          rows="4"
          placeholder="Documentación incompleta, no cumple con los requisitos mínimos..."
          @input="showError = false"
        />
        <p class="rm-field__hint" :class="{ 'rm-field__hint--error': showError }">
          <template v-if="showError">El motivo debe tener al menos 10 caracteres.</template>
          <template v-else>Mínimo 10 caracteres. Sé claro y profesional en tu explicación.</template>
        </p>
      </div>

      <div class="rm-warning">
        <AppIcon icon="exclamation-triangle" class="rm-warning__icon" />
        <div>
          <p class="rm-warning__title">Advertencia</p>
          <p class="rm-warning__text">Esta acción es irreversible. La solicitud quedará en estado Rechazada.</p>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton variant="danger" :outlined="false" nativeType="button" :disabled="isSaving" @click="onConfirm">
        <AppIcon v-if="isSaving" icon="circle-notch" class="rm-btn-icon rm-btn-spin" />
        <AppIcon v-else icon="times-circle" class="rm-btn-icon" />
        {{ isSaving ? 'Rechazando…' : 'Confirmar Rechazo' }}
      </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { ToastService } from '../../../shared/services/toast.service';
import { useUserStore } from '../../../stores/user';
import { RejectScholarshipApplicationService } from '../services/rejectScholarshipApplication.service';
import type { DisplayApplicationDto } from '../dtos/adminApplications.dto';

const rejectService = new RejectScholarshipApplicationService();
const toast = new ToastService();

export default defineComponent({
  name: 'RejectApplicationModal',
  components: { AppFormModal, AppButton, AppIcon },
  emits: ['confirmed'],
  props: {
    application: {
      type: Object as PropType<DisplayApplicationDto>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const userStore = useUserStore();
    const reason = ref('');
    const showError = ref(false);
    const isSaving = ref(false);

    const onConfirm = async () => {
      if (reason.value.trim().length < 10) {
        showError.value = true;
        return;
      }
      isSaving.value = true;
      try {
        const userId = userStore.user?.id ? String(userStore.user.id) : undefined;
        await rejectService.run(props.application.id, reason.value.trim(), userId);
        toast.show('Solicitud rechazada correctamente', 'danger');
        reason.value = '';
        emit('confirmed');
      } catch {
        toast.show('Error al rechazar la solicitud', 'danger');
      } finally {
        isSaving.value = false;
      }
    };

    return { reason, showError, isSaving, onConfirm };
  },
});
</script>

<style scoped>
.rm-subid {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 14px;
}
.rm-subid__icon {
  color: #dc2626;
  font-size: 16px;
}

.rm-desc {
  font-size: 13px;
  color: #475569;
  margin-bottom: 16px;
  line-height: 1.6;
}

.rm-field {
  margin-bottom: 14px;
}
.rm-field__label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  display: block;
  margin-bottom: 6px;
}
.rm-field__required {
  color: #dc2626;
}
.rm-field__hint {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  margin-bottom: 0;
}
.rm-field__hint--error {
  color: #dc2626;
}

.rm-textarea {
  font-size: 13px;
  resize: vertical;
  min-height: 100px;
}
.rm-textarea--error {
  border-color: #dc2626 !important;
}
.rm-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

.rm-warning {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 12px 14px;
}
.rm-warning__icon {
  color: #d97706;
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}
.rm-warning__title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 2px;
}
.rm-warning__text {
  font-size: 12px;
  color: #78350f;
  margin: 0;
  line-height: 1.5;
}

.rm-btn-icon {
  margin-right: 5px;
  font-size: 12px;
}
.rm-btn-spin {
  animation: rm-spin 0.8s linear infinite;
}
@keyframes rm-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
