<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader
        :variant="data ? 'edit' : 'create'"
        :icon="data ? 'edit' : 'plus'"
        :title="data ? 'Editar idioma' : 'Agregar idioma'"
        subtitle="Indica tu nivel de lectura, escritura y conversación"
      />
    </template>

    <template #body>
      <div class="drawer-section">
        <LanguageForm v-if="isVisible" ref="formRef" :data="data" :used-language-ids="usedLanguageIds" @save="onFormSave" />
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
          <AppButton variant="primary" nativeType="button" :disabled="saving" @click="submit">
            {{ data ? 'Guardar cambios' : 'Agregar idioma' }}
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
import LanguageForm from './LanguageForm.vue';
import type { LanguageDto } from '../dtos/language.dto';

export default defineComponent({
  name: 'LanguageDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, LanguageForm },
  props: {
    isVisible: { type: Boolean, required: true },
    data: { type: Object as PropType<LanguageDto | null>, default: null },
    usedLanguageIds: { type: Array as PropType<number[]>, default: () => [] },
  },
  emits: ['update:isVisible', 'save'],
  setup(props, { emit }) {
    const saving = ref(false);
    const formRef = ref<{ submitForm: () => void } | null>(null);

    const submit = () => {
      formRef.value?.submitForm();
    };

    const onFormSave = (payload: any) => {
      emit('save', payload);
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
