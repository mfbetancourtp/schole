<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <AppDrawerHeader variant="view" :icon="scholarship.icon || 'graduation-cap'" :title="scholarship.name" :subtitle="scholarship.typeLabel" />
    </template>

    <template #body>
      <div class="sd-body">
        <!-- Image with status badge -->
        <div class="sd-img-wrap">
          <img :src="scholarship.image || defaultImage" class="sd-img" alt="beca" @error="onImageError" />
          <span class="sd-status-badge" :class="`sd-status-badge--${scholarship.status}`"> ● {{ statusLabel }} </span>
        </div>

        <!-- Info Cards 2×2 -->
        <div class="sd-cards-row">
          <div class="sd-info-card sd-info-card--blue">
            <p class="sd-info-card__label"><AppIcon icon="dollar-sign" class="sd-icon-inline" />Cobertura</p>
            <p class="sd-info-card__value">{{ scholarship.coverage }}</p>
          </div>
          <div class="sd-info-card sd-info-card--green">
            <p class="sd-info-card__label"><AppIcon icon="user-friends" class="sd-icon-inline" />Cupos</p>
            <p class="sd-info-card__value">{{ scholarship.availableSlots }} disponibles</p>
          </div>
          <div class="sd-info-card sd-info-card--purple">
            <p class="sd-info-card__label"><AppIcon icon="calendar" class="sd-icon-inline" />Periodo</p>
            <p class="sd-info-card__value">{{ scholarship.year }}</p>
          </div>
          <div class="sd-info-card" :class="scholarship.isDeadlineClose ? 'sd-info-card--red' : 'sd-info-card--orange'">
            <p class="sd-info-card__label"><AppIcon icon="clock" class="sd-icon-inline" />Fecha límite</p>
            <p class="sd-info-card__value">{{ scholarship.deadline }}</p>
          </div>
        </div>

        <!-- Requirements -->
        <div class="sd-section" v-if="scholarship.requirements && scholarship.requirements.length">
          <div class="sd-section__header">
            <span class="sd-section__icon">
              <AppIcon icon="file-alt" />
            </span>
            <span class="sd-section__title">Requisitos de Elegibilidad</span>
          </div>
          <ul class="sd-req-list">
            <li v-for="(req, i) in scholarship.requirements" :key="i">
              <AppIcon icon="check-circle" class="sd-req-check" />
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Additional info -->
        <div class="sd-info-box" v-if="scholarship.additionalInfo">
          <AppIcon icon="info-circle" class="sd-info-box__icon" />
          <div>
            <p class="sd-info-box__title">Información Adicional</p>
            <p class="sd-info-box__text">{{ scholarship.additionalInfo }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="sd-footer">
        <AppButton v-if="scholarship.canApply" :outlined="false" @click="$emit('apply', scholarship)"> Postular a esta Beca </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import type { ScholarshipDto } from '../dtos/scholarship.dto';

export default defineComponent({
  name: 'ScholarshipDetailModal',
  components: { AppDrawer, AppDrawerHeader, AppButton, AppIcon },
  emits: ['update:isVisible', 'apply'],
  props: {
    isVisible: { type: Boolean, default: false },
    scholarship: { type: Object as PropType<ScholarshipDto>, required: true },
  },
  setup(props) {
    const defaultImage = ref(ImageNotAvailable);

    const onImageError = (e: Event) => {
      (e.target as HTMLImageElement).src = ImageNotAvailable;
    };

    const statusLabel = computed(() => {
      const map: Record<string, string> = {
        active: 'Activa',
        upcoming: 'Próximamente',
        closed: 'Cerrada',
      };
      return map[props.scholarship.status] ?? props.scholarship.status;
    });

    return { defaultImage, onImageError, statusLabel };
  },
});
</script>

<style scoped>
/* Footer */
.sd-footer {
  display: flex;
  justify-content: flex-end;
}

/* Body wrapper — matches project padding standard */
.sd-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Image */
.sd-img-wrap {
  position: relative;
  height: 180px;
  overflow: hidden;
  border-radius: 10px;
}
.sd-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sd-status-badge {
  position: absolute;
  top: 10px;
  left: 12px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.sd-status-badge--active {
  background: #16a34a;
}
.sd-status-badge--upcoming {
  background: #ea580c;
}
.sd-status-badge--closed {
  background: #6b7280;
}

/* Info cards */
.sd-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.sd-info-card {
  border-radius: 10px;
  padding: 10px 14px;
}
.sd-info-card--blue {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}
.sd-info-card--green {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.sd-info-card--purple {
  background: #faf5ff;
  border: 1px solid #e9d5ff;
}
.sd-info-card--orange {
  background: #fff7ed;
  border: 1px solid #fed7aa;
}
.sd-info-card--red {
  background: #fff1f2;
  border: 1px solid #fecdd3;
}

.sd-info-card__label {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.sd-info-card--blue .sd-info-card__label {
  color: #2563eb;
}
.sd-info-card--green .sd-info-card__label {
  color: #16a34a;
}
.sd-info-card--purple .sd-info-card__label {
  color: #9333ea;
}
.sd-info-card--orange .sd-info-card__label {
  color: #ea580c;
}
.sd-info-card--red .sd-info-card__label {
  color: #dc2626;
}

.sd-info-card__value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.sd-icon-inline {
  margin-right: 4px;
}

/* Requirements section */
.sd-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
}
.sd-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.sd-section__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 14px;
  flex-shrink: 0;
}
.sd-section__title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.sd-req-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sd-req-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}
.sd-req-check {
  color: #16a34a;
}

/* Info box */
.sd-info-box {
  display: flex;
  gap: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 12px 14px;
}
.sd-info-box__icon {
  color: #2563eb;
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}
.sd-info-box__title {
  font-size: 13px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 2px;
}
.sd-info-box__text {
  font-size: 12px;
  color: #1e40af;
  margin: 0;
}
</style>
