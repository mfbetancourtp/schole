<template>
  <div class="menu-node-wrapper" :class="{ 'menu-node-wrapper--child': depth > 0 }">
    <article class="menu-node" :class="{ 'menu-node--child': depth > 0, 'menu-node--root': depth === 0 }">
      <div class="menu-node__identity">
        <div class="menu-node__depth" :style="{ width: `${depth * 18}px` }"></div>

        <div class="menu-node__icon">
          <AppIcon :icon="resolvedIcon" />
        </div>

        <div class="menu-node__content">
          <div class="menu-node__title-line">
            <h3>{{ item.name || 'Sin nombre' }}</h3>
            <span class="menu-node__id">#{{ item.id }}</span>
            <span class="menu-node__level" :class="{ 'menu-node__level--child': depth > 0 }">{{ levelLabel }}</span>
          </div>

          <div class="menu-node__meta">
            <span>{{ item.code }}</span>
            <span>{{ item.route || 'Sin ruta' }}</span>
            <span>{{ item.moduleName }}</span>
          </div>
        </div>
      </div>

      <div class="menu-node__details">
        <span class="node-badge" :class="item.isActive ? 'node-badge--success' : 'node-badge--muted'">
          {{ item.isActive ? 'Activo' : 'Inactivo' }}
        </span>
        <span class="node-badge" :class="item.showMenu ? 'node-badge--info' : 'node-badge--muted'">
          {{ item.showMenu ? 'Visible' : 'Oculto' }}
        </span>
        <span v-if="item.isReport" class="node-badge node-badge--warning">Reporte</span>
        <span v-if="item.isRequired" class="node-badge node-badge--danger">Requerido</span>
        <span v-if="item.children.length" class="node-badge node-badge--children">{{ item.children.length }} hijos</span>
        <span class="node-badge node-badge--neutral">{{ item.permissions.length }} permisos</span>
        <span class="node-badge node-badge--neutral">Orden {{ item.order }}</span>
      </div>

      <AppButtonGroup class="menu-node__actions">
        <AppButton nativeType="button" variant="ghost" class="node-icon-button" v-tooltip="'Crear hijo'" @click="$emit('create-child', item)">
          <AppIcon icon="plus" />
        </AppButton>
        <AppButtonEdit nativeType="button" @click="$emit('edit', item)" />
        <AppButtonDelete nativeType="button" @click="$emit('delete', item)" />
      </AppButtonGroup>
    </article>

    <div v-if="item.children.length" class="menu-node-children">
      <MenuItemTreeNode
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :depth="depth + 1"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @create-child="$emit('create-child', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { MenuItemViewDto } from '../dtos/menuItem.dto';

const fallbackIcon = 'file-alt';
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
]);

const cleanIconName = (icon: string | null | undefined): string => {
  const clean = String(icon || '')
    .trim()
    .replace(/^fas\s+/i, '')
    .replace(/^fa\s+/i, '')
    .replace(/^fa-/i, '');

  return safeIconNames.has(clean) ? clean : fallbackIcon;
};

export default defineComponent({
  name: 'MenuItemTreeNode',
  components: {
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppIcon,
  },
  props: {
    item: {
      type: Object as PropType<MenuItemViewDto>,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  emits: ['edit', 'delete', 'create-child'],
  setup(props) {
    const resolvedIcon = computed(() => cleanIconName(props.item.icon));
    const levelLabel = computed(() => (props.depth === 0 ? 'Principal' : `Hijo N${props.depth}`));

    return {
      resolvedIcon,
      levelLabel,
    };
  },
});
</script>

<style scoped>
.menu-node-wrapper {
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 0.55rem;
}

.menu-node-wrapper--child::before {
  content: '';
  position: absolute;
  top: 1.55rem;
  left: -1.1rem;
  width: 1.1rem;
  border-top: 2px solid #bfdbfe;
}

.menu-node {
  display: grid;
  grid-template-columns: minmax(18rem, 1fr) auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #94a3b8;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.menu-node--root {
  border-left-color: #1d4ed8;
}

.menu-node--child {
  border-left-color: #60a5fa;
  background: #f8fbff;
}

.menu-node__identity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.menu-node__depth {
  flex-shrink: 0;
}

.menu-node__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #eef6ff;
  color: #1d4ed8;
}

.menu-node__content {
  min-width: 0;
}

.menu-node__title-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.menu-node h3 {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-node__id {
  flex-shrink: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
}

.menu-node__level {
  display: inline-flex;
  flex-shrink: 0;
  padding: 0.12rem 0.42rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.68rem;
  font-weight: 900;
}

.menu-node__level--child {
  background: #eef2ff;
  color: #4338ca;
}

.menu-node__meta {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  margin-top: 0.2rem;
  color: #64748b;
  font-size: 0.78rem;
}

.menu-node__meta span {
  max-width: 15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-node__meta span:not(:last-child)::after {
  content: '•';
  margin-left: 0.45rem;
  color: #cbd5e1;
}

.menu-node__details {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
}

.node-badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.65rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  white-space: nowrap;
}

.node-badge--success {
  background: #ecfdf5;
  color: #047857;
}

.node-badge--info {
  background: #eff6ff;
  color: #1d4ed8;
}

.node-badge--warning {
  background: #fffbeb;
  color: #b45309;
}

.node-badge--children {
  background: #eef2ff;
  color: #4338ca;
}

.node-badge--danger {
  background: #fef2f2;
  color: #b91c1c;
}

.node-badge--neutral,
.node-badge--muted {
  background: #f1f5f9;
  color: #475569;
}

.menu-node__actions {
  justify-content: flex-end;
}

.node-icon-button {
  width: 2.5rem;
  min-width: 2.5rem;
  padding-inline: 0;
  color: #475569;
}

.menu-node-children {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-left: 1.45rem;
  padding-left: 1.1rem;
  border-left: 2px solid #bfdbfe;
}

@media (max-width: 1200px) {
  .menu-node {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .menu-node__details,
  .menu-node__actions {
    justify-content: flex-start;
    padding-left: calc(40px + 0.75rem + 4px);
  }
}

@media (max-width: 576px) {
  .menu-node {
    padding: 0.85rem;
  }

  .menu-node__depth {
    display: none;
  }

  .menu-node__identity {
    align-items: flex-start;
  }

  .menu-node__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
  }

  .menu-node__meta span:not(:last-child)::after {
    display: none;
  }

  .menu-node__details,
  .menu-node__actions {
    padding-left: 0;
  }

  .menu-node-wrapper--child::before,
  .menu-node-children {
    border-left: 0;
    margin-left: 0;
    padding-left: 0;
  }
}
</style>
