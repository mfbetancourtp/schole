<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="md">
    <!-- HEAD -->
    <template #head>
      <div class="drawer-head-layout">
        <div class="drawer-head-icon">
          <AppIcon icon="certificate" />
        </div>
        <div>
          <h6 class="drawer-head-title">
            {{ $props.mode === 'edit' ? 'Editar Estado de Beca' : 'Nuevo Estado de Beca' }}
          </h6>
          <p class="drawer-head-subtitle">
            {{ $props.mode === 'edit' ? 'Actualiza la información del estado' : 'Completa la información del estado de beca' }}
          </p>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form class="drawer-body-form" id="scholarship-status-form" @submit.prevent="handleSave">
        <AppFormField :form-control="v$.form.code" label="Código *">
          <input type="text" class="form-control" v-model="v$.form.code.$model" placeholder="EJ: REVI" maxlength="4" @input="form.code = form.code.toUpperCase()" />
        </AppFormField>

        <AppFormField :form-control="v$.form.name" label="Nombre *">
          <input type="text" class="form-control" v-model="v$.form.name.$model" placeholder="Ej: En Revisión" />
        </AppFormField>

        <AppFormField :form-control="v$.form.description" label="Descripción *">
          <textarea class="form-control" v-model="v$.form.description.$model" rows="4" placeholder="Describe el significado de este estado en el proceso de becas" />
        </AppFormField>

        <!-- Color Selection -->
        <div class="color-section">
          <label class="color-section__label">Color del Badge *</label>
          <div class="color-grid">
            <label v-for="(meta, key) in BADGE_COLOR_MAP" :key="key" class="color-swatch" :class="{ 'color-swatch--selected': form.color === meta.swatch }">
              <input type="radio" class="color-swatch__radio" :value="meta.swatch" v-model="form.color" />
              <span class="color-swatch__block" :style="{ background: meta.swatch }" />
              <span class="color-swatch__label">{{ meta.label }}</span>
            </label>
          </div>
        </div>

        <!-- Next Statuses Selection -->
        <div class="next-states-section">
          <label class="next-states-section__label">Estados Siguientes</label>
          <p v-if="availableNextStatuses.length === 0" class="next-states-section__hint">No hay estados disponibles</p>
          <div v-else class="states-grid">
            <label
              v-for="status in availableNextStatuses"
              :key="status.id"
              class="state-card"
              :class="{
                'state-card--selected': isNextStatusSelected(status.id),
              }"
            >
              <input type="checkbox" class="state-card__check" :value="status.id" :checked="isNextStatusSelected(status.id)" @change="toggleNextStatus(status.id)" />
              <span class="state-card__code">{{ status.code }}</span>
              <span class="state-card__name">{{ status.name }}</span>
            </label>
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="drawer-footer-actions">
        <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)"> Cancelar </AppButton>
        <AppButton variant="primary" :outlined="false" nativeType="submit" form="scholarship-status-form" :disabled="isLoading">
          {{ $props.mode === 'edit' ? 'Guardar Cambios' : 'Crear Estado' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import type { ScholarshipStatusDto } from '../dtos/scholarshipStatus.dto';
import { BADGE_COLOR_MAP } from '../dtos/scholarshipStatus.dto';

type DrawerMode = 'create' | 'edit';

export default defineComponent({
  name: 'ScholarshipStatusDrawer',
  components: {
    AppDrawer,
    AppIcon,
    AppButton,
    AppFormField,
  },

  emits: ['update:isVisible', 'save'],

  props: {
    isVisible: { type: Boolean, required: true },
    mode: { type: String as PropType<DrawerMode>, default: 'create' },
    formData: {
      type: Object as PropType<ScholarshipStatusDto | null>,
      default: null,
    },
    allStatuses: {
      type: Array as PropType<ScholarshipStatusDto[]>,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    const isLoading = ref(false);
    const selectedNextStatusIds = ref<number[]>([]);

    // Helper: find the swatch color value for any color input
    const findSwatchColor = (colorValue: string | undefined): string => {
      if (!colorValue) return '#2563eb';
      const normalized = colorValue.toLowerCase();
      for (const meta of Object.values(BADGE_COLOR_MAP)) {
        if (meta.swatch.toLowerCase() === normalized || meta.color.toLowerCase() === normalized || meta.bg.toLowerCase() === normalized) {
          return meta.swatch;
        }
      }
      return colorValue;
    };

    // Helper: convert swatch to actual color for the API
    const swatchToColor = (swatchValue: string): string => {
      const normalized = swatchValue.toLowerCase();
      for (const meta of Object.values(BADGE_COLOR_MAP)) {
        if (meta.swatch.toLowerCase() === normalized) {
          return meta.color;
        }
      }
      return swatchValue;
    };

    const form = reactive<Partial<ScholarshipStatusDto>>({
      id: props.formData?.id ?? undefined,
      code: props.formData?.code ?? '',
      name: props.formData?.name ?? '',
      description: props.formData?.description ?? '',
      color: findSwatchColor(props.formData?.color),
      nextStatuses: props.formData?.nextStatuses ?? [],
    });

    const v$ = useVuelidate(
      {
        form: {
          code: { required },
          name: { required },
          description: { required },
        },
      },
      { form },
      { $scope: false }
    );

    // Computed: available next statuses (all except the current one)
    const availableNextStatuses = computed(() => {
      return props.allStatuses.filter((s) => s.id !== form.id);
    });

    const isNextStatusSelected = (statusId: number) => {
      return selectedNextStatusIds.value.includes(statusId);
    };

    const toggleNextStatus = (statusId: number) => {
      const index = selectedNextStatusIds.value.indexOf(statusId);
      if (index > -1) {
        // Remove if already selected
        selectedNextStatusIds.value.splice(index, 1);
      } else {
        // Add if not selected
        selectedNextStatusIds.value.push(statusId);
      }
    };

    const handleSave = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      isLoading.value = true;
      try {
        emit('save', {
          ...form,
          color: swatchToColor(form.color as string),
          nextStatusIds: selectedNextStatusIds.value,
        } as any);
      } finally {
        isLoading.value = false;
      }
    };

    // Watch for changes in formData to reinitialize form
    watch(
      () => props.formData,
      (newData) => {
        if (newData) {
          form.id = newData.id;
          form.code = newData.code;
          form.name = newData.name;
          form.description = newData.description;
          form.color = findSwatchColor(newData.color);
          form.nextStatuses = newData.nextStatuses ?? [];
          selectedNextStatusIds.value = (newData.nextStatuses ?? []).map((item) => item.nextStep.id);
        } else {
          form.id = undefined;
          form.code = '';
          form.name = '';
          form.description = '';
          form.color = '#2563eb';
          form.nextStatuses = [];
          selectedNextStatusIds.value = [];
        }
      },
      { immediate: true }
    );

    return {
      form,
      v$,
      isLoading,
      BADGE_COLOR_MAP,
      handleSave,
      availableNextStatuses,
      selectedNextStatusIds,
      isNextStatusSelected,
      toggleNextStatus,
    };
  },
});
</script>

<style scoped>
/* ── Head ── */
.drawer-head-layout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.drawer-head-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.drawer-head-title {
  margin: 0;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
}

.drawer-head-subtitle {
  margin: 0.15rem 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* ── Body ── */
.drawer-body-form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Color Section ── */
.color-section {
  margin-top: 0.5rem;
}

.color-section__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.color-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
}

.color-swatch__radio {
  display: none;
}

.color-swatch__block {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  transition: border-color 0.15s;
}

.color-swatch--selected .color-swatch__block {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.color-swatch__label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
}

/* ── Next States Section ── */
.next-states-section {
  margin-top: 0.5rem;
}

.next-states-section__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.next-states-section__hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.state-card {
  position: relative;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s;
}

.state-card:hover {
  border-color: #9ca3af;
}

.state-card--selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.state-card__check {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  accent-color: #2563eb;
  cursor: pointer;
}

.state-card__code {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.state-card__name {
  display: block;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1f2937;
}

/* ── Footer ── */
.drawer-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}
</style>
