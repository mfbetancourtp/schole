<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppCheckPermission permission="academicPlanning.academicOffer.create">
        <AppButton
          style="color: white"
          :to="{
            name: 'academicPlanning.academicOffer.importTemplateAcademicOffer',
            query: {
              academicPeriodId: academicPeriodId,
            },
          }"
          label="Importar"
        ></AppButton>
        <AppButton style="color: white" variant="primary" label="core.new" @click="openAcademicOfferFormModal(null)" :disabled="!academicPeriodId"></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
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
              :clearable="false"
            ></v-select>
          </div>
        </div>

        <AppLoading v-if="loadingAcademicPeriodGroups"></AppLoading>

        <div v-else>
          <AppEmptyResponse v-if="!academicPeriodGroups.value.length" :show-image="true"></AppEmptyResponse>

          <AppAccordion class="mt-2" v-slot="{ accordionId }">
            <AppAccordionItem :accordion-id="accordionId" v-for="academicPeriodGroup in academicPeriodGroups.value" :key="academicPeriodGroup.id">
              <template v-slot:head>
                {{ academicPeriodGroup.journey.name }} -
                {{ academicPeriodGroup.degree.level.name }}
              </template>

              <template v-slot:content>
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr style="background-color: #ccc">
                        <th>
                          {{ t('core.generalTerms.academic.groupDirector.singular') }}
                        </th>
                        <th>
                          {{ t('core.generalTerms.academic.degree.singular') }}
                        </th>
                        <th>
                          {{ t('core.generalTerms.academic.group.singular') }}
                        </th>
                        <th>Cupo</th>
                        <th>Receso</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-if="loadingCourse">
                        <td colspan="5">
                          <AppLoading v-if="loadingCourse"></AppLoading>
                        </td>
                      </tr>
                      <tr class="fila-intermedia" v-else v-for="course in academicPeriodGroup.courses" :key="course.id">
                        <td>
                          <button class="btn rounded-pill p-0 hover" v-tooltip="'core.edit core.generalTerms.academic.groupDirector.singular'" @click="openEditGroupDirectorModal(course)">
                            <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                              <AppAvatar :size="'sm'" :name="course.directorPeople?.names ?? '?'"></AppAvatar>

                              <div class="tw-min-w-0 tw-ml-4">
                                <div v-if="!course.directorPeopleId">Sin Asignar</div>

                                <div v-if="course.directorPeopleId">
                                  <div class="tw-font-medium tw-leading-5 tw-truncate">
                                    {{ course.directorPeople?.names }}
                                  </div>
                                  <div class="tw-leading-5 tw-truncate tw-font-light">
                                    {{ course.directorPeople?.lastnames }}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        </td>
                        <td class="text-center">{{ course.degree.name }}</td>
                        <td class="text-center">{{ course.group.name }}</td>
                        <td class="text-center">
                          <AppButton @click="openEditQuotaModal(course)">
                            {{ course.quota }}
                          </AppButton>
                        </td>
                        <td class="text-center">
                          <AppButton class="button-playTime" @click="openEditPlayTimesModal(course, academicPeriodGroup)" v-tooltip="'Editar o Eliminar recesos'">
                            <AppGetIcon name="attendaceTime"></AppGetIcon>
                          </AppButton>
                        </td>
                        <td class="text-center">
                          <AppButtonGroup size="sm">
                            <AppCheckPermission permission="academicPlanning.subjectAssignments.list">
                              <AppButton
                                variant="primary"
                                outlined
                                icon="book-open"
                                :to="{
                                  name: 'academicPlanning.subjectAssignments',
                                  params: { academicPeriodGroupId: course.id },
                                }"
                                v-tooltip="'academicPlanning.subjectAssignments.title'"
                              >
                              </AppButton>
                            </AppCheckPermission>

                            <AppCheckPermission permission="academicPlanning.academicOffer.create">
                              <AppButton variant="primary" outlined icon="users" v-tooltip="'core.generalTerms.academic.coordinator'" @click="openEditSupervisorsModal(course)"> </AppButton>
                            </AppCheckPermission>

                            <AppCheckPermission permission="academicPlanning.academicOffer.delete">
                              <AppButtonDelete @click="openConfirmDelete(course)"></AppButtonDelete>
                            </AppCheckPermission>
                          </AppButtonGroup>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr />
                <div class="tw-flex tw-justify-between">
                  <div>
                    <AppCheckPermission permission="academicPlanning.academicOffer.create">
                      <AppButton variant="primary" @click="redirectActivitiesClassificationLevel(academicPeriodGroup)" v-tooltip="'classroom.activitiesClassification.name'">
                        <AppGetIcon name="classification" fillColor="var(--color-primary)" />
                      </AppButton>
                    </AppCheckPermission>
                  </div>
                  <div>
                    <AppButtonGroup size="sm">
                      <AppCheckPermission permission="academicPlanning.academicOffer.create">
                        <AppButton variant="primary" outlined icon-left="plus" @click="openAssignSupervisorModal(academicPeriodGroup)" label="core.generalTerms.academic.coordinator"></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicPlanning.academicOffer.create">
                        <AppButton variant="primary" outlined icon-left="plus" @click="openAcademicOfferFormModal(academicPeriodGroup)" label="core.generalTerms.academic.journey.singular"></AppButton>
                      </AppCheckPermission>
                    </AppButtonGroup>
                  </div>
                </div>
              </template>
            </AppAccordionItem>
          </AppAccordion>
        </div>

        <AppModal v-model="academicPeriodModal">
          <AcademicOfferForm
            v-if="academicPeriodModal"
            :related-data-form="relatedDataForm.value"
            :academic-period-group-id="academicPeriodId"
            :academic-period="currentAcademicPeriod.value"
            @close="closeAcademicOfferFormModal"
          ></AcademicOfferForm>
        </AppModal>

        <AppModal v-model="academicPeriodGroupModal">
          <AssignSupervisorsForm v-if="academicPeriodGroupModal" :academic-period-group="currentAcademicPeriodGroup.value" @close="closeAssignSupervisorModal"></AssignSupervisorsForm>
        </AppModal>

        <AppModal v-model="editGroupDirectorModal">
          <EditGroupDirectorForm v-if="editGroupDirectorModal" :academic-period-group="currentAcademicPeriodGroup.value" @close="closeEditGroupDirectorModal"></EditGroupDirectorForm>
        </AppModal>

        <AppModal v-model="editSupervisorsModal">
          <EditSupervisorsForm v-if="editSupervisorsModal" :academic-period-group="currentAcademicPeriodGroup.value" @close="closeEditSupervisorsModal"></EditSupervisorsForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="core.menu.academicOffer" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
        </AppModal>

        <AppModal v-model="editQuotaModal">
          <EditQuotaForm v-if="editQuotaModal" :academic-period-group="currentAcademicPeriodGroup.value" @close="closeEditQuotaModal"></EditQuotaForm>
        </AppModal>

        <AppModal v-model="editPlayTimesModal" size="lg">
          <EditPlayTimesForm
            v-if="editPlayTimesModal"
            :academicPeriodGroup="currentAcademicPeriodGroup.value"
            :dataPlayTimes="playTimes"
            :academicPeriodGroupId="academicPeriodGroupsId"
            :related-data-form="relatedDataForm.value"
            :academic-period="currentAcademicPeriod.value"
            @close="closeEditPlayTimesModal"
          ></EditPlayTimesForm>
        </AppModal>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { AcademicPeriodGroupsRelatedDataFormDto } from '../dtos/academicPeriodGroupsRelatedDataForm.dto';

import AcademicOfferForm from '../components/AcademicOfferForm.vue';
import EditSupervisorsForm from '../components/editSupervisorsForm.vue';
import AssignSupervisorsForm from '../components/AssignSupervisors.vue';
import EditGroupDirectorForm from '../components/editGroupDirectorForm.vue';
import EditQuotaForm from '../components/EditQuotaForm.vue';
import EditPlayTimesForm from '../components/EditPlayTimeForm.vue';

import { GetAcademicPeriodGroupsService } from '../services/getAcademicPeriodGroups.service';
import { DeleteAcademicPeriodGroupsService } from '../services/deleteAcademicPeriodGroups.service';
import { GetAcademicPeriodGroupsRelatedDataFormService } from '../services/getAcademicPeriodGroupsRelatedDataForm.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import { useRouter } from 'vue-router';

const getAcademicPeriodGroupsRelatedDataFormService = new GetAcademicPeriodGroupsRelatedDataFormService();
const deleteAcademicPeriodGroupsService = new DeleteAcademicPeriodGroupsService();
const getAcademicPeriodGroupsService = new GetAcademicPeriodGroupsService();

export default defineComponent({
  name: 'AcademicOffer',
  components: {
    AppButtonGroup,
    AppButton,
    AssignSupervisorsForm,
    EditGroupDirectorForm,
    AppCheckPermission,
    AppConfirmDeleteModal,
    EditSupervisorsForm,
    AcademicOfferForm,
    AppEmptyResponse,
    AppAccordionItem,
    AppButtonDelete,
    AppAccordion,
    AppBaseList,
    AppLoading,
    AppAvatar,
    AppModal,
    EditQuotaForm,
    EditPlayTimesForm,
    AppGetIcon,
  },

  setup() {
    const { t } = useI18n();
    const title = 'core.menu.academicOffer';
    const router = useRouter();
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const loadingAcademicPeriodGroups = ref(false);
    const academicPeriodGroupModal = ref(false);
    const currentAcademicPeriodGroupId = ref();
    const editGroupDirectorModal = ref(false);
    const editSupervisorsModal = ref(false);
    const editQuotaModal = ref(false);
    const editPlayTimesModal = ref(false);
    const academicPeriodModal = ref(false);
    const academicPeriodId = ref();
    const modalDelete = ref(false);
    const loadingCourse = ref(false);
    const loading = ref(true);
    const playTimes = ref([]);

    const relatedDataForm: {
      value: AcademicPeriodGroupsRelatedDataFormDto | any;
    } = reactive({
      value: null,
    });
    const currentAcademicPeriod: { value: AcademicPeriodDto | null } = reactive({
      value: null,
    });
    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });
    const currentAcademicPeriodGroup: { value: any } = reactive({
      value: null,
    });
    const academicPeriodGroups: { value: any[] } = reactive({
      value: [],
    });
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const academicPeriodGroupsId = ref();

    onMounted(async () => {
      try {
        await getRelatedDataForm();
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    watch(academicPeriodId, async () => {
      await getAcademicPeriodGroups();
    });

    const getRelatedDataForm = async () => {
      relatedDataForm.value = await getAcademicPeriodGroupsRelatedDataFormService.run();

      academicPeriods.value = relatedDataForm.value?.academicPeriods;

      if (academicPeriods.value.length) {
        academicPeriodId.value = academicPeriods.value[0].id;
      }
    };

    const getAcademicPeriodGroups = async () => {
      loadingAcademicPeriodGroups.value = true;

      academicPeriodGroups.value = await getAcademicPeriodGroupsService.run(academicPeriodId.value);

      loadingAcademicPeriodGroups.value = false;
    };

    const getAcademicPeriodGroupsByLevelId = async (levelId: number | undefined) => {
      loadingCourse.value = true;

      const getAcademicPeriodGroups = await getAcademicPeriodGroupsService.run(academicPeriodId.value);

      getAcademicPeriodGroups.forEach((item: any, index: number) => {
        if (item.levelId == levelId) {
          academicPeriodGroups.value[index].courses = item.courses;
        }
      });

      loadingCourse.value = false;
    };

    // modals
    const openAcademicOfferFormModal = (academicPeriod: any | null) => {
      currentAcademicPeriodGroupId.value = academicPeriod?.id ?? null;
      currentAcademicPeriod.value = academicPeriod;
      academicPeriodModal.value = true;
    };
    const closeAcademicOfferFormModal = async () => {
      academicPeriodModal.value = false;

      if (currentAcademicPeriod.value) {
        await getAcademicPeriodGroupsByLevelId(currentAcademicPeriod.value.levelId);
      } else {
        await getAcademicPeriodGroups();
      }
    };

    const openAssignSupervisorModal = (academicPeriodGroup: any) => {
      currentAcademicPeriodGroup.value = academicPeriodGroup;
      academicPeriodGroupModal.value = true;
    };
    const closeAssignSupervisorModal = async () => {
      academicPeriodGroupModal.value = false;
      await getAcademicPeriodGroups();
    };

    const openEditGroupDirectorModal = (academicPeriodGroup: any) => {
      currentAcademicPeriodGroup.value = academicPeriodGroup;
      editGroupDirectorModal.value = true;
    };
    const closeEditGroupDirectorModal = async () => {
      editGroupDirectorModal.value = false;
      await getAcademicPeriodGroups();
    };

    const openEditQuotaModal = (academicPeriodGroup: any) => {
      currentAcademicPeriodGroup.value = academicPeriodGroup;
      editQuotaModal.value = true;
    };
    const closeEditQuotaModal = async () => {
      editQuotaModal.value = false;
      await getAcademicPeriodGroups();
    };

    const openEditPlayTimesModal = async (academicPeriodGroup: any, id: any) => {
      console.log('academicPeriodGroupididid', id?.academicPeriodGroupId);

      currentAcademicPeriodGroup.value = academicPeriodGroup;
      academicPeriodGroupsId.value = id?.academicPeriodGroupId;
      let responsive = await getAcademicPeriodGroupsRelatedDataFormService.run({
        journeyId: academicPeriodGroup.journeyId,
      });
      playTimes.value = responsive.playTimes;
      editPlayTimesModal.value = true;
    };
    const closeEditPlayTimesModal = async () => {
      editPlayTimesModal.value = false;
      await getAcademicPeriodGroups();
    };

    const openEditSupervisorsModal = (academicPeriodGroup: any) => {
      currentAcademicPeriodGroup.value = academicPeriodGroup;
      editSupervisorsModal.value = true;
    };
    const closeEditSupervisorsModal = async () => {
      editSupervisorsModal.value = false;
      await getAcademicPeriodGroups();
    };

    const openConfirmDelete = async (data: any) => {
      currentDataDelete.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteAcademicPeriodGroupsService.run(currentDataDelete.value.id);
      modalDelete.value = false;

      await getAcademicPeriodGroups();
    };
    const redirectActivitiesClassificationLevel = async (academicPeriod: any) => {
      console.log(academicPeriod);
      await router.push({
        name: 'academicPlanning.activitiesClassificationLevel',
        params: {
          levelId: academicPeriod.degree.level.id,
          validPercentLevel: academicPeriod.degree.level.percentageActivityCategories,
        },
      });
    };

    return {
      t,
      loadingAcademicPeriodGroups,
      loadingCourse,
      loading,
      routes,
      title,

      currentAcademicPeriodGroupId,
      currentAcademicPeriodGroup,
      academicPeriodGroupModal,
      editGroupDirectorModal,
      currentAcademicPeriod,
      academicPeriodGroups,
      academicPeriodGroupsId,
      editSupervisorsModal,
      academicPeriodModal,
      academicPeriodId,
      relatedDataForm,
      academicPeriods,
      modalDelete,

      closeAcademicOfferFormModal,
      closeEditGroupDirectorModal,
      openAcademicOfferFormModal,
      closeAssignSupervisorModal,
      openEditGroupDirectorModal,
      openAssignSupervisorModal,
      closeEditSupervisorsModal,
      openEditSupervisorsModal,
      openConfirmDelete,
      confirmDelete,
      openEditQuotaModal,
      closeEditQuotaModal,
      editQuotaModal,
      openEditPlayTimesModal,
      closeEditPlayTimesModal,
      editPlayTimesModal,
      playTimes,
      redirectActivitiesClassificationLevel,
    };
  },
});
</script>

<style scoped>
.hover:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

table th {
  text-align: center;
}
tr.fila-intermedia:nth-child(2n) {
  background-color: #e4e4e4;
}
.button-playTime {
  padding: unset;
  width: 32px;
  height: 32px;
  border-radius: unset;
  color: var(--color-primary);
  border-color: unset;
  border: unset;
}
.button-playTime:hover {
  width: 32px;
  height: 32px;
  border-radius: 50px;
  color: var(--color-light);
  background-color: var(--color-secondary);
}
</style>
