<template>
  <nav aria-label="o-breadcrumb" class="o-breadcrumb">
    <ol class="o-breadcrumb-content">
      <li
        class="o-breadcrumb-item"
        :class="{ active: index === routes.length - 1 }"
        v-for="(route, index) in routes"
        :key="index"
      >
        <router-link v-if="route.url" :to="route.url">{{
          t(route.name)
        }}</router-link>
        <template v-else>{{ t(route.name) }}</template>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'AppBreadCrumbs',

  props: {
    routes: {
      type: Array as PropType<any[]>,
      default: function () {
        return [];
      },
    },
  },

  setup() {
    const { t } = useI18n();

    return {
      t,
    };
  },
});
</script>
<style scoped>
.o-breadcrumb-item > a {
  text-decoration: none;
  /* color: var(--color-primary); */
}
.o-breadcrumb {
  display: flex;
  align-items: center;
}
.o-breadcrumb-content {
  display: flex;
  flex-wrap: wrap;
  padding: 0 0;
  margin: 0;
  padding-bottom: var(--padding-1);
  font-weight: 100;
}
.o-breadcrumb-item + .o-breadcrumb-item::before {
  float: left;
  padding-right: 0.5rem;
  color: rgba(var(--color-gray-600-rgb), var(--opacity-color-100));
  content: var(--bs-breadcrumb-divider, '/');
}
.o-breadcrumb-item.active {
  color: rgba(var(--color-gray-600-rgb), var(--opacity-color-100));
}

.o-breadcrumb-item + .o-breadcrumb-item {
  padding-left: 0.5rem;
}
</style>
