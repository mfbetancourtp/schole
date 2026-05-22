<template>
  <AppDrawer :isVisible="isVisible" size="lg" @update:isVisible="$emit('close')">
    <template #head>
      <AppDrawerHeader class="px-1" variant="view" icon="eye" title="Detalle del programa académico">
        <template #meta>
          <span class="drawerProgramName">
            {{ program?.name || '-' }}
          </span>

          <span class="drawerProgramCode">
            {{ program?.code || '-' }}
          </span>

          <span class="statusBadge" :class="statusBadgeClass">
            {{ statusLabel }}
          </span>
        </template>

        <template #actions>
          <AppButton class="headerActionButton" variant="light" outlined :disabled="isLoading || !program" @click="$emit('edit', program)">
            <AppIcon icon="edit" class="buttonIcon" />
            Editar
          </AppButton>

          <AppButton class="headerActionButton dangerButton" variant="light" outlined :disabled="isLoading || !program" @click="$emit('deactivate', program)">
            <AppIcon :icon="program?.isActive !== false ? 'power-off' : 'undo'" class="buttonIcon" />
            {{ program?.isActive !== false ? 'Inactivar' : 'Activar' }}
          </AppButton>
        </template>
      </AppDrawerHeader>
    </template>

    <template #body>
      <div class="drawerContent">
        <AppLoading v-if="isLoading" />

        <div v-else-if="!program" class="emptyDetailState">No fue posible cargar la información del programa.</div>

        <template v-else>
          <section class="summaryCard">
            <div class="sectionHeader sectionHeader--noMargin">
              <div class="sectionHeaderIcon sectionHeaderIcon--primary">
                <AppIcon icon="chart-line" />
              </div>
              <span class="sectionHeaderTitle">Resumen Académico</span>
            </div>

            <div class="summaryGrid">
              <AppCardDashboard v-for="card in summaryCards" :key="card.key" size="small">
                <template #title>
                  <div class="summaryTop" :class="card.topClass">
                    <AppIcon :icon="card.icon" />
                    <span>{{ card.label }}</span>
                  </div>
                </template>

                <template #body>
                  <div class="summaryValue" :class="card.valueClass">
                    {{ card.value }}
                  </div>
                </template>
              </AppCardDashboard>
            </div>
          </section>

          <AppCard>
            <template #title>
              <h5 class="cardTitle">Información General</h5>
            </template>

            <template #body>
              <div class="infoGrid">
                <div v-for="item in generalInfoItems" :key="item.label" class="infoItem" :class="{ 'infoItem--full': item.full }">
                  <div class="infoLabel">{{ item.label }}</div>
                  <div class="infoValue">{{ item.value }}</div>
                </div>
              </div>
            </template>
          </AppCard>

          <AppCard>
            <template #title>
              <h5 class="cardTitle">Información Regulatoria</h5>
            </template>

            <template #body>
              <div class="subSectionTitle">Registro y vigencia</div>

              <div class="infoGrid infoGrid--spaced">
                <div v-for="item in regulatoryInfoItems" :key="item.label" class="infoItem" :class="{ 'infoItem--full': item.full }">
                  <div class="infoLabel">{{ item.label }}</div>
                  <div class="infoValue">{{ item.value }}</div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="subSectionTitle">Acreditación y estado</div>

              <div class="infoGrid infoGrid--spaced">
                <div class="infoItem">
                  <div class="infoLabel">Acreditación de alta calidad</div>
                  <span class="tagBadge" :class="program?.hasHighQualityAccreditation ? 'tagBadge--success' : 'tagBadge--secondary'">
                    {{ program?.hasHighQualityAccreditation ? 'Sí' : 'No' }}
                  </span>
                </div>

                <div class="infoItem">
                  <div class="infoLabel">Estado del programa</div>
                  <div class="infoValue">
                    {{ normalizeText(program?.state || statusLabel) }}
                  </div>
                </div>

                <div class="infoItem">
                  <div class="infoLabel">Última actualización</div>
                  <div class="infoValue">
                    {{ formatDateTime(program?.updatedAt || program?.createdAt) }}
                  </div>
                </div>

                <div class="infoItem">
                  <div class="infoLabel">Vigencia restante</div>
                  <div class="infoValue" :class="vigencyColorClass">
                    {{ validityLabel }}
                  </div>
                </div>
              </div>
            </template>
          </AppCard>

          <AppCard>
            <template #title>
              <h5 class="cardTitle">Información Administrativa</h5>
            </template>

            <template #body>
              <div class="subSectionTitle">Capacidad y costos</div>

              <div class="infoGrid infoGrid--spaced">
                <div v-for="item in administrativeInfoItems" :key="item.label" class="infoItem" :class="{ 'infoItem--full': item.full }">
                  <div class="infoLabel">{{ item.label }}</div>
                  <div class="infoValue" :class="{ 'infoValue--strong': item.strong }">
                    {{ item.value }}
                  </div>
                </div>
              </div>
            </template>
          </AppCard>

          <section class="detailCard">
            <div class="cardHeader">
              <h5 class="cardTitle">Configuración Académica</h5>
            </div>

            <div class="cardBody cardBody--compact">
              <div class="accordionRow" @click="toggleSection('entryProfile')">
                <span class="accordionTitle">Perfil de ingreso</span>
                <AppIcon icon="chevron-down" class="accordionIcon" :class="{ 'accordionIcon--open': sections.entryProfile }" />
              </div>

              <transition name="fade-slide">
                <div v-if="sections.entryProfile" class="accordionContent">
                  {{ normalizeText(program?.entryProfile) }}
                </div>
              </transition>

              <div class="accordionRow" @click="toggleSection('graduateProfile')">
                <span class="accordionTitle">Perfil de egreso</span>
                <AppIcon icon="chevron-down" class="accordionIcon" :class="{ 'accordionIcon--open': sections.graduateProfile }" />
              </div>

              <transition name="fade-slide">
                <div v-if="sections.graduateProfile" class="accordionContent">
                  {{ normalizeText(program?.graduateProfile) }}
                </div>
              </transition>

              <div class="contentSection">
                <div class="contentTitle">Líneas de investigación</div>
                <div v-if="researchLines.length" class="tagsWrap">
                  <span v-for="line in researchLines" :key="line" class="tagBadge tagBadge--primary">{{ line }}</span>
                </div>
                <p v-else class="contentParagraph">No hay líneas de investigación registradas.</p>
              </div>

              <div class="divider"></div>

              <div class="contentSection">
                <div class="contentTitle">Campos ocupacionales</div>
                <div v-if="occupationalFields.length" class="tagsWrap">
                  <span v-for="field in occupationalFields" :key="field" class="tagBadge tagBadge--primary">{{ field }}</span>
                </div>
                <p v-else class="contentParagraph">No hay campos ocupacionales registrados.</p>
              </div>

              <div class="divider"></div>

              <div class="contentSection">
                <div class="contentTitle">Competencias del programa</div>
                <div v-if="competencyGroups.length" class="competencyGroups">
                  <div v-for="group in competencyGroups" :key="group.type" class="competencyGroup">
                    <div class="subSectionTitle subSectionTitle--small">
                      {{ group.type }}
                    </div>
                    <div class="tagsWrap">
                      <span v-for="competency in group.items" :key="competency.id" class="tagBadge tagBadge--primary">
                        {{ competency.label }}
                      </span>
                    </div>
                  </div>
                </div>
                <p v-else class="contentParagraph">No hay competencias configuradas para este programa.</p>
              </div>

              <div class="divider"></div>

              <div class="contentSection">
                <div class="contentTitle">Mallas curriculares asociadas</div>
                <div v-if="curriculumSummaries.length" class="curriculumList">
                  <div v-for="curriculum in curriculumSummaries" :key="curriculum.id" class="curriculumItem">
                    <div class="curriculumHeader">
                      <span class="curriculumName">{{ curriculum.name }}</span>
                      <span class="tagBadge" :class="curriculum.badgeClass">{{ curriculum.state }}</span>
                    </div>
                    <p class="contentParagraph mb-0">
                      {{ curriculum.periodLabel }}
                    </p>
                  </div>
                </div>
                <p v-else class="contentParagraph">No hay mallas curriculares registradas para este programa.</p>
              </div>

              <div class="divider"></div>

              <div class="contentSection">
                <div class="contentTitle">Descripción del programa</div>
                <div class="highlightBox">
                  {{ normalizeText(program?.description) }}
                </div>
              </div>
            </div>
          </section>
        </template>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';
import { ProgramDto } from '../dtos/programs.dto';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

type SectionKey = 'entryProfile' | 'graduateProfile' | 'competencies';

export default defineComponent({
  name: 'ProgramDetailDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppButton,
    AppIcon,
    AppCardDashboard,
    AppCard,
    AppLoading,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    program: {
      type: Object as PropType<ProgramDto | null>,
      default: null,
    },
  },
  emits: ['close', 'edit', 'deactivate'],
  setup(props) {
    const isLoading = computed(() => props.loading);
    const sections = reactive<Record<SectionKey, boolean>>({
      entryProfile: false,
      graduateProfile: false,
      competencies: false,
    });

    const toggleSection = (section: SectionKey) => {
      sections[section] = !sections[section];
    };

    const formatCurrency = (value: string | number) => {
      if (!value) return '0';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return new Intl.NumberFormat('es-CO').format(numValue);
    };

    const normalizeText = (value: unknown) => {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        return trimmedValue.length ? trimmedValue : '-';
      }
      if (Array.isArray(value)) {
        return value.length ? value.join(', ') : '-';
      }
      return String(value);
    };

    const formatDate = (value?: string | null) => {
      if (!value) return '-';

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) {
        return '-';
      }

      return parsedDate.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    };

    const formatDateTime = (value?: string | null) => {
      if (!value) return '-';

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) {
        return '-';
      }

      return parsedDate.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const parseList = (value?: string | string[] | null) => {
      if (Array.isArray(value)) {
        return value.map((item) => item?.trim()).filter(Boolean) as string[];
      }

      if (typeof value !== 'string') {
        return [];
      }

      return value
        .split(/[\n,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const formatCapacity = (value?: number | null) => {
      if (value === null || value === undefined) return '-';
      return `${value} estudiantes`;
    };

    const formatPersonName = (
      person?: {
        firstName?: string | null;
        secondName?: string | null;
        firstLastname?: string | null;
        secondLastname?: string | null;
        names?: string | null;
        lastnames?: string | null;
      } | null
    ) => {
      if (!person) return '-';

      const fullName =
        [person.firstName, person.secondName, person.firstLastname, person.secondLastname]
          .map((item) => item?.trim())
          .filter(Boolean)
          .join(' ') ||
        [person.names, person.lastnames]
          .map((item) => item?.trim())
          .filter(Boolean)
          .join(' ');

      return fullName || '-';
    };

    const formatCount = (value?: number | null, label = 'registro') => {
      if (value === null || value === undefined) return '-';
      return `${value} ${label}${value === 1 ? '' : 's'}`;
    };

    const getStateBadgeClass = (state?: string | null) => {
      if (state === 'Activo' || state === 'Finalizado') return 'tagBadge--success';
      if (state === 'Borrador' || state === 'En diseño' || state === 'En progreso') return 'tagBadge--warning';
      return 'tagBadge--secondary';
    };

    const expirationDate = computed(() => props.program?.expirationDate || props.program?.registrationExpirationDate || null);
    const programDirectorName = computed(() => formatPersonName(props.program?.director?.people));
    const departmentDirectorName = computed(() => formatPersonName(props.program?.department?.director?.people));
    const facultyDirectorName = computed(() => formatPersonName(props.program?.department?.faculty?.director?.people));
    const competencies = computed(() => props.program?.competencies ?? []);
    const curriculums = computed(() => props.program?.programCurriculums ?? []);

    const statusLabel = computed(() => {
      if (props.program?.state) return props.program.state;
      if ((props.program as any)?.status) return (props.program as any).status;
      return props.program?.isActive !== false ? 'Activo' : 'Inactivo';
    });

    const statusBadgeClass = computed(() => {
      if (statusLabel.value === 'Activo') return 'statusBadge--success';
      if (statusLabel.value === 'En actualización') return 'statusBadge--warning';
      if (statusLabel.value === 'En diseño' || statusLabel.value === 'En revisión') {
        return 'statusBadge--warning';
      }
      return 'statusBadge--secondary';
    });

    const validityDays = computed(() => {
      if (!expirationDate.value) return null;

      const currentDate = new Date();
      const targetDate = new Date(expirationDate.value);

      if (Number.isNaN(targetDate.getTime())) {
        return null;
      }

      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      return Math.ceil((targetDate.getTime() - currentDate.getTime()) / millisecondsPerDay);
    });

    const validityLabel = computed(() => {
      if (validityDays.value === null) return '-';
      if (validityDays.value < 0) {
        return `Vencido hace ${Math.abs(validityDays.value)} días`;
      }
      return `${validityDays.value} días`;
    });

    const vigencyColorClass = computed(() => {
      const days = validityDays.value;
      if (days === null) return '';
      if (days > 365) return 'textSuccess';
      if (days > 90) return 'textWarning';
      return 'textDanger';
    });

    const summaryCards = computed(() => [
      {
        key: 'credits',
        label: 'Créditos del esquema',
        value: normalizeText(props.program?.operationalScheme?.creditsNumber),
        icon: 'graduation-cap',
        topClass: 'summaryTop--blue',
        valueClass: 'summaryValue--primary',
      },
      {
        key: 'periods',
        label: 'Períodos del esquema',
        value: normalizeText(props.program?.operationalScheme?.semesterNumber),
        icon: 'calendar-alt',
        topClass: 'summaryTop--green',
        valueClass: 'summaryValue--green',
      },
      {
        key: 'weeks',
        label: 'Semanas lectivas',
        value: normalizeText(props.program?.operationalScheme?.classWeeks),
        icon: 'clock',
        topClass: 'summaryTop--orange',
        valueClass: 'summaryValue--small textWarning',
      },
      {
        key: 'validity',
        label: 'Vigencia restante',
        value: validityLabel.value,
        icon: 'calendar',
        topClass: 'summaryTop--muted',
        valueClass: `summaryValue--date ${vigencyColorClass.value}`.trim(),
      },
    ]);

    const generalInfoItems = computed(() => [
      {
        label: 'Nivel académico',
        value: normalizeText(props.program?.operationalScheme?.programType?.name || props.program?.educationType?.name),
      },
      {
        label: 'Esquema operativo',
        value: normalizeText(props.program?.operationalScheme?.name),
      },
      {
        label: 'Código del esquema',
        value: normalizeText(props.program?.operationalScheme?.code),
      },
      {
        label: 'Escala de valoración',
        value: normalizeText(props.program?.ratingScale?.title),
      },
      {
        label: 'Director del programa',
        value: programDirectorName.value,
      },
      {
        label: 'Título que otorga',
        value: normalizeText(props.program?.programTitle),
        full: true,
      },
      {
        label: 'Inicio de vigencia',
        value: formatDate(props.program?.effectiveDate),
      },
      {
        label: 'Fecha de vencimiento',
        value: formatDate(expirationDate.value),
      },
      {
        label: 'Facultad',
        value: normalizeText(props.program?.department?.faculty?.name),
      },
      {
        label: 'Departamento',
        value: normalizeText(props.program?.department?.name || props.program?.organization?.name),
      },
      {
        label: 'Director del departamento',
        value: departmentDirectorName.value,
      },
      {
        label: 'Director de facultad',
        value: facultyDirectorName.value,
      },
    ]);

    const regulatoryInfoItems = computed(() => [
      {
        label: 'Resolución de aprobación',
        value: normalizeText(props.program?.approvalResolution),
        full: true,
      },
      {
        label: 'Fecha de aprobación',
        value: formatDate(props.program?.approvalDate),
      },
      {
        label: 'Fecha de vencimiento',
        value: formatDate(expirationDate.value),
      },
      {
        label: 'Registro calificado',
        value: normalizeText(props.program?.qualifiedRegistration),
      },
      {
        label: 'Código SNIES',
        value: normalizeText(props.program?.sniesCode),
      },
      {
        label: 'Registro interno',
        value: normalizeText(props.program?.internalRecord || props.program?.internalStandard),
      },
    ]);

    const administrativeInfoItems = computed(() => [
      {
        label: 'Cupo máximo',
        value: formatCapacity(props.program?.maximumCapacity),
      },
      {
        label: 'Cupo mínimo',
        value: formatCapacity(props.program?.minimumCapacity),
      },
      {
        label: 'Horas por semestre',
        value: normalizeText(props.program?.operationalScheme?.semesterHours),
      },
      {
        label: 'Semanas de evaluación',
        value: normalizeText(props.program?.operationalScheme?.evaluationWeeks),
      },
      {
        label: 'Competencias configuradas',
        value: formatCount(competencies.value.length, 'competencia'),
      },
      {
        label: 'Mallas curriculares',
        value: formatCount(curriculums.value.length, 'malla curricular'),
        strong: true,
      },
    ]);

    const researchLines = computed(() => parseList(props.program?.researchLines));
    const occupationalFields = computed(() => parseList(props.program?.occupationalFields));
    const competencyGroups = computed(() => {
      const groups = competencies.value.reduce<Record<string, Array<{ id: number; label: string }>>>((acc, competency) => {
        const type = competency.competencyType?.trim() || 'Sin tipo';
        const label = competency.code ? `${competency.code} · ${competency.name}` : competency.name;

        if (!acc[type]) {
          acc[type] = [];
        }

        acc[type].push({
          id: competency.id,
          label,
        });

        return acc;
      }, {});

      return Object.entries(groups).map(([type, items]) => ({
        type,
        items,
      }));
    });
    const curriculumSummaries = computed(() =>
      curriculums.value.map((curriculum) => {
        const periodCount = curriculum.curriculumPeriods?.length ?? 0;

        return {
          id: curriculum.id,
          name: curriculum.name || `Malla ${curriculum.id}`,
          state: curriculum.state || 'Sin estado',
          badgeClass: getStateBadgeClass(curriculum.state),
          periodLabel: formatCount(periodCount, 'período'),
        };
      })
    );

    return {
      isLoading,
      sections,
      toggleSection,
      formatCurrency,
      normalizeText,
      formatDateTime,
      statusLabel,
      statusBadgeClass,
      vigencyColorClass,
      validityLabel,
      summaryCards,
      generalInfoItems,
      regulatoryInfoItems,
      administrativeInfoItems,
      researchLines,
      occupationalFields,
      competencyGroups,
      curriculumSummaries,
    };
  },
});
</script>

<style scoped>
.drawerHeader {
  width: 100%;
  padding-right: 1rem;
  padding-left: 1rem;
}

.drawerProgramName {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.drawerProgramCode {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.8rem;
  font-weight: 600;
}

.drawerTitle {
  margin: 0 0 0.25rem 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: #ffffff;
}

.drawerSubtitle {
  display: block;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
}

.statusBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 600;
}

.statusBadge--success {
  background-color: #e6f4ea;
  color: #059669;
  border-color: rgba(5, 150, 105, 0.25);
}

.statusBadge--secondary {
  background-color: #f3f4f6;
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.2);
}

.statusBadge--warning {
  background-color: #fff4e5;
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.25);
}

.headerActions {
  display: flex;
  gap: 16px;
  width: 100%;
  margin-top: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
}

.headerActionButton {
  flex: 1;
  font-weight: 700;
}

.buttonIcon {
  margin-right: 0.5rem;
}

.drawerContent {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 20px;
  padding-bottom: 2rem;
}

.emptyDetailState {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #6b7280;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
}

.summaryCard {
  background-color: #f4f7fa;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 24px;
}

.sectionHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.sectionHeader--noMargin {
  margin-bottom: 1rem;
}

.sectionHeaderIcon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sectionHeaderIcon--primary {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.sectionHeaderTitle {
  font-size: 1rem;
  font-weight: 700;
  color: #1e3a8a;
}

.summaryGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summaryBox {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  min-height: 100px;
}

.summaryTop {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 0.82rem;
  font-weight: 500;
}

.summaryTop--blue {
  color: #2563eb;
}

.summaryTop--green {
  color: #059669;
}

.summaryTop--orange {
  color: #ea580c;
}

.summaryTop--muted {
  color: #6b7280;
}

.summaryValue {
  font-size: 1.2rem;
  font-weight: 700;
}

.summaryValue--primary {
  color: #1e3a8a;
}

.summaryValue--green {
  color: #059669;
}

.summaryValue--small {
  font-size: 1rem;
}

.summaryValue--date {
  font-size: 0.95rem;
  color: #111827;
}

.textSuccess {
  color: #059669;
}

.textWarning {
  color: #ea580c;
}

.textDanger {
  color: #dc2626;
}

.detailCard {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.cardHeader {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.cardTitle {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.cardBody {
  padding: 24px;
}

.cardBody--compact {
  padding-top: 10px;
  padding-bottom: 24px;
}

.infoGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.infoGrid--spaced {
  margin-top: 12px;
}

.infoItem {
  min-width: 0;
}

.infoItem--full {
  grid-column: 1 / -1;
}

.infoLabel {
  margin-bottom: 4px;
  font-size: 0.85rem;
  color: #6b7280;
}

.infoValue {
  font-size: 0.95rem;
  color: #111827;
}

.infoValue--strong {
  font-weight: 600;
}

.subSectionTitle {
  margin-bottom: 0.85rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: #6b7280;
}

.subSectionTitle--small {
  margin-bottom: 0.65rem;
  margin-top: 0.5rem;
}

.divider {
  width: 100%;
  height: 1px;
  margin: 1.25rem 0;
  background: #e5e7eb;
}

.authoritiesList {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.authorityItem {
  display: flex;
  align-items: center;
  gap: 12px;
}

.authorityLabel {
  margin-bottom: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.avatar--primary {
  background: #2563eb;
}

.avatar--success {
  background: #059669;
}

.tagsWrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tagBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 500;
}

.tagBadge--primary {
  background-color: #eff6ff;
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.18);
}

.tagBadge--success {
  background-color: #e6f4ea;
  color: #059669;
  border-color: rgba(5, 150, 105, 0.18);
}

.tagBadge--warning {
  background-color: #fff4e5;
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.18);
}

.tagBadge--secondary {
  background-color: #f3f4f6;
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.18);
}

.accordionRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.accordionRow:hover {
  background-color: #f9fafb;
}

.accordionTitle {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.accordionIcon {
  transition: transform 0.25s ease;
}

.accordionIcon--open {
  transform: rotate(180deg);
}

.accordionContent {
  padding: 0.85rem 0 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.92rem;
  line-height: 1.6;
  color: #6b7280;
}

.contentSection {
  padding-top: 1rem;
}

.competencyGroups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.competencyGroup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contentTitle {
  margin-bottom: 0.65rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.contentParagraph {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
}

.highlightBox {
  background: #f9fafb;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font-size: 0.92rem;
  color: #111827;
}

.curriculumList {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.curriculumItem {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  background: #f9fafb;
}

.curriculumHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.curriculumName {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.dangerButton {
  transition: all 0.2s ease !important;
}

.dangerButton:hover {
  background-color: var(--color-danger, #d81b60) !important;
  border-color: var(--color-danger, #d81b60) !important;
  color: #ffffff !important;
}

.dangerButton:hover :deep(i),
.dangerButton:hover :deep(span) {
  color: #ffffff !important;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

:deep(.offcanvas-header) {
  align-items: flex-start !important;
}

@media (max-width: 768px) {
  .headerActions {
    flex-direction: column;
  }

  .summaryGrid,
  .infoGrid {
    grid-template-columns: 1fr;
  }

  .infoItem--full {
    grid-column: auto;
  }

  .drawerTitle {
    font-size: 1.35rem;
  }

  .cardBody,
  .cardHeader,
  .summaryCard {
    padding-left: 16px;
    padding-right: 16px;
  }
}
.summaryGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summaryTop {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.82rem;
  font-weight: 600;
}

.summaryTop--blue {
  color: #2563eb;
}

.summaryTop--green {
  color: #059669;
}

.summaryTop--orange {
  color: #ea580c;
}

.summaryTop--muted {
  color: #6b7280;
}

.summaryValue {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.summaryValue--primary {
  color: #1e3a8a;
}

.summaryValue--green {
  color: #059669;
}

.summaryValue--small {
  font-size: 1rem;
}

.summaryValue--date {
  font-size: 0.95rem;
  color: #111827;
}
</style>
