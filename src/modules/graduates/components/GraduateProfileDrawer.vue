<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <AppDrawerHeader variant="view" icon="user-tie" title="Perfil Laboral del Egresado" />
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="graduate" class="pb-3">
        <!-- Profile header -->
        <div class="gpd-profile-section">
          <img v-if="graduate.avatar" :src="graduate.avatar" :alt="fullName" class="gpd-avatar" />
          <span v-else class="gpd-initials">{{ initials }}</span>
          <div class="gpd-profile-info">
            <p class="gpd-name">{{ fullName }}</p>
            <span class="gt-status-badge" :class="graduate.employmentStatus === 'Empleado' ? 'gt-badge--employed' : 'gt-badge--unemployed'">
              {{ graduate.employmentStatus }}
            </span>
          </div>
        </div>

        <!-- Empleo Actual -->
        <div v-if="graduate.company" class="view-section">
          <div class="section-head">
            <div class="section-icon-blue"><AppIcon icon="briefcase" /></div>
            <h6 class="section-title">Empleo Actual</h6>
          </div>
          <div class="info-card">
            <div class="gpd-info-row">
              <AppIcon icon="building" class="gpd-row-icon" />
              <div>
                <span class="field-label">Empresa</span>
                <p class="field-value fw-bold">{{ graduate.company }}</p>
              </div>
            </div>
            <div v-if="currentJob" class="gpd-info-row">
              <AppIcon icon="briefcase" class="gpd-row-icon" />
              <div>
                <span class="field-label">Cargo</span>
                <p class="field-value fw-bold">{{ currentJob.jobTitle }}</p>
              </div>
            </div>
            <div v-if="graduate.salaryRangeMin != null && graduate.salaryRangeMax != null" class="gpd-info-row">
              <AppIcon icon="dollar-sign" class="gpd-row-icon" />
              <div>
                <span class="field-label">Salario Aproximado</span>
                <p class="field-value fw-bold">
                  {{ formatCurrency(graduate.salaryRangeMin) }} -
                  {{ formatCurrency(graduate.salaryRangeMax) }}
                </p>
              </div>
            </div>
            <div v-if="currentJob" class="gpd-info-row">
              <AppIcon icon="map-marker-alt" class="gpd-row-icon" />
              <div>
                <span class="field-label">Ciudad</span>
                <p class="field-value fw-bold">
                  {{ currentJob.municipality.name }},
                  {{ currentJob.country.name }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Experiencia Laboral -->
        <div v-if="graduate.workExperiences.length" class="view-section">
          <div class="section-head">
            <div class="section-icon-purple"><AppIcon icon="history" /></div>
            <h6 class="section-title">Experiencia Laboral Registrada</h6>
          </div>
          <div class="d-flex flex-column gap-2">
            <div v-for="(exp, i) in graduate.workExperiences" :key="i" class="gpd-exp-card">
              <div class="gpd-exp-icon"><AppIcon icon="building" /></div>
              <div class="gpd-exp-info">
                <p class="gpd-exp-title">{{ exp.jobTitle }}</p>
                <p class="gpd-exp-company">{{ exp.company }}</p>
                <p class="gpd-exp-meta">
                  <AppIcon icon="calendar" class="me-1" />
                  {{ yearOf(exp.startDate) }} -
                  {{ exp.endDate ? yearOf(exp.endDate) : 'Presente' }}
                  <span v-if="exp.area"> &bull; {{ exp.area }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Habilidades -->
        <div v-if="graduate.skills.length" class="view-section">
          <div class="section-head">
            <div class="section-icon-green"><AppIcon icon="star" /></div>
            <h6 class="section-title">Habilidades Principales</h6>
          </div>
          <div class="gpd-skills">
            <span v-for="skill in graduate.skills" :key="skill" class="gpd-skill-tag">{{ skill }}</span>
          </div>
        </div>

        <!-- Última actualización -->
        <div v-if="graduate.lastUpdated" class="view-section">
          <div class="gpd-last-updated">
            <strong>Última actualización:</strong>
            {{ formatRelativeDate(graduate.lastUpdated) }}
          </div>
        </div>
      </div>
    </template>

    <template #footer></template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { GraduateDashboardRowDto } from '../dtos/graduateTracking.dto';

export default defineComponent({
  name: 'GraduateProfileDrawer',
  components: { AppDrawer, AppDrawerHeader, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
    graduate: {
      type: Object as PropType<GraduateDashboardRowDto | null>,
      default: null,
    },
  },
  emits: ['update:isVisible'],
  setup(props) {
    const fullName = computed(() => (props.graduate ? `${props.graduate.names} ${props.graduate.lastnames}` : ''));
    const initials = computed(() => (props.graduate ? `${props.graduate.names?.[0] ?? ''}${props.graduate.lastnames?.[0] ?? ''}` : ''));
    const currentJob = computed(() => props.graduate?.workExperiences?.find((e) => !e.endDate) ?? props.graduate?.workExperiences?.[0] ?? null);

    const yearOf = (date: string) => new Date(date).getFullYear();

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value);

    const formatRelativeDate = (value: string | null) => {
      if (!value) return '-';
      const diff = Date.now() - new Date(value).getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return 'Hoy';
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;
      if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`;
      if (days < 365) return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`;
      return `Hace ${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? 's' : ''}`;
    };

    return {
      fullName,
      initials,
      currentJob,
      yearOf,
      formatCurrency,
      formatRelativeDate,
    };
  },
});
</script>

<style scoped>
/* Profile header */
.gpd-profile-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.gpd-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.gpd-initials {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #e9ecef;
}

.gpd-profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gpd-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* Sections (shared with rest of app) */
.view-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.section-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 0;
  font-size: 0.95rem;
}

.section-icon-blue,
.section-icon-purple,
.section-icon-green {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.section-icon-blue {
  background: #eff6ff;
  color: #1d4ed8;
}
.section-icon-purple {
  background: #f5f3ff;
  color: #7c3aed;
}
.section-icon-green {
  background: #ecfdf5;
  color: #059669;
}

.info-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gpd-info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.gpd-row-icon {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.field-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  display: block;
  margin-bottom: 2px;
}

.field-value {
  font-size: 0.88rem;
  color: #111827;
  margin: 0;
}

/* Work experience cards */
.gpd-exp-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}

.gpd-exp-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.gpd-exp-info {
  flex: 1;
}

.gpd-exp-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px;
}

.gpd-exp-company {
  font-size: 0.82rem;
  color: #374151;
  margin: 0 0 4px;
}

.gpd-exp-meta {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

/* Skills */
.gpd-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gpd-skill-tag {
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 500;
}

/* Last updated */
.gpd-last-updated {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: #92400e;
}

/* Status badges (reuse from page) */
.gt-status-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.gt-badge--employed {
  background: #dcfce7;
  color: #15803d;
}
.gt-badge--unemployed {
  background: #fee2e2;
  color: #b91c1c;
}
</style>
