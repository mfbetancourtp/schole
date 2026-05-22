<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="academicPrograms.ratingScales.create">
        <AppButton style="color: white" :to="{ name: 'academicPrograms.ratingScaleCreate' }" :label="'core.newFemale'"> </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppEmptyResponse v-if="!ratingScales.length" :show-image="true"></AppEmptyResponse>

        <div v-else class="grid-cards">
          <AppCard v-for="(ratingScale, index) in ratingScales" :key="index">
            <template #title>
              <div>{{ ratingScale.title }}</div>
            </template>

            <template #body>
              <p>{{ ratingScale.description }}</p>
            </template>

            <template #footer>
              <div class="d-flex justify-content-end">
                <AppButtonGroup>
                  <AppCheckPermission permission="academicPrograms.ratingScales.edit">
                    <AppButtonEdit
                      :to="{
                        name: 'academicPrograms.ratingScaleEdit',
                        params: { ratingScaleId: ratingScale.id },
                      }"
                    ></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="academicPrograms.ratingScales.delete">
                    <AppButtonDelete @click="openConfirmDelete(ratingScale)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="Escala de Valoración" @confirmDelete="confirmDelete"> </AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { RatingScaleDto } from '../dtos/ratingScale.dto';

import { GetRatingScalesService } from '../services/getRatingScales.service';
import { DeleteRatingScaleByIdService } from '../services/deleteRatingScaleById.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteRatingScaleByIdService = new DeleteRatingScaleByIdService();
const getRatingScalesService = new GetRatingScalesService();

export default defineComponent({
  name: 'RatingScales',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();

    const title = 'Escalas de valoración';
    const routes = [{ name: title }];
    useMeta({ title: title });

    const currentRatingScale: Ref<RatingScaleDto | null> = ref(null);
    const ratingScales: Ref<RatingScaleDto[]> = ref([]);

    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Estructura Académica', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        await getData();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getData = async () => {
      loading.value = true;

      try {
        ratingScales.value = await getRatingScalesService.run();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    };

    const openConfirmDelete = (data: RatingScaleDto) => {
      currentRatingScale.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentRatingScale.value) {
          await deleteRatingScaleByIdService.run(currentRatingScale.value.id);
          currentRatingScale.value = null;

          await getData();
        }
      } catch (e) {
        console.log('error', e);
      }

      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      ratingScales,
      modalDelete,

      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  padding: 10px;
}
</style>
