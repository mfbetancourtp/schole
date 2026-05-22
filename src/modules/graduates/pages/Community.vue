<template>
  <AppBaseList title="Comunidad de Egresados">
    <template #actions>
      <AppButton variant="light" outlined nativeType="button" @click="openCreate"> <AppIcon icon="plus" /> Crear publicación </AppButton>
    </template>

    <template #content>
      <div class="comm-page">
        <div class="comm-layout">
          <!-- ── Left sidebar ──────────────────────────────────────────── -->
          <aside class="comm-sidebar-left">
            <div class="comm-profile-card">
              <div class="comm-profile-banner"></div>
              <div class="comm-profile-avatar-wrap">
                <img v-if="currentUserAvatar" :src="currentUserAvatar" alt="Mi perfil" class="comm-profile-photo" />
                <span v-else class="comm-profile-photo comm-profile-photo--placeholder">{{ currentUserInitial }}</span>
              </div>
              <div class="comm-profile-info">
                <p class="comm-profile-name">
                  {{ userProfile ? `${userProfile.names} ${userProfile.lastnames}`.trim() : currentUserName }}
                </p>
                <div class="comm-profile-stats">
                  <div class="comm-pstat">
                    <span class="comm-pstat-num">{{ userProfile ? userProfile.postsCount : 0 }}</span>
                    <span class="comm-pstat-lbl">Publicaciones</span>
                  </div>
                  <div class="comm-pstat">
                    <span class="comm-pstat-num">{{ userProfile ? userProfile.friendsCount : 0 }}</span>
                    <span class="comm-pstat-lbl">Amigos</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="comm-quick-links">
              <p class="comm-quick-title">Acceso rápido</p>
              <a class="comm-quick-item" href="#" @click.prevent="filterByCurrentUser">
                <span class="comm-qi-icon comm-qi-icon--blue"><AppIcon icon="newspaper" /></span>
                Mis publicaciones
              </a>
              <a class="comm-quick-item" href="#" @click.prevent="clearUserFilter">
                <span class="comm-qi-icon comm-qi-icon--green"><AppIcon icon="users" /></span>
                Todas las publicaciones
              </a>
              <router-link :to="{ name: 'graduates.jobBoard' }" class="comm-quick-item">
                <span class="comm-qi-icon comm-qi-icon--orange"><AppIcon icon="briefcase" /></span>
                Vacantes compartidas
              </router-link>
              <a class="comm-quick-item" href="#" @click.prevent="showRequests = !showRequests">
                <span class="comm-qi-icon comm-qi-icon--purple"><AppIcon icon="user-friends" /></span>
                Solicitudes de amistad
                <span v-if="connections.received.length" class="comm-req-badge">{{ connections.received.length }}</span>
                <AppIcon :icon="showRequests ? 'chevron-up' : 'chevron-down'" class="comm-qi-chevron" />
              </a>
            </div>

            <!-- Panel de solicitudes (colapsable) -->
            <div v-if="showRequests" class="comm-requests-panel">
              <!-- Recibidas -->
              <template v-if="connections.received.length">
                <p class="comm-req-section-label">Solicitudes recibidas</p>
                <div class="comm-req-cards">
                  <div v-for="req in connections.received" :key="req.id" class="comm-req-card">
                    <div class="comm-req-card-top">
                      <img
                        v-if="req.friend?.avatar"
                        :src="req.friend.avatar"
                        class="comm-req-avatar comm-req-avatar--img"
                        :alt="req.friend.names"
                        @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                      />
                      <span v-else class="comm-req-avatar">{{ req.friend?.names?.[0] ?? '' }}{{ req.friend?.lastnames?.[0] ?? '' }}</span>
                      <div class="comm-req-card-info">
                        <p class="comm-req-card-name">{{ req.friend?.names }} {{ req.friend?.lastnames }}</p>
                        <p class="comm-req-card-sub">Egresado</p>
                      </div>
                    </div>
                    <p v-if="req.message" class="comm-req-card-message">"{{ req.message }}"</p>
                    <div class="comm-req-card-actions">
                      <button class="comm-req-card-btn comm-req-card-btn--accept" :disabled="respondingRequestId === req.id" @click="respondToRequest(req.id, 'Aceptado')">
                        <AppIcon icon="check" /> Aceptar
                      </button>
                      <button class="comm-req-card-btn comm-req-card-btn--reject" :disabled="respondingRequestId === req.id" @click="respondToRequest(req.id, 'Rechazado')">
                        <AppIcon icon="times" /> Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Enviadas -->
              <template v-if="connections.sent.length">
                <p
                  class="comm-req-section-label"
                  :class="{
                    'comm-req-section-label--spaced': connections.received.length,
                  }"
                >
                  Solicitudes enviadas
                </p>
                <div class="comm-req-cards">
                  <div v-for="req in connections.sent" :key="req.id" class="comm-req-card comm-req-card--sent">
                    <div class="comm-req-card-top">
                      <img
                        v-if="req.friend?.avatar"
                        :src="req.friend.avatar"
                        class="comm-req-avatar comm-req-avatar--img comm-req-avatar--sent"
                        :alt="req.friend.names"
                        @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                      />
                      <span v-else class="comm-req-avatar comm-req-avatar--sent">{{ req.friend?.names?.[0] ?? '' }}{{ req.friend?.lastnames?.[0] ?? '' }}</span>
                      <div class="comm-req-card-info">
                        <p class="comm-req-card-name">{{ req.friend?.names }} {{ req.friend?.lastnames }}</p>
                        <p class="comm-req-card-sub comm-req-card-sub--pending">
                          {{ req.status }}
                        </p>
                      </div>
                    </div>
                    <p v-if="req.message" class="comm-req-card-message">"{{ req.message }}"</p>
                    <button class="comm-req-card-btn comm-req-card-btn--cancel" :disabled="respondingRequestId === req.id" @click="cancelSentRequest(req.id)">
                      <AppIcon icon="times" /> Cancelar solicitud
                    </button>
                  </div>
                </div>
              </template>

              <p v-if="!connections.received.length && !connections.sent.length" class="comm-req-empty">No tienes solicitudes pendientes</p>
            </div>
          </aside>

          <!-- ── Center feed ──────────────────────────────────────────── -->
          <main class="comm-feed">
            <!-- Composer bar -->
            <div class="comm-composer" @click="openCreate">
              <img v-if="currentUserAvatar" :src="currentUserAvatar" alt="Mi perfil" class="comm-composer-photo" />
              <span v-else class="comm-composer-photo comm-composer-photo--placeholder">{{ currentUserInitial }}</span>
              <div class="comm-composer-placeholder">¿Qué quieres compartir hoy con la comunidad?</div>
            </div>

            <!-- Category filter pills -->
            <div v-if="categories.length" class="comm-category-filter">
              <button class="comm-cat-pill" :class="{ 'comm-cat-pill--active': !activeCategoryId }" @click="filterByCategory(null)">Todas</button>
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="comm-cat-pill"
                :class="{
                  'comm-cat-pill--active': activeCategoryId === cat.id,
                }"
                @click="filterByCategory(cat.id)"
              >
                {{ cat.name }}
              </button>
            </div>

            <AppLoading v-if="loading && posts.length === 0" />

            <div v-else class="comm-posts">
              <div v-for="post in posts" :key="`${post.type}-${post.feedItemId}`" class="comm-post">
                <!-- Share banner -->
                <div v-if="post.type === 'share'" class="comm-share-banner">
                  <img v-if="post.author.avatar" :src="post.author.avatar" class="comm-share-actor-photo" />
                  <span v-else class="comm-share-actor-photo comm-share-actor-photo--placeholder">{{ post.author.name?.[0] ?? '?' }}</span>
                  <div class="comm-share-actor-info">
                    <strong>{{ post.author.name }}</strong> compartió esta publicación
                    <span class="comm-share-time"> · {{ formatTime(post.publishedAt) }}</span>
                  </div>
                  <div v-if="post.userId === currentUserId" class="comm-post-owner-actions">
                    <button class="comm-owner-btn comm-owner-btn--danger" title="Eliminar" @click.stop="openDelete(post)">
                      <AppIcon icon="trash" />
                    </button>
                  </div>
                </div>

                <!-- Share comment -->
                <p v-if="post.type === 'share' && post.shareComment" class="comm-post-content comm-share-comment">
                  {{ post.shareComment }}
                </p>

                <!-- Original post box (for shares) -->
                <div v-if="post.type === 'share'" class="comm-share-original">
                  <div class="comm-post-header" style="margin-bottom: 8px">
                    <img v-if="post.originalAuthorAvatar" :src="post.originalAuthorAvatar" class="comm-post-photo" />
                    <span v-else class="comm-post-photo comm-post-photo--placeholder">{{ post.originalAuthorName?.[0] ?? '?' }}</span>
                    <div class="comm-post-author">
                      <p class="comm-post-name">
                        {{ post.originalAuthorName }}
                      </p>
                      <p class="comm-post-meta">Publicación original</p>
                    </div>
                    <span v-if="post.categoryId" class="comm-post-type-badge">{{ categories.find((c) => c.id === post.categoryId)?.name }}</span>
                  </div>
                  <p v-if="post.content" class="comm-post-content">
                    {{ post.content }}
                  </p>
                  <div v-if="post.mediaUrls.length > 0" class="comm-post-image">
                    <img :src="post.mediaUrls[0]" alt="media" @error="onImageError($event)" />
                  </div>
                  <a v-if="post.linkUrl" :href="post.linkUrl" target="_blank" rel="noopener noreferrer" class="comm-post-link"><AppIcon icon="link" /> {{ post.linkUrl }}</a>
                </div>

                <!-- Regular post header (for posts) -->
                <div v-if="post.type === 'post'" class="comm-post-header">
                  <img v-if="post.author.avatar" :src="post.author.avatar" :alt="post.author.name" class="comm-post-photo" />
                  <span v-else class="comm-post-photo comm-post-photo--placeholder">{{ post.author.name?.[0] ?? '?' }}</span>
                  <div class="comm-post-author">
                    <p class="comm-post-name">{{ post.author.name }}</p>
                    <p class="comm-post-meta">
                      {{ formatTime(post.publishedAt) }}
                    </p>
                  </div>
                  <span v-if="post.categoryId" class="comm-post-type-badge">{{ categories.find((c) => c.id === post.categoryId)?.name }}</span>
                  <div v-if="post.userId === currentUserId" class="comm-post-owner-actions">
                    <button class="comm-owner-btn" title="Editar" @click.stop="openEdit(post)">
                      <AppIcon icon="edit" />
                    </button>
                    <button class="comm-owner-btn comm-owner-btn--danger" title="Eliminar" @click.stop="openDelete(post)">
                      <AppIcon icon="trash" />
                    </button>
                  </div>
                </div>

                <!-- Post content / media / link -->
                <p v-if="post.type === 'post'" class="comm-post-content">
                  {{ post.content }}
                </p>
                <div v-if="post.type === 'post' && post.mediaUrls.length > 0" class="comm-post-image">
                  <img :src="post.mediaUrls[0]" alt="media" @error="onImageError($event)" />
                </div>
                <a v-if="post.type === 'post' && post.linkUrl" :href="post.linkUrl" target="_blank" rel="noopener noreferrer" class="comm-post-link"><AppIcon icon="link" /> {{ post.linkUrl }}</a>

                <!-- Stats -->
                <div class="comm-post-stats">
                  <span><AppIcon icon="thumbs-up" /> {{ post.likesCount }} me gusta</span>
                  <button class="comm-stats-comments" @click="openComments(post)">{{ post.commentsCount }} comentarios · {{ post.sharesCount }} compartidos</button>
                </div>

                <!-- Actions -->
                <div class="comm-post-actions">
                  <button class="comm-pa-btn" :class="{ 'comm-pa-btn--active': post.isLiked }" @click="toggleLike(post)"><AppIcon icon="thumbs-up" /> Me gusta</button>
                  <button class="comm-pa-btn" @click="openComments(post)"><AppIcon icon="comment-alt" /> Comentar</button>
                  <button class="comm-pa-btn" @click="sharePost(post)"><AppIcon icon="paper-plane" /> Compartir</button>
                </div>
              </div>

              <div v-if="posts.length === 0 && !loading" class="comm-empty">
                <AppIcon icon="newspaper" />
                <p>No hay publicaciones aún. ¡Sé el primero en compartir algo!</p>
              </div>
            </div>

            <div v-if="hasMore" class="comm-load-more">
              <AppButton outlined variant="secondary" size="sm" nativeType="button" :disabled="loading" @click="loadMore">
                <AppIcon icon="chevron-down" />
                {{ loading ? 'Cargando...' : 'Cargar más publicaciones' }}
              </AppButton>
            </div>
          </main>

          <!-- ── Right sidebar ────────────────────────────────────────── -->
          <aside class="comm-sidebar-right">
            <!-- Vacantes recientes -->
            <div class="comm-widget-panel">
              <p class="comm-widget-title"><AppIcon icon="briefcase" /> Vacantes recientes</p>
              <div v-if="recentVacancies.length" class="comm-vacancy-list">
                <div v-for="v in recentVacancies" :key="v.id" class="comm-vacancy-card">
                  <p class="comm-vacancy-name">{{ v.name }}</p>
                  <p class="comm-vacancy-company">
                    {{ v.company?.name ?? 'Sin empresa' }}
                  </p>
                  <div class="comm-vacancy-meta">
                    <span v-if="v.modalityType" class="comm-vacancy-tag">{{ v.modalityType.name }}</span>
                    <span v-if="v.municipality" class="comm-vacancy-tag">{{ v.municipality.name }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="comm-widget-empty">No hay vacantes disponibles</p>
              <router-link :to="{ name: 'graduates.jobBoard' }" class="comm-widget-link comm-widget-link--footer">Ver todas las vacantes →</router-link>
            </div>

            <!-- Sugerencias de conexión -->
            <div class="comm-widget-panel">
              <p class="comm-widget-title"><AppIcon icon="user-plus" /> Sugerencias de conexión</p>
              <div v-if="suggestions.length" class="comm-suggestions-list">
                <div v-for="s in suggestions" :key="s.userId" class="comm-suggestion-row">
                  <span class="comm-suggestion-initials">{{ s.names?.[0] ?? '' }}{{ s.lastnames?.[0] ?? '' }}</span>
                  <div class="comm-suggestion-info">
                    <p class="comm-suggestion-name">{{ s.names }} {{ s.lastnames }}</p>
                    <p class="comm-suggestion-meta">{{ s.mutualFriends }} conexiones en común</p>
                  </div>
                  <button class="comm-connect-btn" @click="openConnect(s)">
                    <AppIcon icon="user-plus" />
                  </button>
                </div>
              </div>
              <p v-else class="comm-widget-empty">Sin sugerencias por ahora</p>
            </div>
          </aside>
        </div>
      </div>

      <!-- Drawer crear / editar publicación -->
      <CreatePostDrawer
        :isVisible="showPostDrawer"
        @update:isVisible="showPostDrawer = $event"
        :post="selectedPost"
        :categories="categories"
        :userId="currentUserId"
        :institutionId="currentInstitutionId"
        @save="onPostSaved"
      />

      <!-- Drawer comentarios -->
      <PostCommentsDrawer
        :isVisible="showCommentsDrawer"
        @update:isVisible="showCommentsDrawer = $event"
        :post="selectedCommentPost"
        :currentUserId="currentUserId"
        :currentUserName="currentUserName"
        :currentUserAvatar="currentUserAvatar"
        :currentUserInitial="currentUserInitial"
        @count-changed="onCommentCountChanged"
      />

      <!-- Confirm eliminar -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" entity="publicación" @confirmDelete="confirmDelete" />
      </AppModal>

      <!-- Share drawer -->
      <SharePostDrawer v-model:isVisible="showShareDrawer" :post="selectedSharePost" :sharing="sharingPost" @share="doSharePost" />

      <!-- Connect drawer -->
      <ConnectGraduateDrawer v-model:isVisible="showConnectDrawer" :graduate="selectedSuggestion" :sending="sendingRequest" @send="sendFriendRequest" />
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { useUserStore } from '../../../stores/user';
import InstitutionsStore from '../../../shared/stores/institutions.store';
import CreatePostDrawer from '../components/CreatePostDrawer.vue';
import { PostDto, PostCategoryDto, GraduateUserProfileDto, mapFeedItem } from '../dtos/post.dto';
import { GetPostFeedService } from '../services/getPostFeed.service';
import { GetPostShareCountService } from '../services/getPostShareCount.service';
import { DeleteGraduatePostService } from '../services/deleteGraduatePost.service';
import { GetPostCategoriesService } from '../services/getPostCategories.service';
import { GetGraduateUserProfileService } from '../services/getGraduateUserProfile.service';
import { GetPostCommentsService } from '../services/getPostComments.service';
import { TogglePostReactionService } from '../services/togglePostReaction.service';
import { GetPostReactionsService } from '../services/getPostReactions.service';
import PostCommentsDrawer from '../components/PostCommentsDrawer.vue';
import ConnectGraduateDrawer from '../components/ConnectGraduateDrawer.vue';
import SharePostDrawer from '../components/SharePostDrawer.vue';
import { createSharePostService } from '../services/createSharePost.service';
import { GetJobVacanciesService } from '../services/getJobVacancies.service';
import type { JobVacancyDto } from '../dtos/vacancy.dto';
import type { FriendSuggestionDto, FriendConnectionItemDto, FriendConnectionsDto } from '../dtos/friend.dto';
import { GetFriendSuggestionsService } from '../services/getFriendSuggestions.service';
import { createSendFriendRequestService } from '../services/createSendFriendRequest.service';
import { GetConnectionsService } from '../services/getConnections.service';
import { RespondFriendRequestService } from '../services/respondFriendRequest.service';
import { DeleteFriendRequestService } from '../services/deleteFriendRequest.service';

const PER_PAGE = 10;

export default defineComponent({
  name: 'CommunityPage',
  components: {
    AppBaseList,
    AppLoading,
    AppIcon,
    AppButton,
    AppModal,
    AppConfirmDeleteModal,
    CreatePostDrawer,
    PostCommentsDrawer,
    ConnectGraduateDrawer,
    SharePostDrawer,
  },
  setup() {
    useMeta({ title: 'Comunidad de Egresados' });
    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Egresados', url: '' };
    headerStore.moduleItem = { name: 'Comunidad', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const userStore = useUserStore();
    const getPostFeedService = new GetPostFeedService();
    const deletePostService = new DeleteGraduatePostService();
    const getCategoriesService = new GetPostCategoriesService();
    const getUserProfileService = new GetGraduateUserProfileService();
    const getCommentsService = new GetPostCommentsService();
    const toggleReactionService = new TogglePostReactionService();
    const getReactionsService = new GetPostReactionsService();
    const getJobVacanciesService = new GetJobVacanciesService();
    const getFriendSuggestionsService = new GetFriendSuggestionsService();
    const sendFriendRequestService = new createSendFriendRequestService();
    const getConnectionsService = new GetConnectionsService();
    const respondFriendRequestService = new RespondFriendRequestService();
    const deleteFriendRequestService = new DeleteFriendRequestService();
    const sharePostService = new createSharePostService();
    const getPostShareCountService = new GetPostShareCountService();

    // ── Current user ──────────────────────────────────────────────────────────
    const currentUserId = computed(() => userStore.user?.id ?? 0);
    const currentUserName = computed(() => userStore.user?.fullName ?? userStore.user?.people?.names ?? 'Egresado');
    const currentUserAvatar = computed(() => userStore.user?.avatar ?? '');
    const currentUserInitial = computed(() => currentUserName.value?.[0]?.toUpperCase() ?? '?');
    const currentInstitutionId = computed(() => InstitutionsStore.state.selectedInstitution?.id ?? userStore.user?.people?.institutionId ?? null);

    // ── State ─────────────────────────────────────────────────────────────────
    const loading = ref(false);
    const posts = ref<PostDto[]>([]);
    const categories = ref<PostCategoryDto[]>([]);
    const userProfile = ref<GraduateUserProfileDto | null>(null);
    const currentPage = ref(1);
    const hasMore = ref(false);

    const activeCategoryId = ref<number | null>(null);
    const activeUserId = ref<number | null>(null);

    // Comments drawer state
    const showCommentsDrawer = ref(false);
    const selectedCommentPost = ref<PostDto | null>(null);

    // ── Drawer / delete ───────────────────────────────────────────────────────
    const showPostDrawer = ref(false);
    const selectedPost = ref<PostDto | null>(null);
    const postToDelete = ref<PostDto | null>(null);
    const showDeleteModal = ref(false);

    const openCreate = () => {
      selectedPost.value = null;
      showPostDrawer.value = true;
    };

    const openEdit = (post: PostDto) => {
      selectedPost.value = post;
      showPostDrawer.value = true;
    };

    const openDelete = (post: PostDto) => {
      postToDelete.value = post;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      if (!postToDelete.value) return;
      try {
        await deletePostService.run(postToDelete.value.feedItemId);
        await reloadPosts();
      } catch {
        // error already handled by axios interceptor
      } finally {
        showDeleteModal.value = false;
        postToDelete.value = null;
      }
    };

    // ── Load data ─────────────────────────────────────────────────────────────
    const loadUserProfile = async () => {
      if (!currentUserId.value) return;
      try {
        userProfile.value = await getUserProfileService.run({
          userId: currentUserId.value,
        });
      } catch {
        userProfile.value = null;
      }
    };

    const loadCategories = async () => {
      try {
        const res = await getCategoriesService.run({
          institutionId: currentInstitutionId.value,
        });
        categories.value = Array.isArray(res) ? res : (res as any)?.data ?? [];
      } catch {
        categories.value = [];
      }
    };

    const loadUserReactions = async () => {
      if (!currentUserId.value || posts.value.length === 0) return;
      try {
        const res = await getReactionsService.run();
        const items: any[] = Array.isArray(res) ? res : res?.data ?? [];
        const likes = items.filter((r: any) => r.reaction === 'Me gusta');
        posts.value.forEach((post) => {
          const postLikes = likes.filter((r: any) => Number(r.graduatePostId) === post.id);
          post.isLiked = postLikes.some((r: any) => Number(r.userId) === currentUserId.value);
          post.likesCount = postLikes.length;
        });
      } catch {
        // keep default state
      }
    };

    const loadCommentCounts = async () => {
      if (posts.value.length === 0) return;
      try {
        const res = await getCommentsService.run({
          institutionId: currentInstitutionId.value ?? undefined,
          noPag: true,
        });
        const items: any[] = Array.isArray(res) ? res : res?.data ?? [];
        const countMap = new Map<number, number>();
        items.forEach((c: any) => {
          const pid = Number(c.graduatePostId);
          countMap.set(pid, (countMap.get(pid) ?? 0) + 1);
        });
        posts.value.forEach((post) => {
          post.commentsCount = countMap.get(post.id) ?? 0;
        });
      } catch {
        // keep default 0
      }
    };

    const loadShareCounts = async () => {
      if (posts.value.length === 0) return;
      const uniquePostIds = [...new Set(posts.value.map((p) => p.id))];
      const counts = new Map<number, number>();
      await Promise.allSettled(
        uniquePostIds.map(async (postId) => {
          try {
            const res = await getPostShareCountService.run(postId);
            counts.set(postId, res.total);
          } catch {
            // keep 0
          }
        })
      );
      posts.value.forEach((post) => {
        post.sharesCount = counts.get(post.id) ?? 0;
      });
    };

    const loadPosts = async (append = false) => {
      loading.value = true;
      try {
        const res = await getPostFeedService.run({
          page: currentPage.value,
          perPage: PER_PAGE,
          order: 'DESC',
          institutionId: currentInstitutionId.value,
          postCategoryId: activeCategoryId.value ?? undefined,
          userId: activeUserId.value ?? undefined,
        });
        const mapped = (res?.data ?? []).map(mapFeedItem);
        posts.value = append ? [...posts.value, ...mapped] : mapped;
        hasMore.value = res.page * res.perPage < res.total;
      } catch {
        if (!append) posts.value = [];
      } finally {
        loading.value = false;
      }
      await Promise.allSettled([loadUserReactions(), loadCommentCounts(), loadShareCounts()]);
    };

    const reloadPosts = async () => {
      currentPage.value = 1;
      await loadPosts(false);
    };

    const loadMore = async () => {
      currentPage.value++;
      await loadPosts(true);
    };

    const onPostSaved = () => {
      reloadPosts();
      loadUserProfile();
    };

    // ── Filters ───────────────────────────────────────────────────────────────
    const filterByCategory = (catId: number | null) => {
      activeCategoryId.value = catId;
      reloadPosts();
    };

    const filterByCurrentUser = () => {
      activeUserId.value = currentUserId.value;
      reloadPosts();
    };

    const clearUserFilter = () => {
      activeUserId.value = null;
      reloadPosts();
    };

    // ── Social interactions ───────────────────────────────────────────────────
    const toggleLike = async (post: PostDto) => {
      post.isLiked = !post.isLiked;
      post.likesCount += post.isLiked ? 1 : -1;
      try {
        await toggleReactionService.run({
          userId: currentUserId.value,
          graduatePostId: post.id,
          reaction: 'Me gusta',
        });
      } catch {
        post.isLiked = !post.isLiked;
        post.likesCount += post.isLiked ? 1 : -1;
      }
    };

    const showShareDrawer = ref(false);
    const selectedSharePost = ref<PostDto | null>(null);
    const sharingPost = ref(false);

    const sharePost = (post: PostDto) => {
      selectedSharePost.value = post;
      showShareDrawer.value = true;
    };

    const doSharePost = async (comment: string) => {
      if (!selectedSharePost.value) return;
      sharingPost.value = true;
      try {
        await sharePostService.run({
          userId: currentUserId.value,
          graduatePostId: selectedSharePost.value.id,
          comment,
        });
        selectedSharePost.value.sharesCount++;
        showShareDrawer.value = false;
      } catch {
        // interceptor handles error toast
      } finally {
        sharingPost.value = false;
      }
    };

    const openComments = (post: PostDto) => {
      selectedCommentPost.value = post;
      showCommentsDrawer.value = true;
    };

    const onCommentCountChanged = (postId: number, newCount: number) => {
      const post = posts.value.find((p) => p.id === postId);
      if (post) post.commentsCount = newCount;
    };

    const onImageError = (e: Event) => {
      (e.target as HTMLImageElement).style.display = 'none';
    };

    // ── Sidebar: recent vacancies ─────────────────────────────────────────────
    const recentVacancies = ref<JobVacancyDto[]>([]);

    const loadRecentVacancies = async () => {
      try {
        const res = await getJobVacanciesService.run({ page: 1, perPage: 3 });
        recentVacancies.value = res?.data ?? [];
      } catch {
        recentVacancies.value = [];
      }
    };

    // ── Sidebar: friend suggestions ───────────────────────────────────────────
    const suggestions = ref<FriendSuggestionDto[]>([]);
    const showConnectDrawer = ref(false);
    const selectedSuggestion = ref<FriendSuggestionDto | null>(null);
    const sendingRequest = ref(false);

    // ── Connections / friend requests ─────────────────────────────────────────
    const connections = ref<FriendConnectionsDto>({
      sent: [],
      received: [],
      friends: [],
    });
    const respondingRequestId = ref<number | null>(null);
    const showRequests = ref(false);

    const loadSuggestions = async () => {
      if (!currentUserId.value || !currentInstitutionId.value) return;
      try {
        const res = await getFriendSuggestionsService.run({
          userId: currentUserId.value,
          institutionId: currentInstitutionId.value,
        });
        suggestions.value = Array.isArray(res) ? res : res?.data ?? [];
      } catch {
        suggestions.value = [];
      }
    };

    const enrichConnectionsWithAvatars = async () => {
      const toEnrich = [...connections.value.sent.filter((c) => !c.friend?.avatar), ...connections.value.received.filter((c) => !c.friend?.avatar)];
      if (!toEnrich.length) return;
      await Promise.allSettled(
        toEnrich.map(async (conn) => {
          try {
            const profile = await getUserProfileService.run({
              userId: conn.friendId,
            });
            const avatar = (profile as any)?.avatar ?? null;
            if (avatar) conn.friend = { ...conn.friend, avatar };
          } catch {
            // no avatar available, initials will be shown
          }
        })
      );
    };

    const loadConnections = async () => {
      if (!currentUserId.value || !currentInstitutionId.value) return;
      try {
        const res = await getConnectionsService.run({
          userId: currentUserId.value,
          institutionId: currentInstitutionId.value,
        });
        connections.value = {
          sent: res?.sent ?? [],
          received: res?.received ?? [],
          friends: res?.friends ?? [],
        };
        await enrichConnectionsWithAvatars();
      } catch {
        connections.value = { sent: [], received: [], friends: [] };
      }
    };

    const respondToRequest = async (id: number, status: 'Aceptado' | 'Rechazado') => {
      respondingRequestId.value = id;
      try {
        await respondFriendRequestService.run(id, status);
        connections.value.received = connections.value.received.filter((r) => r.id !== id);
        if (status === 'Aceptado') await loadConnections();
      } catch {
        // interceptor handles error toast
      } finally {
        respondingRequestId.value = null;
      }
    };

    const cancelSentRequest = async (id: number) => {
      respondingRequestId.value = id;
      try {
        await deleteFriendRequestService.run(id);
        connections.value.sent = connections.value.sent.filter((r) => r.id !== id);
        await loadSuggestions();
      } catch {
        // interceptor handles error toast
      } finally {
        respondingRequestId.value = null;
      }
    };

    const openConnect = (suggestion: FriendSuggestionDto) => {
      selectedSuggestion.value = suggestion;
      showConnectDrawer.value = true;
    };

    const sendFriendRequest = async (message: string) => {
      if (!selectedSuggestion.value || !currentInstitutionId.value) return;
      sendingRequest.value = true;
      const suggestion = selectedSuggestion.value;
      try {
        const res = await sendFriendRequestService.run({
          userId: currentUserId.value,
          institutionId: currentInstitutionId.value,
          friendId: suggestion.userId,
          message,
        });
        showConnectDrawer.value = false;
        suggestions.value = suggestions.value.filter((s) => s.userId !== suggestion.userId);

        // actualizar el panel de enviadas sin recargar
        const newId = res?.id ?? res?.data?.id;
        if (newId) {
          connections.value.sent.push({
            id: newId,
            friendId: suggestion.userId,
            message,
            status: 'Pendiente',
            createdAt: new Date().toISOString(),
            friend: {
              peopleId: suggestion.peopleId,
              names: suggestion.names,
              lastnames: suggestion.lastnames,
              avatar: suggestion.avatar ?? null,
            },
          });
          showRequests.value = true;
        } else {
          // si el backend no devuelve el id recargamos conexiones como fallback
          await loadConnections();
          showRequests.value = true;
        }
      } catch {
        // interceptor handles error toast
      } finally {
        sendingRequest.value = false;
      }
    };

    const formatTime = (iso: string) => {
      const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diff < 60) return 'Hace un momento';
      if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
      if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
      return `Hace ${Math.floor(diff / 86400)} d`;
    };

    onMounted(async () => {
      await Promise.allSettled([loadUserProfile(), loadCategories(), loadPosts(), loadRecentVacancies(), loadSuggestions(), loadConnections()]);
    });

    return {
      loading,
      posts,
      categories,
      userProfile,
      hasMore,
      activeCategoryId,
      currentUserId,
      currentUserName,
      currentUserAvatar,
      currentUserInitial,
      currentInstitutionId,
      showPostDrawer,
      selectedPost,
      postToDelete,
      showDeleteModal,
      openCreate,
      openEdit,
      openDelete,
      confirmDelete,
      onPostSaved,
      loadMore,
      filterByCategory,
      filterByCurrentUser,
      clearUserFilter,
      toggleLike,
      sharePost,
      showCommentsDrawer,
      selectedCommentPost,
      openComments,
      onCommentCountChanged,
      onImageError,
      formatTime,
      recentVacancies,
      suggestions,
      showConnectDrawer,
      selectedSuggestion,
      sendingRequest,
      openConnect,
      sendFriendRequest,
      connections,
      respondingRequestId,
      showRequests,
      respondToRequest,
      cancelSentRequest,
      showShareDrawer,
      selectedSharePost,
      sharingPost,
      doSharePost,
    };
  },
});
</script>

<style scoped>
.comm-page {
  padding: 4px 0 32px;
}

.comm-layout {
  display: grid;
  grid-template-columns: 220px 1fr 220px;
  gap: 20px;
  align-items: flex-start;
}

/* ── Left sidebar ─────────────────────────────────────────────────────────── */
.comm-sidebar-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: flex-start;
}

.comm-profile-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}

.comm-profile-banner {
  height: 64px;
  background: linear-gradient(135deg, var(--color-primary, #2563eb) 0%, #7c3aed 100%);
}

.comm-profile-avatar-wrap {
  display: flex;
  justify-content: center;
  margin-top: -24px;
}

.comm-profile-photo {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid #fff;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.comm-profile-photo--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary, #2563eb);
  color: #fff;
  font-weight: 700;
  font-size: 1.2rem;
}

.comm-profile-info {
  padding: 8px 16px 16px;
  text-align: center;
}

.comm-profile-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0 0 10px;
}

.comm-profile-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.comm-pstat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.comm-pstat-num {
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  line-height: 1;
}

.comm-pstat-lbl {
  font-size: 0.68rem;
  color: #9ca3af;
  margin-top: 2px;
}

.comm-quick-links {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
}

.comm-quick-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 8px;
}

.comm-quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: 8px;
  font-size: 0.83rem;
  color: #374151;
  text-decoration: none;
  transition: background 0.12s;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
}

.comm-quick-item:hover {
  background: #f1f5f9;
  color: var(--color-primary, #2563eb);
}

.comm-qi-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.comm-qi-icon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.comm-qi-icon--green {
  background: #dcfce7;
  color: #16a34a;
}
.comm-qi-icon--orange {
  background: #fef3c7;
  color: #b45309;
}

/* ── Feed ─────────────────────────────────────────────────────────────────── */
.comm-feed {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.comm-composer {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.comm-composer:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  border-color: #93c5fd;
}

.comm-composer-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comm-composer-photo--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary, #2563eb);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
}

.comm-composer-placeholder {
  flex: 1;
  padding: 9px 16px;
  border: 1.5px solid #e9ecef;
  border-radius: 22px;
  font-size: 0.87rem;
  color: #9ca3af;
  background: #f8f9fa;
  user-select: none;
}

/* Posts */
.comm-posts {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comm-post {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  transition: box-shadow 0.15s;
}

.comm-post:hover {
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.06);
}

.comm-post-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.comm-post-photo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #e9ecef;
}

.comm-post-photo--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #6c757d;
  font-weight: 700;
  font-size: 1rem;
}

.comm-post-author {
  flex: 1;
  min-width: 0;
}

.comm-post-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0 0 2px;
}

.comm-post-meta {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.comm-post-type-badge {
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 3px 10px;
  white-space: nowrap;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  flex-shrink: 0;
}

.comm-post-owner-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.comm-owner-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  transition: background 0.12s, color 0.12s;
}

.comm-owner-btn:hover {
  background: #e2e8f0;
  color: #374151;
}

.comm-owner-btn--danger:hover {
  background: #fff1f2;
  color: #dc3545;
}

.comm-post-content {
  font-size: 0.88rem;
  color: #374151;
  line-height: 1.65;
  margin: 0 0 12px;
}

.comm-post-image {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  height: 280px;
  background: #f4f6f8;
}

.comm-post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comm-post-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.79rem;
  color: var(--color-primary, #2563eb);
  text-decoration: none;
  background: #eff6ff;
  border-radius: 6px;
  padding: 4px 10px;
  margin-bottom: 10px;
  word-break: break-all;
}

.comm-post-link:hover {
  text-decoration: underline;
}

.comm-post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
}

.comm-post-stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.comm-stats-comments {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  transition: color 0.12s;
}

.comm-stats-comments:hover {
  color: var(--color-primary, #2563eb);
  text-decoration: underline;
}

.comm-post-actions {
  display: flex;
  gap: 2px;
}

.comm-pa-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.comm-pa-btn:hover {
  background: #f1f5f9;
  color: var(--color-primary, #2563eb);
}

.comm-pa-btn--active {
  color: var(--color-primary, #2563eb);
  font-weight: 700;
}

/* Share type */
.comm-share-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.84rem;
  color: #6c757d;
}

.comm-share-actor-photo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #e9ecef;
}

.comm-share-actor-photo--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #6c757d;
  font-weight: 700;
  font-size: 0.85rem;
}

.comm-share-actor-info {
  flex: 1;
  min-width: 0;
  font-size: 0.84rem;
}

.comm-share-time {
  color: #9ca3af;
  font-size: 0.78rem;
}

.comm-share-comment {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.comm-share-original {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
}

/* Comments */
.comm-comments {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comm-comment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comm-comment {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.comm-comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid #e9ecef;
}

.comm-comment-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #6c757d;
  font-weight: 700;
  font-size: 0.85rem;
}

.comm-comment-bubble {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px 12px;
  flex: 1;
  min-width: 0;
}

.comm-comment-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 3px;
}

.comm-comment-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
}

.comm-comment-time {
  font-size: 0.7rem;
  color: #9ca3af;
}

.comm-comment-text {
  font-size: 0.82rem;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.comm-show-more {
  background: none;
  border: none;
  font-size: 0.78rem;
  color: var(--color-primary, #2563eb);
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  width: 100%;
  text-align: left;
  margin-bottom: 6px;
}

.comm-show-more:hover {
  text-decoration: underline;
}

.comm-comment-actions {
  display: flex;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
}

.comm-comment-action {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: none;
  background: #f1f5f9;
  font-size: 0.65rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  color: #6c757d;
}

.comm-comment-action--edit:hover {
  background: #dbeafe;
  color: #1d4ed8;
}

.comm-comment-action--delete:hover {
  background: #fee2e2;
  color: #dc3545;
}

.comm-comment-edit {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.comm-comment-edit-actions {
  display: flex;
  gap: 6px;
}

.comm-edit-save {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 5px;
  border: none;
  background: var(--color-primary, #2563eb);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.12s;
}

.comm-edit-save:hover {
  opacity: 0.85;
}

.comm-edit-cancel {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
  background: #fff;
  color: #6c757d;
  cursor: pointer;
  transition: background 0.12s;
}

.comm-edit-cancel:hover {
  background: #f1f5f9;
}

.comm-comment-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comm-comment-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1.5px solid #e9ecef;
  border-radius: 22px;
  padding: 4px 6px 4px 14px;
  gap: 6px;
  transition: border-color 0.15s;
}

.comm-comment-input-wrap:focus-within {
  border-color: var(--color-primary, #2563eb);
  background: #fff;
}

.comm-comment-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.84rem;
  color: #374151;
  padding: 4px 0;
}

.comm-comment-input::placeholder {
  color: #9ca3af;
}

.comm-comment-send {
  background: none;
  border: none;
  color: var(--color-primary, #2563eb);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
}

.comm-comment-send:disabled {
  color: #d1d5db;
  cursor: default;
}

.comm-comment-send:not(:disabled):hover {
  background: #eff6ff;
}

/* Load more / empty */
.comm-load-more {
  text-align: center;
  padding: 4px 0;
}

.comm-empty {
  text-align: center;
  padding: 40px 16px;
  color: #9ca3af;
  font-size: 1.8rem;
}

.comm-empty p {
  font-size: 0.9rem;
  margin: 8px 0 0;
}

/* ── Right sidebar ────────────────────────────────────────────────────────── */
.comm-sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: flex-start;
}

.comm-card-footer-link {
  padding: 10px 0;
}

/* Category filter pills */
.comm-category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.comm-cat-pill {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid #e9ecef;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  white-space: nowrap;
}

.comm-cat-pill:hover {
  border-color: var(--color-primary, #2563eb);
  color: var(--color-primary, #2563eb);
}

.comm-cat-pill--active {
  background: var(--color-primary, #2563eb);
  border-color: var(--color-primary, #2563eb);
  color: #fff;
  font-weight: 600;
}

.comm-filter-btn {
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  margin-bottom: 2px;
}

.comm-filter-btn:hover {
  background: #f1f5f9;
  color: var(--color-primary, #2563eb);
}

.comm-filter-btn--active {
  background: #eff6ff;
  color: var(--color-primary, #2563eb);
  font-weight: 600;
}

.comm-widget-link {
  font-size: 0.78rem;
  color: var(--color-primary, #2563eb);
  text-decoration: none;
  font-weight: 500;
}

.comm-widget-link:hover {
  text-decoration: underline;
}

.comm-widget-empty {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0 0 8px;
  font-style: italic;
}

/* Recent vacancies */
.comm-vacancy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.comm-vacancy-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
}

.comm-vacancy-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comm-vacancy-company {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 6px;
}

.comm-vacancy-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.comm-vacancy-tag {
  font-size: 0.68rem;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

/* Friend requests */
.comm-qi-icon--purple {
  background: #f3e8ff;
  color: #9333ea;
}
.comm-qi-chevron {
  margin-left: auto;
  font-size: 0.7rem;
  color: #94a3b8;
}
.comm-req-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 6px;
  padding: 0 3px;
}
.comm-requests-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comm-req-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}
.comm-req-section-label--spaced {
  margin-top: 6px;
}
.comm-req-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.comm-req-card {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
}
.comm-req-card--sent {
  background: #fafafa;
}
.comm-req-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.comm-req-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
}
.comm-req-avatar--sent {
  background: #94a3b8;
}
.comm-req-avatar--img {
  object-fit: cover;
  background: #e2e8f0;
}
.comm-req-card-info {
  min-width: 0;
}
.comm-req-card-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.comm-req-card-sub {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}
.comm-req-card-sub--pending {
  color: #f59e0b;
  font-weight: 600;
}
.comm-req-card-message {
  font-size: 0.8rem;
  color: #475569;
  margin: 0;
  font-style: italic;
  background: #fff;
  border-radius: 6px;
  padding: 6px 8px;
  border-left: 3px solid #e2e8f0;
}
.comm-req-card-actions {
  display: flex;
  gap: 6px;
}
.comm-req-card-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
}
.comm-req-card-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.comm-req-card-btn--accept {
  background: #2563eb;
  color: #fff;
}
.comm-req-card-btn--accept:hover:not(:disabled) {
  background: #1d4ed8;
}
.comm-req-card-btn--reject {
  background: #f1f5f9;
  color: #64748b;
}
.comm-req-card-btn--reject:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}
.comm-req-card-btn--cancel {
  background: #f1f5f9;
  color: #64748b;
  flex: none;
  width: 100%;
}
.comm-req-card-btn--cancel:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}
.comm-req-empty {
  font-size: 0.82rem;
  color: #94a3b8;
  text-align: center;
  margin: 0;
  padding: 4px 0;
}

/* Friend suggestions */
.comm-suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 4px;
}

.comm-suggestion-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comm-suggestion-initials {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comm-suggestion-info {
  flex: 1;
  min-width: 0;
}

.comm-suggestion-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comm-suggestion-meta {
  font-size: 0.7rem;
  color: #9ca3af;
  margin: 0;
}

.comm-connect-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s;
}

.comm-connect-btn:hover {
  background: #dbeafe;
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .comm-layout {
    grid-template-columns: 200px 1fr;
  }
  .comm-sidebar-right {
    display: none;
  }
}

@media (max-width: 750px) {
  .comm-layout {
    grid-template-columns: 1fr;
  }
  .comm-sidebar-left {
    position: static;
  }
}
</style>
