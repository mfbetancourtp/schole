<template>
  <div class="d-flex justify-content-between">
    <div class="d-flex align-items-end">
      <h4 v-if="formulas.length" class="m-0">Lista de formulas</h4>
    </div>

    <div class="d-flex flex-column align-items-end">
      <AppButton 
        :disabled="!documentId" class="text-white" variant="primary" label="Agregar formula" @click="openModalForm">
      </AppButton>
      
      <span class="form-text" v-if="!documentId">
        Para usar esta opción, debes guardar el documento
      </span>
    </div>
  </div>

  <div v-if="formulas.length">
    <div class="items mt-2">
      <AppCard v-for="formula, index in formulas" :key="index">
        <template #title>
          <AppCardTitle :title="formula.name"></AppCardTitle>
        </template>

        <template #body>
          <p>Formula: {{ loadFormula(formula.formula) }}</p>
        </template>

        <template #footer>
          <div class="d-flex justify-content-end">
            <AppButtonGroup>
              <AppButtonDelete @click="showModalDelete(formula)"></AppButtonDelete>
              <AppButtonEdit @click="openModalForm(formula)"></AppButtonEdit>
            </AppButtonGroup>
          </div>
        </template>
      </AppCard>

      <AppModal v-model="modalForm" :size="'xl'">
        <DocumentFormulasForm 
          v-if="modalForm" :data="currentFormula" :documentId="documentId" :keys="formulaKeys" @close="closeModalForm"
        ></DocumentFormulasForm>
      </AppModal>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType, reactive, Ref, ref, watch } from 'vue';

import DocumentFormulasForm from './DocumentFormulasForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from "../../../shared/components/AppButtonGroup.vue";
import AppCardTitle from '../../../shared/components/Card/AppCardTitle.vue';
import AppButtonEdit from "../../../shared/components/Buttons/AppButtonEdit.vue";
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';

import { FormulaDto } from '../dtos/document.dto';

import { DeleteDocumentFormulaByIdService } from '../services/deleteDocumentFormulaById.service';

const deleteDocumentFormulaByIdService = new DeleteDocumentFormulaByIdService();

export default defineComponent({
  name: 'DocumentFormulasList',
  components: {
    DocumentFormulasForm,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppCardTitle,
    AppButton,
    AppModal,
    AppCard,
  },

  props: {
    documentId: {
      type: Number as PropType<Number | null>,
      default: null,
    },
    formulas: {
      type: Array as PropType<FormulaDto[]>,
      default: [],
    },
  },

  setup(props) {
    const formulaKeys: Ref<{ id: string; name: string }[]> = ref([]);
    const currentFormula: Ref<FormulaDto | null> = ref(null);

    const modalDelete = ref(false); 
    const modalForm = ref(false);

    onMounted(async () => {
      
    });

    const loadFormula = (formula: string) => {
      console.log(formula);
      // const concepts: any[] = data.value?.concepts ?? [];
      // const formulaArr: string[] = formula.split(' ');
      // let variable1: string = formulaArr[0];
      // let variable2: string = formulaArr[2];
      // const keys: string[] = [];

      // if (formulaArr[0].search('{') >= 0) {
      //   variable1 = formulaArr[0];
      //   keys.push(variable1);
      // }

      // if (formulaArr[2].search('{') >= 0) {
      //   variable2 = formulaArr[2];
      //   keys.push(variable2);
      // }

      // if (concepts.length) {
      //   keys.forEach(key => {
      //     formulaKeys.value.forEach(formulaKey => {
      //       if (formulaKey.id == key) {
      //         if (variable1 == key) variable1 = formulaKey.name;
      //         if (variable2 == key) variable2 = formulaKey.name;
      //       }
      //     });
      //   });
      // }

      // return `${variable1} ${formulaArr[1] == '*' ? 'x' : formulaArr[1]} ${variable2}`;
    };

    const openModalForm = async (formula: FormulaDto | null = null) => {
      currentFormula.value = formula;
      modalForm.value = true;
    };
    const closeModalForm = async () => {
      modalForm.value = false;
      // await getData();
    };

    const showModalDelete = (formula: FormulaDto) => {
      modalDelete.value = true;
      currentFormula.value = formula;
    };
    const deleteFormula = async () => {
      try {
        await deleteDocumentFormulaByIdService.run(currentFormula.value?.id as number);

        modalDelete.value = false;

        // await getData();
      } catch (e) {}
    };

    return {
      currentFormula,
      formulaKeys,
      modalDelete,
      modalForm,

      showModalDelete,
      closeModalForm,
      openModalForm,
      deleteFormula,
      loadFormula,
    }
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
</style>