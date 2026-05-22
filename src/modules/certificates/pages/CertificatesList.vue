<template>
  <AppBaseList :title="title" :subtitle="subtitle">
    <template #actions>
      <AppButton @click="goToCreate" :label="'Crear Certificado'" variant="light" />
    </template>

    <template v-slot:content>
      <!-- Filtros y búsqueda -->
      <div class="filters-section">
        <div class="search-box">
          <AppInput v-model="searchQuery" placeholder="Buscar certificados..." @input="handleSearch" />
        </div>
      </div>
      <AppLoading v-if="loading"></AppLoading>
      <!-- Lista de certificados -->
      <AppEmptyResponse v-if="certificates.length === 0" :show-image="true" title="No se encontraron certificados" subtitle="Comienza creando tu primer certificado personalizado" />

      <div v-else class="certificates-grid">
        <CertificateCard
          v-for="certificate in certificates"
          :key="certificate.id"
          :certificate="certificate"
          @preview="handlePreview"
          @edit="handleEdit"
          @duplicate="handleDuplicate"
          @delete="handleDelete"
        />

        <!-- Paginación -->
        <div v-if="totalItems > 0" class="pagination-container">
          <!-- filtro de perPage -->
          <div class="per-page-filter d-flex align-items-center gap-2">
            <AppFilter v-model="itemsPerPage" :filter-name="`certificatesTemplates.perPage`" class="d-flex align-items-center gap-1" style="margin-bottom: 0 !important">
              <span>Mostrar</span>
              <AppSelect v-model="itemsPerPage">
                <option v-for="opt in perPageOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </AppSelect>
            </AppFilter>

            <span class="record-info ms-1"> {{ fromRecord }} - {{ toRecord }} de {{ totalItems }} registros </span>
          </div>

          <!-- paginación -->
          <div class="pagination-controls">
            <AppPagination @update:current="currentPage = $event" :loading="loading" class="border-0" :total="totalItems" :current="currentPage" :per-page="itemsPerPage" />
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar -->
      <AppModal v-model="showDeleteModal" size="sm">
        <AppConfirmDeleteModal v-if="showDeleteModal" :entity="currentEntity" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
      <!-- Modal de previsualización -->
      <AppModal v-model="showPreview" size="xl">
        <CertificatePreviewModal v-if="showPreview" :initialJson="dataModal" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

// Componentes
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppPagination from '../../../shared/components/AppPagination.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import CertificateCard from '../components/CertificateCard.vue';

// Services y tipos
import { certificateService } from '../services/certificate.service';
import type { Certificate, CertificateListParams } from '../dtos/certificate.dto';
import { GetCertificatesTemplatesWithPaginateService } from '../services/getCertificatesTemplatesWithPaginate.service';
import { CreateOrUpdateCertificatesService } from '../services/createOrUpdateCertificates.service';
import { useCertificateEditorStore } from '../../../stores/certificateEditor.store';
import { CreateFilesUploadService } from '../services/createFilesUpload.service';
import CertificatePreviewModal from '../components/CertificatePreviewModal.vue';
import { GetCertificatesTemplatesService } from '../services/getCertificatesTemplates.service';
import { DeleteCertificatesTemplateService } from '../services/deleteCertificatesTemplate.service';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { useHeaderStore } from '../../../stores/header.store';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

const getCertificatesTemplatesWithPaginateService = new GetCertificatesTemplatesWithPaginateService();
const createOrUpdateCertificatesService = new CreateOrUpdateCertificatesService();
const createFilesUploadService = new CreateFilesUploadService();
const getCertificatesTemplatesService = new GetCertificatesTemplatesService();
const deleteCertificatesTemplateService = new DeleteCertificatesTemplateService();

export default defineComponent({
  name: 'CertificatesList',
  components: {
    AppButton,
    AppLoading,
    AppEmptyResponse,
    AppPagination,
    AppModal,
    AppBaseList,
    CertificateCard,
    CertificatePreviewModal,
    AppConfirmDeleteModal,
    AppFilter,
    AppSelect,
    AppInput,
  },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const editorStore = useCertificateEditorStore();

    const title = 'degreesAndTitles.certificateTemplate';
    const subtitle = 'Gestiona y crea certificados personalizados';
    useMeta({ title: t(title) });

    // Estado reactivo
    const loading = ref(false);
    const certificates = ref<Certificate[]>([]);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const perPageOptions = [10, 20, 30];

    const totalItems = ref(0);
    const fromRecord = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1;
    });
    const toRecord = computed(() => {
      return Math.min(currentPage.value * itemsPerPage.value, totalItems.value);
    });
    const totalPages = ref(0);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const showDeleteModal = ref(false);
    const certificateToDelete = ref<Certificate | null>(null);
    const deletingCertificate = ref(false);
    const showPreview = ref(false);
    const dataModal = ref<{}>({});
    // Opciones para filtros
    const statusOptions = [
      { label: 'Todos los estados', value: '' },
      { label: 'Borrador', value: 'draft' },

      { label: 'Publicado', value: 'published' },
      { label: 'Archivado', value: 'archived' },
    ];
    const currentEntity = ref<any>(null);

    // Métodos
    const loadCertificates = async () => {
      loading.value = true;

      try {
        const params: CertificateListParams = {
          page: currentPage.value,
          perPage: itemsPerPage.value,
          search: searchQuery.value || undefined,
          status: statusFilter.value ? (statusFilter.value as 'draft' | 'published' | 'archived') : undefined,
          sortOrder: 'desc',
        };

        const response: any = await getCertificatesTemplatesWithPaginateService.run(params);

        const data = response?.data ?? [];
        const total = response?.pagination?.total ?? 0;

        totalItems.value = total;
        totalPages.value = response?.pagination?.pageCount ?? Math.ceil(total / itemsPerPage.value);

        // 👇 Si quedé en una página sin data, salto a la última página válida
        const lastPage = Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value));

        if (data.length === 0 && totalItems.value > 0 && currentPage.value > lastPage) {
          currentPage.value = lastPage; // esto dispara el watch y recarga
          return;
        }

        certificates.value = data;
      } catch (error) {
        console.error('Error loading certificates:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      loadCertificates();
    };

    const handleFilterChange = () => {
      currentPage.value = 1;
      loadCertificates();
    };

    const goToCreate = async () => {
      await editorStore.initializeTemplate();

      // JSON
      const json = JSON.stringify(editorStore.exportToJSON(), null, 2);
      const blobJson = new Blob([json], { type: 'application/json' });
      const file = new File([blobJson], 'plantilla.json', {
        type: 'application/json',
      });

      // HTML
      const html = await editorStore.exportToHTMLFromJSON();
      const blobHtml = new Blob([html], { type: 'text/html' });
      const fileHtml = new File([blobHtml], 'plantilla.html', {
        type: 'text/html',
      });

      const responseJson = await createFilesUploadService.run({
        file: file,
      });
      const responseHtml = await createFilesUploadService.run({
        file: fileHtml,
      });

      // const responseHtml = await createFilesUploadService.run({ file: file });
      const dataSend = {
        name: 'Plantilla nueva',
        typeDocumentId: 5,
        body: null,
        header: null,
        footer: null,
        urlJsonTemplate: responseJson?.data?.url,
        urlHtmlTemplate: responseHtml?.data?.url,
        marginTop: null,
        marginBottom: null,
        marginLeft: null,
        marginRight: null,
        backgroundImage: null,
      };

      const response = await createOrUpdateCertificatesService.run(dataSend);
      await router.push({
        name: 'certificates.certificateEdit',
        params: { id: response.data.id.toString() },
      });
    };

    const handlePreview = async (data: any) => {
      await loadTemplate(data.id);
      showPreview.value = true;
    };
    const loadTemplate = async (templateId: string) => {
      try {
        // 1️⃣ metadata del certificado (trae urlJsonTemplate)
        const certificate = await getCertificatesTemplatesService.run(Number(templateId));
        // 2️⃣ si existe el JSON en S3 → traerlo
        if (certificate?.urlJsonTemplate) {
          const res = await fetch(certificate.urlJsonTemplate, {
            cache: 'no-store', // opcional: evita cache raro
          });
          if (!res.ok) {
            throw new Error(`Fetch JSON failed: ${res.status} ${res.statusText}`);
          }
          const jsonData = await res.json();
          dataModal.value = await jsonData;

          return;
        }
      } catch (error) {
        console.error('❌ Error loading template:', error);
        editorStore.initializeTemplate();
      }
    };
    const handleEdit = (certificate: Certificate) => {
      router.push({
        name: 'certificates.certificateEdit',
        params: { id: certificate.id.toString() },
      });
    };

    const handleDuplicate = async (certificate: Certificate) => {
      try {
        loading.value = true;
        const duplicated = await certificateService.duplicateCertificate(certificate.id);
        if (duplicated) {
          loadCertificates();
        }
      } catch (error) {
        console.error('Error duplicating certificate:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleDelete = (certificate: Certificate) => {
      certificateToDelete.value = certificate;
      currentEntity.value = certificate.name;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      if (!certificateToDelete.value) return;

      try {
        deletingCertificate.value = true;
        const success = await deleteCertificatesTemplateService.run(certificateToDelete.value.id);

        if (success) {
          showDeleteModal.value = false;
          certificateToDelete.value = null;
          loadCertificates();
        }
      } catch (error) {
        console.error('Error deleting certificate:', error);
      } finally {
        deletingCertificate.value = false;
      }
    };

    // Watchers
    watch(currentPage, () => {
      loadCertificates();
    });

    // Lifecycle
    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadCertificates();
    });

    return {
      title,
      subtitle,
      loading,
      certificates,
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      searchQuery,
      statusFilter,
      showDeleteModal,
      certificateToDelete,
      deletingCertificate,
      statusOptions,
      loadCertificates,
      handleSearch,
      handleFilterChange,
      goToCreate,
      handlePreview,
      handleEdit,
      handleDuplicate,
      handleDelete,
      confirmDelete,
      showPreview,
      dataModal,
      currentEntity,
      perPageOptions,
      fromRecord,
      toRecord,
    };
  },
});
</script>

<style scoped>
.filters-section {
  display: flex;
  width: 100%;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  max-width: 400px;
  min-width: 200px;
}

.filter-controls {
  min-width: 200px;
}

.certificates-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

/* Modal styles */
.delete-modal {
  text-align: center;
  padding: 1.5rem;
}

.modal-icon {
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 3rem;
  color: #f59e0b;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.modal-text {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .certificates-list {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    align-self: flex-start;
  }

  .filters-section {
    flex-direction: column;
  }

  .search-box,
  .filter-controls {
    min-width: unset;
  }

  .modal-actions {
    flex-direction: column;
  }
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

/* Cada parte ocupa su espacio en móviles */
.per-page-filter,
.pagination-controls {
  flex: 1 1 auto;
}

/* Alineación en desktop: filtro a la izquierda, controles a la derecha */
@media (min-width: 576px) {
  .per-page-filter {
    justify-content: flex-start;
  }
  .pagination-controls {
    display: flex;
    justify-content: flex-end;
  }
}

/* En pantallas muy pequeñas, apilar verticalmente */
@media (max-width: 575px) {
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }
  .per-page-filter,
  .pagination-controls {
    width: 100%;
  }
  .per-page-filter {
    justify-content: center;
    margin-bottom: 0.5rem;
  }
}
</style>
