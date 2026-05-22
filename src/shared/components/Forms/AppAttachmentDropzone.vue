<template>
  <div class="attach">
    <AppFormField :label="title"></AppFormField>

    <!-- EMPTY STATE -->
    <div
      v-if="!hasFile"
      class="dropzone"
      :class="{ 'is-dragging': isDragging, 'is-invalid': isInvalid }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="openFilePicker"
      role="button"
      tabindex="0"
      @keydown.enter.prevent="openFilePicker"
      @keydown.space.prevent="openFilePicker"
    >
      <div class="dropzone__icon">
        <AppIcon icon="upload" />
      </div>

      <div class="dropzone__text">
        <div class="dropzone__main">Arrastra un archivo aquí o haz clic para seleccionar</div>
        <div class="dropzone__sub">{{ acceptLabel }} (máx. {{ maxSizeMB }}MB)</div>
      </div>

      <div class="dropzone__btn">
        <button type="button" class="selectBtn" @click.stop="openFilePicker">Seleccionar archivo</button>
      </div>

      <input ref="fileInputRef" type="file" class="d-none" :accept="accept" @change="onFileChange" />
    </div>

    <!-- FILE STATE -->
    <div v-else class="fileCard" :class="{ 'is-invalid': isInvalid }">
      <!-- Header: icono + meta + acciones -->
      <div class="fileCard__header">
        <div class="fileCard__icon">
          <AppIcon :icon="isImage ? 'image' : isPdf ? 'file-pdf' : 'file-alt'" />
        </div>

        <div class="fileMeta">
          <div class="fileName" :title="displayName">{{ displayName }}</div>
          <div class="fileInfo">
            <span v-if="displaySize">{{ displaySize }}</span>
            <span v-if="displaySize && displayExt" class="dot">·</span>
            <span v-if="displayExt">{{ displayExt }}</span>
            <button v-if="fileUrl" type="button" class="linkBtn" @click="openLink">
              <AppIcon icon="external-link-alt" />
              Ver archivo
            </button>
          </div>
        </div>

        <div class="fileCard__actions">
          <AppButton type="button" variant="light" outlined @click="editFile">
            <AppIcon icon="pen" />
            Cambiar
          </AppButton>
          <AppButton v-if="showDelete" type="button" variant="danger" outlined @click="removeFile">
            <AppIcon icon="trash" />
            Eliminar
          </AppButton>
        </div>
      </div>

      <!-- Preview debajo del header (imagen o PDF) -->
      <div v-if="fileUrl && (isImage || isPdf)" class="preview">
        <img v-if="isImage" class="preview__img" :src="fileUrl" alt="Preview" />
        <iframe v-else-if="isPdf" class="preview__pdf" :src="fileUrl" title="Preview PDF" />
      </div>

      <input ref="fileInputRef" type="file" class="d-none" :accept="accept" @change="onFileChange" />
    </div>

    <p v-if="helper && !isInvalid" class="helperText">{{ helper }}</p>
    <p v-if="isInvalid && errorText" class="errorText">{{ errorText }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch, onBeforeUnmount } from 'vue';
import AppIcon from '../AppIcon.vue';
import AppButton from '../Buttons/AppButton.vue';
import AppFormField from './AppFormField.vue';

export default defineComponent({
  name: 'AppAttachmentDropzone',
  components: { AppIcon, AppButton, AppFormField },
  props: {
    modelValue: {
      type: Object as PropType<File | null>,
      default: null,
    },
    certificateUrl: {
      type: String,
      default: '',
    },
    isShowDelete: { type: Boolean, default: true },
    isTitle: { type: String, default: 'Adjuntar Diploma o Acta de Grado' },
    isHelper: { type: String, default: 'PDF, DOC, DOCX (máx. 5MB)' },

    isAccept: { type: String, default: '.pdf,.doc,.docx' },
    isMaxSizeMB: { type: Number, default: 5 },

    invalid: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'update:certificateUrl', 'change', 'delete', 'edit'],
  setup(props, { emit }) {
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const isDragging = ref(false);
    const errorText = ref('');
    const hasPreview = computed(() => !!fileUrl.value && (isImage.value || isPdf.value));
    const isInvalid = computed(() => props.invalid);
    const maxBytes = computed(() => props.isMaxSizeMB * 1024 * 1024);

    const acceptLabel = computed(() => {
      if (!props.isAccept || props.isAccept === '*/*') return 'TODOS';
      const a = props.isAccept.replaceAll('.', '').toUpperCase();
      return a.replaceAll(',', ', ');
    });

    const hasFile = computed(() => !!props.modelValue || !!props.certificateUrl);

    // ====== preview URL local (si hay File) ======
    const objectUrl = ref('');

    const revokeObjectUrl = () => {
      if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
        objectUrl.value = '';
      }
    };

    watch(
      () => props.modelValue,
      (file) => {
        revokeObjectUrl();
        if (file) objectUrl.value = URL.createObjectURL(file);
      },
      { immediate: true }
    );

    onBeforeUnmount(() => revokeObjectUrl());

    // ✅ URL final del preview y del botón "Ver"
    const fileUrl = computed(() => {
      if (props.modelValue && objectUrl.value) return objectUrl.value;
      return props.certificateUrl || '';
    });

    const nameFromUrl = (url: string) => {
      try {
        const clean = url.split('?')[0].split('#')[0];
        const last = clean.substring(clean.lastIndexOf('/') + 1);
        return decodeURIComponent(last || 'Archivo');
      } catch {
        return 'Archivo';
      }
    };

    const displayName = computed(() => {
      if (props.modelValue?.name) return props.modelValue.name;
      if (props.certificateUrl) return nameFromUrl(props.certificateUrl);
      return 'Archivo';
    });

    const displayExt = computed(() => {
      const name = displayName.value;
      const idx = name.lastIndexOf('.');
      return idx > -1 ? name.substring(idx + 1).toUpperCase() : '';
    });

    // ✅ Detectar tipo (sirve para File local y para URL)
    const extLower = computed(() => displayExt.value.toLowerCase());

    const isImage = computed(() => {
      // si es File, usar mime
      if (props.modelValue?.type) return props.modelValue.type.startsWith('image/');
      // si es URL, usar extensión
      return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extLower.value);
    });

    const isPdf = computed(() => {
      if (props.modelValue?.type) return props.modelValue.type === 'application/pdf';
      return extLower.value === 'pdf';
    });

    const formatBytes = (bytes?: number) => {
      if (!bytes && bytes !== 0) return '';
      const kb = bytes / 1024;
      if (kb < 1024) return `${kb.toFixed(1)} KB`;
      const mb = kb / 1024;
      return `${mb.toFixed(1)} MB`;
    };

    const displaySize = computed(() => (props.modelValue?.size ? formatBytes(props.modelValue.size) : ''));

    const openFilePicker = () => {
      errorText.value = '';
      fileInputRef.value?.click();
    };

    const validateFile = (file: File) => {
      if (file.size > maxBytes.value) {
        return `El archivo supera el tamaño máximo permitido (${props.isMaxSizeMB}MB).`;
      }

      if (!props.isAccept || props.isAccept === '*/*') return '';

      const allowed = props.isAccept
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean);

      const name = file.name.toLowerCase();
      const okExt = allowed.some((ext) => name.endsWith(ext));
      if (!okExt) return `Tipo de archivo no permitido. Permitidos: ${acceptLabel.value}.`;

      return '';
    };

    const setFile = (file: File) => {
      emit('update:modelValue', file);
      emit('change', file);
    };

    const onFileChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      const err = validateFile(file);
      if (err) {
        errorText.value = err;
        input.value = '';
        return;
      }

      errorText.value = '';
      setFile(file);
      input.value = ''; // permitir re-seleccionar el mismo archivo
    };

    const onDragOver = () => (isDragging.value = true);
    const onDragLeave = () => (isDragging.value = false);

    const onDrop = (e: DragEvent) => {
      isDragging.value = false;
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      const err = validateFile(file);
      if (err) {
        errorText.value = err;
        return;
      }

      errorText.value = '';
      setFile(file);
    };

    const removeFile = () => {
      emit('update:modelValue', null);
      emit('delete');
      errorText.value = '';
      revokeObjectUrl();
    };

    const editFile = () => {
      emit('edit');
      openFilePicker();
    };

    const openLink = () => {
      if (!fileUrl.value) return;
      window.open(fileUrl.value, '_blank');
    };

    return {
      fileInputRef,
      isDragging,
      hasFile,

      acceptLabel,
      isInvalid,
      errorText,

      fileUrl,
      displayName,
      displaySize,
      displayExt,

      // ✅ nuevos
      isImage,
      isPdf,
      hasPreview,
      openFilePicker,
      onFileChange,
      onDragOver,
      onDragLeave,
      onDrop,
      removeFile,
      editFile,
      openLink,
      showDelete: computed(() => props.isShowDelete),
      maxSizeMB: computed(() => props.isMaxSizeMB),
      accept: computed(() => props.isAccept),
      title: computed(() => props.isTitle),
      helper: computed(() => props.isHelper),
    };
  },
});
</script>

<style scoped>
.attach {
  display: grid;
  gap: 8px;
}

/* ========== Dropzone vacío ========== */
.dropzone {
  border: 2px dashed #e4e7ec;
  border-radius: 12px;
  padding: 28px 18px;
  background: #ffffff;
  cursor: pointer;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 10px;
  transition: border-color 0.15s, background 0.15s;
}

.dropzone:hover {
  border-color: #919eab;
  background: #f4f6f8;
}

.dropzone.is-dragging {
  border-color: var(--color-primary);
  background: rgba(145, 158, 171, 0.08);
}

.dropzone__icon {
  font-size: 32px;
  color: #919eab;
}

.dropzone__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropzone__main {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.dropzone__sub {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #637381;
}

.selectBtn {
  border: 1px solid #e4e7ec;
  background: #f4f6f8;
  color: #212b36;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.selectBtn:hover {
  background: #e4e7ec;
}

/* ========== Archivo seleccionado ========== */
.fileCard {
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Fila superior: icono + nombre/info + acciones */
.fileCard__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}

.fileCard__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f4f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.fileMeta {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fileName {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fileInfo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #637381;
}

.dot {
  color: #919eab;
}

.linkBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
}

.linkBtn:hover {
  opacity: 0.75;
}

/* Botones de acción */
.fileCard__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Preview (imagen o PDF) debajo del header */
.preview {
  width: 100%;
  height: 380px;
  border-top: 1px solid #e4e7ec;
  background: #f4f6f8;
  overflow: hidden;
}

.preview__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview__pdf {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

/* Helper / Error */
.helperText {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  font-size: 12px;
  color: #919eab;
}

.errorText {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  font-size: 12px;
  color: var(--color-danger, #ef4444);
}

/* Invalid */
.dropzone.is-invalid,
.fileCard.is-invalid {
  border-color: var(--color-danger, #ef4444);
}

/* ========== Responsive ========== */
@media (max-width: 600px) {
  .fileCard__header {
    flex-wrap: wrap;
  }

  .fileCard__actions {
    width: 100%;
    justify-content: flex-end;
  }

  .preview {
    height: 260px;
  }
}
</style>
