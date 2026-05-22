<template>
  <AppDrawer :isVisible="isVisible" size="lg" @update:isVisible="emitUpdate">
    <!-- HEAD -->
    <template #head>
      <div class="drawerHead">
        <div>
          <h2 class="drawerHead__title">
            {{ template?.id ? 'Editar Plantilla' : 'Nueva Plantilla' }}
          </h2>
          <p class="drawerHead__subtitle">Crea y gestiona dimensiones, preguntas, tipo de respuesta y pesos</p>
        </div>

        <button type="button" class="drawerHead__close" @click="close" aria-label="Cerrar">
          <AppIcon icon="x" />
        </button>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form class="form" @submit.prevent="save">
        <div class="form__content">
          <!-- Info General -->
          <section class="sectionCard">
            <header class="sectionCard__header">
              <div class="sectionCard__icon">
                <AppIcon icon="file-text" />
              </div>
              <div>
                <h3 class="sectionCard__title">Información General</h3>
                <p class="sectionCard__subtitle">Define el nombre y propósito de la plantilla</p>
              </div>
            </header>

            <div class="field">
              <label class="field__label"> Nombre de la Plantilla <span class="field__required">*</span> </label>
              <input v-model="form.name" type="text" class="field__input" placeholder="Ej: Plantilla Estándar Pregrado" required />
            </div>

            <div class="field">
              <label class="field__label">Descripción</label>
              <textarea v-model="form.description" rows="3" class="field__textarea" placeholder="Describe el alcance de esta plantilla…" />
            </div>

            <div class="metaRow">
              <div class="metaPill">
                <span class="dot dot--blue" />
                <span class="metaPill__text">
                  {{ dimensions.length }}
                  {{ dimensions.length === 1 ? 'dimensión' : 'dimensiones' }}
                </span>
              </div>

              <div class="metaPill">
                <span class="dot dot--green" />
                <span class="metaPill__text">
                  {{ totalQuestions }}
                  {{ totalQuestions === 1 ? 'pregunta' : 'preguntas' }}
                </span>
              </div>
            </div>
          </section>

          <!-- Dimensiones y preguntas -->
          <section class="sectionCard">
            <header class="sectionCard__header sectionCard__header--space">
              <div class="sectionCard__left">
                <div class="sectionCard__icon sectionCard__icon--soft">
                  <AppIcon icon="layers" />
                </div>
                <div>
                  <h3 class="sectionCard__title">Dimensiones y Preguntas</h3>
                  <p class="sectionCard__subtitle">Organiza por dimensión y define el peso por pregunta (100% por dimensión)</p>
                </div>
              </div>

              <AppButton type="button" class="primaryMini" @click="addDimension">
                <AppIcon icon="plus" />
                Agregar Dimensión
              </AppButton>
            </header>

            <div v-if="dimensions.length === 0" class="emptyBox">
              <div class="emptyBox__icon">📄</div>
              <div class="emptyBox__title">No hay dimensiones creadas</div>
              <div class="emptyBox__text">Crea la primera dimensión para empezar.</div>

              <AppButton type="button" class="primaryMini primaryMini--big" @click="addDimension">
                <AppIcon icon="plus" />
                Crear Primera Dimensión
              </AppButton>
            </div>

            <div v-else class="dimList">
              <div v-for="(dim, dimIndex) in dimensions" :key="dim.id" class="dimCard">
                <!-- Dim header -->
                <div class="dimHead">
                  <div class="dimHead__left">
                    <!-- mover (simple) -->
                    <div class="moveCol">
                      <button type="button" class="moveBtn" :disabled="dimIndex === 0" @click="moveDimension(dimIndex, -1)" title="Subir">▲</button>
                      <button type="button" class="moveBtn" :disabled="dimIndex === dimensions.length - 1" @click="moveDimension(dimIndex, 1)" title="Bajar">▼</button>
                    </div>

                    <div class="dimInputs">
                      <input v-model="dim.name" type="text" class="dimName" placeholder="Nombre de la dimensión" />
                      <textarea v-model="dim.description" rows="2" class="dimDesc" placeholder="Descripción de la dimensión" />
                    </div>
                  </div>

                  <div class="dimHead__right">
                    <AppButton type="button" variant="secondary" class="dangerMini" @click="removeDimension(dim.id)"> Eliminar </AppButton>
                  </div>
                </div>

                <!-- Peso + acciones -->
                <div class="dimMeta">
                  <div class="weightInfo">
                    Pesos asignados:
                    <span
                      class="weightInfo__value"
                      :class="{
                        'weightInfo__value--bad': !isDimensionWeightValid(dim),
                      }"
                    >
                      {{ calculateTotalWeight(dim.questions) }}%
                    </span>

                    <span v-if="!isDimensionWeightValid(dim)" class="weightWarn"> ⚠ Debe sumar 100% </span>
                  </div>

                  <AppButton type="button" class="primaryMini" @click="addQuestion(dim.id)">
                    <AppIcon icon="plus" />
                    Agregar Pregunta
                  </AppButton>
                </div>

                <!-- Questions -->
                <div class="qWrap">
                  <div v-if="dim.questions.length === 0" class="qEmpty">No hay preguntas en esta dimensión.</div>

                  <div v-else class="qList">
                    <div v-for="(q, qIndex) in dim.questions" :key="q.id" class="qCard">
                      <div class="qRow">
                        <div class="qNum">{{ qIndex + 1 }}</div>

                        <div class="qBody">
                          <textarea v-model="q.text" rows="2" class="qText" placeholder="Escribe la pregunta aquí..." />

                          <div class="qMeta">
                            <div class="qField">
                              <label class="miniLabel">Tipo</label>
                              <select v-model="q.type" class="miniSelect">
                                <option value="likert">Escala Likert (1-5)</option>
                                <option value="open">Respuesta Abierta</option>
                              </select>
                            </div>

                            <div class="qField qField--w">
                              <label class="miniLabel">Peso (%)</label>
                              <input v-model.number="q.weight" type="number" min="0" max="100" class="miniInput" />
                            </div>

                            <div class="qActions">
                              <button type="button" class="moveBtn" :disabled="qIndex === 0" @click="moveQuestion(dim.id, qIndex, -1)" title="Subir">▲</button>
                              <button type="button" class="moveBtn" :disabled="qIndex === dim.questions.length - 1" @click="moveQuestion(dim.id, qIndex, 1)" title="Bajar">▼</button>

                              <AppButton type="button" variant="secondary" class="dangerMini" @click="removeQuestion(dim.id, q.id)"> Eliminar </AppButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- /Questions -->
              </div>
            </div>
          </section>

          <!-- Nota -->
          <div class="infoBox">
            <p><strong>Nota:</strong> Si una dimensión tiene preguntas, el peso total debe ser <strong>100%</strong> para poder guardar.</p>
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="footer">
        <AppButton variant="secondary" @click="close">Cancelar</AppButton>

        <AppButton :disabled="!canSave" @click="save">
          <AppIcon icon="check-circle" />
          Guardar Plantilla
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

type QuestionType = 'likert' | 'open';

type Question = {
  id: string;
  text: string;
  type: QuestionType;
  weight: number;
};

type Dimension = {
  id: string;
  name: string;
  description: string;
  questions: Question[];
};

// Ajusta si tu Template tiene otro shape
export type Template = {
  id: number;
  name: string;
  description: string;
  dimensionCount: number;
  questionCount: number;
  lastModified: string;
  usageCount: number;
  dimensions?: Dimension[];
};

export default defineComponent({
  name: 'TemplateEditorModal',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
    template: { type: Object as () => Template | null, default: null },
    isNew: { type: Boolean, default: false },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const form = reactive({
      id: 0,
      name: '',
      description: '',
      dimensionCount: 0,
      questionCount: 0,
      lastModified: '',
      usageCount: 0,
    });

    const dimensions = reactive<Dimension[]>([]);

    const totalQuestions = computed(() => dimensions.reduce((sum, d) => sum + d.questions.length, 0));

    watch(
      () => [dimensions.length, totalQuestions.value],
      () => {
        form.dimensionCount = dimensions.length;
        form.questionCount = totalQuestions.value;
      },
      { immediate: true }
    );

    const calculateTotalWeight = (questions: Question[]) => questions.reduce((sum, q) => sum + (Number(q.weight) || 0), 0);

    const isDimensionWeightValid = (dimension: Dimension) => {
      const total = calculateTotalWeight(dimension.questions);
      return dimension.questions.length === 0 ? true : total === 100;
    };

    const canSave = computed(() => {
      if (String(form.name).trim().length < 3) return false;
      const invalid = dimensions.some((d) => !isDimensionWeightValid(d));
      return !invalid;
    });

    // CRUD
    const addDimension = () => {
      dimensions.push({
        id: `dim-${uid()}`,
        name: '',
        description: '',
        questions: [],
      });
    };

    const removeDimension = (dimensionId: string) => {
      const idx = dimensions.findIndex((d) => d.id === dimensionId);
      if (idx >= 0) dimensions.splice(idx, 1);
    };

    const addQuestion = (dimensionId: string) => {
      const dim = dimensions.find((d) => d.id === dimensionId);
      if (!dim) return;

      dim.questions.push({
        id: `q-${uid()}`,
        text: '',
        type: 'likert',
        weight: 0,
      });
    };

    const removeQuestion = (dimensionId: string, questionId: string) => {
      const dim = dimensions.find((d) => d.id === dimensionId);
      if (!dim) return;

      const idx = dim.questions.findIndex((q) => q.id === questionId);
      if (idx >= 0) dim.questions.splice(idx, 1);
    };

    // move (drag simple)
    const moveDimension = (index: number, dir: -1 | 1) => {
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= dimensions.length) return;
      const item = dimensions.splice(index, 1)[0];
      dimensions.splice(newIndex, 0, item);
    };

    const moveQuestion = (dimensionId: string, qIndex: number, dir: -1 | 1) => {
      const dim = dimensions.find((d) => d.id === dimensionId);
      if (!dim) return;

      const newIndex = qIndex + dir;
      if (newIndex < 0 || newIndex >= dim.questions.length) return;

      const item = dim.questions.splice(qIndex, 1)[0];
      dim.questions.splice(newIndex, 0, item);
    };

    // init / fill
    watch(
      () => props.template,
      (val) => {
        // reset
        form.id = 0;
        form.name = '';
        form.description = '';
        form.dimensionCount = 0;
        form.questionCount = 0;
        form.lastModified = '';
        form.usageCount = 0;

        dimensions.splice(0, dimensions.length);

        if (!val) return;

        form.id = val.id ?? 0;
        form.name = val.name ?? '';
        form.description = val.description ?? '';
        form.dimensionCount = val.dimensionCount ?? 0;
        form.questionCount = val.questionCount ?? 0;
        form.lastModified = val.lastModified ?? '';
        form.usageCount = val.usageCount ?? 0;

        // si ya tiene dimensiones guardadas, las cargamos
        if (Array.isArray(val.dimensions) && val.dimensions.length) {
          val.dimensions.forEach((d) => {
            dimensions.push({
              id: d.id || `dim-${uid()}`,
              name: d.name || '',
              description: d.description || '',
              questions: (d.questions || []).map((q) => ({
                id: q.id || `q-${uid()}`,
                text: q.text || '',
                type: (q.type || 'likert') as QuestionType,
                weight: Number(q.weight) || 0,
              })),
            });
          });
        }
      },
      { immediate: true }
    );

    function emitUpdate(val: boolean) {
      emit('update:isVisible', val);
    }

    function close() {
      emit('update:isVisible', false);
    }

    const save = () => {
      if (!canSave.value) return;

      const payload: Template = {
        id: props.template?.id ? props.template.id : Date.now(),
        name: form.name,
        description: form.description,
        dimensionCount: dimensions.length,
        questionCount: totalQuestions.value,
        lastModified: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        usageCount: props.template?.usageCount ?? 0,
        dimensions: JSON.parse(JSON.stringify(dimensions)),
      };

      emit('saved', payload);
      close();
    };

    return {
      // props ui
      emitUpdate,
      close,
      save,

      // state
      form,
      dimensions,
      totalQuestions,

      // methods
      addDimension,
      removeDimension,
      addQuestion,
      removeQuestion,
      calculateTotalWeight,
      isDimensionWeightValid,
      moveDimension,
      moveQuestion,

      // validation
      canSave,
    };
  },
});
</script>

<style scoped>
/* ===== Head ===== */
.drawerHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}
.drawerHead__title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
.drawerHead__subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}
.drawerHead__close {
  border: 0;
  background: transparent;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  color: #fff;
}
.drawerHead__close:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ===== Body ===== */
.form {
  height: 100%;
}
.form__content {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ===== Card ===== */
.sectionCard {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
}
.sectionCard__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.sectionCard__header--space {
  justify-content: space-between;
}
.sectionCard__left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sectionCard__icon {
  width: 40px;
  height: 40px;
  background: #2563eb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.sectionCard__icon--soft {
  background: #eaf2ff;
  color: #2563eb;
}
.sectionCard__title {
  font-weight: 700;
  color: #0f172a;
  font-size: 15px;
}
.sectionCard__subtitle {
  font-size: 13px;
  color: #475569;
  margin-top: 2px;
}

/* ===== Fields ===== */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field__label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}
.field__required {
  color: #ef4444;
}
.field__input,
.field__textarea {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
}
.field__textarea {
  resize: vertical;
}
.field__input:focus,
.field__textarea:focus {
  border-color: transparent;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
}

/* meta pills */
.metaRow {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
.metaPill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
}
.metaPill__text {
  font-size: 12px;
  font-weight: 800;
  color: #334155;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.dot--blue {
  background: #2563eb;
}
.dot--green {
  background: #16a34a;
}

/* buttons */
.primaryMini {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.primaryMini--big {
  margin-top: 10px;
}

/* empty */
.emptyBox {
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  padding: 18px;
  text-align: center;
}
.emptyBox__icon {
  font-size: 26px;
  opacity: 0.75;
}
.emptyBox__title {
  margin-top: 6px;
  font-weight: 900;
  color: #0f172a;
}
.emptyBox__text {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

/* dimension list */
.dimList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dimCard {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}
.dimHead {
  padding: 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.dimHead__left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.moveCol {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 2px;
}
.moveBtn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  width: 34px;
  height: 30px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 900;
}
.moveBtn:hover {
  background: #f1f5f9;
}
.moveBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.dimInputs {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dimName {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 900;
  color: #0f172a;
  outline: none;
}
.dimName:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.dimDesc {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: #334155;
  outline: none;
}
.dimDesc:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.dimMeta {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.weightInfo {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}
.weightInfo__value {
  margin-left: 6px;
  color: #16a34a;
  font-weight: 900;
}
.weightInfo__value--bad {
  color: #dc2626;
}
.weightWarn {
  margin-left: 10px;
  color: #dc2626;
  font-weight: 900;
}

/* questions */
.qWrap {
  padding: 0 14px 14px;
}
.qEmpty {
  padding: 14px 0;
  font-size: 12px;
  color: #64748b;
  text-align: center;
}
.qList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.qCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}
.qRow {
  display: flex;
  gap: 10px;
}
.qNum {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  flex-shrink: 0;
}
.qBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.qText {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  font-size: 12px;
  color: #0f172a;
  background: #fff;
}
.qText:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.qMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: end;
}
.qField {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
}
.qField--w {
  min-width: 120px;
}
.miniLabel {
  font-size: 11px;
  color: #64748b;
  font-weight: 900;
}
.miniSelect {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 9px 10px;
  outline: none;
  background: #fff;
  font-size: 12px;
}
.miniSelect:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.miniInput {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 9px 10px;
  outline: none;
  background: #fff;
  font-size: 12px;
  text-align: center;
}
.miniInput:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.qActions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}
.dangerMini {
  border: 1px solid #fecaca !important;
  color: #dc2626 !important;
}
.dangerMini:hover {
  background: #fef2f2 !important;
}

/* info */
.infoBox {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  border-radius: 12px;
  padding: 14px;
  color: #1e3a8a;
  font-size: 13px;
}

/* footer */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
