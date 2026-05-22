<template>
  <div class="agreementFilters">
    <AppFilter v-model="localSearch" :filter-name="`agreements.search`">
      <label>Buscar</label>
      <AppInput v-model="localSearch" placeholder="Buscar por nombre, código, institución..." @keyup.enter="applyFilters" />
    </AppFilter>

    <AppFilter v-model="localTipo" :filter-name="`agreements.tipo`">
      <label>Tipo de convenio</label>
      <AppSelect v-model="localTipo">
        <option value="">Todos los tipos</option>
        <option v-for="t in agreementTypes" :key="t.id" :value="String(t.id)">
          {{ t.name }}
        </option>
      </AppSelect>
    </AppFilter>

    <AppFilter v-model="localStatus" :filter-name="`agreements.status`">
      <label>Estado</label>
      <AppSelect v-model="localStatus">
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Borrador">Borrador</option>
        <option value="Finalizado">Finalizado</option>
        <option value="Cerrado">Cerrado</option>
      </AppSelect>
    </AppFilter>

    <AppFilter v-model="localCountry" :filter-name="`agreements.country`">
      <label>País</label>
      <AppSelect v-model="localCountry">
        <option value="">Todos los países</option>
        <option v-for="c in countries" :key="c.id" :value="String(c.id)">
          {{ c.name }}
        </option>
      </AppSelect>
    </AppFilter>

    <AppFilter v-model="localDateFrom" :filter-name="`agreements.dateFrom`">
      <label>Desde</label>
      <AppInput v-model="localDateFrom" type="date" />
    </AppFilter>

    <AppFilter v-model="localDateTo" :filter-name="`agreements.dateTo`">
      <label>Hasta</label>
      <AppInput v-model="localDateTo" type="date" />
    </AppFilter>

    <div class="agreementFilters__actions">
      <AppButton variant="primary" @click="applyFilters">
        <AppIcon icon="search" />
        Buscar
      </AppButton>
      <AppButton outlined @click="clearFilters">
        <AppIcon icon="times" />
        Limpiar
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import { GetAgreementTypesService } from '../services/getAgreementTypes.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';

const getAgreementTypesService = new GetAgreementTypesService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();

interface SelectOption {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'AgreementFilters',
  components: { AppInput, AppButton, AppIcon, AppSelect, AppFilter },
  props: {
    searchQuery: { type: String, default: '' },
    tipoFilter: { type: Number, default: undefined },
    statusFilter: { type: String, default: '' },
    countryFilter: { type: Number, default: undefined },
    dateFrom: { type: String, default: '' },
    dateTo: { type: String, default: '' },
  },
  emits: ['update:searchQuery', 'update:tipoFilter', 'update:statusFilter', 'update:countryFilter', 'update:dateFrom', 'update:dateTo', 'clear', 'apply'],
  setup(props, { emit }) {
    const agreementTypes = ref<SelectOption[]>([]);
    const countries = ref<SelectOption[]>([]);

    const localSearch = ref(props.searchQuery);
    const localTipo = ref(props.tipoFilter ? String(props.tipoFilter) : '');
    const localStatus = ref(props.statusFilter ?? '');
    const localCountry = ref(props.countryFilter ? String(props.countryFilter) : '');
    const localDateFrom = ref(props.dateFrom ?? '');
    const localDateTo = ref(props.dateTo ?? '');

    watch(
      () => props.searchQuery,
      (v) => {
        localSearch.value = v ?? '';
      }
    );
    watch(
      () => props.tipoFilter,
      (v) => {
        localTipo.value = v ? String(v) : '';
      }
    );
    watch(
      () => props.statusFilter,
      (v) => {
        localStatus.value = v ?? '';
      }
    );
    watch(
      () => props.countryFilter,
      (v) => {
        localCountry.value = v ? String(v) : '';
      }
    );
    watch(
      () => props.dateFrom,
      (v) => {
        localDateFrom.value = v ?? '';
      }
    );
    watch(
      () => props.dateTo,
      (v) => {
        localDateTo.value = v ?? '';
      }
    );

    const applyFilters = () => {
      emit('update:searchQuery', localSearch.value);
      emit('update:tipoFilter', localTipo.value ? Number(localTipo.value) : undefined);
      emit('update:statusFilter', localStatus.value || undefined);
      emit('update:countryFilter', localCountry.value ? Number(localCountry.value) : undefined);
      emit('update:dateFrom', localDateFrom.value || undefined);
      emit('update:dateTo', localDateTo.value || undefined);
      emit('apply');
    };

    const clearFilters = () => {
      localSearch.value = '';
      localTipo.value = '';
      localStatus.value = '';
      localCountry.value = '';
      localDateFrom.value = '';
      localDateTo.value = '';
      emit('clear');
    };

    onMounted(async () => {
      const [typesRes, countriesRes] = await Promise.allSettled([getAgreementTypesService.run({ perPage: 100, isActive: 1 }), findAllCountriesForSelectService.run({ perPage: 300 })]);
      if (typesRes.status === 'fulfilled') {
        agreementTypes.value = (typesRes.value.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
        }));
      }
      if (countriesRes.status === 'fulfilled') {
        const data = countriesRes.value.data || countriesRes.value;
        countries.value = Array.isArray(data)
          ? data.map((c: any) => {
              try {
                const t = typeof c.translations === 'string' ? JSON.parse(c.translations) : c.translations;
                return { id: c.id, name: t?.es || c.name };
              } catch {
                return { id: c.id, name: c.name };
              }
            })
          : [];
      }
    });

    return {
      agreementTypes,
      countries,
      localSearch,
      localTipo,
      localStatus,
      localCountry,
      localDateFrom,
      localDateTo,
      applyFilters,
      clearFilters,
    };
  },
});
</script>

<style scoped>
.agreementFilters {
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 0.5rem 1rem 0.75rem;
}

.agreementFilters__actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
</style>
