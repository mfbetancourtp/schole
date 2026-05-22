<template>
  <AppDrawer :isVisible="isVisible" size="lg" :showCloseButton="true" @update:isVisible="handleClose">
    <template #head>
      <AppDrawerHeader
        class="px-3 pt-3 pb-2"
        :variant="isEditing ? 'edit' : 'create'"
        icon="layer-group"
        :title="isEditing ? 'Editar Malla Curricular' : 'Crear Malla Curricular'"
        :subtitle="isEditing ? 'Modifica la información de la malla curricular seleccionada.' : 'Completa la información base para registrar una nueva versión de malla curricular'"
      />
    </template>

    <template #body>
      <form id="grid-form" class="drawerBody drawerBody--form" @submit.prevent="save">
        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">1</div>
            <div>
              <h4 class="drawerSection__title">Información general</h4>
              <p class="drawerSection__subtitle">Define los datos base, vigencia y trazabilidad de la malla curricular.</p>
            </div>
          </div>

          <AppFormField :formControl="v$.form.name" label="Nombre de la malla curricular">
            <AppInput v-model="v$.form.name.$model" type="text" placeholder="Ej: Malla Curricular Ingeniería de Sistemas 2024" />
          </AppFormField>
          <p class="fieldHint">Usa un nombre claro para identificar fácilmente la versión de esta malla.</p>

          <div class="form-row">
            <AppFormField :formControl="v$.form.code" label="Código">
              <AppInput v-model="v$.form.code.$model" type="text" placeholder="Ej: MC-IS-2024" />
            </AppFormField>

            <AppFormField :formControl="v$.form.version" label="Versión">
              <AppInput v-model="v$.form.version.$model" type="text" placeholder="Ej: 1.0" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :formControl="v$.form.qualifiedRegistration" label="Registro calificado">
              <AppInput v-model="v$.form.qualifiedRegistration.$model" type="text" placeholder="Número de registro" />
            </AppFormField>

            <AppFormField :formControl="v$.form.internalRegistration" label="Registro interno institucional">
              <AppInput v-model="v$.form.internalRegistration.$model" type="text" placeholder="Número de registro interno" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :formControl="v$.form.startDate" label="Fecha inicio">
              <input class="form-control" v-model="v$.form.startDate.$model" type="datetime-local" />
            </AppFormField>

            <AppFormField :formControl="v$.form.endDate" label="Fecha fin">
              <input class="form-control" v-model="v$.form.endDate.$model" type="datetime-local" />
            </AppFormField>
          </div>

          <AppFormField :formControl="v$.form.description" label="Descripción">
            <textarea v-model="v$.form.description.$model" class="form-control" rows="4" placeholder="Descripción general de la malla curricular, objetivos, características principales..."></textarea>
          </AppFormField>
          <p class="fieldHint fieldHint--right">{{ form.description.length }} caracteres</p>

          <div class="infoBox">
            <div class="infoBox__icon">
              <AppIcon icon="info-circle" />
            </div>

            <div class="infoBox__content">
              <h4>Datos clave de la malla</h4>
              <ul>
                <li>El nombre, código y versión te ayudarán a identificar rápidamente esta configuración.</li>
                <li>La vigencia define desde cuándo y hasta cuándo aplica esta versión curricular.</li>
                <li>La descripción sirve como contexto funcional y académico para futuras revisiones.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div class="drawerSection__header">
            <div class="drawerSection__badge">2</div>
            <div>
              <h4 class="drawerSection__title">Estado inicial</h4>
              <p class="drawerSection__subtitle">Selecciona cómo quedará registrada la malla al momento de crearla.</p>
            </div>
          </div>

          <div class="drawerCard">
            <AppFormField :formControl="v$.form.state" label="Estado inicial">
              <v-select v-model="v$.form.state.$model" :options="['Borrador', 'Activo', 'Histórico']" placeholder="Borrador" />
            </AppFormField>

            <div class="infoBox">
              <div class="infoBox__icon">
                <AppIcon icon="info-circle" />
              </div>

              <div class="infoBox__content">
                <h4>Importante</h4>
                <ul>
                  <li>Solo puede existir una malla curricular activa por programa.</li>
                  <li>Si activas esta malla, las demás pasarán automáticamente a estado histórico.</li>
                </ul>
              </div>
            </div>

            <div class="stateHintCard">
              <p class="stateHintCard__text">
                <span class="stateHintCard__label">Estado borrador:</span>
                Podrás trabajar en esta malla sin afectar el programa. No estará disponible para matrículas hasta que la actives.
              </p>
            </div>
          </div>
        </section>
      </form>
    </template>

    <template #footer>
      <div class="drawerFooter drawerFooter--simple">
        <div class="drawerFooter__actions drawerFooter__actions--end">
          <AppButton variant="ghost" :disabled="isSaving" @click="handleClose"> Cancelar </AppButton>

          <AppButton variant="primary" :disabled="isSaving" @click="saveAndConfigure">
            {{ isEditing ? 'Guardar cambios' : 'Crear y configurar' }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { useVuelidate } from '@vuelidate/core';
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue';

import { required } from '../../../shared/plugins/vuelidate.plugin';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { CreateOrUpdateProgramCurriculumsService } from '../services/createOrUpdateProgramCurriculums.service';
import type { ProgramCurriculumDto } from '../dtos/programCurriculum.dto';

const createOrUpdateProgramCurriculumsService = new CreateOrUpdateProgramCurriculumsService();

const buildDefaultForm = () => ({
  name: '',
  code: '',
  version: '',
  qualifiedRegistration: '',
  internalRegistration: '',
  startDate: '',
  endDate: '',
  description: '',
  state: 'Borrador',
});

export default defineComponent({
  name: 'CurricularGridFormDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppFormField,
    AppInput,
    AppButton,
    AppIcon,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    programId: {
      type: Number,
      default: null,
    },
    grid: {
      type: Object as PropType<ProgramCurriculumDto | null>,
      default: null,
    },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const isSaving = ref(false);
    const form = reactive(buildDefaultForm());

    const isEditing = computed(() => Boolean(props.grid?.id));

    const rules = {
      form: {
        name: { required },
        code: { required },
        version: { required },
        qualifiedRegistration: { required },
        internalRegistration: { required },
        startDate: { required },
        endDate: { required },
        description: { required },
        state: { required },
      },
    };

    const v$ = useVuelidate(rules, { form });

    const resetForm = () => {
      Object.assign(form, buildDefaultForm());
      v$.value.$reset();
    };

    const formatDateTimeForApi = (dateStr: string) => {
      if (!dateStr) return '';

      const formattedDate = dayjs(dateStr);
      if (!formattedDate.isValid()) return '';

      return formattedDate.format('DD/MM/YYYY HH:mm:ss');
    };

    const formatDateTimeForInput = (dateStr?: string | null) => {
      if (!dateStr || dateStr.startsWith('0000-00-00')) return '';

      const parsed = dayjs(dateStr);
      if (!parsed.isValid()) return '';

      return parsed.format('YYYY-MM-DDTHH:mm');
    };

    const populateFormFromGrid = (grid: ProgramCurriculumDto) => {
      form.name = grid.name || '';
      form.code = grid.code || '';
      form.version = grid.version || '';
      form.qualifiedRegistration = grid.qualifiedRegistration || '';
      form.internalRegistration = grid.internalRegistration || '';
      form.startDate = formatDateTimeForInput(grid.startDate);
      form.endDate = formatDateTimeForInput(grid.endDate);
      form.description = grid.description || '';
      form.state = grid.state || 'Borrador';
      v$.value.$reset();
    };

    const saveGrid = async (stateOverride?: string) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid || !props.programId) return;

      try {
        isSaving.value = true;

        await createOrUpdateProgramCurriculumsService.run(
          {
            programId: props.programId,
            name: form.name,
            code: form.code,
            description: form.description,
            qualifiedRegistration: form.qualifiedRegistration,
            internalRegistration: form.internalRegistration,
            version: form.version,
            startDate: formatDateTimeForApi(form.startDate),
            endDate: formatDateTimeForApi(form.endDate),
            state: stateOverride || form.state,
          },
          isEditing.value ? props.grid!.id : undefined
        );

        emit('saved');
        resetForm();
      } catch (error) {
        console.error('Error al guardar la malla curricular:', error);
      } finally {
        isSaving.value = false;
      }
    };

    const handleClose = () => {
      resetForm();
      emit('close');
    };

    watch(
      () => props.isVisible,
      (isVisible) => {
        if (isVisible) {
          if (props.grid) {
            populateFormFromGrid(props.grid);
          } else {
            resetForm();
          }
        }
      },
      { immediate: true }
    );

    const saveDraft = async () => {
      await saveGrid('Borrador');
    };

    const saveAndConfigure = async () => {
      await saveGrid();
    };

    const save = async () => {
      await saveAndConfigure();
    };

    return {
      form,
      v$,
      isSaving,
      isEditing,
      save,
      handleClose,
      saveDraft,
      saveAndConfigure,
    };
  },
});
</script>

<style scoped>
.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
}

.drawerBody--form {
  gap: 1.5rem;
}

.drawerSection {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.drawerSection__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.drawerSection__badge {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawerSection__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #172033;
}

.drawerSection__subtitle {
  margin: 0.2rem 0 0;
  color: #667085;
  font-size: 0.92rem;
}

.drawerCard {
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--default-shadow-2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.fieldHint {
  margin: -0.75rem 0 0 0;
  font-size: 0.78rem;
  color: #667085;
}

.fieldHint--right {
  text-align: right;
}

.nativeTextarea {
  min-height: 120px;
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  padding: 0.9rem;
  resize: none;
  outline: none;
  font-family: inherit;
}

.nativeTextarea:focus,
.nativeDateTimeInput:focus {
  border-color: var(--color-primary);
}

.nativeDateTimeInput {
  min-height: 42px;
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  outline: none;
  font-family: inherit;
  color: #172033;
  background: #fff;
}

.infoBox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.infoBox__icon {
  color: #1d4ed8;
  flex-shrink: 0;
}

.infoBox__content h4 {
  margin: 0 0 0.45rem 0;
  color: #1e3a8a;
  font-size: 0.92rem;
  font-weight: 700;
}

.infoBox__content ul {
  margin: 0;
  padding-left: 1rem;
  color: #1d4ed8;
  font-size: 0.82rem;
}

.infoBox__content li + li {
  margin-top: 0.25rem;
}

.stateHintCard {
  padding: 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: #f8fafc;
}

.stateHintCard__text {
  margin: 0;
  color: #475467;
  line-height: 1.55;
  font-size: 0.88rem;
}

.stateHintCard__label {
  font-weight: 700;
  color: #172033;
}

.drawerFooter {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.drawerFooter--simple {
  justify-content: flex-end;
}

.drawerFooter__actions {
  display: flex;
  gap: 0.75rem;
}

.drawerFooter__actions--end {
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 768px) {
  .drawerFooter__actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
