<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
              <button
                class="nav-link active text-capitalize"
                data-bs-target="#budgetExecution"
                aria-controls="budgetExecution"
                data-bs-toggle="tab"
                aria-selected="true"
                id="budgetExecution-tab"
                type="button"
                role="tab"
                @click="activeTab = 'budgetExecution'"
              >
                {{ t('Ejecución presupuestal') }}
              </button>
              <button
                data-bs-target="#budgetPlanningPeriods"
                aria-controls="budgetPlanningPeriods"
                class="nav-link text-capitalize"
                id="budgetPlanningPeriods-tab"
                aria-selected="false"
                data-bs-toggle="tab"
                type="button"
                role="tab"
                @click="activeTab = 'budgetPlanningPeriods'"
              >
                {{ t('Períodos ') }}
              </button>
            </div>
          </nav>
          <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active mt-3" aria-labelledby="budgetExecution-tab" role="tabpanel" id="budgetExecution">
              <div class="form-row">
                <AppFormField :form-control="v$.form.budgetValidityId" label="Vigencia Presupuestal">
                  <AppAutocomplete :disabled="existExecution" v-model="v$.form.budgetValidityId.$model" :options="validity"></AppAutocomplete>
                </AppFormField>
                <AppFormField :form-control="v$.form.periodId" label="Períodos">
                  <AppAutocomplete :disabled="existExecution" v-model="v$.form.periodId.$model" :options="periods"></AppAutocomplete>
                </AppFormField>
              </div>
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
                  <Column field="code" header="Código"></Column>
                  <Column field="level" header="Nivel"></Column>
                </TreeTable>
              </div>
            </div>
            <div aria-labelledby="budgetPlanningPeriods-tab" class="tab-pane fade" role="tabpanel" id="budgetPlanningPeriods">
              <div class="card-body table-responsive p-2 mt-3">
                <table class="table table-bordered table align-middle">
                  <thead>
                    <tr class="w-100">
                      <th class="text-center">#</th>
                      <th class="text-center">Nombre</th>
                      <th class="text-center">Descripción</th>
                      <th class="text-center sticky-column">Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="budgetPlanningPeriods.length === 0">
                      <td colspan="10" class="text-center alert alert-warning" role="alert">
                        <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
                        <strong>Debe hacer la <strong>ejecución presupuestal primero</strong>.</strong>
                      </td>
                    </tr>
                    <tr v-for="(item, index) in budgetPlanningPeriods" :key="index">
                      <td class="text-center" scope="col">{{ index + 1 }}</td>

                      <td>
                        <div class="text-center input-xl">
                          {{ item.namePeriod }}
                        </div>
                      </td>
                      <td>
                        <div class="text-center input-xl">
                          {{ item.description }}
                        </div>
                      </td>
                      <td class="sticky-column">
                        <div class="d-flex justify-content-center">
                          <AppButtonEdit @click="openBudgetPlanningPeriodsModal(item)"> </AppButtonEdit>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
    <AppModal v-model="budgetPlanningPeriodsModal" :size="'lg'">
      <BudgetPlannignPeriodsForm v-if="budgetPlanningPeriodsModal" :data="currentPlanningPeriods" :financingSystemId="data.id" @close="closeBudgetPlanningPeriodsModal" />
    </AppModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref, computed, Ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

//import { useI18n } from 'vue-i18n';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import { ToastService } from '../../../shared/services/toast.service';

import { GetConstantTypesFinancingBySystemIdService } from '../services/getConstantTypesFinancingBySystemId.service';
import { GetAllParentsTypesFinancingService } from '../services/getAllParentsTypesFinancing.service';
import { GetTypesFinancingByParentIdService } from '../services/getTypesFinancingByParentId.service';
import { GetListBudgetValidity } from '../services/getListBudgetValidity';
import { GetAllPeriodsAdministrationService } from '../services/getAllPeriodsAdministration.service';
import { GetConstantReferencesExecutionService } from '../services/getConstantReferencesExecution.service';
import { CreateOrUpdateIncomeExecutionPlanningService } from '../services/createOrUpdateIncomeExecutionPlanning.service';
import { GetAllBudgetPlanningPeriodsService } from '../services/getAllBudgetPlanningPeriods.service';
import { GetBudgetPlanningService } from '../services/getBudgetPlanning.service';
import BudgetPlannignPeriodsForm from './BudgetPlannignPeriodsForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

const getConstantTypesFinancingBySystemIdService = new GetConstantTypesFinancingBySystemIdService();
const getAllParentsTypesFinancingService = new GetAllParentsTypesFinancingService();
const getTypesFinancingByParentIdService = new GetTypesFinancingByParentIdService();
const getListBudgetValidity = new GetListBudgetValidity();
const getAllPeriodsAdministrationService = new GetAllPeriodsAdministrationService();
const getConstantReferencesExecutionService = new GetConstantReferencesExecutionService();
const createOrUpdateIncomeExecutionPlanningService = new CreateOrUpdateIncomeExecutionPlanningService();
const getAllBudgetPlanningPeriodsService = new GetAllBudgetPlanningPeriodsService();
const getBudgetPlanningService = new GetBudgetPlanningService();
const toastService = new ToastService();

export default defineComponent({
  name: 'BudgetExecutionForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppButton,
    TreeTable,
    Column,
    AppLoading,
    BudgetPlannignPeriodsForm,
    AppModal,
    AppButtonEdit,
    AppIcon,
  },

  props: ['data'],

  emits: ['close'],

  setup(props, { emit }) {
    //const { t } = useI18n();
    //const concept: any = props.data ?? null;
    const title = `Ejecución de Ingresos ${props.data.name}`;
    const { t } = useI18n();

    const validity = ref<any>();
    const periods = ref<any>();
    //const filterFuentes= 1;

    const expandedKeys = ref<any>({});
    //const financingSystemId = parseInt(route.params.financingSystemId as string);
    const financingSystem = ref<any>([]);
    const budgetPlanningPeriods = ref<any>([]);
    const nodes = ref([]);
    const parents = ref<any>([]);
    const constantTypes = ref<any>([]);
    const selectedKeys = ref<Set<string>>(new Set()); // IDs seleccionados
    const activeTab = ref('budgetExecution');
    const budgetPlanningPeriodsModal = ref(false);
    const currentPlanningPeriods: Ref<any | null> = ref(null);
    const existExecution = ref(false);
    const dataBudgetPlanning = ref();

    //const dynamicText = ref('');

    const loading = ref(true);

    const form: any = reactive({
      budgetValidityId: null,
      periodId: null,
      typeFinancingSourceId: null,
      standardizedAccountingSystemId: props.data.id,
      financingSourceId: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          budgetValidityId: { required },
          periodId: { required },
        },
      },
      { form }
    );

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
        financingSystem.value = await getConstantTypesFinancingBySystemIdService.run(props.data.id);
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
        const parentsAll = await getAllParentsTypesFinancingService.run(props.data.id);
        //Obtener el label del id = 1 en filterSources
        const labelForId1 = filterSources.find((item: any) => item.id === 1)?.label;
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
    const isNodeSelected = (key: string) => selectedKeys.value.has(key);

    const selectNodeAndChildren = async (node: any) => {
      const addNodeAndChildren = (n: any) => {
        selectedKeys.value.add(n.key);
        if (n.children) {
          n.children.forEach(addNodeAndChildren);
        }
      };

      if (node.entity === 'Parent' && node.children?.length === 0) {
        // Expande el nodo si es un padre y aún no tiene hijos cargados
        await handleClickExpander(node);
      }

      // Selecciona el nodo y sus hijos (después de cargar)
      addNodeAndChildren(node);
      selectParentNodes(node); // Seleccionar nodos padres
    };

    const deselectNodeAndChildren = (node: any) => {
      const removeNodeAndChildren = (n: any) => {
        selectedKeys.value.delete(n.key);
        if (n.children) {
          n.children.forEach(removeNodeAndChildren);
        }
      };
      removeNodeAndChildren(node);
    };

    const selectParentNodes = (node: any) => {
      if (node.data.parentId) {
        console.log('dentro', node);
        const parentNode = findNodeByKey(node.data.parentId, nodes.value);

        if (parentNode) {
          // Evitar duplicados si es Set (bueno para reactivos)
          if (!selectedKeys.value.has(parentNode.key)) {
            selectedKeys.value.add(parentNode.key);
          }
          // Llamada recursiva para seguir subiendo el árbol
          selectParentNodes(parentNode);
        }
      } else {
        addParentNode(node.data.typeFinancingSourceId, nodes.value);
      }
    };

    const addParentNode = (parentId: string, nodes: any[]): any | null => {
      for (const node of nodes) {
        if (node.entity === 'Parent' && node.data.id === parentId) {
          selectedKeys.value.add(node.key);
        }
      }
    };

    const findNodeByKey = (key: string, nodes: any[]): any | null => {
      for (const node of nodes) {
        if (node.entity === 'Child') {
          console.log(key);
          if (node.data.id === key) return node;
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
        validity.value = await getListBudgetValidity.run();
        periods.value = await getAllPeriodsAdministrationService.run();
        //await loadFilter();

        loadConstantType();
        await loadParentLevels();
        await getData();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    const getData = async () => {
      loading.value = true;
      try {
        budgetPlanningPeriods.value = await getAllBudgetPlanningPeriodsService.run(props.data.id);
        console.log('budgetPlanningPeriods.length', budgetPlanningPeriods.value);

        if (budgetPlanningPeriods.value.length > 0) {
          const params = {
            typeFinancingSourceId: parents.value?.[0]?.id,
            standardizedAccountingSystemId: props.data.id,
          };
          dataBudgetPlanning.value = await getBudgetPlanningService.run(params);
          if (dataBudgetPlanning.value?.length > 0) {
            form.budgetValidityId = dataBudgetPlanning.value?.[0]?.budgetValidityId;
            form.periodId = dataBudgetPlanning.value?.[0]?.periodId;
            existExecution.value = true;
            console.log(dataBudgetPlanning.value, 'parent', parents.value?.[0]?.id);
          }
        }
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    };
    const parentIds = computed(
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
    );
    const showWarningToast = (message: string) => {
      toastService.hide();
      toastService.show(message, 'warning');
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        //filtar ids, solo id de table hijos
        const dataBudgetPlanningChild = dataBudgetPlanning.value?.filter((item: any) => item.financing_sources?.id);
        const newChildIds = childIds.value?.filter((item: any) => !dataBudgetPlanningChild?.some((source: any) => source.financing_sources?.id === item));
        form.financingSourceId = newChildIds;
        form.typeFinancingSourceId = parentIds.value?.[0];

        if (form.financingSourceId.length > 0) {
          await createOrUpdateIncomeExecutionPlanningService.run(form);
        } else {
          showWarningToast('Debes agregar al menos una fuente.');
          return;
        }
        //console.log('res planning', res);
        console.log(form);
        console.log(selectedKeys.value);
        console.log(parentIds.value);
        console.log(childIds.value);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };
    const openBudgetPlanningPeriodsModal = async (data: any) => {
      const dataSelected = data;
      currentPlanningPeriods.value = dataSelected;
      console.log('data,', data);
      console.log('dataSelected,', dataSelected);
      console.log('currentPlanningPeriods,', currentPlanningPeriods.value);

      if (currentPlanningPeriods.value) {
        budgetPlanningPeriodsModal.value = true;
      }
    };
    const closeBudgetPlanningPeriodsModal = async () => {
      await getData();
      budgetPlanningPeriodsModal.value = false;
    };
    return {
      loading,
      title,
      save,
      v$,
      t,
      validity,
      periods,
      nodes,
      expandedKeys,
      isExpanded,
      handleClickExpander,
      loadChildLevels,
      isNodeSelected,
      toggleSelection,
      activeTab,
      budgetPlanningPeriods,
      budgetPlanningPeriodsModal,
      openBudgetPlanningPeriodsModal,
      closeBudgetPlanningPeriodsModal,
      currentPlanningPeriods,
      existExecution,
    };
  },
});
</script>

<style scoped></style>
