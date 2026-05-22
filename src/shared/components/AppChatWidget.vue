<template>
  <div class="app-chat-widget">
    <div id="root-widget"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '../../stores/user';

type ChatbotWindow = Window & {
  initChatbot?: (containerId: string, options?: Record<string, any>) => void;
  destroyChatbot?: (containerId?: string) => void;
};

const W = window as ChatbotWindow;

const WIDGET_ID = 'acf7dfa7-50cc-495a-97b9-99ac6287a5c0';
const CSS_URL = 'https://widget-assistant-test.kamilainnovation.co/chatbot-widget.css';
const UMD_URL = 'https://widget-assistant-test.kamilainnovation.co/widget.umd.js';

function ensureCss(href: string, id: string) {
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

function ensureScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    if (existing) {
      if (W.initChatbot) {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

export default defineComponent({
  name: 'AppChatWidget',
  setup() {
    const userStore = useUserStore();

    const initWidget = () => {
      const container = document.getElementById('root-widget');
      if (!container) return;
      if (container.dataset.inited === '1') return;

      W.initChatbot?.('root-widget', {
        userName: `Visitante ${userStore.user?.people?.names ?? ''}`.trim() || 'Visitante',
        widgetId: WIDGET_ID,
      });

      container.dataset.inited = '1';
    };

    onMounted(async () => {
      try {
        ensureCss(CSS_URL, 'chatbot-widget-style');
        await ensureScript(UMD_URL, 'chatbot-widget-script');
        initWidget();
      } catch (error) {
        console.error('No se pudo cargar el widget', error);
      }
    });

    onBeforeUnmount(() => {
      W.destroyChatbot?.('root-widget');

      const container = document.getElementById('root-widget');
      if (container) {
        container.innerHTML = '';
        delete container.dataset.inited;
      }
    });

    return {};
  },
});
</script>

<style scoped>
.app-chat-widget {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}
</style>
