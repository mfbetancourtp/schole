<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'academicPlanning.academicOffer' }" />

      <AppCheckPermission permission="classroom.activitiesClassification.create">
        <AppButton style="color: white" label="core.new" @click="openActivityClassificationModal(null)" />
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading" />
      <template v-else>
        <div class="d-flex justify-content-end">
          <div class="w-50"></div>
          <AppFormField class="w-50" label="Ciclo académico">
            <AppAutocomplete
              class="bg-white"
              v-model="currentAcademicPeriod"
              :options="academicPeriods"
              placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
              @search="searchAcademicPeriod"
            />
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

                        <span class="badge rounded-pill text-bg-primary bg-primary">{{ activityCategory.percent ?? '--' }}%</span>
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

                        <span class="badge rounded-pill text-bg-primary bg-primary">{{ item.data?.percent ?? '--' }}%</span>
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
          <template v-if="activityCategoryModal">
            <ActivitiesClassificationByLeveIdForm
              :activities-classification="currentActivityCategory"
              :levelId="levelId"
              :validPercentLevel="validPercentLevel"
              @close="closeActivityClassificationModal"
            ></ActivitiesClassificationByLeveIdForm>
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
import { debounce } from 'ts-debounce';

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
import ActivitiesClassificationByLeveIdForm from '../components/ActivitiesClassificationByLeveIdForm.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { LevelDto } from '../../administration/dtos/homeTeacherCourses.dto';
import { CourseDetailDto } from '../../administration/dtos/course.dto';
import { ActivityCategoryDto } from '../../administration/dtos/activityCategory.dto';
import { ActivityCategoriesListDto } from '../../administration/dtos/activityCategory.dto';

import { DeleteActivitiesClassificationByLevelIdService } from '../services/deleteActivitiesClassificationByLevelId.service';
import { GetActivitiesClassificationByLevelIdService } from '../services/getActivitiesClassificationByLevelId.service';

import { GetAcademicPeriodsWithPeriodsForSelectService } from '../../administration/services/getAcademicPeriodsWithPeriodsForSelect.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsWithPeriodsForSelectService = new GetAcademicPeriodsWithPeriodsForSelectService();
const deleteActivitiesClassificationByLevelIdService = new DeleteActivitiesClassificationByLevelIdService();
const getActivitiesClassificationByLevelIdService = new GetActivitiesClassificationByLevelIdService();

export default defineComponent({
  name: 'ActivitiesClassificationByLevel',

  components: {
    ActivitiesClassificationByLeveIdForm,
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
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.activitiesClassification.name');
    const levelId = parseInt(route.params.levelId.toString(), 10);
    const validPercentLevel = !!parseInt(route.params.validPercentLevel.toString(), 10);

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
    const currentAcademicPeriod = ref();
    const level: Ref<LevelDto | null> = ref(null);
    const academicPeriods = ref();
    //const searchAcademicPeriod = ref();

    const academicPeriodId = ref(null);
    const periodId = ref(null);
    const subtitle = ref('');

    const activityCategoryModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        //level.value = await getLevelByCourseIdService.run(levelId);
        //course.value = await getCourseByIdService.run(levelId);
        //subtitle.value = course.value?.name;

        const params = { perPage: 50 };
        const resData = await getAcademicPeriodsWithPeriodsForSelectService.run(params);
        academicPeriods.value = resData.data.map((item: any, index: number) => ({
          ...item,
          id: index, // ID único basado en la posición
          academicPeriodId: item.id,
          name: item.namePeriod ?? item.name, // Usa `namePeriod` si existe, de lo contrario `name`
        }));
        await getActivitiesCategory();

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(currentAcademicPeriod, async (newValue) => {
      const selectedPeriod = academicPeriods.value.find((item: any) => item.id === newValue);
      if (selectedPeriod) {
        academicPeriodId.value = selectedPeriod.academicPeriodId;
        periodId.value = selectedPeriod.periodId;
      } else {
        academicPeriodId.value = null;
        periodId.value = null;
      }

      await getActivitiesCategory();
    });

    const getActivitiesCategory = async () => {
      const params: any = { levelId };

      if (academicPeriodId.value) {
        params.academicPeriodId = academicPeriodId.value;
        params.periodId = periodId.value ?? null;
      }

      activityCategories.value = await getActivitiesClassificationByLevelIdService.run(params);
    };

    const openActivityClassificationModal = async (activityCategory: ActivityCategoryDto | null) => {
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
        let params = {
          levelId: levelId,
          name: currentActivityCategory.value.name,
          academicPeriodId: currentActivityCategory.value.academicPeriodId,
        };
        await deleteActivitiesClassificationByLevelIdService.run(params);
      }

      currentActivityCategory.value = null;
      modalDelete.value = false;

      await getActivitiesCategory();
    };

    const searchAcademicPeriod = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length < 2) {
          academicPeriods.value = [];
        }

        if (search.length >= 2) {
          academicPeriods.value = [];
          const params = { perPage: 50, search: search };
          const resData = await getAcademicPeriodsWithPeriodsForSelectService.run(params);

          academicPeriods.value = resData.data.map((item: any, index: number) => ({
            ...item,
            id: index, // ID único basado en la posición
            academicPeriodId: item.id,
            name: item.namePeriod ?? item.name, // Usa `namePeriod` si existe, de lo contrario `name`
          }));
          console.log(academicPeriods.value);
        }

        loading(false);
      }
    }, 800);

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
      levelId,
      level,
      validPercentLevel,

      closeActivityClassificationModal,
      openActivityClassificationModal,
      openConfirmDelete,
      confirmDelete,
      searchAcademicPeriod,
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
