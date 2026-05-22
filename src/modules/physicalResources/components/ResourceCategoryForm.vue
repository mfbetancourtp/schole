<template>
  <AppFormModal :title="data ? 'Editar categoría' : 'Crear categoría'">
    <template #content>
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label fw-semibold">Código</label>
          <input type="text" class="form-control" v-model="form.code" placeholder="ej. CAT-TEC" :class="{ 'is-invalid': errors.code }" />
          <div class="invalid-feedback" v-if="errors.code">
            {{ errors.code }}
          </div>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Nombre</label>
          <input type="text" class="form-control" v-model="form.name" placeholder="ej. Tecnológico" :class="{ 'is-invalid': errors.name }" />
          <div class="invalid-feedback" v-if="errors.name">
            {{ errors.name }}
          </div>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Descripción</label>
          <textarea class="form-control" v-model="form.description" placeholder="ej. Recursos de tecnología e informática" rows="3"></textarea>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Estado</label>
          <div class="d-flex align-items-center gap-2 mt-1">
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" role="switch" id="catStatus" v-model="form.isActive" />
            </div>
            <label for="catStatus" class="mb-0">Activo</label>
          </div>
          <small class="text-muted mt-1 d-block">Las categorías inactivas no estarán disponibles para su uso</small>
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
import { ResourceCategoryDto } from '../dtos/resourceCategory.dto';

export default defineComponent({
  name: 'ResourceCategoryForm',
  components: { AppFormModal, AppButton },

  props: {
    data: {
      type: Object as PropType<ResourceCategoryDto | null>,
      default: null,
    },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const form = reactive({
      code: props.data?.code ?? '',
      name: props.data?.name ?? '',
      description: props.data?.description ?? '',
      isActive: props.data ? !!props.data.isActive : true,
    });

    const errors = reactive({ code: '', name: '' });

    const validate = () => {
      errors.code = form.code.trim() ? '' : 'El código es requerido';
      errors.name = form.name.trim() ? '' : 'El nombre es requerido';
      return !errors.code && !errors.name;
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
</style>
