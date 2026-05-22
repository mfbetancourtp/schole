<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <!-- HEAD -->
    <template #head>
      <AppDrawerHeader
        :variant="data ? 'edit' : 'create'"
        :icon="data ? 'edit' : 'plus'"
        :title="data ? 'Editar Recurso' : 'Crear Recurso'"
        :subtitle="data ? 'Actualiza la información del recurso' : 'Registra un nuevo recurso en el inventario'"
      >
        <template #meta v-if="data">
          <span class="code-badge">{{ data.code || '—' }}</span>
        </template>
      </AppDrawerHeader>
    </template>

    <!-- BODY -->
    <template #body>
      <form @submit.prevent="save" id="resource-inventory-form">
        <!-- ── 1. Información General ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">1</div>
            <div>
              <h6 class="section-title">Información General</h6>
              <p class="section-sub">Datos básicos de identificación del recurso</p>
            </div>
          </div>
          <div class="fields-grid-code-type">
            <div class="field-group">
              <label class="field-label">Código base <span class="req">*</span></label>
              <input class="form-control" type="text" v-model="form.code" placeholder="ej. PROJ-2024" :class="{ 'is-invalid': errors.code }" />
              <div class="invalid-feedback" v-if="errors.code">
                {{ errors.code }}
              </div>
              <span class="field-hint">Se usará como prefijo si la cantidad es mayor a 1</span>
            </div>
            <div class="field-group">
              <label class="field-label">Tipo de recurso <span class="req">*</span></label>
              <AppAutocomplete v-model="form.typeId" :options="resourceTypes" :filterable="false" :class="{ 'is-invalid': errors.typeId }" placeholder="Seleccionar tipo..." />
              <div class="invalid-feedback" v-if="errors.typeId">
                {{ errors.typeId }}
              </div>
            </div>
          </div>
          <div class="field-group mt-3">
            <label class="field-label">Nombre <span class="req">*</span></label>
            <input class="form-control" type="text" v-model="form.name" placeholder="ej. Proyector Epson EB-X41" :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback" v-if="errors.name">
              {{ errors.name }}
            </div>
          </div>
          <div class="fields-grid mt-3">
            <div class="field-group">
              <label class="field-label">Marca</label>
              <input class="form-control" type="text" v-model="form.brand" placeholder="ej. Epson" />
            </div>
            <div class="field-group">
              <label class="field-label">Modelo</label>
              <input class="form-control" type="text" v-model="form.model" placeholder="ej. EB-X41" />
            </div>
          </div>
          <div class="field-group mt-3">
            <label class="field-label">Serial</label>
            <input class="form-control" type="text" v-model="form.serial" placeholder="ej. X4L1234567" />
          </div>
        </div>

        <!-- ── 2. Configuración de Inventario ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">2</div>
            <div>
              <h6 class="section-title">Configuración de Inventario</h6>
              <p class="section-sub">Parámetros de cantidad, estado y valor del recurso</p>
            </div>
          </div>
          <div class="field-group mb-3">
            <label class="field-label">Cantidad <span class="req">*</span></label>
            <div class="quantity-stepper">
              <button type="button" class="stepper-btn" @click="decrement" :disabled="form.quantity <= 1">
                <AppIcon icon="minus" />
              </button>
              <input type="number" class="stepper-input" v-model.number="form.quantity" min="1" />
              <button type="button" class="stepper-btn" @click="increment">
                <AppIcon icon="plus" />
              </button>
            </div>
            <span class="field-hint">Si la cantidad es mayor a 1, el sistema generará registros individuales automáticamente</span>
          </div>
          <div class="fields-grid">
            <div class="field-group">
              <label class="field-label">Estado inicial</label>
              <AppAutocomplete v-model="form.status" :options="initialStates" :filterable="false" placeholder="Seleccionar estado..." />
            </div>
            <div class="field-group">
              <label class="field-label">Fecha de compra</label>
              <input type="date" class="form-control" v-model="form.purchaseDate" />
            </div>
          </div>
          <div class="field-group mt-3">
            <label class="field-label">Valor (COP)</label>
            <input type="number" class="form-control" v-model.number="form.value" placeholder="ej. 1200000" min="0" />
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton label="Cancelar" outlined variant="secondary" @click="$emit('update:isVisible', false)" />
          <AppButton label="Guardar recurso" variant="primary" nativeType="submit" form="resource-inventory-form" />
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, watch } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { ResourceInventoryDto } from '../dtos/resourceInventory.dto';
import { ResourceTypeDto } from '../dtos/resourceType.dto';
import { InitialStateDto } from '../dtos/initialState.dto';

export default defineComponent({
  name: 'ResourceInventoryDrawer',

  components: {
    AppDrawer,
    AppDrawerHeader,
    AppButton,
    AppIcon,
    AppAutocomplete,
  },

  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object as PropType<ResourceInventoryDto | null>,
      default: null,
    },
    resourceTypes: {
      type: Array as PropType<ResourceTypeDto[]>,
      default: () => [],
    },
    initialStates: {
      type: Array as PropType<InitialStateDto[]>,
      default: () => [],
    },
  },

  emits: ['update:isVisible', 'save'],

  setup(props, { emit }) {
    const toDateInput = (value: unknown): string => {
      if (typeof value !== 'string' || !value) return '';
      return value.slice(0, 10);
    };

    const buildForm = () => {
      const d = props.data as any;
      return {
        code: d?.code ?? '',
        // Backend: `resourceTypeId`. Mantenemos fallback a `typeId` por compat.
        typeId: d?.resourceTypeId ?? d?.typeId ?? (null as number | null),
        name: d?.name ?? '',
        // Backend: `make`. Mantenemos fallback a `brand`.
        brand: d?.make ?? d?.brand ?? '',
        model: d?.model ?? '',
        serial: d?.serial ?? '',
        quantity: 1,
        status: d?.initialStateId ?? d?.status ?? (null as number | null),
        purchaseDate: toDateInput(d?.purchaseDate),
        // Backend: `purchaseValue`. Mantenemos fallback a `value`.
        value: d?.purchaseValue ?? d?.value ?? (null as number | null),
      };
    };

    const form = reactive(buildForm());
    const errors = reactive({ code: '', typeId: '', name: '' });

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) {
          Object.assign(form, buildForm());
          errors.code = '';
          errors.typeId = '';
          errors.name = '';
        }
      }
    );

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
/* HEAD */
.code-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
}

/* Section layout */
.drawer-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.section-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.section-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e8f0fe;
  color: #1e3a8a;
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.section-title {
  font-weight: 700;
  color: #111827;
  font-size: 0.92rem;
  margin-bottom: 2px;
}
.section-sub {
  color: #9ca3af;
  font-size: 0.78rem;
  margin-bottom: 0;
}

/* Fields */
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
/* Code (narrow) + Type (wider) */
.fields-grid-code-type {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}
.field-group {
  display: flex;
  flex-direction: column;
}
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
}
.field-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 3px;
}
.req {
  color: #ef4444;
}

/* Footer */
.req-note {
  font-size: 0.78rem;
  color: #9ca3af;
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
</style>
