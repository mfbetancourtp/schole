<template>
  <div class="app-stepper" :class="{ 'app-stepper--noPadding': disablePadding }">
    <div class="sidebar" :style="{ width: sidebarWidth }">
      <div class="item" v-for="(step, index) in visibleSteps" :key="step.id ?? index" @click="selectStep(index, step)" :class="{ active: index === currentStep }">
        {{ step.name }}
      </div>
    </div>

    <div class="step-content" :style="{ width: `calc(100% - ${sidebarWidth})` }">
      <div v-if="useContentWrapper" class="content-wrapper">
        <component v-if="visibleSteps[currentStep]" :is="visibleSteps[currentStep].component" :key="currentStep" style="height: 100%; padding: 15px" />
      </div>

      <template v-else>
        <component v-if="visibleSteps[currentStep]" :is="visibleSteps[currentStep].component" :key="currentStep" style="height: 100%; padding: 15px" />
      </template>

      <div class="footer" v-if="showFooter">
        <AppButton v-if="currentStep > 0" @click="prevStep">Anterior</AppButton>

        <AppButton v-if="currentStep < visibleSteps.length - 1" @click="nextStep"> Siguiente </AppButton>

        <AppButton v-if="currentStep === visibleSteps.length - 1 && showFinishBtn" @click="() => onFinish()"> Finalizar </AppButton>

        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import AppButton from '../Buttons/AppButton.vue';
import AppVerticalStep from './AppVerticalStep.vue';

export default defineComponent({
  name: 'AppVerticalStepper',
  components: {
    AppButton,
  },
  props: {
    onFinish: {
      type: Function,
      default: () => () => {},
    },
    showFinishBtn: {
      type: Boolean,
      default: true,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    sidebarWidth: {
      type: String,
      default: '20%',
    },
    useContentWrapper: {
      type: Boolean,
      default: true,
    },
    disablePadding: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['changeStep'],
  setup(props, { slots, emit }) {
    const steps: any = ref([]);
    const currentStep = ref(0);

    const renderSteps = () => {
      const slotNodes = slots.default?.() ?? [];

      steps.value = slotNodes.flatMap((slotChild: any) => {
        if (slotChild.type === AppVerticalStep) {
          return [
            {
              name: slotChild.props?.name || '',
              id: slotChild.props?.id,
              component: slotChild,
              customNext: slotChild.props?.customNext || null,
              isHidden: slotChild.props?.hide || false,
            },
          ];
        }

        if (Array.isArray(slotChild.children)) {
          return slotChild.children
            .filter((child: any) => child.type === AppVerticalStep)
            .map((child: any) => ({
              name: child.props?.name || '',
              id: child.props?.id,
              component: child,
              customNext: child.props?.customNext || null,
              isHidden: child.props?.hide || false,
            }));
        }

        return [];
      });

      // si al filtrar quedan menos steps y currentStep se sale del rango, lo ajustamos
      const visibleLen = steps.value.filter((s: any) => !s.isHidden).length;
      if (currentStep.value > visibleLen - 1) currentStep.value = 0;
    };

    renderSteps();

    watch(
      () => slots.default?.(),
      () => renderSteps(),
      { deep: true }
    );

    const visibleSteps = computed(() => steps.value.filter((s: any) => !s.isHidden));

    const selectStep = (index: number, step: any) => {
      currentStep.value = index;
      emit('changeStep', step.id);
    };

    const nextStep = async () => {
      const currentStepComponent = visibleSteps.value[currentStep.value];

      if (currentStepComponent?.customNext) {
        const canProceed = await currentStepComponent.customNext();
        if (!canProceed) return;
      }

      if (currentStep.value < visibleSteps.value.length - 1) {
        currentStep.value++;
      } else {
        props.onFinish();
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) currentStep.value--;
    };

    return { currentStep, nextStep, prevStep, steps, visibleSteps, selectStep };
  },
});
</script>

<style scoped>
/* tus estilos igual */
.app-stepper {
  display: flex;
  gap: 1rem;
  min-width: 100%;
  height: 100%;
  padding: 1rem;
}

.sidebar {
  width: 20%;
  height: 100%;
  overflow-y: auto;
}

.item {
  padding: 1.6rem 1rem;
  border-bottom: 1px solid #dee2e6;
  border-right: 5px solid transparent;
  border-top-right-radius: var(--border-radius-1);
  border-bottom-right-radius: var(--border-radius-1);
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, border-right 0.1s ease;
}

.item:last-child {
  border-bottom: none;
}

.item:hover {
  border-right: 5px solid var(--color-primary);
  background-color: #eee;
}

.item.active {
  border-right: 5px solid var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.step-content {
  flex-grow: 1;
  width: 80%;
  border-left: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  overflow-y: auto !important;
  max-height: calc(100vh - 150px) !important;
}

.footer {
  display: flex;
  justify-content: end;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  gap: 30px;
}

.footer button {
  margin-left: 10px;
}

@media (max-width: 1024px) {
  .app-stepper {
    flex-direction: column;
    gap: 0;
  }

  .sidebar {
    width: 100% !important;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    padding-bottom: 10px;
    border-bottom: 1px solid #dee2e6;
  }

  .sidebar .item {
    flex: 0 0 auto;
    padding: 10px 15px;
    border-bottom: none;
    border-right: none;
    border-radius: 0;
    border-bottom: 3px solid transparent;
  }

  .sidebar .item.active,
  .sidebar .item:hover {
    border-bottom: 3px solid var(--color-primary);
    background-color: transparent;
  }

  .step-content {
    width: 100% !important;
    border-left: none;
    padding: 0;
    height: calc(90%);
  }

  /* .content-wrapper {
    padding: 10px !important;
  } */
}

@media (max-width: 768px) {
  .content-form {
    padding: 15px !important;
  }

  .content-table th,
  .content-table td {
    padding: 0.5rem !important;
    font-size: 0.9rem;
  }

  .content-table {
    display: block;
    overflow-x: auto;
  }

  .table-responsive {
    overflow-x: auto;
    width: 100%;
  }

  .opciones {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }

  .buttons-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .section-content {
    flex-direction: column;
    gap: 10px;
  }

  .section-content button {
    width: 100%;
  }

  .grid-cards {
    grid-template-columns: 1fr;
  }

  .title-form {
    font-size: 16px;
  }

  .footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px !important;
  }
}

@media (max-width: 576px) {
  .content-table th,
  .content-table td {
    padding: 0.4rem !important;
    font-size: 0.85rem;
  }

  .item-card {
    padding: 0 !important;
    margin-bottom: 10px !important;
  }

  .content-form {
    padding: 10px !important;
  }

  .section-content {
    padding: 5px !important;
  }

  .section-content button {
    padding: 5px !important;
  }
}
</style>
