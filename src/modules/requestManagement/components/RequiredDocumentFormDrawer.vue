<template>
  <div class="req-doc-form">
    <div class="req-doc-form__field">
      <label class="req-doc-form__label">{{ t('Nombre') }} *</label>
      <input v-model="form.name" type="text" class="req-doc-form__input" :placeholder="t('Ej: Cédula de ciudadanía')" />
    </div>

    <div class="req-doc-form__field">
      <label class="req-doc-form__label">{{ t('Código') }} *</label>
      <input v-model="form.code" type="text" class="req-doc-form__input" :placeholder="t('Ej: DOC001')" />
    </div>

    <div class="req-doc-form__field">
      <label class="req-doc-form__label">{{ t('Descripción') }}</label>
      <textarea v-model="form.description" class="req-doc-form__textarea" :placeholder="t('Describe este documento requerido...')" rows="3" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ApplicationDocumentRequiredItem, ApplicationDocumentRequiredFormData } from '../dtos/requestConfiguration.dto';

const defaultForm = (): ApplicationDocumentRequiredFormData => ({
  code: '',
  name: '',
  description: '',
});

export default defineComponent({
  name: 'RequiredDocumentFormDrawer',
  props: {
    initialData: {
      type: Object as PropType<ApplicationDocumentRequiredItem | null>,
      default: null,
    },
  },
  emits: ['submit'],
  setup(props, { emit, expose }) {
    const { t } = useI18n();
    const form = ref<ApplicationDocumentRequiredFormData>(defaultForm());

    watch(
      () => props.initialData,
      (data) => {
        form.value = data ? { code: data.code, name: data.name, description: data.description } : defaultForm();
      },
      { immediate: true }
    );

    const submitForm = () => {
      emit('submit', { ...form.value });
    };

    expose({ submitForm });

    return { t, form };
  },
});
</script>

<style scoped>
.req-doc-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.req-doc-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.req-doc-form__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.req-doc-form__input,
.req-doc-form__textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #f8fafc;
}

.req-doc-form__input:focus,
.req-doc-form__textarea:focus {
  border-color: var(--color-primary);
  background: #fff;
}

.req-doc-form__input::placeholder,
.req-doc-form__textarea::placeholder {
  color: #c4cdd5;
}

.req-doc-form__textarea {
  resize: vertical;
}
</style>
