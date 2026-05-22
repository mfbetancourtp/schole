<template>
  <AppButton
    v-if="supportSpeech"
    :key="listening ? 'listening' : 'not-listening'"
    :class="['voice-button', { listening }]"
    :variant="listening ? 'danger' : 'primary'"
    icon="microphone"
    :outlined="!listening"
    @click="toggle"
    :disabled="!supportSpeech"
    v-tooltip="listening ? 'Detener dictado' : 'Iniciar dictado'"
    :data-listening="listening"
  />
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { useVoiceRecognition } from './useVoiceRecognition';

export default defineComponent({
  name: 'VoiceButton',
  components: { AppButton },
  emits: ['voice'], // Emite el texto reconocido
  setup: (_, { emit }) => {
    const { listening, supportSpeech, transcript, toggle } = useVoiceRecognition();

    watch(transcript, (val) => {
      if (val) emit('voice', val);
    });

    return {
      listening,
      supportSpeech,
      toggle,
    };
  },
});
</script>

<style scoped>
.voice-button {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.18s, background 0.18s, border 0.18s;
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
  /*border: 1.5px solid #e0e7ef;*/
  position: relative;
  outline: none;
}

.voice-button:hover:not([disabled]) {
  background: var(--color-secondary);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.1);
  border-color: #b6c6e3;
  height: 32px;
}

.voice-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
  background: #f3f4f6 !important;
  color: #b0b0b0 !important;
  border-color: #e0e7ef !important;
  box-shadow: none !important;
}

/* Animación de pulso cuando está escuchando */
.voice-button.listening,
.voice-button[data-listening='true'] {
  animation: pulse-mic 1s infinite;
  background: linear-gradient(135deg, #ffebee 60%, #ffcdd2 100%);
  box-shadow: 0 0 0 5px #ff525233, 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1.5px solid #ff5252;
  color: #c62828;
}

.voice-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(25, 118, 210, 0.06);
  transition: box-shadow 0.18s;
}

@keyframes pulse-mic {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}
</style>
