<template>
  <div class="app-wizard-stepper">
    <div v-for="(step, index) in normalizedSteps" :key="step.key" class="app-wizard-stepper__item">
      <button
        type="button"
        class="app-wizard-stepper__trigger"
        :class="{
          'app-wizard-stepper__trigger--clickable': clickable && !isStepLocked(step.status),
        }"
        :disabled="!clickable || isStepLocked(step.status)"
        @click="handleSelect(step.key, step.status)"
      >
        <div
          class="app-wizard-stepper__circle"
          :class="{
            'app-wizard-stepper__circle--active': isStepActive(index, step.status),
            'app-wizard-stepper__circle--done': isStepDone(index, step.status),
            'app-wizard-stepper__circle--locked': isStepLocked(step.status),
          }"
        >
          <AppIcon v-if="step.iconSource !== 'bank' || isStepDone(index, step.status)" :icon="isStepDone(index, step.status) ? completedIcon : step.icon" />
          <AppGetIcon v-else :name="step.icon" width="18" height="18" fillColor="currentColor" strokeColor="currentColor" classIcon="app-wizard-stepper__bankIcon" />
        </div>

        <span
          class="app-wizard-stepper__label"
          :class="{
            'app-wizard-stepper__label--active': isStepActive(index, step.status),
            'app-wizard-stepper__label--done': isStepDone(index, step.status),
            'app-wizard-stepper__label--locked': isStepLocked(step.status),
          }"
        >
          {{ step.title }}
        </span>
      </button>

      <div
        v-if="index < normalizedSteps.length - 1"
        class="app-wizard-stepper__line"
        :class="{
          'app-wizard-stepper__line--done': isStepDone(index, step.status),
        }"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import AppGetIcon from '../AppGetIcon.vue';
import AppIcon from '../AppIcon.vue';

interface WizardStepItem {
  id?: string | number;
  number?: string | number;
  title: string;
  icon?: string;
  iconSource?: 'app' | 'bank';
  status?: 'done' | 'active' | 'pending' | 'locked';
}

export default defineComponent({
  name: 'AppWizardStepper',
  components: {
    AppGetIcon,
    AppIcon,
  },
  props: {
    modelValue: {
      type: [String, Number],
      required: true,
    },
    steps: {
      type: Array as PropType<WizardStepItem[]>,
      default: () => [],
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    completedIcon: {
      type: String,
      default: 'check',
    },
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { emit }) {
    const normalizedSteps = computed(() =>
      props.steps.map((step, index) => ({
        key: step.id ?? step.number ?? index + 1,
        title: step.title,
        icon: step.icon || 'circle',
        iconSource: step.iconSource || 'app',
        status: step.status,
      }))
    );

    const currentIndex = computed(() => {
      const matchedIndex = normalizedSteps.value.findIndex((step) => String(step.key) === String(props.modelValue));
      if (matchedIndex >= 0) return matchedIndex;

      const numericValue = Number(props.modelValue);
      if (Number.isFinite(numericValue) && numericValue > 0 && numericValue <= normalizedSteps.value.length) {
        return numericValue - 1;
      }

      return 0;
    });

    const isStepActive = (index: number, status?: string) => {
      if (status) return status === 'active';

      return index === currentIndex.value;
    };

    const isStepDone = (index: number, status?: string) => {
      if (status) return status === 'done';

      return index < currentIndex.value;
    };

    const isStepLocked = (status?: string) => status === 'locked';

    const handleSelect = (stepKey: string | number, status?: string) => {
      if (!props.clickable) return;
      if (isStepLocked(status)) return;

      emit('update:modelValue', stepKey);
      emit('select', stepKey);
    };

    return {
      normalizedSteps,
      currentIndex,
      isStepActive,
      isStepDone,
      isStepLocked,
      handleSelect,
    };
  },
});
</script>

<style scoped>
.app-wizard-stepper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.app-wizard-stepper__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.app-wizard-stepper__trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: default;
}

.app-wizard-stepper__trigger--clickable {
  cursor: pointer;
}

.app-wizard-stepper__trigger:disabled {
  opacity: 1;
}

:deep(.app-wizard-stepper__bankIcon) {
  width: 18px;
  height: 18px;
  padding: 0;
}

.app-wizard-stepper__circle {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  color: #64748b;
  z-index: 1;
}

.app-wizard-stepper__circle--active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.app-wizard-stepper__circle--done {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.app-wizard-stepper__circle--locked {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}

.app-wizard-stepper__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-align: center;
}

.app-wizard-stepper__label--active {
  color: #1d4ed8;
}

.app-wizard-stepper__label--done {
  color: #047857;
}

.app-wizard-stepper__label--locked {
  color: #94a3b8;
}

.app-wizard-stepper__line {
  position: absolute;
  top: 20px;
  left: calc(50% + 25px);
  right: calc(-50% + 25px);
  height: 2px;
  background: #cbd5e1;
}

.app-wizard-stepper__line--done {
  background: #10b981;
}

@media (max-width: 992px) {
  .app-wizard-stepper {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 640px) {
  .app-wizard-stepper {
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 0;
    padding: 0.6rem 0.75rem;
  }

  .app-wizard-stepper__circle {
    width: 34px;
    height: 34px;
  }

  .app-wizard-stepper__label {
    display: none;
  }

  .app-wizard-stepper__label--active {
    display: block;
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    padding: 0 0.1rem;
  }

  .app-wizard-stepper__line {
    display: block;
    top: 17px;
    left: calc(50% + 17px);
    right: calc(-50% + 17px);
  }
}
</style>
