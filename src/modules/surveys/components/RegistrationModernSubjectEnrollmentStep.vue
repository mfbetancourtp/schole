<template>
  <!-- Confirmation state -->
  <div v-if="confirmed" class="sej-confirmed">
    <div class="sej-confirmed__iconWrap">
      <div class="sej-confirmed__iconPing"></div>
      <div class="sej-confirmed__icon">
        <AppIcon icon="check-circle" />
      </div>
    </div>
    <h2 class="sej-confirmed__title">¡Matrícula Confirmada!</h2>
    <p class="sej-confirmed__subtitle">Tu matrícula se ha procesado exitosamente.</p>

    <div class="sej-confirmed__stats">
      <div class="sej-confirmed__stat sej-confirmed__stat--blue">
        <p>Total de asignaturas</p>
        <strong>{{ selectedCourses.length }}</strong>
      </div>
      <div class="sej-confirmed__stat sej-confirmed__stat--green">
        <p>Total de créditos</p>
        <strong>{{ totalCredits }}</strong>
      </div>
    </div>

    <div class="sej-confirmed__courseList">
      <h3>Asignaturas matriculadas</h3>
      <div v-for="sc in selectedCourses" :key="sc.code" class="sej-confirmed__course">
        <div class="sej-confirmed__courseLeft">
          <span class="sej-confirmed__courseCode">{{ sc.code }}</span>
          <span class="sej-confirmed__courseName">{{ sc.name }}</span>
          <p class="sej-confirmed__courseGroup">Grupo: {{ sc.groupCode }}</p>
        </div>
        <div class="sej-confirmed__courseCredits">
          <span>{{ sc.credits }}</span>
          <small>créditos</small>
        </div>
      </div>
    </div>

    <div class="sej-confirmed__actions">
      <button class="sej-confirmed__btnPrimary" @click="downloadReceipt"><AppIcon icon="download" class="me-2" /> Descargar comprobante</button>
      <button class="sej-confirmed__btnSecondary" @click="confirmed = false"><AppIcon icon="calendar-alt" class="me-2" /> Ver horario</button>
    </div>
  </div>

  <AppLoading v-else-if="loading" />

  <div v-else class="sej">
    <!-- Student Info Bar -->
    <section class="sej__stats">
      <AppStatCard v-for="card in statsCards" :key="card.label" :label="card.label" :value="card.value" :icon="card.icon" :variant="card.variant" value-size="xs" />
    </section>

    <!-- Main layout -->
    <div class="sej__layout">
      <!-- Left: Courses area -->
      <div class="sej__main">
        <!-- Academic load indicator -->
        <div v-if="totalCredits > 0" class="sej__loadBadge">
          <span class="sej__loadBadgeLabel">Carga académica</span>
          <span :class="['sej__loadChip', `sej__loadChip--${loadLevel}`]">{{ loadLabel }}</span>
          <p v-if="totalCredits >= 16 && totalCredits <= 18" class="sej__loadTip"><AppIcon icon="check" /> Te sugerimos 16–18 créditos para un balance óptimo</p>
        </div>

        <!-- Search -->
        <div class="sej__search">
          <AppIcon icon="search" class="sej__searchIcon" />
          <input v-model="searchQuery" type="text" placeholder="Buscar asignatura o código..." class="sej__searchInput" />
        </div>

        <!-- Course list -->
        <div class="sej__courses">
          <template v-if="filteredCourses.length > 0">
            <article
              v-for="course in filteredCourses"
              :key="course.code"
              :class="[
                'sej__course',
                course.isRecommended && 'sej__course--recommended',
                isCourseSelected(course.code) && 'sej__course--selected',
                course.status === 'prerequisite' && 'sej__course--blocked',
              ]"
            >
              <div class="sej__courseBody">
                <div class="sej__courseTop">
                  <span v-if="course.isRecommended" class="sej__recommendBadge"> <AppIcon icon="star" /> Recomendado </span>
                  <span class="sej__courseCode">{{ course.code }}</span>
                </div>
                <h4 class="sej__courseName">{{ course.name }}</h4>
                <div class="sej__courseMeta">
                  <span class="sej__courseCredits"
                    >Créditos: <strong>{{ course.credits }}</strong></span
                  >
                  <span :class="['sej__courseStatus', `sej__courseStatus--${courseStatusTone(course)}`]">
                    <AppIcon v-if="courseStatusIcon(course)" :icon="courseStatusIcon(course)" />
                    {{ courseStatusLabel(course) }}
                  </span>
                </div>
              </div>
              <div class="sej__courseActions">
                <button v-if="!isCourseSelected(course.code) && course.status === 'available'" class="sej__btnSecondary" @click="openPanel(course)">Ver grupos</button>
              </div>
            </article>
          </template>

          <div v-else class="sej__coursesEmpty">
            <div class="sej__coursesEmptyIcon">
              <span>📚</span>
            </div>
            <p>{{ emptyMessage }}</p>
            <small v-if="activeTab === 'retake'">¡Excelente! Continúa con tu plan académico regular</small>
          </div>
        </div>

        <!-- Schedule grid -->
        <div v-if="selectedCourses.length > 0" class="sej__scheduleSection">
          <h3 class="sej__scheduleTitle">Horario Semanal</h3>
          <div class="sej__scheduleGrid">
            <div class="sej__scheduleHeader">
              <div class="sej__scheduleTimeCol"></div>
              <div v-for="day in dayLabels" :key="day" class="sej__scheduleDay">
                {{ day }}
              </div>
            </div>
            <div v-for="hour in scheduleHours" :key="hour" class="sej__scheduleRow">
              <div class="sej__scheduleTime">{{ hour }}:00</div>
              <div v-for="(_, dIdx) in dayLabels" :key="dIdx" class="sej__scheduleCell">
                <div v-for="block in blocksAt(dIdx, hour)" :key="block.id" class="sej__scheduleBlock" :style="{ backgroundColor: block.color }">
                  {{ block.code }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Summary sidebar -->
      <aside class="sej__sidebar">
        <div class="sej__sidebarHead">
          <h3>Resumen de Matrícula</h3>
          <p>
            {{ selectedCourses.length }}
            {{ selectedCourses.length === 1 ? 'asignatura' : 'asignaturas' }}
            seleccionadas
          </p>
        </div>

        <div class="sej__sidebarBody">
          <!-- Credits summary -->
          <div class="sej__creditsCard">
            <div class="sej__creditsCardHead">
              <AppIcon icon="chart-line" />
              <span>Total de créditos</span>
            </div>
            <div class="sej__creditsDisplay">
              <span :class="['sej__creditsMain', creditsValid ? 'sej__creditsMain--ok' : totalCredits > stepInfo.maxCredits ? 'sej__creditsMain--over' : 'sej__creditsMain--low']">{{
                totalCredits
              }}</span>
              <span class="sej__creditsDivider">/ {{ stepInfo.maxCredits }}</span>
            </div>
            <div class="sej__creditsProgress">
              <div :class="['sej__creditsBar', creditsBarClass]" :style="{ width: `${Math.min(creditsPct, 100)}%` }"></div>
            </div>
            <p class="sej__creditsRange">
              Rango permitido:
              <strong>{{ stepInfo.minCredits }} – {{ stepInfo.maxCredits }}</strong>
              créditos
            </p>
          </div>

          <!-- Alerts -->
          <div v-if="alerts.length" class="sej__alertList">
            <div v-for="(alert, i) in alerts" :key="i" class="sej__alert">
              <AppIcon icon="exclamation-triangle" />
              <p>{{ alert }}</p>
            </div>
          </div>

          <!-- Selected courses list -->
          <div class="sej__selectedList">
            <div v-if="selectedCourses.length === 0" class="sej__selectedEmpty">
              <div class="sej__selectedEmptyIcon"><span>📚</span></div>
              <p>No has seleccionado ninguna asignatura</p>
              <small>Comienza agregando asignaturas</small>
            </div>
            <div v-else v-for="sc in selectedCourses" :key="sc.code" class="sej__selectedItem">
              <div class="sej__selectedStripe" :style="{ backgroundColor: sc.color }"></div>
              <div class="sej__selectedInfo">
                <div class="sej__selectedHeader">
                  <strong>{{ sc.code }}</strong>
                  <span class="sej__selectedCreditPill">{{ sc.credits }} cr</span>
                </div>
                <span class="sej__selectedName">{{ sc.name }}</span>

                <div class="sej__selectedDetail">
                  <p class="sej__selectedProfessor"><AppIcon icon="user" /> {{ sc.professor }}</p>

                  <div v-if="sc.theoricalHours > 0 || sc.practicalHours > 0" class="sej__selectedHours">
                    <span v-if="sc.theoricalHours > 0" class="sej__selectedHourChip sej__selectedHourChip--indigo"> {{ sc.theoricalHours }}h teór. </span>
                    <span v-if="sc.practicalHours > 0" class="sej__selectedHourChip sej__selectedHourChip--green"> {{ sc.practicalHours }}h práct. </span>
                  </div>

                  <div v-for="(s, i) in sc.scheduleDetails" :key="i" class="sej__selectedScheduleRow">
                    <span class="sej__selectedScheduleDay">{{ s.day }}</span>
                    <span>{{ s.timeSlot }}</span>
                    <span class="sej__selectedRoom"><AppIcon icon="door-open" /> {{ s.roomName }}</span>
                  </div>
                </div>

                <div class="sej__selectedGroup">Grupo: {{ sc.groupCode }}</div>
              </div>
              <button class="sej__selectedRemove" @click="removeCourse(sc.code)">
                <AppIcon icon="times" />
              </button>
            </div>
          </div>

          <!-- Confirm button -->
          <!-- <button :class="['sej__confirmBtn', canConfirm && 'sej__confirmBtn--active']" :disabled="!canConfirm" @click="confirmEnrollment">
            <AppIcon v-if="canConfirm" icon="check-circle" class="me-2" />
            Confirmar matrícula
          </button> -->
          <p v-if="!canConfirm && selectedCourses.length > 0" class="sej__confirmHint">Resuelve las alertas para continuar</p>
        </div>
      </aside>
    </div>

    <!-- Group selection drawer -->
    <AppDrawer v-model:is-visible="drawerVisible" size="md">
      <template #head>
        <AppDrawerHeader v-if="panelCourse" variant="view" icon="graduation-cap" :title="panelCourse.name" :subtitle="panelCourse.code" />
      </template>

      <template #body>
        <div class="sej__panelBody">
          <AppLoading v-if="loadingEnrollment" />

          <template v-else-if="panelCourse">
            <div v-if="enrollmentError" class="sej__enrollError">
              <AppIcon icon="times-circle" />
              <span>{{ enrollmentError }}</span>
            </div>

            <div v-if="panelCourse.groups.length === 0" class="sej__groupsEmpty">
              <div class="sej__groupsEmptyIcon">
                <AppIcon icon="calendar-times" />
              </div>
              <p>No hay grupos con horario disponible</p>
              <small>Esta asignatura aún no tiene grupos asignados para este período. Consulta con tu coordinador académico.</small>
            </div>

            <!-- Subject info banner (same for all groups) -->
            <div v-if="panelCourse.groups.length > 0" class="sej__subjectInfo">
              <div v-if="panelCourse.groups[0].description" class="sej__subjectDesc">
                <AppIcon icon="info-circle" />
                <span>{{ panelCourse.groups[0].description }}</span>
              </div>
              <div class="sej__subjectMeta">
                <span class="sej__subjectMetaChip sej__subjectMetaChip--blue"> <AppIcon icon="book" /> {{ panelCourse.credits }} crédito{{ panelCourse.credits !== 1 ? 's' : '' }} </span>
                <span v-if="panelCourse.groups[0].theoricalHours > 0" class="sej__subjectMetaChip sej__subjectMetaChip--indigo">
                  <AppIcon icon="chalkboard-teacher" />
                  {{ panelCourse.groups[0].theoricalHours }}h teóricas
                </span>
                <span v-if="panelCourse.groups[0].practicalHours > 0" class="sej__subjectMetaChip sej__subjectMetaChip--green">
                  <AppIcon icon="flask" />
                  {{ panelCourse.groups[0].practicalHours }}h prácticas
                </span>
              </div>
            </div>

            <div v-for="group in panelCourse.groups" :key="group.groupCode" :class="['sej__group', group.availableSpots === 0 && 'sej__group--full']">
              <!-- Group header -->
              <div class="sej__groupTop">
                <div class="sej__groupInfo">
                  <h4>{{ group.groupCode }}</h4>
                  <p class="sej__groupProfessor"><AppIcon icon="user" /> {{ group.professor }}</p>
                  <p v-if="group.teacherEmail && group.teacherEmail !== '—'" class="sej__groupEmail"><AppIcon icon="envelope" /> {{ group.teacherEmail }}</p>
                </div>
                <div :class="['sej__groupSpots', spotsColorClass(group)]">
                  <AppIcon icon="users" />
                  <span>{{ group.availableSpots }}/{{ group.totalSpots }}</span>
                  <span class="sej__groupSpotsLabel">
                    {{ group.availableSpots === 0 ? 'Lleno' : group.availableSpots < 10 ? 'Pocos cupos' : 'Disponible' }}
                  </span>
                </div>
              </div>

              <!-- Schedule detail table -->
              <div v-if="group.scheduleDetails.length > 0" class="sej__scheduleTable">
                <div class="sej__scheduleTableHead">
                  <span>Día</span>
                  <span>Horario</span>
                  <span>Salón</span>
                  <span>Tipo</span>
                </div>
                <div v-for="(s, i) in group.scheduleDetails" :key="i" class="sej__scheduleTableRow">
                  <span class="sej__scheduleDay">{{ s.day }}</span>
                  <span><AppIcon icon="clock" /> {{ s.timeSlot }}</span>
                  <span><AppIcon icon="door-open" /> {{ s.roomName }}</span>
                  <span class="sej__scheduleRoomType">{{ s.roomType }}</span>
                </div>
              </div>
              <div v-else class="sej__groupSchedule"><AppIcon icon="clock" /> {{ group.schedule }}</div>

              <button :class="['sej__btnSelect', group.availableSpots > 0 && 'sej__btnSelect--active']" :disabled="group.availableSpots === 0" @click="selectGroup(group)">
                {{ group.availableSpots === 0 ? 'Grupo lleno' : 'Seleccionar grupo' }}
              </button>
            </div>
          </template>
        </div>
      </template>

      <template #footer>
        <AppButton variant="secondary" outlined @click="closePanel">Cancelar</AppButton>
      </template>
    </AppDrawer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import { GetConvocationEnrollDetailsService } from '../services/getConvocationEnrollDetails.service';
import { GetEnrollmentSubjectSelectionService } from '../services/getEnrollmentSubjectSelection.service';
import { GetOfferingSectionsByPeriodSubjectService } from '../services/getOfferingSectionsByPeriodSubject.service';
import { PostMatriculateFromConvocationSingleSubjectService } from '../services/postMatriculateFromConvocationSingleSubject.service';
import { DeleteMatriculateSubjectEnrollmentSelectionService } from '../services/deleteMatriculateSubjectEnrollmentSelection.service';

const getConvocationEnrollDetailsService = new GetConvocationEnrollDetailsService();
const getEnrollmentSubjectSelectionService = new GetEnrollmentSubjectSelectionService();
const getOfferingSectionsByPeriodSubjectService = new GetOfferingSectionsByPeriodSubjectService();
const postMatriculateFromConvocationSingleSubjectService = new PostMatriculateFromConvocationSingleSubjectService();
const deleteMatriculateSubjectEnrollmentSelectionService = new DeleteMatriculateSubjectEnrollmentSelectionService();

interface ScheduleDetail {
  day: string;
  timeSlot: string;
  roomName: string;
  roomType: string;
}

interface CourseGroup {
  groupCode: string;
  professor: string;
  teacherEmail: string;
  schedule: string;
  availableSpots: number;
  totalSpots: number;
  theoricalHours: number;
  practicalHours: number;
  days: number[];
  startHour: number;
  endHour: number;
  curriculumOfferingSubjectId: number;
  description: string;
  scheduleDetails: ScheduleDetail[];
}

interface AvailableCourse {
  code: string;
  name: string;
  credits: number;
  status: 'available' | 'approved' | 'prerequisite';
  category: 'recommended' | 'required' | 'elective' | 'retake';
  isRecommended?: boolean;
  groups?: CourseGroup[];
  periodSubjectId: number;
}

interface SelectedCourse {
  code: string;
  name: string;
  credits: number;
  groupCode: string;
  color: string;
  days: number[];
  startHour: number;
  endHour: number;
  professor: string;
  matriculateSubjectId: number;
  theoricalHours: number;
  practicalHours: number;
  scheduleDetails: ScheduleDetail[];
}

interface PanelCourse extends AvailableCourse {
  groups: CourseGroup[];
}

interface SubjectEnrollmentStatCard {
  label: string;
  value: string | number;
  icon: string;
  variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'white';
}

const COURSE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6'];

const DAY_MAP: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
};

const DAY_ES: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
};

const mapSchedules = (schedules: any[]) => {
  const days = [...new Set(schedules.map((s) => DAY_MAP[s.day]).filter((d) => d !== undefined))];
  const startHour = schedules.length ? parseInt(schedules[0].startTime.split(':')[0], 10) : 0;
  const endHour = schedules.length ? parseInt(schedules[0].endTime.split(':')[0], 10) : 0;
  const schedule = schedules.map((s) => `${s.day.slice(0, 3)} ${s.timeSlot ?? `${s.startTime}-${s.endTime}`}`).join(', ') || '—';
  return { days, startHour, endHour, schedule };
};

const parseRouteId = (param: unknown) => Number.parseInt(String(param ?? 0), 10) || 0;

export default defineComponent({
  name: 'RegistrationModernSubjectEnrollmentStep',
  components: {
    AppButton,
    AppDrawer,
    AppDrawerHeader,
    AppIcon,
    AppLoading,
    AppStatCard,
  },
  props: {
    embedded: { type: Boolean, default: true },
    videoUrl: { type: String, default: '' },
    stepId: { type: Number, default: 0 },
    convocationId: { type: Number, default: 0 },
    convocationEnrolId: { type: Number, default: 0 },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const route = useRoute();

    const loading = ref(true);
    const confirmed = ref(false);
    const searchQuery = ref('');
    const activeTab = ref<'recommended' | 'required' | 'elective' | 'retake'>('recommended');
    const availableCourses: Ref<AvailableCourse[]> = ref([]);
    const selectedCourses: Ref<SelectedCourse[]> = ref([]);
    const panelCourse: Ref<PanelCourse | null> = ref(null);
    const loadingCourseCode = ref<string | null>(null);
    const drawerVisible = ref(false);
    const loadingEnrollment = ref(false);
    const enrollmentError = ref('');

    const stepInfo = ref({
      program: '',
      semesterName: '',
      minCredits: 1,
      maxCredits: 0,
    });

    const curriculumOfferingId = ref(0);
    const curriculumPeriodId = ref(0);

    const resolvedConvocationEnrolId = computed(() => props.convocationEnrolId || parseRouteId(route.params.convocationEnrollId ?? route.query.convocationEnrollId));

    // ── Computed ────────────────────────────────────────────────────────────────

    const totalCredits = computed(() => selectedCourses.value.reduce((sum, c) => sum + c.credits, 0));

    const creditsValid = computed(() => totalCredits.value >= stepInfo.value.minCredits && totalCredits.value <= stepInfo.value.maxCredits);

    const creditsPct = computed(() => (stepInfo.value.maxCredits > 0 ? Math.min((totalCredits.value / stepInfo.value.maxCredits) * 100, 100) : 0));

    const creditsBarClass = computed(() => {
      if (creditsValid.value) return 'sej__creditsBar--ok';
      if (totalCredits.value > stepInfo.value.maxCredits) return 'sej__creditsBar--over';
      return 'sej__creditsBar--low';
    });

    const statsCards = computed<SubjectEnrollmentStatCard[]>(() => [
      {
        label: 'Programa',
        value: stepInfo.value.program || '—',
        icon: 'graduation-cap',
        variant: 'blue',
      },
      {
        label: 'Semestre sugerido',
        value: stepInfo.value.semesterName || '—',
        icon: 'calendar-alt',
        variant: 'gray',
      },
      {
        label: 'Total créditos',
        value: stepInfo.value.maxCredits,
        icon: 'book-open',
        variant: 'blue',
      },
      {
        label: 'Créditos seleccionados',
        value: `${totalCredits.value} / ${stepInfo.value.maxCredits}`,
        icon: 'chart-line',
        variant: creditsValid.value ? 'green' : totalCredits.value > stepInfo.value.maxCredits ? 'red' : 'yellow',
      },
    ]);

    const loadLevel = computed(() => {
      if (totalCredits.value < 14) return 'low';
      if (totalCredits.value <= 17) return 'medium';
      return 'high';
    });

    const loadLabel = computed(() => {
      if (totalCredits.value < 14) return 'Baja';
      if (totalCredits.value <= 17) return 'Media';
      return 'Alta';
    });

    const scheduleConflicts = computed(() => {
      const conflicts: string[] = [];
      const list = selectedCourses.value;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          const overlap = a.days.some((d) => b.days.includes(d)) && !(a.endHour <= b.startHour || a.startHour >= b.endHour);
          if (overlap) conflicts.push(`${a.code} y ${b.code} tienen cruce de horario`);
        }
      }
      return conflicts;
    });

    const alerts = computed(() => {
      const list = [...scheduleConflicts.value];
      if (totalCredits.value > stepInfo.value.maxCredits) list.push(`Excedes el límite de créditos (${totalCredits.value}/${stepInfo.value.maxCredits})`);
      if (totalCredits.value < stepInfo.value.minCredits && selectedCourses.value.length > 0) list.push(`Necesitas al menos ${stepInfo.value.minCredits} créditos`);
      return list;
    });

    const canConfirm = computed(() => alerts.value.length === 0 && creditsValid.value && selectedCourses.value.length > 0);

    const tabs: {
      key: 'recommended' | 'required' | 'elective' | 'retake';
      label: string;
    }[] = [{ key: 'recommended', label: 'Recomendadas' }];

    const filteredCourses = computed(() => {
      const q = searchQuery.value.toLowerCase().trim();
      return availableCourses.value.filter((c) => {
        const matchesTab = c.category === activeTab.value;
        const matchesSearch = !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
        return matchesTab && matchesSearch;
      });
    });

    const emptyMessage = computed(() => {
      if (activeTab.value === 'retake') return 'No tienes asignaturas para repetir';
      if (searchQuery.value) return 'No se encontraron asignaturas con ese criterio';
      return 'No hay asignaturas disponibles en esta categoría';
    });

    // ── Schedule grid ────────────────────────────────────────────────────────────

    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const scheduleHours = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00–19:00

    const blocksAt = (dayIdx: number, hour: number) => {
      const blocks: { id: string; code: string; color: string }[] = [];
      selectedCourses.value.forEach((c) => {
        if (c.days.includes(dayIdx) && hour >= c.startHour && hour < c.endHour) {
          blocks.push({
            id: `${c.code}-${dayIdx}-${hour}`,
            code: c.code,
            color: c.color,
          });
        }
      });
      return blocks;
    };

    // ── Course status helpers ────────────────────────────────────────────────────

    const isCourseSelected = (code: string) => selectedCourses.value.some((c) => c.code === code);

    const courseStatusLabel = (course: AvailableCourse) => {
      if (isCourseSelected(course.code)) return 'Seleccionada';
      if (course.status === 'approved') return 'Aprobada';
      if (course.status === 'prerequisite') return 'Requiere prerrequisito';
      return 'Disponible';
    };

    const courseStatusTone = (course: AvailableCourse) => {
      if (isCourseSelected(course.code)) return 'selected';
      if (course.status === 'approved') return 'approved';
      if (course.status === 'prerequisite') return 'prerequisite';
      return 'available';
    };

    const courseStatusIcon = (course: AvailableCourse) => {
      if (isCourseSelected(course.code)) return 'check';
      if (course.status === 'approved') return 'check';
      if (course.status === 'prerequisite') return 'exclamation-circle';
      return '';
    };

    // ── Group panel ──────────────────────────────────────────────────────────────

    const spotsColorClass = (group: CourseGroup) => {
      const pct = (group.availableSpots / group.totalSpots) * 100;
      if (pct === 0) return 'sej__groupSpots--full';
      if (pct < 30) return 'sej__groupSpots--low';
      return 'sej__groupSpots--ok';
    };

    const openPanel = async (course: AvailableCourse) => {
      loadingCourseCode.value = course.code;
      enrollmentError.value = '';
      try {
        const response = await getOfferingSectionsByPeriodSubjectService.run(course.periodSubjectId, curriculumOfferingId.value);
        panelCourse.value = {
          ...course,
          groups: mapOfferingSectionsToGroups(response.data ?? []),
        };
        drawerVisible.value = true;
      } catch (err) {
        console.error('[SubjectEnrollment] openPanel', err);
        panelCourse.value = { ...course, groups: [] };
        drawerVisible.value = true;
      } finally {
        loadingCourseCode.value = null;
      }
    };

    const closePanel = () => {
      drawerVisible.value = false;
      panelCourse.value = null;
      enrollmentError.value = '';
    };

    const selectGroup = async (group: CourseGroup) => {
      if (!panelCourse.value) return;

      loadingEnrollment.value = true;
      enrollmentError.value = '';

      try {
        await postMatriculateFromConvocationSingleSubjectService.run({
          convocationEnrollId: resolvedConvocationEnrolId.value,
          curriculumOfferingSubjectId: group.curriculumOfferingSubjectId,
        });

        const course = panelCourse.value;
        const alreadyIdx = selectedCourses.value.findIndex((c) => c.code === course.code);
        if (alreadyIdx >= 0) selectedCourses.value.splice(alreadyIdx, 1);

        await reloadSelectedSubjects();
        await loadCourses();
        closePanel();
      } catch (err) {
        console.error('[SubjectEnrollment] selectGroup', err);
        enrollmentError.value = 'No fue posible matricular en este grupo. Intenta nuevamente.';
      } finally {
        loadingEnrollment.value = false;
      }
    };

    const removeCourse = async (code: string) => {
      const course = selectedCourses.value.find((c) => c.code === code);
      if (!course?.matriculateSubjectId) {
        selectedCourses.value = selectedCourses.value.filter((c) => c.code !== code);
        return;
      }
      try {
        await deleteMatriculateSubjectEnrollmentSelectionService.run(course.matriculateSubjectId);
        await reloadSelectedSubjects();
      } catch (err) {
        console.error('[SubjectEnrollment] removeCourse', err);
      }
    };

    // ── Confirm ──────────────────────────────────────────────────────────────────

    const confirmEnrollment = () => {
      if (!canConfirm.value) return;
      confirmed.value = true;
      emit('refresh');
    };

    const downloadReceipt = () => {
      // TODO: integrate receipt download service
      console.log('Download receipt');
    };

    // ── Load data ────────────────────────────────────────────────────────────────

    const mapApiSubjectsToCourses = (items: any[]): AvailableCourse[] => {
      return items.map((item) => ({
        code: item.subject.code,
        name: item.subject.name,
        credits: item.subject.credits,
        status: (item.isAvailable ? 'available' : 'prerequisite') as AvailableCourse['status'],
        category: activeTab.value,
        isRecommended: activeTab.value === 'recommended',
        periodSubjectId: item.id,
        groups: [],
      }));
    };

    const mapOfferingSectionsToGroups = (items: any[]): CourseGroup[] => {
      return items.map((item) => {
        const capacity = item.offeringSection?.capacity ?? 0;
        const enrolled = item.enrolledCount ?? 0;
        const availableSpots = capacity > 0 ? Math.max(0, capacity - enrolled) : 0;
        const names = item.teacher?.names ?? '';
        const lastnames = item.teacher?.lastnames ?? '';
        const professor = `${names} ${lastnames}`.trim() || '—';
        const rawSchedules: any[] = item.offeringSection?.schedules ?? [];
        const { days, startHour, endHour, schedule } = mapSchedules(rawSchedules);
        const scheduleDetails = rawSchedules.map((s: any) => ({
          day: DAY_ES[s.day] ?? s.day,
          timeSlot: s.timeSlot ?? `${s.startTime}-${s.endTime}`,
          roomName: s.roomName ?? '—',
          roomType: s.roomType ?? '',
        }));
        return {
          groupCode: item.offeringSection?.code ?? `GRP-${item.id}`,
          professor,
          teacherEmail: item.teacher?.email ?? '—',
          schedule,
          availableSpots,
          totalSpots: capacity,
          theoricalHours: item.periodSubject?.subject?.theoricalHours ?? 0,
          practicalHours: item.periodSubject?.subject?.practicalHours ?? 0,
          days,
          startHour,
          endHour,
          curriculumOfferingSubjectId: item.id,
          description: item.periodSubject?.subject?.description ?? '',
          scheduleDetails,
        };
      });
    };

    const mapSelectedSubjects = (items: any[]): SelectedCourse[] => {
      return items.map((item, idx) => {
        const rawSchedules: any[] = item.offeringSection?.schedules ?? [];
        const { days, startHour, endHour } = mapSchedules(rawSchedules);
        const scheduleDetails: ScheduleDetail[] = rawSchedules.map((s: any) => ({
          day: DAY_ES[s.day] ?? s.day,
          timeSlot: s.timeSlot ?? `${s.startTime}-${s.endTime}`,
          roomName: s.roomName ?? '—',
          roomType: s.roomType ?? '',
        }));
        return {
          code: item.periodSubject.subject.code,
          name: item.periodSubject.subject.name,
          credits: item.periodSubject.subject.credits,
          groupCode: item.offeringSection?.code ?? '—',
          color: COURSE_COLORS[idx % COURSE_COLORS.length],
          days,
          startHour,
          endHour,
          professor: `${item.teacher?.names ?? ''} ${item.teacher?.lastnames ?? ''}`.trim() || '—',
          matriculateSubjectId: item.matriculateSubject?.id ?? 0,
          theoricalHours: item.periodSubject?.subject?.theoricalHours ?? 0,
          practicalHours: item.periodSubject?.subject?.practicalHours ?? 0,
          scheduleDetails,
        };
      });
    };

    const reloadSelectedSubjects = async () => {
      const response = await getConvocationEnrollDetailsService.run(resolvedConvocationEnrolId.value);
      if (Array.isArray(response.data?.selectedSubjects)) {
        selectedCourses.value = mapSelectedSubjects(response.data.selectedSubjects);
      }
    };

    const loadCourses = async () => {
      if (!curriculumOfferingId.value || !curriculumPeriodId.value) return;
      availableCourses.value = [];
      try {
        const response = await getEnrollmentSubjectSelectionService.run({
          curriculumOfferingId: curriculumOfferingId.value,
          curriculumPeriodId: curriculumPeriodId.value,
        });
        availableCourses.value = mapApiSubjectsToCourses(response.data ?? []);
      } catch (err) {
        console.error('[SubjectEnrollment] loadCourses', err);
      }
    };

    onMounted(async () => {
      try {
        const response = await getConvocationEnrollDetailsService.run(resolvedConvocationEnrolId.value);
        const data = response.data;

        stepInfo.value.program = data.offering?.program?.name ?? '—';
        stepInfo.value.semesterName = data.curriculumPeriod?.name ?? '—';
        stepInfo.value.maxCredits = data.totalCredits ?? 0;

        curriculumOfferingId.value = data.offering?.id ?? 0;
        curriculumPeriodId.value = data.curriculumPeriodId ?? 0;

        if (Array.isArray(data.selectedSubjects) && data.selectedSubjects.length > 0) {
          selectedCourses.value = mapSelectedSubjects(data.selectedSubjects);
        }

        await loadCourses();
      } catch (err) {
        console.error('[SubjectEnrollment]', err);
      }
      loading.value = false;
    });

    return {
      loading,
      confirmed,
      searchQuery,
      activeTab,
      availableCourses,
      selectedCourses,
      panelCourse,
      stepInfo,
      statsCards,
      totalCredits,
      creditsValid,
      creditsPct,
      creditsBarClass,
      loadLevel,
      loadLabel,
      alerts,
      canConfirm,
      tabs,
      filteredCourses,
      emptyMessage,
      dayLabels,
      scheduleHours,
      blocksAt,
      isCourseSelected,
      courseStatusLabel,
      courseStatusTone,
      courseStatusIcon,
      spotsColorClass,
      drawerVisible,
      loadingEnrollment,
      enrollmentError,
      openPanel,
      closePanel,
      selectGroup,
      removeCourse,
      confirmEnrollment,
      downloadReceipt,
    };
  },
});
</script>

<style scoped>
/* ── Confirmation ──────────────────────────────────────────────────────────── */
.sej-confirmed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 1rem;
  max-width: 48rem;
  margin: 0 auto;
}

.sej-confirmed__iconWrap {
  position: relative;
  width: 6rem;
  height: 6rem;
}

.sej-confirmed__iconPing {
  position: absolute;
  inset: 0;
  background: #22c55e;
  border-radius: 50%;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  opacity: 0.2;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.sej-confirmed__icon {
  position: relative;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #fff;
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.4);
}

.sej-confirmed__title {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  text-align: center;
}

.sej-confirmed__subtitle {
  color: #64748b;
  margin: 0;
  text-align: center;
}

.sej-confirmed__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}

.sej-confirmed__stat {
  padding: 1.25rem;
  border-radius: 1rem;
  border: 2px solid;
  text-align: center;
}

.sej-confirmed__stat p {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}
.sej-confirmed__stat strong {
  font-size: 2.5rem;
  font-weight: 700;
}

.sej-confirmed__stat--blue {
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border-color: #bfdbfe;
}
.sej-confirmed__stat--blue strong {
  color: #2563eb;
}
.sej-confirmed__stat--green {
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border-color: #bbf7d0;
}
.sej-confirmed__stat--green strong {
  color: #16a34a;
}

.sej-confirmed__courseList {
  width: 100%;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
}

.sej-confirmed__courseList h3 {
  margin: 0;
  padding: 1.25rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  border-bottom: 2px solid #f1f5f9;
}

.sej-confirmed__course {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.sej-confirmed__course:last-child {
  border-bottom: none;
}
.sej-confirmed__course:hover {
  background: #f8fafc;
}

.sej-confirmed__courseLeft {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.sej-confirmed__courseCode {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  width: fit-content;
}

.sej-confirmed__courseName {
  font-weight: 600;
  color: #0f172a;
}
.sej-confirmed__courseGroup {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.sej-confirmed__courseCredits {
  text-align: right;
}
.sej-confirmed__courseCredits span {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}
.sej-confirmed__courseCredits small {
  display: block;
  font-size: 0.7rem;
  color: #94a3b8;
}

.sej-confirmed__actions {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.sej-confirmed__btnPrimary,
.sej-confirmed__btnSecondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.sej-confirmed__btnPrimary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.sej-confirmed__btnPrimary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.sej-confirmed__btnSecondary {
  background: #fff;
  color: #334155;
  border-color: #cbd5e1;
}

.sej-confirmed__btnSecondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

/* ── Root ─────────────────────────────────────────────────────────────────── */
.sej {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Student info bar ─────────────────────────────────────────────────────── */
.sej__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.sej__stat {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.875rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.sej__stat:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
}

.sej__stat--accent {
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border: 2px solid #bfdbfe;
}

.sej__statLabel {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin: 0 0 0.5rem;
}

.sej__stat--accent .sej__statLabel {
  color: #2563eb;
}

.sej__statVal {
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.sej__statCreditsRow {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.sej__statCreditsNum {
  font-size: 1.75rem;
  font-weight: 700;
}

.sej__statCreditsNum--ok {
  color: #16a34a;
}
.sej__statCreditsNum--err {
  color: #dc2626;
}
.sej__statCreditsDen {
  font-size: 0.875rem;
  color: #64748b;
}

.sej__statTrack {
  height: 0.375rem;
  background: #fff;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sej__statBar {
  height: 100%;
  border-radius: inherit;
  transition: width 0.4s ease;
}

.sej__statBar--ok {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.sej__statBar--err {
  background: linear-gradient(90deg, #f87171, #dc2626);
}

/* ── Layout ───────────────────────────────────────────────────────────────── */
.sej__layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.sej__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Academic load ────────────────────────────────────────────────────────── */
.sej__loadBadge {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.875rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.sej__loadBadgeLabel {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.sej__loadChip {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.sej__loadChip--low {
  background: #dbeafe;
  color: #1d4ed8;
}
.sej__loadChip--medium {
  background: #dcfce7;
  color: #15803d;
}
.sej__loadChip--high {
  background: #fed7aa;
  color: #c2410c;
}

.sej__loadTip {
  width: 100%;
  margin: 0;
  font-size: 0.8rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

/* ── Search ───────────────────────────────────────────────────────────────── */
.sej__search {
  position: relative;
}

.sej__searchIcon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
}

.sej__searchInput {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.875rem;
  font-size: 0.9rem;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
  outline: none;
}

.sej__searchInput:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.sej__searchInput::placeholder {
  color: #94a3b8;
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
.sej__tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem 0.25rem 0;
  background: #fff;
  border-radius: 0.875rem 0.875rem 0 0;
  border-bottom: 2px solid #e2e8f0;
}

.sej__tab {
  position: relative;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 0.625rem 0.625rem 0 0;
  cursor: pointer;
  transition: all 0.15s;
}

.sej__tab:hover {
  color: #0f172a;
  background: #f8fafc;
}

.sej__tab--active {
  color: #2563eb;
  background: #f8fafc;
}

.sej__tab--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2563eb;
  border-radius: 999px;
}

/* ── Courses ──────────────────────────────────────────────────────────────── */
.sej__courses {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sej__course {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0.875rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.sej__course:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
}

.sej__course--recommended {
  border-color: #93c5fd;
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
}

.sej__course--recommended:hover {
  border-color: #60a5fa;
}

.sej__course--selected {
  border-color: #93c5fd;
  background: #fff;
}

.sej__course--blocked {
  opacity: 0.7;
}

.sej__courseBody {
  flex: 1;
  min-width: 0;
}

.sej__courseTop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.sej__recommendBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #fff;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
}

.sej__courseCode {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.sej__courseName {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.75rem;
}

.sej__courseMeta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.sej__courseCredits {
  font-size: 0.875rem;
  color: #64748b;
}

.sej__courseCredits strong {
  display: inline-block;
  padding: 0.1rem 0.375rem;
  background: #f1f5f9;
  border-radius: 0.25rem;
  color: #0f172a;
}

.sej__courseStatus {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid;
}

.sej__courseStatus--available {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.sej__courseStatus--selected {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.sej__courseStatus--approved {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.sej__courseStatus--prerequisite {
  background: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}

.sej__courseActions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.sej__btnSecondary,
.sej__btnRemove {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid;
}

.sej__btnSecondary {
  background: #fff;
  color: #334155;
  border-color: #cbd5e1;
}

.sej__btnSecondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.sej__btnRemove {
  background: #f1f5f9;
  color: #334155;
  border-color: transparent;
}

.sej__btnRemove:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
.sej__coursesEmpty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4rem 2rem;
  background: #fff;
  border: 2px dashed #e2e8f0;
  border-radius: 0.875rem;
  text-align: center;
}

.sej__coursesEmptyIcon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.sej__coursesEmpty p {
  font-weight: 600;
  color: #475569;
  margin: 0;
}
.sej__coursesEmpty small {
  color: #94a3b8;
}

/* ── Schedule grid ────────────────────────────────────────────────────────── */
.sej__scheduleSection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sej__scheduleTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.sej__scheduleGrid {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.875rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.sej__scheduleHeader,
.sej__scheduleRow {
  display: grid;
  grid-template-columns: 3.5rem repeat(6, 1fr);
}

.sej__scheduleHeader {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.sej__scheduleTimeCol {
  border-right: 1px solid #e2e8f0;
}

.sej__scheduleDay {
  padding: 0.5rem 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-right: 1px solid #e2e8f0;
}

.sej__scheduleDay:last-child {
  border-right: none;
}

.sej__scheduleRow {
  border-bottom: 1px solid #f1f5f9;
  min-height: 2.5rem;
}
.sej__scheduleRow:last-child {
  border-bottom: none;
}

.sej__scheduleTime {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
  border-right: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  padding-top: 0.375rem;
}

.sej__scheduleCell {
  border-right: 1px solid #f1f5f9;
  padding: 0.125rem;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sej__scheduleCell:last-child {
  border-right: none;
}

.sej__scheduleBlock {
  border-radius: 0.25rem;
  padding: 0.1rem 0.25rem;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
.sej__sidebar {
  width: 20rem;
  flex-shrink: 0;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0.875rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: sticky;
  top: 1.5rem;
  max-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}

.sej__sidebarHead {
  padding: 1.25rem;
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border-bottom: 2px solid #bfdbfe;
  flex-shrink: 0;
}

.sej__sidebarHead h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.sej__sidebarHead p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.sej__sidebarBody {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Credits card ─────────────────────────────────────────────────────────── */
.sej__creditsCard {
  padding: 1.25rem;
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border: 2px solid #bfdbfe;
  border-radius: 0.875rem;
}

.sej__creditsCardHead {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.sej__creditsDisplay {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.sej__creditsMain {
  font-size: 2.5rem;
  font-weight: 700;
}

.sej__creditsMain--ok {
  color: #16a34a;
}
.sej__creditsMain--over {
  color: #dc2626;
}
.sej__creditsMain--low {
  color: #ca8a04;
}

.sej__creditsDivider {
  font-size: 1rem;
  color: #94a3b8;
}

.sej__creditsProgress {
  height: 0.625rem;
  background: #fff;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.75rem;
}

.sej__creditsBar {
  height: 100%;
  border-radius: inherit;
  transition: width 0.5s ease;
}

.sej__creditsBar--ok {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.sej__creditsBar--over {
  background: linear-gradient(90deg, #f87171, #dc2626);
}
.sej__creditsBar--low {
  background: linear-gradient(90deg, #fbbf24, #ca8a04);
}

.sej__creditsRange {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  display: flex;
  justify-content: space-between;
}

/* ── Alerts ───────────────────────────────────────────────────────────────── */
.sej__alertList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sej__alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 0.625rem;
  font-size: 0.8rem;
  color: #b91c1c;
  font-weight: 500;
}

.sej__alert p {
  margin: 0;
}

/* ── Selected list ────────────────────────────────────────────────────────── */
.sej__selectedList {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.sej__selectedEmpty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 2.5rem 1rem;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 0.875rem;
  text-align: center;
}

.sej__selectedEmptyIcon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  border-radius: 50%;
  font-size: 1.5rem;
}

.sej__selectedEmpty p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}
.sej__selectedEmpty small {
  font-size: 0.75rem;
  color: #94a3b8;
}

.sej__selectedItem {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.875rem;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0.875rem;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.sej__selectedItem:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.sej__selectedStripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0.875rem 0.875rem 0 0;
}

.sej__selectedInfo {
  flex: 1;
  min-width: 0;
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.sej__selectedHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sej__selectedHeader strong {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

.sej__selectedName {
  font-size: 0.78rem;
  color: #334155;
  font-weight: 500;
  line-height: 1.3;
}

.sej__selectedDetail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #f1f5f9;
}

.sej__selectedProfessor {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.74rem;
  color: #64748b;
  margin: 0;
}

.sej__selectedHours {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.sej__selectedHourChip {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

.sej__selectedHourChip--indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.sej__selectedHourChip--green {
  background: #dcfce7;
  color: #15803d;
}

.sej__selectedScheduleRow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: #475569;
  flex-wrap: wrap;
}

.sej__selectedScheduleDay {
  font-weight: 600;
  color: #0f172a;
}

.sej__selectedRoom {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #64748b;
}

.sej__selectedGroup {
  font-size: 0.72rem;
  font-weight: 500;
  color: #94a3b8;
  padding-top: 0.2rem;
}

.sej__selectedCreditPill {
  padding: 0.1rem 0.5rem;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.sej__selectedRemove {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 0.25rem;
}

.sej__selectedRemove:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Confirm button ───────────────────────────────────────────────────────── */
.sej__confirmBtn {
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.875rem;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: not-allowed;
  transition: all 0.2s;
  border: none;
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
}

.sej__confirmBtn--active {
  cursor: pointer;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);
}

.sej__confirmBtn--active:hover {
  background: linear-gradient(135deg, #15803d, #166534);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.5);
}

.sej__confirmHint {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: #dc2626;
  background: #fef2f2;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin: 0;
}

/* ── Enrollment error ─────────────────────────────────────────────────────── */
.sej__enrollError {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #b91c1c;
}

/* ── Group panel ──────────────────────────────────────────────────────────── */
.sej__panelOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.sej__panel {
  width: 32rem;
  max-width: 100%;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.2);
}

.sej__panelHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border-bottom: 2px solid #bfdbfe;
  flex-shrink: 0;
}

.sej__panelCode {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
}

.sej__panelHead h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.sej__panelHead p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.sej__panelClose {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
  flex-shrink: 0;
}

.sej__panelClose:hover {
  background: rgba(0, 0, 0, 0.08);
}

.sej__panelBody {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Groups empty state ───────────────────────────────────────────────────── */
.sej__groupsEmpty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 1.5rem;
  background: #fff;
  border: 2px dashed #e2e8f0;
  border-radius: 0.875rem;
  text-align: center;
}

.sej__groupsEmptyIcon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.sej__groupsEmpty p {
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
}

.sej__groupsEmpty small {
  font-size: 0.8rem;
  color: #94a3b8;
  max-width: 22rem;
  line-height: 1.5;
}

/* ── Subject info banner ──────────────────────────────────────────────────── */
.sej__subjectInfo {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
}

.sej__subjectDesc {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.55;
}

.sej__subjectDesc svg,
.sej__subjectDesc i {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: #2563eb;
}

.sej__subjectMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sej__subjectMetaChip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.sej__subjectMetaChip--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.sej__subjectMetaChip--indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.sej__subjectMetaChip--green {
  background: #dcfce7;
  color: #15803d;
}

/* ── Schedule detail table ────────────────────────────────────────────────── */
.sej__scheduleTable {
  border: 1px solid #e2e8f0;
  border-radius: 0.625rem;
  overflow: hidden;
  font-size: 0.8rem;
}

.sej__scheduleTableHead,
.sej__scheduleTableRow {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0.25rem;
}

.sej__scheduleTableHead {
  background: #f8fafc;
  padding: 0.4rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
}

.sej__scheduleTableRow {
  padding: 0.5rem 0.75rem;
  color: #334155;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.sej__scheduleTableRow:last-child {
  border-bottom: none;
}

.sej__scheduleDay {
  font-weight: 600;
}

.sej__scheduleRoomType {
  color: #64748b;
  font-size: 0.75rem;
}

/* ── Group card ───────────────────────────────────────────────────────────── */
.sej__group {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0.875rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: all 0.2s;
}

.sej__group:hover:not(.sej__group--full) {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.sej__group--full {
  opacity: 0.6;
}

.sej__groupTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.sej__groupTop h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.375rem;
}

.sej__groupInfo {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.sej__groupProfessor {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.sej__groupEmail {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.sej__groupHours {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sej__groupHourChip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.sej__groupHourChip--theorical {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.sej__groupHourChip--practical {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.sej__groupSpots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  border: 2px solid;
  min-width: 5rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 700;
}

.sej__groupSpotsLabel {
  font-size: 0.7rem;
  font-weight: 500;
}

.sej__groupSpots--ok {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.sej__groupSpots--low {
  background: #fefce8;
  color: #a16207;
  border-color: #fde68a;
}
.sej__groupSpots--full {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.sej__groupSchedule {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  background: #f8fafc;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
}

.sej__btnSelect {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: not-allowed;
  background: #e2e8f0;
  color: #94a3b8;
  transition: all 0.2s;
}

.sej__btnSelect--active {
  cursor: pointer;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.sej__btnSelect--active:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.5);
}

/* ── Panel slide transition ───────────────────────────────────────────────── */
.sej-slide-enter-active,
.sej-slide-leave-active {
  transition: opacity 0.25s ease;
}

.sej-slide-enter-active .sej__panel,
.sej-slide-leave-active .sej__panel {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sej-slide-enter-from,
.sej-slide-leave-to {
  opacity: 0;
}

.sej-slide-enter-from .sej__panel,
.sej-slide-leave-to .sej__panel {
  transform: translateX(100%);
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .sej__stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .sej__layout {
    flex-direction: column;
  }
  .sej__sidebar {
    width: 100%;
    position: static;
    max-height: none;
  }
  .sej__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .sej__stats {
    grid-template-columns: 1fr;
  }
  .sej__panel {
    width: 100%;
  }
}
</style>
