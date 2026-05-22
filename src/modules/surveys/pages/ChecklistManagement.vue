<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="surveys.checklist.create">
        <AppButton style="color: white" @click="openCreateModal"> <AppIcon icon="plus" class="me-1" /> Nuevo Checklist </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-header__title">Gestión de Checklists</h1>
        <p class="page-header__subtitle">Crea y configura los checklists de evaluación de tu institución</p>
      </div>

      <div class="page-body">
        <AppLoading v-if="loading" />
        <AppEmptyResponse v-else-if="!checklists.length" :show-image="true" />

        <div v-else class="grid-cards grid-cards--spaced">
          <AppCard class="card-hover" v-for="checklist in checklists" :key="checklist.id">
            <template #title>
              <div class="card-title-row">
                <div class="card-title-row__text">
                  <div class="card-title-clamp">{{ checklist.titulo }}</div>
                </div>
                <AppBadge :variant="checklist.activo ? 'success' : 'secondary'" :label="checklist.activo ? 'Activo' : 'Inactivo'" />
              </div>
            </template>

            <template #body>
              <div class="card-meta">
                <div v-if="checklist.categoriaChecklistNombre" class="card-meta__item">
                  <AppIcon icon="tag" class="card-meta__icon" />
                  <span>{{ checklist.categoriaChecklistNombre }}</span>
                </div>
                <div class="card-meta__item">
                  <AppIcon icon="calculator" class="card-meta__icon" />
                  <span>Cálculo: {{ checklist.tipoCalculoPeso }}</span>
                </div>
              </div>
            </template>

            <template #footer>
              <div class="card-footer-actions">
                <AppButtonGroup>
                  <AppButton variant="primary" outlined icon="cog" v-tooltip="'Configurar'" @click="goToDetail(checklist)" />
                  <AppButton variant="secondary" outlined icon="eye" v-tooltip="'Vista previa'" @click="openPreviewModal(checklist)" />
                  <AppCheckPermission permission="surveys.checklist.edit">
                    <AppButtonEdit @click="openEditModal(checklist)" />
                  </AppCheckPermission>
                  <AppCheckPermission permission="surveys.checklist.delete">
                    <AppButtonDelete @click="confirmDelete(checklist)" />
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>
      </div>

      <!-- Modal: Crear / Editar checklist -->
      <AppModal v-model="showFormModal" size="lg">
        <ChecklistFormModal v-if="showFormModal" :data="selectedChecklist" @save="handleSave" @close="showFormModal = false" />
      </AppModal>

      <!-- Modal: Confirmar eliminar -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" entity="checklist" @confirmDelete="handleDelete" />
      </AppModal>

      <!-- Modal: Vista previa del checklist (vista del encuestado) -->
      <AppModal v-model="showPreviewModal" size="xl">
        <ChecklistPreviewModal v-if="showPreviewModal && selectedChecklist" :checklist-id="selectedChecklist.id" :checklist-title="selectedChecklist.titulo" @close="showPreviewModal = false" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import ChecklistFormModal from '../components/checklist/ChecklistFormModal.vue';
import ChecklistPreviewModal from '../components/checklist/ChecklistPreviewModal.vue';

import { ChecklistDto } from '../dtos/checklist.dto';
import { ToastService } from '../../../shared/services/toast.service';
import { GetChecklistsService } from '../services/checklist/getChecklists.service';
import { DeleteChecklistService } from '../services/checklist/deleteChecklist.service';

const toastService = new ToastService();
const getChecklistsService = new GetChecklistsService();
const deleteChecklistService = new DeleteChecklistService();

export default defineComponent({
  name: 'ChecklistManagement',

  components: {
    AppBaseList,
    AppBadge,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppCard,
    AppModal,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppIcon,
    AppLoading,
    AppEmptyResponse,
    ChecklistFormModal,
    ChecklistPreviewModal,
  },

  setup() {
    const title = 'Gestión de Checklists';
    useMeta({ title });
    const router = useRouter();

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Encuestas y formularios', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const checklists = ref<ChecklistDto[]>([]);
    const loading = ref(false);
    const showFormModal = ref(false);
    const showDeleteModal = ref(false);
    const showPreviewModal = ref(false);
    const selectedChecklist = ref<ChecklistDto | null>(null);
    const checklistToDelete = ref<number | null>(null);

    const fetchChecklists = async (): Promise<void> => {
      loading.value = true;
      try {
        // Ordenamos por id descendente para mostrar primero el último checklist
        // creado. El servicio envía los query params al backend y además hace
        // fallback de ordenamiento en cliente.
        checklists.value = await getChecklistsService.run({
          sort: 'id',
          order: 'DESC',
        });
      } catch (error) {
        console.error('Error cargando checklists:', error);
        toastService.show('Error al cargar los checklists. Intente nuevamente.', 'error');
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchChecklists);

    const openCreateModal = () => {
      selectedChecklist.value = null;
      showFormModal.value = true;
    };

    const openEditModal = (checklist: ChecklistDto) => {
      selectedChecklist.value = checklist;
      showFormModal.value = true;
    };

    const openPreviewModal = (checklist: ChecklistDto) => {
      selectedChecklist.value = checklist;
      showPreviewModal.value = true;
    };

    const goToDetail = (checklist: ChecklistDto) => {
      router.push({
        name: 'surveys.checklistDetail',
        params: { checklistId: checklist.id },
      });
    };

    const handleSave = async () => {
      showFormModal.value = false;
      await fetchChecklists();
      // Toast de éxito lo muestra el interceptor global de axios.
    };

    const confirmDelete = (checklist: ChecklistDto) => {
      checklistToDelete.value = checklist.id;
      showDeleteModal.value = true;
    };

    const handleDelete = async (): Promise<void> => {
      try {
        if (checklistToDelete.value) {
          await deleteChecklistService.run(checklistToDelete.value);
        }
        showDeleteModal.value = false;
        checklistToDelete.value = null;
        await fetchChecklists();
        // Toast de éxito lo muestra el interceptor global de axios.
      } catch (error) {
        console.error('Error eliminando checklist:', error);
      }
    };

    return {
      title,
      checklists,
      loading,
      showFormModal,
      showDeleteModal,
      showPreviewModal,
      selectedChecklist,
      openCreateModal,
      openEditModal,
      openPreviewModal,
      goToDetail,
      handleSave,
      confirmDelete,
      handleDelete,
    };
  },
});
</script>

<style scoped>
.page-header {
  padding: 0.75rem 0 0.25rem;
}
.page-header__title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}
.page-header__subtitle {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
  margin-bottom: 0;
}
.page-body {
  padding-bottom: 1rem;
}
.grid-cards--spaced {
  margin-top: 1rem;
}
.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.card-title-row__text {
  flex: 1 1 0%;
  min-width: 0;
}
.card-title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #4b5563;
}
.card-meta__item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.card-meta__icon {
  color: #9ca3af;
}
.card-footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  padding: 10px;
}

@media (max-width: 575px) {
  .grid-cards {
    padding: 4px;
    gap: 0.75rem;
  }
}

/*
  Fix visual del hover: el contenedor externo de AppCard (.appcard-container)
  no tenía border-radius, así que su box-shadow se dibujaba con esquinas cuadradas
  mientras el contenido interno (.content) sí es redondeado — eso producía la
  "puntita" al pasar el mouse. Le damos radio al contenedor para que el shadow
  siga la forma de la card.
*/
.grid-cards :deep(.appcard-container) {
  border-radius: 20px;
}
</style>
