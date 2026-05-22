<template>
  <div class="accordion" :id="id">
    <!--        <progress id="progress" value=0 max=100></progress>-->
    <div class="d-flex flex-md-row justify-content-around mb-3 gap-4 gap-md-2 position-relative">
      <slot name="header"></slot>
    </div>

    <slot name="items"></slot>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {GenerateIdForComponentsService} from '../../services/generateIdForComponents.service';

const generateIdForComponentsService = new GenerateIdForComponentsService();

export default defineComponent({
  name: 'AppStepper',
  props: ['modelValue'],
  data() {
    return {
      id: '',
      step: this.modelValue,
    };
  },
  watch: {
    modelValue(value) {
      this.step = value;
    },
  },
  mounted() {
    this.id = generateIdForComponentsService.run('stepper');
    // this.step = this.modelValue;
  },
  methods: {
    changeStep(step: number) {
      this.$emit('update:modelValue', parseInt(this.step));
      this.step = step;
    },
  },
});
</script>

<style scoped>
</style>