<template>
  <div class="new-request">
    <!-- Selected Document Card -->
    <div class="new-request__doc-card">
      <div class="new-request__doc-icon" :style="{ backgroundColor: selectedDoc.iconBgColor }">
        <AppIcon :icon="selectedDoc.icon" :style="{ color: selectedDoc.iconColor }" />
      </div>
      <div class="new-request__doc-info">
        <h4 class="new-request__doc-name">{{ t(selectedDoc.name) }}</h4>
        <p class="new-request__doc-desc">{{ t(selectedDoc.description) }}</p>
        <div class="new-request__doc-meta">
          <AppBadge v-if="selectedDoc.isFree" :label="t('Gratis')" variant="success" />
          <span v-else class="new-request__doc-cost">{{ selectedDoc.cost }}</span>
          <span class="new-request__doc-time">
            <AppIcon icon="clock" class="new-request__doc-time-icon" />
            {{ selectedDoc.estimatedTime }}
          </span>
        </div>
      </div>
    </div>

    <!-- Academic Information -->
    <div class="new-request__section">
      <div class="new-request__section-head">
        <div class="new-request__section-icon" style="background-color: #f3e8ff">
          <AppIcon icon="award" style="color: #7c3aed" />
        </div>
        <h5 class="new-request__section-title">
          {{ t('INFORMACIÓN ACADÉMICA') }}
        </h5>
      </div>

      <div class="new-request__field">
        <div class="new-request__label">{{ t('Periodo Académico') }} *</div>
        <AppSelect v-model="academicPeriodValue" :placeholder="t('Selecciona el periodo')">
          <option v-for="period in academicPeriods" :key="period.id" :value="period.id">
            {{ period.label }}
          </option>
        </AppSelect>
        <div class="new-request__helper">
          {{ t('Periodo académico al que corresponde la solicitud') }}
        </div>
      </div>

      <div class="new-request__field">
        <div class="new-request__label">{{ t('Motivo de la Solicitud') }}</div>
        <textarea v-model="form.reason" class="new-request__textarea" :placeholder="t('Describe brevemente el motivo de tu solicitud...')" rows="4"></textarea>
        <div class="new-request__helper">
          {{ t('Proporciona el contexto de tu solicitud (opcional)') }}
        </div>
      </div>
    </div>

    <!-- Attachments -->
    <div class="new-request__section">
      <div class="new-request__section-head">
        <div class="new-request__section-icon" style="background-color: #e0f2fe">
          <AppIcon icon="upload" style="color: #2563eb" />
        </div>
        <h5 class="new-request__section-title">
          {{ t('ADJUNTAR DOCUMENTOS') }}
        </h5>
      </div>

      <div class="new-request__subheading">
        {{ t('Documentos de soporte') }}
      </div>
      <AppAttachmentDropzone
        v-model="form.attachment"
        isTitle="Arrastra archivos aquí o haz clic para seleccionar"
        isHelper="PDF, JPG, PNG (máx. 5MB por archivo)"
        isAccept=".pdf,.jpg,.jpeg,.png"
        :isMaxSizeMB="5"
        :isShowDelete="true"
      />
    </div>

    <!-- Important Info -->
    <div class="new-request__info-box">
      <div class="new-request__info-header">
        <AppIcon icon="info-circle" class="new-request__info-icon" />
        <h5 class="new-request__info-title">
          {{ t('Información Importante') }}
        </h5>
      </div>
      <ul class="new-request__info-list">
        <li>
          {{ t('El tiempo de procesamiento puede variar según la demanda') }}
        </li>
        <li>
          {{ t('Recibirás una notificación cuando tu documento esté listo') }}
        </li>
        <li>
          {{ t('Puedes hacer seguimiento desde la sección "Mis Solicitudes"') }}
        </li>
      </ul>
    </div>

    <!-- Confirmation checkbox -->
    <div class="new-request__confirmation">
      <label class="new-request__check-label">
        <input type="checkbox" v-model="confirmed" class="new-request__checkbox" />
        <span>{{ t('Confirmo que la información proporcionada es correcta y acepto los términos del servicio') }}</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';
import type { DocumentType, AcademicPeriodOption, NewRequestFormData } from '../dtos/documentRequest.dto';

export default defineComponent({
  name: 'NewRequestDrawer',
  components: {
    AppIcon,
    AppBadge,
    AppSelect,
    AppAttachmentDropzone,
  },
  props: {
    selectedDoc: {
      type: Object as PropType<DocumentType>,
      required: true,
    },
    academicPeriods: {
      type: Array as PropType<AcademicPeriodOption[]>,
      default: () => [],
    },
  },
  emits: ['submit'],
  setup(props, { emit, expose }) {
    const { t } = useI18n();

    const form = ref<NewRequestFormData>({
      documentTypeId: props.selectedDoc.id,
      academicPeriodId: null,
      reason: '',
      attachment: null,
    });

    const academicPeriodValue = computed({
      get: () => form.value.academicPeriodId ?? undefined,
      set: (val: any) => {
        form.value.academicPeriodId = val ?? null;
      },
    });

    const confirmed = ref(true);

    const canSubmit = () => confirmed.value && form.value.academicPeriodId !== null;

    const submitForm = () => {
      if (!canSubmit()) return;
      emit('submit', { ...form.value });
    };

    expose({ canSubmit, submitForm });

    return { t, form, confirmed, academicPeriodValue };
  },
});
</script>

<style scoped>
.new-request {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.new-request__doc-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.new-request__doc-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.new-request__doc-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.new-request__doc-name {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.new-request__doc-desc {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
}

.new-request__doc-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.new-request__doc-cost {
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
}

.new-request__doc-time {
  font-size: 12px;
  color: #919eab;
  display: flex;
  align-items: center;
  gap: 4px;
}

.new-request__doc-time-icon {
  font-size: 12px;
}

.new-request__section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.new-request__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #919eab;
  letter-spacing: 0.5px;
  margin: 0;
  text-transform: uppercase;
}

.new-request__section-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.new-request__section-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.new-request__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.new-request__label {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.new-request__helper {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #6b7280;
}

.new-request__subheading {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.new-request__textarea {
  width: 100%;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  background-color: var(--color-light);
  color: var(--color-dark);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.new-request__textarea:focus {
  border-color: var(--color-primary);
}

.new-request__textarea::placeholder {
  color: #c4cdd5;
}

.new-request__info-box {
  background: #f0f7ff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #d0e3ff;
}

.new-request__info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.new-request__info-icon {
  color: #2563eb;
  font-size: 16px;
}

.new-request__info-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.new-request__info-list {
  margin: 0;
  padding-left: 20px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  line-height: 1.8;
}

.new-request__confirmation {
  padding-top: 4px;
}

.new-request__check-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  line-height: 1.5;
}

.new-request__checkbox {
  margin-top: 3px;
  accent-color: var(--color-primary);
  min-width: 16px;
  min-height: 16px;
}
</style>
