<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('close')">
    <template #head>
      <AppDrawerHeader
        :icon="isEditing ? 'edit' : 'project-diagram'"
        :title="isEditing ? 'Editar módulo' : 'Nuevo módulo'"
        :subtitle="isEditing ? `ID ${form.id}` : 'Configura la identidad y navegación del módulo'"
        :variant="isEditing ? 'edit' : 'create'"
      />
    </template>

    <template #body>
      <form id="module-form" class="module-form" @submit.prevent="handleSubmit">
        <section class="module-preview">
          <div class="module-preview__icon">
            <AppIcon :icon="previewIcon" />
          </div>

          <div class="module-preview__content">
            <span class="module-preview__eyebrow">{{ form.internalBase ? 'Base interna' : 'Módulo configurable' }}</span>
            <h4>{{ form.name || 'Nombre del módulo' }}</h4>
            <p>{{ form.description || 'Sin descripción registrada' }}</p>
            <span class="module-preview__route">{{ form.route || 'Sin ruta asignada' }}</span>
          </div>
        </section>

        <div class="row g-3">
          <div class="col-12">
            <AppFormField :form-control="v$.form.name" label="Nombre">
              <input v-model.trim="v$.form.name.$model" class="form-control" type="text" placeholder="Académico" />
            </AppFormField>
          </div>

          <div class="col-12">
            <AppFormField label="Descripción">
              <textarea v-model.trim="form.description" class="form-control" rows="3" placeholder="Módulo de gestión académica" />
            </AppFormField>
          </div>

          <div class="col-sm-6">
            <AppFormField label="Ruta">
              <input v-model.trim="form.route" class="form-control" type="text" placeholder="/academic" />
            </AppFormField>
          </div>

          <div class="col-sm-6">
            <AppFormField :form-control="v$.form.order" label="Orden">
              <input v-model.number="v$.form.order.$model" class="form-control" type="number" min="0" placeholder="1" />
            </AppFormField>
          </div>

          <div class="col-sm-6">
            <AppFormField label="Icono">
              <input v-model.trim="form.icon" class="form-control" type="text" placeholder="sitemap" />
            </AppFormField>
          </div>

          <div class="col-sm-6">
            <AppFormField label="Clase CSS">
              <input v-model.trim="form.cssClass" class="form-control" type="text" placeholder="academic-module" />
            </AppFormField>
          </div>

          <div class="col-12">
            <div class="module-switch-row">
              <div>
                <span class="module-switch-row__title">Base interna</span>
                <span class="module-switch-row__description">Marca el módulo como parte de la configuración base.</span>
              </div>

              <AppCheckbox id="moduleInternalBase" v-model="form.internalBase" :integer="true" variant="switch" :label="form.internalBase ? 'Sí' : 'No'" />
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="drawer-actions">
        <AppButton variant="ghost" nativeType="button" @click="$emit('close')">Cancelar</AppButton>
        <AppButton variant="primary" nativeType="submit" form="module-form" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ isEditing ? 'Guardar cambios' : 'Crear módulo' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { minValue, required } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppCheckbox from '../../../shared/components/Forms/AppCheckbox.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { CreateOrUpdateMenuModuleDto, MenuModuleDto } from '../dtos/menuModule.dto';

const fallbackIcon = 'project-diagram';
const safeIconNames = new Set([
  'sitemap',
  'project-diagram',
  'book',
  'book-open',
  'university',
  'users',
  'user-cog',
  'cog',
  'cogs',
  'clipboard-list',
  'calendar-week',
  'layer-group',
  'graduation-cap',
  'poll',
  'wallet',
  'folder',
  'database',
  'globe',
  'shield-alt',
  'briefcase',
  'scroll',
  'chart-line',
  'chart-pie',
  'file-alt',
  'tags',
  'building',
]);

const cleanIconName = (icon: string | null | undefined): string => {
  const clean = String(icon || '')
    .trim()
    .replace(/^fas\s+/i, '')
    .replace(/^fa\s+/i, '')
    .replace(/^fa-/i, '');

  return safeIconNames.has(clean) ? clean : fallbackIcon;
};

const nullableText = (value: string | null): string | null => {
  const clean = String(value || '').trim();
  return clean || null;
};

export default defineComponent({
  name: 'ModuleFormDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppFormField,
    AppCheckbox,
    AppButton,
    AppIcon,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object as PropType<MenuModuleDto | null>,
      default: null,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const form = reactive<{
      id: number | null;
      name: string;
      description: string | null;
      route: string;
      icon: string | null;
      cssClass: string | null;
      order: number;
      internalBase: number;
    }>({
      id: null,
      name: '',
      description: null,
      route: '',
      icon: null,
      cssClass: null,
      order: 0,
      internalBase: 0,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          order: { required, minValue: minValue(0) },
        },
      },
      { form },
      { $scope: false }
    );

    const isEditing = computed(() => Boolean(form.id));
    const previewIcon = computed(() => cleanIconName(form.icon));

    const resetForm = (module: MenuModuleDto | null) => {
      form.id = module?.id ?? null;
      form.name = module?.name ?? '';
      form.description = module?.description ?? null;
      form.route = module?.route ?? '';
      form.icon = module?.icon ?? null;
      form.cssClass = module?.cssClass ?? null;
      form.order = module?.order ?? 0;
      form.internalBase = Number(module?.internalBase ?? 0);
      v$.value.$reset();
    };

    watch(
      () => [props.data, props.isVisible] as const,
      () => resetForm(props.data),
      { immediate: true }
    );

    const handleSubmit = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      const payload: CreateOrUpdateMenuModuleDto = {
        name: form.name.trim(),
        description: nullableText(form.description),
        route: String(form.route || '').trim(),
        icon: nullableText(form.icon),
        cssClass: nullableText(form.cssClass),
        order: Number(form.order || 0),
        internalBase: Number(form.internalBase || 0),
      };

      emit('save', payload, form.id);
    };

    return {
      form,
      v$,
      isEditing,
      previewIcon,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.module-form {
  padding: 1.25rem;
}

.module-preview {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.module-preview__icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 1.15rem;
}

.module-preview__content {
  min-width: 0;
}

.module-preview__eyebrow {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.module-preview h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.module-preview p {
  margin: 0.25rem 0 0.5rem;
  color: #475569;
  line-height: 1.4;
}

.module-preview__route {
  display: inline-flex;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: #ffffff;
  color: #334155;
  border: 1px solid #dbe4ee;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.module-switch-row__title {
  display: block;
  font-weight: 700;
  color: #1f2937;
}

.module-switch-row__description {
  display: block;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.35;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 576px) {
  .module-preview,
  .module-switch-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .drawer-actions {
    justify-content: stretch;
  }
}
</style>
