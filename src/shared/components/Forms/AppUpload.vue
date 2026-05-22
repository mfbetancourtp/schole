<template>
  <button class="custom-button" @click="$refs.fileInput.click()">
    <AppIcon icon="cloud-upload-alt"></AppIcon>
  </button>
  <input ref="fileInput" type="file" style="display: none" @change="changeFile" accept="application/pdf" />
  <a :href="currentThumbnail" target="_blank" v-if="currentThumbnail">
    <small>Ver archivo actual</small>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '@/shared/components/AppIcon.vue';

export default defineComponent({
  name: 'AppUpload',
  components: {
    AppIcon,
  },
  props: ['currentThumbnail', 'modelValue', 'inputId'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const changeFile = (event: any) => {
      const files = event.target.files;

      if (files[0]) {
        emit('update:modelValue', files[0]);
      } else {
        emit('update:modelValue', null);
      }
    };

    return {
      changeFile,
    };
  },
});
</script>

<style scoped>
.custom-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-3);
  color: var(--color-primary);
  border-color: transparent;
  font-size: 16px;
  padding: var(--padding-5);
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.custom-button:hover {
  color: var(--color-light);
  background-color: var(--color-primary);
}
</style>
