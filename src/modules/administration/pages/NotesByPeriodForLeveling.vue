<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'administration.homeTeacher' }"></AppButtonBack>
    </template>
    <template #content>
      <TabsTeacher></TabsTeacher>

      <AppLoading v-if="loading" />
      <template v-else>
        <template v-if="!periods.length">
          <AppEmptyResponse :subtitle="false" :showImage="true" />
        </template>
        <AppDatatable v-else :service="getMatriculateSubjectsWithPaginateAllPeriodNotesService" :params="params" :name="name">
          <AppDatatableColumn label="academicAdministration.matriculates.table.names" field="lastnames" v-slot="{ row }">
            <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
              <AppAvatar :size="'sm'" :avatar="row.student?.people.avatar ?? ''" :name="row.student?.people.lastnames ?? ''"></AppAvatar>
              <div class="tw-min-w-0 tw-ml-4">
                <div class="tw-font-medium tw-leading-5 tw-truncate">
                  {{ row.student?.people?.lastnames ?? '' }}
                </div>
                <div class="tw-leading-5 tw-truncate tw-font-light">
                  {{ row.student?.people?.names ?? '' }}
                </div>
              </div>
            </div>
          </AppDatatableColumn>
          <AppDatatableColumn
            v-for="period in periods"
            :key="period.id"
            :label="period.name"
            :field="`period_${period.id}`"
            :sortable="false"
            :searchable="false"
            class="text-center"
            position="centered"
          >
            <template #default="{ row }">
              <div class="d-flex justify-content-center gap-2">
                <span
                  class="note"
                  :style="{
                    backgroundColor: row.matriculateSubjectPeriods?.find((p: any) => p.periodId === period.id)?.isEdit === 1 ? '#ffaa' : 'unset',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }"
                >
                  {{
                    isQualitativeGrading
                      ? row.matriculateSubjectPeriods?.find((p: any) => p.periodId === period.id)?.qualitativeFinalPeriod ?? ''
                      : row.matriculateSubjectPeriods?.find((p: any) => p.periodId === period.id)?.finalPeriod ?? ''
                  }}
                </span>

                <div>
                  <AppButtonEdit
                    :disabled="!isEditingAllowed(period) && profileIdLocalStorage != 1 && profileIdLocalStorage != 6"
                    @click="openFormModalEditNoteSubjectPeriods(row.matriculateSubjectPeriods.find((p: any) => p.periodId === period.id), false)"
                  />
                </div>
              </div>
            </template>
          </AppDatatableColumn>

          <AppDatatableColumn label="PROMEDIO FINAL" field="inscribed" :sortable="true" v-slot="{ row }" class="text-center" position="centered">
            <div class="d-flex justify-content-center gap-2">
              <span
                  class="note"
                  :style="{
                    backgroundColor: row?.isEdit === 1 ? '#ffaa' : 'unset',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }"
                >
                {{ isQualitativeGrading ? row.qualitativeFinalQuality : row.finalQuality }}
              </span>
              <div>
                <AppButtonEdit @click="openFormModalEditNoteSubjectPeriods(row, true)" :disabled="!isFinalAverageEditable() && profileIdLocalStorage != 1 && profileIdLocalStorage != 6"> </AppButtonEdit>
              </div>
            </div>
          </AppDatatableColumn>
        </AppDatatable>
      </template>
      <AppModal v-if="openModal" v-model="openModal">
        <SubjectNotesFormEdit
          v-if="currentMatriculateSubjectPeriod"
          :key="currentMatriculateSubjectPeriod.id"
          :data="currentMatriculateSubjectPeriod"
          :isQualitativeGrading="isQualitativeGrading"
          :ratingScales="ratingScales"
          @close="closeModalForm"
        />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, ref, Ref } from 'vue';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import TabsTeacher from '../components/TabsTeacher.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { MatriculateSubjectDto } from '../../academicAdministration/dto/matriculateSubject.dto';
import { CreateOrUpdateMatriculateSubjectPeriodsFromStudentArrayService } from '../../academicAdministration/services/createOrUpdateMatriculateSubjectPeriodsFromStudentArray.service';
import SubjectNotesFormEdit from '../../academicAdministration/components/SubjectNotesFormEdit.vue';
import { GetMatriculateSubjectsWithAllPeriodNotesService } from '../services/getMatriculateSubjectsWithPaginateAllPeriodNotes.service';
import { GetMatriculateSubjectsWithPaginateAllPeriodNotesService } from '../services/getMatriculateSubjectsWithAllPeriodNotes.service copy';
import { computed } from 'vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import { GetExtraordinaryGradeperiodsService } from '../services/getExtraordinaryGradePeriods.service';

const createOrUpdateMatriculateSubjectPeriodsFromStudentArrayService = new CreateOrUpdateMatriculateSubjectPeriodsFromStudentArrayService();
const getMatriculateSubjectsWithAllPeriodNotesService = new GetMatriculateSubjectsWithAllPeriodNotesService();
const getMatriculateSubjectsWithPaginateAllPeriodNotesService = new GetMatriculateSubjectsWithPaginateAllPeriodNotesService();
const updateDatatableService = new UpdateDatatableService();
const getExtraordinaryGradeperiodsService = new GetExtraordinaryGradeperiodsService();

export default defineComponent({
  name: 'NotesByStudent',
  components: {
    AppBaseList,
    AppLoading,
    AppButtonEdit,
    AppModal,
    AppDatatable,
    AppDatatableColumn,
    AppAvatar,
    SubjectNotesFormEdit,
    TabsTeacher,
    AppButtonBack,
  },

  setup() {
    const title = 'Nivelación por Estudiante';
    useMeta({ title: title });
    const name = 'Nivelación por Estudiante';
    const routes = [{ name: title }];

    const route = useRoute();
    const data: Ref<any[]> = ref([]);
    const ratingScales: Ref<any[]> = ref([]);
    const isQualitativeGrading = ref();
    const subjectAssignmentId = parseInt(route.params.subjectAssignmentId.toString(), 10);

    const searchValue = ref('');

    const loading = ref(true);

    const periods: Ref<any[]> = ref([]);
    const columns: { value: any[] } = reactive({
      value: [],
    });
    const subtitle: Ref<string> = ref('');

    const openModal = ref(false);
    const currentMatriculateSubjectPeriod: Ref<any> = ref(null);
    const checkByPeriods: Ref<any> = ref({});
    const showConfirmationByPeriodModal = ref(false);
    const showConfirmationModal = ref(false);
    const currentCheckPeriod: Ref<any> = ref(null);
    const courseId = ref(parseInt(route.params.courseId.toString(), 10));
    const extaordinaryData: Ref<any[]> = ref([]);
    const profileIdLocalStorage = ref(Number(localStorage.getItem('profileId')));

    onMounted(async () => {
      try {
        await getData();
        await getExtraordinaryPeriods();

        periods.value.forEach((period) => {
          columns.value.push(period.name);
        });
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });
    const params = computed(() => {
      return {
        subjectAssignmentId: subjectAssignmentId,
        search: searchValue.value,
      };
    });
    const getData = async () => {
      const response = await getMatriculateSubjectsWithAllPeriodNotesService.run(subjectAssignmentId);
      subtitle.value = response.courseName;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Salón de clase', url: '' };
      headerStorage.moduleItem = {
        name: 'Inicio Profesor',
        url: '',
      };
      headerStorage.moduleSubItem = {
        name: title + ' ' + subtitle.value,
        url: '',
      };
      data.value = response.matriculateSubjects ?? [];
      ratingScales.value = response?.ratingScaleDetails;
      isQualitativeGrading.value = response.isQualitativeGrading;
      periods.value = response.periods ?? [];

      for (let i = 0; i < data.value.length; i++) {
        const item = data.value[i];

        if (item.periods.length) {
          const periods: any[] = item.periods;

          for (let j = 0; j < periods.length; j++) {
            const period: any = periods[j];

            if (!(`periodId_${period.id}` in checkByPeriods.value)) checkByPeriods.value[`periodId_${period.id}`] = true;

            if (periods[j].matriculateSubjectPeriod != null) {
              const isUpdate = data.value[i].periods[j].matriculateSubjectPeriod.isUpdate ?? 1;

              data.value[i].periods[j].matriculateSubjectPeriod.isUpdate = isUpdate ? true : false;
            }
          }
        }
      }

      await loadCheckByPeriods();

      // subtitle.value = `${student.people.names} ${student.people.lastnames}`;
    };

    const openFormModalEditNoteSubjectPeriods = async (matriculateSubjectPeriod: any, finalAverage: any) => {
      console.log("matriculateSubjectPeriodmatriculateSubjectPeriod",matriculateSubjectPeriod);
      
      if (matriculateSubjectPeriod?.qualitativeFinalPeriod || finalAverage ) {
        currentMatriculateSubjectPeriod.value = {
          ...matriculateSubjectPeriod,
          finalQuality: isQualitativeGrading.value ? matriculateSubjectPeriod?.finalQuality : null,
          finalAverage: finalAverage,
        };
      } else {
        currentMatriculateSubjectPeriod.value = {
          ...matriculateSubjectPeriod,
          finalPeriod: isQualitativeGrading.value ? matriculateSubjectPeriod?.qualitativeFinalPeriod : matriculateSubjectPeriod?.finalPeriod,
        };
      }

      openModal.value = true;
    };
    const closeModalForm = async () => {
      openModal.value = false;
      currentMatriculateSubjectPeriod.value;
      updateDatatableService.run();
      await getData();
    };
    const loadCheckByPeriods = () => {
      const matriculateSubjectPeriod: any[] = [];

      for (let i = 0; i < data.value.length; i++) {
        const item = data.value[i];

        if (item.periods.length) {
          const periods: any[] = item.periods;

          for (let j = 0; j < periods.length; j++) {
            if (periods[j].matriculateSubjectPeriod != null) matriculateSubjectPeriod.push(periods[j].matriculateSubjectPeriod);
          }
        }
      }

      for (let i = 0; i < periods.value.length; i++) {
        let period = periods.value[i];
        let items = matriculateSubjectPeriod.filter((item: any) => item.periodId === period.id);

        checkByPeriods.value[`periodId_${period.id}`] = !items.filter((item: any) => item.isUpdate == false).length;
      }
    };
    const updateCheckbox = async (matriculateSubjectPeriod: any, value: boolean) => {
      loading.value = true;

      for (let i = 0; i < data.value.length; i++) {
        const periods: any[] = await data.value[i].periods;

        for (let j = 0; j < periods.length; j++) {
          if (periods[j].matriculateSubjectPeriod != null) {
            const strObj1 = JSON.stringify(data.value[i].periods[j].matriculateSubjectPeriod);
            const strObj2 = JSON.stringify(matriculateSubjectPeriod);

            if (strObj1 === strObj2) {
              data.value[i].periods[j].matriculateSubjectPeriod.isUpdate = value;
            }
          }
        }
      }

      await loadCheckByPeriods();

      loading.value = false;
    };
    const openConfirmationByPeriodModal = async (periodId: any) => {
      setTimeout(async () => {
        if (checkByPeriods.value[`periodId_${periodId}`]) {
          for (let i = 0; i < data.value.length; i++) {
            const periods: any[] = await data.value[i].periods;

            for (let j = 0; j < periods.length; j++) {
              if (periods[j].matriculateSubjectPeriod != null && data.value[i].periods[j].matriculateSubjectPeriod.periodId === periodId) {
                data.value[i].periods[j].matriculateSubjectPeriod.isUpdate = checkByPeriods.value[`periodId_${periodId}`];
              }
            }
          }
        } else {
          checkByPeriods.value[`periodId_${periodId}`] = !checkByPeriods.value[`periodId_${periodId}`];
          currentCheckPeriod.value = periodId;

          showConfirmationByPeriodModal.value = true;
        }
      }, 100);
    };
    const openConfirmationModal = async (matriculateSubjectPeriod: any) => {
      currentMatriculateSubjectPeriod.value = matriculateSubjectPeriod;

      if (currentMatriculateSubjectPeriod.value.isUpdate) {
        await updateCheckbox(currentMatriculateSubjectPeriod.value, currentMatriculateSubjectPeriod.value.isUpdate);

        showConfirmationModal.value = true;
      }

      setTimeout(async () => {
        await loadCheckByPeriods();
      }, 100);
    };

    const save = async () => {
      let dataSend: any[] = [];

      const matriculateSubjects: MatriculateSubjectDto[] = data.value;

      matriculateSubjects.forEach((matriculateSubject) => {
        const matriculateSubjectPeriods = matriculateSubject.periods.map((period: any) => period.matriculateSubjectPeriod);

        dataSend = [...dataSend, ...matriculateSubjectPeriods];
      });

      try {
        await createOrUpdateMatriculateSubjectPeriodsFromStudentArrayService.run(dataSend);
        await getData();
      } catch (e) {
        console.log('error', e);
      }
    };

    const isScoreUploadOpen = (period: any): boolean => {
      const now = dayjs();
      return now.isAfter(dayjs(period.startDateScoreUpload)) && now.isBefore(dayjs(period.endDateScoreUpload));
    };
    const getExtraordinaryPeriods = async () => {
      try {
        let params = {
          periodId: '',
        };
        courseId.value = parseInt(route.params.courseId.toString(), 10);
        let response = await getExtraordinaryGradeperiodsService.run(courseId.value, params);
        extaordinaryData.value = response;
      } catch (e) {
        console.log('error', e);
      }
    };
    const isExtraordinaryScoreUploadOpen = (periodId: number): boolean => {
      const now = dayjs();

      return extaordinaryData.value
        .filter((extra: any) => extra.periodId === periodId)
        .some(({ extendedStartDateTime, extendedEndDateTime }) => {
          const start = dayjs(extendedStartDateTime, 'YYYY-MM-DD HH:mm:ss');
          const end = dayjs(extendedEndDateTime, 'YYYY-MM-DD HH:mm:ss');
          return now.isAfter(start) && now.isBefore(end);
        });
    };

    const isEditingAllowed = (period: any): boolean => {
      console.log('periodperiod', period);

      return isScoreUploadOpen(period) || isExtraordinaryScoreUploadOpen(period.id);
    };
    const getLastPeriod = (): any | null => {
      if (!periods.value.length) return null;

      return periods.value.reduce((prev, current) => {
        return current.order > prev.order ? current : prev;
      });
    };
    const isFinalAverageEditable = (): boolean => {
      const lastPeriod = getLastPeriod();
      if (!lastPeriod) return false;

      return isEditingAllowed(lastPeriod);
    };

    return {
      subtitle,
      loading,
      routes,
      title,

      columns,
      data,
      isQualitativeGrading,
      ratingScales,
      periods,
      openFormModalEditNoteSubjectPeriods,
      openConfirmationByPeriodModal,
      openConfirmationModal,
      closeModalForm,
      openModal,
      currentMatriculateSubjectPeriod,

      save,

      getMatriculateSubjectsWithPaginateAllPeriodNotesService,
      params,
      name,
      isEditingAllowed,
      isFinalAverageEditable,
      profileIdLocalStorage,
    };
  },
});
</script>

<style scoped>
table.custom-table {
  width: 100%;
  border-collapse: collapse;
}

table.custom-table th,
table.custom-table td {
  padding: 0.3rem;
  border: 1px solid #ccc;
}

table.custom-table th {
  background-color: #f0f0f0;
  font-weight: bold;
}

table.custom-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

input[type='number'] {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  max-width: 3.5rem;
}
</style>
