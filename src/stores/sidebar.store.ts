// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';

// Clave estable para ítems de menú: puede ser string (link/title) o number (id)
type MenuKey = string | number;

type SidebarState = {
  sidebarClose: boolean;
  isOpen: boolean;
  navSelected: MenuKey | null;
  expandedSubMenu: MenuKey | null;
  subItemSelected: MenuKey | null;
  active: MenuKey | null;
};

export const useSidebarStore = defineStore('sidebar', {
  state: (): SidebarState => ({
    sidebarClose: false,
    isOpen: false,
    navSelected: null,
    expandedSubMenu: null,
    subItemSelected: null,
    active: null,
  }),

  actions: {
    setSelected(key: MenuKey | null) {
      this.navSelected = key;
    },
    setActive(key: MenuKey | null) {
      this.active = key;
    },
    setExpanded(key: MenuKey | null) {
      this.expandedSubMenu = key;
    },
    setSubItemSelected(key: MenuKey | null) {
      this.subItemSelected = key;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSidebarStore, import.meta.hot));
}
