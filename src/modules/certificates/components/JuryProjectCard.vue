<template>
  <div class="jury-project-card">
    <!-- Left content -->
    <div class="jury-project-card__left">
      <h4 class="jury-project-card__title">{{ project.title }}</h4>
      <div class="jury-project-card__badges">
        <AppBadge :label="statusLabel" :variant="statusVariant" />
        <AppBadge :label="modalityLabel" variant="ghost" />
      </div>
      <div class="jury-project-card__meta">
        <span>{{ project.studentName }}</span>
        <span class="jury-project-card__separator">&bull;</span>
        <span>Tutor: {{ project.tutorName }}</span>
      </div>
      <div v-if="project.assignedCount > 0" class="jury-project-card__members">
        <AppIcon icon="users" class="jury-project-card__members-icon" />
        <span>{{ project.assignedCount }} de {{ project.totalRequired }} miembros asignados</span>
      </div>
    </div>

    <!-- Right: Assign button -->
    <div class="jury-project-card__right">
      <AppButton label="Asignar Jurado" icon="plus" variant="primary" outlined @click.stop="$emit('assign', project)" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { JuryProjectListItem, JuryAssignmentStatus } from '../dtos/juryAssignment.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

const statusConfig: Record<JuryAssignmentStatus, { label: string; variant: VariantsConstant }> = {
  complete: { label: 'Completo', variant: 'success' },
  partial: { label: 'Parcial', variant: 'warning' },
  unassigned: { label: 'Sin Asignar', variant: 'danger' },
};

export default defineComponent({
  name: 'JuryProjectCard',
  components: { AppBadge, AppIcon, AppButton },
  props: {
    project: {
      type: Object as PropType<JuryProjectListItem>,
      required: true,
    },
  },
  emits: ['assign'],
  setup(props) {
    const statusLabel = computed(() => statusConfig[props.project.status].label);
    const statusVariant = computed(() => statusConfig[props.project.status].variant);
    const modalityLabel = computed(() => (props.project.modality === 'thesis' ? 'Tesis' : 'Proyecto de Grado'));

    return { statusLabel, statusVariant, modalityLabel };
  },
});
</script>

<style scoped>
.jury-project-card {
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
  transition: box-shadow 0.2s ease;
}

.jury-project-card:hover {
  box-shadow: 0px 16px 32px -4px rgba(145, 158, 171, 0.2), 0px 0px 4px 0px rgba(145, 158, 171, 0.24);
}

/* Left */
.jury-project-card__left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.jury-project-card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #212b36;
  margin: 0;
}

.jury-project-card__badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.jury-project-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.jury-project-card__separator {
  color: #919eab;
}

.jury-project-card__members {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
}

.jury-project-card__members-icon {
  font-size: 13px;
  color: #919eab;
}

/* Right */
.jury-project-card__right {
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .jury-project-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .jury-project-card__right {
    align-self: flex-end;
  }
}
</style>
