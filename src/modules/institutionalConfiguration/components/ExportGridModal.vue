<template>
  <AppModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" size="md">
    <div class="bg-white rounded-3 shadow" style="max-height: 90vh; display: flex; flex-direction: column">
      <!-- Header Fixed -->
      <div class="p-4 border-bottom d-flex align-items-start justify-content-between flex-shrink-0">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-primary text-white rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px">
            <AppIcon icon="download" />
          </div>
          <div>
            <h5 class="fw-bold text-dark mb-0">Exportar Malla Curricular</h5>
            <p class="text-muted small mb-0" style="font-size: 13px">Configura el formato y contenido del documento a exportar</p>
          </div>
        </div>
        <button type="button" class="btn-close" @click="$emit('update:modelValue', false)" aria-label="Close"></button>
      </div>

      <!-- Body Scrollable -->
      <div class="p-4 overflow-auto" style="flex: 1">
        <!-- Info Box -->
        <div class="bg-light border rounded-3 p-3 mb-4 d-flex flex-wrap gap-4">
          <div style="flex: 1">
            <div class="text-muted mb-1" style="font-size: 11px">Programa:</div>
            <div class="fw-medium text-dark" style="font-size: 13px">Ingeniería de Sistemas</div>

            <div class="text-muted mb-1 mt-3" style="font-size: 11px">Versión:</div>
            <div class="fw-medium text-dark" style="font-size: 13px">v1.0</div>
          </div>
          <div style="flex: 1">
            <div class="text-muted mb-1" style="font-size: 11px">Malla:</div>
            <div class="fw-medium text-dark" style="font-size: 13px">Malla Curricular Ingeniería de Sistemas 2024</div>

            <div class="text-muted mb-1 mt-3" style="font-size: 11px">Estado:</div>
            <div>
              <span class="badge rounded-pill bg-success text-white px-2 py-0 fw-medium" style="font-size: 11px">Activo</span>
            </div>
          </div>
        </div>

        <!-- Section 1 -->
        <div class="mb-4">
          <h6 class="fw-bold text-dark mb-1" style="font-size: 14px">1. Formato del Documento</h6>
          <p class="text-muted small mb-3" style="font-size: 12px">Selecciona el tipo de archivo que deseas generar</p>
          <div class="row g-3">
            <div class="col-4">
              <label
                class="w-100 format-card rounded-3 border p-3 text-center position-relative cursor-pointer"
                :class="{
                  'border-primary bg-primary-light': form.format === 'pdf',
                }"
              >
                <input type="radio" v-model="form.format" value="pdf" class="position-absolute end-0 top-0 m-2" style="accent-color: var(--bs-primary)" />
                <AppIcon icon="file-pdf" class="fs-3 mb-2" style="color: #ef4444" />
                <div class="fw-bold text-dark" style="font-size: 13px">PDF</div>
                <div class="text-muted" style="font-size: 10px">Documento formal institucional</div>
              </label>
            </div>
            <div class="col-4">
              <label
                class="w-100 format-card rounded-3 border p-3 text-center position-relative cursor-pointer"
                :class="{
                  'border-primary bg-primary-light': form.format === 'excel',
                }"
              >
                <input type="radio" v-model="form.format" value="excel" class="position-absolute end-0 top-0 m-2" style="accent-color: var(--bs-primary)" />
                <AppIcon icon="file-excel" class="fs-3 mb-2" style="color: #22c55e" />
                <div class="fw-bold text-dark" style="font-size: 13px">Excel</div>
                <div class="text-muted" style="font-size: 10px">Hoja de cálculo (.xlsx)</div>
              </label>
            </div>
            <div class="col-4">
              <label
                class="w-100 format-card rounded-3 border p-3 text-center position-relative cursor-pointer"
                :class="{
                  'border-primary bg-primary-light': form.format === 'word',
                }"
              >
                <input type="radio" v-model="form.format" value="word" class="position-absolute end-0 top-0 m-2" style="accent-color: var(--bs-primary)" />
                <AppIcon icon="file-word" class="fs-3 mb-2" style="color: #3b82f6" />
                <div class="fw-bold text-dark" style="font-size: 13px">Word</div>
                <div class="text-muted" style="font-size: 10px">Documento editable (.docx)</div>
              </label>
            </div>
          </div>
        </div>

        <hr class="text-muted opacity-25" />

        <!-- Section 2 -->
        <div class="mb-4">
          <h6 class="fw-bold text-dark mb-1" style="font-size: 14px">2. Contenido a Incluir</h6>
          <p class="text-muted small mb-3" style="font-size: 12px">Marca las secciones que deseas incluir en el documento</p>
          <div class="d-flex flex-column gap-2 mb-4">
            <label class="content-row border rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" v-model="form.content.infoGeneral" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Información general de la malla</div>
                <div class="text-muted" style="font-size: 11px">Programa, versión, vigencia, estado</div>
              </div>
            </label>

            <label class="content-row border rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" v-model="form.content.resumenCreditos" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Resumen de créditos</div>
                <div class="text-muted" style="font-size: 11px">Total créditos, asignaturas, semestres</div>
              </div>
            </label>

            <label class="content-row border rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" v-model="form.content.listadoSemestres" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Listado por semestres</div>
                <div class="text-muted" style="font-size: 11px">Estructura completa de asignaturas por semestre</div>
              </div>
            </label>

            <label class="content-row border rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" v-model="form.content.competencias" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Competencias por asignatura</div>
                <div class="text-muted" style="font-size: 11px">Competencias generales y específicas asociadas</div>
              </div>
            </label>

            <label class="content-row border rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" v-model="form.content.resultadosAprendizaje" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Resultados de aprendizaje</div>
                <div class="text-muted" style="font-size: 11px">Resultados esperados por asignatura</div>
              </div>
            </label>

            <label class="content-row border rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" v-model="form.content.indicadoresEstado" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Indicadores de estado</div>
                <div class="text-muted" style="font-size: 11px">Estado de configuración (Completa / Parcial / Pendiente)</div>
              </div>
            </label>
          </div>

          <p class="text-muted small mb-2" style="font-size: 12px">Opciones Avanzadas</p>
          <div class="d-flex flex-column gap-2">
            <label class="content-row border border-dashed rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none" style="background-color: #f9fafb">
              <input type="checkbox" v-model="form.advanced.firmaDigital" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px; opacity: 0.5" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Incluir firma digital del coordinador</div>
                <div class="text-muted" style="font-size: 11px">Firma electrónica institucional</div>
              </div>
            </label>

            <label class="content-row border border-dashed rounded-3 p-3 d-flex align-items-start gap-3 cursor-pointer select-none" style="background-color: #f9fafb">
              <input type="checkbox" v-model="form.advanced.codigoQR" class="mt-1" style="accent-color: #111827; width: 16px; height: 16px; opacity: 0.5" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Incluir código QR de verificación</div>
                <div class="text-muted" style="font-size: 11px">Código de validación del documento</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Section 3 -->
        <div class="mb-2">
          <h6 class="fw-bold text-dark mb-1" style="font-size: 14px">3. Nivel de Detalle</h6>
          <p class="text-muted small mb-3" style="font-size: 12px">Selecciona la cantidad de información a incluir</p>

          <div class="d-flex flex-column gap-2 mb-4">
            <label
              class="level-row border rounded-3 p-3 d-flex align-items-center gap-3 cursor-pointer select-none"
              :class="{
                'border-primary bg-primary-light': form.detailLevel === 'resumen',
              }"
            >
              <input type="radio" v-model="form.detailLevel" value="resumen" class="mt-1" style="accent-color: var(--bs-primary); height: 16px; width: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Resumen ejecutivo</div>
                <div class="text-muted" style="font-size: 11px">Solo estructura y créditos básicos</div>
              </div>
            </label>

            <label
              class="level-row border rounded-3 p-3 d-flex align-items-center gap-3 cursor-pointer select-none"
              :class="{
                'border-primary bg-primary-light': form.detailLevel === 'academica',
              }"
            >
              <input type="radio" v-model="form.detailLevel" value="academica" class="mt-1" style="accent-color: var(--bs-primary); height: 16px; width: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Versión académica</div>
                <div class="text-muted" style="font-size: 11px">Incluye competencias y estructura completa</div>
              </div>
            </label>

            <label
              class="level-row border rounded-3 p-3 d-flex align-items-center gap-3 cursor-pointer select-none"
              :class="{
                'border-primary bg-primary-light': form.detailLevel === 'detallada',
              }"
            >
              <input type="radio" v-model="form.detailLevel" value="detallada" class="mt-1" style="accent-color: var(--bs-primary); height: 16px; width: 16px" />
              <div>
                <div class="fw-medium text-dark" style="font-size: 13px">Versión detallada</div>
                <div class="text-muted" style="font-size: 11px">Incluye resultados, horas y toda la información</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer Fixed -->
      <div class="p-4 border-top d-flex justify-content-end gap-3 flex-shrink-0 bg-white" style="border-radius: 0 0 0.5rem 0.5rem">
        <AppButton variant="ghost" class="text-dark fw-medium border-0 px-4" @click="$emit('update:modelValue', false)"> Cancelar </AppButton>
        <AppButton variant="dark" class="bg-dark fw-medium px-4 d-flex align-items-center gap-2" @click="handleExport">
          <AppIcon icon="download" style="font-size: 13px" /> Generar Documento
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'ExportGridModal',
  components: {
    AppModal,
    AppButton,
    AppIcon,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue', 'export'],
  setup(props, { emit }) {
    const form = reactive({
      format: 'pdf',
      content: {
        infoGeneral: true,
        resumenCreditos: true,
        listadoSemestres: true,
        competencias: true,
        resultadosAprendizaje: false,
        indicadoresEstado: false,
      },
      advanced: {
        firmaDigital: false,
        codigoQR: false,
      },
      detailLevel: 'academica',
    });

    const handleExport = () => {
      emit('export', { ...form });
      emit('update:modelValue', false);
    };

    return {
      form,
      handleExport,
    };
  },
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.select-none {
  user-select: none;
}
.format-card {
  transition: all 0.2s;
}
.format-card:hover {
  border-color: #cbd5e1 !important;
}
.bg-primary-light {
  background-color: #eff6ff !important;
}
.border-primary {
  border-color: #3b82f6 !important;
}
.border-dashed {
  border-style: dashed !important;
  border-color: #d1d5db !important;
}
</style>
