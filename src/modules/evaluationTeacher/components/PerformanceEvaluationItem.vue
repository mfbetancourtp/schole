<template>
  <div class="mt-2">
    <div class="contentBottons">
      <h4>Evaluación de Desempeño</h4>
      <AppButton @click="openAddScale()">Crear Evaluación de Desempeño</AppButton>
    </div>

    <!-- Acordeón principal (Escalas) -->
    <AppAccordion v-slot="{ accordionId }">
      <draggable tag="div" :list="scales" item-key="id" style="display: inherit; flex-direction: inherit; gap: inherit">
        <template #item="{ element: scale }">
          <AppAccordionItem :accordion-id="accordionId">
            <!-- Header de la escala -->
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

            <!-- Contenido: competencias -->
            <template #content>
              <AppAccordion v-slot="{ accordionId: innerId }">
                <draggable :list="scale.levels" item-key="id" style="display: inherit; flex-direction: inherit; gap: inherit">
                  <template #item="{ element: level }">
                    <AppAccordionItem :accordion-id="innerId">
                      <!-- Header de la competencia -->
                      <template #head>
                        <div class="header">
                          <AppIcon icon="arrows-alt" class="drag-icon" />
                          <div class="section-name">
                            <div>
                              {{ level.label }}
                              <span class="section-value">({{ level.value }})</span>
                            </div>
                            <div class="section-actions">
                              <AppButton icon="plus" @click.stop="openAddIdicator()" />

                              <AppButtonEdit size="xs" @@click.stop="editLevel(level)" />
                              <AppButtonDelete size="xs" @@click.stop="confirmDeleteItem(level)" />
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Contenido: indicadores -->
                      <template #content>
                        <draggable :list="level.indicators" item-key="id" style="display: inherit; flex-direction: inherit; gap: inherit">
                          <template #item="{ element: indicator }">
                            <div class="indicator-row">
                              <AppIcon icon="grip-vertical" class="drag-icon" />
                              <div class="indicator-info">
                                <span>{{ indicator.label }}</span>
                                <span class="indicator-value">{{ indicator.value }}%</span>
                              </div>
                              <div class="indicator-actions">
                                <AppButtonEdit size="xs" @click="editIndicator(indicator)" />
                                <AppButtonDelete size="xs" @click="confirmDeleteIndicator(indicator)" />
                              </div>
                            </div>
                          </template>
                        </draggable>
                      </template>
                    </AppAccordionItem>
                  </template>
                </draggable>
              </AppAccordion>
            </template>
          </AppAccordionItem>
        </template>
      </draggable>
    </AppAccordion>
  </div>

  <!-- Modales -->
  <AppModal v-model="modalSection" size="md">
    <template v-if="modalSection">
      <PerformanceEvaluationForm :data="currentSection.value" @close="closeModalSection" />
    </template>
  </AppModal>

  <AppModal v-model="modalDelete">
    <template v-if="modalDelete">
      <AppConfirmDeleteModal entity="Evaluación de Desempeño" @confirmDelete="deleteSection" />
    </template>
  </AppModal>

  <AppModal v-model="modalSectionItem" size="md">
    <template v-if="modalSectionItem">
      <PerformanceEvaluationCompetenciesForm :data="currentSectionItem.value" @close="closeModalSectionItem" />
    </template>
  </AppModal>

  <AppModal v-model="modalDeleteItem">
    <template v-if="modalDeleteItem">
      <AppConfirmDeleteModal entity="Competencia" @confirmDelete="deleteSectionItem" />
    </template>
  </AppModal>

  <AppModal v-model="modalSectionIndicator" size="md">
    <template v-if="modalSectionIndicator">
      <PerformanceEvaluationIndicatorsForm :data="currentSectionIndicator.value" @close="closeModalSectionIndicator" />
    </template>
  </AppModal>

  <AppModal v-model="modalDeleteIndicator">
    <template v-if="modalDeleteIndicator">
      <AppConfirmDeleteModal entity="Indicador" @confirmDelete="deleteSectionIndicator" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import draggable from 'vuedraggable';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import PerformanceEvaluationForm from './PerformanceEvaluationForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import PerformanceEvaluationCompetenciesForm from './PerformanceEvaluationCompetenciesForm.vue';
import PerformanceEvaluationIndicatorsForm from './PerformanceEvaluationIndicatorsForm.vue';

export default defineComponent({
  name: 'PerformanceEvaluationItem',
  components: {
    draggable,
    AppAccordion,
    AppAccordionItem,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppIcon,
    PerformanceEvaluationForm,
    AppModal,
    AppConfirmDeleteModal,
    PerformanceEvaluationCompetenciesForm,
    PerformanceEvaluationIndicatorsForm,
  },
  setup() {
    const modalDelete = ref(false);
    const modalSection = ref(false);
    const modalDeleteItem = ref(false);
    const modalSectionItem = ref(false);
    const modalSectionIndicator = ref(false);
    const modalDeleteIndicator = ref(false);

    const currentSection = reactive({ value: null as any });
    const currentSectionItem = reactive({ value: null as any });
    const currentSectionIndicator = reactive({ value: null as any });

    const scales = ref([
      {
        id: 1,
        name: 'Evaluación de Comportamiento',
        levels: [
          {
            id: 1,
            label: 'Competencia 1: Trabajo en equipo',
            value: 50,
            indicators: [
              {
                id: 1,
                label: 'Colabora activamente con sus compañeros',
                value: 60,
              },
              { id: 2, label: 'Respeta las opiniones de los demás', value: 40 },
            ],
          },
          {
            id: 2,
            label: 'Competencia 2: Responsabilidad',
            value: 70,
            indicators: [
              { id: 1, label: 'Cumple con las tareas asignadas', value: 80 },
              {
                id: 2,
                label: 'Llega puntualmente a las actividades',
                value: 60,
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Evaluación Actitudinal',
        levels: [
          {
            id: 1,
            label: 'Competencia 1: Actitud positiva',
            value: 50,
            indicators: [
              {
                id: 1,
                label: 'Mantiene una actitud proactiva ante los retos',
                value: 30,
              },
              { id: 2, label: 'Motiva a sus compañeros', value: 30 },
            ],
          },
          {
            id: 2,
            label: 'Competencia 2: Empatía',
            value: 60,
            indicators: [
              {
                id: 1,
                label: 'Muestra comprensión hacia los demás',
                value: 55,
              },
              {
                id: 2,
                label: 'Ofrece apoyo a quienes lo necesitan',
                value: 65,
              },
            ],
          },
        ],
      },
    ]);

    const openAddScale = () => {
      currentSection.value = {}; // limpia antes de abrir
      currentSectionItem.value = {}; // limpia antes de abrir
      currentSectionIndicator.value = {}; // limpia antes de abrir

      modalSection.value = true;
    };

    const openAddLevels = () => {
      currentSection.value = {}; // limpia antes de abrir
      currentSectionItem.value = {}; // limpia antes de abrir
      currentSectionIndicator.value = {}; // limpia antes de abrir
      modalSectionItem.value = true;
    };

    const openAddIdicator = () => {
      currentSection.value = {}; // limpia antes de abrir
      currentSectionItem.value = {}; // limpia antes de abrir
      currentSectionIndicator.value = {}; // limpia antes de abrir
      modalSectionIndicator.value = true;
    };

    const editScale = (scale: any) => {
      currentSection.value = scale;
      modalSection.value = true;
    };

    const confirmDelete = (scale: any) => {
      currentSection.value = scale;
      modalDelete.value = true;
    };

    const deleteSection = () => {
      modalDelete.value = false;
    };

    const closeModalSection = () => {
      modalSection.value = false;
      currentSection.value = {}; // limpia antes de abrir
      currentSectionItem.value = {}; // limpia antes de abrir
      currentSectionIndicator.value = {}; // limpia antes de abrir
    };

    const closeModalSectionItem = () => {
      modalSectionItem.value = false;
      currentSection.value = {}; // limpia antes de abrir
      currentSectionItem.value = {}; // limpia antes de abrir
      currentSectionIndicator.value = {}; // limpia antes de abrir
    };

    const closeModalSectionIndicator = () => {
      modalSectionIndicator.value = false;
      currentSection.value = {}; // limpia antes de abrir
      currentSectionItem.value = {}; // limpia antes de abrir
      currentSectionIndicator.value = {}; // limpia antes de abrir
    };

    const editIndicator = (level: any) => {
      currentSectionIndicator.value = level;
      modalSectionIndicator.value = true;
    };

    const confirmDeleteIndicator = (level: any) => {
      currentSectionIndicator.value = level;
      modalDeleteIndicator.value = true;
    };

    const deleteSectionIndicator = () => {
      modalDeleteIndicator.value = false;
    };

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
    };

    return {
      scales,
      modalDelete,
      modalSection,
      modalDeleteItem,
      modalSectionItem,
      currentSection,
      currentSectionItem,
      openAddScale,
      openAddLevels,
      editScale,
      confirmDelete,
      deleteSection,
      closeModalSection,
      editLevel,
      confirmDeleteItem,
      deleteSectionItem,
      closeModalSectionItem,
      editIndicator,
      confirmDeleteIndicator,
      deleteSectionIndicator,
      closeModalSectionIndicator,
      openAddIdicator,
      modalSectionIndicator,
      modalDeleteIndicator,
      currentSectionIndicator,
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
.indicator-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}
</style>
