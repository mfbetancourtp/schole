<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack @click="goBack"></AppButtonBack>

      <AppButton style="color: white" label="core.save" @click="saveQualifications()"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppCard v-if="dataActivitiesQualify">
          <template #body>
            <h5 style="font-weight: 400">
              {{ dataActivitiesQualify.category ? `${dataActivitiesQualify.category}:` : '' }}
              {{ dataActivitiesQualify.name }}
            </h5>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th class="col-4">
                      {{ t('core.generalTerms.academic.student.singular') }}
                    </th>
                    <th class="col-1 text-center">{{ t('Nota Actividad') }}</th>
                    <th class="col-3">{{ t('Retroalimentación') }}</th>
                    <th>{{ t('Medallas') }}</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(student, index) in students" :key="index">
                    <td class="align-middle">{{ student.name }}</td>
                    <td class="align-middle">
                      <input v-if="!ratingScalesList.length" v-model="student.delivery.quality" class="form-control" type="number" />
                      <AppAutocomplete
                        v-else
                        v-model="student.delivery.qualificationConvert.qualitativeQualification"
                        class="app-autocomplete-fixed"
                        :options="ratingScalesList"
                        :reduce="(ratingScale: any) => ratingScale.description"
                        label="description"
                      />
                    </td>
                    <td class="align-middle">
                      <AppVoiceInput v-model="student.delivery.feedback" textareaClass="form-control" :rows="2"></AppVoiceInput>
                    </td>
                    <td class="align-middle">
                      <div class="d-flex align-items-center">
                        <template v-for="(medal, index) in medals" :key="index">
                          <div v-for="(medalId, index2) in student.medalsIds" :key="index2">
                            <img v-if="medal.id === medalId" :src="medal.urlImage" :alt="'Medalla de ' + medal.name" style="height: 3rem; width: 3rem; margin: 0 auto" />
                          </div>
                        </template>

                        <AppButton @click="openSelectMedalsModal(student)" v-tooltip="'Agregar medallas'" :icon="student.medalsIds.length ? 'edit' : 'plus'" outlined></AppButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>

        <AppModal v-model="selectMedalsModalModal" :size="'lg'">
          <SelectMedals
            v-if="selectMedalsModalModal && currentStudent && dataActivitiesQualify"
            :activity-id="activityId"
            :period-id="dataActivitiesQualify.periodId"
            :medals="medals"
            :students="students"
            :student="currentStudent"
            @close="closeSelectMedalsModal"
          ></SelectMedals>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import SelectMedals from '../components/SelectMedals.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { MedalDto } from '../dtos/qualifyActivity.dto';
import { StudentDto } from '../dtos/qualifyActivity.dto';
import { QualifyActivityDto } from '../dtos/qualifyActivity.dto';

import { GetActivitiesQualifyService } from '../services/getActivitiesQualify.service';
import { PostActivitiesQualifyService } from '../services/postActivitiesQualify.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

const postActivitiesQualifyService = new PostActivitiesQualifyService();
const getActivitiesQualifyService = new GetActivitiesQualifyService();

export default defineComponent({
  name: 'QualifyActivity',
  components: {
    AppButtonBack,
    SelectMedals,
    AppBaseList,
    AppLoading,
    AppModal,
    AppButton,
    AppCard,
    AppAutocomplete,
    AppVoiceInput,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const title = 'Calificar Actividad';
    const courseId = ref();

    const routes: any = [{ name: title }];
    useMeta({ title: title });

    const dataActivitiesQualify: Ref<QualifyActivityDto | null> = ref(null);
    const currentStudent: Ref<StudentDto | null> = ref(null);
    const students: Ref<StudentDto[]> = ref([]);
    const medals: Ref<MedalDto[]> = ref([]);
    const subtitle: Ref<string> = ref('');

    const activityId = ref();

    const ratingScalesList: Ref<any[]> = ref([]);
    const selectMedalsModalModal = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        courseId.value = parseInt(route.params.courseId.toString(), 10);
        activityId.value = parseInt(route.params.activityId.toString(), 10);

        await loadData();

        if (dataActivitiesQualify.value) {
          medals.value = dataActivitiesQualify.value.medals;
          subtitle.value = `Curso: ${dataActivitiesQualify.value.degreeName} - ${dataActivitiesQualify.value.courseName}`;
        }

        routes.unshift(
          {
            name: `${t('core.start')} (${t('core.generalTerms.academic.teacher.plural')})`,
            url: { name: 'administration.homeTeacher' },
          },
          {
            name: `${t('core.menu.studentActivities')} (${t('core.generalTerms.academic.teacher.plural')})`,
            url: {
              name: 'administration.homeTeacher.activities',
            },
          }
        );
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const goBack = () => {
      router.go(-1);
    };

    const loadData = async () => {
      dataActivitiesQualify.value = await getActivitiesQualifyService.run(activityId.value);
      students.value = dataActivitiesQualify.value.students.map((student) => ({
        ...student,
        delivery: {
          ...student.delivery,
          qualificationConvert: student.delivery.qualificationConvert || {},
        },
      }));
      ratingScalesList.value = dataActivitiesQualify.value?.scales;
    };

    const openSelectMedalsModal = (student: StudentDto) => {
      currentStudent.value = student;
      selectMedalsModalModal.value = true;
    };
    const closeSelectMedalsModal = async () => {
      selectMedalsModalModal.value = false;
      await loadData();
    };
    const saveQualifications = async () => {
      if (dataActivitiesQualify.value) {
        students.value.forEach((student) => {
          if (!student.delivery.feedback) student.delivery.feedback = null;
          if (student.delivery?.qualificationConvert?.qualitativeQualification) {
            const quantitativeQualification = ratingScalesList.value.find((item: any) => item.description === student.delivery.qualificationConvert.qualitativeQualification);
            student.delivery.quality = quantitativeQualification?.maximumValue ?? null;
          }
        });

        let dataSend = {
          courseId: courseId.value,
          activityId: activityId.value,
          periodId: dataActivitiesQualify.value.periodId,
          students: students.value,
        };

        try {
          await postActivitiesQualifyService.run(dataSend);
        } catch (e) {
          console.log(e);
        }
      }
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      t,

      selectMedalsModalModal,
      dataActivitiesQualify,
      currentStudent,
      activityId,
      students,
      medals,

      closeSelectMedalsModal,
      openSelectMedalsModal,
      saveQualifications,
      ratingScalesList,
      goBack,
    };
  },
});
</script>

<style scoped>
.app-autocomplete-fixed {
  min-width: 160px !important;
}
</style>
