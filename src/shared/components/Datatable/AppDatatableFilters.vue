<template>
  <o-dropdown aria-role="menu" root-class="dropdown" menu-class="dropdown-menu-filter" menu-active-class="show" :close-on-click="false" :can-close="false" ac ref="dropdown">
    <template #trigger="{}">
      <AppButton variant="primary" outlined v-tooltip="'core.table.showFilter'" icon="filter"></AppButton>
    </template>

    <div>
      <span class="fw-6 fw-light">Filtros</span>
      <slot></slot>

      <div class="d-flex gap-2">
        <AppButton variant="primary" expanded @click="filterData"> Aplicar </AppButton>

        <AppButton variant="primary" outlined expanded @click="close"> Cancelar </AppButton>
      </div>
    </div>
  </o-dropdown>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppButton from '../Buttons/AppButton.vue';

export default defineComponent({
  name: 'AppDatatableFilters',
  components: { AppButton },
  emits: ['filter'],
  setup(props, { emit }) {
    const dropdown = ref();

    const filterData = () => {
      emit('filter');
      close();
    };

    const close = () => {
      dropdown.value.isActive = false;
    };

    return {
      dropdown,
      filterData,
      close,
    };
  },
});
</script>

<style scoped>
:deep(.dropdown) {
  position: relative;
}

:deep(.dropdown-menu-filter) {
  display: none;
  position: absolute;
  left: calc(-400px + 50px);
  top: calc(10px);
  background-color: #f9f9f9;
  min-width: 350px;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
  padding: 17px 24px;
  z-index: 50;

  /* display: flex;
    flex-direction: column;
    background: #ffffff;
    box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
    border-radius: 4px;
    padding: 17px 24px;
    width: 100%;
    gap: 12px;
    justify-content: space-between; */
}

:deep(.dropdown-menu-filter.show) {
  display: block;
}
.dropdown-menu-filter {
  display: none !important;
}

@media screen and (min-width: 320px) and (max-width: 768px) {
  :deep(.dropdown-menu-filter) {
    width: var(--width-responsive-dropdown-menu-filter);
    min-width: var(--min-width-responsive-dropdown-menu-filter);
    left: var(--left-responsive-dropdown-menu-filter);
    position: var(--position-responsive-dropdown-menu-filter);
    top: 250px;
  }
}
</style>
