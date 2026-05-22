<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :subtitle="subtitle">
    <template #actions>
      <AppButtonBack :to="{ name: 'surveys.convocationsList' }"></AppButtonBack>
    </template>

    <template #content>
      <AppCard>
        <template #body>
          <div class="d-contents">
            <AppButton class="me-2 mt-2" v-for="stepType in stepTypes" :key="stepType.id" @click="openStepManageForm(stepType)">
              <AppIcon icon="plus" class="me-2"></AppIcon>
              {{ stepType.name }}
            </AppButton>
          </div>

          <AppEmptyResponse v-if="!steps.length" :show-image="true"></AppEmptyResponse>

          <AppAccordion v-else class="mt-2" v-slot="{ accordionId }">
            <draggable tag="div" :list="steps" item-key="id" @change="changeOrder" style="display: inherit; flex-direction: inherit; gap: inherit">
              <template v-slot:item="{ element }">
                <AppAccordionItem :accordion-id="accordionId" :key="element.id">
                  <template #head>
                    <AppIcon icon="arrows-alt" class="me-2"></AppIcon>
                    <span>
                      {{ element.ConvocationStepType.name }}:
                      {{ element.title }}
                    </span>
                  </template>

                  <template #content>
                    <StepManageList :details="element.details" :step-type="element.ConvocationStepType"></StepManageList>

                    <hr />

                    <div class="d-flex justify-content-end align-items-end gap-2">
                      <AppButtonGroup>
                        <AppButton @click="openConfigureSequenceModal(element)" v-tooltip="'Configurar secuencia'" icon="cogs" outlined></AppButton>

                        <AppButtonEdit @click="openStepManageForm(element.ConvocationStepType, element)"></AppButtonEdit>

                        <AppButtonDelete @click="openDeleteModal(element)"></AppButtonDelete>
                      </AppButtonGroup>
                    </div>
                  </template>
                </AppAccordionItem>
              </template>
            </draggable>
          </AppAccordion>
        </template>
      </AppCard>

      <AppModal v-model="configureSequenceModal">
        <ConvStepConfigureSequence v-if="configureSequenceModal && currentStep" :step="currentStep" @close="closeConfigureSequenceModal"></ConvStepConfigureSequence>
      </AppModal>

      <AppModal v-model="stepManageForm" size="lg">
        <StepManageForm v-if="stepManageForm" :step-type="currentStepType" :convocation="convocation" :data="currentStep" @close="closeStepManageForm"></StepManageForm>
      </AppModal>

      <AppModal v-model="deleteModal">
        <AppConfirmDeleteModal v-if="deleteModal" entity="paso" @confirmDelete="closeDeleteModal" @close="deleteModal = false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import draggable from 'vuedraggable';

import AppIcon from '../../../shared/components/AppIcon.vue';
import StepManageForm from '../components/StepManageForm.vue';
import StepManageList from '../components/StepManageList.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import ConvStepConfigureSequence from '../components/ConvStepConfigureSequence.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { StepTypeDto } from '../dtos/stepType.dto';
import { ConvocationStepForConfigureStepsDto } from '../dtos/convocationStep.dto';
import { ConvocationWithStepForConfigureStepsDto } from '../dtos/convocation.dto';

import { GetConvocationStepsService } from '../services/getConvocationSteps.service';
import { DeleteConvocationStepService } from '../services/deleteConvocationStep.service';
import { UpdateOrderConvocationStepsService } from '../services/updateOrderConvocationSteps.service';
import { useHeaderStore } from '../../../stores/header.store';

const updateOrderConvocationStepsService = new UpdateOrderConvocationStepsService();
const deleteConvocationStepService = new DeleteConvocationStepService();
const getConvocationStepsService = new GetConvocationStepsService();

export default defineComponent({
  name: 'ConvocationSteps',
  components: {
    ConvStepConfigureSequence,
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppAccordionItem,
    AppButtonDelete,
    StepManageList,
    StepManageForm,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppAccordion,
    AppBaseList,
    AppLoading,
    AppButton,
    draggable,
    AppModal,
    AppIcon,
    AppCard,
  },

  setup() {
    const route = useRoute();
    const title = 'Configurar pasos';
    const subtitle = ref('');
    const convocationId = parseInt(route.params.convocationId.toString());

    const convocation: Ref<ConvocationWithStepForConfigureStepsDto | null> = ref(null);
    const currentStep: Ref<ConvocationStepForConfigureStepsDto | null> = ref(null);
    const steps: Ref<ConvocationStepForConfigureStepsDto[]> = ref([]);
    const currentStepType: Ref<StepTypeDto | null> = ref(null);
    const stepTypes: Ref<StepTypeDto[]> = ref([]);

    const configureSequenceModal = ref(false);
    const stepManageForm = ref(false);
    const deleteModal = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      await getData();
      loading.value = false;
    });

    const getData = async () => {
      const response = await getConvocationStepsService.run(convocationId);
      convocation.value = response.convocation;
      steps.value = response.convocation.steps;
      stepTypes.value = response.stepTypes;

      subtitle.value = `Proceso de matriculación: ${convocation.value?.title}`;
    };

    const openStepManageForm = (stepType: StepTypeDto, step: ConvocationStepForConfigureStepsDto | null = null) => {
      stepManageForm.value = true;
      currentStepType.value = stepType;
      currentStep.value = step;
    };
    const closeStepManageForm = async () => {
      stepManageForm.value = false;
      await getData();
    };

    const openConfigureSequenceModal = (step: ConvocationStepForConfigureStepsDto) => {
      currentStep.value = step;

      configureSequenceModal.value = true;
    };
    const closeConfigureSequenceModal = async () => {
      configureSequenceModal.value = false;
      currentStep.value = null;
      await getData();
    };

    const openDeleteModal = (step: ConvocationStepForConfigureStepsDto) => {
      currentStep.value = step;
      deleteModal.value = true;
    };
    const closeDeleteModal = async () => {
      if (!currentStep.value) return;

      try {
        await deleteConvocationStepService.run(currentStep.value.id);

        deleteModal.value = false;

        await getData();
      } catch (e) {
        console.log(e);
      }
    };

    const changeOrder = async () => {
      try {
        const convocationSteps = steps.value.map((step, key) => ({
          id: step.id as number,
          order: key + 1,
        }));

        await updateOrderConvocationStepsService.run({
          // surveySections: sections,
          convocationSteps,
        });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      subtitle,
      loading,
      convocation,
      steps,
      stepTypes,
      stepManageForm,
      currentStepType,
      currentStep,
      deleteModal,
      openStepManageForm,
      closeStepManageForm,
      openDeleteModal,
      closeDeleteModal,
      changeOrder,

      configureSequenceModal,

      closeConfigureSequenceModal,
      openConfigureSequenceModal,
    };
  },
});
</script>

<style scoped></style>
