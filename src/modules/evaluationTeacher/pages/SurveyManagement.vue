<template>
  <AppBaseList title="Plantillas de Evaluación">
    <template #actions>
      <AppCheckPermission permission="surveyManagement.create">
        <AppButton style="color: white" @click="handleCreateNew">
          <AppIcon icon="plus" />
          Nueva Plantilla
        </AppButton>
      </AppCheckPermission>
    </template>
    <template #content>
      <!-- Header estilo React -->
      <header class="tmHeader">
        <div class="tmHeader__left">
          <h1 class="tmHeader__title">Plantillas de Evaluación</h1>
          <p class="tmHeader__subtitle">Gestiona formularios reutilizables para diferentes tipos de evaluaciones</p>
        </div>
      </header>

      <div class="tmBody">
        <!-- Stats Summary (4 cards como React) -->
        <div class="tmStats">
          <AppCardDashboard v-for="(card, index) in statsCards" :key="index" class="tmStats__card" :style="{ backgroundColor: card.color }">
            <template #body>
              <div class="tmStats__content">
                <div class="tmStats__valueWrap">
                  <span class="tmStats__label">{{ card.title }}</span>
                  <div class="tmStats__value">{{ card.value }}</div>
                </div>

                <div class="tmStats__iconBox">
                  <AppGetIcon class="tmStats__icon" :name="card.icon" />
                </div>
              </div>
            </template>
          </AppCardDashboard>
        </div>

        <!-- Search and Filter (como React) -->
        <div class="tmFiltersCard">
          <div class="tmFiltersCard__row">
            <div class="tmSearch">
              <span class="tmSearch__icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M8.5 15c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm7.707 1.293a1 1 0 0 1-1.414 0l-3.387-3.387A7.5 7.5 0 1 1 8.5 2a7.5 7.5 0 0 1 6.5 11.5l3.387 3.387a1 1 0 0 1 0 1.414z"
                    fill="#2563eb"
                  />
                </svg>
              </span>
              <AppInput v-model="searchTerm" placeholder="Buscar plantillas..." class="tmSearch__input" />
            </div>

            <div class="tmFilter">
              <span class="tmFilter__icon">📋</span>
              <AppSelect v-model="statusFilter" class="tmFilter__select">
                <option v-for="opt in statusOptions" :key="opt.key" :value="opt.key">
                  {{ opt.label }}
                </option>
              </AppSelect>
            </div>
          </div>
        </div>

        <!-- Templates List -->
        <div class="tmList">
          <AppLoading v-if="isLoading" />

          <template v-else-if="filteredTemplates.length">
            <TemplateCard v-for="t in filteredTemplates" :key="t.id" :template="t" @edit="handleEdit" @duplicate="handleDuplicate" @delete="handleDelete" @changeStatus="handleChangeStatus" />
          </template>

          <AppEmptyResponse v-else title="No se encontraron plantillas" description="Intenta con otros términos de búsqueda" />
        </div>

        <!-- Pagination -->
        <div v-if="totalItems > 0" class="tmPagination">
          <AppPagination v-model:current="currentPage" :total="totalItems" :per-page="perPage" :loading="isLoading" />
        </div>
      </div>

      <!-- Modal/Drawer editor (tu componente real) -->
      <TemplateEditorModal v-model:isVisible="showEditor" :template="(selectedTemplate as any)" :isNew="isNewTemplate" @saved="handleSaved" />

      <!-- Modal de confirmación de eliminación -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" :entity="templateToDelete?.name || 'Plantilla'" @confirmDelete="confirmDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppPagination from '../../../shared/components/AppPagination.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';

import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import TemplateCard, { type Template } from '../components/TemplateCard.vue';

import TemplateEditorModal from '../components/TemplateEditorModal.vue';

// Services
import { GetEvaluationTemplatesService } from '../services/getEvaluationTemplates.service';
import { GetEvaluationTemplatesStatsService } from '../services/getEvaluationTemplatesStats.service';
import { CreateEvaluationTemplateService } from '../services/createEvaluationTemplate.service';
import { UpdateEvaluationTemplateService } from '../services/updateEvaluationTemplate.service';
import { GetEvaluationTemplateByIdService } from '../services/getEvaluationTemplateById.service';
import { DeleteEvaluationTemplateService } from '../services/deleteEvaluationTemplate.service';
import { UpdateEvaluationTemplateStatusService, type TemplateStatus } from '../services/updateEvaluationTemplateStatus.service';
import { DuplicateEvaluationTemplateService } from '../services/duplicateEvaluationTemplate.service';
import type { GetEvaluationTemplatesStatsDto, EvaluationTemplateResponseDto } from '../dtos/evaluationTemplate.dto';
import { useHeaderStore } from '../../../stores/header.store';
import { ToastService } from '../../../shared/services/toast.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';

// Service instances
const getEvaluationTemplatesService = new GetEvaluationTemplatesService();
const getEvaluationTemplatesStatsService = new GetEvaluationTemplatesStatsService();
const createEvaluationTemplateService = new CreateEvaluationTemplateService();
const updateEvaluationTemplateService = new UpdateEvaluationTemplateService();
const getEvaluationTemplateByIdService = new GetEvaluationTemplateByIdService();
const deleteEvaluationTemplateService = new DeleteEvaluationTemplateService();
const updateEvaluationTemplateStatusService = new UpdateEvaluationTemplateStatusService();
const duplicateEvaluationTemplateService = new DuplicateEvaluationTemplateService();
const toastService = new ToastService();
const institutionsService = new InstitutionsService();

type SortFilter = 'all' | 'mostUsed' | 'recent' | 'old';

export default defineComponent({
  name: 'TemplateManagement',
  components: {
    AppBaseList,
    AppButton,
    AppIcon,
    AppCheckPermission,
    AppEmptyResponse,
    AppPagination,
    AppCardDashboard,
    AppGetIcon,
    TemplateCard,
    TemplateEditorModal,
    AppInput,
    AppSelect,
    AppLoading,
    AppModal,
    AppConfirmDeleteModal,
  },
  setup() {
    const templates = ref<Template[]>([]);
    const searchTerm = ref('');
    const statusFilter = ref<string>('');
    const statusOptions = ref<Array<{ label: string; key: string }>>([
      { label: 'Todos los estados', key: '' },
      { label: 'Borrador', key: 'draft' },
      { label: 'Publicada', key: 'published' },
      { label: 'Inactiva', key: 'inactive' },
    ]);
    const isLoading = ref(false);

    // Pagination
    const currentPage = ref(1);
    const totalItems = ref(0);
    const perPage = ref(10);

    // Stats from backend
    const stats = ref<
      GetEvaluationTemplatesStatsDto & {
        publishedCount?: number;
        draftCount?: number;
        inactiveCount?: number;
      }
    >({
      totalTemplates: 0,
      mostUsedTemplate: null,
      avgDimensions: 0,
      totalQuestions: 0,
      publishedCount: 0,
      draftCount: 0,
      inactiveCount: 0,
    });

    const showEditor = ref(false);
    const selectedTemplate = ref<Template | null>(null);
    const isNewTemplate = ref(false);

    // Modal de eliminación
    const showDeleteModal = ref(false);
    const templateToDelete = ref<Template | null>(null);

    /**
     * Formatea una fecha ISO a formato legible
     */
    const formatDate = (isoDate: string): string => {
      if (!isoDate) return '—';
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    /**
     * Transforma la respuesta del backend al tipo Template
     */
    const mapToTemplate = (dto: EvaluationTemplateResponseDto): Template => {
      const dtoAny = dto as any;
      return {
        ...dto,
        lastModified: formatDate(dto.updatedAt),
        dimensionCount: dto.dimensionCount ?? dtoAny.totalDimensions ?? (dto.dimensions?.length || 0),
        questionCount: dto.questionCount ?? dtoAny.totalQuestions ?? 0,
        usageCount: dto.usageCount ?? dtoAny.totalUsed ?? 0,
      };
    };

    // Las plantillas ya vienen filtradas del backend, no necesitamos filtrado local
    const filteredTemplates = computed(() => templates.value);

    // ===== Stats from backend =====
    const statsCards = computed(() => [
      {
        title: 'Total Plantillas',
        value: stats.value.totalTemplates,
        color: '#cfe8ff',
        icon: 'clipboard-list',
      },
      {
        title: 'Publicadas',
        value: stats.value.publishedCount ?? 0,
        color: '#c9f6db',
        icon: 'clipboard-check',
      },
      {
        title: 'Borradores',
        value: stats.value.draftCount ?? 0,
        color: '#fff3bf',
        icon: 'file-signature',
      },
      {
        title: 'Inactivas',
        value: stats.value.inactiveCount ?? 0,
        color: '#d6e0ea',
        icon: 'times-circle',
      },
    ]);

    // ===== Actions (igual React) =====
    const handleEdit = async (t: Template) => {
      const status = (t.status || '').toLowerCase();
      if (status === 'publicado' || status === 'published') {
        toastService.show('No se pueden editar plantillas en estado "Publicado".', 'error');
        return;
      }
      isLoading.value = true;
      try {
        const fullTemplate = await getEvaluationTemplateByIdService.run(t.id);
        const mapped = mapToTemplate(fullTemplate);
        selectedTemplate.value = mapped;
        isNewTemplate.value = false;
        showEditor.value = true;
      } catch {
        toastService.show('Error al cargar la plantilla.', 'error');
      } finally {
        isLoading.value = false;
      }
    };

    const handleDuplicate = async (t: Template) => {
      try {
        await duplicateEvaluationTemplateService.run(t.id);
        toastService.show('Plantilla duplicada exitosamente.', 'success');
        await loadData();
      } catch {
        toastService.show('Error al duplicar la plantilla.', 'error');
      }
    };

    const handleDelete = (t: Template) => {
      const status = (t.status || '').toLowerCase();
      if (status === 'published' || status === 'publicado' || status === 'publicada') {
        toastService.show('No se pueden eliminar plantillas publicadas.', 'error');
        return;
      }
      templateToDelete.value = t;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      if (!templateToDelete.value) return;
      try {
        await deleteEvaluationTemplateService.run(templateToDelete.value.id);
        showDeleteModal.value = false;
        templateToDelete.value = null;
        toastService.show('Plantilla eliminada exitosamente', 'success');
        // Recargar datos después de eliminar
        await loadData();
      } catch (error) {
        console.error('Error eliminando plantilla:', error);
        toastService.show('Error al eliminar la plantilla', 'error');
      }
    };

    const handleChangeStatus = async (t: Template, newStatus: TemplateStatus) => {
      try {
        await updateEvaluationTemplateStatusService.run(t.id, newStatus);
        await loadData();
      } catch {
        toastService.show('Error al cambiar el estado de la plantilla.', 'error');
      }
    };

    const handleCreateNew = () => {
      selectedTemplate.value = null;
      isNewTemplate.value = true;
      showEditor.value = true;
    };

    /**
     * Carga las estadísticas desde el backend
     */
    const loadStats = async () => {
      try {
        const institutionId = String(institutionsService.getSelectedInstitution()?.id ?? '');
        const response = await getEvaluationTemplatesStatsService.run(institutionId);
        // El backend retorna { statusCode, data: { totalTemplates, draft, published, inactive, filters: { filterBy: [...] }, ... } }
        const data = response.data || {};
        stats.value = {
          ...stats.value,
          totalTemplates: data.totalTemplates ?? 0,
          draftCount: data.draft ?? 0,
          publishedCount: data.published ?? 0,
          inactiveCount: data.inactive ?? 0,
          ...data,
        };
        // Cargar las opciones de estado del backend
        if (data.filters && Array.isArray(data.filters.status)) {
          statusOptions.value = [
            { label: 'Todos los estados', key: '' },
            ...data.filters.status.map((s: any) => ({
              label: s.label,
              key: s.key,
            })),
          ];
        }
      } catch {
        // estadísticas no críticas, fallo silencioso
      }
    };

    /**
     * Carga las plantillas desde el backend
     */
    const loadTemplates = async () => {
      try {
        isLoading.value = true;
        const institutionId = String(institutionsService.getSelectedInstitution()?.id ?? '');
        const response = await getEvaluationTemplatesService.run(
          {
            page: currentPage.value,
            perPage: perPage.value,
            order: 'DESC',
            search: searchTerm.value.trim() || undefined,
            status: (statusFilter.value || undefined) as 'draft' | 'published' | 'archived' | 'inactive' | undefined,
          },
          institutionId
        );
        templates.value = response.data.map(mapToTemplate);
        // Actualizar datos de paginación desde la respuesta
        totalItems.value = response.pagination?.total ?? response.total ?? 0;
      } catch {
        templates.value = [];
        totalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * Carga inicial de datos
     */
    const loadData = async () => {
      await Promise.all([loadTemplates(), loadStats()]);
    };

    onMounted(loadData);

    // Configure header
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Evaluación Docente', url: '' };
    headerStorage.moduleItem = { name: 'Gestión de Encuestas', url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    // Recargar plantillas cuando cambian los filtros o búsqueda
    watch([searchTerm, statusFilter], () => {
      currentPage.value = 1; // Reset a primera página al filtrar
      loadTemplates();
    });

    // Recargar cuando cambia la página
    watch(currentPage, () => {
      loadTemplates();
    });

    const handleSaved = async (payload: Template) => {
      const institutionId = String(institutionsService.getSelectedInstitution()?.id ?? '');
      // Mapear payload al formato Swagger
      const mappedPayload: any = {
        name: payload.name,
        description: payload.description,
        dimensions: (payload.dimensions || []).map((dim: any) => {
          const dimension: any = {
            name: dim.name,
            description: dim.description,
            weight: typeof dim.weight === 'number' ? dim.weight : 0,
            questions: (dim.questions || []).map((q: any) => {
              const question: any = {
                typeQuestion: q.type === 'likert' ? 'scale' : q.type || 'open',
                description: q.description || q.text,
                weight: typeof q.weight === 'number' ? q.weight : 0,
                isRequired: q.isRequired !== undefined ? q.isRequired : true,
              };
              if ((q.type === 'likert' || q.typeQuestion === 'scale') && q.evaluationScaleId != null) {
                question.evaluationScaleId = Number(q.evaluationScaleId);
              }
              // Incluir id si la pregunta ya existe (numérico o string numérico)
              const qId = Number(q.id);
              if (!isNaN(qId) && qId > 0) {
                question.id = qId;
              }
              return question;
            }),
          };
          // Incluir id si la dimensión ya existe (numérico o string numérico)
          const dimId = Number(dim.id);
          if (!isNaN(dimId) && dimId > 0) {
            dimension.id = dimId;
          }
          return dimension;
        }),
      };

      try {
        if (isNewTemplate.value) {
          await createEvaluationTemplateService.run(mappedPayload, institutionId);
        } else {
          mappedPayload.id = payload.id;
          await updateEvaluationTemplateService.run(payload.id, mappedPayload);
        }
      } catch {
        toastService.show('Error al guardar la plantilla.', 'error');
      }
      // Recargar datos después de guardar o actualizar
      await loadData();
    };

    return {
      // data
      templates,
      searchTerm,
      statusFilter,
      statusOptions,
      filteredTemplates,
      isLoading,

      // editor state
      showEditor,
      selectedTemplate,
      isNewTemplate,

      // delete modal
      showDeleteModal,
      templateToDelete,
      confirmDelete,

      // stats
      statsCards,

      // pagination
      currentPage,
      totalItems,
      perPage,

      // actions
      handleEdit,
      handleDuplicate,
      handleDelete,
      handleChangeStatus,
      handleCreateNew,
      loadData,
      handleSaved,
    };
  },
});
</script>

<style scoped>
/* ===== Header tipo React ===== */
.tmHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 0 14px;
}

.tmHeader__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.tmHeader__subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.tmHeader__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* ===== Body ===== */
.tmBody {
  padding: 18px 0 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== Stats 4 cards ===== */
.tmStats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 768px) {
  .tmStats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }
}

.tmStats__card {
  /* Make cards visually match AppCardDashboard */
  background-color: inherit; /* keep inline backgroundColor from :style */
  box-shadow: 0px 16px 32px -6px rgba(15, 23, 42, 0.08), 0px 2px 6px rgba(15, 23, 42, 0.04);
  border-radius: 16px;
  padding: 12px 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tmStats__label {
  font-size: 13px;
  color: #0f172a; /* dark text */
  font-weight: 800;
  font-family: 'Roboto', Arial, sans-serif;
  display: block;
  line-height: 1.3;
}

.tmStats__content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.tmStats__valueWrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.tmStats__value {
  font-size: 22px;
  font-weight: 900;
  color: #071132; /* very dark */
  font-family: 'Roboto', Arial, sans-serif;
  line-height: 1.05;
  word-break: break-word;
}

.tmStats__iconBox {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.04);
}

/* ===== Search + Filter Card ===== */
.tmFiltersCard {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
}

.tmFiltersCard__row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.tmSearch {
  position: relative;
  flex: 1 1 320px;
  max-width: 520px;
  background: none;
  border: none;
  box-shadow: none;
}

.tmSearch__icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.65;
  pointer-events: none;
  z-index: 2;
}

.tmSearch :deep(.o-form__input_content) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.tmSearch :deep(.o-form-input) {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  background: #fff;
  box-shadow: none;
}

.tmSearch :deep(.o-form-input):focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.tmFilter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tmFilter__icon {
  opacity: 0.65;
}
.tmFilter__select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  min-width: 260px;
}
.tmFilter__select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* ===== List ===== */
.tmList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== Pagination ===== */
.tmPagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .tmStats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .tmHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tmHeader__btn {
    width: 100%;
    justify-content: center;
  }

  .tmStats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .tmStats__card {
    padding: 14px;
  }

  .tmStats__value {
    font-size: 22px;
  }

  .tmFiltersCard__row {
    flex-direction: column;
    gap: 10px;
  }

  .tmSearch,
  .tmFilter {
    width: 100%;
  }

  .tmSearch__input {
    width: 100%;
  }

  .tmFilter__select {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .tmHeader__title {
    font-size: 18px;
  }

  .tmHeader__subtitle {
    font-size: 12px;
  }

  .tmStats {
    grid-template-columns: 1fr;
  }

  .tmStats__card {
    padding: 12px;
  }

  .tmStats__value {
    font-size: 20px;
  }

  .tmStats__label {
    font-size: 11px;
  }

  .tmFiltersCard {
    padding: 12px;
  }
}
</style>
