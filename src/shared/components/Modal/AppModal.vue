<template>
  <o-modal v-model:active="showModal" @close="close">
    <div class="o-modal-content">
      <slot @close="close"></slot>
    </div>
  </o-modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { SizesModalConstant } from '../../constant/sizesModal.constant';

export default defineComponent({
  name: 'AppModal',
  props: {
    modelValue: {
      type: Boolean,
    },
    center: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String as PropType<SizesModalConstant>,
      default: null,
    },
  },
  setup(props, { emit }) {
    const showModal = ref(props.modelValue);
    const sizeCss = ref('var(--modal-md)');

    if (props.size === 'xl') {
      sizeCss.value = 'var(--modal-xl)';
    } else if (props.size === 'lg') {
      sizeCss.value = 'var(--modal-lg)';
    } else if (props.size === 'sm') {
      sizeCss.value = 'var(--modal-sm)';
    }

    const close = () => {
      emit('update:modelValue', false);
    };

    watch(
      () => props.modelValue,
      (value) => {
        showModal.value = value;
      }
    );

    return {
      showModal,
      sizeCss,
      close,
    };
  },
});
</script>

<style scoped>
:deep(.o-modal__content) {
  background-color: transparent;
  padding: 10px;
  width: 100%;
  overflow: unset !important;
}

:deep(.o-modal__close) {
  display: none;
}
.o-modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: unset !important;
  border-radius: var(--border-radius-3);
  background-color: transparent;
  border: transparent;
}
.o-modal {
  z-index: 205 !important;
}
@media (min-width: 768px) {
  :deep(.o-modal__content) {
    overflow: unset !important;
    padding: 0;
    width: v-bind(sizeCss);
  }
}
</style>
