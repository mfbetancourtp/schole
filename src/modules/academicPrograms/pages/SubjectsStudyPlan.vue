<template>
  <AppBaseList :title="title" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButton
        style="color: white"
        :to="{
          name: 'academicPrograms.studyPlanImportCurriculums',
          params: { studyPlanId },
        }"
        :label="'core.import'"
      />
      <AppButtonBack :to="{ name: 'academicPrograms.studyPlan' }"></AppButtonBack>
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <div>
        <AppEmptyResponse v-if="!levelsWithDegrees.length" :show-image="true" :subtitle="false" :size="'xs'"> </AppEmptyResponse>
        <section class="item-card" v-else v-for="(level, index) in levelsWithDegrees" :key="index">
          <AppCard v-if="level.degrees.length">
            <template #title>
              <div>{{ level.name }}</div>
            </template>
            <template #body>
              <AppAccordion class="mt-1 mb-2" v-slot="{ accordionId }">
                <AppAccordionItem v-for="(degree, index) in level.degrees" :key="index" @open="getSubjectsStudyPlanForDegree(degree.id)" :accordion-id="accordionId">
                  <template v-slot:head>{{ degree.name }}</template>
                  <template v-slot:content>
                    <AppLoading v-if="loadingSubjects"></AppLoading>
                    <div v-else-if="subjectsCurriculumAndDegree.value" class="table-responsive w-100">
                      <div class="d-flex align-items-center justify-content-between container-subjects">
                        <div class="max-subjects d-flex align-items-center gap-2">
                          <div class="w-65">
                            <AppBadge
                              style="white-space: break-spaces"
                              v-tooltip="'Máximo de Asignaturas reprobadas permitidas'"
                              variant="primary"
                              :label="'Máximo de Asignaturas reprobadas permitidas'"
                            ></AppBadge>
                          </div>
                          <div class="w-35">
                            <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.edit">
                              <input
                                class="form-control"
                                type="number"
                                id="maxSubjectFailed"
                                @change="setMaxSubjectFailed()"
                                v-model="subjectsCurriculumAndDegree.value.curriculumDegree.maxSubjectFailed"
                              />
                            </AppCheckPermission>
                          </div>
                        </div>

                        <div class="w-50 d-flex align-items-center justify-content-end gap-2 use-scale">
                          <label for="scale">Usar Escala</label>
                          <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.edit">
                            <AppAutocomplete
                              class="content-scales"
                              :label="'title'"
                              :input-id="'scale'"
                              :options="ratingScales"
                              @option:selected="setMaxSubjectFailed()"
                              v-model="subjectsCurriculumAndDegree.value.curriculumDegree.ratingScaleId"
                            >
                            </AppAutocomplete>
                          </AppCheckPermission>
                        </div>
                      </div>

                      <AppEmptyResponse v-if="!subjectsCurriculumAndDegree.value?.areas.length" :show-image="true"> </AppEmptyResponse>
                      <table v-else class="table">
                        <thead>
                          <tr>
                            <th class="text-center col-4">
                              {{ t('core.generalTerms.academic.subject.singular') }}
                            </th>
                            <th class="text-center col-1">
                              {{ t('academicPrograms.subjectsStudyPlan.percentage') }}
                            </th>
                            <th class="text-center col-5">
                              {{ t('core.generalTerms.academic.subjectClassification.singular') }}
                            </th>
                            <th class="text-center col-1">Intensidad Horaria</th>
                            <th class="text-center col-1">Orden en Boletín</th>
                            <th class="text-center col-2"></th>
                            <th class="text-center col-1"></th>
                          </tr>
                        </thead>
                        <tbody v-for="(area, index) in subjectsCurriculumAndDegree.value.areas" :key="index">
                          <tr>
                            <td colspan="4" class="text-center fw-bold">
                              {{ area.name }}
                            </td>
                            <td>
                              <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.edit">
                                <input
                                  class="form-control"
                                  type="number"
                                  v-model="area.subjects[0].curriculumSubject.orderQualificationsBulletinArea"
                                  @change="createOrUpdateAreaSubjects(area.subjects, area.subjects[0].curriculumSubject.orderQualificationsBulletinArea)"
                                />
                              </AppCheckPermission>
                            </td>
                          </tr>

                          <tr v-for="(subject, index) in area.subjects" :key="index">
                            <td class="text-center">{{ subject.name }}</td>

                            <td>
                              <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.edit">
                                <input @change="createOrUpdateCurriculumSubjects(subject.curriculumSubject)" class="form-control" type="number" v-model="subject.curriculumSubject.percentArea" />
                              </AppCheckPermission>
                            </td>

                            <td>
                              <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.edit">
                                <v-select
                                  v-model="subject.curriculumSubject.subjectCategoryId"
                                  :options="subjectCategories"
                                  label="name"
                                  :reduce="(subjectCategories: any) => subjectCategories.id"
                                  @option:selected="createOrUpdateCurriculumSubjects(subject.curriculumSubject)"
                                >
                                </v-select>
                              </AppCheckPermission>
                            </td>
                            <td>
                              <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.edit">
                                <input @change="createOrUpdateCurriculumSubjects(subject.curriculumSubject)" class="form-control" type="number" v-model="subject.curriculumSubject.hourlyIntensity" />
                              </AppCheckPermission>
                            </td>
                            <td>
                              <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.edit">
                                <input
                                  @change="createOrUpdateCurriculumSubjects(subject.curriculumSubject)"
                                  class="form-control"
                                  type="number"
                                  v-model="subject.curriculumSubject.orderQualificationsBulletinSubjects"
                                />
                              </AppCheckPermission>
                            </td>

                            <td class="text-center">
                              <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.delete">
                                <AppButtonDelete @click="openConfirmDelete(subject.curriculumSubject.id)"> </AppButtonDelete>
                              </AppCheckPermission>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <hr />
                      <div class="d-flex justify-content-end">
                        <AppCheckPermission permission="academicPrograms.subjectsStudyPlan.create">
                          <AppButton outlined icon-left="plus" @click="openStudyPlanSubjectModal()" label="core.generalTerms.academic.subject.singular"></AppButton>
                        </AppCheckPermission>
                      </div>
                    </div>
                  </template>
                </AppAccordionItem>
              </AppAccordion>
            </template>
          </AppCard>
        </section>
      </div>
      <AppModal v-model="studyPlanSubjectModal">
        <StudyPlanSubjectForm
          v-if="studyPlanSubjectModal && subjectsCurriculumAndDegree.value"
          :curriculumDegree="subjectsCurriculumAndDegree.value.curriculumDegree"
          :areasAndSubjectsPending="subjectsCurriculumAndDegree.value.pendingSubjects"
          @close="closeStudyPlanSubjectModal()"
        ></StudyPlanSubjectForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="'curriculumSubject'" @confirmDelete="confirmDelete"> </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import StudyPlanSubjectForm from '../components/StudyPlanSubjectForm.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';

import { StudyPlanDto } from '../dtos/studyPlan.dto';
import { RatingScaleDto } from '../dtos/ratingScale.dto';
import { LevelsWithDegreesDto } from '../../../shared/dto/levelsWithDegrees.dto';
import { SubjectsCurriculumAndDegreeDto } from '../dtos/subjectsCurriculumAndDegree.dto';

import { GetRatingScalesService } from '../services/getRatingScales.service';
import { GetStudyPlanByIdService } from '../services/getStudyPlanById.service';
import { DeleteCurriculumSubjectsService } from '../services/deleteCurriculumSubjects.service';
import { GetLevelsWithDegreesService } from '../../../shared/services/getLevelsWithDegrees.service';
import { GetSubjectsCurriculumAndDegreeService } from '../services/getSubjectsCurriculumAndDegree.service';
import { CreateOrUpdateCurriculumDegreesService } from '../services/createOrUpdateCurriculumDegrees.service';
import { CreateOrUpdateCurriculumSubjectsService } from '../services/createOrUpdateCurriculumSubjects.service';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateCurriculumSubjectsService = new CreateOrUpdateCurriculumSubjectsService();
const createOrUpdateCurriculumDegreesService = new CreateOrUpdateCurriculumDegreesService();
const getSubjectsCurriculumAndDegreeService = new GetSubjectsCurriculumAndDegreeService();
const deleteCurriculumSubjectsService = new DeleteCurriculumSubjectsService();
const getLevelsWithDegreesService = new GetLevelsWithDegreesService();
const getStudyPlanByIdService = new GetStudyPlanByIdService();
const getRatingScalesService = new GetRatingScalesService();

export default defineComponent({
  name: 'SubjectsStudyPlan',
  components: {
    AppButton,
    AppModal,
    AppBadge,
    AppLoading,
    AppBaseList,
    AppAccordion,
    AppButtonBack,
    AppButtonDelete,
    AppAutocomplete,
    AppEmptyResponse,
    AppAccordionItem,
    AppCheckPermission,
    StudyPlanSubjectForm,
    AppConfirmDeleteModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();

    const route = useRoute();
    const title = 'academicPrograms.subjectsStudyPlan.name';

    const subtitle = ref('');
    useMeta({ title: t(title) });

    const routes = [
      {
        name: 'core.menu.studyPlan',
        url: { name: 'academicPrograms.studyPlan' },
      },
      {
        name: title,
      },
    ];

    const ratingScales: Ref<RatingScaleDto[]> = ref([]);
    const levelsWithDegrees: Ref<LevelsWithDegreesDto[]> = ref([]);

    const subjectsCurriculumAndDegree: {
      value: SubjectsCurriculumAndDegreeDto | null;
    } = reactive({
      value: null,
    });

    const loading = ref(true);
    const modalDelete = ref(false);
    const loadingSubjects = ref(false);
    const studyPlanSubjectModal = ref(false);

    const currentDegreeId = ref();
    const curriculumSubjectId = ref();
    const subjectCategories = ref<any[]>([]);

    const studyPlanId = route.params.studyPlanId;
    const subjectCategoryId = ref(null);
    const orderQualificationsBulletinArea = ref(0);

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.moduleSubItem = { name: title, url: '' };
      try {
        let studyPlan: StudyPlanDto = await getStudyPlanByIdService.run(studyPlanId);
        levelsWithDegrees.value = await getLevelsWithDegreesService.run();
        ratingScales.value = await getRatingScalesService.run();
        const headerStorage = useHeaderStore();
        headerStorage.moduleSubItem = { name: title, url: '' };

        subtitle.value = `${studyPlan.name}`;
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getSubjectsStudyPlanForDegree = async (degreeId: number, forRefresh?: boolean) => {
      loadingSubjects.value = true;

      try {
        if (currentDegreeId.value !== degreeId || forRefresh) {
          currentDegreeId.value = degreeId;

          subjectsCurriculumAndDegree.value = await getSubjectsCurriculumAndDegreeService.run(studyPlanId, degreeId);
          subjectCategories.value = subjectsCurriculumAndDegree.value?.subjectCategories ?? [];
        }
      } catch (e) {
        console.log('error', e);
      }

      loadingSubjects.value = false;
    };

    const setMaxSubjectFailed = async () => {
      setTimeout(async () => {
        if (subjectsCurriculumAndDegree.value) {
          let data = subjectsCurriculumAndDegree.value.curriculumDegree;
          let curriculumDegreeId = subjectsCurriculumAndDegree.value.curriculumDegree.id;
          console.log('data=', data);
          try {
            await createOrUpdateCurriculumDegreesService.run(data, curriculumDegreeId);
          } catch (e) {
            console.log('error', e);
          }
        }
      }, 500);
    };

    const createOrUpdateCurriculumSubjects = async (curriculumSubject: any) => {
      if (!curriculumSubject.percentArea && !curriculumSubject.hourlyIntensity && !curriculumSubject.orderQualificationsBulletinSubjects) {
        curriculumSubject.percentArea = 0;
        curriculumSubject.hourlyIntensity = 0;
        curriculumSubject.orderQualificationsBulletinSubjects = 0;
      }
      if (!curriculumSubject.hourlyIntensity) {
        curriculumSubject.hourlyIntensity = 0;
      }
      if (!curriculumSubject.orderQualificationsBulletinSubjects) {
        curriculumSubject.orderQualificationsBulletinSubjects = 0;
      }
      if (!curriculumSubject.percentArea) {
        curriculumSubject.percentArea = 0;
      }

      try {
        await createOrUpdateCurriculumSubjectsService.run(curriculumSubject, curriculumSubject.id);
      } catch (e) {
        console.log('error', e);
      }
    };

    const createOrUpdateAreaSubjects = async (subjects: any, order: any) => {
      let newData = subjects.map((item: any) => {
        return {
          ...item.curriculumSubject,
          orderQualificationsBulletinArea: order,
        };
      });
      try {
        // await putStudyPlanAreasService.run(newData);
      } catch (e) {
        console.log('error', e);
      }
    };

    const openStudyPlanSubjectModal = () => {
      studyPlanSubjectModal.value = true;
    };
    const closeStudyPlanSubjectModal = async () => {
      studyPlanSubjectModal.value = false;
      await getSubjectsStudyPlanForDegree(currentDegreeId.value, true);
    };

    const openConfirmDelete = async (curriSubjectId: number | undefined) => {
      curriculumSubjectId.value = curriSubjectId;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteCurriculumSubjectsService.run(curriculumSubjectId.value);

      modalDelete.value = false;
      await getSubjectsStudyPlanForDegree(currentDegreeId.value, true);
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      t,

      subjectsCurriculumAndDegree,
      studyPlanSubjectModal,
      levelsWithDegrees,
      loadingSubjects,
      ratingScales,
      modalDelete,
      subjectCategories,
      subjectCategoryId,

      createOrUpdateCurriculumSubjects,
      createOrUpdateAreaSubjects,
      orderQualificationsBulletinArea,
      getSubjectsStudyPlanForDegree,
      closeStudyPlanSubjectModal,
      openStudyPlanSubjectModal,
      setMaxSubjectFailed,
      openConfirmDelete,
      confirmDelete,
      studyPlanId,
    };
  },
});
</script>

<style scoped>
.w-10 {
  width: 10% !important;
}

.item-card {
  margin-bottom: 15px;
}

.form-control {
  position: relative;
  left: 16px;
  padding: 0.375rem 0.25rem;
  margin-right: 30px;
  width: 55px;
  text-align: center;
}
.content-scales {
  width: 70%;
}
.container-subjects {
  gap: 20px;
}
.max-subjects {
  width: 100%;
}
@media (max-width: 650px) {
  .container-subjects {
    display: flex;
    flex-direction: column;
  }
  .max-subjects {
    width: 100%;
  }
  .use-scale {
    width: 100% !important;
    display: flex;
    justify-content: flex-start !important;
  }
}
</style>
