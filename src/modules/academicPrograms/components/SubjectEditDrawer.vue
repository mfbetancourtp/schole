<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <div class="d-flex align-items-center gap-3 w-100">
        <div>
          <h6 class="mb-1 text-white fw-bold">
            {{ subject ? 'Editar Asignatura' : 'Crear Asignatura' }}
          </h6>
          <span v-if="subject" class="code-badge">{{ subject.code || subject.abbreviation || '—' }}</span>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form @submit.prevent="save" id="edit-subject-form">
        <!-- ── 1. Información General ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">1</div>
            <div>
              <h6 class="section-title">Información General</h6>
              <p class="section-sub">Datos básicos de identificación de la asignatura</p>
            </div>
          </div>
          <div class="fields-grid">
            <div class="field-group">
              <label class="field-label">Código de asignatura <span class="req">*</span></label>
              <input class="form-control" type="text" v-model="form.code" :placeholder="'CB-MAT101'" />
            </div>
            <div class="field-group">
              <label class="field-label">Nombre completo <span class="req">*</span></label>
              <input class="form-control" type="text" v-model="form.name" placeholder="Ej: Cálculo Diferencial" />
            </div>
            <div class="field-group">
              <label class="field-label">Nombre corto <span class="req">*</span></label>
              <input class="form-control" type="text" v-model="form.shortName" />
            </div>
            <div class="field-group">
              <label class="field-label">Créditos <span class="req">*</span></label>
              <input class="form-control" type="number" min="0" v-model.number="form.credits" />
            </div>
          </div>
        </div>

        <!-- ── 2. Intensidad Horaria ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">2</div>
            <div>
              <h6 class="section-title">Intensidad Horaria</h6>
              <p class="section-sub">Distribución de horas por tipo de actividad</p>
            </div>
          </div>
          <div class="fields-grid cols-3">
            <div class="field-group">
              <label class="field-label">Horas teóricas <span class="req">*</span></label>
              <input class="form-control" type="number" min="0" v-model.number="form.theoreticalHours" @input="calcTotalHours" />
            </div>
            <div class="field-group">
              <label class="field-label">Horas prácticas <span class="req">*</span></label>
              <input class="form-control" type="number" min="0" v-model.number="form.practicalHours" @input="calcTotalHours" />
            </div>
            <div class="field-group">
              <label class="field-label">Total horas</label>
              <div class="total-hours-box">
                <span class="total-num">{{ form.totalHours }}</span>
                <span class="total-unit">h</span>
              </div>
              <p class="calc-hint">Calculado automáticamente</p>
            </div>
          </div>
          <div class="field-group mt-3">
            <label class="field-label">Tipo de espacio requerido</label>
            <select class="form-select" v-model="form.spaceType">
              <option value="">Seleccionar tipo</option>
              <option value="Aula">Aula</option>
              <option value="Laboratorio">Laboratorio</option>
              <option value="Virtual">Virtual</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>
        </div>

        <!-- ── 3. Configuración Académica ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">3</div>
            <div>
              <h6 class="section-title">Configuración Académica</h6>
              <p class="section-sub">Clasificación y requisitos de la asignatura</p>
            </div>
          </div>
          <div class="field-group mb-3">
            <label class="field-label">Tipo de asignatura <span class="req">*</span></label>
            <select class="form-select" v-model="form.subjectType">
              <option value="">Seleccionar...</option>
              <template v-if="subjectCategoriesLoading">
                <option disabled>Cargando categorías...</option>
              </template>
              <template v-else-if="subjectCategories.length === 0">
                <option disabled>Sin categorías — configura en Información Institucional</option>
              </template>
              <template v-else>
                <option v-for="cat in subjectCategories" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </template>
            </select>
          </div>
          <div class="field-group mb-3 position-relative">
            <label class="field-label">Asignaturas prerrequisito</label>

            <!-- Selected prerequisites pills -->
            <div class="selected-prereqs mb-2" v-if="form.prerequisites.length > 0">
              <span v-for="(pr, index) in form.prerequisites" :key="index" class="prereq-badge">
                {{ pr.code || pr.abbreviation }} - {{ pr.name }}
                <button type="button" class="btn-remove-prereq" @click="removePrerequisite(index)">
                  <AppIcon icon="times" />
                </button>
              </span>
            </div>

            <!-- Custom Searchable Dropdown Input -->
            <div class="search-input-wrapper">
              <AppIcon icon="search" class="search-icon" />
              <input class="form-control ps-4" type="text" placeholder="Buscar por código o nombre..." v-model="prereqSearch" @focus="showPrereqDropdown = true" @blur="hideDropdownDelay" />
            </div>

            <!-- Dropdown List -->
            <div v-if="showPrereqDropdown" class="custom-dropdown">
              <div v-if="filteredSubjects.length === 0" class="dropdown-item text-muted small p-2 text-center">No se encontraron asignaturas</div>
              <div v-for="subj in filteredSubjects" :key="subj.id" class="dropdown-item custom-dropdown-item" @mousedown.prevent="addPrerequisite(subj)">
                <div class="small text-muted mb-1">
                  {{ subj.code || subj.abbreviation || '—' }}
                </div>
                <div>{{ subj.name }}</div>
              </div>
            </div>
          </div>
          <div class="requisito-check">
            <input type="checkbox" id="degreeReq" v-model="form.degreeRequirement" class="check-input" />
            <label for="degreeReq" class="check-label">
              <span class="check-title">Es requisito de grado</span>
              <span class="check-hint">Esta asignatura es obligatoria para la graduación</span>
            </label>
          </div>
        </div>

        <!-- ── 4. Competencias de la Asignatura ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">4</div>
            <div>
              <h6 class="section-title">Competencias de la Asignatura</h6>
              <p class="section-sub">Define las competencias que desarrollará esta asignatura</p>
            </div>
          </div>

          <!-- Lista dinámica de competencias -->
          <div v-for="(comp, idx) in form.competencias" :key="idx" class="competencia-card mb-3">
            <div class="competencia-card-head">
              <span class="fw-semibold" style="font-size: 0.9rem">Competencia {{ idx + 1 }}</span>
              <button type="button" class="btn-trash" @click="removeCompetencia(idx)" title="Eliminar">
                <AppIcon icon="trash" />
              </button>
            </div>
            <!-- Código de competencia -->
            <div class="field-group mb-2">
              <label class="field-label">Código de competencia <span class="req">*</span></label>
              <input class="form-control" type="text" placeholder="Ej: CG-01" v-model="comp.code" />
              <span class="comp-hint">Define un identificador único para esta competencia.</span>
            </div>
            <!-- Descripción -->
            <div class="field-group mb-2">
              <label class="field-label">Descripción de la competencia</label>
              <textarea class="form-control competencia-textarea" rows="3" placeholder="Describe la competencia..." v-model="comp.description"></textarea>
            </div>
            <!-- Tipo -->
            <div class="field-group">
              <label class="field-label">Tipo de competencia</label>
              <select class="form-select" v-model="comp.type">
                <option value="General">General</option>
                <option value="Específica">Específica</option>
                <option value="Transversal">Transversal</option>
              </select>
            </div>
          </div>

          <button type="button" class="btn-add-competencia" @click="addCompetencia"><AppIcon icon="plus" /> Agregar competencia</button>
        </div>

        <!-- ── 5. Resultados de Aprendizaje ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">5</div>
            <div>
              <h6 class="section-title">Resultados de Aprendizaje</h6>
              <p class="section-sub">Define los resultados esperados asociados a las competencias</p>
            </div>
          </div>

          <div v-if="form.competencias.length === 0" class="aprendizaje-hint">
            <p class="small text-muted fst-italic mb-0">Primero debes agregar al menos una competencia para poder definir resultados de aprendizaje.</p>
          </div>

          <div v-else>
            <!-- Lista dinámica de resultados -->
            <div v-for="(res, idx) in form.resultados" :key="idx" class="resultado-card mb-3">
              <div class="resultado-card-head">
                <span class="fw-semibold" style="font-size: 0.85rem">Resultado de aprendizaje {{ idx + 1 }}</span>
                <button type="button" class="btn-trash" @click="removeResultado(idx)" title="Eliminar">
                  <AppIcon icon="trash" />
                </button>
              </div>
              <textarea class="form-control resultado-textarea mb-3" rows="2" placeholder="Describe el resultado de aprendizaje..." v-model="res.description"></textarea>
              <div class="field-group">
                <label class="field-label" style="font-size: 0.75rem">Competencia asociada</label>
                <select class="form-select form-select-sm" v-model="res.competenciaIdx">
                  <option :value="null" disabled>Seleccionar competencia...</option>
                  <option v-for="(comp, cIdx) in form.competencias" :key="cIdx" :value="cIdx">Competencia {{ cIdx + 1 }} - {{ comp.type || 'General' }}</option>
                </select>
              </div>
            </div>

            <div class="d-flex justify-content-center mt-3">
              <button type="button" class="btn-add-resultado" @click="addResultado"><AppIcon icon="plus" /> Agregar resultado</button>
            </div>
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton label="core.cancel" outlined variant="secondary" @click="$emit('update:isVisible', false)"></AppButton>
          <AppButton label="Guardar Cambios" variant="primary" nativeType="submit" form="edit-subject-form"></AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, watch, ref, computed, onMounted } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { SubjectDto } from '../../../shared/dto/subject.dto';
import { SubjectsCategoryDto } from '../../../shared/dto/subjectsCategory.dto';
import { CreateOrUpdateSubjectService } from '../services/createOrUpdateSubject.service';
import { GetSubjectCategoriesService } from '../../../shared/services/getSubjectCategories.service';

const createOrUpdateSubjectService = new CreateOrUpdateSubjectService();
const getSubjectCategoriesService = new GetSubjectCategoriesService();

export default defineComponent({
  name: 'SubjectEditDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
    subject: { type: Object as PropType<SubjectDto | null>, default: null },
    areaId: { type: Number, default: undefined },
    allSubjectsList: {
      type: Array as PropType<SubjectDto[]>,
      default: () => [],
    },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const form = reactive({
      name: '',
      code: '',
      shortName: '',
      credits: 0,
      theoreticalHours: 0,
      practicalHours: 0,
      totalHours: 0,
      spaceType: '',
      subjectType: '',
      degreeRequirement: false,
      competencias: [] as { code: string; description: string; type: string }[],
      prerequisites: [] as SubjectDto[],
      resultados: [] as {
        description: string;
        competenciaIdx: number | null;
      }[],
    });

    const prereqSearch = ref('');
    const showPrereqDropdown = ref(false);
    const subjectCategories = ref<SubjectsCategoryDto[]>([]);
    const subjectCategoriesLoading = ref(false);

    onMounted(async () => {
      subjectCategoriesLoading.value = true;
      try {
        subjectCategories.value = await getSubjectCategoriesService.run();
      } catch (e) {
        console.error('Error loading subject categories:', e);
      } finally {
        subjectCategoriesLoading.value = false;
      }
    });

    const calcTotalHours = () => {
      form.totalHours = (form.theoreticalHours || 0) + (form.practicalHours || 0);
    };

    watch(
      () => props.subject,
      (s) => {
        if (s) {
          form.name = s.name ?? '';
          form.code = (s as any).code || s.abbreviation || '';
          form.shortName = s.shortName ?? '';
          form.credits = s.credits ?? 0;
          form.theoreticalHours = (s as any).theoreticalHours ?? 0;
          form.practicalHours = (s as any).practicalHours ?? 0;
          form.totalHours = s.totalHours ?? 0;
          form.spaceType = (s as any).spaceType ?? '';
          form.subjectType = s.subjectType ?? '';
          form.degreeRequirement = s.degreeRequirement ?? false;
        } else {
          Object.assign(form, {
            name: '',
            code: '',
            shortName: '',
            credits: 0,
            theoreticalHours: 0,
            practicalHours: 0,
            totalHours: 0,
            spaceType: '',
            subjectType: '',
            degreeRequirement: false,
          });
        }
      },
      { immediate: true }
    );

    const save = async () => {
      try {
        await createOrUpdateSubjectService.run(
          {
            name: form.name,
            code: form.code || undefined,
            abbreviation: form.code || undefined,
            shortName: form.shortName || undefined,
            credits: form.credits || undefined,
            theoreticalHours: form.theoreticalHours || undefined,
            practicalHours: form.practicalHours || undefined,
            totalHours: form.totalHours || undefined,
            spaceType: form.spaceType || undefined,
            subjectType: form.subjectType || undefined,
            degreeRequirement: form.degreeRequirement,
            competencies: form.competencias.length ? form.competencias : undefined,
            prerequisites: form.prerequisites.length ? form.prerequisites.map((p) => p.id) : undefined,
            learningOutcomes: form.resultados.length ? form.resultados : undefined,
            areaId: props.areaId,
            file: null,
          } as any,
          props.subject?.id
        );
        emit('saved');
        emit('update:isVisible', false);
      } catch (e) {
        console.error(e);
      }
    };

    const addCompetencia = () => {
      form.competencias.push({ code: '', description: '', type: 'General' });
    };

    const removeCompetencia = (idx: number) => {
      form.competencias.splice(idx, 1);
      // Adjust index links in resultados
      form.resultados.forEach((res) => {
        if (res.competenciaIdx === idx) res.competenciaIdx = null;
        else if (res.competenciaIdx !== null && res.competenciaIdx > idx) res.competenciaIdx--;
      });
    };

    const addResultado = () => {
      form.resultados.push({ description: '', competenciaIdx: null });
    };

    const removeResultado = (idx: number) => {
      form.resultados.splice(idx, 1);
    };

    // Prerequisite selection logic
    const hideDropdownDelay = () => {
      setTimeout(() => {
        showPrereqDropdown.value = false;
      }, 200);
    };

    const addPrerequisite = (subj: SubjectDto) => {
      if (!form.prerequisites.some((p) => p.id === subj.id) && subj.id !== props.subject?.id) {
        form.prerequisites.push(subj);
      }
      prereqSearch.value = '';
      showPrereqDropdown.value = false;
    };

    const removePrerequisite = (idx: number) => {
      form.prerequisites.splice(idx, 1);
    };

    const filteredSubjects = computed(() => {
      if (!prereqSearch.value) return props.allSubjectsList.filter((s) => s.id !== props.subject?.id);
      const q = prereqSearch.value.toLowerCase();
      return props.allSubjectsList.filter(
        (s) =>
          s.id !== props.subject?.id &&
          ((s.name && s.name.toLowerCase().includes(q)) || ((s as any).code && (s as any).code.toLowerCase().includes(q)) || (s.abbreviation && s.abbreviation.toLowerCase().includes(q)))
      );
    });

    return {
      form,
      calcTotalHours,
      save,
      addCompetencia,
      removeCompetencia,
      addResultado,
      removeResultado,
      prereqSearch,
      showPrereqDropdown,
      hideDropdownDelay,
      filteredSubjects,
      addPrerequisite,
      removePrerequisite,
      subjectCategories,
      subjectCategoriesLoading,
    };
  },
});
</script>

<style scoped>
/* HEAD */
.code-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
}

/* Section layout */
.drawer-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.section-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.section-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e8f0fe;
  color: #1e3a8a;
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.section-title {
  font-weight: 700;
  color: #111827;
  font-size: 0.92rem;
  margin-bottom: 2px;
}
.section-sub {
  color: #9ca3af;
  font-size: 0.78rem;
  margin-bottom: 0;
}

/* Fields */
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.fields-grid.cols-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.field-group {
  display: flex;
  flex-direction: column;
}
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
}
.req {
  color: #ef4444;
}

/* Total hours box */
.total-hours-box {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
  min-height: 38px;
}
.total-num {
  font-size: 1.1rem;
  font-weight: 700;
}
.total-unit {
  font-size: 0.85rem;
  color: #9ca3af;
}
.calc-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 3px;
  margin-bottom: 0;
}

/* requisito de grado */
.requisito-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
}
.check-input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #1e3a8a;
}
.check-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.check-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #111827;
}
.check-hint {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 2px;
}

/* Prerrequisitos box & dropdown */
.selected-prereqs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.prereq-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 16px;
}
.btn-remove-prereq {
  background: none;
  border: none;
  color: #9ca3af;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.15s;
}
.btn-remove-prereq:hover {
  color: #ef4444;
}

.search-input-wrapper {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.9rem;
  pointer-events: none;
}
.custom-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
}
.custom-dropdown-item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}
.custom-dropdown-item:last-child {
  border-bottom: none;
}
.custom-dropdown-item:hover {
  background: #f9fafb;
}

/* Competencias */
.competencia-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}
.competencia-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.btn-trash {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  transition: color 0.15s, background 0.15s;
}
.btn-trash:hover {
  color: #ef4444;
  background: #fee2e2;
}
.competencia-textarea {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.85rem;
}
.comp-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
}
.btn-add-competencia {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #1e3a8a;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
}
.btn-add-competencia:hover {
  color: #3b5bdb;
}

/* Aprendizaje */
.resultado-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}
.resultado-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.resultado-textarea {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.85rem;
}
.btn-add-resultado {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #1e3a8a;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
}
.btn-add-resultado:hover {
  color: #3b5bdb;
}
.aprendizaje-hint {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  color: #9ca3af;
}

/* Footer */
.req-note {
  font-size: 0.78rem;
  color: #9ca3af;
}
</style>
