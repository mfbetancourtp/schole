<template>
  <form @submit.prevent="save">
    <div class="row g-3">
      <div class="col-12">
        <AppFormField :form-control="v$.form.languageId" label="Idioma">
          <select class="form-control" v-model="v$.form.languageId.$model" :class="{ 'is-invalid': v$.form.languageId.$error }" @change="onLanguageChange">
            <option value="">Seleccionar idioma</option>
            <option v-for="lang in availableLanguages" :key="lang.id" :value="lang.id">
              {{ lang.name }}
            </option>
          </select>
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.readingLevel" label="Nivel de lectura">
          <div
            class="lang-level-options"
            :class="{
              'lang-level-options--error': v$.form.readingLevel.$error,
            }"
          >
            <div
              v-for="level in languageLevels"
              :key="level"
              class="lang-level-option"
              :class="{
                'lang-level-option--selected': v$.form.readingLevel.$model === level,
              }"
              @click="v$.form.readingLevel.$model = level"
            >
              <span class="level-dot" :class="`level-dot--${levelClass(level)}`"></span>
              <span class="level-text">{{ level }}</span>
            </div>
          </div>
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.writingLevel" label="Nivel de escritura">
          <div
            class="lang-level-options"
            :class="{
              'lang-level-options--error': v$.form.writingLevel.$error,
            }"
          >
            <div
              v-for="level in languageLevels"
              :key="level"
              class="lang-level-option"
              :class="{
                'lang-level-option--selected': v$.form.writingLevel.$model === level,
              }"
              @click="v$.form.writingLevel.$model = level"
            >
              <span class="level-dot" :class="`level-dot--${levelClass(level)}`"></span>
              <span class="level-text">{{ level }}</span>
            </div>
          </div>
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.conversationLevel" label="Nivel de conversación">
          <div
            class="lang-level-options"
            :class="{
              'lang-level-options--error': v$.form.conversationLevel.$error,
            }"
          >
            <div
              v-for="level in languageLevels"
              :key="level"
              class="lang-level-option"
              :class="{
                'lang-level-option--selected': v$.form.conversationLevel.$model === level,
              }"
              @click="v$.form.conversationLevel.$model = level"
            >
              <span class="level-dot" :class="`level-dot--${levelClass(level)}`"></span>
              <span class="level-text">{{ level }}</span>
            </div>
          </div>
        </AppFormField>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { LanguageDto, LanguageLevel } from '../dtos/language.dto';
import { GetAllLanguagesService } from '../../superAdmin/services/getAllLanguages.service';
import { AuthenticatedUserService } from '../../../shared/services/authenticatedUser.service';

const LEVELS: LanguageLevel[] = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

export default defineComponent({
  name: 'LanguageForm',
  components: { AppFormField },
  props: {
    data: { type: Object as PropType<LanguageDto | null>, default: null },
    usedLanguageIds: { type: Array as PropType<number[]>, default: () => [] },
  },
  emits: ['save'],
  setup(props, { emit, expose }) {
    const languages = ref<any[]>([]);
    const getAllLanguagesService = new GetAllLanguagesService();
    const authenticatedUserService = new AuthenticatedUserService();

    const form = reactive({
      languageId: '' as any,
      languageName: props.data?.language ?? '',
      readingLevel: props.data?.readingLevel ?? ('' as any),
      writingLevel: props.data?.writingLevel ?? ('' as any),
      conversationLevel: props.data?.conversationLevel ?? ('' as any),
    });

    const v$ = useVuelidate(
      {
        form: {
          languageId: { required },
          readingLevel: { required },
          writingLevel: { required },
          conversationLevel: { required },
        },
      },
      { form },
      { $scope: false }
    );

    const availableLanguages = computed(() => languages.value.filter((l) => !props.usedLanguageIds.includes(l.id) || l.id === form.languageId));

    const onLanguageChange = () => {
      const found = languages.value.find((l) => l.id === form.languageId);
      if (found) form.languageName = found.name || '';
    };

    const levelClass = (level: LanguageLevel) =>
      ({
        Básico: 'basic',
        Intermedio: 'intermediate',
        Avanzado: 'advanced',
        Nativo: 'native',
      }[level]);

    const save = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      const user = authenticatedUserService.get();
      const peopleId = Number(user?.people?.id ?? props.data?.peopleId ?? 0);
      const payload = {
        peopleId,
        languageId: Number(form.languageId),
        readingLevel: form.readingLevel,
        writingLevel: form.writingLevel,
        speakingLevel: form.conversationLevel,
      };
      emit('save', payload);
    };

    const submitForm = () => save();
    expose({ submitForm });

    onMounted(async () => {
      try {
        const response = await getAllLanguagesService.run();
        languages.value = Array.isArray(response) ? response : response?.data ?? [];
        if (props.data?.language) {
          const match = languages.value.find((l) => l.name === props.data!.language);
          if (match) form.languageId = match.id;
        }
      } catch (error) {
        console.error('Error loading available languages:', error);
      }
    });

    return {
      form,
      v$,
      save,
      languages,
      availableLanguages,
      languageLevels: LEVELS,
      onLanguageChange,
      levelClass,
    };
  },
});
</script>

<style scoped>
.lang-level-options {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  border-radius: 6px;
}
.lang-level-options--error {
  border: 1px solid #dc3545;
  border-radius: 6px;
  padding: 4px;
}
.lang-level-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.lang-level-option:hover {
  border-color: #94a3b8;
}
.lang-level-option--selected {
  border-color: #3b82f6;
  background: #eff6ff;
}
.lang-level-option--selected .level-text {
  color: #2563eb;
  font-weight: 500;
}
.level-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.level-dot--basic {
  background: #94a3b8;
}
.level-dot--intermediate {
  background: #f59e0b;
}
.level-dot--advanced {
  background: #3b82f6;
}
.level-dot--native {
  background: #10b981;
}
.level-text {
  font-size: 0.875rem;
  color: #374151;
}
</style>
