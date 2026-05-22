<template>
  <input type="file" class="form-control" @change="changeFile" :id="inputId" accept="image/*"/>

  <a :href="currentThumbnail" target="_blank" v-if="currentThumbnail">
    <small>Ver archivo actual</small>
  </a>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

export default defineComponent({
  name: 'AppUploadImage',
  props: ['currentThumbnail', 'modelValue', 'inputId'],
  emits: ['update:modelValue', 'imageURL'],
  setup(props, {emit}) {
    const imageURL = ref<string | null>(null);
    const files = ref<File | any>();
    const changeFile = (event: any) => {
      files.value = (event.target as HTMLInputElement).files?.[0] || null;
      imageURL.value = URL.createObjectURL(files.value);
      if (files.value) {
        emit('update:modelValue', files.value);
        emit('imageURL', imageURL.value)
      } else {
        emit('update:modelValue', null);
        emit('imageURL', null)
        imageURL.value = null;
      }
    };

    return {
      changeFile,
    };
  },
});
</script>

<style scoped>

</style>