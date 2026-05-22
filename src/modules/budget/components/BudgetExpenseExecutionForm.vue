<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <div>
            <TreeTable :value="nodes" :expandedKeys="expandedKeys" class="mt-2">
              <!-- Columna con checkboxes -->
              <Column>
                <template #body="slotProps">
                  <input type="checkbox" :checked="isNodeSelected(slotProps.node.key)" @change="toggleSelection(slotProps.node)" />
                </template>
              </Column>
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
                      :icon="isExpanded(slotProps.node.key) ? 'chevron-down' : 'chevron-right'"
                      @click="handleClickExpander(slotProps.node)"
                      style="position: relative; margin-right: 2px"
                    ></AppButton>
                    <span>{{ slotProps.node.data.name }}</span>
                  </div>
                </template>
              </Column>
              <Column field="code" header="Codigo"></Column>
              <Column field="level" header="Nivel"></Column>
            </TreeTable>
          </div>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
//import { useI18n } from 'vue-i18n';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
//import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
//import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { GetConstantTypesFinancingBySystemIdService } from '../services/getConstantTypesFinancingBySystemId.service';
import { GetAllParentsTypesFinancingService } from '../services/getAllParentsTypesFinancing.service';
import { GetTypesFinancingByParentIdService } from '../services/getTypesFinancingByParentId.service';
//import { GetListBudgetValidity } from '../services/getListBudgetValidity';
//import { GetAllPeriodsAdministrationService } from '../services/getAllPeriodsAdministration.service';
import { GetConstantReferencesExecutionService } from '../services/getConstantReferencesExecution.service';
import { CreateOrUpdateIncomeExecutionPlanningService } from '../services/createOrUpdateIncomeExecutionPlanning.service';

const getConstantTypesFinancingBySystemIdService = new GetConstantTypesFinancingBySystemIdService();
const getAllParentsTypesFinancingService = new GetAllParentsTypesFinancingService();
const getTypesFinancingByParentIdService = new GetTypesFinancingByParentIdService();
const getConstantReferencesExecutionService = new GetConstantReferencesExecutionService();
const createOrUpdateIncomeExecutionPlanningService = new CreateOrUpdateIncomeExecutionPlanningService();

export default defineComponent({
  name: 'BudgetExecutionForm',
  components: {
    //AppAutocomplete,
    //AppFormField,
    AppFormModal,
    AppButton,
    TreeTable,
    Column,
    AppLoading,
  },

  props: {
    data: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    //const { t } = useI18n();
    //const concept: any = props.data ?? null;
    const title = `Rubros Relacionados`;
    //const filterFuentes= 1;

    const expandedKeys = ref<any>({});
    //const financingSystemId = parseInt(route.params.financingSystemId as string);
    const financingSystem = ref<any>([]);
    const nodes = ref([]);
    const parents = ref<any>([]);
    const constantTypes = ref<any>([]);
    const selectedNodes = ref<any[]>([]);
    //const selectedKeys = ref<Set<string>>(new Set()); // IDs seleccionados
    //const financingSourceIds = ref<any>([]);

    //const dynamicText = ref('');

    const loading = ref(true);
    /*
    const form: any = reactive({
      typeFinancingSourceId: null,
      standardizedAccountingSystemId: props.data,
      financingSourceId: [],
    });
    const v$ = useVuelidate(
      {
        form: {
        },
      },
      { form }
    );
*/
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
        financingSystem.value = await getConstantTypesFinancingBySystemIdService.run(props.data);
        constantTypes.value = financingSystem.value?.[0]?.levelsStandardizedAccountingSystem;
        //console.log(financingSystem?.[0].levelsStandardizedAccountingSystem);
        console.log(constantTypes.value);
        //dynamicText.value = constantTypes.value?.[0].label;
      } catch (e) {
        console.log(e);
      }
    };
    // Función para cargar los nodos principales (nivel 1)
    const loadParentLevels = async () => {
      try {
        const filterSources = await getConstantReferencesExecutionService.run();
        const parentsAll = await getAllParentsTypesFinancingService.run(props.data);
        //Obtener el label del id = 2 en filterSources
        const labelForId1 = filterSources.find((item: any) => item.id === 2)?.label;
        if (labelForId1) {
          //Filtrar parentsAll con el label obtenido
          parents.value = parentsAll.filter((parent: any) => parent.reference === labelForId1);
        } else {
          parents.value = parentsAll.value;
          console.error('No label found for id = 1 in filterSources.');
        }
        //parents.value = await getAllParentsTypesFinancingService.run(props.data.id);
        console.log('parents', parents.value);
        nodes.value = parents.value.map((parent: any) => ({
          key: `Parent-${parent.id}`,
          data: parent,
          entity: 'Parent',
          children: [], // Los hijos se cargarán dinámicamente
        }));
        console.log(nodes.value);
      } catch (e) {
        console.log(e);
      }
    };

    // Función para cargar los hijos de un nodo cuando se expande
    const loadChildLevels = async (rootNode: any) => {
      console.log(rootNode);
      try {
        // Realiza la consulta para obtener todos los niveles jerárquicos
        const res = await getTypesFinancingByParentIdService.run(rootNode.data.id);

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
        key: `Child-${node.id}`,
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
    /* const levelToNameMap = computed(() => {
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
    };*/
    // Manejar selección de nodos
    // Reemplaza Set por un arreglo

    const isNodeSelected = (key: string) => {
      return selectedNodes.value.some((node) => node.key === key);
    };

    const addNode = (node: any) => {
      if (!isNodeSelected(node.key)) {
        selectedNodes.value.push(node);
      }
    };

    const removeNode = (key: string) => {
      selectedNodes.value = selectedNodes.value.filter((node) => node.key !== key);
    };

    const selectNodeAndChildren = async (node: any) => {
      const addNodeAndChildren = (n: any) => {
        addNode(n);
        if (n.children) {
          n.children.forEach(addNodeAndChildren);
        }
      };

      if (node.entity === 'Parent' && node.children?.length === 0) {
        await handleClickExpander(node);
      }

      addNodeAndChildren(node);
      selectParentNodes(node);
    };

    const deselectNodeAndChildren = (node: any) => {
      const removeNodeAndChildren = (n: any) => {
        removeNode(n.key);
        if (n.children) {
          n.children.forEach(removeNodeAndChildren);
        }
      };
      removeNodeAndChildren(node);
    };

    const selectParentNodes = (node: any) => {
      if (node.data.parentId) {
        const parentNode = findNodeByKey(node.data.parentId, nodes.value);

        if (parentNode) {
          if (!isNodeSelected(parentNode.key)) {
            addNode(parentNode);
          }
          selectParentNodes(parentNode);
        }
      } else {
        addParentNode(node.data.typeFinancingSourceId, nodes.value);
      }
    };

    const addParentNode = (parentId: string, nodes: any[]): any | null => {
      for (const node of nodes) {
        if (node.entity === 'Parent' && node.data.id === parentId) {
          addNode(node);
        }
      }
    };

    const findNodeByKey = (key: string, nodes: any[]): any | null => {
      for (const node of nodes) {
        if (node.entity === 'Child' && node.data.id === key) {
          return node;
        }
        if (Array.isArray(node.children)) {
          const found = findNodeByKey(key, node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const toggleSelection = async (node: any) => {
      if (isNodeSelected(node.key)) {
        deselectNodeAndChildren(node);
      } else {
        await selectNodeAndChildren(node);
      }
    };

    onMounted(async () => {
      loading.value = true;
      try {
        //await loadFilter();
        loadConstantType();
        loadParentLevels();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    /* const parentIds = computed(
      () =>
        Array.from(selectedKeys.value)
          .filter((key) => key.startsWith('Parent-'))
          .map((key) => Number(key.split('-')[1])) // Extrae el ID
    );

    const childIds = computed(
      () =>
        Array.from(selectedKeys.value)
          .filter((key) => key.startsWith('Child-'))
          .map((key) => Number(key.split('-')[1])) // Extrae el ID
    );*/

    const save = async () => {
      /*const isValid = await v$.value.$validate();
      if (!isValid) return;*/

      try {
        //await createOrUpdateBudgetCategoriesService.run(form, concept?.id);
        /* form.financingSourceId = childIds.value;
        form.typeFinancingSourceId = parentIds.value?.[0];
        //const res = await createOrUpdateIncomeExecutionPlanningService.run(form);
        //console.log('res planning', res);
        console.log(form);
        console.log(selectedKeys.value);
        console.log(parentIds.value);*/
        console.log(selectedNodes.value);

        emit('close', selectedNodes.value);
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      save,
      //v$,

      nodes,
      expandedKeys,
      isExpanded,
      handleClickExpander,
      loadChildLevels,
      isNodeSelected,
      toggleSelection,
    };
  },
});
</script>

<style scoped></style>
