<template>
  <form @submit.prevent="save" class="chat-container">
    <div v-if="!modal" class="chat-header">
      <h5 class="chat-title">{{ t('communications.comments.name') }}</h5>
    </div>

    <div :class="!modal ? 'chat-body' : ''">
      <section class="messages-container" ref="messagesContainer" :style="computedMaxHeight">
        <div v-for="(comment, index) in commentsRes" :key="index" class="message-thread">
          <div class="message message-parent">
            <div class="message-avatar">
              <div v-if="comment.avatar" class="avatar-container">
                <img :src="comment.avatar" alt="avatar user" />
              </div>
              <AppIcon v-else icon="user-circle" :size="'2x'" class="text-primary" />
            </div>

            <div class="message-content">
              <div class="message-header">
                <span class="message-author">{{ comment.nameUser }}</span>
                <span class="message-time">
                  {{ dayjs.utc(comment.createdAt).locale('es').fromNow() }}
                </span>
              </div>
              <p class="message-text" v-html="linkifyHtml(comment.description, { target: '_blank' })"></p>
              <p @click="replyComment(comment.id)" class="message-reply">
                {{ t('communications.comments.reply') }}
              </p>
            </div>
          </div>

          <div v-for="(children, index) in comment.children" :key="index" class="message-replies">
            <div class="message message-reply">
              <div class="message-avatar">
                <div v-if="children.avatar" class="avatar-container">
                  <img :src="children.avatar" alt="avatar user" />
                </div>
                <AppIcon v-else icon="user-circle" :size="'2x'" class="text-primary" />
              </div>

              <div class="message-content">
                <div class="message-header">
                  <span class="message-author">{{ children.nameUser }}</span>
                  <span class="message-time">
                    {{ dayjs.utc(children.createdAt).locale('es').fromNow() }}
                  </span>
                </div>
                <p class="message-text" v-html="linkifyHtml(children.description, { target: '_blank' })"></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="chat-input-container">
        <div v-if="v$.form.parentCommentId.$model" class="reply-preview">
          <div class="reply-preview-content">
            <p class="reply-preview-author">{{ parentComment.nameUser }}</p>
            <p class="reply-preview-text" v-html="linkifyHtml(parentComment.description, { target: '_blank' })"></p>
          </div>
          <AppIcon @click="uncheckComment()" class="reply-preview-close" icon="times" :size="'lg'" />
        </div>

        <div class="input-container">
          <input type="text" class="message-input" id="message" placeholder="Escribe un mensaje aquí" v-model="v$.form.description.$model" />
          <AppButton v-tooltip="'Enviar'" variant="primary" icon="paper-plane" outlined :native-type="'submit'" class="send-button"> </AppButton>
        </div>
      </section>
    </div>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onUpdated, PropType, reactive, Ref, ref, watch } from 'vue';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';
import linkifyHtml from 'linkify-html';
import * as linkify from 'linkifyjs';
import utc from 'dayjs/plugin/utc';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../plugins/vuelidate.plugin';

import AppIcon from './AppIcon.vue';
import AppButton from './Buttons/AppButton.vue';

dayjs.extend(utc);
dayjs.locale('es');
dayjs.extend(localeData);
dayjs.extend(relativeTime);

import { CreateOrUpdateCommentService } from '../services/createOrUpdateComment.service';

const createOrUpdateCommentService = new CreateOrUpdateCommentService();

export default defineComponent({
  name: 'AppChat',
  components: {
    AppButton,
    AppIcon,
  },

  emits: ['newComment'],
  props: {
    commentsRes: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    rowTable: {
      type: String,
      required: true,
    },
    rowId: {
      type: Number,
      required: true,
    },
    modal: {
      type: Boolean,
      default: false,
    },
    isSmallView: {
      type: Boolean,
      default: false, // Por defecto usará la vista grande (70vh)
    },
  },

  setup(props, { emit }) {
    const { t } = useI18n();

    const userId = JSON.parse(localStorage.getItem('user') ?? '').id;

    const rowTablePage = ref(props.rowTable);
    const rowIdPage = ref(props.rowId);

    const parentComment: Ref<any> = ref();

    const messagesContainer = ref<HTMLElement | null>(null);

    const scrollToBottom = () => {
      nextTick(() => {
        // Ojo: nextTick se asegura que el DOM y el virtual DOM estén listos
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    const computedMaxHeight = computed(() => {
      if (props.isSmallView === undefined) {
        return {}; // No aplica max-height
      }
      return {
        maxHeight: props.isSmallView ? 'calc(50vh - 50px)' : 'calc(70vh - 50px)',
      };
    });

    const form = reactive({
      parentCommentId: null as any,
      description: '' as any,
      rowTable: rowTablePage.value,
      rowId: rowIdPage.value,
    });
    const v$ = useVuelidate(
      {
        form: {
          parentCommentId: {},
          description: {},
          rowTable: { required },
          rowId: { required },
        },
      },
      { form }
    );

    const replyComment = (commentId: number) => {
      form.parentCommentId = commentId;

      props.commentsRes.forEach((comment: any) => {
        if (comment.id == form.parentCommentId) {
          parentComment.value = comment;
        }
      });
    };

    onMounted(() => {
      // Al montar el componente, asegurarse de ir al final
      scrollToBottom();
    });

    const uncheckComment = () => {
      form.parentCommentId = null;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid || !form.description) return;

      try {
        await createOrUpdateCommentService.run(form);
        emit('newComment');

        uncheckComment();
        form.description = '';
      } catch (e) {
        console.log('error', e);
      }
    };

    watch(
      () => props.commentsRes,
      () => {
        scrollToBottom();
      },
      { deep: true }
    );

    return {
      save,
      v$,
      t,

      parentComment,
      userId,

      uncheckComment,
      replyComment,

      linkifyHtml,
      linkify,
      dayjs,

      messagesContainer,
      computedMaxHeight,
    };
  },
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.chat-header {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-gray-400);
  margin-bottom: 15px;
}

.chat-title {
  color: var(--color-gray-700);
  font-weight: 600;
  margin: 0;
}

.chat-body {
  border: 1px solid var(--color-gray-400);
  border-radius: 12px;
  padding: 15px;
  background-color: var(--color-light-2);
  box-shadow: 0 2px 10px rgba(var(--color-dark-rgb), var(--opacity-color-10));
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  padding-right: 5px;
}

.message-thread {
  margin-bottom: 20px;
}

.message {
  display: flex;
  margin-bottom: 8px;
  position: relative;
}

.message-parent {
  background-color: var(--color-light);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(var(--color-dark-rgb), var(--opacity-color-10));
}

.message-replies {
  padding-left: 40px;
}

.message-reply {
  background-color: var(--color-ghost);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 1px 2px rgba(var(--color-dark-rgb), var(--opacity-color-10));
}

.message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-primary);
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex-grow: 1;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  gap: 10px; /* Add space between author and time */
}

/* Adjust the message header for both parent and reply messages */
.message-parent .message-header,
.message-reply .message-header {
  flex-wrap: wrap; /* Allow wrapping on small screens */
}

.message-author {
  font-weight: 600;
  color: var(--color-gray-700);
  font-size: 0.95rem;
}

.message-time {
  font-size: 0.75rem;
  color: var(--color-gray-600);
  margin-left: auto; /* Push time to the right */
}

.message-text {
  margin: 0;
  color: var(--color-gray-900);
  line-height: 1.4;
  word-break: break-word;
}

/* Style for the reply link */
p.message-reply {
  color: var(--color-primary);
  font-size: 0.85rem;
  margin-top: 5px;
  cursor: pointer;
  display: inline-block;
  font-weight: 500;
  background-color: transparent;
  box-shadow: none;
  padding: 0;
}

p.message-reply:hover {
  text-decoration: underline;
}

.chat-input-container {
  margin-top: auto;
  background-color: var(--color-light);
  border-radius: 12px;
  padding: 10px;
  border: 1px solid var(--color-primary);
}

.reply-preview {
  display: flex;
  align-items: center;
  background-color: var(--color-ghost);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
}

.reply-preview-content {
  flex-grow: 1;
}

.reply-preview-author {
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 0.85rem;
  color: var(--color-gray-700);
}

.reply-preview-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-gray-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}

.reply-preview-close {
  cursor: pointer;
  color: var(--color-gray-600);
}

.reply-preview-close:hover {
  color: var(--color-danger);
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-input {
  flex-grow: 1;
  border: 1px solid var(--color-gray-400);
  border-radius: 20px;
  padding: 10px 15px;
  font-size: 0.95rem;
  background-color: var(--color-light);
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), var(--opacity-color-20));
}

.send-button {
  border-radius: 50% !important;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.2s;
}

.send-button:hover {
  transform: scale(1.05);
}

/* Ensure consistent alignment between parent and reply messages */
.message-parent .message-avatar,
.message-reply .message-avatar {
  align-self: flex-start; /* Align avatar to the top */
}

/* Ensure consistent spacing in reply messages */
.message-reply .message-content {
  display: flex;
  flex-direction: column;
}

@media (max-height: 100px) {
  .messages-container {
    max-height: calc(50vh - 50px);
  }
}

/* Media queries for better responsiveness */
@media (max-width: 576px) {
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .message-time {
    margin-left: 0;
  }
}
</style>
