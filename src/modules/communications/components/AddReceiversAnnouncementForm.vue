<template>
  <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <AppFormField v-if="isStudentOrParent && students.length" :label="'Estudiante'">
          <AppAutocomplete :disabled="students.length === 1" v-model="currentStudentUserId" :options="students"></AppAutocomplete>
        </AppFormField>

        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              v-if="!isStudentOrParent && !academicPeriodGroupIdForm"
              class="nav-link active text-capitalize"
              data-bs-target="#courses"
              aria-controls="courses"
              data-bs-toggle="tab"
              aria-selected="true"
              id="courses-tab"
              type="button"
              role="tab"
            >
              {{ t('Cursos') }}
            </button>

            <button
              v-if="isStudentOrParent || academicPeriodGroupIdForm"
              class="nav-link active text-capitalize"
              data-bs-target="#my-course"
              aria-controls="my-course"
              id="my-course-tab"
              data-bs-toggle="tab"
              aria-selected="true"
              type="button"
              role="tab"
            >
              {{ t('Mi curso') }}
            </button>
          </div>
        </nav>

        <div class="tab-content" id="nav-tabContent">
          <div v-if="!isStudentOrParent && !academicPeriodGroupIdForm" class="tab-pane fade show active" aria-labelledby="courses-tab" role="tabpanel" id="courses">
            <div class="d-flex justify-content-around">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendStudents" v-model="sendStudents" />

                <label class="form-check-label" for="sendStudents">
                  {{ t('Estudiantes') }}
                </label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendParents" v-model="sendParents" />

                <label class="form-check-label" for="sendParents">
                  {{ t('Padres') }}
                </label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendTeachers" v-model="sendTeachers" />

                <label class="form-check-label" for="sendTeachers">
                  {{ t('Profesores') }}
                </label>
              </div>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="allCourses" value="allCourses" v-model="receiversCourses" />

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

          <div v-if="isStudentOrParent || academicPeriodGroupIdForm" class="tab-pane fade show active" aria-labelledby="my-course-tab" role="tabpanel" id="my-course">
            <div class="d-flex justify-content-around">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendStudents" v-model="sendStudents" />

                <label class="form-check-label" for="sendStudents">
                  {{ t('Estudiantes') }}
                </label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="sendParents" v-model="sendParents" />

                <label class="form-check-label" for="sendParents">
                  {{ t('Padres') }}
                </label>
              </div>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="allStudents" value="allStudents" v-model="receiversStudents" />

              <label class="form-check-label" for="allStudents">Todos</label>
            </div>

            <template v-for="(student, index) in receiversByCourse.students" :key="index">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="receiversStudents" :id="`${index}_student`" :value="student" />

                <label :for="`${index}_student`" class="form-check-label">{{ student.fullName }}</label>
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
import { defineComponent, onMounted, PropType, Ref, ref, watch } from 'vue';
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
  name: 'AddReceiversAnnouncementForm',
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
    let title = 'Agregar destinatarios';

    const receiversStudents: Ref<any[]> = ref([]);
    const receiversByCourse: Ref<any> = ref(null);
    const receiversCourses: Ref<any[]> = ref([]);
    const students: Ref<any[]> = ref([]);

    const currentStudentUserId = ref();

    const sendStudents = ref(false);
    const sendTeachers = ref(false);
    const sendParents = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        students.value = await getTutorStudentsService.run();

        students.value.forEach((student: any) => {
          student.name = student.people.names + ' ' + student.people.lastnames;
          student.id = student.people.userId;
        });

        if (props.isStudentOrParent) {
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

    watch(currentStudentUserId, async (value) => {
      currentStudentUserId.value = value;
      receiversByCourse.value = await getReceiversByCourseService.run({
        userId: currentStudentUserId.value,
      });
    });

    watch(receiversCourses, async (value: any[]) => {
      if (value.includes('allCourses')) {
        receiversByCourse.value.levelsWithGroups.forEach((levelsWithGroup: any) => {
          levelsWithGroup.groups.forEach((group: any) => {
            if (levelsWithGroup.name == group.levelName) {
              receiversCourses.value.push(group.academicPeriodGroupId);
            }
          });
        });
      }

      await validateReceivers('courses');
    });
    watch(receiversStudents, async (value: any[]) => {
      if (value.includes('allStudents')) {
        receiversByCourse.value.students.forEach((student: any) => {
          receiversStudents.value.push(student);
        });
      }

      await validateReceivers('students');
    });

    const validateReceivers = (key: 'courses' | 'students' | 'people') => {
      if (key == 'courses') receiversCourses.value = [...new Set(receiversCourses.value)];
      if (key == 'students') receiversStudents.value = [...new Set(receiversStudents.value)];
    };

    const save = async () => {
      const receivers: { courses: any[]; students: any[] } = {
        courses: [],
        students: [],
      };

      receiversCourses.value.forEach((course: any) => {
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
              courseName: courseName,
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

      receiversStudents.value.forEach((student: any) => {
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
      receiversCourses,
      sendStudents,
      sendTeachers,
      sendParents,
      students,
    };
  },
});
</script>

<style scoped></style>
