<template>
  <div class="items-container" ref="itemsContainerRef">
    <ul class="items">
      <!-- usa key estable: item.id || item.link || item.title -->
      <li v-for="item in paginatedItems" :key="item.link || item.id || item.title" :class="['item', { 'bg-primary': isSelected(item) }]" @click="onItemClick(item)" :aria-disabled="loading">
        <AppGetIcon :name="item.icon" classIcon="size-icon-sidebar" :fillColor="isSelected(item) ? '#ffffff' : 'none'" />

        <!-- Bloquea/permite hover solo cuando sidebarClose -->
        <template v-if="sidebarStorage.sidebarClose">
          <div v-if="!isActive(item)" class="item-hover">
            {{ t(item.title) }}
          </div>

          <ul v-if="item.children?.length" :class="['nav-hover-view-menu', { 'nav-hover-view-menu--active': isActive(item) }]">
            <li v-for="child in item.children" :key="child.link || child.id || child.title" class="sub-menu-sidebar-close" @click.stop="onItemClick(child)">
              {{ t(child.title) }}
            </li>
          </ul>
        </template>
      </li>
    </ul>

    <div v-if="paginatedItems[paginatedItems.length - 1] !== lastItem" class="pagination-buttons rotate-button" @click="nextPage">
      <AppGetIcon name="arrow-right" strokeColor="#FFFFFF" />
    </div>
    <div v-else class="pagination-buttons" @click="prevPage">
      <AppGetIcon name="arrow-right" strokeColor="#FFFFFF" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppGetIcon from '../components/AppGetIcon.vue';

import { useUserStore } from '../../stores/user';
import { useHeaderStore } from '../../stores/header.store';
import { useSidebarStore } from '../../stores/sidebar.store';

import type { ItemMenuType } from '../types/itemMenu.type';

export default defineComponent({
  name: 'AppSidebarClosed',
  components: { AppGetIcon },
  setup() {
    const { t } = useI18n();
    const router = useRouter();

    const userStorage = useUserStore();
    const headerStorage = useHeaderStore();
    const sidebarStorage = useSidebarStore();

    const currentPage = ref(0);
    const itemsPerPage = ref(10);
    const itemsContainerRef = ref<HTMLElement | null>(null);
    const loading = ref(false);

    const totalPages = computed(() => Math.ceil(userStorage.items.length / itemsPerPage.value));

    const paginatedItems = computed(() => {
      const startIndex = currentPage.value * itemsPerPage.value;
      const endIndex = startIndex + itemsPerPage.value;
      return userStorage.items.slice(startIndex, endIndex);
    });

    const lastItem = computed<ItemMenuType | undefined>(() => userStorage.items[userStorage.items.length - 1]);

    onMounted(() => document.addEventListener('click', handleClickOutside));
    onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

    const prevPage = () => {
      currentPage.value = Math.max(currentPage.value - 1, 0);
    };
    const nextPage = () => {
      currentPage.value = Math.min(currentPage.value + 1, Math.max(totalPages.value - 1, 0));
    };

    const isSameRoute = (to: string) => to && router.currentRoute.value?.path === to;

    const onItemClick = async (item: ItemMenuType) => {
      if (loading.value) return;
      if (!item?.link) {
        // si es un item “carpeta” solo activa el hover
        sidebarStorage.active = getItemKey(item);
        return;
      }

      loading.value = true;
      sidebarStorage.navSelected = getItemKey(item);
      sidebarStorage.active = getItemKey(item);

      try {
        headerStorage.module = { name: item.title, url: item.link };
        headerStorage.moduleSubItem = { name: '', url: '' };
        headerStorage.moduleItem = { name: '', url: '' };

        if (!isSameRoute(item.link)) {
          await router.push(item.link);
        }
      } finally {
        // al terminar la navegación, deja el menú “no desplegado”
        sidebarStorage.active = null;
        loading.value = false;
      }
    };

    const getItemKey = (it: ItemMenuType) => it.link || it.id || it.title;

    const isSelected = (it: ItemMenuType) => sidebarStorage.navSelected === getItemKey(it);

    const isActive = (it: ItemMenuType) => sidebarStorage.active === getItemKey(it);

    const handleClickOutside = (event: MouseEvent) => {
      if (itemsContainerRef.value && !itemsContainerRef.value.contains(event.target as Node)) {
        sidebarStorage.active = null;
      }
    };

    return {
      t,
      // state
      loading,
      itemsContainerRef,
      lastItem,
      paginatedItems,
      totalPages,
      // stores
      userStorage,
      headerStorage,
      sidebarStorage,
      // ui helpers
      isSelected,
      isActive,
      // actions
      prevPage,
      nextPage,
      onItemClick,
    };
  },
});
</script>
<style scoped>
.items-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.items-container .pagination-buttons {
  width: 65%;
  margin: 0 auto;

  color: var(--color-light);
  background: var(--color-secondary);
  border-radius: var(--border-radius-2);
  cursor: pointer !important;
}
.items-container .rotate-button {
  transform: rotate(180deg);
}
.items {
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
}

.item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--border-radius-1);
  cursor: pointer;
}
.item:hover {
  color: #5b5f62;
  background: #f1f1f1;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.4);
}
.item:hover .item-hover {
  display: flex;
}
.item .size-icon-sidebar {
  width: 28px !important;
  height: 28px !important;
}
.item .item-hover {
  position: absolute;
  left: 100%;
  top: 50%;
  z-index: 99;

  display: none;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  height: 32px;
  width: auto;
  padding: 6px 10px;

  white-space: nowrap;

  transform: translateY(-50%);
  background: rgba(var(--color-primary-rgb), 1);
  color: white;
  border-radius: 4px;
}

.nav-hover-view-menu {
  height: 32px;
  /* Auto layout */
  display: none;
  justify-content: flex-start;
  align-items: center;
  padding: 6px 10px;
  gap: 10px;

  position: absolute;
  left: 100%;
  top: 80%;
  transform: translateY(-50%);
  background: linear-gradient(305.13deg, #e0e0e0 27.47%, #f6fbfc 92.8%);

  transition: all 0.4s ease;
  white-space: nowrap;
  border-radius: 4px;

  margin-left: 7px;
  padding: 4px;
  z-index: 10;
}
.nav-hover-view-menu--active {
  display: block;
  height: auto;
}

.sub-menu-sidebar-close:hover {
  color: white;
  background: #f1f1f1;
  box-shadow: 1px 2px 6px #0006;
  background-color: rgba(var(--color-primary-rgb), var(--bs-bg-opacity)) !important;
  padding: 8px 16px;
  border-radius: 4px;
}
.sub-menu-sidebar-close {
  padding: 8px 16px;
  border-radius: 4px;
}
.bg-primary {
  background-color: rgba(var(--color-primary-rgb), 1) !important;
}
@media (max-width: 992px) {
  .items {
    align-items: unset;
    padding-left: unset;
  }
  .item {
    display: none;
  }
}
</style>
