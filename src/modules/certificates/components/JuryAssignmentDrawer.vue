<template>
  <div class="jury-drawer">
    <!-- Project info card -->
    <div class="jury-drawer__info-card">
      <div class="jury-drawer__info-row">
        <span class="jury-drawer__info-label">Estudiante:</span>
        <span class="jury-drawer__info-value">{{ detail.studentName }}</span>
      </div>
      <div class="jury-drawer__info-row">
        <span class="jury-drawer__info-label">Tutor:</span>
        <span class="jury-drawer__info-value">{{ detail.tutorName }}</span>
      </div>
      <div class="jury-drawer__info-row">
        <span class="jury-drawer__info-label">Facultad:</span>
        <span class="jury-drawer__info-value">{{ detail.faculty }}</span>
      </div>
      <div class="jury-drawer__info-row">
        <span class="jury-drawer__info-label">Modalidad:</span>
        <span class="jury-drawer__info-value">{{ modalityLabel }}</span>
      </div>
    </div>

    <!-- Current jury (only if has assigned members) -->
    <div v-if="detail.currentJury.length > 0" class="jury-drawer__current">
      <h4 class="jury-drawer__section-title">Jurado Actual</h4>
      <div class="jury-drawer__current-list">
        <div v-for="member in detail.currentJury" :key="member.id" class="jury-member-card">
          <div class="jury-member-card__info">
            <span class="jury-member-card__name">{{ member.name }}</span>
            <span class="jury-member-card__role">{{ roleLabels[member.role] }}</span>
          </div>
          <AppBadge :label="member.confirmationStatus === 'confirmed' ? 'Confirmado' : 'Pendiente'" :variant="member.confirmationStatus === 'confirmed' ? 'success' : 'ghost'" />
        </div>
      </div>
    </div>

    <!-- Evaluator selection -->
    <div class="jury-drawer__selection">
      <h4 class="jury-drawer__section-title">Seleccionar Docentes Evaluadores</h4>
      <p class="jury-drawer__selection-hint">Se requiere un jurado de 3 miembros: 1 Presidente y 2 Vocales</p>

      <div class="evaluator-list">
        <div v-for="evaluator in evaluators" :key="evaluator.id" class="evaluator-row" :class="{ 'evaluator-row--selected': isSelected(evaluator.id) }">
          <!-- Checkbox -->
          <label class="evaluator-row__checkbox">
            <input type="checkbox" :checked="isSelected(evaluator.id)" :disabled="!isSelected(evaluator.id) && selectedCount >= 3" @change="toggleEvaluator(evaluator.id)" />
            <span class="evaluator-row__checkmark"></span>
          </label>

          <!-- Content -->
          <div class="evaluator-row__content">
            <div class="evaluator-row__top">
              <span class="evaluator-row__name">{{ evaluator.name }}</span>
              <span class="evaluator-row__department">{{ evaluator.department }}</span>
            </div>
            <div class="evaluator-row__bottom">
              <div class="evaluator-row__specialties">
                <AppBadge v-for="specialty in evaluator.specialties" :key="specialty" :label="specialty" variant="ghost" />
              </div>
              <span class="evaluator-row__projects"> {{ evaluator.activeProjects }} proyectos activos </span>
            </div>
          </div>

          <!-- Role selector (only when selected) -->
          <div v-if="isSelected(evaluator.id)" class="evaluator-row__role">
            <AppSelect :modelValue="getRole(evaluator.id)" @update:modelValue="setRole(evaluator.id, $event)">
              <option value="" disabled>Rol</option>
              <option v-for="role in availableRoles(evaluator.id)" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </AppSelect>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, type PropType } from 'vue';
import type { JuryProjectDetail, EvaluatorOption, JuryRole, SelectedEvaluator } from '../dtos/juryAssignment.dto';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';

const roleLabels: Record<JuryRole, string> = {
  president: 'Presidente',
  vocal_1: 'Vocal 1',
  vocal_2: 'Vocal 2',
};

const allRoles: { value: JuryRole; label: string }[] = [
  { value: 'president', label: 'Presidente' },
  { value: 'vocal_1', label: 'Vocal 1' },
  { value: 'vocal_2', label: 'Vocal 2' },
];

export default defineComponent({
  name: 'JuryAssignmentDrawer',
  components: { AppBadge, AppSelect },
  props: {
    detail: {
      type: Object as PropType<JuryProjectDetail>,
      required: true,
    },
    evaluators: {
      type: Array as PropType<EvaluatorOption[]>,
      required: true,
    },
  },
  setup(props, { expose }) {
    const selections = ref<SelectedEvaluator[]>([]);

    const modalityLabel = computed(() => (props.detail.modality === 'thesis' ? 'Tesis' : 'Proyecto de Grado'));

    const selectedCount = computed(() => selections.value.length);

    const isSelected = (evaluatorId: number) => selections.value.some((s) => s.evaluatorId === evaluatorId);

    const getRole = (evaluatorId: number): string => {
      const found = selections.value.find((s) => s.evaluatorId === evaluatorId);
      return found?.role ?? '';
    };

    const takenRoles = computed(() => selections.value.filter((s) => s.role).map((s) => s.role));

    const availableRoles = (evaluatorId: number) => {
      const currentRole = getRole(evaluatorId);
      return allRoles.filter((r) => r.value === currentRole || !takenRoles.value.includes(r.value));
    };

    const toggleEvaluator = (evaluatorId: number) => {
      if (isSelected(evaluatorId)) {
        selections.value = selections.value.filter((s) => s.evaluatorId !== evaluatorId);
      } else if (selectedCount.value < 3) {
        selections.value.push({ evaluatorId, role: '' as JuryRole });
      }
    };

    const setRole = (evaluatorId: number, role: string) => {
      const entry = selections.value.find((s) => s.evaluatorId === evaluatorId);
      if (entry) {
        entry.role = role as JuryRole;
      }
    };

    const getSelectedEvaluators = (): SelectedEvaluator[] => {
      return selections.value;
    };

    // Initialize selections from preSelected when detail changes
    watch(
      () => props.detail,
      (newDetail) => {
        if (newDetail.preSelectedEvaluators.length > 0) {
          selections.value = newDetail.preSelectedEvaluators.map((s) => ({
            ...s,
          }));
        } else {
          selections.value = [];
        }
      },
      { immediate: true }
    );

    expose({ getSelectedEvaluators });

    return {
      roleLabels,
      modalityLabel,
      selectedCount,
      isSelected,
      getRole,
      availableRoles,
      toggleEvaluator,
      setRole,
    };
  },
});
</script>

<style scoped>
.jury-drawer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Info card */
.jury-drawer__info-card {
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jury-drawer__info-row {
  display: flex;
  gap: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
}

.jury-drawer__info-label {
  font-weight: 600;
  min-width: 90px;
}

.jury-drawer__info-value {
  font-weight: 400;
}

/* Section title */
.jury-drawer__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0 0 12px 0;
}

/* Current jury */
.jury-drawer__current-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jury-member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
}

.jury-member-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.jury-member-card__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.jury-member-card__role {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
}

/* Evaluator selection */
.jury-drawer__selection-hint {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 0 0 16px 0;
}

.evaluator-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.evaluator-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 16px;
  background: #ffffff;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  transition: border-color 0.2s ease;
}

.evaluator-row--selected {
  border-color: rgba(27, 85, 226, 0.3);
  background: rgba(27, 85, 226, 0.02);
}

/* Checkbox */
.evaluator-row__checkbox {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.evaluator-row__checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.evaluator-row__checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #919eab;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.evaluator-row__checkbox input:checked + .evaluator-row__checkmark {
  background: #1b55e2;
  border-color: #1b55e2;
}

.evaluator-row__checkbox input:checked + .evaluator-row__checkmark::after {
  content: '✓';
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.evaluator-row__checkbox input:disabled + .evaluator-row__checkmark {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Content */
.evaluator-row__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.evaluator-row__top {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

/* Name */
.evaluator-row__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
  white-space: nowrap;
}

/* Department */
.evaluator-row__department {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  white-space: nowrap;
}

.evaluator-row__bottom {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Specialties */
.evaluator-row__specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* Projects */
.evaluator-row__projects {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  white-space: nowrap;
  margin-left: auto;
}

/* Role selector */
.evaluator-row__role {
  flex-shrink: 0;
  min-width: 110px;
}

@media (max-width: 768px) {
  .evaluator-row {
    flex-wrap: wrap;
    gap: 10px;
  }

  .evaluator-row__name,
  .evaluator-row__department {
    min-width: auto;
  }

  .evaluator-row__projects {
    text-align: left;
  }
}
</style>
