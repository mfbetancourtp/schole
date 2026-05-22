<template>
  <div class="card card-hover tw-cursor-pointer">
    <label class="form-check-label" :for="`cardFilterCheck-${customId}`">
      <div class="container-img d-flex">
        <img :src="thumbnail" class="card-img-top img-filters" :alt="name">
      </div>
      <div class="card-body d-flex justify-content-center py-2">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" :id="`cardFilterCheck-${customId}`"
                 v-model="check">
          {{ name }}
        </div>
      </div>
    </label>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'CardFilter',
  props: ['thumbnail', 'name', 'id', 'modelValue'],
  data() {
    return {
      check: this.modelValue,
      customId: this.id,
    };
  },
  mounted() {
    this.customId = `${this.customId}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  },
  watch: {
    modelValue(value) {
      this.check = value;
    },
    check(value) {
      this.$emit('update:modelValue', value);
    },
  },
});
</script>

<style scoped>
.img-filters {
  max-height: 190px;
  object-fit: contain;
}

.container-img {
  height: 190px;
}
</style>