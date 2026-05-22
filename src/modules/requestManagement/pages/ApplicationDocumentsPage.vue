<template>
  <AppBaseList :title="t('Documentos Requeridos')">
    <template #actions>
      <AppButton :label="t('Crear Documento')" variant="light" icon="plus" style="color: white" @click="openFormDrawer(null)" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="app-docs">
        <!-- Header -->
        <div class="app-docs__header">
          <h2 class="app-docs__title">{{ t('Documentos Requeridos') }}</h2>
          <p class="app-docs__subtitle">
            {{ t('Gestiona los tipos de documentos que los usuarios deben adjuntar en sus solicitudes') }}
          </p>
        </div>

        <!-- Search -->
        <div class="app-docs__search-row">
          <div class="app-docs__search-wrap">
            <AppIcon icon="search" class="app-docs__search-icon" />
            <input v-model="search" type="text" class="app-docs__search-input" :placeholder="t('Buscar documento...')" @input="onSearchChange" />
          </div>
        </div>

        <!-- Grid de cards -->
        <div class="app-docs__grid">
          <RequiredDocumentCard v-for="doc in documents" :key="doc.id" :document="doc" @edit="openFormDrawer" @delete="requestDelete" />
        </div>

        <!-- Empty state -->
        <AppEmptyResponse
          v-if="!loading && documents.length === 0"
          title="No hay documentos requeridos"
          subtitle="Crea el primer documento requerido para usarlo en los tipos de solicitud"
          :show-image="false"
          size="xs"
        />

        <!-- Pagination -->
        <div v-if="totalItems > perPage" class="app-docs__pagination">
          <AppPagination :current="currentPage" :total="totalItems" :per-page="perPage" :loading="loading" @update:current="onPageChange" />
        </div>
      </div>

      <!-- Form drawer (create / edit) -->
      <AppDrawer :isVisible="showFormDrawer" @update:isVisible="showFormDrawer = $event" size="md">
        <template #head>
          <div class="app-docs__drawer-head">
            <span class="app-docs__drawer-title">
              {{ editingDoc ? t('Editar Documento') : t('Crear Documento') }}
            </span>
            <span class="app-docs__drawer-subtitle">{{ t('Completa los datos del documento requerido') }}</span>
          </div>
        </template>
        <template #body>
          <RequiredDocumentFormDrawer :key="formKey" ref="formDrawerRef" :initialData="editingDoc" @submit="handleFormSubmit" />
        </template>
        <template #footer>
          <div class="app-docs__drawer-footer">
            <AppButton :label="t('Cancelar')" variant="ghost" @click="showFormDrawer = false" />
            <AppButton :label="editingDoc ? t('Guardar Cambios') : t('Crear Documento')" variant="primary" :loading="saving" @click="submitForm" />
          </div>
        </template>
      </AppDrawer>

      <!-- Delete confirmation -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" :entity="deletingDoc?.name ?? ''" @confirmDelete="handleDelete" />
      </AppModal>
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
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppPagination from '../../../shared/components/AppPagination.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

// Module components
import RequiredDocumentCard from '../components/RequiredDocumentCard.vue';
import RequiredDocumentFormDrawer from '../components/RequiredDocumentFormDrawer.vue';

// Services & types
import { GetApplicationDocumentRequiredService } from '../services/getApplicatioDocumentRequiredItem.service';
import { CreateOrUpdateApplicationDocumentRequiredService } from '../services/createOrUpdateApplicationDocumentRequired.service';
import { DeleteApplicationDocumentRequiredService } from '../services/deleteApplicationDocumentRequired.service';
import type { ApplicationDocumentRequiredItem, ApplicationDocumentRequiredFormData } from '../dtos/requestConfiguration.dto';

export default defineComponent({
  name: 'ApplicationDocumentsPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppDrawer,
    AppEmptyResponse,
    AppModal,
    AppConfirmDeleteModal,
    AppPagination,
    AppIcon,
    RequiredDocumentCard,
    RequiredDocumentFormDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Documentos Requeridos' });

    const loading = ref(true);
    const saving = ref(false);
    const documents = ref<ApplicationDocumentRequiredItem[]>([]);

    // Search & pagination
    const search = ref('');
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalItems = ref(0);
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    // Drawer
    const showFormDrawer = ref(false);
    const editingDoc = ref<ApplicationDocumentRequiredItem | null>(null);
    const formDrawerRef = ref<{ submitForm: () => void } | null>(null);
    const formKey = ref(0);

    // Delete
    const deletingDoc = ref<ApplicationDocumentRequiredItem | null>(null);
    const showDeleteModal = ref(false);

    const getService = new GetApplicationDocumentRequiredService();
    const createOrUpdateService = new CreateOrUpdateApplicationDocumentRequiredService();
    const deleteService = new DeleteApplicationDocumentRequiredService();

    const mapDoc = (d: any): ApplicationDocumentRequiredItem => ({
      id: Number(d.id),
      code: String(d.code ?? ''),
      name: String(d.name ?? ''),
      description: String(d.description ?? ''),
      isRequired: Boolean(d.isRequired),
    });

    const loadDocuments = async () => {
      loading.value = true;
      try {
        const data = await getService.run({
          page: currentPage.value,
          perPage: perPage.value,
          ...(search.value.trim() ? { search: search.value.trim() } : {}),
        });
        const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const rawTotal = data?.pagination?.total ?? data?.total ?? null;
        totalItems.value = rawTotal !== null ? Number(rawTotal) : items.length;
        documents.value = items.map(mapDoc);
      } catch (_e) {
        documents.value = [];
      } finally {
        loading.value = false;
      }
    };

    const onSearchChange = () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        loadDocuments();
      }, 300);
    };

    const onPageChange = (page: number) => {
      currentPage.value = page;
      loadDocuments();
    };

    const openFormDrawer = (doc: ApplicationDocumentRequiredItem | null) => {
      editingDoc.value = doc;
      formKey.value++;
      showFormDrawer.value = true;
    };

    const submitForm = () => {
      formDrawerRef.value?.submitForm();
    };

    const handleFormSubmit = async (formData: ApplicationDocumentRequiredFormData) => {
      saving.value = true;
      try {
        await createOrUpdateService.run(formData, editingDoc.value?.id ?? undefined);
        showFormDrawer.value = false;
        await loadDocuments();
      } catch (_e) {
        // keep drawer open so user can retry
      } finally {
        saving.value = false;
      }
    };

    const requestDelete = (doc: ApplicationDocumentRequiredItem) => {
      deletingDoc.value = doc;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      if (!deletingDoc.value) return;
      try {
        await deleteService.run(deletingDoc.value.id);
        showDeleteModal.value = false;
        deletingDoc.value = null;
        if (documents.value.length === 1 && currentPage.value > 1) {
          currentPage.value--;
        }
        await loadDocuments();
      } catch (_e) {
        showDeleteModal.value = false;
      }
    };

    onMounted(() => {
      const headerStore = useHeaderStore();
      headerStore.module = { name: 'Gestión de Solicitudes', url: '' };
      headerStore.moduleItem = { name: 'Documentos Requeridos', url: '' };
      headerStore.moduleSubItem = { name: '', url: '' };
      loadDocuments();
    });

    return {
      t,
      loading,
      saving,
      documents,
      search,
      currentPage,
      perPage,
      totalItems,
      showFormDrawer,
      editingDoc,
      formDrawerRef,
      formKey,
      deletingDoc,
      showDeleteModal,
      onSearchChange,
      onPageChange,
      openFormDrawer,
      submitForm,
      handleFormSubmit,
      requestDelete,
      handleDelete,
    };
  },
});
</script>

<style scoped>
.app-docs {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.app-docs__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-docs__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.app-docs__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

/* Search */
.app-docs__search-row {
  display: flex;
  align-items: center;
}

.app-docs__search-wrap {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.app-docs__search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #919eab;
  font-size: 13px;
  pointer-events: none;
}

.app-docs__search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.app-docs__search-input:focus {
  border-color: var(--color-primary);
  background: #fff;
}

.app-docs__search-input::placeholder {
  color: #c4cdd5;
}

/* Grid */
.app-docs__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .app-docs__grid {
    grid-template-columns: 1fr;
  }
}

/* Pagination */
.app-docs__pagination {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

/* Drawer */
.app-docs__drawer-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-docs__drawer-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-light);
}

.app-docs__drawer-subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.app-docs__drawer-footer {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
}
</style>
