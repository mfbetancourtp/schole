<template>
  <div
    class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-rounded-[20px] tw-cursor-pointer tw-border-2 tw-border-gray-300 tw-border-dashed hover:tw-bg-gray-200 tw-transition-colors tw-duration-150 tw-ease-in-out tw-h-full"
  >
    <AppIcon
      class="icon-size-8 align-items-lg-center m-1"
      icon="plus"
    ></AppIcon>
    {{ t(text) }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../AppIcon.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'AppButtonNewContainer',
  props: {
    text: {
      default: 'core.new',
      type: String,
    },
  },
  components: { AppIcon },
  setup(props) {
    const { t } = useI18n();

    return {
      text: props.text,
      t,
    };
  },
});
</script>

<style scoped></style>
