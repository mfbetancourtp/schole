<template>
  <AppBaseList title="Power BI Dashboard">
    <template #content>
      <div class="powerbi-container">
        <iframe
          src="https://app.powerbi.com/view?r=eyJrIjoiYWQ3Yjc4NDMtYjI5Ni00MzdmLTljNTItZDdmNDIzMjI5ZjI4IiwidCI6ImQyMjI2YjdjLTQ5M2YtNDg3MC05Mjg2LWY5MmUzMzc4YjY4OCJ9"
          frameborder="0"
          allowFullScreen
        ></iframe>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';

export default defineComponent({
  name: 'PowerBiDashboard',
  components: {
    AppBaseList,
  },
});
</script>

<style scoped>
.powerbi-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 180px);
  overflow: hidden;
}

.powerbi-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
