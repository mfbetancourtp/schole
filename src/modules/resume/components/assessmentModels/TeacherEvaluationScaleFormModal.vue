<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close', false)">
      <template #content>
        <div class="formGrid">
          <AppFormField :label="'Desde'">
            <input v-model="form.from" type="number" min="0" class="form-control" />
          </AppFormField>

          <AppFormField :label="'Hasta'">
            <input v-model="form.to" type="number" min="0" class="form-control" />
          </AppFormField>

          <div class="field--full">
            <AppFormField :label="'Nombre de Clasificación'">
              <input v-model="form.classificationName" type="text" class="form-control" placeholder="Ej: Sobresaliente" />
            </AppFormField>
          </div>

          <AppFormField :label="'Color'">
            <div class="colorInputWrap">
              <input v-model="form.color" type="color" class="colorInput" />
              <input v-model="form.color" type="text" class="form-control" placeholder="#3b82f6" />
            </div>
          </AppFormField>

          <AppFormField :label="'Nivel Jerárquico'">
            <input v-model="form.hierarchyLevel" type="number" min="1" class="form-control" />
          </AppFormField>
        </div>
      </template>

      <template #actions>
        <AppButton type="submit">
          {{ isEdit ? 'Guardar Cambios' : 'Agregar Rango' }}
        </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';

import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../../shared/components/Modal/AppFormModal.vue';
import { CreateOrUpdateRangeBuilderPayload, CreateOrUpdateRangeBuilderService } from '../../services/createOrUpdateRangeBuilder.service';

const createOrUpdateRangeBuilderService = new CreateOrUpdateRangeBuilderService();

interface RangeBuilderModalData extends CreateOrUpdateRangeBuilderPayload {
  id?: number | string;
}

export default defineComponent({
  name: 'TeacherEvaluationScaleFormModal',
  components: {
    AppButton,
    AppFormField,
    AppFormModal,
  },
  props: {
    data: {
      type: Object as PropType<RangeBuilderModalData | null>,
      default: null,
    },
    teacherEvaluationScaleId: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const form = reactive<CreateOrUpdateRangeBuilderPayload>({
      teacherEvaluationScaleId: props.teacherEvaluationScaleId,
      from: Number(props.data?.from ?? 0),
      to: Number(props.data?.to ?? 0),
      classificationName: String(props.data?.classificationName ?? ''),
      color: String(props.data?.color ?? '#3b82f6'),
      hierarchyLevel: Number(props.data?.hierarchyLevel ?? 1),
    });

    const isEdit = computed(() => !!props.data?.id);

    const title = computed(() => (isEdit.value ? 'Editar Rango' : 'Agregar Rango'));

    const save = async () => {
      const from = Number(form.from);
      const to = Number(form.to);

      if (from >= to) {
        alert('El valor "Desde" debe ser menor que "Hasta"');
        return;
      }

      if (!String(form.classificationName).trim()) {
        alert('El nombre de clasificación es obligatorio');
        return;
      }

      const payload: CreateOrUpdateRangeBuilderPayload = {
        teacherEvaluationScaleId: form.teacherEvaluationScaleId,
        from,
        to,
        classificationName: String(form.classificationName).trim(),
        color: String(form.color).trim() || '#3b82f6',
        hierarchyLevel: Number(form.hierarchyLevel) || 1,
      };

      try {
        await createOrUpdateRangeBuilderService.run(payload, props.data?.id ? Number(props.data.id) : undefined);
        emit('close', true);
      } catch (error) {
        console.log('error', error);
      }
    };

    return {
      form,
      title,
      isEdit,
      save,
      emit,
    };
  },
});
</script>

<style scoped>
.formGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 900px) {
  .formGrid {
    grid-template-columns: 1fr 1fr;
  }
}

.field--full {
  grid-column: 1 / -1;
}

.colorInputWrap {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 0.75rem;
}

.colorInput {
  width: 72px;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #fff;
  padding: 4px;
}
</style>
