<template>
  <AppDrawer :isVisible="isVisible" size="lg" @update:isVisible="$emit('update:isVisible', false)">
    <!-- ─── Header ─── -->
    <template #head>
      <AppDrawerHeader
        :icon="internalIsEdit ? 'edit' : 'question-circle'"
        :title="internalIsEdit ? 'Editar Pregunta' : 'Nueva Pregunta'"
        :subtitle="internalIsEdit ? `Código: ${form.codigo || '—'}` : 'Configura el texto, tipo de respuesta y propiedades'"
        :variant="internalIsEdit ? 'edit' : 'create'"
      />
    </template>

    <!-- ─── Body ─── -->
    <template #body>
      <!-- Tabs -->
      <ul class="nav nav-tabs px-3 pt-3 mb-0">
        <li class="nav-item">
          <button :class="['nav-link', activeTab === 'question' ? 'active' : '']" type="button" @click="activeTab = 'question'">Pregunta</button>
        </li>
        <li v-if="internalIsEdit && !isOpenEnded" class="nav-item">
          <button :class="['nav-link', activeTab === 'options' ? 'active' : '']" type="button" @click="activeTab = 'options'">
            Opciones de Respuesta
            <span v-if="localOptions.length" class="badge bg-primary ms-1">{{ localOptions.length }}</span>
          </button>
        </li>
        <li v-if="internalIsEdit && !isOpenEnded" class="nav-item">
          <button :class="['nav-link', activeTab === 'dependencies' ? 'active' : '']" type="button" @click="activeTab = 'dependencies'">
            Dependencias
            <span v-if="localDependencies.length" class="badge bg-secondary ms-1">{{ localDependencies.length }}</span>
          </button>
        </li>
      </ul>

      <div class="p-3">
        <!-- ─── TAB: Pregunta ─── -->
        <form v-show="activeTab === 'question'" id="checklist-question-form" @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-12">
              <AppFormField :form-control="v$.form.pregunta" :label="'Pregunta'">
                <textarea v-model="v$.form.pregunta.$model" class="form-control" rows="4" placeholder="Escribe la pregunta aquí..." />
              </AppFormField>
            </div>

            <div class="col-sm-6">
              <AppFormField :form-control="v$.form.codigo" :label="'Código'">
                <input v-model="v$.form.codigo.$model" type="text" class="form-control" placeholder="Ej: P001" />
              </AppFormField>
            </div>

            <div class="col-sm-6">
              <AppFormField :form-control="v$.form.tipoRespuestaId" :label="'Tipo de Respuesta'">
                <AppAutocomplete v-model="v$.form.tipoRespuestaId.$model" :options="responseTypes" label="descripcion" :filterable="true" placeholder="Seleccionar..." />
              </AppFormField>
            </div>

            <!-- Valor + Obligatoria en la misma fila (solo para tipos sin opciones) -->
            <div v-if="isOpenEnded && form.tipoRespuestaId" class="col-sm-6">
              <AppFormField :label="'Valor'">
                <input v-model="form.valor" type="text" class="form-control" placeholder="Ingrese el valor" />
              </AppFormField>
            </div>

            <div :class="isOpenEnded && form.tipoRespuestaId ? 'col-sm-6' : 'col-sm-4'">
              <AppFormField :label="'Obligatoria'">
                <AppCheckbox id="questionObligatoria" v-model="form.obligatoria" :integer="true" variant="switch" :label="form.obligatoria ? 'Sí' : 'No'" class="mt-2" />
              </AppFormField>
            </div>

            <div class="col-sm-4">
              <AppFormField :label="'Editable'">
                <AppCheckbox id="questionEditable" v-model="form.editable" :integer="true" variant="switch" :label="form.editable ? 'Sí' : 'No'" class="mt-2" />
              </AppFormField>
            </div>

            <div class="col-sm-4">
              <AppFormField :label="'Solo Lectura'">
                <AppCheckbox id="questionSoloLectura" v-model="form.soloLectura" :integer="true" variant="switch" :label="form.soloLectura ? 'Sí' : 'No'" class="mt-2" />
              </AppFormField>
            </div>

            <div class="col-sm-4">
              <AppFormField :label="'Estado'">
                <AppCheckbox id="questionActivo" v-model="form.activo" :integer="true" variant="switch" :label="form.activo ? 'Activa' : 'Inactiva'" class="mt-2" />
              </AppFormField>
            </div>

            <!-- Aviso creación -->
            <div v-if="!internalIsEdit" class="col-12">
              <div class="alert alert-info py-2 mb-0 d-flex align-items-center gap-2" role="alert">
                <AppIcon icon="info-circle" />
                <span>Guarda la pregunta para configurar opciones de respuesta y dependencias.</span>
              </div>
            </div>
          </div>
        </form>

        <!-- ─── TAB: Opciones de Respuesta ─── -->
        <div v-if="internalIsEdit && !isOpenEnded" v-show="activeTab === 'options'">
          <!-- Sticky header with action button -->
          <div class="d-flex justify-content-between align-items-center mb-2 py-2 bg-white" style="position: sticky; top: 0; z-index: 2">
            <span class="text-muted small">{{ localOptions.length }} opción(es)</span>
            <AppButton variant="primary" outlined @click="openOptionForm(null)"> <AppIcon icon="plus" class="me-1" /> Agregar Opción </AppButton>
          </div>

          <!-- Inline option form -->
          <div ref="optionFormRef" v-if="showOptionForm" class="card border-primary shadow-sm mb-3">
            <div class="card-header d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold">{{ editingOption?.id ? 'Editar opción' : 'Nueva opción' }}</span>
              <button type="button" class="btn-close btn-sm" @click="showOptionForm = false"></button>
            </div>
            <form class="card-body row g-2" @submit.prevent="handleSaveOption">
              <div class="col-12">
                <AppFormField :form-control="vOption$.optionForm.descripcion" :label="'Descripción'">
                  <input v-model="vOption$.optionForm.descripcion.$model" type="text" class="form-control" placeholder="Ej: Siempre" />
                </AppFormField>
              </div>
              <div class="col-12">
                <AppFormField :label="'Valor'">
                  <input v-model="optionForm.valor" type="text" class="form-control" placeholder="Ej: SIEMPRE" />
                </AppFormField>
              </div>
              <div class="col-12 d-flex justify-content-end gap-2 mt-2">
                <AppButton variant="secondary" outlined type="button" @click="showOptionForm = false">Cancelar</AppButton>
                <AppButton variant="primary" nativeType="submit">Guardar</AppButton>
              </div>
            </form>
          </div>

          <!-- Empty state -->
          <div v-if="!localOptions.length" class="text-center text-muted py-5">No hay opciones de respuesta. Agrega la primera.</div>

          <!-- Drag-and-drop options list -->
          <draggable v-else v-model="localOptions" tag="div" item-key="id" handle=".opt-drag-handle" ghost-class="opacity-50" class="list-group" @end="handleOptionReorder">
            <template #item="{ element: opcion }">
              <div class="list-group-item d-flex align-items-center gap-2 px-2">
                <span class="opt-drag-handle text-muted drag-handle" title="Arrastrar para reordenar">
                  <AppIcon icon="grip-vertical" />
                </span>
                <div class="flex-grow-1 min-w-0">
                  <div class="fw-medium small">{{ opcion.descripcion }}</div>
                  <div v-if="opcion.valor" class="text-muted" style="font-size: 11px">
                    <span>{{ opcion.valor }}</span>
                  </div>
                </div>
                <div class="d-flex gap-1 flex-shrink-0">
                  <AppButtonEdit @click="openOptionForm(opcion)" />
                  <AppButtonDelete @click="handleDeleteOption(opcion.id)" />
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- ─── TAB: Dependencias ─── -->
        <div v-if="internalIsEdit && !isOpenEnded" v-show="activeTab === 'dependencies'">
          <!-- Sticky header -->
          <div class="d-flex justify-content-between align-items-center mb-2 py-2 bg-white" style="position: sticky; top: 0; z-index: 2">
            <span class="text-muted small">{{ localDependencies.length }} dependencia(s)</span>
            <AppButton variant="primary" outlined @click="openDependencyForm(null)"> <AppIcon icon="plus" class="me-1" /> Agregar Dependencia </AppButton>
          </div>

          <!-- Inline dependency form -->
          <div ref="dependencyFormRef" v-if="showDependencyForm" class="card border-secondary shadow-sm mb-3">
            <div class="card-header d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold">{{ editingDependency?.id ? 'Editar dependencia' : 'Nueva dependencia' }}</span>
              <button type="button" class="btn-close btn-sm" @click="showDependencyForm = false"></button>
            </div>
            <form class="card-body row g-2" @submit.prevent="handleSaveDependency">
              <div class="col-12">
                <AppFormField :form-control="vDep$.dependencyForm.opcionRespuestaId" :label="'Opción que activa'">
                  <select v-model.number="vDep$.dependencyForm.opcionRespuestaId.$model" class="form-select">
                    <option :value="0">Seleccionar opción...</option>
                    <option v-for="op in localOptions" :key="op.id" :value="op.id">
                      {{ op.descripcion }}
                    </option>
                  </select>
                </AppFormField>
                <small v-if="!localOptions.length" class="text-warning">Primero agrega opciones en la pestaña correspondiente.</small>
              </div>
              <div class="col-12">
                <AppFormField :form-control="vDep$.dependencyForm.preguntaHijaId" :label="'Pregunta que se muestra'">
                  <select v-model.number="vDep$.dependencyForm.preguntaHijaId.$model" class="form-select">
                    <option :value="0">Seleccionar pregunta...</option>
                    <option v-for="q in siblingQuestions" :key="q.id" :value="q.id">
                      {{ q.pregunta.length > SIBLING_QUESTION_PREVIEW_LENGTH ? q.pregunta.substring(0, SIBLING_QUESTION_PREVIEW_LENGTH) + '…' : q.pregunta }}
                    </option>
                  </select>
                </AppFormField>
                <small v-if="!siblingQuestions.length" class="text-warning">No hay otras preguntas en esta categoría.</small>
              </div>
              <div class="col-12 d-flex justify-content-end gap-2 mt-2">
                <AppButton variant="secondary" outlined type="button" @click="showDependencyForm = false">Cancelar</AppButton>
                <AppButton variant="primary" nativeType="submit">Guardar</AppButton>
              </div>
            </form>
          </div>

          <!-- Empty state -->
          <div v-if="!localDependencies.length" class="text-center text-muted py-5">No hay preguntas dependientes configuradas.</div>

          <!-- Dependencies list -->
          <div v-else class="list-group">
            <div v-for="dep in localDependencies" :key="dep.id" class="list-group-item d-flex align-items-center gap-3">
              <div class="flex-grow-1">
                <div class="fw-medium small">
                  Si responden:
                  <span class="badge bg-primary ms-1">{{ getOptionLabel(dep.opcionRespuestaId) }}</span>
                </div>
                <div class="text-muted small mt-1">
                  Mostrar:
                  <strong>{{ dep.preguntaHijaNombre || getQuestionLabel(dep.preguntaHijaId) }}</strong>
                </div>
              </div>
              <div class="d-flex gap-1 flex-shrink-0">
                <AppButtonEdit @click="openDependencyForm(dep)" />
                <AppButtonDelete @click="handleDeleteDependency(dep.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── Footer ─── -->
    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <AppButton variant="ghost" class="drawer-cancel-btn" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
        <AppButton v-show="activeTab === 'question'" variant="primary" :disabled="saving" form="checklist-question-form" nativeType="submit" @click="handleSubmit">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ internalIsEdit ? 'Actualizar Pregunta' : 'Guardar y Configurar' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch, PropType, onMounted, nextTick } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '../../../../shared/plugins/vuelidate.plugin';
import draggable from 'vuedraggable';

import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../../shared/components/AppDrawerHeader.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckbox from '../../../../shared/components/Forms/AppCheckbox.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../../shared/components/Buttons/AppButtonDelete.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';

import { ChecklistQuestionDto, ChecklistAnswerOptionDto, ChecklistDependentQuestionDto, ChecklistResponseTypeDto } from '../../dtos/checklist.dto';
import { CreateOrUpdateChecklistQuestionService } from '../../services/checklist/createOrUpdateChecklistQuestion.service';
import { CreateOrUpdateAnswerOptionService } from '../../services/checklist/createOrUpdateAnswerOption.service';
import { DeleteAnswerOptionService } from '../../services/checklist/deleteAnswerOption.service';
import { CreateOrUpdateDependentQuestionService } from '../../services/checklist/createOrUpdateDependentQuestion.service';
import { DeleteDependentQuestionService } from '../../services/checklist/deleteDependentQuestion.service';
import { GetResponseTypesService } from '../../services/checklist/getResponseTypes.service';
import { UpdateOrderAnswerOptionsService } from '../../services/checklist/updateOrderAnswerOptions.service';
import { ToastService } from '../../../../shared/services/toast.service';

const createOrUpdateChecklistQuestionService = new CreateOrUpdateChecklistQuestionService();
const createOrUpdateAnswerOptionService = new CreateOrUpdateAnswerOptionService();
const deleteAnswerOptionService = new DeleteAnswerOptionService();
const createOrUpdateDependentQuestionService = new CreateOrUpdateDependentQuestionService();
const deleteDependentQuestionService = new DeleteDependentQuestionService();
const getResponseTypesService = new GetResponseTypesService();
const updateOrderAnswerOptionsService = new UpdateOrderAnswerOptionsService();
const toastService = new ToastService();

const SIBLING_QUESTION_PREVIEW_LENGTH = 60;

export default defineComponent({
  name: 'ChecklistQuestionDrawer',

  components: {
    draggable,
    AppDrawer,
    AppDrawerHeader,
    AppFormField,
    AppAutocomplete,
    AppCheckbox,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppIcon,
  },

  props: {
    isVisible: { type: Boolean, default: false },
    categoryId: { type: Number as PropType<number | null>, default: null },
    checklistId: { type: Number, required: true },
    data: {
      type: Object as PropType<ChecklistQuestionDto | null>,
      default: null,
    },
    /** Preguntas de la misma categoría (para el selector de dependencias) */
    categoryQuestions: {
      type: Array as PropType<ChecklistQuestionDto[]>,
      default: () => [],
    },
  },

  emits: ['update:isVisible', 'save', 'refresh'],

  setup(props, { emit }) {
    const saving = ref(false);
    const activeTab = ref<'question' | 'options' | 'dependencies'>('question');

    const savedQuestion = ref<ChecklistQuestionDto | null>(null);

    const internalIsEdit = computed(() => !!(props.data?.id || savedQuestion.value?.id));
    const internalId = computed(() => props.data?.id ?? savedQuestion.value?.id ?? null);

    const responseTypes = ref<ChecklistResponseTypeDto[]>([]);

    const form = reactive<{
      categoriaPreguntaId: number;
      tipoRespuestaId: number | null;
      codigo: string;
      puntaje: number;
      orden: number;
      obligatoria: number;
      pregunta: string;
      valor: string;
      editable: number;
      soloLectura: number;
      activo: number;
    }>({
      categoriaPreguntaId: props.categoryId ?? 0,
      // `null` fuerza a AppAutocomplete a mostrar el placeholder "Seleccionar..."
      // en vez de renderizar `0` como valor literal.
      tipoRespuestaId: null,
      codigo: '',
      puntaje: 0,
      orden: 0,
      obligatoria: 1,
      pregunta: '',
      valor: '',
      editable: 1,
      soloLectura: 0,
      activo: 1,
    });

    const v$ = useVuelidate(
      {
        form: {
          pregunta: { required },
          codigo: { required },
          // `required` ya rechaza `null`; minValue(1) protege contra valores 0 por si el
          // backend cambia el tipo en el futuro.
          tipoRespuestaId: { required, minValue: minValue(1) },
        },
      },
      { form }
    );

    // Tipos de respuesta que no requieren configurar opciones ni dependencias
    // (la respuesta es libre: texto abierto, fecha, número, firma en canvas, etc.)
    // Tipos de respuesta que SÍ requieren configurar opciones:
    //  - 3 MULTIPLE (selección múltiple con checkboxes)
    //  - 4 SELECCION_UNICA (autocomplete / single-select)
    //  - 5 CHECKBOX (conservamos el id del catálogo; se muestra como grupo
    //    de radio buttons alimentados por las opciones configuradas)
    // Los tipos sin opciones configurables (abierta, fecha, canvas, numérico,
    // archivo) ocultan las pestañas de Opciones y Dependencias.
    const TIPOS_CON_OPCIONES = new Set<number>([3, 4, 5]);

    const isOpenEnded = computed(() => {
      if (!form.tipoRespuestaId) return false;
      return !TIPOS_CON_OPCIONES.has(form.tipoRespuestaId);
    });

    const siblingQuestions = computed(() => props.categoryQuestions.filter((q) => q.id !== internalId.value));

    // ─── Options ───
    const localOptions = ref<ChecklistAnswerOptionDto[]>([]);
    const showOptionForm = ref(false);
    const editingOption = ref<ChecklistAnswerOptionDto | null>(null);
    const optionForm = reactive({
      descripcion: '',
      valor: '',
      puntaje: 0,
      noAplicaPuntaje: 0,
      activo: 1,
    });
    const vOption$ = useVuelidate({ optionForm: { descripcion: { required } } }, { optionForm });
    const optionFormRef = ref<HTMLElement | null>(null);

    // ─── Dependencies ───
    const localDependencies = ref<ChecklistDependentQuestionDto[]>([]);
    const showDependencyForm = ref(false);
    const editingDependency = ref<ChecklistDependentQuestionDto | null>(null);
    const dependencyForm = reactive({
      opcionRespuestaId: 0,
      preguntaHijaId: 0,
    });
    const vDep$ = useVuelidate(
      {
        dependencyForm: {
          opcionRespuestaId: { required, minValue: minValue(1) },
          preguntaHijaId: { required, minValue: minValue(1) },
        },
      },
      { dependencyForm }
    );
    const dependencyFormRef = ref<HTMLElement | null>(null);

    const getOptionLabel = (optionId: number): string => {
      const found = localOptions.value.find((o) => o.id === optionId);
      return found ? found.descripcion : `Opción ${optionId}`;
    };

    const getQuestionLabel = (questionId: number): string => {
      const found = props.categoryQuestions.find((q) => q.id === questionId);
      return found ? found.pregunta : `Pregunta ${questionId}`;
    };

    const loadResponseTypes = async (): Promise<void> => {
      try {
        responseTypes.value = await getResponseTypesService.run();
      } catch (error) {
        console.error('Error cargando tipos de respuesta:', error);
        responseTypes.value = [];
      }
    };

    /**
     * Normaliza las dependencias devueltas por el tree endpoint al DTO plano
     * `ChecklistDependentQuestionDto` que consume este drawer.
     *
     * Casos:
     *  1. `source.preguntasDependientes` viene con la forma plana (CRUD): se
     *     usa tal cual.
     *  2. Viene con la forma del tree (hijos anidados con
     *     `idOpcionRespuestaDependiente: number[]`): se expande a una entrada
     *     por trigger. El `id` sintético `child.id * 1000 + trigger` se usa
     *     solo como key en la lista; al editar/eliminar se resolverá contra
     *     el backend por otro camino (el usuario puede recrear la dependencia).
     */
    const normalizeDependencies = (source: ChecklistQuestionDto): ChecklistDependentQuestionDto[] => {
      const deps = source.preguntasDependientes;
      if (!deps || !deps.length) return [];

      const first = deps[0] as unknown as Record<string, unknown>;
      const looksLikeFlatDto = 'preguntaHijaId' in first || 'opcionRespuestaId' in first;
      if (looksLikeFlatDto) {
        return [...(deps as unknown as ChecklistDependentQuestionDto[])];
      }

      const result: ChecklistDependentQuestionDto[] = [];
      for (const hijo of deps as unknown as ChecklistQuestionDto[]) {
        const triggers = hijo.idOpcionRespuestaDependiente ?? [];
        for (const trigger of triggers) {
          result.push({
            id: hijo.id * 1000 + trigger,
            preguntaHijaId: hijo.id,
            preguntaHijaNombre: hijo.pregunta,
            opcionRespuestaId: trigger,
            preguntaPrincipalId: source.id,
            activo: 1,
          });
        }
      }
      return result;
    };

    const resetForm = async (): Promise<void> => {
      activeTab.value = 'question';
      savedQuestion.value = null;
      showOptionForm.value = false;
      showDependencyForm.value = false;
      editingDependency.value = null;

      const source = props.data;
      if (source) {
        // Algunas respuestas del árbol de checklist no propagan `categoriaPreguntaId`
        // en cada pregunta (viene implícito por la jerarquía). Como el backend lo
        // exige en el PUT, caemos en `props.categoryId` cuando falta.
        form.categoriaPreguntaId = source.categoriaPreguntaId ?? props.categoryId ?? 0;
        form.tipoRespuestaId = source.tipoRespuestaId;
        form.codigo = String(source.codigo ?? '');
        form.puntaje = source.puntaje ?? 0;
        form.orden = source.orden ?? 0;
        form.obligatoria = source.obligatoria ?? 1;
        form.pregunta = source.pregunta ?? '';
        form.valor = (source as any).valor ?? '';
        form.editable = source.editable ?? 1;
        form.soloLectura = source.soloLectura ?? 0;
        form.activo = source.activo ?? 1;
        // El endpoint `/forms/checklist/:id/tree` devuelve `opcionesRespuesta`;
        // el endpoint CRUD plano devuelve `opciones`. Soportamos ambos nombres
        // para que al editar desde el listado detalle se muestren correctamente.
        const rawOptions = source.opcionesRespuesta ?? source.opciones ?? [];
        localOptions.value = [...rawOptions];
        // El tree endpoint devuelve cada hijo una sola vez con
        // `idOpcionRespuestaDependiente: number[]` (puede disparar por múltiples
        // opciones). El CRUD plano, en cambio, devuelve una fila
        // `ChecklistDependentQuestionDto` por cada combinación (opción × hija).
        // Normalizamos al DTO plano para que el resto de la UI no tenga que
        // diferenciar la fuente.
        localDependencies.value = normalizeDependencies(source);
      } else {
        form.categoriaPreguntaId = props.categoryId ?? 0;
        form.tipoRespuestaId = null;
        form.codigo = '';
        form.puntaje = 0;
        form.orden = 0;
        form.obligatoria = 1;
        form.pregunta = '';
        form.valor = '';
        form.editable = 1;
        form.soloLectura = 0;
        form.activo = 1;
        localOptions.value = [];
        localDependencies.value = [];
      }

      // Resetea el estado de validación DESPUÉS de asignar los valores iniciales
      // y tras el tick, para neutralizar cualquier `update:modelValue` inicial de
      // AppAutocomplete u otros controles que marcarían los campos como $dirty.
      await nextTick();
      v$.value.$reset();
      vOption$.value.$reset();
      vDep$.value.$reset();
    };

    onMounted(async () => {
      await loadResponseTypes();
      await resetForm();
    });

    watch(
      () => props.isVisible,
      (val) => {
        if (val) resetForm();
      }
    );

    // Si el drawer sigue montado (isVisible=true) y el padre cambia la pregunta a
    // editar o la categoría, re-hidratamos el formulario. Esto previene la fuga
    // de estado entre la pregunta previamente editada y una nueva creación.
    watch([() => props.data, () => props.categoryId], () => {
      if (props.isVisible) resetForm();
    });

    const handleSubmit = async (): Promise<void> => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      saving.value = true;
      try {
        const isUpdate = internalId.value !== null && internalId.value !== undefined;

        // Construimos un payload limpio con todos los campos obligatorios del
        // DTO `ChecklistQuestionDto`. El backend valida:
        //  - `categoriaPreguntaId` como number (tanto en POST como en PUT)
        //  - `orden` como number
        // Omitir cualquiera provoca 400 con mensaje:
        //   "El campo <campo> debe ser un número".
        const payload: Record<string, unknown> = {
          categoriaPreguntaId: form.categoriaPreguntaId,
          tipoRespuestaId: form.tipoRespuestaId,
          codigo: form.codigo,
          puntaje: form.puntaje,
          orden: form.orden,
          obligatoria: form.obligatoria,
          pregunta: form.pregunta,
          valor: form.valor || undefined,
          editable: form.editable,
          soloLectura: form.soloLectura,
          activo: form.activo,
        };

        const result = await createOrUpdateChecklistQuestionService.run(payload, internalId.value ?? undefined);

        if (!props.data?.id && !savedQuestion.value?.id) {
          // Caso: nueva pregunta recién creada → guardar ID, cambiar de tab y refrescar el árbol.
          const newQuestion: ChecklistQuestionDto = result?.data ?? result;
          savedQuestion.value = newQuestion;
          activeTab.value = isOpenEnded.value ? 'question' : 'options';
          emit('refresh');
          toastService.show('Pregunta creada correctamente', 'success');
        } else {
          // Caso: actualización de pregunta existente → refrescar árbol SIN cerrar el drawer,
          // para que el usuario pueda seguir gestionando opciones y dependencias.
          emit('refresh');
          toastService.show('Pregunta actualizada correctamente', 'success');
        }
      } catch (error) {
        console.error('Error guardando pregunta:', error);
        toastService.show('Error al guardar la pregunta. Intente nuevamente.', 'error');
      } finally {
        saving.value = false;
      }
    };

    // ─── Answer option handlers ───
    const openOptionForm = async (opcion: ChecklistAnswerOptionDto | null): Promise<void> => {
      editingOption.value = opcion;
      if (opcion) {
        optionForm.descripcion = opcion.descripcion;
        optionForm.valor = opcion.valor;
        optionForm.puntaje = opcion.puntaje;
        optionForm.noAplicaPuntaje = opcion.noAplicaPuntaje;
        optionForm.activo = opcion.activo;
      } else {
        optionForm.descripcion = '';
        optionForm.valor = '';
        optionForm.puntaje = 0;
        optionForm.noAplicaPuntaje = 0;
        optionForm.activo = 1;
      }
      vOption$.value.$reset();
      showOptionForm.value = true;
      await nextTick();
      optionFormRef.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };

    const handleSaveOption = async (): Promise<void> => {
      const formIsValid = await vOption$.value.$validate();
      if (!formIsValid) return;

      try {
        const questionId = internalId.value!;
        const orden = editingOption.value ? editingOption.value.orden : localOptions.value.length + 1;
        const payload = {
          ...optionForm,
          orden,
          preguntaId: questionId,
          activo: true,
        };
        const raw = await createOrUpdateAnswerOptionService.run(payload, editingOption.value?.id);
        const savedOption: ChecklistAnswerOptionDto = raw?.data ?? raw;

        if (editingOption.value) {
          const idx = localOptions.value.findIndex((o) => o.id === editingOption.value!.id);
          if (idx >= 0) {
            localOptions.value = [...localOptions.value.slice(0, idx), savedOption, ...localOptions.value.slice(idx + 1)];
          }
        } else {
          localOptions.value = [...localOptions.value, savedOption];
        }
        showOptionForm.value = false;
        editingOption.value = null;
      } catch (error) {
        console.error('Error guardando opción:', error);
        toastService.show('Error al guardar la opción. Intente nuevamente.', 'error');
      }
    };

    const handleDeleteOption = async (optionId: number): Promise<void> => {
      try {
        await deleteAnswerOptionService.run(optionId);
        localOptions.value = localOptions.value.filter((o) => o.id !== optionId);
      } catch (error) {
        console.error('Error eliminando opción:', error);
        toastService.show('Error al eliminar la opción. Intente nuevamente.', 'error');
      }
    };

    const handleOptionReorder = async (): Promise<void> => {
      try {
        const items = localOptions.value.map((opt, index) => ({
          id: opt.id,
          orden: index + 1,
        }));
        await updateOrderAnswerOptionsService.run(items);
      } catch (error) {
        console.error('Error actualizando orden de opciones:', error);
        toastService.show('Error al actualizar el orden. Intente nuevamente.', 'error');
      }
    };

    // ─── Dependency handlers ───
    const openDependencyForm = async (dep: ChecklistDependentQuestionDto | null): Promise<void> => {
      editingDependency.value = dep;
      if (dep) {
        dependencyForm.opcionRespuestaId = dep.opcionRespuestaId;
        dependencyForm.preguntaHijaId = dep.preguntaHijaId;
      } else {
        dependencyForm.opcionRespuestaId = 0;
        dependencyForm.preguntaHijaId = 0;
      }
      vDep$.value.$reset();
      showDependencyForm.value = true;
      await nextTick();
      dependencyFormRef.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };

    const handleSaveDependency = async (): Promise<void> => {
      const formIsValid = await vDep$.value.$validate();
      if (!formIsValid) return;

      try {
        const payload = {
          ...dependencyForm,
          preguntaPrincipalId: internalId.value!,
          activo: 1,
        };
        const raw = await createOrUpdateDependentQuestionService.run(payload, editingDependency.value?.id);
        const saved: ChecklistDependentQuestionDto = raw?.data ?? raw;
        if (editingDependency.value) {
          const idx = localDependencies.value.findIndex((d) => d.id === editingDependency.value!.id);
          if (idx >= 0) {
            localDependencies.value = [...localDependencies.value.slice(0, idx), saved, ...localDependencies.value.slice(idx + 1)];
          }
        } else {
          localDependencies.value = [...localDependencies.value, saved];
        }
        showDependencyForm.value = false;
        editingDependency.value = null;
      } catch (error) {
        console.error('Error guardando dependencia:', error);
        toastService.show('Error al guardar la dependencia. Intente nuevamente.', 'error');
      }
    };

    const handleDeleteDependency = async (depId: number): Promise<void> => {
      try {
        await deleteDependentQuestionService.run(depId);
        localDependencies.value = localDependencies.value.filter((d) => d.id !== depId);
      } catch (error) {
        console.error('Error eliminando dependencia:', error);
        toastService.show('Error al eliminar la dependencia. Intente nuevamente.', 'error');
      }
    };

    return {
      SIBLING_QUESTION_PREVIEW_LENGTH,
      saving,
      activeTab,
      v$,
      vOption$,
      vDep$,
      internalIsEdit,
      isOpenEnded,
      siblingQuestions,
      form,
      responseTypes,
      localOptions,
      showOptionForm,
      editingOption,
      optionForm,
      optionFormRef,
      localDependencies,
      showDependencyForm,
      editingDependency,
      dependencyForm,
      dependencyFormRef,
      getOptionLabel,
      getQuestionLabel,
      handleSubmit,
      openOptionForm,
      handleSaveOption,
      handleDeleteOption,
      handleOptionReorder,
      openDependencyForm,
      handleSaveDependency,
      handleDeleteDependency,
    };
  },
});
</script>

<style scoped>
/* Resalta el botón "Cancelar" del drawer para que no quede blanco sobre blanco */
:deep(.drawer-cancel-btn.o-btn--ghost) {
  border-color: var(--color-gray-400, #c7c7c7);
  background-color: var(--color-gray-100, #f5f5f5);
  color: var(--color-dark, #333);
}
:deep(.drawer-cancel-btn.o-btn--ghost:hover) {
  background-color: var(--color-gray-200, #e9ecef);
  opacity: 1;
}

.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}
</style>
