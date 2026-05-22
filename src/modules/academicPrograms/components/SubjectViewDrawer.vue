<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <div class="d-flex align-items-center gap-3 w-100">
        <div class="subject-head-icon">
          <AppIcon icon="book" />
        </div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span v-if="subject" class="code-tag">{{ subject.code || subject.abbreviation || '—' }}</span>
            <span v-if="subject" class="text-white fw-bold">{{ subject.name }}</span>
          </div>
          <div class="text-white-50 small mt-1">Área: {{ areaName || 'Sin área asignada' }}</div>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="subject" class="pb-3">
        <!-- Sección 1: Información General -->
        <div class="view-section">
          <div class="section-head">
            <div class="section-icon-blue">
              <AppIcon icon="clipboard-list" />
            </div>
            <h6 class="section-title">Información General</h6>
          </div>
          <div class="info-card">
            <div class="row g-3">
              <div class="col-6">
                <div class="info-field">
                  <span class="field-label">CÓDIGO</span>
                  <div class="field-value fw-bold">
                    {{ subject.code || subject.abbreviation || '—' }}
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="info-field">
                  <span class="field-label">NOMBRE</span>
                  <div class="field-value fw-bold">{{ subject.name }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="info-field">
                  <span class="field-label">NOMBRE CORTO</span>
                  <div class="field-value">
                    {{ subject.shortName || subject.name }}
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="info-field">
                  <span class="field-label">ÁREA</span>
                  <div class="field-value">
                    {{ areaName || 'Sin área asignada' }}
                  </div>
                </div>
              </div>
              <div class="col-12" v-if="subject.credits !== null && subject.credits !== undefined">
                <div class="info-field">
                  <span class="field-label">CRÉDITOS</span>
                  <div class="credits-badge">{{ subject.credits }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 2: Intensidad Horaria -->
        <div class="view-section">
          <div class="section-head">
            <div class="section-icon-purple">
              <AppIcon icon="clock" />
            </div>
            <h6 class="section-title">Intensidad Horaria</h6>
          </div>
          <div class="row g-2">
            <div class="col-4">
              <div class="hour-card">
                <div class="hour-label">HORAS TEÓRICAS</div>
                <div class="hour-value text-success">
                  {{ (subject as any).theoreticalHours ?? 0 }}
                  <span class="hour-unit">h</span>
                </div>
              </div>
            </div>
            <div class="col-4">
              <div class="hour-card">
                <div class="hour-label">HORAS PRÁCTICAS</div>
                <div class="hour-value text-success">
                  {{ (subject as any).practicalHours ?? 0 }}
                  <span class="hour-unit">h</span>
                </div>
              </div>
            </div>
            <div class="col-4">
              <div class="hour-card hour-card--total">
                <div class="hour-label">TOTAL HORAS</div>
                <div class="hour-value text-primary">{{ subject.totalHours ?? 0 }} <span class="hour-unit">h</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 3: Configuración Académica -->
        <div class="view-section">
          <div class="section-head">
            <div class="section-icon-green">
              <AppIcon icon="graduation-cap" />
            </div>
            <h6 class="section-title">Configuración Académica</h6>
          </div>
          <div class="info-card">
            <div class="row g-3">
              <div class="col-6">
                <div class="info-field">
                  <span class="field-label">TIPO DE ASIGNATURA</span>
                  <span class="badge-config" v-if="subject.subjectType">{{ subject.subjectType }}</span>
                  <span class="text-muted small" v-else>No especificado</span>
                </div>
              </div>
              <div class="col-6">
                <div class="info-field">
                  <span class="field-label">TIPO DE ESPACIO REQUERIDO</span>
                  <span class="badge-config">{{ (subject as any).spaceType || 'No especificado' }}</span>
                </div>
              </div>
              <div class="col-12">
                <div class="info-field">
                  <span class="field-label">REQUISITO DE GRADO</span>
                  <div class="requisito-tag" :class="subject.degreeRequirement ? 'req-si' : 'req-no'">
                    <AppIcon :icon="subject.degreeRequirement ? 'check' : 'times'" class="me-1 small" />
                    {{ subject.degreeRequirement ? 'Es requisito de grado' : 'No es requisito de grado' }}
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="info-field">
                  <span class="field-label">ASIGNATURAS PRERREQUISITO</span>
                  <p class="text-muted small">No tiene prerrequisitos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 4: Competencias -->
        <div class="view-section">
          <div class="section-head">
            <div class="section-icon-orange">
              <AppIcon icon="award" />
            </div>
            <h6 class="section-title">Competencias de la Asignatura</h6>
          </div>
          <div class="empty-competencias">
            <p class="text-muted small fst-italic">No se han definido competencias para esta asignatura</p>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex justify-content-end">
        <AppButton label="Cerrar" variant="primary" @click="$emit('update:isVisible', false)"></AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { SubjectDto } from '../../../shared/dto/subject.dto';

export default defineComponent({
  name: 'SubjectViewDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
    subject: { type: Object as PropType<SubjectDto | null>, default: null },
    areaName: { type: String, default: '' },
  },
  emits: ['update:isVisible'],
});
</script>

<style scoped>
/* HEAD */
.subject-head-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.code-tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
}

/* Sections */
.view-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.section-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 0;
  font-size: 0.95rem;
}

.section-icon-blue,
.section-icon-purple,
.section-icon-green,
.section-icon-orange {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.section-icon-blue {
  background: #eff6ff;
  color: #1d4ed8;
}
.section-icon-purple {
  background: #f5f3ff;
  color: #7c3aed;
}
.section-icon-green {
  background: #ecfdf5;
  color: #059669;
}
.section-icon-orange {
  background: #fff7ed;
  color: #ea580c;
}

/* Info card */
.info-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
}
.info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
}
.field-value {
  font-size: 0.88rem;
  color: #111827;
}

/* Credits badge */
.credits-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fff7ed;
  color: #ea580c;
  font-size: 1.2rem;
  font-weight: 800;
}

/* Hour cards */
.hour-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}
.hour-card--total {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.hour-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.hour-value {
  font-size: 1.4rem;
  font-weight: 800;
}
.hour-unit {
  font-size: 0.85rem;
  font-weight: 400;
}

/* Config badges */
.badge-config {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 500;
}

/* Requisito tags */
.requisito-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
}
.req-si {
  background: #d1fae5;
  color: #065f46;
}
.req-no {
  background: #f3f4f6;
  color: #374151;
}

/* Competencias empty */
.empty-competencias {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
}
</style>
