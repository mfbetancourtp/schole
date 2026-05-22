<template>
  <AppFormModal :title="data ? 'Editar tipo de recurso' : 'Crear tipo de recurso'">
    <template #content>
      <div class="row g-3">
        <div class="col-4">
          <label class="form-label fw-semibold">Código</label>
          <input type="text" class="form-control" v-model="form.code" placeholder="ej. PROJ-001" :class="{ 'is-invalid': errors.code }" />
          <div class="invalid-feedback" v-if="errors.code">
            {{ errors.code }}
          </div>
        </div>

        <div class="col-8">
          <label class="form-label fw-semibold">Nombre</label>
          <input type="text" class="form-control" v-model="form.name" placeholder="ej. Proyector" :class="{ 'is-invalid': errors.name }" />
          <div class="invalid-feedback" v-if="errors.name">
            {{ errors.name }}
          </div>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Descripción</label>
          <textarea class="form-control" v-model="form.description" placeholder="ej. Proyector multimedia Full HD con HDMI" rows="3"></textarea>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Categoría <span class="text-danger">*</span></label>
          <AppAutocomplete v-model="form.resourceCategoryId" :options="categories" :filterable="true" placeholder="Seleccionar categoría" />
          <div class="text-danger small mt-1" v-if="errors.resourceCategoryId">
            {{ errors.resourceCategoryId }}
          </div>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Configuración</label>
          <div class="config-box">
            <div class="d-flex align-items-center gap-2">
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" id="serialIsRequired" v-model="form.serialIsRequired" />
              </div>
              <label for="serialIsRequired" class="mb-0 fw-semibold">Requiere serial</label>
            </div>
            <small class="text-muted mt-1 d-block">Si está habilitado, se solicitará el número de serie al agregar este recurso al inventario</small>
          </div>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Estado</label>
          <div class="d-flex align-items-center gap-2 mt-1">
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" role="switch" id="rtStatus" v-model="form.isActive" />
            </div>
            <label for="rtStatus" class="mb-0">Activo</label>
          </div>
          <small class="text-muted mt-1 d-block">Los tipos de recursos inactivos no estarán disponibles para su uso</small>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton variant="primary" @click="save">Guardar</AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { ResourceTypeDto } from '../dtos/resourceType.dto';
import { ResourceCategoryDto } from '../dtos/resourceCategory.dto';

export default defineComponent({
  name: 'ResourceTypeForm',
  components: { AppFormModal, AppButton, AppAutocomplete },

  props: {
    data: { type: Object as PropType<ResourceTypeDto | null>, default: null },
    categories: {
      type: Array as PropType<ResourceCategoryDto[]>,
      default: () => [],
    },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const form = reactive({
      code: props.data?.code ?? '',
      name: props.data?.name ?? '',
      description: props.data?.description ?? '',
      resourceCategoryId: props.data?.resourceCategoryId ?? (null as number | null),
      serialIsRequired: !!props.data?.serialIsRequired ?? false,
      isActive: props.data ? !!props.data.isActive : true,
    });

    const errors = reactive({ code: '', name: '', resourceCategoryId: '' });

    const validate = () => {
      errors.code = form.code.trim() ? '' : 'El código es requerido';
      errors.name = form.name.trim() ? '' : 'El nombre es requerido';
      errors.resourceCategoryId = form.resourceCategoryId ? '' : 'Seleccione una categoría';
      return !errors.code && !errors.name && !errors.resourceCategoryId;
    };

    const save = () => {
      if (validate()) emit('save', { ...form });
    };

    return { form, errors, save };
  },
});
</script>

<style scoped>
.form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}

.config-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem 1rem;
}
</style>
