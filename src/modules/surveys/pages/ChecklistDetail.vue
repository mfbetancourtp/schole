<template>
  <AppBaseList :title="pageTitle">
    <template #actions>
      <AppButton style="color: white" @click="$router.back()"> <AppIcon icon="arrow-left" class="me-1" /> Volver </AppButton>
      <AppCheckPermission permission="surveys.checklist.edit">
        <AppButton style="color: white" @click="openCategoryModal(null)"> <AppIcon icon="plus" class="me-1" /> Nueva Categoría </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <!-- Checklist header -->
      <div class="page-header">
        <h1 class="page-header__title">
          {{ checklistTree?.titulo }}
        </h1>
        <div class="page-header__meta">
          <span>Cálculo de peso: {{ checklistTree?.tipoCalculoPeso }}</span>
          <span :class="['status-pill', checklistTree?.activo ? 'status-pill--success' : 'status-pill--muted']">
            {{ checklistTree?.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
      </div>

      <div class="page-body">
        <AppLoading v-if="loading" />
        <AppEmptyResponse v-else-if="!checklistTree?.categorias?.length" :show-image="true" />

        <div v-else class="category-stack">
          <!-- ── Drag-and-drop: categorías ── -->
          <draggable v-model="categoriasList" tag="div" item-key="id" handle=".cat-drag-handle" ghost-class="ghost-dragging" class="category-stack" @end="handleCategoryReorder">
            <template #item="{ element: categoria, index: catIndex }">
              <div class="category-card">
                <!-- Category header -->
                <div class="category-card__header" @click="toggleCategory(catIndex)">
                  <div class="category-card__header-left">
                    <!-- Drag handle — always visible -->
                    <span class="cat-drag-handle drag-handle drag-handle--gray" title="Arrastrar para reordenar" @click.stop>
                      <AppIcon icon="grip-vertical" />
                    </span>

                    <span class="category-card__index">
                      {{ catIndex + 1 }}
                    </span>
                    <span class="category-card__title">{{ categoria.descripcion }}</span>
                    <span class="category-card__count">({{ categoria.preguntas?.length ?? 0 }} preguntas)</span>
                    <span :class="['status-pill', categoria.activo ? 'status-pill--success' : 'status-pill--muted']">
                      {{ categoria.activo ? 'Activa' : 'Inactiva' }}
                    </span>
                  </div>

                  <div class="category-card__actions" @click.stop>
                    <AppCheckPermission permission="surveys.checklist.edit">
                      <AppButton variant="secondary" outlined icon="plus" v-tooltip="'Agregar Pregunta'" aria-label="Agregar Pregunta" @click="openQuestionDrawer(null, categoria)" />
                    </AppCheckPermission>
                    <AppCheckPermission permission="surveys.checklist.edit">
                      <AppButtonEdit @click="openCategoryModal(categoria)" />
                    </AppCheckPermission>
                    <AppCheckPermission permission="surveys.checklist.delete">
                      <AppButtonDelete @click="confirmDeleteCategory(categoria)" />
                    </AppCheckPermission>
                    <AppIcon :icon="openCategories.includes(catIndex) ? 'chevron-up' : 'chevron-down'" class="category-card__chevron" />
                  </div>
                </div>

                <!-- Category body: questions -->
                <div v-show="openCategories.includes(catIndex)" class="category-card__body">
                  <div v-if="!categoria.preguntas?.length" class="category-card__empty">No hay preguntas en esta categoría</div>

                  <!-- ── Drag-and-drop: preguntas ── -->
                  <draggable
                    v-else
                    v-model="categoria.preguntas"
                    tag="div"
                    item-key="id"
                    handle=".q-drag-handle"
                    ghost-class="ghost-dragging"
                    class="question-list"
                    @end="handleQuestionReorder(categoria)"
                  >
                    <template #item="{ element: pregunta, index: qIndex }">
                      <div class="question-row">
                        <!-- Drag handle — always visible -->
                        <span class="q-drag-handle drag-handle drag-handle--light" title="Arrastrar para reordenar">
                          <AppIcon icon="grip-vertical" />
                        </span>

                        <!-- Question number -->
                        <div class="question-row__number">
                          <span class="question-row__number-text">{{ qIndex + 1 }}</span>
                        </div>

                        <!-- Question info -->
                        <div class="question-row__content">
                          <div class="question-row__meta">
                            <span class="question-row__code">
                              {{ pregunta.codigo }}
                            </span>
                            <span class="question-row__type">{{ pregunta.tipoRespuestaNombre }}</span>
                            <span v-if="pregunta.obligatoria" class="question-row__required">* Obligatoria</span>
                          </div>
                          <p class="question-row__text">
                            {{ pregunta.pregunta }}
                          </p>
                          <!-- Answer options preview: el tree endpoint puede
                               devolverlas como `opcionesRespuesta`; el CRUD
                               plano como `opciones`. Soportamos ambos. -->
                          <div v-if="(pregunta.opcionesRespuesta ?? pregunta.opciones)?.length" class="question-row__options">
                            <span v-for="opcion in (pregunta.opcionesRespuesta ?? pregunta.opciones ?? []).slice(0, 4)" :key="opcion.id" class="option-pill">
                              {{ opcion.descripcion }}
                            </span>
                            <span v-if="(pregunta.opcionesRespuesta ?? pregunta.opciones ?? []).length > 4" class="question-row__options-more">
                              +{{ (pregunta.opcionesRespuesta ?? pregunta.opciones ?? []).length - 4 }}
                              más
                            </span>
                          </div>
                        </div>

                        <!-- Question actions -->
                        <AppButtonGroup class="question-row__actions">
                          <AppCheckPermission permission="surveys.checklist.edit">
                            <AppButtonEdit @click="openQuestionDrawer(pregunta, categoria)" />
                          </AppCheckPermission>
                          <AppCheckPermission permission="surveys.checklist.delete">
                            <AppButtonDelete @click="confirmDeleteQuestion(pregunta)" />
                          </AppCheckPermission>
                        </AppButtonGroup>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Modal: Crear / Editar categoría -->
      <AppModal v-if="showCategoryModal" v-model="showCategoryModal" size="lg">
        <ChecklistCategoryFormModal :checklist-id="checklistId" :data="selectedCategory" @save="handleCategorySave" @close="showCategoryModal = false" />
      </AppModal>

      <!-- Drawer: Crear / Editar pregunta — v-if ensures a fresh mount on every open,
           avoiding Oruga scheduler-flush errors that occur during the initial page render -->
      <ChecklistQuestionDrawer
        v-if="showQuestionDrawer"
        :isVisible="showQuestionDrawer"
        :category-id="selectedCategoryMasterId"
        :data="selectedQuestion"
        :checklist-id="checklistId"
        :category-questions="selectedCategoryQuestions"
        @update:isVisible="showQuestionDrawer = $event"
        @save="handleQuestionSave"
        @refresh="handleQuestionRefresh"
      />

      <!-- Modal: Confirmar eliminar categoría -->
      <AppModal v-if="showDeleteCategoryModal" v-model="showDeleteCategoryModal">
        <AppConfirmDeleteModal entity="categoría" @confirmDelete="handleDeleteCategory" />
      </AppModal>

      <!-- Modal: Confirmar eliminar pregunta -->
      <AppModal v-if="showDeleteQuestionModal" v-model="showDeleteQuestionModal">
        <AppConfirmDeleteModal entity="pregunta" @confirmDelete="handleDeleteQuestion" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import draggable from 'vuedraggable';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import ChecklistCategoryFormModal from '../components/checklist/ChecklistCategoryFormModal.vue';
import ChecklistQuestionDrawer from '../components/checklist/ChecklistQuestionDrawer.vue';

import { ChecklistTreeDto, ChecklistCategoryDto, ChecklistQuestionDto, ChecklistCategoryTreeDto } from '../dtos/checklist.dto';
import { GetChecklistTreeService } from '../services/checklist/getChecklistTree.service';
import { DeleteChecklistCategoryService } from '../services/checklist/deleteChecklistCategory.service';
import { DeleteChecklistQuestionService } from '../services/checklist/deleteChecklistQuestion.service';
import { UpdateOrderChecklistCategoriesService } from '../services/checklist/updateOrderChecklistCategories.service';
import { UpdateOrderChecklistQuestionsService } from '../services/checklist/updateOrderChecklistQuestions.service';
const getChecklistTreeService = new GetChecklistTreeService();
const deleteChecklistCategoryService = new DeleteChecklistCategoryService();
const deleteChecklistQuestionService = new DeleteChecklistQuestionService();
const updateOrderChecklistCategoriesService = new UpdateOrderChecklistCategoriesService();
const updateOrderChecklistQuestionsService = new UpdateOrderChecklistQuestionsService();

export default defineComponent({
  name: 'ChecklistDetail',

  components: {
    draggable,
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppModal,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppIcon,
    AppLoading,
    AppEmptyResponse,
    ChecklistCategoryFormModal,
    ChecklistQuestionDrawer,
  },

  setup() {
    const route = useRoute();
    const checklistId = computed(() => Number(route.params.checklistId));

    const title = 'Configurar Checklist';
    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Encuestas y formularios', url: '' };
    headerStore.moduleItem = { name: 'Gestión de Checklists', url: '' };
    headerStore.moduleSubItem = { name: title, url: '' };

    // ─── State ───
    const checklistTree = ref<ChecklistTreeDto | null>(null);
    const loading = ref(false);
    const openCategories = ref<number[]>([]);

    // Modal / Drawer state
    const showCategoryModal = ref(false);
    const showQuestionDrawer = ref(false);
    const showDeleteCategoryModal = ref(false);
    const showDeleteQuestionModal = ref(false);

    const selectedCategory = ref<ChecklistCategoryDto | null>(null);
    const selectedQuestion = ref<ChecklistQuestionDto | null>(null);
    const selectedCategoryId = ref<number | null>(null);
    // ID del registro maestro categoria-pregunta (distinto del nodo del árbol)
    const selectedCategoryMasterId = ref<number | null>(null);
    const categoryToDelete = ref<number | null>(null);
    const questionToDelete = ref<number | null>(null);

    // Guard: prevent handleCategorySave from running multiple times due to Oruga close event cycle
    const categorySaveInProgress = ref(false);

    const pageTitle = computed(() => checklistTree.value?.titulo || title);

    // Two-way computed for draggable v-model binding (categories)
    const categoriasList = computed({
      get: () => checklistTree.value?.categorias ?? [],
      set: (val) => {
        if (checklistTree.value) checklistTree.value.categorias = val;
      },
    });

    // Questions in the currently selected category (passed to the drawer for dependency selector)
    const selectedCategoryQuestions = computed<ChecklistQuestionDto[]>(() => {
      if (!selectedCategoryId.value || !checklistTree.value) return [];
      const cat = checklistTree.value.categorias.find((c) => c.id === selectedCategoryId.value);
      return cat?.preguntas ?? [];
    });

    // ─── Tree fetch ───
    // NOTE: fetchTree does NOT reset openCategories — that is only done on initial mount.
    const fetchTree = async () => {
      loading.value = true;
      try {
        checklistTree.value = await getChecklistTreeService.run(checklistId.value);
      } catch (e) {
        console.error('Error cargando checklist:', e);
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await fetchTree();
      // Open first category only on initial load
      if (checklistTree.value?.categorias?.length) {
        openCategories.value = [0];
      }
    });

    const toggleCategory = (index: number) => {
      const idx = openCategories.value.indexOf(index);
      if (idx >= 0) {
        openCategories.value = openCategories.value.filter((i) => i !== index);
      } else {
        openCategories.value = [...openCategories.value, index];
      }
    };

    // ── Drag-and-drop: Category reorder ──
    // `vuedraggable` actualiza el array localmente mediante v-model; aquí
    // persistimos el nuevo orden en el backend. Si falla, re-fetcheamos el
    // árbol para recuperar el orden previo y evitamos dejar al usuario con
    // un estado visual inconsistente con la BD.
    const handleCategoryReorder = async () => {
      const cats = checklistTree.value?.categorias ?? [];
      if (!cats.length) return;

      const payload = cats.map((cat, idx) => ({
        id: cat.id,
        orden: idx + 1,
      }));

      // Actualiza también el campo `orden` local para que coincida con lo
      // que se envió al backend (evita que la próxima acción use valores
      // obsoletos si el usuario no recarga).
      cats.forEach((cat, idx) => {
        cat.orden = idx + 1;
      });

      try {
        // El interceptor global de `axios.ts` ya muestra un toast de éxito
        // con `response.data.message`, por eso NO emitimos uno manual aquí.
        await updateOrderChecklistCategoriesService.run(payload);
      } catch (e) {
        console.error('Error reordenando categorías:', e);
        await fetchTree();
      }
    };

    // ── Drag-and-drop: Question reorder ──
    // Reordena las preguntas dentro de UNA categoría. `categoria.preguntas`
    // ya viene actualizado por el v-model; construimos el payload con el
    // nuevo índice y persistimos.
    const handleQuestionReorder = async (categoria: ChecklistCategoryTreeDto) => {
      const preguntas = categoria.preguntas ?? [];
      if (!preguntas.length) return;

      const payload = preguntas.map((pregunta, idx) => ({
        id: pregunta.id,
        orden: idx + 1,
      }));

      preguntas.forEach((pregunta, idx) => {
        pregunta.orden = idx + 1;
      });

      try {
        // Idem: el interceptor global se encarga del toast de éxito.
        await updateOrderChecklistQuestionsService.run(payload);
      } catch (e) {
        console.error('Error reordenando preguntas:', e);
        await fetchTree();
      }
    };

    // ─── Category CRUD ───
    const openCategoryModal = (category: ChecklistCategoryDto | null) => {
      selectedCategory.value = category;
      showCategoryModal.value = true;
    };

    const handleCategorySave = async () => {
      // Guard against multiple calls caused by Oruga close-event re-emission cycle
      if (categorySaveInProgress.value) return;
      categorySaveInProgress.value = true;
      try {
        showCategoryModal.value = false;
        await fetchTree();
        // Re-open all categories after a save so the new one is visible
        if (checklistTree.value?.categorias?.length) {
          const lastIdx = checklistTree.value.categorias.length - 1;
          if (!openCategories.value.includes(lastIdx)) {
            openCategories.value = [...openCategories.value, lastIdx];
          }
        }
        // El interceptor global muestra el toast de éxito del backend.
      } finally {
        categorySaveInProgress.value = false;
      }
    };

    const confirmDeleteCategory = (category: ChecklistCategoryDto) => {
      categoryToDelete.value = category.id;
      showDeleteCategoryModal.value = true;
    };

    const handleDeleteCategory = async () => {
      try {
        if (categoryToDelete.value) {
          await deleteChecklistCategoryService.run(categoryToDelete.value);
        }
        showDeleteCategoryModal.value = false;
        categoryToDelete.value = null;
        await fetchTree();
        // Toast de éxito lo muestra el interceptor global de axios.
      } catch (e) {
        console.error('Error eliminando categoría:', e);
      }
    };

    // ─── Question CRUD ───
    // Receives the full category object to track category questions and correct master ID
    const openQuestionDrawer = (question: ChecklistQuestionDto | null, categoria: ChecklistCategoryTreeDto) => {
      selectedQuestion.value = question;
      selectedCategoryId.value = categoria.id; // for tree lookups (selectedCategoryQuestions)
      // categoriaPreguntaId is the FK to the master categoria-pregunta table used in question payloads
      selectedCategoryMasterId.value = categoria.categoriaPreguntaId ?? categoria.id;
      showQuestionDrawer.value = true;
    };

    const handleQuestionSave = async () => {
      showQuestionDrawer.value = false;
      await fetchTree();
      // Toast de éxito lo muestra el interceptor global de axios.
    };

    // Refresh tree WITHOUT closing the drawer (new question just created)
    const handleQuestionRefresh = async () => {
      await fetchTree();
    };

    const confirmDeleteQuestion = (question: ChecklistQuestionDto) => {
      questionToDelete.value = question.id;
      showDeleteQuestionModal.value = true;
    };

    const handleDeleteQuestion = async () => {
      try {
        if (questionToDelete.value) {
          await deleteChecklistQuestionService.run(questionToDelete.value);
        }
        showDeleteQuestionModal.value = false;
        questionToDelete.value = null;
        await fetchTree();
        // Toast de éxito lo muestra el interceptor global de axios.
      } catch (e) {
        console.error('Error eliminando pregunta:', e);
      }
    };

    return {
      pageTitle,
      checklistId,
      checklistTree,
      categoriasList,
      loading,
      openCategories,
      showCategoryModal,
      showQuestionDrawer,
      showDeleteCategoryModal,
      showDeleteQuestionModal,
      selectedCategory,
      selectedQuestion,
      selectedCategoryId,
      selectedCategoryMasterId,
      selectedCategoryQuestions,
      toggleCategory,
      handleCategoryReorder,
      handleQuestionReorder,
      openCategoryModal,
      handleCategorySave,
      confirmDeleteCategory,
      handleDeleteCategory,
      openQuestionDrawer,
      handleQuestionSave,
      handleQuestionRefresh,
      confirmDeleteQuestion,
      handleDeleteQuestion,
    };
  },
});
</script>

<style scoped>
/* ── Page header ───────────────────────────────────────────────── */
.page-header {
  padding-top: 0.75rem;
  padding-bottom: 0.25rem;
}
.page-header__title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}
.page-header__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
}
.page-body {
  padding-bottom: 1rem;
  margin-top: 1rem;
}

/* ── Status pill ───────────────────────────────────────────────── */
.status-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}
.status-pill--success {
  background-color: #dcfce7;
  color: #15803d;
}
.status-pill--muted {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* ── Category card ─────────────────────────────────────────────── */
.category-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.ghost-dragging {
  opacity: 0.4;
}
.category-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}
.category-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
  background-color: #f9fafb;
  transition: background-color 0.15s ease;
}
.category-card__header:hover {
  background-color: #f3f4f6;
}
.category-card__header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.category-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.category-card__chevron {
  color: #9ca3af;
  margin-left: 0.5rem;
}
.category-card__index {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: #f43f5e;
  color: #ffffff;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.category-card__title {
  font-weight: 600;
  color: #1f2937;
}
.category-card__count {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #9ca3af;
}
.category-card__body {
  border-top: 1px solid #f3f4f6;
}
.category-card__empty {
  padding: 1.5rem 1.25rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #9ca3af;
}

/* ── Drag handle ───────────────────────────────────────────────── */
.drag-handle {
  cursor: grab;
  transition: color 0.15s ease;
}
.drag-handle:active {
  cursor: grabbing;
}
.drag-handle--gray {
  color: #9ca3af;
}
.drag-handle--gray:hover {
  color: #4b5563;
}
.drag-handle--light {
  color: #d1d5db;
  margin-top: 0.25rem;
  flex-shrink: 0;
}
.drag-handle--light:hover {
  color: #6b7280;
}

/* ── Question list ─────────────────────────────────────────────── */
.question-list > * + * {
  border-top: 1px solid #f9fafb;
}
.question-row {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: background-color 0.15s ease;
}
.question-row:hover {
  background-color: #f9fafb;
}
.question-row__number {
  width: 1.5rem;
  text-align: center;
  flex-shrink: 0;
}
.question-row__number-text {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  color: #9ca3af;
}
.question-row__content {
  flex: 1 1 0%;
  min-width: 0;
}
.question-row__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.question-row__code {
  font-size: 0.75rem;
  line-height: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
.question-row__type {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #9ca3af;
}
.question-row__required {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #ef4444;
}
.question-row__text {
  font-size: 0.875rem;
  line-height: 1.375;
  color: #374151;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0;
}
.question-row__options {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.question-row__options-more {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #9ca3af;
  align-self: center;
}
.question-row__actions {
  flex-shrink: 0;
}
.option-pill {
  font-size: 0.75rem;
  line-height: 1rem;
  background-color: #eff6ff;
  color: #2563eb;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}
</style>
