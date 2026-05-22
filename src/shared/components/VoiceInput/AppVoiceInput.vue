<template>
  <div class="voice-input d-flex align-items-start">
    <textarea v-bind="$attrs" :value="modelValue" @input="onInput" :rows="rows" :cols="cols" :placeholder="placeholder" :class="['voice-input__textarea', textareaClass]"   :readonly="readonly"   :disabled="disabled" />
    <AppVoiceButton class="voice-input__button" @voice="onVoice" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppVoiceButton from './AppVoiceButton.vue';

export default defineComponent({
  name: 'VoiceInput',
  components: { AppVoiceButton },
  props: {
    modelValue: {
      type: String as PropType<string>,
      default: '',
    },
    rows: {
      type:  Number || String as PropType<any>,
      default: 2,
    },
    cols: {
      type: Number || String as PropType<any>,
      default: 40,
    },
    placeholder: {
      type: String as PropType<string>,
      default: '',
    },
    textareaClass: {
      type: String as PropType<string>,
      default: '',
    },
    readonly: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },

  },
  emits: ['update:modelValue'],
  setup: (props, { emit }) => {
    const onInput = (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      if (target) emit('update:modelValue', target.value);
    };

    const onVoice = (val: string) => {
      const current = props.modelValue || '';
      const separator = current.endsWith(' ') || current === '' ? '' : ' ';
      emit('update:modelValue', current + separator + val);
    };

    return {
      onInput,
      onVoice,
    };
  },
});
</script>

<style scoped>
.voice-input{
  width: 100%;
}
.voice-input__textarea {
  flex: 1;
  resize: vertical;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.5rem;
}

.voice-input__button {
  margin-left: 0.75rem;
  display: flex;
  align-items: center;
}
</style>
