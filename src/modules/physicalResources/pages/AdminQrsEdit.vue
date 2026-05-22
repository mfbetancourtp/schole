<template>
  <AppBaseList title="Editar QR">
    <template #content>
      <p>Formulario de edición de QR (pendiente de implementar).</p>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';

export default defineComponent({
  name: 'AdminQrsEditPage',
  components: { AppBaseList },
});
</script>
