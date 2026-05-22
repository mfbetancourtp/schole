<template>
  <o-pagination
    list-class="pagination"
    link-class="o-page-link"
    link-current-class="active"
    :per-page="perPage"
    :total="total"
    :current="current"
    @update:current="updateCurrentPage"
    order="rigth"
    link-disabled-class="disabled"
  >
    <template #default="props">
      <o-pagination-button :page="props.page" tag="button" :disabled="loading">
        {{ props.page.number }}
      </o-pagination-button>
    </template>

    <template #next="props">
      <o-pagination-button :page="props.page" tag="button" :disabled="loading">
        <AppIcon icon="chevron-right"></AppIcon>
      </o-pagination-button>
    </template>

    <template #previous="props">
      <o-pagination-button :page="props.page" :disabled="loading">
        <AppIcon icon="chevron-left"></AppIcon>
      </o-pagination-button>
    </template>
  </o-pagination>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, watch } from 'vue';
import AppIcon from './AppIcon.vue';

export default defineComponent({
  name: 'AppPagination',
  components: { AppIcon },
  props: ['current', 'total', 'perPage', 'loading'],
  emits: ['update:current'],
  setup(props, { emit }) {
    const updateCurrentPage = (value: number) => {
      emit('update:current', value);
    };

    const styleList = () => {
      nextTick(() => {
        const contentPagination = document.querySelector('.pagination');

        if (contentPagination) {
          const items = contentPagination.getElementsByTagName('li');
          const itemsList = Array.prototype.slice.call(items);
          itemsList.forEach((item, index) => {
            const isActive = item.querySelector('.active') ?? false;

            let classList = 'o-page-item';

            if (isActive) {
              classList += ' active';
            }

            item.classList = classList;
          });
        }
      });
    };

    onMounted(() => {
      setTimeout(() => {
        styleList();
      }, 500);
    });

    watch(
      () => props.current,
      () => {
        styleList();
      }
    );

    return {
      /*current,
      total,
      perPage,*/
      updateCurrentPage,
    };
  },
});
</script>

<style scoped>
:deep(.o-pag__ellipsis) {
  justify-content: center;
  text-align: center;
  pointer-events: none;
  margin: var(--oruga-pagination-link-margin, 0.25rem);
  color: var(--oruga-pagination-ellipsis-color, #b5b5b5);
}

:deep(button:disabled) {
  pointer-events: none;
  opacity: 0.4;
}
.o-page-link {
  display: flex;
  border-radius: calc(var(--border-radius-1) + 0.2rem);
  color: var(--color-primary);
}

.active {
  z-index: 3;
  color: var(--color-light);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
