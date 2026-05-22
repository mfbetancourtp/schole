<template>
  <font-awesome-icon :icon="icon" :size="size"></font-awesome-icon>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IconSizeConstant } from '../constant/iconSize.constant';

export default defineComponent({
  name: 'AppIcon',
  props: {
    icon: String,
    size: {
      type: String as PropType<IconSizeConstant>,
    },
  },
});
</script>

<style scoped></style>
