<template>
  <aside class="jb-sidebar">
    <div class="jb-sidebar-header">
      <span class="jb-sidebar-title"><AppIcon icon="sliders-h" /> Filtros</span>
      <button v-if="hasFilters" class="jb-clear-btn" @click="clearFilters"><AppIcon icon="times" /> Limpiar</button>
    </div>

    <div v-if="hasFilters" class="jb-active-count">{{ resultCount }} resultado{{ resultCount !== 1 ? 's' : '' }}</div>

    <!-- Ciudad -->
    <div class="jb-filter-block">
      <button class="jb-filter-toggle" @click="toggleSection('city')">
        <span><AppIcon icon="map-marker-alt" class="jb-fi" /> Ciudad</span>
        <AppIcon :icon="openSections.city ? 'chevron-up' : 'chevron-down'" class="jb-fi-caret" />
      </button>
      <div v-if="openSections.city" class="jb-filter-body">
        <input type="text" class="form-control form-control-sm" v-model="filters.city" placeholder="ej. Bogotá" />
      </div>
    </div>

    <!-- Modalidad -->
    <div class="jb-filter-block">
      <button class="jb-filter-toggle" @click="toggleSection('modality')">
        <span><AppIcon icon="desktop" class="jb-fi" /> Modalidad</span>
        <AppIcon :icon="openSections.modality ? 'chevron-up' : 'chevron-down'" class="jb-fi-caret" />
      </button>
      <div v-if="openSections.modality" class="jb-filter-body">
        <div v-for="opt in modalityCatalog" :key="opt.id" class="jb-check-item">
          <input
            class="form-check-input"
            type="checkbox"
            :id="`mod-${opt.id}`"
            :checked="filters.modalityTypeId === opt.id"
            @change="filters.modalityTypeId = filters.modalityTypeId === opt.id ? null : opt.id"
          />
          <label :for="`mod-${opt.id}`">{{ opt.name }}</label>
        </div>
      </div>
    </div>

    <!-- Tipo de contrato -->
    <div class="jb-filter-block">
      <button class="jb-filter-toggle" @click="toggleSection('contract')">
        <span><AppIcon icon="file-contract" class="jb-fi" /> Contrato</span>
        <AppIcon :icon="openSections.contract ? 'chevron-up' : 'chevron-down'" class="jb-fi-caret" />
      </button>
      <div v-if="openSections.contract" class="jb-filter-body">
        <div v-for="opt in contractTypeCatalog" :key="opt.id" class="jb-check-item">
          <input
            class="form-check-input"
            type="checkbox"
            :id="`ct-${opt.id}`"
            :checked="filters.contractTypeId === opt.id"
            @change="filters.contractTypeId = filters.contractTypeId === opt.id ? null : opt.id"
          />
          <label :for="`ct-${opt.id}`">{{ opt.name }}</label>
        </div>
      </div>
    </div>

    <!-- Nivel de experiencia -->
    <div class="jb-filter-block">
      <button class="jb-filter-toggle" @click="toggleSection('experience')">
        <span><AppIcon icon="chart-line" class="jb-fi" /> Experiencia</span>
        <AppIcon :icon="openSections.experience ? 'chevron-up' : 'chevron-down'" class="jb-fi-caret" />
      </button>
      <div v-if="openSections.experience" class="jb-filter-body">
        <div v-for="opt in experienceLevelCatalog" :key="opt.id" class="jb-check-item">
          <input
            class="form-check-input"
            type="checkbox"
            :id="`exp-${opt.id}`"
            :checked="filters.experienceLevelId === opt.id"
            @change="filters.experienceLevelId = filters.experienceLevelId === opt.id ? null : opt.id"
          />
          <label :for="`exp-${opt.id}`">{{ opt.name }}</label>
        </div>
      </div>
    </div>

    <!-- Rango salarial -->
    <div class="jb-filter-block">
      <button class="jb-filter-toggle" @click="toggleSection('salary')">
        <span><AppIcon icon="dollar-sign" class="jb-fi" /> Salario</span>
        <AppIcon :icon="openSections.salary ? 'chevron-up' : 'chevron-down'" class="jb-fi-caret" />
      </button>
      <div v-if="openSections.salary" class="jb-filter-body">
        <div class="jb-salary-range">
          <input type="number" class="form-control form-control-sm" v-model.number="filters.salaryRangeMin" min="0" placeholder="Mínimo" />
          <span class="jb-salary-sep">–</span>
          <input type="number" class="form-control form-control-sm" v-model.number="filters.salaryRangeMax" min="0" placeholder="Máximo" />
        </div>
      </div>
    </div>

    <!-- Área profesional -->
    <div class="jb-filter-block">
      <button class="jb-filter-toggle" @click="toggleSection('area')">
        <span><AppIcon icon="briefcase" class="jb-fi" /> Área profesional</span>
        <AppIcon :icon="openSections.area ? 'chevron-up' : 'chevron-down'" class="jb-fi-caret" />
      </button>
      <div v-if="openSections.area" class="jb-filter-body">
        <select class="form-select form-select-sm" v-model="filters.professionalAreaId">
          <option :value="null">Todas las áreas</option>
          <option v-for="opt in professionalAreaCatalog" :key="opt.id" :value="opt.id">
            {{ opt.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Fecha de publicación -->
    <div class="jb-filter-block" style="border-bottom: none">
      <button class="jb-filter-toggle" @click="toggleSection('date')">
        <span><AppIcon icon="calendar-alt" class="jb-fi" /> Publicación</span>
        <AppIcon :icon="openSections.date ? 'chevron-up' : 'chevron-down'" class="jb-fi-caret" />
      </button>
      <div v-if="openSections.date" class="jb-filter-body">
        <label class="jb-filter-sublabel">Fecha de publicación (desde)</label>
        <input type="date" class="form-control form-control-sm" v-model="filters.publishedSince" />
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, watch, onMounted } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { GetModalityTypesService } from '../../institutionalConfiguration/services/getModalityTypes.service';
import { GetContractTypesService } from '../services/getContractTypes.service';
import { GetExperienceLevelsService } from '../services/getExperienceLevels.service';
import { GetProfessionalAreasService } from '../services/getProfessionalAreas.service';
import { JobVacancyCatalogItem } from '../dtos/vacancy.dto';

export interface JobBoardFiltersState {
  city: string;
  modalityTypeId: number | null;
  contractTypeId: number | null;
  experienceLevelId: number | null;
  professionalAreaId: number | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  publishedSince: string;
}

export default defineComponent({
  name: 'JobBoardFilters',
  components: { AppIcon },
  props: {
    resultCount: { type: Number, default: 0 },
  },
  emits: ['change'],
  setup(_, { emit }) {
    const modalityTypesService = new GetModalityTypesService();
    const contractTypesService = new GetContractTypesService();
    const experienceLevelsService = new GetExperienceLevelsService();
    const professionalAreasService = new GetProfessionalAreasService();

    const modalityCatalog = ref<JobVacancyCatalogItem[]>([]);
    const contractTypeCatalog = ref<JobVacancyCatalogItem[]>([]);
    const experienceLevelCatalog = ref<JobVacancyCatalogItem[]>([]);
    const professionalAreaCatalog = ref<JobVacancyCatalogItem[]>([]);

    const filters = reactive<JobBoardFiltersState>({
      city: '',
      modalityTypeId: null,
      contractTypeId: null,
      experienceLevelId: null,
      professionalAreaId: null,
      salaryRangeMin: null,
      salaryRangeMax: null,
      publishedSince: '',
    });

    const openSections = reactive({
      city: true,
      modality: true,
      contract: false,
      experience: false,
      salary: false,
      area: false,
      date: false,
    });

    const hasFilters = computed(
      () =>
        !!filters.city ||
        !!filters.modalityTypeId ||
        !!filters.contractTypeId ||
        !!filters.experienceLevelId ||
        !!filters.professionalAreaId ||
        !!filters.salaryRangeMin ||
        !!filters.salaryRangeMax ||
        !!filters.publishedSince
    );

    const toggleSection = (key: keyof typeof openSections) => {
      openSections[key] = !openSections[key];
    };

    const clearFilters = () => {
      filters.city = '';
      filters.modalityTypeId = null;
      filters.contractTypeId = null;
      filters.experienceLevelId = null;
      filters.professionalAreaId = null;
      filters.salaryRangeMin = null;
      filters.salaryRangeMax = null;
      filters.publishedSince = '';
    };

    const loadCatalogs = async () => {
      const [modRes, ctRes, expRes, areaRes] = await Promise.allSettled([modalityTypesService.run(), contractTypesService.run(), experienceLevelsService.run(), professionalAreasService.run()]);
      if (modRes.status === 'fulfilled') modalityCatalog.value = modRes.value?.data ?? [];
      if (ctRes.status === 'fulfilled') contractTypeCatalog.value = ctRes.value?.data ?? [];
      if (expRes.status === 'fulfilled') experienceLevelCatalog.value = expRes.value?.data ?? [];
      if (areaRes.status === 'fulfilled') professionalAreaCatalog.value = areaRes.value?.data ?? [];
    };

    watch(filters, () => emit('change', { ...filters }), { deep: true });

    onMounted(() => loadCatalogs());

    return {
      filters,
      openSections,
      hasFilters,
      toggleSection,
      clearFilters,
      modalityCatalog,
      contractTypeCatalog,
      experienceLevelCatalog,
      professionalAreaCatalog,
    };
  },
});
</script>

<style scoped>
.jb-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 10px;
}
.jb-sidebar-header {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}
.jb-sidebar-title {
  flex: 1;
  font-weight: 700;
  font-size: 0.85rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}
.jb-clear-btn {
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
.jb-clear-btn:hover {
  text-decoration: underline;
}
.jb-active-count {
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-primary, #2563eb);
  background: #eff6ff;
  border-bottom: 1px solid #dbeafe;
}
.jb-filter-block {
  border-bottom: 1px solid #f1f5f9;
}
.jb-filter-toggle {
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
.jb-filter-toggle:hover {
  background: #f8f9fa;
}
.jb-filter-toggle > span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.jb-fi {
  color: var(--color-primary, #2563eb);
  opacity: 0.8;
  font-size: 0.8rem;
}
.jb-fi-caret {
  color: #9ca3af;
  font-size: 0.72rem;
}
.jb-filter-body {
  padding: 4px 14px 12px;
}
.jb-check-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
}
.jb-check-item label {
  cursor: pointer;
}
.jb-salary-range {
  display: flex;
  align-items: center;
  gap: 6px;
}
.jb-salary-sep {
  color: #9ca3af;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.jb-filter-sublabel {
  display: block;
  font-size: 0.78rem;
  color: #6c757d;
  margin-bottom: 5px;
}
</style>
