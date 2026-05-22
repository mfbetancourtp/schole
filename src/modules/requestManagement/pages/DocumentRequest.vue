<template>
  <AppBaseList :title="t('Solicitudes de Documentos')">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="doc-request">
        <!-- Header -->
        <div class="doc-request__header">
          <div>
            <h2 class="doc-request__title">
              {{ t('Solicitudes de Documentos') }}
            </h2>
            <p class="doc-request__subtitle">
              {{ t('Solicita documentos oficiales y realiza seguimiento a tus peticiones') }}
            </p>
          </div>
        </div>

        <!-- Catalog Section -->
        <div class="doc-request__section">
          <h3 class="doc-request__section-title">
            {{ t('Catálogo de Solicitudes') }}
          </h3>
          <div class="doc-request__catalog-grid">
            <DocumentCatalogCard
              v-for="doc in pageData.catalog"
              :key="doc.id"
              :name="doc.name"
              :description="doc.description"
              :icon="doc.icon"
              :iconBgColor="doc.iconBgColor"
              :iconColor="doc.iconColor"
              :cost="doc.cost ?? undefined"
              :isFree="doc.isFree"
              :estimatedTime="doc.estimatedTime"
              @request="openNewRequest(doc)"
            />
          </div>
        </div>

        <!-- Requests Table Section -->
        <div class="doc-request__section">
          <h3 class="doc-request__section-title">{{ t('Mis Solicitudes') }}</h3>
          <AppDatatable name="documentRequest.requests" :data="pageData.requests" :enableSearchFilter="false" :refreshBtn="false" :showFilterSteps="false" :defaultPerPage="10000" :paginated="true">
            <AppDatatableColumn v-slot="{ row }" label="ID" field="id">
              <span class="doc-request__td-id">{{ row.id }}</span>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Tipo de Solicitud" field="documentType">
              {{ t(row.documentType) }}
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Fecha" field="date">
              {{ row.date }}
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Estado" field="status">
              <AppBadge :label="row.statusLabel" :variant="getStatusVariant(row.status)" />
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Observaciones" field="observations">
              <span class="doc-request__td-obs">{{ t(row.observations) }}</span>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Acción">
              <div class="doc-request__actions">
                <AppButton :label="t('Ver detalle')" variant="primary" size="sm" outlined @click="openDetail(row.id)" />
                <AppButton v-if="row.canDownload" :label="t('Descargar')" variant="primary" size="sm" icon="download" @click="downloadDoc(row.id)" />
              </div>
            </AppDatatableColumn>
          </AppDatatable>
        </div>
      </div>

      <!-- New Request Drawer -->
      <AppDrawer :isVisible="showNewDrawer" @update:isVisible="showNewDrawer = $event" size="lg">
        <template #head>
          <span class="doc-request__drawer-title">{{ t('Nueva Solicitud') }}</span>
        </template>
        <template #body>
          <NewRequestDrawer v-if="selectedDocType" ref="newRequestRef" :selectedDoc="selectedDocType" :academicPeriods="pageData.academicPeriods" @submit="handleSubmit" />
        </template>
        <template #footer>
          <div class="doc-request__drawer-footer">
            <AppButton :label="t('Cancelar')" class="doc-request__drawer-footer__cancel" variant="secondary" outlined @click="showNewDrawer = false" />
            <AppButton :label="t('Enviar Solicitud')" class="doc-request__drawer-footer__submit" variant="primary" icon="paper-plane" @click="triggerSubmit" />
          </div>
        </template>
      </AppDrawer>

      <!-- Detail Drawer -->
      <AppDrawer :isVisible="showDetailDrawer" @update:isVisible="showDetailDrawer = $event" size="lg">
        <template #head>
          <span class="doc-request__drawer-title">
            {{ t('Detalle de Solicitud') }}
            <span v-if="selectedDetail" class="doc-request__drawer-id">SOL-{{ selectedDetail.id }}</span>
          </span>
        </template>
        <template #body>
          <AppPulseLoading v-if="detailLoading" />
          <div v-else-if="detailError" class="doc-request__detail-error">
            {{ detailError }}
          </div>
          <DocumentRequestDetailDrawer v-else-if="selectedDetail" :detail="selectedDetail" />
        </template>
        <template #footer>
          <div class="doc-request__drawer-footer">
            <AppButton :label="t('Cerrar')" class="doc-request__drawer-footer__cancel" variant="secondary" outlined @click="showDetailDrawer = false" />
            <AppButton
              v-if="selectedDetail && selectedDetail.attachments && selectedDetail.attachments.length"
              :label="t('Descargar Documento')"
              class="doc-request__drawer-footer__submit"
              variant="primary"
              icon="download"
              @click="downloadDoc(String(selectedDetail!.id))"
            />
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';
import { useUserStore } from '../../../stores/user';
import InstitutionsStore from '../../../shared/stores/institutions.store';

// Shared components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

// Module components
import DocumentCatalogCard from '../components/DocumentCatalogCard.vue';
import NewRequestDrawer from '../components/NewRequestDrawer.vue';
import DocumentRequestDetailDrawer from '../components/DocumentRequestDetailDrawer.vue';

// Services & types
import { documentRequestService } from '../services/documentRequest.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import type { DocumentRequestPageData, DocumentType, DocumentRequestDetailDTO, NewRequestFormData, DocumentRequestStatus, RequestListItem, AcademicPeriodOption } from '../dtos/documentRequest.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';

const toArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatCOP = (value: unknown): string => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  const formatted = Number.isFinite(n) ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n) : '0';
  return `$${formatted} COP`;
};

const normalizeStatus = (raw: any): DocumentRequestStatus => {
  const v = String(raw ?? '').toLowerCase();
  if (v.includes('final')) return 'finalized';
  if (v.includes('pend')) return 'pending_payment';
  if (v.includes('pay') || v.includes('pago')) return 'pending_payment';
  if (v.includes('review') || v.includes('revis')) return 'in_review';
  if (v.includes('approv') || v.includes('aprob')) return 'approved';
  if (v.includes('reject') || v.includes('rech')) return 'rejected';
  return 'in_review';
};

const statusLabelMap: Record<DocumentRequestStatus, string> = {
  finalized: 'Finalizado',
  approved: 'Aprobado',
  in_review: 'En revisión',
  pending_payment: 'Pendiente de pago',
  rejected: 'Rechazado',
};

const iconPalette = [
  { icon: 'file-alt', iconBgColor: '#EBF5FF', iconColor: '#2563EB' },
  { icon: 'file-contract', iconBgColor: '#EBF5FF', iconColor: '#2563EB' },
  { icon: 'check-circle', iconBgColor: '#EBF5FF', iconColor: '#2563EB' },
  { icon: 'user-graduate', iconBgColor: '#EBF5FF', iconColor: '#2563EB' },
];

const statusVariantMap: Record<DocumentRequestStatus, VariantsConstant> = {
  finalized: 'success',
  approved: 'success',
  in_review: 'primary',
  pending_payment: 'warning',
  rejected: 'danger',
};

export default defineComponent({
  name: 'DocumentRequest',
  components: {
    AppBaseList,
    AppButton,
    AppLoading,
    AppBadge,
    AppDrawer,
    AppDatatable,
    AppDatatableColumn,
    DocumentCatalogCard,
    NewRequestDrawer,
    DocumentRequestDetailDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Solicitudes de Documentos' });

    const userStore = useUserStore();
    const institutionId = computed(() => InstitutionsStore.state.selectedInstitution?.id ?? userStore.user?.people?.institutionId ?? null);

    const loading = ref(true);

    const pageData = ref<DocumentRequestPageData>({
      catalog: [],
      requests: [],
      academicPeriods: [],
    });

    // New Request Drawer
    const showNewDrawer = ref(false);
    const selectedDocType = ref<DocumentType | null>(null);
    const newRequestRef = ref<InstanceType<typeof NewRequestDrawer> | null>(null);

    // Detail Drawer
    const showDetailDrawer = ref(false);
    const selectedDetail = ref<DocumentRequestDetailDTO | null>(null);
    const detailLoading = ref(false);
    const detailError = ref<string | null>(null);

    const loadData = async () => {
      loading.value = true;
      try {
        const getAcademicPeriodsService = new GetAcademicPeriodsService();
        const [typesPayload, requestsPayload, academicPeriodsPayload] = await Promise.all([
          documentRequestService.getApplicationTypes(),
          documentRequestService.getPageData(),
          institutionId.value
            ? getAcademicPeriodsService.run({
                institutionId: institutionId.value,
              })
            : Promise.resolve(null),
        ]);

        const typesRows = toArray(typesPayload);
        const catalog: DocumentType[] = typesRows.map((t: any, idx: number) => {
          const requiresPayment = Number(t.paymentRequired ?? t.requiresPayment ?? 0) === 1;
          const value = typeof t.value === 'number' ? t.value : typeof t.value === 'string' ? Number(t.value) : null;
          const hasValue = value !== null && Number.isFinite(value) && value > 0;
          const isFree = !requiresPayment || !hasValue;

          const palette = iconPalette[idx % iconPalette.length];

          return {
            id: Number(t.id ?? t.applicationTypesId ?? t.applicationTypeId),
            name: String(t.name ?? ''),
            description: String(t.description ?? ''),
            icon: palette.icon,
            iconBgColor: palette.iconBgColor,
            iconColor: palette.iconColor,
            cost: isFree ? null : formatCOP(value),
            isFree,
            estimatedTime: String(t.estimatedResponseTime ?? t.estimatedTime ?? ''),
          };
        });

        const requestsRows = Array.isArray(requestsPayload?.requests) ? requestsPayload.requests : toArray(requestsPayload);
        const requests: RequestListItem[] = requestsRows.map((r: any) => {
          const requestStatusName = r?.requestStatus?.name ?? r?.requestStatusName ?? r?.statusName ?? r?.status_name;
          const status = normalizeStatus(requestStatusName ?? r.status ?? r.requestStatus ?? r.state);
          const statusLabel = String(r?.requestStatus?.name ?? r.statusLabel ?? r.status_name ?? r.statusName ?? statusLabelMap[status]);
          const observations = String(r.observations ?? r.description ?? r.note ?? '');
          const hasAttachments = Array.isArray(r.attachments) && r.attachments.length > 0;
          const canDownload = Boolean(r.canDownload ?? r.downloadAvailable ?? hasAttachments);

          return {
            id: String(r.id ?? r.code ?? r.requestCode ?? ''),
            documentType: String(r.documentType ?? r.applicationType?.name ?? r.applicationTypeName ?? r.typeName ?? ''),
            date: String(r.date ?? r.createdAt ?? r.created_at ?? ''),
            status,
            statusLabel,
            observations,
            canDownload,
          };
        });

        const academicPeriods: AcademicPeriodOption[] = Array.isArray(academicPeriodsPayload?.data)
          ? academicPeriodsPayload!.data.map((p) => ({
              id: p.id,
              label: p.name,
            }))
          : [];

        pageData.value = {
          catalog,
          requests,
          academicPeriods,
        };
      } finally {
        loading.value = false;
      }
    };

    const getStatusVariant = (status: DocumentRequestStatus) => statusVariantMap[status] || 'primary';

    const openNewRequest = (doc: DocumentType) => {
      selectedDocType.value = doc;
      showNewDrawer.value = true;
    };

    const triggerSubmit = () => {
      (newRequestRef.value as any)?.submitForm();
    };

    const handleSubmit = async (_form: NewRequestFormData) => {
      const created = await documentRequestService.submitRequest(_form);

      const createdIdRaw = created?.id ?? created?.data?.id ?? created?.requestId ?? created?.data?.requestId;
      const requestDocumentsId = typeof createdIdRaw === 'number' ? createdIdRaw : Number(createdIdRaw);

      if (_form.attachment && Number.isFinite(requestDocumentsId)) {
        await documentRequestService.uploadAttachment(requestDocumentsId, _form.attachment);
      }
      showNewDrawer.value = false;
      await loadData();
    };

    const openDetail = async (requestId: string) => {
      showDetailDrawer.value = true;
      selectedDetail.value = null;
      detailError.value = null;
      detailLoading.value = true;
      try {
        const detail = await documentRequestService.getRequestDetail(requestId);
        selectedDetail.value = detail;
      } catch (e: any) {
        detailError.value = e?.message || t('No fue posible cargar el detalle.');
      } finally {
        detailLoading.value = false;
      }
    };

    const downloadDoc = async (requestId: string) => {
      await documentRequestService.downloadAttachments(requestId);
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Gestión de Solicitudes', url: '' };
      headerStorage.moduleItem = { name: 'Solicitudes de Documentos', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    return {
      t,
      loading,
      pageData,
      institutionId,
      showNewDrawer,
      selectedDocType,
      newRequestRef,
      showDetailDrawer,
      selectedDetail,
      detailLoading,
      detailError,
      getStatusVariant,
      openNewRequest,
      triggerSubmit,
      handleSubmit,
      openDetail,
      downloadDoc,
    };
  },
});
</script>

<style scoped>
.doc-request {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
}

.doc-request__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.doc-request__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.doc-request__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 4px 0 0 0;
}

/* Sections */
.doc-request__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doc-request__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

/* Catalog Grid */
.doc-request__catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.doc-request__td-id {
  font-weight: 600;
  color: var(--color-primary) !important;
  white-space: nowrap;
}

.doc-request__td-obs {
  max-width: 200px;
  color: #637381 !important;
}

.doc-request__actions {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

/* Drawer */
.doc-request__drawer-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-request__drawer-id {
  font-weight: 400;
  font-size: 14px;
  opacity: 0.85;
}

.doc-request__drawer-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.doc-request__drawer-footer__submit {
  width: 50%;
}

.doc-request__drawer-footer__cancel {
  width: 50%;
}

.doc-request__detail-error {
  padding: 24px;
  color: #c62828;
  font-family: 'Roboto', sans-serif;
}
</style>
