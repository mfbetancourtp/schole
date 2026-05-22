<template>
  <AppBaseList>
    <template #content>
      <!-- ✅ Mantener tu selector (sin services) -->
      <SelectionStudentsByParent @update-student-user-id="updateStudentUserId" />

      <div class="progress-page">
        <!-- Header -->
        <div class="progress-header">
          <div class="progress-header__icon">
            <AppIcon icon="graduation-cap" />
          </div>

          <div class="progress-header__text">
            <h2 class="progress-header__title">Mi Progreso Académico</h2>
            <p class="progress-header__subtitle">Maestría en Control Gubernamental</p>
            <p v-if="selectedStudentUserId" class="progress-header__hint">
              StudentUserId seleccionado: <b>{{ selectedStudentUserId }}</b>
            </p>
          </div>
        </div>

        <!-- Chart + Filters -->
        <div class="progress-grid">
          <!-- Chart (Apex) -->
          <div class="progress-panel">
            <div class="panelHead">
              <h3 class="panelHead__title">Progreso</h3>
              <p class="panelHead__desc">Créditos aprobados vs total</p>
            </div>

            <apexchart height="280" type="radialBar" :options="apexProgressOptions" :series="apexProgressSeries" />

            <div class="panelMeta">
              <div class="panelMeta__row">
                <span class="k">Aprobados</span>
                <span class="v">{{ progress.completedCredits }}</span>
              </div>
              <div class="panelMeta__row">
                <span class="k">Total</span>
                <span class="v">{{ progress.totalCredits }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Cards -->
          <div class="progress-cards">
            <div class="pCard pCard--purple">
              <div class="pCard__top">
                <div class="pCard__icon"><AppIcon icon="book-open" /></div>
                <span class="pCard__title">Créditos Totales</span>
              </div>
              <div class="pCard__value">{{ progress.totalCredits }}</div>
            </div>

            <div class="pCard pCard--blue">
              <div class="pCard__top">
                <div class="pCard__icon">
                  <AppIcon icon="chart-line" />
                </div>
                <span class="pCard__title">Créditos Cursados</span>
              </div>
              <div class="pCard__value">{{ progress.coursedCredits }}</div>
            </div>

            <div class="pCard pCard--green">
              <div class="pCard__top">
                <div class="pCard__icon"><AppIcon icon="award" /></div>
                <span class="pCard__title">Créditos Aprobados</span>
              </div>
              <div class="pCard__value">{{ progress.completedCredits }}</div>
            </div>

            <div class="pCard pCard--orange">
              <div class="pCard__top">
                <div class="pCard__icon"><AppIcon icon="graduation-cap" /></div>
                <span class="pCard__title">Promedio General</span>
              </div>
              <div class="pCard__value">
                {{ progress.averageGrade }}
                <span class="pCard__suffix">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Journey Path -->
        <div class="journey">
          <div class="journeyHead">
            <div>
              <h3 class="journeyHead__title">Tu Camino a la Graduación</h3>
              <p class="journeyHead__subtitle">Completa cada semestre para avanzar hacia tu título profesional</p>
            </div>

            <div class="journeyHead__pct">
              <span class="journeyHead__spark">✨</span>
              <span class="journeyHead__value">{{ progress.progressPercentage }}%</span>
            </div>
          </div>

          <!-- Desktop: horizontal -->
          <div class="journeyDesktop">
            <div class="journeyTrack">
              <div class="journeyTrack__bg"></div>
              <div class="journeyTrack__fg" :style="{ width: `${progress.progressPercentage}%` }"></div>

              <div class="journeyNodes">
                <div v-for="(m, index) in milestones" :key="m.id" class="journeyNode" :style="{ width: `${100 / (milestones.length + 1)}%` }">
                  <!-- etiqueta actual -->
                  <div v-if="m.status === 'en-curso'" class="journeyNode__tag">
                    Estás aquí
                    <span class="journeyNode__tagArrow"></span>
                  </div>

                  <div class="journeyNode__wrap">
                    <button type="button" class="journeyNode__dot" :class="journeyDotClass(m.status)" :title="milestoneTooltip(m)">
                      <AppIcon :icon="milestoneIcon(index)" />
                      <span v-if="m.status === 'bloqueado'" class="journeyNode__lock">🔒</span>
                    </button>
                  </div>

                  <div class="journeyNode__label">
                    <div class="journeyNode__name">{{ m.name }}</div>
                    <div class="journeyNode__meta">{{ m.completedCredits }} / {{ m.totalCredits }} créditos</div>
                  </div>
                </div>

                <!-- Nodo final: Graduación -->
                <div class="journeyNode journeyNode--graduation">
                  <div class="journeyNode__wrap">
                    <button type="button" class="journeyNode__dot journeyNode__dot--grad">
                      <AppIcon icon="graduation-cap" />
                    </button>
                  </div>
                  <div class="journeyNode__label">
                    <div class="journeyNode__name journeyNode__name--grad">Graduación</div>
                    <div class="journeyNode__meta">Meta final</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile: vertical -->
          <div class="journeyMobile">
            <div class="journeyV">
              <div class="journeyV__bg"></div>
              <div class="journeyV__fg" :style="{ height: `${progress.progressPercentage}%` }"></div>

              <div class="journeyV__list">
                <div v-for="(m, index) in milestones" :key="m.id" class="journeyRow">
                  <div class="journeyRow__left">
                    <div class="journeyRow__dot" :class="journeyDotClass(m.status)">
                      <AppIcon :icon="milestoneIcon(index)" />
                      <span v-if="m.status === 'bloqueado'" class="journeyRow__lock">🔒</span>
                    </div>
                  </div>

                  <div class="journeyRow__card">
                    <div class="journeyRow__top">
                      <div class="journeyRow__name">{{ m.name }}</div>
                      <span v-if="m.status === 'en-curso'" class="journeyRow__badgeCurrent">Actual</span>
                    </div>

                    <div class="journeyRow__meta">
                      <span>{{ m.completedCredits }} / {{ m.totalCredits }} créditos</span>
                      <span :class="journeyStatusTextClass(m.status)">
                        {{ journeyStatusLabel(m.status) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Graduación mobile -->
                <div class="journeyRow">
                  <div class="journeyRow__left">
                    <div class="journeyRow__dot journeyRow__dot--grad">
                      <AppIcon icon="graduation-cap" />
                    </div>
                  </div>

                  <div class="journeyRow__card journeyRow__card--grad">
                    <div class="journeyRow__name">🎓 Graduación</div>
                    <div class="journeyRow__meta">Tu meta final - ¡Sigue adelante!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leyenda -->
          <div class="journeyLegend">
            <div class="journeyLegend__item">
              <span class="journeyLegend__dot journeyLegend__dot--ok"></span>
              <span>Completado</span>
            </div>
            <div class="journeyLegend__item">
              <span class="journeyLegend__dot journeyLegend__dot--progress"></span>
              <span>En curso</span>
            </div>
            <div class="journeyLegend__item">
              <span class="journeyLegend__dot journeyLegend__dot--locked"></span>
              <span>Bloqueado</span>
            </div>
          </div>
        </div>
        <!-- Filters + Progress bar -->
        <div class="progress-panel progress-panel--wide">
          <div class="panelHead">
            <h3 class="panelHead__title">Filtros</h3>
            <p class="panelHead__desc">Filtra la malla por estado</p>
          </div>

          <div class="statusFilters">
            <button class="chip" :class="{ 'chip--active': statusFilter === 'todas' }" type="button" @click="statusFilter = 'todas'">Todas</button>
            <button class="chip" :class="{ 'chip--active': statusFilter === 'aprobada' }" type="button" @click="statusFilter = 'aprobada'">Aprobadas</button>
            <button class="chip" :class="{ 'chip--active': statusFilter === 'en-curso' }" type="button" @click="statusFilter = 'en-curso'">En curso</button>
            <button class="chip" :class="{ 'chip--active': statusFilter === 'reprobada' }" type="button" @click="statusFilter = 'reprobada'">Reprobadas</button>
            <button class="chip" :class="{ 'chip--active': statusFilter === 'pendiente' }" type="button" @click="statusFilter = 'pendiente'">Pendientes</button>
          </div>
        </div>
        <!-- Semesters / Malla -->
        <div class="malla">
          <h3 class="malla__title">Malla Curricular</h3>

          <AppAccordion styleType="rounded">
            <template #default="{ accordionId }">
              <AppAccordionItem v-for="(semester, idx) in filteredSemesters" :key="semester.id" :accordionId="accordionId" :initOpen="idx === 0">
                <template #head>
                  <div class="semHead">
                    <div class="semHead__left">
                      <span class="semHead__icon">
                        <AppIcon :icon="semesterIconName(semester.id)" />
                      </span>

                      <div class="semHead__text">
                        <span class="semHead__name">{{ semester.name }}</span>
                        <span class="semHead__meta">{{ semester.totalCredits }} créditos</span>
                      </div>
                    </div>

                    <div class="semHead__right">
                      <span class="badge badge--muted">
                        {{ semesterApprovedCredits(semester) }} /
                        {{ semester.totalCredits }}
                      </span>
                    </div>
                  </div>
                </template>

                <template #content>
                  <!-- ✅ Tabla PrimeVue dentro del accordion -->
                  <div class="semTable">
                    <DataTable
                      :value="semesterFilteredSubjects(semester)"
                      responsiveLayout="scroll"
                      :paginator="semesterFilteredSubjects(semester).length > 6"
                      :rows="6"
                      :rowsPerPageOptions="[6, 10, 20]"
                      dataKey="id"
                      class="p-datatable-sm"
                      :emptyMessage="'No hay materias con el filtro actual.'"
                    >
                      <Column field="name" header="MATERIA">
                        <template #body="{ data: row }">
                          <div class="cellMain">
                            <div class="cellMain__title">{{ row.name }}</div>
                            <div class="cellMain__sub">{{ row.credits }} créditos</div>
                          </div>
                        </template>
                      </Column>

                      <Column header="CRÉDITOS" style="width: 120px">
                        <template #body="{ data: row }">
                          <div class="tCenter tStrong">
                            {{ row.credits }}
                          </div>
                        </template>
                      </Column>

                      <Column header="NOTA" style="width: 120px">
                        <template #body="{ data: row }">
                          <div class="tCenter">
                            <span v-if="row.grade != null" class="tStrong">{{ row.grade }}</span>
                            <span v-else class="tMuted">—</span>
                          </div>
                        </template>
                      </Column>

                      <Column header="ESTADO" style="width: 160px">
                        <template #body="{ data: row }">
                          <div class="tRight">
                            <span class="badge" :class="subjectStatusBadge(row.status)">
                              {{ subjectStatusLabel(row.status) }}
                            </span>
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </div>
                </template>
              </AppAccordionItem>
            </template>
          </AppAccordion>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

/** ✅ PrimeVue */
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { useHeaderStore } from '../../../stores/header.store';

type SubjectStatus = 'aprobada' | 'reprobada' | 'en-curso' | 'pendiente';
type MilestoneStatus = 'completado' | 'en-curso' | 'bloqueado';
type Milestone = {
  id: string;
  name: string;
  semesterNumber: number;
  status: MilestoneStatus;
  completedCredits: number;
  totalCredits: number;
};
type Subject = {
  id: string;
  name: string;
  credits: number;
  grade?: number;
  status: SubjectStatus;
};

type Semester = {
  id: string;
  name: string;
  totalCredits: number;
  subjects: Subject[];
};

const TOTAL_CREDITS = 60;

const academicData: Semester[] = [
  {
    id: 'sem-1',
    name: 'Semestre 1',
    totalCredits: 15,
    subjects: [
      {
        id: 'm1-s1',
        name: 'Fundamentos',
        credits: 3,
        grade: 20,
        status: 'en-curso',
      },
      {
        id: 'm1-s2',
        name: 'Sistema Nacional de Control',
        credits: 3,
        grade: 16,
        status: 'en-curso',
      },
      {
        id: 'm1-s3',
        name: 'Gestión pública moderna',
        credits: 3,
        status: 'en-curso',
      },
      {
        id: 'm1-s4',
        name: 'Marco normativo del control',
        credits: 3,
        status: 'en-curso',
      },
      {
        id: 'm1-s5',
        name: 'Ética y responsabilidad pública',
        credits: 3,
        status: 'en-curso',
      },
    ],
  },
  {
    id: 'sem-2',
    name: 'Semestre 2',
    totalCredits: 15,
    subjects: [
      {
        id: 'm2-s1',
        name: 'Auditoría gubernamental',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm2-s2',
        name: 'Control interno y gestión de riesgos',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm2-s3',
        name: 'Sistemas administrativos del Estado',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm2-s4',
        name: 'Análisis financiero público',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm2-s5',
        name: 'Herramientas de control y supervisión',
        credits: 3,
        status: 'pendiente',
      },
    ],
  },
  {
    id: 'sem-3',
    name: 'Semestre 3',
    totalCredits: 15,
    subjects: [
      {
        id: 'm3-s1',
        name: 'Lucha contra la corrupción',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm3-s2',
        name: 'Servicios de control',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm3-s3',
        name: 'Gestión por resultados',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm3-s4',
        name: 'Innovación y mejora del control',
        credits: 3,
        status: 'pendiente',
      },
      {
        id: 'm3-s5',
        name: 'Transformación digital en el sector público',
        credits: 3,
        status: 'pendiente',
      },
    ],
  },
  {
    id: 'sem-4',
    name: 'Semestre 4',
    totalCredits: 15,
    subjects: [
      {
        id: 'm4-s1',
        name: 'Seminario de investigación',
        credits: 5,
        status: 'pendiente',
      },
      {
        id: 'm4-s2',
        name: 'Proyecto de mejora o tesis',
        credits: 5,
        status: 'pendiente',
      },
      {
        id: 'm4-s3',
        name: 'Taller de innovación en control gubernamental',
        credits: 3,
        status: 'pendiente',
      },
      // ✅ agregado para completar 15 créditos
      {
        id: 'm4-s4',
        name: 'Metodología de investigación',
        credits: 2,
        status: 'pendiente',
      },
    ],
  },
];

/** ✅ todo en flecha */
const calculateProgress = () => {
  let completedCredits = 0;
  let coursedCredits = 0;

  academicData.forEach((semester) => {
    semester.subjects.forEach((subject) => {
      if (subject.status === 'aprobada') {
        completedCredits += subject.credits;
        coursedCredits += subject.credits;
      } else if (subject.status === 'en-curso' || subject.status === 'reprobada') {
        coursedCredits += subject.credits;
      }
    });
  });

  const allGrades = academicData
    .flatMap((sem) => sem.subjects)
    .filter((s) => s.grade != null)
    .map((s) => s.grade as number);

  const averageGrade = allGrades.length > 0 ? allGrades.reduce((sum, g) => sum + g, 0) / allGrades.length : 0;

  return {
    totalCredits: TOTAL_CREDITS,
    completedCredits,
    coursedCredits,
    progressPercentage: Math.round((completedCredits / TOTAL_CREDITS) * 100),
    averageGrade: Math.round(averageGrade * 10) / 10,
  };
};

export default defineComponent({
  name: 'ProgressAcademicMock',
  components: {
    apexchart: VueApexCharts,
    DataTable,
    Column,

    AppBaseList,
    AppAccordion,
    AppAccordionItem,
    SelectionStudentsByParent,
    AppIcon,
  },
  setup() {
    const title = 'Mi Progreso Académico';
    const selectedStudentUserId = ref<number | null>(null);
    const statusFilter = ref<SubjectStatus | 'todas'>('todas');

    const progress = computed(() => calculateProgress());

    const apexProgressSeries = computed(() => [progress.value.progressPercentage]);

    const apexProgressOptions = computed(() => ({
      chart: { type: 'radialBar' },
      plotOptions: {
        radialBar: {
          hollow: { size: '62%' },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: '26px',
              fontWeight: 900,
              formatter: (val: number) => `${Math.round(val)}%`,
            },
          },
        },
      },
      stroke: { lineCap: 'round' },

      // 👇 si ya tienes --color-primary-rgb, puedes usarlo aquí también.
      // ApexCharts acepta color en string; si tu var existe, funciona perfecto.
      colors: ['var(--color-primary)'],
    }));
    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Salón de clases', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    const filteredSemesters = computed(() => {
      if (statusFilter.value === 'todas') return academicData;

      return academicData
        .map((s) => ({
          ...s,
          subjects: s.subjects.filter((x) => x.status === statusFilter.value),
        }))
        .filter((s) => s.subjects.length > 0);
    });

    /** ✅ helpers en flecha */
    const semesterFilteredSubjects = (semester: Semester) => {
      if (statusFilter.value === 'todas') return semester.subjects;
      return semester.subjects.filter((x) => x.status === statusFilter.value);
    };

    const semesterApprovedCredits = (semester: Semester) => {
      return semester.subjects.filter((s) => s.status === 'aprobada').reduce((acc, s) => acc + s.credits, 0);
    };

    const subjectStatusLabel = (s: SubjectStatus) => {
      if (s === 'aprobada') return 'Aprobada';
      if (s === 'reprobada') return 'Reprobada';
      if (s === 'en-curso') return 'En curso';
      return 'Pendiente';
    };

    const subjectStatusBadge = (s: SubjectStatus) => {
      return {
        'badge--ok': s === 'aprobada',
        'badge--warn': s === 'en-curso',
        'badge--bad': s === 'reprobada',
        'badge--muted': s === 'pendiente',
      };
    };

    const updateStudentUserId = (studentUserId: number) => {
      selectedStudentUserId.value = studentUserId ?? null;
    };

    const semesterIconName = (semesterId: string) => {
      const map: Record<string, string> = {
        'sem-1': 'book-open',
        'sem-2': 'clipboard-list',
        'sem-3': 'chart-line',
        'sem-4': 'graduation-cap',
      };
      return map[semesterId] || 'book-open';
    };

    const milestones = computed<Milestone[]>(() => {
      return academicData.map((semester, index) => {
        const completedCredits = semester.subjects.filter((s) => s.status === 'aprobada').reduce((sum, s) => sum + s.credits, 0);

        const hasInProgress = semester.subjects.some((s) => s.status === 'en-curso');
        const allPending = semester.subjects.every((s) => s.status === 'pendiente');
        const allCompleted = completedCredits === semester.totalCredits;

        let status: MilestoneStatus = 'bloqueado';
        if (allCompleted) status = 'completado';
        else if (hasInProgress || (!allCompleted && !allPending)) status = 'en-curso';
        else status = 'bloqueado';

        return {
          id: semester.id,
          name: semester.name,
          semesterNumber: index + 1,
          status,
          completedCredits,
          totalCredits: semester.totalCredits,
        };
      });
    });
    const milestoneIcon = (index: number) => {
      const icons = [
        'book-open', // sem 1
        'clipboard-list', // sem 2
        'chart-line', // sem 3
        'graduation-cap', // sem 4
      ];
      return icons[index] || 'book-open';
    };

    const journeyDotClass = (s: MilestoneStatus) => {
      return {
        'journeyNode__dot--ok': s === 'completado',
        'journeyNode__dot--progress': s === 'en-curso',
        'journeyNode__dot--locked': s === 'bloqueado',
      };
    };

    const journeyStatusLabel = (s: MilestoneStatus) => {
      if (s === 'completado') return '✓ Completado';
      if (s === 'en-curso') return 'En curso';
      return 'Bloqueado';
    };

    const journeyStatusTextClass = (s: MilestoneStatus) => {
      return {
        'journeyText--ok': s === 'completado',
        'journeyText--progress': s === 'en-curso',
        'journeyText--locked': s === 'bloqueado',
      };
    };

    const milestoneTooltip = (m: Milestone) => {
      const st = m.status === 'completado' ? 'Completado' : m.status === 'en-curso' ? 'En curso' : 'Bloqueado';
      return `${m.name} • ${st} • ${m.completedCredits}/${m.totalCredits} créditos`;
    };
    return {
      title,
      selectedStudentUserId,
      statusFilter,

      progress,
      apexProgressOptions,
      apexProgressSeries,

      filteredSemesters,
      semesterFilteredSubjects,
      semesterApprovedCredits,

      subjectStatusLabel,
      subjectStatusBadge,

      updateStudentUserId,
      semesterIconName,
      milestones,
      milestoneIcon,
      journeyDotClass,
      journeyStatusLabel,
      journeyStatusTextClass,
      milestoneTooltip,
    };
  },
});
</script>

<style scoped>
/* (dejé tus estilos y agregué solo lo mínimo para la tabla PrimeVue) */

.progress-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-header {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
}

.progress-header__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-header__icon :deep(i),
.progress-header__icon :deep(svg) {
  font-size: 20px;
}

.progress-header__title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}
.progress-header__subtitle {
  margin: 3px 0 0;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}
.progress-header__hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #334155;
  font-weight: 800;
}

.progress-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pCard {
  border-radius: 16px;
  padding: 14px 14px 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
}
.pCard__top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pCard__icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.pCard__title {
  font-size: 12px;
  font-weight: 900;
  color: #334155;
}
.pCard__value {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
}
.pCard__suffix {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

.pCard--purple .pCard__icon {
  background: #7c3aed;
}
.pCard--blue .pCard__icon {
  background: #2563eb;
}
.pCard--green .pCard__icon {
  background: #16a34a;
}
.pCard--orange .pCard__icon {
  background: #f97316;
}

.progress-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 1024px) {
  .progress-grid {
    grid-template-columns: 1fr 2fr;
  }
}

.progress-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
}

.progress-panel--wide {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panelHead__title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.panelHead__desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.panelMeta {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.panelMeta__row {
  display: flex;
  justify-content: space-between;
}
.panelMeta__row .k {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.panelMeta__row .v {
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
}

.statusFilters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-weight: 900;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 999px;
  cursor: pointer;
}
.chip--active {
  border-color: rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.08);
  color: var(--color-primary);
}

.careerProgress {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  background: #fff;
}
.careerProgress__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.careerProgress__title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.careerProgress__pct {
  font-size: 18px;
  font-weight: 900;
  color: var(--color-primary);
}
.careerProgress__bar {
  height: 14px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
  margin-top: 10px;
}
.careerProgress__barFill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #22c55e);
  border-radius: 999px;
  transition: width 800ms ease;
}
.careerProgress__bottom {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

.malla__title {
  margin-bottom: 1rem;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.semHead {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.semHead__name {
  font-weight: 900;
  color: #0f172a;
}
.semHead__meta {
  margin-left: 10px;
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

/* ✅ Tabla PrimeVue dentro del accordion */
.semTable {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}

/* pequeños ajustes visuales de celdas */
.cellMain__title {
  font-weight: 900;
  color: #0f172a;
}
.cellMain__sub {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.tCenter {
  text-align: center;
}
.tRight {
  text-align: right;
}
.tStrong {
  font-weight: 900;
  color: #0f172a;
}
.tMuted {
  color: #94a3b8;
  font-weight: 800;
}

/* badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid transparent;
}
.badge--ok {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge--warn {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}
.badge--bad {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.badge--muted {
  background: #f8fafc;
  color: #334155;
  border-color: #e2e8f0;
}
.semHead__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.semHead__icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.semHead__icon :deep(i),
.semHead__icon :deep(svg) {
  font-size: 16px;
}

.semHead__text {
  display: flex;
  flex-direction: column;
}
/* =========================
   Journey Path (Tu Camino a la Graduación)
========================= */

.journey {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
}

.journeyHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.journeyHead__title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

.journeyHead__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.journeyHead__pct {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.journeyHead__spark {
  font-size: 16px;
}

.journeyHead__value {
  font-size: 20px;
  font-weight: 1000;
  background: linear-gradient(90deg, var(--color-primary), #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Desktop vs Mobile */
.journeyDesktop {
  display: none;
}
.journeyMobile {
  display: block;
}

@media (min-width: 1024px) {
  .journeyDesktop {
    display: block;
  }
  .journeyMobile {
    display: none;
  }
}

/* Horizontal track */
.journeyTrack {
  position: relative;
  padding: 18px 8px 10px;
}

.journeyTrack__bg {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 44px;
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
}

.journeyTrack__fg {
  position: absolute;
  left: 8px;
  top: 44px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #22c55e, #3b82f6, #7c3aed);
  transition: width 700ms ease;
}

.journeyNodes {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0;
}

.journeyNode {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.journeyNode__wrap {
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.journeyNode__dot {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 0;
  cursor: default;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10px 20px rgba(2, 6, 23, 0.08);
  outline: none;
}

.journeyNode__dot :deep(i),
.journeyNode__dot :deep(svg) {
  font-size: 18px;
}

.journeyNode__dot--ok {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: #fff;
  box-shadow: 0 14px 26px rgba(16, 185, 129, 0.25);
}

.journeyNode__dot--progress {
  background: linear-gradient(135deg, #60a5fa, var(--color-primary));
  color: #fff;
  box-shadow: 0 14px 26px rgba(37, 99, 235, 0.25);
}

.journeyNode__dot--locked {
  background: #e5e7eb;
  color: #94a3b8;
  box-shadow: 0 10px 20px rgba(148, 163, 184, 0.2);
}

.journeyNode__lock {
  position: absolute;
  right: -6px;
  bottom: -6px;
  background: #fff;
  border-radius: 999px;
  padding: 2px 5px;
  font-size: 10px;
  border: 1px solid #e2e8f0;
}

.journeyNode__tag {
  position: absolute;
  top: -6px;
  transform: translateY(-100%);
  background: var(--color-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  padding: 5px 10px;
  border-radius: 999px;
  box-shadow: 0 14px 26px rgba(37, 99, 235, 0.25);
  white-space: nowrap;
}

.journeyNode__tagArrow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 100%;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--color-primary);
}

.journeyNode__label {
  margin-top: 6px;
  text-align: center;
  padding: 0 6px;
}

.journeyNode__name {
  font-size: 11px;
  font-weight: 900;
  color: #334155;
  line-height: 1.1;
}

.journeyNode__meta {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
}

/* Graduation node */
.journeyNode--graduation .journeyNode__dot--grad,
.journeyNode__dot--grad {
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, #fbbf24, #fb7185);
  color: #fff;
  box-shadow: 0 18px 34px rgba(251, 113, 133, 0.25);
}

.journeyNode__name--grad {
  background: linear-gradient(90deg, #ea580c, #dc2626);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Mobile vertical */
.journeyV {
  position: relative;
  padding-left: 18px;
}

.journeyV__bg {
  position: absolute;
  left: 28px;
  top: 0;
  bottom: 0;
  width: 6px;
  border-radius: 999px;
  background: #e5e7eb;
}

.journeyV__fg {
  position: absolute;
  left: 28px;
  top: 0;
  width: 6px;
  border-radius: 999px;
  background: linear-gradient(180deg, #22c55e, #3b82f6, #7c3aed);
  transition: height 700ms ease;
}

.journeyV__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0 8px 0;
}

.journeyRow {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 10px;
  align-items: center;
  position: relative;
}

.journeyRow__left {
  display: flex;
  justify-content: center;
}

.journeyRow__dot {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.journeyRow__dot :deep(i),
.journeyRow__dot :deep(svg) {
  font-size: 18px;
}

.journeyRow__dot.journeyNode__dot--ok {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: #fff;
}
.journeyRow__dot.journeyNode__dot--progress {
  background: linear-gradient(135deg, #60a5fa, var(--color-primary));
  color: #fff;
}
.journeyRow__dot.journeyNode__dot--locked {
  background: #e5e7eb;
  color: #94a3b8;
}

.journeyRow__dot--grad {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #fbbf24, #fb7185);
  color: #fff;
}

.journeyRow__lock {
  position: absolute;
  right: -6px;
  bottom: -6px;
  background: #fff;
  border-radius: 999px;
  padding: 2px 5px;
  font-size: 10px;
  border: 1px solid #e2e8f0;
}

.journeyRow__card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
}

.journeyRow__card--grad {
  background: linear-gradient(90deg, #fff7ed, #fef2f2);
  border: 2px solid rgba(251, 146, 60, 0.25);
}

.journeyRow__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.journeyRow__name {
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
}

.journeyRow__badgeCurrent {
  background: var(--color-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 999px;
}

.journeyRow__meta {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}

/* status text colors */
.journeyText--ok {
  color: #047857;
}
.journeyText--progress {
  color: var(--color-primary);
}
.journeyText--locked {
  color: #94a3b8;
}

/* Legend */
.journeyLegend {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}

.journeyLegend__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.journeyLegend__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.journeyLegend__dot--ok {
  background: linear-gradient(135deg, #34d399, #16a34a);
}

.journeyLegend__dot--progress {
  background: linear-gradient(135deg, #60a5fa, var(--color-primary));
}

.journeyLegend__dot--locked {
  background: #e5e7eb;
}
</style>
