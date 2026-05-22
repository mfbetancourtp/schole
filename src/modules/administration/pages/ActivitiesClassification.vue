<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'administration.homeTeacher' }" />

      <AppCheckPermission permission="classroom.activitiesClassification.create">
        <AppButton style="color: white" label="core.new" @click="openActivityClassificationModal(null)" />
      </AppCheckPermission>
    </template>

    <template #content>
      <TabsTeacher></TabsTeacher>
      <AppLoading v-if="loading" />
      <template v-else>
        <div class="d-flex justify-content-end">
          <div class="w-50"></div>
          <AppFormField class="w-50" label="Ciclo académico">
            <AppAutocomplete class="bg-white" v-model="currentAcademicPeriod" :options="academicPeriods" />
          </AppFormField>
        </div>

        <template v-if="!activityCategories.length">
          <AppEmptyResponse :showImage="true"></AppEmptyResponse>
        </template>
        <div class="item-card" v-for="(item, index) in activityCategories" :key="index">
          <AppCard>
            <template #title>
              <div class="title-section">
                {{ item.academicPeriod ?? item.academicPeriodWithPeriod ?? item.withOutAcademicWithOutPeriodWithPeriod }}
              </div>
            </template>
            <template #body>
              <div class="grid-cards">
                <template v-if="Array.isArray(item.data)">
                  <AppCard v-for="(activityCategory, index2) in item.data" :key="index2">
                    <template #title>
                      <div class="d-flex justify-content-between">
                        <span>{{ activityCategory.abbreviation ?? '---' }}</span>

                        <span class="badge rounded-pill text-bg-primary bg-primary">{{ activityCategory.percent ?? '--'
                        }}%</span>
                      </div>
                    </template>
                    <template #body>
                      <h5 class="m-0">{{ activityCategory.name }}</h5>
                    </template>

                    <template #footer>
                      <div class="d-flex justify-content-end gap-1">
                        <AppCheckPermission permission="classroom.activitiesClassification.edit">
                          <AppButtonEdit @click="openActivityClassificationModal(activityCategory)" />
                        </AppCheckPermission>

                        <AppCheckPermission permission="classroom.activitiesClassification.delete">
                          <AppButtonDelete @click="openConfirmDelete(activityCategory)" />
                        </AppCheckPermission>
                      </div>
                    </template>
                  </AppCard>
                </template>

                <template v-else>
                  <AppCard>
                    <template #body>
                      <div class="d-flex justify-content-between">
                        <span>{{ item.data?.abbreviation ?? '---' }}</span>

                        <span class="badge rounded-pill text-bg-primary bg-primary">{{ item.data?.percent ?? '--'
                        }}%</span>
                      </div>

                      <h5 class="m-0">{{ item.data?.name }}</h5>
                    </template>

                    <template #footer>
                      <div class="d-flex justify-content-end gap-1">
                        <AppCheckPermission permission="classroom.activitiesClassification.edit">
                          <AppButtonEdit @click="openActivityClassificationModal(item.data)" />
                        </AppCheckPermission>

                        <AppCheckPermission permission="classroom.activitiesClassification.delete">
                          <AppButtonDelete @click="openConfirmDelete(item.data)" />
                        </AppCheckPermission>
                      </div>
                    </template>
                  </AppCard>
                </template>
              </div>
            </template>
          </AppCard>
        </div>

        <AppModal v-model="activityCategoryModal" :size="'lg'">
          <template v-if="activityCategoryModal && level">
            <ActivitiesClassificationForm :activities-classification="currentActivityCategory" :course-id="courseId"
              :level="level" @close="closeActivityClassificationModal"></ActivitiesClassificationForm>
          </template>
        </AppModal>

        <AppModal v-model="modalDelete">
          <template v-if="modalDelete">
            <AppConfirmDeleteModal entity="classroom.activitiesClassification.singular" @confirmDelete="confirmDelete" />
          </template>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import ActivitiesClassificationForm from '../components/ActivitiesClassificationForm.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { LevelDto } from '../dtos/level.dto';
import { CourseDetailDto } from '../dtos/course.dto';
import { ActivityCategoryDto } from '../dtos/activityCategory.dto';
import { ActivityCategoriesListDto } from '../dtos/activityCategory.dto';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
import { DeleteActivitiesCategoryService } from '../services/deleteActivitiesCategory.service';
import { GetActivityCategoriesService } from '../services/getActivityCategories.service';
import { GetAcademicPeriodsWithPeriodsForSelectService } from '../services/getAcademicPeriodsWithPeriodsForSelect.service';
import { useHeaderStore } from '../../../stores/header.store';
import TabsTeacher from '../components/TabsTeacher.vue';

const getAcademicPeriodsWithPeriodsForSelectService = new GetAcademicPeriodsWithPeriodsForSelectService();
const deleteActivitiesCategoryService = new DeleteActivitiesCategoryService();
const getActivityCategoriesService = new GetActivityCategoriesService();
const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'ActivitiesClassification',

  components: {
    ActivitiesClassificationForm,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonDelete,
    AppButtonEdit,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    TabsTeacher,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = (t('classroom.activitiesClassification.name'));
    const courseId = parseInt(route.params.courseId.toString(), 10);

    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'core.menu.home-teacher',
        url: { name: 'administration.homeTeacher' },
      },
      {
        name: title,
      },
    ];

    const currentActivityCategory: Ref<ActivityCategoryDto | null> = ref(null);
    const activityCategories: Ref<ActivityCategoriesListDto[]> = ref([]);
    const course: Ref<CourseDetailDto | null> = ref(null);
    const currentAcademicPeriod: Ref<any> = ref(null);
    const level: Ref<LevelDto | null> = ref(null);
    const academicPeriods: Ref<any[]> = ref([]);

    const academicPeriodId = ref(null);
    const periodId = ref(null);
    const subtitle = ref('');

    const activityCategoryModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {


        level.value = await getLevelByCourseIdService.run(courseId);
        course.value = await getCourseByIdService.run(courseId);
        subtitle.value = course.value?.name;

        const params = { perPage: 100 };
        const academicPeriodsWithPeriods: any = await getAcademicPeriodsWithPeriodsForSelectService.run(params);

        let counter = 0;

        while (counter < academicPeriodsWithPeriods.data.length) {
          const item: any = academicPeriodsWithPeriods.data[counter];
          academicPeriodsWithPeriods.data[counter].id = await { ...item };

          if ('namePeriod' in item) {
            academicPeriodsWithPeriods.data[counter].name = await item.namePeriod;
          }

          counter += 1;
        }
        academicPeriods.value = await academicPeriodsWithPeriods.data;
        await getActivitiesCategory();

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = { name: title + " " + subtitle.value, url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(currentAcademicPeriod, async (value) => {
      if (value) {
        academicPeriodId.value = value.id;
        periodId.value = value.periodId;
      } else {
        academicPeriodId.value = null;
        periodId.value = null;
      }

      await getActivitiesCategory();
    });

    const getActivitiesCategory = async () => {
      const params: any = { courseId };

      if (academicPeriodId.value) {
        params.academicPeriodId = academicPeriodId.value;
        params.periodId = periodId.value ?? 'null';
      }

      activityCategories.value = await getActivityCategoriesService.run(params);
    };

    const openActivityClassificationModal = (activityCategory: ActivityCategoryDto | null) => {
      currentActivityCategory.value = activityCategory;
      activityCategoryModal.value = true;
    };
    const closeActivityClassificationModal = async () => {
      currentActivityCategory.value = null;
      activityCategoryModal.value = false;

      await getActivitiesCategory();
    };

    const openConfirmDelete = async (activityCategory: ActivityCategoryDto) => {
      currentActivityCategory.value = activityCategory;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentActivityCategory.value) {
        await deleteActivitiesCategoryService.run(currentActivityCategory.value.id);
      }

      currentActivityCategory.value = null;
      modalDelete.value = false;

      await getActivitiesCategory();
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      t,

      currentActivityCategory,
      activityCategoryModal,
      currentAcademicPeriod,
      activityCategories,
      academicPeriods,
      modalDelete,
      courseId,
      level,

      closeActivityClassificationModal,
      openActivityClassificationModal,
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
}

.title-section {
  color: #000;
}

.item-card {
  margin-bottom: 15px;
}
</style>
