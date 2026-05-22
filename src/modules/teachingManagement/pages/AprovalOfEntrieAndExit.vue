<template>
  <AppBaseList :title="title">
    <template #content>
      <div class="attendancePage">
        <AppPulseLoading v-if="loading" />

        <template v-else>
          <!-- Header -->

          <!-- Main -->
          <div class="mainGrid">
            <!-- Left -->
            <AppCard>
              <template #title>
                <div class="cardTitleRow">
                  <div class="titleLeft">
                    <AppIcon icon="qrcode" />
                    <span>Zona principal de escaneo QR</span>
                  </div>
                </div>
              </template>

              <template #body>
                <!-- READY -->
                <div v-if="!isScanning" class="scanReadyCard">
                  <div class="scanReadyCard__icon">
                    <AppIcon icon="camera" />
                  </div>

                  <div class="scanReadyCard__content">
                    <h3 class="scanReadyCard__title">Listo para escanear</h3>
                    <p class="scanReadyCard__subtitle">Presione el botón para activar la cámara y escanear el código QR del docente</p>
                  </div>

                  <AppButton type="button" class="btnPrimary btnScanMain" :disabled="appState === 'confirmed'" @click="handleStartScan">
                    <AppIcon icon="camera" />
                    Escanear Código QR
                  </AppButton>

                  <div class="manualEntryBox"></div>
                </div>

                <!-- SCANNING -->
                <div v-else class="scanActiveCard">
                  <div class="scanActiveCard__frame">
                    <div class="scannerFrame">
                      <div class="scannerFrame__inner">
                        <AppIcon v-if="!cameraActive" icon="qrcode" class="scannerFrame__icon" />

                        <div
                          id="qr-reader"
                          class="scannerFrame__reader"
                          :class="{
                            'scannerFrame__reader--active': cameraActive,
                          }"
                        ></div>
                      </div>

                      <span class="corner corner--tl"></span>
                      <span class="corner corner--tr"></span>
                      <span class="corner corner--bl"></span>
                      <span class="corner corner--br"></span>

                      <div class="scannerLine"></div>
                    </div>
                  </div>

                  <div class="scanActiveCard__texts">
                    <p class="scanActiveCard__title">
                      <AppIcon icon="camera" />
                      Cámara activada
                    </p>
                    <p class="scanActiveCard__subtitle">Alinee el código QR del docente dentro del área de escaneo</p>
                  </div>

                  <div class="scanActiveCard__actions">
                    <AppButton type="button" class="btnSecondaryDark" @click="handleStopScan">
                      <AppIcon icon="times" />
                      Cancelar escaneo
                    </AppButton>
                  </div>

                  <!-- <div class="scanDemo">
                    <div class="scanDemo__header">
                      <AppBadge label="Demo" variant="secondary" />
                      <p class="scanDemo__title">Simulación de escaneo</p>
                    </div>

                    <div class="scanDemo__grid">
                      <AppButton style="color: white" type="button" class="demoBtn--primary" @click="handleSimulatedScan(validQrDemo1)"> QR válido 1 </AppButton>

                      <AppButton style="color: white" type="button" class="demoBtn--primary" @click="handleSimulatedScan(validQrDemo2)"> QR válido 2 </AppButton>

                      <AppButton style="color: white" type="button" class="demoBtn--danger" @click="handleSimulatedScan(invalidQrDemo)"> QR inválido </AppButton>
                    </div>
                  </div> -->
                </div>
              </template>
            </AppCard>

            <!-- Right -->
            <AppCard>
              <template #title>
                <div class="cardTitleRow">
                  <div class="titleLeft">
                    <AppIcon icon="clipboard-check" />
                    <span>
                      {{ appState === 'confirmed' ? 'Confirmación del Registro' : 'Validación del Docente' }}
                    </span>
                  </div>
                </div>
              </template>

              <template #body>
                <AppEmptyResponse v-if="appState === 'idle'" title="Esperando escaneo de código QR" subtitle="La información del docente aparecerá aquí" size="xs" :show-image="false" />

                <div v-else-if="appState === 'scanned'" class="validationWrap" :class="statusConfig.wrapperClass">
                  <div class="validationHead" :class="statusConfig.headerClass">
                    <div class="validationHead__icon">
                      <AppIcon :icon="statusConfig.icon" />
                    </div>

                    <div class="validationHead__content">
                      <h3 class="validationHead__title">
                        {{ statusConfig.title }}
                      </h3>
                      <p class="validationHead__text">
                        {{ statusConfig.description }}
                      </p>
                    </div>

                    <AppBadge v-if="qrStatus === 'valid'" label="Activo" variant="success" />
                  </div>

                  <div v-if="scannedTeacher" class="teacherBox">
                    <div class="teacherBox__top">
                      <AppAvatar :name="getScannedFullName(scannedTeacher)" :avatar="''" size="lg" />

                      <div class="teacherBox__main">
                        <h3 class="teacherBox__name">
                          {{ getScannedFullName(scannedTeacher) }}
                        </h3>
                        <p class="teacherBox__faculty">
                          <AppIcon icon="building" />
                          Institución ID:
                          {{ scannedTeacher.institutionId || 'No disponible' }}
                        </p>
                      </div>
                    </div>

                    <div class="teacherBox__meta">
                      <div class="metaCard">
                        <span class="metaCard__label">Documento</span>
                        <strong class="metaCard__value">
                          {{ scannedTeacher.identification || 'No disponible' }}
                        </strong>
                      </div>

                      <div class="metaCard">
                        <span class="metaCard__label">People ID</span>
                        <strong class="metaCard__value">
                          {{ scannedTeacher.peopleId || 'No disponible' }}
                        </strong>
                      </div>

                      <div class="metaCard">
                        <span class="metaCard__label">User ID</span>
                        <strong class="metaCard__value">
                          {{ scannedTeacher.userId || 'No disponible' }}
                        </strong>
                      </div>

                      <div class="metaCard">
                        <span class="metaCard__label">Nombres</span>
                        <strong class="metaCard__value">
                          {{ scannedTeacher.names || 'No disponible' }}
                        </strong>
                      </div>

                      <div class="metaCard">
                        <span class="metaCard__label">Apellidos</span>
                        <strong class="metaCard__value">
                          {{ scannedTeacher.lastnames || 'No disponible' }}
                        </strong>
                      </div>

                      <div class="metaCard">
                        <span class="metaCard__label">ID del QR</span>
                        <strong class="metaCard__value">
                          {{ scannedTeacher.id || 'No disponible' }}
                        </strong>
                      </div>
                    </div>

                    <div v-if="qrStatus === 'valid'" class="selectorBox">
                      <div class="selectorBox__head">
                        <h4 class="selectorBox__title">Seleccione el tipo de registro</h4>
                        <p class="selectorBox__text">Elija si el docente está ingresando o saliendo de la institución</p>
                      </div>

                      <div class="selectorBox__actions">
                        <button type="button" class="actionBtn actionBtn--entry" @click="handleAttendanceTypeSelect('Entrada')">
                          <AppIcon icon="sign-in-alt" />
                          <div>
                            <strong>Registrar Entrada</strong>
                            <span>Ingreso a la institución</span>
                          </div>
                        </button>

                        <button type="button" class="actionBtn actionBtn--exit" @click="handleAttendanceTypeSelect('Salida')">
                          <AppIcon icon="sign-out-alt" />
                          <div>
                            <strong>Registrar Salida</strong>
                            <span>Egreso de la institución</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else class="emptyValidation">
                    <div class="emptyValidation__icon">
                      <AppIcon icon="user" />
                    </div>
                    <div>
                      <p class="emptyValidation__title">
                        {{ statusConfig.emptyTitle }}
                      </p>
                      <p class="emptyValidation__text">Intente nuevamente o contacte al administrador del sistema</p>
                    </div>
                  </div>
                </div>

                <div v-else-if="appState === 'confirmed' && lastRegistration" class="confirmationBox" :class="lastRegistration.type === 'Entrada' ? 'confirmationBox--entry' : 'confirmationBox--exit'">
                  <div class="confirmationBox__header">
                    <div class="confirmationBox__icon">
                      <AppIcon icon="check-circle" />
                    </div>

                    <div>
                      <h3 class="confirmationBox__title">
                        {{ lastRegistration.type === 'Entrada' ? 'Entrada registrada correctamente' : 'Salida registrada correctamente' }}
                      </h3>
                      <p class="confirmationBox__subtitle">El registro se ha guardado exitosamente</p>
                    </div>
                  </div>

                  <div class="confirmationBox__body">
                    <div class="confirmationHighlight">
                      <AppIcon :icon="lastRegistration.type === 'Entrada' ? 'sign-in-alt' : 'sign-out-alt'" />
                      <div>
                        <span>Tipo de registro</span>
                        <strong>{{ lastRegistration.type }}</strong>
                      </div>
                    </div>

                    <div class="confirmationGrid">
                      <div class="confirmationItem confirmationItem--full">
                        <span class="confirmationItem__label">Docente</span>
                        <strong class="confirmationItem__value">
                          {{ lastRegistration.teacherName }}
                        </strong>
                      </div>

                      <div class="confirmationItem">
                        <span class="confirmationItem__label">Fecha</span>
                        <strong class="confirmationItem__value">
                          {{ formatLongDate(lastRegistration.timestamp) }}
                        </strong>
                      </div>

                      <div class="confirmationItem">
                        <span class="confirmationItem__label">Hora</span>
                        <strong class="confirmationItem__value">
                          {{ formatTime(lastRegistration.timestamp) }}
                        </strong>
                      </div>

                      <div class="confirmationItem confirmationItem--full">
                        <span class="confirmationItem__label">Registrado por</span>
                        <strong class="confirmationItem__value">
                          {{ currentUser }}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <!-- Filters -->
          <AppCard class="filtersCard">
            <template #title>
              <div class="cardTitleRow">
                <div class="titleLeft">
                  <AppIcon icon="filter" />
                  <span>Filtros del historial</span>
                </div>
              </div>
            </template>

            <template #body>
              <div class="filtersGrid">
                <AppFormField label="Buscar">
                  <input v-model="search" class="form-control" type="text" placeholder="Nombre o documento" @input="handleFilterChange" />
                </AppFormField>

                <AppFormField label="Tipo de registro">
                  <select v-model="recordType" class="form-control" @change="handleFilterChange">
                    <option value="">Todos</option>
                    <option value="Entrada">Entrada</option>
                    <option value="Salida">Salida</option>
                  </select>
                </AppFormField>

                <AppFormField label="Fecha desde">
                  <input v-model="startDate" class="form-control" type="date" @change="handleFilterChange" />
                </AppFormField>

                <AppFormField label="Fecha hasta">
                  <input v-model="endDate" class="form-control" type="date" @change="handleFilterChange" />
                </AppFormField>
              </div>

              <div class="filtersFooter">
                <div class="filtersResume">
                  Mostrando <strong>{{ filteredRecords.length }}</strong> de <strong>{{ attendanceRecords.length }}</strong> registros
                </div>

                <div class="filtersActions">
                  <AppButton type="button" class="btnLight" @click="handleFilterReset">
                    <AppIcon icon="times-circle" />
                    Limpiar
                  </AppButton>

                  <AppButton type="button" @click="handleExport">
                    <AppIcon icon="file-excel" />
                    Exportar Excel
                  </AppButton>
                </div>
              </div>
            </template>
          </AppCard>

          <!-- Table -->
          <AppDatatable name="approval-of-entries-and-exits-table" :service="service" :params="params" table-title="Historial de registros de asistencia" :defaultSortDirection="'DESC'">
            <AppDatatableColumn field="name" label="Docente" sortable v-slot="{ row }">
              <div class="tableTeacher">
                <AppAvatar :name="row.name" :avatar="''" size="sm" />
                <strong>{{ row.name }}</strong>
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn field="identification" label="Documento" sortable v-slot="{ row }">
              {{ row.identification }}
            </AppDatatableColumn>
            <AppDatatableColumn field="recordType" label="Tipo de registro" sortable v-slot="{ row }">
              <AppBadge :label="row.recordType" class="me-1 mb-1" />
            </AppDatatableColumn>
            <AppDatatableColumn field="campus.name" label="Sede" sortable v-slot="{ row }">
              {{ row.campus?.name }}
            </AppDatatableColumn>

            <AppDatatableColumn field="createdAt" label="Fecha" sortable v-slot="{ row }">
              {{ formatLongDate(row.createdAt) }}
            </AppDatatableColumn>

            <AppDatatableColumn field="createdAt" label="Hora" sortable v-slot="{ row }">
              {{ formatTime(row.createdAt) }}
            </AppDatatableColumn>

            <AppDatatableColumn field="user.userToken" label="Registrado por" sortable v-slot="{ row }">
              {{ row.user?.userToken }}
            </AppDatatableColumn>
          </AppDatatable>
        </template>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { Html5Qrcode } from 'html5-qrcode';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
// import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { CreateOrUpdateMainAssistencesService } from '../../access/services/createOrUpdateMainAssistences.service';
import { GetAprovalOfEntrieAndExitWithPaginationService } from '../services/getAprovalOfEntrieAndExitWithPagination.service';

type AppState = 'idle' | 'scanned' | 'confirmed';
type QRStatus = 'valid' | 'invalid';
type AttendanceType = 'Entrada' | 'Salida';

interface ScannedQrUser {
  id?: number | string | null;
  peopleId?: number | string | null;
  institutionId?: number | string | null;
  userId?: number | string | null;
  names?: string;
  lastnames?: string;
  firstName?: string;
  secondName?: string;
  firstLastname?: string;
  secondLastname?: string;
  identification?: string;
}

interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  documentNumber: string;
  type: AttendanceType;
  timestamp: Date;
  registeredBy: string;
}

interface LastRegistration {
  teacherName: string;
  type: AttendanceType;
  timestamp: Date;
}

interface FilterValues {
  search: string;
  type: 'all' | AttendanceType;
  dateFrom: string;
  dateTo: string;
}
const createOrUpdateMainAssistencesService = new CreateOrUpdateMainAssistencesService();

export default defineComponent({
  name: 'ApprovalOfEntriesAndExits',
  components: {
    AppBaseList,
    AppIcon,
    AppBadge,
    AppAvatar,
    AppEmptyResponse,
    AppPulseLoading,
    AppCard,
    // AppCardDashboard,
    AppButton,
    AppFormField,
    AppDatatable,
    AppDatatableColumn,
  },
  setup() {
    const loading = ref(false);
    const currentUser = ref('admin@universidad.edu');
    const currentDate = ref(new Date());
    const service = new GetAprovalOfEntrieAndExitWithPaginationService();
    const recordType = ref<string>('');
    const startDate = ref<string>('');
    const endDate = ref<string>('');
    const search = ref<string>('');
    const scanner = ref<Html5Qrcode | null>(null);
    const cameraActive = ref(false);

    const appState = ref<AppState>('idle');
    const scannedTeacher = ref<ScannedQrUser | null>(null);
    const qrStatus = ref<QRStatus>('valid');
    const qrInput = ref('');
    const isScanning = ref(false);
    const lastRegistration = ref<LastRegistration | null>(null);
    const title = 'Aprobación de Entradas y Salidas';

    const params = computed(() => ({
      ...(search.value.trim() && { search: search.value.trim() }),
      ...(recordType.value && { recordType: recordType.value }),
      ...(startDate.value && { startDate: startDate.value }),
      ...(endDate.value && { endDate: endDate.value }),
    }));
    const attendanceRecords = ref<AttendanceRecord[]>([
      {
        id: '1001',
        teacherId: '1',
        teacherName: 'María Fernanda López',
        documentNumber: '1023456789',
        type: 'Entrada',
        timestamp: new Date(),
        registeredBy: 'admin@universidad.edu',
      },
      {
        id: '1002',
        teacherId: '2',
        teacherName: 'Carlos Andrés Ramírez',
        documentNumber: '1034567890',
        type: 'Salida',
        timestamp: new Date(),
        registeredBy: 'admin@universidad.edu',
      },
    ]);

    const validQrDemo1 = JSON.stringify({
      id: 3450,
      peopleId: 4113,
      institutionId: 75,
      userId: 3450,
      names: 'jose',
      lastnames: 'perez',
      firstName: 'Jose',
      secondName: 'Alberneth',
      firstLastname: 'Perez',
      secondLastname: 'Lopez',
      identification: '12345678',
    });

    const validQrDemo2 = JSON.stringify({
      id: 5000,
      peopleId: 6000,
      institutionId: 80,
      userId: 5000,
      names: 'María Fernanda',
      lastnames: 'Gómez Ruiz',
      firstName: 'María',
      secondName: 'Fernanda',
      firstLastname: 'Gómez',
      secondLastname: 'Ruiz',
      identification: '1098765432',
    });

    const invalidQrDemo = JSON.stringify({
      id: 9000,
      peopleId: 9001,
      identification: '00000000',
    });

    const formattedCurrentDate = computed(() => {
      return format(currentDate.value, "d 'de' MMMM, yyyy", { locale: es });
    });

    const totalEntries = computed(() => {
      return attendanceRecords.value.filter((item) => item.type === 'Entrada').length;
    });

    const totalExits = computed(() => {
      return attendanceRecords.value.filter((item) => item.type === 'Salida').length;
    });

    const filteredRecords = computed(() => {
      let filtered = [...attendanceRecords.value];

      if (search.value) {
        const searchValue = search.value.toLowerCase();

        filtered = filtered.filter((record) => {
          return record.teacherName.toLowerCase().includes(searchValue) || record.documentNumber.includes(searchValue);
        });
      }

      if (recordType.value !== 'all') {
        filtered = filtered.filter((record) => record.type === recordType.value);
      }

      if (startDate.value || endDate.value) {
        filtered = filtered.filter((record) => {
          const recordDate = new Date(record.timestamp);

          if (startDate.value && endDate.value) {
            return isWithinInterval(recordDate, {
              start: startOfDay(new Date(startDate.value)),
              end: endOfDay(new Date(endDate.value)),
            });
          }

          if (startDate.value) {
            return recordDate >= startOfDay(new Date(startDate.value));
          }

          if (endDate.value) {
            return recordDate <= endOfDay(new Date(endDate.value));
          }

          return true;
        });
      }

      return filtered;
    });

    const statusConfig = computed(() => {
      switch (qrStatus.value) {
        case 'valid':
          return {
            icon: 'check-circle',
            title: 'QR válido - identidad confirmada',
            description: 'El código QR es válido y contiene la información requerida.',
            wrapperClass: 'validationWrap--success',
            headerClass: 'validationHead--success',
            emptyTitle: 'Código QR válido',
          };
        case 'invalid':
          return {
            icon: 'times-circle',
            title: 'QR inválido',
            description: 'El código QR no es válido o no contiene el campo names.',
            wrapperClass: 'validationWrap--danger',
            headerClass: 'validationHead--danger',
            emptyTitle: 'Código QR no válido',
          };
        default:
          return {
            icon: 'exclamation-triangle',
            title: 'Estado desconocido',
            description: 'Error al procesar el código QR.',
            wrapperClass: 'validationWrap--default',
            headerClass: 'validationHead--default',
            emptyTitle: 'Estado desconocido',
          };
      }
    });
    onMounted(async () => {
      loading.value = false;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Géstion docente', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });
    const formatLongDate = (date: Date) => {
      return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
    };

    const formatTime = (date: Date) => {
      return format(new Date(date), 'HH:mm:ss');
    };

    const getScannedFullName = (data: ScannedQrUser | null) => {
      if (!data) return '';

      const fullNameFromParts = [data.firstName, data.secondName, data.firstLastname, data.secondLastname].filter(Boolean).join(' ').trim();

      const fullNameFromNames = [data.names, data.lastnames].filter(Boolean).join(' ').trim();

      return fullNameFromParts || fullNameFromNames || data.names || 'Usuario sin nombre';
    };

    const getScannedDocument = (data: ScannedQrUser | null) => {
      return data?.identification || 'Sin documento';
    };

    const stopCameraScan = async () => {
      try {
        if (scanner.value) {
          await scanner.value.stop();
          await scanner.value.clear();
          scanner.value = null;
        }
      } catch (error) {
        console.error('Error deteniendo cámara:', error);
      } finally {
        cameraActive.value = false;
        isScanning.value = false;
      }
    };

    const startCameraScan = async () => {
      try {
        if (appState.value === 'confirmed') return;

        cameraActive.value = true;
        await nextTick();

        const readerElement = document.getElementById('qr-reader');
        if (!readerElement) {
          console.error('No existe #qr-reader en el DOM');
          cameraActive.value = false;
          isScanning.value = false;
          return;
        }

        if (scanner.value) {
          await stopCameraScan();
          cameraActive.value = true;
          await nextTick();
        }

        scanner.value = new Html5Qrcode('qr-reader');

        await scanner.value.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            qrInput.value = decodedText;
            handleQRScan(decodedText);
            stopCameraScan();
          },
          () => {}
        );
      } catch (error) {
        console.error('Error iniciando cámara:', error);
        cameraActive.value = false;
        isScanning.value = false;
      }
    };

    const handleStartScan = async () => {
      if (appState.value === 'confirmed') return;
      isScanning.value = true;
      await nextTick();
      await startCameraScan();
    };

    const handleStopScan = async () => {
      await stopCameraScan();
    };

    const handleSimulatedScan = async (qrCode: string) => {
      qrInput.value = qrCode;
      await stopCameraScan();
      handleQRScan(qrCode);
    };

    const resetToIdle = async () => {
      appState.value = 'idle';
      scannedTeacher.value = null;
      qrInput.value = '';
      await stopCameraScan();
    };

    const handleQRScan = (qrCode: string) => {
      if (!qrCode) return;

      try {
        const parsedData: ScannedQrUser = JSON.parse(qrCode);

        const hasNames = typeof parsedData.names === 'string' && parsedData.names.trim().length > 0;

        if (!hasNames) {
          qrStatus.value = 'invalid';
          scannedTeacher.value = null;
          appState.value = 'scanned';

          setTimeout(() => {
            resetToIdle();
          }, 4000);

          return;
        }

        qrStatus.value = 'valid';
        scannedTeacher.value = parsedData;
        appState.value = 'scanned';
      } catch (error) {
        console.error('El contenido del QR no es un JSON válido:', error);

        qrStatus.value = 'invalid';
        scannedTeacher.value = null;
        appState.value = 'scanned';

        setTimeout(() => {
          resetToIdle();
        }, 4000);
      }
    };

    const handleAttendanceTypeSelect = async (type: AttendanceType) => {
      if (!scannedTeacher.value) return;

      try {
        loading.value = true;

        const timestamp = new Date();

        const dataSend: any = {
          campusId: 6,
          identification: scannedTeacher.value.identification ? String(scannedTeacher.value.identification) : '',
          name: getScannedFullName(scannedTeacher.value),
          userId: scannedTeacher.value.userId ?? scannedTeacher.value.peopleId ?? scannedTeacher.value.id ?? '',
          recordType: type,
        };

        console.log('dataSend asistencia:', dataSend);

        await createOrUpdateMainAssistencesService.run(dataSend);

        const newRecord: AttendanceRecord = {
          id: String(Date.now()),
          teacherId: String(scannedTeacher.value.peopleId ?? scannedTeacher.value.userId ?? scannedTeacher.value.id ?? ''),
          teacherName: getScannedFullName(scannedTeacher.value),
          documentNumber: getScannedDocument(scannedTeacher.value),
          type,
          timestamp,
          registeredBy: currentUser.value,
        };

        attendanceRecords.value = [newRecord, ...attendanceRecords.value];

        lastRegistration.value = {
          teacherName: getScannedFullName(scannedTeacher.value),
          type,
          timestamp,
        };

        appState.value = 'confirmed';
        await stopCameraScan();

        setTimeout(() => {
          appState.value = 'idle';
          scannedTeacher.value = null;
          lastRegistration.value = null;
          qrInput.value = '';
        }, 5000);
      } catch (error) {
        console.error('Error guardando asistencia:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleFilterChange = () => {
      document.dispatchEvent(new Event('updateDatatable'));
    };

    const handleFilterReset = () => {
      search.value = '';
      recordType.value = '';
      startDate.value = '';
      endDate.value = '';

      document.dispatchEvent(new Event('updateDatatable'));
    };

    const handleExport = () => {
      const exportData = filteredRecords.value.map((record) => ({
        Fecha: formatLongDate(record.timestamp),
        Hora: formatTime(record.timestamp),
        'Nombre del Docente': record.teacherName,
        'Número de Documento': record.documentNumber,
        'Tipo de Registro': record.type,
        'Registrado por': record.registeredBy,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();

      ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 15 }, { wch: 30 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
      XLSX.writeFile(wb, `asistencia_docente_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`);
    };

    onBeforeUnmount(async () => {
      await stopCameraScan();
    });

    return {
      loading,
      currentUser,
      currentDate,
      scanner,
      cameraActive,
      appState,
      scannedTeacher,
      qrStatus,
      qrInput,
      isScanning,
      lastRegistration,
      search,
      recordType,
      startDate,
      endDate,
      attendanceRecords,
      formattedCurrentDate,
      totalEntries,
      totalExits,
      title,
      filteredRecords,
      statusConfig,
      validQrDemo1,
      validQrDemo2,
      invalidQrDemo,
      formatLongDate,
      formatTime,
      getScannedFullName,
      getScannedDocument,
      startCameraScan,
      stopCameraScan,
      handleStartScan,
      handleStopScan,
      handleSimulatedScan,
      resetToIdle,
      handleQRScan,
      handleAttendanceTypeSelect,
      handleFilterChange,
      handleFilterReset,
      handleExport,
      service,
      params,
    };
  },
});
</script>

<style scoped>
.attendancePage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sectionHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sectionHead__icon {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.sectionHead__title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
}

.sectionHead__subtitle {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
}

.headerMeta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.metaChip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  min-width: 220px;
}

.metaChip--primary {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.metaChip__label {
  display: block;
  font-size: 0.72rem;
  color: #64748b;
}

.metaChip__value {
  display: block;
  color: #0f172a;
  font-size: 0.9rem;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.statValue {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
}

.statHint {
  color: #64748b;
  font-size: 0.85rem;
}

.textSuccess {
  color: #16a34a;
}

.textWarning {
  color: #7c3aed;
}

.mainGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.cardTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.titleLeft {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.scanReadyCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 2px solid #bfdbfe;
  border-radius: 1.25rem;
}

.scanReadyCard__icon {
  width: 7rem;
  height: 7rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
}

.scanReadyCard__content {
  max-width: 560px;
}

.scanReadyCard__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}

.scanReadyCard__subtitle {
  margin: 0.4rem 0 0;
  color: #64748b;
  line-height: 1.5;
}

.btnScanMain {
  min-width: 250px;
}

.manualEntryBox {
  width: 100%;
  max-width: 560px;
  margin-top: 0.25rem;
  text-align: left;
}

.manualEntryBox__actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}

.scanActiveCard {
  min-height: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.35rem;
  padding: 2rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  border: 1px solid #334155;
}

.scanActiveCard__frame {
  position: relative;
}

.scannerFrame {
  position: relative;
  width: 260px;
  height: 260px;
}

.scannerFrame__inner {
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
  border: 4px dashed #3b82f6;
  background: rgba(15, 23, 42, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scannerFrame__icon {
  font-size: 5rem;
  color: #60a5fa;
  animation: pulseIcon 2s infinite ease-in-out;
}

.corner {
  position: absolute;
  width: 50px;
  height: 50px;
  border-color: #60a5fa;
  border-style: solid;
  pointer-events: none;
}

.corner--tl {
  top: -10px;
  left: -10px;
  border-width: 4px 0 0 4px;
}

.corner--tr {
  top: -10px;
  right: -10px;
  border-width: 4px 4px 0 0;
}

.corner--bl {
  left: -10px;
  bottom: -10px;
  border-width: 0 0 4px 4px;
}

.corner--br {
  right: -10px;
  bottom: -10px;
  border-width: 0 4px 4px 0;
}

.scannerLine {
  position: absolute;
  left: 10px;
  right: 10px;
  top: 20px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, #60a5fa, transparent);
  box-shadow: 0 0 18px rgba(96, 165, 250, 0.9);
  animation: scanMove 2.2s linear infinite;
}

.scanActiveCard__texts {
  text-align: center;
}

.scanActiveCard__title {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  font-size: 1.2rem;
  color: white;
  font-weight: 700;
}

.scanActiveCard__subtitle {
  margin: 0.55rem 0 0;
  max-width: 400px;
  color: #cbd5e1;
  line-height: 1.45;
}

.scanActiveCard__actions {
  display: flex;
  justify-content: center;
}

.scanDemo {
  width: 100%;
  max-width: 430px;
  margin-top: 0.2rem;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1rem;
}

.scanDemo__header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.85rem;
}

.scanDemo__title {
  margin: 0;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.scanDemo__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.demoBtn:hover {
  transform: translateY(-1px);
}

.demoBtn--primary {
  background: var(--color-primary);
}

.demoBtn--primary:hover {
  background: var(--color-secondary);
}

.demoBtn--danger {
  background: #dc2626;
}

.demoBtn--danger:hover {
  background: #b91c1c;
}

.form-control {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 0.85rem;
  min-height: 2.75rem;
  padding: 0.75rem 0.9rem;
  outline: none;
  background: white;
}

.form-control:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
}

.validationWrap {
  border-radius: 1rem;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.validationWrap--success {
  border-color: #86efac;
}

.validationWrap--danger {
  border-color: #fca5a5;
}

.validationHead {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.validationHead--success {
  background: #f0fdf4;
}

.validationHead--danger {
  background: #fef2f2;
}

.validationHead__icon {
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.validationHead__content {
  flex: 1;
}

.validationHead__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.validationHead__text {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.teacherBox {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.teacherBox__top {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.teacherBox__main {
  flex: 1;
}

.teacherBox__name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.teacherBox__faculty {
  margin: 0.35rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
}

.teacherBox__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.metaCard {
  background: #f8fafc;
  border-radius: 0.9rem;
  padding: 0.9rem;
}

.metaCard__label {
  display: block;
  font-size: 0.72rem;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.metaCard__value {
  color: #0f172a;
}

.selectorBox {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 1rem;
  padding: 1rem;
}

.selectorBox__head {
  text-align: center;
  margin-bottom: 1rem;
}

.selectorBox__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
}

.selectorBox__text {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.selectorBox__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.actionBtn {
  border: none;
  border-radius: 1rem;
  padding: 1rem;
  color: white;
  display: flex;
  gap: 0.75rem;
  text-align: left;
  align-items: center;
  cursor: pointer;
}

.actionBtn strong {
  display: block;
}

.actionBtn span {
  display: block;
  font-size: 0.8rem;
  opacity: 0.95;
}

.actionBtn--entry {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.actionBtn--exit {
  background: #ffc107;
}

.emptyValidation {
  padding: 1.2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.emptyValidation__icon {
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 999px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.emptyValidation__title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.emptyValidation__text {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.confirmationBox {
  border-radius: 1rem;
  overflow: hidden;
  border: 2px solid transparent;
}

.confirmationBox--entry {
  border-color: #86efac;
}

.confirmationBox--exit {
  border-color: #d8b4fe;
}

.confirmationBox__header {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.2rem;
  color: white;
}

.confirmationBox--entry .confirmationBox__header {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.confirmationBox--exit .confirmationBox__header {
  background: #ffc107;
}

.confirmationBox__icon {
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 999px;
  background: white;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmationBox--exit .confirmationBox__icon {
  color: #ffc107;
}

.confirmationBox__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.confirmationBox__subtitle {
  margin: 0.25rem 0 0;
  opacity: 0.95;
}

.confirmationBox__body {
  padding: 1rem;
  background: white;
}

.confirmationHighlight {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.confirmationBox--entry .confirmationHighlight {
  background: #dcfce7;
  color: #166534;
}

.confirmationBox--exit .confirmationHighlight {
  background: #f3e8ff;
}

.confirmationHighlight span {
  display: block;
  font-size: 0.8rem;
}

.confirmationHighlight strong {
  display: block;
  font-size: 1.2rem;
}

.confirmationGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.confirmationItem {
  background: #f8fafc;
  border-radius: 0.9rem;
  padding: 0.9rem;
}

.confirmationItem--full {
  grid-column: span 2;
}

.confirmationItem__label {
  display: block;
  font-size: 0.72rem;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.confirmationItem__value {
  color: #0f172a;
}

.filtersCard {
  margin-top: 0.25rem;
}

.filtersGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.filtersFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.filtersResume {
  color: #64748b;
}

.filtersActions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tableTeacher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mono {
  font-family: monospace;
  font-weight: 700;
}

.btnPrimary {
  background: var(--color-primary);
  color: white;
}

.btnSecondary {
  background: var(--color-secondary);
  color: white;
}

.btnSecondaryDark {
  background: #334155;
  color: white;
}

.btnLight {
  background: #f8fafc;
  color: #334155;
  border: 1px solid #dbe2ea;
}

.btnSuccess {
  background: #16a34a;
  color: white;
}

@keyframes scanMove {
  0% {
    top: 18px;
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: calc(100% - 22px);
    opacity: 0.9;
  }
}

@keyframes pulseIcon {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}

@media (max-width: 1100px) {
  .mainGrid,
  .statsGrid,
  .filtersGrid {
    grid-template-columns: 1fr;
  }

  .selectorBox__actions,
  .teacherBox__meta,
  .confirmationGrid,
  .scanDemo__grid {
    grid-template-columns: 1fr;
  }

  .confirmationItem--full {
    grid-column: span 1;
  }

  .scannerFrame {
    width: 220px;
    height: 220px;
  }

  .scannerFrame__icon {
    font-size: 4rem;
  }
}
.scannerFrame__inner {
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
  border: 4px dashed #3b82f6;
  background: rgba(15, 23, 42, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.scannerFrame__icon {
  font-size: 5rem;
  color: #60a5fa;
  animation: pulseIcon 2s infinite ease-in-out;
  z-index: 1;
}

.scannerFrame__reader {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  overflow: hidden;
  border-radius: 1rem;
}

.scannerFrame__reader--active {
  opacity: 1;
  pointer-events: auto;
}

.scannerFrame__reader :deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  border-radius: 1rem;
}

.scannerFrame__reader :deep(img) {
  display: none !important;
}

.scannerFrame__reader :deep(button) {
  display: none !important;
}

.scannerFrame__reader :deep(section) {
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
}

.scannerFrame__reader :deep(canvas) {
  display: none !important;
}
</style>
