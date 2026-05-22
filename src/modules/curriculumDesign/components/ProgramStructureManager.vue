<template>
  <div class="structure-manager card p-4 mt-4 shadow-sm border-0">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0 fw-bold text-dark text-uppercase">
        {{ programType.name }}
      </h5>
      <AppButton icon="times" outlined variant="secondary" @click="$emit('close')" />
    </div>

    <!-- Top Tables (Image 2) -->
    <div class="row g-4 mb-4">
      <!-- Grid 1 -->
      <div class="col-md-7">
        <table class="table table-bordered text-center align-middle mb-0 custom-table">
          <tbody>
            <tr>
              <td class="bg-light fw-bold">Código</td>
              <td>{{ programType.code }}</td>
              <td class="bg-light fw-bold">Curricular</td>
              <td>{{ programType.isCurricular ? 'Sí' : 'No' }}</td>
            </tr>
            <tr>
              <td class="bg-light fw-bold">Estado</td>
              <td colspan="3">
                <span class="badge rounded-pill px-3 py-2" :class="programType.isActive ? 'text-success' : 'text-danger'">
                  {{ programType.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grid 2 -->
      <div class="col-md-3">
        <table class="table table-bordered text-center align-middle mb-0 custom-table">
          <thead>
            <tr>
              <th colspan="2" class="bg-light">Formación en centro</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-start">Semanas</td>
              <td>12</td>
            </tr>
            <tr>
              <td class="text-start">Seminario</td>
              <td>4</td>
            </tr>
            <tr>
              <td class="text-start">Horas Prácticas</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grid 3 -->
      <div class="col-md-2">
        <table class="table table-bordered text-center align-middle mb-0 custom-table">
          <thead>
            <tr>
              <th colspan="2" class="bg-light">Operación horas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-start">Teoría</td>
              <td>0</td>
            </tr>
            <tr>
              <td class="text-start">Taller</td>
              <td>0</td>
            </tr>
            <tr>
              <td class="text-start">Virtual</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Middle Table Options -->
    <table class="table table-bordered text-center align-middle mb-4 custom-table">
      <thead>
        <tr class="bg-light">
          <th>Texto paso 1</th>
          <th>Texto paso 2</th>
          <th>Texto paso 3</th>
          <th style="width: 100px">Mostrar tipos</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="fw-bold">CONVOCATORIA</td>
          <td class="fw-bold">ADMISION</td>
          <td class="fw-bold">PROFESIONAL</td>
          <td><input type="checkbox" checked disabled /></td>
        </tr>
      </tbody>
    </table>

    <!-- Flowchart Visual (Image 3) -->
    <div class="flowchart-container d-flex align-items-center justify-content-center mb-5 overflow-auto pb-2">
      <div class="flow-box">CONVOCATORIA</div>
      <i class="fas fa-arrow-right flow-arrow"></i>
      <div class="flow-box">ADMISIÓN</div>
      <i class="fas fa-arrow-right flow-arrow"></i>

      <div class="flow-blocks-group d-flex h-100">
        <div class="block-eg">EG</div>
        <div class="block-fbc">FBC</div>
        <div class="block-fpe-fc d-flex flex-column h-100">
          <div class="block-fpe flex-grow-1">FPE</div>
          <div class="block-fc">FC</div>
        </div>
        <div class="block-s">S</div>
      </div>

      <i class="fas fa-arrow-right flow-arrow"></i>
      <div class="flow-box">PROFESIONAL</div>
    </div>

    <!-- Summary Tables (Image 4) -->
    <div class="d-flex flex-column align-items-center mb-4">
      <div class="d-flex align-items-center mb-3 table-responsive w-100 justify-content-center">
        <table class="table table-bordered text-center align-middle mb-0 custom-table w-auto">
          <tbody>
            <tr>
              <td class="bg-light fw-bold text-start">SEMANAS</td>
              <td>16</td>
              <td>1</td>
              <td>16</td>
              <td>1</td>
              <td>12</td>
              <td>4</td>
              <td>1</td>
            </tr>
            <tr>
              <td class="bg-light fw-bold text-start">SEMESTRE (HORAS)</td>
              <td colspan="2">I (510)</td>
              <td colspan="2">II (510)</td>
              <td colspan="3">III (510)</td>
            </tr>
            <tr>
              <td class="bg-light fw-bold text-start">ETAPAS</td>
              <td colspan="2">Estudios Generales</td>
              <td colspan="2">Formación Básica</td>
              <td colspan="3">Formación Específica DUAL</td>
            </tr>
          </tbody>
        </table>
        <div class="ms-3 fw-bold fs-5 text-nowrap">= 1530 horas</div>
      </div>

      <!-- Legend -->
      <table class="table table-bordered align-middle mb-0 custom-table legend-table w-auto mt-3">
        <tbody>
          <tr>
            <td><div class="legend-color block-eg-color"></div></td>
            <td class="fw-bold small text-end">ESTUDIOS GENERALES</td>
            <td><div class="legend-color block-fc-color"></div></td>
            <td class="fw-bold small text-end">FORMACIÓN EN CENTRO</td>
          </tr>
          <tr>
            <td><div class="legend-color block-fbc-color"></div></td>
            <td class="fw-bold small text-end">FORMACIÓN BÁSICA EN CENTRO</td>
            <td><div class="legend-color border bg-white"></div></td>
            <td class="fw-bold small text-end">SEMINARIO DE HABILIDADES PRÁCTICAS</td>
          </tr>
          <tr>
            <td><div class="legend-color block-fpe-color"></div></td>
            <td class="fw-bold small text-end">FORMACIÓN PRÁCTICA EN EMPRESA</td>
            <td>
              <div class="legend-color block-s-bg pattern-diagonal"></div>
            </td>
            <td class="fw-bold small text-end">EVALUACIÓN SEMESTRAL</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Semesters Accordion (Image 5) -->
    <div class="d-flex justify-content-end mb-3">
      <AppButton label="Crear semestre" icon="plus" outlined @click.prevent="addSemester" native-type="button" />
    </div>

    <div class="accordion" id="semestersAccordion">
      <div class="accordion-item mb-2 border rounded" v-for="i in Number(semestersCount)" :key="i">
        <h2 class="accordion-header" :id="'heading' + i">
          <button class="accordion-button collapsed fw-bold px-3 py-3" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + i" aria-expanded="false" :aria-controls="'collapse' + i">
            <i class="fas fa-arrows-alt me-2 text-muted"></i>
            SEMESTRE {{ getRomanNumeral(i) }} {{ i === 1 ? 'GENERAL' : '' }}
          </button>
        </h2>
        <div :id="'collapse' + i" class="accordion-collapse collapse" :aria-labelledby="'heading' + i" data-bs-parent="#semestersAccordion">
          <div class="accordion-body bg-light">
            <div class="row g-4 p-2">
              <div class="col-md-6">
                <AppFormField label="Tipo de Semestre">
                  <AppSelect placeholder="Seleccionar tipo..." class="w-100 bg-white">
                    <option value="" disabled selected hidden>Seleccionar tipo...</option>
                    <option value="general">Estudios Generales</option>
                    <option value="basic">Formación Básica</option>
                    <option value="specific">Formación Específica</option>
                  </AppSelect>
                </AppFormField>
              </div>
              <div class="col-md-6">
                <AppFormField label="Módulos obligatorios">
                  <AppSelect placeholder="Seleccionar módulo..." class="w-100 bg-white">
                    <option value="" disabled selected hidden>Seleccionar módulo...</option>
                    <option value="m1">Módulo I: Comunicación Institucional</option>
                    <option value="m2">Módulo II: Sistemas de Información</option>
                    <option value="m3">Módulo III: Gestión de Proyectos</option>
                    <option value="m4">Módulo IV: Habilidades Directivas</option>
                    <option value="m5">Módulo V: Diseño Curricular</option>
                  </AppSelect>
                </AppFormField>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import { ProgramTypeDto } from '../dtos/ProgramTypeDto';

const props = defineProps<{
  programType: ProgramTypeDto;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const semestersCount = ref(1);

const addSemester = () => {
  semestersCount.value += 1;
};

const getRomanNumeral = (num: number): string => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romanNumerals[num - 1] || num.toString();
};
</script>

<style scoped>
.structure-manager {
  animation: slideIn 0.4s ease-out;
  border-top: 4px solid #1e3a8a !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-table td,
.custom-table th {
  padding: 0.5rem;
  font-size: 0.85rem;
  border-color: #dee2e6;
}

/* Flowchart styles */
.flowchart-container {
  gap: 1.5rem;
}

.flow-box {
  background-color: #3b5bdb;
  color: white;
  padding: 1.5rem 2rem;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.flow-arrow {
  color: #38bdf8;
  font-size: 3rem;
}

.flow-blocks-group {
  height: 120px;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.block-eg {
  background-color: #e0f2fe;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-right: 20px solid transparent;
  background-clip: padding-box;
  position: relative;
}
.block-eg::after {
  content: '';
  position: absolute;
  right: -20px;
  top: 0;
  bottom: 0;
  width: 20px;
  background: repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 5px, #dee2e6 5px, #dee2e6 10px);
}

.block-fbc {
  background-color: #38bdf8;
  color: white;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-right: 20px solid transparent;
  background-clip: padding-box;
  position: relative;
}
.block-fbc::after {
  content: '';
  position: absolute;
  right: -20px;
  top: 0;
  bottom: 0;
  width: 20px;
  background: repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 5px, #dee2e6 5px, #dee2e6 10px);
}

.block-fpe {
  background-color: #0284c7;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
.block-fc {
  background-color: #8b5cf6;
  color: white;
  height: 30px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.block-fpe-fc {
  width: 50px;
}

.block-s {
  background-color: #f1f5f9;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-right: 20px solid transparent;
  background-clip: padding-box;
  position: relative;
}
.block-s::after {
  content: '';
  position: absolute;
  right: -20px;
  top: 0;
  bottom: 0;
  width: 20px;
  background: repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 5px, #dee2e6 5px, #dee2e6 10px);
}

.legend-color {
  width: 30px;
  height: 15px;
  display: inline-block;
  vertical-align: middle;
}

.block-eg-color {
  background-color: #e0f2fe;
  border: 1px solid #cbd5e1;
}
.block-fbc-color {
  background-color: #38bdf8;
}
.block-fpe-color {
  background-color: #0284c7;
}
.block-fc-color {
  background-color: #8b5cf6;
}
.block-s-bg.pattern-diagonal {
  background: repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 5px, #dee2e6 5px, #dee2e6 10px);
  border: 1px solid #cbd5e1;
}

.legend-table td {
  border: none !important;
  padding: 0.25rem 0.5rem;
}

.accordion-button:focus {
  box-shadow: none;
}
.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  color: #1e3a8a;
  box-shadow: none;
}
</style>
