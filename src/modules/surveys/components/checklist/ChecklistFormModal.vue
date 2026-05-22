<template>
  <form @submit.prevent="handleSubmit">
    <AppFormModal :title="isEdit ? 'Editar Checklist' : 'Nuevo Checklist'" @cancel="$emit('close')">
      <template #content>
        <div class="row g-3">
          <!-- Título -->
          <div class="col-12">
            <AppFormField :form-control="v$.form.titulo" :label="'Título'">
              <textarea v-model="v$.form.titulo.$model" class="form-control" rows="3" placeholder="Ingresa el título del checklist"></textarea>
            </AppFormField>
          </div>

          <!-- Facultad (sola en su fila) -->
          <div class="col-12">
            <AppFormField :form-control="v$.form.facultadId" :label="'Facultad'">
              <AppAutocomplete
                v-model="v$.form.facultadId.$model"
                :options="facultades"
                label="nombre"
                :filterable="true"
                :placeholder="loadingFacultades ? 'Cargando...' : 'Seleccionar facultad...'"
              />
            </AppFormField>
          </div>

          <!-- Versión + Duración Examen -->
          <div class="col-sm-6">
            <AppFormField :form-control="v$.form.version" label="Versión">
              <input class="form-control" type="text" id="version" v-model="v$.form.version.$model" />
            </AppFormField>
          </div>
          <div class="col-sm-6">
            <AppFormField :label="'Duración Examen'">
              <input class="form-control" type="time" step="1" v-model="form.duracion" />
            </AppFormField>
          </div>

          <!-- Tipo de Cálculo de Peso + toggles alineados -->
          <div class="col-sm-6">
            <AppFormField :form-control="v$.form.tipoCalculoPeso" :label="'Tipo de Cálculo de Peso'">
              <AppAutocomplete v-model="v$.form.tipoCalculoPeso.$model" :options="tiposCalculoPeso" label="nombre" :filterable="false" :clearable="false" placeholder="Seleccionar..." />
            </AppFormField>
          </div>

          <!-- Calcula Peso -->
          <div class="col-sm-3">
            <AppFormField :label="'Calcula Peso'">
              <AppCheckbox id="checklistCalculaPeso" v-model="form.calculaPeso" :integer="true" variant="switch" :label="form.calculaPeso ? 'Sí' : 'No'" class="mt-2" />
            </AppFormField>
          </div>

          <!-- Estado -->
          <div class="col-sm-3">
            <AppFormField :label="'Estado'">
              <AppCheckbox id="checklistActivo" v-model="form.activo" :integer="true" variant="switch" :label="form.activo ? 'Activo' : 'Inactivo'" class="mt-2" />
            </AppFormField>
          </div>
        </div>
      </template>

      <template #actions>
        <AppButton variant="primary" nativeType="submit" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ isEdit ? 'Actualizar' : 'Crear' }}
        </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, PropType, onMounted, nextTick } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckbox from '../../../../shared/components/Forms/AppCheckbox.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';

import { ChecklistDto } from '../../dtos/checklist.dto';
import { CreateOrUpdateChecklistService } from '../../services/checklist/createOrUpdateChecklist.service';
import { GetFacultadesService, FacultadDto } from '../../services/checklist/getFacultades.service';
import { ToastService } from '../../../../shared/services/toast.service';

const createOrUpdateChecklistService = new CreateOrUpdateChecklistService();
const getFacultadesService = new GetFacultadesService();
const toastService = new ToastService();

const DEFAULT_TIPO_CALCULO = 'SUMA';

interface TipoCalculoOption {
  id: string;
  nombre: string;
}

const TIPOS_CALCULO_PESO: readonly TipoCalculoOption[] = [
  { id: 'SUMA', nombre: 'Sumatoria' },
  { id: 'RESTA', nombre: 'Resta' },
];

export default defineComponent({
  name: 'ChecklistFormModal',

  components: {
    AppFormModal,
    AppFormField,
    AppAutocomplete,
    AppCheckbox,
    AppButton,
  },

  props: {
    data: {
      type: Object as PropType<ChecklistDto | null>,
      default: null,
    },
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const isEdit = computed(() => !!props.data?.id);
    const saving = ref(false);

    const existingFacultadId = (props.data as (ChecklistDto & { facultadId?: number }) | null)?.facultadId ?? null;

    const form = reactive<{
      titulo: string;
      version: string;
      calculaPeso: number;
      tipoCalculoPeso: string;
      activo: number;
      facultadId: number | null;
      duracion: string;
    }>({
      titulo: props.data?.titulo ?? '',
      version: props.data?.version ?? '',
      calculaPeso: props.data?.calculaPeso ?? 1,
      tipoCalculoPeso: props.data?.tipoCalculoPeso ?? DEFAULT_TIPO_CALCULO,
      activo: props.data?.activo ?? 1,
      facultadId: existingFacultadId,
      duracion: (props.data as any)?.duracion ?? '',
    });

    const facultades = ref<FacultadDto[]>([]);
    const loadingFacultades = ref(false);

    const v$ = useVuelidate(
      {
        form: {
          titulo: { required },
          version: { required },
          tipoCalculoPeso: { required },
          facultadId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      // Carga de facultades para el select.
      loadingFacultades.value = true;
      try {
        facultades.value = await getFacultadesService.run();
      } catch (error) {
        console.error('Error cargando facultades:', error);
        toastService.show('No se pudieron cargar las facultades.', 'error');
      } finally {
        loadingFacultades.value = false;
      }

      // Evita que las validaciones de 'required' se disparen al abrir el modal.
      await nextTick();
      v$.value.$reset();
    });

    const handleSubmit = async (): Promise<void> => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      saving.value = true;
      try {
        await createOrUpdateChecklistService.run(
          {
            ...form,
            version: props.data?.version ?? '1.0',
          },
          props.data?.id
        );
        emit('save');
      } catch (error) {
        console.error('Error guardando checklist:', error);
        toastService.show('Error al guardar el checklist. Intente nuevamente.', 'error');
      } finally {
        saving.value = false;
      }
    };

    return {
      isEdit,
      form,
      v$,
      saving,
      tiposCalculoPeso: TIPOS_CALCULO_PESO,
      facultades,
      loadingFacultades,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
/* Resalta el botón "Cancelar" del AppFormModal para que no quede blanco sobre blanco */
:deep(.o-modal-footer .o-btn--ghost) {
  border-color: var(--color-gray-400, #c7c7c7);
  background-color: var(--color-gray-100, #f5f5f5);
  color: var(--color-dark, #333);
}
:deep(.o-modal-footer .o-btn--ghost:hover) {
  background-color: var(--color-gray-200, #e9ecef);
  opacity: 1;
}
</style>
