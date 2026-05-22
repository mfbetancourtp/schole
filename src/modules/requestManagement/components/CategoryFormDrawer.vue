<template>
  <div class="cat-form">
    <!-- Basic Info -->
    <div class="cat-form__card">
      <h5 class="cat-form__section-title">{{ t('INFORMACIÓN BÁSICA') }}</h5>

      <div class="cat-form__field">
        <label class="cat-form__label">{{ t('Nombre') }} *</label>
        <input v-model="form.name" type="text" class="cat-form__input" :placeholder="t('Ej: Certificaciones Académicas')" />
      </div>
      <div>
        <label class="cat-form__label">{{ t('Código') }} *</label>
        <input v-model="form.code" type="text" class="cat-form__input" :placeholder="t('Ej: CERT_ACAD')" />
      </div>

      <div class="cat-form__field">
        <label class="cat-form__label">{{ t('Descripción') }} *</label>
        <textarea v-model="form.description" class="cat-form__textarea" :placeholder="t('Describe brevemente esta categoría...')" rows="4"></textarea>
      </div>
    </div>

    <!-- Configuration -->
    <div class="cat-form__card">
      <h5 class="cat-form__section-title">{{ t('CONFIGURACIÓN') }}</h5>

      <div class="cat-form__toggle-row">
        <div class="cat-form__toggle-info">
          <span class="cat-form__toggle-label">{{ t('Estado') }}</span>
          <span class="cat-form__toggle-desc">{{ t('Activar o desactivar esta categoría') }}</span>
        </div>
        <label class="cat-form__switch">
          <input type="checkbox" v-model="form.isActive" />
          <span class="cat-form__slider"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CategoryFormData } from '../dtos/requestConfiguration.dto';

export default defineComponent({
  name: 'CategoryFormDrawer',
  props: {
    initialData: {
      type: Object as PropType<CategoryFormData | null>,
      default: null,
    },
  },
  emits: ['submit'],
  setup(props, { emit, expose }) {
    const { t } = useI18n();

    const form = ref<CategoryFormData>({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });

    watch(
      () => props.initialData,
      (data) => {
        if (data) {
          form.value = { ...data };
        } else {
          form.value = { name: '', code: '', description: '', isActive: true };
        }
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
.cat-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cat-form__card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cat-form__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #212b36;
  letter-spacing: 0.5px;
  margin: 0;
  text-transform: uppercase;
}

.cat-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cat-form__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.cat-form__input {
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

.cat-form__input:focus {
  border-color: var(--color-primary);
  background: #fff;
}

.cat-form__input::placeholder {
  color: #c4cdd5;
}

.cat-form__textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #f8fafc;
}

.cat-form__textarea:focus {
  border-color: var(--color-primary);
  background: #fff;
}

.cat-form__textarea::placeholder {
  color: #c4cdd5;
}

/* Toggle Row */
.cat-form__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.cat-form__toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-form__toggle-label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.cat-form__toggle-desc {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

/* Switch */
.cat-form__switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.cat-form__switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.cat-form__slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #c4cdd5;
  transition: 0.3s;
  border-radius: 24px;
}

.cat-form__slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.cat-form__switch input:checked + .cat-form__slider {
  background-color: var(--color-primary);
}

.cat-form__switch input:checked + .cat-form__slider::before {
  transform: translateX(20px);
}
</style>
