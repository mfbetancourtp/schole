<template>
  <div class="metrics-highlight-card" :style="{ borderLeftColor: iconBgColor }">
    <div class="metrics-highlight-card__icon-wrapper" :style="{ backgroundColor: iconBgColor }">
      <AppIcon :icon="icon" class="metrics-highlight-card__icon" :style="{ color: iconColor }" />
    </div>
    <div class="metrics-highlight-card__content">
      <span class="metrics-highlight-card__title">{{ title }}</span>
      <span class="metrics-highlight-card__value">{{ value }}</span>
      <span class="metrics-highlight-card__description">{{ description }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'MetricsHighlightCard',
  components: { AppIcon },
  props: {
    icon: { type: String, required: true },
    iconBgColor: { type: String, default: '#EBF5FF' },
    iconColor: { type: String, default: '#2563EB' },
    title: { type: String, required: true },
    value: { type: String, required: true },
    description: { type: String, default: '' },
  },
});
</script>

<style scoped>
.metrics-highlight-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-left: 4px solid transparent;
}

.metrics-highlight-card__icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metrics-highlight-card__icon {
  font-size: 18px;
}

.metrics-highlight-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metrics-highlight-card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #919eab;
}

.metrics-highlight-card__value {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
}

.metrics-highlight-card__description {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin-top: 2px;
}
</style>
