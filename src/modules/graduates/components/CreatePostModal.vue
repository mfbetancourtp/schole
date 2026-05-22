<template>
  <AppFormModal title="Crear publicación">
    <template #content>
      <div class="cpm-body">
        <!-- Post type -->
        <div class="cpm-field">
          <label class="cpm-label">Tipo de publicación</label>
          <select class="form-select form-select-sm" v-model="form.type">
            <option v-for="(label, value) in POST_TYPE_LABEL" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Content -->
        <div class="cpm-field">
          <label class="cpm-label">Contenido <span class="cpm-required">*</span></label>
          <textarea
            class="form-control cpm-textarea"
            :class="{ 'is-invalid': contentTouched && !form.content.trim() }"
            v-model="form.content"
            @blur="contentTouched = true"
            placeholder="¿Qué quieres compartir con la comunidad?"
            rows="5"
            maxlength="1000"
          ></textarea>
          <div class="cpm-counter" :class="{ 'cpm-counter--warn': form.content.length > 900 }">{{ form.content.length }} / 1000</div>
          <div v-if="contentTouched && !form.content.trim()" class="invalid-feedback d-block">El contenido es obligatorio.</div>
        </div>

        <!-- Image upload -->
        <div class="cpm-field">
          <label class="cpm-label">Imagen (opcional)</label>
          <div
            class="cpm-dropzone"
            :class="{
              'cpm-dropzone--over': isDragging,
              'cpm-dropzone--filled': imagePreview,
            }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <input ref="fileInputRef" type="file" accept="image/jpeg,image/png" class="cpm-file-input" @change="onFileChange" />
            <template v-if="!imagePreview">
              <AppIcon icon="cloud-upload-alt" class="cpm-drop-icon" />
              <p class="cpm-drop-text">
                Arrastra una imagen aquí o
                <span class="cpm-drop-link">selecciona un archivo</span>
              </p>
              <p class="cpm-drop-hint">JPG, PNG · Máximo 5 MB</p>
            </template>
            <template v-else>
              <img :src="imagePreview" alt="preview" class="cpm-preview-img" />
              <button class="cpm-remove-img" @click.stop="removeImage" type="button">
                <AppIcon icon="times" />
              </button>
            </template>
          </div>
          <div v-if="imageError" class="cpm-field-error">{{ imageError }}</div>
        </div>

        <!-- Link -->
        <div class="cpm-field">
          <label class="cpm-label">Enlace (opcional)</label>
          <div class="cpm-input-icon">
            <span class="cpm-input-prefix"><AppIcon icon="link" /></span>
            <input type="url" class="form-control form-control-sm cpm-input-pad" v-model="form.linkUrl" placeholder="https://ejemplo.com" />
          </div>
        </div>

        <!-- Tips card -->
        <div class="cpm-tips">
          <div class="cpm-tips-header">
            <AppIcon icon="info-circle" class="cpm-tips-icon" />
            <span>Consejos para tu publicación</span>
          </div>
          <ul class="cpm-tips-list">
            <li>Sé claro y conciso para captar la atención de tu red.</li>
            <li>Comparte logros, aprendizajes u oportunidades relevantes.</li>
            <li>Usa una imagen para aumentar el alcance de tu publicación.</li>
            <li>Etiqueta temas de interés para llegar a más egresados.</li>
          </ul>
        </div>
      </div>
    </template>

    <template #actions>
      <button class="btn btn-primary btn-sm" type="button" :disabled="!isValid" @click="submit"><AppIcon icon="paper-plane" /> Publicar</button>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { CreatePostPayload, POST_TYPE_LABEL } from '../dtos/post.dto';

export default defineComponent({
  name: 'CreatePostModal',
  components: { AppFormModal, AppIcon },
  emits: ['save'],
  setup(_, { emit }) {
    const form = reactive<CreatePostPayload>({
      type: 'general',
      content: '',
      imageFile: null,
      linkUrl: '',
    });

    const contentTouched = ref(false);
    const isDragging = ref(false);
    const imagePreview = ref<string | null>(null);
    const imageError = ref('');
    const fileInputRef = ref<HTMLInputElement | null>(null);

    const isValid = computed(() => form.content.trim().length > 0);

    const triggerFileInput = () => {
      if (!imagePreview.value) fileInputRef.value?.click();
    };

    const processFile = (file: File) => {
      imageError.value = '';
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        imageError.value = 'Solo se aceptan archivos JPG o PNG.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        imageError.value = 'El archivo supera el límite de 5 MB.';
        return;
      }
      form.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    };

    const onFileChange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file);
    };

    const onDrop = (e: DragEvent) => {
      isDragging.value = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) processFile(file);
    };

    const removeImage = () => {
      imagePreview.value = null;
      form.imageFile = null;
      imageError.value = '';
      if (fileInputRef.value) fileInputRef.value.value = '';
    };

    const submit = () => {
      contentTouched.value = true;
      if (!isValid.value) return;
      emit('save', { ...form });
    };

    return {
      form,
      contentTouched,
      isDragging,
      imagePreview,
      imageError,
      fileInputRef,
      isValid,
      POST_TYPE_LABEL,
      triggerFileInput,
      onFileChange,
      onDrop,
      removeImage,
      submit,
    };
  },
});
</script>

<style scoped>
.cpm-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cpm-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cpm-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}

.cpm-required {
  color: #dc3545;
}

.cpm-textarea {
  resize: vertical;
  min-height: 110px;
  font-size: 0.9rem;
}

.cpm-counter {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: right;
}

.cpm-counter--warn {
  color: #f59e0b;
  font-weight: 600;
}

/* Dropzone */
.cpm-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s, background 0.15s;
  position: relative;
  min-height: 120px;
  background: #f9fafb;
}

.cpm-dropzone:hover,
.cpm-dropzone--over {
  border-color: var(--color-primary, #2563eb);
  background: #eff6ff;
}

.cpm-dropzone--filled {
  padding: 0;
  cursor: default;
  border-style: solid;
  border-color: #93c5fd;
  background: #fff;
  overflow: hidden;
}

.cpm-file-input {
  display: none;
}

.cpm-drop-icon {
  font-size: 2rem;
  color: #93c5fd;
  margin-bottom: 8px;
}

.cpm-drop-text {
  font-size: 0.85rem;
  color: #4b5563;
  margin: 0 0 4px;
}

.cpm-drop-link {
  color: var(--color-primary, #2563eb);
  font-weight: 600;
}

.cpm-drop-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.cpm-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.cpm-remove-img {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.55);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.15s;
}

.cpm-remove-img:hover {
  background: rgba(0, 0, 0, 0.75);
}

.cpm-field-error {
  font-size: 0.78rem;
  color: #dc3545;
}

/* Link input */
.cpm-input-icon {
  position: relative;
}

.cpm-input-prefix {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  font-size: 0.8rem;
}

.cpm-input-pad {
  padding-left: 30px;
}

/* Tips */
.cpm-tips {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 14px 16px;
}

.cpm-tips-header {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 8px;
}

.cpm-tips-icon {
  font-size: 0.9rem;
}

.cpm-tips-list {
  margin: 0;
  padding-left: 18px;
  list-style: disc;
}

.cpm-tips-list li {
  font-size: 0.8rem;
  color: #374151;
  margin-bottom: 3px;
  line-height: 1.45;
}
</style>
