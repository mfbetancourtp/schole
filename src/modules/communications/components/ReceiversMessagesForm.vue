<template>
  <section class="seccion">
    <div class="buttons">
      <h5 class="m-0">Destinatarios</h5>
      <div class="boton-group">
        <AppButtonGroup>
          <AppButton v-if="profileId != null && profileId === 3" label="Agregar grados" outlined @click="openAddReceiverModal(null)"> </AppButton>

          <AppButton v-else label="Agregar" outlined @click="openAddReceiverModal(null)"></AppButton>

          <AppButton label="Agregar funcionarios" outlined @click="openReceMessFormAddOffiModal()"></AppButton>
        </AppButtonGroup>
      </div>
    </div>
    <div class="eliminar">
      <AppButton label="Eliminar todos" outlined @click="deleteAll"></AppButton>
    </div>
  </section>

  <div class="text-center">
    <template v-if="!receivers || (!receivers.courses.length && !receivers.peoples.length && !receivers.students)">
      <p>No se han agregado destinatarios</p>
    </template>

    <div v-else>
      <AppCard class="mt-2" v-for="(course, index) in receivers.courses" :key="index">
        <template #body>
          <div class="text-start">
            <h5 style="font-weight: 400">{{ course.courseName }}</h5>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex justify-content-start gap-4">
              <div class="switch">
                <input class="form-check-input" type="checkbox" id="sendStudents" v-model="course.sendStudents" />
                <label class="form-check-label" for="sendStudents">Estudiantes</label>
              </div>

              <div class="switch">
                <input class="form-check-input" type="checkbox" id="sendParents" v-model="course.sendParents" />
                <label class="form-check-label" for="sendParents">Padres</label>
              </div>

              <div class="switch">
                <input class="form-check-input" type="checkbox" id="sendTeachers" v-model="course.sendTeachers" />
                <label class="form-check-label" for="sendTeachers">Profesores</label>
              </div>
            </div>

            <AppButtonGroup>
              <div class="deleteReceiver">
                <AppButtonDelete @click="deleteReceiver('courses', index)"></AppButtonDelete>

                <AppButton @click="openAddReceiverModal(course.academicPeriodGroupId)" v-tooltip="'Detalle destinatarios'" icon="clipboard-list" outlined></AppButton>
              </div>
            </AppButtonGroup>
          </div>
        </template>
      </AppCard>

      <AppCard class="mt-2" v-for="(student, index) in receivers.students" :key="index">
        <template #body>
          <div class="text-start">
            <h5 style="font-weight: 400">{{ student.fullName }}</h5>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex justify-content-start gap-4">
              <div class="switch">
                <input class="form-check-input" type="checkbox" id="sendStudents" v-model="student.sendStudents" />
                <label class="form-check-label" for="sendStudents">Estudiantes</label>
              </div>

              <div class="switch">
                <input class="form-check-input" type="checkbox" id="sendParents" v-model="student.sendParents" />
                <label class="form-check-label" for="sendParents">Padres</label>
              </div>
            </div>

            <AppButtonGroup>
              <div class="deleteReceiver">
                <AppButtonDelete @click="deleteReceiver('students', index)"></AppButtonDelete>
              </div>
            </AppButtonGroup>
          </div>
        </template>
      </AppCard>

      <AppCard class="mt-2" v-for="(people, index) in receivers.peoples" :key="index">
        <template #body>
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-start">
              <h5 style="font-weight: 400">
                {{ people.fullName }}

                <span style="font-size: 0.9rem">({{ people.email }})</span>
              </h5>

              <p class="m-0 text-muted" style="font-size: 0.9rem" v-if="people.subjects">Profesor(a): {{ people.subjects }}</p>
              <p class="m-0 text-muted" style="font-size: 0.9rem" v-if="people.typeSupervisor">
                {{ people.typeSupervisor }}
              </p>
            </div>

            <AppButtonGroup>
              <AppButtonDelete @click="deleteReceiver('peoples', index)"></AppButtonDelete>
            </AppButtonGroup>
          </div>
        </template>
      </AppCard>
    </div>
  </div>

  <AppModal v-model="addReceiversModal" :size="'lg'">
    <AddReceiversMessagesForm
      v-if="addReceiversModal"
      :is-student-or-parent="isStudentOrParent"
      :academic-period-group-id-form="currentAcademicPeriodGroupId"
      :receivers-temp="receivers"
      @close="closeAddReceiverModal"
    ></AddReceiversMessagesForm>
  </AppModal>

  <AppModal v-model="receMessFormAddOffiModal" :size="'lg'">
    <ReceiversMessagesFormAddOfficers v-if="receMessFormAddOffiModal" :receivers-temp="receivers" @close="closeReceMessFormAddOffiModal"></ReceiversMessagesFormAddOfficers>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watchEffect } from 'vue';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AddReceiversMessagesForm from './AddReceiversMessagesForm.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import ReceiversMessagesFormAddOfficers from './ReceiversMessagesFormAddOfficers.vue';

export default defineComponent({
  name: 'ReceiversMessagesForm',
  components: {
    ReceiversMessagesFormAddOfficers,
    AddReceiversMessagesForm,
    AppButtonDelete,
    AppButtonGroup,
    AppButton,
    AppModal,
    AppCard,
  },

  props: {
    isStudentOrParent: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['updateReceivers'],

  setup(props, { emit }) {
    const receMessFormAddOffiModal = ref(false);
    const addReceiversModal = ref(false);

    const receivers: Ref<{
      courses: any[];
      students: any[];
      peoples: any[];
    } | null> = ref(null);
    const currentAcademicPeriodGroupId = ref<any>(null);

    const getProfileIdFromLocalStorage = () => {
      const profileId = localStorage.getItem('profileId');
      return profileId ? parseInt(profileId) : null;
    };
    const profileId = ref(getProfileIdFromLocalStorage());
    watchEffect(() => {
      profileId.value = getProfileIdFromLocalStorage();
    });
    const openAddReceiverModal = (academicPeriodGroupId: number | null = null) => {
      currentAcademicPeriodGroupId.value = academicPeriodGroupId;
      addReceiversModal.value = true;
    };
    const closeAddReceiverModal = async (receiver: any) => {
      receivers.value = receiver;
      addReceiversModal.value = false;

      emit('updateReceivers', receivers.value);
    };

    const openReceMessFormAddOffiModal = () => {
      receMessFormAddOffiModal.value = true;
    };
    const closeReceMessFormAddOffiModal = async (receiver: any) => {
      receivers.value = receiver;
      receMessFormAddOffiModal.value = false;

      emit('updateReceivers', receivers.value);
    };

    const deleteAll = () => {
      receivers.value = null;

      emit('updateReceivers', {
        courses: [],
        students: [],
        peoples: [],
      });
    };

    const deleteReceiver = (key: 'courses' | 'students' | 'peoples', index: number) => {
      if (receivers.value) {
        if (key == 'courses') receivers.value.courses.splice(index, 1);
        if (key == 'students') receivers.value.students.splice(index, 1);
        if (key == 'peoples') receivers.value.peoples.splice(index, 1);

        emit('updateReceivers', receivers.value);
      }
    };

    return {
      receMessFormAddOffiModal,
      addReceiversModal,
      profileId,

      currentAcademicPeriodGroupId,
      receivers,

      closeReceMessFormAddOffiModal,
      openReceMessFormAddOffiModal,
      closeAddReceiverModal,
      openAddReceiverModal,
      deleteReceiver,
      deleteAll,
    };
  },
});
</script>

<style scoped>
.seccion {
  justify-content: space-between !important;
  display: flex !important;
  flex-wrap: wrap !important;
}

@media screen and (max-width: 720px) {
  .seccion {
    margin-top: 15px;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px;
  }
  .boton-group {
    margin-top: 15px;
  }

  .eliminar {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .buttons {
    margin-top: 5px;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px;
  }

  .switch {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .deleteReceiver {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }
  .form-check-input {
    position: relative;
    left: 18px;
  }
}
</style>
