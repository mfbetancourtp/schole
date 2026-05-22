<template>
  <div  >
    <section class="d-flex align-items-center justify-content-between">
      <span class="fs-5">{{ title }}</span>

      <AppButton :size="'sm'" variant="primary" label="core.newMale" @click="openLearningOutcomeModal(null)"></AppButton>
    </section>

    <AppLoading v-if="loading"></AppLoading>
    <section v-else>
      <table class="table">
        <thead>
          <tr>
            <th>
              {{ t('classroom.activitiesClassification.form.abbreviation') }}
            </th>
            <th>{{ t('access.roles.form.description') }}</th>
            <th class="w-25">{{ t('classroom.homeTeacher.options') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!learningOutcomes.value.length">
            <td colspan="3">
              <AppEmptyResponse> </AppEmptyResponse>
            </td>
          </tr>
          <tr v-for="(element, index) in learningOutcomes.value" :key="index">
            <td>{{ element.code }}</td>
            <td>{{ element.description }}</td>
            <td>
              <AppButtonGroup>
                <AppButtonEdit @click="openLearningOutcomeModal(element)"></AppButtonEdit>

                <AppButtonDelete @click="openConfirmDelete(element)"></AppButtonDelete>
                <AppButton
                  v-if="level.usePercentLearningOutcomesWithActivityCategories"
                  @click="openWeightCategoriesModal(element)"
                  v-tooltip="'Peso de las categorías'"
                  icon="clipboard-list"
                  outlined
                ></AppButton>
              </AppButtonGroup>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <AppModal v-model="learningOutcomeModal">
      <LearningOutcomeForm
        v-if="learningOutcomeModal"
        :learning-outcome="currentLearningOutcome.value"
        :competency-id="competencyId"
        :level="level"
        @close="closeLearningOutcomeModal"
      ></LearningOutcomeForm>
    </AppModal>

    <AppModal v-model="weightCategoriesModal" :size="'lg'">
      <WeightCategoriesForm
        v-if="weightCategoriesModal"
        :learning-outcome="currentLearningOutcome.value"
        :competency-id="competencyId"
        :level="level"
        @close="closeWeightCategoriesModal"
      ></WeightCategoriesForm>
    </AppModal>

    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="Desempeño" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import WeightCategoriesForm from './WeightCategoriesForm.vue';

import LearningOutcomeForm from './LearningOutcomeForm.vue';

import { LearningOutcomeDto } from '../dtos/learningOutcome .dto';
import { LevelDto } from '../dtos/level.dto';

import { GetCompetenceByIdService } from '../services/getCompetenceById.service';
import { DeleteLearningOutComesService } from '../services/deleteLearningOutComes.service';

const deleteLearningOutComesService = new DeleteLearningOutComesService();
const getCompetenceByIdService = new GetCompetenceByIdService();

export default defineComponent({
  name: 'LearningOutcomes',
  components: {
    WeightCategoriesForm,
    AppConfirmDeleteModal,
    LearningOutcomeForm,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppLoading,
    AppButton,
    AppModal,
  },

  props: {
    competencyId: {
      type: Number,
      required: true,
    },
    level: {
      type: Object as PropType<LevelDto>,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const title = 'Desempeños';
    const competencyId = props.competencyId ?? null;

    const learningOutcomeModal = ref(false);
    const weightCategoriesModal = ref(false);

    const modalDelete = ref(false);
    const loading = ref(true);

    const currentLearningOutcome: { value: LearningOutcomeDto | null } = reactive({
      value: null,
    });
    const learningOutcomes: { value: LearningOutcomeDto[] | any } = reactive({
      value: [],
    });
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        await getLearningOutcomes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getLearningOutcomes = async () => {
      let res = await getCompetenceByIdService.run(competencyId);
      learningOutcomes.value = res.LearningOutcomes;
    };

    const openLearningOutcomeModal = (currentData: LearningOutcomeDto | null) => {
      currentLearningOutcome.value = currentData;
      learningOutcomeModal.value = true;
    };
    const closeLearningOutcomeModal = async () => {
      learningOutcomeModal.value = false;
      await getLearningOutcomes();
    };

    const openWeightCategoriesModal = (currentData: LearningOutcomeDto | null) => {
      currentLearningOutcome.value = currentData;
      weightCategoriesModal.value = true;
    };
    const closeWeightCategoriesModal = async () => {
      weightCategoriesModal.value = false;
      await getLearningOutcomes();
    };

    const openConfirmDelete = async (data: any) => {
      currentDataDelete.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteLearningOutComesService.run(currentDataDelete.value.id);
      modalDelete.value = false;

      await getLearningOutcomes();
    };

    return {
      title,
      t,

      currentLearningOutcome,
      learningOutcomeModal,
      learningOutcomes,
      modalDelete,
      loading,

      closeLearningOutcomeModal,
      openLearningOutcomeModal,
      openWeightCategoriesModal,
      weightCategoriesModal,
      closeWeightCategoriesModal,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped></style>
