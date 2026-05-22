<template>
  <teleport to="body">
    <!-- Overlay -->
    <div v-show="isVisible" :class="['overlay', { 'overlay-unset': overlayUnset }]" @click="closeOnOverlay ? closeDrawer() : $emit('overlay-click')" />

    <!-- Drawer -->
    <div :class="['drawer', { 'drawer-open': isVisible }]" :style="{ width: drawerWidth }">
      <!-- ✅ este es el contenedor que vamos a capturar -->
      <div class="drawer-content" :id="exportId">
        <div class="drawer-head">
          <slot name="head"></slot>
          <AppButton v-if="showCloseButton" @click="closeDrawer" class="icon-close ms-2" icon="times" outlined />
        </div>

        <div class="drawer-body">
          <slot name="body"></slot>
        </div>

        <div class="drawer-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import AppButton from './Buttons/AppButton.vue';
import { SizeDrawerConstant, drawerSizes } from '../constant/sizeDrawer.constant';

export default defineComponent({
  name: 'AppDrawer',
  components: { AppButton },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<SizeDrawerConstant>,
      default: 'md',
    },
    // If true, clicking the overlay will not close automatically and
    // instead the drawer will emit 'overlay-click' so the parent can
    // confirm or handle the action.
    closeOnOverlay: {
      type: Boolean,
      default: true,
    },
    // Show the header close button (X)
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    overlayUnset: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:isVisible', 'overlay-click'],
  setup(props, { emit }) {
    const closeDrawer = () => emit('update:isVisible', false);
    const drawerWidth = computed(() => drawerSizes[props.size]) || drawerSizes.md;

    return { closeDrawer, drawerWidth };
  },
});
</script>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #fff;
  transition: transform 0.35s ease;
  transform: translateX(130%);
  /* width ahora viene por drawerWidth */
}

.drawer-open {
  transform: translateX(0%);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-head {
  display: flex;
  align-items: center;
  padding: 18px;
  border-bottom: 1px solid rgba(145, 158, 171, 0.2);
  background-color: var(--color-primary);
  justify-content: space-between;
}

.icon-close {
  color: whitesmoke;
}

.drawer-body {
  flex-grow: 1;
  overflow-y: auto;
}

.drawer-footer {
  background-color: #f4f6f8;
  padding: 12px 20px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.08);
  border-top: 1px solid rgba(145, 158, 171, 0.2);
}

/* Overlay detrás del drawer */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Fondo oscuro al 70% */
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 19;
}
.overlay-unset {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .drawer {
    width: 100% !important;
  }
}
/* Garantee overlay + drawer on top of everything */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 201 !important; /* por encima de navbar/sidebar */
}

.drawer {
  z-index: 202 !important; /* un punto por encima del overlay */
}

.drawer-body {
  overflow-x: hidden;
}
</style>
