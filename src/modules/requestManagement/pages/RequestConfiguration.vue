<template>
  <AppBaseList :title="t('Configuración de Solicitudes')">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="req-cfg">
        <!-- Header -->
        <div class="req-cfg__header">
          <div>
            <h2 class="req-cfg__title">
              {{ t('Configuración de Solicitudes') }}
            </h2>
            <p class="req-cfg__subtitle">
              {{ t('Administra categorías, tipos de solicitudes y flujos de proceso') }}
            </p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="req-cfg__tabs">
          <button class="req-cfg__tab" :class="{ 'req-cfg__tab--active': activeTab === 'categories' }" @click="activeTab = 'categories'">
            {{ t('Categorías') }}
          </button>
          <button class="req-cfg__tab" :class="{ 'req-cfg__tab--active': activeTab === 'requestTypes' }" @click="activeTab = 'requestTypes'">
            {{ t('Tipos de Solicitudes') }}
          </button>
        </div>

        <!-- Tab Content: Categories -->
        <div v-if="activeTab === 'categories'" class="req-cfg__tab-content">
          <div class="req-cfg__toolbar">
            <AppButton :label="t('Crear Categoría')" variant="primary" icon="plus" @click="openCategoryDrawer(null)" />
          </div>

          <AppDatatable name="requestConfiguration.categories" :service="categoriesTableService" :enableSearchFilter="true" :refreshBtn="false" :showFilterSteps="true" class="req-cfg__datatable">
            <AppDatatableColumn v-slot="{ row }" label="Nombre" field="name">
              <span class="req-cfg__td-name">{{ t(row.name) }}</span>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Código" field="code">
              <span class="req-cfg__td-code">{{ row.code }}</span>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Descripción" field="description">
              <span class="req-cfg__td-desc">{{ t(row.description) }}</span>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Estado" field="isActive">
              <label class="req-cfg__switch">
                <input type="checkbox" :checked="row.isActive" :disabled="!!categoryStatusSaving[row.id]" @change="toggleCategoryStatus(row)" />
                <span class="req-cfg__slider"></span>
              </label>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Acción">
              <div class="req-cfg__actions">
                <AppButtonEdit @click="openCategoryDrawer(row)" />
                <AppButtonDelete @click="requestDeleteCategory(row)" />
              </div>
            </AppDatatableColumn>
          </AppDatatable>
        </div>

        <!-- Tab Content: Request Types -->
        <div v-if="activeTab === 'requestTypes'" class="req-cfg__tab-content">
          <div class="req-cfg__toolbar">
            <AppButton :label="t('Crear Tipo de Solicitud')" variant="primary" icon="plus" @click="openRequestTypeDrawer(null)" />
          </div>

          <AppDatatable name="requestConfiguration.requestTypes" :service="requestTypesTableService" :enableSearchFilter="true" :refreshBtn="false" :showFilterSteps="true" class="req-cfg__datatable">
            <AppDatatableColumn v-slot="{ row }" label="Nombre" field="name">
              <div class="req-cfg__name-cell">
                <span class="req-cfg__name-primary">{{ t(row.name) }}</span>
                <span class="req-cfg__name-secondary">{{ t(row.description) }}</span>
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Categoría" field="categoryName">
              <AppBadge :label="row.categoryName" variant="info" />
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Requiere pago" field="requiresPayment">
              <span v-if="row.requiresPayment" class="req-cfg__cost">
                <AppIcon icon="dollar-sign" class="req-cfg__cost-icon" />
                {{ row.cost }}
              </span>
              <AppBadge v-else :label="t('Gratis')" variant="success" />
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Requiere aprobación" field="requiresApproval">
              <AppBadge :label="row.requiresApproval ? t('Sí') : t('No')" :variant="row.requiresApproval ? 'primary' : 'light'" />
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Estado" field="isActive">
              <label class="req-cfg__switch">
                <input type="checkbox" :checked="row.isActive" :disabled="!!requestTypeStatusSaving[row.id]" @change="toggleRequestTypeStatus(row)" />
                <span class="req-cfg__slider"></span>
              </label>
            </AppDatatableColumn>

            <AppDatatableColumn v-slot="{ row }" label="Acción">
              <div class="req-cfg__actions">
                <AppButtonEdit @click="openRequestTypeDrawer(row)" />
                <AppButtonDelete @click="requestDeleteRequestType(row)" />
              </div>
            </AppDatatableColumn>
          </AppDatatable>
        </div>
      </div>

      <!-- Category Drawer -->
      <AppDrawer :isVisible="showCategoryDrawer" @update:isVisible="showCategoryDrawer = $event" size="lg">
        <template #head>
          <div class="req-cfg__drawer-head">
            <span class="req-cfg__drawer-title">{{ editingCategory ? t('Editar Categoría') : t('Crear Categoría') }}</span>
            <span class="req-cfg__drawer-subtitle">{{ t('Configura la información de la categoría') }}</span>
          </div>
        </template>
        <template #body>
          <CategoryFormDrawer :key="categoryFormKey" ref="categoryFormRef" :initialData="categoryFormInitial" @submit="handleCategorySubmit" />
        </template>
        <template #footer>
          <div class="req-cfg__drawer-footer">
            <AppButton :label="t('Cancelar')" variant="ghost" @click="showCategoryDrawer = false" />
            <AppButton :label="editingCategory ? t('Guardar Cambios') : t('Crear Categoría')" variant="primary" @click="submitCategoryForm" />
          </div>
        </template>
      </AppDrawer>

      <!-- Delete category confirmation -->
      <AppModal v-model="showDeleteCategoryModal">
        <AppConfirmDeleteModal v-if="showDeleteCategoryModal" :entity="deletingCategory?.name ?? ''" @confirmDelete="handleDeleteCategory" />
      </AppModal>

      <!-- Delete request type confirmation -->
      <AppModal v-model="showDeleteRequestTypeModal">
        <AppConfirmDeleteModal v-if="showDeleteRequestTypeModal" :entity="deletingRequestType?.name ?? ''" @confirmDelete="handleDeleteRequestType" />
      </AppModal>

      <!-- Request Type Drawer -->
      <AppDrawer :isVisible="showRequestTypeDrawer" @update:isVisible="showRequestTypeDrawer = $event" size="lg">
        <template #head>
          <div class="req-cfg__drawer-head">
            <span class="req-cfg__drawer-title">{{ editingRequestType ? t('Editar Tipo de Solicitud') : t('Crear Tipo de Solicitud') }}</span>
            <span class="req-cfg__drawer-subtitle">{{ t('Configura los detalles del tipo de solicitud') }}</span>
          </div>
        </template>
        <template #body>
          <RequestTypeFormDrawer
            :key="requestTypeFormKey"
            ref="requestTypeFormRef"
            :initialData="requestTypeFormInitial"
            :categories="allCategories"
            :templates="templates"
            @submit="handleRequestTypeSubmit"
          />
        </template>
        <template #footer>
          <div class="req-cfg__drawer-footer">
            <AppButton :label="t('Cancelar')" variant="ghost" @click="showRequestTypeDrawer = false" />
            <AppButton :label="editingRequestType ? t('Guardar Cambios') : t('Crear Tipo de Solicitud')" variant="primary" @click="submitRequestTypeForm" />
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

// Shared components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';

// Module components
import CategoryFormDrawer from '../components/CategoryFormDrawer.vue';
import RequestTypeFormDrawer from '../components/RequestTypeFormDrawer.vue';

// Services & types
import { GetDocumentTemplatesWithPaginationService } from '../services/getDocumentTemplatesWithPagination.service';
import { GetApplicationCategoriesService } from '../services/getApplicationCategories.service';
import { GetApplicationTypesService } from '../services/getApplicationTypes.service';
import { CreateOrUpdateApplicationCategoryService } from '../services/createOrUpdateApplicationCategory.service';
import { DeleteApplicationCategoryService } from '../services/deleteApplicationCategory.service';
import { CreateOrUpdateApplicationTypeService } from '../services/createOrUpdateApplicationType.service';
import { DeleteApplicationTypeService } from '../services/deleteApplicationType.service';
import { CreateOrUpdateApplicationTypeDocumentService } from '../services/createOrUpdateApplicationTypeDocument.service';
import { GetApplicationTypeDocumentsService } from '../services/getApplicationTypeDocuments.service';
import type { CategoryItem, CategoryFormData, RequestTypeItem, RequestTypeFormData, RequiredDocumentFormData } from '../dtos/requestConfiguration.dto';

export default defineComponent({
  name: 'RequestConfiguration',
  components: {
    AppBaseList,
    AppButton,
    AppLoading,
    AppBadge,
    AppDrawer,
    AppModal,
    AppConfirmDeleteModal,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppButtonEdit,
    AppButtonDelete,
    CategoryFormDrawer,
    RequestTypeFormDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Configuración de Solicitudes' });

    const loading = ref(true);
    const activeTab = ref<'categories' | 'requestTypes'>('categories');

    const allCategories = ref<CategoryItem[]>([]);
    const templates = ref<Array<{ id: number; name: string }>>([]);

    const categoryStatusSaving = ref<Record<number, boolean>>({});
    const requestTypeStatusSaving = ref<Record<number, boolean>>({});

    // Category drawer
    const showCategoryDrawer = ref(false);
    const editingCategory = ref<CategoryItem | null>(null);
    const categoryFormInitial = ref<CategoryFormData | null>(null);
    const categoryFormRef = ref<{ submitForm: () => void } | null>(null);
    const categoryFormKey = ref(0);

    // Category delete
    const deletingCategory = ref<CategoryItem | null>(null);
    const showDeleteCategoryModal = ref(false);

    // Request type drawer
    const showRequestTypeDrawer = ref(false);
    const editingRequestType = ref<RequestTypeItem | null>(null);
    const requestTypeFormInitial = ref<RequestTypeFormData | null>(null);
    const requestTypeFormRef = ref<{ submitForm: () => void } | null>(null);
    const requestTypeFormKey = ref(0);

    // Request type delete
    const deletingRequestType = ref<RequestTypeItem | null>(null);
    const showDeleteRequestTypeModal = ref(false);

    // Tracks junction-table rows fetched on edit (for diff on save)
    const originalDocumentRelations = ref<Array<{ id: number; applicationDocumentRequiredId: number }>>([]);

    const headerStore = useHeaderStore();

    const getDocumentTemplatesWithPaginationService = new GetDocumentTemplatesWithPaginationService();
    const getApplicationCategoriesService = new GetApplicationCategoriesService();
    const getApplicationTypesService = new GetApplicationTypesService();
    const createOrUpdateApplicationCategoryService = new CreateOrUpdateApplicationCategoryService();
    const deleteApplicationCategoryService = new DeleteApplicationCategoryService();
    const createOrUpdateApplicationTypeService = new CreateOrUpdateApplicationTypeService();
    const deleteApplicationTypeService = new DeleteApplicationTypeService();
    const createOrUpdateApplicationTypeDocumentService = new CreateOrUpdateApplicationTypeDocumentService();
    const getApplicationTypeDocumentsService = new GetApplicationTypeDocumentsService();

    const toBool = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
      return Boolean(value);
    };

    const toNumber = (value: unknown): number | null => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const formatCOP = (value: unknown): string | null => {
      const n = toNumber(value);
      if (n === null) return null;
      const formatted = new Intl.NumberFormat('es-CO', {
        maximumFractionDigits: 0,
      }).format(n);
      return `$${formatted}`;
    };

    const toArray = (payload: any): any[] => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    };

    const documentTemplateToId: Record<string, number> = {
      cert_notas: 1,
      cert_matricula: 2,
      paz_salvo: 3,
      constancia: 4,
    };

    const generateCode = (): string => {
      const suffix = String(Date.now()).slice(-3);
      return `TYP${suffix}`;
    };

    const parseRoleId = (value: unknown): number => {
      const n = toNumber(value);
      return n !== null ? n : 1;
    };

    const resolveDocumentTemplatesId = (form: RequestTypeFormData): number | null => {
      if (typeof form.documentTemplate === 'string' && form.documentTemplate.trim() !== '') {
        return documentTemplateToId[form.documentTemplate] ?? toNumber(form.documentTemplate);
      }
      return form.documentTemplatesId ?? null;
    };

    const mapCategoryItem = (c: any): CategoryItem => ({
      id: Number(c.id ?? c.applicationCategoriesId ?? c.categoryId),
      name: String(c.name ?? ''),
      code: String(c.code ?? c.Code ?? ''),
      description: String(c.description ?? ''),
      isActive: toBool(c.isActive ?? c.active ?? c.is_active),
    });

    const mapRequestTypeItem = (rt: any, categoryNameById: Map<number, string>): RequestTypeItem => {
      const categoryId = Number(rt.applicationCategory?.id ?? rt.applicationCategoriesId ?? rt.categoryId ?? rt.applicationCategoryId ?? 0);
      const categoryName = String(rt.applicationCategory?.name ?? rt.applicationCategoriesName ?? rt.categoryName ?? rt.applicationCategoryName ?? '') || categoryNameById.get(categoryId) || '';

      const requiresPayment = toBool(rt.paymentRequired ?? rt.requiresPayment ?? rt.payment_required);
      const value = toNumber(rt.value ?? rt.cost);
      const cost = requiresPayment ? formatCOP(value) : null;

      return {
        id: Number(rt.id ?? rt.applicationTypesId ?? rt.applicationTypeId),
        code: rt.code ? String(rt.code) : undefined,
        name: String(rt.name ?? ''),
        description: String(rt.description ?? ''),
        categoryId,
        categoryName,
        rollId: toNumber(rt.role?.id ?? rt.rollId ?? rt.roleId) ?? undefined,
        requiresPayment,
        cost,
        value,
        paymentMethodsId: toNumber(rt.paymentMethod?.id ?? rt.paymentMethodsId) ?? undefined,
        requiresApproval: toBool(rt.requiresApproval ?? rt.requires_approval),
        requiresAttachments: toBool(rt.requiresAttachments),
        documentTemplatesId: toNumber(rt.documentTemplate?.id ?? rt.documentTemplatesId) ?? undefined,
        estimatedResponseTime: rt.estimatedResponseTime ? String(rt.estimatedResponseTime) : undefined,
        isActive: toBool(rt.isActive ?? rt.active ?? rt.is_active),
        requiredDocuments:
          toBool(rt.requiresAttachments) && Array.isArray(rt.documents)
            ? rt.documents.map((d: any) => {
                const doc = d.applicationDocumentRequired;
                const docId = toNumber(doc?.id ?? d.applicationDocumentRequiredId) ?? null;
                return {
                  applicationDocumentRequiredId: docId,
                  code: doc?.code ? String(doc.code) : undefined,
                  name: String(doc?.name ?? ''),
                  description: String(doc?.description ?? ''),
                  isRequired: true,
                };
              })
            : [],
      };
    };

    const categoriesTableService = {
      run: (params: any) =>
        getApplicationCategoriesService.run(params).then((response: any) => {
          const items = toArray(response).map(mapCategoryItem);
          return {
            data: items,
            pagination: response?.pagination,
            total: response?.pagination?.total ?? items.length,
          };
        }),
    };

    const requestTypesTableService = {
      run: (params: any) =>
        getApplicationTypesService.run(params).then((response: any) => {
          const items = toArray(response).map((rt: any) => mapRequestTypeItem(rt, new Map()));
          return {
            data: items,
            pagination: response?.pagination,
            total: response?.pagination?.total ?? items.length,
          };
        }),
    };

    const buildApplicationTypePayload = (form: RequestTypeFormData, options: { includeCode: boolean }) => {
      const roleId = parseRoleId(form.targetAudience);
      const paymentMethodsId = form.paymentMethodsId ?? null;
      const documentTemplatesId = resolveDocumentTemplatesId(form);
      const documents = form.requiresAttachments
        ? (form.requiredDocuments ?? [])
            .filter((d) => d.applicationDocumentRequiredId)
            .map((d) => ({
              applicationDocumentRequiredId: d.applicationDocumentRequiredId,
            }))
        : [];

      return {
        ...(options.includeCode ? { code: form.code?.trim() ? form.code.trim() : generateCode() } : {}),
        name: form.name,
        applicationCategoriesId: form.categoryId,
        description: form.description,
        rollId: roleId,
        paymentRequired: form.requiresPayment ? 1 : 0,
        ...(paymentMethodsId ? { paymentMethodsId } : {}),
        value: form.requiresPayment ? form.cost : 0,
        requiresApproval: form.requiresApproval ? 1 : 0,
        requiresAttachments: form.requiresAttachments ? 1 : 0,
        ...(documentTemplatesId ? { documentTemplatesId } : {}),
        estimatedResponseTime: form.estimatedTime,
        isActive: form.isActive ? 1 : 0,
        documents,
      };
    };

    const loadAllCategories = async () => {
      try {
        const response = await getApplicationCategoriesService.run({
          noPag: true,
        });
        allCategories.value = toArray(response).map(mapCategoryItem);
      } catch (_e) {
        allCategories.value = [];
      }
    };

    const refreshTables = () => {
      document.dispatchEvent(new Event('updateDatatable'));
    };

    onMounted(async () => {
      headerStore.module = { name: 'Gestión de Solicitudes', url: '' };
      headerStore.moduleItem = {
        name: 'Configuración de Solicitudes',
        url: '',
      };
      headerStore.moduleSubItem = { name: '', url: '' };

      try {
        const tplResponse = await getDocumentTemplatesWithPaginationService.run({
          noPag: true,
        } as any);
        const tplData = Array.isArray(tplResponse) ? tplResponse : tplResponse?.data ?? [];
        templates.value = tplData.map((t: any) => ({ id: t.id, name: t.name }));
      } catch (_e) {
        templates.value = [];
      }

      await loadAllCategories();
      loading.value = false;
    });

    // ─── Category ───
    const openCategoryDrawer = (cat: CategoryItem | null) => {
      editingCategory.value = cat;
      categoryFormInitial.value = cat
        ? {
            name: cat.name,
            code: cat.code,
            description: cat.description,
            isActive: cat.isActive,
          }
        : null;
      categoryFormKey.value++;
      showCategoryDrawer.value = true;
    };

    const submitCategoryForm = () => {
      categoryFormRef.value?.submitForm();
    };

    const handleCategorySubmit = async (formData: CategoryFormData) => {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        isActive: formData.isActive ? 1 : 0,
      };

      try {
        await createOrUpdateApplicationCategoryService.run(payload, editingCategory.value?.id ?? undefined);
        showCategoryDrawer.value = false;
        refreshTables();
        await loadAllCategories();
      } catch (_e) {
        // keep drawer open so user can retry
      }
    };

    const requestDeleteCategory = (cat: CategoryItem) => {
      deletingCategory.value = cat;
      showDeleteCategoryModal.value = true;
    };

    const handleDeleteCategory = async () => {
      if (!deletingCategory.value) return;
      try {
        await deleteApplicationCategoryService.run(deletingCategory.value.id);
        showDeleteCategoryModal.value = false;
        deletingCategory.value = null;
        refreshTables();
        await loadAllCategories();
      } catch (_e) {
        showDeleteCategoryModal.value = false;
      }
    };

    const toggleCategoryStatus = async (cat: CategoryItem) => {
      if (categoryStatusSaving.value[cat.id]) return;
      categoryStatusSaving.value[cat.id] = true;

      const prev = cat.isActive;
      const next = !prev;
      cat.isActive = next;

      try {
        await createOrUpdateApplicationCategoryService.run(
          {
            name: cat.name,
            code: cat.code,
            description: cat.description,
            isActive: next ? 1 : 0,
          },
          cat.id
        );
        refreshTables();
        await loadAllCategories();
      } catch (_e) {
        cat.isActive = prev;
      } finally {
        delete categoryStatusSaving.value[cat.id];
      }
    };

    // ─── Request Type ───
    const buildRequestTypeFormInitial = (rt: RequestTypeItem, docs: RequiredDocumentFormData[]): RequestTypeFormData => ({
      code: rt.code || undefined,
      name: rt.name,
      categoryId: rt.categoryId,
      description: rt.description,
      targetAudience: rt.rollId ? String(rt.rollId) : '',
      requiresPayment: rt.requiresPayment,
      cost: typeof rt.value === 'number' ? rt.value : rt.cost ? parseInt(rt.cost.replace(/[^0-9]/g, ''), 10) : 0,
      paymentMethodsId: rt.paymentMethodsId ?? null,
      requiresApproval: rt.requiresApproval,
      requiresAttachments: rt.requiresAttachments ?? false,
      documentTemplate: rt.documentTemplatesId ? String(rt.documentTemplatesId) : '',
      documentTemplatesId: rt.documentTemplatesId ?? null,
      processFlow: '',
      estimatedTime: rt.estimatedResponseTime || '',
      isActive: rt.isActive,
      requiredDocuments: docs,
    });

    const openRequestTypeDrawer = async (rt: RequestTypeItem | null) => {
      editingRequestType.value = rt;
      originalDocumentRelations.value = [];

      if (rt) {
        let docs: RequiredDocumentFormData[] = [];
        if (rt.requiresAttachments) {
          try {
            const response = await getApplicationTypeDocumentsService.run({
              applicationTypesId: rt.id,
              noPag: true,
            });
            const relations: any[] = Array.isArray(response) ? response : response?.data ?? [];
            originalDocumentRelations.value = relations.map((r) => ({
              id: r.id,
              applicationDocumentRequiredId: r.applicationDocumentRequiredId,
            }));
            const seen = new Set<number>();
            docs = relations.reduce((acc: RequiredDocumentFormData[], r: any) => {
              const docId = r.applicationDocumentRequiredId;
              if (!seen.has(docId) && r.applicationDocumentRequired) {
                seen.add(docId);
                acc.push({
                  applicationDocumentRequiredId: docId,
                  code: r.applicationDocumentRequired?.code ?? '',
                  name: r.applicationDocumentRequired?.name ?? '',
                  description: '',
                  isRequired: true,
                });
              }
              return acc;
            }, []);
          } catch (_e) {
            docs = [];
          }
        }
        requestTypeFormInitial.value = buildRequestTypeFormInitial(rt, docs);
      } else {
        requestTypeFormInitial.value = null;
      }
      requestTypeFormKey.value++;
      showRequestTypeDrawer.value = true;
    };

    const submitRequestTypeForm = () => {
      requestTypeFormRef.value?.submitForm();
    };

    const handleRequestTypeSubmit = async (formData: RequestTypeFormData) => {
      try {
        const payload = buildApplicationTypePayload(formData, {
          includeCode: !editingRequestType.value,
        });
        const saved = await createOrUpdateApplicationTypeService.run(payload, editingRequestType.value?.id ?? undefined);
        const savedTypeId = toNumber(saved?.id ?? saved?.data?.id) ?? editingRequestType.value?.id ?? null;

        if (savedTypeId && editingRequestType.value && formData.requiresAttachments) {
          // EDIT: only POST newly added docs — no deletes
          const formDocIds = (formData.requiredDocuments ?? []).filter((d) => d.applicationDocumentRequiredId).map((d) => d.applicationDocumentRequiredId as number);
          const originalIds = originalDocumentRelations.value.map((r) => r.applicationDocumentRequiredId);
          const toAdd = formDocIds.filter((id) => !originalIds.includes(id));
          if (toAdd.length) {
            await createOrUpdateApplicationTypeDocumentService.run({
              applicationTypesId: savedTypeId,
              documents: toAdd.map((id) => ({
                applicationDocumentRequiredId: id,
              })),
            });
          }
        }
        // On CREATE the type API handles junction rows via the `documents` array in the payload.

        showRequestTypeDrawer.value = false;
        refreshTables();
      } catch (_e) {
        // keep drawer open so user can retry
      }
    };

    const requestDeleteRequestType = (rt: RequestTypeItem) => {
      deletingRequestType.value = rt;
      showDeleteRequestTypeModal.value = true;
    };

    const handleDeleteRequestType = async () => {
      if (!deletingRequestType.value) return;
      try {
        await deleteApplicationTypeService.run(deletingRequestType.value.id);
        showDeleteRequestTypeModal.value = false;
        deletingRequestType.value = null;
        refreshTables();
      } catch (_e) {
        showDeleteRequestTypeModal.value = false;
      }
    };

    const getCostNumber = (rt: RequestTypeItem): number => {
      if (typeof rt.value === 'number') return rt.value;
      if (rt.cost) return parseInt(rt.cost.replace(/[^0-9]/g, ''), 10) || 0;
      return 0;
    };

    const toRequestTypeFormData = (rt: RequestTypeItem, isActive: boolean): RequestTypeFormData => ({
      code: rt.code || undefined,
      name: rt.name,
      categoryId: rt.categoryId,
      description: rt.description,
      targetAudience: rt.rollId ? String(rt.rollId) : '',
      requiresPayment: rt.requiresPayment,
      cost: getCostNumber(rt),
      paymentMethodsId: rt.paymentMethodsId ?? null,
      requiresApproval: rt.requiresApproval,
      requiresAttachments: rt.requiresAttachments ?? false,
      documentTemplate: rt.documentTemplatesId ? String(rt.documentTemplatesId) : '',
      documentTemplatesId: rt.documentTemplatesId ?? null,
      processFlow: '',
      estimatedTime: rt.estimatedResponseTime || '',
      isActive,
      requiredDocuments: rt.requiredDocuments ?? [],
    });

    const toggleRequestTypeStatus = async (rt: RequestTypeItem) => {
      if (requestTypeStatusSaving.value[rt.id]) return;
      requestTypeStatusSaving.value[rt.id] = true;

      const prev = rt.isActive;
      const next = !prev;
      rt.isActive = next;

      try {
        const payload = buildApplicationTypePayload(toRequestTypeFormData(rt, next), { includeCode: false });
        await createOrUpdateApplicationTypeService.run(payload, rt.id);
        refreshTables();
      } catch (_e) {
        rt.isActive = prev;
      } finally {
        delete requestTypeStatusSaving.value[rt.id];
      }
    };

    return {
      t,
      loading,
      activeTab,
      allCategories,
      templates,
      categoriesTableService,
      requestTypesTableService,
      // Category drawer
      showCategoryDrawer,
      editingCategory,
      categoryFormInitial,
      categoryFormRef,
      categoryFormKey,
      openCategoryDrawer,
      submitCategoryForm,
      handleCategorySubmit,
      toggleCategoryStatus,
      categoryStatusSaving,
      // Category delete
      deletingCategory,
      showDeleteCategoryModal,
      requestDeleteCategory,
      handleDeleteCategory,
      // Request type drawer
      showRequestTypeDrawer,
      editingRequestType,
      requestTypeFormInitial,
      requestTypeFormRef,
      requestTypeFormKey,
      openRequestTypeDrawer,
      submitRequestTypeForm,
      handleRequestTypeSubmit,
      toggleRequestTypeStatus,
      requestTypeStatusSaving,
      // Request type delete
      deletingRequestType,
      showDeleteRequestTypeModal,
      requestDeleteRequestType,
      handleDeleteRequestType,
      originalDocumentRelations,
    };
  },
});
</script>

<style scoped>
.req-cfg {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ─── Header ─── */
.req-cfg__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.req-cfg__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.req-cfg__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 4px 0 0;
}

/* ─── Tabs ─── */
.req-cfg__tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e2e8f0;
}

.req-cfg__tab {
  padding: 12px 24px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #637381;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}

.req-cfg__tab:hover {
  color: #212b36;
}

.req-cfg__tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* ─── Tab Content ─── */
.req-cfg__tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.req-cfg__toolbar {
  display: flex;
  justify-content: flex-end;
}

.req-cfg__td-name {
  font-weight: 600;
  color: #212b36;
}

.req-cfg__td-desc {
  color: #637381;
  max-width: 320px;
}

/* ─── Name Cell (Request Types) ─── */
.req-cfg__name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.req-cfg__name-primary {
  font-weight: 600;
  color: #212b36;
}

.req-cfg__name-secondary {
  font-size: 12px;
  color: #919eab;
}

/* ─── Cost ─── */
.req-cfg__cost {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #212b36;
}

.req-cfg__cost-icon {
  color: #2e7d32;
  font-size: 12px;
}

/* ─── Actions ─── */
.req-cfg__actions {
  display: flex;
  gap: 8px;
}

/* ─── Toggle Switch ─── */
.req-cfg__switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.req-cfg__switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.req-cfg__slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #c4cdd5;
  transition: 0.3s;
  border-radius: 24px;
}

.req-cfg__slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.req-cfg__switch input:checked + .req-cfg__slider {
  background-color: var(--color-primary);
}

.req-cfg__switch input:checked + .req-cfg__slider::before {
  transform: translateX(20px);
}

/* ─── Drawer Head ─── */
.req-cfg__drawer-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.req-cfg__drawer-title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.req-cfg__drawer-subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* ─── Drawer Footer ─── */
.req-cfg__drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
