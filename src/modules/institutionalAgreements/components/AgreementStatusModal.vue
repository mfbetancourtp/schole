<template>
  <AppFormModal title="Cambiar estado">
    <template #content>
      <div class="statusModal">
        <div class="statusModal__info">
          <span class="statusModal__agreementName">{{ agreement?.name }}</span>
          <div class="statusModal__currentRow">
            <span class="statusModal__currentLabel">Estado actual:</span>
            <span class="statusBadge" :class="statusClass(agreement?.agreementStatus ?? '')">
              {{ agreement?.agreementStatus }}
            </span>
          </div>
        </div>

        <div class="statusModal__options">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            class="statusOption"
            :class="[
              s.cls,
              { 'statusOption--selected': selectedStatus === s.value },
              {
                'statusOption--current': agreement?.agreementStatus === s.value,
              },
            ]"
            :disabled="agreement?.agreementStatus === s.value"
            @click="selectedStatus = s.value"
          >
            <span class="statusOption__dot" />
            <span class="statusOption__label">{{ s.label }}</span>
            <span v-if="agreement?.agreementStatus === s.value" class="statusOption__tag">actual</span>
          </button>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton variant="primary" :disabled="!selectedStatus || selectedStatus === agreement?.agreementStatus" @click="confirm"> Aplicar cambio </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { InstitutionalAgreementDto, InstitutionalAgreementStatus } from '../dtos/institutionalAgreement.dto';

const statusOptions: {
  value: InstitutionalAgreementStatus;
  label: string;
  cls: string;
}[] = [
  { value: 'Activo', label: 'Activo', cls: 'statusOption--active' },
  { value: 'Borrador', label: 'Borrador', cls: 'statusOption--draft' },
  { value: 'Finalizado', label: 'Finalizado', cls: 'statusOption--finished' },
  { value: 'Cerrado', label: 'Cerrado', cls: 'statusOption--closed' },
];

export default defineComponent({
  name: 'AgreementStatusModal',
  components: { AppFormModal, AppButton },
  props: {
    agreement: {
      type: Object as PropType<InstitutionalAgreementDto | null>,
      default: null,
    },
  },
  emits: ['confirmStatus'],
  setup(props, { emit }) {
    const selectedStatus = ref<InstitutionalAgreementStatus | ''>('');

    const statusClass = (status: string): string => {
      const map: Record<string, string> = {
        Activo: 'statusBadge--active',
        Borrador: 'statusBadge--draft',
        Finalizado: 'statusBadge--finished',
        Cerrado: 'statusBadge--closed',
      };
      return map[status] ?? '';
    };

    const confirm = () => {
      if (!selectedStatus.value || selectedStatus.value === props.agreement?.agreementStatus) return;
      emit('confirmStatus', selectedStatus.value);
    };

    return { statusOptions, selectedStatus, statusClass, confirm };
  },
});
</script>

<style scoped>
.statusModal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.statusModal__info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.statusModal__agreementName {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.statusModal__currentRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.statusModal__currentLabel {
  font-size: 0.82rem;
  color: #6b7280;
}

/* Status badge (same as page) */
.statusBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}
.statusBadge--active {
  background: #dcfce7;
  color: #16a34a;
}
.statusBadge--draft {
  background: #fef3c7;
  color: #d97706;
}
.statusBadge--finished {
  background: #f3f4f6;
  color: #6b7280;
}
.statusBadge--closed {
  background: #fee2e2;
  color: #dc2626;
}

/* Options list */
.statusModal__options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.statusOption {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.12s ease;
  outline: none;
  text-align: left;
  width: 100%;
}

.statusOption:not(:disabled):hover {
  border-color: currentColor;
  background: #fff;
}

.statusOption:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.statusOption--selected {
  border-color: currentColor !important;
  background: #fff !important;
}

.statusOption__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.statusOption__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: inherit;
  flex: 1;
}

.statusOption__tag {
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.65;
  margin-left: auto;
}

.statusOption--active {
  color: #16a34a;
}
.statusOption--draft {
  color: #d97706;
}
.statusOption--finished {
  color: #6b7280;
}
.statusOption--closed {
  color: #dc2626;
}
</style>
