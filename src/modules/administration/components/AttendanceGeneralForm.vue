<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :subtitle="subtitle" isCard>
    <template v-slot:actions>
      <!-- <AppButtonBack
        :to="{
          name: 'administration.homeTeacher.attendanceGeneral',
          params: { academicPeriodGroupId },
        }"
      ></AppButtonBack> -->
      <AppButtonBack :to="routes[routes.length - 2].url"></AppButtonBack>
    </template>

    <template #content>
      <!-- Form -->
      <div class="mb-3">
        <div class="form-row">
          <AppFormField label="classroom.activitiesTeacher.form.dateSince">
            <div class="d-flex gap-2">
              <input v-if="attendance?.dateSince" class="form-control" type="date" id="dateSince" v-model="v$.form.dateSince.$model" :disabled="true" />
              <input v-else class="form-control" type="date" id="dateSince" v-model="v$.form.dateSince.$model" />
              <input class="form-control" style="width: 37%" type="time" id="dateSince" v-model="v$.form.dateSinceHour.$model" :disabled="true" />
            </div>
          </AppFormField>
          <AppFormField label="classroom.activitiesTeacher.form.dateUntil">
            <div class="d-flex gap-2">
              <input v-if="attendance?.dateUntil" class="form-control" type="date" id="dateUntil" v-model="v$.form.dateUntil.$model" :disabled="true" />
              <input v-else class="form-control" type="date" id="dateUntil" v-model="v$.form.dateUntil.$model" />
              <input class="form-control" style="width: 37%" type="time" id="dateUntil" v-model="v$.form.dateUntilHour.$model" :disabled="true" />
            </div>
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.name" label="classroom.attendance.table.name">
            <input class="form-control" type="text" v-model="v$.form.name.$model" />
          </AppFormField>

          <AppFormField> </AppFormField>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <template v-if="!route.query.planningWeekId">
            <!-- <AppButton @click="saveSessionWithAttendances()" :label="'classroom.attendance.form.btnSaveSession'"></AppButton> -->
          </template>
          <AppButton @click="saveSession()" :label="'core.save'"></AppButton>
        </div>
      </div>
      <!-- agenda -->
      <div class="grid-cards mt-3" v-if="attendance && !route.query.planningWeekId">
        <div class="container-diary card shadow-sm p-2 mb-3">
          <div class="schedule w-100">
            <div class="text-center">
              <AppBadge variant="primary"> Horario {{ attendance.nameDay }}</AppBadge>
            </div>
            <hr />
            <div v-for="(subject, index) in dataCalender?.hourCourses" :key="index" class="border mb-2 p-2">
              <div class="d-flex align-items-center justify-content-between gap-1">
                <p class="m-0">{{ subject.nameCourse }}</p>
                <p class="m-0 me-2">
                  {{ dayjs(`01-01-2000 ${subject?.timeSince}`, 'MM-DD-YYYY HH:mm:ss').format('h:mm A') + ' - ' + dayjs(`01-01-2000 ${subject?.timeUntil}`, 'MM-DD-YYYY HH:mm:ss').format('h:mm A') }}
                </p>
              </div>
              <p class="m-0">{{ subject.nameTeacher }}</p>
            </div>
          </div>
          <div class="playTim w-100">
            <div class="text-center">
              <AppBadge variant="primary" :label="'Recesos'"></AppBadge>
            </div>
            <hr />
            <div v-for="(item, index) in dataCalender?.hourPlayTimes" :key="index" class="border mb-2 p-2">
              <div class="d-flex align-items-center justify-content-end gap-1">
                <p class="m-0 me-2">
                  {{ dayjs(`01-01-2000 ${item?.timeSince}`, 'MM-DD-YYYY HH:mm:ss').format('h:mm A') + ' - ' + dayjs(`01-01-2000 ${item?.timeUntil}`, 'MM-DD-YYYY HH:mm:ss').format('h:mm A') }}
                </p>
              </div>
              <p class="m-0">{{ item.name }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Attendance -->
      <AppCard v-if="attendance && !route.query.planningWeekId">
        <template #body>
          <h5>{{ t('classroom.attendance.list.callToList') }}</h5>

          <table class="table">
            <thead>
              <tr>
                <th class="col-5">
                  {{ t('classroom.attendance.list.student') }}
                </th>
                <th class="text-center">
                  {{ t('classroom.attendance.list.attendance') }}
                </th>
                <th class="text-center">
                  {{ t('core.attendanceGeneral.summarys') }}
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!attendances.length">
                <td colspan="3">
                  <AppEmptyResponse :subtitle="false"></AppEmptyResponse>
                  <p class="text-center">Quizás no has llamado a asistencia o no hay estudiantes registrados en el curso</p>
                </td>
              </tr>

              <tr v-for="(element, index) in attendances" :key="index">
                <td class="align-middle">
                  <div class="d-flex flex-row">
                    <div class="me-1">
                      <AppAvatar :size="'sm'" :avatar="element.user.avatar" :name="element.user.people.lastnames ?? '?'"> </AppAvatar>
                    </div>
                    <div class="d-flex flex-column">
                      <div>
                        {{ element.user.people.lastnames }}
                        {{ element.user.people.names }}
                      </div>
                      <p class="m-0 text-muted" style="font-size: 0.9rem">
                        {{ element.user.people.identification }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="text-center align-middle">
                  <AppButtonGroup @click="nameStudentActual(element.user.people.lastnames, element.user.people.names)">
                    <AppButton
                      style="border-radius: 50%"
                      icon="check"
                      v-tooltip="'classroom.studentSchedule.checked'"
                      :outlined="!(!element.attendances[0].isAbsence && !element.attendances[0].isDelayArrival)"
                      @click="changeAttendance(element, index, 1)"
                    ></AppButton>

                    <AppButton
                      style="border-radius: 50%"
                      icon="clock"
                      :outlined="!element.attendances[0].isDelayArrival"
                      v-tooltip="'classroom.attendance.list.lateArrival'"
                      @click="changeAttendance(element, index, 2)"
                    >
                    </AppButton>

                    <AppButton
                      style="border-radius: 50%"
                      icon="times"
                      :outlined="!element.attendances[0].isAbsence"
                      v-tooltip="'classroom.attendance.list.notAssist'"
                      @click="changeAttendance(element, index, 3)"
                    >
                    </AppButton>
                  </AppButtonGroup>
                </td>
                <td class="align-middle">
                  <div class="d-flex flex-row">
                    <div
                      v-if="element.attendances.find((item: any) => item.isGeneralSession)?.isAbsence === 0 && 
                element.attendances.find((item: any) => item.isGeneralSession)?.isDelayArrival === 0"
                      class="d-flex w-100 flex-column"
                    >
                      Asistió a clases
                    </div>
                    <div v-else class="d-flex flex-column gap-1">
                      <div>
                        Justificación:
                        <strong>
                          {{ element.attendances.find((item: any) => item.isGeneralSession)?.justificationAbsence || 'No hay justificación' }}
                        </strong>
                      </div>
                      <div>
                        Tipo de inasistencia:
                        <div class="type-chip">
                          {{ absenceTypes.find((item: any) => item.id === element.attendances.find((item: any) => item.isGeneralSession)?.absenceTypeId)?.name || 'Sin tipo de inasistencia' }}
                        </div>
                      </div>
                      <div class="d-flex gap-1">
                        <div v-if="element.attendances.find((item: any) => item.isGeneralSession)?.isAbsence">
                          Curso de inasistencia:
                          <div v-for="item in element.attendances.filter((item: any) => !item.isGeneralSession && item.isAbsence)" :key="item.courseName" class="type-chip m-1">
                            {{ item.courseName }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <AppDrawer :isVisible="isVisibleDrawer" @update:isVisible="toggleAttendance">
            <template #head>
              <span class="title-form"
                >Resumen - <strong>{{ nameStudent }}</strong></span
              >
            </template>
            <template #body>
              <div style="padding: 20px">
                <h5 class="under__line">
                  {{ selectedAttendance && indexBtnSelected === 3 ? 'Inasistencia' : 'Llegada tarde' }}
                </h5>
                <div class="content-input" v-if="selectedAttendance">
                  <div class="d-flex gap-1 justify-content-between w-100">
                    <AppFormField :form-control="vAttendance$.formAttendance.isJustificationAbsence">
                      <div class="form-check form-switch d-flex gap-2">
                        <!-- Checkbox para Cualitativa: se muestra activa si isQualitativeGrading es false -->
                        <input class="form-check-input" type="checkbox" id="qualitative" :checked="vAttendance$.formAttendance.isJustificationAbsence.$model" @click="onJustificationChange" />
                        <div>Justificada</div>
                      </div>
                    </AppFormField>
                    <AppFormField :form-control="vAttendance$.formAttendance.isJustificationAbsence">
                      <div class="form-check form-switch d-flex gap-2">
                        <!-- Checkbox para Cuantitativa: se muestra activa si isQualitativeGrading es true -->
                        <input class="form-check-input" type="checkbox" id="quantitative" @click="onUnJustificationChange" :checked="!vAttendance$.formAttendance.isJustificationAbsence.$model" />
                        <div>Injustificada</div>
                      </div>
                    </AppFormField>
                  </div>
                </div>

                <div class="content-input" v-if="selectedAttendance">
                  <AppFormField class="content-formFile" :form-control="vAttendance$.formAttendance.justificationAbsence">
                    <label for="">Justificación</label>
                      <AppVoiceInput :placeholder="selectedAttendance && indexBtnSelected === 3 ? 'Agrega una justificación de la ausencia' : 'Agregar motivo de llegada tarde'" v-model="vAttendance$.formAttendance.justificationAbsence.$model" textareaClass="form-control" />

                  </AppFormField>
                </div>

                <!-- Selección de tipo de ausencia -->
                <div class="content-input" v-if="selectedAttendance">
                  <AppFormField class="content-formFile" :form-control="vAttendance$.formAttendance.absenceTypeId">
                    <label for="">Tipo de inasistencia</label>

                    <v-select
                      style="width: 100%"
                      input-id="absenceTypeId"
                      v-model="vAttendance$.formAttendance.absenceTypeId.$model"
                      :options="absenceTypes"
                      :reduce="(absenceType: any) => absenceType.id"
                      label="name"
                    ></v-select>
                  </AppFormField>
                </div>

                <!-- Selección de cursos afectados por la ausencia -->
                <!-- Selección de cursos afectados por la ausencia -->
                <div class="content-input" v-if="selectedAttendance && indexBtnSelected === 3">
                  <AppFormField class="content-formFile" :form-control="vAttendance$.formAttendance.absenceAttendanceIds">
                    <label for="">Cursos de inasistencia</label>

                    <div class="course-card-container">
                      <!-- Tarjeta para seleccionar todos -->
                      <div class="course-card" :class="{ selected: isAllSelected }" @click="toggleSelectAllCourses">
                        <div class="d-flex align-items-center justify-content-between gap-1">
                          <div class="course-name">Seleccionar todos</div>
                        </div>
                      </div>

                      <!-- Tarjetas de cursos -->
                      <div
                        v-for="course in absenceCourseList"
                        :key="course.id"
                        class="course-card"
                        :class="{
                          selected: vAttendance$.formAttendance.absenceAttendanceIds.$model.includes(course.id),
                        }"
                        @click="toggleCourseSelection(course.id)"
                      >
                        <div class="d-flex align-items-center justify-content-between gap-1">
                          <div class="course-name">{{ course.courseName }}</div>
                          <div class="m-0 me-2">
                            {{
                              dayjs(`01-01-2000 ${course?.timeSince}`, 'MM-DD-YYYY HH:mm:ss').format('h:mm A') +
                              ' - ' +
                              dayjs(`01-01-2000 ${course?.timeUntil}`, 'MM-DD-YYYY HH:mm:ss').format('h:mm A')
                            }}
                          </div>
                        </div>
                        <div class="course-name">{{ course.teacherName }}</div>
                      </div>
                    </div>
                  </AppFormField>
                </div>

                <div v-if="selectedAttendance">
                  <div class="d-flex justify-content-end align-items-center mb-3 gap-2">
                    <template v-if="selectedAttendance?.attachmentAbsenceUrl && (indexBtnSelected === 3 || indexBtnSelected === 2)">
                      <a :href="vAttendance$.formAttendance.attachmentAbsenceUrl.$model" target="_blank">
                        <button type="button" class="btn btn-dark">
                          <AppIcon icon="eye"></AppIcon>

                          Ver adjunto
                        </button>
                      </a>
                    </template>
                    <input @change="onFileJustificationChange($event, selectedAttendance)" style="display: none" type="file" :id="'fileIn' + index" />
                    <button @click="getFile(index)" type="button" class="btn btn-dark">
                      <AppIcon icon="upload"></AppIcon>
                      {{ t('core.upload') }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <template #footer>
              <div class="d-flex justify-content-end gap-2">
                <AppButton label="Cancelar" @click="cancelAttendance"></AppButton>
                <AppButton label="Guardar" variant="primary" @click="saveAttendance"></AppButton>
              </div>
            </template>
          </AppDrawer>
          <hr />

          <div class="d-flex align-items-center justify-content-end gap-2">
            <p class="m-0">
              {{ t('classroom.attendance.form.descriptionSend') }}
            </p>
            <AppButton label="classroom.attendance.form.send" @click="sentNotificationsAbsences(attendance?.id)"> </AppButton>
          </div>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { PropType, Ref, computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { useHeaderStore } from '../../../stores/header.store';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { CreateOrUpdateAttendanceGeneralStudentService } from '../services/createOrUpdateAttendanceGeneralStudent.service';
import { GetAttendancesGeneralByListStudentService } from '../services/getAttendancesGeneralByListStudent.service';
import { CreateOrUpdateAttendanceGeneralService } from '../services/createOrUpdateAttendanceGeneral.service';
import { GetAbseceTypesService } from '../../institutionalConfiguration/services/getAbseceTypes.service';
import { GetSentNotificationGeneralService } from '../services/GetSentNotificationsGeneral.service';
import { GetCourseByIdService } from '../services/getCourseById.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateAttendanceGeneralStudentService = new CreateOrUpdateAttendanceGeneralStudentService();
const getAttendancesGeneralByListStudentService = new GetAttendancesGeneralByListStudentService();
const createOrUpdateAttendanceGeneralService = new CreateOrUpdateAttendanceGeneralService();
const getSentNotificationGeneralService = new GetSentNotificationGeneralService();
const getAbseceTypeService = new GetAbseceTypesService();
const getCourseByIdService = new GetCourseByIdService();

export default defineComponent({
  name: 'AttendanceForm',
  components: {
    AppEmptyResponse,
    AppButtonGroup,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppCard,
    AppBadge,
    AppAvatar,
    AppDrawer,
    AppVoiceInput
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: false,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
      required: true,
    },
    attendanceGeneralDate: {
      type: Object,
      required: true,
    },
    attendance: {
      type: Object,
    },
    dataCalender: {
      type: Object,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const data = props.attendance ?? null;

    const dateSince = props.attendanceGeneralDate?.dateSince ?? null;
    const dateUntil = props.attendanceGeneralDate?.dateUntil ?? null;

    const academicPeriodGroupId = ref<number | null>(null);
    const courseId = ref<number | null>(null);

    const pendingFile = ref<File | null>(null);

    const absenceTypes = ref<any[]>([]);
    const isVisibleDrawer = ref(false);
    const nameStudent = ref('');
    const selectedAttendance = ref();
    const absenceCourseSelected: Ref<any[]> = ref([]);

    const attendances: Ref<any[]> = ref([]);
    const absenceCourseList: Ref<any[]> = ref([]);

    const timetablesId = ref();
    const indexBtnSelected = ref();

    const loading = ref(true);

    const currentTimetable: { value: any } = reactive({ value: null });

    const showNotificationSendBtn = computed(() => {
      if (attendances.value.length) {
        for (let i = 0; i < attendances.value.length; i++) {
          let currentAttendance = attendances.value[i];
          if (currentAttendance.isAbsence && !currentAttendance.justificationAbsence && !currentAttendance.attachmentAbsenceUrl) {
            return true;
          }
        }
      }
      return false;
    });

    const form: any = reactive({
      planningWeekId: route.query.planningWeekId ? parseInt(route.query.planningWeekId as string, 10) : data?.planningWeekId ?? null,
      dateSince: (data?.dateSince ?? dateSince)?.split(' ')[0] ?? '',
      dateUntil: (data?.dateUntil ?? dateUntil)?.split(' ')[0] ?? '',
      dateSinceHour: dateSince?.split(' ')[1] ?? '',
      dateUntilHour: dateUntil?.split(' ')[1] ?? '',
      name: data?.name ?? null,
      // academicPeriodGroupId: courseId,
      isGeneral: 1,
    });
    const v$ = useVuelidate(
      {
        form: {
          planningWeekId: {},
          dateSince: { required },
          dateUntil: { required },
          dateSinceHour: { required },
          dateUntilHour: { required },
          name: {},
          // academicPeriodGroupId: {},
        },
      },
      { form }
    );
    const formAttendance = reactive({
      id: '',
      isAbsence: 0,
      isDelayArrival: 0,
      attendanceIds: '',
      userId: '',
      justificationAbsence: '',
      absenceTypeId: '',
      absenceAttendanceIds: [],
      isGeneralSessionId: '',
      isJustificationAbsence: false,

      files: '',
      attachmentAbsenceUrl: '',
    });
    const vAttendance$ = useVuelidate(
      {
        formAttendance: {
          isAbsence: {},
          isDelayArrival: {},
          attendanceIds: {},
          userId: {},
          justificationAbsence: {},
          absenceTypeId: { required },
          absenceAttendanceIds: {
            requiredIf: requiredIf(() => {
              return selectedAttendance.value && indexBtnSelected.value === 3;
            }),
          },
          files: {},
          attachmentAbsenceUrl: {},
          isGeneralSessionId: {},
          isJustificationAbsence: {},
        },
      },
      { formAttendance }
    );

    onMounted(async () => {
      try {
        courseId.value = route.params.courseId ? parseInt(route.params.courseId.toString(), 10) : null;
        academicPeriodGroupId.value = route.params.academicPeriodGroupId ? parseInt(route.params.academicPeriodGroupId.toString(), 10) : null;

        absenceTypes.value = await getAbseceTypeService.run();

        if (courseId.value) {
          const course = await getCourseByIdService.run(courseId.value);
          academicPeriodGroupId.value = course.academicPeriodGroupId;
        }

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = { name: props.title, url: '' };

        if (data?.id) await getAttendances(null);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getAttendances = async (id: number | null = null) => {
      const sessionIds = data?.dataCalender?.sessionIds ? [...data.dataCalender.sessionIds, ...(data.id !== null ? [data.id] : [])] : [id];
      attendances.value = await getAttendancesGeneralByListStudentService.run(sessionIds);
    };

    const saveSession = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      let sessionId: number | null = null;

      const dataSend = {
        planningWeekId: form.planningWeekId,
        academicPeriodGroupId: academicPeriodGroupId.value,
        dateSince: form.dateSince + ' ' + form.dateSinceHour,
        dateUntil: form.dateUntil + ' ' + form.dateUntilHour,
        name: form.name,
        isGeneral: form.isGeneral,
      };

      if (!data) {
        const response = await createOrUpdateAttendanceGeneralService.run(dataSend);
        sessionId = response.data.id;
      } else {
        const response = await createOrUpdateAttendanceGeneralService.run(dataSend, data?.id);
        sessionId = response.data.id;
      }

      if (sessionId) {
        await getAttendances(sessionId);

        if (!data) {
          await router.push({
            name: 'administration.homeTeacher.attendanceGeneral.edit',
            params: {
              academicPeriodGroupId: academicPeriodGroupId.value,
              sessionId: sessionId,
            },
          });
        }
      }
    };

    const toggleCourseSelection = (courseId: any) => {
      const selectedCourses = formAttendance.absenceAttendanceIds;
      if (selectedCourses.includes(courseId)) {
        // Si ya está seleccionado, lo quitamos
        formAttendance.absenceAttendanceIds = selectedCourses.filter((id: any) => id !== courseId);
      } else {
        // Si no está seleccionado, lo agregamos
        formAttendance.absenceAttendanceIds.push(courseId);
      }
    };

    const nameStudentActual = (lastName: string, names: string) => {
      nameStudent.value = lastName + ' ' + names;
    };
    const changeAttendance = async (attendance: any, index: any, indexBtn: number | null = null) => {
      indexBtnSelected.value = indexBtn;
      formAttendance.userId = attendance.userId;
      formAttendance.attendanceIds = attendance.attendances.map((att: any) => att.id);
      formAttendance.absenceAttendanceIds = attendance.attendances.filter((att: any) => att.isGeneralSession === 0 && att.isAbsence === 1).map((att: any) => att.id);
      formAttendance.isGeneralSessionId = attendance.attendances.filter((att: any) => att.isGeneralSession === 1).map((att: any) => att.id);

      // Actualizar valores en función del botón seleccionado
      if (indexBtn === 1) {
        // Presente
        formAttendance.isJustificationAbsence = false;
        formAttendance.justificationAbsence = '';
        formAttendance.absenceTypeId = '';
        formAttendance.absenceAttendanceIds = '';
        formAttendance.files = '';
        formAttendance.attachmentAbsenceUrl = '';
        formAttendance.isDelayArrival = 0;
        formAttendance.isAbsence = 0;
      } else if (indexBtn === 2) {
        // Tarde

        attendance.attendanceIds = attendance.attendances.filter((att: any) => att.isGeneralSession === 0 && att.isAbsence === 1);

        formAttendance.isJustificationAbsence = attendance.attendances[0].isJustificationAbsence ? true : false;
        formAttendance.justificationAbsence = attendance.attendances[0].justificationAbsence;
        formAttendance.absenceTypeId = attendance.attendances[0].absenceTypeId;
        formAttendance.absenceAttendanceIds = '';
        formAttendance.attachmentAbsenceUrl = attendance.attendances[0].attachmentAbsenceUrl;
        formAttendance.isDelayArrival = 1;
        formAttendance.isAbsence = 0;
      } else if (indexBtn === 3) {
        // Ausente
        attendance.attendanceIds = attendance.attendances.filter((att: any) => att.isGeneralSession === 0 && att.isAbsence === 1);
        absenceCourseList.value = attendance.attendances.filter((attendance: any) => attendance.isGeneralSession === 0);

        formAttendance.isJustificationAbsence = attendance.attendances[0].isJustificationAbsence ? true : false;
        formAttendance.justificationAbsence = attendance.attendances[0].justificationAbsence;
        formAttendance.absenceTypeId = attendance.attendances[0].absenceTypeId;
        formAttendance.attachmentAbsenceUrl = attendance.attendances[0].attachmentAbsenceUrl;
        formAttendance.isDelayArrival = 0;
        formAttendance.isAbsence = 1;
      }

      selectedAttendance.value = formAttendance;

      if (indexBtn === 2 || indexBtn === 3) {
        isVisibleDrawer.value = true;
      } else if (indexBtn === 1) {
        await createOrUpdateAttendance(selectedAttendance.value);
        await getAttendances();
      }
    };

    const saveAttendance = async () => {
      if (!selectedAttendance.value) return;

      const formIsValid = await vAttendance$.value.$validate();
      if (!formIsValid) {
        console.error('Formulario de asistencia inválido');
        return;
      }

      try {
        await createOrUpdateAttendance(selectedAttendance.value);
        vAttendance$.value.$reset();
        isVisibleDrawer.value = false; // Cerrar el Drawer después de guardar
        // formAttendance.isJustificationAbsence = false;
        // formAttendance.justificationAbsence = '';
        // formAttendance.absenceTypeId = '';
        // formAttendance.absenceAttendanceIds = '';
        // formAttendance.files = '';
        // formAttendance.attachmentAbsenceUrl = '';
        // formAttendance.isDelayArrival = 0;
        // formAttendance.isAbsence = 0;
        // formAttendance.userId = '';
        // formAttendance.attendanceIds = '';
        // formAttendance.absenceAttendanceIds = '';
        // formAttendance.isGeneralSessionId = '';
      } catch (error) {
        console.error('Error al guardar la asistencia:', error);
      }
    };

    const toggleAttendance = (visible: boolean) => {
      isVisibleDrawer.value = visible;
      if (!visible) selectedAttendance.value = null; // Limpiar selección al cerrar
    };

    const cancelAttendance = () => {
      isVisibleDrawer.value = false; // Cerrar el drawer
      selectedAttendance.value = null; // Limpiar la selección de asistencia
    };
    const onJustificationChange = () => {
      // Si estaba activado, al desmarcarlo se debe activar la otra opción
      if (formAttendance.isJustificationAbsence) {
        formAttendance.isJustificationAbsence = false;
      } else {
        formAttendance.isJustificationAbsence = true;
      }
    };

    const onUnJustificationChange = () => {
      // Si estaba desactivado, activamos Injustificada
      if (!formAttendance.isJustificationAbsence) {
        formAttendance.isJustificationAbsence = true;
      } else {
        formAttendance.isJustificationAbsence = false;
      }
    };
    // const saveSessionWithAttendances = async () => {
    //   const formIsValid = await v$.value.$validate();
    //   if (!formIsValid) return;

    //   let sessionId: number | null = null;

    //   const dataSend = {
    //     planningWeekId: form.planningWeekId,
    //     academicPeriodGroupId: courseId,
    //     dateSince: dayjs(form.dateSince).format('YYYY-MM-DD HH:mm'),
    //     dateUntil: dayjs(form.dateUntil).format('YYYY-MM-DD HH:mm'),
    //     name: form.name,
    //     isGeneral: form.isGeneral
    //   };

    //   if (!data) {
    //     const response = await createOrUpdateAttendanceGeneralService.run(dataSend, data?.id);
    //     sessionId = response.data.id;
    //   } else {

    //   }

    //   if (sessionId) {
    //     await getAttendances(sessionId);

    //     if (!data) {
    //       await router.push({
    //         name: 'administration.homeTeacher.attendanceGeneral.edit',
    //         params: {
    //           academicPeriodGroupId: courseId,
    //           courseId: courseId,
    //           sessionId: sessionId },
    //       });
    //     }
    //   }
    // };
    const createOrUpdateAttendance = async (attendance: any) => {
      let dataSend = {
        isAbsence: attendance.isAbsence,
        isDelayArrival: attendance.isDelayArrival,
        attendanceIds: attendance.attendanceIds,
        userId: attendance.userId,
        isJustificationAbsence: attendance.isJustificationAbsence ? 1 : 0,
        justificationAbsence: attendance.justificationAbsence,
        absenceTypeId: attendance.absenceTypeId,
        absenceAttendanceIds: [...(attendance.isGeneralSessionId ?? []), ...(attendance.absenceAttendanceIds ?? [])],
        files: pendingFile.value ?? null,
        attachmentAbsenceUrl: attendance.attachmentAbsenceUrl ?? null,
      };

      await createOrUpdateAttendanceGeneralStudentService.run(dataSend, attendance.userId);

      pendingFile.value = null;
      await getAttendances();
    };

    const onFileJustificationChange = async (event: any, attendance: any) => {
      const files = event.target.files;
      if (!files.length) return;
      pendingFile.value = files[0];
    };

    const getFile = (userId: any) => {
      let fileUpload = document.getElementById('fileIn' + userId);
      if (fileUpload != null) fileUpload.click();
    };

    const changeDate = async () => {
      if (!timetablesId.value) {
        form.dateSince = null;
        form.dateUntil = null;

        return;
      }

      const date = dayjs().day(currentTimetable.value.dayWeek);
      form.dateSince = `${dayjs(date.toISOString()).format('YYYY-MM-DD')}` + ' ' + currentTimetable.value.startTime;
      form.dateUntil = `${dayjs(date.toISOString()).format('YYYY-MM-DD')}` + ' ' + currentTimetable.value.endTime;
    };

    const sentNotificationsAbsences = async (sessionId: number | undefined) => {
      if (sessionId && sessionId >= 0) {
        await getSentNotificationGeneralService.run(sessionId);
      }
    };
    const toggleSelectAllCourses = () => {
      const courses = Array.isArray(absenceCourseList.value) ? absenceCourseList.value : [];
      const allIds = courses.map((c) => c.id);
      const selected = formAttendance.absenceAttendanceIds;

      if (Array.isArray(selected) && selected.length === allIds.length) {
        formAttendance.absenceAttendanceIds = [];
      } else {
        formAttendance.absenceAttendanceIds = allIds;
      }
    };

    const isAllSelected = computed(() => {
      return (
        Array.isArray(absenceCourseList.value) &&
        absenceCourseList.value.length > 0 &&
        absenceCourseList.value.every((c) => Array.isArray(formAttendance.absenceAttendanceIds) && formAttendance.absenceAttendanceIds.includes(c.id))
      );
    });

    return {
      loading,
      route,
      v$,
      vAttendance$,
      t,

      showNotificationSendBtn,
      timetablesId,
      attendances,
      academicPeriodGroupId,

      // saveSessionWithAttendances,
      sentNotificationsAbsences,
      onFileJustificationChange,
      changeAttendance,
      saveSession,
      changeDate,
      getFile,
      dateUntil,
      dateSince,
      absenceTypes,
      dayjs,
      saveAttendance,
      toggleAttendance,
      isVisibleDrawer,
      selectedAttendance,
      cancelAttendance,
      absenceCourseList,
      indexBtnSelected,
      absenceCourseSelected,
      toggleCourseSelection,
      onJustificationChange,
      onUnJustificationChange,
      nameStudentActual,
      nameStudent,
      isAllSelected,
      toggleSelectAllCourses,
    };
  },
});
</script>

<style scoped>
.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.form-check-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem rgba(var(--color-primary-rgb), 0.25);
}
.container-diary {
  display: flex !important;
  flex-direction: row;
  gap: 1rem;
}

.route-file {
  font-size: 0.8rem;
}

.contentFilter .filter {
  background: #fff;
  margin-right: 1rem;
  padding: 0.3rem 1rem;
  border-radius: 28px;
  cursor: pointer;
}

.focus {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.focus:hover {
  background-color: rgba(0, 0, 0, 0.2) !important;
}
.content-input {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.content-formFile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: unset;
}
.type-chip {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-align: center;
  background-color: var(--color-primary);
}

.course-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.course-card {
  width: 100%;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: background 0.3s ease-in-out;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  /* text-align: center; */
  min-width: 120px;
}

.course-card:hover {
  background-color: #d6d6d6;
}

.course-card.selected {
  background-color: var(--color-primary);
  color: white;
}
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
}
.title-form {
  margin-left: auto;
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
}
</style>
