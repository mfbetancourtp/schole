<template>
  <div class="basic-info-step">
    <div class="step-section">
      <h4 class="step-section__title">{{ t('Datos del proyecto') }}</h4>
      <p class="step-section__subtitle">
        {{ t('Ingrese la información principal de su proyecto de grado') }}
      </p>
    </div>

    <div class="form-row">
      <AppFormField :label="t('Título del Proyecto') + ' *'">
        <AppInput v-model="title" :placeholder="t('Ej: Sistema de gestión académica basado en IA')" />
      </AppFormField>
    </div>

    <div class="form-row">
      <AppFormField :label="t('Descripción del Proyecto') + ' *'">
        <textarea class="form-control" v-model="description" :placeholder="t('Describa brevemente los objetivos y alcance de su proyecto...')" rows="4"></textarea>
      </AppFormField>
    </div>

    <div class="form-row">
      <AppFormField :label="t('Facultad') + ' *'">
        <AppAutocomplete input-id="faculty" :options="faculties" label="name" :reduce="(o: any) => o.id" v-model="facultyId" :clearable="true" @search="onSearchFaculty" />
      </AppFormField>
    </div>

    <div class="step-section mt-4">
      <h4 class="step-section__title">{{ t('Tipo de Postulación') }}</h4>
    </div>

    <div class="type-cards">
      <div class="type-card" :class="{ 'type-card--active': postulationType === 'Individual' }" @click="selectPostulationType('Individual')">
        <div class="type-card__icon">
          <AppIcon icon="user" />
        </div>
        <div class="type-card__content">
          <strong>{{ t('Individual') }}</strong>
          <span>{{ t('Proyecto desarrollado por un solo estudiante') }}</span>
        </div>
      </div>

      <div class="type-card" :class="{ 'type-card--active': postulationType === 'En Pareja/Equipo' }" @click="selectPostulationType('En Pareja/Equipo')">
        <div class="type-card__icon">
          <AppIcon icon="users" />
        </div>
        <div class="type-card__content">
          <strong>{{ t('En Pareja / Equipo') }}</strong>
          <span>{{ t('Proyecto colaborativo entre estudiantes') }}</span>
        </div>
      </div>
    </div>

    <div v-if="postulationType === 'En Pareja/Equipo'" class="partner-section mt-3">
      <AppFormField :label="t('Buscar Compañero') + ' *'">
        <AppAutocomplete input-id="partner" :options="partnerOptions" label="fullName" :reduce="(o: any) => o.id" v-model="partnerId" :clearable="true" @search="onSearchPartner" />
      </AppFormField>

      <div class="partner-note">
        <AppIcon icon="info-circle" />
        <span>{{ t('Su compañero recibirá una notificación para confirmar la participación en el proyecto.') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import type { PostulationFormData } from '../dtos/postulation.dto';
import type { FacultyDto } from '../dtos/applicationProject.dto';
import { GetFacultiesService } from '../services/getFaculties.service';
import { GetUsersForSelectService } from '../../../shared/services/getUsersForSelect.service';

export default defineComponent({
  name: 'BasicInfoStep',
  components: { AppFormField, AppAutocomplete, AppIcon, AppInput },
  props: {
    form: {
      type: Object as PropType<PostulationFormData>,
      required: true,
    },
  },
  emits: ['update:form'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const faculties = ref<FacultyDto[]>([]);
    const partnerOptions = ref<any[]>([]);

    const updateForm = <K extends keyof PostulationFormData>(key: K, value: PostulationFormData[K]) => {
      emit('update:form', { ...props.form, [key]: value });
    };

    const title = computed({
      get: () => props.form.title,
      set: (v: string) => updateForm('title', v),
    });

    const description = computed({
      get: () => props.form.description,
      set: (v: string) => updateForm('description', v),
    });

    const facultyId = computed({
      get: () => props.form.facultyId,
      set: (v: number | null) => updateForm('facultyId', v),
    });

    const postulationType = computed({
      get: () => props.form.postulationType,
      set: (v: PostulationFormData['postulationType']) => updateForm('postulationType', v),
    });

    const partnerId = computed({
      get: () => props.form.partnerId,
      set: (v: number | null) => updateForm('partnerId', v),
    });

    const selectPostulationType = (value: PostulationFormData['postulationType']) => {
      updateForm('postulationType', value);
      if (value !== 'En Pareja/Equipo') updateForm('partnerId', null);
    };

    const onSearchFaculty = async (query: string, setLoading: (v: boolean) => void) => {
      setLoading(true);
      try {
        const result = await new GetFacultiesService().run({
          page: 1,
          perPage: 15,
          noPag: 'true',
          search: query || undefined,
        });
        faculties.value = Array.isArray(result) ? result : (result as any).data ?? [];
      } finally {
        setLoading(false);
      }
    };

    const onSearchPartner = async (query: string, setLoading: (v: boolean) => void) => {
      if (!query || query.length < 2) return;
      setLoading(true);
      try {
        const result = await new GetUsersForSelectService().run({
          search: query,
        });
        const mapped = (result.data ?? []).map((u: any) => ({
          ...u,
          fullName: `${u.people.names} ${u.people.lastnames}`,
        }));

        // Preserve selected item so AppAutocomplete watcher doesn't clear it
        if (partnerId.value) {
          const stillInList = mapped.some((u: any) => u.id === partnerId.value);
          if (!stillInList) {
            const current = partnerOptions.value.find((u: any) => u.id === partnerId.value);
            if (current) mapped.unshift(current);
          }
        }

        partnerOptions.value = mapped;
      } finally {
        setLoading(false);
      }
    };

    return {
      t,
      faculties,
      partnerOptions,
      title,
      description,
      facultyId,
      postulationType,
      partnerId,
      selectPostulationType,
      onSearchFaculty,
      onSearchPartner,
    };
  },
});
</script>

<style scoped>
.step-section {
  margin-bottom: 1rem;
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

.type-cards {
  display: flex;
  gap: 12px;
}

.type-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #e4e7ec;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.type-card:hover {
  border-color: #919eab;
}

.type-card--active {
  border-color: var(--color-primary);
  background: rgba(145, 158, 171, 0.08);
}

.type-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f4f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #637381;
  flex-shrink: 0;
}

.type-card--active .type-card__icon {
  background: var(--color-primary);
  color: var(--color-light);
}

.type-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.type-card__content strong {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.type-card__content span {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #637381;
}

.partner-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
  color: #637381;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  margin-top: 8px;
}

@media (max-width: 576px) {
  .type-cards {
    flex-direction: column;
  }
}
</style>
