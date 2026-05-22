<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'administration.courseSchedule' }"></AppButtonBack>

      <AppButton style="color: white;" label="Agregar estudiantes" @click="openCourScheEnroForm"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppCard>
          <template #body>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th class="col-4">Apellidos y Nombres</th>
                    <th class="col-2">Identificación</th>
                    <th class="">Curso</th>
                    <th class="col-3">Email</th>
                    <th class="c-1 text-center">Opc</th>
                  </tr>
                </thead>

                <tbody>
                  <template v-if="!courseInscriptions?.courseInscriptions.length">
                    <tr>
                      <td colspan="5">
                        <AppEmptyResponse :show-image="false"></AppEmptyResponse>
                      </td>
                    </tr>
                  </template>

                  <tr v-else v-for="(inscription, index) in courseInscriptions.courseInscriptions" :key="index">
                    <td class="p-1 pe-0">
                      {{ `${inscription.people.lastnames ?? ''} ${inscription.people.names ?? ''}` }}
                    </td>

                    <td class="p-1 pe-0">
                      {{ inscription.people.identification ?? '' }}
                    </td>

                    <td class="p-1 pe-0">{{ `${inscription.courseGroup}` }}</td>

                    <td class="p-1 pe-0">{{ inscription.people.email }}</td>

                    <td class="p-1 pe-0 text-center">
                      <AppButtonDelete @click="openConfirmDelete(inscription)"></AppButtonDelete>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </AppCard>
        <AppModal v-model="courScheEnroFormModal" :size="'lg'">
          <CourseScheduleEnrolledForm v-if="courScheEnroFormModal && subjectAssignmentId" :quota="quota"
            :courseId="courseId" :period-id="periodId" :academic-period-id="academicPeriodId"
            :subject-assignment-id="subjectAssignmentId" @close="closeCourScheEnroForm"></CourseScheduleEnrolledForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="Inscripción" @confirmDelete="confirmDelete()"
            @close="modalDelete = false"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import CourseScheduleEnrolledForm from '../components/CourseScheduleEnrolledForm.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { DeleteCourseInscriptionsService } from '../services/deleteCourseInscriptions.service';
import { GetCourseInscriptionsService } from '../services/getCourseInscriptions.service';
import AppCard from '../../../shared/components/Card/AppCard.vue';

const getCourseInscriptionsService = new GetCourseInscriptionsService();
const deleteCourseInscriptionsService = new DeleteCourseInscriptionsService();

export default defineComponent({
  name: 'CourseScheduleEnrolled',
  components: {
    CourseScheduleEnrolledForm,
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const courseId = parseInt(route.params.courseId.toString(), 10);

    useMeta({ title: t('Inscritos') });
    const routes = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'administration.courseSchedule' },
      },
      {
        name: 'Inscritos',
      },
    ];
    const courseInscriptions: Ref<any> = ref(null);
    const quota: Ref<number | null> = ref(null);
    const title: Ref<string> = ref('Inscritos');
    const currentData: Ref<any> = ref(null);

    const subjectAssignmentId = ref();
    const academicPeriodId = ref();
    const periodId = ref();

    const courScheEnroFormModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        if (route.query.academicPeriodId) {
          academicPeriodId.value = parseInt(route.query.academicPeriodId.toString(), 10);
        }

        await getCourInscriptionsEmployees();

        if (courseInscriptions.value) {
          periodId.value = courseInscriptions.value.courseData.periodId;
          title.value = `Inscritos ${courseInscriptions.value.courseData.name}`;
          subjectAssignmentId.value = courseInscriptions.value.courseData.subjectAssignmentId;
        }
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Cronograma de cursos', url: '' };
        headerStorage.moduleSubItem = { name: title.value, url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getCourInscriptionsEmployees = async () => {
      courseInscriptions.value = await getCourseInscriptionsService.run(courseId);
      if (courseInscriptions.value.courseData.quota != null) {
        quota.value = courseInscriptions.value.courseData.quota - courseInscriptions.value.courseInscriptions.length;
        quota.value = quota.value < 0 ? 0 : quota.value;
        quota.value = null;
      }
    };

    const openCourScheEnroForm = () => {
      if (academicPeriodId.value) {
        courScheEnroFormModal.value = true;
      }
    };
    const closeCourScheEnroForm = async () => {
      await getCourInscriptionsEmployees();
      courScheEnroFormModal.value = false;
    };

    const openConfirmDelete = async (data: any) => {
      currentData.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentData.value) await deleteCourseInscriptionsService.run(currentData.value.id);
      await getCourInscriptionsEmployees();
      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      courScheEnroFormModal,
      subjectAssignmentId,
      courseInscriptions,
      academicPeriodId,
      modalDelete,
      periodId,
      courseId,
      quota,

      closeCourScheEnroForm,
      openCourScheEnroForm,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped></style>
