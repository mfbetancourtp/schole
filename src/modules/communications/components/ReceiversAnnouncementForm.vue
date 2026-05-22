<template>
  <section class="d-flex justify-content-between">
    <div class="d-flex align-items-center gap-2">
      <h5 class="m-0">Destinatarios</h5>

      <AppButtonGroup>
        <AppButton v-if="!isStudentOrParent" label="Agregar grados" outlined @click="openAddReceiverModal(null)"></AppButton>

        <AppButton v-else label="Agregar" outlined @click="openAddReceiverModal(null)"></AppButton>
      </AppButtonGroup>
    </div>

    <AppButton label="Eliminar todos" outlined @click="deleteAll"></AppButton>
  </section>

  <div class="text-center">
    <template v-if="!receivers || (!receivers.courses.length && !receivers.students)">
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
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" :id="`sendStudents-${index}`" v-model="course.sendStudents" />
                <label class="form-check-label" :for="`sendStudents-${index}`">Estudiantes</label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" :id="`sendParents-${index}`" v-model="course.sendParents" />
                <label class="form-check-label" :for="`sendParents-${index}`">Padres</label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" :id="`sendTeachers-${index}`" v-model="course.sendTeachers" />
                <label class="form-check-label" :for="`sendTeachers-${index}`">Profesores</label>
              </div>
            </div>

            <AppButtonGroup>
              <AppButtonDelete @click="deleteReceiver('courses', index)"></AppButtonDelete>

              <AppButton @click="openAddReceiverModal(course.academicPeriodGroupId)" v-tooltip="'Detalle destinatarios'" icon="clipboard-list" outlined></AppButton>
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
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendStudents" v-model="student.sendStudents" />
                <label class="form-check-label" for="sendStudents">Estudiantes</label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendParents" v-model="student.sendParents" />
                <label class="form-check-label" for="sendParents">Padres</label>
              </div>
            </div>

            <AppButtonGroup>
              <AppButtonDelete @click="deleteReceiver('students', index)"></AppButtonDelete>
            </AppButtonGroup>
          </div>
        </template>
      </AppCard>
    </div>
  </div>

  <AppModal v-model="addReceiversModal" :size="'lg'">
    <AddReceiversAnnouncementForm
      v-if="addReceiversModal"
      :is-student-or-parent="isStudentOrParent"
      :academic-period-group-id-form="currentAcademicPeriodGroupId"
      :receivers-temp="receivers"
      @close="closeAddReceiverModal"
    ></AddReceiversAnnouncementForm>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AddReceiversAnnouncementForm from './AddReceiversAnnouncementForm.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';

export default defineComponent({
  name: 'ReceiversAnnouncementForm',
  components: {
    AddReceiversAnnouncementForm,
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
    } | null> = ref(null);
    const currentAcademicPeriodGroupId = ref<any>(null);

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
      });
    };

    const deleteReceiver = (key: 'courses' | 'students', index: number) => {
      if (receivers.value) {
        if (key == 'courses') receivers.value.courses.splice(index, 1);
        if (key == 'students') receivers.value.students.splice(index, 1);

        emit('updateReceivers', receivers.value);
      }
    };

    return {
      receMessFormAddOffiModal,
      addReceiversModal,

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

<style scoped></style>
