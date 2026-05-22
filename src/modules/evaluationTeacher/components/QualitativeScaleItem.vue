<template>
  <div class="mt-2">
    <div class="contentBottons">
      <h4>Escalas Cualitativas</h4>
      <AppButton @click="openAddScale()"> Crear Escala Cualitativa </AppButton>
    </div>

    <AppAccordion v-slot="{ accordionId }">
      <draggable tag="div" :list="scales" item-key="id" style="display: inherit; flex-direction: inherit; gap: inherit">
        <template #item="{ element: scale }">
          <AppAccordionItem :accordion-id="accordionId">
            <!-- Header escala -->
            <template #head>
              <div class="header">
                <AppIcon icon="arrows-alt" class="drag-icon" />
                <span class="scale-title">{{ scale.name }}</span>

                <div class="scale-actions">
                  <AppButton icon="plus" @click.stop="openAddLevels()" />
                  <AppButtonEdit size="xs" @click.stop="editScale(scale)" />
                  <AppButtonDelete size="xs" @click.stop="confirmDelete(scale)" />
                </div>
              </div>
            </template>

            <!-- Contenido: niveles de escala -->
            <template #content>
              <draggable :list="scale.levels" item-key="id">
                <template #item="{ element: level }">
                  <div class="section-row">
                    <AppIcon icon="arrows-alt" class="drag-icon" />

                    <span class="section-name">
                      <div>
                        {{ level.label }}
                        <span class="section-value">({{ level.value }})</span>
                      </div>

                      <div class="section-actions">
                        <AppButtonEdit size="xs" @click="editLevel(level)" />
                        <AppButtonDelete size="xs" @click="confirmDeleteItem(level)" />
                      </div>
                    </span>
                  </div>
                </template>
              </draggable>
            </template>
          </AppAccordionItem>
        </template>
      </draggable>
    </AppAccordion>
  </div>

  <!-- Modal crear/editar escala -->
  <AppModal v-model="modalSection" size="md">
    <template v-if="modalSection">
      <QualitativeScaleForm :data="currentSection.value" @close="closeModalSection" />
    </template>
  </AppModal>

  <!-- Modal eliminar escala -->
  <AppModal v-model="modalDelete">
    <template v-if="modalDelete">
      <AppConfirmDeleteModal entity="Escala Cualitativa" @confirmDelete="deleteSection" />
    </template>
  </AppModal>

  <!-- Modal crear/editar nivel -->
  <AppModal v-model="modalSectionItem" size="lg">
    <template v-if="modalSectionItem">
      <QualitativeScaleItemsForm :data="currentSectionItem.value" @close="closeModalSectionItem" />
    </template>
  </AppModal>

  <!-- Modal eliminar nivel -->
  <AppModal v-model="modalDeleteItem">
    <template v-if="modalDeleteItem">
      <AppConfirmDeleteModal entity="Detalle Escala Cualitativa" @confirmDelete="deleteSectionItem" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import draggable from 'vuedraggable';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import QualitativeScaleForm from './QualitativeScaleForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import QualitativeScaleItemsForm from './QualitativeScaleItemsForm.vue';

export default defineComponent({
  name: 'QualitativeScaleItem',
  components: {
    draggable,
    AppAccordion,
    AppAccordionItem,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppIcon,
    QualitativeScaleForm,
    AppModal,
    AppConfirmDeleteModal,
    QualitativeScaleItemsForm,
  },

  setup() {
    const modalDelete = ref(false);
    const modalSection = ref(false);
    const modalDeleteItem = ref(false);
    const modalSectionItem = ref(false);

    const currentSection = reactive({ value: null as any });
    const currentSectionItem = reactive({ value: null as any });

    const scales = ref([
      {
        id: 1,
        name: 'Escala Actitudinales Secundaria',
        levels: [
          { id: 1, label: 'Destreza Alcanzada', value: 5 },
          { id: 2, label: 'Destreza en Proceso', value: 4 },
          { id: 3, label: 'Avance Inicial', value: 3 },
          { id: 4, label: 'Necesita Ejercitación', value: 2 },
        ],
      },
      {
        id: 2,
        name: 'Escala Actitudinales Preescolar',
        levels: [
          { id: 1, label: 'Destreza Alcanzada', value: 5 },
          { id: 2, label: 'Destreza en Proceso', value: 4 },
          { id: 3, label: 'Avance Inicial', value: 3 },
          { id: 4, label: 'Necesita Ejercitación', value: 2 },
        ],
      },
    ]);
    // === Escalas ===
    const openAddScale = () => {
      modalSection.value = true;
      currentSection.value = {};
    };
    // === DETALLE ===
    const openAddLevels = () => {
      currentSection.value = {};

      modalSectionItem.value = true;
    };

    const editScale = (scale: any) => {
      console.log('Editar escala:', scale);
      currentSection.value = scale;
      modalSection.value = true;
    };

    const confirmDelete = (scale: any) => {
      currentSection.value = scale;
      modalDelete.value = true;
    };

    const deleteSection = () => {
      modalDelete.value = false;
      console.log('Escala eliminada:', currentSection.value);
    };

    const closeModalSection = () => {
      modalSection.value = false;
    };

    // === Niveles ===
    const editLevel = (level: any) => {
      currentSectionItem.value = level;
      modalSectionItem.value = true;
    };

    const confirmDeleteItem = (level: any) => {
      currentSectionItem.value = level;
      modalDeleteItem.value = true;
    };

    const deleteSectionItem = () => {
      modalDeleteItem.value = false;
      console.log('Nivel eliminado:', currentSectionItem.value);
    };

    const closeModalSectionItem = () => {
      modalSectionItem.value = false;
    };

    return {
      scales,
      modalDelete,
      modalSection,
      modalDeleteItem,
      modalSectionItem,
      currentSection,
      currentSectionItem,
      openAddLevels,
      editScale,
      confirmDelete,
      deleteSection,
      closeModalSection,
      editLevel,
      confirmDeleteItem,
      deleteSectionItem,
      closeModalSectionItem,
      openAddScale,
    };
  },
});
</script>

<style scoped>
.section-row {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #f2f2f2;
  gap: 10px;
}
.scale-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  width: 95%;
  gap: 10px;
}
.section-name {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}
.contentBottons {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
  justify-content: space-between;
}
</style>
