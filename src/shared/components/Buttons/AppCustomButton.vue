<template>
  <div :class="label ? 'AppCustomButton__container_label' : 'AppCustomButton__container'">
    <template v-if="label">
      {{ t(label) }}
    </template>
    <template v-else-if="iconName">
      <AppGetIcon :name="iconName"></AppGetIcon>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import AppGetIcon from '../AppGetIcon.vue';

export default defineComponent({
  name: 'AppCustomButton',
  components: { AppGetIcon },
  props: {
    label: {
      type: String,
      required: false,
      default: '',
    },
    iconName: {
      type: String,
      required: false,
      default: '',
    },
    fillColor: {
      type: String,
      default: 'none',
      /**
       * Color de relleno del icono. Valor por defecto: "none".
       *
       * @type {string}
       */
    },
    strokeColor: {
      type: String,
      default: 'none',
    },
    /**
     * Color de los trazos del icono. Valor por defecto: "none".
     *
     * @type {string}
     */
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
.AppCustomButton__container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-secondary);
  background-color: transparent;
  cursor: pointer;
}

.AppCustomButton__container_label {
  height: 27px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;

  border-radius: 4px;
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
  cursor: pointer;
  padding: 4px 8px;
}

.AppCustomButton__container_label:hover {
  color: var(--color-light);
  background-color: var(--color-secondary);
}

.AppCustomButton__container:hover {
  color: var(--color-light);
  background-color: var(--color-secondary);
  border-radius: 50%;
}
</style>
