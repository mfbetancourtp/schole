<template>
  <AppBaseList>
    <template v-slot:content>
      <AppLoading v-if="loading" />

      <div v-else>
        <!-- Header con botón crear -->
        <div class="header-section">
          <div class="header-info">
            <h2 class="title">{{ t('Niveles Educativos') }}</h2>
            <p class="subtitle">
              {{ t('Gestiona la estructura jerárquica de niveles educativos') }}
            </p>
          </div>

          <AppCheckPermission permission="institutionalConfiguration.educationalLevels.create">
            <AppButton @click="openCreateModal">
              <AppIcon icon="plus" />
              {{ t('Crear Nivel') }}
            </AppButton>
          </AppCheckPermission>
        </div>

        <!-- Mensaje si no hay datos -->
        <div v-if="!educationTypes || educationTypes.length === 0" class="empty-state">
          <AppIcon icon="folder2-open" />
          <p>{{ t('No hay niveles educativos registrados') }}</p>
          <AppCheckPermission permission="institutionalConfiguration.educationalLevels.create">
            <AppButton @click="openCreateModal">
              <AppIcon icon="plus" />
              {{ t('Crear el primer nivel') }}
            </AppButton>
          </AppCheckPermission>
        </div>

        <!-- Árbol de niveles educativos -->
        <div v-else class="tree-container">
          <EducationalLevelTreeRow
            :key="treeKey"
            v-model:expandedKeys="expandedKeys"
            :education-types="educationTypes"
            @add-child="openCreateChildModal"
            @edit="openEditModal"
            @remove="confirmDelete"
            @load-children="handleLoadChildren"
          />
        </div>
      </div>

      <!-- Modal de formulario (crear/editar) -->
      <AppModal v-model="showFormModal">
        <EducationalLevelForm
          v-if="showFormModal"
          :data="currentEducationType"
          :parent-id="parentIdForNewChild"
          :education-types="allEducationTypesFlat"
          :educationCategoryData="educationCategory"
          :is-editing="isEditing"
          @close="closeFormModal"
          @save="handleFormSave"
        />
      </AppModal>

      <!-- Modal de confirmación de eliminación -->
      <AppModal v-model="showDeleteModal">
        <AppConfirmDeleteModal v-if="showDeleteModal" :entity="'Nivel Educativo'" @confirmDelete="handleDelete" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import EducationalLevelTreeRow from '../components/EducationalLevelTreeRow.vue';
import EducationalLevelForm from '../components/EducationalLevelForm.vue';

import { GetEducationTypesService } from '../services/getEducationTypes.service';
import { DeleteEducationTypesService } from '../services/deleteEducationTypes.service';
import { CreateOrUpdateEducationTypesService } from '../services/createOrUpdateEducationTypes.service';

import { EducationTypeDto } from '../dtos/educationTypes.dto';
import { GetEducationCategoriesService } from '../services/getEducationCategories.service';

const getEducationTypesService = new GetEducationTypesService();
const deleteEducationTypesService = new DeleteEducationTypesService();
const createOrUpdateEducationTypeService = new CreateOrUpdateEducationTypesService();

const getEducationCategoriesService = new GetEducationCategoriesService();

interface EducationTypeOption {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
}

export default defineComponent({
  name: 'EducationalLevels',

  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppConfirmDeleteModal,
    AppCheckPermission,
    EducationalLevelTreeRow,
    EducationalLevelForm,
    AppIcon,
  },

  setup() {
    const { t } = useI18n();

    const title = 'Niveles Educativos';

    useMeta({ title: title });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Configuración institucional', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const loading = ref(true);
    const educationTypes = ref<EducationTypeDto[]>([]);
    const educationCategory = ref<any[]>([]);
    const expandedKeys = ref<Record<string, boolean>>({});
    const showFormModal = ref(false);
    const showDeleteModal = ref(false);
    const currentEducationType = ref<EducationTypeDto | null>(null);
    const parentIdForNewChild = ref<number | null>(null);
    const educationTypeToDelete = ref<number | null>(null);
    const treeKey = ref(0);

    const refreshTree = () => {
      treeKey.value++;
    };

    const isEditing = computed(() => currentEducationType.value !== null);

    const toNullableNumber = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null;

      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? null : parsedValue;
    };

    const isRootEducationType = (educationType: EducationTypeDto) => {
      return educationType.parentId === null || educationType.parentId === undefined || Number(educationType.parentId) === 0;
    };

    const getResponseData = (response: any) => response?.data ?? response;

    const normalizeEducationType = (educationType: any): EducationTypeDto => {
      return {
        ...educationType,
        parentId: toNullableNumber(educationType?.parentId),
        educationCategoryId: toNullableNumber(educationType?.educationCategoryId),
        children: Array.isArray(educationType?.children) ? educationType.children.map(normalizeEducationType) : educationType?.children,
      };
    };

    function extractArrayResponse<T>(response: any): T[] {
      const payload = getResponseData(response);

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    }

    const extractEducationTypes = (response: any): EducationTypeDto[] => {
      const payload = getResponseData(response);

      if (Array.isArray(payload)) return payload.map(normalizeEducationType);
      if (Array.isArray(payload?.data)) return payload.data.map(normalizeEducationType);
      if (Array.isArray(payload?.children)) return payload.children.map(normalizeEducationType);
      if (payload?.id) return [normalizeEducationType(payload)];

      return [];
    };

    const extractRootEducationTypes = (response: any): EducationTypeDto[] => {
      const items = extractEducationTypes(response);
      const rootItems = items.filter(isRootEducationType);

      return rootItems.length > 0 ? rootItems : items;
    };

    const extractChildrenFromResponse = (response: any, parentId: number): EducationTypeDto[] => {
      const payload = getResponseData(response);

      if (Array.isArray(payload)) {
        const parentNode = payload.find((item) => Number(item?.id) === parentId && Array.isArray(item.children));
        if (parentNode) return parentNode.children.map(normalizeEducationType);

        const normalizedItems = payload.map(normalizeEducationType);
        const childrenByParent = normalizedItems.filter((item) => item.parentId === parentId);

        return childrenByParent.length > 0 ? childrenByParent : normalizedItems.filter((item) => item.id !== parentId);
      }

      if (Number(payload?.id) === parentId && Array.isArray(payload.children)) {
        return payload.children.map(normalizeEducationType);
      }

      if (Array.isArray(payload?.children)) {
        return payload.children.map(normalizeEducationType);
      }

      return extractEducationTypes(payload).filter((item) => item.parentId === parentId);
    };

    const mergeEducationTypeList = (incomingItems: EducationTypeDto[], currentItems: EducationTypeDto[] = []): EducationTypeDto[] => {
      const currentMap = new Map(currentItems.map((item) => [item.id, item]));

      return incomingItems.map((incomingItem) => {
        const currentItem = currentMap.get(incomingItem.id);
        const incomingHasChildren = Array.isArray(incomingItem.children);
        const currentHasChildren = Array.isArray(currentItem?.children);

        if (incomingHasChildren) {
          return {
            ...incomingItem,
            children: mergeEducationTypeList(incomingItem.children || [], currentItem?.children || []),
          };
        }

        if (currentHasChildren) {
          return {
            ...incomingItem,
            children: currentItem?.children,
          };
        }

        return incomingItem;
      });
    };

    const rootEducationTypes = computed(() => {
      const roots = educationTypes.value.filter(isRootEducationType);
      return roots.length > 0 ? roots : educationTypes.value;
    });

    const allEducationTypesFlat = computed(() => {
      const flatten = (items: EducationTypeDto[], level = 0): EducationTypeOption[] => {
        let result: EducationTypeOption[] = [];
        items.forEach((item) => {
          result.push({
            id: item.id,
            name: `${level > 0 ? `${'—'.repeat(level)} ` : ''}${item.name}`,
            level,
            parentId: item.parentId,
          });
          if (item.children && item.children.length > 0) {
            result = result.concat(flatten(item.children, level + 1));
          }
        });
        return result;
      };
      return flatten(rootEducationTypes.value);
    });

    const getData = async () => {
      try {
        const [educationTypesResponse, educationCategoriesResponse] = await Promise.all([
          getEducationTypesService.run({
            noPag: true,
            parentId: 0,
          }),
          getEducationCategoriesService.run({
            noPag: true,
          }),
        ]);

        const incomingData = extractRootEducationTypes(educationTypesResponse);

        educationTypes.value = educationTypes.value.length > 0 ? mergeEducationTypeList(incomingData, educationTypes.value) : incomingData;
        educationCategory.value = extractArrayResponse<any>(educationCategoriesResponse);

        refreshTree();
      } catch (error) {
        console.error('Error al obtener niveles educativos:', error);
        educationTypes.value = [];
      }
    };

    const openCreateModal = () => {
      currentEducationType.value = null;
      parentIdForNewChild.value = null;
      showFormModal.value = true;
    };

    const openCreateChildModal = (parentId: number) => {
      currentEducationType.value = null;
      parentIdForNewChild.value = parentId;
      showFormModal.value = true;
    };

    const openEditModal = (educationType: EducationTypeDto) => {
      currentEducationType.value = educationType;
      parentIdForNewChild.value = null;
      showFormModal.value = true;
    };

    const findNodeById = (items: EducationTypeDto[], id: number): EducationTypeDto | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children && item.children.length > 0) {
          const found = findNodeById(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const handleCreate = async (form: any) => {
      try {
        const payload = { ...form };
        await createOrUpdateEducationTypeService.run(payload);

        if (payload.parentId) {
          const parent = findNodeById(educationTypes.value, payload.parentId);
          if (parent) {
            await handleLoadChildren(parent, true);
          } else {
            await getData();
          }
        } else {
          await getData();
        }

        closeFormModal();
      } catch (error) {
        console.error('Error al crear nivel educativo:', error);
      }
    };

    const handleEdit = async (form: any) => {
      if (!currentEducationType.value) return;
      try {
        const payload = { ...form };
        const previousParentId = currentEducationType.value.parentId;
        const updatedData = await createOrUpdateEducationTypeService.run(payload, currentEducationType.value.id);

        if ((payload.parentId || null) !== (previousParentId || null)) {
          await getData();
          closeFormModal();
          return;
        }

        const node = findNodeById(educationTypes.value, currentEducationType.value.id);
        if (node) {
          Object.assign(node, {
            name: payload.name,
            code: payload.code,
            description: payload.description || '',
            educationCategoryId: payload.educationCategoryId,
            parentId: payload.parentId || null,
          });

          const returnedNode = extractEducationTypes(updatedData)[0];
          if (returnedNode) {
            const childrenBefore = node.children;
            Object.assign(node, returnedNode);
            if (!Array.isArray(returnedNode.children)) {
              node.children = childrenBefore;
            }
          }
        } else {
          await getData();
        }

        refreshTree(); // Ensure tree repaints after edit
        closeFormModal();
      } catch (error) {
        console.error('Error al editar nivel educativo:', error);
      }
    };

    const removeNodeLocally = (items: EducationTypeDto[], id: number): EducationTypeDto[] => {
      const filtered = items.filter((i) => i.id !== id);

      if (filtered.length !== items.length) {
        return filtered;
      }

      let hasChanges = false;
      const newItems = items.map((item) => {
        if (item.children && item.children.length > 0) {
          const updatedChildren = removeNodeLocally(item.children, id);
          if (updatedChildren !== item.children) {
            hasChanges = true;
            return { ...item, children: updatedChildren };
          }
        }
        return item;
      });

      return hasChanges ? newItems : items;
    };

    const handleDelete = async () => {
      if (educationTypeToDelete.value === null) return;

      try {
        await deleteEducationTypesService.run(educationTypeToDelete.value);
        educationTypes.value = removeNodeLocally(educationTypes.value, educationTypeToDelete.value);
        refreshTree();

        closeDeleteModal();
      } catch (error) {
        console.error('Error al eliminar nivel educativo:', error);
      }
    };

    const closeFormModal = () => {
      showFormModal.value = false;
      currentEducationType.value = null;
      parentIdForNewChild.value = null;
    };

    const confirmDelete = (id: number) => {
      educationTypeToDelete.value = id;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      educationTypeToDelete.value = null;
    };

    const findAndAttachChildren = (items: EducationTypeDto[], parentId: number, incomingChildren: EducationTypeDto[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === parentId) {
          item.children = mergeEducationTypeList(incomingChildren, item.children || []);
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (findAndAttachChildren(item.children, parentId, incomingChildren)) return true;
        }
      }
      return false;
    };

    const handleFormSave = (form: any) => {
      if (isEditing.value) {
        handleEdit(form);
      } else {
        handleCreate(form);
      }
    };

    const handleLoadChildren = async (parent: EducationTypeDto, autoExpand = false) => {
      try {
        const childrenResponse = await getEducationTypesService.run({
          noPag: true,
          parentId: parent.id,
        });

        const incomingChildren = extractChildrenFromResponse(childrenResponse, parent.id);
        findAndAttachChildren(educationTypes.value, parent.id, incomingChildren);
        educationTypes.value = [...educationTypes.value];

        refreshTree();

        if (autoExpand) {
          expandedKeys.value = {
            ...expandedKeys.value,
            [`node-${parent.id}`]: true,
          };
        }
      } catch (error) {
        console.error('Error al cargar hijos:', error);
      }
    };

    onMounted(async () => {
      await getData();
      loading.value = false;
    });

    return {
      t,
      loading,
      educationTypes,
      expandedKeys,
      rootEducationTypes,
      allEducationTypesFlat,
      showFormModal,
      showDeleteModal,
      currentEducationType,
      parentIdForNewChild,
      isEditing,
      treeKey,
      educationCategory,
      openCreateModal,
      openCreateChildModal,
      openEditModal,
      closeFormModal,
      confirmDelete,
      handleDelete,
      closeDeleteModal,
      handleLoadChildren,
      handleCreate,
      handleEdit,
      handleFormSave,
    };
  },
});
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.header-info {
  flex: 1;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
}

.create-btn i {
  font-size: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #f9fafb;
  border-radius: 16px;
  border: 2px dashed #d1d5db;
}

.empty-state i {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.create-btn-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
}

.tree-container {
  margin-top: 20px;
}
</style>
