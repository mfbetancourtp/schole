<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <div class="d-flex align-items-center gap-3 w-100">
        <div class="view-icon-wrap">
          <AppIcon icon="eye" />
        </div>
        <div class="flex-grow-1">
          <h6 class="mb-0 text-white fw-bold">Detalle del Área</h6>
          <div v-if="area" class="d-flex align-items-center gap-2 mt-1">
            <span class="text-white-50 small fw-semibold">{{ area.name }}</span>
            <span class="badge-active">Activa</span>
          </div>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="area">
        <!-- Sección 1: Información General -->
        <div class="view-section">
          <div class="section-num">1</div>
          <div class="flex-grow-1">
            <h6 class="section-title">Información General</h6>
            <p class="section-sub">Estadísticas generales del área</p>
            <div class="section-card">
              <div class="row g-3">
                <div class="col-6">
                  <div class="info-field">
                    <AppIcon icon="code" class="field-icon" />
                    <span class="field-label">CÓDIGO</span>
                    <div class="field-value">
                      {{ area.abbreviation || '—' }}
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-field">
                    <AppIcon icon="tag" class="field-icon" />
                    <span class="field-label">NOMBRE DEL ÁREA</span>
                    <div class="field-value">{{ area.name }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-field">
                    <div class="field-icon dot-green"></div>
                    <span class="field-label">ESTADO</span>
                    <div class="field-value">Activa</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-field">
                    <AppIcon icon="calendar" class="field-icon" />
                    <span class="field-label">FECHA DE CREACIÓN</span>
                    <div class="field-value">
                      {{ formatDate(area.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 2: Resumen Académico -->
        <div class="view-section">
          <div class="section-num">2</div>
          <div class="flex-grow-1">
            <h6 class="section-title">Resumen Académico</h6>
            <p class="section-sub">Estadísticas generales del área</p>
            <div class="row g-2">
              <div class="col-6">
                <div class="stat-card stat-blue">
                  <AppIcon icon="book" class="stat-icon" />
                  <div class="stat-label">ASIGNATURAS</div>
                  <div class="stat-value">{{ area.subjects?.length ?? 0 }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-card stat-green">
                  <AppIcon icon="star" class="stat-icon" />
                  <div class="stat-label">CRÉDITOS</div>
                  <div class="stat-value">{{ totalCredits }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-card stat-purple">
                  <AppIcon icon="clock" class="stat-icon" />
                  <div class="stat-label">H. TEÓRICAS</div>
                  <div class="stat-value">0h</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-card stat-orange">
                  <AppIcon icon="tools" class="stat-icon" />
                  <div class="stat-label">H. PRÁCTICAS</div>
                  <div class="stat-value">0h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 3: Asignaturas Asociadas -->
        <div class="view-section" v-if="area.subjects?.length">
          <div class="section-num">3</div>
          <div class="flex-grow-1">
            <h6 class="section-title">Asignaturas Asociadas</h6>
            <p class="section-sub">Lista de {{ area.subjects.length }} asignaturas en esta área</p>
            <div class="section-card p-0">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>NOMBRE</th>
                    <th>TIPO</th>
                    <th>CRÉDITOS</th>
                    <th>HORAS</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sub in area.subjects" :key="sub.id">
                    <td class="small text-primary fw-semibold">
                      {{ sub.abbreviation || '—' }}
                    </td>
                    <td class="small fw-semibold">{{ sub.name }}</td>
                    <td>
                      <span class="badge-type" v-if="sub.subjectType">{{ sub.subjectType }}</span>
                      <span class="text-muted" v-else>—</span>
                    </td>
                    <td class="small">{{ sub.credits ?? '—' }}</td>
                    <td class="small">
                      {{ sub.totalHours ? sub.totalHours + 'h' : '—' }}
                    </td>
                    <td class="small text-muted">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex justify-content-end">
        <AppButton label="Cerrar" variant="primary" :outlined="false" @click="$emit('update:isVisible', false)"></AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { AreaDto } from '../../../shared/dto/area.dto';

export default defineComponent({
  name: 'AreaViewDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
    area: { type: Object as PropType<AreaDto | null>, default: null },
  },
  emits: ['update:isVisible'],
  setup(props) {
    const totalCredits = computed(() => {
      if (!props.area?.subjects) return 0;
      return props.area.subjects.reduce((sum, s) => sum + (s.credits ?? 0), 0);
    });

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '—';
      try {
        return new Date(dateStr).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      } catch {
        return dateStr;
      }
    };

    return { totalCredits, formatDate };
  },
});
</script>

<style scoped>
/* Head */
.view-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.badge-active {
  background: #d1fae5;
  color: #065f46;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

/* Sections */
.view-section {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e8f0fe;
  color: #1e3a8a;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.section-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
  font-size: 0.95rem;
}
.section-sub {
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 12px;
}

.section-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  overflow: hidden;
}

/* Info fields */
.info-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.field-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
}
.field-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: #111827;
}
.field-icon {
  color: #9ca3af;
  font-size: 0.8rem;
}
.dot-green {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

/* Stat cards */
.stat-card {
  border-radius: 10px;
  padding: 14px;
  text-align: left;
}
.stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
}
.stat-icon {
  font-size: 1rem;
  margin-bottom: 4px;
}
.stat-blue {
  background: #eff6ff;
  color: #1d4ed8;
}
.stat-green {
  background: #ecfdf5;
  color: #059669;
}
.stat-purple {
  background: #f5f3ff;
  color: #7c3aed;
}
.stat-orange {
  background: #fff7ed;
  color: #ea580c;
}

/* Subject table */
.table thead th {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  background: #f9fafb;
  padding: 8px 12px;
}
.table tbody td {
  font-size: 0.83rem;
  vertical-align: middle;
  padding: 8px 12px;
}
.badge-type {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 6px;
}
</style>
