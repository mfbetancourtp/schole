<template>
  <AppBaseList :title="t('Gestión de Solicitudes')">
    <template #content>
      <!-- Stats -->
      <div class="req-mgmt__stats">
        <AppStatCard
          v-for="stat in stats"
          :key="stat.id"
          :label="stat.status"
          :value="showThisMonth(stat.status) ? stat.thisMonth : stat.total"
          :caption="showThisMonth(stat.status) ? t('Este mes') : undefined"
          :variant="getStatVariant(stat.status)"
          :icon="getStatIcon(stat.status)"
        />
      </div>

      <!-- Tabla -->
      <AppDatatable name="requestDocuments" :service="service" :params="params">
        <template #filters>
          <!-- Filtro: Estado (servicio real) -->
          <AppFilter v-model="requestStatusId" filter-name="requestDocuments.requestStatusId">
            <AppFormField :label="t('Estado')">
              <AppAutocomplete v-model="requestStatusId" :options="requestStatuses" label="name" :reduce="(s: any) => s.id" input-id="requestStatusId" />
            </AppFormField>
          </AppFilter>

          <!-- Filtro: Tipo de Solicitud (search-on-type) -->
          <AppFilter v-model="applicationTypesId" filter-name="requestDocuments.applicationTypesId">
            <AppFormField :label="t('Tipo de Solicitud')">
              <AppAutocomplete
                v-model="applicationTypesId"
                :options="applicationTypes"
                label="name"
                :reduce="(a: any) => a.id"
                input-id="applicationTypesId"
                :filterable="false"
                @search="onApplicationTypeSearch"
              />
            </AppFormField>
          </AppFilter>

          <!-- Filtro: Programa Académico (search-on-type) -->
          <AppFilter v-model="programId" filter-name="requestDocuments.programId">
            <AppFormField :label="t('Programa Académico')">
              <AppAutocomplete v-model="programId" :options="programs" label="name" :reduce="(p: any) => p.id" input-id="programId" :filterable="false" @search="onProgramSearch" />
            </AppFormField>
          </AppFilter>

          <!-- Filtro: Fecha desde -->
          <AppFilter v-model="dateFrom" filter-name="requestDocuments.dateFrom">
            <AppFormField :label="t('Fecha desde')">
              <input type="date" class="form-control" v-model="dateFrom" />
            </AppFormField>
          </AppFilter>

          <!-- Filtro: Fecha hasta -->
          <AppFilter v-model="dateTo" filter-name="requestDocuments.dateTo">
            <AppFormField :label="t('Fecha hasta')">
              <input type="date" class="form-control" v-model="dateTo" />
            </AppFormField>
          </AppFilter>
        </template>

        <AppDatatableColumn label="ID" field="id" :sortable="true" v-slot="{ row }">
          <span class="req-mgmt__id">#{{ row.id }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Tipo de Solicitud')" v-slot="{ row }">
          <AppBadge :label="row.applicationType?.name" variant="primary" />
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Descripción')" v-slot="{ row }">
          <span class="req-mgmt__desc">{{ row.description }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Fecha')" field="createdAt" :sortable="true" v-slot="{ row }">
          <div class="d-flex align-items-center gap-2">
            <AppIcon icon="calendar-alt" />
            {{ formatDate(row.createdAt) }}
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Estado')" v-slot="{ row }">
          <AppBadge :label="row.requestStatus?.name" :variant="getStatusVariant(row.requestStatus?.name)" />
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Opciones')" v-slot="{ row }">
          <AppButton variant="secondary" outlined icon="eye" v-tooltip="t('Ver detalle')" @click="openDetail(row.id)" />
        </AppDatatableColumn>
      </AppDatatable>

      <!-- Drawer: Detalle -->
      <AppDrawer :isVisible="showDetailDrawer" @update:isVisible="showDetailDrawer = $event" size="lg">
        <template #head>
          <AppDrawerHeader icon="file-alt" :title="t('Detalle de Solicitud')" :subtitle="selectedDetail ? `#${selectedDetail.id}` : ''" />
        </template>
        <template #body>
          <RequestManagementDetailDrawer v-if="selectedDetail" :detail="selectedDetail" />
        </template>
        <template #footer>
          <div class="req-mgmt__drawer-footer">
            <h6 class="req-mgmt__footer-section-title">
              {{ t('ACCIONES ADMINISTRATIVAS') }}
            </h6>
            <div class="req-mgmt__footer-actions-row">
              <AppButton :label="t('Aprobar')" variant="success" outlined icon="thumbs-up" class="req-mgmt__footer-btn" @click="handleUpdateStatus(4)" />
              <AppButton :label="t('Rechazar')" variant="danger" icon="thumbs-down" outlined class="req-mgmt__footer-btn" @click="handleUpdateStatus(6)" />
            </div>
            <div class="req-mgmt__footer-actions-row">
              <AppButton :label="t('Solicitar información')" variant="secondary" icon="comment" outlined class="req-mgmt__footer-btn" @click="showMessageModal = true" />
              <AppButton :label="t('Subir documento')" variant="primary" icon="upload" outlined class="req-mgmt__footer-btn" @click="showUploadModal = true" />
            </div>
          </div>
        </template>
      </AppDrawer>

      <!-- Modal: Enviar mensaje al solicitante -->
      <AppModal v-model="showMessageModal" size="md">
        <AppFormModal :title="t('Enviar mensaje al solicitante')" @cancel="showMessageModal = false">
          <template #content>
            <div class="req-mgmt__message-form">
              <p class="req-mgmt__message-hint">
                {{ t('El mensaje será enviado al solicitante sin cambiar el estado de la solicitud.') }}
              </p>
              <label>{{ t('Mensaje') }}</label>
              <AppVoiceInput v-model="messageText" textareaClass="form-control" :rows="4" :placeholder="t('Escribe tu mensaje aquí...')" />
            </div>
          </template>
          <template #actions>
            <AppButton :label="t('Enviar mensaje')" variant="primary" icon="paper-plane" :disabled="!messageText.trim()" @click="handleSendMessage" />
          </template>
        </AppFormModal>
      </AppModal>
      <!-- Modal: Subir documento -->
      <AppModal v-model="showUploadModal" size="md">
        <AppFormModal :title="t('Subir documento')" @cancel="closeUploadModal">
          <template #content>
            <AppAttachmentDropzone v-model="uploadFile" isTitle="" isHelper="PDF, JPG, PNG (máx. 10MB)" isAccept=".pdf,.jpg,.jpeg,.png" :isMaxSizeMB="10" :isShowDelete="true" />
          </template>
          <template #actions>
            <AppButton :label="t('Subir')" variant="primary" icon="upload" :disabled="!uploadFile" @click="handleUploadFile" />
          </template>
        </AppFormModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';

import RequestManagementDetailDrawer from '../components/RequestManagementDetailDrawer.vue';

import { GetAdminRequestDocumentsWithPaginationService } from '../services/getAdminRequestDocumentsWithPagination.service';
import { GetAdminRequestDocumentByIdService } from '../services/getAdminRequestDocumentById.service';
import { GetAdminRequestDocumentsStatsService } from '../services/getAdminRequestDocumentsStats.service';
import { GetRequestStatusService } from '../services/getRequestStatus.service';
import { CreateOrUpdateAdminRequestDocumentStatusService } from '../services/createOrUpdateAdminRequestDocumentStatus.service';
import { CreateRequestAttachmentService } from '../services/createRequestAttachment.service';
import { GetProgramsService } from '../services/getPrograms.service';
import { GetApplicationTypesService } from '../services/getApplicationTypes.service';
import type { RequestDocumentDetailDto, RequestDocumentStatsDto, RequestStatusDto } from '../dtos/requestManagement.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';

const getAdminRequestDocumentsWithPaginationService = new GetAdminRequestDocumentsWithPaginationService();
const getAdminRequestDocumentByIdService = new GetAdminRequestDocumentByIdService();
const getAdminRequestDocumentsStatsService = new GetAdminRequestDocumentsStatsService();
const getRequestStatusService = new GetRequestStatusService();
const createOrUpdateAdminRequestDocumentStatusService = new CreateOrUpdateAdminRequestDocumentStatusService();
const createRequestAttachmentService = new CreateRequestAttachmentService();
const getProgramsService = new GetProgramsService();
const getApplicationTypesService = new GetApplicationTypesService();
const updateDatatableService = new UpdateDatatableService();

const statusVariantMap: Record<string, VariantsConstant> = {
  Pendiente: 'warning',
  'En revisión': 'primary',
  'Pendiente de pago': 'danger',
  Aprobado: 'success',
  Finalizado: 'dark',
  Rechazado: 'danger',
};

type StatVariant = 'blue' | 'green' | 'yellow' | 'red';
const statVariantMap: Record<string, StatVariant> = {
  'En revisión': 'blue',
  Pendiente: 'yellow',
  Aprobado: 'green',
  Rechazado: 'red',
};

const statIconMap: Record<string, string> = {
  'En revisión': 'clock',
  Pendiente: 'exclamation-circle',
  Aprobado: 'check-circle',
  Rechazado: 'times-circle',
};

export default defineComponent({
  name: 'RequestManagement',
  components: {
    AppBaseList,
    AppButton,
    AppBadge,
    AppDrawer,
    AppDrawerHeader,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppFormField,
    AppAutocomplete,
    AppStatCard,
    AppModal,
    AppFormModal,
    AppVoiceInput,
    AppAttachmentDropzone,
    RequestManagementDetailDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Gestión de Solicitudes' });

    onMounted(() => {
      const headerStore = useHeaderStore();
      headerStore.module = { name: 'Gestión de Solicitudes', url: '' };
      headerStore.moduleItem = { name: 'Gestión de Solicitudes', url: '' };
      headerStore.moduleSubItem = { name: '', url: '' };
    });

    // ── Stats ──────────────────────────────────────────────
    const stats = ref<RequestDocumentStatsDto[]>([]);

    const loadStats = async () => {
      try {
        stats.value = await getAdminRequestDocumentsStatsService.run();
      } catch (e) {
        console.error(e);
      }
    };

    // ── Statuses (para el filtro) ──────────────────────────
    const requestStatuses = ref<RequestStatusDto[]>([]);

    const loadStatuses = async () => {
      try {
        requestStatuses.value = await getRequestStatusService.run();
      } catch (e) {
        console.error(e);
      }
    };

    onMounted(() => {
      loadStats();
      loadStatuses();
    });

    // ── Programas (search-on-type) ─────────────────────────
    const programs = ref<{ id: number; name: string }[]>([]);

    const onProgramSearch = async (search: string, loading: (state: boolean) => void) => {
      if (!search || search.length < 2) return;
      loading(true);
      try {
        const response = await getProgramsService.run({
          search,
          perPage: 15,
          page: 1,
        });
        // El servicio retorna array (noPag) o { data: [] } (paginado)
        programs.value = Array.isArray(response) ? response : response.data ?? [];
      } catch (e) {
        console.error(e);
      } finally {
        loading(false);
      }
    };

    // ── Tipos de Solicitud (search-on-type) ───────────────
    const applicationTypes = ref<{ id: number; name: string }[]>([]);

    const onApplicationTypeSearch = async (search: string, loading: (state: boolean) => void) => {
      if (!search || search.length < 2) return;
      loading(true);
      try {
        const response = await getApplicationTypesService.run({
          search,
          perPage: 15,
          page: 1,
        });
        applicationTypes.value = Array.isArray(response) ? response : response.data ?? [];
      } catch (e) {
        console.error(e);
      } finally {
        loading(false);
      }
    };

    // ── Filtros ────────────────────────────────────────────
    const requestStatusId: Ref<number | null> = ref(null);
    const applicationTypesId: Ref<number | null> = ref(null);
    const programId: Ref<number | null> = ref(null); // TODO: wired cuando esté el servicio
    const dateFrom: Ref<string | null> = ref(null);
    const dateTo: Ref<string | null> = ref(null);

    const params = computed(() => ({
      ...(requestStatusId.value != null && {
        requestStatusId: requestStatusId.value,
      }),
      ...(applicationTypesId.value != null && {
        applicationTypesId: applicationTypesId.value,
      }),
      ...(programId.value != null && { programId: programId.value }),
      ...(dateFrom.value && { dateFrom: dateFrom.value }),
      ...(dateTo.value && { dateTo: dateTo.value }),
    }));

    // ── Tabla ──────────────────────────────────────────────
    const service = getAdminRequestDocumentsWithPaginationService;

    // ── Detalle ────────────────────────────────────────────
    const showDetailDrawer = ref(false);
    const selectedDetail = ref<RequestDocumentDetailDto | null>(null);

    const openDetail = async (id: number) => {
      try {
        selectedDetail.value = await getAdminRequestDocumentByIdService.run(id);
        showDetailDrawer.value = true;
      } catch (e) {
        console.error(e);
      }
    };

    // Aprobar / Rechazar → solo cambia el estado, sin mensaje
    const handleUpdateStatus = async (statusId: number) => {
      if (!selectedDetail.value) return;
      try {
        await createOrUpdateAdminRequestDocumentStatusService.run(selectedDetail.value.id, {
          requestStatusId: statusId,
        });
        showDetailDrawer.value = false;
        loadStats();
        updateDatatableService.run();
      } catch (e) {
        console.error(e);
      }
    };

    // Solicitar info → envía mensaje manteniendo el estado actual (el API requiere requestStatusId)
    const showMessageModal = ref(false);
    const messageText = ref('');

    const handleSendMessage = async () => {
      if (!selectedDetail.value || !messageText.value.trim()) return;
      try {
        await createOrUpdateAdminRequestDocumentStatusService.run(selectedDetail.value.id, {
          requestStatusId: selectedDetail.value.requestStatusId,
          message: messageText.value.trim(),
        });
        showMessageModal.value = false;
        messageText.value = '';
      } catch (e) {
        console.error(e);
        showMessageModal.value = false;
        messageText.value = '';
      }
    };

    // ── Subir documento ───────────────────────────────────
    const showUploadModal = ref(false);
    const uploadFile = ref<File | null>(null);

    const closeUploadModal = () => {
      showUploadModal.value = false;
      uploadFile.value = null;
    };

    const handleUploadFile = async () => {
      if (!selectedDetail.value || !uploadFile.value) return;
      try {
        await createRequestAttachmentService.run({
          archivo: uploadFile.value,
          requestDocumentsId: selectedDetail.value.id,
          applicationDocumentRequiredId: undefined,
        });
        closeUploadModal();
      } catch (e) {
        console.error(e);
        closeUploadModal();
      }
    };

    // ── Helpers ────────────────────────────────────────────
    const showThisMonth = (name: string) => name === 'Aprobado' || name === 'Rechazado';

    const getStatusVariant = (name: string): VariantsConstant => statusVariantMap[name] ?? 'secondary';

    const getStatVariant = (name: string): StatVariant => statVariantMap[name] ?? 'blue';

    const getStatIcon = (name: string): string => statIconMap[name] ?? 'file-alt';

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return {
      t,
      stats,
      service,
      params,
      requestStatuses,
      programs,
      onProgramSearch,
      applicationTypes,
      onApplicationTypeSearch,
      requestStatusId,
      applicationTypesId,
      programId,
      dateFrom,
      dateTo,
      showDetailDrawer,
      selectedDetail,
      showMessageModal,
      messageText,
      openDetail,
      handleUpdateStatus,
      handleSendMessage,
      showUploadModal,
      uploadFile,
      closeUploadModal,
      handleUploadFile,
      getStatusVariant,
      showThisMonth,
      getStatVariant,
      getStatIcon,
      formatDate,
    };
  },
});
</script>

<style scoped>
/* ── Stats ──────────────────────────────────────────────── */
.req-mgmt__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .req-mgmt__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .req-mgmt__stats {
    grid-template-columns: 1fr;
  }
}

/* ── Tabla ───────────────────────────────────────────────── */
.req-mgmt__id {
  font-weight: 700;
  color: var(--color-primary);
}

.req-mgmt__desc {
  max-width: 220px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  color: #637381;
}

/* ── Drawer Footer ───────────────────────────────────────── */
.req-mgmt__drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.req-mgmt__footer-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #212b36;
  letter-spacing: 0.3px;
  margin: 0;
  text-transform: uppercase;
}

.req-mgmt__footer-actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.req-mgmt__footer-btn {
  width: 100%;
  justify-content: center;
}

/* ── Modal mensaje ───────────────────────────────────────── */
.req-mgmt__message-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.req-mgmt__message-hint {
  font-size: 13px;
  color: #637381;
  margin: 0;
}
</style>
