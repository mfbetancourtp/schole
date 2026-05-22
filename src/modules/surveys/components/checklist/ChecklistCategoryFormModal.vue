<template>
  <form @submit.prevent="handleSubmit">
    <AppFormModal :title="isEdit ? 'Editar Categoría' : 'Nueva Categoría'" @cancel="$emit('close')">
      <template #content>
        <div class="row g-3">
          <div class="col-12">
            <AppFormField :form-control="v$.form.descripcion" :label="'Descripción'">
              <textarea v-model="v$.form.descripcion.$model" class="form-control" rows="3" placeholder="Ingresa la descripción de la categoría"></textarea>
            </AppFormField>
          </div>

          <div class="col-12">
            <AppFormField :label="'Estado'">
              <div class="form-check form-switch mt-2">
                <input
                  id="checklistCategoryActive"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :checked="form.activo === 1"
                  @change="form.activo = ($event.target as HTMLInputElement).checked ? 1 : 0"
                />
                <label for="checklistCategoryActive" class="form-check-label">
                  {{ form.activo ? 'Activa' : 'Inactiva' }}
                </label>
              </div>
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

<script lang="ts">
import { defineComponent, reactive, ref, computed, PropType, onMounted, nextTick } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';

import { ChecklistCategoryDto } from '../../dtos/checklist.dto';
import { CreateOrUpdateChecklistCategoryService } from '../../services/checklist/createOrUpdateChecklistCategory.service';
import { LinkCategoryToChecklistService } from '../../services/checklist/linkCategoryToChecklist.service';
import { ToastService } from '../../../../shared/services/toast.service';

const createOrUpdateChecklistCategoryService = new CreateOrUpdateChecklistCategoryService();
const linkCategoryToChecklistService = new LinkCategoryToChecklistService();
const toastService = new ToastService();

export default defineComponent({
  name: 'ChecklistCategoryFormModal',

  components: { AppFormModal, AppFormField, AppButton },

  props: {
    checklistId: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<ChecklistCategoryDto | null>,
      default: null,
    },
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const isEdit = computed(() => !!props.data?.id);
    const saving = ref(false);

    const form = reactive({
      descripcion: props.data?.descripcion ?? '',
      activo: props.data?.activo ?? 1,
    });

    const v$ = useVuelidate(
      {
        form: {
          descripcion: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      if (props.data) {
        form.descripcion = props.data.descripcion ?? '';
        form.activo = props.data.activo ?? 1;
      }
      // Evita que la validación 'required' se dispare al abrir el modal.
      await nextTick();
      v$.value.$reset();
    });

    const handleSubmit = async (): Promise<void> => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      saving.value = true;
      try {
        const masterPayload = {
          descripcion: form.descripcion,
          activo: form.activo,
          allowDuplication: 0,
          orden: 1,
          observacion: '',
        };

        if (isEdit.value) {
          const masterCategoryId = props.data!.categoriaPreguntaId ?? props.data!.id;
          await createOrUpdateChecklistCategoryService.run(masterPayload, masterCategoryId);
        } else {
          const response = await createOrUpdateChecklistCategoryService.run(masterPayload);
          const newMasterId = response?.data?.id ?? response?.id;

          await linkCategoryToChecklistService.run({
            categoriaPreguntaId: newMasterId,
            checklistId: props.checklistId,
            orden: 1,
          });
        }

        emit('save');
      } catch (error) {
        console.error('Error guardando categoría:', error);
        toastService.show('Error al guardar la categoría. Intente nuevamente.', 'error');
      } finally {
        saving.value = false;
      }
    };

    return { isEdit, form, saving, v$, handleSubmit };
  },
});
</script>
