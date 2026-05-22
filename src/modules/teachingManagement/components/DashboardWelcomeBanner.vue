<template>
  <div class="banner">
    <div class="banner__content">
      <h1 class="banner__greeting">¡Bienvenido!</h1>
      <p class="banner__role">{{ role }}</p>
      <div class="banner__badges">
        <span class="banner__badge">
          <AppIcon icon="calendar-alt" />
          {{ period }}
        </span>
        <span class="banner__badge">
          <AppIcon icon="clock" />
          {{ currentDate }}
        </span>
      </div>
    </div>
    <div class="banner__avatar">
      <span class="banner__avatar-initials">{{ initials }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'DashboardWelcomeBanner',
  components: { AppIcon },
  props: {
    teacherName: { type: String, default: 'Carlos' },
    role: { type: String, default: 'Profesor Principal' },
    faculty: { type: String, default: 'Ingeniería' },
    period: {
      type: String,
      default: 'Periodo 2026 - 01 • Enero - Febrero 2026',
    },
    initials: { type: String, default: 'CM' },
  },
  computed: {
    currentDate(): string {
      const now = new Date();
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`;
    },
  },
});
</script>

<style scoped>
.banner {
  background: var(--color-primary);
  border-radius: 20px;
  padding: 32px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

/* .banner::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
} */

.banner__content {
  position: relative;
  z-index: 1;
}

.banner__greeting {
  font-size: 1.7rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 6px;
}

.banner__role {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 18px;
  font-weight: 500;
}

.banner__badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.banner__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 10px;
}

.banner__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.banner__avatar-initials {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}

@media (max-width: 640px) {
  .banner {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  .banner__badges {
    justify-content: center;
  }
  .banner__avatar {
    margin-top: 16px;
  }
}
</style>
