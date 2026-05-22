<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.courseAdministration' }"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppEmptyResponse v-if="empty" :show-image="true"></AppEmptyResponse>

        <div class="grid-cards">
          <AppCard v-for="item in dataCards.value" :key="item.id">
            <template #title>
              <div class="asignaments">
                <AppBadge :variant="'primary'" :label="'Asignaturas'"></AppBadge>
              </div>
              <div>{{ item.curriculumSubject?.subject?.name }}</div>
            </template>
            <template #body>
              <div class="pt-2">
                <h6>Profesor</h6>
                <div class="d-flex align-items-center" style="color: #6c757d">
                  <AppIcon class="icon-size-8 m-1" icon="graduation-cap"></AppIcon>

                  <p class="m-0" style="font-size: 0.9rem">
                    {{ item.teacherPeople.names }}
                    {{ item.teacherPeople.lastnames }}
                  </p>
                </div>
                <div class="d-flex align-items-center mt-2" style="color: #6c757d">
                  <AppIcon class="icon-size-8 m-1" icon="envelope"></AppIcon>

                  <p class="m-0 ps-1" style="font-size: 0.9rem">
                    {{ item.teacherPeople?.email }}
                  </p>
                </div>
                <div class="d-flex align-items-center mt-2" style="color: #6c757d">
                  <AppIcon class="icon-size-8 m-1 me-0" icon="users"></AppIcon>

                  <p class="m-0 ps-1" style="font-size: 0.9rem">Estudiantes : {{ item.studentsAmount }}</p>
                </div>
                <div class="d-flex align-items-center mt-2" style="color: #6c757d">
                  <AppIcon class="icon-size-8 m-1" icon="bookmark"></AppIcon>

                  <p class="m-0 ps-1" style="font-size: 0.9rem">Periodos : {{ item.periodsWithNotes }}/{{
                    item.totalPeriods }}</p>
                </div>
              </div>
            </template>

            <template #footer>
             
              <div class="p-2 d-flex justify-content-end">

              <AppCheckPermission permission="academicAdministration.listMatriculate.list">
              <AppButton v-tooltip="'Ver Matriculas'" variant="primary" icon="graduation-cap" outlined :to="{
                  name: 'academicAdministration.listMatriculate',
                  params: {
                    academicPeriodGroupId: academicPeriodGroupId,
                    subjectAssignmentId: item.id,
                  },
                }"></AppButton>
              </AppCheckPermission>

              <AppCheckPermission permission="academicAdministration.notesByPeriod.list">
                <AppButton v-tooltip="'Ver Calificaciones'" variant="primary" icon="clipboard-list" outlined :to="{
                  name: 'academicAdministration.notesByPeriod',
                  params: {
                    academicPeriodGroupId: academicPeriodGroupId,
                    subjectAssignmentId: item.id,
                  },
                }"></AppButton>
              </AppCheckPermission>

              <AppButtonDelete @click="openConfirmDelete(item)" ></AppButtonDelete>

              <AppModal v-model="signatureDelete">
                <AppConfirmDeleteModal v-if="signatureDelete" :entity="'Asignatura'"
                @confirmDelete="confirmDelete"  @close="signatureDelete = false"></AppConfirmDeleteModal>
              </AppModal>

              </div>

            </template>
          </AppCard>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { GetSubjectsByCourseService } from '../services/getSubjectsByCourse.service';
import { GetSubjectAssignmentsRelatedDataFormService } from '../services/getSubjectAssignmentsRelatedDataForm.service';
import {DeleteCurriculumSubjectWithAuditservice} from '../services/deleteCurriculumSubjectWithAudit.service';
import { GetInitDataService } from '../../../shared/services/getInitData.service';
import { useHeaderStore } from '../../../stores/header.store';

const getSubjectAssignmentsRelatedDataFormService = new GetSubjectAssignmentsRelatedDataFormService();
const getSubjectsByCourseService = new GetSubjectsByCourseService();
const deleteCurriculumSubjectWithAuditService = new DeleteCurriculumSubjectWithAuditservice();
const getInitDataService = new GetInitDataService();


export default defineComponent({
  name: 'SubjectsByCourse',
  components: {
    AppConfirmDeleteModal,
    AppButtonDelete,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppBadge,
    AppModal,
    AppIcon,
    AppCard,
  },

  setup() {
    const title = 'Asignaturas por Curso';
    useMeta({ title: title });
    const routes = [
      {
        name: 'Administración de Cursos',
        url: {
          name: 'academicAdministration.courseAdministration',
        },
      },
      {
        name: title,
      },
    ];

    const academicPeriodGroupId = ref();
    const currentCourse = ref();
    const currentGroup = ref();
    const loading = ref(true);
    const route = useRoute();
    const empty = ref(true);
    const subtitle = ref();
    const signatureDelete = ref(false);
    const currentDataDelete: { value: any } = reactive({
      value: null,   });
    const user: { value: any } = reactive({
        value: null,   });

    const dataCards: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        academicPeriodGroupId.value = parseInt(route.params.academicPeriodGroupId.toString(), 10);

        let response = await getSubjectAssignmentsRelatedDataFormService.run(academicPeriodGroupId.value);
        currentGroup.value = response.academicPeriodGroup.group.name;
        currentCourse.value = response.academicPeriodGroup.degree.name;
        subtitle.value = `${currentCourse.value} ${currentGroup.value}`;

        const headerStorage = useHeaderStore();
        headerStorage.moduleSubItem = { name: title, url: '' };

        let params = {
          academicPeriodGroupId: academicPeriodGroupId.value,
        };

        dataCards.value = await getSubjectsByCourseService.run(params);
        empty.value = dataCards.value.length ? false : true;
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const openConfirmDelete = async (signatureId: any) => {
      signatureDelete.value = true;
      currentDataDelete.value = signatureId;
      
    };

    const confirmDelete = async () => {
    
      
      try {
        const response = await getInitDataService.run();
        user.value = response.user.id;
        
        await deleteCurriculumSubjectWithAuditService.run(currentDataDelete.value.
        curriculumSubject.id, user.value);
      

        console.log('Respuesta de confirmación de eliminación:');
      } catch (error) {
        console.error('Error al confirmar eliminación:', error);
      }
      signatureDelete.value = false;
     
      
    };

    return {
      subtitle,
      loading,
      routes,
      title,

      academicPeriodGroupId,
      dataCards,
      empty,

      openConfirmDelete,
      confirmDelete,
      signatureDelete,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 3rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

.asignaments {
  margin-bottom: 10px;
}
</style>
