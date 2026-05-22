<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader variant="view" icon="comment-alt" title="Comentarios" />
    </template>

    <template #body>
      <div class="pcd-body" v-if="isVisible && post">
        <!-- Post summary -->
        <div class="pcd-post-summary">
          <div class="pcd-post-author-row">
            <img v-if="post.author.avatar" :src="post.author.avatar" :alt="post.author.name" class="pcd-post-avatar" @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
            <span v-if="!post.author.avatar" class="pcd-avatar pcd-avatar--placeholder pcd-post-avatar-size">{{ post.author.name?.[0]?.toUpperCase() ?? '?' }}</span>
            <div class="pcd-post-author-info">
              <span class="pcd-post-author-name">{{ post.author.name }}</span>
              <span class="pcd-post-author-sub">{{ post.categoryName || 'Egresado' }}</span>
            </div>
          </div>
          <p class="pcd-post-content-text">{{ post.content }}</p>
        </div>

        <div class="pcd-separator"></div>

        <p class="pcd-count-label">{{ comments.length }} comentario{{ comments.length !== 1 ? 's' : '' }}</p>

        <!-- Loading -->
        <div v-if="loading" class="pcd-loading">
          <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
        </div>

        <!-- Comment list -->
        <div class="pcd-comment-list">
          <div v-for="comment in comments" :key="comment.id" class="pcd-comment-item">
            <img v-if="showCommentAvatar(comment)" :src="comment.author.avatar" :alt="comment.author.name" class="pcd-comment-avatar" @error="onCommentAvatarError(comment.id)" />
            <span v-else class="pcd-avatar pcd-avatar--placeholder pcd-comment-avatar-size">{{ comment.author.name?.[0]?.toUpperCase() ?? '?' }}</span>
            <div class="pcd-comment-body">
              <div class="pcd-comment-meta">
                <div class="pcd-comment-author-block">
                  <span class="pcd-comment-name">{{ comment.author.name }}</span>
                  <span v-if="comment.author.career" class="pcd-comment-career">{{ comment.author.career }}</span>
                </div>
                <span class="pcd-comment-time">{{ formatTime(comment.publishedAt) }}</span>
              </div>

              <!-- Edit mode -->
              <template v-if="editingCommentId === comment.id">
                <div class="pcd-edit-row">
                  <input type="text" class="form-control form-control-sm" v-model="editingText" @keydown.enter.prevent="saveEdit(comment.id)" @keydown.escape="cancelEdit" autofocus />
                  <div class="pcd-edit-actions">
                    <button class="pcd-btn-save" @click="saveEdit(comment.id)">Guardar</button>
                    <button class="pcd-btn-cancel" @click="cancelEdit">Cancelar</button>
                  </div>
                </div>
              </template>
              <p v-else class="pcd-comment-text">{{ comment.text }}</p>

              <!-- Own comment actions -->
              <div v-if="comment.author.id === currentUserId && editingCommentId !== comment.id" class="pcd-comment-actions">
                <button class="pcd-action-btn pcd-action-btn--edit" @click="startEdit(comment)"><AppIcon icon="pen" /> Editar</button>
                <button class="pcd-action-btn pcd-action-btn--delete" @click="deleteComment(comment.id)"><AppIcon icon="trash" /> Eliminar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="comments.length === 0 && !loading" class="pcd-empty">
          <AppIcon icon="comment-alt" />
          <p>Sé el primero en comentar</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="pcd-footer w-100">
        <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="pcd-footer-avatar" />
        <span v-else class="pcd-avatar pcd-avatar--placeholder pcd-footer-avatar-size">{{ currentUserInitial }}</span>
        <div class="pcd-input-wrap">
          <input type="text" class="pcd-footer-input" placeholder="Escribe un comentario..." v-model="commentInput" @keydown.enter.prevent="submitComment" />
          <button class="pcd-send-btn" :disabled="!commentInput.trim() || submitting" type="button" @click="submitComment">
            <span v-if="submitting" class="spinner-border spinner-border-sm" role="status"></span>
            <AppIcon v-else icon="paper-plane" />
          </button>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { GetPostCommentsService } from '../services/getPostComments.service';
import { CreateOrUpdatePostCommentService } from '../services/createOrUpdatePostComment.service';
import { DeletePostCommentService } from '../services/deletePostComment.service';
import type { PostDto, PostComment } from '../dtos/post.dto';
import { mapApiComment } from '../dtos/post.dto';

export default defineComponent({
  name: 'PostCommentsDrawer',
  components: { AppDrawer, AppDrawerHeader, AppIcon },
  props: {
    isVisible: { type: Boolean, required: true },
    post: { type: Object as PropType<PostDto | null>, default: null },
    currentUserId: { type: Number, required: true },
    currentUserName: { type: String, default: '' },
    currentUserAvatar: { type: String, default: '' },
    currentUserInitial: { type: String, default: '?' },
  },
  emits: ['update:isVisible', 'count-changed'],
  setup(props, { emit }) {
    const getCommentsService = new GetPostCommentsService();
    const upsertCommentService = new CreateOrUpdatePostCommentService();
    const deleteCommentService = new DeletePostCommentService();

    const loading = ref(false);
    const submitting = ref(false);
    const comments = ref<PostComment[]>([]);
    const commentInput = ref('');
    const editingCommentId = ref<number | null>(null);
    const editingText = ref('');
    const failedAvatarIds = ref<Set<number>>(new Set());

    const showCommentAvatar = (comment: PostComment) => !!(comment.author.avatar && !failedAvatarIds.value.has(comment.id));

    const onCommentAvatarError = (commentId: number) => {
      failedAvatarIds.value = new Set([...failedAvatarIds.value, commentId]);
    };

    const loadComments = async () => {
      if (!props.post) return;
      loading.value = true;
      try {
        const res = await getCommentsService.run({
          graduatePostId: props.post.id,
          perPage: 100,
          order: 'ASC',
        });
        const items = Array.isArray(res) ? res : res?.data ?? [];
        comments.value = items.map(mapApiComment);
        emit('count-changed', props.post.id, comments.value.length);
      } catch {
        comments.value = [];
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.isVisible,
      (visible) => {
        if (!visible) {
          commentInput.value = '';
          editingCommentId.value = null;
          editingText.value = '';
          failedAvatarIds.value = new Set();
          return;
        }
        comments.value = props.post?.comments ?? [];
        loadComments();
      }
    );

    const submitComment = async () => {
      const text = commentInput.value.trim();
      if (!text || submitting.value) return;
      submitting.value = true;
      try {
        const res = await upsertCommentService.run({
          graduatePostId: props.post!.id,
          userId: props.currentUserId,
          content: text,
        });
        comments.value.push({
          id: res?.id ?? res?.data?.id,
          author: {
            id: props.currentUserId,
            name: props.currentUserName,
            avatar: props.currentUserAvatar,
            career: '',
          },
          text,
          publishedAt: res?.createdAt ?? res?.data?.createdAt ?? new Date().toISOString(),
        });
        commentInput.value = '';
        emit('count-changed', props.post!.id, comments.value.length);
      } catch {
        // error handled by axios interceptor
      } finally {
        submitting.value = false;
      }
    };

    const deleteComment = async (commentId: number) => {
      try {
        await deleteCommentService.run(commentId);
        const idx = comments.value.findIndex((c) => c.id === commentId);
        if (idx !== -1) comments.value.splice(idx, 1);
        emit('count-changed', props.post!.id, comments.value.length);
      } catch {
        // error handled by axios interceptor
      }
    };

    const startEdit = (comment: PostComment) => {
      editingCommentId.value = comment.id;
      editingText.value = comment.text;
    };

    const cancelEdit = () => {
      editingCommentId.value = null;
      editingText.value = '';
    };

    const saveEdit = async (commentId: number) => {
      const text = editingText.value.trim();
      if (!text) return;
      try {
        await upsertCommentService.run({ content: text }, commentId);
        const comment = comments.value.find((c) => c.id === commentId);
        if (comment) comment.text = text;
        cancelEdit();
      } catch {
        // error handled by axios interceptor
      }
    };

    const formatTime = (iso: string) => {
      const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diff < 60) return 'Hace un momento';
      if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
      if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
      return `Hace ${Math.floor(diff / 86400)} d`;
    };

    return {
      loading,
      submitting,
      comments,
      commentInput,
      editingCommentId,
      editingText,
      submitComment,
      deleteComment,
      startEdit,
      cancelEdit,
      saveEdit,
      formatTime,
      showCommentAvatar,
      onCommentAvatarError,
    };
  },
});
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.pcd-body {
  padding: 0;
}

/* ── Post summary ────────────────────────────────────────────────────────── */
.pcd-post-summary {
  padding: 20px 20px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e9ecef;
}

.pcd-post-author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.pcd-post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.pcd-post-avatar-size {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.pcd-post-author-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pcd-post-author-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.pcd-post-author-sub {
  font-size: 0.78rem;
  color: #64748b;
}

.pcd-post-content-text {
  font-size: 0.88rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* ── Separator + count ───────────────────────────────────────────────────── */
.pcd-separator {
  height: 1px;
  background: #e9ecef;
}

.pcd-count-label {
  padding: 10px 20px 4px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.pcd-loading {
  padding: 16px 20px;
}

/* ── Comment list ────────────────────────────────────────────────────────── */
.pcd-comment-list {
  display: flex;
  flex-direction: column;
}

.pcd-comment-item {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.pcd-comment-item:last-child {
  border-bottom: none;
}

.pcd-comment-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.pcd-comment-avatar-size {
  width: 38px;
  height: 38px;
  font-size: 0.9rem;
}

.pcd-comment-body {
  flex: 1;
  min-width: 0;
}

.pcd-comment-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.pcd-comment-author-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pcd-comment-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
}

.pcd-comment-career {
  font-size: 0.75rem;
  color: #64748b;
}

.pcd-comment-time {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

.pcd-comment-text {
  font-size: 0.85rem;
  color: #374151;
  line-height: 1.55;
  margin: 0;
}

/* ── Edit mode ───────────────────────────────────────────────────────────── */
.pcd-edit-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pcd-edit-actions {
  display: flex;
  gap: 6px;
}

.pcd-btn-save,
.pcd-btn-cancel {
  border: none;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.pcd-btn-save {
  background: var(--color-primary, #2563eb);
  color: #fff;
}

.pcd-btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

/* ── Own comment actions ─────────────────────────────────────────────────── */
.pcd-comment-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.pcd-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
}

.pcd-action-btn--edit {
  color: #2563eb;
}

.pcd-action-btn--edit:hover {
  color: #1d4ed8;
}

.pcd-action-btn--delete {
  color: #dc3545;
}

.pcd-action-btn--delete:hover {
  color: #b91c1c;
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
.pcd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.pcd-empty p {
  margin: 0;
}

/* ── Shared avatar placeholder ───────────────────────────────────────────── */
.pcd-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.pcd-avatar--placeholder {
  background: var(--color-primary, #2563eb);
  color: #fff;
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
.pcd-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pcd-footer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.pcd-footer-avatar-size {
  width: 36px;
  height: 36px;
  font-size: 0.85rem;
}

.pcd-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 24px;
  padding: 0 6px 0 14px;
  gap: 6px;
}

.pcd-footer-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.85rem;
  color: #374151;
  padding: 8px 0;
}

.pcd-footer-input::placeholder {
  color: #94a3b8;
}

.pcd-send-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary, #2563eb);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 0.85rem;
  transition: background 0.12s;
}

.pcd-send-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.pcd-send-btn:disabled {
  background: #cbd5e1;
  cursor: default;
}
</style>
