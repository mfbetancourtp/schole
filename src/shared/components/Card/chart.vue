<template>
  <div class="container-graph w-100">
    <div class="title"></div>

    <div class="content-header">
      <slot name="content-header"></slot>

      <!-- Botón toggle solo en móvil -->
      <div>
        <AppButton v-if="isMobile" @click="showOptions = !showOptions" :label="showOptions ? 'Ocultar opciones' : 'Opciones'" outlined />
      </div>

      <!-- Controles -->
      <div class="controls w-100" v-show="!isMobile || showOptions">
        <div class="control-item">
          <label><b>Paleta de colores</b></label>
          <select @change="updateTheme" :value="currentPalette">
            <option v-for="n in 10" :key="n" :value="`palette${n}`">paleta {{ n }}</option>
          </select>
        </div>

        <div class="control-item">
          <label><b>Tipo de gráfica</b></label>
          <select @change="updateType" :value="chartType">
            <option value="area">Área</option>
            <option value="line">Línea</option>
            <option value="bar">Barra</option>
          </select>
        </div>
      </div>
    </div>

    <div class="content-body">
      <AppEmptyResponse v-if="!hasData" title="No hay datos para mostrar en la gráfica" :showImage="true" size="sm" :subtitle="false" />
      <VueApexCharts v-else :key="chartType" :type="chartType" width="100%" height="350" :options="dataOptionsGraph" :series="computedSeries" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import AppEmptyResponse from '../AppEmptyResponse.vue';
import AppButton from '../Buttons/AppButton.vue';

export default defineComponent({
  name: 'ChartComponent',
  components: { VueApexCharts, AppEmptyResponse, AppButton },

  props: {
    typeGraph: { type: String, default: 'area' },
    dataDashboard: { type: Array as () => any[], default: () => [] },
    dataOptions: { type: Object as () => any, default: () => ({}) },
    initialPalette: { type: String, default: 'palette1' },
  },

  setup(props) {
    const chartType = ref<'area' | 'line' | 'bar'>((props.typeGraph as any) || 'area');
    const currentPalette = ref(props.initialPalette);

    // ---- Responsive (botón Opciones en móvil) ----
    const isMobile = ref(false);
    const showOptions = ref(true);

    const handleResize = () => {
      isMobile.value = window.innerWidth < 768;
    };

    onMounted(() => {
      handleResize();
      // En móvil ocultamos por defecto; en desktop mostramos siempre
      showOptions.value = !isMobile.value;
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    // Si cambia el breakpoint, aseguramos el estado correcto
    watch(isMobile, (val) => {
      showOptions.value = !val;
    });

    // ---- Opciones ApexCharts ----
    const dataOptionsGraph = ref({
      ...props.dataOptions,
      chart: {
        ...(props.dataOptions.chart ?? {}),
        type: chartType.value,
        zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
          autoSelected: 'zoom',
        },
      },
      theme: { palette: currentPalette.value },
    });

    const computedSeries = computed(() => props.dataDashboard);
    const hasData = computed(() => props.dataDashboard.length > 0);

    const updateTheme = (e: Event) => {
      const p = (e.target as HTMLSelectElement).value;
      currentPalette.value = p;
      dataOptionsGraph.value = {
        ...dataOptionsGraph.value,
        theme: { ...dataOptionsGraph.value.theme, palette: p },
      };
    };

    const updateType = (e: Event) => {
      const newType = (e.target as HTMLSelectElement).value as 'area' | 'line' | 'bar';
      chartType.value = newType;
      dataOptionsGraph.value = {
        ...dataOptionsGraph.value,
        chart: { ...dataOptionsGraph.value.chart, type: newType },
      };
    };

    return {
      chartType,
      currentPalette,
      dataOptionsGraph,
      computedSeries,
      updateTheme,
      updateType,
      hasData,
      // responsive
      isMobile,
      showOptions,
    };
  },
});
</script>

<style scoped>
.container-graph {
  display: flex;
  flex-direction: column;
  background: #fff !important;
  border-radius: 16px;
  padding: 14px;
  height: 100%;
  gap: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.08);
}

.content-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-family: 'Roboto';
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: var(--text-primary, #212b36);
}

/* Desktop: controles en línea, sin botón */
@media (min-width: 768px) {
  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .toggle-options {
    display: none;
  }
}

/* Móvil: botón visible y controles apilados ancho completo */
@media (max-width: 767px) {
  .toggle-options {
    align-self: flex-end;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #dfe3e8;
    background: #fff;
    cursor: pointer;
    font-weight: 600;
  }
  .toggle-options:active {
    transform: translateY(1px);
  }
  .controls {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }
  .control-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .controls select {
    width: 100%;
  }
}

.controls label {
  margin: 0;
  color: #374151;
}
.controls select {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #1f2937;
}

::v-deep .apexcharts-toolbar {
  z-index: 5 !important;
}
</style>
