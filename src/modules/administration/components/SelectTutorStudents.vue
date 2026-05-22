<template>
  <div v-if="currentStudent">
    <label>{{ t('core.generalTerms.academic.student.singular') }}</label>
    <AppAutocomplete
      :disabled="students.length === 1"
      :reduce="(d) => d.userId"
      v-model="currentStudent"
      :options="students"
      class="bg-white"
    ></AppAutocomplete>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import { takeUntil } from 'rxjs/operators';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Subject } from 'rxjs';

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetTutorStudentsService } from '../services/getTutorStudents.service';
import { SetCurrentStudentParentService } from '../services/setCurrentStudentParent.service';

const setCurrentStudentParentService = new SetCurrentStudentParentService();
const getTutorStudentsService = new GetTutorStudentsService();

export default defineComponent({
  name: 'SelectTutorStudents',
  components: { AppAutocomplete },

  emits: ['haveParents', 'updateUserId'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const currentStudent: Ref<any> = ref();
    const students: Ref<any[]> = ref([]);
    const route = useRoute();
    const userId = ref();

    const _unsubscribeAll: Subject<any> = new Subject<any>();

    onMounted(async () => {
      try {
        if (route.query.userId) {
          // userId.value = parseInt(route.query.userId as string, 10);
          changeStudent(parseInt(route.query.userId as string, 10));
        }

        students.value = await getTutorStudentsService.run();

        students.value.forEach((student: any) => {
          student.name = student.people.names + ' ' + student.people.lastnames;
          student.userId = student.people.userId;
        });

        emit('haveParents', !!students.value.length);

        setCurrentStudentParentService.userId$
          .pipe(takeUntil(_unsubscribeAll))
          .subscribe((value) => {
            userId.value = value;
          });

        setTimeout(() => {
          if (userId.value) {
            currentStudent.value = userId.value;
          } else if (students.value.length) {
            currentStudent.value = students.value[0].userId;
            changeStudent(students.value[0].userId);
          }
        }, 800);
      } catch (e) {
        console.log(e);
      }
    });

    watch(currentStudent, (value) => {
      changeStudent(value);
    });

    const changeStudent = (userId: number) => {
      setCurrentStudentParentService.userId = userId;

      setCurrentStudentParentService.set(userId);
      emit('updateUserId');
    };

    onUnmounted(async () => {
      await _unsubscribeAll.next(new Date().toString());
      await _unsubscribeAll.complete();
    });

    return {
      t,

      currentStudent,
      students,
      userId,
    };
  },
});
</script>

<style scoped></style>
