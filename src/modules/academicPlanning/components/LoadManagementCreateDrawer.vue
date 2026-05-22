<template>
  <AppDrawer :isVisible="isVisible" size="lg" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <AppDrawerHeader class="ms-2 pt-2" variant="create" icon="layer-group" title="Crear nueva carga académica" subtitle="Elige el modo de creación y el periodo base para iniciar la planeación." />
    </template>

    <template #body>
      <div class="loadDrawer px-4 py-4">
        <!-- ── Sección 1: Tipo de creación ── -->
        <section>
          <div class="loadDrawer__sectionHead">
            <span class="loadDrawer__step">1</span>
            <div>
              <h4 class="loadDrawer__title">Tipo de creación</h4>
              <p class="loadDrawer__subtitle">Elige si quieres iniciar desde cero o usar una base existente.</p>
            </div>
          </div>

          <div class="loadDrawer__grid mt-3">
            <button
              type="button"
              class="loadDrawer__option"
              :class="{
                'loadDrawer__option--active': form.tipoCreacion === 'desde-cero',
              }"
              @click="form.tipoCreacion = 'desde-cero'"
            >
              <div class="loadDrawer__optionIcon">
                <AppIcon icon="plus" />
              </div>
              <div class="loadDrawer__optionBody">
                <strong>Crear desde cero</strong>
                <span>Empieza con una estructura vacía y configura manualmente asignaturas, grupos y docentes.</span>
              </div>
            </button>

            <button
              type="button"
              class="loadDrawer__option"
              :class="{
                'loadDrawer__option--active loadDrawer__option--recommended': form.tipoCreacion === 'duplicar',
              }"
              @click="form.tipoCreacion = 'duplicar'"
            >
              <div class="loadDrawer__optionIcon">
                <AppIcon icon="copy" />
              </div>
              <div class="loadDrawer__optionBody">
                <div class="loadDrawer__optionHeading">
                  <strong>Duplicar desde periodo base</strong>
                  <AppBadge label="Recomendado" variant="success" />
                </div>
                <span>Replica una estructura existente para acelerar la planeación y conservar continuidad operativa.</span>
              </div>
            </button>
          </div>

          <div class="row g-3 mt-2">
            <div class="col-12">
              <AppFormField label="Periodo base">
                <AppAutocomplete :options="periodOptions" :clearable="false" v-model="form.periodoBaseId" />
                <small v-if="errors.periodoBase" class="text-danger">{{ errors.periodoBase }}</small>
              </AppFormField>
            </div>

            <div v-if="form.periodoBaseId" class="col-12">
              <div v-if="isLoadingPreview" class="loadDrawer__summaryMini loadDrawer__summaryMini--loading">
                <span class="text-muted">Cargando información del periodo...</span>
              </div>
              <div v-else-if="previewData" class="loadDrawer__summaryMini">
                <div>
                  <strong>{{ previewData.uniqueSubjectsToCopy }}</strong>
                  <span>Asignaturas</span>
                </div>
                <div>
                  <strong>{{ previewData.sectionsWithAssignments }}</strong>
                  <span>Docentes</span>
                </div>
                <div>
                  <strong>{{ previewData.assignmentPercentage }}%</strong>
                  <span>Completado</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Sección 2: Configuración adicional (solo copy) ── -->
        <section v-if="form.tipoCreacion === 'duplicar'">
          <div class="loadDrawer__sectionHead">
            <span class="loadDrawer__step">2</span>
            <div>
              <h4 class="loadDrawer__title">Configuración adicional</h4>
              <p class="loadDrawer__subtitle">Ajusta cómo debe prepararse la nueva carga académica.</p>
            </div>
          </div>

          <div class="loadDrawer__checkList mt-3">
            <label class="loadDrawer__checkItem">
              <input v-model="form.incluirSinDocente" type="checkbox" class="form-check-input mt-1" />
              <div>
                <strong>Incluir asignaturas sin docente</strong>
                <span>Mantiene pendientes los cursos sin responsable para completarlos después.</span>
              </div>
            </label>

            <label class="loadDrawer__checkItem">
              <input v-model="form.marcarConflictos" type="checkbox" class="form-check-input mt-1" />
              <div>
                <strong>Marcar conflictos automáticamente</strong>
                <span>Resalta sobrecargas o asignaciones críticas apenas se crea la nueva carga.</span>
              </div>
            </label>
          </div>
        </section>

        <!-- ── Sección 3/2: Resumen ── -->
        <section>
          <div class="loadDrawer__sectionHead">
            <span class="loadDrawer__step">{{ form.tipoCreacion === 'duplicar' ? 3 : 2 }}</span>
            <div>
              <h4 class="loadDrawer__title">Resumen</h4>
              <p class="loadDrawer__subtitle">Revisa el impacto estimado antes de crear la carga.</p>
            </div>
          </div>

          <div class="loadDrawer__resume mt-3" :class="`loadDrawer__resume--${form.tipoCreacion}`">
            <div class="loadDrawer__resumeHead">
              <AppIcon :icon="form.tipoCreacion === 'duplicar' ? 'copy' : 'plus'" />
              <div>
                <strong>{{ form.tipoCreacion === 'duplicar' ? 'Se generará una copia base' : 'Se creará una carga vacía' }}</strong>
                <p>
                  {{
                    form.tipoCreacion === 'duplicar'
                      ? 'Se clonará la estructura del periodo base sobre el periodo destino.'
                      : 'La planeación iniciará sin asignaturas y quedará lista para configurar manualmente.'
                  }}
                </p>
              </div>
            </div>

            <ul class="loadDrawer__resumeList">
              <li>
                Periodo destino:
                <strong>{{ currentPeriodName || 'Pendiente' }}</strong>
              </li>
              <li>
                Programa:
                <strong>{{ programName || 'Pendiente' }}</strong>
              </li>
              <li>
                Periodo base:
                <strong>{{ periodoBaseName || 'Pendiente' }}</strong>
              </li>
              <template v-if="form.tipoCreacion === 'duplicar'">
                <li>
                  Asignaturas sin docente:
                  <strong>{{ form.incluirSinDocente ? 'Se conservarán' : 'Se excluirán' }}</strong>
                </li>
                <li>
                  Conflictos:
                  <strong>{{ form.marcarConflictos ? 'Se marcarán automáticamente' : 'No se evaluarán en esta acción' }}</strong>
                </li>
              </template>
            </ul>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="loadDrawer__footer">
        <AppButton variant="primary" outlined :disabled="isSubmitting" @click="$emit('update:isVisible', false)">Cancelar</AppButton>

        <AppButton variant="primary" :disabled="isSubmitting" @click="handleCreate">
          <AppIcon :icon="form.tipoCreacion === 'duplicar' ? 'copy' : 'plus'" class="me-2" />
          {{ form.tipoCreacion === 'duplicar' ? 'Duplicar y crear carga' : 'Crear carga vacía' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch, PropType } from 'vue';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import type { LoadCreationType, SelectOption } from '../dtos/academicLoadManagement.dto';
import { GenerateOfferingSectionsService } from '../services/generateOfferingSections.service';
import { GetOfferingSectionsPreviewCopyService } from '../services/getOfferingSectionsPreviewCopy.service';

const generateOfferingSectionsService = new GenerateOfferingSectionsService();
const getOfferingSectionsPreviewCopyService = new GetOfferingSectionsPreviewCopyService();

const getDefaultForm = (type: LoadCreationType) => ({
  tipoCreacion: type,
  periodoBaseId: null as number | null,
  incluirSinDocente: true,
  marcarConflictos: true,
});

export default defineComponent({
  name: 'LoadManagementCreateDrawer',
  components: {
    AppAutocomplete,
    AppBadge,
    AppButton,
    AppDrawer,
    AppDrawerHeader,
    AppFormField,
    AppIcon,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    initialType: {
      type: String as PropType<LoadCreationType>,
      default: 'duplicar',
    },
    academicPeriodId: {
      type: Number as PropType<number | null>,
      default: null,
    },
    programId: {
      type: Number as PropType<number | null>,
      default: null,
    },
    periodOptions: {
      type: Array as PropType<SelectOption<number>[]>,
      default: () => [],
    },
    programName: {
      type: String,
      default: '',
    },
  },
  emits: ['update:isVisible', 'create'],
  setup(props, { emit }) {
    const form = reactive(getDefaultForm(props.initialType));
    const errors = reactive({ periodoBase: '' });
    const previewData = ref<any>(null);
    const isLoadingPreview = ref(false);
    const isSubmitting = ref(false);

    const currentPeriodName = computed(() => props.periodOptions.find((p) => p.id === props.academicPeriodId)?.name || '');
    const periodoBaseName = computed(() => props.periodOptions.find((p) => p.id === form.periodoBaseId)?.name || '');

    const resetForm = () => {
      Object.assign(form, getDefaultForm(props.initialType));
      errors.periodoBase = '';
      previewData.value = null;
    };

    const loadPreview = async (periodoBaseId: number | null) => {
      if (!periodoBaseId || !props.programId) {
        previewData.value = null;
        return;
      }

      isLoadingPreview.value = true;
      try {
        const response = await getOfferingSectionsPreviewCopyService.run({
          academicPeriodIdOrigin: periodoBaseId,
          programId: props.programId,
        });
        previewData.value = response?.data ?? null;
      } catch (error) {
        console.log(error);
        previewData.value = null;
      } finally {
        isLoadingPreview.value = false;
      }
    };

    watch(
      () => [props.isVisible, props.initialType] as const,
      ([isVisible]) => {
        if (isVisible) resetForm();
      }
    );

    watch(
      () => form.periodoBaseId,
      (periodoBaseId) => {
        void loadPreview(periodoBaseId);
      }
    );

    const validate = () => {
      errors.periodoBase = form.periodoBaseId ? '' : 'Debes seleccionar un periodo base.';
      return !errors.periodoBase;
    };

    const handleCreate = async () => {
      if (!validate()) return;

      isSubmitting.value = true;
      try {
        await generateOfferingSectionsService.run({
          academicPeriodId: props.academicPeriodId,
          programId: props.programId,
          type: form.tipoCreacion === 'duplicar' ? 'copy' : 'create',
          academicPeriodIdOrigin: form.periodoBaseId,
          includeSubjectsWithoutTeacher: form.incluirSinDocente,
          autoMarkConflicts: form.marcarConflictos,
        });

        emit('create');
        emit('update:isVisible', false);
      } catch (error) {
        console.log(error);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      errors,
      form,
      isLoadingPreview,
      isSubmitting,
      previewData,
      currentPeriodName,
      periodoBaseName,
      handleCreate,
    };
  },
});
</script>

<style scoped>
.loadDrawer {
  display: grid;
  gap: 1.25rem;
}

.loadDrawer__section {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.2rem;
  background: #ffffff;
}

.loadDrawer__sectionHead {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.loadDrawer__step {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.loadDrawer__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.loadDrawer__subtitle {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
}

.loadDrawer__grid {
  display: grid;
  gap: 1rem;
}

.loadDrawer__option {
  border: 1px solid #dbe3ee;
  border-radius: 18px;
  padding: 1rem;
  background: #f8fafc;
  display: flex;
  gap: 0.95rem;
  text-align: left;
  transition: all 0.2s ease;
}

.loadDrawer__option:hover {
  border-color: rgba(var(--color-primary-rgb), var(--opacity-color-40));
  transform: translateY(-1px);
}

.loadDrawer__option--active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), var(--opacity-color-10));
}

.loadDrawer__option--recommended {
  background: linear-gradient(135deg, #ecfdf3, #ffffff);
}

.loadDrawer__optionIcon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 14px;
  background: #ffffff;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  flex-shrink: 0;
}

.loadDrawer__optionBody {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #475569;
}

.loadDrawer__optionHeading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.loadDrawer__summaryMini {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.loadDrawer__summaryMini--loading {
  grid-template-columns: 1fr;
  place-items: center;
  min-height: 3rem;
}

.loadDrawer__summaryMini div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.loadDrawer__summaryMini strong {
  font-size: 1.1rem;
  color: #0f172a;
}

.loadDrawer__summaryMini span {
  font-size: 0.85rem;
  color: #64748b;
}

.loadDrawer__checkList {
  display: grid;
  gap: 0.85rem;
}

.loadDrawer__checkItem {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.loadDrawer__checkItem strong,
.loadDrawer__resumeHead strong {
  display: block;
  color: #0f172a;
}

.loadDrawer__checkItem span,
.loadDrawer__resumeHead p {
  display: block;
  margin-top: 0.25rem;
  color: #64748b;
}

.loadDrawer__resume {
  border-radius: 18px;
  border: 1px solid #dbeafe;
  padding: 1rem;
}

.loadDrawer__resume--duplicar {
  background: linear-gradient(135deg, #ecfdf3, #ffffff);
  border-color: #bbf7d0;
}

.loadDrawer__resume--desde-cero {
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.loadDrawer__resumeHead {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}

.loadDrawer__resumeHead :deep(svg) {
  color: var(--color-primary);
  margin-top: 0.15rem;
}

.loadDrawer__resumeHead p {
  margin-bottom: 0;
}

.loadDrawer__resumeList {
  margin: 1rem 0 0;
  padding-left: 1rem;
  color: #475569;
  display: grid;
  gap: 0.4rem;
}

.loadDrawer__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 576px) {
  .loadDrawer__summaryMini {
    grid-template-columns: 1fr;
  }

  .loadDrawer__option,
  .loadDrawer__checkItem,
  .loadDrawer__resumeHead {
    flex-direction: column;
  }

  .loadDrawer__footer {
    width: 100%;
  }

  .loadDrawer__footer :deep(.o-btn) {
    width: 100%;
  }
}
</style>
