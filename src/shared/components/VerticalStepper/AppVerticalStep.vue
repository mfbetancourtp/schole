<template>
  <div>
    <!-- Slot para personalizar el siguiente paso -->
    <slot :customNext="customNext"></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AppVerticalStep',
  props: {
    /**
     * El nombre del paso.
     */
    name: {
      type: String,
      required: true,
    },
    id: {
      type: [String, Number],
      required: false,
    },
    subitems: {
      type: String,
    },
    /**
     * Función para personalizar el siguiente paso.
     * Debe retornar true si puede pasar al siguiente paso y false en caso contrario.
     * @param {Function} customNext - La función personalizada para el siguiente paso.
     * @returns {boolean} Retorna true si puede pasar al siguiente paso, false en caso contrario.
     */
    customNext: {
      type: Function,
      default: null,
    },
  },
};
</script>
