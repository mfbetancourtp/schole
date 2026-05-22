<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader
        :variant="data ? 'edit' : 'create'"
        :icon="data ? 'edit' : 'plus'"
        :title="data ? 'Editar formación' : 'Agregar formación'"
        subtitle="Registra cursos, certificaciones y estudios adicionales"
      />
    </template>

    <template #body>
      <div class="drawer-section">
        <AdditionalEducationForm v-if="isVisible" ref="formRef" :data="data" @save="onFormSave" />
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
          <AppButton variant="primary" nativeType="button" :disabled="saving" @click="submit">
            {{ data ? 'Guardar cambios' : 'Agregar formación' }}
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
import AdditionalEducationForm from './AdditionalEducationForm.vue';
import type { AdditionalEducation } from '../dtos/graduateProfile.dto';

export default defineComponent({
  name: 'AdditionalEducationDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppButton,
    AdditionalEducationForm,
  },
  props: {
    isVisible: { type: Boolean, required: true },
    data: {
      type: Object as PropType<AdditionalEducation | null>,
      default: null,
    },
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

    const onFormSave = (saved: AdditionalEducation) => {
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
