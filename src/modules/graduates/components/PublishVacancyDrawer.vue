<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader
        :variant="data ? 'edit' : 'create'"
        :icon="data ? 'edit' : 'bullhorn'"
        :title="data ? 'Editar vacante' : 'Publicar vacante'"
        subtitle="Completa la información de la oferta laboral"
      />
    </template>

    <template #body>
      <div class="drawer-section" v-if="isVisible">
        <div class="row g-3">
          <!-- Nombre del cargo -->
          <div class="col-12">
            <AppFormField label="Nombre del cargo *">
              <input type="text" class="form-control" v-model="form.name" :class="{ 'is-invalid': errors.name }" placeholder="ej. Desarrollador Backend Senior" />
              <div class="invalid-feedback">{{ errors.name }}</div>
            </AppFormField>
          </div>

          <!-- Empresa -->
          <div class="col-md-6">
            <AppFormField label="Empresa *">
              <AppAutocomplete v-model="form.companyId" :options="companies" label="name" :filterable="false" :class="{ 'is-invalid': errors.companyId }" @search="searchCompanies" />
              <div class="invalid-feedback d-block" v-if="errors.companyId">
                {{ errors.companyId }}
              </div>
            </AppFormField>
          </div>

          <!-- Modalidad -->
          <div class="col-md-6">
            <AppFormField label="Modalidad *">
              <select class="form-select" v-model="form.modalityTypeId" :class="{ 'is-invalid': errors.modalityTypeId }">
                <option :value="null">Seleccionar</option>
                <option v-for="opt in modalityTypes" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
              <div class="invalid-feedback">{{ errors.modalityTypeId }}</div>
            </AppFormField>
          </div>

          <!-- Tipo de contrato -->
          <div class="col-md-6">
            <AppFormField label="Tipo de contrato *">
              <select class="form-select" v-model="form.contractTypeId" :class="{ 'is-invalid': errors.contractTypeId }">
                <option :value="null">Seleccionar</option>
                <option v-for="opt in contractTypes" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
              <div class="invalid-feedback">{{ errors.contractTypeId }}</div>
            </AppFormField>
          </div>

          <!-- Área profesional -->
          <div class="col-md-6">
            <AppFormField label="Área profesional">
              <select class="form-select" v-model="form.professionalAreaId">
                <option :value="null">Seleccionar</option>
                <option v-for="opt in professionalAreas" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
            </AppFormField>
          </div>

          <!-- Ciudad -->
          <div class="col-md-6">
            <AppFormField label="Ciudad">
              <AppGeographicSearch search-key="city" label="name" :id="form.municipalityId || undefined" @geographicData="onCitySelect" />
            </AppFormField>
          </div>

          <!-- Nivel de experiencia -->
          <div class="col-md-6">
            <AppFormField label="Nivel de experiencia">
              <select class="form-select" v-model="form.experienceLevelId">
                <option :value="null">Seleccionar</option>
                <option v-for="opt in experienceLevels" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
            </AppFormField>
          </div>

          <!-- Salario y fecha límite -->
          <div class="col-12">
            <div class="salary-date-group">
              <AppFormField label="Salario mínimo (COP)">
                <input type="number" class="form-control" v-model.number="form.salaryRangeMin" min="0" placeholder="ej. 2000000" />
              </AppFormField>
              <AppFormField label="Salario máximo (COP)">
                <input type="number" class="form-control" v-model.number="form.salaryRangeMax" min="0" placeholder="ej. 4000000" />
              </AppFormField>
              <AppFormField label="Fecha límite de aplicación">
                <input type="date" class="form-control" v-model="form.applicationDeadlineInput" :min="today" />
              </AppFormField>
            </div>
          </div>

          <!-- Descripción -->
          <div class="col-12">
            <AppFormField label="Descripción del cargo *">
              <textarea
                class="form-control"
                v-model="form.description"
                rows="4"
                placeholder="Describe las responsabilidades y el rol dentro de la empresa..."
                :class="{ 'is-invalid': errors.description }"
              ></textarea>
              <div class="invalid-feedback">{{ errors.description }}</div>
            </AppFormField>
          </div>

          <!-- Requisitos -->
          <div class="col-12">
            <AppFormField label="Requisitos *">
              <textarea
                class="form-control"
                v-model="form.requirements"
                rows="4"
                placeholder="Formación académica, experiencia mínima, conocimientos específicos..."
                :class="{ 'is-invalid': errors.requirements }"
              ></textarea>
              <div class="invalid-feedback">{{ errors.requirements }}</div>
            </AppFormField>
          </div>

          <!-- Beneficios -->
          <div class="col-12">
            <AppFormField label="Beneficios">
              <textarea class="form-control" v-model="form.benefits" rows="3" placeholder="Auxilio de transporte, seguros, plan carrera, bonificaciones..."></textarea>
            </AppFormField>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
          <AppButton variant="primary" nativeType="button" :loading="saving" @click="submit">
            {{ data ? 'Guardar cambios' : 'Publicar vacante' }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch } from 'vue';
import { debounce } from 'ts-debounce';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import { CreateOrUpdateJobVacancyService } from '../services/createOrUpdateJobVacancy.service';
import { GetJobVacancyCompaniesService } from '../services/getJobVacancyCompanies.service';
import { GetModalityTypesService } from '../../institutionalConfiguration/services/getModalityTypes.service';
import { GetContractTypesService } from '../services/getContractTypes.service';
import { GetExperienceLevelsService } from '../services/getExperienceLevels.service';
import { GetProfessionalAreasService } from '../services/getProfessionalAreas.service';
import { JobVacancyCatalogItem, UpsertJobVacancyRequest } from '../dtos/vacancy.dto';

export default defineComponent({
  name: 'PublishVacancyDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppGeographicSearch,
  },
  props: {
    isVisible: { type: Boolean, required: true },
    data: {
      type: Object as PropType<({ id: number } & Partial<UpsertJobVacancyRequest>) | null>,
      default: null,
    },
  },
  emits: ['update:isVisible', 'save'],
  setup(props, { emit }) {
    const saving = ref(false);
    const today = new Date().toISOString().split('T')[0];

    const form = reactive({
      name: '',
      companyId: null as number | null,
      modalityTypeId: null as number | null,
      contractTypeId: null as number | null,
      professionalAreaId: null as number | null,
      municipalityId: null as number | null,
      salaryRangeMin: null as number | null,
      salaryRangeMax: null as number | null,
      experienceLevelId: null as number | null,
      description: '',
      requirements: '',
      benefits: '',
      applicationDeadlineInput: '',
    });

    const errors = reactive({
      name: '',
      companyId: '',
      modalityTypeId: '',
      contractTypeId: '',
      description: '',
      requirements: '',
    });

    const companies = ref<JobVacancyCatalogItem[]>([]);
    const modalityTypes = ref<JobVacancyCatalogItem[]>([]);
    const contractTypes = ref<JobVacancyCatalogItem[]>([]);
    const experienceLevels = ref<JobVacancyCatalogItem[]>([]);
    const professionalAreas = ref<JobVacancyCatalogItem[]>([]);

    const createOrUpdateService = new CreateOrUpdateJobVacancyService();
    const companiesService = new GetJobVacancyCompaniesService();
    const modalityTypesService = new GetModalityTypesService();
    const contractTypesService = new GetContractTypesService();
    const experienceLevelsService = new GetExperienceLevelsService();
    const professionalAreasService = new GetProfessionalAreasService();

    const loadCatalogs = async () => {
      const [modRes, ctRes, expRes, paRes, compRes] = await Promise.allSettled([
        modalityTypesService.run(),
        contractTypesService.run(),
        experienceLevelsService.run(),
        professionalAreasService.run(),
        companiesService.run({ perPage: 999 }),
      ]);
      if (modRes.status === 'fulfilled') modalityTypes.value = modRes.value?.data ?? [];
      if (ctRes.status === 'fulfilled') contractTypes.value = ctRes.value?.data ?? [];
      if (expRes.status === 'fulfilled') experienceLevels.value = expRes.value?.data ?? [];
      if (paRes.status === 'fulfilled') professionalAreas.value = paRes.value?.data ?? [];
      if (compRes.status === 'fulfilled') companies.value = compRes.value?.data ?? [];
    };

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) {
          loadCatalogs();
          if (props.data) {
            form.name = props.data.name ?? '';
            form.companyId = props.data.companyId ?? null;
            form.modalityTypeId = props.data.modalityTypeId ?? null;
            form.contractTypeId = props.data.contractTypeId ?? null;
            form.professionalAreaId = props.data.professionalAreaId ?? null;
            form.municipalityId = props.data.municipalityId ?? null;
            form.salaryRangeMin = (props.data as any).salaryRangeMin ?? null;
            form.salaryRangeMax = (props.data as any).salaryRangeMax ?? null;
            form.experienceLevelId = props.data.experienceLevelId ?? null;
            form.description = props.data.description ?? '';
            form.requirements = props.data.requirements ?? '';
            form.benefits = props.data.benefits ?? '';
          } else {
            Object.assign(form, {
              name: '',
              companyId: null,
              modalityTypeId: null,
              contractTypeId: null,
              professionalAreaId: null,
              municipalityId: null,
              salaryRangeMin: null,
              salaryRangeMax: null,
              experienceLevelId: null,
              description: '',
              requirements: '',
              benefits: '',
              applicationDeadlineInput: '',
            });
          }
          Object.keys(errors).forEach((k) => ((errors as any)[k] = ''));
        }
      }
    );

    const searchCompanies = debounce(async (search: string, loading: (v: boolean) => void) => {
      if (!search || search.length < 2) return;
      loading(true);
      try {
        const res = await companiesService.run({ search, perPage: 50 });
        companies.value = res?.data ?? [];
      } finally {
        loading(false);
      }
    }, 600);

    const onCitySelect = (city: any) => {
      form.municipalityId = city?.id ?? null;
    };

    const validate = () => {
      Object.keys(errors).forEach((k) => ((errors as any)[k] = ''));
      let valid = true;
      if (!form.name.trim()) {
        errors.name = 'El nombre del cargo es requerido';
        valid = false;
      }
      if (!form.companyId) {
        errors.companyId = 'La empresa es requerida';
        valid = false;
      }
      if (!form.modalityTypeId) {
        errors.modalityTypeId = 'La modalidad es requerida';
        valid = false;
      }
      if (!form.contractTypeId) {
        errors.contractTypeId = 'El tipo de contrato es requerido';
        valid = false;
      }
      if (!form.description.trim()) {
        errors.description = 'La descripción es requerida';
        valid = false;
      }
      if (!form.requirements.trim()) {
        errors.requirements = 'Los requisitos son requeridos';
        valid = false;
      }
      return valid;
    };

    const formatDeadline = (dateInput: string) => {
      if (!dateInput) return '';
      const [y, m, d] = dateInput.split('-');
      return `${d}/${m}/${y} 00:00:00`;
    };

    const submit = async () => {
      if (!validate() || saving.value) return;
      saving.value = true;
      try {
        const payload: UpsertJobVacancyRequest = {
          name: form.name,
          companyId: form.companyId,
          modalityTypeId: form.modalityTypeId,
          contractTypeId: form.contractTypeId,
          professionalAreaId: form.professionalAreaId,
          municipalityId: form.municipalityId,
          salaryRangeMin: form.salaryRangeMin,
          salaryRangeMax: form.salaryRangeMax,
          experienceLevelId: form.experienceLevelId,
          description: form.description,
          requirements: form.requirements,
          benefits: form.benefits,
          applicationDeadline: formatDeadline(form.applicationDeadlineInput),
        };
        const result = await createOrUpdateService.run(payload, props.data?.id);
        emit('save', result);
        emit('update:isVisible', false);
      } finally {
        saving.value = false;
      }
    };

    return {
      saving,
      today,
      form,
      errors,
      companies,
      modalityTypes,
      contractTypes,
      experienceLevels,
      professionalAreas,
      searchCompanies,
      onCitySelect,
      submit,
    };
  },
});
</script>

<style scoped>
.drawer-section {
  padding: 20px;
}
.req-note {
  font-size: 0.75rem;
  color: #94a3b8;
}
.salary-date-group {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.salary-date-group > * {
  flex: 1;
  min-width: 0;
  margin-bottom: 0;
}
</style>
