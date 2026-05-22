<template>
  <AppFormModal :title="modalTitle">
    <template #content>
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label fw-semibold">Código</label>
          <input type="text" class="form-control" v-model="form.code" placeholder="ej. CAM-001" :class="{ 'is-invalid': errors.code }" />
          <div class="invalid-feedback" v-if="errors.code">
            {{ errors.code }}
          </div>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Nombre</label>
          <input type="text" class="form-control" v-model="form.name" placeholder="ej. Campus Central" :class="{ 'is-invalid': errors.name }" />
          <div class="invalid-feedback" v-if="errors.name">
            {{ errors.name }}
          </div>
        </div>

        <!-- Selector visible solo si no hay un defaultLevelType predefinido -->
        <div class="col-12" v-if="!defaultLevelType">
          <label class="form-label fw-semibold">Nivel Jerárquico</label>
          <select class="form-select" v-model="form.levelType">
            <option value="">Seleccionar nivel...</option>
            <option value="Edificio">Edificio</option>
            <option value="Piso">Piso</option>
          </select>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Estado</label>
          <div class="d-flex align-items-center gap-2 mt-1">
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" role="switch" id="structureStatus" v-model="form.isActive" />
            </div>
            <label for="structureStatus" class="mb-0">Activo</label>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton variant="primary" @click="save">Guardar</AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { PhysicalStructureNodeDto } from '../dtos/physicalStructure.dto';

export default defineComponent({
  name: 'PhysicalStructureLevelForm',
  components: { AppFormModal, AppButton },

  props: {
    data: {
      type: Object as PropType<PhysicalStructureNodeDto | null>,
      default: null,
    },
    defaultLevelType: { type: String, default: '' },
    parentId: { type: Number as PropType<number | null>, default: null },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const form = reactive({
      code: props.data?.code ?? '',
      name: props.data?.name ?? '',
      levelType: props.data?.levelType ?? props.defaultLevelType ?? '',
      parentId: props.data?.parentId ?? props.parentId ?? null,
      isActive: props.data?.isActive ?? true,
    });

    const errors = reactive({ code: '', name: '' });

    const modalTitle = computed(() => {
      const isEdit = !!props.data;
      const verb = isEdit ? 'Editar' : 'Crear';
      const subject = props.defaultLevelType ? props.defaultLevelType.toLowerCase() : props.data?.levelType?.toLowerCase() ?? 'nivel';
      return `${verb} ${subject}`;
    });

    const validate = () => {
      errors.code = form.code.trim() ? '' : 'El código es requerido';
      errors.name = form.name.trim() ? '' : 'El nombre es requerido';
      return !errors.code && !errors.name;
    };

    const save = () => {
      if (validate()) emit('save', { ...form });
    };

    return { form, errors, modalTitle, save };
  },
});
</script>

<style scoped>
.form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}
.form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>
