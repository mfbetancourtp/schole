<template>
  <AppBaseList title="Programas Académicos">
    <template #actions>
      <AppButton variant="primary" @click="handleCreate">
        <AppIcon icon="plus" />
        Crear programa
      </AppButton>
    </template>

    <template #content>
      <div class="academicProgramsPage">
        <!-- Header resumen -->
        <div class="heroSection">
          <div class="heroSection__content">
            <div class="heroSection__text">
              <h2 class="heroSection__title">Gestión de programas académicos</h2>
              <p class="heroSection__subtitle">Administra la oferta académica, consulta su estado actual y accede rápidamente al plan de estudios de cada programa.</p>
            </div>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpiGrid">
          <AppCard>
            <template #body>
              <div class="kpiCard">
                <div class="kpiCard__icon kpiCard__icon--primary">
                  <AppIcon icon="book-open" />
                </div>
                <div>
                  <p class="kpiCard__label">Total programas</p>
                  <h3 class="kpiCard__value">{{ programs.length }}</h3>
                </div>
              </div>
            </template>
          </AppCard>

          <AppCard>
            <template #body>
              <div class="kpiCard">
                <div class="kpiCard__icon kpiCard__icon--success">
                  <AppIcon icon="check-circle" />
                </div>
                <div>
                  <p class="kpiCard__label">Activos</p>
                  <h3 class="kpiCard__value">{{ activeCount }}</h3>
                </div>
              </div>
            </template>
          </AppCard>

          <AppCard>
            <template #body>
              <div class="kpiCard">
                <div class="kpiCard__icon kpiCard__icon--warning">
                  <AppIcon icon="refresh-cw" />
                </div>
                <div>
                  <p class="kpiCard__label">En actualización</p>
                  <h3 class="kpiCard__value">{{ updatingCount }}</h3>
                </div>
              </div>
            </template>
          </AppCard>

          <AppCard>
            <template #body>
              <div class="kpiCard">
                <div class="kpiCard__icon kpiCard__icon--danger">
                  <AppIcon icon="power" />
                </div>
                <div>
                  <p class="kpiCard__label">Inactivos</p>
                  <h3 class="kpiCard__value">{{ inactiveCount }}</h3>
                </div>
              </div>
            </template>
          </AppCard>
        </div>

        <!-- Filtros -->
        <AppCard>
          <template #title>
            <div class="sectionTitle">
              <div class="sectionTitle__left">
                <div class="sectionTitle__icon">
                  <AppIcon icon="filter" />
                </div>
                <div>
                  <h3 class="sectionTitle__text">Filtros</h3>
                  <p class="sectionTitle__subtitle">Busca y segmenta los programas académicos</p>
                </div>
              </div>
            </div>
          </template>

          <template #body>
            <div class="filtersGrid">
              <div class="filterItem filterItem--search">
                <label class="filterItem__label">Buscar</label>
                <AppInput v-model="filters.search" placeholder="Buscar por nombre, código o facultad" />
              </div>

              <div class="filterItem">
                <label class="filterItem__label">Nivel académico</label>
                <AppSelect v-model="filters.level">
                  <option value="">Todos los niveles</option>
                  <option value="Pregrado">Pregrado</option>
                  <option value="Especialización">Especialización</option>
                  <option value="Maestría">Maestría</option>
                  <option value="Doctorado">Doctorado</option>
                </AppSelect>
              </div>

              <div class="filterItem">
                <label class="filterItem__label">Estado</label>
                <AppSelect v-model="filters.status">
                  <option value="">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="En actualización">En actualización</option>
                </AppSelect>
              </div>

              <div class="filterActions">
                <AppButton outlined variant="secondary" @click="resetFilters">
                  <AppIcon icon="rotate-ccw" />
                  Limpiar filtros
                </AppButton>
              </div>
            </div>
          </template>
        </AppCard>

        <!-- Tabla -->
        <AppCard>
          <template #title>
            <div class="sectionTitle">
              <div class="sectionTitle__left">
                <div class="sectionTitle__icon">
                  <AppIcon icon="list" />
                </div>
                <div>
                  <h3 class="sectionTitle__text">Listado de programas</h3>
                  <p class="sectionTitle__subtitle">
                    Mostrando {{ filteredPrograms.length }} de
                    {{ programs.length }}
                    registros
                  </p>
                </div>
              </div>
            </div>
          </template>

          <template #body>
            <template v-if="filteredPrograms.length">
              <div class="tableWrapper">
                <table class="programsTable">
                  <thead>
                    <tr>
                      <th>Programa</th>
                      <th>Código</th>
                      <th>Nivel</th>
                      <th>Facultad</th>
                      <th>Modalidad</th>
                      <th>Estado</th>
                      <th>Vigencia</th>
                      <th class="text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="program in filteredPrograms" :key="program.id">
                      <td>
                        <div class="programCell">
                          <div class="programCell__icon">
                            <AppIcon icon="graduation-cap" />
                          </div>
                          <div>
                            <p class="programCell__name">{{ program.name }}</p>
                            <p class="programCell__meta">
                              {{ program.snies }}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>{{ program.code }}</td>
                      <td>{{ program.level }}</td>
                      <td>{{ program.faculty }}</td>
                      <td>{{ program.modality }}</td>

                      <td>
                        <AppBadge :label="program.status" :variant="getStatusVariant(program.status)" />
                      </td>

                      <td>{{ formatDate(program.validity) }}</td>

                      <td>
                        <div class="actionsCell">
                          <AppButton outlined variant="primary" @click="handleView(program.id)">
                            <AppIcon icon="eye" />
                          </AppButton>

                          <AppButton outlined variant="secondary" @click="handleEdit(program.id)">
                            <AppIcon icon="edit" />
                          </AppButton>

                          <AppButton v-if="program.status === 'Activo'" outlined variant="info" @click="handleStudyPlan(program)">
                            <AppIcon icon="git-branch" />
                            Plan de estudios
                          </AppButton>

                          <AppButton v-if="program.status === 'Activo'" outlined variant="danger" @click="toggleStatus(program)">
                            <AppIcon icon="power" />
                          </AppButton>

                          <AppButton v-else outlined variant="success" @click="toggleStatus(program)">
                            <AppIcon icon="rotate-ccw" />
                          </AppButton>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <AppEmptyResponse v-else title="No hay programas disponibles" subtitle="No se encontraron resultados con los filtros aplicados" size="sm" />
          </template>
        </AppCard>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

type ProgramStatus = 'Activo' | 'Inactivo' | 'En actualización';

interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  snies: string;
  level: string;
  faculty: string;
  modality: string;
  status: ProgramStatus;
  validity: string;
}

export default defineComponent({
  name: 'AcademicProgramsPage',
  components: {
    AppBaseList,
    AppButton,
    AppIcon,
    AppCard,
    AppInput,
    AppSelect,
    AppBadge,
    AppEmptyResponse,
  },
  setup() {
    const programs = ref<AcademicProgram[]>([
      {
        id: '1',
        name: 'Ingeniería de Sistemas',
        code: 'IS-001',
        snies: 'SNIES 102938',
        level: 'Pregrado',
        faculty: 'Facultad de Ingeniería',
        modality: 'Presencial',
        status: 'Activo',
        validity: '2028-12-31',
      },
      {
        id: '2',
        name: 'Medicina',
        code: 'MD-001',
        snies: 'SNIES 847261',
        level: 'Pregrado',
        faculty: 'Facultad de Ciencias de la Salud',
        modality: 'Presencial',
        status: 'Activo',
        validity: '2029-06-30',
      },
      {
        id: '3',
        name: 'Maestría en Ingeniería de Software',
        code: 'MIS-001',
        snies: 'SNIES 554433',
        level: 'Maestría',
        faculty: 'Facultad de Ingeniería',
        modality: 'Virtual',
        status: 'Activo',
        validity: '2027-12-31',
      },
      {
        id: '4',
        name: 'Psicología',
        code: 'PSI-001',
        snies: 'SNIES 121212',
        level: 'Pregrado',
        faculty: 'Facultad de Humanidades',
        modality: 'Híbrido',
        status: 'En actualización',
        validity: '2026-08-15',
      },
      {
        id: '5',
        name: 'Especialización en Gerencia Educativa',
        code: 'EGE-001',
        snies: 'SNIES 909090',
        level: 'Especialización',
        faculty: 'Facultad de Educación',
        modality: 'Virtual',
        status: 'Inactivo',
        validity: '2025-12-31',
      },
      {
        id: '6',
        name: 'Ingeniería Civil',
        code: 'IC-001',
        snies: 'SNIES 777111',
        level: 'Pregrado',
        faculty: 'Facultad de Ingeniería',
        modality: 'Presencial',
        status: 'Activo',
        validity: '2028-03-20',
      },
    ]);

    const filters = reactive({
      search: '',
      level: '',
      status: '',
    });

    const filteredPrograms = computed(() => {
      return programs.value.filter((program) => {
        const matchesSearch =
          !filters.search ||
          program.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          program.code.toLowerCase().includes(filters.search.toLowerCase()) ||
          program.faculty.toLowerCase().includes(filters.search.toLowerCase());

        const matchesLevel = !filters.level || program.level === filters.level;

        const matchesStatus = !filters.status || program.status === filters.status;

        return matchesSearch && matchesLevel && matchesStatus;
      });
    });

    const activeCount = computed(() => programs.value.filter((item) => item.status === 'Activo').length);

    const inactiveCount = computed(() => programs.value.filter((item) => item.status === 'Inactivo').length);

    const updatingCount = computed(() => programs.value.filter((item) => item.status === 'En actualización').length);

    const resetFilters = () => {
      filters.search = '';
      filters.level = '';
      filters.status = '';
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('es-CO');
    };

    const getStatusVariant = (status: ProgramStatus) => {
      const variants: Record<ProgramStatus, string> = {
        Activo: 'success',
        Inactivo: 'danger',
        'En actualización': 'warning',
      };

      return variants[status];
    };

    const handleCreate = () => {
      console.log('Crear programa');
    };

    const handleView = (id: string) => {
      console.log('Ver programa', id);
    };

    const handleEdit = (id: string) => {
      console.log('Editar programa', id);
    };

    const handleStudyPlan = (program: AcademicProgram) => {
      console.log('Ver plan de estudios', program);
    };

    const toggleStatus = (program: AcademicProgram) => {
      if (program.status === 'Activo') {
        program.status = 'Inactivo';
        return;
      }

      program.status = 'Activo';
    };

    return {
      programs,
      filters,
      filteredPrograms,
      activeCount,
      inactiveCount,
      updatingCount,
      resetFilters,
      formatDate,
      getStatusVariant,
      handleCreate,
      handleView,
      handleEdit,
      handleStudyPlan,
      toggleStatus,
    };
  },
});
</script>

<style scoped>
.academicProgramsPage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.heroSection {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.12), rgba(var(--color-secondary-rgb), 0.1));
  border: 1px solid rgba(var(--color-primary-rgb), 0.15);
  border-radius: 20px;
  padding: 1.5rem;
}

.heroSection__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-dark);
}

.heroSection__subtitle {
  margin: 0.5rem 0 0 0;
  color: var(--color-gray-600);
  max-width: 760px;
}

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.kpiCard {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kpiCard__icon {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.kpiCard__icon--primary {
  background: var(--color-primary);
}

.kpiCard__icon--success {
  background: var(--color-success);
}

.kpiCard__icon--warning {
  background: var(--color-warning);
  color: var(--color-dark);
}

.kpiCard__icon--danger {
  background: var(--color-danger);
}

.kpiCard__label {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-gray-600);
}

.kpiCard__value {
  margin: 0.2rem 0 0 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-dark);
}

.sectionTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sectionTitle__left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.sectionTitle__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.sectionTitle__text {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-dark);
}

.sectionTitle__subtitle {
  margin: 0.15rem 0 0 0;
  font-size: 0.88rem;
  color: var(--color-gray-600);
}

.filtersGrid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.filterItem {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.filterItem__label {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.92rem;
}

.filterActions {
  display: flex;
  justify-content: flex-end;
}

.tableWrapper {
  overflow-x: auto;
}

.programsTable {
  width: 100%;
  border-collapse: collapse;
}

.programsTable thead th {
  text-align: left;
  padding: 0.9rem 1rem;
  background: #f8fafc;
  color: var(--color-gray-600);
  font-size: 0.9rem;
  font-weight: 700;
  border-bottom: 1px solid #e9ecef;
  white-space: nowrap;
}

.programsTable tbody td {
  padding: 1rem;
  border-bottom: 1px solid #eef2f7;
  vertical-align: middle;
  color: var(--color-dark);
}

.programsTable tbody tr:hover {
  background: rgba(var(--color-primary-rgb), 0.03);
}

.programCell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 250px;
}

.programCell__icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 12px;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.programCell__name {
  margin: 0;
  font-weight: 700;
  color: var(--color-dark);
}

.programCell__meta {
  margin: 0.2rem 0 0 0;
  font-size: 0.85rem;
  color: var(--color-gray-600);
}

.actionsCell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.text-right {
  text-align: right !important;
}

@media (max-width: 1200px) {
  .kpiGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtersGrid {
    grid-template-columns: 1fr 1fr;
  }

  .filterItem--search {
    grid-column: span 2;
  }

  .filterActions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .kpiGrid {
    grid-template-columns: 1fr;
  }

  .filtersGrid {
    grid-template-columns: 1fr;
  }

  .filterItem--search {
    grid-column: span 1;
  }

  .heroSection {
    padding: 1rem;
  }

  .heroSection__title {
    font-size: 1.25rem;
  }
}
</style>
