<template>
  <div class="service-card">
    <!-- Top row: icon + toggle -->
    <div class="service-card__top">
      <div class="service-card__icon-wrap">
        <AppIcon :icon="service.icon" class="service-card__icon" />
      </div>
      <div class="service-card__toggle">
        <o-switch v-model="isActive" @update:modelValue="onToggle" />
        <span class="service-card__toggle-label">{{ isActive ? 'Activo' : 'Inactivo' }}</span>
      </div>
    </div>

    <!-- Name -->
    <h3 class="service-card__name">{{ service.name }}</h3>

    <!-- Pending badge -->
    <div v-if="service.pendingCount > 0" class="service-card__pending">{{ service.pendingCount }} solicitudes pendientes</div>
    <div v-else class="service-card__pending service-card__pending--empty">Sin solicitudes pendientes</div>

    <!-- Actions -->
    <div class="service-card__actions">
      <AppButton outlined expanded @click="$emit('edit', service)">
        <AppIcon icon="pencil-alt" class="me-1" />
        Editar
      </AppButton>
      <AppButton variant="danger" expanded @click="$emit('delete', service)">
        <AppIcon icon="trash" class="me-1" />
        Eliminar
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { ServiceConfig } from '../dtos/serviceConfig.dto';

const props = defineProps<{ service: ServiceConfig }>();
const emit = defineEmits<{
  (e: 'edit', service: ServiceConfig): void;
  (e: 'delete', service: ServiceConfig): void;
  (e: 'toggle', service: ServiceConfig): void;
}>();

const isActive = ref(props.service.status === 'active');

watch(
  () => props.service.status,
  (val) => {
    isActive.value = val === 'active';
  }
);

function onToggle() {
  emit('toggle', props.service);
}
</script>

<style scoped>
.service-card {
  background: #fff;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.service-card__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 1.2rem;
}

.service-card__toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.service-card__toggle-label {
  font-size: 0.72rem;
  color: #637381;
}

.service-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.service-card__pending {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(255, 171, 0, 0.15);
  color: #b76e00;
  align-self: flex-start;
}

.service-card__pending--empty {
  background: #f0f2f4;
  color: #637381;
}

.service-card__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 4px;
}
</style>
