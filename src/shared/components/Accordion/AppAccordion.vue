<template>
  <div :id="id" :class="accordionClass" class="accordion">
    <slot :accordion-id="id"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { GenerateIdForComponentsService } from '../../services/generateIdForComponents.service';
import { accordionStyleTypeConstant } from '../../constant/accordionStyleType.constant';

const generateIdForComponentsService = new GenerateIdForComponentsService();

export default defineComponent({
  name: 'AppAccordion',
  props: {
    styleType: {
      type: String as () => accordionStyleTypeConstant,
      default: '', // Por defecto no hay estilo
    },
  },
  setup(props) {
    const id = generateIdForComponentsService.run('accordion');

    // Objeto de clases dinámicas basado en styleType
    const styleClasses: Record<accordionStyleTypeConstant, string> = {
      clean: 'accordion-clean',
      rounded: 'accordion-rounded', // Ejemplo de nuevo estilo
    };

    // Computed para determinar la clase dinámica
    const accordionClass = computed(() => {
      return styleClasses[props.styleType as accordionStyleTypeConstant] || ''; // Devuelve la clase correspondiente o cadena vacía
    });

    return {
      id,
      accordionClass,
    };
  },
});
</script>

<style scoped>
.accordion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Estilos según tipo de estilo */
.accordion-clean :deep(.o-accordion-item) {
  border-radius: 0px !important;
  box-shadow: none !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.accordion-rounded :deep(.o-accordion-item) {
  border-radius: 10px !important; /* Ejemplo para el nuevo estilo */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
</style>
