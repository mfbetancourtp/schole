<template>
  <div class="button-container">
    <AppButton variant="secondary" @click="openDrawer" :icon="icon" v-tooltip="title" outlined />

    <span v-if="numberComments" class="badge">{{ numberComments }}</span>

    <ChatDrawer
      :isVisible="showChatDrawer"
      :loadingComments="loadingComments"
      :comments="comments"
      :planningWeekWithDetails="planningWeekWithDetails"
      @update:isVisible="closeDrawer"
      @update-comments="updateComments"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ChatDrawer from '../components/ChatDrawer.vue';

export default defineComponent({
  name: 'ButtonDrawerChat',
  components: { AppButton, ChatDrawer },

  emits: ['update:isVisible', 'updateComments', 'click'],
  props: {
    showChatDrawer: {
      type: Boolean,
      required: true,
    },
    numberComments: {
      type: String,
      default: '',
    },
    loadingComments: {
      type: Boolean,
      default: false,
    },
    comments: {
      type: Array,
      default: () => [],
    },
    planningWeekWithDetails: {
      type: Object,
      default: null,
    },
  },

  setup(props, { emit }) {
    const icon = 'comments';
    const title = 'Abrir chat';

    const openDrawer = () => {
      emit('click'); // Para cargar datos
      emit('update:isVisible', true); // Abre el drawer
    };

    const closeDrawer = (val: boolean) => {
      emit('update:isVisible', val); // Cierra el drawer
    };

    const updateComments = () => {
      emit('updateComments');
    };

    return {
      icon: 'comments',
      title,
      openDrawer,
      closeDrawer,
      updateComments,
    };
  },
});
</script>

<style scoped>
.button-container {
  position: relative;
  display: inline-block;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 60%;
  min-width: 18px;
  text-align: center;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
