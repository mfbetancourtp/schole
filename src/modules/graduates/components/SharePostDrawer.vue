<template>
  <AppDrawer :isVisible="isVisible" size="sm" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <AppDrawerHeader variant="create" icon="paper-plane" title="Compartir publicación" />
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="post" class="spd-body">
        <!-- Post preview card -->
        <div class="spd-post-card">
          <div class="spd-post-header">
            <img v-if="post.author.avatar" :src="post.author.avatar" :alt="post.author.name" class="spd-post-avatar" />
            <span v-else class="spd-post-avatar spd-post-avatar--placeholder">{{ post.author.name?.[0] ?? '?' }}</span>
            <div>
              <p class="spd-post-name">{{ post.author.name }}</p>
              <p class="spd-post-career">{{ post.author.career }}</p>
            </div>
          </div>
          <p class="spd-post-content">{{ truncated }}</p>
        </div>

        <!-- Comment field -->
        <AppFormField label="Agrega un comentario (opcional)">
          <textarea v-model="comment" class="form-control" rows="4" placeholder="¿Qué te parece esta publicación? Comparte tu opinión..."></textarea>
        </AppFormField>

        <!-- Info box -->
        <div class="spd-info-box">
          <p class="spd-info-text">Esta publicación se compartirá en tu feed con tu comentario y será visible para todas tus conexiones.</p>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex gap-2 w-100">
        <AppButton outlined variant="secondary" nativeType="button" class="flex-grow-1" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
        <AppButton variant="primary" nativeType="button" class="flex-grow-1" :disabled="sharing" @click="share">
          <span v-if="sharing" class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ sharing ? 'Compartiendo...' : 'Compartir' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import type { PostDto } from '../dtos/post.dto';

export default defineComponent({
  name: 'SharePostDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, AppFormField },
  props: {
    isVisible: { type: Boolean, default: false },
    post: { type: Object as PropType<PostDto | null>, default: null },
    sharing: { type: Boolean, default: false },
  },
  emits: ['update:isVisible', 'share'],
  setup(props, { emit }) {
    const comment = ref('');

    watch(
      () => props.isVisible,
      (val) => {
        if (val) comment.value = '';
      }
    );

    const truncated = computed(() => {
      const text = props.post?.content ?? '';
      return text.length > 160 ? text.slice(0, 157) + '...' : text;
    });

    const share = () => emit('share', comment.value);

    return { comment, truncated, share };
  },
});
</script>

<style scoped>
.spd-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Post preview */
.spd-post-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
}

.spd-post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.spd-post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.spd-post-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #6c757d;
  font-weight: 700;
  font-size: 0.9rem;
}

.spd-post-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1px;
}

.spd-post-career {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.spd-post-content {
  font-size: 0.83rem;
  color: #374151;
  line-height: 1.55;
  margin: 0;
}

/* Info box */
.spd-info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 12px 14px;
}

.spd-info-text {
  font-size: 0.8rem;
  color: var(--color-primary, #2563eb);
  margin: 0;
  line-height: 1.5;
}
</style>
