<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader variant="view" icon="briefcase" :title="vacancy?.title ?? 'Detalle de vacante'" :subtitle="vacancy?.company ?? ''" />
    </template>

    <template #body>
      <div class="drawer-section" v-if="vacancy">
        <!-- Meta grid -->
        <div class="vd-meta-grid">
          <div class="vd-meta-item">
            <span class="vd-meta-icon vd-meta-icon--blue"><AppIcon icon="map-marker-alt" /></span>
            <div>
              <p class="vd-meta-label">Ubicación</p>
              <p class="vd-meta-value">
                {{ vacancy.city }}<template v-if="vacancy.country">, {{ vacancy.country }}</template>
              </p>
            </div>
          </div>
          <div v-if="vacancy.salaryMin || vacancy.salaryMax" class="vd-meta-item">
            <span class="vd-meta-icon vd-meta-icon--green"><AppIcon icon="dollar-sign" /></span>
            <div>
              <p class="vd-meta-label">Salario</p>
              <p class="vd-meta-value vd-meta-value--green">
                <template v-if="vacancy.salaryMin && vacancy.salaryMax">
                  {{ formatSalary(vacancy.salaryMin) }} –
                  {{ formatSalary(vacancy.salaryMax) }}
                </template>
                <template v-else-if="vacancy.salaryMin"> Desde {{ formatSalary(vacancy.salaryMin) }} </template>
                <template v-else> Hasta {{ formatSalary(vacancy.salaryMax!) }} </template>
              </p>
            </div>
          </div>
          <div class="vd-meta-item">
            <span class="vd-meta-icon vd-meta-icon--purple"><AppIcon icon="desktop" /></span>
            <div>
              <p class="vd-meta-label">Modalidad</p>
              <p class="vd-meta-value">{{ modalityLabel }}</p>
            </div>
          </div>
          <div class="vd-meta-item">
            <span class="vd-meta-icon vd-meta-icon--orange"><AppIcon icon="file-contract" /></span>
            <div>
              <p class="vd-meta-label">Tipo contrato</p>
              <p class="vd-meta-value">{{ contractLabel }}</p>
            </div>
          </div>
          <div v-if="vacancy.experienceLevel" class="vd-meta-item">
            <span class="vd-meta-icon vd-meta-icon--indigo"><AppIcon icon="chart-line" /></span>
            <div>
              <p class="vd-meta-label">Experiencia</p>
              <p class="vd-meta-value">{{ experienceLabel }}</p>
            </div>
          </div>
          <div class="vd-meta-item">
            <span class="vd-meta-icon vd-meta-icon--gray"><AppIcon icon="clock" /></span>
            <div>
              <p class="vd-meta-label">Publicado</p>
              <p class="vd-meta-value">{{ timeSince(vacancy.publishedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div v-if="vacancy.skills?.length" class="vd-section">
          <h6 class="vd-section-title">Habilidades requeridas</h6>
          <div class="vd-skills">
            <span v-for="skill in vacancy.skills" :key="skill" class="vd-skill-tag">{{ skill }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="vd-section">
          <h6 class="vd-section-title">Descripción del cargo</h6>
          <p class="vd-text">{{ vacancy.description }}</p>
        </div>

        <!-- Requirements -->
        <div class="vd-section">
          <h6 class="vd-section-title">Requisitos</h6>
          <ul class="vd-bullet-list">
            <li v-for="(line, i) in requirementLines" :key="i">{{ line }}</li>
          </ul>
        </div>

        <!-- Benefits -->
        <div v-if="vacancy.benefits" class="vd-section">
          <h6 class="vd-section-title">Beneficios</h6>
          <ul class="vd-check-list">
            <li v-for="(line, i) in benefitLines" :key="i">
              <span class="vd-check-icon"><AppIcon icon="check" /></span>
              {{ line }}
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <div class="d-flex gap-2">
          <button class="vd-action-btn" :class="isSaved ? 'vd-action-btn--saved' : 'vd-action-btn--ghost'" @click="$emit('save', vacancy)">
            <AppIcon icon="bookmark" /> {{ isSaved ? 'Guardada' : 'Guardar' }}
          </button>
          <button class="vd-action-btn vd-action-btn--ghost" @click="$emit('share', vacancy)"><AppIcon icon="external-link-alt" /> Compartir</button>
        </div>
        <div>
          <button v-if="isApplied" class="vd-action-btn vd-action-btn--applied" disabled><AppIcon icon="check-circle" /> Ya postulado</button>
          <button v-else class="vd-action-btn vd-action-btn--primary" @click="$emit('apply', vacancy)"><AppIcon icon="paper-plane" /> Aplicar a esta vacante</button>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { VacancyDto, ContractType, Modality, ExperienceLevel } from '../dtos/vacancy.dto';

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
  senior: 'Senior (5+ años)',
  lider: 'Líder / Manager',
};

export default defineComponent({
  name: 'VacancyDetailDrawer',
  components: { AppDrawer, AppDrawerHeader, AppIcon },
  props: {
    isVisible: { type: Boolean, required: true },
    vacancy: { type: Object as PropType<VacancyDto | null>, default: null },
    isSaved: { type: Boolean, default: false },
    isApplied: { type: Boolean, default: false },
  },
  emits: ['update:isVisible', 'apply', 'save', 'share'],
  setup(props) {
    const modalityLabel = computed(() => (props.vacancy ? MODALITY_LABEL[props.vacancy.modality] ?? props.vacancy.modality : ''));
    const contractLabel = computed(() => (props.vacancy ? CONTRACT_LABEL[props.vacancy.contractType] ?? props.vacancy.contractType : ''));
    const experienceLabel = computed(() => (props.vacancy ? EXPERIENCE_LABEL[props.vacancy.experienceLevel] ?? props.vacancy.experienceLevel : ''));

    const splitLines = (text: string) =>
      text
        .split(/\n|(?<=\.)(?=\s+[A-ZÁÉÍÓÚ])/)
        .map((s) => s.trim())
        .filter(Boolean);

    const requirementLines = computed(() => (props.vacancy ? splitLines(props.vacancy.requirements) : []));
    const benefitLines = computed(() => (props.vacancy?.benefits ? splitLines(props.vacancy.benefits) : []));

    const formatSalary = (val: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(val);

    const timeSince = (dateStr: string) => {
      const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
      if (days === 0) return 'Hoy';
      if (days === 1) return 'Hace 1 día';
      if (days < 30) return `Hace ${days} días`;
      return `Hace ${Math.floor(days / 30)} mes(es)`;
    };

    return {
      modalityLabel,
      contractLabel,
      experienceLabel,
      requirementLines,
      benefitLines,
      formatSalary,
      timeSince,
    };
  },
});
</script>

<style scoped>
.drawer-section {
  padding: 20px;
}

.vd-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 18px;
  padding: 14px;
  background: #f8f9fa;
  border-radius: 10px;
}
.vd-meta-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.vd-meta-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  flex-shrink: 0;
}
.vd-meta-icon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.vd-meta-icon--green {
  background: #dcfce7;
  color: #166534;
}
.vd-meta-icon--purple {
  background: #ede9fe;
  color: #6d28d9;
}
.vd-meta-icon--orange {
  background: #ffedd5;
  color: #c2410c;
}
.vd-meta-icon--indigo {
  background: #e0e7ff;
  color: #4338ca;
}
.vd-meta-icon--gray {
  background: #f1f5f9;
  color: #475569;
}
.vd-meta-label {
  font-size: 0.72rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 1px;
}
.vd-meta-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}
.vd-meta-value--green {
  color: #16a34a;
}

.vd-section {
  margin-bottom: 16px;
}
.vd-section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid #e9ecef;
}
.vd-text {
  color: #4b5563;
  font-size: 0.87rem;
  line-height: 1.65;
  margin: 0;
}

.vd-bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vd-bullet-list li {
  position: relative;
  padding-left: 16px;
  font-size: 0.87rem;
  color: #374151;
  line-height: 1.5;
}
.vd-bullet-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary, #2563eb);
  font-weight: 700;
}

.vd-check-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vd-check-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.87rem;
  color: #374151;
  line-height: 1.5;
}
.vd-check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  font-size: 0.65rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.vd-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.vd-skill-tag {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 500;
}

.vd-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, background 0.15s;
}
.vd-action-btn--ghost {
  background: #f1f5f9;
  color: #374151;
  border: 1.5px solid #dee2e6;
}
.vd-action-btn--ghost:hover {
  background: #e2e8f0;
}
.vd-action-btn--saved {
  background: #fffbeb;
  color: #b45309;
  border: 1.5px solid #f59e0b;
}
.vd-action-btn--saved:hover {
  background: #fef3c7;
}
.vd-action-btn--primary {
  background: var(--color-primary, #2563eb);
  color: #fff;
}
.vd-action-btn--primary:hover {
  opacity: 0.88;
}
.vd-action-btn--applied {
  background: #dcfce7;
  color: #16a34a;
  border: 1.5px solid #86efac;
  cursor: default;
  opacity: 1;
}
</style>
