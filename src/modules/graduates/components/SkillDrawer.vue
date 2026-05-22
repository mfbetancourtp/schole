<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader
        :variant="data ? 'edit' : 'create'"
        :icon="data ? 'edit' : 'plus'"
        :title="data ? 'Editar habilidad' : 'Agregar habilidad'"
        subtitle="Indica tu área de dominio y nivel de competencia"
      />
    </template>

    <template #body>
      <div class="drawer-section">
        <SkillForm v-if="isVisible" ref="formRef" :data="data" :institution-id="institutionId" @save="onFormSave" />
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
          <AppButton variant="primary" nativeType="button" :disabled="saving" @click="submit">
            {{ data ? 'Guardar cambios' : 'Agregar habilidad' }}
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
import SkillForm from './SkillForm.vue';
import type { GraduateSkillDto } from '../dtos/graduateProfile.dto';

export default defineComponent({
  name: 'SkillDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, SkillForm },
  props: {
    isVisible: { type: Boolean, required: true },
    data: { type: Object as PropType<GraduateSkillDto | null>, default: null },
    institutionId: { type: Number as PropType<number | null>, default: null },
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

    const onFormSave = (saved: any) => {
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
