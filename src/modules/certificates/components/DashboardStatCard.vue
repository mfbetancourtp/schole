<template>
  <div class="stat-card">
    <div class="stat-card__header">
      <span class="stat-card__label">{{ label }}</span>
      <AppIcon v-if="icon" :icon="icon" class="stat-card__icon" />
    </div>
    <div class="stat-card__body">
      <div class="stat-card__value">{{ value }}</div>
      <div v-if="detail" class="stat-card__detail">{{ detail }}</div>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'DashboardStatCard',
  components: { AppIcon },
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    detail: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
  },
});
</script>

<style scoped>
.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.stat-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #637381;
  letter-spacing: 0.1px;
}

.stat-card__icon {
  font-size: 18px;
  color: #919eab;
}

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card__value {
  font-family: 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #212b36;
  line-height: 1.3;
}

.stat-card__detail {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  letter-spacing: 0.1px;
}
</style>
