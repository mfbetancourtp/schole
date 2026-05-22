<template>
  <form @submit.prevent="save">
    <div class="row g-3">
      <div class="col-12">
        <AppFormField :form-control="v$.form.jobTitle" label="Cargo / Posición">
          <input type="text" class="form-control" v-model="v$.form.jobTitle.$model" placeholder="ej. Senior Full Stack Developer" />
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.company" label="Empresa">
          <input type="text" class="form-control" v-model="v$.form.company.$model" placeholder="ej. TechCorp Solutions" />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField label="Área profesional">
          <input type="text" class="form-control" v-model="form.area" placeholder="ej. Desarrollo de Software" />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField label="Ciudad">
          <AppGeographicSearch search-key="city" label="name" :id="form.municipalityId || undefined" @geographicData="onMunicipalitySelect" />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField :form-control="v$.form.startDate" label="Fecha de inicio">
          <input type="date" class="form-control" v-model="v$.form.startDate.$model" />
        </AppFormField>
      </div>

      <div class="col-md-6" v-if="!form.currentlyWorksThere">
        <AppFormField label="Fecha de finalización">
          <input type="date" class="form-control" v-model="form.endDate" />
        </AppFormField>
      </div>

      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="currentJob" v-model="form.currentlyWorksThere" />
          <label class="form-check-label" for="currentJob">Actualmente trabajo aquí</label>
        </div>
      </div>

      <div class="col-12">
        <AppFormField label="Descripción de funciones">
          <textarea
            class="form-control"
            v-model="form.functionsDescription"
            rows="5"
            placeholder="Describe tus responsabilidades principales, logros destacados y tecnologías utilizadas..."
          ></textarea>
        </AppFormField>
        <small class="text-muted hint-text">Incluye logros cuantificables y tecnologías que utilizaste</small>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { AuthenticatedUserService } from '../../../shared/services/authenticatedUser.service';
import type { UpsertWorkExperienceRequest, WorkExperience } from '../dtos/graduateProfile.dto';
import { normalizeWorkExperience } from '../dtos/graduateProfile.dto';
import { CreateOrUpdateWorkExperienceService } from '../services/createOrUpdateWorkExperience.service';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'WorkExperienceForm',
  components: { AppGeographicSearch, AppFormField },
  props: {
    data: { type: Object as PropType<WorkExperience | null>, default: null },
  },
  emits: ['save'],
  setup(props, { emit, expose }) {
    const saving = ref(false);
    const authenticatedUserService = new AuthenticatedUserService();
    const createOrUpdateWorkExperienceService = new CreateOrUpdateWorkExperienceService();

    const toISODate = (dateStr?: string | null): string => {
      if (!dateStr || typeof dateStr !== 'string') return '';
      if (dateStr.includes('-')) return dateStr.slice(0, 10);
      if (dateStr.includes('/')) {
        const [mm, dd, yyyy] = dateStr.split('/');
        const y = Number(yyyy),
          m = Number(mm),
          d = Number(dd);
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return '';
        return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
      return '';
    };

    const isoToDDMMYYYY = (iso: string): string | null => {
      if (!iso || typeof iso !== 'string' || !iso.includes('-')) return null;
      const [yyyy, mm, dd] = iso.slice(0, 10).split('-');
      if (!yyyy || !mm || !dd) return null;
      return `${mm}/${dd}/${yyyy}`;
    };

    const form = reactive({
      jobTitle: props.data?.jobTitle ?? '',
      company: props.data?.company ?? '',
      area: props.data?.area ?? '',
      municipalityId: props.data?.municipalityId ?? ('' as any),
      startDate: toISODate(props.data?.startDate),
      endDate: toISODate(props.data?.endDate),
      currentlyWorksThere: props.data?.currentlyWorksThere === 1,
      functionsDescription: props.data?.functionsDescription ?? '',
    });

    const v$ = useVuelidate(
      {
        form: {
          jobTitle: { required },
          company: { required },
          startDate: { required },
        },
      },
      { form },
      { $scope: false }
    );

    watch(
      () => props.data,
      (next) => {
        form.jobTitle = next?.jobTitle ?? '';
        form.company = next?.company ?? '';
        form.area = next?.area ?? '';
        form.municipalityId = next?.municipalityId ?? ('' as any);
        form.startDate = toISODate(next?.startDate);
        form.endDate = toISODate(next?.endDate);
        form.currentlyWorksThere = next?.currentlyWorksThere === 1;
        form.functionsDescription = next?.functionsDescription ?? '';
        v$.value.$reset();
      }
    );

    const onMunicipalitySelect = (municipality: any) => {
      form.municipalityId = municipality?.id ?? null;
    };

    const save = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      saving.value = true;
      try {
        const user = authenticatedUserService.get();
        const peopleId = Number(user?.people?.id ?? props.data?.peopleId ?? 0);
        const municipalityIdRaw = Number(form.municipalityId);
        const municipalityId = Number.isFinite(municipalityIdRaw) && municipalityIdRaw > 0 ? municipalityIdRaw : null;
        const startDate = isoToDDMMYYYY(form.startDate);
        const endDate = form.currentlyWorksThere ? null : form.endDate ? isoToDDMMYYYY(form.endDate) : null;
        if (!peopleId || !startDate) return;
        const payload: UpsertWorkExperienceRequest = {
          peopleId,
          jobTitle: form.jobTitle,
          company: form.company,
          area: form.area,
          municipalityId,
          startDate,
          endDate,
          currentlyWorksThere: form.currentlyWorksThere ? 1 : 0,
          functionsDescription: form.functionsDescription,
        };
        const saved = await createOrUpdateWorkExperienceService.run(payload, props.data?.id ?? undefined);
        emit('save', normalizeWorkExperience((saved as any)?.data ?? saved));
      } finally {
        saving.value = false;
      }
    };

    const submitForm = () => save();
    expose({ submitForm });

    return { form, v$, save, onMunicipalitySelect };
  },
});
</script>

<style scoped>
.hint-text {
  display: block;
  margin-top: -0.5rem;
  margin-bottom: 0.25rem;
}
</style>
