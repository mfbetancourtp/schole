<template>
  <div class="signature-pad">
    <canvas
      ref="canvasRef"
      class="signature-pad__canvas"
      :width="width"
      :height="height"
      @mousedown="startDraw"
      @mousemove="draw"
      @mouseup="endDraw"
      @mouseleave="endDraw"
      @touchstart.prevent="startDraw"
      @touchmove.prevent="draw"
      @touchend.prevent="endDraw"
    ></canvas>
    <div class="signature-pad__actions">
      <span class="signature-pad__hint">{{ hint }}</span>
      <button type="button" class="btn btn-sm btn-outline-secondary signature-pad__clear" :disabled="disabled || isEmpty" @click="clear">
        <AppIcon icon="eraser" class="me-1" />
        {{ clearLabel }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, PropType, watch } from 'vue';
import AppIcon from '../AppIcon.vue';

/**
 * AppSignaturePad — componente reutilizable de firma digital sobre canvas.
 *
 * - `v-model` sincroniza con un `dataURL` (PNG) de la firma. `null` cuando
 *   el pad está vacío.
 * - Soporta trazo con mouse y touch, respetando `devicePixelRatio` para que
 *   la firma se vea nítida en pantallas HiDPI.
 * - Expone `clear()` y los eventos `update:modelValue` / `change`.
 *
 * Pensado para reutilizarse en cualquier formulario que capture firmas
 * (checklists, aceptación de documentos, consentimientos, etc.).
 */
export default defineComponent({
  name: 'AppSignaturePad',

  components: { AppIcon },

  props: {
    modelValue: {
      type: String as PropType<string | null>,
      default: null,
    },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 160 },
    strokeColor: { type: String, default: '#212529' },
    strokeWidth: { type: Number, default: 2 },
    disabled: { type: Boolean, default: false },
    hint: { type: String, default: 'Firma o dibuja aquí' },
    clearLabel: { type: String, default: 'Limpiar' },
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const ctxRef = ref<CanvasRenderingContext2D | null>(null);
    const isDrawing = ref(false);
    const isEmpty = ref(true);
    let lastPoint: { x: number; y: number } | null = null;

    const getCtx = (): CanvasRenderingContext2D | null => {
      if (ctxRef.value) return ctxRef.value;
      const ctx = canvasRef.value?.getContext('2d') ?? null;
      ctxRef.value = ctx;
      return ctx;
    };

    const setupCanvas = (): void => {
      const canvas = canvasRef.value;
      const ctx = getCtx();
      if (!canvas || !ctx) return;

      // Soporte HiDPI: escalamos el buffer interno por devicePixelRatio y
      // mantenemos las dimensiones CSS (props.width / props.height) para el
      // layout, así la firma no queda pixelada en pantallas retina.
      const dpr = window.devicePixelRatio || 1;
      canvas.width = props.width * dpr;
      canvas.height = props.height * dpr;
      canvas.style.width = `${props.width}px`;
      canvas.style.height = `${props.height}px`;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = props.strokeColor;
      ctx.lineWidth = props.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const getPoint = (event: MouseEvent | TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.value;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const isTouch = typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
      const clientX = isTouch ? (event as TouchEvent).touches[0]?.clientX ?? 0 : (event as MouseEvent).clientX;
      const clientY = isTouch ? (event as TouchEvent).touches[0]?.clientY ?? 0 : (event as MouseEvent).clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (event: MouseEvent | TouchEvent): void => {
      if (props.disabled) return;
      isDrawing.value = true;
      lastPoint = getPoint(event);
    };

    const draw = (event: MouseEvent | TouchEvent): void => {
      if (!isDrawing.value || props.disabled) return;
      const ctx = getCtx();
      if (!ctx || !lastPoint) return;

      const point = getPoint(event);
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPoint = point;
      isEmpty.value = false;
    };

    const endDraw = (): void => {
      if (!isDrawing.value) return;
      isDrawing.value = false;
      lastPoint = null;
      const canvas = canvasRef.value;
      if (!canvas || isEmpty.value) return;
      const dataUrl = canvas.toDataURL('image/png');
      emit('update:modelValue', dataUrl);
      emit('change', dataUrl);
    };

    const clear = (): void => {
      const canvas = canvasRef.value;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      isEmpty.value = true;
      emit('update:modelValue', null);
      emit('change', null);
    };

    const onWindowResize = (): void => setupCanvas();

    onMounted(() => {
      setupCanvas();
      window.addEventListener('resize', onWindowResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onWindowResize);
    });

    // Si el padre resetea `modelValue` a `null` (por ejemplo al cambiar de
    // pregunta), limpiamos también el canvas para mantener el estado sincronizado.
    watch(
      () => props.modelValue,
      (v) => {
        if (v === null || v === undefined || v === '') {
          const canvas = canvasRef.value;
          const ctx = getCtx();
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            isEmpty.value = true;
          }
        }
      }
    );

    return { canvasRef, isEmpty, startDraw, draw, endDraw, clear };
  },
});
</script>

<style scoped>
.signature-pad {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.signature-pad__canvas {
  width: 100%;
  max-width: 100%;
  border: 2px dashed var(--color-gray-300, #dee2e6);
  border-radius: 0.5rem;
  background-color: #fff;
  cursor: crosshair;
  touch-action: none;
}

.signature-pad__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.signature-pad__hint {
  font-size: 0.75rem;
  color: var(--color-gray-500, #6c757d);
}

.signature-pad__clear {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
