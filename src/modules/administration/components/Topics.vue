<template>
  <div  >
    <section class="d-flex align-items-center justify-content-between">
      <span class="fs-5">{{ title }}</span>

      <AppButton :size="'sm'" label="core.newMale" @click="openTopicModal(null)"></AppButton>
    </section>

    <AppLoading v-if="loading"></AppLoading>
    <section v-else>
      <table class="table">
        <thead>
          <tr>
            <th>{{ t('core.theme') }}</th>
            <th class="w-25">{{ t('classroom.homeTeacher.options') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!topics.value.length">
            <td colspan="2">
              <AppEmptyResponse></AppEmptyResponse>
            </td>
          </tr>
          <tr v-for="(element, index) in topics.value" :key="index">
            <td>{{ element.name }}</td>
            <td>
              <AppButtonGroup>
                <AppButtonEdit @click="openTopicModal(element)"></AppButtonEdit>

                <AppButtonDelete @click="openConfirmDelete(element)"></AppButtonDelete>
              </AppButtonGroup>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <AppModal v-model="topicModal" :size="'lg'">
      <TopicForm v-if="topicModal" :topic="currentTopic.value" :competency-id="competencyId" @close="closeTopicModal"></TopicForm>
    </AppModal>

    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="Indicador de Logro" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import TopicForm from './TopicForm.vue';

import { TopicDto } from '../dtos/topic.dto';

import { DeleteTopicService } from '../services/deleteTopic.service';
import { GetCompetenceByIdService } from '../services/getCompetenceById.service';

const getCompetenceByIdService = new GetCompetenceByIdService();
const deleteTopicService = new DeleteTopicService();

export default defineComponent({
  name: 'TopicsPage',
  components: {
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppLoading,
    AppButton,
    TopicForm,
    AppModal,
  },

  props: ['competencyId'],

  setup(props) {
    const { t } = useI18n();
    const title = 'Temas';

    const modalDelete = ref(false);
    const topicModal = ref(false);
    const loading = ref(true);

    const currentTopic: { value: TopicDto | null } = reactive({
      value: null,
    });
    const topics: { value: TopicDto[] | any } = reactive({
      value: [],
    });
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        await getTopics();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getTopics = async () => {
      let res = await getCompetenceByIdService.run(props.competencyId);
      topics.value = res.topics;
    };

    const openTopicModal = (currentData: TopicDto | null) => {
      currentTopic.value = currentData;
      topicModal.value = true;
    };
    const closeTopicModal = async () => {
      topicModal.value = false;
      await getTopics();
    };

    const openConfirmDelete = async (data: any) => {
      currentDataDelete.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteTopicService.run(currentDataDelete.value.id);
      modalDelete.value = false;

      await getTopics();
    };

    return {
      title,
      t,

      currentTopic,
      modalDelete,
      topicModal,
      loading,
      topics,

      openConfirmDelete,
      closeTopicModal,
      openTopicModal,
      confirmDelete,
    };
  },
});
</script>

<style scoped></style>
