<template>
  <div class="container-info mb-2 mt-2">
    <div class="table-responsive d-flex">
      <div class="information w-100" v-for="(card, index) in cardsDataProp" :key="index">
        <AppGetIcon class="form-icon__graph" :name="card.icon" :fillColor="card.fillColor"></AppGetIcon>
        <div class="card-content" :style="card.border">
          <span>{{ card.title }}</span>
          <h6>{{ card.data }}</h6>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

export default defineComponent({
  name: 'TableDashboard',
  components: {
    AppGetIcon,
  },

  props: {
    cardsDataProp: {
      type: Array,
      required: true,
    },
  },
  setup() {},
});
</script>
<style scoped>
.container-info {
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 4px 10px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  gap: 10px;
}

.information {
  display: flex;
  padding-right: 10px;
  /* border-right: 1px solid #9ea1a5; */
  gap: 10px;
  align-items: center;
}

.form-icon__graph {
  width: 50px;
  height: 50px;
  border-radius: 100%;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.25);
  padding: 10px;
}

.card-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  font-weight: 800;
  padding-right: 10px;
  width: 60%;
  font-size: 12px;
}
</style>
