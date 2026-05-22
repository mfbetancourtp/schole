<template>
  <AppFormModal :title="`Vista previa · ${checklistTitle}`" @cancel="$emit('close')">
    <template #content>
      <div class="preview-container">
        <!-- Banner informativo: recuerda al usuario que es solo visualización -->
        <div class="preview-banner">
          <AppIcon icon="eye" class="me-2" />
          <span>Así verán este checklist los encuestados. Las respuestas no se envían.</span>
        </div>

        <div v-if="loading" class="preview-state">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="preview-state__text">Cargando checklist...</p>
        </div>

        <div v-else-if="errorMsg" class="preview-state preview-state--danger">
          <AppIcon icon="exclamation-triangle" class="preview-state__icon" />
          {{ errorMsg }}
        </div>

        <div v-else-if="!tree || !visibleCategorias.length" class="preview-state preview-state--muted">
          <p>Este checklist aún no tiene categorías ni preguntas.</p>
        </div>

        <AppAccordion v-else style-type="rounded" class="preview-body">
          <AppAccordionItem v-for="(categoria, catIdx) in visibleCategorias" :key="categoria.id" :init-open="catIdx === 0">
            <template #head>
              <div class="preview-category-header">
                <span class="preview-category-number">{{ catIdx + 1 }}</span>
                <span class="preview-category-title">{{ categoria.descripcion }}</span>
                <span
                  class="preview-category-count"
                  :class="{
                    'preview-category-count--empty': getVisibleQuestionsCount(categoria) === 0,
                  }"
                >
                  {{ getVisibleQuestionsCount(categoria) }}
                  {{ getVisibleQuestionsCount(categoria) === 1 ? 'pregunta' : 'preguntas' }}
                </span>
              </div>
            </template>

            <template #content>
              <div class="preview-questions">
                <template v-for="(pregunta, qIdx) in flattenQuestions(categoria)" :key="pregunta.id">
                  <div
                    v-if="isQuestionVisible(pregunta)"
                    class="preview-question"
                    :class="{
                      'preview-question--child': pregunta.__parentId != null,
                    }"
                  >
                    <label class="preview-question-label" :for="`q-${pregunta.id}`">
                      <span class="preview-question-code">
                        <span class="preview-question-index">{{ catIdx + 1 }}.{{ qIdx + 1 }}</span>
                        <template v-if="pregunta.codigo">{{ pregunta.codigo }}</template>
                      </span>
                      <span class="preview-question-text">{{ pregunta.pregunta }}</span>
                      <span v-if="pregunta.obligatoria === 1" class="preview-required">*</span>
                    </label>

                    <!-- id=1 Abierta -->
                    <textarea
                      v-if="getTipo(pregunta) === TIPO.ABIERTA"
                      :id="`q-${pregunta.id}`"
                      v-model="answers[pregunta.id]"
                      class="form-control"
                      rows="3"
                      placeholder="Escribe tu respuesta..."
                    ></textarea>

                    <!-- id=7 Numerico -->
                    <AppInput v-else-if="getTipo(pregunta) === TIPO.NUMERICO" v-model="answers[pregunta.id]" type="number" placeholder="0" />

                    <!-- id=2 Fecha -->
                    <AppDateInput v-else-if="getTipo(pregunta) === TIPO.FECHA" :id="`q-${pregunta.id}`" v-model="answers[pregunta.id]" />

                    <!-- id=4 Selección única -->
                    <AppAutocomplete
                      v-else-if="getTipo(pregunta) === TIPO.SELECCION_UNICA"
                      :input-id="`q-${pregunta.id}`"
                      :options="getOpciones(pregunta)"
                      label="descripcion"
                      v-model="answers[pregunta.id]"
                    />

                    <!-- id=3 Múltiple -->
                    <div v-else-if="getTipo(pregunta) === TIPO.MULTIPLE" class="preview-options">
                      <AppCheckbox
                        v-for="opcion in getOpciones(pregunta)"
                        :key="opcion.id"
                        :model-value="isMultiSelected(pregunta.id, opcion.id)"
                        :label="opcion.descripcion"
                        @change="toggleMulti(pregunta.id, opcion.id)"
                      />
                    </div>

                    <!-- id=5 Checkbox (se renderiza como grupo de radio
                         buttons con las opciones configuradas — el catálogo
                         conserva el nombre histórico "Checkbox"). -->
                    <div v-else-if="getTipo(pregunta) === TIPO.CHECKBOX" class="preview-options">
                      <div v-for="opcion in getOpciones(pregunta)" :key="opcion.id" class="form-check">
                        <input
                          :id="`q-${pregunta.id}-op-${opcion.id}`"
                          class="form-check-input"
                          type="radio"
                          :name="`q-${pregunta.id}`"
                          :value="opcion.id"
                          :checked="Number(answers[pregunta.id]) === opcion.id"
                          @change="answers[pregunta.id] = opcion.id"
                        />
                        <label :for="`q-${pregunta.id}-op-${opcion.id}`" class="form-check-label">
                          {{ opcion.descripcion }}
                        </label>
                      </div>
                      <div v-if="!getOpciones(pregunta).length" class="preview-empty-note">Sin opciones configuradas.</div>
                    </div>

                    <!-- id=9 Archivo -->
                    <AppAttachmentDropzone
                      v-else-if="getTipo(pregunta) === TIPO.ARCHIVO"
                      v-model="answers[pregunta.id]"
                      :is-title="''"
                      is-helper="PDF, DOC, DOCX, JPG, PNG (máx. 10MB)"
                      is-accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      :is-max-size-m-b="10"
                      :is-show-delete="true"
                    />

                    <!-- id=6 Canvas / firma -->
                    <AppSignaturePad v-else-if="getTipo(pregunta) === TIPO.CANVAS" v-model="answers[pregunta.id]" />

                    <!-- Fallback: texto libre ante un tipo desconocido -->
                    <textarea v-else :id="`q-${pregunta.id}`" v-model="answers[pregunta.id]" class="form-control" rows="2" placeholder="Escribe tu respuesta..."></textarea>
                  </div>
                </template>

                <div v-if="getVisibleQuestionsCount(categoria) === 0" class="preview-category-empty">No hay preguntas visibles en esta categoría.</div>
              </div>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </div>
    </template>

    <template #actions>
      <!-- AppFormModal ya provee el botón "Cancelar" que emite @cancel -> @close -->
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, PropType } from 'vue';

import AppFormModal from '../../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppAccordion from '../../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../../shared/components/Accordion/AppAccordionItem.vue';
import AppInput from '../../../../shared/components/Forms/AppInput.vue';
import AppDateInput from '../../../../shared/components/Forms/AppDateInput.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import AppAttachmentDropzone from '../../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppCheckbox from '../../../../shared/components/Forms/AppCheckbox.vue';
import AppSignaturePad from '../../../../shared/components/Forms/AppSignaturePad.vue';

import { ChecklistTreeDto, ChecklistQuestionDto, ChecklistCategoryTreeDto, ChecklistAnswerOptionDto } from '../../dtos/checklist.dto';
import { GetChecklistTreeService } from '../../services/checklist/getChecklistTree.service';
import { ToastService } from '../../../../shared/services/toast.service';

const getChecklistTreeService = new GetChecklistTreeService();
const toastService = new ToastService();

type AnswerValue = string | number | boolean | number[] | File | null | { id: number };

/**
 * Tipo canónico (clave de frontend) derivado del catálogo `/forms/tipo-respuesta`.
 * El orden aquí no importa, pero los IDs de `TIPO_POR_ID` SÍ deben coincidir
 * exactamente con la tabla del backend.
 */
export const TIPO = {
  ABIERTA: 'abierta',
  FECHA: 'fecha',
  MULTIPLE: 'multiple',
  SELECCION_UNICA: 'seleccion_unica',
  CHECKBOX: 'checkbox',
  CANVAS: 'canvas',
  NUMERICO: 'numerico',
  ARCHIVO: 'archivo',
  DESCONOCIDO: 'desconocido',
} as const;

type TipoRespuesta = typeof TIPO[keyof typeof TIPO];

/**
 * Mapeo id → tipo canónico. Fuente de verdad: catálogo
 * `GET /forms/tipo-respuesta`. Nota: el id `8` no existe en el backend.
 */
const TIPO_POR_ID: Readonly<Record<number, TipoRespuesta>> = Object.freeze({
  1: TIPO.ABIERTA,
  2: TIPO.FECHA,
  3: TIPO.MULTIPLE,
  4: TIPO.SELECCION_UNICA,
  5: TIPO.CHECKBOX,
  6: TIPO.CANVAS,
  7: TIPO.NUMERICO,
  9: TIPO.ARCHIVO,
});

/** Alias textuales tolerados como fallback si el backend no envía `tipoRespuestaId`. */
const ALIASES_POR_TIPO: Readonly<Record<TipoRespuesta, readonly string[]>> = Object.freeze({
  [TIPO.ABIERTA]: ['abierta', 'texto', 'textolargo', 'textocorto', 'correo'],
  [TIPO.FECHA]: ['fecha'],
  [TIPO.MULTIPLE]: ['multiple', 'seleccionmultiple'],
  [TIPO.SELECCION_UNICA]: ['seleccionunica', 'radio'],
  [TIPO.CHECKBOX]: ['checkbox', 'booleano', 'sino', 'falsoverdadero'],
  [TIPO.CANVAS]: ['canvas', 'firma', 'dibujo'],
  [TIPO.NUMERICO]: ['numerico', 'numero'],
  [TIPO.ARCHIVO]: ['archivo', 'file', 'documento'],
  [TIPO.DESCONOCIDO]: [],
});

/**
 * El tree endpoint devuelve `opcionesRespuesta`; el CRUD plano, `opciones`.
 * Unificamos aquí para no repetir la lógica en el template.
 */
const getOpciones = (pregunta: ChecklistQuestionDto): ChecklistAnswerOptionDto[] => {
  return pregunta.opcionesRespuesta ?? pregunta.opciones ?? [];
};

const normalizeText = (value: string): string =>
  (value ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_\-/]/g, '')
    .trim();

export default defineComponent({
  name: 'ChecklistPreviewModal',

  components: {
    AppFormModal,
    AppIcon,
    AppAccordion,
    AppAccordionItem,
    AppInput,
    AppDateInput,
    AppAutocomplete,
    AppAttachmentDropzone,
    AppCheckbox,
    AppSignaturePad,
  },

  props: {
    checklistId: {
      type: Number as PropType<number>,
      required: true,
    },
    checklistTitle: {
      type: String,
      default: '',
    },
  },

  emits: ['close'],

  setup(props) {
    const loading = ref(false);
    const errorMsg = ref('');
    const tree = ref<ChecklistTreeDto | null>(null);
    const answers = reactive<Record<number, AnswerValue>>({});

    /**
     * Resuelve el tipo canónico de una pregunta. Usa `tipoRespuestaId` como
     * fuente de verdad (catálogo `/forms/tipo-respuesta`), con fallback a
     * `tipoRespuestaNombre` normalizado para tolerar respuestas legacy.
     */
    const getTipo = (pregunta: ChecklistQuestionDto): TipoRespuesta => {
      const byId = TIPO_POR_ID[pregunta.tipoRespuestaId];
      if (byId) return byId;
      const nombre = normalizeText(pregunta.tipoRespuestaNombre ?? '');
      for (const [tipo, aliases] of Object.entries(ALIASES_POR_TIPO) as Array<[TipoRespuesta, readonly string[]]>) {
        if (aliases.includes(nombre)) return tipo;
      }
      return TIPO.DESCONOCIDO;
    };

    // ─── Categorías / visibilidad ──────────────────────────────────────
    const visibleCategorias = computed<ChecklistCategoryTreeDto[]>(() => {
      if (!tree.value) return [];
      return tree.value.categorias.filter((c) => c.activo !== 0).filter((c) => (c.preguntas ?? []).some((p) => p.activo !== 0));
    });

    /**
     * Decoramos cada pregunta con `__parentId` al aplanar, para poder evaluar
     * visibilidad sin tener que recorrer el árbol en cada render.
     */
    type FlatQuestion = ChecklistQuestionDto & { __parentId: number | null };

    /**
     * Aplana `categoria.preguntas` + sus `preguntasDependientes` (hijos del
     * tree endpoint) en una lista lineal en orden visual:
     * padre → hijos que dependen de él.
     */
    const flattenQuestions = (categoria: ChecklistCategoryTreeDto): FlatQuestion[] => {
      const result: FlatQuestion[] = [];
      for (const padre of categoria.preguntas ?? []) {
        if (padre.activo === 0) continue;
        result.push({ ...padre, __parentId: null });
        for (const hijo of padre.preguntasDependientes ?? []) {
          if (hijo.activo === 0) continue;
          result.push({ ...hijo, __parentId: padre.id });
        }
      }
      return result;
    };

    /**
     * Extrae el id real de una respuesta. `AppAutocomplete` emite el objeto
     * completo `{ id, descripcion }` en `seleccion_unica`; aquí lo normalizamos
     * para que el cálculo de visibilidad sea consistente.
     */
    const toOptionId = (value: unknown): number | null => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
        const id = (value as { id: unknown }).id;
        return typeof id === 'number' ? id : null;
      }
      return null;
    };

    /**
     * Visibilidad de una pregunta aplanada:
     * - Top-level (sin padre) → visible si está activa.
     * - Hija → visible si la respuesta del padre coincide con alguno de los
     *   triggers declarados en `idOpcionRespuestaDependiente`.
     */
    const isQuestionVisible = (pregunta: FlatQuestion | ChecklistQuestionDto): boolean => {
      if (pregunta.activo === 0) return false;
      const parentId = (pregunta as FlatQuestion).__parentId;
      if (parentId == null) return true;

      const triggers = pregunta.idOpcionRespuestaDependiente ?? [];
      if (!triggers.length) return true;

      const answer = answers[parentId];
      if (answer === null || answer === undefined) return false;

      if (Array.isArray(answer)) {
        return answer.some((a) => {
          const id = toOptionId(a);
          return id != null && triggers.includes(id);
        });
      }
      const id = toOptionId(answer);
      return id != null && triggers.includes(id);
    };

    const getVisibleQuestionsCount = (categoria: ChecklistCategoryTreeDto): number => flattenQuestions(categoria).filter((p) => isQuestionVisible(p)).length;

    // ─── Multi-select ──────────────────────────────────────────────────
    const isMultiSelected = (preguntaId: number, opcionId: number): boolean => {
      const current = answers[preguntaId];
      return Array.isArray(current) && current.includes(opcionId);
    };

    const toggleMulti = (preguntaId: number, opcionId: number): void => {
      const current = answers[preguntaId];
      const arr: number[] = Array.isArray(current) ? [...current] : [];
      const index = arr.indexOf(opcionId);
      if (index >= 0) arr.splice(index, 1);
      else arr.push(opcionId);
      answers[preguntaId] = arr;
    };

    // ─── Inicialización ────────────────────────────────────────────────
    const initializeDefaults = (data: ChecklistTreeDto): void => {
      const seed = (preg: ChecklistQuestionDto): void => {
        const tipo = getTipo(preg);
        if (tipo === TIPO.MULTIPLE) answers[preg.id] = [];
        else if (tipo === TIPO.CHECKBOX) answers[preg.id] = false;
        else answers[preg.id] = null;
        (preg.preguntasDependientes ?? []).forEach(seed);
      };
      data.categorias.forEach((cat) => cat.preguntas?.forEach(seed));
    };

    const loadChecklist = async (): Promise<void> => {
      loading.value = true;
      errorMsg.value = '';
      try {
        const data = await getChecklistTreeService.run(props.checklistId);
        tree.value = data;
        initializeDefaults(data);
      } catch (error) {
        console.error('Error cargando checklist para preview:', error);
        errorMsg.value = 'No se pudo cargar la vista previa del checklist.';
        toastService.show(errorMsg.value, 'error');
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadChecklist);

    return {
      TIPO,
      loading,
      errorMsg,
      tree,
      answers,
      visibleCategorias,
      getTipo,
      getOpciones,
      flattenQuestions,
      isQuestionVisible,
      getVisibleQuestionsCount,
      isMultiSelected,
      toggleMulti,
    };
  },
});
</script>

<style scoped>
.preview-container {
  max-height: 65vh;
  overflow-y: auto;
  /* Padding lateral para que el outline/shadow de los AppAccordionItem en
     estado hover/focus no quede cortado por `overflow-y: auto`. */
  padding: 0.25rem 0.75rem;
}

.preview-banner {
  display: flex;
  align-items: center;
  background-color: #e7f3ff;
  color: #0d6efd;
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

.preview-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.preview-category-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background-color: var(--color-primary, #0d6efd);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
}

.preview-category-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-dark, #333);
  flex: 1;
  text-align: left;
}

.preview-category-count {
  font-size: 0.75rem;
  color: var(--color-gray-700, #495057);
  background-color: rgba(var(--color-primary-rgb, 13, 110, 253), 0.08);
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  flex-shrink: 0;
  margin-right: 0.5rem;
  font-weight: 500;
}

.preview-category-count--empty {
  color: var(--color-gray-500, #adb5bd);
  background-color: var(--color-gray-100, #f1f3f5);
  font-weight: 400;
}

.preview-questions {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.25rem 0.25rem 0.5rem;
}

.preview-question {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Pregunta hija (dependiente): se indenta y se marca con una guía visual */
.preview-question--child {
  margin-left: 1.25rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--color-primary, #0d6efd);
}

.preview-question-label {
  font-size: 0.925rem;
  font-weight: 500;
  color: var(--color-dark, #212529);
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preview-question-code {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-gray-600, #6c757d);
  background-color: var(--color-gray-100, #f1f3f5);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

/* Numeración jerárquica "categoria.pregunta" (ej. 1.1, 1.2) que se muestra
   como prefijo dentro del mismo badge del código. Mantiene el color primario
   para destacar sobre el fondo gris, pero sin píldora aparte. */
.preview-question-index {
  color: var(--color-primary, #0d6efd);
  font-weight: 700;
}

.preview-required {
  color: #dc3545;
  font-weight: 600;
}

.preview-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-gray-200, #e9ecef);
  border-radius: 0.5rem;
}

.preview-state {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
  text-align: center;
}
.preview-state--danger {
  color: #dc3545;
}
.preview-state--muted {
  color: #6b7280;
}
.preview-state__icon {
  margin-right: 0.25rem;
}
.preview-state__text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
}
.preview-empty-note {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #6b7280;
}
.preview-category-empty {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
