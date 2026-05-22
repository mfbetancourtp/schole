<template>
  <div>
    <table class="table table-hover">
      <thead>
        <tr>
          <th></th>
          <th>Pregunta</th>
          <th>Tipo</th>
          <th>Formato</th>
          <th>Obligatorio</th>
          <th></th>
        </tr>
      </thead>
      <draggable v-model="questions.value" tag="tbody" item-key="id" @change="changeOrderQuestions">
        <template v-slot:item="{ element }">
          <tr :key="element.id" class="tw-cursor-pointer">
            <td><AppIcon icon="arrows-alt"></AppIcon></td>
            <td>{{ element.text }}</td>
            <td>{{ element.questionType }}</td>
            <td>{{ element.typeData }}</td>
            <td>
              <AppIcon
                :icon="element.required ? 'check' : 'times'"
                :class="{
                  'text-success': element.required,
                  'text-danger': !element.required,
                }"
              ></AppIcon>
            </td>
            <td>
              <div class="d-flex gap-1">
                <AppButtonEdit @click="openModalQuestion(element)"></AppButtonEdit>
                <AppButtonDelete :disabled="element.fieldDefaultRequired ? true : false" @click="confirmDelete(element)"></AppButtonDelete>
              </div>
            </td>
          </tr>
        </template>
      </draggable>
    </table>

    <AppEmptyResponse v-if="!questions.value.length"></AppEmptyResponse>

    <AppButtonNewContainer text="core.new" @click="openModalQuestion(null)"></AppButtonNewContainer>

    <AppModal v-model="modalQuestion" :size="'lg'">
      <QuestionForm v-if="modalQuestion" :data="currentQuestion.value" :isCustomFieldSurvey="isCustomFieldSurvey" @close="closeModalQuestion"></QuestionForm>
    </AppModal>

    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="Pregunta" @confirmDelete="deleteQuestion"></AppConfirmDeleteModal>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import draggable from 'vuedraggable';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import QuestionForm from './QuestionForm.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { QuestionDto } from '../dtos/question.dto';
import { SectionDto } from '../dtos/section.dto';
import { UpdateOrderQuestionsService } from '../services/updateOrderQuestions.service';
import { DeleteQuestionService } from '../services/deleteQuestion.service';

const updateOrderQuestionsService = new UpdateOrderQuestionsService();
const deleteQuestionService = new DeleteQuestionService();

export default defineComponent({
  name: 'QuestionsBySectionCustomForm',
  components: {
    AppConfirmDeleteModal,
    AppButtonDelete,
    AppButtonEdit,
    AppIcon,
    QuestionForm,
    AppModal,
    AppEmptyResponse,
    AppButtonNewContainer,
    draggable,
  },
  props: ['section', 'isCustomFieldSurvey'],
  emits: ['updateQuestions'],
  setup(props, { emit }) {
    const sectionL: { value: SectionDto } = reactive({
      value: props.section,
    });
    const questions: { value: QuestionDto[] } = reactive({
      value: sectionL.value.questions as QuestionDto[],
    });

    watch(
      () => props.section,
      (value) => {
        sectionL.value = value;
        questions.value = value.questions;
      }
    );

    const modalQuestion = ref(false);

    const currentQuestion: { value: QuestionDto | null } = reactive({
      value: null,
    });

    const openModalQuestion = (question: QuestionDto | null) => {
      currentQuestion.value = question;

      if (!question) {
        currentQuestion.value = {
          surveySectionId: sectionL.value.id as number,
          order: questions.value.length + 1,
        };
      }

      modalQuestion.value = true;
    };

    const closeModalQuestion = () => {
      modalQuestion.value = false;
      emit('updateQuestions');
    };

    const changeOrderQuestions = async () => {
      try {
        await updateOrderQuestionsService.run({
          questions: questions.value.map((question, key) => ({
            id: question.id as number,
            order: key + 1,
          })),
        });
        emit('updateQuestions');
      } catch (e) {
        console.log(e);
      }
    };

    const modalDelete = ref(false);

    const confirmDelete = async (question: QuestionDto) => {
      currentQuestion.value = question;
      modalDelete.value = true;
    };

    const deleteQuestion = async () => {
      try {
        await deleteQuestionService.run(currentQuestion.value?.id as number);

        modalDelete.value = false;
        emit('updateQuestions');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      modalQuestion,
      currentQuestion,
      // section,
      questions,
      modalDelete,
      openModalQuestion,
      closeModalQuestion,
      changeOrderQuestions,
      confirmDelete,
      deleteQuestion,
    };
  },
});
</script>

<style scoped></style>
