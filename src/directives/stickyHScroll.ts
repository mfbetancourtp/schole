// directives/stickyHScroll.ts
import type { ObjectDirective } from 'vue';
import { useHScrollStore } from '../stores/hscroll.store';

const stickyHScroll: ObjectDirective<HTMLElement> = {
  mounted(el) {
    const store = useHScrollStore();

    // habilita la barra global
    store.enable();

    // registra el contenedor objetivo
    store.setEl(el);
    store.updateFromEl();

    // sincroniza → contenedor -> barra
    const onScroll = () => store.setLeftFromEl(el.scrollLeft);
    el.addEventListener('scroll', onScroll, { passive: true });

    // observa cambios de tamaño para actualizar ancho de contenido
    const ro = new ResizeObserver(() => store.updateFromEl());
    try { ro.observe(el); } catch {}

    // guarda referencias para cleanup
    (el as any).__sticky_cleanup__ = () => {
      el.removeEventListener('scroll', onScroll);
      try { ro.disconnect(); } catch {}
    };
  },

  updated(el) {
    // si cambió el contenido, refrescamos el ancho
    const store = useHScrollStore();
    store.updateFromEl();
  },

  unmounted(el) {
    const store = useHScrollStore();
    (el as any).__sticky_cleanup__?.();
    store.disable();          // al salir de la vista, ocultamos la barra
  },
};

export default stickyHScroll;
