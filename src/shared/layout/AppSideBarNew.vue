<!-- src/layout/AppSideBarNew.vue -->
<template>
  <!-- Overlay (móvil) para cerrar submenús/hover cuando colapsado -->
  <div v-if="sidebarStorage.active !== null && sidebarStorage.sidebarClose && isMobile" class="overlay" @click="() => (sidebarStorage.active = null)" />
  <!-- BOTÓN TOGGLE: ahora vive fuera del sidebar -->
  <div :class="['buttons', { 'buttons--close': sidebarStorage.sidebarClose }]">
    <button class="button" @click="toggleSidebar" aria-label="Alternar sidebar">
      <AppGetIcon name="arrow-right" :class="['size-icon-sidebar-button', { 'icon--rotated': !sidebarStorage.sidebarClose }]" strokeColor="var(--color-primary)" />
    </button>
  </div>
  <div :class="['sidebar', { 'sidebar--close': sidebarStorage.sidebarClose }]">
    <!-- Encabezado: Logo + Nombre institución -->
    <div :class="['institution-header', { 'institution-header--close': sidebarStorage.sidebarClose }]">
      <div class="institution-logo w-100">
        <img :src="appLogo" alt="App Logo" class="logo-img" />
      </div>
      <!-- <div v-if="!sidebarStorage.sidebarClose" class="institution-name">
        {{ currentInstitution?.name || ' ' }}
      </div> -->
    </div>

    <!-- Vista cerrada “compacta” -->
    <template v-if="sidebarStorage.sidebarClose">
      <AppSidebarClosed />
    </template>

    <!-- Navegación (vista expandida) -->
    <ul v-else class="nav-links">
      <li v-for="(nav, index) in visibleParents" :key="index" class="nav-sub-menu-li" @mouseenter="onMouseEnter(index)" @mouseleave="onMouseLeave">
        <!-- Item principal -->
        <div ref="assignNavItemRef" :data-index="index" :class="['nav-item', { 'nav--selected': sidebarStorage.navSelected === index }]" @click="() => onNavClick(nav, index)">
          <div class="item-container-name">
            <AppGetIcon :name="nav.icon ?? 'default-icon'" classIcon="size-icon-sidebar" :fillColor="sidebarStorage.navSelected === index ? '#ffffff' : 'none'" />

            <div class="item-name">{{ t(nav.title || '') }}</div>

            <div v-if="(nav.children?.filter((ch) => isVisible(ch)).length || 0) > 0" class="container-icon--arrow" @click.stop="() => onNavClick(nav, index)">
              <AppGetIcon
                name="arrow-right"
                :class="[
                  'arrow',
                  {
                    'arrow--expanded': sidebarStorage.expandedSubMenu === index,
                  },
                ]"
                classIcon="size-icon-sidebar"
              />
            </div>
          </div>
        </div>

        <!-- Submenú expandido (sidebar abierto) -->
        <ul v-if="(nav.children?.length || 0) > 0" :class="['sub-menu', { 'sub-menu--expanded': sidebarStorage.expandedSubMenu === index }]">
          <li v-for="(child, subIndex) in visibleChildren(nav)" :key="subIndex">
            <router-link
              :to="child.link || ''"
              :class="[
                'sub-menu-item',
                {
                  'sub-menu-item--selected': sidebarStorage.subItemSelected === Number(child.id),
                },
              ]"
              @click="
                () => {
                  sidebarStorage.subItemSelected = Number(child.id);
                  headerStorage.moduleItem = {
                    name: child.title ?? '',
                    url: child.link ?? '',
                  };
                  headerStorage.moduleSubItem = { name: '', url: '' };
                }
              "
            >
              {{ t(child.title ?? '') }}
            </router-link>
          </li>
        </ul>
      </li>
    </ul>

    <!-- NAV cuando está CERRADO: popover/tooltip fuera del flujo -->
    <template v-if="sidebarStorage.sidebarClose">
      <!-- Menú hover (con hijos) -->
      <div v-if="showHoverMenu" class="nav-hover-menu nav-hover-menu--show" :style="{ top: hoverPosition.top + 'px' }" @mouseenter="onMouseEnterMenu" @mouseleave="onMouseLeaveMenu">
        <div class="nav-hover-menu-header">
          {{ t(hoverParent?.title || '') }}
        </div>
        <div class="nav-hover-menu-items">
          <button v-for="(child, subIndex) in visibleChildren(hoverParent)" :key="subIndex" class="nav-hover-menu-item" @click="() => onCollapsedChildClick(child)">
            {{ t(child.title ?? '') }}
          </button>
        </div>
      </div>

      <!-- Tooltip simple (sin hijos) -->
      <div v-else-if="showHoverTooltip" class="nav-hover-tooltip nav-hover-tooltip--show" :style="{ top: hoverPosition.top + 'px' }" @mouseenter="onMouseEnterMenu" @mouseleave="onMouseLeaveMenu">
        {{ t(hoverParent?.title || '') }}
      </div>
    </template>

    <!-- (Opcional) Footer del sidebar: tema / logout -->
    <!-- 
    <div :class="['sidebar-footer', { 'sidebar-footer--close': sidebarStorage.sidebarClose }]">
      <div class="footer-item" @click="toggleTheme">
        <AppGetIcon :name="isDark ? 'sun' : 'moon'" classIcon="size-icon-sidebar" />
        <span v-if="!sidebarStorage.sidebarClose">{{ isDark ? 'Modo claro' : 'Modo oscuro' }}</span>
      </div>
      <div class="footer-item" @click="signOut">
        <AppGetIcon name="logOut" classIcon="size-icon-sidebar" />
        <span v-if="!sidebarStorage.sidebarClose">Cerrar Sesión</span>
      </div>
    </div>
    -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AppGetIcon from '../components/AppGetIcon.vue';
import AppSidebarClosed from './AppSidebarClosed.vue';

import { useUserStore } from '../../stores/user';
import { useHeaderStore } from '../../stores/header.store';
import { useSidebarStore } from '../../stores/sidebar.store';

/* Para el logo como en tu NavBar */
import { settings } from '../constant/settings.contants';
import { InstitutionsService } from '../services/institutions.service';
const institutionsService = new InstitutionsService();

/* ================== Tipos ================== */
type Item = {
  id?: number | string;
  title?: string;
  icon?: string;
  link?: string | null; // 👈 acepta null
  showMenu?: boolean | number;
  order?: number;
  children?: Item[];
};

/* ================== Stores & utils ================== */
const { t } = useI18n();
const router = useRouter();

const userStorage = useUserStore();
const sidebarStorage = useSidebarStore();
const headerStorage = useHeaderStore();

/* ================== Logo / Institución ================== */
const currentInstitution = computed(() => institutionsService.getSelectedInstitution());
const appLogo = computed<string>(() => {
  const instLogo = currentInstitution.value?.logoInstitutional;
  return (instLogo && String(instLogo)) || String(settings.appLogo);
});

/* ================== Hover/Popover refs ================== */
const hoveredIndex = ref<number | null>(null);
const clickedCollapsedIndex = ref<number | null>(null);
const hoverPosition = reactive({ top: 0 });
const navItemRefs = ref<HTMLElement[]>([]);
const hoverTimeoutRef = ref<ReturnType<typeof setTimeout> | null>(null);

/* ================== Helpers ================== */
const isMobile = computed(() => window.innerWidth <= 700);
const isVisible = (x: Item) => x?.showMenu === true || x?.showMenu === 1 || x?.showMenu === undefined;

/* ordenar y filtrar */
const visibleParents = computed<Item[]>(() => (userStorage.items || []).filter((it: Item) => isVisible(it)).sort((a: Item, b: Item) => (Number(a.order) || 0) - (Number(b.order) || 0)));

const visibleChildren = (nav?: Item | null) => (nav?.children || []).filter((ch: Item) => isVisible(ch)).sort((a: Item, b: Item) => (Number(a.order) || 0) - (Number(b.order) || 0));

/* estado derivado hover (cuando sidebar está CERRADO) */
const hoverParent = computed<Item | null>(() => {
  if (hoveredIndex.value == null) return null;
  return visibleParents.value[hoveredIndex.value] || null;
});
const hasHoverChildren = computed(() => (visibleChildren(hoverParent.value).length || 0) > 0);
const showHoverMenu = computed(() => sidebarStorage.sidebarClose && hoveredIndex.value !== null && hasHoverChildren.value);
const showHoverTooltip = computed(() => sidebarStorage.sidebarClose && hoveredIndex.value !== null && !hasHoverChildren.value);

/* refs asignador */
const assignNavItemRef = (el: HTMLElement | null) => {
  if (!el) return;
  const idx = Number(el.dataset.index);
  navItemRefs.value[idx] = el;
};

/* ================== Eventos ================== */
const onMouseEnter = (index: number) => {
  if (!sidebarStorage.sidebarClose) return;
  if (hoverTimeoutRef.value) clearTimeout(hoverTimeoutRef.value);
  const el = navItemRefs.value[index];
  if (el) {
    const rect = el.getBoundingClientRect();
    hoverPosition.top = rect.top;
    hoveredIndex.value = index;
  }
};

const onMouseLeave = () => {
  if (!sidebarStorage.sidebarClose) return;
  hoverTimeoutRef.value = setTimeout(() => {
    hoveredIndex.value = null;
    clickedCollapsedIndex.value = null;
  }, 150);
};

const onMouseEnterMenu = () => {
  if (hoverTimeoutRef.value) clearTimeout(hoverTimeoutRef.value);
};
const onMouseLeaveMenu = () => {
  hoveredIndex.value = null;
  clickedCollapsedIndex.value = null;
};

const onNavClick = async (nav: Item, index: number) => {
  const hasChildren = (nav.children?.length || 0) > 0;

  if (sidebarStorage.sidebarClose) {
    if (hasChildren) {
      clickedCollapsedIndex.value = clickedCollapsedIndex.value === index ? null : index;
      hoveredIndex.value = index;
    } else if (nav.link) {
      headerStorage.module = { name: nav.title || '', url: nav.link || '' };
      headerStorage.moduleItem = { name: '', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      await router.push(nav.link);
    }
  } else {
    if (sidebarStorage.active === index) {
      sidebarStorage.active = null;
      sidebarStorage.expandedSubMenu = null;
      sidebarStorage.navSelected = null;
    } else {
      sidebarStorage.navSelected = index;
      sidebarStorage.active = index;
      if (hasChildren) sidebarStorage.expandedSubMenu = index;
      headerStorage.module = { name: nav.title || '', url: nav.link || '' };
      headerStorage.moduleItem = { name: '', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      if (!hasChildren && nav.link) await router.push(nav.link);
    }
  }
};

const onCollapsedChildClick = async (child: Item) => {
  sidebarStorage.subItemSelected = Number(child.id);
  headerStorage.moduleItem = { name: child.title || '', url: child.link || '' };
  headerStorage.moduleSubItem = { name: '', url: '' };
  hoveredIndex.value = null;
  clickedCollapsedIndex.value = null;
  if (child.link) await router.push(child.link);
};

/* ================== Toggle sidebar ================== */
const toggleSidebar = () => {
  sidebarStorage.sidebarClose = !sidebarStorage.sidebarClose;
  sidebarStorage.active = null;
  hoveredIndex.value = null;
  clickedCollapsedIndex.value = null;
};

/* ================== Lifecycle ================== */
const handleResize = () => {
  if (window.innerWidth <= 700) sidebarStorage.sidebarClose = true;
};

onMounted(() => {
  headerStorage.moduleSubItem = { name: '', url: '' };
  nextTick(() => {
    navItemRefs.value = new Array(visibleParents.value.length);
  });
  window.addEventListener('resize', handleResize);
  handleResize();
});

onBeforeUnmount(() => {
  if (hoverTimeoutRef.value) clearTimeout(hoverTimeoutRef.value);
  window.removeEventListener('resize', handleResize);
});
</script>
<style scoped>
/* ===== Overlay móvil ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 100;
  cursor: pointer;
}

/* ===== Sidebar ===== */
.sidebar {
  position: fixed;
  left: 0;
  z-index: 200;
  height: 100%;
  width: 301px;
  padding: 10px;
  background: linear-gradient(86deg, #dbeafe -54.53%, #ffffff 100.8%);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}
.sidebar--close {
  width: 80px;
  padding: 15px;
}

/* ===== Header institucional (logo + nombre) ===== */
.institution-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px 16px;
  border-bottom: 1px solid var(--color-outline-opacity-08);
}
.institution-header--close .institution-name {
  display: none;
}
.institution-logo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.institution-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-on-surface-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Botón toggle (fijo) ===== */
/* Abierto => translateX(220px)  |  Cerrado => 0 */
.buttons {
  position: fixed;
  top: 9px; /* mismo top en ambos estados para evitar “saltos” */
  left: 68px; /* punto de partida (cerrado pegado) */
  z-index: 201;
  transform: translateX(220px) rotate(0deg); /* estado ABIERTO (alineado al sidebar abierto) */
  transition: transform 0.25s ease; /* animamos solo el translate */
}
.buttons--close {
  transform: translateX(0) rotate(90deg); /* estado CERRADO */
}
.button {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-2);
  color: var(--color-light);
  background: var(--color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.size-icon-sidebar-button {
  width: 26px !important;
  height: 26px !important;
  transition: transform 0.25s ease;
}
/* gira solo el ícono cuando el sidebar está ABIERTO */
.icon--rotated {
  transform: rotate(270deg);
} /* cambia a 270deg si prefieres */

/* ===== Lista principal ===== */
.nav-links {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}
.nav-sub-menu-li {
  width: 100%;
  position: relative;
}
.nav-sub-menu-li:last-child {
  padding-bottom: 3rem;
}

.nav-item {
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #5b5f62;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.nav-item:hover {
  background: #f1f1f1;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.1);
}

.nav--selected,
.nav--selected:hover {
  color: #fff;
  background: var(--color-primary);
  box-shadow: 0 2px 8px var(--color-primary-opacity-16);
}

.item-container-name {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.item-name {
  width: calc(100% - 28px);
  overflow: hidden;
}
.container-icon--arrow {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
}

.size-icon-sidebar {
  width: 30px !important;
  height: 30px !important;
}

/* Flecha de items con hijos */
.arrow {
  transition: transform 0.3s ease;
  transform: rotate(90deg);
}
.arrow--expanded {
  transform: rotate(180deg);
}

/* ===== Submenú (apertura suave) ===== */
.sub-menu {
  /* en vez de display: none/block usamos max-height + opacity */
  display: block;
  padding: 0;
  margin: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.38s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.38s ease;
  will-change: max-height, opacity;
}

/* Cuando está expandido */
.sub-menu--expanded {
  max-height: 600px; /* ajusta según el tamaño máximo de tus submenús */
  opacity: 1;
}

/* Flecha de items con hijos */
.arrow {
  transition: transform 0.38s cubic-bezier(0.22, 0.61, 0.36, 1);
  transform: rotate(90deg);
}
.arrow--expanded {
  transform: rotate(180deg);
}

/* Respeto a usuarios con reducción de movimiento */
@media (prefers-reduced-motion: reduce) {
  .sub-menu {
    transition: none;
  }
  .arrow {
    transition: none;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 300px;
  }
}
.sub-menu li {
  list-style: none;
}
.sub-menu-item {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #5b5f62;
  padding: 10px 16px 10px 48px;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
}
.sub-menu-item:hover {
  background: #f1f1f1;
}
.sub-menu-item--selected {
  background: #f1f1f1;
}

/* ===== Estado cerrado ===== */
.sidebar--close .nav-item {
  width: 56px;
  height: 56px;
  justify-content: center;
  padding: 16px;
  margin: 0 auto 8px auto;
}
.sidebar--close .item-container-name {
  justify-content: center;
}
.sidebar--close .item-name,
.sidebar--close .container-icon--arrow {
  display: none;
}

/* ===== Hover: menú / tooltip en modo colapsado ===== */
.nav-hover-tooltip {
  position: fixed;
  left: 88px;
  background: var(--color-surface-container-low-main);
  color: var(--color-on-surface-main);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-outline-opacity-08);
  z-index: 1000;
  display: none;
  pointer-events: none;
}
.nav-hover-tooltip--show {
  display: block;
}

.nav-hover-menu {
  position: fixed;
  left: 88px;
  min-width: 200px;
  max-width: 280px;
  background: var(--color-surface-container-lowest-main);
  border: 1px solid var(--color-outline-opacity-08);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: none;
  flex-direction: column;
  overflow: hidden;
}
.nav-hover-menu--show {
  display: flex;
}
.nav-hover-menu-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-outline-opacity-12);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface-main);
  background: var(--color-surface-container-low-main);
}
.nav-hover-menu-items {
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
}
.nav-hover-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  color: var(--color-on-surface-variant-main);
  font-size: 14px;
}
.nav-hover-menu-item:hover {
  background: var(--color-surface-container-low-main);
}

/* ===== Scrollbar ===== */
.nav-links::-webkit-scrollbar {
  width: 6px;
}
.nav-links::-webkit-scrollbar-track {
  background: transparent;
}
.nav-links::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-main);
  border-radius: 4px;
}

/* ===== Responsive (coincide con isMobile <= 700) ===== */
@media (max-width: 992px) {
  .buttons--close {
    left: 12px !important; /* la base en responsive */
    top: 9px !important; /* mismo top en ambos estados */
    /* NO sobreescribir transform aquí: así el botón sigue viajando
       entre 0 (cerrado) y 220px (abierto) gracias a las clases */
  }
  .sidebar--close {
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }
}
</style>
