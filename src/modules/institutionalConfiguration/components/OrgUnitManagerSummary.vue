<template>
  <div v-if="headquarters.length > 0" class="manager-summary">
    <div class="summary-header">
      <h3 class="summary-title">Resumen de Responsables (Sedes)</h3>
      <p class="summary-subtitle">Información consolidada de los encargados actuales. Haz clic para ver detalles.</p>
    </div>

    <div class="summary-grid">
      <div v-for="hq in headquarters" :key="hq.id" class="manager-card" @click="openDetail(hq)">
        <div class="card-icon">🏢</div>
        <div class="card-body">
          <h4 class="card-name">{{ hq.name }}</h4>
          <div v-if="hq.userName" class="card-manager">
            <span class="manager-label">{{ hq.roleName || 'Responsable' }}</span>
            <span class="manager-name">{{ hq.userName }}</span>
          </div>
          <div v-else class="card-no-manager">Sin responsable asignado</div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles (Diseño Ventana Sólida) -->
    <AppModal v-model="showModal" size="lg">
      <div v-if="selectedUnit" class="unit-window">
        <header class="window-header">
          <div class="window-title-group">
            <span class="window-header-icon">🏢</span>
            <h2 class="window-header-title">Detalles de la Sede</h2>
          </div>
          <button class="window-close-x" @click="showModal = false">&times;</button>
        </header>

        <div class="window-body">
          <div class="info-hero-section">
            <h1 class="hero-unit-name">{{ selectedUnit.name }}</h1>
            <div class="hero-labels">
              <span class="badge-type">{{ selectedUnit.organizationType?.name || 'Sede' }}</span>
              <span v-if="selectedUnit.code" class="badge-code">Código: {{ selectedUnit.code }}</span>
            </div>
          </div>

          <div class="info-layout-grid">
            <section class="info-block full-width">
              <h4 class="block-title"><span class="icon">📝</span> Descripción de la Sede</h4>
              <p class="block-text">
                {{ selectedUnit.description || 'Sin descripción detallada disponible para esta unidad organizacional.' }}
              </p>
            </section>

            <section class="info-block">
              <h4 class="block-title"><span class="icon">🆔</span> Identificación Técnica</h4>
              <div class="data-row">
                <label>ID Único (Sistema)</label>
                <p>{{ selectedUnit.id }}</p>
              </div>
              <div class="data-row">
                <label>Tipo Organizacional</label>
                <p>{{ selectedUnit.organizationType?.name }} ({{ selectedUnit.organizationType?.code }})</p>
              </div>
            </section>

            <section class="info-block">
              <h4 class="block-title"><span class="icon">👤</span> Responsable Asignado</h4>
              <div v-if="selectedUnit.userName" class="manager-window-box">
                <div class="manager-window-avatar">👤</div>
                <div class="manager-window-info">
                  <span class="manager-window-role">{{ selectedUnit.roleName || 'Cargo General / Encargado' }}</span>
                  <span class="manager-window-name">{{ selectedUnit.userName }}</span>
                </div>
              </div>
              <div v-else class="manager-empty">
                <span class="icon">⚠️</span>
                <p>Esta sede no cuenta con un responsable asignado en el sistema.</p>
              </div>
            </section>
          </div>
        </div>

        <footer class="window-footer">
          <AppButton label="Cerrar Detalles" variant="primary" outlined @click="showModal = false" />
        </footer>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

interface OrgUnitItem {
  id: string;
  name: string;
  code?: string;
  description?: string | null;
  roleName?: string | null;
  userName?: string | null;
  organizationType?: {
    code?: string;
    name?: string;
  } | null;
  children: OrgUnitItem[];
}

export default defineComponent({
  name: 'OrgUnitManagerSummary',
  components: {
    AppModal,
    AppButton,
  },
  props: {
    units: {
      type: Array as PropType<OrgUnitItem[]>,
      required: true,
    },
  },
  setup(props) {
    const showModal = ref(false);
    const selectedUnit = ref<OrgUnitItem | null>(null);

    const headquarters = computed(() => {
      const result: OrgUnitItem[] = [];

      const traverse = (list: OrgUnitItem[]) => {
        for (const item of list) {
          const isHeadquarter = item.organizationType?.code === 'S' || item.organizationType?.name?.toLowerCase() === 'sede';

          if (isHeadquarter) {
            result.push(item);
          }

          if (item.children?.length) {
            traverse(item.children);
          }
        }
      };

      traverse(props.units);
      return result;
    });

    const openDetail = (unit: OrgUnitItem) => {
      selectedUnit.value = unit;
      showModal.value = true;
    };

    return {
      headquarters,
      showModal,
      selectedUnit,
      openDetail,
    };
  },
});
</script>

<style scoped>
.manager-summary {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.summary-header {
  margin-bottom: 16px;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.summary-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.manager-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  cursor: pointer;
}

.manager-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: var(--color-primary, #2563eb);
}

.card-icon {
  font-size: 24px;
  padding: 10px;
  background: #eff6ff;
  border-radius: 10px;
}

.card-body {
  flex: 1;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 4px 0;
}

.card-manager {
  display: flex;
  flex-direction: column;
}

.manager-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--color-primary, #2563eb);
  letter-spacing: 0.025em;
}

.manager-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.card-no-manager {
  font-size: 13px;
  color: #94a3b8;
  font-style: italic;
}

/* --- ESTILOS DE LA VENTANA (MODAL) --- */
.unit-window {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.window-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.window-header-icon {
  font-size: 20px;
  background: white;
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.window-header-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.window-close-x {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.window-close-x:hover {
  color: #ef4444;
}

.window-body {
  padding: 32px;
  max-height: 70vh;
  overflow-y: auto;
}

.info-hero-section {
  margin-bottom: 32px;
  text-align: center;
}

.hero-unit-name {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.hero-labels {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.badge-type {
  background: var(--color-primary, #2563eb);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-code {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.info-layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.info-block {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.info-block.full-width {
  grid-column: span 2;
}

.block-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.block-text {
  font-size: 15px;
  line-height: 1.6;
  color: #334155;
  margin: 0;
}

.data-row {
  margin-bottom: 12px;
}

.data-row:last-child {
  margin-bottom: 0;
}

.data-row label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.data-row p {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.manager-window-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.manager-window-avatar {
  font-size: 20px;
  background: #eff6ff;
  padding: 8px;
  border-radius: 50%;
}

.manager-window-info {
  display: flex;
  flex-direction: column;
}

.manager-window-role {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary, #2563eb);
  text-transform: uppercase;
}

.manager-window-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.manager-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: #94a3b8;
}

.manager-empty .icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.manager-empty p {
  font-size: 13px;
  margin: 0;
}

.window-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .info-layout-grid {
    grid-template-columns: 1fr;
  }
  .info-block.full-width {
    grid-column: span 1;
  }
}
</style>
