<template>
  <div class="preliminary-step">
    <div class="step-section">
      <h4 class="step-section__title">{{ t('Anteproyecto') }}</h4>
      <p class="step-section__subtitle">
        {{ t('Cargue los documentos iniciales de su propuesta de grado') }}
      </p>
    </div>

    <div class="upload-item">
      <AppAttachmentDropzone v-model="proposalFile" :isShowDelete="true" :isTitle="t('Propuesta de Investigación *')" :isHelper="t('PDF — Obligatorio')" isAccept=".pdf" :isMaxSizeMB="10" />
    </div>

    <div class="upload-item upload-item--optional">
      <div class="upload-item__label">
        <span class="upload-item__name">{{ t('Anexos Técnicos o Bibliografía') }}</span>
        <AppBadge :label="t('Opcional')" variant="ghost" />
      </div>
      <AppAttachmentDropzone v-model="annexFile" :isShowDelete="true" :isTitle="''" :isHelper="t('PDF — Opcional')" isAccept=".pdf" :isMaxSizeMB="10" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import type { PostulationFormData } from '../dtos/postulation.dto';

export default defineComponent({
  name: 'PreliminaryProjectStep',
  components: { AppAttachmentDropzone, AppBadge },
  props: {
    form: {
      type: Object as PropType<PostulationFormData>,
      required: true,
    },
  },
  emits: ['update:form'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const proposalFile = computed({
      get: () => props.form.proposalFile,
      set: (v: File | null) => emit('update:form', { ...props.form, proposalFile: v }),
    });

    const annexFile = computed({
      get: () => props.form.annexFile,
      set: (v: File | null) => emit('update:form', { ...props.form, annexFile: v }),
    });

    return { t, proposalFile, annexFile };
  },
});
</script>

<style scoped>
.step-section {
  margin-bottom: 20px;
}

.step-section__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #212b36;
  margin-bottom: 4px;
}

.step-section__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
}

.upload-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 32px;
}

.upload-item--optional {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ec;
  padding: 20px 32px 0;
}

.upload-item__label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-item__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}
</style>
