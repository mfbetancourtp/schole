<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="academicPlanning.specialists.create">
        <AppButton style="color: white" variant="primary" @click="openNewSpecialistFormModal()" label="core.new"></AppButton>
      </AppCheckPermission>
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <div class="tw-flex tw-justify-end">
          <div class="mb-3 tw-w-full md:tw-w-72">
            <label for="academicPeriodId">{{ t('core.generalTerms.academic.academicPeriod.singular') }}</label>

            <v-select
              input-id="academicPeriodId"
              class="bg-white"
              v-model="academicPeriodId"
              :options="academicPeriods.value"
              label="name"
              :reduce="(academicPeriod: any) => academicPeriod.id"
              @option:selected="getSpecialists(academicPeriodId)"
            ></v-select>
          </div>
        </div>

        <AppLoading v-if="loadingSpecialists"></AppLoading>

        <div v-else>
          <AppEmptyResponse v-if="!specialists.value.length" :show-image="false"></AppEmptyResponse>

          <AppAccordion class="mt-2" v-slot="{ accordionId }">
            <AppAccordionItem :accordion-id="accordionId" v-for="specialist in specialists.value" :key="specialist.id" @open="getAreasBySpecialistId(specialist.id)">
              <template v-slot:head> {{ specialist.names }} {{ specialist.lastnames }} </template>

              <template v-slot:content>
                <AppLoading v-if="loadingAreasBySpecialis"></AppLoading>
                <div v-else class="table-container">

                <table  class="table responsive-table table-hover table-bordered">
                  <thead>
                    <tr>
                      <th>
                        {{ t('core.generalTerms.academic.area.singular') }}
                      </th>
                      <th>
                        {{ t('core.generalTerms.academic.level.singular') }}
                      </th>
                      <th>
                        {{ t('core.generalTerms.academic.degree.singular') }}
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!areas.value.length">
                      <td colspan="4">
                        <AppEmptyResponse v-if="!areas.value.length" :show-image="false"></AppEmptyResponse>
                      </td>
                    </tr>
                    <tr v-for="item in areas.value" :key="item.id">
                      <td>{{ item.area.name }}</td>
                      <td>{{ item.level.name }}</td>
                      <td>{{ item.degree.name }}</td>
                      <td>
                        <AppButtonGroup size="sm">
                          <AppCheckPermission permission="academicPlanning.specialists.edit">
                            <AppButtonEdit @click="openEditSpecialistFormModal(specialist, item)"></AppButtonEdit>
                          </AppCheckPermission>

                          <AppCheckPermission permission="academicPlanning.specialists.delete">
                            <AppButtonDelete @click="openConfirmDelete(item)"></AppButtonDelete>
                          </AppCheckPermission>
                        </AppButtonGroup>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
                <div class="tw-flex tw-justify-end">
                  <AppCheckPermission permission="academicPlanning.specialists.create">
                    <AppButton variant="primary" @click="openNewSpecialistFormModal(specialist)" label="core.new"></AppButton>
                  </AppCheckPermission>
                </div>
              </template>
            </AppAccordionItem>
          </AppAccordion>
        </div>
      </div>

      <AppModal v-model="newSpecialistModal">
        <CreateSpecialistsForm
          v-if="newSpecialistModal"
          :academic-period-id="academicPeriodId"
          :specialist-user="specialistUser.value"
          :areas="relatedDataForm.value.areas"
          :levels="relatedDataForm.value.levels"
          :degrees="relatedDataForm.value.degrees"
          @close="closeNewSpecialistFormModal"
        ></CreateSpecialistsForm>
      </AppModal>

      <AppModal v-model="editSpecialistModal">
        <EditSpecialistsForm
          v-if="editSpecialistModal"
          :academic-period-id="academicPeriodId"
          :data="dataEdit.value"
          :areas="relatedDataForm.value.areas"
          :levels="relatedDataForm.value.levels"
          :degrees="relatedDataForm.value.degrees"
          @close="closeEditSpecialistFormModal"
        ></EditSpecialistsForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="core.generalTerms.academic.specialist.singular" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';

import EditSpecialistsForm from '../components/EditSpecialists.vue';
import CreateSpecialistsForm from '../components/CreateSpecialists.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { AcademicPeriodGroupsRelatedDataFormDto } from '../dtos/academicPeriodGroupsRelatedDataForm.dto';

import { DeleteSpecialistService } from '../services/deleteSpecialist.service';
import { GetRelatedDataSpecialistsService } from '../services/getRelatedDataSpecialists.service';
import { GetSpecialistsByAcademicPeriodService } from '../services/getSpecialistsByAcademicPeriod.service';
import { GetAreasByAcademicPeriodAndSpecialistIdService } from '../services/getAreasByAcademicPeriodAndSpecialistId.service';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

const getAreasByAcademicPeriodAndSpecialistIdService = new GetAreasByAcademicPeriodAndSpecialistIdService();
const getSpecialistsByAcademicPeriodService = new GetSpecialistsByAcademicPeriodService();
const getRelatedDataSpecialistsService = new GetRelatedDataSpecialistsService();
const deleteSpecialistService = new DeleteSpecialistService();

export default defineComponent({
  name: 'SpecialistsPage',
  components: {
    AppButton,
    AppButtonGroup,
    CreateSpecialistsForm,
    AppConfirmDeleteModal,
    EditSpecialistsForm,
    AppCheckPermission,
    AppAccordionItem,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonEdit,
    AppAccordion,
    AppBaseList,
    AppLoading,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const title = 'core.generalTerms.academic.specialist.singular';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const loadingAreasBySpecialis = ref(false);
    const editSpecialistModal = ref(false);
    const loadingSpecialists = ref(false);
    const newSpecialistModal = ref(false);
    const currentSpecialistId = ref();
    const modalDelete = ref(false);
    const academicPeriodId = ref();
    const loading = ref(true);

    const relatedDataForm: {
      value: AcademicPeriodGroupsRelatedDataFormDto | any;
    } = reactive({
      value: null,
    });
    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const specialistUser: { value: any } = reactive({
      value: null,
    });
    const specialists: { value: any[] } = reactive({
      value: [],
    });
    const areas: { value: any[] } = reactive({
      value: [],
    });
    const dataEdit: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        relatedDataForm.value = await getRelatedDataSpecialistsService.run();

        academicPeriods.value = relatedDataForm.value?.academicPeriods;
        academicPeriodId.value = academicPeriods.value[0].id;

        await getSpecialists(academicPeriodId.value);
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getSpecialists = async (currentAcademicPeriodId: number) => {
      loadingSpecialists.value = true;

      academicPeriodId.value = currentAcademicPeriodId;
      specialists.value = await getSpecialistsByAcademicPeriodService.run(academicPeriodId.value);

      loadingSpecialists.value = false;
    };

    const getAreasBySpecialistId = async (specialistId: number) => {
      loadingAreasBySpecialis.value = true;

      areas.value = await getAreasByAcademicPeriodAndSpecialistIdService.run(academicPeriodId.value, specialistId);

      loadingAreasBySpecialis.value = false;
    };

    const openNewSpecialistFormModal = (speUser: any = null) => {
      specialistUser.value = null;

      if (speUser) {
        currentSpecialistId.value = speUser.id;
        specialistUser.value = {
          id: speUser.id,
          name: `${speUser.names} ${speUser.lastnames}`,
        };
      } else {
        currentSpecialistId.value = null;
      }

      newSpecialistModal.value = true;
    };
    const closeNewSpecialistFormModal = async () => {
      newSpecialistModal.value = false;
      await getSpecialists(academicPeriodId.value);
    };

    const openEditSpecialistFormModal = (speUser: any = null, data: any) => {
      data.specialistUser = {
        id: speUser.id,
        name: `${speUser.names} ${speUser.lastnames}`,
      };
      data.academicPeriodId = academicPeriodId.value;

      dataEdit.value = data;

      editSpecialistModal.value = true;
    };
    const closeEditSpecialistFormModal = async () => {
      editSpecialistModal.value = false;
      await getSpecialists(academicPeriodId.value);
    };

    const openConfirmDelete = async (data: any) => {
      currentDataDelete.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteSpecialistService.run(currentDataDelete.value.id);
      modalDelete.value = false;

      await getSpecialists(academicPeriodId.value);
    };

    return {
      t,
      loading,
      routes,
      title,

      loadingAreasBySpecialis,
      editSpecialistModal,
      loadingSpecialists,
      newSpecialistModal,
      academicPeriodId,
      academicPeriods,
      relatedDataForm,
      specialistUser,
      modalDelete,
      specialists,
      dataEdit,
      areas,

      closeEditSpecialistFormModal,
      closeNewSpecialistFormModal,
      openEditSpecialistFormModal,
      openNewSpecialistFormModal,
      getAreasBySpecialistId,
      openConfirmDelete,
      getSpecialists,
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
