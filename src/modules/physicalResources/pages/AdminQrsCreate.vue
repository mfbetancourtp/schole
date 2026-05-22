<template>
  <AppBaseList title="Crear QR">
    <template #content>
      <p>Formulario de creación de QR (pendiente de implementar).</p>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';

export default defineComponent({
  name: 'AdminQrsCreatePage',
  components: { AppBaseList },
});
</script>
