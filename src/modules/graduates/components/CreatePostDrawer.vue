<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader
        :variant="editingPostId ? 'edit' : 'create'"
        :icon="editingPostId ? 'edit' : 'newspaper'"
        :title="editingPostId ? 'Editar publicación' : 'Nueva publicación'"
        subtitle="Comparte con la comunidad de egresados"
      />
    </template>

    <template #body>
      <div class="drawer-section" v-if="isVisible">
        <div class="row g-3">
          <!-- Categoría -->
          <div class="col-12">
            <AppFormField label="Categoría *">
              <select class="form-select" v-model="form.postCategoryId" :class="{ 'is-invalid': errors.postCategoryId }">
                <option :value="null">Seleccionar categoría</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </AppFormField>
            <p v-if="errors.postCategoryId" class="text-danger small mt-1 mb-0">
              {{ errors.postCategoryId }}
            </p>
          </div>

          <!-- Contenido -->
          <div class="col-12">
            <AppFormField label="Contenido *">
              <textarea
                class="form-control"
                :class="{ 'is-invalid': errors.textContent }"
                v-model="form.textContent"
                rows="5"
                maxlength="1000"
                placeholder="¿Qué quieres compartir con la comunidad?"
              ></textarea>
            </AppFormField>
            <p v-if="errors.textContent" class="text-danger small mt-1 mb-0">
              {{ errors.textContent }}
            </p>
          </div>

          <!-- Imagen -->
          <div class="col-12">
            <AppFormField label="Imagen (opcional)">
              <!-- Uploaded previews -->
              <div v-if="form.mediaUrls.length > 0" class="cpd-uploaded-list">
                <div v-for="(url, idx) in form.mediaUrls" :key="idx" class="cpd-uploaded-item">
                  <div class="cpd-uploaded-icon">
                    <AppIcon icon="image" />
                  </div>
                  <img :src="url" class="cpd-uploaded-thumb" alt="preview" />
                  <div class="cpd-uploaded-meta">
                    <span class="cpd-uploaded-name">Imagen {{ idx + 1 }}</span>
                  </div>
                  <AppButton outlined variant="danger" size="sm" nativeType="button" @click="removeImage(idx)"><AppIcon icon="trash" /> Eliminar</AppButton>
                </div>
              </div>

              <!-- Dropzone -->
              <div
                class="cpd-dropzone"
                :class="{
                  'cpd-dropzone--dragging': isDragging,
                  'cpd-dropzone--loading': uploading,
                }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDrop"
                @click="triggerFile"
                role="button"
                tabindex="0"
                @keydown.enter.prevent="triggerFile"
                @keydown.space.prevent="triggerFile"
              >
                <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="d-none" @change="onFileChange" />
                <div v-if="uploading" class="cpd-dz-body">
                  <span class="spinner-border text-primary" style="width: 28px; height: 28px" role="status"></span>
                  <div class="cpd-dz-text">
                    <span class="cpd-dz-main">Subiendo imagen...</span>
                  </div>
                </div>
                <div v-else class="cpd-dz-body">
                  <div class="cpd-dz-icon"><AppIcon icon="image" /></div>
                  <div class="cpd-dz-text">
                    <span class="cpd-dz-main">Arrastra una imagen o haz clic para seleccionar</span>
                    <span class="cpd-dz-sub">JPG, PNG hasta 5MB</span>
                  </div>
                </div>
              </div>
              <p v-if="uploadError" class="text-danger small mt-1 mb-0">
                {{ uploadError }}
              </p>
            </AppFormField>
          </div>

          <!-- Enlace -->
          <div class="col-12">
            <AppFormField label="Enlace (opcional)">
              <div class="input-group">
                <span class="input-group-text"><AppIcon icon="link" /></span>
                <input type="url" class="form-control" v-model="form.linkUrl" placeholder="https://ejemplo.com" />
              </div>
            </AppFormField>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)"> Cancelar </AppButton>
          <AppButton variant="primary" nativeType="button" :loading="saving" :disabled="uploading" @click="submit">
            {{ editingPostId ? 'Guardar cambios' : 'Publicar' }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { CreateOrUpdateGraduatePostService } from '../services/createOrUpdateGraduatePost.service';
import { UploadPostImageService } from '../services/uploadPostImage.service';
import type { PostDto, PostCategoryDto } from '../dtos/post.dto';

const MAX_SIZE_MB = 5;

export default defineComponent({
  name: 'CreatePostDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, AppFormField, AppIcon },
  props: {
    isVisible: { type: Boolean, required: true },
    post: { type: Object as PropType<PostDto | null>, default: null },
    categories: {
      type: Array as PropType<PostCategoryDto[]>,
      default: () => [],
    },
    userId: { type: Number, required: true },
    institutionId: { type: Number as PropType<number | null>, default: null },
  },
  emits: ['update:isVisible', 'save'],
  setup(props, { emit }) {
    const upsertService = new CreateOrUpdateGraduatePostService();
    const uploadService = new UploadPostImageService();
    const saving = ref(false);
    const uploading = ref(false);
    const uploadError = ref('');
    const isDragging = ref(false);
    const fileInputRef = ref<HTMLInputElement | null>(null);

    const editingPostId = ref<number | null>(null);

    const form = reactive({
      postCategoryId: null as number | null,
      textContent: '',
      mediaUrls: [] as string[],
      linkUrl: '',
    });

    const errors = reactive({
      postCategoryId: '',
      textContent: '',
    });

    watch(
      () => props.isVisible,
      (visible) => {
        if (!visible) return;
        if (props.post) {
          editingPostId.value = props.post.id;
          form.postCategoryId = props.post.categoryId || null;
          form.textContent = props.post.content ?? '';
          form.mediaUrls = [...(props.post.mediaUrls ?? [])];
          form.linkUrl = props.post.linkUrl ?? '';
        } else {
          editingPostId.value = null;
          form.postCategoryId = null;
          form.textContent = '';
          form.mediaUrls = [];
          form.linkUrl = '';
        }
        errors.postCategoryId = '';
        errors.textContent = '';
        uploadError.value = '';
        isDragging.value = false;
      }
    );

    watch(
      () => form.postCategoryId,
      (val) => {
        if (val) errors.postCategoryId = '';
      }
    );
    watch(
      () => form.textContent,
      (val) => {
        if (val.trim()) errors.textContent = '';
      }
    );

    const removeImage = (idx: number) => form.mediaUrls.splice(idx, 1);

    const triggerFile = () => fileInputRef.value?.click();

    const uploadFile = async (file: File) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        uploadError.value = `La imagen supera el tamaño máximo permitido (${MAX_SIZE_MB}MB).`;
        return;
      }
      uploading.value = true;
      uploadError.value = '';
      try {
        const res = await uploadService.run({ file });
        const url: string = (res as any)?.url ?? (res as any)?.mediaUrl ?? res;
        if (url) form.mediaUrls.push(url);
      } catch {
        uploadError.value = 'Error al subir la imagen, intenta de nuevo.';
      } finally {
        uploading.value = false;
      }
    };

    const onFileChange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (fileInputRef.value) fileInputRef.value.value = '';
      if (!file) return;
      await uploadFile(file);
    };

    const onDrop = async (e: DragEvent) => {
      isDragging.value = false;
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      await uploadFile(file);
    };

    const validate = () => {
      errors.postCategoryId = '';
      errors.textContent = '';
      let valid = true;
      if (!form.postCategoryId) {
        errors.postCategoryId = 'La categoría es requerida';
        valid = false;
      }
      if (!form.textContent.trim()) {
        errors.textContent = 'El contenido es requerido';
        valid = false;
      }
      return valid;
    };

    const submit = async () => {
      if (!validate() || saving.value || uploading.value) return;
      saving.value = true;
      try {
        await upsertService.run(
          {
            userId: props.userId,
            institutionId: props.institutionId,
            postCategoryId: form.postCategoryId!,
            textContent: form.textContent,
            mediaUrls: form.mediaUrls.length ? form.mediaUrls : undefined,
            linkUrl: form.linkUrl || undefined,
          },
          editingPostId.value ?? undefined
        );
        emit('save');
        emit('update:isVisible', false);
      } finally {
        saving.value = false;
      }
    };

    return {
      form,
      errors,
      saving,
      uploading,
      uploadError,
      isDragging,
      editingPostId,
      fileInputRef,
      removeImage,
      triggerFile,
      onFileChange,
      onDrop,
      submit,
    };
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

/* ── Uploaded items list ─────────────────────────────────────────────────── */
.cpd-uploaded-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.cpd-uploaded-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e4e7ec;
  border-radius: 10px;
  padding: 8px 12px;
  background: #fff;
}

.cpd-uploaded-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f4f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-primary, #2563eb);
  flex-shrink: 0;
}

.cpd-uploaded-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #e4e7ec;
}

.cpd-uploaded-meta {
  flex: 1;
  min-width: 0;
}

.cpd-uploaded-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212b36;
}

/* ── Dropzone ────────────────────────────────────────────────────────────── */
.cpd-dropzone {
  border: 2px dashed #e4e7ec;
  border-radius: 12px;
  padding: 28px 18px;
  background: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  text-align: center;
  transition: border-color 0.15s, background 0.15s;
}

.cpd-dropzone:hover {
  border-color: #919eab;
  background: #f4f6f8;
}

.cpd-dropzone--dragging {
  border-color: var(--color-primary, #2563eb) !important;
  background: rgba(37, 99, 235, 0.04) !important;
}

.cpd-dropzone--loading {
  pointer-events: none;
}

.cpd-dz-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.cpd-dz-icon {
  font-size: 32px;
  color: #919eab;
}

.cpd-dz-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cpd-dz-main {
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.cpd-dz-sub {
  font-size: 12px;
  color: #637381;
}
</style>
