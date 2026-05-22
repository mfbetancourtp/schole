<template>
  <div class="sc">
    <!-- Image -->
    <div class="sc__img-wrap">
      <img :src="scholarship.image || defaultImage" class="sc__img" alt="beca" @error="onImageError" />
      <div class="sc__img-overlay">
        <div class="sc__badges-col">
          <span class="sc__status-badge" :class="`sc__status-badge--${scholarship.status}`">
            {{ statusLabel }}
          </span>
          <span class="sc__year-badge">{{ scholarship.year }}</span>
        </div>
        <span class="sc__slots-badge">{{ scholarship.availableSlots }} cupos</span>
      </div>
    </div>

    <!-- Body -->
    <div class="sc__body">
      <div class="sc__title-row">
        <span class="sc__icon" :class="`sc__icon--${scholarship.iconColor}`">
          <AppIcon :icon="scholarship.icon" />
        </span>
        <h3 class="sc__title">{{ scholarship.name }}</h3>
      </div>

      <p v-if="scholarship.description" class="sc__description">
        {{ scholarship.description }}
      </p>

      <!-- Coverage + Deadline -->
      <div class="sc__meta">
        <div>
          <p class="sc__meta-label">Cobertura</p>
          <p class="sc__meta-value">{{ scholarship.coverage }}</p>
        </div>
        <div>
          <p class="sc__meta-label">Fecha límite</p>
          <p class="sc__meta-value" :class="{ 'sc__deadline--close': scholarship.isDeadlineClose }">
            <AppIcon v-if="scholarship.isDeadlineClose" icon="calendar-times" class="sc__icon-inline" />
            {{ scholarship.deadline }}
          </p>
        </div>
      </div>

      <!-- Requirements -->
      <div class="sc__requirements">
        <p class="sc__req-title">Requisitos principales:</p>
        <ul class="sc__req-list">
          <li v-for="(req, i) in visibleRequirements" :key="i">
            <AppIcon icon="check-circle" class="sc__req-check" />
            {{ req }}
          </li>
          <li v-if="scholarship.requirements.length > 3" class="sc__req-more">+ {{ scholarship.requirements.length - 3 }} requisito(s) más</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="sc__footer">
      <button class="sc__btn sc__btn--outline" @click="$emit('detail', scholarship)">Ver detalle</button>
      <button class="sc__btn" :class="scholarship.canApply ? 'sc__btn--primary' : 'sc__btn--secondary'" :disabled="!scholarship.canApply" @click="scholarship.canApply && $emit('apply', scholarship)">
        {{ scholarship.canApply ? 'Postular' : 'Próximamente' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import type { ScholarshipDto } from '../dtos/scholarship.dto';

export default defineComponent({
  name: 'ScholarshipCard',
  components: { AppIcon },
  emits: ['detail', 'apply'],
  props: {
    scholarship: { type: Object as PropType<ScholarshipDto>, required: true },
  },
  setup(props) {
    const defaultImage = ref(ImageNotAvailable);

    const onImageError = (e: Event) => {
      (e.target as HTMLImageElement).src = ImageNotAvailable;
    };

    const statusLabel = computed(() => {
      const map: Record<string, string> = {
        active: 'Activo',
        upcoming: 'Próximamente',
        closed: 'Cerrado',
      };
      return map[props.scholarship.status] ?? props.scholarship.status;
    });

    const visibleRequirements = computed(() => props.scholarship.requirements.slice(0, 3));

    return { defaultImage, onImageError, statusLabel, visibleRequirements };
  },
});
</script>

<style scoped>
.sc {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e4e7ec;
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}
.sc:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Image */
.sc__img-wrap {
  position: relative;
  height: 160px;
  overflow: hidden;
  flex-shrink: 0;
}
.sc__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sc__img-overlay {
  position: absolute;
  inset: 0;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, transparent 60%);
}

/* Badge column */
.sc__badges-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sc__status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
.sc__status-badge--active {
  background: #16a34a;
}
.sc__status-badge--upcoming {
  background: #ea580c;
}
.sc__status-badge--closed {
  background: #6b7280;
}

.sc__year-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
}
.sc__slots-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  white-space: nowrap;
}

/* Body */
.sc__body {
  flex: 1;
  padding: 14px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sc__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.sc__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 14px;
  flex-shrink: 0;
}
.sc__icon--blue {
  background: #eff6ff;
  color: #2563eb;
}
.sc__icon--green {
  background: #f0fdf4;
  color: #16a34a;
}
.sc__icon--orange {
  background: #fff7ed;
  color: #ea580c;
}
.sc__icon--purple {
  background: #faf5ff;
  color: #9333ea;
}
.sc__icon--teal {
  background: #f0fdfa;
  color: #0d9488;
}
.sc__icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}

.sc__title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}
.sc__description {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Meta */
.sc__meta {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}
.sc__meta-label {
  font-size: 10px;
  color: #94a3b8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.sc__meta-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.sc__deadline--close {
  color: #dc2626 !important;
}
.sc__icon-inline {
  font-size: 11px;
}

/* Requirements */
.sc__requirements {
  flex: 1;
}
.sc__req-title {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}
.sc__req-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sc__req-list li {
  font-size: 11px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 5px;
}
.sc__req-check {
  color: #16a34a;
  font-size: 11px;
  flex-shrink: 0;
}
.sc__req-more {
  color: #94a3b8;
  font-size: 11px;
}

/* Footer */
.sc__footer {
  padding: 10px 16px 14px;
  display: flex;
  gap: 8px;
}
.sc__btn {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1.4;
}
.sc__btn--primary {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.sc__btn--primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}
.sc__btn--secondary {
  background: #6b7280;
  color: #fff;
  border-color: #6b7280;
  cursor: not-allowed;
  opacity: 0.7;
}
.sc__btn--outline {
  background: transparent;
  color: #374151;
  border-color: #d1d5db;
}
.sc__btn--outline:hover {
  background: #f9fafb;
}
</style>
