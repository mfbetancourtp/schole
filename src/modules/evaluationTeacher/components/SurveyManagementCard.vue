<template>
  <div class="card" @click="handleClick">
    <div class="card__top">
      <div class="card__main">
        <h3 class="card__title">
          {{ titleText }}
        </h3>
        <p class="card__desc">
          {{ descriptionText }}
        </p>
      </div>

      <div class="card__actions">
        <span class="badge" :class="badgeClass">
          {{ badgeLabel }}
        </span>

        <button type="button" class="menuBtn" aria-label="Más opciones" @click.stop="$emit('edit', evaluation)">
          <AppIcon icon="moreVertical" />
        </button>
      </div>
    </div>

    <div class="card__meta">
      <div class="metaRow">
        <AppIcon icon="calendar" class="metaRow__icon" />
        <span class="metaRow__text"> {{ startDateText }} - {{ endDateText }} </span>
      </div>

      <div class="metaRow">
        <AppIcon icon="user" class="metaRow__icon" />
        <span class="metaRow__text"> {{ teachersAssignedText }} docentes asignados </span>
      </div>

      <div class="metaRow">
        <AppIcon icon="users" class="metaRow__icon" />
        <span class="metaRow__text"> {{ responsesText }} de {{ totalStudentsText }} respuestas ({{ participationRate }}%) </span>
      </div>

      <!-- Progress bar -->
      <div class="progress">
        <div class="progress__track"></div>
        <div class="progress__fill" :style="{ width: participationRate + '%' }"></div>
      </div>

      <!-- Botón para finalizadas (si lo quieres como el ejemplo) -->
      <button v-if="statusValue === 'finished'" type="button" class="resultsBtn" @click.stop="$emit('results', evaluation)">
        <AppIcon icon="chartBar" />
        Ver Resultados Consolidados
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { ITeacherEvaluation } from '../dtos/applicationAssessments.dto';

type Status = 'draft' | 'active' | 'finished';

export default defineComponent({
  name: 'SurveyManagementCard',
  components: {
    AppIcon,
  },
  props: {
    evaluation: {
      type: Object as () => ITeacherEvaluation,
      required: true,
    },
  },
  emits: ['edit', 'results', 'click'],

  setup(props, { emit }) {
    const titleText = computed(() => (props.evaluation as any).name ?? (props.evaluation as any).title ?? '');
    const descriptionText = computed(() => (props.evaluation as any).description ?? '');

    const startDateText = computed(() => (props.evaluation as any).startDate ?? '—');
    const endDateText = computed(() => (props.evaluation as any).endDate ?? '—');
    const teachersAssignedText = computed(() => (props.evaluation as any).teachersAssigned ?? 0);

    const responses = computed(() => (props.evaluation as any).totalResponses ?? (props.evaluation as any).responses ?? 0);
    const totalStudents = computed(() => (props.evaluation as any).totalStudents ?? 0);

    const participationRate = computed(() => {
      const t = Number(totalStudents.value) || 0;
      const r = Number(responses.value) || 0;
      if (!t) return 0;
      return Math.round((r / t) * 100);
    });

    // status: si viene del backend úsalo; si no, lo deducimos
    const statusValue = computed<Status>(() => {
      const s = (props.evaluation as any).status as Status | undefined;
      if (s) return s;

      // draft: 0 respuestas y no activa
      if (!props.evaluation.isActive && (responses.value ?? 0) === 0) return 'draft';
      return props.evaluation.isActive ? 'active' : 'finished';
    });

    const badgeLabel = computed(() => {
      if (statusValue.value === 'draft') return 'Borrador';
      if (statusValue.value === 'active') return 'Activa';
      return 'Finalizada';
    });

    const badgeClass = computed(() => {
      if (statusValue.value === 'draft') return 'badge--draft';
      if (statusValue.value === 'active') return 'badge--active';
      return 'badge--finished';
    });

    const responsesText = computed(() => String(responses.value ?? 0));
    const totalStudentsText = computed(() => String(totalStudents.value ?? 0));

    function handleClick() {
      emit('click', props.evaluation);
    }

    return {
      titleText,
      descriptionText,
      startDateText,
      endDateText,
      teachersAssignedText,
      responsesText,
      totalStudentsText,
      participationRate,
      statusValue,
      badgeLabel,
      badgeClass,
      handleClick,
    };
  },
});
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 18px;
  transition: box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.08);
}

.card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.card__main {
  flex: 1;
  min-width: 0;
}

.card__title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.card__desc {
  margin: 0;
  font-size: 13px;
  color: #475569;
}

.card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.badge--draft {
  background: #f1f5f9;
  color: #334155;
}
.badge--active {
  background: #dcfce7;
  color: #15803d;
}
.badge--finished {
  background: #dbeafe;
  color: #1d4ed8;
}

.menuBtn {
  border: 0;
  background: transparent;
  padding: 6px;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
}
.menuBtn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.card__meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metaRow {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #475569;
  font-size: 13px;
}
.metaRow__icon {
  color: #64748b;
}
.metaRow__text {
  color: #475569;
}

.progress {
  position: relative;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 4px;
}
.progress__track {
  position: absolute;
  inset: 0;
  background: #f1f5f9;
}
.progress__fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0%;
  background: #2563eb;
  border-radius: 999px;
  transition: width 0.25s ease;
}

.resultsBtn {
  margin-top: 6px;
  width: 100%;
  border: 0;
  background: #2563eb;
  color: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
}
.resultsBtn:hover {
  background: #1d4ed8;
}
</style>
