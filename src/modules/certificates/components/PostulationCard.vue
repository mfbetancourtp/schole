<template>
  <div class="postulation-card" @click="$emit('click', postulation)">
    <div class="postulation-card__left">
      <div class="postulation-card__avatars">
        <AppAvatar :name="studentName" size="sm" />
        <AppAvatar v-if="postulation.applicationType === 'En Pareja/Equipo'" name="Eq" size="sm" class="postulation-card__avatar--secondary" />
      </div>

      <div class="postulation-card__info">
        <h4 class="postulation-card__title">{{ postulation.name }}</h4>
        <div class="postulation-card__meta">
          <span class="postulation-card__students">{{ studentName }}</span>
          <AppBadge v-if="postulation.applicationType === 'En Pareja/Equipo'" label="Equipo" variant="ghost" />
        </div>
        <div class="postulation-card__details">
          <span>{{ postulation.faculty.name }}</span>
          <span class="postulation-card__separator">·</span>
          <span>{{ formatDate(postulation.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="postulation-card__right">
      <AppBadge :label="postulation.status" :variant="statusVariant" />
      <span class="postulation-card__modality">{{ postulation.scheduleSettings.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import type { AdminApplicationProjectListItemDto, ApplicationProjectStatus } from '../dtos/applicationProject.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';

const statusVariantMap: Record<ApplicationProjectStatus, VariantsConstant> = {
  Pendiente: 'warning',
  Aprobado: 'success',
  Rechazado: 'danger',
  Cancelado: 'secondary',
};

export default defineComponent({
  name: 'PostulationCard',
  components: { AppBadge, AppAvatar },
  props: {
    postulation: {
      type: Object as PropType<AdminApplicationProjectListItemDto>,
      required: true,
    },
  },
  emits: ['click'],
  setup(props) {
    const studentName = computed(() => {
      const p = props.postulation.user.people;
      return `${p.names} ${p.lastnames}`;
    });

    const statusVariant = computed(() => statusVariantMap[props.postulation.status] ?? 'secondary');

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('es', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    return { studentName, statusVariant, formatDate };
  },
});
</script>

<style scoped>
.postulation-card {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.postulation-card:hover {
  box-shadow: 0px 16px 32px -4px rgba(145, 158, 171, 0.2), 0px 0px 4px 0px rgba(145, 158, 171, 0.24);
}

.postulation-card__left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.postulation-card__avatars {
  display: flex;
  flex-shrink: 0;
}

.postulation-card__avatars :deep(> *) {
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 2px #ffffff;
}

.postulation-card__avatars :deep(> * + *) {
  margin-left: -10px;
  z-index: 0;
}

.postulation-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.postulation-card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
  line-height: 1.4;
}

.postulation-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.postulation-card__students {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.postulation-card__details {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  display: flex;
  align-items: center;
  gap: 4px;
}

.postulation-card__separator {
  font-weight: 700;
}

.postulation-card__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.postulation-card__modality {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

@media (max-width: 700px) {
  .postulation-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .postulation-card__right {
    align-items: flex-start;
    flex-direction: row;
    gap: 12px;
  }
}
</style>
