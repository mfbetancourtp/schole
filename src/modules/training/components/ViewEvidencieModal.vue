<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <iframe :src="urlFile" style="width: 100%; height: 700px" frameborder="0"></iframe>
    </template>
    <template v-slot:actions>
      <AppButton @click="deleteFile()" label="Eliminar" variant="primary" outlined></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

export default defineComponent({
  name: 'ViewEvidenceUrl',
  components: { AppFormModal, AppButton },

  props: ['urlFile', 'titleModal'],
  emits: ['delete'],

  setup(props, { emit }) {
    const title = props.titleModal ?? '';
    onMounted(async () => {});

    const deleteFile = async () => {
      emit('delete');
    };

    return {
      title,
      deleteFile,
    };
  },
});
</script>

<style scoped></style>
