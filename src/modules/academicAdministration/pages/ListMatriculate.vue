<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template #actions>
     
        <AppButton
          class="buttons"
          @click="openConfirmDelete(checkStore.isCheckData.dataTableSelect)"
          :label="'Eliminar Seleccionados'"
          :native-type="'button'"
           variant="primary"
           style="color: white;"
        ></AppButton>
        <AppButton 
          style="color: white;" 
          label="Agregar" 
          @click="openAddReceiverModal()"
          ></AppButton>

        <AppButtonBack
        :to="{ name: 'academicAdministration.subjectsByCourse' }"
        @click="goBack"
        ></AppButtonBack>

    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
      <AppDatatable
        :service="getEnrolledStudentsServiceByAcademicGroupId"
        :params="params"
        :name="name"
      >
          
        <AppDatatableColumn v-slot="{ row }" :is-check="true"  field="checkbox">
          <input
            class="form-check-input"
            type="checkbox"
            :id="'id' + row.id"
            :checked="isStudentSelected(row)"
            @change="toggleStudentSelection(row)"
          />
        </AppDatatableColumn>

        <AppDatatableColumn
          :label="t('Nombres')"
          field="lastnames"
          :sortable="true"
          v-slot="{ row }"
        >
          <div class="tw-flex person-column" >
            <AppAvatar
              :size="'sm'"
              :name="row.student.person.lastnames ?? '?'"
            ></AppAvatar>
            <div class="tw-min-w-0 tw-ml-4">
              <div class="tw-font-medium ">
                {{ row.student.person.lastnames }}
              </div>
              <div class=" tw-font-light">
                {{ row.student.person.names }}
              </div>
            </div>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn
          :sortable="true"
          :label="t('Identificación')"
          field="Identification"
          v-slot="{ row }"
        >
        <div class="identification-column">
          {{ row.student.person.identification }}
        </div>
        </AppDatatableColumn>

        <AppDatatableColumn class="email-column" :sortable="true" :label="t('Email')" field="email" v-slot="{ row }">
       <div class="email-column">{{ row.student.person.email }}</div>
       </AppDatatableColumn>
        <AppDatatableColumn
          :sortable="true"
          :label="t('Id Estudiante')"
          field="code"
          v-slot="{ row }"
        >
      <div class="code-column"> {{ row.student.code }}</div>
        </AppDatatableColumn>

        <AppDatatableColumn :label="'Acciones'" v-slot="{ row }"   :sortable="true">
          <div class="btn-group">
            <AppCheckPermission
              permission="academicAdministration.matriculates.edit"
            >
              <AppButtonDelete
                @click="openConfirmDelete(row)"
              ></AppButtonDelete>
              
            </AppCheckPermission>
          </div>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
    </template>
  </AppBaseList>

  <AppModal v-model="addReceiversModal" :size="'lg'">
    <AddStudent
      v-if="addReceiversModal"
      @close="closeAddReceiverModal()"
    ></AddStudent>
  </AppModal>

  <AppModal v-model="signatureDelete">
  <AppConfirmDeleteModal
    v-if="signatureDelete"
    entity="Estudiante(s)"
    @confirmDelete="confirmDelete"
    @close="signatureDelete = false"
  ></AppConfirmDeleteModal>
  </AppModal>

</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  Ref,
} from 'vue';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AddStudent from '../components/AddStudents.vue'
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AddReceiversMessagesForm from '../../communications/components/AddReceiversMessagesForm.vue';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetAcademicPeriodGroupsByIdService } from '../services/getAcademicPeriodGroupsById.service';
import { GetMatriculatesBySubjectAssignmentIdService } from '../services/getMatriculatesBySubjectAssignmentId.service';
import { DeleteMatriculateSubjectWithAuditservice } from '../services/deleteMatriculateSubjectWithAudit.service';
import { useCheckDataTableStore } from '../../../stores/checkDataTable.store';
import { useUserStore } from '../../../stores/user';
import { useHeaderStore } from '../../../stores/header.store';

const updateDatatableService = new UpdateDatatableService();
const getAcademicPeriodGroupsByIdService = new GetAcademicPeriodGroupsByIdService();
const deleteMatriculateSubjectWithAuditservice = new DeleteMatriculateSubjectWithAuditservice();

export default defineComponent({
  name: 'ListMatriculate',
  components: {
    AddReceiversMessagesForm,
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonBack,
    AppFormModal,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AddStudent,
    AppButton,
    AppModal,
    AppAvatar,
  },
 
  setup(   ) {
    const title = 'Matriculas';
    const name = 'Matriculas';
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

    const addReceiversModal = ref(false);
    const receivers: Ref<{
      courses: any[];
      students: any[];
      peoples: any[];
    } | null> = ref(null);
    const currentAcademicPeriodGroupId = ref<any>(null);

    const subjectAssignmentId = ref();
    const academicPeriodGroupId = ref();
    const searchValue = ref('');
    const loading = ref(true);
    const selectedStudents: Ref<any[]> = ref([]);
    const signatureDelete = ref(false);
    const selectAllStudents = ref(false);
    const route = useRoute();
    const subtitle = ref();
    const quota = ref();
    const userId = ref();
    const enrolled = ref();
    const { t } = useI18n();
    const checkStore = useCheckDataTableStore();

    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const currentMatriculate: { value: any } = reactive({
      value: null,
    });

    const getEnrolledStudentsServiceByAcademicGroupId = new GetMatriculatesBySubjectAssignmentIdService();
    const params = computed(() => {
      return {
        subjectAssignmentId: subjectAssignmentId.value,
      };
    });

    onMounted(async () => {
      const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Administración académica', url: '' };
        headerStorage.moduleItem = { name: 'Administración de cursos', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };
      const userStore = useUserStore();
      console.log('userStore',userStore?.user?.id);
      userId.value= userStore?.user?.id;
      console.log('store', checkStore.isCheckData);
      academicPeriodGroupId.value = route.params.academicPeriodGroupId;
      subjectAssignmentId.value = route.params.subjectAssignmentId;

      try {
        const response = await getAcademicPeriodGroupsByIdService.run(
          academicPeriodGroupId.value
        );
        quota.value = response.quota;
        enrolled.value = response.enrolled;
        subtitle.value = `${response.degree.level.name} ${response.degree.name} ${response.group.name} ${response.journey.name}`;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const refreshData = () => {
      updateDatatableService.run();
    };



    const isStudentSelected = (row: any) => {
      return  checkStore.isCheckData.dataTableSelect.filter((item:any)=> item.id ===row.id).length>0;
    };

    const toggleStudentSelection = (row: any) => {
      if(checkStore.isCheckData.dataTableSelect.filter((item:any)=> item.id === row.id).length>0){
        checkStore.isCheckData.dataTableSelect = checkStore.isCheckData.dataTableSelect.filter((item:any)=> item.id !== row.id);
      }else {
        checkStore.isCheckData.dataTableSelect = [... checkStore.isCheckData.dataTableSelect, row];
      }
      console.log("Selected students:",  checkStore.isCheckData.dataTableSelect);
    };

    const openConfirmDelete = async (signatureId: any) => {

  signatureDelete.value = true;
  if (Array.isArray(signatureId)) {
    currentDataDelete.value = signatureId;
  } else {
    currentDataDelete.value = [signatureId];
  }
};


const confirmDelete = async () => {
  currentMatriculate.value = currentDataDelete.value;
  console.log('confirmar currentMatriculateDataId:', currentMatriculate.value);
  console.log('currentMatriculate.value[0]?.student.person.userId:', currentMatriculate.value[0]?.student.person.userId);

  try {
    // Verificar si currentMatriculate.value[0]?.student.person.userId es undefined
    if (typeof currentMatriculate.value[0]?.student.person.userId === 'undefined') {
      console.error('Error: UserId es undefined');
      return; // Salir de la función si UserId es undefined
    }

    const data = {
      matriculateId: currentMatriculate.value.map((item: any) => item.id).join(','),
      user: userId.value,
      SubjectAssignment: subjectAssignmentId.value,
    };

    console.log('Datos enviados para eliminación:', data);

    await deleteMatriculateSubjectWithAuditservice.run(data);
    checkStore.isCheckData.dataTableSelect = [];
    refreshData();
  } catch (error) {
    console.error('Error al confirmar eliminación:', error);
  }

  signatureDelete.value = false;
};
const goBack = async () => {
 
    checkStore.isCheckData.dataTableSelect = [];
    checkStore.isCheckData.selectedAll = false;
    refreshData();

  signatureDelete.value = false;
};

const openAddReceiverModal = () => {
      addReceiversModal.value = true;
    };

const closeAddReceiverModal = async () => {
      addReceiversModal.value = false;
      await refreshData();
    };

   
   
    return {
      subtitle,
      loading,
      routes,
      title,
      name,
      t,
      addReceiversModal,
      subjectAssignmentId,
      academicPeriodGroupId,
      currentMatriculate,
      searchValue,
      selectedStudents,
      params,
      getEnrolledStudentsServiceByAcademicGroupId,
      selectAllStudents,
      quota,
      enrolled,
      closeAddReceiverModal,
      openAddReceiverModal,
      openConfirmDelete,
      confirmDelete,
      signatureDelete,
      checkStore,
      isStudentSelected,
      toggleStudentSelection,
      goBack,
    };
  },
});
</script>

<style scoped>
.hover:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.hover-white:hover {
  color: white;
}

.email-column {
  word-break: break-word;
  white-space: normal;
  max-width: 200px; /* Ajusta el ancho máximo según tus necesidades */
  min-width: 100px
}
.identification-column {
  word-break: break-word;
  white-space: normal;
  max-width: 100px; /* Ajusta el ancho máximo según tus necesidades */
  min-width: 80px; /* Ajusta el ancho máximo según tus necesidades */
}
.code-column {
  word-break: break-word;
  white-space: normal;
  max-width: 100px; /* Ajusta el ancho máximo según tus necesidades */
  min-width: 80px; /* Ajusta el ancho máximo según tus necesidades */
}
.person-column {
  word-break: break-word;
  white-space: normal;
  max-width: 170px; /* Ajusta el ancho máximo según tus necesidades */
  min-width: 150px; /* Ajusta el ancho máximo según tus necesidades */
}
</style>
