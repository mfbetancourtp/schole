<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <div content class="flex flex-col gap-2.5">
          <h2 class="tw-text-lg tw-font-light">
            {{ t('academicPlanning.academicPeriods.name') }}
          </h2>

          <AppCheckPermission permission="academicPlanning.academicPeriods.create">
            <AppButtonNewContainer @click="openAcademicPeriodModal(null)"></AppButtonNewContainer>
          </AppCheckPermission>
        </div>

        <AppEmptyResponse v-if="!academicPeriods.value.length"></AppEmptyResponse>

        <AppAccordion class="mt-2" v-slot="{ accordionId }">
          <AppAccordionItem :accordion-id="accordionId" v-for="(academicPeriod, index) in academicPeriods.value" :key="index">
            <template v-slot:head>{{ academicPeriod.name }} </template>

            <template v-slot:content>
              <h6 class="tw-text-lg tw-font-light">
                {{ t('academicPlanning.periods.name') }}
              </h6>

              <div :class="{ 'grid-cards': academicPeriod.periods.length }">
                <AppCheckPermission permission="academicPlanning.academicPeriods.create">
                  <AppButtonNewContainer @click="openPeriodModal(academicPeriod, null)"></AppButtonNewContainer>
                </AppCheckPermission>

                <AppEmptyResponse v-if="!academicPeriod.periods.length"></AppEmptyResponse>

                <AppCard v-for="(period, index) in academicPeriod.periods" :key="index">
                  <template #title>
                    <div>{{ period.name }}</div>
                  </template>

                  <template #body>
                    <p class="m-0 semibold">
                      {{ t('academicPlanning.periods.abbreviation') }}:
                      <span class="fw-normal">{{ period.abbreviation }}</span>
                    </p>
                    <p class="m-0 semibold">
                      {{ t('academicPlanning.periods.form_start_date') }}:
                      <span class="fw-normal">{{ period.startDate }}</span>
                    </p>
                    <p class="m-0 semibold">
                      {{ t('academicPlanning.periods.form_end_date') }}:
                      <span class="fw-normal">{{ period.endDate }}</span>
                    </p>
                    <p class="m-0 semibold">
                      {{ t('academicPlanning.periods.form_percent') }}:
                      <span class="fw-normal">{{ period.percent }}</span>
                    </p>

                    <AppCheckPermission permission="academicPlanning.academicPeriods.edit">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="active" :checked="!!period.active" @change="statusUpdate(period)" />

                        <label class="form-check-label" for="active">
                          {{ period.active ? t('academicPlanning.periods.form_active') : t('academicPlanning.periods.form_inactive') }}
                        </label>
                      </div>
                    </AppCheckPermission>
                  </template>

                  <template #footer>
                    <div class="d-flex justify-content-end">
                      <AppButtonGroup>
                        <AppCheckPermission permission="academicPlanning.ExtraordinaryGradePeriods.list">
                          <AppButton
                            variant="primary"
                            outlined
                            icon="book-open"
                            :to="{
                              name: 'academicPlanning.extraordinaryGradePeriods',
                              params: {
                                academicPeriodId: academicPeriod.id,
                                periodId: period.id,
                              },
                            }"
                            v-tooltip="'academicPeriod.Extended'"
                          >
                          </AppButton>
                        </AppCheckPermission>
                        <AppCheckPermission permission="academicPlanning.academicPeriods.edit">
                          <AppButtonEdit @click="openPeriodModal(academicPeriod, period)"></AppButtonEdit>
                        </AppCheckPermission>

                        <AppCheckPermission permission="academicPlanning.academicPeriods.delete">
                          <AppButtonDelete @click="openConfirmDelete('core.generalTerms.academic.period.singular', period)"> </AppButtonDelete>
                        </AppCheckPermission>
                      </AppButtonGroup>
                    </div>
                  </template>
                </AppCard>
              </div>

              <hr />

              <div class="tw-flex tw-justify-end">
                <AppButtonGroup>
                  <AppCheckPermission permission="academicPlanning.academicPeriods.edit">
                    <AppButton
                      label="core.import"
                      outlined
                      :to="{
                        name: 'academicPlanning.menuImportAcademicPeriod',
                        params: { academicPeriodId: academicPeriod.id },
                      }"
                    ></AppButton>
                  </AppCheckPermission>

                  <AppCheckPermission permission="academicPlanning.academicPeriods.edit">
                    <AppButtonEdit @click="openAcademicPeriodModal(academicPeriod)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="academicPlanning.academicPeriods.delete">
                    <AppButtonDelete @click="openConfirmDelete('core.generalTerms.academic.academicPeriod.singular', academicPeriod)" v-if="!academicPeriod.periods.length"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </template>

      <AppModal v-model="academicPeriodModal" :size="'lg'">
        <AcademicPeriodForm
          v-if="academicPeriodModal"
          :data="currentAcademicPeriod.value"
          :calendar-types="calendarTypes"
          :curriculums="curriculums"
          @close="closeAcademicPeriodModal"
        ></AcademicPeriodForm>
      </AppModal>

      <AppModal v-model="periodModal" :size="'lg'">
        <PeriodForm v-if="periodModal" :data="currentPeriod.value" :academic-period-id="academicPeriodId.value" @close="closePeriodModal"></PeriodForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="currentEntity" @confirmDelete="confirmDelete"> </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import PeriodForm from '../components/PeriodForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AcademicPeriodForm from '../components/AcademicPeriodForm.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { CurriculumDto } from '../dtos/curriculum.dto';
import { PeriodDto } from '../dtos/academicPeriods.dto';
import { CalendarTypeDto } from '../dtos/calendarType.dto';
import { AcademicPeriodDto } from '../dtos/academicPeriods.dto';

import { DeletePeriodService } from '../services/deletePeriod.service';
import { CreateOrUpdatePeriodService } from '../services/createOrUpdatePeriod.service';
import { DeleteAcademicPeriodService } from '../services/deleteAcademicPeriod.service';
import { GetAcademicPeriodsWithPeriodsService } from '../services/getAcademicPeriodsWithPeriods.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsWithPeriodsService = new GetAcademicPeriodsWithPeriodsService();
const deleteAcademicPeriodService = new DeleteAcademicPeriodService();
const updatePeriodService = new CreateOrUpdatePeriodService();
const deletePeriodService = new DeletePeriodService();

export default defineComponent({
  name: 'AcademicPeriods',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    AcademicPeriodForm,
    AppCheckPermission,
    AppAccordionItem,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppAccordion,
    AppBaseList,
    AppLoading,
    PeriodForm,
    AppButton,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();

    const title = 'core.menu.academicPeriods';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const currentEntity = ref();

    const loading = ref(true);
    const modalDelete = ref(false);
    const periodModal = ref(false);
    const academicPeriodModal = ref(false);

    const currentAcademicPeriod: { value: AcademicPeriodDto | null } = reactive({
      value: null,
    });
    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });
    const calendarTypes: { value: CalendarTypeDto[] } = reactive({
      value: [],
    });
    const currentPeriod: { value: PeriodDto | null } = reactive({
      value: null,
    });
    const curriculums: { value: CurriculumDto[] } = reactive({
      value: [],
    });
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const academicPeriodId: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        await getData();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getData = async () => {
      const academicPeriodsWithPeriods = await getAcademicPeriodsWithPeriodsService.run();
      academicPeriods.value = academicPeriodsWithPeriods.academicPeriods.sort((a, b) => {
        const numA = parseInt(a.name.split(' ')[0]);
        const numB = parseInt(b.name.split(' ')[0]);

        return numA - numB;
      });
      console.log('acada', academicPeriods.value);

      curriculums.value = academicPeriodsWithPeriods.curriculums;
      calendarTypes.value = academicPeriodsWithPeriods.calendarTypes;
    };

    const openAcademicPeriodModal = (academicPeriod: AcademicPeriodDto | null) => {
      currentAcademicPeriod.value = academicPeriod;
      academicPeriodModal.value = true;
    };
    const closeAcademicPeriodModal = async () => {
      academicPeriodModal.value = false;
      await getData();
    };

    const openPeriodModal = (academicPeriod: AcademicPeriodDto, period: PeriodDto | null) => {
      academicPeriodId.value = academicPeriod.id;
      currentPeriod.value = period;
      periodModal.value = true;
    };
    const closePeriodModal = async () => {
      periodModal.value = false;
      await getData();
    };

    const openConfirmDelete = async (entity: string, data: AcademicPeriodDto | any) => {
      currentDataDelete.value = data;
      currentEntity.value = entity;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentEntity.value === 'core.generalTerms.academic.academicPeriod.singular') {
        await deleteAcademicPeriodService.run(currentDataDelete.value.id);
      } else if (currentEntity.value === 'core.generalTerms.academic.period.singular') {
        await deletePeriodService.run(currentDataDelete.value.id);
      }

      modalDelete.value = false;
      await getData();
    };

    const statusUpdate = async (period: PeriodDto) => {
      try {
        period.active = period.active ? 0 : 1;
        await updatePeriodService.run(period, period.id);
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      closeAcademicPeriodModal,
      openAcademicPeriodModal,
      openConfirmDelete,
      closePeriodModal,
      openPeriodModal,
      confirmDelete,
      statusUpdate,

      academicPeriodModal,
      currentEntity,
      periodModal,
      modalDelete,

      currentAcademicPeriod,
      academicPeriodId,
      academicPeriods,
      currentPeriod,
      calendarTypes,
      curriculums,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}

.semibold {
  font-weight: 500;
}
</style>
