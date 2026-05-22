<template>
  <section class="d-flex justify-content-between align-items-center">
    <h5 class="m-0">Detalles de escala de valoración</h5>

    <AppButton label="core.newFemale" @click="openRatingScalesDetailFormModal()"></AppButton>
  </section>
  <div class="table-container">

  <table class="table responsive-table">
    <thead>
      <tr>
        <th class="col-2">Abreviatura</th>
        <th>Descripción</th>
        <th class="col-2">Valor Mínimo</th>
        <th class="col-2">Valor Máximo</th>
        <th>Opciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-if="loading">
        <td colspan="5">
          <AppLoading v-if="loading"></AppLoading>
        </td>
      </tr>
      <tr v-if="!loading && !ratingScaleDetails.length">
        <td colspan="5">
          <AppEmptyResponse :size="'xs'" :show-image="false"></AppEmptyResponse>
        </td>
      </tr>
      <tr v-else v-for="(detail, index) in ratingScaleDetails" :key="index">
        <td>{{ detail.abbreviation }}</td>
        <td>{{ detail.description }}</td>
        <td>{{ detail.minimumValue }}</td>
        <td>{{ detail.maximumValue }}</td>

        <td>
          <AppButtonGroup>
            <AppButton v-tooltip="'Ver imagen'" :href="detail.urlImage" :target="'_blank'" icon="image" outlined :disabled="!detail.urlImage"></AppButton>

            <AppButtonEdit @click="openRatingScalesDetailFormModal(detail)"></AppButtonEdit>

            <AppButtonDelete @click="openConfirmDelete(detail)"></AppButtonDelete>
          </AppButtonGroup>
        </td>
      </tr>
    </tbody>
  </table>
  </div>
  <AppModal v-model="ratingScaleDetailForm">
    <RatingScalesDetailForm v-if="ratingScaleDetailForm" :data="currentRatingScaleDetail" :rating-scale-id="ratingScaleId" @close="closeRatingScalesDetailFormModal"></RatingScalesDetailForm>
  </AppModal>

  <AppModal v-model="modalDelete">
    <AppConfirmDeleteModal v-if="modalDelete" entity="detalle de escala de valoración" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RatingScalesDetailForm from './RatingScalesDetailForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { DetailDto } from '../dtos/ratingScale.dto';

import { GetRatingScaleByIdService } from '../services/getRatingScaleById.service';
import { DeleteRatingScaleDetailByIdService } from '../services/deleteRatingScaleDetailById.service';

const deleteRatingScaleDetailByIdService = new DeleteRatingScaleDetailByIdService();
const getRatingScaleByIdService = new GetRatingScaleByIdService();

export default defineComponent({
  name: 'RatingScalesDetails',
  components: {
    RatingScalesDetailForm,
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppLoading,
    AppButton,
    AppModal,
  },

  props: {
    ratingScaleId: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();

    const currentRatingScaleDetail: Ref<DetailDto | null> = ref(null);
    const ratingScaleDetails: Ref<DetailDto[]> = ref([]);

    const ratingScaleDetailForm = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      await getData();
    });

    const getData = async () => {
      loading.value = true;

      try {
        let ratingScale = await getRatingScaleByIdService.run(props.ratingScaleId);
        ratingScaleDetails.value = ratingScale.details;
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    };

    const openRatingScalesDetailFormModal = (data: DetailDto | null = null) => {
      currentRatingScaleDetail.value = data;
      ratingScaleDetailForm.value = true;
    };
    const closeRatingScalesDetailFormModal = async () => {
      await getData();

      ratingScaleDetailForm.value = false;
    };

    const openConfirmDelete = (data: DetailDto) => {
      currentRatingScaleDetail.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentRatingScaleDetail.value) {
          await deleteRatingScaleDetailByIdService.run(currentRatingScaleDetail.value.id);
          currentRatingScaleDetail.value = null;

          await getData();
        }
      } catch (e) {
        console.log('error', e);
      }

      modalDelete.value = false;
    };

    return {
      loading,
      t,

      currentRatingScaleDetail,
      ratingScaleDetailForm,
      ratingScaleDetails,
      modalDelete,

      closeRatingScalesDetailFormModal,
      openRatingScalesDetailFormModal,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.table-container {
  max-height: 400px; /* Ajusta la altura según necesites */
  overflow-y: auto; /* Activa el scroll vertical si el contenido excede la altura */
  overflow-x: auto; /* Activa el scroll horizontal si la tabla es ancha */
  scrollbar-gutter: stable; /* Reserva espacio para la scrollbar */
}
.responsive-table {
  min-width: 100%;
  /* Si es necesario, puedes ajustar el table-layout:
     table-layout: fixed;
  */
}</style>
