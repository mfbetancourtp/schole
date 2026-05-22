import { ref, onMounted, onBeforeUnmount } from 'vue';

interface VoiceRecognitionOptions {
  lang?: string;
  continuous?: boolean;
}

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const { lang = 'es-CO', continuous = true } = options;
  const listening = ref(false);
  const supportSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const transcript = ref('');
  let recognition: any;

  const start = () => {
    if (!supportSpeech) return;
    recognition.start();
    listening.value = true;
  };

  const stop = () => {
    if (!supportSpeech) return;
    recognition.stop();
    listening.value = false;
  };

  const toggle = () => {
    listening.value ? stop() : start();
  };

  onMounted(() => {
    if (!supportSpeech) return;
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecClass();
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      transcript.value = event.results[event.results.length - 1][0].transcript;
    };
    recognition.onend = () => {
      listening.value = false;
    };
    recognition.onerror = () => {
      listening.value = false;
    };
  });

  onBeforeUnmount(() => {
    if (recognition && listening.value) recognition.stop();
  });

  return { listening, supportSpeech, transcript, start, stop, toggle };
};
