<template>
  <AppBaseList title="Catálogo de Becas">
    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <!-- Page Header -->
        <div class="catalog-header">
          <h1 class="catalog-header__title">Catálogo de Becas</h1>
          <p class="catalog-header__subtitle">Explora las becas disponibles y postúlate según tus necesidades y méritos académicos.</p>
        </div>

        <!-- Search + Filter row -->
        <div class="catalog-toolbar">
          <div class="catalog-search">
            <AppFormField label="Buscar" capitalize>
              <div class="catalog-search__wrap">
                <AppIcon icon="search" class="catalog-search__icon" />
                <input v-model="searchQuery" type="text" class="catalog-search__input" placeholder="Buscar becas por nombre..." @input="onSearchInput" />
              </div>
            </AppFormField>
          </div>

          <div class="catalog-type-filter">
            <AppFormField label="Tipo de Beca" capitalize>
              <AppAutocomplete v-model="selectedTypeId" :options="scholarshipTypes" input-id="typeScholarshipId" placeholder="Todos los tipos" @update:modelValue="onTypeChange" />
            </AppFormField>
          </div>
        </div>

        <!-- Cards Grid -->
        <div v-if="filteredScholarships.length > 0" class="catalog-grid">
          <ScholarshipCard v-for="scholarship in filteredScholarships" :key="scholarship.id" :scholarship="scholarship" @detail="onViewDetail" @apply="onApply" />
        </div>

        <!-- Empty State -->
        <AppEmptyResponse v-else />

        <!-- Important Info -->
      </template>
    </template>
  </AppBaseList>

  <!-- Detail Drawer -->
  <ScholarshipDetailModal v-if="selectedScholarship" :isVisible="showDetailModal" :scholarship="selectedScholarship" @update:isVisible="showDetailModal = $event" @apply="onApply" />
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import ScholarshipCard from '../components/ScholarshipCard.vue';
import ScholarshipDetailModal from '../components/ScholarshipDetailModal.vue';

import { GetScholarshipCatalogService } from '../services/getScholarshipCatalog.service';
import { GetTypeScholarshipsService } from '../services/getTypeScholarships.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import type { ScholarshipDto, ScholarshipCatalogItemDto, TypeScholarshipDto } from '../dtos/scholarship.dto';

const TYPE_ICON_MAP: Record<string, { icon: string; iconColor: string }> = {
  excelencia: { icon: 'chart-line', iconColor: 'blue' },
  mérito: { icon: 'star', iconColor: 'indigo' },
  necesidad: { icon: 'heartbeat', iconColor: 'green' },
  talento: { icon: 'palette', iconColor: 'purple' },
  investigación: { icon: 'brain', iconColor: 'teal' },
  deportiva: { icon: 'running', iconColor: 'orange' },
};

function mapApiItemToDto(item: ScholarshipCatalogItemDto, typesMap?: Map<number, string>): ScholarshipDto {
  const typeName = (item.typeScholarship?.name ?? '').toLowerCase();
  const iconEntry = Object.entries(TYPE_ICON_MAP).find(([key]) => typeName.includes(key));
  const { icon, iconColor } = iconEntry?.[1] ?? {
    icon: 'graduation-cap',
    iconColor: 'blue',
  };

  const now = new Date();
  const endDate = item.endDate ? new Date(item.endDate) : null;
  const startDate = item.startDate ? new Date(item.startDate) : null;

  const diffMs = endDate ? endDate.getTime() - now.getTime() : null;
  const diffDays = diffMs !== null ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;

  const apiStatus = (item.statusScholarship ?? '').toLowerCase();
  let status: 'active' | 'upcoming' | 'closed';
  if (apiStatus.includes('activ')) {
    status = 'active';
  } else if (apiStatus.includes('prox') || (startDate && now < startDate)) {
    status = 'upcoming';
  } else if (apiStatus.includes('cerr') || apiStatus.includes('inactiv') || (endDate && now > endDate)) {
    status = 'closed';
  } else {
    status = 'active';
  }

  const year = item.academicPeriod?.name ?? (item.startDate ? new Date(item.startDate).getFullYear().toString() : '');

  const deadline = endDate
    ? endDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const coverage = item.percentage != null ? `Hasta ${item.percentage}% de matrícula` : '';

  const typeDescription = item.typeScholarship?.id ? typesMap?.get(item.typeScholarship.id) ?? '' : '';

  return {
    id: item.id,
    name: item.name,
    description: typeDescription,
    type: typeName.replace(/\s+/g, '-'),
    typeLabel: item.typeScholarship?.name ?? '',
    icon,
    iconColor,
    image: item.photoUrl,
    year,
    status,
    coverage,
    deadline,
    isDeadlineClose: diffDays !== null && diffDays >= 0 && diffDays <= 30,
    availableSlots: item.availableCapacity ?? item.capacity ?? 0,
    requirements: (item.typeScholarship?.defaultRequirements ?? [])
      .map((r: any) => {
        const req = r.scholarshipRequirement;
        return req ? `${req.requirementType} ${req.operator} ${req.value}` : '';
      })
      .filter(Boolean),
    additionalInfo: item.additionalInfo,
    canApply: status === 'active',
  };
}

export default defineComponent({
  name: 'ScholarshipCatalog',
  components: {
    AppBaseList,
    AppLoading,
    AppEmptyResponse,
    AppIcon,
    AppFormField,
    AppAutocomplete,
    ScholarshipCard,
    ScholarshipDetailModal,
  },

  setup() {
    useMeta({ title: 'Catálogo de Becas' });

    const router = useRouter();
    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = { name: 'Catálogo de Becas', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const catalogService = new GetScholarshipCatalogService();
    const typeScholarshipsService = new GetTypeScholarshipsService();
    const institutionsService = new InstitutionsService();

    const isLoading = ref(true);
    const scholarships = ref<ScholarshipDto[]>([]);
    const scholarshipTypes = ref<TypeScholarshipDto[]>([]);
    const searchQuery = ref('');
    const selectedTypeId = ref<number | null>(null);

    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    const filteredScholarships = computed(() => {
      if (!searchQuery.value.trim()) return scholarships.value;
      const q = searchQuery.value.toLowerCase();
      return scholarships.value.filter((s) => s.name.toLowerCase().includes(q));
    });

    async function loadCatalog() {
      const institutionId = institutionsService.getSelectedInstitution()?.id;
      const params: Record<string, any> = {
        noPag: false,
        perPage: 100,
        page: 1,
      };
      if (institutionId) params.institutionId = institutionId;
      if (selectedTypeId.value) params.typeScholarshipId = selectedTypeId.value;

      const response = await catalogService.run(params);
      const typesMap = new Map<number, string>(scholarshipTypes.value.map((t) => [t.id, t.description ?? '']));
      scholarships.value = (response.data ?? []).map((item: ScholarshipCatalogItemDto) => mapApiItemToDto(item, typesMap));
    }

    async function loadTypes() {
      const response = await typeScholarshipsService.run({ noPag: true });
      scholarshipTypes.value = response.data ?? response ?? [];
    }

    async function loadAll() {
      isLoading.value = true;
      try {
        await loadTypes();
        await loadCatalog();
      } catch {
        scholarships.value = [];
      } finally {
        isLoading.value = false;
      }
    }

    function onSearchInput() {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        /* client-side filtering via computed — no reload needed */
      }, 300);
    }

    async function onTypeChange() {
      isLoading.value = true;
      try {
        await loadCatalog();
      } finally {
        isLoading.value = false;
      }
    }

    onMounted(loadAll);

    const showDetailModal = ref(false);
    const selectedScholarship = ref<ScholarshipDto | null>(null);

    const onViewDetail = (scholarship: ScholarshipDto) => {
      selectedScholarship.value = scholarship;
      showDetailModal.value = true;
    };

    const onApply = (scholarship: ScholarshipDto) => {
      showDetailModal.value = false;
      router.push({
        name: 'studentWeldare.scholarshipApplication',
        query: {
          id: scholarship.id,
          name: scholarship.name,
          typeLabel: scholarship.typeLabel,
          coverage: scholarship.coverage,
        },
      });
    };

    return {
      isLoading,
      searchQuery,
      selectedTypeId,
      scholarshipTypes,
      filteredScholarships,
      showDetailModal,
      selectedScholarship,
      onViewDetail,
      onApply,
      onSearchInput,
      onTypeChange,
    };
  },
});
</script>

<style scoped>
.catalog-header {
  margin-bottom: 16px;
}
.catalog-header__title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}
.catalog-header__subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Toolbar */
.catalog-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Search */
.catalog-search {
  width: 260px;
  flex-shrink: 0;
}
.catalog-search__wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.catalog-search__icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}
.catalog-search__input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  height: 36px;
}
.catalog-search__input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* Type filter */
.catalog-type-filter {
  min-width: 220px;
}

/* Cards Grid */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
  .catalog-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .catalog-type-filter {
    min-width: unset;
  }
}

/* Info box */
.catalog-info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 14px 16px;
  margin-top: 4px;
}
.catalog-info-box__icon {
  color: #2563eb;
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}
.catalog-info-box__text {
  font-size: 13px;
  color: #1e40af;
  margin: 0;
}
</style>
