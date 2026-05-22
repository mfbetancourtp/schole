<template>
  <input type="file" class="form-control" @change="changeFile" :id="inputId"/>

  <a :href="currentFile" target="_blank" v-if="currentFile">
    <small>Ver archivo actual</small>
  </a>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'AppUploadFile',
  props: ['currentFile', 'modelValue', 'inputId'],
  emits: ['update:modelValue'],
  setup(props, {emit}) {
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

</style>