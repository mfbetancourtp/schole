<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="sectionHead">
      <div class="contentIconTitle">
        <div class="sectionHead__icon">
          <AppIcon icon="file-alt" class="iconBig" />
        </div>
        <div>
          <h2 class="hTitle">Producción Intelectual</h2>
          <p class="hSub">Registro completo de publicaciones y trabajos académicos</p>
        </div>
      </div>

      <AppButton type="button" class="btnPrimary btnAdd" @click="openCreate">
        <AppIcon icon="plus" class="iconSm" />
        Agregar Producción
      </AppButton>
    </div>
    <AppPulseLoading v-if="loading" />

    <!-- Empty -->
    <div v-if="!productions.length" class="emptyWrap">
      <AppCardDashboard>
        <template #title>No hay producción intelectual registrada</template>
        <template #body>
          <p class="muted">Agrega tu primera publicación, ponencia, libro o software.</p>
        </template>
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnPrimary" @click="openCreate">
              <AppIcon icon="plus" />
              Agregar Producción
            </AppButton>
          </div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Table -->
    <div v-else class="tableWrap">
      <AppDatatable name="intellectual-production" :data="filteredProductions" :defaultPerPage="10" :paginated="true" :enableSearchFilter="true" filterKeyLocal="title" :refreshBtn="false">
        <!-- Columns (usando AppDatatableColumn) -->
        <AppDatatableColumn field="typeProductionName" label="Tipo" sortable v-slot="{ row }">
          <AppBadge :label="row.typeProductionName || '—'" />
        </AppDatatableColumn>

        <AppDatatableColumn field="title" label="Título" sortable v-slot="{ row }">
          <div class="titleCell">
            <div class="titleMain" :title="row.title">
              {{ row.title }}
            </div>
            <div v-if="row.description" class="titleDesc" :title="row.description">
              {{ row.description }}
            </div>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn field="year" label="Año" sortable v-slot="{ row }">
          {{ row.year }}
        </AppDatatableColumn>

        <AppDatatableColumn field="publicationMedium" label="Medio" sortable v-slot="{ row }">
          {{ row.publicationMedium }}
        </AppDatatableColumn>

        <AppDatatableColumn field="publisher" label="Editorial" sortable v-slot="{ row }">
          {{ row.publisher }}
        </AppDatatableColumn>

        <AppDatatableColumn field="link" label="Enlace" v-slot="{ row }">
          <a v-if="row.link" class="link" :href="row.link" target="_blank" rel="noopener noreferrer"> Abrir </a>
          <span v-else class="muted">—</span>
        </AppDatatableColumn>

        <AppDatatableColumn field="hasAttachment" label="Adjunto" v-slot="{ row }">
          <span v-if="row.hasAttachment" class="attachYes">Sí</span>
          <span v-else class="muted">No</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Acciones" v-slot="{ row }">
          <div class="btn-group">
            <AppButton v-if="row.hasAttachment" type="button" @click="handleViewAttachment(row)" icon="eye"> </AppButton>
            <AppButtonEdit type="button" @click="openEdit(row.id)" />
            <AppButtonDelete type="button" @click="openModalDelete(row)" />
          </div>
        </AppDatatableColumn>
      </AppDatatable>
    </div>

    <!-- Drawer -->
    <AppDrawer :isVisible="isDrawerOpen" size="lg" @update:isVisible="isDrawerOpen = $event">
      <template #head>
        <div class="drawerHead">
          <div>
            <h2 class="drawerHead__title">
              {{ editingId ? 'Editar Producción Intelectual' : 'Agregar Producción Intelectual' }}
            </h2>
            <p class="drawerHead__subtitle">Registra publicaciones, libros, ponencias, patentes o software</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="drawerBody">
          <form @submit.prevent="handleSubmit">
            <div class="gridForm">
              <!-- Tipo (ID) -->
              <AppFormField :label="'Tipo de Producción'" :form-control="v$.form.typeProductionId">
                <AppAutocomplete input-id="typeProductionId" :options="productionTypes" label="name" :reduce="(o:any) => o.id" v-model="v$.form.typeProductionId.$model" :clearable="true" />
              </AppFormField>

              <AppFormField :label="'Año'" :form-control="v$.form.year">
                <input type="number" min="1950" :max="new Date().getFullYear()" class="form-control" v-model.number="v$.form.year.$model" placeholder="Ej: 2024" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Título'" :form-control="v$.form.title">
                  <input type="text" class="form-control" v-model="v$.form.title.$model" placeholder="Título completo de la producción" />
                </AppFormField>
              </div>

              <AppFormField :label="'Medio de Publicación'" :form-control="v$.form.publicationMedium">
                <input type="text" class="form-control" v-model="v$.form.publicationMedium.$model" placeholder="Revista, conferencia, registro, etc." />
              </AppFormField>

              <AppFormField :label="'Editorial'" :form-control="v$.form.publisher">
                <input type="text" class="form-control" v-model="v$.form.publisher.$model" placeholder="Editorial, organizador, institución" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Enlace (URL)'" :form-control="v$.form.link">
                  <input type="url" class="form-control" v-model="v$.form.link.$model" placeholder="https://doi.org/... o https://..." />
                </AppFormField>
                <p class="hint">Enlace al DOI, repositorio o página web</p>
              </div>

              <div class="colSpan2">
                <AppFormField :label="'Descripción'" :form-control="v$.form.description">
                  <textarea rows="5" class="form-control" v-model="v$.form.description.$model" placeholder="Descripción breve: resumen, autores, impacto, etc." />
                </AppFormField>
                <p class="charCount">{{ form.description.length }} caracteres</p>
              </div>

              <div class="colSpan2">
                <AppAttachmentDropzone
                  v-model="selectedFile"
                  v-model:certificateUrl="form.certificateUrl"
                  isTitle="Subir Documento"
                  isHelper="PDF, DOC, DOCX (máx. 10MB)"
                  isAccept=".pdf,.doc,.docx"
                  :isMaxSizeMB="10"
                  :isShowDelete="false"
                />
              </div>
            </div>
          </form>
        </div>
      </template>

      <template #footer>
        <div class="drawerFooter">
          <AppButton type="button" class="btnSecondary" @click="closeDrawer"> Cancelar </AppButton>

          <AppButton type="button" class="btnPrimary" @click="handleSubmit">
            <AppIcon icon="save" class="iconSm" />
            {{ 'Guardar' }}
          </AppButton>
        </div>
      </template>
    </AppDrawer>

    <!-- Modal delete -->
    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="producción intelectual" @confirmDelete="deleteProduction" />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../../shared/plugins/vuelidate.plugin';
import { useResumeStore } from '../../stores/resume.store';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppAttachmentDropzone from '../../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppDatatable from '../../../../shared/components/Datatable/AppDatatable.vue';
import AppCardDashboard from '../../../../shared/components/Card/AppCardDashboard.vue';
import AppDatatableColumn from '../../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonEdit from '../../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../../shared/components/Buttons/AppButtonDelete.vue';

import AppBadge from '../../../../shared/components/AppBadge.vue';
import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';

import { GetIntellectualProductionsWithPaginationService } from '../../services/getIntellectualProductionsWithPagination.service';
import { DeleteIntellectualProductionsService } from '../../services/deleteIntellectualProductions.service';
import { CreateOrUpdateIntellectualProductionsService } from '../../services/createOrUpdateIntellectualProductions.service';
import { CreateOrUpdateIntellectualProductionsCertificateService } from '../../services/createOrUpdateIntellectualProductionsCertificate.service';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';
import { GetProductionTypesService } from '../../services/getProductionTypes.service';
type TypeProduction = { id: number; name: string };

interface IntellectualProductionApiItem {
  id: number;
  year: number;
  title: string;
  publicationMedium: string;
  publisher: string;
  link?: string | null;
  description?: string | null;
  certificateUrl?: string | null;

  people?: { id: number; names: string };
  typeProduction?: { id: number; name: string } | null; // en tu GET viene null a veces
}

interface ProductionRow {
  id: number;
  typeProductionId: number | null;
  typeProductionName: string;
  year: number;
  title: string;
  publicationMedium: string;
  publisher: string;
  link: string;
  description: string;
  hasAttachment: boolean;
  certificateUrl?: any;
}

const getIntellectualProductionsWithPaginationService = new GetIntellectualProductionsWithPaginationService();
const getProductionTypesService = new GetProductionTypesService(); // lo usamos para traer TypeProduction (según tu request)
const createOrUpdateIntellectualProductionsService = new CreateOrUpdateIntellectualProductionsService();
const deleteIntellectualProductionsService = new DeleteIntellectualProductionsService();
const createOrUpdateIntellectualProductionsCertificateService = new CreateOrUpdateIntellectualProductionsCertificateService();
export default defineComponent({
  name: 'IntellectualProductionStep',
  components: {
    AppButtonEdit,
    AppButtonDelete,
    AppIcon,
    AppButton,
    AppDrawer,
    AppFormField,
    AppAttachmentDropzone,
    AppDatatable,
    AppCardDashboard,
    AppModal,
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppAutocomplete,
    AppPulseLoading,
    AppBadge,
  },
  setup() {
    const productions = ref<ProductionRow[]>([]);
    const productionTypes = ref<TypeProduction[]>([]);
    const filteredTypeId = ref<number>(0);
    const isDrawerOpen = ref(false);
    const editingId = ref<number | null>(null);
    const selectedFile = ref<File | null>(null);
    const loading = ref(true); // ✅ global
    const resumeStore = useResumeStore();
    const modalDelete = ref(false);
    const currentProduction = ref<ProductionRow | null>(null);

    const userPeopleId = ref<number | null>(null);

    const form = reactive({
      typeProductionId: null as number | null,
      year: null as number | null,
      title: '',
      publicationMedium: '',
      publisher: '',
      link: '',
      description: '',
      certificateUrl: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          typeProductionId: {},
          year: { required },
          title: { required },
          publicationMedium: { required },
          publisher: { required },
          link: {},
          certificateUrl: {},
          description: {},
        },
      },
      { form }
    );

    const years = computed(() => {
      const current = new Date().getFullYear();
      return Array.from({ length: 50 }, (_, i) => current - i);
    });

    const filteredProductions = computed(() => {
      if (filteredTypeId.value === 0) return productions.value;
      return productions.value.filter((p) => p.typeProductionId === filteredTypeId.value);
    });

    const extractItemsFromResponse = (response: any): IntellectualProductionApiItem[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      return [];
    };

    const mapApiToRow = (x: IntellectualProductionApiItem): ProductionRow => {
      const typeId = x.typeProduction?.id ?? null;
      const typeName = x.typeProduction?.name ?? '—';
      const cert = x.certificateUrl ?? null;
      console.log('xxxx', x);

      return {
        id: x.id,
        typeProductionId: typeId,
        typeProductionName: typeName,
        year: x.year,
        title: x.title,
        publicationMedium: x.publicationMedium,
        publisher: x.publisher,
        link: x.link ?? '',
        description: x.description ?? '',
        hasAttachment: !!cert,
        certificateUrl: cert,
      };
    };

    const loadTypes = async () => {
      try {
        const response = await getProductionTypesService.run({
          noPag: true,
        });

        productionTypes.value = response;
      } catch (e) {
        console.log('Error cargando tipos de producción:', e);
        productionTypes.value = [];
      }
    };

    const loadProductions = async () => {
      const response = await getIntellectualProductionsWithPaginationService.run({
        noPag: true,
      });

      const items = extractItemsFromResponse(response);
      productions.value = items.map(mapApiToRow);

      // ✅ Guardar en Pinia para pintarlo en el CV
      resumeStore.setPublications(productions.value);
    };

    onMounted(async () => {
      loading.value = true;

      await loadTypes();
      await loadProductions();

      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        userPeopleId.value = user?.people?.id ?? null;
      }
      loading.value = false;
    });

    const resetForm = () => {
      form.typeProductionId = null;
      form.year = null;
      form.title = '';
      form.publicationMedium = '';
      form.publisher = '';
      form.link = '';
      form.certificateUrl = '';
      form.description = '';
      selectedFile.value = null;
      v$.value.$reset();
    };

    const openCreate = () => {
      editingId.value = null;
      resetForm();
      isDrawerOpen.value = true;
    };

    const openEdit = (id: number) => {
      const item = productions.value.find((p) => p.id === id);
      if (!item) return;
      selectedFile.value = null;
      editingId.value = id;
      resetForm();

      form.typeProductionId = item.typeProductionId;
      form.year = item.year;
      form.title = item.title;
      form.publicationMedium = item.publicationMedium;
      form.publisher = item.publisher;
      form.link = item.link || '';
      form.description = item.description || '';
      form.certificateUrl = item.certificateUrl;

      isDrawerOpen.value = true;
    };

    const closeDrawer = () => {
      isDrawerOpen.value = false;
      editingId.value = null;
      resetForm();
    };

    const openModalDelete = (row: ProductionRow) => {
      modalDelete.value = true;
      currentProduction.value = row;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      currentProduction.value = null;
      await loadProductions();
    };

    const deleteProduction = async () => {
      try {
        await deleteIntellectualProductionsService.run(Number(currentProduction.value?.id));
        await closeModalDelete();
      } catch (e) {
        console.log('Error eliminando producción intelectual:', e);
      }
    };

    const handleViewAttachment = (row: ProductionRow) => {
      if (row.certificateUrl) {
        window.open(row.certificateUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    };
    const handleSubmit = async () => {
      const baseValid = await v$.value.$validate();
      if (!baseValid) return;

      if (!userPeopleId.value) {
        return;
      }

      loading.value = true;

      try {
        const id = editingId.value ? Number(editingId.value) : undefined;

        const payload = {
          peopleId: userPeopleId.value,
          typeProductionId: (form.typeProductionId as number) ?? 1,
          year: form.year as number,
          title: form.title,
          publicationMedium: form.publicationMedium,
          publisher: form.publisher,
          link: form.link?.trim() || undefined,
          description: form.description?.trim() || undefined,
          certificateUrl: form.certificateUrl,
        };

        const response = await createOrUpdateIntellectualProductionsService.run(payload, id);

        const productionId = id ?? response?.id ?? response?.data?.id;

        /**
         * SUBIR DOCUMENTO
         */

        if (selectedFile.value) {
          const certificatePayload = {
            peopleId: userPeopleId.value,
            id: productionId,
            archivo: selectedFile.value,
          };

          await createOrUpdateIntellectualProductionsCertificateService.run(certificatePayload);
        }

        await loadProductions();
        closeDrawer();
      } catch (e) {
        console.log('Error guardando producción intelectual:', e);
        loading.value = false;
      } finally {
        loading.value = false;
      }
    };
    return {
      // data
      productions,
      filteredTypeId,
      filteredProductions,

      // lists
      productionTypes,
      years,

      // drawer + form
      isDrawerOpen,
      editingId,
      selectedFile,
      form,
      v$,

      // actions
      openCreate,
      openEdit,
      closeDrawer,

      // delete
      modalDelete,
      openModalDelete,
      closeModalDelete,
      deleteProduction,

      // attachment
      handleViewAttachment,

      // submit
      handleSubmit,
      loading,
    };
  },
});
</script>

<style scoped>
/* Mantengo tu CSS tal cual (no lo cambié) */
/* Header */
.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 18px;
}
@media (max-width: 768px) {
  .sectionHead {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
.headerLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}
.iconBox {
  padding: 12px;
  background: #eff6ff;
  border-radius: 12px;
}
.iconBig {
  font-size: 28px;
  color: #1e3a8a;
}
.iconSm {
  font-size: 16px;
}
.hTitle {
  margin: 0;
  font-weight: 700;
  color: #111827;
  font-size: 18px;
}
.hSub {
  margin: 4px 0 0;
  color: #4b5563;
  font-size: 13px;
}
.btnAdd {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* Empty */
.emptyWrap {
  max-width: 720px;
  margin-top: 10px;
}
.footerActions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 0;
}
.muted {
  color: #667085;
  margin: 0;
}

/* Datatable top row */
.tableWrap {
  margin-top: 10px;
}
.filtersRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 0 0 8px;
}
.filterLeft {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.filterIcon {
  font-size: 16px;
  color: #667085;
}
.select {
  min-width: 220px;
}
.filterRight {
  color: #667085;
  font-size: 13px;
}

/* Table cells */
.titleCell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.titleMain {
  font-weight: 900;
  color: #101828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 520px;
}
.titleDesc {
  color: #667085;
  font-size: 12px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.link {
  color: #1e3a8a;
  font-weight: 800;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.attachYes {
  font-weight: 900;
  color: #027a48;
}

/* Actions */
.actionBtns {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.btnGhost {
  padding: 10px 14px;
  background: transparent;
  border: 1px dashed #d0d5dd;
}

/* Drawer */
.drawerHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.drawerHead__title {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}
.drawerHead__subtitle {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}
.drawerClose {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
}
.drawerClose:hover {
  background: rgba(255, 255, 255, 0.25);
}
.drawerBody {
  padding: 16px;
}
.gridForm {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 900px) {
  .gridForm {
    grid-template-columns: 1fr 1fr;
  }
}
.colSpan2 {
  grid-column: 1 / -1;
}
.hint {
  margin: -8px 0 0;
  color: #6b7280;
  font-size: 12px;
}
.charCount {
  margin: -8px 0 0;
  font-size: 12px;
  color: #6b7280;
}
.drawerFooter {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btnSecondary {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
.btnDanger {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
}
.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sectionHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #1b2e83);
}
.btn-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
