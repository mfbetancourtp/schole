<template>
  <o-button
    :tag="tag"
    v-bind="$props"
    :class="{
      'o-btn--icon': !!icon && !label,
      disabled: loading,
      'o-btn--link': !!link,
    }"
    :native-type="nativeType"
  >
    <!-- <div class="spinner-border spinner-border-sm me-2" role="status" v-if="loading && nativeType == 'submit'">
      <span class="visually-hidden">Loading...</span>
    </div> -->

    <!-- <AppIcon v-if="iconLeft" :icon="iconLeft" class="me-2"></AppIcon> -->

    <slot>
      <template v-if="label">
        {{ t(label) }}
      </template>

      <template v-else-if="icon">
        <AppIcon :icon="icon" :style="!outlined ? 'color: white;' : ''"></AppIcon>
      </template>
    </slot>
    <!--    <AppIcon v-if="iconRight" :icon="iconRight" class="ml-2"></AppIcon>-->
  </o-button>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '../AppIcon.vue';

import ButtonLoadingStore from '../../stores/buttonLoading.store';
import { PropsButton } from './props.button';

export default defineComponent({
  name: 'AppButton',
  components: { AppIcon },
  props: PropsButton,
  setup(props, { attrs }) {
    const store = inject('store', ButtonLoadingStore.state);

    const { t } = useI18n();
    const defaultVariantClass = 'btn-';
    const variantClass = ref(defaultVariantClass);
    const outlinedClass = ref('btn-outline-');
    const tag = ref('button');
    const loading = computed(() => store.loading);

    const nativeType = props.nativeType ? props.nativeType : attrs.onClick ? 'button' : 'submit';

    if (props.outlined) {
      variantClass.value = '';
    }

    watch(
      () => props.outlined,
      (value) => {
        if (value) {
          variantClass.value = '';
        } else {
          variantClass.value = defaultVariantClass;
        }
      }
    );

    onMounted(() => {
      if (props.to) {
        tag.value = 'router-link';
      }

      if (props.href) {
        tag.value = 'a';
      }
    });

    return {
      variantClass,
      outlinedClass,
      t,
      tag,
      loading,
      nativeType,
    };
  },
});
</script>
<style scoped>
.o-btn {
  border-color: transparent;
  padding: var(--padding-button);
  border-radius: var(--border-radius-1);
}

.o-btn--link.o-btn {
  background-color: transparent;
  text-decoration: underline;
  color: var(--color-primary);
  padding: unset;
  height: auto;
}
.o-btn--link.o-btn:hover {
  color: var(--color-secondary);
  background-color: unset;
}

.o-btn--ghost {
  color: var(--color-dark);
  background-color: transparent;
  border-color: var(--border-color-ghost);
}
.o-btn--ghost:hover {
  opacity: var(--btn-hover-opacity);
}

.o-btn--primary,
.o-btn--outlined-primary:hover {
  color: var(--color-light);
  background-color: var(--color-primary);
}
.o-btn--primary:hover {
  opacity: var(--btn-hover-opacity);
}
.o-btn--outlined-primary {
  color: var(--color-primary);
  background-color: transparent;
  border-color: currentColor;
}

.o-btn--secondary,
.o-btn--outlined-secondary:hover {
  color: var(--color-light);
  background-color: var(--color-secondary);
}
.o-btn--secondary:hover {
  opacity: var(--btn-hover-opacity);
}
.o-btn--outlined-secondary {
  color: var(--color-secondary);
  background-color: transparent;
  border-color: currentColor;
}

.o-btn--info {
  color: var(--color-light);
  background-color: var(--color-info);
}
.o-btn--outlined-info {
  color: var(--color-info);
  background-color: transparent;
  border-color: currentColor;
}
.o-btn--success {
  color: var(--color-light);
  background-color: var(--color-success);
}
.o-btn--outlined-success {
  color: var(--color-success);
  background-color: transparent;
  border-color: currentColor;
}
.o-btn--warning {
  color: var(--color-light);
  background-color: var(--color-warning);
}
.o-btn--outlined-warning {
  color: var(--color-warning);
  background-color: transparent;
  border-color: currentColor;
}
.o-btn--danger {
  color: var(--color-light);
  background-color: var(--color-danger);
}
.o-btn--outlined-danger {
  color: var(--color-danger);
  background-color: transparent;
  border-color: currentColor;
}
.o-btn--light {
  color: var(--color-light);
  background-color: var(--color-light);
}
.o-btn--outlined-light {
  color: var(--color-light);
  background-color: transparent;
  border-color: currentColor;
}
.o-btn--light-2 {
  color: var(--color-dark);
  background-color: var(--color-light-2);
  box-shadow: 0 0 0 0 #0003, 0 0 0 0 #00000024, 0 0 0 0 #0000001f;
}
.o-btn--nav {
  color: rgba(var(--color-gray-600-rgb), var(--opacity-color-80));
  background-color: transparent;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-1);
}
.o-btn--icon {
  width: var(--width-btn-icon);
  height: var(--height-btn-icon);
  border-radius: unset;
  color: var(--color-primary);
  border-color: unset;
  border: unset;
  /* padding: 6px 10px; */
}
.o-btn--icon:hover {
  width: var(--width-btn-icon);
  height: var(--height-btn-icon);
  border-radius: 50px;
  color: var(--color-light);
  background-color: var(--color-secondary);
  /* padding: 6px 10px; */
}
.o-btn--light-2:hover {
  background-color: rgba(var(--color-gray-600-rgb), var(--opacity-color-20));
}
.o-btn__label {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-semibold);
}
.o-btn--info:hover {
  color: var(--color-light);
  opacity: var(--btn-hover-opacity);
  background-color: var(--color-info);
}
.o-btn--success:hover {
  color: var(--color-light);
  opacity: var(--btn-hover-opacity);
  background-color: var(--color-success);
}
.o-btn--warning:hover {
  color: var(--color-dark);
  opacity: var(--btn-hover-opacity);
  background-color: var(--color-warning);
}
.o-btn--danger:hover {
  color: var(--color-light);
  opacity: var(--btn-hover-opacity);
  background-color: var(--color-danger);
}
.o-btn--light:hover {
  color: var(--color-light);
  /*background-color:var(--color-light);*/
  opacity: var(--btn-hover-opacity);
}
.active {
  color: var(--color-dark);
  background-color: rgba(var(--color-gray-700-rgb), var(--opacity-color-10));
}
.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.7;
}
.o-btn > span.o-btn__wrapper {
  margin: 5px;
}
</style>
