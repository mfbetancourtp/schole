<template>
  <div class="grid-detail-page bg-light min-vh-100 pb-5">
    <!-- Barra de Acción -->
    <div class="action-bar bg-white px-4 py-3 border-bottom d-flex align-items-center mb-0">
      <AppButton variant="ghost" class="text-dark fw-medium px-2 py-1 d-flex align-items-center gap-2 border-0" @click="goBack">
        <AppIcon icon="arrow-left" class="text-primary-blue fs-5" style="color: #1e3a8a" />
        Volver al listado
      </AppButton>
    </div>

    <div class="container-fluid px-4 py-4">
      <!-- Información de Cabecera -->
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div class="d-flex align-items-center gap-3 mb-3">
            <h2 class="h4 fw-bold text-dark mb-0">Malla Curricular Ingeniería de Sistemas 2024</h2>
            <span class="badge rounded-pill bg-success-light text-success px-3 py-1 fw-medium border border-success-subtle">Activo</span>
          </div>

          <div class="d-flex flex-wrap gap-5 text-muted small">
            <div>
              <div class="mb-1 text-black-50">Código del plan</div>
              <div class="text-dark fw-medium" style="font-size: 13px">PS-IS-2024-V1</div>
            </div>
            <div>
              <div class="mb-1 text-black-50">Versión</div>
              <div class="text-dark fw-medium" style="font-size: 13px">1.0</div>
            </div>
            <div>
              <div class="mb-1 text-black-50">Vigencia</div>
              <div class="text-dark fw-medium" style="font-size: 13px">2024-01-01 - Vigente</div>
            </div>
            <div>
              <div class="mb-1 text-black-50">Registro calificado</div>
              <div class="text-dark fw-medium" style="font-size: 13px">RC-12345</div>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2">
          <AppButton variant="light" outlined class="d-flex align-items-center justify-content-center p-2 rounded-3 shadow-sm border border-light bg-white">
            <AppIcon icon="edit" class="text-muted" />
          </AppButton>
          <AppButton
            variant="light"
            outlined
            class="bg-white d-flex align-items-center px-3 py-2 rounded-3 shadow-sm border border-light text-dark fw-medium"
            style="font-size: 14px"
            @click="isExportModalOpen = true"
          >
            Exportar PDF
          </AppButton>
        </div>
      </div>

      <!-- Tarjetas de Estadísticas -->
      <div class="row g-3 mb-5">
        <div class="col-md-3">
          <div class="stat-card p-3 rounded-3 d-flex align-items-center gap-3 border h-100" style="background-color: #f8faff; border-color: #e0e7ff !important">
            <div class="stat-icon bg-primary text-white rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px">
              <AppIcon icon="graduation-cap" />
            </div>
            <div>
              <div class="text-primary opacity-75 fw-medium mb-1" style="font-size: 11px">Total créditos</div>
              <div class="h4 fw-bold text-primary mb-0">119</div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-3 rounded-3 d-flex align-items-center gap-3 border h-100" style="background-color: #faf5ff; border-color: #f3e8ff !important">
            <div class="stat-icon text-white rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #a855f7">
              <AppIcon icon="book" />
            </div>
            <div>
              <div class="fw-medium mb-1" style="font-size: 11px; color: #9333ea">Total asignaturas</div>
              <div class="h4 fw-bold mb-0" style="color: #7e22ce">32</div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-3 rounded-3 d-flex align-items-center gap-3 border h-100" style="background-color: #f0fdf4; border-color: #dcfce7 !important">
            <div class="stat-icon text-white rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #22c55e">
              <AppIcon icon="calendar-alt" />
            </div>
            <div>
              <div class="fw-medium mb-1" style="font-size: 11px; color: #16a34a">Semestres</div>
              <div class="h4 fw-bold mb-0" style="color: #15803d">10</div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-3 rounded-3 d-flex align-items-center gap-3 border h-100" style="background-color: #fff7ed; border-color: #ffedd5 !important">
            <div class="stat-icon text-white rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #ea580c">
              <AppIcon icon="chart-bar" />
            </div>
            <div>
              <div class="fw-medium mb-1" style="font-size: 11px; color: #ea580c">Promedio créditos</div>
              <div class="h4 fw-bold mb-0" style="color: #c2410c">12</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Semestres -->
      <div class="semesters-container d-flex flex-column gap-5 border-top pt-4">
        <!-- Fila de Semestre -->
        <div v-for="semester in semestersList" :key="semester.id" class="semester-row d-flex flex-column flex-lg-row gap-4">
          <!-- Información del Semestre (columna izquierda) -->
          <div class="semester-info" style="min-width: 200px; width: 220px">
            <h5 class="fw-bold text-dark mb-3">Semestre {{ semester.number }}</h5>
            <div class="d-flex flex-column gap-2 text-muted small px-1" style="font-size: 13px">
              <div class="d-flex align-items-center gap-2">
                <AppIcon icon="book-open" style="font-size: 14px" />
                {{ semester.subjectsTotal }} asignaturas
              </div>
              <div class="d-flex align-items-center gap-2">
                <AppIcon icon="clock" style="font-size: 14px" />
                {{ semester.hoursTotal }} horas
              </div>
              <div class="d-flex align-items-center gap-2">
                <AppIcon icon="graduation-cap" style="font-size: 14px" />
                {{ semester.creditsTotal }} créditos
              </div>
            </div>
          </div>

          <!-- Contenedor de tarjetas de asignaturas -->
          <div class="semester-subjects d-flex flex-wrap gap-3 flex-grow-1">
            <SubjectCard v-for="subject in semester.subjects" :key="subject.code" :subject="subject" />
          </div>
        </div>
      </div>
    </div>

    <ExportGridModal v-model="isExportModalOpen" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import SubjectCard from '../components/SubjectCard.vue';
import ExportGridModal from '../components/ExportGridModal.vue';
import { useHeaderStore } from '../../../stores/header.store';

export default defineComponent({
  name: 'CurricularGridDetail',
  components: {
    AppButton,
    AppIcon,
    SubjectCard,
    ExportGridModal,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const programId = route.params.id;
    const headerStorage = useHeaderStore();
    const isExportModalOpen = ref(false);

    onMounted(() => {
      headerStorage.module = { name: 'Diseño Curricular', url: '' };
      headerStorage.moduleItem = {
        name: 'Programas académicos',
        url: '/academicPrograms',
      };
      headerStorage.moduleSubItem = {
        name: 'Mallas Curriculares',
        url: `/academicPrograms/${programId}/curricular-grids`,
      };
    });

    // Datos simulados basados en los wireframes
    const semestersList = ref([
      {
        id: 1,
        number: 1,
        subjectsTotal: 5,
        hoursTotal: 23,
        creditsTotal: 15,
        subjects: [
          {
            code: 'MAT101',
            name: 'Cálculo I',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'PRO101',
            name: 'Programación I',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'FIS101',
            name: 'Física I',
            type: 'Obligatoria',
            credits: 3,
            hours: 5,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'HUM101',
            name: 'Comunicación',
            type: 'Obligatoria',
            credits: 2,
            hours: 3,
            tags: [],
          },
          {
            code: 'ING101',
            name: 'Inglés I',
            type: 'Obligatoria',
            credits: 2,
            hours: 3,
            tags: [],
          },
        ],
      },
      {
        id: 2,
        number: 2,
        subjectsTotal: 5,
        hoursTotal: 25,
        creditsTotal: 17,
        subjects: [
          {
            code: 'MAT102',
            name: 'Cálculo II',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'PRO201',
            name: 'Programación II',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'EST101',
            name: 'Estadística I',
            type: 'Obligatoria',
            credits: 3,
            hours: 4,
            tags: [],
          },
          {
            code: 'BDI101',
            name: 'Bases de Datos I',
            type: 'Obligatoria',
            credits: 3,
            hours: 5,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'ALG101',
            name: 'Álgebra Lineal',
            type: 'Obligatoria',
            credits: 3,
            hours: 4,
            tags: [],
          },
        ],
      },
      {
        id: 3,
        number: 3,
        subjectsTotal: 4,
        hoursTotal: 23,
        creditsTotal: 15,
        subjects: [
          {
            code: 'MAT301',
            name: 'Cálculo III',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [],
          },
          {
            code: 'PRO301',
            name: 'Estructuras de Datos',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'BDI201',
            name: 'Bases de Datos II',
            type: 'Obligatoria',
            credits: 3,
            hours: 5,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'SO101',
            name: 'Sistemas Operativos',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [],
          },
        ],
      },
      {
        id: 4,
        number: 4,
        subjectsTotal: 4,
        hoursTotal: 22,
        creditsTotal: 14,
        subjects: [
          {
            code: 'ALG201',
            name: 'Algoritmos',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [],
          },
          {
            code: 'WEB101',
            name: 'Desarrollo Web',
            type: 'Obligatoria',
            credits: 3,
            hours: 5,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'RED101',
            name: 'Redes I',
            type: 'Obligatoria',
            credits: 3,
            hours: 5,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'ING201',
            name: 'Ingeniería de Software I',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [],
          },
        ],
      },
      {
        id: 5,
        number: 5,
        subjectsTotal: 4,
        hoursTotal: 23,
        creditsTotal: 15,
        subjects: [
          {
            code: 'ARQ101',
            name: 'Arquitectura de Software',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [],
          },
          {
            code: 'MOV101',
            name: 'Desarrollo Móvil',
            type: 'Electiva',
            credits: 3,
            hours: 5,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'IA101',
            name: 'Inteligencia Artificial',
            type: 'Electiva',
            credits: 4,
            hours: 6,
            tags: [],
          },
          {
            code: 'ING202',
            name: 'Ingeniería de Software II',
            type: 'Obligatoria',
            credits: 4,
            hours: 6,
            tags: [],
          },
        ],
      },
      {
        id: 6,
        number: 6,
        subjectsTotal: 3,
        hoursTotal: 16,
        creditsTotal: 10,
        subjects: [
          {
            code: 'SEG101',
            name: 'Seguridad Informática',
            type: 'Electiva',
            credits: 3,
            hours: 5,
            tags: [],
          },
          {
            code: 'CLO101',
            name: 'Computación en la Nube',
            type: 'Electiva',
            credits: 3,
            hours: 5,
            tags: [{ text: 'Lab', icon: 'flask', color: 'primary' }],
          },
          {
            code: 'BIG101',
            name: 'Big Data',
            type: 'Electiva',
            credits: 4,
            hours: 6,
            tags: [],
          },
        ],
      },
      {
        id: 7,
        number: 7,
        subjectsTotal: 3,
        hoursTotal: 14,
        creditsTotal: 8,
        subjects: [
          {
            code: 'PRO401',
            name: 'Proyecto I',
            type: 'Práctica',
            credits: 4,
            hours: 8,
            tags: [],
          },
          {
            code: 'EMP101',
            name: 'Emprendimiento',
            type: 'Obligatoria',
            credits: 2,
            hours: 3,
            tags: [],
          },
          {
            code: 'ETI101',
            name: 'Ética Profesional',
            type: 'Obligatoria',
            credits: 2,
            hours: 3,
            tags: [],
          },
        ],
      },
      {
        id: 8,
        number: 8,
        subjectsTotal: 2,
        hoursTotal: 12,
        creditsTotal: 7,
        subjects: [
          {
            code: 'PRO402',
            name: 'Proyecto II',
            type: 'Práctica',
            credits: 4,
            hours: 8,
            tags: [],
          },
          {
            code: 'GES101',
            name: 'Gestión de Proyectos',
            type: 'Obligatoria',
            credits: 3,
            hours: 4,
            tags: [],
          },
        ],
      },
      {
        id: 9,
        number: 9,
        subjectsTotal: 1,
        hoursTotal: 16,
        creditsTotal: 8,
        subjects: [
          {
            code: 'PRA901',
            name: 'Práctica Profesional',
            type: 'Práctica',
            credits: 8,
            hours: 16,
            tags: [{ text: 'Req. Grado', icon: '', color: 'success' }],
          },
        ],
      },
      {
        id: 10,
        number: 10,
        subjectsTotal: 1,
        hoursTotal: 20,
        creditsTotal: 10,
        subjects: [
          {
            code: 'TGR101',
            name: 'Trabajo de Grado',
            type: 'Práctica',
            credits: 10,
            hours: 20,
            tags: [{ text: 'Req. Grado', icon: '', color: 'success' }],
          },
        ],
      },
    ]);

    const goBack = () => {
      router.push({
        name: 'institutionalConfiguration.curricularGrids',
        params: { id: programId },
      });
    };

    return {
      semestersList,
      goBack,
      isExportModalOpen,
    };
  },
});
</script>

<style scoped>
/* Color para el indicador "Electiva" */
.bg-fuchsia {
  background-color: #d946ef !important;
}
.text-fuchsia {
  color: #d946ef !important;
}
.text-orange {
  color: #ea580c !important;
}

/* Estilos de las etiquetas (tags) */
.border-primary-light {
  border-color: #bfdbfe !important;
}
.bg-primary-light {
  background-color: #eff6ff !important;
}

.border-success-light {
  border-color: #bbf7d0 !important;
}
.bg-success-light {
  background-color: #f0fdf4 !important;
}

.subject-card {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.subject-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1 !important;
}

.semester-info h5 {
  font-size: 16px;
}
</style>
