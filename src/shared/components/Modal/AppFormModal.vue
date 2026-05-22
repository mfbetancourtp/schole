<template>
  <div ref="contentModal">
    <div class="o-modal-header">
      <h5 class="o-modal-title">{{ newTitle }}</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="o-modal-body">
      <slot name="content"></slot>
    </div>
    <div class="o-modal-footer">
      <AppButton variant="ghost" label="core.cancel" @click="closeModal"></AppButton>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton from '../Buttons/AppButton.vue';

export default defineComponent({
  name: 'AppFormModal',
  components: { AppButton },
  props: ['title'],
  emits: ['cancel'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const contentModal = ref();
    const newTitleArray: string[] = [];

    props.title.split(' ').forEach((textSplit: string) => {
      newTitleArray.push(t(textSplit));
    });

    const selectorModal = '.o-modal';

    const findAncestor = (el: any) => {
      while ((el = el.parentElement) && !(el.matches || el.matchesSelector).call(el, selectorModal));
      return el;
    };

    const closeModal = () => {
      // Primary: emit cancel event so parent Vue components can react
      emit('cancel');

      // Fallback: try DOM manipulation for legacy usage
      try {
        const modal = findAncestor(contentModal.value);
        if (modal) {
          const closeBtn = modal.querySelector('.o-modal__close') as HTMLElement | null;
          if (closeBtn) closeBtn.click();
        }
      } catch (_) {
        // Silently ignore if DOM approach fails
      }
    };

    return {
      t,
      newTitle: newTitleArray.join(' '),
      contentModal,
      closeModal,
    };
  },
});
</script>

<style scoped>
.modal-body,
.modal-footer {
  background-color: #fff;
}

.o-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--padding-3);
  background-color: var(--color-primary);
  color: var(--color-light);
  border-radius: 8px 8px 0 0;
}
.o-modal-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-2);
  margin-bottom: 0;
  line-height: var(--line-height-4);
}
.o-modal-body {
  position: relative;
  background-color: var(--color-light);
  padding: var(--padding-4);
  max-height: calc(100vh - 275px);
  overflow: auto;
}
.o-modal-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-1);
  align-items: center;
  justify-content: flex-end;
  padding: var(--padding-2);
  border-top-width: var(--border-1);
  border-top-color: rgba(var(--color-gray-600-rgb), var(--opacity-color-20));
  background-color: var(--color-light);
  border-radius: 0 0 8px 8px;
}
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.modal-container {
  background: #fff; /* Fondo blanco para el contenido */
  border-radius: 8px;
  padding: 20px;
  z-index: 1000;
  position: relative;
}
</style>
