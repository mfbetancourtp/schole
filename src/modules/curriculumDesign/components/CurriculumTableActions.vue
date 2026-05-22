<template>
  <div class="d-flex gap-2 justify-content-center">
    <AppButton icon="pencil-alt" outlined @click="$emit('edit', item)" v-tooltip="'Editar'"></AppButton>
    <AppButton icon="trash" outlined variant="danger" @click="$emit('remove', item)" v-tooltip="'Eliminar'"></AppButton>
  </div>
</template>

<script setup lang="ts">
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { CurriculumFormatDto } from '../dtos/CurriculumFormatDto';

defineProps<{
  item: CurriculumFormatDto;
}>();

defineEmits<{
  (e: 'edit', item: CurriculumFormatDto): void;
  (e: 'remove', item: CurriculumFormatDto): void;
}>();
</script>

<style scoped>
/* Estilos específicos si son necesarios */
</style>
