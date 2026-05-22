<template>
  <div>
    <div class="sectionHead">
      <div class="sectionHead__icon"><AppIcon icon="briefcase" /></div>
      <div>
        <h3 class="sectionHead__title">Perfil Profesional</h3>
        <p class="sectionHead__subtitle">Resumen, competencias y presentación</p>
      </div>
    </div>

    <div class="card">
      <p class="muted">Aquí conectas tu componente real de Perfil Profesional.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'ProfileStep',
  components: { AppIcon },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.sectionHead {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 18px;
}
.sectionHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #1b2e83);
}
.sectionHead__title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}
.sectionHead__subtitle {
  font-size: 14px;
  margin: 2px 0 0;
  color: var(--color-on-surface-variant, #667085);
}
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 14px;
}
.muted {
  color: #667085;
  margin: 0;
}
</style>
