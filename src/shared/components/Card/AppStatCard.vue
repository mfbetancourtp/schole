<template>
  <div class="appStatCard" :class="`appStatCard--${props.variant}`" :style="{ '--app-stat-card-value-size': valueSizeMap[props.valueSize] }">
    <div class="appStatCard__head">
      <p class="appStatCard__label">{{ props.label }}</p>
      <div v-if="props.icon" class="appStatCard__icon" aria-hidden="true">
        <AppIcon :icon="props.icon" />
      </div>
    </div>

    <strong class="appStatCard__value">{{ props.value }}</strong>

    <p v-if="props.caption" class="appStatCard__caption">{{ props.caption }}</p>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '../AppIcon.vue';

/** Variantes de color disponibles.
 *  - blue   → from-blue-50 to-blue-100  (Total, métricas neutras-azules)
 *  - green  → from-green-50 to-green-100 (Activas, disponibles, completadas)
 *  - yellow → from-yellow-50 to-yellow-100 (Advertencia, cercano al límite)
 *  - red    → from-red-50 to-red-100    (Crítico, pendientes, sin disponibilidad)
 *  - gray   → from-slate-50 to-slate-100 (Inactivas, estados neutros)
 *  - white  → blanco puro con borde gris (sin énfasis de color)
 */
type StatCardVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'white';
type StatCardValueSize = 'xs' | 'sm' | 'md';

interface Props {
  /** Etiqueta descriptiva del indicador */
  label: string;
  /** Valor principal — número o texto formateado (ej: "75%", 42) */
  value: string | number;
  /** Texto de apoyo debajo del valor */
  caption?: string;
  /** Paleta de color del fondo */
  variant?: StatCardVariant;
  /** Icono opcional (FontAwesome, sistema del proyecto) */
  icon?: string;
  /** Tamaño del valor principal */
  valueSize?: StatCardValueSize;
}

const props = withDefaults(defineProps<Props>(), {
  caption: undefined,
  variant: 'white',
  icon: undefined,
  valueSize: 'md',
});

const valueSizeMap: Record<StatCardValueSize, string> = {
  xs: '1.35rem',
  sm: '1.65rem',
  md: '2rem',
};
</script>

<style scoped>
.appStatCard {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

/* ── Variantes de color ── */
.appStatCard--white {
  background: #ffffff;
  border-color: #e2e8f0;
}

.appStatCard--blue {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
}

.appStatCard--green {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-color: #a7f3d0;
}

.appStatCard--yellow {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fde68a;
}

.appStatCard--red {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-color: #fecaca;
}

.appStatCard--gray {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-color: #e2e8f0;
}

/* ── Cabecera ── */
.appStatCard__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.appStatCard__label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.appStatCard--blue .appStatCard__label {
  color: #1d4ed8;
}
.appStatCard--green .appStatCard__label {
  color: #15803d;
}
.appStatCard--yellow .appStatCard__label {
  color: #b45309;
}
.appStatCard--red .appStatCard__label {
  color: #b91c1c;
}

/* ── Icono ── */
.appStatCard__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  color: #64748b;
  flex-shrink: 0;
}

.appStatCard--blue .appStatCard__icon {
  color: #1d4ed8;
}
.appStatCard--green .appStatCard__icon {
  color: #15803d;
}
.appStatCard--yellow .appStatCard__icon {
  color: #b45309;
}
.appStatCard--red .appStatCard__icon {
  color: #b91c1c;
}

/* ── Valor ── */
.appStatCard__value {
  display: block;
  font-size: var(--app-stat-card-value-size, 2rem);
  font-weight: 700;
  line-height: 1.1;
  color: #0f172a;
}

.appStatCard--blue .appStatCard__value {
  color: #1e3a5f;
}
.appStatCard--green .appStatCard__value {
  color: #14532d;
}
.appStatCard--yellow .appStatCard__value {
  color: #78350f;
}
.appStatCard--red .appStatCard__value {
  color: #7f1d1d;
}

/* ── Caption ── */
.appStatCard__caption {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.4;
}
</style>
