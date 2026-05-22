<template>
  <div class="program-card">
    <!-- Header: Title, Status, Menu -->
    <div class="program-card__header">
      <div class="program-card__title-section">
        <h3 class="program-card__title" :title="program.name">
          {{ program.name }}
        </h3>
        <!-- <AppBadge class="program-card__status" variant="success" label="Activo" /> -->
      </div>

      <div class="program-card__menu">
        <AppDropdown>
          <template #button>
            <AppIcon icon="ellipsis-v" class="program-card__menu-icon" />
          </template>
          <template #items>
            <li>
              <button class="dropdown-item" @click="$emit('view', program)">Ver detalle</button>
            </li>
            <li>
              <button class="dropdown-item" @click="$emit('edit', program)">Editar</button>
            </li>
            <li>
              <button class="dropdown-item text-danger" @click="$emit('delete', program)">Eliminar</button>
            </li>
          </template>
        </AppDropdown>
      </div>
    </div>

    <!-- Code -->
    <div class="program-card__code">Código: {{ program.code }}</div>

    <!-- Tags -->
    <div class="program-card__tags">
      <span class="program-tag program-tag--primary" v-if="program.educationType">{{ program.educationType.name }}</span>
      <span class="program-tag program-tag--blue" v-if="program.modalityType">{{ program.modalityType.name }}</span>
      <span class="program-tag program-tag--yellow" v-if="program.periodType">{{ program.periodType.name }}</span>
    </div>

    <!-- Metadata -->
    <div class="program-card__meta">
      <div class="program-card__meta-item" v-if="program.programDuration">
        <AppIcon icon="clock" class="program-card__meta-icon" />
        <span>{{ program.programDuration }}</span>
      </div>
      <div class="program-card__meta-item" v-if="program.organization">
        <AppIcon icon="building" class="program-card__meta-icon" />
        <span>{{ program.organization.name }}</span>
      </div>
      <div class="program-card__meta-item" v-if="program.programValue">
        <AppIcon icon="dollar-sign" class="program-card__meta-icon" />
        <span>${{ formatCurrency(program.programValue) }}</span>
      </div>
    </div>

    <!-- Footer: Buttons -->
    <div class="program-card__footer">
      <button class="program-card__btn program-card__btn--primary" @click="$emit('view', program)">
        <AppIcon icon="eye" />
        Ver detalle
      </button>
      <button class="program-card__btn program-card__btn--secondary" @click="$emit('edit', program)">
        <AppIcon icon="edit" />
        Editar
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ProgramDto } from '../dtos/programs.dto';
import AppDropdown from '../../../shared/components/AppDropdown.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'ProgramCard',
  components: {
    AppDropdown,
    AppIcon,
  },
  props: {
    program: {
      type: Object as PropType<ProgramDto>,
      required: true,
    },
  },
  emits: ['view', 'edit', 'delete'],
  setup() {
    const formatCurrency = (value: string | number) => {
      if (!value) return '0';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return new Intl.NumberFormat('es-CO').format(numValue);
    };

    return {
      formatCurrency,
    };
  },
});
</script>

<style scoped>
.program-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.program-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.program-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.program-card__title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.program-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.program-card__menu-icon {
  color: #6b7280;
  font-size: 16px;
}

/* Hide Bootstrap's default dropdown caret */
.program-card__menu :deep(.dropdown-toggle::after) {
  display: none;
}

.program-card__code {
  color: #6b7280;
  font-size: 13px;
}

.program-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.program-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.program-tag--primary {
  background-color: color-mix(in srgb, var(--color-primary), transparent 90%);
  color: var(--color-primary);
}

.program-tag--blue {
  background-color: #dbeafe;
  color: #2563eb;
}

.program-tag--yellow {
  background-color: #fef3c7;
  color: #d97706;
}

.program-card__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto; /* Push footer down */
  padding-bottom: 12px;
}

.program-card__meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.program-card__meta-icon {
  width: 14px;
  color: #9ca3af;
}

.program-card__footer {
  display: flex;
  gap: 8px;
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
}

.program-card__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.program-card__btn--primary {
  background: var(--color-primary);
  color: white;
}

.program-card__btn--primary:hover {
  background: var(--color-secondary);
}

.program-card__btn--secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.program-card__btn--secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
</style>
