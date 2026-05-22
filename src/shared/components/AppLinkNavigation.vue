<template>
  <router-link
    :to="link"
    class="o-nav-link"
    :class="{
      'o-active': isActive,
      active: isActive,
    }"
  >
    <AppIcon v-if="iconPage" class="me-2" :icon="icon"></AppIcon>
    {{ t(titlePage) }}
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import AppIcon from './AppIcon.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AppLinkNavigation',
  props: ['title', 'icon', 'link'],
  components: { AppIcon },
  setup(props) {
    const { t } = useI18n();
    const route = useRoute();

    const isActive = computed(() => {
      return route.fullPath.includes(props.link);
    });

    return {
      titlePage: props.title,
      iconPage: props.icon,
      isActive,
      t,
    };
  },
});
</script>

<style scoped>
.o-nav-link {
  display: block;
  text-decoration: none;
  color: rgba(var(--color-gray-600-rgb), var(--opacity-color-100));
  padding: var(--padding-2);
  width: 100%;
}
.o-active {
  color: var(--color-dark);
  font-weight: var(--font-weight-semibold);
}
</style>
