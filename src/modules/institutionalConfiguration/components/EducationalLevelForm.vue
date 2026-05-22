<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <!-- Nombre -->
        <AppFormField :formControl="v$.form.name" :label="'Nombre'">
          <input type="text" class="form-control" id="name" v-model="v$.form.name.$model" :placeholder="'Ej: Educación Básica'" />
        </AppFormField>

        <!-- Código -->
        <AppFormField :formControl="v$.form.code" :label="'Código'">
          <input type="text" class="form-control" id="code" v-model="v$.form.code.$model" :placeholder="'Ej: EB'" />
        </AppFormField>

        <!-- Descripción -->
        <AppFormField :formControl="v$.form.description" :label="'Descripción'">
          <textarea class="form-control" id="description" v-model="v$.form.description.$model" rows="3" :placeholder="'Descripción del nivel educativo'"></textarea>
        </AppFormField>
        <AppFormField :formControl="v$.form.educationCategoryId" :label="'Categoria'">
          <v-select
            input-id="educationCategoryId"
            v-model="v$.form.educationCategoryId.$model"
            :options="educationCategoryData"
            label="name"
            :reduce="(option: any) => option.id"
            :placeholder="'Selecciona categoria'"
            :clearable="true"
          >
          </v-select>
        </AppFormField>

        <!-- Nivel Padre (opcional) -->
        <AppFormField :formControl="v$.form.parentId" :label="'Nivel Padre'">
          <v-select
            input-id="parentId"
            v-model="v$.form.parentId.$model"
            :options="availableParents"
            label="name"
            :reduce="(option: any) => option.id"
            :placeholder="'Selecciona un nivel padre (opcional)'"
            :clearable="true"
          >
            <template #no-options>
              {{ 'No hay niveles disponibles' }}
            </template>
          </v-select>
          <small class="form-text text-muted">
            {{ 'Deja vacío si es un nivel raíz' }}
          </small>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" :label="isEditing ? 'Actualizar' : 'Crear'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { EducationTypeDto } from '../dtos/educationTypes.dto';

export default defineComponent({
  name: 'EducationalLevelForm',

  components: {
    AppFormModal,
    AppFormField,
    AppButton,
  },

  props: {
    data: {
      type: Object as PropType<EducationTypeDto | null>,
      default: null,
    },
    parentId: {
      type: Number as PropType<number | null>,
      default: null,
    },
    educationCategoryData: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    educationTypes: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close', 'save'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const form = reactive({
      name: '',
      code: '',
      description: '',
      educationCategoryId: null as number | null,
      parentId: null as number | null,
    });

    const title = computed(() => (props.isEditing ? 'Editar Nivel Educativo' : 'Crear Nivel Educativo'));

    const getDescendantIds = (educationType?: EducationTypeDto | null) => {
      const ids = new Set<number>();

      const collect = (items?: EducationTypeDto[]) => {
        items?.forEach((item) => {
          ids.add(item.id);
          collect(item.children);
        });
      };

      collect(educationType?.children);
      return ids;
    };

    const availableParents = computed(() => {
      if (!props.isEditing) {
        return props.educationTypes;
      }

      const descendantIds = getDescendantIds(props.data);
      return props.educationTypes.filter((et: any) => et.id !== props.data?.id && !descendantIds.has(et.id));
    });

    // Cargar datos si está editando
    watch(
      () => props.data,
      (newData) => {
        if (newData) {
          form.name = newData.name;
          form.code = newData.code;
          form.description = newData.description || '';
          form.parentId = newData.parentId;
          form.educationCategoryId = newData.educationCategoryId;
        } else {
          // Resetear formulario si no hay data
          form.name = '';
          form.code = '';
          form.description = '';
          form.parentId = null;
          form.educationCategoryId = null;
        }
      },
      { immediate: true }
    );

    // Si se pasa parentId (para crear hijo), establecerlo
    watch(
      () => props.parentId,
      (newParentId) => {
        if (newParentId !== null && !props.isEditing) {
          form.parentId = newParentId;
        }
      },
      { immediate: true }
    );

    const rules = {
      form: {
        name: { required },
        code: { required },
        educationCategoryId: { required },
        description: {},
        parentId: {},
      },
    };

    const v$ = useVuelidate(rules, { form });

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) {
        return;
      }

      const payload = {
        name: form.name,
        code: form.code,
        description: form.description,
        educationCategoryId: form.educationCategoryId,
        parentId: form.parentId || null,
      };

      emit('save', payload);
    };

    return {
      t,
      form,
      v$,
      save,
      title,
      availableParents,
    };
  },
});
</script>

<style scoped>
.form-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
}
.educational-level-form {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-control.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.form-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
}

.text-muted {
  color: #6b7280;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}
</style>
