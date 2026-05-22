<template>
  <div class="selectableCard" :class="{ 'selectableCard--selected': selected }" @click="toggleCard">
    <div class="selectableCard__checkbox" @click.stop="toggleCard">
      <input class="form-check-input" type="checkbox" :checked="selected" readonly />
    </div>

    <div class="selectableCard__content">
      <slot />
    </div>

    <div v-if="selected" class="selectableCard__check">
      <AppIcon icon="check" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../AppIcon.vue';

export default defineComponent({
  name: 'AppSelectableCard',
  components: { AppIcon },

  props: {
    selected: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['toggle'],

  setup(_, { emit }) {
    const toggleCard = () => {
      emit('toggle');
    };

    return {
      toggleCard,
    };
  },
});
</script>
<style scoped>
.selectableCard {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.selectableCard:hover {
  background: #f9fafb;
}

.selectableCard--selected {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 2px #bfdbfe;
}

.selectableCard__checkbox {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
}

.selectableCard__content {
  flex: 1;
}

.selectableCard__check {
  margin-left: auto;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
