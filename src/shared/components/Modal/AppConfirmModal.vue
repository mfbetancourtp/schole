<template>
  <AppFormModal :title="`${textButton} ${entity}`">
    <template v-slot:content>
      <div class="d-flex align-items-center gap-2">
        <AppIcon icon="exclamation-circle" size="3x" class="text-warning"></AppIcon>
        <span class="tw-font-light tw-text-lg">{{ t(textContent) }}</span>
      </div>
    </template>
    <template v-slot:actions>
      <AppButton variant="primary" @click="confirmDeleteModal">
        {{ t(textButton) }}
      </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import AppFormModal from './AppFormModal.vue';
import AppIcon from '../AppIcon.vue';
import AppButton from '../Buttons/AppButton.vue';

export default defineComponent({
  name: 'AppConfirmModal',
  components: { AppButton, AppIcon, AppFormModal },
  props: {
    entity: {
      type: String,
    },
    textContent: {
      type: String,
      default: 'core.deleteDescription',
    },
    textButton: {
      type: String,
      default: 'core.save',
    },
  },
  emits: ['confirmDelete'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const confirmDeleteModal = async () => {
      emit('confirmDelete');
    };

    return {
      t,
      confirmDeleteModal,
    };
  },
});
</script>

<style scoped></style>
