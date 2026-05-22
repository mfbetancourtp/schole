export interface PostShareCountDto {
  total: number;
}

export interface PostAuthor {
  id: number;
  name: string;
  avatar: string;
  career: string;
}

export interface PostComment {
  id: number;
  author: PostAuthor;
  text: string;
  publishedAt: string;
}

export interface PostDto {
  id: number;
  feedItemId: number;
  type: 'post' | 'share';
  userId: number;
  categoryId: number;
  categoryName: string;
  content: string;
  mediaUrls: string[];
  linkUrl?: string;
  shareComment?: string;
  originalAuthorName?: string;
  originalAuthorAvatar?: string | null;
  author: PostAuthor;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  publishedAt: string;
  comments: PostComment[];
}

export interface PostCategoryDto {
  id: number;
  name: string;
}

export interface GraduatePostContentApiDto {
  id: number;
  graduatePostId: number;
  textContent: string | null;
  mediaUrl: string | null;
  linkUrl: string | null;
}

export interface GraduatePostApiDto {
  id: number;
  userId: number;
  institutionId: number;
  postCategoryId: number | null;
  createdAt: string;
  contents: GraduatePostContentApiDto[];
  postCategory?: {
    id: number;
    name: string;
  } | null;
  user?: {
    userId: number;
    peopleId: number;
    names?: string;
    lastnames?: string;
    avatar?: string | null;
  };
}

export interface GetPostsParams {
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  noPag?: boolean;
  perPage?: number;
  search?: string;
  institutionId?: number | null;
  userId?: number | null;
  postCategoryId?: number | null;
}

export interface GetPostsResponseDto {
  data: GraduatePostApiDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// ── Feed API ───────────────────────────────────────────────────────────────────

export interface FeedUserDto {
  userId: number;
  peopleId: number;
  names: string;
  lastnames: string;
  avatar: string | null;
}

export interface FeedContentDto {
  id: number;
  mediaUrl: string | null;
  textContent: string | null;
  linkUrl: string | null;
}

export interface FeedPostDto {
  id: number;
  postCategoryId: number | null;
  createdAt: string;
  contents: FeedContentDto[];
  user?: FeedUserDto;
}

export interface FeedItemApiDto {
  type: 'post' | 'share';
  id: number;
  comment?: string;
  createdAt: string;
  user: FeedUserDto;
  post: FeedPostDto;
}

export interface GetFeedResponseDto {
  data: FeedItemApiDto[];
  total: number;
  page: number;
  perPage: number;
}

export interface GetFeedParams {
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  noPag?: string;
  perPage?: number;
  search?: string;
  institutionId?: number | null;
  userId?: number | null;
  postCategoryId?: number | null;
}

export interface UpsertPostRequest {
  userId?: number;
  institutionId?: number | null;
  postCategoryId: number;
  textContent: string;
  mediaUrls?: string[];
  linkUrl?: string;
}

// ── Comments ──────────────────────────────────────────────────────────────────

export interface PostCommentApiDto {
  id: number;
  graduatePostId: number;
  userId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  user?: {
    userId: number;
    names?: string;
    lastnames?: string;
    avatar?: string | null;
  };
}

export interface GetCommentsParams {
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  noPag?: boolean;
  perPage?: number;
  search?: string;
  institutionId?: number;
  graduatePostId?: number;
  userId?: number;
  parentId?: number;
}

export interface UpsertCommentRequest {
  graduatePostId?: number;
  userId?: number;
  parentId?: number | null;
  content: string;
  isBlocked?: number;
}

// ── Reactions ─────────────────────────────────────────────────────────────────

export type PostReactionType = 'Me gusta' | 'Me encanta';

export interface ToggleReactionRequest {
  userId: number;
  graduatePostId: number;
  reaction: PostReactionType;
}

export interface GetReactionsParams {
  graduatePostId?: number;
  userId?: number;
  reaction?: PostReactionType;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface GraduateUserProfileDto {
  peopleId: number;
  names: string;
  lastnames: string;
  friendsCount: number;
  postsCount: number;
}

export interface ConnectionSuggestion {
  id: number;
  name: string;
  avatar?: string;
  career: string;
  mutualConnections: number;
}

export const mapApiComment = (c: PostCommentApiDto): PostComment => ({
  id: c.id,
  author: {
    id: c.userId,
    name: [c.user?.names ?? '', c.user?.lastnames ?? ''].filter(Boolean).join(' ') || 'Egresado',
    avatar: c.user?.avatar ?? '',
    career: '',
  },
  text: c.content,
  publishedAt: c.createdAt,
});

export const mapApiPost = (p: GraduatePostApiDto): PostDto => {
  const names = p.user?.names ?? '';
  const lastnames = p.user?.lastnames ?? '';
  const fullName = [names, lastnames].filter(Boolean).join(' ') || 'Egresado';

  const contents = p.contents ?? [];
  const textContent = contents.find((c) => c.textContent)?.textContent ?? '';
  const mediaUrls = contents.filter((c) => c.mediaUrl).map((c) => c.mediaUrl!);
  const linkUrl = contents.find((c) => c.linkUrl)?.linkUrl ?? undefined;

  return {
    id: p.id,
    feedItemId: p.id,
    type: 'post',
    userId: p.userId,
    categoryId: p.postCategoryId ?? 0,
    categoryName: p.postCategory?.name ?? '',
    content: textContent,
    mediaUrls,
    linkUrl,
    author: {
      id: p.userId,
      name: fullName,
      avatar: p.user?.avatar ?? '',
      career: '',
    },
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    publishedAt: p.createdAt,
    comments: [],
  };
};

export const mapFeedItem = (item: FeedItemApiDto): PostDto => {
  const actorName = [item.user.names, item.user.lastnames].filter(Boolean).join(' ') || 'Egresado';

  const contents = item.post.contents ?? [];
  const textContent = contents.find((c) => c.textContent)?.textContent ?? '';
  const mediaUrls = contents.filter((c) => c.mediaUrl).map((c) => c.mediaUrl!);
  const linkUrl = contents.find((c) => c.linkUrl)?.linkUrl ?? undefined;

  let originalAuthorName: string | undefined;
  let originalAuthorAvatar: string | null | undefined;
  if (item.type === 'share' && item.post.user) {
    originalAuthorName = [item.post.user.names, item.post.user.lastnames].filter(Boolean).join(' ') || 'Egresado';
    originalAuthorAvatar = item.post.user.avatar;
  }

  return {
    id: item.post.id,
    feedItemId: item.id,
    type: item.type,
    userId: item.user.userId,
    categoryId: item.post.postCategoryId ?? 0,
    categoryName: '',
    shareComment: item.comment,
    originalAuthorName,
    originalAuthorAvatar,
    content: textContent,
    mediaUrls,
    linkUrl,
    author: {
      id: item.user.userId,
      name: actorName,
      avatar: item.user.avatar ?? '',
      career: '',
    },
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    publishedAt: item.createdAt,
    comments: [],
  };
};
