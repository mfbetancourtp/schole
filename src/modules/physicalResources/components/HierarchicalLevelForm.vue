<template>
  <AppFormModal :title="data ? 'Editar nivel jerárquico' : 'Crear nivel jerárquico'">
    <template #content>
      <form @submit.prevent="save" id="hierarchical-level-form">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label fw-semibold">Código</label>
            <input type="text" class="form-control" v-model="form.code" placeholder="ej. CAM-01" :class="{ 'is-invalid': errors.code }" />
            <div class="invalid-feedback" v-if="errors.code">
              {{ errors.code }}
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Nombre</label>
            <input type="text" class="form-control" v-model="form.name" placeholder="ej. Campus Principal" :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback" v-if="errors.name">
              {{ errors.name }}
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Nivel</label>
            <select class="form-select" v-model="form.level" :class="{ 'is-invalid': errors.level }">
              <option value="">Seleccionar nivel</option>
              <option value="Campus">Campus</option>
              <option value="Sede">Sede</option>
              <option value="Edificio">Edificio</option>
              <option value="Piso">Piso</option>
            </select>
            <div class="invalid-feedback" v-if="errors.level">
              {{ errors.level }}
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Estado</label>
            <div class="d-flex align-items-center gap-2 mt-1">
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" id="levelStatus" v-model="form.isActive" />
              </div>
              <label for="levelStatus" class="mb-0">Activo</label>
            </div>
            <small class="text-muted mt-1 d-block"> Los niveles inactivos no estarán disponibles para su uso </small>
          </div>
        </div>
      </form>
    </template>

    <template #actions>
      <AppButton variant="primary" @click="save" :loading="saving"> Guardar </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { HierarchicalLevelDto } from '../dtos/hierarchicalLevel.dto';

export default defineComponent({
  name: 'HierarchicalLevelForm',

  components: {
    AppFormModal,
    AppButton,
  },

  props: {
    data: {
      type: Object as PropType<HierarchicalLevelDto | null>,
      default: null,
    },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const saving = ref(false);

    const form = reactive({
      code: props.data?.code ?? '',
      name: props.data?.name ?? '',
      level: props.data?.level ?? '',
      isActive: props.data?.isActive ?? true,
    });

    const errors = reactive({
      code: '',
      name: '',
      level: '',
    });

    const validate = () => {
      errors.code = '';
      errors.name = '';
      errors.level = '';

      let valid = true;

      if (!form.code.trim()) {
        errors.code = 'El código es requerido';
        valid = false;
      }
      if (!form.name.trim()) {
        errors.name = 'El nombre es requerido';
        valid = false;
      }
      if (!form.level) {
        errors.level = 'Debe seleccionar un nivel';
        valid = false;
      }

      return valid;
    };

    const save = () => {
      if (!validate()) return;
      emit('save', { ...form });
    };

    return {
      form,
      errors,
      saving,
      save,
    };
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
