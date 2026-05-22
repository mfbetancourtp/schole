<template>
  <div class="quick">
    <h3 class="quick__title">Accesos Rápidos</h3>
    <div class="quick__grid">
      <button v-for="(item, index) in shortcuts" :key="index" class="quick__item" @click="handleClick(item)">
        <div class="quick__item-icon" :style="{ background: item.bgColor }">
          <AppIcon :icon="item.icon" :style="{ color: item.iconColor }" />
        </div>
        <span class="quick__item-label">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

interface Shortcut {
  icon: string;
  label: string;
  bgColor: string;
  iconColor: string;
  route?: string;
}

export default defineComponent({
  name: 'DashboardQuickAccess',
  components: { AppIcon },
  setup() {
    const shortcuts: Shortcut[] = [
      {
        icon: 'calendar-alt',
        label: 'Mi Horario',
        bgColor: '#dbeafe',
        iconColor: '#3b82f6',
      },
      {
        icon: 'check-circle',
        label: 'Mi Asistencia',
        bgColor: '#dcfce7',
        iconColor: '#22c55e',
      },
      {
        icon: 'book-open',
        label: 'Mis Cursos',
        bgColor: '#f3e8ff',
        iconColor: '#9333ea',
      },
      {
        icon: 'dollar-sign',
        label: 'Honorarios',
        bgColor: '#fef3c7',
        iconColor: '#f59e0b',
      },
    ];

    const handleClick = (item: Shortcut) => {
      console.log('Quick access:', item.label);
    };

    return { shortcuts, handleClick };
  },
});
</script>

<style scoped>
.quick {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.quick__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px;
}

.quick__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  background: #f8fafc;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.quick__item:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.quick__item-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.quick__item-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
}

@media (max-width: 640px) {
  .quick__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
