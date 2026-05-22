<template>
  <AppFormModal :title="`${deleteText} ${entity}`">
    <template v-slot:content>
      <div class="d-flex align-items-center gap-2">
        <AppIcon icon="exclamation-circle" size="3x" class="text-warning"></AppIcon>
        <span class="tw-font-light tw-text-lg">{{ t('core.deleteDescription') }}</span>
      </div>
    </template>
    <template v-slot:actions>
      <AppButton variant="primary" @click="confirmDeleteModal">
        {{ t(deleteText) }}
      </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useI18n} from 'vue-i18n';

import AppFormModal from './AppFormModal.vue';
import AppIcon from '../AppIcon.vue';
import AppButton from '../Buttons/AppButton.vue';

export default defineComponent({
  name: 'AppConfirmDeleteModal',
  components: {AppButton, AppIcon, AppFormModal},
  props: ['entity'],
  emits: ['confirmDelete'],
  setup(props, {emit}) {
    const {t} = useI18n();
    const deleteText = 'core.delete';

    const confirmDeleteModal = async () => {
      emit('confirmDelete');
    };

    return {
      t,
      deleteText,
      confirmDeleteModal,
    };
  },
});
</script>

<style scoped>

</style>