<template>
  <div class="defense-detail">
    <!-- Estado -->
    <div class="defense-detail__section">
      <h4 class="defense-detail__label">{{ t('Estado') }}</h4>
      <AppBadge :label="statusLabel" :variant="statusVariant" />
    </div>

    <!-- Estudiante -->
    <div class="defense-detail__section">
      <h4 class="defense-detail__label">{{ t('Estudiante') }}</h4>
      <p class="defense-detail__value">{{ detail.studentName }}</p>
    </div>

    <!-- Tutor -->
    <div class="defense-detail__section">
      <h4 class="defense-detail__label">{{ t('Tutor') }}</h4>
      <p class="defense-detail__value">{{ detail.tutorName }}</p>
    </div>

    <!-- Fecha y Horario -->
    <div class="defense-detail__row">
      <div class="defense-detail__section">
        <h4 class="defense-detail__label">{{ t('Fecha') }}</h4>
        <p class="defense-detail__value">
          <AppIcon icon="calendar-alt" class="defense-detail__inline-icon" />
          {{ detail.date }}
        </p>
      </div>
      <div class="defense-detail__section">
        <h4 class="defense-detail__label">{{ t('Horario') }}</h4>
        <p class="defense-detail__value">
          <AppIcon icon="clock" class="defense-detail__inline-icon" />
          {{ detail.timeRange }}
        </p>
      </div>
    </div>

    <!-- Modalidad -->
    <div class="defense-detail__section">
      <h4 class="defense-detail__label">{{ t('Modalidad') }}</h4>
      <AppBadge variant="ghost">
        <AppIcon :icon="modalityIcon" class="defense-detail__modality-icon" />
        {{ modalityLabel }}
      </AppBadge>
    </div>

    <!-- Ubicación -->
    <div class="defense-detail__section">
      <h4 class="defense-detail__label">{{ t('Ubicación') }}</h4>
      <p class="defense-detail__value">{{ detail.location }}</p>
    </div>

    <!-- Enlace de Reunión (solo virtual) -->
    <div v-if="detail.meetingLink" class="defense-detail__section">
      <h4 class="defense-detail__label">{{ t('Enlace de Reunión') }}</h4>
      <p class="defense-detail__link">{{ detail.meetingLink }}</p>
    </div>

    <!-- Jurado Evaluador -->
    <div class="defense-detail__section">
      <h4 class="defense-detail__label">{{ t('Jurado Evaluador') }}</h4>
      <div class="defense-detail__jury-list">
        <div v-for="member in detail.jury" :key="member.id" class="jury-card">
          <AppAvatar :name="member.name" size="sm" />
          <span class="jury-card__name">{{ member.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DefenseDetail } from '../dtos/defenseCalendar.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';

export default defineComponent({
  name: 'DefenseDetailDrawer',
  components: { AppBadge, AppIcon, AppAvatar },
  props: {
    detail: {
      type: Object as PropType<DefenseDetail>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const statusLabel = computed(() => {
      if (props.detail.status === 'scheduled') return 'Programada';
      if (props.detail.status === 'completed') return 'Completada';
      return 'Cancelada';
    });

    const statusVariant = computed<VariantsConstant>(() => {
      if (props.detail.status === 'scheduled') return 'primary';
      if (props.detail.status === 'completed') return 'success';
      return 'danger';
    });

    const modalityLabel = computed(() => (props.detail.modality === 'inPerson' ? 'Presencial' : 'Virtual'));

    const modalityIcon = computed(() => (props.detail.modality === 'inPerson' ? 'map-marker-alt' : 'video'));

    return { t, statusLabel, statusVariant, modalityLabel, modalityIcon };
  },
});
</script>

<style scoped>
.defense-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 1rem;
}

.defense-detail__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.defense-detail__label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.defense-detail__value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.defense-detail__inline-icon {
  font-size: 14px;
  color: #919eab;
}

.defense-detail__row {
  display: flex;
  gap: 40px;
}

.defense-detail__row > .defense-detail__section {
  flex: 1;
}

.defense-detail__modality-icon {
  font-size: 13px;
}

.defense-detail__link {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #1b55e2;
  margin: 0;
  word-break: break-all;
}

/* Jury list */
.defense-detail__jury-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jury-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
}

.jury-card__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #212b36;
}
</style>
