<template>
  <AppBaseList :title="title">
    <template #content>
      <!-- Header -->
      <div class="pageHeader">
        <!-- <div class="pageHeader__left">
          <p class="pageHeader__subtitle">
            Administre los códigos QR de asistencia docente
          </p>
        </div> -->

        <div class="pageHeader__right">
          <AppButton type="button" outlined class="pageHeader__btn" @click="handleExportAll">
            <AppIcon icon="file-download" />
            Exportar Todo
          </AppButton>

          <AppButton type="button" class="pageHeader__btnPrimary" @click="handleMassGenerate">
            <AppIcon icon="qrcode" />
            Generar QR Masivo
          </AppButton>
        </div>
      </div>

      <div class="pageBody">
        <!-- Stats Cards -->
        <div class="cards-dashboard-container">
          <AppCardDashboard v-for="(card, index) in statsCards" :key="index" class="container-custom-card" :style="{ backgroundColor: '#FFFFFF' }">
            <template #title>
              <span class="dashCard__title">{{ card.title }}</span>
            </template>

            <template #body>
              <div class="dashCard__body">
                <div class="dashCard__left">
                  <h3 class="dashCard__value">{{ card.value }}</h3>
                  <p v-if="card.subtitle" class="dashCard__subtitle">
                    {{ card.subtitle }}
                  </p>
                </div>

                <div class="dashCard__iconBox" :class="`dashCard__iconBox--${card.tone}`">
                  <AppIcon class="dashCard__icon" :class="`dashCard__icon--${card.tone}`" :icon="card.icon" />
                </div>
              </div>
            </template>
          </AppCardDashboard>
        </div>

        <!-- Filters -->
        <div class="filtersCard">
          <div class="filtersHead">
            <AppIcon icon="filter" class="filtersHead__icon" />
            <h3 class="filtersHead__title">Filtros</h3>
          </div>

          <div class="filtersGrid">
            <div class="filterItem">
              <label class="filterLabel">Buscar por nombre</label>
              <div class="filterInputWrap">
                <AppIcon icon="search" class="filterInputIcon" />
                <input v-model="searchTerm" class="w-100 filterControl filterControl--withIcon" placeholder="Ingrese nombre del docente..." type="text" />
              </div>
            </div>

            <div class="filterItem">
              <label class="filterLabel">Facultad</label>
              <select v-model="selectedFacultad" class="filterControl">
                <option value="">Todas las facultades</option>
                <option v-for="f in facultades" :key="f" :value="f">
                  {{ f }}
                </option>
              </select>
            </div>

            <div class="filterItem">
              <label class="filterLabel">Estado del QR</label>
              <select v-model="selectedEstado" class="filterControl">
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="expirado">Expirado</option>
                <option value="revocado">Revocado</option>
              </select>
            </div>

            <div class="filterActions">
              <AppButton type="button" outlined @click="handleResetFilters">
                <AppIcon icon="trash" />
                Limpiar filtros
              </AppButton>
            </div>
          </div>

          <div v-if="hasFilters" class="filtersFooter">
            <p class="filtersFooter__text">
              <span class="filtersFooter__count">{{ filteredTeachers.length }}</span>
              resultado(s) encontrado(s)
            </p>

            <button class="filtersFooter__link" type="button" @click="handleResetFilters">Limpiar filtros</button>
          </div>
        </div>

        <!-- Table header -->
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
          <p class="tw-text-sm tw-text-slate-600">
            Mostrando
            <span class="tw-font-semibold">{{ filteredTeachers.length }}</span>
            de
            <span class="tw-font-semibold">{{ teachers.length }}</span>
            docentes
          </p>
        </div>

        <!-- Table -->
        <div class="tableCard">
          <DataTable
            :value="filteredTeachers"
            dataKey="id"
            responsiveLayout="scroll"
            :paginator="filteredTeachers.length > 0"
            :rows="10"
            :rowsPerPageOptions="[10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            class="qrTable"
          >
            <template #empty>
              <div class="tw-py-10">
                <AppEmptyResponse title="Sin resultados" description="No hay docentes con los filtros actuales." />
              </div>
            </template>

            <!-- Docente -->
            <Column header="DOCENTE" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <div class="teacherCell">
                  <div class="avatarCircle">
                    <span class="avatarText">{{ initials(data.nombre) }}</span>
                  </div>
                  <div class="teacherCell__info">
                    <div class="teacherCell__name">{{ data.nombre }}</div>
                    <div class="teacherCell__email">{{ data.email }}</div>
                  </div>
                </div>
              </template>
            </Column>

            <!-- Código -->
            <Column field="codigo" header="CÓDIGO" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span class="mono">{{ data.codigo }}</span>
              </template>
            </Column>

            <!-- Facultad -->
            <Column field="facultad" header="FACULTAD" headerClass="th" bodyClass="td" />

            <!-- Estado -->
            <Column header="ESTADO QR" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span class="badge" :class="qrBadgeClass(data.estado)">
                  <span class="badge__inner">
                    <AppIcon :icon="qrStatusIcon(data.estado)" class="badgeIcon" />
                    {{ qrStatusLabel(data.estado) }}
                  </span>
                </span>
              </template>
            </Column>

            <!-- Última marcación -->
            <Column field="ultimaMarcacion" header="ÚLTIMA MARCACIÓN" headerClass="th" bodyClass="td" />

            <!-- Acciones -->
            <Column header="ACCIONES" headerClass="th th--right" bodyClass="td td--right">
              <template #body="{ data }">
                <div class="tw-flex tw-justify-end tw-gap-2">
                  <AppButton type="button" icon="eye" v-tooltip="'Ver QR'" @click="openDetail(data)" />

                  <AppButton type="button" icon="qrcode" v-tooltip="'Regenerar QR'" @click="handleRegenerate(data)" />

                  <AppButton type="button" icon="file-download" v-tooltip="'Exportar QR'" @click="handleExportOne(data)" />

                  <AppButton type="button" icon="ban" v-tooltip="'Bloquear QR'" @click="handleBlock(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Drawer Detalle QR -->
        <!-- <AppDrawer
          v-model:isVisible="isDrawerOpen"
          size="lg"
          exportId="qr-teacher-drawer-export"
        >
          <template #head>
            <div class="sheetHead">
              <div class="sheetHead__titleBox">
                <span class="sheetHead__title">Código QR</span>
                <span class="sheetHead__desc">
                  Información del QR para asistencia docente
                </span>
              </div>

              <div v-if="selectedTeacher" class="sheetHead__teacher">
                <div class="teacherRow">
                  <div class="iconCircle iconCircle--glass">
                    <AppIcon icon="user" />
                  </div>
                  <div class="teacherRow__text">
                    <span class="k">Docente: </span>
                    <span class="v">{{ selectedTeacher.nombre }}</span>
                  </div>
                </div>

                <div class="headMeta">
                  <div class="headMeta__item">
                    <AppIcon icon="building" class="metaIcon" />
                    <div>
                      <span class="k">Facultad: </span>
                      <span class="v">{{ selectedTeacher.facultad }}</span>
                    </div>
                  </div>

                  <span
                    class="badge badge--head"
                    :class="qrBadgeClass(selectedTeacher.estado)"
                  >
                    <span class="badge__inner">
                      <AppIcon
                        :icon="qrStatusIcon(selectedTeacher.estado)"
                        class="badgeIcon"
                      />
                      {{ qrStatusLabel(selectedTeacher.estado) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedTeacher" class="sheetBody">
              <div class="qrBox">
                <div class="qrBox__canvas">
                  <svg
                    width="220"
                    height="220"
                    viewBox="0 0 200 200"
                    class="qrSvg"
                    aria-label="Código QR"
                    role="img"
                  >
                    <rect width="200" height="200" fill="white" />
                    <rect x="10" y="10" width="50" height="50" fill="black" />
                    <rect x="20" y="20" width="30" height="30" fill="white" />
                    <rect x="140" y="10" width="50" height="50" fill="black" />
                    <rect x="150" y="20" width="30" height="30" fill="white" />
                    <rect x="10" y="140" width="50" height="50" fill="black" />
                    <rect x="20" y="150" width="30" height="30" fill="white" />
                    <rect x="80" y="80" width="40" height="40" fill="black" />
                    <rect x="30" y="80" width="10" height="10" fill="black" />
                    <rect x="50" y="80" width="10" height="10" fill="black" />
                    <rect x="80" y="30" width="10" height="10" fill="black" />
                    <rect x="100" y="50" width="10" height="10" fill="black" />
                    <rect x="140" y="80" width="10" height="10" fill="black" />
                    <rect x="160" y="100" width="10" height="10" fill="black" />
                    <rect x="80" y="140" width="10" height="10" fill="black" />
                    <rect x="100" y="160" width="10" height="10" fill="black" />
                    <rect x="140" y="140" width="20" height="20" fill="black" />
                  </svg>
                </div>

                <div class="qrInfo">
                  <div class="qrInfo__card">
                    <div class="qrInfo__row">
                      <span class="qrInfo__k">Código:</span>
                      <span class="qrInfo__v mono">{{
                        selectedTeacher.codigo
                      }}</span>
                    </div>
                    <div class="qrInfo__row">
                      <span class="qrInfo__k">Email:</span>
                      <span class="qrInfo__v">{{ selectedTeacher.email }}</span>
                    </div>
                    <div class="qrInfo__row">
                      <span class="qrInfo__k">Cargo:</span>
                      <span class="qrInfo__v">{{ selectedTeacher.cargo }}</span>
                    </div>
                  </div>

                  <div class="qrInfo__dates">
                    <div class="datePill">
                      <AppIcon icon="calendar" class="datePill__icon" />
                      <div class="datePill__text">
                        <span class="datePill__k">Creación</span>
                        <span class="datePill__v">{{
                          selectedTeacher.fechaCreacion
                        }}</span>
                      </div>
                    </div>

                    <div class="datePill">
                      <AppIcon icon="calendar-minus" class="datePill__icon" />
                      <div class="datePill__text">
                        <span class="datePill__k">Expiración</span>
                        <span class="datePill__v">{{
                          selectedTeacher.fechaExpiracion
                        }}</span>
                      </div>
                    </div>

                    <div class="datePill">
                      <AppIcon icon="clock" class="datePill__icon" />
                      <div class="datePill__text">
                        <span class="datePill__k">Última marcación</span>
                        <span class="datePill__v">{{
                          selectedTeacher.ultimaMarcacion
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="sheetFooter">
              <AppButton
                type="button"
                class="sheetFooter__btnPrimary"
                @click="handleExportOne(selectedTeacher!)"
              >
                <AppIcon icon="file-download" />
                Descargar
              </AppButton>

              <AppButton
                type="button"
                outlined
                @click="handleRegenerate(selectedTeacher!)"
              >
                <AppIcon icon="refresh" />
                Regenerar
              </AppButton>

              <AppButton type="button" outlined @click="closeDrawer">
                Cerrar
              </AppButton>
            </div>
          </template>
        </AppDrawer> -->
      </div>
    </template>
  </AppBaseList>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
// import AppDrawer from '../../../shared/components/AppDrawer.vue';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useHeaderStore } from '../../../stores/header.store';

type QrStatus = 'activo' | 'expirado' | 'revocado';

type TeacherQr = {
  id: string;
  nombre: string;
  codigo: string;
  facultad: string;
  estado: QrStatus;
  ultimaMarcacion: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  email: string;
  cargo: string;
};
type StatsCard = {
  title: string;
  value: string;
  icon: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  subtitle?: string; // 👈 opcional
};
const title = 'Gestión de códigos QR';

const teachers = ref<TeacherQr[]>([
  {
    id: '1',
    nombre: 'Dr. Carlos Mendoza García',
    codigo: 'DOC-2024-001',
    facultad: 'Ingeniería',
    estado: 'activo',
    ultimaMarcacion: '10/02/2026 08:15',
    fechaCreacion: '11/01/2026',
    fechaExpiracion: '10/03/2026',
    email: 'cmendoza@universidad.edu',
    cargo: 'Profesor Principal',
  },
  {
    id: '2',
    nombre: 'Dra. María Elena Rodríguez',
    codigo: 'DOC-2024-002',
    facultad: 'Medicina',
    estado: 'activo',
    ultimaMarcacion: '10/02/2026 07:45',
    fechaCreacion: '12/01/2026',
    fechaExpiracion: '11/03/2026',
    email: 'mrodriguez@universidad.edu',
    cargo: 'Profesora Asociada',
  },
  {
    id: '3',
    nombre: 'Mg. José Antonio Silva',
    codigo: 'DOC-2024-003',
    facultad: 'Derecho',
    estado: 'expirado',
    ultimaMarcacion: '08/02/2026 14:30',
    fechaCreacion: '10/12/2025',
    fechaExpiracion: '09/02/2026',
    email: 'jsilva@universidad.edu',
    cargo: 'Profesor Auxiliar',
  },
  {
    id: '4',
    nombre: 'Lic. Ana Patricia Torres',
    codigo: 'DOC-2024-004',
    facultad: 'Economía',
    estado: 'activo',
    ultimaMarcacion: '10/02/2026 09:00',
    fechaCreacion: '15/01/2026',
    fechaExpiracion: '14/03/2026',
    email: 'atorres@universidad.edu',
    cargo: 'Profesora Asociada',
  },
  {
    id: '5',
    nombre: 'Dr. Roberto Fernández Cruz',
    codigo: 'DOC-2024-005',
    facultad: 'Ingeniería',
    estado: 'revocado',
    ultimaMarcacion: '05/02/2026 16:20',
    fechaCreacion: '05/01/2026',
    fechaExpiracion: '04/03/2026',
    email: 'rfernandez@universidad.edu',
    cargo: 'Profesor Principal',
  },
  {
    id: '6',
    nombre: 'Mg. Laura Beatriz Campos',
    codigo: 'DOC-2024-006',
    facultad: 'Educación',
    estado: 'activo',
    ultimaMarcacion: '10/02/2026 08:30',
    fechaCreacion: '20/01/2026',
    fechaExpiracion: '19/03/2026',
    email: 'lcampos@universidad.edu',
    cargo: 'Profesora Auxiliar',
  },
  {
    id: '7',
    nombre: 'Dr. Fernando Ramirez Lopez',
    codigo: 'DOC-2024-007',
    facultad: 'Medicina',
    estado: 'activo',
    ultimaMarcacion: '10/02/2026 10:15',
    fechaCreacion: '18/01/2026',
    fechaExpiracion: '17/03/2026',
    email: 'framirez@universidad.edu',
    cargo: 'Profesor Principal',
  },
  {
    id: '8',
    nombre: 'Lic. Carmen Rosa Diaz',
    codigo: 'DOC-2024-008',
    facultad: 'Derecho',
    estado: 'expirado',
    ultimaMarcacion: '09/02/2026 13:45',
    fechaCreacion: '08/12/2025',
    fechaExpiracion: '07/02/2026',
    email: 'cdiaz@universidad.edu',
    cargo: 'Profesora Asociada',
  },
]);

/** Filters */
const searchTerm = ref('');
const selectedFacultad = ref('');
const selectedEstado = ref<QrStatus | ''>('');

/** Drawer */
const selectedTeacher = ref<TeacherQr | null>(null);
const isDrawerOpen = ref(false);

const facultades = computed(() => {
  const list = teachers.value.map((t) => t.facultad);
  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
});

const hasFilters = computed(() => !!searchTerm.value || !!selectedFacultad.value || !!selectedEstado.value);

const filteredTeachers = computed(() => {
  const q = searchTerm.value.trim().toLowerCase();

  return teachers.value.filter((t) => {
    const matchesSearch = q ? t.nombre.toLowerCase().includes(q) : true;
    const matchesFacultad = selectedFacultad.value ? t.facultad === selectedFacultad.value : true;
    const matchesEstado = selectedEstado.value ? t.estado === selectedEstado.value : true;

    return matchesSearch && matchesFacultad && matchesEstado;
  });
});

/** Stats cards (4) */
const statsCards = computed<StatsCard[]>(() => {
  const activos = teachers.value.filter((t) => t.estado === 'activo').length;
  const expirados = teachers.value.filter((t) => t.estado === 'expirado').length;
  const revocados = teachers.value.filter((t) => t.estado === 'revocado').length;

  return [
    {
      title: 'QR Activos',
      value: String(activos),
      icon: 'qrcode',
      tone: 'success',
    },
    {
      title: 'QR Expirados',
      value: String(expirados),
      icon: 'qrcode',
      tone: 'warning',
    },
    {
      title: 'QR Revocados',
      value: String(revocados),
      icon: 'qrcode',
      tone: 'danger',
    },
    {
      title: 'Total Docentes',
      value: String(teachers.value.length),
      subtitle: `${activos} activos`, // 👈 ahora sí válido
      icon: 'qrcode',
      tone: 'primary',
    },
  ];
});

/** Helpers */
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join('');

const qrStatusLabel = (s: QrStatus) => {
  if (s === 'activo') return 'Activo';
  if (s === 'expirado') return 'Expirado';
  return 'Revocado';
};

const qrStatusIcon = (s: QrStatus) => {
  if (s === 'activo') return 'check-circle';
  if (s === 'expirado') return 'clock';
  return 'ban';
};

const qrBadgeClass = (s: QrStatus) => ({
  'badge--active': s === 'activo',
  'badge--expired': s === 'expirado',
  'badge--revoked': s === 'revocado',
  'badge--head': false,
});

/** Actions */
const openDetail = (t: TeacherQr) => {
  selectedTeacher.value = t;
  isDrawerOpen.value = true;
};

// const closeDrawer = () => {
//   isDrawerOpen.value = false;
//   selectedTeacher.value = null;
// };

const handleResetFilters = () => {
  searchTerm.value = '';
  selectedFacultad.value = '';
  selectedEstado.value = '';
};

const handleRegenerate = (t: TeacherQr) => {
  const ok = confirm(`¿Está seguro de regenerar el QR de ${t.nombre}?`);
  if (!ok) return;

  // aquí llamas tu servicio real
  // alert(`Regenerar QR para: ${t.nombre}`);
};

const handleExportOne = (t: TeacherQr) => {
  // aquí llamas tu export real (png/pdf)
  // alert(`Exportar/Descargar QR de: ${t.nombre}`);
};

const handleBlock = (t: TeacherQr) => {
  const ok = confirm(`¿Está seguro de bloquear el QR de ${t.nombre}?`);
  if (!ok) return;

  // aquí llamas tu servicio real
  // alert(`QR bloqueado para: ${t.nombre}`);
};

const handleExportAll = () => {
  // alert('Exportar todo (pendiente: implementar)');
};

const handleMassGenerate = () => {
  // alert('Generar QR masivo (pendiente: implementar)');
};

onMounted(() => {
  const headerStorage = useHeaderStore();
  headerStorage.module = { name: 'Gestión docente', url: '' };
  headerStorage.moduleItem = { name: title, url: '' };
  headerStorage.moduleSubItem = { name: '', url: '' };
});
</script>

<style scoped>
/* Header */
.pageHeader {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 16px;
}
.pageHeader__left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pageHeader__title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}
.pageHeader__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}
.pageHeader__right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.pageHeader__btnPrimary {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: #fff !important;
}
.pageHeader__btnPrimary:hover {
  filter: brightness(0.95);
}
.pageBody {
  padding: 18px 0 22px;
}

/* Dashboard cards */
.cards-dashboard-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 16px;
}
@media (min-width: 768px) {
  .cards-dashboard-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }
}
.container-custom-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}
.dashCard__title {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
}
.dashCard__body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}
.dashCard__left {
  min-width: 0;
}
.dashCard__value {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  word-break: break-word;
}
.dashCard__subtitle {
  margin: 8px 0 0;
  font-size: 13px;
  color: #64748b;
}
.dashCard__iconBox {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dashCard__icon {
  font-size: 18px;
}

/* tones */
.dashCard__iconBox--primary {
  background: rgba(var(--color-primary-rgb), 0.12);
}
.dashCard__icon--primary {
  color: var(--color-primary);
}
.dashCard__iconBox--success {
  background: rgba(34, 197, 94, 0.14);
}
.dashCard__icon--success {
  color: #16a34a;
}
.dashCard__iconBox--warning {
  background: rgba(245, 158, 11, 0.16);
}
.dashCard__icon--warning {
  color: #d97706;
}
.dashCard__iconBox--danger {
  background: rgba(239, 68, 68, 0.14);
}
.dashCard__icon--danger {
  color: #dc2626;
}

/* Filters card */
.filtersCard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  margin-bottom: 14px;
}
.filtersHead {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.filtersHead__icon {
  font-size: 14px;
  color: #475569;
}
.filtersHead__title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.filtersGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 768px) {
  .filtersGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: end;
  }
}
.filterItem {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filterLabel {
  font-size: 12px;
  font-weight: 800;
  color: #334155;
}
.filterControl {
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  background: #fff;
}
.filterControl:focus {
  border-color: rgba(var(--color-primary-rgb), 0.7);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.14);
}
.filterActions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
@media (min-width: 768px) {
  .filterActions {
    justify-content: flex-end;
    grid-column: 4 / 5;
  }
}
.filtersFooter {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.filtersFooter__text {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
.filtersFooter__count {
  font-weight: 900;
  color: #0f172a;
}
.filtersFooter__link {
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  color: var(--color-primary);
  cursor: pointer;
}
.filtersFooter__link:hover {
  filter: brightness(0.95);
}

/* search input with icon */
.filterInputWrap {
  position: relative;
}
.filterInputIcon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}
.filterControl--withIcon {
  padding-left: 34px;
}

/* Table */
.tableCard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}
.th {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 900;
}
.td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.th--right {
  text-align: right;
}
.td--right {
  text-align: right;
}
.qrTable :deep(.p-datatable-table) {
  width: 100%;
}
.qrTable :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}
.qrTable :deep(.p-paginator) {
  border-top: 1px solid #e2e8f0;
}

/* Teacher cell */
.teacherCell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.teacherCell__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.teacherCell__name {
  font-weight: 900;
  color: #0f172a;
}
.teacherCell__email {
  font-size: 12px;
  color: #64748b;
}
.avatarCircle {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatarText {
  font-size: 12px;
  font-weight: 900;
  color: var(--color-primary);
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid transparent;
}
.badge__inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.badgeIcon {
  font-size: 12px;
}
.badge--active {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge--expired {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}
.badge--revoked {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

/* Drawer (Sheet) */
.sheetHead,
.sheetBody,
.sheetFooter {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.35;
}
.sheetHead {
  background: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 2px 0 6px;
}
.sheetHead__titleBox {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sheetHead__title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}
.sheetHead__desc {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}
.sheetHead__teacher {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.teacherRow {
  display: flex;
  gap: 10px;
  align-items: center;
}
.iconCircle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.iconCircle--glass {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.k {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 700;
}
.v {
  margin: 2px 0 0;
  font-size: 13px;
  color: #fff;
  font-weight: 800;
}
.headMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 6px;
}
.headMeta__item {
  display: flex;
  gap: 10px;
  align-items: center;
}
.metaIcon {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}
.badge--head {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.22) !important;
  color: #fff !important;
}

/* Body */
.sheetBody {
  padding: 14px;
}
.qrBox {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 768px) {
  .qrBox {
    grid-template-columns: 280px 1fr;
    align-items: start;
  }
}
.qrBox__canvas {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.qrSvg {
  border: 2px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
}
.qrInfo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.qrInfo__card {
  background: rgba(var(--color-primary-rgb), 0.06);
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 14px;
  padding: 12px;
}
.qrInfo__row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.qrInfo__row:last-child {
  border-bottom: none;
}
.qrInfo__k {
  font-weight: 800;
  color: #64748b;
  font-size: 12px;
}
.qrInfo__v {
  font-weight: 900;
  color: #0f172a;
  font-size: 12px;
  text-align: right;
}
.qrInfo__dates {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 768px) {
  .qrInfo__dates {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.datePill {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.datePill__icon {
  color: #475569;
  font-size: 14px;
}
.datePill__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.datePill__k {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
}
.datePill__v {
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
}

/* Footer */
.sheetFooter {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.sheetFooter__btnPrimary {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: #fff !important;
}
.sheetFooter__btnPrimary:hover {
  filter: brightness(0.95);
}
</style>
