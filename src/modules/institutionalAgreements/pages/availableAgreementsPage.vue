<template>
  <AppBaseList title="Convenios Disponibles">
    <template #actions>
      <AppButton outlined @click="goToMyApplications" style="color: white">
        <AppIcon icon="paper-plane" />
        Ver mis postulaciones
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="availableAgreementsPage">
        <!-- Page intro -->
        <div>
          <h1 class="h3 mb-0">Convenios Disponibles</h1>
          <p class="small text-muted">Explora las convocatorias abiertas y postúlate a los programas que se adapten a tu perfil académico.</p>
        </div>

        <!-- 4 stat cards -->
        <div class="statsRow">
          <div class="statCard statCard--blue">
            <div class="statCard__iconWrap statCard__iconWrap--blue">
              <AppIcon icon="handshake" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ totalAgreements }}</span>
              <span class="statCard__label">Convenios disponibles</span>
            </div>
          </div>

          <div class="statCard statCard--green">
            <div class="statCard__iconWrap statCard__iconWrap--green">
              <AppIcon icon="paper-plane" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.totalApplications }}</span>
              <span class="statCard__label">Mis postulaciones</span>
            </div>
          </div>

          <div class="statCard statCard--orange">
            <div class="statCard__iconWrap statCard__iconWrap--orange">
              <AppIcon icon="clock" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.inReview }}</span>
              <span class="statCard__label">En revisión</span>
            </div>
          </div>

          <div class="statCard statCard--purple">
            <div class="statCard__iconWrap statCard__iconWrap--purple">
              <AppIcon icon="check-circle" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.approved }}</span>
              <span class="statCard__label">Aprobadas</span>
            </div>
          </div>

          <div class="statCard statCard--red">
            <div class="statCard__iconWrap statCard__iconWrap--red">
              <AppIcon icon="times-circle" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.rejected }}</span>
              <span class="statCard__label">Rechazadas</span>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filtersBar">
          <div class="filtersBar__inputs">
            <div class="filterField">
              <label>Búsqueda</label>
              <AppInput type="search" v-model="searchQuery" placeholder="Convenio, institución..." />
            </div>

            <div class="filterField">
              <label>Tipo de convenio</label>
              <AppAutocomplete :options="agreementTypes" label="name" :reduce="(option: any) => option.id" v-model="agreementsTypesIdFilter" input-id="typesFilter" />
            </div>

            <div class="filterField">
              <label>País</label>
              <AppAutocomplete :options="filterCountries" label="name" :reduce="(option: any) => option.id" v-model="countryIdFilter" input-id="countryFilter" />
            </div>
          </div>
          <AppButton outlined size="sm" @click="clearFilters">
            <AppIcon icon="times" />
            Limpiar
          </AppButton>
        </div>

        <!-- Agreements grid -->
        <div v-if="agreements.length > 0" class="agreementsGrid">
          <div v-for="agreement in agreements" :key="agreement.id" class="agreementCard">
            <!-- Top badges -->
            <div class="agreementCard__badges">
              <span class="categoryBadge" :class="typeBadgeClass(agreement.typeName)">
                {{ agreement.typeName || 'Convenio' }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="agreementCard__title">{{ agreement.name }}</h3>

            <!-- Sección 1: Institución + País -->
            <div class="cardSection">
              <div class="infoRow">
                <AppIcon icon="university" class="infoRow__icon" />
                <span>{{ agreement.institutionPartner || '-' }}</span>
              </div>
              <div class="infoRow">
                <AppIcon icon="map-marker-alt" class="infoRow__icon" />
                <span>{{ agreement.countryName || '-' }}</span>
              </div>
            </div>

            <!-- Sección 2: Vigencia + Cupos -->
            <div class="cardSection cardSection--divided">
              <div class="infoRow">
                <AppIcon icon="calendar-alt" class="infoRow__icon" />
                <span>{{ formatDate(agreement.starDay) }} – {{ formatDate(agreement.endDate) }}</span>
              </div>

              <div class="spotsSection" v-if="agreement.maximumCapacity">
                <div class="spotsHeader">
                  <span class="spotsHeader__label">Cupos máximos</span>
                  <span class="spotsHeader__count spotsHeader__count--green">{{ agreement.maximumCapacity }}</span>
                </div>
              </div>
            </div>

            <!-- Status banner -->
            <div class="callStatusBanner callStatusBanner--open">
              <AppIcon icon="check-circle" class="callStatusBanner__icon" />
              <span>Abierto para postulación</span>
            </div>

            <!-- Actions -->
            <div class="cardActions">
              <AppButton outlined @click="viewDetail(agreement)" class="cardActions__detail">Ver detalles</AppButton>
              <AppButton :outlined="false" @click="apply(agreement)" class="cardActions__apply">
                Postularse
                <AppIcon icon="chevron-right" />
              </AppButton>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div class="emptyState" v-else>
          <AppIcon icon="folder-open" class="emptyState__icon" />
          <span class="emptyState__text">No se encontraron convenios disponibles con los filtros seleccionados.</span>
        </div>
      </div>
    </template>
  </AppBaseList>

  <!-- Detail drawer -->
  <AvailableAgreementDetailDrawer
    :isVisible="showDetailDrawer"
    :agreement="selectedDetailAgreement"
    :filterCountries="filterCountries"
    @update:isVisible="showDetailDrawer = $event"
    @apply="openApplyFromDetail"
  />

  <!-- Apply drawer -->
  <AgreementApplyDrawer
    ref="applyDrawerRef"
    :isVisible="showApplyDrawer"
    :agreement="selectedApplyAgreement"
    :filterCountries="filterCountries"
    @update:isVisible="showApplyDrawer = $event"
    @submitted="handleSubmitApplication"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, type ComponentPublicInstance } from 'vue';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AgreementApplyDrawer from '../components/AgreementApplyDrawer.vue';
import AvailableAgreementDetailDrawer from '../components/AvailableAgreementDetailDrawer.vue';

import { InstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';
import { AgreementsApplicationStatsDto } from '../dtos/agreementsApplication.dto';
import { GetInstitutionalAgreementsService } from '../services/getInstitutionalAgreements.service';
import { GetAgreementsApplicationStatsService } from '../services/getAgreementsApplicationStats.service';
import { CreateOrUpdateAgreementsApplicationService } from '../services/createOrUpdateAgreementsApplication.service';
import { CreateOrUpdateAgreementsApplicationDocumentService } from '../services/createOrUpdateAgreementsApplicationDocument.service';
import { GetAgreementTypesService } from '../services/getAgreementTypes.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { useHeaderStore } from '../../../stores/header.store';

interface AgreementCardDto {
  id: number;
  name: string;
  institutionPartner: string;
  countryName: string;
  typeName: string;
  starDay: string;
  endDate: string;
  maximumCapacity: number;
  descriptionPublic: string;
  raw: InstitutionalAgreementDto;
}

interface SelectOption {
  id: number;
  name: string;
}

const getInstitutionalAgreementsService = new GetInstitutionalAgreementsService();
const getAgreementsApplicationStatsService = new GetAgreementsApplicationStatsService();
const createOrUpdateAgreementsApplicationService = new CreateOrUpdateAgreementsApplicationService();
const createOrUpdateAgreementsApplicationDocumentService = new CreateOrUpdateAgreementsApplicationDocumentService();
const getAgreementTypesService = new GetAgreementTypesService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();

export default defineComponent({
  name: 'AvailableAgreementsPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppInput,
    AppAutocomplete,
    AgreementApplyDrawer,
    AvailableAgreementDetailDrawer,
  },
  setup() {
    useMeta({ title: 'Convenios Disponibles' });

    const router = useRouter();
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Convenios Institucionales', url: '' };
    headerStorage.moduleItem = { name: 'Convenios Disponibles', url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const loading = ref(true);
    const agreements = ref<AgreementCardDto[]>([]);
    const totalAgreements = ref(0);
    const agreementTypes = ref<SelectOption[]>([]);
    const filterCountries = ref<SelectOption[]>([]);

    const appStats = ref<AgreementsApplicationStatsDto>({
      totalApplications: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
    });

    const searchQuery = ref('');
    const agreementsTypesIdFilter = ref<number | undefined>(undefined);
    const countryIdFilter = ref<number | undefined>(undefined);

    const showApplyDrawer = ref(false);
    const selectedApplyAgreement = ref<InstitutionalAgreementDto | null>(null);
    const applyDrawerRef = ref<ComponentPublicInstance | null>(null);
    const showDetailDrawer = ref(false);
    const selectedDetailAgreement = ref<InstitutionalAgreementDto | null>(null);

    const mapToCard = (a: InstitutionalAgreementDto): AgreementCardDto => {
      const countryId = a.country?.id ?? (a as any).countryId;
      const spanishName = filterCountries.value.find((c) => c.id === countryId)?.name;
      return {
        id: a.id,
        name: a.name,
        institutionPartner: a.institutionPartner,
        countryName: spanishName ?? a.country?.name ?? '',
        typeName: a.agreementsType?.name ?? '',
        starDay: a.starDay ?? '',
        endDate: a.endDate ?? '',
        maximumCapacity: a.maximumCapacity,
        descriptionPublic: a.descriptionPublic,
        raw: a,
      };
    };

    const loadAgreements = async () => {
      const res = await getInstitutionalAgreementsService.run({
        agreementStatus: 'Activo',
        search: searchQuery.value || undefined,
        agreementsTypesId: agreementsTypesIdFilter.value,
        countryId: countryIdFilter.value,
        perPage: 50,
        page: 1,
      });
      const data: InstitutionalAgreementDto[] = res.data || (res as any) || [];
      agreements.value = data.map(mapToCard);
      totalAgreements.value = (res as any).total ?? data.length;
    };

    onMounted(async () => {
      try {
        const [, , typesRes, countriesRes] = await Promise.allSettled([
          loadAgreements(),
          getAgreementsApplicationStatsService.run().then((s) => {
            appStats.value = s;
          }),
          getAgreementTypesService.run({ perPage: 100, isActive: 1 }),
          findAllCountriesForSelectService.run({ perPage: 300 }),
        ]);

        if (typesRes.status === 'fulfilled') {
          agreementTypes.value = (typesRes.value.data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
          }));
        }
        if (countriesRes.status === 'fulfilled') {
          const raw = countriesRes.value.data || countriesRes.value;
          filterCountries.value = Array.isArray(raw)
            ? raw.map((c: any) => {
                try {
                  const t = typeof c.translations === 'string' ? JSON.parse(c.translations) : c.translations;
                  return { id: c.id, name: t?.es || c.name };
                } catch {
                  return { id: c.id, name: c.name };
                }
              })
            : [];
          // Re-map now that Spanish names are available (initial load ran before countries)
          agreements.value = agreements.value.map((card) => mapToCard(card.raw));
        }
      } finally {
        loading.value = false;
      }
    });

    let filterTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const debouncedApplyFilters = async () => {
      if (filterTimeoutId) clearTimeout(filterTimeoutId);
      filterTimeoutId = setTimeout(async () => {
        await applyFilters();
      }, 500);
    };

    watch([searchQuery, agreementsTypesIdFilter, countryIdFilter], () => {
      debouncedApplyFilters();
    });

    const applyFilters = async () => {
      try {
        await loadAgreements();
      } catch (e) {
        console.error('Error loading agreements:', e);
      }
    };

    const clearFilters = async () => {
      searchQuery.value = '';
      agreementsTypesIdFilter.value = undefined;
      countryIdFilter.value = undefined;
      if (filterTimeoutId) clearTimeout(filterTimeoutId);
      await applyFilters();
    };

    const goToMyApplications = () => {
      router.push({ name: 'institutionalAgreements.myApplications' });
    };

    const viewDetail = (card: AgreementCardDto) => {
      selectedDetailAgreement.value = card.raw;
      showDetailDrawer.value = true;
    };

    const openApplyFromDetail = () => {
      if (selectedDetailAgreement.value) {
        selectedApplyAgreement.value = selectedDetailAgreement.value;
        showApplyDrawer.value = true;
      }
    };

    const apply = (card: AgreementCardDto) => {
      selectedApplyAgreement.value = card.raw;
      showApplyDrawer.value = true;
    };

    const handleSubmitApplication = async (payload: any) => {
      try {
        // 1. Crear la postulación
        const created = await createOrUpdateAgreementsApplicationService.run({
          agreementsInstitutionalId: Number(payload.agreementId),
          motivation: payload.motivation,
          areaId: payload.areaId || undefined,
          languageLevel: payload.languageLevel || undefined,
          previousExperience: payload.priorExperience || undefined,
          estimatedStartDate: payload.estimatedDate || undefined,
          estimatedDuration: payload.estimatedDuration || undefined,
          confirmRequirements: payload.confirmsRequirements ? 1 : 0,
          acceptTerms: payload.acceptsTerms ? 1 : 0,
        });

        // 2. Subir documentos si hay
        // La API devuelve { message, data: { id } } o directamente { id }
        const applicationId = created?.data?.id ?? created?.id;
        if (applicationId && payload.documents?.length) {
          await Promise.allSettled(
            payload.documents.map((doc: { institutionalDocumentId?: number; attachmentId?: number | string; file: File }) => {
              const docPayload: Record<string, any> = {
                agreementsApplicationId: applicationId,
                archivo: doc.file,
              };

              if (doc.institutionalDocumentId) {
                docPayload.agreementsInstitutionalDocumentsId = Number(doc.institutionalDocumentId);
              } else if (doc.attachmentId) {
                docPayload.agreementsTypesAttachmentsId = Number(doc.attachmentId);
              }

              return createOrUpdateAgreementsApplicationDocumentService.run(docPayload);
            })
          );
        }

        // 3. Cerrar drawer y actualizar stats
        showApplyDrawer.value = false;
        appStats.value = await getAgreementsApplicationStatsService.run();
      } catch {
        // interceptor maneja el toast de error
      } finally {
        // Resetear estado de carga en el drawer
        if (applyDrawerRef.value) {
          (applyDrawerRef.value as any).submitting = false;
        }
      }
    };

    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '-';
      const datePart = dateStr.substring(0, 10);
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return '-';
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${parseInt(day)} ${months[parseInt(month) - 1]}. ${year}`;
    };

    const typeBadgeClass = (typeName: string): string => {
      const name = (typeName || '').toLowerCase();
      if (name.includes('movilidad')) return 'categoryBadge--academica';
      if (name.includes('práctica') || name.includes('practica')) return 'categoryBadge--practica';
      if (name.includes('investigación') || name.includes('investigacion')) return 'categoryBadge--investigacion';
      if (name.includes('deportivo')) return 'categoryBadge--deportivo';
      if (name.includes('educación') || name.includes('educacion')) return 'categoryBadge--educacion';
      return 'categoryBadge--academica';
    };

    return {
      loading,
      agreements,
      totalAgreements,
      appStats,
      agreementTypes,
      filterCountries,
      showApplyDrawer,
      selectedApplyAgreement,
      applyDrawerRef,
      showDetailDrawer,
      selectedDetailAgreement,
      searchQuery,
      agreementsTypesIdFilter,
      countryIdFilter,
      goToMyApplications,
      clearFilters,
      viewDetail,
      apply,
      openApplyFromDetail,
      handleSubmitApplication,
      formatDate,
      typeBadgeClass,
    };
  },
});
</script>

<style scoped>
.availableAgreementsPage {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ====== STAT CARDS ====== */
.statsRow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.statCard {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.statCard__iconWrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.statCard__iconWrap--blue {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}
.statCard__iconWrap--green {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}
.statCard__iconWrap--orange {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
}
.statCard__iconWrap--purple {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}
.statCard__iconWrap--red {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.statCard__info {
  display: flex;
  flex-direction: column;
}

.statCard__value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.1;
  color: #111827;
}

.statCard--blue .statCard__value {
  color: #2563eb;
}
.statCard--green .statCard__value {
  color: #16a34a;
}
.statCard--orange .statCard__value {
  color: #ea580c;
}
.statCard--purple .statCard__value {
  color: #7c3aed;
}
.statCard--red .statCard__value {
  color: #dc2626;
}

.statCard__label {
  font-size: 0.82rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 2px;
}

/* ====== FILTERS ====== */
.filtersBar {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.filtersBar__inputs {
  display: flex;
  gap: 1rem;
  flex: 1;
  align-items: flex-end;
}

.filterField {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 200px;
}

.filterField label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filterField :deep(.vs__dropdown-menu),
.filterField :deep(.vs__dropdown-toggle) {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #fff;
  color: #111827;
}

.filterField :deep(.vs__dropdown-toggle) {
  padding: 0.375rem 0.75rem;
}

.filterField :deep(.vs__dropdown-toggle:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.filterField :deep(.vs__clear),
.filterField :deep(.vs__open-indicator) {
  fill: #9ca3af;
}

/* ====== AGREEMENTS GRID ====== */
.agreementsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

/* ====== AGREEMENT CARD ====== */
.agreementCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s, transform 0.15s;
}
.agreementCard:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.agreementCard__badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.categoryBadge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.categoryBadge--academica {
  background: #dbeafe;
  color: #1d4ed8;
}
.categoryBadge--practica {
  background: #dcfce7;
  color: #15803d;
}
.categoryBadge--investigacion {
  background: #ede9fe;
  color: #6d28d9;
}
.categoryBadge--deportivo {
  background: #ffedd5;
  color: #c2410c;
}
.categoryBadge--educacion {
  background: #ccfbf1;
  color: #0f766e;
}

.agreementCard__title {
  font-size: 0.975rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin: 0;
  min-height: 2.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cardSection {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.cardSection--divided {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.875rem;
}

.infoRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #4b5563;
}
.infoRow__icon {
  color: #9ca3af;
  width: 14px;
  flex-shrink: 0;
  font-size: 0.8rem;
}

.spotsSection {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.spotsHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.spotsHeader__label {
  font-size: 0.78rem;
  color: #6b7280;
  font-weight: 500;
}
.spotsHeader__count {
  font-size: 0.82rem;
  font-weight: 700;
}
.spotsHeader__count--green {
  color: #15803d;
}

.callStatusBanner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.875rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  width: 100%;
}
.callStatusBanner__icon {
  font-size: 0.88rem;
  flex-shrink: 0;
}
.callStatusBanner--open {
  background: #dcfce7;
  color: #15803d;
}

.cardActions {
  display: flex;
  gap: 0.6rem;
  margin-top: auto;
}
.cardActions__detail {
  flex: 1;
}
.cardActions__apply {
  flex: 1;
}

/* Empty state */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: #9ca3af;
}
.emptyState__icon {
  font-size: 2.5rem;
}
.emptyState__text {
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 1100px) {
  .agreementsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  .statsRow {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filtersBar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filtersBar__inputs {
    flex-direction: column;
  }

  .filterField {
    min-width: unset;
  }
}

@media (max-width: 640px) {
  .agreementsGrid {
    grid-template-columns: 1fr;
  }
  .statsRow {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
