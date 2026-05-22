<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'training.courseSchedule' }"></AppButtonBack>

      <AppButton style="color: white;" :disabled="!quotasAvailable" label="Agregar colaboradores" @click="openCourScheEnroForm"></AppButton>
    </template>

    <template v-slot:content>
      <table class="table bg-white">
        <thead>
          <tr>
            <th class="p-1 pe-0 col-3">Nombres y Apellidos</th>
            <th class="p-1 pe-0">Identificación</th>
            <th class="p-1 pe-0">Unidad Organizacional - Cargo</th>
            <th class="p-1 pe-0 col-2">Email</th>
            <th class="p-1 pe-0 col-1 text-center">Opc</th>
          </tr>
        </thead>

        <tbody>
          <template v-if="!courseInscriptionsEmployees?.courseInscriptions.length">
            <tr>
              <td colspan="5">
                <AppEmptyResponse :show-image="false"></AppEmptyResponse>
              </td>
            </tr>
          </template>

          <tr v-else v-for="(inscription, index) in courseInscriptionsEmployees.courseInscriptions" :key="index">
            <td class="p-1 pe-0">
              {{ `${inscription.people.names ?? ''} ${inscription.people.lastnames ?? ''}` }}
            </td>
            <td class="p-1 pe-0">
              {{ inscription.people.identification ?? '' }}
            </td>
            <td class="p-1 pe-0">
              {{ `${inscription.OrganizationalUnitName} - ${inscription.organizationalJobName}` }}
            </td>
            <td class="p-1 pe-0">{{ inscription.people.email }}</td>
            <td class="p-1 pe-0 text-center">
              <AppButtonDelete @click="openConfirmDelete(inscription)"></AppButtonDelete>
            </td>
          </tr>
        </tbody>
      </table>

      <AppModal v-model="courScheEnroFormModal" :size="'lg'">
        <CourseScheduleEnrolledForm v-if="courScheEnroFormModal" :courseId="courseId" :quotas-available="quotasAvailable" @close="closeCourScheEnroForm"></CourseScheduleEnrolledForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Inscripción" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
      </AppModal>
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

import { DeleteCourseInscriptionsService } from '../services/deleteCourseInscriptions.service';
import { GetCourseInscriptionsEmployeesService } from '../services/getCourseInscriptionsEmployees.service';
import { useHeaderStore } from '../../../stores/header.store';

const getCourseInscriptionsEmployeesService = new GetCourseInscriptionsEmployeesService();
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
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const courseId = parseInt(route.params.courseId.toString(), 10);

    useMeta({ title: t('Inscritos') });
    const routes = [
      {
        name: 'Cronograma de cursos',
        url: { name: 'training.courseSchedule' },
      },
      {
        name: 'Inscritos',
      },
    ];

    const courseInscriptionsEmployees: Ref<any> = ref(null);
    const title: Ref<string> = ref('Inscritos');
    const currentData: Ref<any> = ref(null);

    const courScheEnroFormModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);
    const quotasAvailable = ref<number>(0);

    onMounted(async () => {
      try {
        await getCourInscriptionsEmployees();

        if (courseInscriptionsEmployees.value) {
          title.value = `Inscritos ${courseInscriptionsEmployees.value.courseData.name}`;
        }
        await countInscriptionsEnabled();

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Capacitación', url: '' };
        headerStorage.moduleItem = { name: 'Cronograma de cursos', url: '' };
        headerStorage.moduleSubItem = { name: title.value, url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    const countInscriptionsEnabled = async () => {
      let quota = courseInscriptionsEmployees.value.courseData.quota;
      let countInscriptions = courseInscriptionsEmployees.value.courseInscriptions.length;
      quotasAvailable.value = quota - countInscriptions;
    };

    const getCourInscriptionsEmployees = async () => {
      courseInscriptionsEmployees.value = await getCourseInscriptionsEmployeesService.run(courseId);
    };

    const openCourScheEnroForm = () => {
      courScheEnroFormModal.value = true;
    };
    const closeCourScheEnroForm = async () => {
      await getCourInscriptionsEmployees();
      await countInscriptionsEnabled();

      courScheEnroFormModal.value = false;
    };

    const openConfirmDelete = async (data: any) => {
      currentData.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentData.value) await deleteCourseInscriptionsService.run(currentData.value.id);

      await getCourInscriptionsEmployees();
      await countInscriptionsEnabled();

      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      courseInscriptionsEmployees,
      courScheEnroFormModal,
      modalDelete,
      courseId,

      closeCourScheEnroForm,
      openCourScheEnroForm,
      openConfirmDelete,
      confirmDelete,
      quotasAvailable,
    };
  },
});
</script>

<style scoped>
.table td {
  vertical-align: middle;
  text-align: center;
}

.table tr {
  vertical-align: middle;
  text-align: center;
}
</style>
