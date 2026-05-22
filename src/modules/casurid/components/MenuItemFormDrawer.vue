<template>
  <AppDrawer :isVisible="isVisible" size="xl" @update:isVisible="$emit('close')">
    <template #head>
      <AppDrawerHeader
        :icon="isEditing ? 'edit' : 'stream'"
        :title="isEditing ? 'Editar item' : 'Nuevo item'"
        :subtitle="isEditing ? `ID ${form.id}` : 'Configura navegación, jerarquía y permisos'"
        :variant="isEditing ? 'edit' : 'create'"
      />
    </template>

    <template #body>
      <form id="menu-item-form" class="item-form" @submit.prevent="handleSubmit">
        <section class="item-preview">
          <div class="item-preview__icon">
            <AppIcon :icon="previewIcon" />
          </div>

          <div class="item-preview__content">
            <span class="item-preview__eyebrow">{{ parentLabel }}</span>
            <h4>{{ form.name || 'Nombre del item' }}</h4>
            <p>{{ form.code || 'codigo.del.item' }}</p>
            <div class="item-preview__meta">
              <span>{{ selectedModuleName }}</span>
              <span>{{ form.route || 'Sin ruta asignada' }}</span>
            </div>
          </div>
        </section>

        <section class="form-section">
          <header class="form-section__head">
            <h5>Información general</h5>
          </header>

          <div class="row g-3">
            <div class="col-md-6">
              <AppFormField :form-control="v$.form.moduleId" label="Módulo">
                <v-select
                  input-id="menuItemModuleId"
                  v-model="v$.form.moduleId.$model"
                  :options="modules"
                  label="name"
                  :reduce="(module) => module.id"
                  :disabled="hasContextParent"
                  placeholder="Selecciona un módulo"
                />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <div class="readonly-location">
                <span class="readonly-location__label">Ubicación</span>
                <div class="readonly-location__content">
                  <div class="readonly-location__icon">
                    <AppIcon :icon="hasContextParent ? 'level-down-alt' : 'sitemap'" />
                  </div>

                  <div>
                    <strong>{{ parentLabel }}</strong>
                    <span>{{ hasContextParent ? 'Hijo del item seleccionado' : 'Nivel principal' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <AppFormField :form-control="v$.form.name" label="Nombre">
                <input v-model.trim="v$.form.name.$model" class="form-control" type="text" placeholder="core.menu.students" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField :form-control="v$.form.code" label="Código">
                <input v-model.trim="v$.form.code.$model" class="form-control" type="text" placeholder="academic.students" />
              </AppFormField>
            </div>

            <div class="col-md-8">
              <AppFormField label="Ruta">
                <input v-model.trim="form.route" class="form-control" type="text" placeholder="/academic/students" />
              </AppFormField>
            </div>

            <div class="col-md-4">
              <AppFormField :form-control="v$.form.order" label="Orden">
                <input v-model.number="v$.form.order.$model" class="form-control" type="number" min="0" placeholder="1" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField label="Icono">
                <input v-model.trim="form.icon" class="form-control" type="text" placeholder="users" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField label="Clase CSS">
                <input v-model.trim="form.cssClass" class="form-control" type="text" placeholder="students-item" />
              </AppFormField>
            </div>
          </div>
        </section>

        <section class="form-section">
          <header class="form-section__head">
            <h5>Estado</h5>
          </header>

          <div class="switch-grid">
            <div class="switch-card">
              <div>
                <strong>Mostrar en menú</strong>
                <span>{{ form.showMenu ? 'Visible para navegación' : 'Oculto en navegación' }}</span>
              </div>
              <AppCheckbox id="menuItemShowMenu" v-model="form.showMenu" :integer="true" variant="switch" :label="form.showMenu ? 'Sí' : 'No'" />
            </div>

            <div class="switch-card">
              <div>
                <strong>Activo</strong>
                <span>{{ form.isActive ? 'Disponible' : 'Deshabilitado' }}</span>
              </div>
              <AppCheckbox id="menuItemIsActive" v-model="form.isActive" :integer="true" variant="switch" :label="form.isActive ? 'Sí' : 'No'" />
            </div>

            <div class="switch-card">
              <div>
                <strong>Reporte</strong>
                <span>{{ form.isReport ? 'Se marca como reporte' : 'Item de navegación' }}</span>
              </div>
              <AppCheckbox id="menuItemIsReport" v-model="form.isReport" :integer="true" variant="switch" :label="form.isReport ? 'Sí' : 'No'" />
            </div>

            <div class="switch-card">
              <div>
                <strong>Requerido</strong>
                <span>{{ form.isRequired ? 'Obligatorio' : 'Opcional' }}</span>
              </div>
              <AppCheckbox id="menuItemIsRequired" v-model="form.isRequired" :integer="true" variant="switch" :label="form.isRequired ? 'Sí' : 'No'" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <header class="form-section__head form-section__head--permissions">
            <div>
              <h5>Permisos</h5>
              <span>{{ form.permissions.length }} seleccionados</span>
            </div>

            <div class="permission-actions">
              <AppButton nativeType="button" variant="ghost" @click="selectPrincipalPermissions">Básicos</AppButton>
              <AppButton nativeType="button" variant="ghost" @click="clearPermissions">Limpiar</AppButton>
            </div>
          </header>

          <div class="permission-groups">
            <article v-for="group in permissionsByAction" :key="group.action" class="permission-group">
              <h6>{{ group.label }}</h6>

              <div class="permission-grid">
                <label
                  v-for="permission in group.permissions"
                  :key="permission.id"
                  class="permission-card"
                  :class="{
                    'permission-card--active': hasPermission(permission.id),
                  }"
                >
                  <input type="checkbox" :checked="hasPermission(permission.id)" @change="togglePermission(permission.id)" />

                  <span>
                    <strong>{{ getPermissionLabel(permission) }}</strong>
                    <small>#{{ permission.id }} · {{ permission.name }}</small>
                  </span>
                </label>
              </div>
            </article>
          </div>
        </section>
      </form>
    </template>

    <template #footer>
      <div class="drawer-actions">
        <AppButton variant="ghost" nativeType="button" @click="$emit('close')">Cancelar</AppButton>
        <AppButton variant="primary" nativeType="submit" form="menu-item-form" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ isEditing ? 'Guardar cambios' : 'Crear item' }}
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

import { MenuModuleDto } from '../dtos/menuModule.dto';
import { CreateOrUpdateMenuItemDto, MenuItemDto, MenuItemTreeOptionDto, MenuPermissionDto } from '../dtos/menuItem.dto';

interface PermissionGroup {
  action: string;
  label: string;
  permissions: MenuPermissionDto[];
}

const fallbackIcon = 'stream';
const actionLabels: Record<string, string> = {
  list: 'Listar',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};
const actionOrder = ['list', 'create', 'edit', 'delete'];
const safeIconNames = new Set([
  'home',
  'tools',
  'sitemap',
  'book',
  'book-open',
  'users',
  'users-cog',
  'user',
  'key',
  'heart',
  'info',
  'clipboard-list',
  'clipboard-check',
  'calendar',
  'calendar-alt',
  'graduation-cap',
  'file-alt',
  'file',
  'folder-open',
  'money-bill',
  'money-check-alt',
  'wallet',
  'receipt',
  'table',
  'tags',
  'credit-card',
  'percentage',
  'chalkboard',
  'chalkboard-teacher',
  'university',
  'school',
  'bullhorn',
  'envelope',
  'chart-bar',
  'ban',
  'times-circle',
  'star-half-alt',
  'stream',
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
  name: 'MenuItemFormDrawer',
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
      type: Object as PropType<MenuItemDto | null>,
      default: null,
    },
    modules: {
      type: Array as PropType<MenuModuleDto[]>,
      default: () => [],
    },
    parentItems: {
      type: Array as PropType<MenuItemTreeOptionDto[]>,
      default: () => [],
    },
    permissions: {
      type: Array as PropType<MenuPermissionDto[]>,
      default: () => [],
    },
    defaultParentId: {
      type: Number as PropType<number | null>,
      default: null,
    },
    defaultModuleId: {
      type: Number as PropType<number | null>,
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
      itemParentId: number | null;
      moduleId: number | null;
      code: string;
      name: string;
      route: string | null;
      icon: string | null;
      cssClass: string | null;
      showMenu: number;
      isReport: number;
      isActive: number;
      order: number;
      isRequired: number;
      permissions: number[];
    }>({
      id: null,
      itemParentId: null,
      moduleId: null,
      code: '',
      name: '',
      route: null,
      icon: null,
      cssClass: null,
      showMenu: 1,
      isReport: 0,
      isActive: 1,
      order: 0,
      isRequired: 0,
      permissions: [],
    });

    const v$ = useVuelidate(
      {
        form: {
          moduleId: { required },
          code: { required },
          name: { required },
          order: { required, minValue: minValue(0) },
        },
      },
      { form },
      { $scope: false }
    );

    const isEditing = computed(() => Boolean(form.id));
    const previewIcon = computed(() => cleanIconName(form.icon));

    const selectedModuleName = computed(() => props.modules.find((module) => module.id === form.moduleId)?.name || 'Sin módulo');
    const selectedParent = computed(() => props.parentItems.find((item) => item.id === form.itemParentId) || null);
    const parentLabel = computed(() => selectedParent.value?.treeLabel || 'Item principal');
    const hasContextParent = computed(() => Boolean(form.itemParentId));

    const permissionsByAction = computed<PermissionGroup[]>(() => {
      const grouped = props.permissions.reduce<Record<string, MenuPermissionDto[]>>((groups, permission) => {
        const key = permission.action || 'other';
        groups[key] = groups[key] || [];
        groups[key].push(permission);
        return groups;
      }, {});

      return Object.entries(grouped)
        .map(([action, permissions]) => ({
          action,
          label: actionLabels[action] || action,
          permissions: [...permissions].sort((first, second) => first.id - second.id),
        }))
        .sort((first, second) => {
          const firstIndex = actionOrder.indexOf(first.action);
          const secondIndex = actionOrder.indexOf(second.action);

          if (firstIndex === -1 && secondIndex === -1) return first.action.localeCompare(second.action);
          if (firstIndex === -1) return 1;
          if (secondIndex === -1) return -1;
          return firstIndex - secondIndex;
        });
    });

    const resetForm = (item: MenuItemDto | null) => {
      form.id = item?.id ?? null;
      form.itemParentId = item?.itemParentId ?? props.defaultParentId ?? null;
      form.moduleId = item?.moduleId ?? props.defaultModuleId ?? selectedParent.value?.moduleId ?? null;
      form.code = item?.code ?? '';
      form.name = item?.name ?? '';
      form.route = item?.route ?? null;
      form.icon = item?.icon ?? null;
      form.cssClass = item?.cssClass ?? null;
      form.showMenu = Number(item?.showMenu ?? 1);
      form.isReport = Number(item?.isReport ?? 0);
      form.isActive = Number(item?.isActive ?? 1);
      form.order = Number(item?.order ?? 0);
      form.isRequired = Number(item?.isRequired ?? 0);
      form.permissions = item?.permissions?.map((permission) => permission.id) ?? [];
      v$.value.$reset();
    };

    watch(
      () => [props.data, props.isVisible, props.defaultParentId, props.defaultModuleId] as const,
      () => resetForm(props.data),
      { immediate: true }
    );

    watch(
      () => form.itemParentId,
      (parentId) => {
        const parent = props.parentItems.find((item) => item.id === parentId);
        if (parent) {
          form.moduleId = parent.moduleId;
        }
      }
    );

    const hasPermission = (permissionId: number): boolean => form.permissions.includes(permissionId);

    const togglePermission = (permissionId: number) => {
      if (hasPermission(permissionId)) {
        form.permissions = form.permissions.filter((id) => id !== permissionId);
        return;
      }

      form.permissions = [...form.permissions, permissionId].sort((first, second) => first - second);
    };

    const clearPermissions = () => {
      form.permissions = [];
    };

    const selectPrincipalPermissions = () => {
      const principalIds = props.permissions
        .filter((permission) => Number(permission.isPrincipal) === 1 && ['list', 'create', 'edit', 'delete'].includes(permission.action))
        .map((permission) => permission.id);
      form.permissions = [...new Set(principalIds)].sort((first, second) => first - second);
    };

    const getPermissionLabel = (permission: MenuPermissionDto): string => {
      const translation = permission.translations?.find((item) => item.languageId === 1)?.value;
      return translation || permission.scope || permission.action || permission.name;
    };

    const handleSubmit = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid || !form.moduleId) return;

      const payload: CreateOrUpdateMenuItemDto = {
        moduleId: Number(form.moduleId),
        code: form.code.trim(),
        name: form.name.trim(),
        route: nullableText(form.route),
        icon: nullableText(form.icon),
        cssClass: nullableText(form.cssClass),
        showMenu: Number(form.showMenu || 0),
        isReport: Number(form.isReport || 0),
        isActive: Number(form.isActive || 0),
        order: Number(form.order || 0),
        isRequired: Number(form.isRequired || 0),
        permissions: [...form.permissions],
      };

      if (form.itemParentId) {
        payload.itemParentId = Number(form.itemParentId);
      }

      emit('save', payload, form.id);
    };

    return {
      form,
      v$,
      isEditing,
      previewIcon,
      selectedModuleName,
      parentLabel,
      hasContextParent,
      permissionsByAction,
      hasPermission,
      togglePermission,
      clearPermissions,
      selectPrincipalPermissions,
      getPermissionLabel,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.item-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.item-preview {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.item-preview__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #eef6ff;
  color: #1d4ed8;
  font-size: 1.1rem;
}

.item-preview__content {
  min-width: 0;
}

.item-preview__eyebrow {
  display: block;
  margin-bottom: 0.2rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.item-preview h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.item-preview p {
  margin: 0.25rem 0 0.5rem;
  color: #475569;
  font-family: var(--bs-font-monospace);
  font-size: 0.82rem;
}

.item-preview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.item-preview__meta span {
  display: inline-flex;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #dbe4ee;
  border-radius: 999px;
  background: #ffffff;
  color: #334155;
  font-size: 0.78rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.readonly-location {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.readonly-location__label {
  color: #334155;
  font-size: 0.86rem;
  font-weight: 700;
}

.readonly-location__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.55rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid #dbe4ee;
  border-radius: 8px;
  background: #f8fafc;
}

.readonly-location__icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #eef6ff;
  color: #1d4ed8;
}

.readonly-location strong,
.readonly-location span {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.readonly-location strong {
  color: #0f172a;
  font-size: 0.88rem;
}

.readonly-location span {
  color: #64748b;
  font-size: 0.78rem;
}

.form-section {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.form-section__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.95rem;
}

.form-section__head h5,
.permission-group h6 {
  margin: 0;
  color: #0f172a;
  font-weight: 800;
}

.form-section__head h5 {
  font-size: 0.95rem;
}

.form-section__head--permissions {
  align-items: flex-start;
}

.form-section__head--permissions span {
  display: block;
  margin-top: 0.15rem;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
}

.permission-actions,
.drawer-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.drawer-actions {
  justify-content: flex-end;
}

.switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.switch-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.switch-card strong {
  display: block;
  color: #1f2937;
}

.switch-card span {
  display: block;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.permission-groups {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.permission-group {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.permission-group h6 {
  font-size: 0.84rem;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.permission-card {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.permission-card:hover,
.permission-card--active {
  border-color: #93c5fd;
  background: #eff6ff;
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.08);
}

.permission-card input {
  margin-top: 0.15rem;
}

.permission-card span {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.permission-card strong,
.permission-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-card strong {
  color: #0f172a;
  font-size: 0.86rem;
}

.permission-card small {
  color: #64748b;
  font-size: 0.72rem;
}

@media (max-width: 768px) {
  .switch-grid,
  .permission-grid {
    grid-template-columns: 1fr;
  }

  .form-section__head,
  .switch-card {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .item-preview {
    flex-direction: column;
  }

  .drawer-actions {
    justify-content: stretch;
  }
}
</style>
