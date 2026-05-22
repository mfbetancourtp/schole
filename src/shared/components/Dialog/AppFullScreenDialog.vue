<template>
  <div class="modal fade" :id="'myModal' + modalId">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <!-- Modal Header -->
        <div
          class="o-modal-header"
          :style="
            yPaddingHeader
              ? { paddingTop: yPaddingHeader, paddingBottom: yPaddingHeader }
              : {
                  paddingTop: 'var(--padding-3)',
                  paddingBottom: 'var(--padding-3)',
                }
          "
        >
          <h5 class="o-modal-title">{{ newTitle }}</h5>
          <button type="button" class="btn-close" @click="closeDialog"></button>
        </div>

        <!-- Modal body -->
        <div class="modal-body" :style="padding ? { padding: padding } : { padding: '30px' }">
          <slot name="content"></slot>
        </div>

        <!-- Modal footer -->
        <div class="modal-footer">
          <AppButton @click="closeDialog" v-if="showCancelBtn" variant="ghost">
            <!-- <AppIcon icon="times" class="me-2"></AppIcon> -->
            Cancelar
          </AppButton>
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal } from 'bootstrap';

import AppButton from '../Buttons/AppButton.vue';

export default defineComponent({
  name: 'AppFullScreenDialog',
  components: { AppButton },
  props: ['title', 'open', 'showCancelBtn', 'id', 'yPaddingHeader', 'padding'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const newTitle = ref(t(props.title));
    const modalId = props.id || 0;

    watch(
      () => props.open,
      (newValue) => {
        if (newValue) {
          openDialog();
        } else {
          closeDialog();
        }
      }
    );

    const openDialog = () => {
      const dialog = new Modal(document.getElementById('myModal' + modalId));
      dialog.show();
    };

    const closeDialog = () => {
      const myModalElement = document.getElementById('myModal' + modalId);
      if (myModalElement) {
        var myModal = Modal.getInstance(myModalElement);
        if (myModal) {
          myModal.hide();
          emit('close');
        }
      }
    };

    return {
      newTitle,
      openDialog,
      closeDialog,
      modalId,
    };
  },
});
</script>

<style scoped>
.modal-fullscreen {
  width: auto;
}
.modal-content {
  z-index: 9;
  animation: slide-up 0.3s ease;
  font-family: 'Roboto';
}

.modal-body {
  position: relative;
  background-color: var(--color-light);
  overflow: auto;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0%);
  }
}

.o-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: var(--padding-3);
  padding-right: var(--padding-3);
  background-color: var(--color-primary);
  color: var(--color-light);
}

.o-modal-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-2);
  margin-bottom: 0;
  line-height: var(--line-height-4);
}
</style>
