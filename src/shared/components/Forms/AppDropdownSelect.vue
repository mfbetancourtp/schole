<template>
  <div class="app-dropdown-container" :class="{ 'bg-white': openDropdown }" @click.stop="openDropdown = !openDropdown">
    <div class="app-dropdown">
      <span>{{ itemName }}</span>

      <AppGetIcon :class="[{ 'open-dropdown': openDropdown }]" name="arrow-right" />
    </div>

    <div :class="{ 'opened-dropdown': openDropdown }" class="radio-button-container">
      <template v-for="(item, index) in options" :key="index">
        <hr class="dropdown-divider" />

        <div class="radio-button">
          <input type="radio" class="radio-button-input" :id="item[reduce]" :value="item[reduce]" v-model="value" name="radio-group" />

          <label class="radio-button-label" :for="item[reduce]">
            <span class="radio-button-custom"></span>
            {{ item[label] }}
          </label>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref, watch } from 'vue';

import AppGetIcon from '../AppGetIcon.vue';

export default defineComponent({
  name: 'AppDropdownSelect',

  components: { AppGetIcon },

  props: {
    itemName: {
      type: String,
      required: true,
    },
    options: {
      type: Array as PropType<any[]>,
      required: true,
    },
    label: {
      type: String,
      default: 'name',
    },
    reduce: {
      type: String,
      default: 'id',
    },

    modelValue: {},
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const value = ref(props.modelValue);

    const openDropdown: Ref<boolean> = ref(false);

    watch(value, (newValue) => emit('update:modelValue', newValue));

    return {
      value,

      openDropdown,
    };
  },
});
</script>

<style scoped>
.app-dropdown-container {
  padding: var(--padding-1);

  background-color: transparent;
  border-radius: var(--border-radius-1);
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.app-dropdown-container:hover {
  background-color: var(--color-light);
}

.app-dropdown {
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-weight: var(--font-weight-normal);
  color: var(--color-gray-900);
  text-align: inherit;
  white-space: nowrap;
}

.app-dropdown :deep(.container-icon) {
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}
.app-dropdown :deep(.open-dropdown) {
  transform: rotate(180deg);
}

.radio-button-container {
  display: none;
}
.radio-button-container .dropdown-divider {
  background: linear-gradient(to right, transparent, #666, transparent);
  height: 1px;
  border: none;
  margin: 0.1rem 0;
}
.radio-button-container .radio-button {
  display: inline-block;
  position: relative;
  cursor: pointer;
  width: 100%;

  padding: var(--padding-1);
}
.radio-button-container .radio-button-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.radio-button-container .radio-button-label {
  display: inline-block;
  position: relative;
  padding-left: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.radio-button-container .radio-button-custom {
  position: absolute;
  top: 20%;
  left: 0;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid #555;
  transition: all 0.3s ease;
}
.radio-button-input:checked + .radio-button-label .radio-button-custom {
  background-color: var(--color-primary);
  border-color: transparent;
}
.radio-button-input:checked + .radio-button-label {
  color: var(--color-primary);
}
.radio-button-label:hover .radio-button-custom {
  border-color: var(--color-primary);
}

.opened-dropdown {
  display: inline;
}
</style>
