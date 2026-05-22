<template>
  <AppBaseList title="Tipos de Becas">
    <template #actions>
      <AppCheckPermission permission="studentWeldare.typeScholarship.create">
        <AppButton outlined variant="light" nativeType="button" @click="onCreate">
          <AppIcon icon="plus" class="ts-btn-icon" />
          Nuevo Tipo de Beca
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <!-- Page header -->
        <div class="ts-page-header">
          <h1 class="ts-page-header__title">Tipos de Becas</h1>
          <p class="ts-page-header__subtitle">Gestiona los diferentes tipos de becas disponibles en la institución</p>
        </div>

        <!-- Cards grid -->
        <div v-if="types.length" class="ts-grid">
          <AppCard v-for="item in types" :key="item.id" class="ts-card">
            <template #title>
              <div class="ts-card__header">
                <div class="ts-card__abbr-wrap">
                  <span class="ts-card__abbr">{{ item.abbreviation }}</span>
                </div>
                <div class="ts-card__title-block">
                  <span class="ts-card__name">{{ item.name }}</span>
                </div>
                <span class="ts-badge" :class="item.isActive ? 'ts-badge--active' : 'ts-badge--inactive'">
                  {{ item.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </template>

            <template #body>
              <p class="ts-card__desc">
                {{ item.description || 'Sin descripción.' }}
              </p>

              <div class="ts-card__meta">
                <div class="ts-meta-item">
                  <AppIcon icon="chart-line" class="ts-meta-item__icon" />
                  <span>Promedio mín. {{ item.minimumSemesterAverage }}</span>
                </div>
                <div class="ts-meta-item">
                  <AppIcon icon="book" class="ts-meta-item__icon" />
                  <span>Créditos mín. {{ item.minimumSemesterCredits }}</span>
                </div>
                <div class="ts-meta-item">
                  <AppIcon icon="sync" class="ts-meta-item__icon" />
                  <span>Máx. {{ item.maximumRenewals }} renovaciones</span>
                </div>
              </div>

              <div class="ts-card__flags">
                <span v-if="item.automaticRenewal" class="ts-flag ts-flag--blue"> <AppIcon icon="check" /> Renovación automática </span>
                <span v-if="item.compatibleOtherScholarship" class="ts-flag ts-flag--purple"> <AppIcon icon="link" /> Compatible con otras </span>
              </div>
            </template>

            <template #footer>
              <div class="ts-card__actions">
                <AppButtonGroup>
                  <AppCheckPermission permission="studentWeldare.typeScholarship.edit">
                    <AppButtonEdit nativeType="button" @click.stop="onEdit(item)" />
                  </AppCheckPermission>
                  <AppCheckPermission permission="studentWeldare.typeScholarship.delete">
                    <AppButtonDelete nativeType="button" @click.stop="onDelete(item)" />
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>

        <AppEmptyResponse v-else />
      </template>
    </template>
  </AppBaseList>

  <!-- Create / Edit drawer -->
  <ScholarshipTypeDrawer v-if="showDrawer" :isVisible="showDrawer" :mode="drawerMode" :formData="formTarget" @update:isVisible="showDrawer = $event" @save="onDrawerSave" />

  <!-- Delete confirm modal -->
  <AppModal v-model="showDeleteModal">
    <AppConfirmDeleteModal v-if="showDeleteModal && deleteTarget" entity="este tipo de beca" @confirmDelete="onConfirmDelete" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import { useToast } from 'vue-toast-notification';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import ScholarshipTypeDrawer from '../components/ScholarshipTypeDrawer.vue';
import { ToastService } from '../../../shared/services/toast.service';

import type { ScholarshipTypeDto, RequiredDocumentDto, LocalRequirementItemDto, DefaultRequirementDto } from '../dtos/scholarshipType.dto';
import { GetTypeScholarshipsService } from '../services/getTypeScholarships.service';
import { CreateOrUpdateTypeScholarshipService } from '../services/createOrUpdateTypeScholarship.service';
import { DeleteTypeScholarshipService } from '../services/deleteTypeScholarship.service';
import { CreateRequiredDocumentService } from '../services/createRequiredDocument.service';
import { DeleteRequiredDocumentService } from '../services/deleteRequiredDocument.service';
import { CreateScholarshipRequirementService } from '../services/createScholarshipRequirement.service';
import { CreateDefaultRequirementService } from '../services/createDefaultRequirement.service';
import { DeleteDefaultRequirementService } from '../services/deleteDefaultRequirement.service';

const getTypesService = new GetTypeScholarshipsService();
const createOrUpdateService = new CreateOrUpdateTypeScholarshipService();
const deleteService = new DeleteTypeScholarshipService();
const createRequiredDocumentService = new CreateRequiredDocumentService();
const deleteRequiredDocumentService = new DeleteRequiredDocumentService();
const createScholarshipRequirementService = new CreateScholarshipRequirementService();
const createDefaultRequirementService = new CreateDefaultRequirementService();
const deleteDefaultRequirementService = new DeleteDefaultRequirementService();

export default defineComponent({
  name: 'TypesOfScholarships',
  components: {
    AppBaseList,
    AppLoading,
    AppEmptyResponse,
    AppIcon,
    AppCard,
    AppModal,
    AppButton,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonDelete,
    AppConfirmDeleteModal,
    AppCheckPermission,
    ScholarshipTypeDrawer,
  },

  setup() {
    useMeta({ title: 'Tipos de Becas' });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = { name: 'Tipos de Becas', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const toast = new ToastService();
    const $vToast = useToast();
    const isLoading = ref(true);
    const types = ref<ScholarshipTypeDto[]>([]);

    const loadTypes = async () => {
      try {
        isLoading.value = true;
        const response = await getTypesService.run({ noPag: 'true' });
        types.value = response?.data ?? response ?? [];
      } catch {
        toast.show('Error al cargar los tipos de beca', 'danger');
        types.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      loadTypes();
    });

    /* ── Drawer (create/edit) ── */
    const showDrawer = ref(false);
    const drawerMode = ref<'create' | 'edit'>('create');
    const formTarget = ref<ScholarshipTypeDto | null>(null);

    const onCreate = () => {
      formTarget.value = null;
      drawerMode.value = 'create';
      showDrawer.value = true;
    };

    const onEdit = (item: ScholarshipTypeDto) => {
      formTarget.value = { ...item };
      drawerMode.value = 'edit';
      showDrawer.value = true;
    };

    const onDrawerSave = async (
      payload: ScholarshipTypeDto & {
        selectedDocumentIds: number[];
        existingRequiredDocs: RequiredDocumentDto[];
        localRequirements: LocalRequirementItemDto[];
        existingDefaultRequirements: DefaultRequirementDto[];
      }
    ) => {
      try {
        const { selectedDocumentIds, existingRequiredDocs, localRequirements, existingDefaultRequirements, id, ...typeData } = payload;

        // 1. Save the scholarship type
        const saved = await createOrUpdateService.run(typeData as ScholarshipTypeDto, id);
        const typeId = id || saved?.data?.id || saved?.id;

        if (!typeId) {
          toast.show('Error al obtener el ID del tipo de beca', 'danger');
          return;
        }

        // 2. Handle required documents
        const resolveDocId = (d: any): number => Number(d.scholarshipDocumentId ?? d.scholarshipDocument?.id ?? 0);

        const existingDocIds = existingRequiredDocs.map(resolveDocId).filter((id) => id > 0);

        const validSelected = selectedDocumentIds.map(Number).filter((id) => !isNaN(id) && id > 0);

        const toAdd = validSelected.filter((docId) => !existingDocIds.includes(docId));
        const toRemove = existingRequiredDocs.filter((d) => !validSelected.includes(resolveDocId(d)));

        await Promise.all(toRemove.map((d) => deleteRequiredDocumentService.run(d.id)));
        await Promise.all(
          toAdd.map((scholarshipDocumentId) =>
            createRequiredDocumentService.run({
              typeScholarshipId: Number(typeId),
              scholarshipDocumentId,
            })
          )
        );

        // 3. Sync default requirements
        const keepDefReqIds = localRequirements.filter((r) => r.defReqId != null).map((r) => r.defReqId as number);

        const toDeleteReqs = existingDefaultRequirements.filter((dr) => !keepDefReqIds.includes(dr.id));
        const toAddReqs = localRequirements.filter((r) => r.defReqId == null);

        await Promise.all(toDeleteReqs.map((dr) => deleteDefaultRequirementService.run(dr.id)));

        await Promise.all(
          toAddReqs.map(async (req) => {
            const created = await createScholarshipRequirementService.run({
              requirementType: req.requirementType,
              operator: req.operator,
              value: Number(req.value),
              isRequired: req.isRequired,
            });
            const reqId = created?.data?.id ?? created?.id;
            if (reqId) {
              await createDefaultRequirementService.run({
                typeScholarshipId: Number(typeId),
                scholarshipRequirementId: Number(reqId),
              });
            }
          })
        );

        // 4. Reload & close — clear any intermediate toasts then show single summary
        await loadTypes();
        $vToast.clear();
        toast.show(id ? 'Tipo de beca actualizado correctamente' : 'Tipo de beca creado correctamente', 'success');
        showDrawer.value = false;
      } catch {
        $vToast.clear();
        toast.show('Error al guardar el tipo de beca', 'danger');
      }
    };

    /* ── Delete modal ── */
    const showDeleteModal = ref(false);
    const deleteTarget = ref<ScholarshipTypeDto | null>(null);

    const onDelete = (item: ScholarshipTypeDto) => {
      deleteTarget.value = item;
      showDeleteModal.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deleteTarget.value?.id) return;
      try {
        await deleteService.run(deleteTarget.value.id);
        await loadTypes();
        toast.show('Tipo de beca eliminado correctamente', 'success');
        showDeleteModal.value = false;
        deleteTarget.value = null;
      } catch {
        toast.show('Error al eliminar el tipo de beca', 'danger');
      }
    };

    return {
      isLoading,
      types,
      showDrawer,
      drawerMode,
      formTarget,
      onCreate,
      onEdit,
      onDrawerSave,
      showDeleteModal,
      deleteTarget,
      onDelete,
      onConfirmDelete,
    };
  },
});
</script>

<style scoped>
/* Page header */
.ts-page-header {
  margin-bottom: 20px;
}
.ts-page-header__title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}
.ts-page-header__subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Grid */
.ts-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
}

/* Card header */
.ts-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ts-card__abbr-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ts-card__abbr {
  font-size: 11px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.ts-card__title-block {
  flex: 1;
  min-width: 0;
}
.ts-card__name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badge */
.ts-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}
.ts-badge--active {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.ts-badge--inactive {
  background: #f8fafc;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
}

/* Card body */
.ts-card__desc {
  font-size: 13px;
  color: #475569;
  margin: 0 0 10px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ts-card__meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.ts-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #64748b;
}
.ts-meta-item__icon {
  font-size: 11px;
  color: #94a3b8;
}

/* Flags */
.ts-card__flags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.ts-flag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}
.ts-flag--blue {
  background: #eff6ff;
  color: #2563eb;
}
.ts-flag--purple {
  background: #faf5ff;
  color: #9333ea;
}

/* Card footer */
.ts-card__actions {
  display: flex;
  justify-content: flex-end;
}

/* Header button icon */
.ts-btn-icon {
  margin-right: 5px;
  font-size: 12px;
}
</style>
