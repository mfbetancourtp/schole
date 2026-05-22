<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader :variant="data ? 'edit' : 'create'" :icon="data ? 'edit' : 'building'" :title="data ? 'Editar empresa' : 'Registrar empresa'" subtitle="Completa la información de la empresa" />
    </template>

    <template #body>
      <div v-if="isVisible" class="drawer-body-content">
        <!-- Logo upload -->
        <div class="logo-upload-section">
          <div class="logo-preview">
            <img v-if="photoPreviewUrl" :src="photoPreviewUrl" alt="Logo" class="logo-img" />
            <AppIcon v-else icon="building" class="logo-placeholder-icon" />
          </div>
          <div class="logo-upload-info">
            <input type="file" ref="fileInputRef" accept="image/jpeg,image/png" style="display: none" @change="onFileChange" />
            <AppButton outlined variant="secondary" size="sm" nativeType="button" @click="fileInputRef?.click()"><AppIcon icon="upload" /> Subir logo</AppButton>
            <small class="logo-hint">JPG, PNG. Tamaño recomendado: 400x400px</small>
          </div>
        </div>

        <AppFormField :form-control="v$.form.name" label="Nombre de la empresa">
          <input type="text" class="form-control" v-model="v$.form.name.$model" id="name" placeholder="ej. TechCorp Solutions" />
        </AppFormField>

        <div class="row g-3">
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.industryId" label="Industria">
              <AppAutocomplete v-model="v$.form.industryId.$model" input-id="industryId" :options="industries" label="name" :reduce="(o: any) => o.id" />
            </AppFormField>
          </div>
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.companySizeId" label="Tamaño de empresa">
              <AppAutocomplete v-model="v$.form.companySizeId.$model" input-id="companySizeId" :options="companySizes" label="name" :reduce="(o: any) => o.id" />
            </AppFormField>
          </div>
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.countryId" label="País">
              <AppGeographicSearch search-key="country" :id="form.countryId || undefined" @geographicData="onCountrySelect" />
            </AppFormField>
          </div>
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.municipalityId" label="Ciudad">
              <AppAutocomplete v-model="selectedMunicipalityId" :options="municipalityOptions" label="name" :filterable="false" @search="searchCities" />
            </AppFormField>
          </div>
        </div>

        <AppFormField :form-control="v$.form.webPage" label="Página web">
          <input type="text" class="form-control" v-model="v$.form.webPage.$model" id="webPage" placeholder="empresa.com" />
        </AppFormField>

        <div class="row g-3">
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.email" label="Correo de contacto">
              <input type="email" class="form-control" v-model="v$.form.email.$model" id="email" placeholder="contacto@empresa.com" />
            </AppFormField>
          </div>
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.mobile" label="Teléfono">
              <input type="tel" class="form-control" v-model="v$.form.mobile.$model" id="mobile" placeholder="+57 300 123 4567" />
            </AppFormField>
          </div>
        </div>

        <AppFormField :form-control="v$.form.description" label="Descripción de la empresa">
          <textarea class="form-control" v-model="v$.form.description.$model" rows="4" id="description" placeholder="Describe la misión, visión y cultura de la empresa..."></textarea>
        </AppFormField>
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
          <AppButton variant="primary" nativeType="button" :disabled="saving" @click="save">
            {{ data ? 'Guardar cambios' : 'Registrar empresa' }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, watch } from 'vue';
import { debounce } from 'ts-debounce';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { CompanyDto, IndustryDto, CompanySizeDto } from '../dtos/company.dto';
import { GetIndustriesService } from '../services/getIndustries.service';
import { GetCompanySizesService } from '../services/getCompanySizes.service';
import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';
import { FindAllRegionsForSelectService } from '../../../shared/services/findAllRegionsForSelect.service';
import InstitutionsStore from '../../../shared/stores/institutions.store';

const getIndustriesService = new GetIndustriesService();
const getCompanySizesService = new GetCompanySizesService();

export default defineComponent({
  name: 'RegisterCompanyModal',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppGeographicSearch,
    AppIcon,
  },
  props: {
    isVisible: { type: Boolean, required: true },
    data: { type: Object as PropType<CompanyDto | null>, default: null },
  },
  emits: ['update:isVisible', 'save'],

  setup(props, { emit }) {
    const saving = ref(false);
    const industries = ref<IndustryDto[]>([]);
    const companySizes = ref<CompanySizeDto[]>([]);

    const institutionId = InstitutionsStore.state.selectedInstitution?.id ?? null;

    const photoFile = ref<File | null>(null);
    const photoPreviewUrl = ref<string | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);

    const municipalityOptions = ref<any[]>([]);
    const selectedMunicipalityId = ref<number | null>(null);
    const countryRegionIds = ref<number[]>([]);
    const findAllMunicipalitiesService = new FindAllMunicipalitiesForSelectService();
    const findAllRegionsService = new FindAllRegionsForSelectService();

    const form = reactive({
      name: '',
      industryId: null as number | null,
      companySizeId: null as number | null,
      countryId: null as number | null,
      municipalityId: null as number | null,
      webPage: '',
      mobile: '',
      email: '',
      description: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          industryId: { required },
          companySizeId: { required },
          countryId: { required },
          municipalityId: { required },
          webPage: { required },
          mobile: { required },
          email: { required },
          description: { required },
        },
      },
      { form }
    );

    const resetForm = (data: CompanyDto | null) => {
      form.name = data?.name ?? '';
      form.industryId = data?.industryId ?? null;
      form.companySizeId = data?.companySizeId ?? null;
      form.countryId = data?.municipality?.region?.country?.id ?? null;
      form.municipalityId = data?.municipalityId ?? null;
      form.webPage = data?.webPage ?? '';
      form.mobile = data?.mobile ?? '';
      form.email = data?.email ?? '';
      form.description = data?.description ?? '';
      photoFile.value = null;
      photoPreviewUrl.value = data?.photoUrl ?? null;
      municipalityOptions.value = [];
      countryRegionIds.value = [];
      v$.value.$reset();
    };

    // Reinicializa el form cada vez que el drawer se abre
    watch(
      () => props.isVisible,
      async (visible) => {
        if (!visible) return;
        resetForm(props.data);
        // Resetear municipio antes de cargar opciones para evitar que el autocomplete limpie la selección
        selectedMunicipalityId.value = null;

        if (props.data?.municipalityId) {
          try {
            const res = await findAllMunicipalitiesService.run({
              municipalityId: props.data.municipalityId,
            });
            if (res.data?.[0]) {
              municipalityOptions.value = [res.data[0]];
              // Derivar countryId del municipio si no quedó desde la relación
              if (!form.countryId) {
                const muni = res.data[0];
                form.countryId = muni.region?.country?.id ?? muni.countryId ?? null;
              }
            }
          } catch {
            // keep empty
          } finally {
            // Asignar municipio DESPUÉS de tener las opciones cargadas
            selectedMunicipalityId.value = props.data.municipalityId;
          }
        }
      },
      { immediate: true }
    );

    const onFileChange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      photoFile.value = file;
      photoPreviewUrl.value = URL.createObjectURL(file);
    };

    watch(selectedMunicipalityId, (id) => {
      form.municipalityId = id;
      v$.value.form.municipalityId.$model = id;
      if (id) {
        const found = municipalityOptions.value.find((m: any) => m.id === id);
        const derivedCountryId = found?.region?.country?.id ?? found?.countryId ?? null;
        if (derivedCountryId) form.countryId = derivedCountryId;
      }
    });

    onMounted(async () => {
      const params = { institutionId };
      try {
        const [industriesRes, companySizesRes] = await Promise.all([getIndustriesService.run(params), getCompanySizesService.run(params)]);
        industries.value = industriesRes;
        companySizes.value = companySizesRes;
      } catch (e) {
        console.log(e);
      }
    });

    const onCountrySelect = async (country: any) => {
      const isNewCountry = country?.id !== form.countryId;
      form.countryId = country?.id ?? null;
      if (isNewCountry) {
        form.municipalityId = null;
        v$.value.form.municipalityId.$model = null;
        selectedMunicipalityId.value = null;
        municipalityOptions.value = [];
      }
      countryRegionIds.value = [];
      if (country?.id) {
        try {
          const res = await findAllRegionsService.run({
            countryId: country.id,
            perPage: 999,
          });
          countryRegionIds.value = (res.data ?? []).map((r: any) => Number(r.id));
        } catch (e) {
          console.log(e);
        }
      }
    };

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

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      saving.value = true;
      const headers = {
        institutionId: String(InstitutionsStore.state.selectedInstitution?.id ?? ''),
      };
      const payload = {
        name: form.name,
        industryId: form.industryId,
        companySizeId: form.companySizeId,
        municipalityId: form.municipalityId,
        countryId: form.countryId ?? null,
        webPage: form.webPage || null,
        mobile: form.mobile || null,
        email: form.email || null,
        description: form.description || null,
      };
      try {
        let companyId: number;
        if (props.data?.id) {
          await axios.put(`${services.graduates}/companies/${props.data.id}`, payload, { headers });
          companyId = props.data.id;
        } else {
          await axios.post(`${services.graduates}/companies`, payload, {
            headers,
          });
          // Backend only returns a message on create — fetch the new company by name to get its ID
          const listRes = await axios.get(`${services.graduates}/companies`, {
            params: { institutionId, search: form.name },
            headers,
          });
          const companies: any[] = listRes.data?.data ?? [];
          const newCompany = companies.find((c: any) => c.name === form.name);
          companyId = newCompany?.id;
        }

        let resolvedPhotoUrl: string | null = props.data?.photoUrl ?? null;
        if (photoFile.value && companyId) {
          try {
            const formData = new FormData();
            formData.append('file', photoFile.value);
            formData.append('companyId', String(companyId));
            const photoRes = await axios.post(`${services.graduates}/companies/photo`, formData, { headers });
            const uploadedUrl: string | null = photoRes.data?.photoUrl ?? photoRes.data?.data?.photoUrl ?? null;
            if (uploadedUrl) {
              await axios.put(`${services.graduates}/companies/${companyId}`, { ...payload, photoUrl: uploadedUrl }, { headers });
              resolvedPhotoUrl = uploadedUrl;
            } else {
              resolvedPhotoUrl = photoPreviewUrl.value;
            }
          } catch {
            resolvedPhotoUrl = photoPreviewUrl.value;
          }
        }

        emit('save', { id: companyId, photoUrl: resolvedPhotoUrl });
        emit('update:isVisible', false);
      } catch (e) {
        console.log(e);
      } finally {
        saving.value = false;
      }
    };

    return {
      v$,
      form,
      industries,
      companySizes,
      saving,
      save,
      municipalityOptions,
      selectedMunicipalityId,
      onCountrySelect,
      searchCities,
      photoPreviewUrl,
      fileInputRef,
      onFileChange,
    };
  },
});
</script>

<style scoped>
.drawer-body-content {
  padding: 20px;
}

.logo-upload-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder-icon {
  font-size: 2rem;
  color: #94a3b8;
}

.logo-upload-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.logo-hint {
  color: #94a3b8;
  font-size: 0.78rem;
}

.req-note {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
