<template>
  <AppBaseList title="Esquema Operativo">
    <template #actions>
      <AppButton style="color: white" label="volver" @click="goBack"></AppButton>
    </template>

    <template v-slot:content>
      <!-- <div v-if="isLoading" class="tw-text-center tw-py-12 tw-text-gray-500">Cargando...</div> -->

      <div>
        <!-- Título del esquema -->
        <h2 class="tw-text-xl tw-font-bold tw-text-gray-800 tw-uppercase tw-mb-6">
          {{ scheme.name || schemeName }}
        </h2>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- FILA 1 — Tres tablas de datos numéricos                -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="tw-flex tw-flex-wrap tw-gap-6 tw-mb-6 tw-items-start">
          <!-- Tabla izquierda: datos base -->
          <div class="data-table">
            <div class="data-row">
              <span class="data-label">Semanas de clase</span>
              <input v-model.number="form.classWeeks" type="number" class="data-input" min="0" />
            </div>
            <div class="data-row">
              <span class="data-label">Semanas de evaluación</span>
              <input v-model.number="form.evaluationWeeks" type="number" class="data-input" min="0" />
            </div>
            <div class="data-row">
              <span class="data-label">Número de semestres</span>
              <input v-model.number="form.semesters" type="number" class="data-input" min="0" />
            </div>
            <div class="data-row">
              <span class="data-label">Horas por semestre</span>
              <input v-model.number="form.semesterHours" type="number" class="data-input" min="0" />
            </div>
            <div class="data-row">
              <span class="data-label">Número de créditos</span>
              <input v-model.number="form.credits" type="number" class="data-input" min="0" />
            </div>
            <div class="data-row">
              <span class="data-label tw-font-semibold">Nombre específico</span>
              <input v-model="form.specificName" type="text" class="data-input tw-font-bold tw-uppercase" placeholder="SEMESTRE" />
            </div>
          </div>

          <!-- Tabla central: Formación en centro -->
          <div class="data-table">
            <div class="data-row header-row">
              <span class="data-label tw-font-bold tw-col-span-2">Formación en centro</span>
            </div>
            <div class="data-row">
              <span class="data-label">Semanas</span>
              <input v-model.number="form.centerWeeks" type="number" class="data-input" min="0" />
            </div>
            <div class="data-row">
              <span class="data-label">Seminario</span>
              <input v-model.number="form.seminar" type="number" class="data-input" min="0" />
            </div>
            <div class="data-row">
              <span class="data-label">Horas Prácticas</span>
              <input v-model.number="form.practicalHours" type="number" class="data-input" min="0" />
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- FILA 2 — Tabla de pasos + checkbox Mostrar tipos       -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="steps-table tw-mb-6">
          <div class="steps-header">
            <div class="step-cell header">Texto paso 1</div>
            <div class="step-cell header">Texto paso 2</div>
            <div class="step-cell header">Texto paso 3</div>
            <div class="step-cell header tw-text-center" style="min-width: 90px; max-width: 90px">Mostrar tipos</div>
          </div>
          <div class="steps-body">
            <div class="step-cell">
              <input v-model="form.step1" type="text" class="step-input" placeholder="Ej: CONVOCATORIA" />
            </div>
            <div class="step-cell">
              <input v-model="form.step2" type="text" class="step-input" placeholder="Ej: ADMISIÓN" />
            </div>
            <div class="step-cell">
              <input v-model="form.step3" type="text" class="step-input" placeholder="Ej: PROFESIONAL" />
            </div>
            <div class="step-cell tw-flex tw-items-center tw-justify-center" style="min-width: 90px; max-width: 90px">
              <input v-model="form.showTypes" type="checkbox" class="tw-w-5 tw-h-5 tw-cursor-pointer" style="accent-color: #3b5bdb" />
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- DIAGRAMA — sólo visible cuando showTypes es true       -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <transition name="fade">
          <div v-if="form.showTypes" class="diagram-section">
            <!-- Fila de bloques con flechas -->
            <div class="diagram-flow tw-mb-6">
              <!-- Paso 1 -->
              <div class="flow-block blue-dark">
                {{ form.step1 || 'Paso 1' }}
              </div>
              <div class="flow-arrow">▶</div>

              <!-- Paso 2 -->
              <div class="flow-block blue-dark">
                {{ form.step2 || 'Paso 2' }}
              </div>
              <div class="flow-arrow">▶</div>

              <!-- Bloque central compuesto EG / FBC / FBC -->
              <div class="flow-compound">
                <div class="compound-block eg">EG</div>
                <div class="compound-block fbc">FBC</div>
                <div class="compound-block fbc striped">FBC</div>
              </div>
              <div class="flow-arrow">▶</div>

              <!-- Paso 3 -->
              <div class="flow-block blue-dark">
                {{ form.step3 || 'Paso 3' }}
              </div>
            </div>

            <!-- Tabla de semanas / semestres / etapas -->
            <div class="tw-overflow-x-auto tw-mb-6">
              <table class="scheme-table">
                <tbody>
                  <tr>
                    <th class="tw-w-40">SEMANAS</th>
                    <td v-for="n in totalSemanas" :key="'s' + n">
                      {{ n % 2 === 1 ? form.classWeeks || 16 : form.evaluationWeeks || 1 }}
                    </td>
                    <td class="total-cell" rowspan="2">= {{ totalHoras }} horas</td>
                  </tr>
                  <tr>
                    <th>SEMESTRE (HORAS)</th>
                    <td v-for="sem in form.semesters || 3" :key="'h' + sem" colspan="2">{{ romanize(sem) }} ({{ form.semesterHours || 510 }})</td>
                  </tr>
                  <tr>
                    <th>ETAPAS</th>
                    <td colspan="2">Estudios Generales</td>
                    <td :colspan="((form.semesters || 3) - 1) * 2">Formación Básica</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Leyenda de colores -->
            <div class="legend-grid">
              <div class="legend-item">
                <div class="legend-color" style="background: #8080d0"></div>
                <span>EG &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ESTUDIOS GENERALES</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #9c59d1"></div>
                <span>FC &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FORMACIÓN EN CENTRO</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #48cae4"></div>
                <span>FBC &nbsp;&nbsp;&nbsp;&nbsp; FORMACIÓN BÁSICA EN CENTRO</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: transparent; border: 1px solid #999"></div>
                <span>SEMINARIO DE HABILIDADES PRÁCTICAS</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #0077b6"></div>
                <span>FPE &nbsp;&nbsp;&nbsp;&nbsp; FORMACIÓN PRÁCTICA EN EMPRESA</span>
              </div>
              <div class="legend-item">
                <div class="legend-color striped-legend"></div>
                <span>EVALUACIÓN SEMESTRAL</span>
              </div>
            </div>
          </div>
        </transition>

        <!-- Botón guardar -->
        <div class="tw-flex tw-justify-end tw-mt-6">
          <AppButton label="Guardar estructura" variant="primary" :outlined="false" @click="modalSave = true" />
        </div>

        <!-- Modal confirmación guardar -->
        <AppModal v-model="modalSave">
          <AppConfirmModal v-if="modalSave" entity="Estructura" textButton="Guardar" textContent="¿Deseas guardar los cambios de esta estructura?" @confirmDelete="confirmSave" />
        </AppModal>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- SECCIÓN SEMESTRES                                       -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="tw-bg-white tw-shadow-sm tw-rounded-lg tw-p-6 tw-mt-6 tw-border tw-border-gray-200">
          <!-- Cabecera con botón -->
          <div class="tw-flex tw-justify-end tw-mb-4">
            <AppButton label="Crear semestre" icon-left="plus" variant="primary" outlined @click="addSemester" />
          </div>

          <!-- Lista de semestres -->
          <AppAccordion v-if="semesters.length" class="mt-2" v-slot="{ accordionId }">
            <AppAccordionItem v-for="(sem, idx) in semesters" :key="sem.id" :accordion-id="accordionId">
              <template v-slot:head>
                <div class="tw-flex tw-items-center tw-w-full tw-pr-2">
                  <i class="fas fa-grip-vertical tw-text-gray-400 tw-mr-2"></i>
                  <span class="tw-font-bold" :class="sem.type ? 'tw-text-primary' : 'tw-text-gray-600'">
                    {{ sem.type || 'Semestre ' + (idx + 1) }}
                  </span>
                  <AppButtonDelete size="sm" class="tw-ml-auto" @click.stop="removeSemester(idx)" />
                </div>
              </template>

              <template v-slot:content>
                <div class="row g-3 align-items-end">
                  <!-- Tipo de semestre -->
                  <div class="col-md-6">
                    <AppFormField label="Tipo de semestre">
                      <AppSelect v-model="sem.type">
                        <option value="">-- Selecciona --</option>
                        <option value="Estudios Generales">Estudios Generales</option>
                        <option value="Formación Básica">Formación Básica</option>
                        <option value="Formación Profesional">Formación Profesional</option>
                        <option value="Formación en Centro">Formación en Centro</option>
                        <option value="Práctica en Empresa">Práctica en Empresa</option>
                      </AppSelect>
                    </AppFormField>
                  </div>

                  <!-- Módulos Obligatorios -->
                  <div class="col-md-6">
                    <AppFormField label="Módulos Obligatorios">
                      <AppInput v-model="sem.mandatoryModules" placeholder="Indica los módulos obligatorios..." />
                    </AppFormField>
                  </div>
                </div>
              </template>
            </AppAccordionItem>
          </AppAccordion>

          <div v-else class="tw-text-center tw-text-gray-400 tw-py-6 tw-text-sm">No hay semestres creados. Haz clic en "+ Crear semestre" para comenzar.</div>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmModal from '../../../shared/components/Modal/AppConfirmModal.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { OperationalSchemeDto } from '../dtos/OperationalSchemeDto';

export default defineComponent({
  name: 'OperationalSchemeStructure',
  components: {
    AppBaseList,
    AppButton,
    AppButtonDelete,
    AppModal,
    AppConfirmModal,
    AppAccordion,
    AppAccordionItem,
    AppFormField,
    AppSelect,
    AppInput,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const headerStore = useHeaderStore();

    const programTypeId = ref(Number(route.params.id));
    const schemeId = ref(Number(route.params.schemeId));
    const schemeName = ref(route.query.name ? String(route.query.name) : 'Esquema ' + schemeId.value);
    const isLoading = ref(true);
    const modalSave = ref(false);

    // Semestres del esquema
    const semesters = ref<{ id: number; type: string; mandatoryModules: string }[]>([]);

    const addSemester = () => {
      semesters.value.push({ id: Date.now(), type: '', mandatoryModules: '' });
    };

    const removeSemester = (idx: number) => {
      semesters.value.splice(idx, 1);
    };

    const scheme = ref<OperationalSchemeDto>({} as OperationalSchemeDto);

    const form = ref({
      classWeeks: 0,
      evaluationWeeks: 0,
      semesters: 0,
      semesterHours: 0,
      credits: 0,
      specificName: '',
      centerWeeks: 0,
      seminar: 0,
      practicalHours: 0,
      theoryHours: 0,
      workshopHours: 0,
      virtualHours: 0,
      step1: '',
      step2: '',
      step3: '',
      showTypes: false,
    });

    // Semanas totales de la tabla = semesters * 2 columnas (clase + evaluación)
    const totalSemanas = computed(() => {
      const s = form.value.semesters || 3;
      return s * 2;
    });

    const totalHoras = computed(() => {
      const s = form.value.semesters || 3;
      const h = form.value.semesterHours || 510;
      return s * h;
    });

    const romanize = (num: number) => {
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      return romans[num - 1] || num;
    };

    onMounted(async () => {
      headerStore.module = { name: 'Diseño Curricular', url: '' };
      headerStore.moduleItem = {
        name: 'Tipos de Programas Académicos',
        url: '/curriculumDesign/programType',
      };
      headerStore.moduleSubItem = { name: 'Esquema Operativo', url: '' };
    });

    const goBack = () => {
      router.push({
        name: 'programTypeStructure',
        params: { id: programTypeId.value },
      });
    };

    const confirmSave = async () => {
      modalSave.value = false;
    };

    return {
      schemeName,
      scheme,
      form,
      isLoading,
      modalSave,
      semesters,
      addSemester,
      removeSemester,
      totalSemanas,
      totalHoras,
      romanize,
      goBack,
      confirmSave,
    };
  },
});
</script>

<style scoped>
/* ─── Tablas de datos numéricos ─── */
.data-table {
  border: 1px solid #ccc;
  border-collapse: collapse;
  display: inline-table;
  min-width: 200px;
}

/* La tabla de la izquierda (datos base) necesita etiquetas más anchas */
.data-table:first-child {
  min-width: 340px;
}

.data-row {
  display: grid;
  grid-template-columns: 1fr auto;
  border-bottom: 1px solid #ccc;
}

.data-row:last-child {
  border-bottom: none;
}

.header-row {
  grid-template-columns: 1fr;
  background: #f4f4f4;
}

.data-label {
  padding: 6px 10px;
  font-size: 0.85rem;
  border-right: 1px solid #ccc;
  display: flex;
  align-items: center;
  white-space: nowrap;
  min-width: 140px;
}

.data-input {
  width: 100px;
  padding: 4px 6px;
  border: none;
  outline: none;
  text-align: center;
  font-size: 0.85rem;
  background: #fff;
}

/* ─── Tabla de pasos ─── */
.steps-table {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.steps-header,
.steps-body {
  display: flex;
  align-items: stretch;
}

.step-cell {
  flex: 1;
  border-right: 1px solid #ccc;
  padding: 8px 12px;
}

.step-cell:last-child {
  border-right: none;
}

.step-cell.header {
  background: #f4f4f4;
  font-size: 0.82rem;
  font-weight: 600;
  color: #444;
  border-bottom: 1px solid #ccc;
}

.step-input {
  width: 100%;
  border: none;
  outline: none;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  background: transparent;
}

/* ─── Diagrama ─── */
.diagram-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}

.diagram-flow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.flow-block {
  padding: 18px 22px;
  font-weight: 700;
  font-size: 0.82rem;
  text-align: center;
  text-transform: uppercase;
  color: #fff;
  min-width: 100px;
}

.blue-dark {
  background: #3b3b9e;
}

.flow-arrow {
  font-size: 2rem;
  color: #00b4d8;
  margin: 0 2px;
}

.flow-compound {
  display: flex;
  border: 2px solid #aaa;
  height: 80px;
}

.compound-block {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  color: #fff;
  width: 60px;
}

.compound-block.eg {
  background: #8080d0;
}

.compound-block.fbc {
  background: #48cae4;
}

.compound-block.striped {
  background: repeating-linear-gradient(45deg, #48cae4, #48cae4 5px, #fff 5px, #fff 10px);
  color: #00729e;
}

/* ─── Tabla semanas/semestres ─── */
.scheme-table {
  border-collapse: collapse;
  font-size: 0.82rem;
}

.scheme-table th,
.scheme-table td {
  border: 1px solid #999;
  padding: 5px 10px;
  text-align: center;
  white-space: nowrap;
}

.scheme-table th {
  background: #f0f0f0;
  font-weight: 700;
  text-align: left;
}

.total-cell {
  font-weight: 700;
  font-size: 1rem;
  border: none !important;
  padding-left: 16px;
}

/* ─── Leyenda ─── */
.legend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  font-size: 0.82rem;
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 48px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 2px;
}

.striped-legend {
  background: repeating-linear-gradient(45deg, #aaa, #aaa 3px, #fff 3px, #fff 6px);
  border: 1px solid #aaa;
}

/* ─── Transición fade ─── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
