<template>
  <div class="chapter-upload">
    <!-- Deadline alert -->
    <div class="chapter-upload__deadline">
      <AppIcon icon="clock" class="chapter-upload__deadline-icon" />
      <div class="chapter-upload__deadline-text">
        <span class="chapter-upload__deadline-title">{{ t('Fecha límite de entrega:') }}</span>
        <span class="chapter-upload__deadline-detail">
          {{ t('Tienes hasta el') }} <strong>{{ chapter.date }}</strong>
          {{ t('para entregar este avance') }}
        </span>
      </div>
    </div>

    <!-- File upload -->
    <AppAttachmentDropzone
      v-model="selectedFile"
      :isTitle="t('Documento del Avance')"
      :isHelper="t('Este mensaje será visible para su tutor junto con el archivo')"
      :isAccept="'.pdf,.docx,.zip'"
      :isMaxSizeMB="20"
    />

    <!-- Tutor message -->
    <AppFormField :label="t('Mensaje para el Tutor (Opcional)')">
      <textarea v-model="tutorMessage" class="form-control" :placeholder="t('Puede agregar comentarios, preguntas o aclaraciones sobre este avance...')" rows="3"></textarea>
      <span class="chapter-upload__hint">{{ t('Este mensaje será visible para su tutor junto con el archivo') }}</span>
    </AppFormField>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ChapterTimeline } from '../dtos/tracking.dto';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'ChapterUploadDrawer',
  components: { AppAttachmentDropzone, AppIcon, AppFormField },
  props: {
    chapter: {
      type: Object as PropType<ChapterTimeline>,
      required: true,
    },
  },
  emits: ['submit', 'cancel'],
  setup(_, { emit }) {
    const { t } = useI18n();
    const selectedFile = ref<File | null>(null);
    const tutorMessage = ref('');

    const handleSubmit = () => {
      emit('submit', {
        file: selectedFile.value,
        message: tutorMessage.value.trim(),
      });
    };

    const handleCancel = () => {
      selectedFile.value = null;
      tutorMessage.value = '';
      emit('cancel');
    };

    return { t, selectedFile, tutorMessage, handleSubmit, handleCancel };
  },
});
</script>

<style scoped>
.chapter-upload {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

/* Deadline alert */
.chapter-upload__deadline {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #eef4ff;
  border: 1px solid #c2d6f7;
  border-radius: 10px;
  padding: 16px 20px;
}

.chapter-upload__deadline-icon {
  font-size: 20px;
  color: var(--color-primary, #1b2e83);
  margin-top: 2px;
}

.chapter-upload__deadline-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-upload__deadline-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary, #1b2e83);
}

.chapter-upload__deadline-detail {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.chapter-upload__hint {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}
</style>
