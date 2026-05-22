<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template v-slot:actions>
      <AppButtonBack @click="goBack"></AppButtonBack>
    </template>

    <template #content>
      <!-- Filters -->
      <section class="mb-3">
        <p class="mb-1">{{ t('classroom.attendance.form.selectSchedule') }}</p>

        <div class="d-flex contentFilter" @click="changeDate()">
          <template v-for="(item, index) in relatedData.timetables" :key="index">
            <div v-bind:class="{ focus: timetablesId == item.id }" @click="timetablesId = item.id" class="filter">
              {{ t('core.weekDays.' + item.dayWeek) }}
              {{ dayjs(`01-01-2000 ${item.startTime}`, 'MM-DD-YYYY HH:mm:ss').format('LT') }}
              {{ t('classroom.attendance.form.to') }}
              {{ dayjs(`01-01-2000 ${item.endTime}`, 'MM-DD-YYYY HH:mm:ss').format('LT') }}
            </div>
          </template>

          <div v-bind:class="{ focus: timetablesId == null }" @click="timetablesId = null" class="filter">
            {{ t('classroom.attendance.form.otherSchedule') }}
          </div>
        </div>
      </section>

      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <!-- Form -->
        <div class="mb-3">
          <div class="form-row">
            <AppFormField :form-control="v$.form.dateSince" label="classroom.activitiesTeacher.form.dateSince">
              <input class="form-control" type="datetime-local" id="dateSince" v-model="v$.form.dateSince.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.dateUntil" label="classroom.activitiesTeacher.form.dateUntil">
              <input class="form-control" type="datetime-local" id="dateUntil" v-model="v$.form.dateUntil.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.name" label="classroom.attendance.table.name">
              <input class="form-control" type="text" v-model="v$.form.name.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.topicIds" label="core.theme">
              <AppAutocomplete v-model="v$.form.topicIds.$model" :options="relatedData.topics" :multiple="true"> </AppAutocomplete>
            </AppFormField>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <template v-if="!route.query.planningWeekId">
              <AppButton @click="saveSessionWithAttendances()" :label="'classroom.attendance.form.btnSaveSession'"> </AppButton>
            </template>

            <AppButton v-else @click="saveSession(true)" :label="'core.save'"></AppButton>
          </div>
        </div>

        <!-- Attendance -->
        <AppCard v-if="attendance && !route.query.planningWeekId">
          <template #body>
            <h5>{{ t('classroom.attendance.list.callToList') }}</h5>

            <div class="table container-tables table-responsive d-flex">
              <table class="table">
                <thead>
                  <tr>
                    <th class="col-5">
                      {{ t('classroom.attendance.list.student') }}
                    </th>
                    <th class="text-center">
                      {{ t('classroom.attendance.list.attendance') }}
                    </th>
                    <th class="text-center col-5">
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
                    <td class="tw-items-center tw-py-2 tw-px-4">
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
                          :outlined="!(!element.isAbsence && !element.isDelayArrival)"
                          @click="changeAttendance(element, index, 1)"
                        ></AppButton>

                        <AppButton
                          style="border-radius: 50%"
                          icon="clock"
                          :outlined="!element.isDelayArrival"
                          v-tooltip="'classroom.attendance.list.lateArrival'"
                          @click="changeAttendance(element, index, 2)"
                        >
                        </AppButton>

                        <AppButton
                          style="border-radius: 50%"
                          icon="times"
                          :outlined="!element.isAbsence"
                          v-tooltip="'classroom.attendance.list.notAssist'"
                          @click="changeAttendance(element, index, 3)"
                        >
                        </AppButton>
                      </AppButtonGroup>
                    </td>

                    <td class="align-middle">
                      <div class="d-flex flex-row">
                        <div v-if="element.isAbsence === 0 && element.isDelayArrival === 0" class="d-flex w-100 flex-column">Asistió a clases</div>
                        <div v-else class="d-flex flex-column">
                          <div>
                            Justificación:
                            {{ element.justificationAbsence }}
                          </div>
                          <div>
                            Tipo de inasistencia:
                            {{ absenceTypes.find((item: any) => item.id === element.absenceTypeId)?.name }}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                        <div class="form-check form-switch d-flex gap-1">
                          <!-- Checkbox para Cualitativa: se muestra activa si isQualitativeGrading es false -->
                          <input class="form-check-input" type="checkbox" id="qualitative" :checked="vAttendance$.formAttendance.isJustificationAbsence.$model" @click="onJustificationChange" />
                          <div>Justificada</div>
                        </div>
                      </AppFormField>
                      <AppFormField :form-control="vAttendance$.formAttendance.isJustificationAbsence">
                        <div class="form-check form-switch d-flex gap-1">
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

                      <AppVoiceInput v-model="vAttendance$.formAttendance.justificationAbsence.$model" textareaClass="form-control" />

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
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { PropType, Ref, computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { AttendanceFormDto } from '../dtos/attendance.dto';
import { AttendanceRelatedDataDto } from '../dtos/attendance.dto';
import { useHeaderStore } from '../../../stores/header.store';

import { CreateOrUpdateSessionService } from '../services/createOrUpdateSession.service';
import { CreateOrUpdateAttendanceService } from '../services/createOrUpdateAttendance.service';
import { GetAttendancesBySessionIdService } from '../services/getAttendancesBySessionId.service';
import { SentNotificationsAbsencesService } from '../services/sentNotificationsAbsences.service';
import { CreateOrUpdateAttendanceWithAttendancesService } from '../services/createOrUpdateAttendanceWithAttendances.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';
import { GetAbseceTypesService } from '../../institutionalConfiguration/services/getAbseceTypes.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();
const createOrUpdateAttendanceWithAttendancesService = new CreateOrUpdateAttendanceWithAttendancesService();
const sentNotificationsAbsencesService = new SentNotificationsAbsencesService();
const getAttendancesBySessionIdService = new GetAttendancesBySessionIdService();
const createOrUpdateAttendanceService = new CreateOrUpdateAttendanceService();
const createOrUpdateSessionService = new CreateOrUpdateSessionService();
const getAbseceTypeService = new GetAbseceTypesService();

export default defineComponent({
  name: 'AttendanceForm',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppAvatar,
    AppButton,
    AppIcon,
    AppCard,
    AppDrawer,
    AppVoiceInput,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
      required: true,
    },
    // relatedData: {
    //   type: Object as PropType<AttendanceRelatedDataDto>,
    //   required: true,
    // },
    attendance: {
      type: Object as PropType<AttendanceFormDto | null>,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const data = props.attendance ?? null;
    const relatedData: Ref<AttendanceRelatedDataDto | any> = ref([]);
    const absenceTypes = ref<any[]>([]);
    const isVisibleDrawer = ref(false);
    const pendingFile = ref<File | null>(null);

    const timetable: Ref<any[]> = ref([]);
    const courseId = parseInt(route.params.courseId.toString(), 10);

    const attendances: Ref<any[]> = ref([]);
    const selectedAttendance = ref();
    const indexBtnSelected = ref();

    const timetablesId = ref();

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
    const nameStudent = ref('');

    const form: any = reactive({
      planningWeekId: route.query.planningWeekId ? parseInt(route.query.planningWeekId as string, 10) : data?.planningWeekId ?? null,

      dateSince: data?.dateSince ?? null,
      dateUntil: data?.dateUntil ?? null,

      name: data?.name ?? null,
      topicIds: data?.topicIds ?? [],
    });
    const v$ = useVuelidate(
      {
        form: {
          planningWeekId: {},

          dateSince: { required },
          dateUntil: { required },

          name: {},
          topicIds: {},
        },
      },
      { form }
    );
    const formAttendance = reactive({
      id: '',
      isAbsence: 0,
      isDelayArrival: 0,
      userId: '',
      justificationAbsence: '',
      absenceTypeId: '',
      sessionId: '',
      isJustificationAbsence: false,

      files: '',
      attachmentAbsenceUrl: '',
    });
    const vAttendance$ = useVuelidate(
      {
        formAttendance: {
          isAbsence: {},
          isDelayArrival: {},
          userId: {},
          justificationAbsence: {},
          absenceTypeId: { required },
          sessionId: {},
          files: {},
          attachmentAbsenceUrl: {},
          isJustificationAbsence: {},
        },
      },
      { formAttendance }
    );
    onMounted(async () => {
      try {
        absenceTypes.value = await getAbseceTypeService.run();

        let response = await getSessionsRelatedDataFormService.run(courseId);
        relatedData.value = response;

        timetable.value = response.timetables ?? [];

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
    const nameStudentActual = (lastName: string, names: string) => {
      nameStudent.value = lastName + ' ' + names;
    };
    const getAttendances = async (id: number | null = null) => {
      const sessionId = data?.id ?? id;
      attendances.value = await getAttendancesBySessionIdService.run(sessionId);
    };
    const goBack = () => {
      router.go(-2);
    };

    const saveSession = async (goToPlanningWeek: boolean = false) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataSend = {
        planningWeekId: form.planningWeekId,
        courseId: courseId,

        dateSince: dayjs(form.dateSince).format('YYYY-MM-DD HH:mm'),
        dateUntil: dayjs(form.dateUntil).format('YYYY-MM-DD HH:mm'),

        name: form.name,
        topicIds: form.topicIds ?? [],
      };

      const response = await createOrUpdateSessionService.run(dataSend, data?.id);

      if (goToPlanningWeek && route.query.planningWeekId) {
        await router.push({
          name: 'administration.homeTeacherPlanningWeeksEdit',
          params: {
            academicPeriodGroupId: `${route.query.academicPeriodGroupId}`,
            planningWeekId: `${route.query.planningWeekId}`,
            courseId: courseId,
          },
        });
      } else {
        if (!data) {
          await router.push({
            name: 'administration.homeTeacher.attendance.edit',
            params: {
              courseId: courseId,
              sessionId: response.data.id,
            },
          });
        }
      }
    };

    const changeAttendance = async (attendance: any, index: any, indexBtn: number | null = null) => {
      indexBtnSelected.value = indexBtn;
      formAttendance.id = attendance.id;
      formAttendance.userId = attendance.userId;
      formAttendance.sessionId = attendance.sessionId;
      formAttendance.justificationAbsence = attendance.justificationAbsence;
      formAttendance.absenceTypeId = attendance.absenceTypeId;
      formAttendance.attachmentAbsenceUrl = attendance.attachmentAbsenceUrl;
      if (indexBtn == 1) {
        formAttendance.isJustificationAbsence = false;
        formAttendance.isDelayArrival = 0;
        formAttendance.isAbsence = 0;
        formAttendance.justificationAbsence = '';
        formAttendance.absenceTypeId = '';
        formAttendance.files = '';
        formAttendance.attachmentAbsenceUrl = '';
      } else if (indexBtn == 2) {
        formAttendance.isJustificationAbsence = attendance.isJustificationAbsence ? true : false;
        formAttendance.isDelayArrival = 1;
        formAttendance.isAbsence = 0;
      } else if (indexBtn == 3) {
        formAttendance.isJustificationAbsence = attendance.isJustificationAbsence ? true : false;

        formAttendance.isDelayArrival = 0;
        formAttendance.isAbsence = 1;
      }

      selectedAttendance.value = formAttendance;

      if (indexBtn === 2 || indexBtn === 3) {
        isVisibleDrawer.value = true;
      } else if (indexBtn === 1) {
        await createOrUpdateAttendance(selectedAttendance.value, selectedAttendance.value.id);
      }
    };

    const saveSessionWithAttendances = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataSend = {
        planningWeekId: form.planningWeekId,
        courseId: courseId,
        name: form.name,
        description: form.description,
        link: form.link,
        topicIds: form.topicIds,
        dateSince: dayjs(form.dateSince).format('YYYY-MM-DD HH:mm'),
        dateUntil: dayjs(form.dateUntil).format('YYYY-MM-DD HH:mm'),
      };

      const response = await createOrUpdateAttendanceWithAttendancesService.run(dataSend, data?.id);

      if (response && response.data && response.data.id) {
        await getAttendances(response.data.id);

        if (!data) {
          await router.push({
            name: 'administration.homeTeacher.attendance.edit',
            params: { courseId: courseId, sessionId: response.data.id },
          });
        }
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
        await createOrUpdateAttendance(selectedAttendance.value, selectedAttendance.value.id);
        isVisibleDrawer.value = false; // Cerrar el Drawer después de guardar
        vAttendance$.value.$reset();
        formAttendance.isJustificationAbsence = false;
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

    const createOrUpdateAttendance = async (attendance: any, id: any) => {
      let dataSend = {
        arrivalTime: attendance.arrivalTime ?? null,
        departureTime: attendance.departureTime ?? null,
        isAbsence: attendance.isAbsence ?? null,
        isDelayArrival: attendance.isDelayArrival ?? null,
        sessionId: attendance.sessionId ?? null,
        userId: attendance.userId ?? null,
        isJustificationAbsence: attendance.isJustificationAbsence ? 1 : 0,
        justificationAbsence: attendance.justificationAbsence ?? null,
        absenceTypeId: attendance.absenceTypeId ?? null,
        files: pendingFile.value,
        attachmentAbsenceUrl: attendance.attachmentAbsenceUrl ?? null,
      };
      await createOrUpdateAttendanceService.run(dataSend, id);
      pendingFile.value = null;
      await getAttendances();
    };

    const onFileJustificationChange = async (element: any, attendance: any) => {
      const files = element.target.files;
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

      timetable.value.forEach((timetable: any) => {
        if (timetable.id == timetablesId.value) currentTimetable.value = timetable;
      });

      const date = dayjs().day(currentTimetable.value.dayWeek);
      form.dateSince = `${dayjs(date.toISOString()).format('YYYY-MM-DD')}` + ' ' + currentTimetable.value.startTime;
      form.dateUntil = `${dayjs(date.toISOString()).format('YYYY-MM-DD')}` + ' ' + currentTimetable.value.endTime;
    };

    const sentNotificationsAbsences = async (sessionId: number | undefined) => {
      if (sessionId && sessionId >= 0) {
        await sentNotificationsAbsencesService.run(sessionId);
      }
    };

    return {
      loading,
      route,
      v$,
      vAttendance$,
      t,

      showNotificationSendBtn,
      timetablesId,
      attendances,
      timetable,
      courseId,
      relatedData,

      saveSessionWithAttendances,
      sentNotificationsAbsences,
      onFileJustificationChange,
      changeAttendance,
      saveSession,
      changeDate,
      getFile,
      goBack,
      absenceTypes,
      selectedAttendance,
      isVisibleDrawer,
      saveAttendance,
      toggleAttendance,
      cancelAttendance,
      indexBtnSelected,
      dayjs,
      onJustificationChange,
      onUnJustificationChange,
      nameStudentActual,
      nameStudent,
    };
  },
});
</script>

<style scoped>
.route-file {
  font-size: 0.8rem;
}
.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.form-check-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem rgba(var(--color-primary-rgb), 0.25);
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
