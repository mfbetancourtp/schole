<template>
  <AppDrawer size="xl" :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <div class="drawerHead">
        <div class="drawerHead__icon">
          <AppIcon icon="handshake" />
        </div>
        <div class="drawerHead__info">
          <span class="drawerHead__title">{{ agreement?.name || 'Detalles del Convenio' }}</span>
          <span class="drawerHead__subtitle" v-if="agreement">{{ agreement.institutionPartner }} · {{ countryName }}</span>
        </div>
        <div v-if="agreement" class="drawerHead__badges">
          <span class="headBadge headBadge--category" :class="typeBadgeClass(agreement.agreementsType?.name)">
            {{ agreement.agreementsType?.name || 'Convenio' }}
          </span>
          <span v-if="isInternational" class="headBadge headBadge--intl">
            <AppIcon icon="globe" class="headBadge__icon" />
            Internacional
          </span>
          <span v-else class="headBadge headBadge--natl">
            <AppIcon icon="map-marker-alt" class="headBadge__icon" />
            Nacional
          </span>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="agreement" class="drawerBody">
        <!-- Agreement meta row -->
        <div class="agreementMeta">
          <div class="agreementMeta__item">
            <div class="agreementMeta__iconWrap">
              <AppIcon icon="university" />
            </div>
            <div class="agreementMeta__info">
              <span class="agreementMeta__label">Institución</span>
              <span class="agreementMeta__value">{{ agreement.institutionPartner || '—' }}</span>
            </div>
          </div>
          <div class="agreementMeta__item">
            <div class="agreementMeta__iconWrap">
              <AppIcon icon="map-marker-alt" />
            </div>
            <div class="agreementMeta__info">
              <span class="agreementMeta__label">País</span>
              <span class="agreementMeta__value">{{ countryName }}</span>
            </div>
          </div>
          <div class="agreementMeta__item">
            <div class="agreementMeta__iconWrap">
              <AppIcon icon="calendar-alt" />
            </div>
            <div class="agreementMeta__info">
              <span class="agreementMeta__label">Vigencia</span>
              <span class="agreementMeta__value">{{ formatDate(agreement.starDay) }} – {{ formatDate(agreement.endDate) }}</span>
            </div>
          </div>
        </div>

        <hr class="bodyDivider" />

        <!-- SECTION 1: Información General -->
        <div class="detailSection">
          <h4 class="detailSection__title">
            <span class="detailSection__iconWrap detailSection__iconWrap--blue">
              <AppIcon icon="file-alt" />
            </span>
            Información General
          </h4>
          <div class="detailCard">
            <div class="detailField">
              <span class="detailField__label">Descripción</span>
              <p class="detailField__text">
                {{ agreement.descriptionPublic || '—' }}
              </p>
            </div>
            <div class="detailField" v-if="agreement.comments">
              <span class="detailField__label">Alcance</span>
              <p class="detailField__text">{{ agreement.comments }}</p>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Requisitos del convenio -->
        <div class="detailSection">
          <h4 class="detailSection__title">
            <span class="detailSection__iconWrap detailSection__iconWrap--green">
              <AppIcon icon="check-circle" />
            </span>
            Requisitos
          </h4>
          <div class="detailCard">
            <div class="reqItem">
              <AppIcon icon="check-circle" class="reqItem__icon" />
              <span class="reqItem__text">Promedio mínimo: {{ agreement.maximumAverage ?? '—' }}</span>
            </div>
            <div class="reqItem" v-if="agreement.minimumSemester || agreement.maximumSemester">
              <AppIcon icon="check-circle" class="reqItem__icon" />
              <span class="reqItem__text">
                Semestre:
                {{ agreement.minimumSemester ? agreement.minimumSemester + '°' : '—' }}
                <template v-if="agreement.maximumSemester">– {{ agreement.maximumSemester }}°</template>
              </span>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Documentos del convenio -->
        <div class="detailSection" v-if="agreement.documents?.length">
          <h4 class="detailSection__title">
            <span class="detailSection__iconWrap detailSection__iconWrap--purple">
              <AppIcon icon="file-download" />
            </span>
            Documentos del convenio
          </h4>
          <div class="detailCard detailCard--noPad">
            <div
              v-for="(doc, i) in agreement.documents"
              :key="doc.name"
              class="docRow"
              :class="{
                'docRow--last': i === (agreement.documents?.length ?? 0) - 1,
              }"
            >
              <div class="docRow__left">
                <div class="docRow__fileIconWrap">
                  <AppIcon icon="file-alt" />
                </div>
                <span class="docRow__name">{{ doc.name }}</span>
              </div>
              <button class="docRow__downloadBtn" v-tooltip="'Descargar'">
                <AppIcon icon="download" />
              </button>
            </div>
          </div>
        </div>

        <!-- SECTION 4: Cupos -->
        <div class="detailSection">
          <h4 class="detailSection__title">
            <span class="detailSection__iconWrap detailSection__iconWrap--orange">
              <AppIcon icon="users" />
            </span>
            Cupos
          </h4>
          <div class="detailCard">
            <!-- Totals grid -->
            <div class="cuposGrid">
              <div class="cuposStat">
                <span class="cuposStat__label">Cupos máximos</span>
                <span class="cuposStat__value">{{ agreement.maximumCapacity || '—' }}</span>
              </div>
              <div class="cuposStat">
                <span class="cuposStat__label">Disponibles</span>
                <span v-if="loadingStats" class="cuposStat__value cuposStat__value--primary">...</span>
                <span v-else class="cuposStat__value cuposStat__value--primary">{{ availableSpots }}</span>
              </div>
            </div>

            <!-- Availability bar -->
            <div class="availabilitySection">
              <div class="availabilityRow">
                <span class="availabilityRow__label">Disponibilidad</span>
                <span class="availabilityRow__pct" :class="availabilityPctClass">{{ availabilityPct }}%</span>
              </div>
              <div class="progressBar">
                <div class="progressBar__fill" :class="progressBarClass" :style="{ width: `${availabilityPct}%` }"></div>
              </div>
            </div>

            <!-- Status card -->
            <div class="statusCard" :class="statusCardClass">
              <div class="statusCard__iconWrap">
                <AppIcon :icon="statusCardIcon" />
              </div>
              <div class="statusCard__info">
                <span class="statusCard__title">{{ statusCardTitle }}</span>
                <span class="statusCard__sub">{{ statusCardSubtitle }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="drawerFooter">
        <div class="d-flex gap-2">
          <AppButton outlined @click="$emit('update:isVisible', false)">Cerrar</AppButton>
          <AppButton :outlined="false" @click="handleApply">
            <AppIcon icon="paper-plane" />
            Postularse al convenio
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { InstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';
import { GetAgreementApplicationsStatsService, AgreementApplicationsStatsDto } from '../services/getAgreementApplicationsStats.service';

const getAgreementApplicationsStatsService = new GetAgreementApplicationsStatsService();

export default defineComponent({
  name: 'AvailableAgreementDetailDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    agreement: {
      type: Object as PropType<InstitutionalAgreementDto | null>,
      default: null,
    },
    filterCountries: {
      type: Array as PropType<{ id: number; name: string }[]>,
      default: () => [],
    },
  },
  emits: ['update:isVisible', 'apply'],
  setup(props, { emit }) {
    const countryName = computed(() => {
      const id = props.agreement?.country?.id ?? (props.agreement as any)?.countryId;
      return props.filterCountries.find((c) => c.id === id)?.name ?? props.agreement?.country?.name ?? '—';
    });
    const isInternational = computed(() => countryName.value !== 'Colombia');

    const stats = ref<AgreementApplicationsStatsDto | null>(null);
    const loadingStats = ref(false);

    watch(
      () => [props.isVisible, props.agreement?.id] as const,
      ([visible, id]) => {
        if (visible && id) {
          loadingStats.value = true;
          stats.value = null;
          getAgreementApplicationsStatsService
            .run(id)
            .then((data) => {
              stats.value = data;
            })
            .catch(() => {
              stats.value = null;
            })
            .finally(() => {
              loadingStats.value = false;
            });
        } else if (!visible) {
          stats.value = null;
        }
      },
      { immediate: true }
    );

    const availableSpots = computed(() => {
      if (stats.value !== null) return stats.value.cuposDisponibles;
      return props.agreement?.maximumCapacity ?? '—';
    });

    const availabilityPct = computed(() => {
      if (!stats.value) return 100;
      const total = stats.value.cuposTotales || props.agreement?.maximumCapacity || 0;
      if (!total) return 100;
      return Math.round((stats.value.cuposDisponibles / total) * 100);
    });

    const availabilityPctClass = computed(() => {
      const pct = availabilityPct.value;
      if (pct > 50) return 'availabilityRow__pct--green';
      if (pct > 20) return 'availabilityRow__pct--orange';
      return 'availabilityRow__pct--gray';
    });

    const progressBarClass = computed(() => {
      const pct = availabilityPct.value;
      if (pct > 50) return 'progressBar__fill--green';
      if (pct > 20) return 'progressBar__fill--orange';
      return 'progressBar__fill--gray';
    });

    const statusCardClass = computed(() => {
      if (loadingStats.value || !stats.value) return 'statusCard--open';
      if (stats.value.cuposDisponibles === 0) return 'statusCard--closed';
      if (availabilityPct.value <= 20) return 'statusCard--limited';
      return 'statusCard--open';
    });

    const statusCardIcon = computed(() => {
      if (!stats.value || stats.value.cuposDisponibles > 0) return 'check-circle';
      return 'times-circle';
    });

    const statusCardTitle = computed(() => {
      if (!stats.value || stats.value.cuposDisponibles > 0) return 'Abierto para postulación';
      return 'Sin cupos disponibles';
    });

    const statusCardSubtitle = computed(() => {
      if (loadingStats.value) return 'Verificando disponibilidad...';
      if (!stats.value) return 'Puedes postularte ahora';
      if (stats.value.cuposDisponibles === 0) return 'No hay cupos disponibles';
      if (availabilityPct.value <= 20) return `Solo quedan ${stats.value.cuposDisponibles} cupo(s)`;
      return 'Puedes postularte ahora';
    });

    const handleApply = () => {
      emit('update:isVisible', false);
      emit('apply');
    };

    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '—';
      const datePart = dateStr.substring(0, 10);
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return '—';
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${parseInt(day)} ${months[parseInt(month) - 1]}. ${year}`;
    };

    const typeBadgeClass = (typeName?: string): string => {
      const name = (typeName || '').toLowerCase();
      if (name.includes('movilidad')) return 'headBadge--academica';
      if (name.includes('práctica') || name.includes('practica')) return 'headBadge--practica';
      if (name.includes('investigación') || name.includes('investigacion')) return 'headBadge--investigacion';
      if (name.includes('deportivo')) return 'headBadge--deportivo';
      if (name.includes('educación') || name.includes('educacion')) return 'headBadge--educacion';
      return 'headBadge--academica';
    };

    return {
      countryName,
      isInternational,
      availableSpots,
      availabilityPct,
      availabilityPctClass,
      progressBarClass,
      statusCardClass,
      statusCardIcon,
      statusCardTitle,
      statusCardSubtitle,
      loadingStats,
      handleApply,
      formatDate,
      typeBadgeClass,
    };
  },
});
</script>

<style scoped>
/* ====== HEAD ====== */
.drawerHead {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.drawerHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff;
  flex-shrink: 0;
}

.drawerHead__info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.drawerHead__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawerHead__subtitle {
  font-size: 0.83rem;
  color: rgba(255, 255, 255, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawerHead__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Head badges */
.headBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.73rem;
  font-weight: 600;
}

.headBadge__icon {
  font-size: 0.7rem;
}

/* Category variants (on primary bg → semi-transparent white tints) */
.headBadge--academica {
  background: rgba(219, 234, 254, 0.25);
  color: #dbeafe;
}
.headBadge--practica {
  background: rgba(220, 252, 231, 0.25);
  color: #dcfce7;
}
.headBadge--investigacion {
  background: rgba(237, 233, 254, 0.25);
  color: #ede9fe;
}
.headBadge--deportivo {
  background: rgba(255, 237, 213, 0.25);
  color: #ffedd5;
}
.headBadge--educacion {
  background: rgba(204, 251, 241, 0.25);
  color: #ccfbf1;
}

.headBadge--intl {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.headBadge--natl {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.headBadge--featured {
  background: rgba(253, 230, 138, 0.3);
  color: #fde68a;
}

/* ====== BODY ====== */
.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem;
}

/* ====== META ROW ====== */
.agreementMeta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.agreementMeta__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.agreementMeta__iconWrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.agreementMeta__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.agreementMeta__label {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.agreementMeta__value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
}

.bodyDivider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0;
}

/* ====== SECTIONS ====== */
.detailSection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detailSection__title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.detailSection__iconWrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.detailSection__iconWrap--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.detailSection__iconWrap--green {
  background: #dcfce7;
  color: #16a34a;
}

.detailSection__iconWrap--purple {
  background: #ede9fe;
  color: #6d28d9;
}

.detailSection__iconWrap--orange {
  background: #ffedd5;
  color: #c2410c;
}

/* ====== DETAIL CARD ====== */
.detailCard {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detailCard--noPad {
  padding: 0;
  overflow: hidden;
  gap: 0;
}

/* ====== DETAIL FIELDS ====== */
.detailField {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detailField__label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detailField__text {
  font-size: 0.875rem;
  color: var(--color-primary);
  line-height: 1.6;
  margin: 0;
}

/* ====== CHIPS ====== */
.chipRow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.dataChip {
  display: inline-block;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

/* ====== REQUIREMENTS ====== */
.reqItem {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.reqItem__icon {
  color: #16a34a;
  font-size: 0.95rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.reqItem__text {
  font-size: 0.875rem;
  color: var(--color-primary);
  line-height: 1.5;
}

/* ====== DOCUMENTS ====== */
.docRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.125rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.75rem;
}

.docRow--last {
  border-bottom: none;
}

.docRow__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.docRow__fileIconWrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.docRow__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.docRow__downloadBtn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.docRow__downloadBtn:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* ====== CUPOS ====== */
.cuposGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
}

.cuposStat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cuposStat__label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cuposStat__value {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.cuposStat__value--primary {
  color: var(--color-primary);
}

/* Availability */
.availabilitySection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.availabilityRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.availabilityRow__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}

.availabilityRow__pct {
  font-size: 0.95rem;
  font-weight: 800;
}

.availabilityRow__pct--green {
  color: #16a34a;
}
.availabilityRow__pct--orange {
  color: #d97706;
}
.availabilityRow__pct--teal {
  color: #0f766e;
}
.availabilityRow__pct--blue {
  color: #1d4ed8;
}
.availabilityRow__pct--gray {
  color: #6b7280;
}

.progressBar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.progressBar__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.progressBar__fill--green {
  background: #22c55e;
}
.progressBar__fill--orange {
  background: #f97316;
}
.progressBar__fill--teal {
  background: #0d9488;
}
.progressBar__fill--blue {
  background: #3b82f6;
}
.progressBar__fill--gray {
  background: #9ca3af;
}

/* Status card */
.statusCard {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
}

.statusCard__iconWrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.statusCard__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.statusCard__title {
  font-size: 0.9rem;
  font-weight: 700;
}

.statusCard__sub {
  font-size: 0.78rem;
  font-weight: 500;
  opacity: 0.85;
}

/* Status card variants */
.statusCard--open {
  background: #dcfce7;
  color: #15803d;
}
.statusCard--open .statusCard__iconWrap {
  background: rgba(21, 128, 61, 0.15);
}

.statusCard--limited {
  background: #fef3c7;
  color: #92400e;
}
.statusCard--limited .statusCard__iconWrap {
  background: rgba(146, 64, 14, 0.15);
}

.statusCard--unlimited {
  background: #ccfbf1;
  color: #0f766e;
}
.statusCard--unlimited .statusCard__iconWrap {
  background: rgba(15, 118, 110, 0.15);
}

.statusCard--upcoming {
  background: #dbeafe;
  color: #1d4ed8;
}
.statusCard--upcoming .statusCard__iconWrap {
  background: rgba(29, 78, 216, 0.15);
}

.statusCard--closed {
  background: #f3f4f6;
  color: #374151;
}
.statusCard--closed .statusCard__iconWrap {
  background: rgba(55, 65, 81, 0.1);
}

/* ====== FOOTER ====== */
.drawerFooter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 0 0.25rem;
  gap: 0.5rem;
}
</style>
