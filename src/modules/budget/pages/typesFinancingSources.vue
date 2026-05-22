<template>
  <AppBaseList>
    <template #actions>
      <AppButtonBack @click="goBack" />
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div>
          <h2 class="tw-text-lg tw-font-light">{{ title }} {{ financingSystem?.[0]?.name }}</h2>
          <AppCheckPermission permission="">
            <AppButtonNewContainer v-if="allowEdit" @click="openTypeFinancingParentModal(financingSystemId)"></AppButtonNewContainer>
          </AppCheckPermission>
          <AppEmptyResponse v-if="!nodes.length" :show-image="true"></AppEmptyResponse>
          <TreeTable v-else :value="nodes" :expandedKeys="expandedKeys" class="mt-2">
            <Column field="name" header="Nombre">
              <template #body="slotProps">
                <div
                  :style="{
                    marginLeft: `${slotProps.node?.data?.level * 20}px`,
                    display: 'flex',
                    alignItems: 'center',
                  }"
                >
                  <AppButton
                    :disabled="slotProps.node.data.level >= maxLevel"
                    :icon="isExpanded(slotProps.node.key) ? 'chevron-down' : 'chevron-right'"
                    @click="handleClickExpander(slotProps.node)"
                    style="position: relative; margin-right: 2px"
                  ></AppButton>
                  <span>{{ slotProps.node.data.name }}</span>
                </div>
              </template>
            </Column>
            <Column field="code" header="Código"></Column>
            <Column field="externalCode" header="Código Externo"></Column>
            <Column field="level" header="Nivel"></Column>
            <Column field="reference" header="Referencia"></Column>
            <Column v-if="allowEdit" header="Acciones">
              <template #body="slotProps">
                <!-- Botón de carga para cargar subniveles -->
                <AppButtonEdit v-if="slotProps.node.entity == 'Parent'" @click="openTypeFinancingParentModal(financingSystemId, slotProps.node)"></AppButtonEdit>
                <AppButtonEdit v-else @click="openTypeFinancingChildModal(slotProps.node, null)"></AppButtonEdit>
                <AppButtonDelete @click="openConfirmDelete(slotProps.node)"></AppButtonDelete>
                <AppButton
                  :disabled="slotProps.node.data.level >= maxLevel"
                  v-tooltip="nameConstanyType(slotProps.node)"
                  icon="plus"
                  @click="openTypeFinancingChildModal(null, slotProps.node)"
                ></AppButton>
              </template>
            </Column>
          </TreeTable>
        </div>
        <AppModal v-model="typesFinancingParentModal">
          <TypesFinancingParentForm
            v-if="typesFinancingParentModal"
            :financingSystemId="currentFinancingSystemId"
            :data="currentDataFinancingSystem"
            @close="closeTypesFinancingModal"
          ></TypesFinancingParentForm>
        </AppModal>

        <AppModal v-model="typesFinancingChildModal">
          <TypesFinancingChildForm
            v-if="typesFinancingChildModal"
            :data="currentDataChildFinancingSystem"
            :dataParent="currentDataParentFinancingSystem"
            :constantTypes="constantTypes"
            @close="closeTypesFinancingChildModal"
          ></TypesFinancingChildForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" :entity="currentDataDelete?.data?.name || ''" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import TypesFinancingParentForm from '../components/TypesFinancingParentForm.vue';
import TypesFinancingChildForm from '../components/TypesFinancingChildForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
//import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetConstantTypesFinancingBySystemIdService } from '../services/getConstantTypesFinancingBySystemId.service';
import { GetAllParentsTypesFinancingService } from '../services/getAllParentsTypesFinancing.service';
import { GetTypesFinancingByParentIdService } from '../services/getTypesFinancingByParentId.service';
import { DeleteTypesFinancingParentService } from '../services/deleteTypesFinancingParent.service';
import { DeleteTypesFinancingChildService } from '../services/deleteTypesFinancingChild.service';

const getConstantTypesFinancingBySystemIdService = new GetConstantTypesFinancingBySystemIdService();
const getAllParentsTypesFinancingService = new GetAllParentsTypesFinancingService();
const getTypesFinancingByParentIdService = new GetTypesFinancingByParentIdService();
const deleteTypesFinancingParentService = new DeleteTypesFinancingParentService();
const deleteTypesFinancingChildService = new DeleteTypesFinancingChildService();
export default defineComponent({
  name: 'typesFinancingSourcesPage',
  components: {
    TreeTable,
    Column,
    AppBaseList,
    AppButtonEdit,
    AppButtonDelete,
    AppButton,
    AppCheckPermission,
    AppButtonNewContainer,
    AppButtonBack,
    TypesFinancingParentForm,
    TypesFinancingChildForm,
    AppModal,
    AppConfirmDeleteModal,
    AppLoading,
    AppEmptyResponse,
    // AppIcon,
  },
  setup() {
    /* const getData = async () => {
      const response = getConstantTypesFinancingService.run();
      const parents = getAllParentsTypesFinancingService.run();
      const byId = getTypesFinancingByParentIdService.run(1);
      console.log(response,parents,byId)
    }
    getData();*/
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const title = window.history.state?.title || t('Tipos de cuentas');
    const nodes = ref([]);
    const parents = ref<any>([]);
    const constantTypes = ref<any>([]);
    const fixedText = t('core.new');
    const dynamicText = ref('');
    const currentFinancingSystemId = ref();
    const currentDataFinancingSystem = ref();
    const currentDataChildFinancingSystem = ref();
    const currentDataParentFinancingSystem = ref();
    const currentDataDelete = ref();
    const maxLevel = ref();
    const loading = ref(true);
    //    const currentEntity = ref();
    const financingSystemId = parseInt(route.params.financingSystemId as string);
    const financingSystem = ref<any>([]);
    const rawFilterIds = route.query?.filterIds;
    const filterFinancingIds = typeof rawFilterIds === 'string' ? rawFilterIds.split(',').map(Number) : null;
    //true por defecto
    console.log('typeFinancingIds', rawFilterIds);
    const allowEdit = route.query.allowEdit === 'false' ? false : true;
    const labelParentName = computed(() => `${fixedText} ${dynamicText.value}`);
    const expandedKeys = ref<any>({}); // Nodo inicial expandido
    const typesFinancingParentModal = ref(false);
    const typesFinancingChildModal = ref(false);
    const modalDelete = ref(false);
    /*  const childKeyMap = {
        1: "groups",
        2: "accounts",
        3: "subAccounts",
        4: "disintegrationSubAccounts",
      };*/
    const handleClickExpander = async (node: any) => {
      //Cargar hijos del parent
      if (node.children?.length === 0 && node.entity === 'Parent') {
        await loadChildLevels(node);
        toggleRow(node.key);
      }
      //expandir
      toggleRow(node.key);
    };
    // Alterna la fila expandida/colapsada
    const toggleRow = async (key: any) => {
      if (expandedKeys.value[key]) {
        delete expandedKeys.value[key];
      } else {
        expandedKeys.value[key] = true;
      }
    };

    // Comprueba si una fila está expandida para el treetable
    const isExpanded = (key: any) => !!expandedKeys.value[key];

    //Funcion para cargar las constantes
    const loadConstantType = async () => {
      try {
        financingSystem.value = await getConstantTypesFinancingBySystemIdService.run(financingSystemId);
        constantTypes.value = financingSystem.value?.[0]?.levelsStandardizedAccountingSystem;
        //nivel maximo
        maxLevel.value = constantTypes.value.length ? Math.max(...constantTypes.value.map((item: any) => item.level)) : null;
        //console.log(financingSystem?.[0].levelsStandardizedAccountingSystem);
        console.log(constantTypes.value);
        dynamicText.value = constantTypes.value?.[0].label;
      } catch (e) {
        console.log(e);
      }
    };
    // Función para cargar los nodos principales (nivel 1)
    const loadParentLevels = async () => {
      try {
        parents.value = await getAllParentsTypesFinancingService.run(financingSystemId);
        if (filterFinancingIds) {
          parents.value = parents.value.filter((parent: any) => filterFinancingIds.includes(parent.id));
        }
        console.log('parents', parents);
        nodes.value = parents.value.map((parent: any) => ({
          key: parent.id,
          data: parent,
          entity: 'Parent',
          children: [], // Los hijos se cargarán dinámicamente
        }));
      } catch (e) {
        console.log(e);
      }
    };

    // Función para cargar los hijos de un nodo cuando se expande
    const loadChildLevels = async (rootNode: any) => {
      console.log(rootNode);
      try {
        // Realiza la consulta para obtener todos los niveles jerárquicos
        const res = await getTypesFinancingByParentIdService.run(rootNode.key);

        // Mapea la estructura jerárquica en el formato esperado
        rootNode.children = mapHierarchy(res.childreOne);

        // Marca el nodo raíz como expandido
        expandedKeys.value[rootNode.key] = true;
      } catch (error) {
        console.error('Error al cargar el árbol:', error);
        rootNode.children = [];
      }
    };

    // Función recursiva para procesar la jerarquía
    const mapHierarchy = (nodes: any) => {
      return nodes.map((node: any) => ({
        key: node.id,
        data: node,
        entity: 'Child',
        children: processChildren(node),
      }));
    };

    // Procesa los hijos según la estructura de niveles
    const processChildren = (node: any) => {
      console.log('test');
      // Encuentra la clave del siguiente nivel dinámicamente, busca "childre" y que sea un array
      const nextLevelKey = Object.keys(node).find((key) => key.startsWith('childre') && Array.isArray(node[key]));
      console.log(nextLevelKey);
      // Si se encuentra el siguiente nivel, procesa los hijos
      if (nextLevelKey) {
        return mapHierarchy(node[nextLevelKey]);
      }

      // Si no hay más niveles, devuelve un array vacío
      return [];
    };
    const levelToNameMap = computed(() => {
      const map = new Map();
      constantTypes.value?.forEach((item: any) => {
        map.set(item.level, item.label);
      });
      return map;
    });
    const nameConstanyType = (node: any) => {
      console.log('nameConstanyType', node, levelToNameMap.value.get(node.data?.level + 1));
      const nameLevel = levelToNameMap.value.get(node.data?.level + 1);
      if (nameLevel) {
        return `${fixedText} ${nameLevel}`;
      }
      return `${fixedText} hijo`;
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Presupuestos', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadConstantType();
      await loadParentLevels();
      loading.value = false;
    });
    const reloadChlidsByIdParent = async (id: number) => {
      const typeParentReload = nodes.value?.find((item: any) => item.key === id) || null;
      console.log(typeParentReload);
      loadChildLevels(typeParentReload);
      //await getTypesFinancingByParentIdService.run(id);
    };

    const openTypeFinancingParentModal = async (systemId: any, data?: any) => {
      if (data) {
        await handleClickExpander(data);
      }
      currentFinancingSystemId.value = systemId;
      currentDataFinancingSystem.value = data;
      typesFinancingParentModal.value = true;
    };

    const closeTypesFinancingModal = () => {
      typesFinancingParentModal.value = false;
      //actualizar
      loadParentLevels();
    };

    const openTypeFinancingChildModal = async (data?: any, parentData?: any) => {
      currentDataChildFinancingSystem.value = data;
      currentDataParentFinancingSystem.value = parentData;
      typesFinancingChildModal.value = true;
    };

    const closeTypesFinancingChildModal = () => {
      typesFinancingChildModal.value = false;
      //actualizar
      if (currentDataChildFinancingSystem.value) {
        reloadChlidsByIdParent(currentDataChildFinancingSystem.value.data.typeFinancingSourceId); //actualizar al editar
      } else if (currentDataParentFinancingSystem.value.data.typeFinancingSourceId) {
        reloadChlidsByIdParent(currentDataParentFinancingSystem.value.data.typeFinancingSourceId); //actualizar al crear de un hijo
      } else {
        console.log('currentDataParentFinancingSystem', currentDataParentFinancingSystem.value);
        reloadChlidsByIdParent(currentDataParentFinancingSystem.value.data.id); // actualizar al crear de un padre (el id es el typeFinancingSourceId)
      }
    };
    const openConfirmDelete = async (data: any) => {
      currentDataDelete.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentDataDelete.value.entity === 'Parent') {
          await deleteTypesFinancingParentService.run(currentDataDelete.value.key);
          loadParentLevels();
        } else if (currentDataDelete.value.entity === 'Child') {
          await deleteTypesFinancingChildService.run(currentDataDelete.value.key);
          //currentDataDelete.value.typeFinancingSourceId === parents
          reloadChlidsByIdParent(currentDataDelete.value.data.typeFinancingSourceId);
        }
        modalDelete.value = false;
      } catch (e) {
        console.log('error', e);
      }
    };
    const goBack = () => {
      router.go(-1);
    };
    return {
      nodes,
      expandedKeys,
      loadChildLevels,
      toggleRow,
      isExpanded,
      handleClickExpander,

      title,
      loading,
      financingSystem,
      financingSystemId,

      constantTypes,
      labelParentName,
      nameConstanyType,
      maxLevel,

      openTypeFinancingParentModal,
      closeTypesFinancingModal,
      openTypeFinancingChildModal,
      closeTypesFinancingChildModal,
      typesFinancingParentModal,
      typesFinancingChildModal,
      currentFinancingSystemId,
      currentDataFinancingSystem,
      currentDataChildFinancingSystem,
      currentDataParentFinancingSystem,
      modalDelete,
      currentDataDelete,
      //currentEntity,
      openConfirmDelete,
      confirmDelete,
      allowEdit,
      goBack,
    };
  },
});
</script>

<style scoped>
/*:deep(.p-treetable-table-container){
  background-color: #fff;
  /* box-shadow: 2px 2px 14px 0px rgba(112, 144, 176, .12); 
  border-radius: 14px;
  margin-bottom: 15px;
  padding: 8px 24px;
  border: 1px solid #e4e7ec;
}
*/
/* Estilo base del TreeTable */
/* Estilo base del TreeTable */
:deep(.p-treetable) {
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
  background-color: white;
  padding: 8px 24px;
}
/* Hover en filas */
:deep(.p-treetable .p-treetable-tbody tr:hover) {
  background-color: #fafafa;
}
</style>
