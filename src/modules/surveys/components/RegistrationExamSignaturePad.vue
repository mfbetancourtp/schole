<template>
  <div :class="['registration-exam-signature', { 'is-disabled': disabled }]">
    <div class="registration-exam-signature__surface">
      <canvas
        ref="canvasRef"
        class="registration-exam-signature__canvas"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
      ></canvas>
    </div>

    <div class="registration-exam-signature__actions">
      <small>{{ modelValue ? 'Firma registrada en este intento.' : 'Firma dentro del recuadro para continuar.' }}</small>

      <AppButton variant="secondary" outlined :disabled="disabled || !modelValue" @click="clearSignature">Limpiar firma</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';

export default defineComponent({
  name: 'RegistrationExamSignaturePad',
  components: {
    AppButton,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const drawing = ref(false);
    const lastPoint = ref<{ x: number; y: number } | null>(null);

    const getContext = () => canvasRef.value?.getContext('2d') ?? null;

    const drawLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const context = getContext();
      if (!context) return;

      context.strokeStyle = '#0f172a';
      context.lineWidth = 2.4;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    };

    const clearCanvas = () => {
      const canvas = canvasRef.value;
      const context = getContext();
      if (!canvas || !context) return;

      const width = canvas.clientWidth || 560;
      const height = canvas.clientHeight || 220;

      context.clearRect(0, 0, width, height);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    };

    const loadSignature = async () => {
      await nextTick();

      clearCanvas();

      if (!props.modelValue) return;

      const context = getContext();
      const canvas = canvasRef.value;
      if (!context || !canvas) return;

      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.clientWidth || 560, canvas.clientHeight || 220);
      };
      image.src = props.modelValue;
    };

    const syncCanvasSize = async () => {
      await nextTick();

      const canvas = canvasRef.value;
      if (!canvas) return;

      const parentWidth = canvas.parentElement?.clientWidth ?? 560;
      const logicalHeight = 220;
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.max(Math.floor(parentWidth * ratio), 1);
      canvas.height = Math.max(Math.floor(logicalHeight * ratio), 1);
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${logicalHeight}px`;

      const context = getContext();
      if (!context) return;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(ratio, ratio);

      await loadSignature();
    };

    const handleResize = () => {
      void syncCanvasSize();
    };

    const resolvePoint = (event: PointerEvent) => {
      const canvas = canvasRef.value;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const emitSignature = () => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      emit('update:modelValue', canvas.toDataURL('image/png'));
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (props.disabled) return;

      const point = resolvePoint(event);
      if (!point) return;

      drawing.value = true;
      lastPoint.value = point;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!drawing.value || props.disabled) return;

      const point = resolvePoint(event);
      if (!point || !lastPoint.value) return;

      drawLine(lastPoint.value, point);
      lastPoint.value = point;
    };

    const handlePointerUp = () => {
      if (!drawing.value) return;

      drawing.value = false;
      lastPoint.value = null;
      emitSignature();
    };

    const clearSignature = () => {
      clearCanvas();
      emit('update:modelValue', '');
    };

    onMounted(async () => {
      await syncCanvasSize();
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    watch(
      () => props.modelValue,
      async () => {
        await loadSignature();
      }
    );

    return {
      canvasRef,
      clearSignature,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
    };
  },
});
</script>

<style scoped>
.registration-exam-signature {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.registration-exam-signature__surface {
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.registration-exam-signature__canvas {
  display: block;
  width: 100%;
  touch-action: none;
  cursor: crosshair;
}

.registration-exam-signature__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.registration-exam-signature__actions small {
  color: #64748b;
}

.registration-exam-signature.is-disabled .registration-exam-signature__surface {
  background: #f8fafc;
}

.registration-exam-signature.is-disabled .registration-exam-signature__canvas {
  cursor: not-allowed;
}
</style>
