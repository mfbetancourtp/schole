<template>
  <form @submit.prevent="save">
  <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>

        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              class="nav-link active text-capitalize"
              data-bs-target="#courses"
              aria-controls="courses"
              data-bs-toggle="tab"
              aria-selected="true"
              id="courses-tab"
              type="button"
              role="tab"
              @click="activeTab = 'courses'"
            >
              {{ t('Estudiantes') }}
            </button>

          </div>
        </nav>

        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" aria-labelledby="courses-tab" role="tabpanel" id="courses">


            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="allStudents" v-model="allStudentsChecked" />
              <label class="form-check-label" for="allStudents">Todos</label>
            </div>
        
            <template v-for="(Students, index) in receiversByCourse.courseInscriptions" :key="index">
    
              <div class="form-check" >
              <input class="form-check-input" type="checkbox" :value="Students" v-model="receiversStudents" :id="`${index}_students`" />
              <label :for="`${index}_students`" class="form-check-label">{{ Students.people.names}} {{ Students.people.lastnames}} </label>
              </div>
                  
          </template>
          </div>
          
        </div>
      </div>
    </template>

    <template v-slot:actions>
      <AppButton label="core.save"></AppButton>
    </template>
  </AppFormModal>
</form>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';


import { GetAllStudentsService } from '../services/getAllStudents.service';
import { PostAllStudentsService } from "../services/postAllStudents.service";

const getAllStudentsService = new GetAllStudentsService();
const postAllStudentsService= new PostAllStudentsService();

export default defineComponent({
  name: 'AddReceiversMessagesForm',
  components: {
    AppFormModal,
    AppLoading,
    AppButton,
  },


  setup( props, { emit }) {
    const { t } = useI18n();
    const title = 'Agregar Estudiantes';
    const route = useRoute();
    const router = useRouter();
    const receiversByCourse = ref(null);
    const receiversStudents = ref([]);
    const allStudents = ref([]);
    const allStudentsChecked = ref(false);
    const activeTab = ref('courses');
    const subjectAssignmentId = ref();
    const loading = ref(true);

    onMounted(async () => {
      try {

        subjectAssignmentId.value = route.params.subjectAssignmentId;
        receiversByCourse.value = await getAllStudentsService.run(subjectAssignmentId.value);
        }
     catch (e) {
        console.log(e);
      }

      loading.value = false;
    });


    
    watch(allStudentsChecked, async (value) => {
      if (value) {
        const allStudentsIds = receiversByCourse.value.courseInscriptions.map((Students: any) => Students);
        receiversStudents.value = [...allStudentsIds];
      } else {
        receiversStudents.value = [];
      }
    });

    

   const save = async () => {
  try {
    subjectAssignmentId.value = route.params.subjectAssignmentId;

    const dataForm = receiversStudents.value.map((student: any) => ({
      matriculate: {
        academicPeriodGroupId: student.matriculate.academicPeriodGroupId,
        id: student.matriculate.id,
        subjectAssignmentId: Number(subjectAssignmentId.value),
      },
      student: {
        id: student.student.id,
      },
      people: {
        id: student.people.id,
        userId: student.people.userId,
      },
    }));

 
    await postAllStudentsService.run(dataForm);

   
    await router.push({
      name: 'academicAdministration.listMatriculate',
    });
    emit('close');
  } catch (e) {
    console.error(e);
  }
};
    return {
      loading,
      title,
      t,
      emit,
      save,
      receiversByCourse,
      allStudents,
      receiversStudents,
      allStudentsChecked,
      activeTab,
    
    };
  },
});
</script>

<style scoped>
.form-check-input {
  position: relative;
  left: 10px;
}

.form-check-label {
  position: relative;
  left: 10px;
}
</style>
