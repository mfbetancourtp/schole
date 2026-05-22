<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader variant="edit" icon="user" title="Información personal" subtitle="Datos básicos, contacto y enlaces profesionales" />
    </template>

    <template #body>
      <div class="drawer-section">
        <PersonalInfoForm v-if="isVisible" ref="formRef" :data="data" :personal-info="personalInfo" @save="onFormSave" />
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
          <AppButton variant="primary" nativeType="button" @click="submit">Guardar cambios</AppButton>
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
import PersonalInfoForm from './PersonalInfoForm.vue';
import type { GraduateProfileDto, PersonalInformation } from '../dtos/graduateProfile.dto';

export default defineComponent({
  name: 'PersonalInfoDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, PersonalInfoForm },
  props: {
    isVisible: { type: Boolean, required: true },
    data: {
      type: Object as PropType<GraduateProfileDto | null>,
      default: null,
    },
    personalInfo: {
      type: Object as PropType<PersonalInformation | null>,
      default: null,
    },
  },
  emits: ['update:isVisible', 'save'],
  setup(props, { emit }) {
    const formRef = ref<{ submitForm: () => void } | null>(null);

    const submit = () => {
      formRef.value?.submitForm();
    };

    const onFormSave = (saved: any) => {
      emit('save', saved);
      emit('update:isVisible', false);
    };

    return { formRef, submit, onFormSave };
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
