<template>
  <AppBaseList :title="title">
    <template #content>
      <div>
        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button class="nav-link active" data-bs-target="#getLogs" aria-controls="getLogs" id="getLogsTab" data-bs-toggle="tab" aria-selected="true" type="button" role="tab">
              {{ t('Inicio de sesión') }}
            </button>

            <button
              class="nav-link"
              data-bs-target="#getPasswordEventsLogs"
              aria-controls="getPasswordEventsLogs"
              id="getPasswordEventsLogsTab"
              data-bs-toggle="tab"
              aria-selected="false"
              type="button"
              role="tab"
            >
              {{ t('Recuperación de contraseña') }}
            </button>
          </div>
        </nav>

        <div class="bg-white tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" id="getLogs" role="tabpanel" aria-labelledby="getLogsTab">
            <AppDatatable :name="nameLogs" :service="service" serviceMethod="getLogs" :params="paramsLogs" refreshBtn>
              <template #filters>
                <AppFilter v-model="initDateLogs" :filter-name="`${nameLogs}.initDate`">
                  <label for="initDate">Fecha inicial</label>
                  <input id="initDate" type="date" class="form-control" v-model="initDateLogs" />
                </AppFilter>

                <AppFilter v-model="endDateLogs" :filter-name="`${nameLogs}.endDate`">
                  <label for="endDate">Fecha final</label>
                  <input id="endDate" type="date" class="form-control" v-model="endDateLogs" />
                </AppFilter>

                <AppFilter v-model="countryLogs" :filter-name="`${nameLogs}.country`">
                  <label for="countryLogs">País</label>
                  <AppAutocomplete input-id="countryLogs" v-model="countryLogs" :options="countriesLogs" label="name" :reduce="(country: any) => country.name" @search="searchCountriesLogs" />
                </AppFilter>

                <AppFilter v-model="cityLogs" :filter-name="`${nameLogs}.city`">
                  <label for="cityLogs">Municipio</label>
                  <AppAutocomplete
                    input-id="cityLogs"
                    v-model="cityLogs"
                    :options="municipalitiesLogs"
                    label="name"
                    :reduce="(municipality: any) => municipality.name"
                    @search="searchMunicipalitiesLogs"
                  />
                </AppFilter>

                <AppFilter v-model="deviceTypeLogs" :filter-name="`${nameLogs}.deviceType`">
                  <label for="deviceTypeLogs">Tipo de dispositivo</label>
                  <AppAutocomplete input-id="deviceTypeLogs" v-model="deviceTypeLogs" :options="deviceTypeOptions" label="label" :reduce="(deviceType: any) => deviceType.value" />
                </AppFilter>
              </template>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.names`" label="Usuario">
                <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                  <AppAvatar :size="'sm'" :avatar="row.user.avatar" :name="row.user.names ?? '?'" />

                  <div class="tw-min-w-0 tw-ml-4">
                    <div class="tw-font-medium tw-leading-5 tw-truncate">
                      {{ row.user.lastnames }} <br />
                      {{ row.user.names }}
                    </div>
                  </div>
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.email`" label="Email">
                {{ getAuditEmail(row) }}
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.loginAt`" label="Fecha inicio">
                {{ dayjs.utc(row.loginAt).tz(dayjs.tz.guess()).add(2, 'minute').format('YYYY-MM-DD hh:mm A') }}
              </AppDatatableColumn>
              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.logoutAt`" label="Fecha fin sesión">
                {{ row.logoutAt ? dayjs.utc(row.logoutAt).tz(dayjs.tz.guess()).add(2, 'minute').format('YYYY-MM-DD hh:mm A') : '' }}
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.ip`" label="IP">
                {{ row.ipAddress }}
              </AppDatatableColumn>
              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.cityAndCountry`" label="Ciudad - País"> {{ row.city ?? '' }} - {{ row.country ?? '' }} </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.loginStatus`" label="Estado" position="centered">
                <div class="text-center">
                  <AppBadge
                    :variant="row.loginStatus === 'SUCCESS' ? 'success' : row.loginStatus === 'EXPIRED' ? 'warning' : 'dark'"
                    :label="row.loginStatus === 'SUCCESS' ? 'Activo' : row.loginStatus === 'EXPIRED' ? 'Expirado' : 'Cerrado'"
                  />
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.deviceType`" label="Dispositivo" position="centered">
                <div class="text-center">
                  {{ row.deviceType === 'DESKTOP' ? 'PC' : row.deviceType === 'MOBILE' ? 'Móvil' : row.deviceType === 'TABLET' ? 'Tableta' : row.deviceType }}
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" label="core.actions" position="centered">
                <div class="text-center">
                  <AppButton v-tooltip="'core.seeDetail'" icon="eye" outlined @click="openSeeDetailModal(row)" />
                </div>
              </AppDatatableColumn>
            </AppDatatable>
          </div>

          <div class="tab-pane fade" id="getPasswordEventsLogs" role="tab" aria-labelledby="getPasswordEventsLogsTab">
            <AppDatatable :name="namePasswordEventsLogs" :service="service" serviceMethod="getPasswordEventsLogs" :params="paramsPasswordEventsLogs" refreshBtn>
              <template #filters>
                <AppFilter v-model="initDatePasswordEventsLogs" :filter-name="`${namePasswordEventsLogs}.initDate`">
                  <label for="initDate">Fecha inicial</label>
                  <input id="initDate" type="date" class="form-control" v-model="initDatePasswordEventsLogs" />
                </AppFilter>

                <AppFilter v-model="endDatePasswordEventsLogs" :filter-name="`${namePasswordEventsLogs}.endDate`">
                  <label for="endDate">Fecha final</label>
                  <input id="endDate" type="date" class="form-control" v-model="endDatePasswordEventsLogs" />
                </AppFilter>

                <AppFilter v-model="countryPasswordEventsLogs" :filter-name="`${namePasswordEventsLogs}.country`">
                  <label for="countryPasswordEventsLogs">País</label>
                  <AppAutocomplete
                    input-id="countryPasswordEventsLogs"
                    v-model="countryPasswordEventsLogs"
                    :options="countriesPasswordEventsLogs"
                    label="name"
                    :reduce="(country: any) => country.name"
                    @search="searchCountriesPasswordEventsLogs"
                  />
                </AppFilter>

                <AppFilter v-model="cityPasswordEventsLogs" :filter-name="`${namePasswordEventsLogs}.city`">
                  <label for="cityPasswordEventsLogs">Municipio</label>
                  <AppAutocomplete
                    input-id="cityPasswordEventsLogs"
                    v-model="cityPasswordEventsLogs"
                    :options="municipalitiesPasswordEventsLogs"
                    label="name"
                    :reduce="(municipality: any) => municipality.name"
                    @search="searchMunicipalitiesPasswordEventsLogs"
                  />
                </AppFilter>

                <AppFilter v-model="deviceTypePasswordEventsLogs" :filter-name="`${namePasswordEventsLogs}.deviceType`">
                  <label for="deviceTypePasswordEventsLogs">Tipo de dispositivo</label>
                  <AppAutocomplete
                    input-id="deviceTypePasswordEventsLogs"
                    v-model="deviceTypePasswordEventsLogs"
                    :options="deviceTypeOptions"
                    label="label"
                    :reduce="(deviceType: any) => deviceType.value"
                  />
                </AppFilter>
              </template>

              <AppDatatableColumn v-slot="{ row }" :field="`${namePasswordEventsLogs}.names`" label="Nombre">
                <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                  <AppAvatar :size="'sm'" :avatar="row.user.avatar" :name="row.user.names ?? '?'" />

                  <div class="tw-min-w-0 tw-ml-4">
                    <div class="tw-font-medium tw-leading-5 tw-truncate">
                      {{ row.user.lastnames }} <br />
                      {{ row.user.names }}
                    </div>
                  </div>
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${namePasswordEventsLogs}.email`" label="Email">
                {{ getAuditEmail(row) }}
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.loginAt`" label="Fecha inicio">
                {{ dayjs.utc(row.createdAt).tz(dayjs.tz.guess()).add(2, 'minute').format('YYYY-MM-DD hh:mm A') }}
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.ip`" label="IP">
                {{ row.ipAddress }}
              </AppDatatableColumn>
              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.cityAndCountry`" label="Ciudad - País"> {{ row.city ?? '' }} - {{ row.country ?? '' }} </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.loginStatus`" label="Estado" position="centered">
                <div class="text-center">
                  <AppBadge :variant="row.status === 'SUCCESS' ? 'success' : 'danger'" :label="row.status === 'SUCCESS' ? 'Cambiada' : 'Fallida'" />
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" :field="`${nameLogs}.deviceType`" label="Dispositivo" position="centered">
                <div class="text-center">
                  {{ row.deviceType === 'DESKTOP' ? 'PC' : row.deviceType === 'MOBILE' ? 'Móvil' : row.deviceType === 'TABLET' ? 'Tableta' : row.deviceType }}
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn v-slot="{ row }" label="core.actions" position="centered">
                <div class="text-center">
                  <AppButton v-tooltip="'core.seeDetail'" icon="eye" outlined @click="openSeeDetailModal(row)" />
                </div>
              </AppDatatableColumn>
            </AppDatatable>
          </div>
        </div>
      </div>
    </template>
  </AppBaseList>

  <AppModal v-model="seeDetailModal" :size="'lg'">
    <template v-if="currentLoginAudit && seeDetailModal">
      <LoginAuditDetail :loginAudit="currentLoginAudit" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { debounce } from 'ts-debounce';

import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

import { useHeaderStore } from '../../../stores/header.store';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import LoginAuditDetail from '../components/LoginAuditDetail.vue';

import { LogsService } from '../services/logs.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';

dayjs.extend(timezone);
dayjs.extend(utc);

export default defineComponent({
  name: 'LoginAudits',

  components: {
    AppDatatableColumn,
    AppDatatable,
    AppBaseList,
    AppFilter,
    AppAvatar,
    AppButton,
    AppModal,
    AppBadge,
    AppAutocomplete,

    LoginAuditDetail,
  },

  setup() {
    const { t } = useI18n();

    const title = 'Auditorias de login';

    useMeta({ title: title });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Configuración institucional', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const service = new LogsService();
    const nameLogs = 'loginAudits.logs';
    const namePasswordEventsLogs = 'loginAudits.passwordEventsLogs';

    const currentLoginAudit: Ref<any> = ref(null);

    const initDateLogs: Ref<string | null> = ref(null);
    const endDateLogs: Ref<string | null> = ref(null);
    const countryLogs: Ref<string | null> = ref(null);
    const cityLogs: Ref<string | null> = ref(null);
    const deviceTypeLogs: Ref<string | null> = ref(null);
    const initDatePasswordEventsLogs: Ref<string | null> = ref(null);
    const endDatePasswordEventsLogs: Ref<string | null> = ref(null);
    const countryPasswordEventsLogs: Ref<string | null> = ref(null);
    const cityPasswordEventsLogs: Ref<string | null> = ref(null);
    const deviceTypePasswordEventsLogs: Ref<string | null> = ref(null);

    const countriesLogs: Ref<any[]> = ref([]);
    const municipalitiesLogs: Ref<any[]> = ref([]);
    const countriesPasswordEventsLogs: Ref<any[]> = ref([]);
    const municipalitiesPasswordEventsLogs: Ref<any[]> = ref([]);

    const findAllCountriesForSelectService = new FindAllCountriesForSelectService();
    const findAllMunicipalitiesForSelectService = new FindAllMunicipalitiesForSelectService();

    const deviceTypeOptions = [
      { label: 'PC', value: 'DESKTOP' },
      { label: 'Móvil', value: 'MOBILE' },
      { label: 'Tableta', value: 'TABLET' },
      { label: 'Otro', value: 'OTHER' },
    ];

    const seeDetailModal: Ref<boolean> = ref(false);

    const paramsLogs = computed(() => ({
      initDate: initDateLogs.value,
      endDate: endDateLogs.value,
      country: countryLogs.value,
      city: cityLogs.value,
      deviceType: deviceTypeLogs.value,
    }));
    const paramsPasswordEventsLogs = computed(() => ({
      initDate: initDatePasswordEventsLogs.value,
      endDate: endDatePasswordEventsLogs.value,
      country: countryPasswordEventsLogs.value,
      city: cityPasswordEventsLogs.value,
      deviceType: deviceTypePasswordEventsLogs.value,
    }));

    const getResponseData = (response: any) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);

    const getCountryIdByName = (countryName: string | null, countries: any[]) => {
      if (!countryName) return null;

      return countries.find((country) => country.name === countryName)?.id ?? null;
    };

    const loadCountries = async (countries: Ref<any[]>, search?: string) => {
      const response = await findAllCountriesForSelectService.run({
        perPage: 300,
        ...(search ? { search } : {}),
      });

      countries.value = getResponseData(response);
    };

    const loadMunicipalities = async (municipalities: Ref<any[]>, countryName: string | null, countries: any[], search?: string) => {
      const countryId = getCountryIdByName(countryName, countries);
      const params: any = {
        perPage: 300,
        ...(countryId ? { countryId } : {}),
        ...(search ? { search } : {}),
      };

      const response = await findAllMunicipalitiesForSelectService.run(params);

      municipalities.value = getResponseData(response);
    };

    const createCountrySearcher = (countries: Ref<any[]>) =>
      debounce(async (search: string, loading: Function) => {
        if (!search) return;

        loading(true);

        if (search.length >= 2) {
          await loadCountries(countries, search);
        } else {
          countries.value = [];
        }

        loading(false);
      }, 800);

    const createMunicipalitySearcher = (municipalities: Ref<any[]>, countryName: Ref<string | null>, countries: Ref<any[]>) =>
      debounce(async (search: string, loading: Function) => {
        if (!search) return;

        loading(true);

        if (search.length >= 2) {
          await loadMunicipalities(municipalities, countryName.value, countries.value, search);
        } else {
          municipalities.value = [];
        }

        loading(false);
      }, 800);

    const searchCountriesLogs = createCountrySearcher(countriesLogs);
    const searchMunicipalitiesLogs = createMunicipalitySearcher(municipalitiesLogs, countryLogs, countriesLogs);
    const searchCountriesPasswordEventsLogs = createCountrySearcher(countriesPasswordEventsLogs);
    const searchMunicipalitiesPasswordEventsLogs = createMunicipalitySearcher(municipalitiesPasswordEventsLogs, countryPasswordEventsLogs, countriesPasswordEventsLogs);

    const getAuditEmail = (row: any) => row.email ?? row.user?.email ?? row.user?.people?.email ?? '-';

    watch(countryLogs, async (newCountry, oldCountry) => {
      if (newCountry !== oldCountry) cityLogs.value = null;
      await loadMunicipalities(municipalitiesLogs, newCountry, countriesLogs.value);
    });

    watch(countryPasswordEventsLogs, async (newCountry, oldCountry) => {
      if (newCountry !== oldCountry) cityPasswordEventsLogs.value = null;
      await loadMunicipalities(municipalitiesPasswordEventsLogs, newCountry, countriesPasswordEventsLogs.value);
    });

    onMounted(async () => {
      await Promise.allSettled([
        (async () => {
          await loadCountries(countriesLogs);
          await loadMunicipalities(municipalitiesLogs, countryLogs.value, countriesLogs.value);
        })(),
        (async () => {
          await loadCountries(countriesPasswordEventsLogs);
          await loadMunicipalities(municipalitiesPasswordEventsLogs, countryPasswordEventsLogs.value, countriesPasswordEventsLogs.value);
        })(),
      ]);
    });

    const openSeeDetailModal = (loginAudit: any) => {
      currentLoginAudit.value = loginAudit;
      seeDetailModal.value = true;
    };

    return {
      title,
      dayjs,
      t,

      seeDetailModal,

      currentLoginAudit,
      nameLogs,
      namePasswordEventsLogs,
      service,
      paramsLogs,
      paramsPasswordEventsLogs,

      initDateLogs,
      endDateLogs,
      countryLogs,
      cityLogs,
      deviceTypeLogs,
      initDatePasswordEventsLogs,
      endDatePasswordEventsLogs,
      countryPasswordEventsLogs,
      cityPasswordEventsLogs,
      deviceTypePasswordEventsLogs,
      countriesLogs,
      municipalitiesLogs,
      countriesPasswordEventsLogs,
      municipalitiesPasswordEventsLogs,
      deviceTypeOptions,
      searchCountriesLogs,
      searchMunicipalitiesLogs,
      searchCountriesPasswordEventsLogs,
      searchMunicipalitiesPasswordEventsLogs,
      getAuditEmail,

      openSeeDetailModal,
    };
  },
});
</script>

<style scoped>
:deep(.content) {
  border-radius: 0;
}
:deep(.nav-tabs .nav-link.active) {
  z-index: 10;
  position: relative;
}
</style>
