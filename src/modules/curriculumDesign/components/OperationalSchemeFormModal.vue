<template>
  <form @submit.prevent="handleSave">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="row">
          <div class="col-md-12">
            <AppFormField label="Nombre del Esquema" :required="true">
              <AppInput v-model="form.name" placeholder="Escribe el nombre del esquema..." />
            </AppFormField>
          </div>
        </div>

        <AppFormField label="Descripción" class="mt-3">
          <textarea v-model="form.description" class="form-control" rows="3" placeholder="Describe el propósito de este esquema..."></textarea>
        </AppFormField>

        <div class="row mt-3">
          <div class="col-md-12">
            <AppFormField label="Estado">
              <AppSelect v-model="form.status">
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
              </AppSelect>
            </AppFormField>
          </div>
        </div>
      </template>

      <template #actions>
        <AppButton label="Guardar" nativeType="submit" variant="primary" :outlined="false"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, PropType } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { OperationalSchemeDto } from '../dtos/OperationalSchemeDto';

export default defineComponent({
  name: 'OperationalSchemeFormModal',
  components: {
    AppFormModal,
    AppFormField,
    AppInput,
    AppSelect,
    AppButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    item: {
      type: Object as PropType<OperationalSchemeDto | null>,
      required: false,
      default: null,
    },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const isEdit = computed(() => !!(props.item && props.item.id));
    const title = computed(() => (isEdit.value ? 'Editar Esquema Operativo' : 'Nuevo Esquema Operativo'));

    const form = ref<OperationalSchemeDto>({
      id: 0,
      programTypeId: 0,
      code: '',
      name: '',
      description: '',
      status: 'draft',
      createdAt: '',
    });

    watch(
      () => props.item,
      (newItem) => {
        if (newItem) {
          form.value = { ...newItem };
        } else {
          form.value = {
            id: 0,
            programTypeId: 0,
            code: '',
            name: '',
            description: '',
            status: 'draft',
            createdAt: '',
          };
        }
      },
      { immediate: true }
    );

    const handleSave = () => {
      if (!form.value.name) {
        alert('Por favor, completa el nombre del esquema.');
        return;
      }
      emit('save', { ...form.value });
      emit('update:modelValue', false);
    };

    return {
      title,
      form,
      handleSave,
    };
  },
});
</script>
