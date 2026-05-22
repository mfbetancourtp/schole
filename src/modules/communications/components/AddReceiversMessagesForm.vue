<template>
  <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>

        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              v-if="profileId != 2 && profileId != 4 && !academicPeriodGroupIdForm"
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
              {{ t('Cursos') }}
            </button>

            <button
              v-if="profileId === 4 || profileId === 2 || academicPeriodGroupIdForm"
              class="nav-link active text-capitalize"
              data-bs-target="#my-course"
              aria-controls="my-course"
              id="my-course-tab"
              data-bs-toggle="tab"
              aria-selected="true"
              type="button"
              role="tab"
              @click="activeTab = 'my-course'"
            >
              {{ t('Mi curso') }}
            </button>

            <button
              data-bs-target="#teachers"
              aria-controls="teachers"
              class="nav-link text-capitalize"
              id="teachers-tab"
              aria-selected="false"
              data-bs-toggle="tab"
              type="button"
              role="tab"
              @click="activeTab = 'teachers'"
            >
              {{ t('Profesores') }}
            </button>
          </div>
        </nav>

        <div class="tab-content" id="nav-tabContent">
          <div v-if="profileId != 2 && profileId != 4 && !academicPeriodGroupIdForm" class="tab-pane fade show active" aria-labelledby="courses-tab" role="tabpanel" id="courses">
            <div class="d-flex justify-content-around">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendStudents" v-model="sendStudents" />
                <label class="form-check-label" for="sendStudents">{{ t('Estudiantes') }}</label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendParents" v-model="sendParents" />
                <label class="form-check-label" for="sendParents">{{ t('Padres') }}</label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendTeachers" v-model="sendTeachers" />
                <label class="form-check-label" for="sendTeachers">{{ t('Profesores') }}</label>
              </div>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="allCourses" v-model="allCoursesChecked" />
              <label class="form-check-label" for="allCourses">Todos</label>
            </div>

            <template v-for="(levelsWithGroup, index) in receiversByCourse.levelsWithGroups" :key="index">
              <h5 class="m-0 mt-2 ms-3" style="font-weight: 400">
                {{ levelsWithGroup.name }}
              </h5>
              <template v-for="(group, inde) in levelsWithGroup.groups" :key="inde">
                <div class="form-check" v-if="levelsWithGroup.name == group.levelName">
                  <input class="form-check-input" type="checkbox" :value="group.academicPeriodGroupId" v-model="receiversCourses" :id="`${index}_${inde}`" />
                  <label :for="`${index}_${inde}`" class="form-check-label">{{ group.groupName }}</label>
                </div>
              </template>
            </template>
          </div>

          <div v-if="profileId === 4 || profileId === 2 || academicPeriodGroupIdForm" class="tab-pane fade show active" aria-labelledby="my-course-tab" role="tabpanel" id="my-course">
            <div class="d-flex justify-content-around">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendStudents" v-model="sendStudents" />
                <label class="form-check-label" for="sendStudents">{{ t('Estudiantes') }}</label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendParents" v-model="sendParents" />
                <label class="form-check-label" for="sendParents">{{ t('Padres') }}</label>
              </div>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="allStudents" v-model="allStudentsChecked" />
              <label class="form-check-label" for="allStudents">Todos</label>
            </div>

            <template v-for="(student, index) in receiversByCourse?.students" :key="index">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="receiversStudents" :id="`${index}_student`" :value="student" />
                <label :for="`${index}_student`" class="form-check-label">{{ student.fullName }}</label>
              </div>
            </template>
          </div>

          <div aria-labelledby="teachers-tab" class="tab-pane fade" role="tabpanel" id="teachers">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="allTeachers" v-model="allTeachersChecked" />
              <label class="form-check-label" for="allTeachers">Todos</label>
            </div>

            <template v-for="(teacher, index) in receiversByCourse?.teachers" :key="index">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" :id="`${index}_teachers`" :value="teacher" v-model="receiversPeoples" />
                <label class="form-check-label" :for="`${index}_teachers`">{{ teacher.fullName }}</label>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:actions>
      <AppButton @click="save" label="core.save"></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetReceiversByCourseService } from '../services/getReceiversByCourse.service';
import { GetTutorStudentsService } from '../../administration/services/getTutorStudents.service';
import { GetReceiversAllCoursesService } from '../services/getReceiversAllCourses.service';

const getReceiversAllCoursesService = new GetReceiversAllCoursesService();
const getReceiversByCourseService = new GetReceiversByCourseService();
const getTutorStudentsService = new GetTutorStudentsService();

export default defineComponent({
  name: 'AddReceiversMessagesForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
  },

  props: {
    isStudentOrParent: {
      type: Boolean,
      required: true,
    },
    academicPeriodGroupIdForm: {
      type: Number as PropType<number | null>,
    },
    receiversTemp: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const title = 'Agregar destinatarios';

    const receiversStudents = ref([]);
    const receiversByCourse = ref(null);
    const receiversCourses = ref([]);
    const receiversPeoples = ref([]);
    const students = ref([]);
    const allCoursesChecked = ref(false);
    const allStudentsChecked = ref(false);
    const allTeachersChecked = ref(false);
    const activeTab = ref('courses');

    const currentStudentUserId = ref();
    const sendStudents = ref(false);
    const sendTeachers = ref(false);
    const sendParents = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        students.value = await getTutorStudentsService.run();
        students.value.forEach((student) => {
          student.name = `${student.people.names} ${student.people.lastnames}`;
          student.id = student.people.userId;
        });

        if (profileId.value === 2 || profileId.value === 4) {
          if (!students.value.length) {
            receiversByCourse.value = await getReceiversByCourseService.run();
          } else {
            currentStudentUserId.value = students.value[0].id;
            receiversByCourse.value = await getReceiversByCourseService.run({
              userId: currentStudentUserId.value,
            });
          }
        } else {
          if (props.academicPeriodGroupIdForm) {
            receiversByCourse.value = await getReceiversByCourseService.run({
              academicPeriodGroupId: props.academicPeriodGroupIdForm,
            });
          } else {
            receiversByCourse.value = await getReceiversAllCoursesService.run();
          }
        }

        if (props.receiversTemp) {
          if (props.receiversTemp.students) {
            props.receiversTemp.students.forEach((student: any) => {
              delete student.sendParents;
              delete student.sendStudents;
              receiversStudents.value.push(student);
            });
          }
          if (props.receiversTemp.peoples) {
            props.receiversTemp.peoples.forEach((people: any) => {
              receiversPeoples.value.push(people);
            });
          }
          if (props.receiversTemp.courses) {
            props.receiversTemp.courses.forEach((course: any) => {
              receiversCourses.value.push(course.academicPeriodGroupId);
            });
          }
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getProfileIdFromLocalStorage = () => {
      const profileId = localStorage.getItem('profileId');
      return profileId ? parseInt(profileId) : null;
    };
    const profileId = ref(getProfileIdFromLocalStorage());

    watchEffect(() => {
      profileId.value = getProfileIdFromLocalStorage();
    });

    watch(currentStudentUserId, async (value) => {
      currentStudentUserId.value = value;
      receiversByCourse.value = await getReceiversByCourseService.run({
        userId: currentStudentUserId.value,
      });
    });

    watch(allCoursesChecked, async (value) => {
      if (value) {
        const allCourseIds = receiversByCourse.value.levelsWithGroups.flatMap((levelsWithGroup) => levelsWithGroup.groups.map((group) => group.academicPeriodGroupId));
        receiversCourses.value = [...allCourseIds];
      } else {
        receiversCourses.value = [];
      }
    });

    watch(allStudentsChecked, async (value) => {
      if (value) {
        const allStudentIds = receiversByCourse.value?.students.map((student: any) => student);
        receiversStudents.value = [...allStudentIds];
      } else {
        receiversStudents.value = [];
      }
    });

    watch(allTeachersChecked, async (value) => {
      if (value) {
        const allTeacherIds = receiversByCourse.value?.teachers.map((teacher: any) => teacher);
        receiversPeoples.value = [...allTeacherIds];
      } else {
        receiversPeoples.value = [];
      }
    });

    const save = async () => {
      const receivers = {
        courses: [],
        students: [],
        peoples: [],
      };

      if (!sendStudents.value && !sendParents.value && !sendTeachers.value && activeTab.value === 'courses') {
        alert('Debe seleccionar al menos un destinatario (Estudiante, Padre o Profesor) antes de guardar.');
        return;
      }

      receiversPeoples.value.forEach((people) => {
        if (typeof people === 'object') {
          receivers.peoples.push(people);
        }
      });

      receiversCourses.value.forEach((course) => {
        if (typeof course === 'number') {
          let courseName = '';
          if (!props.academicPeriodGroupIdForm) {
            receiversByCourse.value.levelsWithGroups.forEach((levelsWithGroup: any) => {
              levelsWithGroup.groups.forEach((group: any) => {
                if (group.academicPeriodGroupId == course) {
                  courseName = `${group.levelName} ${group.groupName}`;
                  receiversCourses.value.push(group.academicPeriodGroupId);
                }
              });
            });

            receivers.courses.push({
              courseName,
              academicPeriodGroupId: course,
              sendStudents: sendStudents.value,
              sendParents: sendParents.value,
              sendTeachers: sendTeachers.value,
            });
          }

          if (props.receiversTemp?.courses && props.academicPeriodGroupIdForm) {
            props.receiversTemp.courses.forEach((course: any) => {
              if (course.academicPeriodGroupId != props.academicPeriodGroupIdForm) {
                receivers.courses.push(course);
              }
            });
          }
        }
      });

      receiversStudents.value.forEach((student) => {
        if (typeof student === 'object') {
          receivers.students.push({
            ...student,
            sendStudents: sendStudents.value,
            sendParents: sendParents.value,
          });
        }
      });

      emit('close', receivers);
    };

    return {
      loading,
      title,
      save,
      t,
      emit,
      currentStudentUserId,
      receiversStudents,
      receiversByCourse,
      receiversPeoples,
      receiversCourses,
      sendStudents,
      sendTeachers,
      sendParents,
      students,
      allCoursesChecked,
      allStudentsChecked,
      allTeachersChecked,
      activeTab,
      profileId,
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
