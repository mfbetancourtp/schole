<template>
  <section class="registration-modern-help">
    <AppAccordion v-slot="{ accordionId }" styleType="rounded">
      <AppAccordionItem :accordion-id="accordionId" :init-open="defaultOpen">
        <template #head>
          <div class="registration-modern-help__header">
            <div class="registration-modern-help__titleBlock">
              <div class="registration-modern-help__icon">
                <AppIcon icon="question-circle" />
              </div>

              <div>
                <h3>{{ title }}</h3>
                <p>{{ helperText }}</p>
              </div>
            </div>
          </div>
        </template>

        <template #content>
          <div :class="['registration-modern-help__body', { 'registration-modern-help__body--withVideo': videoUrl }]">
            <div v-if="description" class="registration-modern-help__copy" v-html="description"></div>

            <template v-if="videoUrl">
              <div v-if="isEmbeddableVideo" class="registration-modern-help__videoFrame">
                <iframe
                  :src="iframeUrl"
                  title="Video tutorial del paso"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>

              <div v-else class="registration-modern-help__videoFile">
                <video :src="videoUrl" controls playsinline preload="metadata"></video>
              </div>
            </template>
          </div>
        </template>
      </AppAccordionItem>
    </AppAccordion>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'RegistrationModernHelpAccordion',
  components: {
    AppAccordion,
    AppAccordionItem,
    AppIcon,
  },
  props: {
    title: {
      type: String,
      default: '¿Qué debes hacer en este paso?',
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    defaultOpen: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const helperText = computed(() => (props.defaultOpen ? 'Haz clic para ocultar' : 'Haz clic para ver la guía'));

    const isEmbeddableVideo = computed(() => /youtube\.com|youtu\.be|vimeo\.com/i.test(props.videoUrl));

    const iframeUrl = computed(() => {
      const url = props.videoUrl;

      if (!url) return '';

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') ? url.split('youtu.be/')[1]?.split('?')[0] : url.split('v=')[1]?.split('&')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }

      if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
      }

      return url;
    });

    return {
      helperText,
      iframeUrl,
      isEmbeddableVideo,
    };
  },
});
</script>

<style scoped>
.registration-modern-help :deep(.o-accordion-item) {
  border: none;
  box-shadow: none;
  background: transparent;
}

.registration-modern-help :deep(.o-accordion-button) {
  padding: 0;
  background: transparent;
}

.registration-modern-help :deep(.o-accordion-button:not(.collapsed)) {
  padding: 0;
}

.registration-modern-help :deep(.o-accordion-button::after) {
  margin-right: 1.2rem;
  border-color: #2563eb;
}

.registration-modern-help :deep(.o-accordion-body) {
  padding: 0;
}

.registration-modern-help__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem;
  color: #1e3a8a;
  background: transparent;
}

.registration-modern-help__titleBlock {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.registration-modern-help__icon {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #dbeafe;
  color: #2563eb;
  flex-shrink: 0;
}

.registration-modern-help__header h3 {
  margin: 0;
  font-weight: 700;
  font-size: 0.96rem;
}

.registration-modern-help__header p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.82rem;
}

.registration-modern-help__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1.2rem 1.2rem;
}

.registration-modern-help__copy,
.registration-modern-help__videoFrame,
.registration-modern-help__videoFile {
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.registration-modern-help__copy {
  padding: 1rem;
  color: #1e3a8a;
  font-size: 0.95rem;
  line-height: 1.7;
}

.registration-modern-help__videoFrame,
.registration-modern-help__videoFile {
  width: 100%;
}

.registration-modern-help__videoFrame,
.registration-modern-help__videoFile {
  aspect-ratio: 16 / 9;
}

.registration-modern-help__videoFrame iframe,
.registration-modern-help__videoFile video {
  width: 100%;
  height: 100%;
  border: none;
}

@media (min-width: 992px) {
  .registration-modern-help__body--withVideo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
    align-items: start;
  }

  .registration-modern-help__videoFrame,
  .registration-modern-help__videoFile {
    width: 100%;
    max-width: 420px;
    justify-self: end;
  }
}

@media (max-width: 991px) {
  .registration-modern-help__body {
    padding: 0 1rem 1rem;
  }
}
</style>
