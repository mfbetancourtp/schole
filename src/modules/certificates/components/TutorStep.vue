<template>
  <div class="tutor-step">
    <div class="step-section">
      <h4 class="step-section__title">{{ t('Tutor') }}</h4>
      <p class="step-section__subtitle">
        {{ t('Seleccione un asesor para su proyecto de grado') }}
      </p>
    </div>

    <div class="form-row">
      <AppFormField :label="t('Seleccionar Tutor') + ' *'">
        <AppAutocomplete input-id="tutor" :options="tutorOptions" label="fullName" :reduce="(o: any) => o.id" v-model="tutorId" :clearable="true" :disabled="noTutorDefined" @search="onSearchTutor" />
      </AppFormField>
    </div>

    <div class="tutor-checkbox mt-2">
      <label class="checkbox-label">
        <input type="checkbox" v-model="noTutorDefined" @change="onNoTutorChange" />
        <span>{{ t('No tengo un tutor definido, deseo que la facultad me asigne uno según mi tema') }}</span>
      </label>
    </div>

    <div class="tutor-info mt-4">
      <div class="tutor-info__header">
        <AppIcon icon="info-circle" />
        <strong>{{ t('Información importante') }}</strong>
      </div>
      <ul class="tutor-info__list">
        <li>
          {{ t('El tutor asignado será su asesor durante todo el desarrollo del proyecto.') }}
        </li>
        <li>
          {{ t('Si no selecciona tutor, la facultad le asignará uno en un plazo de 5 días hábiles.') }}
        </li>
        <li>
          {{ t('Puede cambiar de tutor durante el primer mes, sujeto a aprobación del comité académico.') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { PostulationFormData } from '../dtos/postulation.dto';
import type { AdministrativeUserDto } from '../dtos/applicationProject.dto';
import { GetAdministrativeUsersService } from '../services/getAdministrativeUsers.service';

export default defineComponent({
  name: 'TutorStep',
  components: { AppFormField, AppAutocomplete, AppIcon },
  props: {
    form: {
      type: Object as PropType<PostulationFormData>,
      required: true,
    },
  },
  emits: ['update:form'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const tutorOptions = ref<AdministrativeUserDto[]>([]);

    const updateForm = <K extends keyof PostulationFormData>(key: K, value: PostulationFormData[K]) => {
      emit('update:form', { ...props.form, [key]: value });
    };

    const tutorId = computed({
      get: () => props.form.tutorId,
      set: (v: number | null) => updateForm('tutorId', v),
    });

    const noTutorDefined = computed({
      get: () => props.form.noTutorDefined,
      set: (v: boolean) => updateForm('noTutorDefined', v),
    });

    const onNoTutorChange = () => {
      if (noTutorDefined.value) updateForm('tutorId', null);
    };

    const onSearchTutor = async (query: string, setLoading: (v: boolean) => void) => {
      setLoading(true);
      try {
        const result = await new GetAdministrativeUsersService().run({
          page: 1,
          perPage: 15,
          order: 'asc',
          search: query || undefined,
        });
        const raw: any[] = Array.isArray(result) ? result : (result as any).data ?? [];
        const mapped = raw.map((u) => ({
          ...u,
          fullName: `${u.people.names} ${u.people.lastnames}`,
        }));

        // Preserve selected item so AppAutocomplete watcher doesn't clear it
        if (tutorId.value) {
          const stillInList = mapped.some((u) => u.id === tutorId.value);
          if (!stillInList) {
            const current = tutorOptions.value.find((u) => u.id === tutorId.value);
            if (current) mapped.unshift(current);
          }
        }

        tutorOptions.value = mapped;
      } finally {
        setLoading(false);
      }
    };

    return {
      t,
      tutorOptions,
      tutorId,
      noTutorDefined,
      onNoTutorChange,
      onSearchTutor,
    };
  },
});
</script>

<style scoped>
.step-section {
  margin-bottom: 20px;
}

.step-section__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #212b36;
  margin-bottom: 4px;
}

.step-section__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
}

.tutor-checkbox {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
}

.checkbox-label input[type='checkbox'] {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  flex-shrink: 0;
}

.tutor-info {
  background: #f6fff9;
  border-radius: 12px;
  padding: 14px 16px;
  border-left: 3px solid var(--color-success, #22c55e);
  margin-bottom: 8px;
}

.tutor-info__header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #15803d;
  margin-bottom: 10px;
}

.tutor-info__header strong {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
}

.tutor-info__list {
  margin: 0;
  padding-left: 18px;
}

.tutor-info__list li {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #166534;
  line-height: 1.6;
}
</style>
