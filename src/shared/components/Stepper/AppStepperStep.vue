<template>
  <div class="step-item">
    <button class="step-button text-center" :class="{ done: step <= currentStep }" type="button" @click="changeStep">
      {{ step }}
    </button>
    <div class="step-title">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'AppStepperStep',
  props: ['step'],
  computed: {
    currentStep() {
      const parent: any = this.$parent;

      return parent.step;
    },
  },
  methods: {
    changeStep() {
      const parent: any = this.$parent;

      parent.changeStep(this.step);
      parent.changeStep(this.step);
    },
  },
});
</script>

<style scoped>
.step-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: var(--bs-gray-300);
  transition: .4s;
}

.step-button[aria-expanded="true"] {
  width: 60px;
  height: 60px;
  background-color: var(--bs-primary);
  color: #fff;
}

.step-item {
  z-index: 10;
  text-align: center;
}

.done {
  background-color: var(--bs-primary);
  color: #fff;
}
</style>