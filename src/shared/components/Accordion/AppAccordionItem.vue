<template>
  <div class="o-accordion-item">
    <h2 class="o-accordion-header">
      <button class="o-accordion-button" :class="{ collapsed: !isOpen }" type="button" @click="toggleAccordion">
        <slot name="head"></slot>
      </button>
    </h2>
    <div class="o-accordion-collapse" :class="{ show: isOpen }" :data-bs-parent="`#${accordionId}`" ref="collapse">
      <div class="o-accordion-body transition">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import { GenerateIdForComponentsService } from '../../services/generateIdForComponents.service';

const generateIdForComponentsService = new GenerateIdForComponentsService();

export default defineComponent({
  name: 'AppAccordionItem',
  props: ['accordionId', 'initOpen'],
  emits: ['open'],
  setup(props, { emit }) {
    const id = generateIdForComponentsService.run('accordion_item');
    const collapse: Ref<HTMLElement | null> = ref(null);
    const isOpen = ref(props.initOpen || false);

    const toggleAccordion = (event: Event) => {
      event.stopPropagation();
      isOpen.value = !isOpen.value;

      if (isOpen.value) {
        emit('open');
      }
    };

    return {
      id,
      collapse,
      isOpen,
      toggleAccordion,
    };
  },
});
</script>

<style scoped>
.o-accordion-collapse {
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
  max-height: 0;
}

.o-accordion-collapse.show {
  max-height: 10000px;
  transition: max-height 0.5s cubic-bezier(1, 0, 1, 0);
  overflow-y: visible;
}

.o-accordion-item {
  background: var(--color-light);
  box-shadow: var(--box-shadow-1);
  border-radius: var(--border-radius-accordion);
}

.o-accordion-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: inherit;
  margin-bottom: 0;
}
.o-accordion-button::after {
  gap: 10px;
  width: 0.5rem;
  height: 0.5rem;
  margin-left: auto;
  content: '';
  border-style: solid;
  border-width: 0px 2px 2px 0;
  border-color: var(--color-gray-600);
  transform: rotate(45deg);
  transition: transform 600ms;
}

.o-accordion-button {
  gap: 10px;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-normal);
  color: var(--color-gray-900);
  text-align: left;
  padding: var(--padding-3);
  transition: padding 600ms;
}
.o-accordion-button:not(.collapsed)::after {
  transform: rotate(225deg);
  border-color: var(--color-primary);
}
.o-accordion-button:not(.collapsed) {
  padding: var(--padding-6);
}
.o-accordion-button:focus {
  box-shadow: 0px 0px 3px 2px rgba(var(--color-primary-rgb), var(--opacity-color-50));
  border-radius: inherit;
  background-color: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  color: var(--color-primary);
}
.o-accordion-body {
  padding: var(--padding-3);
}
</style>
