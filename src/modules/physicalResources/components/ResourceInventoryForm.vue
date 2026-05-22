<template>
  <AppFormModal :title="data ? 'Editar recurso' : 'Crear recurso'">
    <template #content>
      <p class="tw-text-sm tw-text-gray-500 tw-mb-4">Registra uno o varios recursos físicos en el inventario institucional</p>

      <!-- Información general -->
      <div class="section-header tw-mb-3">
        <AppIcon icon="info-circle" class="tw-text-gray-500" />
        <span class="tw-text-sm tw-font-semibold tw-text-gray-700">Información general</span>
      </div>

      <div class="row g-3 tw-mb-2">
        <div class="col-6">
          <label class="form-label fw-semibold">
            Código base
            <AppIcon icon="question-circle" class="tw-text-gray-400 ms-1" />
          </label>
          <input type="text" class="form-control" v-model="form.code" placeholder="ej. PROJ-2024" :class="{ 'is-invalid': errors.code }" />
          <div class="invalid-feedback" v-if="errors.code">
            {{ errors.code }}
          </div>
          <small class="text-muted">* Se usará como prefijo si la cantidad es mayor a 1</small>
        </div>

        <div class="col-6">
          <label class="form-label fw-semibold">Tipo de recurso</label>
          <select class="form-select" v-model="form.typeId" :class="{ 'is-invalid': errors.typeId }">
            <option value="">Seleccionar tipo...</option>
            <option v-for="rt in resourceTypes" :key="rt.id" :value="rt.id">
              {{ rt.name }}
            </option>
          </select>
          <div class="invalid-feedback" v-if="errors.typeId">
            {{ errors.typeId }}
          </div>
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Nombre</label>
          <input type="text" class="form-control" v-model="form.name" placeholder="ej. Proyector Epson EB-X41" :class="{ 'is-invalid': errors.name }" />
          <div class="invalid-feedback" v-if="errors.name">
            {{ errors.name }}
          </div>
        </div>

        <div class="col-6">
          <label class="form-label fw-semibold">Marca</label>
          <input type="text" class="form-control" v-model="form.brand" placeholder="ej. Epson" />
        </div>

        <div class="col-6">
          <label class="form-label fw-semibold">Modelo</label>
          <input type="text" class="form-control" v-model="form.model" placeholder="ej. EB-X41" />
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Serial</label>
          <input type="text" class="form-control" v-model="form.serial" placeholder="ej. X4L1234567" />
        </div>
      </div>

      <hr class="tw-my-3" />

      <!-- Configuración de inventario -->
      <div class="section-header tw-mb-3">
        <AppIcon icon="cog" class="tw-text-gray-500" />
        <span class="tw-text-sm tw-font-semibold tw-text-gray-700">Configuración de inventario</span>
      </div>

      <div class="row g-3">
        <div class="col-12">
          <label class="form-label fw-semibold">Cantidad <span class="text-danger">*</span></label>
          <div class="quantity-stepper">
            <button type="button" class="stepper-btn" @click="decrement" :disabled="form.quantity <= 1">
              <AppIcon icon="minus" />
            </button>
            <input type="number" class="stepper-input" v-model.number="form.quantity" min="1" />
            <button type="button" class="stepper-btn" @click="increment">
              <AppIcon icon="plus" />
            </button>
          </div>
          <small class="text-muted d-block tw-mt-1">Si la cantidad es mayor a 1, el sistema generará registros individuales automáticamente</small>
        </div>

        <div class="col-6">
          <label class="form-label fw-semibold">Estado inicial</label>
          <select class="form-select" v-model="form.status">
            <option value="available">Disponible</option>
            <option value="assigned">Asignado</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="damaged">Dañado</option>
          </select>
        </div>

        <div class="col-6">
          <label class="form-label fw-semibold">
            <AppIcon icon="calendar" class="me-1 tw-text-gray-400" />
            Fecha de compra
          </label>
          <input type="date" class="form-control" v-model="form.purchaseDate" />
        </div>

        <div class="col-6">
          <label class="form-label fw-semibold">
            <AppIcon icon="dollar-sign" class="me-1 tw-text-gray-400" />
            Valor (COP)
          </label>
          <input type="number" class="form-control" v-model.number="form.value" placeholder="ej. 1200000" min="0" />
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton variant="primary" @click="save">Guardar recurso</AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { ResourceInventoryDto } from '../dtos/resourceInventory.dto';
import { ResourceTypeDto } from '../dtos/resourceType.dto';

export default defineComponent({
  name: 'ResourceInventoryForm',
  components: { AppFormModal, AppButton, AppIcon },

  props: {
    data: {
      type: Object as PropType<ResourceInventoryDto | null>,
      default: null,
    },
    resourceTypes: {
      type: Array as PropType<ResourceTypeDto[]>,
      default: () => [],
    },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const form = reactive({
      code: props.data?.code ?? '',
      typeId: props.data?.typeId ?? (null as number | null),
      name: props.data?.name ?? '',
      brand: props.data?.brand ?? '',
      model: props.data?.model ?? '',
      serial: props.data?.serial ?? '',
      quantity: 1,
      status: props.data?.status ?? 'available',
      purchaseDate: props.data?.purchaseDate ?? '',
      value: props.data?.value ?? (null as number | null),
    });

    const errors = reactive({ code: '', typeId: '', name: '' });

    const increment = () => form.quantity++;
    const decrement = () => {
      if (form.quantity > 1) form.quantity--;
    };

    const validate = () => {
      errors.code = form.code.trim() ? '' : 'El código es requerido';
      errors.typeId = form.typeId ? '' : 'Seleccione un tipo de recurso';
      errors.name = form.name.trim() ? '' : 'El nombre es requerido';
      return !errors.code && !errors.typeId && !errors.name;
    };

    const save = () => {
      if (validate()) emit('save', { ...form });
    };

    return { form, errors, increment, decrement, save };
  },
});
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Quantity stepper */
.quantity-stepper {
  display: flex;
  align-items: center;
  width: fit-content;
}
.stepper-btn {
  width: 2rem;
  height: 2.25rem;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: background 0.15s;
  color: #374151;
}
.stepper-btn:first-child {
  border-radius: 6px 0 0 6px;
}
.stepper-btn:last-child {
  border-radius: 0 6px 6px 0;
}
.stepper-btn:hover:not(:disabled) {
  background: #e5e7eb;
}
.stepper-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper-input {
  width: 4rem;
  height: 2.25rem;
  border: 1px solid #d1d5db;
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  outline: none;
  color: #374151;
}
.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}
</style>
