<template>
  <div class="button-container">
    <AppButton variant="secondary" @click="openChat()" :icon="icon" v-tooltip="title" outlined />

    <!-- Badge para el número de comentarios -->
    <span v-if="numberComments" class="badge">{{ numberComments }}</span>

    <AppModal v-model="chatModal" :size="'lg'">
      <AppFormModal v-if="chatModal" :title="'Comentarios'">
        <template v-slot:content>
          <AppChat :comments-res="comments" :row-table="rowTable" :row-id="rowId" :modal="true" @new-comment="newComment" />
        </template>
      </AppFormModal>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import AppChat from '../AppChat.vue';
import AppButton from './AppButton.vue';
import AppModal from '../Modal/AppModal.vue';
import AppFormModal from '../Modal/AppFormModal.vue';

export default defineComponent({
  name: 'AppButtonChat',
  components: { AppButton, AppChat, AppModal, AppFormModal },

  emits: ['newComment'],
  props: {
    comments: {
      type: Array as PropType<any[]>,
    },
    numberComments: {
      type: String,
      default: '',
    },
    rowTable: {
      type: String,
      required: true,
    },
    rowId: {
      type: Number,
      required: true,
    },
  },

  setup(props, { emit }) {
    const icon = 'comments';
    const title = 'Abrir chat';
    const chatModal = ref(false);

    const openChat = () => {
      chatModal.value = true;
    };

    const newComment = async () => {
      emit('newComment');
    };

    return {
      icon,
      title,

      chatModal,

      newComment,
      openChat,
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
