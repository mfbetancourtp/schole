<template>
  <form @submit.prevent="save">
    <div class="photo-section">
      <div class="photo-preview">
        <img v-if="data?.photoUrl" :src="data.photoUrl" alt="Foto de perfil" class="photo-img" />
        <AppIcon v-else icon="user" class="photo-placeholder-icon" />
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12">
        <AppFormField label="Nombre completo">
          <input type="text" class="form-control" :value="data?.fullName" readonly />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField label="Correo electrónico">
          <input type="email" class="form-control" :value="data?.email" readonly />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField label="Teléfono">
          <input type="text" class="form-control" :value="data?.phone" readonly />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField label="País">
          <AppGeographicSearch search-key="country" label="name" :id="form.countryId || undefined" @geographicData="onCountrySelect" />
        </AppFormField>
      </div>

      <div class="col-md-6">
        <AppFormField label="Ciudad">
          <AppAutocomplete v-model="selectedMunicipalityId" :options="municipalityOptions" label="name" :filterable="false" @search="searchCities" />
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField label="Resumen profesional">
          <textarea class="form-control" v-model="form.professionalSummary" rows="4" placeholder="Describe tus objetivos y fortalezas (máx. 500 caracteres)" maxlength="500"></textarea>
        </AppFormField>
        <small class="text-muted hint-text">Un buen resumen destaca tus fortalezas y objetivos (máx. 500 caracteres)</small>
      </div>

      <div class="col-12">
        <p class="fw-semibold links-label">Enlaces profesionales</p>
      </div>

      <div class="col-12">
        <AppFormField label="LinkedIn">
          <input type="text" class="form-control" v-model="form.linkedin" placeholder="linkedin.com/in/tuusuario" />
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField label="Portafolio">
          <input type="text" class="form-control" v-model="form.portfolio" placeholder="tuportafolio.dev" />
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField label="Sitio web personal">
          <input type="text" class="form-control" v-model="form.website" placeholder="tuweb.com" />
        </AppFormField>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, watch } from 'vue';
import { debounce } from 'ts-debounce';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';
import { FindAllRegionsForSelectService } from '../../../shared/services/findAllRegionsForSelect.service';
import { GraduateProfileDto, PersonalInformation } from '../dtos/graduateProfile.dto';

export default defineComponent({
  name: 'PersonalInfoForm',
  components: { AppIcon, AppFormField, AppGeographicSearch, AppAutocomplete },
  props: {
    data: {
      type: Object as PropType<GraduateProfileDto | null>,
      default: null,
    },
    personalInfo: {
      type: Object as PropType<PersonalInformation | null>,
      default: null,
    },
  },
  emits: ['save'],
  setup(props, { emit, expose }) {
    const form = reactive({
      municipalityId: props.personalInfo?.municipalityId ?? (null as number | null),
      municipalityName: '' as string,
      countryId: props.personalInfo?.countryId ?? (null as number | null),
      countryName: '' as string,
      professionalSummary: props.data?.professionalSummary ?? '',
      linkedin: props.data?.linkedin ?? '',
      portfolio: props.data?.portfolio ?? '',
      website: props.data?.website ?? '',
    });

    const municipalityOptions = ref<any[]>([]);
    const selectedMunicipalityId = ref<number | null>(props.personalInfo?.municipalityId ?? null);
    const countryRegionIds = ref<number[]>([]);
    const findAllMunicipalitiesService = new FindAllMunicipalitiesForSelectService();
    const findAllRegionsService = new FindAllRegionsForSelectService();

    onMounted(async () => {
      if (props.personalInfo?.municipalityId) {
        const res = await findAllMunicipalitiesService.run({
          municipalityId: props.personalInfo.municipalityId,
        });
        if (res.data?.[0]) {
          municipalityOptions.value = [res.data[0]];
          form.municipalityName = res.data[0].name;
        }
      }
    });

    watch(selectedMunicipalityId, (id) => {
      const found = municipalityOptions.value.find((m: any) => m.id === id);
      form.municipalityId = id;
      form.municipalityName = found?.name ?? '';
    });

    const searchCities = debounce(async (search: string, loading: (v: boolean) => void) => {
      if (!search || search.length < 2) {
        const current = municipalityOptions.value.find((m: any) => m.id === selectedMunicipalityId.value);
        municipalityOptions.value = current ? [current] : [];
        return;
      }
      loading(true);
      try {
        const res = await findAllMunicipalitiesService.run({
          search,
          perPage: 200,
        } as any);
        let data: any[] = res.data ?? [];
        if (countryRegionIds.value.length) {
          data = data.filter((m: any) => countryRegionIds.value.includes(Number(m.regionId)));
        }
        municipalityOptions.value = data;
      } finally {
        loading(false);
      }
    }, 800);

    const onCountrySelect = async (country: any) => {
      const isNewCountry = country?.id !== form.countryId;
      form.countryId = country?.id ?? null;
      form.countryName = country?.name ?? '';
      if (isNewCountry) {
        form.municipalityId = null;
        form.municipalityName = '';
        selectedMunicipalityId.value = null;
        municipalityOptions.value = [];
      }
      countryRegionIds.value = [];
      if (country?.id) {
        const res = await findAllRegionsService.run({
          countryId: country.id,
          perPage: 999,
        });
        countryRegionIds.value = (res.data ?? []).map((r: any) => Number(r.id));
      }
    };

    const save = () => {
      emit('save', { ...form });
    };

    const submitForm = () => save();
    expose({ submitForm });

    return {
      form,
      municipalityOptions,
      selectedMunicipalityId,
      searchCities,
      onCountrySelect,
      save,
      countryRegionIds,
    };
  },
});
</script>

<style scoped>
.photo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}
.photo-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e2e8f0;
}
.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo-placeholder-icon {
  font-size: 1.75rem;
  color: #94a3b8;
}
.links-label {
  margin-bottom: 0;
}
.hint-text {
  display: block;
  margin-top: -0.5rem;
  margin-bottom: 0.25rem;
}
</style>
