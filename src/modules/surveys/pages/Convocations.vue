<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton
        v-if="institutionId"
        style="color: white"
        label="surveys.convocations.publicConvocations"
        :to="{
          name: 'surveys.userConvocations',
          params: { institutionId: institutionId },
          query: { backURL: `surveys.convocationsList` },
        }"
      ></AppButton>
      <AppCheckPermission permission="surveys.convocations.create">
        <AppButton
          style="color: white"
          label="core.new"
          :to="{
            name: 'surveys.convocationsCreate',
            query: { academicPeriodId: currentAcademicPeriodId },
          }"
        ></AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppCard>
        <template #body>
          <div class="row">
            <div class="col-sm-12">
              <AppFilter v-model="currentAcademicPeriodId" filter-name="convocations.academicPeriodId" @isNotInitialized="notFilterAcademicPeriodId">
                <label for="academicPeriodId">Periodo académico</label>
                <v-select input-id="academicPeriodId" :options="academicPeriods" label="name" :reduce="(academicPeriod: any) => academicPeriod.id" v-model="currentAcademicPeriodId"> </v-select>
              </AppFilter>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppLoading v-if="loadingConvocations"></AppLoading>
              <AppEmptyResponse v-else-if="!convocations.length" :show-image="true"></AppEmptyResponse>
              <template v-else>
                <div class="items">
                  <AppCard v-for="convocation in convocations" :key="convocation.id" :image="convocation.thumbnail">
                    <template #body>
                      <h1 class="h5 lead tw-line-clamp-2">
                        {{ convocation.title }}
                      </h1>
                      <p class="tw-line-clamp-3">{{ convocation.levelName }}</p>
                      <span
                        >Inscritos:
                        <AppBadge :variant="primary" :label="convocation.cantEnrolls"></AppBadge>
                      </span>
                    </template>
                    <template #footer>
                      <div class="d-flex justify-content-between gap-1">
                        <AppCheckPermission permission="surveys.convocations.edit">
                          <div class="d-flex">
                            <AppButton
                              variant="primary"
                              outlined
                              icon="cog"
                              :to="{
                                name: 'surveys.convocationStepsList',
                                params: { convocationId: convocation.id },
                              }"
                              v-tooltip="'Configurar pasos'"
                            ></AppButton>
                            <AppButton
                              outlined
                              variant="primary"
                              class="ms-1"
                              icon="clipboard-list"
                              v-tooltip="'Resumen de Inscritos'"
                              :to="{
                                name: 'surveys.previewInscritos',
                                params: { convocationId: convocation.id },
                              }"
                            ></AppButton>
                          </div>
                        </AppCheckPermission>
                        <div class="d-flex justify-content-end gap-1">
                          <AppCheckPermission permission="surveys.convocations.edit">
                            <AppButtonEdit
                              :to="{
                                name: 'surveys.convocationsEdit',
                                params: { convocationId: convocation.id },
                              }"
                            ></AppButtonEdit>
                          </AppCheckPermission>

                          <AppCheckPermission permission="surveys.convocations.delete">
                            <AppButtonDelete @click="openModalDelete(convocation)"></AppButtonDelete>
                          </AppCheckPermission>
                        </div>
                      </div>
                    </template>
                  </AppCard>
                </div>
              </template>
            </div>
          </div>
          <AppModal v-model="modalDelete">
            <AppConfirmDeleteModal v-if="modalDelete" entity="Proceso de matriculación" @confirmDelete="deleteConvocation" @close="modalDelete = false"></AppConfirmDeleteModal>
          </AppModal>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { GetConvocationsService } from '../services/getConvocations.service';
import { ConvocationWithStepsDto } from '../dtos/convocation.dto';
import { DeleteConvocationService } from '../services/deleteConvocation.service';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsService = new GetAcademicPeriodsService();
const getConvocationsService = new GetConvocationsService();
const deleteConvocationService = new DeleteConvocationService();
const institutionsService = new InstitutionsService();

export default defineComponent({
  name: 'ConvocationsPage',
  components: {
    AppButton,
    AppFilter,
    AppConfirmDeleteModal,
    AppModal,
    AppButtonDelete,
    AppCheckPermission,
    AppButtonEdit,
    AppEmptyResponse,
    AppLoading,
    AppCard,
    AppBaseList,
    AppBadge,
  },
  setup() {
    const title = 'Configuración y procesos de admisión';
    const routes = [
      {
        name: title,
      },
    ];

    useMeta({
      title,
    });

    const loading = ref(true);
    const institutionId = ref();
    const loadingConvocations = ref(true);
    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const currentAcademicPeriodId: Ref<any | null> = ref(null);
    const convocations: Ref<ConvocationWithStepsDto[]> = ref([]);
    const activeAcademicPeriods = ref([]);

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      const allAcademicPeriods: any = await getAcademicPeriodsService.run();
      activeAcademicPeriods.value = allAcademicPeriods.filter((period: any) => period.active === 1);

      let institution: any = await institutionsService.getSelectedInstitution();
      institutionId.value = institution.id;

      if (activeAcademicPeriods.value.length > 0) {
        currentAcademicPeriodId.value = activeAcademicPeriods.value[0].id;
      }

      loading.value = false;
    });

    const notFilterAcademicPeriodId = () => {
      if (academicPeriods.value.length) {
        currentAcademicPeriodId.value = academicPeriods.value[0].id;
      }
    };

    watch(currentAcademicPeriodId, async () => {
      await getConvocations();
    });

    const getConvocations = async () => {
      if (!currentAcademicPeriodId.value) return;
      loadingConvocations.value = true;
      try {
        convocations.value = await getConvocationsService.run(currentAcademicPeriodId.value);
      } catch (e) {
        console.log(e);
      }
      loadingConvocations.value = false;
    };

    const modalDelete = ref(false);
    const currentConvocation = ref();

    const openModalDelete = (convocation: ConvocationWithStepsDto) => {
      currentConvocation.value = convocation;
      modalDelete.value = true;
    };

    const deleteConvocation = async () => {
      if (!currentConvocation.value) return;

      try {
        await deleteConvocationService.run(currentConvocation.value.id);
        await closeModalDelete();
      } catch (e) {
        console.log(e);
      }
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getConvocations();
    };

    return {
      title,
      routes,
      loading,
      currentAcademicPeriodId,
      convocations,
      loadingConvocations,
      modalDelete,
      openModalDelete,
      closeModalDelete,
      deleteConvocation,
      notFilterAcademicPeriodId,
      institutionId,
      academicPeriods: activeAcademicPeriods,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
}
</style>
