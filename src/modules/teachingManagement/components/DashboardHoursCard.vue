<template>
  <div class="card">
    <!-- Header -->
    <div class="card__header">
      <div class="card__icon">
        <AppIcon icon="dollar-sign" />
      </div>
      <div>
        <h3 class="card__title">Horas del Mes</h3>
        <p class="card__subtitle">Impacto en honorarios</p>
      </div>
    </div>

    <!-- Hours Box -->
    <div class="card__hours-box">
      <div class="card__hours-row">
        <div>
          <span class="card__hours-label">Horas Acumuladas</span>
          <div class="card__hours-big">{{ data.accumulatedHours }}h</div>
        </div>
        <div class="card__hours-right">
          <span class="card__hours-label">Meta Mensual</span>
          <div class="card__hours-goal">{{ data.monthlyGoal }}h</div>
        </div>
      </div>
      <div class="card__progress">
        <div class="card__progress-fill" :style="{ width: data.goalProgress + '%' }"></div>
      </div>
      <span class="card__hours-pct">{{ data.goalProgress }}% de la meta mensual</span>
    </div>

    <!-- Projection -->
    <!-- <div class="card__projection">
      <div class="card__projection-header">
        <span class="card__projection-title">Proyección Honorarios</span>
        <span class="card__projection-trend">
          <AppIcon icon="arrow-up" />
          +{{ data.incomeTrend }}%
        </span>
      </div>
      <div class="card__projection-amounts">
        <div>
          <span class="card__projection-label">Acumulado</span>
          <div class="card__projection-value">S/ {{ formatCurrency(data.projectedIncome) }}</div>
        </div>
        <div class="card__projection-right">
          <span class="card__projection-label">Esperado</span>
          <div class="card__projection-expected">S/ {{ formatCurrency(data.expectedIncome) }}</div>
        </div>
      </div>
    </div> -->

    <!-- Alert -->
    <div class="card__alert">
      <AppIcon icon="lightbulb" class="card__alert-icon" />
      <p class="card__alert-text">
        Necesitas dictar <strong>{{ data.hoursToGoal }} horas más</strong> para alcanzar tu meta mensual
      </p>
    </div>

    <!-- Action -->
    <div class="card__action">
      <button class="card__btn">
        <AppIcon icon="eye" />
        Ver Detalle de Horas
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { MonthlyHoursDto } from '../dtos/teacherDashboard.dto';

export default defineComponent({
  name: 'DashboardHoursCard',
  components: { AppIcon },
  props: {
    data: {
      type: Object as PropType<MonthlyHoursDto>,
      required: true,
    },
  },
  setup() {
    const formatCurrency = (value: number) => {
      return value.toLocaleString('es-PE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    };
    return { formatCurrency };
  },
});
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.card__icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  background: #fef3c7;
  color: #f59e0b;
}
.card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}
.card__subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 2px 0 0;
}

/* Hours Box */
.card__hours-box {
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}
.card__hours-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;
}
.card__hours-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #78716c;
  display: block;
  margin-bottom: 4px;
}
.card__hours-big {
  font-size: 2.8rem;
  font-weight: 800;
  color: #d97706;
  line-height: 1;
  font-style: italic;
}
.card__hours-right {
  text-align: right;
}
.card__hours-goal {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}
.card__progress {
  height: 10px;
  background: rgba(253, 230, 138, 0.5);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}
.card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  border-radius: 6px;
  transition: width 0.6s ease;
}
.card__hours-pct {
  font-size: 0.65rem;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
}

/* Projection */
.card__projection {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e2e8f0;
}
.card__projection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card__projection-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}
.card__projection-trend {
  color: #22c55e;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 3px;
}
.card__projection-amounts {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.card__projection-label {
  font-size: 0.65rem;
  color: #94a3b8;
  display: block;
  margin-bottom: 4px;
}
.card__projection-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}
.card__projection-right {
  text-align: right;
}
.card__projection-expected {
  font-size: 1.1rem;
  font-weight: 700;
  color: #94a3b8;
}

/* Alert */
.card__alert {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}
.card__alert-icon {
  color: #f59e0b;
  font-size: 0.9rem;
  margin-top: 1px;
  flex-shrink: 0;
}
.card__alert-text {
  font-size: 0.72rem;
  color: #1e40af;
  margin: 0;
  line-height: 1.5;
}
.card__alert-text strong {
  font-weight: 700;
}

/* Action */
.card__action {
  margin-top: auto;
}
.card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: #fef3c7;
  color: #92400e;
}
.card__btn:hover {
  background: #fde68a;
}
</style>
