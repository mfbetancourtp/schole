<template>
  <form @submit.prevent="saveWeightCategoriesForm">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <table class="table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th class="col-3">Porcentaje</th>
              <th class="col-1">Opc</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in dataTable" :key="index">
              <td>{{ item.nameCategory }}</td>
              <td>
                <input v-model="item.percent" class="form-control" type="number" min="0" />
              </td>
              <td>
                <AppButtonDelete v-if="item.learningOutcomesActivityCategoryId" @click="openConfirmDelete(item)"></AppButtonDelete>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>

    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="Configuración" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
    </AppModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { LevelDto } from '../dtos/level.dto';

import { DeleteLearOutcActiCateService } from '../services/deleteLearOutcActiCate.service';
import { PostLearOutcActiCateFromArrayService } from '../services/postLearOutcActiCateFromArray.service';
import { GetCategoriesConfiguredByIndicatorService } from '../services/getCategoriesConfiguredByIndicator.service';

const getCategoriesConfiguredByIndicatorService = new GetCategoriesConfiguredByIndicatorService();
const postLearOutcActiCateFromArrayService = new PostLearOutcActiCateFromArrayService();
const deleteLearOutcActiCateService = new DeleteLearOutcActiCateService();

export default defineComponent({
  name: 'WeightCategoriesForm',
  components: {
    AppFormModal,
    AppButton,
    AppButtonDelete,
    AppModal,
    AppConfirmDeleteModal,
  },

  emits: ['close'],
  props: {
    learningOutcome: {
      type: Object as PropType<any>,
      required: true,
    },
    competencyId: {
      type: Number,
      required: true,
    },
    level: {
      type: Object as PropType<LevelDto>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Peso de las categorías';
    const learningOutcome = props.learningOutcome ?? null;
    const courseId = parseInt(route.params.courseId.toString(), 10);

    const currentData: Ref<any> = ref(null);
    const dataTable: Ref<any[]> = ref([]);

    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        dataTable.value = await getCategoriesConfiguredByIndicatorService.run(courseId, learningOutcome.id);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const openConfirmDelete = async (data: any) => {
      currentData.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteLearOutcActiCateService.run(currentData.value.learningOutcomesActivityCategoryId);

      dataTable.value = await getCategoriesConfiguredByIndicatorService.run(courseId, learningOutcome.id);

      modalDelete.value = false;
    };

    const saveWeightCategoriesForm = async () => {
      if (!dataTable.value.length) return;

      try {
        await postLearOutcActiCateFromArrayService.run(dataTable.value);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      t,

      modalDelete,
      dataTable,
      emit,
      saveWeightCategoriesForm,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped></style>
