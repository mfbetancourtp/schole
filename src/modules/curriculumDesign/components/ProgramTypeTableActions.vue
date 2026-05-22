<template>
  <div class="d-flex gap-2 justify-content-center">
    <AppButton icon="pencil-alt" outlined @click="$emit('edit', item)" v-tooltip="'Editar'"></AppButton>
    <AppButton icon="sitemap" outlined variant="info" @click="$emit('structure', item)" v-tooltip="'Estructura'"></AppButton>
    <AppButton icon="trash" outlined variant="danger" @click="$emit('remove', item)" v-tooltip="'Eliminar'"></AppButton>
  </div>
</template>

<script setup lang="ts">
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { ProgramTypeDto } from '../dtos/ProgramTypeDto';

defineProps<{
  item: ProgramTypeDto;
}>();

defineEmits<{
  (e: 'edit', item: ProgramTypeDto): void;
  (e: 'remove', item: ProgramTypeDto): void;
  (e: 'structure', item: ProgramTypeDto): void;
}>();
</script>
