<template>
  <AppBaseList title="Boletas de Pago">
    <template #content>
      <!-- Header -->
      <!-- <div class="pageHeader">
        <div class="pageHeader__left">
          <p class="pageHeader__subtitle">
            Consulta y gestiona el historial de tus pagos académicos
          </p>
        </div>
      </div> -->

      <div class="pageBody">
        <!-- Summary Cards (3) -->
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
          <div class="filtersGrid">
            <div class="filterItem">
              <label class="filterLabel">Buscar</label>
              <input v-model="searchTerm" class="filterControl" placeholder="Ej: 2026-01 o PS-00012" type="text" />
            </div>

            <div class="filterItem">
              <label class="filterLabel">Tipo de contrato</label>
              <select v-model="contractTypeFilter" class="filterControl">
                <option value="all">Todos</option>
                <option value="permanent">Planta</option>
                <option value="hourly">Por Hora</option>
              </select>
            </div>

            <div class="filterItem">
              <label class="filterLabel">Estado</label>
              <select v-model="statusFilter" class="filterControl">
                <option value="all">Todos</option>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            <div class="filterItem">
              <label class="filterLabel">Año</label>
              <select v-model="yearFilter" class="filterControl">
                <option value="all">Todos</option>
                <option v-for="y in availableYears" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </div>

            <div class="filterActions">
              <AppButton type="button" @click="handleResetFilters">
                <AppIcon icon="trash" />
                Limpiar filtros
              </AppButton>
            </div>
          </div>
        </div>

        <!-- Table header -->
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
          <p class="tw-text-sm tw-text-slate-600">
            Mostrando
            <span class="tw-font-semibold">{{ filteredPayslips.length }}</span>
            de
            <span class="tw-font-semibold">{{ payslips.length }}</span>
            boletas
          </p>
        </div>

        <!-- Table -->
        <!-- Table -->
        <div class="tableCard">
          <DataTable
            :value="filteredPayslips"
            dataKey="id"
            responsiveLayout="scroll"
            :paginator="filteredPayslips.length > 0"
            :rows="10"
            :rowsPerPageOptions="[10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            class="payslipsTable"
          >
            <!-- Empty -->
            <template #empty>
              <div class="tw-py-10">
                <AppEmptyResponse title="Sin resultados" description="No hay boletas con los filtros actuales." />
              </div>
            </template>

            <!-- Boleta -->
            <Column field="id" header="BOLETA" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span class="tw-font-semibold tw-text-slate-900">{{ data.id }}</span>
              </template>
            </Column>

            <!-- Periodo -->
            <Column field="period" header="PERIODO" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                {{ data.period }}
              </template>
            </Column>

            <!-- Contrato -->
            <Column header="CONTRATO" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span class="tw-inline-flex tw-items-center tw-gap-2">
                  <span class="tw-h-2 tw-w-2 tw-rounded-full tw-bg-slate-300"></span>
                  {{ contractTypeLabel(data.contractType) }}
                </span>
              </template>
            </Column>

            <!-- Fecha pago -->
            <Column header="FECHA DE PAGO" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                {{ formatDate(data.paymentDate) }}
              </template>
            </Column>

            <!-- Estado -->
            <Column header="ESTADO" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span class="badge" :class="statusBadgeClass(data.status)">
                  {{ statusLabel(data.status) }}
                </span>
              </template>
            </Column>

            <!-- Neto -->
            <Column header="NETO" headerClass="th th--right" bodyClass="td td--right">
              <template #body="{ data }">
                <span class="tw-font-semibold">{{ money(data.totalNet) }}</span>
              </template>
            </Column>

            <!-- Acciones -->
            <Column header="ACCIONES" headerClass="th th--right" bodyClass="td td--right">
              <template #body="{ data }">
                <div class="tw-flex tw-justify-end tw-gap-2">
                  <AppButton type="button" @click="handleViewDetails(data)" icon="eye" v-tooltip="'Ver'" />
                  <AppButton type="button" @click="downloadPayslip(data)" icon="file-download" v-tooltip="'descargar pdf'" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Drawer (AppDrawer) - estilo Sheet -->
        <AppDrawer v-model:isVisible="isDrawerOpen" size="lg" exportId="payslip-drawer-export">
          <!-- HEAD (fijo) -->
          <template #head>
            <div class="payslipSheetHead">
              <div class="payslipSheetHead__titleBox">
                <span class="payslipSheetHead__title">Detalle de Boleta</span>
                <span class="payslipSheetHead__desc">
                  Información detallada de la boleta de pago para
                  {{ teacher.name }}.
                </span>
              </div>

              <div v-if="selectedPayslip" class="payslipSheetHead__teacher">
                <div class="teacherRow">
                  <div class="iconCircle iconCircle--blue">
                    <AppIcon icon="user" />
                  </div>
                  <div class="teacherRow__text">
                    <span class="k">Docente: </span>
                    <span class="v">{{ teacher.name }}</span>
                  </div>
                </div>

                <div class="headMeta">
                  <div class="headMeta__item">
                    <AppIcon icon="calendar" class="metaIcon" />
                    <div>
                      <span class="k">Periodo: </span>
                      <span class="v">{{ selectedPayslip.period }}</span>
                    </div>
                  </div>

                  <span class="badge badge--head" :class="statusBadgeClass(selectedPayslip.status)">
                    <span class="badge__inner">
                      <AppIcon :icon="selectedPayslip.status === 'paid' ? 'check-circle' : 'clock'" class="badgeIcon" />
                      {{ statusLabel(selectedPayslip.status) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- BODY -->
          <template #body>
            <div v-if="selectedPayslip" class="payslipSheetBody">
              <!-- Información General -->
              <div class="section">
                <div class="section__head">
                  <AppIcon icon="file-alt" class="section__icon" />
                  <span class="section__title">Información General</span>
                </div>

                <div class="infoCard">
                  <div class="row">
                    <span class="row__k">ID de Boleta:</span>
                    <span class="row__v row__mono">{{ selectedPayslip.id }}</span>
                  </div>

                  <div class="sep"></div>

                  <div class="row">
                    <span class="row__k">Tipo de Contrato:</span>
                    <span class="badge badge--muted">
                      <span class="badge__inner">
                        <AppIcon :icon="selectedPayslip.contractType === 'permanent' ? 'building2' : 'clock'" class="badgeIcon" />
                        {{ contractTypeLabel(selectedPayslip.contractType) }}
                      </span>
                    </span>
                  </div>

                  <div class="sep"></div>

                  <div class="row">
                    <span class="row__k">Fecha de Pago:</span>
                    <span class="row__v">{{ formatDateLong(selectedPayslip.paymentDate) }}</span>
                  </div>

                  <div class="sep"></div>

                  <div class="row">
                    <span class="row__k">Departamento:</span>
                    <span class="row__v">{{ teacher.department }}</span>
                  </div>
                </div>
              </div>

              <!-- Desglose de Pago (idéntico lógica React) -->
              <div class="section">
                <div class="section__head">
                  <AppIcon icon="credit-card" class="section__icon" />
                  <h4 class="section__title">Desglose de Pago</h4>
                </div>

                <!-- HOURLY -->
                <div v-if="selectedPayslip.contractType === 'hourly' && selectedPayslip.hourlyDetails" class="hourlyBox">
                  <div class="hourlyBox__top">
                    <div class="hourlyBox__title">
                      <div class="iconCircle iconCircle--blue">
                        <AppIcon icon="clock" />
                      </div>
                      <span>Horas Trabajadas</span>
                    </div>

                    <span class="hourlyBox__hours"> {{ selectedPayslip.hourlyDetails.hours }} hrs </span>
                  </div>

                  <div class="row row--small">
                    <span class="row__k">Valor por hora:</span>
                    <span class="row__v">{{ money(selectedPayslip.hourlyDetails.ratePerHour) }}</span>
                  </div>

                  <div class="sep sep--blue"></div>

                  <div class="row row--small">
                    <span class="row__k">Subtotal:</span>
                    <span class="row__v row__v--big">{{ money(selectedPayslip.totalGross) }}</span>
                  </div>
                </div>

                <!-- PERMANENT -->
                <div v-if="selectedPayslip.contractType === 'permanent' && selectedPayslip.permanentDetails" class="permanentBox">
                  <!-- Base -->
                  <div class="baseCard">
                    <div class="baseCard__left">
                      <div class="iconCircle iconCircle--green">
                        <AppIcon icon="building2" />
                      </div>
                      <span class="baseCard__label">Salario Base</span>
                    </div>
                    <span class="baseCard__value">
                      {{ money(selectedPayslip.permanentDetails.baseSalary) }}
                    </span>
                  </div>

                  <!-- Bonuses -->
                  <div v-if="selectedPayslip.permanentDetails.bonuses.length" class="listBlock">
                    <span class="listBlock__title">
                      <span class="dot dot--green"></span>
                      Bonificaciones
                    </span>

                    <div class="listBlock__list">
                      <div v-for="(b, i) in selectedPayslip.permanentDetails.bonuses" :key="i" class="itemRow itemRow--green">
                        <span class="itemRow__k">{{ b.name }}</span>
                        <span class="itemRow__v">+{{ money(b.amount) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Deductions -->
                  <div v-if="selectedPayslip.permanentDetails.deductions.length" class="listBlock">
                    <span class="listBlock__title">
                      <span class="dot dot--red"></span>
                      Deducciones
                    </span>

                    <div class="listBlock__list">
                      <div v-for="(d, i) in selectedPayslip.permanentDetails.deductions" :key="i" class="itemRow itemRow--red">
                        <span class="itemRow__k">{{ d.name }}</span>
                        <span class="itemRow__v">-{{ money(d.amount) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Total Gross -->
                  <div class="grossTotal">
                    <span class="grossTotal__k">Total Bruto:</span>
                    <span class="grossTotal__v">
                      {{ money(selectedPayslip.totalGross) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Total Neto resaltado -->
              <div class="netHighlight">
                <div class="netHighlight__top">
                  <span class="netHighlight__k">Total Neto a Pagar</span>
                  <AppIcon v-if="selectedPayslip.status === 'paid'" icon="check-circle" class="netHighlight__ok" />
                </div>
                <div class="netHighlight__v">
                  {{ money(selectedPayslip.totalNet) }}
                </div>
              </div>
            </div>
          </template>

          <!-- FOOTER -->
          <template #footer>
            <div class="payslipSheetFooter">
              <AppButton class="payslipSheetFooter__btnPrimary" type="button" @click="downloadPayslip(selectedPayslip!)"> Descargar PDF </AppButton>

              <AppButton type="button" outlined @click="closeDrawer"> Cerrar </AppButton>
            </div>
          </template>
        </AppDrawer>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
/** ✅ PrimeVue */
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { nextTick } from 'vue';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useHeaderStore } from '../../../stores/header.store';

dayjs.locale('es');

/** -----------------------------
 * Types (alineados al drawer React)
 * ------------------------------*/
type PaymentStatus = 'paid' | 'pending';
type ContractType = 'permanent' | 'hourly';

type PayslipHourlyDetails = {
  hours: number;
  ratePerHour: number;
};

type PayslipPermanentItem = {
  name: string;
  amount: number;
};

type PayslipPermanentDetails = {
  baseSalary: number;
  bonuses: PayslipPermanentItem[];
  deductions: PayslipPermanentItem[];
};

type Payslip = {
  id: string;
  period: string;
  contractType: ContractType;
  status: PaymentStatus;
  paymentDate: string;

  totalGross: number;
  totalNet: number;

  hourlyDetails?: PayslipHourlyDetails;
  permanentDetails?: PayslipPermanentDetails;
};

type Teacher = {
  name: string;
  department: string;
  initials: string;
};

export default defineComponent({
  name: 'PayslipsTeacherPage',
  components: {
    AppBaseList,
    AppButton,
    AppIcon,
    AppEmptyResponse,
    AppCardDashboard,
    AppDrawer,
    DataTable,
    Column,
  },
  setup() {
    const title = 'Boletas de pago docentes';

    /** -----------------------------
     * Mock data (igual estilo del drawer React)
     * ------------------------------*/
    const teacher = ref<Teacher>({
      name: 'Carlos Celis',
      department: 'Facultad de derecho',
      initials: 'CC',
    });

    const payslips = ref<Payslip[]>([
      {
        id: 'PS-00021',
        period: '2026-01',
        contractType: 'permanent',
        status: 'paid',
        paymentDate: '2026-02-05T16:33:35.000Z',
        permanentDetails: {
          baseSalary: 5200000,
          bonuses: [
            { name: 'Bonificación por desempeño', amount: 250000 },
            { name: 'Auxilio de conectividad', amount: 120000 },
          ],
          deductions: [
            { name: 'Salud', amount: 210000 },
            { name: 'Pensión', amount: 260000 },
            { name: 'Retención en la fuente', amount: 180000 },
          ],
        },
        totalGross: 5200000 + 250000 + 120000,
        totalNet: 5200000 + 250000 + 120000 - (210000 + 260000 + 180000),
      },
      {
        id: 'PS-00020',
        period: '2025-12',
        contractType: 'hourly',
        status: 'pending',
        paymentDate: '2026-01-05T16:33:35.000Z',
        hourlyDetails: { hours: 96, ratePerHour: 35000 },
        totalGross: 96 * 35000,
        totalNet: 96 * 35000,
      },
      {
        id: 'PS-00019',
        period: '2025-11',
        contractType: 'permanent',
        status: 'paid',
        paymentDate: '2025-12-10T16:33:35.000Z',
        permanentDetails: {
          baseSalary: 5200000,
          bonuses: [{ name: 'Bonificación académica', amount: 180000 }],
          deductions: [
            { name: 'Salud', amount: 210000 },
            { name: 'Pensión', amount: 260000 },
            { name: 'Libranza', amount: 150000 },
          ],
        },
        totalGross: 5200000 + 180000,
        totalNet: 5200000 + 180000 - (210000 + 260000 + 150000),
      },
      {
        id: 'PS-00018',
        period: '2025-10',
        contractType: 'hourly',
        status: 'pending',
        paymentDate: '2025-11-10T16:33:35.000Z',
        hourlyDetails: { hours: 72, ratePerHour: 38000 },
        totalGross: 72 * 38000,
        totalNet: 72 * 38000,
      },
    ]);

    /** -----------------------------
     * Filters
     * ------------------------------*/
    const searchTerm = ref('');
    const contractTypeFilter = ref<ContractType | 'all'>('all');
    const statusFilter = ref<PaymentStatus | 'all'>('all');
    const yearFilter = ref<string | 'all'>('all');

    /** Drawer state */
    const selectedPayslip = ref<Payslip | null>(null);
    const isDrawerOpen = ref(false);

    /** -----------------------------
     * Helpers (arrow)
     * ------------------------------*/
    const money = (value: number) => {
      return value.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      });
    };

    const formatDate = (iso: string) => dayjs(iso).format('DD MMM YYYY');

    const formatDateLong = (date: string) => dayjs(date).format('D [de] MMMM [de] YYYY');

    const contractTypeLabel = (t: ContractType) => (t === 'permanent' ? 'Planta' : 'Por Hora');

    const statusLabel = (s: PaymentStatus) => (s === 'paid' ? 'Pagado' : 'Pendiente');

    const statusBadgeClass = (s: PaymentStatus) => ({
      'badge--paid': s === 'paid',
      'badge--pending': s === 'pending',
    });

    /** -----------------------------
     * Computeds
     * ------------------------------*/
    const availableYears = computed(() => {
      const years = payslips.value.map((p) => new Date(p.paymentDate).getFullYear().toString());
      return Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a));
    });

    const filteredPayslips = computed(() => {
      return payslips.value.filter((p) => {
        const matchesSearch = p.period.toLowerCase().includes(searchTerm.value.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.value.toLowerCase());

        const matchesContract = contractTypeFilter.value === 'all' || p.contractType === contractTypeFilter.value;

        const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value;

        const y = new Date(p.paymentDate).getFullYear().toString();
        const matchesYear = yearFilter.value === 'all' || y === yearFilter.value;

        return matchesSearch && matchesContract && matchesStatus && matchesYear;
      });
    });
    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Boletas de pago', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });
    /** Summary cards (igual a React) */
    const statsCards = computed(() => {
      const currentYear = new Date().getFullYear();

      const yearlyTotal = payslips.value.filter((p) => new Date(p.paymentDate).getFullYear() === currentYear && p.status === 'paid').reduce((sum, p) => sum + p.totalNet, 0);

      const lastPayment = [...payslips.value].filter((p) => p.status === 'paid').sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];

      const pendingPayments = payslips.value.filter((p) => p.status === 'pending');
      const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.totalNet, 0);

      return [
        {
          title: `Total ganado en ${currentYear}`,
          value: money(yearlyTotal),
          icon: 'chart-line', // ajusta al nombre real en tu AppIcon
          tone: 'primary',
        },
        {
          title: 'Último pago',
          value: lastPayment ? money(lastPayment.totalNet) : 'N/A',
          subtitle: lastPayment?.period,
          icon: 'dollar-sign',
          tone: 'success',
        },
        {
          title: 'Pagos pendientes',
          value: pendingPayments.length.toString(),
          subtitle: pendingTotal > 0 ? money(pendingTotal) : undefined,
          icon: 'clock',
          tone: 'warning',
        },
        {
          title: 'Total de boletas',
          value: payslips.value.length.toString(),
          subtitle: `${payslips.value.filter((p) => p.status === 'paid').length} pagadas`,
          icon: 'file-alt',
          tone: 'secondary',
        },
      ];
    });

    /** -----------------------------
     * Actions (arrow)
     * ------------------------------*/
    const handleViewDetails = (p: Payslip) => {
      selectedPayslip.value = p;
      isDrawerOpen.value = true;
    };

    const closeDrawer = () => {
      isDrawerOpen.value = false;
      selectedPayslip.value = null;
    };

    const handleResetFilters = () => {
      searchTerm.value = '';
      contractTypeFilter.value = 'all';
      statusFilter.value = 'all';
      yearFilter.value = 'all';
    };

    const downloadPayslip = async (p: Payslip) => {
      // Asegura que el drawer tenga el payslip correcto
      selectedPayslip.value = p;

      // Si no está abierto, ábrelo para renderizar el contenido
      if (!isDrawerOpen.value) {
        isDrawerOpen.value = true;
      }

      // Espera render del drawer + DOM listo
      await nextTick();
      await new Promise((r) => requestAnimationFrame(() => r(true)));

      const el = document.getElementById('payslip-drawer-export');

      if (!el) {
        console.error('No se encontró el contenedor del drawer para exportar');
        return;
      }

      // Captura el DOM (ocultando cosas como el botón cerrar)
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        ignoreElements: (node) => (node as HTMLElement)?.dataset?.exportHide === 'true',
      });

      const imgData = canvas.toDataURL('image/png');

      // PDF tamaño A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Ajuste de escala para que encaje en el ancho del PDF
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Si el contenido es largo, agrega páginas
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Nombre del archivo
      pdf.save(`Boleta-${p.id}.pdf`);
    };

    return {
      // data
      teacher,
      payslips,

      // filters
      searchTerm,
      contractTypeFilter,
      statusFilter,
      yearFilter,

      // drawer
      selectedPayslip,
      isDrawerOpen,

      // computed
      availableYears,
      filteredPayslips,
      statsCards,

      // helpers
      money,
      formatDate,
      formatDateLong,
      contractTypeLabel,
      statusLabel,
      statusBadgeClass,

      // actions
      handleViewDetails,
      closeDrawer,
      handleResetFilters,
      downloadPayslip,
    };
  },
});
</script>

<style scoped>
/* Header */
.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.pageHeader__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}
/* .pageBody {
  padding: 18px 0 22px;
} */

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
  background: rgba(var(--color-primary-rgb), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dashCard__icon {
  font-size: 18px;
  color: var(--color-primary);
}

/* Filters card */
.filtersCard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  margin-bottom: 14px;
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
.tr:hover {
  background: #f8fafc;
}
.td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800; /* ✅ normalizado */
  border: 1px solid transparent;
}
.badge--paid {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge--pending {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

/* =========================
  Sheet-like Drawer content
========================= */

/* ✅ Tipografía normalizada del drawer (igual a plataforma) */
.payslipSheetHead,
.payslipSheetBody,
.payslipSheetFooter {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.35;
}

/* ✅ Head SIN fondo blanco + texto blanco (porque el drawer ya es primary) */
.payslipSheetHead {
  background: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 2px 0 6px;
}

.payslipSheetHead__titleBox {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ✅ Título (más “plataforma”) */
.payslipSheetHead__title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

/* ✅ Descripción clara sobre fondo primary */
.payslipSheetHead__desc {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600; /* ✅ antes 700 */
}

/* Bloque docente */
.payslipSheetHead__teacher {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* teacher row */
.teacherRow {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 🔁 icon circle adaptado a primary (sin azul quemado) */
.iconCircle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.iconCircle :deep(svg),
.iconCircle :deep(i) {
  font-size: 14px;
}

/* ✅ sobre fondo primary, estos círculos deben ser “claros” */
.iconCircle--blue,
.iconCircle--green,
.iconCircle--red {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

/* ✅ k/v más “plataforma” */
.teacherRow__text .k,
.k {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 700; /* ✅ antes 800 */
  letter-spacing: normal;
  text-transform: none;
}
.teacherRow__text .v,
.v {
  margin: 2px 0 0;
  font-size: 13px; /* ✅ antes 14px en teacher */
  color: #fff;
  font-weight: 800; /* ✅ antes 900 */
}

/* meta row */
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

/* ✅ ícono de meta en blanco suave */
.metaIcon {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

/* badge dentro del head */
.badge--head {
  padding: 6px 10px;
}

/* ✅ badge en head con “glass” para que se lea sobre primary */
.badge--head.badge--paid,
.badge--head.badge--pending {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* íconos dentro del badge */
.badge__inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.badgeIcon {
  font-size: 12px;
  color: #fff;
}

/* Body scroll area feel */
.payslipSheetBody {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Sections */
.section__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.section__icon {
  color: #475569;
  font-size: 14px;
}
.section__title {
  margin: 0;
  font-size: 16px; /* ✅ antes 14px */
  font-weight: 800; /* ✅ antes 900 */
  color: #0f172a;
}

/* General info card */
.infoCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.row--small .row__k,
.row--small .row__v {
  font-size: 13px;
}
.row__k {
  font-size: 13px;
  font-weight: 700; /* ✅ antes 800 */
  color: #64748b;
}
.row__v {
  font-size: 13px;
  font-weight: 800; /* ✅ antes 900 */
  color: #0f172a;
}
.row__v--big {
  font-size: 16px;
}
.row__mono {
  font-family: inherit; /* ✅ antes monospace (opcional) */
  letter-spacing: 0.2px;
}
.sep {
  height: 1px;
  background: #e2e8f0;
}
.sep--blue {
  background: rgba(var(--color-primary-rgb), 0.25);
}

/* Hourly */
.hourlyBox {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.08), rgba(var(--color-primary-rgb), 0.16));
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hourlyBox__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.hourlyBox__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800; /* ✅ antes 900 */
  color: #334155;
  font-size: 13px;
}
.hourlyBox__hours {
  font-size: 18px;
  font-weight: 900;
  color: var(--color-primary);
}

/* Permanent */
.permanentBox {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.baseCard {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.baseCard__left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.baseCard__label {
  font-size: 14px;
  font-weight: 800; /* ✅ antes 900 */
  color: #334155;
}
.baseCard__value {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.listBlock__title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 800; /* ✅ antes 900 */
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.dot--green {
  background: #22c55e;
}
.dot--red {
  background: #ef4444;
}

.listBlock__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.itemRow {
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid transparent;
}
.itemRow__k {
  font-size: 13px;
  font-weight: 700; /* ✅ antes 800 */
  color: #334155;
}
.itemRow__v {
  font-size: 13px;
  font-weight: 900;
}
.itemRow--green {
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.itemRow--green .itemRow__v {
  color: #047857;
}
.itemRow--red {
  background: #fef2f2;
  border-color: #fecaca;
}
.itemRow--red .itemRow__v {
  color: #b91c1c;
}

.grossTotal {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.grossTotal__k {
  font-size: 16px;
  font-weight: 800; /* ✅ antes 900 */
  color: #334155;
}
.grossTotal__v {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

/* Net highlight -> usando primary */
.netHighlight {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 1), rgba(var(--color-primary-rgb), 0.85));
  border-radius: 16px;
  padding: 16px;
  border: 2px solid rgba(var(--color-primary-rgb), 0.45);
  box-shadow: 0 10px 22px rgba(2, 6, 23, 0.18);
}
.netHighlight__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.netHighlight__k {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px; /* ✅ antes 11px */
  font-weight: 700; /* ✅ antes 900 */
  text-transform: none; /* ✅ antes uppercase */
  letter-spacing: normal; /* ✅ antes 0.06em */
}
.netHighlight__v {
  color: #fff;
  font-size: 22px; /* ✅ antes 28px */
  font-weight: 900;
}
.netHighlight__ok {
  color: #86efac;
  font-size: 18px;
}

/* Footer actions */
.payslipSheetFooter {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* ✅ botón primary con var */
.payslipSheetFooter__btnPrimary {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: #fff !important;
}
.payslipSheetFooter__btnPrimary:hover {
  filter: brightness(0.95);
}

/* outlined (si tu AppButton outlined no lo pinta solo) */
.payslipSheetFooter :deep(button.is-outlined),
.payslipSheetFooter :deep(.is-outlined) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.payslipSheetFooter :deep(button.is-outlined:hover),
.payslipSheetFooter :deep(.is-outlined:hover) {
  background: rgba(var(--color-primary-rgb), 0.08);
}

/* badge muted genérico */
.badge--muted {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
}

/* icon box tones (igual idea React bgColor + iconColor) */
.dashCard__iconBox--primary {
  background: rgba(var(--color-primary-rgb), 0.12);
}
.dashCard__icon--primary {
  color: var(--color-primary);
}

/* “success” (verde suave) */
.dashCard__iconBox--success {
  background: rgba(34, 197, 94, 0.14);
}
.dashCard__icon--success {
  color: #16a34a;
}

/* “warning” (ámbar suave) */
.dashCard__iconBox--warning {
  background: rgba(245, 158, 11, 0.16);
}
.dashCard__icon--warning {
  color: #d97706;
}

/* “secondary” usando tu var */
.dashCard__iconBox--secondary {
  background: rgba(var(--color-secondary-rgb), 0.14);
}
.dashCard__icon--secondary {
  color: var(--color-secondary);
}
/* PrimeVue table: respetar look & feel */
.payslipsTable :deep(.p-datatable-table) {
  width: 100%;
}

.payslipsTable :deep(.p-datatable-thead > tr > th) {
  /* usa tus estilos .th */
  border-bottom: 1px solid #e2e8f0;
}

.payslipsTable :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

.th--right {
  text-align: right;
}
.td--right {
  text-align: right;
}

/* Paginator (si quieres que no se vea “raro” con tu diseño) */
.payslipsTable :deep(.p-paginator) {
  border-top: 1px solid #e2e8f0;
}
/* opcional: que el export se vea como hoja */
#payslip-drawer-export {
  background: #fff;
}
</style>
