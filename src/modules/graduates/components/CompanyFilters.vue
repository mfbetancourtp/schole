<template>
  <aside class="cf-sidebar">
    <div class="cf-sidebar-header">
      <span class="cf-sidebar-title"><AppIcon icon="sliders-h" /> Filtros</span>
      <button v-if="hasFilters" class="cf-clear-btn" @click="clearFilters"><AppIcon icon="times" /> Limpiar</button>
    </div>

    <div v-if="hasFilters" class="cf-active-count">{{ resultCount }} empresa{{ resultCount !== 1 ? 's' : '' }}</div>

    <!-- Industria -->
    <div class="cf-filter-block">
      <button class="cf-filter-toggle" @click="toggleSection('industry')">
        <span><AppIcon icon="industry" class="cf-fi" /> Industria</span>
        <AppIcon :icon="openSections.industry ? 'chevron-up' : 'chevron-down'" class="cf-fi-caret" />
      </button>
      <div v-if="openSections.industry" class="cf-filter-body">
        <select class="form-select form-select-sm" v-model="filters.industry">
          <option value="">Todas las industrias</option>
          <option v-for="opt in industryOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>

    <!-- Tamaño de empresa -->
    <div class="cf-filter-block">
      <button class="cf-filter-toggle" @click="toggleSection('size')">
        <span><AppIcon icon="users" class="cf-fi" /> Tamaño</span>
        <AppIcon :icon="openSections.size ? 'chevron-up' : 'chevron-down'" class="cf-fi-caret" />
      </button>
      <div v-if="openSections.size" class="cf-filter-body">
        <select class="form-select form-select-sm" v-model="filters.size">
          <option value="">Todos los tamaños</option>
          <option v-for="opt in companySizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>

    <!-- Ciudad -->
    <div class="cf-filter-block">
      <button class="cf-filter-toggle" @click="toggleSection('city')">
        <span><AppIcon icon="map-marker-alt" class="cf-fi" /> Ciudad</span>
        <AppIcon :icon="openSections.city ? 'chevron-up' : 'chevron-down'" class="cf-fi-caret" />
      </button>
      <div v-if="openSections.city" class="cf-filter-body">
        <select class="form-select form-select-sm" v-model="filters.city">
          <option value="">Todas las ciudades</option>
          <option v-for="city in availableCities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
      </div>
    </div>

    <!-- Solo con vacantes -->
    <div class="cf-filter-block" style="border-bottom: none">
      <button class="cf-filter-toggle" @click="toggleSection('vacancies')">
        <span><AppIcon icon="briefcase" class="cf-fi" /> Vacantes</span>
        <AppIcon :icon="openSections.vacancies ? 'chevron-up' : 'chevron-down'" class="cf-fi-caret" />
      </button>
      <div v-if="openSections.vacancies" class="cf-filter-body">
        <div class="cf-check-item">
          <input class="form-check-input" type="checkbox" id="onlyWithVacancies" v-model="filters.onlyWithVacancies" />
          <label for="onlyWithVacancies">Solo con vacantes activas</label>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, computed, watch, onMounted } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { GetIndustriesService } from '../services/getIndustries.service';
import { GetCompanySizesService } from '../services/getCompanySizes.service';
import InstitutionsStore from '../../../shared/stores/institutions.store';

export interface CompanyFiltersState {
  industry: string;
  size: string;
  city: string;
  onlyWithVacancies: boolean;
}

const getIndustriesService = new GetIndustriesService();
const getCompanySizesService = new GetCompanySizesService();

export default defineComponent({
  name: 'CompanyFilters',
  components: { AppIcon },
  props: {
    resultCount: { type: Number, default: 0 },
    availableCities: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: ['change'],
  setup(_, { emit, expose }) {
    const industryOptions = ref<string[]>([]);
    const companySizeOptions = ref<string[]>([]);

    const filters = reactive<CompanyFiltersState>({
      industry: '',
      size: '',
      city: '',
      onlyWithVacancies: false,
    });

    const openSections = reactive({
      industry: true,
      size: false,
      city: true,
      vacancies: false,
    });

    const hasFilters = computed(() => !!filters.industry || !!filters.size || !!filters.city || filters.onlyWithVacancies);

    const toggleSection = (key: keyof typeof openSections) => {
      openSections[key] = !openSections[key];
    };

    const clearFilters = () => {
      filters.industry = '';
      filters.size = '';
      filters.city = '';
      filters.onlyWithVacancies = false;
    };

    onMounted(async () => {
      const institutionId = InstitutionsStore.state.selectedInstitution?.id ?? null;
      const params = { institutionId };
      try {
        const [industriesRes, sizesRes] = await Promise.all([getIndustriesService.run(params), getCompanySizesService.run(params)]);
        industryOptions.value = industriesRes.map((i) => i.name);
        companySizeOptions.value = sizesRes.map((s) => s.name);
      } catch {
        // keep empty
      }
    });

    watch(filters, () => emit('change', { ...filters }), { deep: true });

    expose({ clearFilters });

    return {
      filters,
      openSections,
      hasFilters,
      industryOptions,
      companySizeOptions,
      toggleSection,
      clearFilters,
    };
  },
});
</script>

<style scoped>
.cf-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 10px;
}

.cf-sidebar-header {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.cf-sidebar-title {
  flex: 1;
  font-weight: 700;
  font-size: 0.85rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cf-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #dc3545;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.cf-clear-btn:hover {
  text-decoration: underline;
}

.cf-active-count {
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-primary, #2563eb);
  background: #eff6ff;
  border-bottom: 1px solid #dbeafe;
}

.cf-filter-block {
  border-bottom: 1px solid #f1f5f9;
}

.cf-filter-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  padding: 10px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.cf-filter-toggle:hover {
  background: #f8f9fa;
}

.cf-filter-toggle > span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cf-fi {
  color: var(--color-primary, #2563eb);
  opacity: 0.8;
  font-size: 0.8rem;
}

.cf-fi-caret {
  color: #9ca3af;
  font-size: 0.72rem;
}

.cf-filter-body {
  padding: 4px 14px 12px;
}

.cf-check-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
  font-size: 0.82rem;
  color: #374151;
}

.cf-check-item label {
  cursor: pointer;
}
</style>
