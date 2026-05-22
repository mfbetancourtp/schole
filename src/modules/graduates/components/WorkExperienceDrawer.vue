<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader
        :variant="data ? 'edit' : 'create'"
        :icon="data ? 'edit' : 'plus'"
        :title="data ? 'Editar experiencia laboral' : 'Agregar experiencia laboral'"
        subtitle="Detalla tu trayectoria y funciones en cada cargo"
      />
    </template>

    <template #body>
      <div class="drawer-section">
        <WorkExperienceForm v-if="isVisible" ref="formRef" :data="data" @save="onFormSave" />
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
          <AppButton variant="primary" nativeType="button" :disabled="saving" @click="submit">
            {{ data ? 'Guardar cambios' : 'Agregar experiencia' }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import WorkExperienceForm from './WorkExperienceForm.vue';
import type { WorkExperience } from '../dtos/graduateProfile.dto';

export default defineComponent({
  name: 'WorkExperienceDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, WorkExperienceForm },
  props: {
    isVisible: { type: Boolean, required: true },
    data: { type: Object as PropType<WorkExperience | null>, default: null },
  },
  emits: ['update:isVisible', 'save'],
  setup(props, { emit }) {
    const saving = ref(false);
    const formRef = ref<{ submitForm: () => Promise<void> | void } | null>(null);

    const submit = async () => {
      if (saving.value) return;
      saving.value = true;
      try {
        await formRef.value?.submitForm();
      } finally {
        saving.value = false;
      }
    };

    const onFormSave = (saved: WorkExperience) => {
      emit('save', saved);
      emit('update:isVisible', false);
    };

    return { saving, formRef, submit, onFormSave };
  },
});
</script>

<style scoped>
.drawer-section {
  padding: 20px;
}
.req-note {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
