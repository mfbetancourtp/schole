<template>
  <AppBaseList title="Empresas">
    <template #actions>
      <AppButton variant="light" outlined size="sm" nativeType="button" @click="openRegister(null)"><AppIcon icon="plus" /> Registrar empresa</AppButton>
    </template>

    <template #content>
      <div class="companies-page">
        <!-- Search bar -->
        <div class="cp-search-bar">
          <span class="cp-search-icon"><AppIcon icon="search" /></span>
          <input type="text" class="cp-search-input" placeholder="Buscar por nombre, industria, ciudad..." v-model="searchQuery" />
          <button v-if="searchQuery" class="cp-search-clear" @click="searchQuery = ''">
            <AppIcon icon="times" />
          </button>
        </div>

        <!-- Stats -->
        <div class="cp-stats">
          <div class="cp-stat-card">
            <span class="cp-stat-icon cp-stat-icon--blue"><AppIcon icon="building" /></span>
            <div>
              <p class="cp-stat-num">{{ totalCompanies }}</p>
              <p class="cp-stat-label">Empresas registradas</p>
            </div>
          </div>
          <div class="cp-stat-card">
            <span class="cp-stat-icon cp-stat-icon--green"><AppIcon icon="check-circle" /></span>
            <div>
              <p class="cp-stat-num">{{ totalActiveJobVacancies }}</p>
              <p class="cp-stat-label">Vacantes activas</p>
            </div>
          </div>
          <div class="cp-stat-card">
            <span class="cp-stat-icon cp-stat-icon--purple"><AppIcon icon="bullhorn" /></span>
            <div>
              <p class="cp-stat-num">{{ totalJobVacancies }}</p>
              <p class="cp-stat-label">Vacantes publicadas</p>
            </div>
          </div>
        </div>

        <div class="cp-layout">
          <!-- Sidebar filters -->
          <CompanyFilters ref="filtersRef" :result-count="filteredCompanies.length" :available-cities="availableCities" @change="onFiltersChange" />

          <!-- Main -->
          <main class="cp-main">
            <p class="cp-showing">Mostrando {{ filteredCompanies.length }} empresa{{ filteredCompanies.length !== 1 ? 's' : '' }}</p>

            <AppLoading v-if="loading" />

            <div v-else-if="filteredCompanies.length === 0" class="cp-empty">
              <AppIcon icon="building" />
              <p>No se encontraron empresas con los filtros seleccionados.</p>
              <AppButton outlined variant="secondary" size="sm" nativeType="button" @click="filtersRef?.clearFilters()"><AppIcon icon="times" /> Limpiar filtros</AppButton>
            </div>

            <div v-else class="cp-list">
              <div v-for="company in paginatedCompanies" :key="company.id" class="cp-row">
                <!-- Logo -->
                <div class="cp-row-logo">
                  <img v-if="company.photoUrl" :src="company.photoUrl" :alt="company.name" />
                  <span v-else class="cp-logo-icon"><AppIcon icon="building" /></span>
                </div>

                <!-- Info -->
                <div class="cp-row-info">
                  <p class="cp-row-name">{{ company.name }}</p>
                  <p class="cp-row-industry">{{ company.industry?.name }}</p>
                  <div class="cp-row-meta">
                    <span class="cp-meta-item">
                      <AppIcon icon="map-marker-alt" class="cp-fi cp-fi--blue" />
                      {{ company.municipality?.name }}<span v-if="company.municipality?.region?.country">, {{ company.municipality.region.country.name }}</span>
                    </span>
                    <a v-if="company.webPage" :href="company.webPage" target="_blank" class="cp-meta-item cp-meta-item--link" @click.stop>
                      <AppIcon icon="globe" class="cp-fi cp-fi--blue" />
                      {{ company.webPage }}
                    </a>
                  </div>
                  <div class="cp-row-badges">
                    <span class="cp-size-badge">{{ company.companySize?.name }}</span>
                    <span v-if="(company.activeJobVacancies ?? 0) > 0" class="cp-vacancies-badge cp-vacancies-badge--active">
                      <AppIcon icon="briefcase" />
                      {{ company.activeJobVacancies }} vacante{{ company.activeJobVacancies !== 1 ? 's' : '' }} activa{{ company.activeJobVacancies !== 1 ? 's' : '' }}
                    </span>
                    <span v-else class="cp-vacancies-badge cp-vacancies-badge--none">Sin vacantes</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="cp-row-actions">
                  <AppButtonEdit @click="openRegister(company)" />
                  <AppButtonDelete @click="confirmDelete(company)" />
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="filteredCompanies.length > 0" class="cp-pagination">
              <AppPagination :current="currentPage" :total="filteredCompanies.length" :per-page="perPage" :loading="loading" @update:current="currentPage = $event" />
            </div>
          </main>
        </div>
      </div>

      <RegisterCompanyModal :isVisible="showForm" :data="selectedCompany" @update:isVisible="showForm = $event" @save="saveCompany" />

      <!-- Delete confirm -->
      <AppModal v-model="showDeleteConfirm">
        <AppConfirmDeleteModal v-if="showDeleteConfirm" entity="empresa" @confirmDelete="deleteCompany" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppPagination from '../../../shared/components/AppPagination.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import { useHeaderStore } from '../../../stores/header.store';
import RegisterCompanyModal from '../components/RegisterCompanyModal.vue';
import CompanyFilters, { type CompanyFiltersState } from '../components/CompanyFilters.vue';
import { CompanyDto } from '../dtos/company.dto';
import { GetCompaniesService } from '../services/getCompanies.service';
import { GetCompaniesStatsService } from '../services/getCompaniesStats.service';
import { DeleteCompanyService } from '../services/deleteCompany.service';
import InstitutionsStore from '../../../shared/stores/institutions.store';

const getCompaniesService = new GetCompaniesService();
const getCompaniesStatsService = new GetCompaniesStatsService();
const deleteCompanyService = new DeleteCompanyService();

export default defineComponent({
  name: 'CompaniesPage',
  components: {
    AppBaseList,
    AppLoading,
    AppIcon,
    AppPagination,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppConfirmDeleteModal,
    AppModal,
    RegisterCompanyModal,
    CompanyFilters,
  },
  setup() {
    useMeta({ title: 'Empresas' });
    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Egresados', url: '' };
    headerStore.moduleItem = { name: 'Empresas', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const loading = ref(true);
    const companies = ref<CompanyDto[]>([]);
    const totalCompanies = ref(0);
    const totalActiveJobVacancies = ref(0);
    const totalJobVacancies = ref(0);
    const searchQuery = ref('');
    const filtersRef = ref<{ clearFilters: () => void } | null>(null);

    const currentFilters = ref<CompanyFiltersState>({
      industry: '',
      size: '',
      city: '',
      onlyWithVacancies: false,
    });

    const onFiltersChange = (f: CompanyFiltersState) => {
      currentFilters.value = f;
    };

    const getInstitutionId = () => InstitutionsStore.state.selectedInstitution?.id ?? null;

    const getData = async () => {
      companies.value = await getCompaniesService.run({
        institutionId: getInstitutionId(),
      });
    };

    const loadStats = async () => {
      const stats = await getCompaniesStatsService.run({
        institutionId: getInstitutionId(),
      });
      totalCompanies.value = stats.totalCompanies;
      totalActiveJobVacancies.value = stats.totalActiveJobVacancies;
      totalJobVacancies.value = stats.totalJobVacancies;
    };

    onMounted(async () => {
      try {
        await Promise.all([getData(), loadStats()]);
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    });

    const availableCities = computed(() => [...new Set(companies.value.map((c) => c.municipality?.name).filter(Boolean) as string[])].sort());

    const filteredCompanies = computed(() => {
      const f = currentFilters.value;
      let list = companies.value;
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.industry?.name ?? '').toLowerCase().includes(q) || (c.municipality?.name ?? '').toLowerCase().includes(q));
      }
      if (f.industry) list = list.filter((c) => c.industry?.name === f.industry);
      if (f.size) list = list.filter((c) => c.companySize?.name === f.size);
      if (f.city) list = list.filter((c) => c.municipality?.name === f.city);
      if (f.onlyWithVacancies) list = list.filter((c) => (c.activeJobVacancies ?? 0) > 0);
      return list;
    });

    const perPage = 10;
    const currentPage = ref(1);
    watch(filteredCompanies, () => {
      currentPage.value = 1;
    });
    const paginatedCompanies = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      return filteredCompanies.value.slice(start, start + perPage);
    });

    const showForm = ref(false);
    const selectedCompany = ref<CompanyDto | null>(null);

    const openRegister = (company: CompanyDto | null) => {
      selectedCompany.value = company;
      showForm.value = true;
    };

    const saveCompany = async (saved?: { id?: number; photoUrl?: string | null }) => {
      showForm.value = false;
      await Promise.all([getData(), loadStats()]);
      if (saved?.id && saved?.photoUrl) {
        const company = companies.value.find((c) => c.id === saved.id);
        if (company) company.photoUrl = saved.photoUrl as string;
      }
    };

    const showDeleteConfirm = ref(false);
    const companyToDelete = ref<CompanyDto | null>(null);

    const confirmDelete = (company: CompanyDto) => {
      companyToDelete.value = company;
      showDeleteConfirm.value = true;
    };

    const deleteCompany = async () => {
      if (!companyToDelete.value) return;
      try {
        await deleteCompanyService.run(companyToDelete.value.id);
        showDeleteConfirm.value = false;
        companyToDelete.value = null;
        await Promise.all([getData(), loadStats()]);
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      companies,
      totalCompanies,
      totalActiveJobVacancies,
      totalJobVacancies,
      searchQuery,
      filtersRef,
      onFiltersChange,
      availableCities,
      filteredCompanies,
      paginatedCompanies,
      perPage,
      currentPage,
      showForm,
      selectedCompany,
      openRegister,
      saveCompany,
      showDeleteConfirm,
      confirmDelete,
      deleteCompany,
    };
  },
});
</script>

<style scoped>
.companies-page {
  padding: 4px 0 32px;
}

/* Search */
.cp-search-bar {
  position: relative;
  margin-bottom: 20px;
}
.cp-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
.cp-search-input {
  width: 100%;
  padding: 10px 36px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cp-search-input:focus {
  border-color: var(--color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.cp-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px 6px;
}
.cp-search-clear:hover {
  color: #374151;
}

/* Stats */
.cp-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.cp-stat-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.cp-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.cp-stat-icon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.cp-stat-icon--green {
  background: #dcfce7;
  color: #16a34a;
}
.cp-stat-icon--purple {
  background: #ede9fe;
  color: #6d28d9;
}
.cp-stat-num {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}
.cp-stat-label {
  font-size: 0.78rem;
  color: #6c757d;
  margin: 3px 0 0;
}

/* Layout */
.cp-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* Main */
.cp-main {
  flex: 1;
  min-width: 0;
}
.cp-showing {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 12px;
}

/* Company list */
.cp-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cp-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  padding: 16px 18px;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.cp-row:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  border-color: #93c5fd;
}
.cp-row-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.cp-row-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.cp-logo-icon {
  font-size: 1.4rem;
  color: #1d4ed8;
}
.cp-row-info {
  flex: 1;
  min-width: 0;
}
.cp-row-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  margin: 0 0 2px;
}
.cp-row-industry {
  font-size: 0.82rem;
  color: #6c757d;
  margin: 0 0 6px;
}
.cp-row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 8px;
}
.cp-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  color: #4b5563;
}
.cp-meta-item--link {
  color: var(--color-primary, #2563eb);
  text-decoration: none;
}
.cp-meta-item--link:hover {
  text-decoration: underline;
}
.cp-fi {
  font-size: 0.78rem;
}
.cp-fi--blue {
  color: var(--color-primary, #2563eb);
}
.cp-row-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.cp-vacancies-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}
.cp-vacancies-badge--active {
  background: #dcfce7;
  color: #166534;
}
.cp-vacancies-badge--none {
  background: #f1f5f9;
  color: #9ca3af;
}
.cp-size-badge {
  font-size: 0.76rem;
  color: #6c757d;
}
.cp-row-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* Empty */
.cp-empty {
  text-align: center;
  padding: 40px 16px;
  color: #9ca3af;
  font-size: 2rem;
}
.cp-empty p {
  font-size: 0.9rem;
  margin: 8px 0 16px;
}

/* Pagination */
.cp-pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0 4px;
}

/* Responsive */
@media (max-width: 900px) {
  .cp-layout {
    flex-direction: column;
  }
  .cp-stats {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .cp-stats {
    grid-template-columns: 1fr;
  }
  .cp-row {
    flex-wrap: wrap;
  }
  .cp-row-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
