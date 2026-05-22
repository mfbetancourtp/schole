<template>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppEmptyLayout',
});
</script>

<style>
html,
body,
#app {
  height: 100%;
  overflow: hidden;
  /* overflow: visible; */
}
</style>
