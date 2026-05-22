<template>
  <div class="d-flex justify-content-between align-items-center">
    <h2 class="lead">Secciones</h2>

    <AppButton @click="openModalSection(null, true)">
      <AppIcon icon="plus" class="me-2" />
      Sección
    </AppButton>
  </div>

  <template v-if="!sections.length">
    <AppEmptyResponse :show-image="true" />
  </template>

  <div v-else class="mt-2">
    <AppAccordion v-slot="{ accordionId }">
      <draggable tag="div" :list="sections" item-key="id" @change="changeOrderSections" style="display: inherit; flex-direction: inherit; gap: inherit">
        <template v-slot:item="{ element }">
          <AppAccordionItem :accordion-id="accordionId">
            <template v-slot:head>
              <AppIcon icon="arrows-alt" class="me-2" />
              <span>{{ element.title }}</span>
            </template>

            <template v-slot:content>
              <QuestionsBySectionCustomForm :section="element" :isCustomFieldSurvey="survey.isCustomFieldSurvey" @updateQuestions="getData" />

              <hr />

              <div class="d-flex justify-content-end gap-2">
                <AppButtonEdit @click="openModalSection(element)" />
                <AppButtonDelete @click="confirmDelete(element)" />
              </div>
            </template>
          </AppAccordionItem>
        </template>
      </draggable>
    </AppAccordion>
  </div>

  <AppModal v-model="modalSection" size="lg">
    <template v-if="modalSection">
      <SectionCustomForm :data="currentSection.value" @close="closeModalSection" />
    </template>
  </AppModal>

  <AppModal v-model="modalDelete">
    <template v-if="modalDelete">
      <AppConfirmDeleteModal entity="Sección" @confirmDelete="deleteSection" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';

import SectionCustomForm from './SectionCustomForm.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import QuestionsBySectionCustomForm from './QuestionsBySectionCustomForm.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { SectionDto } from '../dtos/section.dto';
import { CustomFormDto } from '../dtos/customForm.dto';

import { GetCustomFormByIdService } from '../services/getCustomFormById.service';
import { DeleteSectionCustomFormService } from '../services/deleteSectionCustomForm.service';
import { UpdateOrderSectionsCustomFormService } from '../services/updateOrderSectionsCustomForm.service';

const updateOrderSectionsCustomFormService = new UpdateOrderSectionsCustomFormService();
const deleteSectionCustomFormService = new DeleteSectionCustomFormService();
const getCustomFormByIdService = new GetCustomFormByIdService();

export default defineComponent({
  name: 'CustomFormsFormSections',
  components: {
    QuestionsBySectionCustomForm,
    AppConfirmDeleteModal,
    SectionCustomForm,
    AppEmptyResponse,
    AppButton,
    AppAccordionItem,
    AppButtonDelete,
    AppButtonEdit,
    AppAccordion,
    draggable,
    AppModal,
    AppIcon,
  },

  props: {
    survey: {
      type: Object as () => CustomFormDto,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();

    const sections = ref<SectionDto[]>(props.survey.sections);

    const currentSection: { value: SectionDto | null } = reactive({
      value: null,
    });

    const modalDelete = ref(false);
    const modalSection = ref(false);

    const getData = async () => {
      const survey = await getCustomFormByIdService.run(props.survey.id);
      sections.value = survey.sections;
    };

    const changeOrderSections = async () => {
      try {
        const surveySections = sections.value.map((section, key) => ({
          id: section.id as number,
          order: key + 1,
        }));

        await updateOrderSectionsCustomFormService.run({
          surveySections,
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    const openModalSection = (section: SectionDto | null) => {
      currentSection.value = section;

      if (!currentSection.value) {
        currentSection.value = {
          title: '',
          surveyId: props.survey.id,
          order: sections.value.length + 1,
        };
      }

      modalSection.value = true;
    };
    const closeModalSection = async () => {
      modalSection.value = false;
      await getData();
    };

    const confirmDelete = async (section: SectionDto) => {
      currentSection.value = section;
      modalDelete.value = true;
    };
    const deleteSection = async () => {
      try {
        await deleteSectionCustomFormService.run(currentSection.value?.id as number);

        modalDelete.value = false;
        await getData();
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      t,

      modalSection,
      modalDelete,

      currentSection,
      sections,

      changeOrderSections,
      closeModalSection,
      openModalSection,
      confirmDelete,
      deleteSection,
      getData,
    };
  },
});
</script>
