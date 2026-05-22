<template>
  <div class="postulation-success">
    <div class="success-icon">
      <AppIcon icon="check-circle" />
    </div>

    <h2 class="success-title">{{ t('¡Postulación enviada con éxito!') }}</h2>
    <p class="success-subtitle">
      {{ t('Su solicitud ha sido registrada y será revisada por el comité académico') }}
    </p>

    <div class="tracking-badge">
      <span class="tracking-badge__label">{{ t('Número de Radicado') }}</span>
      <span class="tracking-badge__number">{{ trackingNumber }}</span>
    </div>

    <div class="next-steps">
      <h4 class="next-steps__title">{{ t('Próximos Pasos') }}</h4>
      <ol class="next-steps__list">
        <li>
          {{ t('El comité académico revisará su propuesta en un plazo de 5-10 días hábiles.') }}
        </li>
        <li>
          {{ t('Recibirá una notificación por correo electrónico con el resultado de la evaluación.') }}
        </li>
        <li>
          {{ t('Si es aprobado, se habilitará el módulo de seguimiento para iniciar su proyecto.') }}
        </li>
      </ol>
    </div>

    <div class="success-actions">
      <AppButton :label="t('Volver a Postulaciones')" variant="primary" icon="arrow-left" @click="$emit('go-back')" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

export default defineComponent({
  name: 'PostulationSuccess',
  components: { AppIcon, AppButton },
  props: {
    trackingNumber: {
      type: String,
      required: true,
    },
  },
  emits: ['go-back'],
  setup() {
    const { t } = useI18n();
    return { t };
  },
});
</script>

<style scoped>
.postulation-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0fff4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #38a169;
  margin-bottom: 1.5rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.success-subtitle {
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 1.5rem;
  max-width: 480px;
}

.tracking-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 2rem;
}

.tracking-badge__label {
  font-size: 0.8rem;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tracking-badge__number {
  background: #ebf8ff;
  color: #2b6cb0;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
}

.next-steps {
  background: #f7fafc;
  border-radius: 0.75rem;
  padding: 1.25rem 1.5rem;
  text-align: left;
  width: 100%;
  max-width: 520px;
  margin-bottom: 2rem;
}

.next-steps__title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.next-steps__list {
  margin: 0;
  padding-left: 1.25rem;
}

.next-steps__list li {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.7;
}

.success-actions {
  display: flex;
  gap: 1rem;
}
</style>
