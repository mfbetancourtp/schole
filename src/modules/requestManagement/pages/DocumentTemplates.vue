<template>
  <AppBaseList :title="t('Plantillas de Documentos')">
    <template #actions>
      <AppButton style="color: white" :label="t('Crear Plantilla')" icon="plus" @click="openFormDrawer(null)" />
    </template>

    <template #content>
      <AppDatatable name="documentTemplates" :service="service" :params="params">
        <AppDatatableColumn v-slot="{ row }" label="Nombre" field="name" :sortable="true">
          <div class="d-flex align-items-center gap-2">
            <AppIcon icon="file-alt" />
            {{ row.name }}
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="Código" field="code" :sortable="true">
          {{ row.code }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="Tipo de Documento">
          <AppBadge :label="row.documentTemplatesType?.name" variant="primary" />
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="Última Actualización" field="updatedAt" :sortable="true">
          <div class="d-flex align-items-center gap-2">
            <AppIcon icon="calendar-alt" />
            {{ formatDate(row.updatedAt) }}
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="Estado">
          <div class="d-flex align-items-center gap-2">
            <div class="form-check form-switch mb-0">
              <input type="checkbox" class="form-check-input" role="switch" :checked="row.status === 1" @change="toggleStatus(row)" />
            </div>
            <span>{{ row.status === 1 ? t('Activo') : t('Inactivo') }}</span>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn label="Opciones" v-slot="{ row }">
          <div class="d-flex gap-1">
            <AppButton variant="secondary" outlined icon="eye" v-tooltip="'Ver'" @click="openPreview(row)" />
            <AppButton variant="secondary" outlined icon="file-alt" v-tooltip="'Editar Contenido'" @click="goToEditor(row)" />
            <AppButtonEdit @click="openFormDrawer(row)" />
            <AppButtonDelete @click="confirmDelete(row)" />
          </div>
        </AppDatatableColumn>
      </AppDatatable>

      <!-- Modal: Confirmar eliminar -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" entity="plantilla de documento" @confirmDelete="handleDelete" />
      </AppModal>

      <!-- Drawer: Crear / Editar -->
      <AppDrawer :isVisible="showFormDrawer" @update:isVisible="showFormDrawer = $event" size="lg">
        <template #head>
          <div class="d-flex flex-column gap-1">
            <span class="fw-bold text-white fs-5">
              {{ editingTemplate ? t('Editar Plantilla') : t('Crear Plantilla') }}
            </span>
            <span class="text-white opacity-75 small">
              {{ t('Diseña la plantilla del documento institucional') }}
            </span>
          </div>
        </template>
        <template #body>
          <TemplateFormDrawer ref="formRef" :initialData="formInitial" @submit="handleFormSubmit" />
        </template>
        <template #footer>
          <div class="d-flex justify-content-end gap-2">
            <AppButton :label="t('Cancelar')" variant="light" @click="showFormDrawer = false" />
            <AppButton :label="editingTemplate ? t('Guardar Cambios') : t('Crear Plantilla')" variant="primary" @click="submitForm" />
          </div>
        </template>
      </AppDrawer>

      <!-- Modal: Vista Previa -->
      <AppModal v-model="showPreviewModal" size="xl">
        <TemplatePreviewModal
          v-if="showPreviewModal"
          :templateName="previewData.templateName"
          :documentType="previewData.documentType"
          :content="previewData.content"
          :vars="previewData.vars"
          @close="showPreviewModal = false"
        />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import TemplateFormDrawer from '../components/TemplateFormDrawer.vue';
import TemplatePreviewModal from '../components/TemplatePreviewModal.vue';

import { GetDocumentTemplatesWithPaginationService } from '../services/getDocumentTemplatesWithPagination.service';
import { CreateOrUpdateDocumentTemplateService } from '../services/createOrUpdateDocumentTemplate.service';
import { DeleteDocumentTemplateService } from '../services/deleteDocumentTemplate.service';
import { GetDocumentTemplatesVarsService } from '../services/getDocumentTemplatesVars.service';
import type { DocumentTemplateDto, DocumentTemplateVarDto, CreateOrUpdateDocumentTemplateDto } from '../dtos/documentTemplates.dto';

const getDocumentTemplatesWithPaginationService = new GetDocumentTemplatesWithPaginationService();
const createOrUpdateDocumentTemplateService = new CreateOrUpdateDocumentTemplateService();
const deleteDocumentTemplateService = new DeleteDocumentTemplateService();
const getDocumentTemplatesVarsService = new GetDocumentTemplatesVarsService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'DocumentTemplates',
  components: {
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppBadge,
    AppDrawer,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppModal,
    AppConfirmDeleteModal,
    TemplateFormDrawer,
    TemplatePreviewModal,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    useMeta({ title: 'Plantillas de Documentos' });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Gestión de Solicitudes', url: '' };
    headerStore.moduleItem = { name: 'Plantillas de Documentos', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const service = getDocumentTemplatesWithPaginationService;
    const params = computed(() => ({}));
    // Form drawer
    const showFormDrawer = ref(false);
    const editingTemplate = ref<DocumentTemplateDto | null>(null);
    const formInitial = ref<DocumentTemplateDto | null>(null);
    const formRef = ref<{ submitForm: () => void } | null>(null);

    // Delete modal
    const showDeleteModal = ref(false);
    const templateToDelete = ref<number | null>(null);

    // Preview modal
    const showPreviewModal = ref(false);
    const previewData = ref<{
      templateName: string;
      documentType: string;
      content: string;
      vars: DocumentTemplateVarDto[];
    }>({
      templateName: '',
      documentType: '',
      content: '',
      vars: [],
    });

    const openFormDrawer = (tpl: DocumentTemplateDto | null) => {
      editingTemplate.value = tpl;
      formInitial.value = tpl ? { ...tpl } : null;
      showFormDrawer.value = true;
    };

    const submitForm = () => {
      formRef.value?.submitForm();
    };

    const handleFormSubmit = async (data: CreateOrUpdateDocumentTemplateDto) => {
      try {
        const isCreate = !editingTemplate.value;
        const id = editingTemplate.value?.id;
        const result = await createOrUpdateDocumentTemplateService.run(data, id);
        showFormDrawer.value = false;
        if (isCreate && result?.id) {
          await router.push({
            name: 'requestManagement.documentTemplateEditor',
            params: { id: result.id },
          });
        } else {
          updateDatatableService.run();
        }
      } catch (e) {
        console.error(e);
      }
    };

    const goToEditor = (tpl: DocumentTemplateDto) => {
      router.push({
        name: 'requestManagement.documentTemplateEditor',
        params: { id: tpl.id },
      });
    };

    const confirmDelete = (tpl: DocumentTemplateDto) => {
      templateToDelete.value = tpl.id;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      if (!templateToDelete.value) return;
      try {
        await deleteDocumentTemplateService.run(templateToDelete.value);
        updateDatatableService.run();
      } catch (e) {
        console.error(e);
      } finally {
        showDeleteModal.value = false;
        templateToDelete.value = null;
      }
    };

    const toggleStatus = async (tpl: DocumentTemplateDto) => {
      try {
        await createOrUpdateDocumentTemplateService.run(
          {
            code: tpl.code,
            name: tpl.name,
            documentTemplatesTypeId: tpl.documentTemplatesTypeId,
            contentsHtml: tpl.contentsHtml,
            status: tpl.status === 1 ? 0 : 1,
          },
          tpl.id
        );
        updateDatatableService.run();
      } catch (e) {
        console.error(e);
      }
    };

    const openPreview = async (tpl: DocumentTemplateDto) => {
      try {
        const vars = await getDocumentTemplatesVarsService.run({
          documentTemplateId: tpl.id,
        });
        previewData.value = {
          templateName: tpl.name,
          documentType: tpl.documentTemplatesType?.name ?? '',
          content: tpl.contentsHtml,
          vars,
        };
        showPreviewModal.value = true;
      } catch (e) {
        console.error(e);
      }
    };

    const handleDownloadPdf = () => {
      // Future: PDF download implementation
    };

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return {
      t,
      service,
      params,
      showFormDrawer,
      editingTemplate,
      formInitial,
      formRef,
      showDeleteModal,
      showPreviewModal,
      previewData,
      openFormDrawer,
      goToEditor,
      submitForm,
      handleFormSubmit,
      confirmDelete,
      handleDelete,
      toggleStatus,
      openPreview,
      handleDownloadPdf,
      formatDate,
    };
  },
});
</script>
