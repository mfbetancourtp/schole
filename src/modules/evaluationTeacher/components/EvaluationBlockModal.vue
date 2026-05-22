<template>
  <AppModal v-model="store.showBlockModal" size="md">
    <AppFormModal v-if="store.showBlockModal" title="Evaluaciones pendientes">
      <template #content>
        <div class="eval-block">
          <AppIcon icon="exclamation-circle" size="3x" class="text-warning" />

          <div class="eval-block__heading">
            <h5 class="eval-block__title">Acceso temporal restringido</h5>
            <p class="eval-block__description">Para poder continuar con otros módulos del sistema, primero debes completar tus evaluaciones pendientes.</p>
          </div>

          <div class="eval-block__warning-card">
            <div class="d-flex align-items-center gap-3">
              <AppIcon icon="clipboard-list" class="text-warning eval-block__card-icon mx-1" />
              <div>
                <p class="eval-block__warning-title">Evaluaciones pendientes</p>
                <p class="eval-block__warning-text">
                  Tienes
                  <strong>{{ requiredCount }} evaluacion{{ requiredCount !== 1 ? 'es' : '' }}</strong>
                  sin completar.
                </p>
              </div>
            </div>
          </div>

          <p class="eval-block__footer-text">Este proceso solo tomará unos minutos y es fundamental para mejorar la calidad educativa.</p>
        </div>
      </template>

      <template #actions>
        <AppButton variant="primary" label="Ir a Mis Evaluaciones" icon="arrow-right" @click="goToEvaluations" />
      </template>
    </AppFormModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { usePendingEvaluationsStore } from '../../../stores/pendingEvaluations.store';
import { PendingEvaluationsService } from '../../../shared/services/pendingEvaluations.service';

const pendingEvaluationsService = new PendingEvaluationsService();

export default defineComponent({
  name: 'EvaluationBlockModal',
  components: { AppModal, AppFormModal, AppButton, AppIcon },
  setup() {
    const store = usePendingEvaluationsStore();
    const router = useRouter();

    const requiredCount = computed(() => pendingEvaluationsService.get()?.required ?? 0);

    function goToEvaluations() {
      store.closeModal();
      router.push({ name: 'evaluation-teacher.MyEvaluations' });
    }

    return { store, requiredCount, goToEvaluations };
  },
});
</script>

<style scoped lang="scss">
.eval-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
  padding: 4px 0 8px;

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  &__description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.6;
  }

  &__warning-card {
    width: 100%;
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 10px;
    padding: 14px 16px;
    text-align: left;
  }

  &__card-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  &__warning-title {
    font-weight: 600;
    font-size: 14px;
    color: #92400e;
    margin: 0 0 4px;
  }

  &__warning-text {
    font-size: 14px;
    color: #78350f;
    margin: 0;

    strong {
      font-weight: 700;
    }
  }

  &__footer-text {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }
}
</style>
