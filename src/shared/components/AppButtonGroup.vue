<template>
  <div class="btn-group gap-2" :class="classComponent">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { SizesConstant } from '../constant/sizes.constant';

export default defineComponent({
  name: 'AppButtonGroup',
  props: {
    size: {
      type: String as PropType<SizesConstant>,
      default: '',
    },
  },
  setup(props) {
    const classComponent: any = {};

    if (props.size) {
      classComponent[`btn-group-${props.size}`] = true;
    }

    return {
      classComponent,
    };
  },
});
</script>

<style scoped></style>
