<template>
  <div class="service-card">
    <div class="service-card__icon-wrap">
      <AppIcon :icon="service.icon" class="service-card__icon" />
    </div>
    <h3 class="service-card__name">{{ service.name }}</h3>
    <p class="service-card__desc">{{ service.description }}</p>
    <AppBadge :label="service.availabilityLabel" :variant="badgeVariant" />
    <AppButton label="Solicitar Cita" variant="primary" class="service-card__btn" @click="$emit('request', service)" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import type { WellnessService } from '../dtos/serviceCatalog.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

export default defineComponent({
  name: 'ServiceCard',
  components: { AppIcon, AppBadge, AppButton },
  props: {
    service: { type: Object as PropType<WellnessService>, required: true },
  },
  emits: ['request'],
  setup(props) {
    const badgeVariant = computed(() => {
      const map: Record<string, string> = {
        today: 'success',
        tomorrow: 'success',
        open: 'ghost',
      };
      return map[props.service.availability] ?? 'primary';
    });
    return { badgeVariant };
  },
});
</script>

<style scoped>
.service-card {
  background: #ffffff;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s ease;
}

.service-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.service-card__icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-card__icon {
  color: var(--color-primary);
  font-size: 18px;
}

.service-card__name {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.service-card__desc {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
  flex: 1;
  line-height: 1.5;
}

.service-card__btn {
  width: 100%;
  margin-top: 4px;
}

:deep(.service-card__btn .o-btn) {
  width: 100%;
  justify-content: center;
}
</style>
