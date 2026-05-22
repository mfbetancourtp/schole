<template>
  <div class="card">
    <h2 class="card__title">Total evaluaciones resueltas</h2>

    <!-- Chart -->
    <div class="chartWrap">
      <VueApexCharts type="donut" height="260" :options="chartOptions" :series="series" />
    </div>

    <!-- Legend / Stats list (igual al ejemplo React) -->
    <div class="legend">
      <div class="legendRow">
        <div class="legendRow__left">
          <span class="dot dot--completed"></span>
          <span class="legendRow__label">Completadas</span>
        </div>
        <span class="legendRow__value">{{ completed }}</span>
      </div>

      <div class="legendRow">
        <div class="legendRow__left">
          <span class="dot dot--pending"></span>
          <span class="legendRow__label">Pendientes</span>
        </div>
        <span class="legendRow__value">{{ pending }}</span>
      </div>

      <div class="legendTotal">
        <span class="legendTotal__label">Total</span>
        <span class="legendTotal__value">{{ total }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

export default defineComponent({
  name: 'ParticipationCard',
  components: {
    VueApexCharts,
  },
  props: {
    completed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    rate: { type: String, default: '0%' },
  },
  setup(props) {
    const total = computed(() => {
      const c = Number(props.completed) || 0;
      const p = Number(props.pending) || 0;
      return c + p;
    });

    const completedPercentage = computed(() => {
      // Usa el rate si se proporciona, de lo contrario calcula
      if (props.rate) {
        return parseInt(props.rate, 10);
      }
      if (!total.value) return 0;
      return Math.round(((props.completed || 0) / total.value) * 100);
    });

    const series = computed(() => [props.completed || 0, props.pending || 0]);

    const chartOptions = computed(() => {
      return {
        chart: {
          type: 'donut',
          toolbar: { show: false },
        },
        labels: ['Completadas', 'Pendientes'],

        // colores iguales al ejemplo React
        colors: ['#2563eb', '#cbd5e1'],

        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${Math.round(val)}%`,
          style: {
            fontSize: '12px',
            fontWeight: 700,
          },
        },

        tooltip: {
          y: {
            formatter: (value: number) => `${value} evaluaciones`,
          },
        },

        legend: {
          show: false, // la leyenda la pintamos abajo (como tu diseño)
        },

        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: { show: false },
                value: { show: false },
                total: {
                  show: true,
                  label: 'Completadas',
                  formatter: () => `${completedPercentage.value}%`,
                },
              },
            },
          },
        },

        stroke: {
          width: 0,
        },
      };
    });

    return {
      total,
      series,
      chartOptions,
    };
  },
});
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.06);
}

.card__title {
  margin: 0 0 16px;
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
}

/* Chart area */
.chartWrap {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Legend */
.legend {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legendRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.legendRow__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}
.dot--completed {
  background: #2563eb;
}
.dot--pending {
  background: #cbd5e1;
}

.legendRow__label {
  color: #475569;
}

.legendRow__value {
  font-weight: 800;
  color: #0f172a;
}

.legendTotal {
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
}

.legendTotal__label {
  color: #475569;
}

.legendTotal__value {
  color: #0f172a;
}
</style>
