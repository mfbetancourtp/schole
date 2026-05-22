<template>
  <form @submit.prevent="save">
    <div class="row g-3">
      <div class="col-12">
        <AppFormField :form-control="v$.form.institution" label="Institución educativa">
          <input type="text" class="form-control" v-model="v$.form.institution.$model" placeholder="ej. Coursera" />
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.studyTypeId" label="Tipo de estudio">
          <select class="form-control" v-model="v$.form.studyTypeId.$model" :class="{ 'is-invalid': v$.form.studyTypeId.$error }">
            <option value="">Selecciona un tipo de estudio</option>
            <option v-for="studyType in studyTypes" :key="studyType.id" :value="studyType.id">
              {{ studyType.name }}
            </option>
          </select>
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.title" label="Título">
          <input type="text" class="form-control" v-model="v$.form.title.$model" placeholder="ej. Curso de programación en Typescript" />
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField label="Área">
          <input type="text" class="form-control" v-model="form.area" placeholder="ej. Desarrollo de Software" />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField :form-control="v$.form.startDate" label="Fecha de inicio">
          <input type="date" class="form-control" v-model="v$.form.startDate.$model" />
        </AppFormField>
      </div>

      <div class="col-md-6" v-if="!form.currentlyStudyThere">
        <AppFormField label="Fecha de finalización">
          <input type="date" class="form-control" v-model="form.endDate" />
        </AppFormField>
      </div>

      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="currentlyStudyThere" v-model="form.currentlyStudyThere" />
          <label class="form-check-label" for="currentlyStudyThere">Actualmente estudio aquí</label>
        </div>
      </div>

      <div class="col-12">
        <AppFormField label="Descripción">
          <textarea class="form-control" v-model="form.description" rows="4" placeholder="Curso para aprender programación en Typescript"></textarea>
        </AppFormField>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { AuthenticatedUserService } from '../../../shared/services/authenticatedUser.service';
import type { AdditionalEducation, UpsertAdditionalEducationRequest, AdditionalEducationStudyType } from '../dtos/graduateProfile.dto';
import { normalizeAdditionalEducation } from '../dtos/graduateProfile.dto';
import { CreateOrUpdateAdditionalEducationService } from '../services/createOrUpdateAdditionalEducation.service';
import { GetStudyTypesService } from '../services/getStudyTypes.service';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'AdditionalEducationForm',
  components: { AppFormField },
  props: {
    data: {
      type: Object as PropType<AdditionalEducation | null>,
      default: null,
    },
  },
  emits: ['save'],
  setup(props, { emit, expose }) {
    const saving = ref(false);
    const studyTypes = ref<AdditionalEducationStudyType[]>([]);
    const authenticatedUserService = new AuthenticatedUserService();
    const createOrUpdateAdditionalEducationService = new CreateOrUpdateAdditionalEducationService();
    const getStudyTypesService = new GetStudyTypesService();

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
      institution: props.data?.institution ?? '',
      studyTypeId: props.data?.studyTypeId ?? ('' as any),
      title: props.data?.title ?? '',
      area: props.data?.area ?? '',
      startDate: toISODate(props.data?.startDate),
      endDate: toISODate(props.data?.endDate),
      currentlyStudyThere: props.data?.currentlyStudyThere === 1,
      description: props.data?.description ?? '',
    });

    const v$ = useVuelidate(
      {
        form: {
          institution: { required },
          studyTypeId: { required },
          title: { required },
          startDate: { required },
        },
      },
      { form },
      { $scope: false }
    );

    watch(
      () => props.data,
      (next) => {
        form.institution = next?.institution ?? '';
        form.studyTypeId = next?.studyTypeId ?? ('' as any);
        form.title = next?.title ?? '';
        form.area = next?.area ?? '';
        form.startDate = toISODate(next?.startDate);
        form.endDate = toISODate(next?.endDate);
        form.currentlyStudyThere = next?.currentlyStudyThere === 1;
        form.description = next?.description ?? '';
        v$.value.$reset();
      }
    );

    const save = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      saving.value = true;
      try {
        const user = authenticatedUserService.get();
        const peopleId = Number(user?.people?.id ?? props.data?.peopleId ?? 0);
        const studyTypeId = Number(form.studyTypeId);
        const startDate = isoToDDMMYYYY(form.startDate);
        const endDate = form.currentlyStudyThere ? null : form.endDate ? isoToDDMMYYYY(form.endDate) : null;
        if (!peopleId || !startDate || !Number.isFinite(studyTypeId) || studyTypeId <= 0) return;
        const payload: UpsertAdditionalEducationRequest = {
          peopleId,
          title: form.title,
          educationTypesId: studyTypeId,
          institution: form.institution,
          area: form.area,
          startDate,
          endDate,
          currentlyStudyThere: form.currentlyStudyThere ? 1 : 0,
          description: form.description,
        };
        const saved = await createOrUpdateAdditionalEducationService.run(payload, props.data?.id ?? undefined);
        emit('save', normalizeAdditionalEducation((saved as any)?.data ?? saved));
      } finally {
        saving.value = false;
      }
    };

    const submitForm = () => save();
    expose({ submitForm });

    onMounted(async () => {
      try {
        const user = authenticatedUserService.get();
        const institutionId = Number(user?.people?.institutionId ?? 0);
        if (!institutionId) return;
        const response = await getStudyTypesService.run({
          institutionId,
          noPag: false,
        });
        studyTypes.value = Array.isArray(response) ? response : response?.data ?? [];
      } catch (error) {
        console.error('Error loading study types:', error);
      }
    });

    return { form, v$, save, studyTypes };
  },
});
</script>
