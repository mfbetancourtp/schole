<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.enrolledByCourse' }" />

      <AppButton style="color: white" :disabled="!periods.length" @click="save()" label="core.save" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />
      <template v-else>
        <template v-if="!periods.length">
          <AppEmptyResponse :subtitle="false" :showImage="true" />
        </template>

        <div v-else class="card-body bg-white table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th rowspan="2" class="w-50">Asignatura</th>

                <template v-for="(item, index) in periods" :key="index">
                  <th colspan="2" class="text-center">
                    {{ item.name }}

                    <!-- <div>
                    <input class="form-check-input" type="checkbox" v-model="checkByPeriods[`periodId_${item.id}`]" @click="openConfirmationByPeriodModal(item.id)" />
                  </div> -->
                  </th>
                </template>
                <th colspan="2" class="text-center">PROMEDIO FINAL POR ASIGNATURA</th>
              </tr>

              <tr>
                <template v-for="index in periods.length" :key="index">
                  <th class="text-center">Nota Final</th>
                  <!-- <th class="text-center">
                  <AppIcon class="ms-1 me-1" icon="sync" v-tooltip="'Sincronizar'" />
                </th> -->
                  <th></th>
                </template>

                <th class="text-center">Nota Final</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(element, index) in data" :key="index">
                <td>{{ element.subject.name }}</td>

                <template v-for="(item, index) in element.periods" :key="index">
                  <td>
                    <div
                      class="d-flex justify-content-center"
                      :style="{
                        backgroundColor: item.matriculateSubjectPeriod?.isEdit === 1 ? '#ffaa' : 'unset',
                      }"
                    >
                      <template v-if="isQualitativeGrading">
                        {{ item.matriculateSubjectPeriod.finalPeriodConvert?.qualitativeQualificationAbbreviation ?? '' }}
                      </template>
                      <template v-else>
                        {{ item.matriculateSubjectPeriod.finalPeriod }}
                      </template>
                    </div>
                  </td>

                  <!-- <td>
                  <div class="d-flex justify-content-center">
                    <input v-model="item.matriculateSubjectPeriod.isUpdate" class="form-check-input" type="checkbox" @click="openConfirmationModal(item.matriculateSubjectPeriod)" />
                  </div>
                </td> -->
                  <td>
                    <div class="d-flex justify-content-center">
                      <AppButtonEdit @click="openFormModalEditNoteSubjectPeriods(item.matriculateSubjectPeriod)"> </AppButtonEdit>
                    </div>
                  </td>
                </template>
                <td class="final-average">
                  <div class="d-flex justify-content-center">
                    {{ element.finalQuality ?? '—' }}
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>PROMEDIO ACUMULADO</strong></td>
                <template v-for="(item, index) in periods" :key="index">
                  <td colspan="2" class="text-center">
                    <strong> {{ item.average }}</strong>
                  </td>
                </template>

                <td colspan="1" class="text-center">
                  <strong> {{ data[0]?.averageValuePeriodYear ?? '—' }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppModal v-model="openModal">
          <SubjectNotesFormEdit v-if="openModal" :data="currentMatriculateSubjectPeriod" @close="closeModalForm" :isQualitativeGrading="isQualitativeGrading" :ratingScales="ratingScales" />
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, ref, Ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import SubjectNotesFormEdit from '../components/SubjectNotesFormEdit.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';

import { MatriculateSubjectDto } from '../dto/matriculateSubject.dto';

import { GetMatriculateSubjectsWithNotesService } from '../services/getMatriculateSubjectsWithNotes.service';
import { CreateOrUpdateMatriculateSubjectPeriodsFromStudentArrayService } from '../services/createOrUpdateMatriculateSubjectPeriodsFromStudentArray.service';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateMatriculateSubjectPeriodsFromStudentArrayService = new CreateOrUpdateMatriculateSubjectPeriodsFromStudentArrayService();
const getMatriculateSubjectsWithNotesService = new GetMatriculateSubjectsWithNotesService();

export default defineComponent({
  name: 'NotesByStudent',
  components: {
    AppButton,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButtonEdit,
    SubjectNotesFormEdit,
    AppModal,
  },

  setup() {
    const title = 'Calificaciones por Estudiante';
    useMeta({ title: title });
    const routes = [
      {
        name: 'Administración de Cursos',
        url: {
          name: 'academicAdministration.courseAdministration',
        },
      },
      {
        name: 'Matriculados',
        url: {
          name: 'academicAdministration.enrolledByCourse',
        },
      },
      {
        name: title,
      },
    ];

    const data: Ref<any[]> = ref([]);
    const ratingScales: Ref<any[]> = ref([]);
    const isQualitativeGrading = ref();
    const matriculateId = ref();
    const loading = ref(true);
    const route = useRoute();

    const periods: Ref<any[]> = ref([]);
    const columns: { value: any[] } = reactive({
      value: [],
    });
    const subtitle: Ref<string> = ref('');
    console.log('subtitle', subtitle.value);

    const openModal = ref(false);
    const currentMatriculateSubjectPeriod: Ref<any> = ref(null);
    const checkByPeriods: Ref<any> = ref({});
    const showConfirmationByPeriodModal = ref(false);
    const showConfirmationModal = ref(false);
    const currentCheckPeriod: Ref<any> = ref(null);

    onMounted(async () => {
      try {
        matriculateId.value = route.params.matriculateId;
        await getData();

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Administración académica', url: '' };
        headerStorage.moduleItem = {
          name: 'Administración de cursos',
          url: '',
        };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        periods.value.forEach((period) => {
          columns.value.push(period.name);
        });
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getData = async () => {
      const response = await getMatriculateSubjectsWithNotesService.run(matriculateId.value);
      const responseData = response.data ?? response;
      const matriculate = responseData.matriculate ?? {};
      const student = matriculate.student ?? responseData.student ?? {};

      periods.value = (responseData.periods ?? []).map((period: any) => normalizePeriod(period));
      data.value = (responseData.matriculateSubjects ?? []).map((matriculateSubject: any) => normalizeMatriculateSubject(matriculateSubject, matriculate));
      ratingScales.value = responseData?.ratingScales ?? [];
      isQualitativeGrading.value = responseData.isQualitativeGrading ?? 0;

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

      subtitle.value = `${student.people?.names ?? ''} ${student.people?.lastnames ?? ''}`.trim();
    };

    const normalizePeriod = (period: any) => {
      const periodId = period.period?.id ?? period.periodId ?? period.id;

      return {
        ...period,
        id: periodId,
        curriculumOfferingPeriodId: period.id,
        name: period.name ?? period.period?.name ?? '—',
        average: period.average ?? '—',
      };
    };

    const buildEmptyMatriculateSubjectPeriod = (matriculateSubject: any, period: any, matriculate: any) => {
      const periodId = period.period?.id ?? period.periodId ?? period.id;

      return {
        id: null,
        institutionId: matriculate.institutionId ?? null,
        matriculateSubjectId: matriculateSubject.id,
        periodId,
        finalPeriod: null,
        retrievalPeriod: null,
        isEdit: 0,
        isUpdate: 1,
        lack: null,
        observation: null,
        comment: null,
        createdAt: null,
        updatedAt: null,
        systemFinalPeriod: null,
        teacherFinalPeriod: null,
        _isNew: true,
      };
    };

    const normalizeMatriculateSubject = (matriculateSubject: any, matriculate: any) => {
      return {
        ...matriculateSubject,
        periods: (matriculateSubject.periods ?? []).map((period: any) => {
          const periodId = period.period?.id ?? period.periodId ?? period.id;
          const matriculateSubjectPeriod = period.matriculateSubjectPeriod ?? buildEmptyMatriculateSubjectPeriod(matriculateSubject, period, matriculate);

          return {
            ...period,
            id: periodId,
            curriculumOfferingPeriodId: period.id,
            name: period.name ?? period.period?.name ?? '—',
            matriculateSubjectPeriod: {
              ...matriculateSubjectPeriod,
              matriculateSubjectId: matriculateSubjectPeriod.matriculateSubjectId ?? matriculateSubject.id,
              periodId: matriculateSubjectPeriod.periodId ?? periodId,
              isEdit: matriculateSubjectPeriod.isEdit ?? 0,
              isUpdate: matriculateSubjectPeriod.isUpdate ?? 1,
            },
          };
        }),
      };
    };

    const openFormModalEditNoteSubjectPeriods = async (matriculateSubjectPeriod: any) => {
      currentMatriculateSubjectPeriod.value = matriculateSubjectPeriod;
      openModal.value = true;
    };

    const closeModalForm = async () => {
      openModal.value = false;
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

      console.log('esta aca', currentMatriculateSubjectPeriod.value);
    };

    const save = async () => {
      let dataSend: any[] = [];

      const matriculateSubjects: MatriculateSubjectDto[] = data.value;

      matriculateSubjects.forEach((matriculateSubject) => {
        const matriculateSubjectPeriods = matriculateSubject.periods
          .map((period: any) => period.matriculateSubjectPeriod)
          .filter((period: any) => period && (!period._isNew || period.finalPeriod !== null || period.comment));

        dataSend = [...dataSend, ...matriculateSubjectPeriods];
      });

      try {
        await createOrUpdateMatriculateSubjectPeriodsFromStudentArrayService.run(dataSend);
        await getData();
      } catch (e) {
        console.log('error', e);
      }
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
