<template>
  <div class="srm">
    <!-- Header -->
    <div class="srm__header">
      <div class="srm__header-info">
        <div class="srm__icon-circle">
          <AppIcon :icon="service.icon" class="srm__icon" />
        </div>
        <div>
          <h5 class="srm__title">Solicitar Cita</h5>
          <p class="srm__subtitle">{{ service.name }}</p>
        </div>
      </div>
      <button type="button" class="srm__close" @click="$emit('cancel')">
        <AppIcon icon="times" />
      </button>
    </div>

    <!-- Body -->
    <div class="srm__body">
      <!-- Date + Time -->
      <div class="srm__row">
        <div class="srm__field">
          <label class="srm__label">
            <AppIcon icon="calendar-alt" class="srm__label-icon" />
            Fecha Preferida
          </label>
          <AppDateInput v-model="form.date" />
        </div>
        <div class="srm__field">
          <label class="srm__label">
            <AppIcon icon="clock" class="srm__label-icon" />
            Hora Preferida
          </label>
          <AppSelect v-model="form.time" placeholder="Seleccionar hora">
            <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
          </AppSelect>
        </div>
      </div>

      <!-- Reason -->
      <div class="srm__field">
        <label class="srm__label">
          <AppIcon icon="file-alt" class="srm__label-icon" />
          Motivo de la Consulta
        </label>
        <textarea v-model="form.reason" class="form-control srm__textarea" placeholder="Describe brevemente el motivo de tu consulta..." rows="3" />
      </div>

      <!-- Requirements -->
      <div class="srm__requirements">
        <div class="srm__req-header">
          <AppIcon icon="info-circle" class="srm__req-icon" />
          <span class="srm__req-title">Requisitos para el Servicio</span>
        </div>
        <p class="srm__req-subtitle">Por favor, confirma que cumples con los siguientes requisitos:</p>
        <div v-for="(req, i) in service.requirements" :key="i" class="srm__req-item" @click="toggleReq(i)">
          <input type="checkbox" class="srm__req-checkbox" :checked="checkedReqs[i]" @click.stop @change="toggleReq(i)" />
          <span class="srm__req-text">{{ req }}</span>
        </div>
        <p v-if="showReqWarning" class="srm__req-warning">
          <AppIcon icon="exclamation-triangle" class="srm__req-warning-icon" />
          Debes aceptar todos los requisitos para continuar
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="srm__footer">
      <AppButton label="Cancelar" variant="ghost" @click="$emit('cancel')" />
      <AppButton label="Enviar Solicitud" variant="primary" :disabled="!allChecked" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, computed } from 'vue';
import type { WellnessService } from '../dtos/serviceCatalog.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDateInput from '../../../shared/components/Forms/AppDateInput.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';

const generateHours = (): string[] => {
  const result: string[] = [];
  for (let h = 7; h <= 18; h++) {
    const fmt = (hour: number, min: number) => `${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`;
    result.push(fmt(h, 0));
    if (h < 18) result.push(fmt(h, 30));
  }
  return result;
};

export default defineComponent({
  name: 'ServiceRequestModal',
  components: { AppIcon, AppButton, AppDateInput, AppSelect },
  props: {
    service: { type: Object as PropType<WellnessService>, required: true },
  },
  emits: ['cancel', 'submit'],
  setup(props, { emit }) {
    const hours = generateHours();
    const form = reactive({ date: '', time: '', reason: '' });
    const checkedReqs = ref<boolean[]>(props.service.requirements.map(() => false));
    const showReqWarning = ref(false);
    const allChecked = computed(() => checkedReqs.value.every(Boolean));

    const toggleReq = (i: number) => {
      checkedReqs.value[i] = !checkedReqs.value[i];
      if (allChecked.value) showReqWarning.value = false;
    };

    const submit = () => {
      if (!allChecked.value) {
        showReqWarning.value = true;
        return;
      }
      emit('submit', { ...form });
    };

    return {
      hours,
      form,
      checkedReqs,
      allChecked,
      showReqWarning,
      toggleReq,
      submit,
    };
  },
});
</script>

<style scoped>
.srm {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.srm__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ec;
}

.srm__header-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.srm__icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.srm__icon {
  color: var(--color-primary);
  font-size: 18px;
}

.srm__title {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.srm__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
  margin: 0;
}

.srm__close {
  background: none;
  border: none;
  color: #919eab;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.srm__close:hover {
  color: #212b36;
}

/* Body */
.srm__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.srm__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.srm__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.srm__label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #212b36;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.srm__label-icon {
  color: #637381;
  font-size: 13px;
}

.srm__textarea {
  resize: none;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
}

/* Requirements */
.srm__requirements {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.srm__req-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.srm__req-icon {
  color: var(--color-primary);
  font-size: 14px;
}

.srm__req-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.srm__req-subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
}

.srm__req-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s;
  user-select: none;
}

.srm__req-item:hover {
  border-color: rgba(var(--color-primary-rgb), 0.4);
}

.srm__req-checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.srm__req-text {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #212b36;
}

.srm__req-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #f59e0b;
  margin: 0;
}

.srm__req-warning-icon {
  font-size: 13px;
}

/* Footer */
.srm__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ec;
}
</style>
