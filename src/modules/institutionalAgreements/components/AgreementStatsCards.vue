<template>
  <div class="statsCards">
    <div class="statsCard">
      <div class="statsCard__info">
        <span class="statsCard__value">{{ stats.activeAgreements }}</span>
        <span class="statsCard__label">Convenios Activos</span>
      </div>
      <div class="statsCard__icon statsCard__icon--green">
        <AppIcon icon="check-circle" />
      </div>
    </div>

    <div class="statsCard">
      <div class="statsCard__info">
        <span class="statsCard__value">{{ stats.draftAgreements }}</span>
        <span class="statsCard__label">En Borrador</span>
      </div>
      <div class="statsCard__icon statsCard__icon--orange">
        <AppIcon icon="edit" />
      </div>
    </div>

    <div class="statsCard">
      <div class="statsCard__info">
        <span class="statsCard__value">{{ stats.totalApplications }}</span>
        <span class="statsCard__label">Total Postulaciones</span>
      </div>
      <div class="statsCard__icon statsCard__icon--blue">
        <AppIcon icon="users" />
      </div>
    </div>

    <div class="statsCard">
      <div class="statsCard__info">
        <span class="statsCard__value">{{ stats.availableSpots }}</span>
        <span class="statsCard__label">Cupos Disponibles</span>
      </div>
      <div class="statsCard__icon statsCard__icon--purple">
        <AppIcon icon="globe" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import AppIcon from '../../../shared/components/AppIcon.vue';

import { InstitutionalAgreementStatsDto } from '../dtos/institutionalAgreement.dto';

export default defineComponent({
  name: 'AgreementStatsCards',
  components: { AppIcon },
  props: {
    stats: {
      type: Object as PropType<InstitutionalAgreementStatsDto>,
      required: true,
    },
  },
});
</script>

<style scoped>
.statsCards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.statsCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
}

.statsCard__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.statsCard__value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-dark, #111827);
  line-height: 1;
}

.statsCard__label {
  font-size: 0.82rem;
  color: var(--color-gray-600, #6b7280);
  font-weight: 500;
}

.statsCard__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.statsCard__icon--green {
  background: #dcfce7;
  color: #16a34a;
}
.statsCard__icon--orange {
  background: #fef3c7;
  color: #d97706;
}
.statsCard__icon--blue {
  background: #dbeafe;
  color: #2563eb;
}
.statsCard__icon--purple {
  background: #ede9fe;
  color: #7c3aed;
}

@media (max-width: 900px) {
  .statsCards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .statsCards {
    grid-template-columns: 1fr;
  }
}
</style>
