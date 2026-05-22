<template>
  <AppBaseList title="Bolsa de Empleo">
    <template #actions>
      <AppButton variant="light" outlined size="sm" nativeType="button" @click="showMyApplications = true">
        <AppIcon icon="clipboard-list" /> Mis postulaciones
        <span v-if="applications.length > 0" class="badge bg-light text-primary ms-1">{{ applications.length }}</span>
      </AppButton>
      <AppButton variant="light" outlined size="sm" nativeType="button" @click="openCreateVacancy"><AppIcon icon="bullhorn" /> Publicar vacante</AppButton>
    </template>

    <template #content>
      <div class="job-board">
        <!-- Search bar -->
        <div class="jb-search-bar">
          <span class="jb-search-icon"><AppIcon icon="search" /></span>
          <input type="text" class="jb-search-input" placeholder="Buscar por cargo, empresa o habilidad..." v-model="searchQuery" />
          <button v-if="searchQuery" class="jb-search-clear" @click="searchQuery = ''">
            <AppIcon icon="times" />
          </button>
        </div>

        <div class="jb-layout">
          <!-- ─── Sidebar filters ─── -->
          <JobBoardFilters :result-count="filteredVacancies.length" @change="onFiltersChange" />

          <!-- ─── Main content ─── -->
          <main class="jb-main">
            <!-- Recommended vacancies -->
            <section class="jb-section">
              <h6 class="jb-section-title">
                <span class="jb-section-icon jb-section-icon--yellow"><AppIcon icon="star" /></span>
                Recomendadas para ti
              </h6>
              <AppLoading v-if="loading" />
              <p v-else-if="recommendedVacancies.length === 0" class="jb-empty-mini">No hay vacantes recomendadas por ahora.</p>
              <div v-else class="jb-list">
                <div v-for="v in recommendedVacancies" :key="v.id" class="jb-row jb-row--recommended" @click="openDetail(v)">
                  <div class="jb-row-logo">
                    <img v-if="v.companyLogo" :src="v.companyLogo" :alt="v.company" />
                    <span v-else class="jb-logo-letter">{{ v.company?.[0] ?? '?' }}</span>
                  </div>
                  <div class="jb-row-info">
                    <p class="jb-row-title">{{ v.title }}</p>
                    <p class="jb-row-company"><AppIcon icon="building" class="jb-fi" /> {{ v.company }}</p>
                    <div class="jb-row-chips">
                      <span class="jb-chip jb-chip--city"><AppIcon icon="map-marker-alt" /> {{ v.city }}</span>
                      <span class="jb-chip jb-chip--modality">{{ modalityLabel(v.modality) }}</span>
                      <span class="jb-chip jb-chip--contract">{{ contractLabel(v.contractType) }}</span>
                      <span class="jb-chip jb-chip--rec"><AppIcon icon="star" /> Recomendada</span>
                    </div>
                  </div>
                  <div class="jb-row-right">
                    <div class="jb-row-meta">
                      <span><AppIcon icon="clock" /> {{ timeSince(v.publishedAt) }}</span>
                    </div>
                    <div class="jb-row-btns">
                      <button
                        class="jb-save-btn"
                        :class="{ 'jb-save-btn--active': savedIds.has(v.id) }"
                        @click.stop="toggleSave(v)"
                        :title="savedIds.has(v.id) ? 'Quitar de guardados' : 'Guardar vacante'"
                      >
                        <AppIcon icon="bookmark" />
                      </button>
                      <AppButtonEdit size="sm" nativeType="button" @click.stop="openEdit(v)" />
                      <AppButtonDelete size="sm" nativeType="button" @click.stop="openDeleteConfirm(v)" />
                      <AppButton outlined variant="secondary" size="sm" nativeType="button" @click.stop="openDetail(v)"><AppIcon icon="eye" /> Ver detalle</AppButton>
                      <span v-if="appliedIds.has(v.id)" class="jb-applied-badge"> <AppIcon icon="check-circle" /> Ya postulado </span>
                      <AppButton v-else variant="primary" size="sm" nativeType="button" @click.stop="openApply(v)"><AppIcon icon="paper-plane" /> Postularme</AppButton>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Companies hiring graduates -->
            <section class="jb-section">
              <h6 class="jb-section-title">
                <span class="jb-section-icon jb-section-icon--blue"><AppIcon icon="building" /></span>
                Empresas contratando egresados
              </h6>
              <div class="jb-companies-grid">
                <div v-for="company in featuredCompanies" :key="company.id" class="jb-company-card" @click="searchQuery = company.name">
                  <div class="jb-company-logo">
                    <img v-if="company.logo" :src="company.logo" :alt="company.name" />
                    <span v-else class="jb-company-letter">{{ company.name?.[0] ?? '?' }}</span>
                  </div>
                  <p class="jb-company-name">{{ company.name }}</p>
                  <p class="jb-company-sector">{{ company.sector }}</p>
                  <span class="jb-company-count"> <AppIcon icon="briefcase" /> {{ company.vacanciesCount }} </span>
                </div>
              </div>
            </section>

            <!-- All vacancies -->
            <section class="jb-section">
              <div class="jb-list-header">
                <h6 class="jb-section-title">
                  <span class="jb-section-icon jb-section-icon--gray"><AppIcon icon="list" /></span>
                  Todas las vacantes
                </h6>
                <span class="jb-result-count">{{ totalVacancies }} resultado{{ totalVacancies !== 1 ? 's' : '' }}</span>
              </div>

              <AppLoading v-if="loading" />
              <div v-else-if="filteredVacancies.length === 0" class="jb-empty">
                <AppIcon icon="search" />
                <p>No se encontraron vacantes con los filtros seleccionados.</p>
                <AppButton outlined variant="secondary" size="sm" nativeType="button" @click="clearFilters"><AppIcon icon="times" /> Limpiar filtros</AppButton>
              </div>
              <div v-else class="jb-list">
                <div v-for="v in paginatedVacancies" :key="v.id" class="jb-row" @click="openDetail(v)">
                  <div class="jb-row-logo">
                    <img v-if="v.companyLogo" :src="v.companyLogo" :alt="v.company" />
                    <span v-else class="jb-logo-letter">{{ v.company?.[0] ?? '?' }}</span>
                  </div>
                  <div class="jb-row-info">
                    <p class="jb-row-title">{{ v.title }}</p>
                    <p class="jb-row-company"><AppIcon icon="building" class="jb-fi" /> {{ v.company }}</p>
                    <div class="jb-row-chips">
                      <span class="jb-chip jb-chip--city"><AppIcon icon="map-marker-alt" /> {{ v.city }}</span>
                      <span class="jb-chip jb-chip--modality">{{ modalityLabel(v.modality) }}</span>
                      <span class="jb-chip jb-chip--contract">{{ contractLabel(v.contractType) }}</span>
                      <span v-if="v.experienceLevel" class="jb-chip jb-chip--level">{{ experienceLabel(v.experienceLevel) }}</span>
                      <span v-if="v.isRecommended" class="jb-chip jb-chip--rec"><AppIcon icon="star" /> Recomendada</span>
                    </div>
                  </div>
                  <div class="jb-row-right">
                    <div class="jb-row-meta">
                      <span><AppIcon icon="clock" /> {{ timeSince(v.publishedAt) }}</span>
                    </div>
                    <div class="jb-row-btns">
                      <button
                        class="jb-save-btn"
                        :class="{ 'jb-save-btn--active': savedIds.has(v.id) }"
                        @click.stop="toggleSave(v)"
                        :title="savedIds.has(v.id) ? 'Quitar de guardados' : 'Guardar vacante'"
                      >
                        <AppIcon icon="bookmark" />
                      </button>
                      <AppButtonEdit size="sm" nativeType="button" @click.stop="openEdit(v)" />
                      <AppButtonDelete size="sm" nativeType="button" @click.stop="openDeleteConfirm(v)" />
                      <AppButton outlined variant="secondary" size="sm" nativeType="button" @click.stop="openDetail(v)"><AppIcon icon="eye" /> Ver detalle</AppButton>
                      <span v-if="appliedIds.has(v.id)" class="jb-applied-badge"> <AppIcon icon="check-circle" /> Ya postulado </span>
                      <AppButton v-else variant="primary" size="sm" nativeType="button" @click.stop="openApply(v)"><AppIcon icon="paper-plane" /> Postularme</AppButton>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Paginación -->
              <div v-if="totalVacancies > 0" class="jb-pagination">
                <AppPagination :current="currentPage" :total="totalVacancies" :per-page="perPage" :loading="loading" @update:current="handlePageChange" />
              </div>
            </section>
          </main>
        </div>
      </div>

      <!-- ─── Drawers ─── -->
      <VacancyDetailDrawer
        :isVisible="showDetail"
        @update:isVisible="showDetail = $event"
        :vacancy="selectedVacancy"
        :is-saved="selectedVacancy ? savedIds.has(selectedVacancy.id) : false"
        :is-applied="selectedVacancy ? appliedIds.has(selectedVacancy.id) : false"
        @apply="openApply"
        @save="toggleSave"
        @share="shareVacancy"
      />

      <ApplyVacancyDrawer :isVisible="showApply" @update:isVisible="showApply = $event" :vacancy="selectedVacancy" :cv-files="cvFiles" @save="submitApplication" />

      <PublishVacancyDrawer :isVisible="showPublishVacancy" @update:isVisible="showPublishVacancy = $event" :data="editVacancyData" @save="publishVacancy" />

      <AppModal v-model="showDeleteConfirm">
        <AppConfirmDeleteModal v-if="showDeleteConfirm" entity="vacante" @confirmDelete="confirmDelete" />
      </AppModal>

      <MyApplicationsDrawer
        :isVisible="showMyApplications"
        @update:isVisible="showMyApplications = $event"
        @withdraw="withdrawApplication"
        @unsave="toggleSave"
        @view="onSavedView"
        @apply="onSavedApply"
        :saved-vacancies="savedVacancies"
        :applied-ids="appliedIds"
      />
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
import { useHeaderStore } from '../../../stores/header.store';
import { ToastService } from '../../../shared/services/toast.service';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import VacancyDetailDrawer from '../components/VacancyDetailDrawer.vue';
import ApplyVacancyDrawer from '../components/ApplyVacancyDrawer.vue';
import PublishVacancyDrawer from '../components/PublishVacancyDrawer.vue';
import MyApplicationsDrawer from '../components/MyApplicationsDrawer.vue';
import { DeleteJobVacancyService } from '../services/deleteJobVacancy.service';
import { debounce } from 'ts-debounce';
import { VacancyDto, ContractType, Modality, ExperienceLevel, JobVacancyDto, JobVacancyStatDto, UpsertJobVacancyRequest } from '../dtos/vacancy.dto';
import { ApplicationDto, mapApiApplication } from '../dtos/application.dto';
import { GetJobVacanciesService } from '../services/getJobVacancies.service';
import { GetJobVacanciesStatsService } from '../services/getJobVacanciesStats.service';
import { CreateApplicationService } from '../services/createApplication.service';
import { GetApplicationsService } from '../services/getApplications.service';
import { GetGraduateFilesService } from '../services/getGraduateFiles.service';
import { useUserStore } from '../../../stores/user';
import JobBoardFilters, { type JobBoardFiltersState } from '../components/JobBoardFilters.vue';

const MODALITY_LABEL: Record<Modality, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

const CONTRACT_LABEL: Record<ContractType, string> = {
  'full-time': 'Tiempo completo',
  'part-time': 'Medio tiempo',
  contract: 'Contrato',
  internship: 'Pasantía',
  freelance: 'Freelance',
};

const EXPERIENCE_LABEL: Record<ExperienceLevel, string> = {
  junior: 'Junior',
  'semi-senior': 'Semi-senior',
  senior: 'Senior',
  lider: 'Líder',
};

interface FeaturedCompanyItem {
  id: number;
  name: string;
  sector: string;
  vacanciesCount: number;
  city: string;
}

const mapVacancy = (v: JobVacancyDto): VacancyDto => ({
  id: v.id,
  title: v.name,
  company: v.company?.name ?? '',
  companyId: v.company?.id ?? undefined,
  city: v.municipality?.name ?? '',
  country: v.municipality?.region?.country?.name ?? '',
  modality: (v.modalityType?.name?.toLowerCase() ?? '') as Modality,
  modalityTypeId: v.modalityType?.id ?? undefined,
  contractType: (v.contractType?.name?.toLowerCase() ?? '') as ContractType,
  contractTypeId: v.contractType?.id ?? undefined,
  experienceLevel: (v.experienceLevel?.name?.toLowerCase() ?? '') as ExperienceLevel,
  experienceLevelId: v.experienceLevel?.id ?? undefined,
  professionalArea: v.professionalArea?.name ?? '',
  professionalAreaId: v.professionalArea?.id ?? undefined,
  municipalityId: v.municipality?.id ?? undefined,
  salaryMin: v.salaryRangeMin ?? undefined,
  salaryMax: v.salaryRangeMax ?? undefined,
  description: v.description,
  requirements: v.requirements,
  benefits: v.benefits ?? undefined,
  applicationDeadline: v.applicationDeadline ?? undefined,
  skills: [],
  publishedAt: v.createdAt,
  applicantsCount: 0,
});

// ──────────────────────────────────────────────────────────────────────────────

export default defineComponent({
  name: 'JobBoardPage',
  components: {
    AppBaseList,
    AppLoading,
    AppIcon,
    AppPagination,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppModal,
    AppConfirmDeleteModal,
    JobBoardFilters,
    VacancyDetailDrawer,
    ApplyVacancyDrawer,
    PublishVacancyDrawer,
    MyApplicationsDrawer,
  },
  setup() {
    useMeta({ title: 'Bolsa de Empleo' });
    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Egresados', url: '' };
    headerStore.moduleItem = { name: 'Bolsa de Empleo', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const userStore = useUserStore();
    const toast = new ToastService();
    const jobVacanciesService = new GetJobVacanciesService();
    const jobVacanciesStatsService = new GetJobVacanciesStatsService();
    const createApplicationService = new CreateApplicationService();
    const getApplicationsService = new GetApplicationsService();
    const getFilesService = new GetGraduateFilesService();
    const deleteJobVacancyService = new DeleteJobVacancyService();

    const loading = ref(false);
    const vacancies = ref<VacancyDto[]>([]);
    const featuredCompanies = ref<FeaturedCompanyItem[]>([]);
    const applications = ref<ApplicationDto[]>([]);
    const savedVacancies = ref<VacancyDto[]>([]);
    const cvFiles = ref<{ id: number; name: string }[]>([]);

    const getSavedKey = () => `graduates_saved_${userStore.user?.id ?? 'anon'}`;

    const persistSaved = () => {
      try {
        localStorage.setItem(getSavedKey(), JSON.stringify(savedVacancies.value));
      } catch {
        // ignore storage errors
      }
    };

    const loadSavedVacancies = () => {
      try {
        const stored = localStorage.getItem(getSavedKey());
        if (stored) savedVacancies.value = JSON.parse(stored);
      } catch {
        // ignore corrupt data
      }
    };

    const savedIds = computed(() => new Set(savedVacancies.value.map((v) => v.id)));
    const appliedIds = computed(() => new Set(applications.value.map((a) => a.vacancyId)));

    const searchQuery = ref('');

    const activeFilters = ref<JobBoardFiltersState>({
      city: '',
      modalityTypeId: null,
      contractTypeId: null,
      experienceLevelId: null,
      professionalAreaId: null,
      salaryRangeMin: null,
      salaryRangeMax: null,
      publishedSince: '',
    });

    const onFiltersChange = (state: JobBoardFiltersState) => {
      activeFilters.value = state;
    };

    const clearFilters = () => {
      searchQuery.value = '';
      activeFilters.value = {
        city: '',
        modalityTypeId: null,
        contractTypeId: null,
        experienceLevelId: null,
        professionalAreaId: null,
        salaryRangeMin: null,
        salaryRangeMax: null,
        publishedSince: '',
      };
    };

    const filteredVacancies = computed(() => {
      if (!activeFilters.value.city) return vacancies.value;
      const q = activeFilters.value.city.toLowerCase();
      return vacancies.value.filter((v) => v.city.toLowerCase().includes(q));
    });

    const recommendedVacancies = computed(() => vacancies.value.filter((v) => v.isRecommended));

    // Pagination
    const perPage = 10;
    const currentPage = ref(1);
    const apiTotalVacancies = ref(0);

    const totalVacancies = computed(() => (activeFilters.value.city ? filteredVacancies.value.length : apiTotalVacancies.value));

    const paginatedVacancies = computed(() => filteredVacancies.value);

    // Modals
    const showDetail = ref(false);
    const showApply = ref(false);
    const showPublishVacancy = ref(false);
    const showMyApplications = ref(false);
    const showDeleteConfirm = ref(false);
    const selectedVacancy = ref<VacancyDto | null>(null);
    const editVacancyData = ref<({ id: number } & Partial<UpsertJobVacancyRequest>) | null>(null);
    const vacancyToDelete = ref<VacancyDto | null>(null);

    const openCreateVacancy = () => {
      editVacancyData.value = null;
      showPublishVacancy.value = true;
    };

    const openEdit = (v: VacancyDto) => {
      showDetail.value = false;
      editVacancyData.value = {
        id: v.id,
        name: v.title,
        companyId: v.companyId ?? null,
        modalityTypeId: v.modalityTypeId ?? null,
        contractTypeId: v.contractTypeId ?? null,
        professionalAreaId: v.professionalAreaId ?? null,
        municipalityId: v.municipalityId ?? null,
        salaryRangeMin: v.salaryMin ?? null,
        salaryRangeMax: v.salaryMax ?? null,
        experienceLevelId: v.experienceLevelId ?? null,
        description: v.description,
        requirements: v.requirements,
        benefits: v.benefits ?? '',
        applicationDeadline: v.applicationDeadline ?? '',
      };
      showPublishVacancy.value = true;
    };

    const openDeleteConfirm = (v: VacancyDto) => {
      vacancyToDelete.value = v;
      showDeleteConfirm.value = true;
    };

    const confirmDelete = async () => {
      if (!vacancyToDelete.value) return;
      try {
        await deleteJobVacancyService.run(vacancyToDelete.value.id);
        showDeleteConfirm.value = false;
        vacancyToDelete.value = null;
        await Promise.all([loadVacancies(), loadStats()]);
      } catch {
        // interceptor muestra el error del backend
      }
    };

    const openDetail = (v: VacancyDto) => {
      selectedVacancy.value = v;
      showDetail.value = true;
    };

    const openApply = (v: VacancyDto) => {
      selectedVacancy.value = v;
      showDetail.value = false;
      showApply.value = true;
    };

    const submitApplication = async (data: any) => {
      const vacancy = selectedVacancy.value;
      if (!vacancy) return;
      try {
        await createApplicationService.run({
          jobVacanciesId: vacancy.id,
          peopleId: userStore.user?.people?.id,
          graduateFilesId: data.cvFileId,
          coverLetter: data.coverLetter,
          briefcaseLink: data.portfolioUrl,
          authorizeData: data.consent,
          applicationStatus: 'Enviada',
        });
        showApply.value = false;
        await loadApplications();
      } catch {
        // interceptor muestra el error del backend
      }
    };

    const loadApplications = async () => {
      try {
        const res = await getApplicationsService.run({
          peopleId: userStore.user?.people?.id,
        });
        applications.value = (res?.data ?? []).map(mapApiApplication);
      } catch {
        applications.value = [];
      }
    };

    const loadCvFiles = async () => {
      try {
        const peopleId = userStore.user?.people?.id;
        if (!peopleId) return;
        const res = await getFilesService.run({ peopleId });
        cvFiles.value = (res?.data ?? res ?? []).map((f: any) => ({
          id: f.id,
          name: f.name,
        }));
      } catch {
        cvFiles.value = [];
      }
    };

    const loadVacancies = async () => {
      loading.value = true;
      try {
        const f = activeFilters.value;
        const res = await jobVacanciesService.run({
          page: currentPage.value,
          perPage: 10,
          search: searchQuery.value || undefined,
          modalityTypeId: f.modalityTypeId ?? undefined,
          contractTypeId: f.contractTypeId ?? undefined,
          experienceLevelId: f.experienceLevelId ?? undefined,
          professionalAreaId: f.professionalAreaId ?? undefined,
          salaryRangeMin: f.salaryRangeMin ?? undefined,
          salaryRangeMax: f.salaryRangeMax ?? undefined,
          createdAt: f.publishedSince || undefined,
        });
        vacancies.value = (res?.data ?? []).map(mapVacancy);
        apiTotalVacancies.value = res?.pagination?.total ?? (res as any)?.total ?? 0;
      } finally {
        loading.value = false;
      }
    };

    const debouncedLoad = debounce(() => {
      currentPage.value = 1;
      loadVacancies();
    }, 500);

    watch(searchQuery, () => {
      debouncedLoad();
    });

    watch(
      activeFilters,
      () => {
        currentPage.value = 1;
        loadVacancies();
      },
      { deep: true }
    );

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      loadVacancies();
    };

    const loadStats = async () => {
      try {
        const stats = await jobVacanciesStatsService.run();
        featuredCompanies.value = (stats ?? []).map((s: JobVacancyStatDto, i: number) => ({
          id: i + 1,
          name: s.companyName,
          sector: s.professionalAreaName,
          vacanciesCount: s.totalVacancies,
          city: '',
        }));
      } catch {
        // preserve existing data on error
      }
    };

    onMounted(() => {
      loadSavedVacancies();
      loadVacancies();
      loadStats();
      loadApplications();
      loadCvFiles();
    });

    const publishVacancy = async (result: JobVacancyDto) => {
      const isCreate = editVacancyData.value === null;
      showPublishVacancy.value = false;
      editVacancyData.value = null;

      if (isCreate && result?.company?.name) {
        const companyName = result.company.name;
        const sectorName = result.professionalArea?.name ?? '';
        const existingIndex = featuredCompanies.value.findIndex((c) => c.name === companyName);
        if (existingIndex >= 0) {
          featuredCompanies.value = featuredCompanies.value.map((c, i) => (i === existingIndex ? { ...c, vacanciesCount: c.vacanciesCount + 1 } : c));
        } else {
          featuredCompanies.value = [
            ...featuredCompanies.value,
            {
              id: featuredCompanies.value.length + 1,
              name: companyName,
              sector: sectorName,
              vacanciesCount: 1,
              city: '',
            },
          ];
        }
      }

      await Promise.all([loadVacancies(), loadStats()]);
    };

    const withdrawApplication = async () => {
      await loadApplications();
    };

    const onSavedView = (v: VacancyDto) => {
      showMyApplications.value = false;
      openDetail(v);
    };

    const onSavedApply = (v: VacancyDto) => {
      showMyApplications.value = false;
      openApply(v);
    };

    const toggleSave = (v: VacancyDto) => {
      const alreadySaved = savedVacancies.value.some((s) => s.id === v.id);
      if (alreadySaved) {
        savedVacancies.value = savedVacancies.value.filter((s) => s.id !== v.id);
        toast.show(`Vacante "${v.title}" eliminada de guardados.`, 'warning');
      } else {
        savedVacancies.value = [...savedVacancies.value, v];
        toast.show(`Vacante "${v.title}" guardada. Consúltala en Mis postulaciones → Guardadas.`, 'success');
      }
      persistSaved();
    };

    const shareVacancy = (v: VacancyDto) => {
      const shareText = `${v.title} en ${v.company} — ${v.city} (${MODALITY_LABEL[v.modality]})`;
      const fakeUrl = `${window.location.origin}/graduates/job-board?vacancy=${v.id}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fakeUrl).then(() => {
          toast.show('Enlace copiado al portapapeles.', 'success');
        });
      } else {
        // Fallback: copy the title
        toast.show(`Comparte: ${shareText}`, 'info');
      }
    };

    const modalityLabel = (m: Modality) => MODALITY_LABEL[m] ?? m;
    const contractLabel = (c: ContractType) => CONTRACT_LABEL[c] ?? c;
    const experienceLabel = (e: ExperienceLevel) => EXPERIENCE_LABEL[e] ?? e;

    const formatSalary = (val: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(val);

    const timeSince = (dateStr: string) => {
      const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
      if (days === 0) return 'Hoy';
      if (days === 1) return 'Ayer';
      if (days < 30) return `Hace ${days} días`;
      return `Hace ${Math.floor(days / 30)} mes(es)`;
    };

    return {
      loading,
      vacancies,
      featuredCompanies,
      applications,
      savedVacancies,
      cvFiles,
      searchQuery,
      activeFilters,
      onFiltersChange,
      clearFilters,
      filteredVacancies,
      paginatedVacancies,
      perPage,
      currentPage,
      totalVacancies,
      handlePageChange,

      recommendedVacancies,
      savedIds,
      appliedIds,
      showDetail,
      showApply,
      showPublishVacancy,
      showMyApplications,
      showDeleteConfirm,
      selectedVacancy,
      editVacancyData,
      openCreateVacancy,
      openEdit,
      openDeleteConfirm,
      confirmDelete,
      openDetail,
      openApply,
      submitApplication,
      publishVacancy,
      withdrawApplication,
      onSavedView,
      onSavedApply,
      toggleSave,
      shareVacancy,
      modalityLabel,
      contractLabel,
      experienceLabel,
      formatSalary,
      timeSince,
    };
  },
});
</script>

<style scoped>
/* ── Page wrapper ── */
.job-board {
  padding: 4px 0 32px;
}

/* ── Search bar ── */
.jb-search-bar {
  position: relative;
  margin-bottom: 20px;
}
.jb-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  font-size: 0.9rem;
}
.jb-search-input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.jb-search-input:focus {
  border-color: var(--color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.jb-search-clear {
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
.jb-search-clear:hover {
  color: #374151;
}

/* ── Layout ── */
.jb-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* ── Main ── */
.jb-main {
  flex: 1;
  min-width: 0;
}

/* ── Sections ── */
.jb-section {
  margin-bottom: 28px;
}
.jb-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 14px;
}
.jb-section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 0.85rem;
}
.jb-section-icon--yellow {
  background: #fef9c3;
  color: #b45309;
}
.jb-section-icon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.jb-section-icon--gray {
  background: #f1f5f9;
  color: #475569;
}

.jb-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.jb-list-header .jb-section-title {
  margin-bottom: 0;
}
.jb-result-count {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
}

/* ── Chips ── */
.jb-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 500;
}
.jb-chip--city {
  background: #e0f2fe;
  color: #0369a1;
}
.jb-chip--modality {
  background: #dcfce7;
  color: #166534;
}
.jb-chip--contract {
  background: #fef9c3;
  color: #854d0e;
}
.jb-chip--level {
  background: #ede9fe;
  color: #5b21b6;
}
.jb-chip--rec {
  background: #fef3c7;
  color: #92400e;
}

/* ── Logo placeholder ── */
.jb-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.jb-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.jb-logo-letter {
  font-size: 1.1rem;
  font-weight: 700;
  color: #6c757d;
}

/* ── Salary & meta ── */
.jb-salary {
  font-size: 0.8rem;
  font-weight: 700;
  color: #16a34a;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.jb-time {
  font-size: 0.75rem;
  color: #9ca3af;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* ── Companies ── */
.jb-companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.jb-company-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.jb-company-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-color: #93c5fd;
}
.jb-company-logo {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #dee2e6;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.jb-company-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.jb-company-letter {
  font-size: 1.2rem;
  font-weight: 700;
  color: #6c757d;
}
.jb-company-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: #1e293b;
  margin: 0 0 2px;
}
.jb-company-sector {
  font-size: 0.73rem;
  color: #9ca3af;
  margin: 0 0 5px;
}
.jb-company-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--color-primary, #2563eb);
  font-weight: 600;
}

/* ── Recommended row highlight ── */
.jb-row--recommended {
  border-left: 3px solid #f59e0b;
  background: linear-gradient(135deg, #fff 85%, #fffbeb 100%);
}

/* ── Vacancy list rows ── */
.jb-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.jb-row {
  display: flex;
  gap: 14px;
  align-items: center;
  background: #fff;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.jb-row:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  border-color: #93c5fd;
}
.jb-row-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.jb-row-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.jb-row-info {
  flex: 1;
  min-width: 0;
}
.jb-row-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0 0 2px;
}
.jb-row-company {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.jb-row-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.jb-row-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex-shrink: 0;
}
.jb-row-btns {
  display: flex;
  gap: 6px;
  align-items: center;
}
.jb-save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1.5px solid #dee2e6;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.jb-save-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background: #fffbeb;
}
.jb-save-btn--active {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #f59e0b;
}
.jb-applied-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.jb-row-salary {
  font-size: 0.85rem;
  font-weight: 700;
  color: #16a34a;
  display: flex;
  align-items: center;
  gap: 3px;
}
.jb-row-meta {
  display: flex;
  gap: 10px;
  font-size: 0.76rem;
  color: #9ca3af;
}
.jb-row-meta span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* ── Pagination ── */
.jb-pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0 4px;
}

/* ── Empty states ── */
.jb-empty {
  text-align: center;
  padding: 40px 16px;
  color: #9ca3af;
  font-size: 1.8rem;
}
.jb-empty p {
  font-size: 0.9rem;
  margin: 8px 0 16px;
}
.jb-empty-mini {
  color: #9ca3af;
  font-size: 0.88rem;
  padding: 8px 0;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .jb-layout {
    flex-direction: column;
  }
  .jb-sidebar {
    width: 100%;
    position: static;
  }
  .jb-recommended-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .jb-recommended-grid {
    grid-template-columns: 1fr;
  }
  .jb-companies-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .jb-row {
    flex-wrap: wrap;
  }
  .jb-row-right {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
