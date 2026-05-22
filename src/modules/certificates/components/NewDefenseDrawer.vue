<template>
  <div class="new-defense">
    <p class="new-defense__subtitle">
      {{ t('Complete los datos para programar una sustentación') }}
    </p>

    <!-- Proyecto -->
    <AppFormField :label="`${t('Proyecto')} *`">
      <AppSelect v-model="form.projectId" :disabled="disableProject">
        <option :value="null" disabled>
          {{ t('Seleccione un proyecto') }}
        </option>
        <option v-for="project in projectOptions" :key="project.id" :value="project.id">
          {{ project.label }}
        </option>
      </AppSelect>
    </AppFormField>

    <!-- Fecha + Hora -->
    <div class="new-defense__row">
      <AppFormField :label="`${t('Fecha')} *`">
        <AppDateInput v-model="form.date" id="defense-date" />
      </AppFormField>
      <AppFormField :label="`${t('Hora de Inicio')} *`">
        <input v-model="form.startTime" type="time" class="form-control" />
      </AppFormField>
    </div>

    <!-- Duración + Estado -->
    <div class="new-defense__row">
      <AppFormField :label="t('Duración (horas)')">
        <AppInput v-model="form.duration" type="number" />
      </AppFormField>
      <AppFormField :label="t('Estado')">
        <AppSelect v-model="form.status">
          <option value="scheduled">{{ t('Programada') }}</option>
          <option value="completed">{{ t('Completada') }}</option>
          <option value="cancelled">{{ t('Cancelada') }}</option>
        </AppSelect>
      </AppFormField>
    </div>

    <!-- Modalidad -->
    <AppFormField :label="`${t('Modalidad')} *`">
      <div class="new-defense__radio-group">
        <label class="new-defense__radio">
          <input type="radio" v-model="form.modality" value="inPerson" class="new-defense__radio-input" />
          <span>{{ t('Presencial') }}</span>
        </label>
        <label class="new-defense__radio">
          <input type="radio" v-model="form.modality" value="virtual" class="new-defense__radio-input" />
          <span>{{ t('Virtual') }}</span>
        </label>
      </div>
    </AppFormField>

    <!-- Ubicación -->
    <AppFormField :label="`${t('Ubicación')} *`">
      <AppInput v-model="form.location" :placeholder="t('Ej: Auditorio A - Edificio Principal')" />
    </AppFormField>

    <!-- Enlace de Reunión -->
    <AppFormField :label="t('Enlace de Reunión (si es virtual)')">
      <AppInput v-model="form.meetingLink" placeholder="https://meet.akademia.edu/..." />
    </AppFormField>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, type PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ProjectOption, NewDefenseForm } from '../dtos/defenseCalendar.dto';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppDateInput from '../../../shared/components/Forms/AppDateInput.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';

export default defineComponent({
  name: 'NewDefenseDrawer',
  components: { AppFormField, AppSelect, AppDateInput, AppInput },
  props: {
    projectOptions: {
      type: Array as PropType<ProjectOption[]>,
      required: true,
    },
    initialForm: {
      type: Object as PropType<Partial<NewDefenseForm> | null>,
      default: null,
    },
    disableProject: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { expose }) {
    const { t } = useI18n();

    const form = reactive<NewDefenseForm>({
      projectId: null,
      date: '',
      startTime: '',
      duration: 2,
      status: 'scheduled',
      modality: 'inPerson',
      location: '',
      meetingLink: '',
    });

    watch(
      () => props.initialForm,
      (value) => {
        if (!value) return;
        if (value.projectId !== undefined) form.projectId = value.projectId;
        if (value.date !== undefined) form.date = value.date;
        if (value.startTime !== undefined) form.startTime = value.startTime;
        if (value.duration !== undefined) form.duration = value.duration;
        if (value.status !== undefined) form.status = value.status;
        if (value.modality !== undefined) form.modality = value.modality;
        if (value.location !== undefined) form.location = value.location;
        if (value.meetingLink !== undefined) form.meetingLink = value.meetingLink;
      },
      { immediate: true }
    );

    const getFormData = (): NewDefenseForm => ({ ...form });

    expose({ getFormData });

    return { t, form };
  },
});
</script>

<style scoped>
.new-defense {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 12px;
}

.new-defense__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 0;
}

.new-defense__row {
  display: flex;
  gap: 20px;
}

.new-defense__row > :deep(.ak-form-field) {
  flex: 1;
}

.new-defense__radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.new-defense__radio {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
}

.new-defense__radio-input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
  margin: 0;
}
</style>
