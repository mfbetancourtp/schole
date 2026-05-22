<template>
  <div class="catalog-card">
    <div class="catalog-card__icon" :style="{ backgroundColor: iconBgColor }">
      <AppIcon :icon="icon" :style="{ color: iconColor }" />
    </div>

    <h3 class="catalog-card__name">{{ t(name) }}</h3>
    <p class="catalog-card__description">{{ t(description) }}</p>

    <div class="catalog-card__meta">
      <AppBadge v-if="isFree" :label="t('Gratis')" variant="success" />
      <span v-else class="catalog-card__cost">{{ cost }}</span>
      <span class="catalog-card__time">
        <AppIcon icon="clock" class="catalog-card__time-icon" />
        {{ estimatedTime }}
      </span>
    </div>

    <AppButton :label="t('Solicitar')" variant="primary" icon="paper-plane" class="catalog-card__btn" @click="$emit('request')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

export default defineComponent({
  name: 'DocumentCatalogCard',
  components: { AppIcon, AppBadge, AppButton },
  props: {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    iconBgColor: { type: String, default: '#EBF5FF' },
    iconColor: { type: String, default: '#2563EB' },
    cost: { type: String, default: null },
    isFree: { type: Boolean, default: false },
    estimatedTime: { type: String, required: true },
  },
  emits: ['request'],
  setup() {
    const { t } = useI18n();
    return { t };
  },
});
</script>

<style scoped>
.catalog-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s ease;
}

.catalog-card:hover {
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.2), 0px 0px 4px 0px rgba(145, 158, 171, 0.3);
}

.catalog-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.catalog-card__name {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.catalog-card__description {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
  line-height: 1.5;
}

.catalog-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.catalog-card__cost {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
}

.catalog-card__time {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
  display: flex;
  align-items: center;
  gap: 4px;
}

.catalog-card__time-icon {
  font-size: 12px;
}

.catalog-card__btn {
  margin-top: 4px;
  width: 100%;
}
</style>
