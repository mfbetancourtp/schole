<template>
  <div class="defense-card" @click="$emit('click', defense)">
    <!-- Date block -->
    <div class="defense-card__date">
      <span class="defense-card__day">{{ defense.dayNumber }}</span>
      <span class="defense-card__month">{{ defense.monthShort }}</span>
    </div>

    <!-- Info -->
    <div class="defense-card__content">
      <div class="defense-card__top">
        <span class="defense-card__title">{{ defense.title }}</span>
        <AppBadge :label="statusLabel" :variant="statusVariant" />
        <AppBadge variant="ghost">
          <span class="defense-card__modality-badge">
            <AppIcon :icon="modalityIcon" class="defense-card__modality-icon" />
            {{ modalityLabel }}
          </span>
        </AppBadge>
      </div>
      <div class="defense-card__bottom">
        <span class="defense-card__student">{{ defense.studentName }}</span>
        <span class="defense-card__separator">·</span>
        <span class="defense-card__meta">
          <AppIcon icon="clock" class="defense-card__meta-icon" />
          {{ defense.timeRange }}
        </span>
        <span class="defense-card__separator">·</span>
        <span class="defense-card__meta">
          <AppIcon :icon="defense.modality === 'inPerson' ? 'map-marker-alt' : 'video'" class="defense-card__meta-icon" />
          {{ defense.location }}
        </span>
      </div>
    </div>

    <!-- Edit button -->
    <AppButton variant="primary" outlined icon="edit" @click.stop="$emit('click', defense)" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { DefenseListItem } from '../dtos/defenseCalendar.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

export default defineComponent({
  name: 'DefenseCard',
  components: { AppBadge, AppIcon, AppButton },
  props: {
    defense: {
      type: Object as PropType<DefenseListItem>,
      required: true,
    },
  },
  emits: ['click'],
  setup(props) {
    const statusLabel = computed(() => {
      if (props.defense.status === 'scheduled') return 'Programada';
      if (props.defense.status === 'completed') return 'Completada';
      return 'Cancelada';
    });

    const statusVariant = computed<VariantsConstant>(() => {
      if (props.defense.status === 'scheduled') return 'primary';
      if (props.defense.status === 'completed') return 'success';
      return 'danger';
    });

    const modalityLabel = computed(() => (props.defense.modality === 'inPerson' ? 'Presencial' : 'Virtual'));

    const modalityIcon = computed(() => (props.defense.modality === 'inPerson' ? 'map-marker-alt' : 'video'));

    return {
      statusLabel,
      statusVariant,
      modalityLabel,
      modalityIcon,
    };
  },
});
</script>

<style scoped>
.defense-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: #ffffff;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.defense-card:hover {
  box-shadow: 0px 8px 16px -4px rgba(145, 158, 171, 0.16);
  border-color: rgba(145, 158, 171, 0.32);
}

/* Date block */
.defense-card__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  flex-shrink: 0;
}

.defense-card__day {
  font-family: 'Roboto', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #212b36;
  line-height: 1;
}

.defense-card__month {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Content */
.defense-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.defense-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.defense-card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #212b36;
}

.defense-card__modality-badge {
  display: flex;
  align-items: center;
  gap: 5px;
}

.defense-card__modality-icon {
  font-size: 12px;
}

.defense-card__bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.defense-card__student {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.defense-card__separator {
  color: #c4cdd5;
}

.defense-card__meta {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  display: flex;
  align-items: center;
  gap: 5px;
}

.defense-card__meta-icon {
  font-size: 12px;
}
</style>
