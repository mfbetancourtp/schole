// stores/hscroll.store.ts
import { defineStore } from 'pinia';

export const useHScrollStore = defineStore('hscroll', {
  state: () => ({
    el: null as HTMLElement | null,
    width: 0,
    left: 0,
    enabled: false,          // 👈 visibilidad global
  }),
  actions: {
    enable()  { this.enabled = true; },
    disable() { this.enabled = false; this.el = null; this.width = 0; this.left = 0; },

    setEl(el: HTMLElement | null) {
      this.el = el;
      this.updateFromEl();
    },
    updateFromEl() {
      if (!this.el) return;
      this.width = this.el.scrollWidth || 0;
    },

    setLeftFromBar(px: number) {
      this.left = px;
      if (this.el && this.el.scrollLeft !== px) this.el.scrollLeft = px;
    },

    setLeftFromEl(px: number) {
      this.left = px;
      // Importante: NO reflectamos aquí a el.scrollLeft para evitar bucles;
      // GlobalHScroll hará el sync inverso con watch(store.left)
    },
  },
});
