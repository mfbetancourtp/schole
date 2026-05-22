<template>
  <AppDrawer :isVisible="visible" @update:isVisible="updateVisibility" size="lg">
    <template #head>
      <span class="title-form">Evaluación del Estudiante</span>
    </template>

    <template #body>
      <div class="drawer-evaluation-content">
        <!-- Header del estudiante -->
        <div class="student-header">
          <img :src="student?.avatar" :alt="student?.name" class="student-avatar-large" />
          <div class="student-details">
            <h3 class="student-name">{{ student?.name }}</h3>
            <p class="student-info">{{ student?.email }} • {{ student?.grade }}</p>
            <p class="student-info">
              Editado el <span class="primary-color">26-06-2024</span> por:
              <span class="primary-color">Profesor Alex Ochoa Ruiz</span>
            </p>
            <!-- <span :class="['status-badge', `status-${student?.status?.toLowerCase()}`]">
              {{ getStatusLabel(student?.status) }}
            </span> -->
          </div>
        </div>

        <!-- Acordeón con las secciones de evaluación -->
        <div class="evaluation-sections">
          <AppAccordion class="p-1">
            <AppAccordionItem v-for="section in evaluationSections" :key="section.id">
              <template v-slot:head>
                {{ section.name }}
              </template>
              <template v-slot:content>
                <div class="section-content">
                  <!-- Tabla de indicadores -->
                  <div class="indicators-table-container">
                    <table class="indicators-table">
                      <thead>
                        <tr>
                          <th class="indicator-header">Indicador</th>
                          <th class="level-header" v-for="level in levels" :key="level.value">
                            {{ level.label }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="criterion in section.criteria" :key="criterion.id">
                          <td class="indicator-cell">
                            <div class="indicator-info">
                              <strong>{{ criterion.name }}</strong>
                              <p class="indicator-description">
                                {{ criterion.description }}
                              </p>
                            </div>
                          </td>
                          <td class="level-cell" v-for="level in levels" :key="level.value">
                            <input
                              type="radio"
                              :name="`criterion-${criterion.id}`"
                              :value="level.value"
                              v-model="criterion.selectedLevel"
                              @change="updateCriterionScore(section.id, criterion.id, level.value)"
                              class="level-radio"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
            </AppAccordionItem>
          </AppAccordion>
        </div>

        <!-- Footer con acciones -->
        <!-- <div class="drawer-footer">
          <div class="footer-actions">
            <AppButton variant="secondary" @click="previousStudent">Anterior</AppButton>
            <AppButton variant="primary" @click="nextStudent">Siguiente</AppButton>
          </div>
        </div> -->
      </div>
    </template>
    <template #footer>
      <div>
        <div class="footer-actions">
          <AppButton variant="secondary" @click="previousStudent">Anterior</AppButton>
          <AppButton variant="primary" @click="nextStudent">Siguiente</AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

export default defineComponent({
  name: 'DrawerEvaluation',

  components: {
    AppDrawer,
    AppAccordion,
    AppAccordionItem,
    AppButton,
  },

  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    student: {
      type: Object,
      default: null,
    },
  },

  emits: ['close', 'previousStudent', 'nextStudent'],

  setup(props, { emit }) {
    // Niveles de evaluación
    const levels = ref([
      { value: 1, label: 'Destreza Alcanzada' },
      { value: 2, label: 'Destreza en Proceso' },
      { value: 3, label: 'Avance Inicial' },
      { value: 4, label: 'Necesita Ejercitación' },
    ]);

    // Datos de ejemplo para las secciones de evaluación
    const evaluationSections = ref([
      {
        id: 1,
        name: 'Competencias Académicas',
        criteria: [
          {
            id: 1,
            name: 'Comprensión Lectora',
            description: 'Capacidad para entender y analizar textos escritos',
            selectedLevel: null as number | null,
          },
          {
            id: 2,
            name: 'Pensamiento Matemático',
            description: 'Habilidad para resolver problemas matemáticos y aplicar conceptos numéricos',
            selectedLevel: null as number | null,
          },
        ],
      },
      {
        id: 2,
        name: 'Habilidades Sociales',
        criteria: [
          {
            id: 3,
            name: 'Trabajo en Equipo',
            description: 'Capacidad para colaborar efectivamente con sus compañeros',
            selectedLevel: null as number | null,
          },
          {
            id: 4,
            name: 'Comunicación Oral',
            description: 'Habilidad para expresarse claramente de forma verbal',
            selectedLevel: null as number | null,
          },
        ],
      },
      {
        id: 3,
        name: 'Desarrollo Personal',
        criteria: [
          {
            id: 5,
            name: 'Autonomía',
            description: 'Capacidad para trabajar de forma independiente',
            selectedLevel: null as number | null,
          },
        ],
      },
    ]);

    const getStatusLabel = (status: string) => {
      const labels: { [key: string]: string } = {
        pendiente: 'Pendiente',
        calificado: 'Calificado',
        generado: 'Generado',
        enviado: 'Enviado',
      };
      return labels[status] || status;
    };

    const updateCriterionScore = (sectionId: number, criterionId: number, level: number) => {
      const section = evaluationSections.value.find((s) => s.id === sectionId);
      if (section) {
        const criterion = section.criteria.find((c) => c.id === criterionId);
        if (criterion) {
          criterion.selectedLevel = level;
        }
      }
    };

    const previousStudent = () => {
      emit('previousStudent');
    };

    const nextStudent = () => {
      emit('nextStudent');
    };

    const updateVisibility = (value: boolean) => {
      if (!value) {
        emit('close');
      }
    };

    return {
      levels,
      evaluationSections,
      getStatusLabel,
      updateCriterionScore,
      previousStudent,
      nextStudent,
      updateVisibility,
    };
  },
});
</script>

<style scoped>
.drawer-evaluation-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 16px;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.student-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.student-details {
  flex: 1;
}

.student-name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.student-info {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
}

.primary-color {
  color: var(--color-primary);
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pendiente {
  background: #374151;
  color: white;
}

.status-calificado {
  background: #3b82f6;
  color: white;
}

.status-generado {
  background: #059669;
  color: white;
}

.status-enviado {
  background: #f59e0b;
  color: white;
}

.evaluation-sections {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
}

.section-content {
  padding: 16px 0;
}

.indicators-table-container {
  width: 100%;
  overflow-x: auto;
}

.indicators-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.indicators-table th,
.indicators-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.indicators-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.indicator-header {
  width: 40%;
}

.level-header {
  width: 15%;
  text-align: center;
}

.indicator-cell {
  vertical-align: top;
}

.indicator-info strong {
  display: block;
  margin-bottom: 4px;
  color: #111827;
  font-size: 14px;
}

.indicator-description {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
}

.level-cell {
  text-align: center;
  vertical-align: middle;
}

.level-radio {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.indicators-table tr:hover {
  background: #f9fafb;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.title-form {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}
</style>
