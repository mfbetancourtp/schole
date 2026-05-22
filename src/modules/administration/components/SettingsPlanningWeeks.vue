<template>
  <AppLoading v-if="loading" />
  <template v-else>
    <div class="planning-form-container">
      <section :class="{ 'form-disabled': planningWeekWithDetails?.isApproved }">
        <form @submit.prevent="save()">
          <!-- Campo Título de la Clase -->
          <AppFormField :form-control="v$.form.title" label="Título de la Clase" class="form-field">
            <input
              id="title"
              type="text"
              class="form-control custom-input"
              v-model="v$.form.title.$model"
              :disabled="!!planningWeekWithDetails?.isApproved"
              placeholder="Ingrese el título de la clase"
            />
          </AppFormField>

          <!-- Campo Periodo -->
          <AppFormField :form-control="v$.form.periodId" label="Periodo" class="form-field">
            <AppAutocomplete id="periodId" :options="periods" v-model="selectedPeriodId" :disabled="planningWeekWithDetails?.isApproved" label="name" class="custom-select" />
          </AppFormField>

          <!-- Campo Competencias (solo listado, no se guarda) -->
          <AppFormField :form-control="v$.form.competencyId" label="Competencias" class="form-field">
            <AppAutocomplete
              id="competencyAutocomplete"
              :options="competencyOptions"
              v-model="form.competencyId"
              :disabled="!selectedPeriodId || selectedPeriodId === 0 || planningWeekWithDetails?.isApproved"
              label="description"
              :reduce="reduceoption"
              class="custom-select"
              placeholder="Seleccione una competencia"
            />
          </AppFormField>

          <!-- Campo Desempeño -->
          <AppFormField :form-control="v$.form.learningOutcomeId" label="Desempeño" class="form-field">
            <AppAutocomplete
              id="learningOutcomeId"
              :options="performanceOptions"
              v-model="v$.form.learningOutcomeId.$model"
              :disabled="!selectedCompetencyObject || planningWeekWithDetails?.isApproved"
              label="label"
              class="custom-select"
              placeholder="Seleccione un desempeño"
            />
          </AppFormField>

          <!-- Sección de Selección de Horario -->
          <div class="schedule-section">
            <p class="section-title">Seleccionar Horario</p>
            <div class="schedule-buttons">
              <button v-for="session in sessionOptions" :key="session.id" type="button" class="schedule-btn" :class="{ active: isSessionSelected(session) }" @click="selectSession(session)">
                {{ session.label }}
              </button>
              <button type="button" class="schedule-btn other-btn" @click="clearDates">Otro</button>
            </div>
          </div>

          <!-- Campo Fecha y Hora de Inicio -->
          <div class="date-time-fields">
            <AppFormField :form-control="v$.form.starDate" label="Inicio" class="form-field date-field">
              <input id="starDate" type="datetime-local" class="form-control custom-input form-control-mod" v-model="v$.form.starDate.$model" :disabled="!!planningWeekWithDetails?.isApproved" />
            </AppFormField>

            <!-- Campo Fecha y Hora de Fin -->
            <AppFormField :form-control="v$.form.endDate" label="Cierre" class="form-field date-field">
              <input id="endDate" type="datetime-local" class="form-control custom-input form-control-mod" v-model="v$.form.endDate.$model" :disabled="!!planningWeekWithDetails?.isApproved" />
            </AppFormField>
          </div>

          <div class="form-actions">
            <AppCheckPermission :permission="!planningWeekWithDetails ? 'classroom.planningWeeks.create' : 'classroom.planningWeeks.edit'">
              <AppButton :disabled="!!planningWeekWithDetails?.isApproved" :label="!planningWeekWithDetails ? 'Siguiente' : 'Siguiente'" class="submit-btn" />
            </AppCheckPermission>
          </div>
        </form>
      </section>
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, computed, watch, Ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

// Componentes
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
// import SelectCompetenciesActivitiesSessions from './SelectCompetenciesActivitiesSessions.vue';

import { PlanningWeekWithDetailDto } from '../dtos/planningWeek.dto';

// Services
import { ICreateOrUpdatePlanningWeeksService } from '../services/createOrUpdatePlanningWeeks.service';
import { CreateOrUpdatePlanningWeeksService } from '../services/createOrUpdatePlanningWeeks.service';
import { GetPeriodsPlanningsWeeksService } from '../services/getPeriodsPlanningWeeks.service';
import { GetListCompetencesService } from '../services/getListCompetences.service';
import { GetSubjectAssignmentsService } from '../../academicPlanning/services/getSubjectAssignments.service';
import { GetActiveCoursesService } from '../services/getActiveCourses.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';
import { GetSessionByIdService } from '../services/getSessionById.service';
import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';
import { GetPlanningWeeksWithDetailsService } from '../services/getPlanningWeeksWithDetails.service';

const createOrUpdatePlanningWeeksService = new CreateOrUpdatePlanningWeeksService();
const getPeriodsPlanningsWeeksService = new GetPeriodsPlanningsWeeksService();
const getListCompetencesService = new GetListCompetencesService();
const getActiveCoursesService = new GetActiveCoursesService();
const getSubjectAssignmentsService = new GetSubjectAssignmentsService();
const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();

const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const getSessionByIdService = new GetSessionByIdService();

export default defineComponent({
  name: 'SettingsPlanningWeeks',
  components: {
    // SelectCompetenciesActivitiesSessions,
    AppCheckPermission,
    AppFormField,
    AppLoading,
    AppButton,
    AppAutocomplete,
  },
  props: {
    planningWeekWithDetail: {
      type: Object as PropType<any | null>,
      default: null,
    },
    academicPeriodGroupId: { type: Number, required: false },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const periods = ref<any[]>([]);
    const competencies = ref<any[]>([]);
    const selectedCompetency = ref<any>(null);
    const sessions = ref<any[]>([]);

    const courseId = parseInt(route.params.courseId as string, 10);
    const selectedPeriodId = ref(props.planningWeekWithDetail?.periodId || null);
    let curriculumSubjectId = ref<number | null>(null);

    const planningWeekWithDetails: Ref<any> = ref(null);
    const relatedData: Ref<any | null> = ref(null);

    const fetchData = async (planningWeekId: number) => {
      loading.value = true;
      const courseIdPW = localStorage.getItem('courseIdPW');
      const planningWeekIdLS = localStorage.getItem('planningWeekId');
      try {
        planningWeekWithDetails.value = await getPlanningWeeksWithDetailsService.run(planningWeekId ?? planningWeekIdLS);

        // Actualiza aquí los valores del formulario
        (form.courseId = planningWeekWithDetails?.value?.courseId ?? courseId), (form.title = planningWeekWithDetails?.value?.title ?? '');
        form.starDate = planningWeekWithDetails?.value?.starDate ?? '';
        form.endDate = planningWeekWithDetails?.value?.endDate ?? '';
        (form.range = planningWeekWithDetails?.value?.range ?? 'week'),
          (form.periodId = planningWeekWithDetails?.value?.periodId ?? null),
          (form.competencyId = planningWeekWithDetails?.value?.competency?.id ?? null),
          (form.learningOutcomeId = planningWeekWithDetails?.value?.learningOutcomeId ?? null);

        const relatedDataSession = await getSessionsRelatedDataFormService.run(planningWeekWithDetails?.value.id ?? (courseIdPW as any));
        relatedData.value = await getRelatedDataPlanningWeeksService.run({
          courseId: planningWeekWithDetails?.value.id as any,
        });

        const topics: any[] = relatedDataSession.topics;

        if (planningWeekWithDetails.value && planningWeekWithDetails.value.sessions.length) {
          for (let i = 0; i < planningWeekWithDetails.value.sessions.length; i++) {
            const sessionId = planningWeekWithDetails.value.sessions[i].id;
            const currentSession = await getSessionByIdService.run(sessionId);
            const topicIds: any[] = currentSession.topicIds;
            const lcTopics: any[] = [];

            for (let j = 0; j < topicIds.length; j++) {
              const currentTopic = topics.filter((item) => item.id == topicIds[j]);

              if (currentTopic.length) lcTopics.push(currentTopic[0]);
            }

            if (lcTopics.length) planningWeekWithDetails.value.sessions[i].topics = lcTopics;
            else planningWeekWithDetails.value.sessions[i].topics = [];
          }
        }
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    };

    onMounted(async () => {
      try {
        const planningWeekIdStr = localStorage.getItem('planningWeekId');
        const planningWeekId = planningWeekIdStr ? parseInt(planningWeekIdStr, 10) : null;

        if (props?.planningWeekWithDetail?.id ?? planningWeekId) {
          await fetchData(props?.planningWeekWithDetail?.id ?? planningWeekId);
        } else {
          console.error('No se encontró planningWeekId en localStorage');
        }
      } catch (error) {
        console.error('Error', error);
      }
    });

    // Campos del formulario: starDate y endDate en formato "YYYY-MM-DDThh:mm"
    const form = reactive({
      courseId: planningWeekWithDetails?.value?.courseId ?? courseId,
      title: planningWeekWithDetails?.value?.title ?? '',
      starDate: planningWeekWithDetails?.value?.starDate ?? '',
      endDate: planningWeekWithDetails?.value?.endDate ?? '',
      range: planningWeekWithDetails?.value?.range ?? 'week',
      periodId: planningWeekWithDetails?.value?.periodId ?? null,
      competencyId: planningWeekWithDetails?.value?.competency?.id ?? null,
      learningOutcomeId: planningWeekWithDetails?.value?.learningOutcomeId ?? null,
    });

    const v$ = useVuelidate(
      {
        form: {
          courseId: { required },
          title: { required },
          starDate: { required },
          endDate: { required },
          range: { required },
          periodId: { required },
          competencyId: {},
          learningOutcomeId: { required },
        },
      },
      { form }
    );

    // Mapeo de competencias para agregar la propiedad "label"
    const competencyOptions = computed(() => {
      return competencies.value.map((item: any) => ({
        ...item,
        label: item.description ? item.description : 'Sin etiqueta',
      }));
    });

    const selectedCompetencyObject = computed(() => {
      return competencyOptions.value.find((comp) => comp.id === form.competencyId) || null;
    });

    // Opciones de desempeño basadas en la competencia seleccionada
    const performanceOptions = computed(() => {
      if (!selectedCompetencyObject.value) return [];

      return (selectedCompetencyObject.value.learningOutcomes || []).map((o: any) => {
        return {
          ...o,
          // Asumiendo que “description” es el texto a mostrar
          label: o.description ?? '(Desempeño sin descripción)',
        };
      });
    });

    // Función auxiliar para formatear una hora (cadena "HH:mm:ss") a "h:mm am/pm"
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      if (parts.length < 2) return timeStr;
      let hour = parseInt(parts[0], 10);
      const minute = parts[1];
      const suffix = hour >= 12 ? 'pm' : 'am';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${minute} ${suffix}`;
    };

    // Computed para formatear las sesiones (timetables) en botones amigables
    const sessionOptions = computed(() => {
      return sessions.value.map((session: any) => ({
        ...session,
        label: formatSessionLabel(session),
      }));
    });

    // Función para formatear el label de cada sesión (por ejemplo: "Miércoles de 7:00 am a 8:30 am")
    const formatSessionLabel = (session: any) => {
      const dayMap: { [key: number]: string } = {
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado',
        7: 'Domingo',
      };
      const dayName = dayMap[session.dayWeek] || '';
      const startFormatted = formatTime(session.startTime);
      const endFormatted = formatTime(session.endTime);
      return `${dayName} ${startFormatted} ${endFormatted}`;
    };

    // Función para calcular la fecha de la sesión según el día de la semana (1 a 7)
    // Sin usar plugins adicionales, ajustamos manualmente.
    const getSessionDate = (targetDay: number) => {
      const today = dayjs();
      // dayjs().day() devuelve 0 para domingo, 1 para lunes, etc.
      // Convertimos: si hoy es domingo, se considera 7.
      const currentDay = today.day() === 0 ? 7 : today.day();
      let offset = targetDay - currentDay;
      // Si hoy es sábado (6) o domingo (7), forzamos que la sesión sea la próxima semana
      if (currentDay >= 6) {
        offset = targetDay - currentDay + 7;
      } else {
        if (offset <= 0) {
          offset += 7;
        }
      }
      return today.add(offset, 'day');
    };

    // Al seleccionar un botón de sesión, se asignan los valores de fecha concatenados con la hora.
    const selectSession = (session: any) => {
      const sessionDate = getSessionDate(session.dayWeek);
      const dateStr = sessionDate.format('YYYY-MM-DD');
      // Se toman solo "HH:mm" de los tiempos
      form.starDate = `${dateStr} ${session.startTime.slice(0, 5)}`;
      form.endDate = `${dateStr} ${session.endTime.slice(0, 5)}`;
    };

    // Función para verificar si una sesión está seleccionada
    const isSessionSelected = (session: any) => {
      if (!form.starDate || !form.endDate) return false;

      const sessionDate = getSessionDate(session.dayWeek);
      const dateStr = sessionDate.format('YYYY-MM-DD');
      const startDateTime = `${dateStr} ${session.startTime.slice(0, 5)}`;
      const endDateTime = `${dateStr} ${session.endTime.slice(0, 5)}`;

      return form.starDate === startDateTime && form.endDate === endDateTime;
    };

    // Función para limpiar los inputs de fecha (botón "Otro")
    const clearDates = () => {
      form.starDate = '';
      form.endDate = '';
    };

    onMounted(async () => {
      try {
        // Obtener cursos activos
        let courses: any[] = await getActiveCoursesService.run({});
        let academicPeriodGroupId: number | null = null;
        let subjectAssignmentId: number | null = null;

        for (let i = 0; i < courses.length; i++) {
          let currentData: any = courses[i];
          for (let j = 0; j < currentData.courses.length; j++) {
            let currentCourse: any = currentData.courses[j];
            if (currentCourse.id == courseId) {
              academicPeriodGroupId = currentData.id;
              subjectAssignmentId = currentCourse.subjectAssignmentId;
              break;
            }
          }
        }

        // Cargar PERIODOS
        const per = await getPeriodsPlanningsWeeksService.run(props?.academicPeriodGroupId as any);
        periods.value = per;

        // Cargar COMPETENCIAS
        if (academicPeriodGroupId) {
          let resp = await getSubjectAssignmentsService.run(academicPeriodGroupId);
          resp.forEach((subjectAssignment: any) => {
            if (subjectAssignment.id === subjectAssignmentId) {
              curriculumSubjectId.value = subjectAssignment.curriculumSubjectId;
            }
          });
        }

        // Si viene el periodId desde las props se carga de inmediato
        if (planningWeekWithDetails?.value?.periodId && curriculumSubjectId.value) {
          const comp = await getListCompetencesService.run(curriculumSubjectId.value, planningWeekWithDetails?.value?.periodId);
          competencies.value = comp;
        }

        // Cargar las sesiones relacionadas (timetables)
        const sessionsResponse = await getSessionsRelatedDataFormService.run(courseId);
        sessions.value = sessionsResponse.timetables || [];
      } catch (error) {
        console.error(error);
      }
      loading.value = false;
    });

    watch(selectedPeriodId, async (newPeriodId) => {
      const periodId = Number(newPeriodId); // Convertirlo explícitamente a número

      form.periodId = periodId;
      if (!periodId || periodId === 0) {
        competencies.value = [];
        return;
      }
      if (curriculumSubjectId.value) {
        const comp = await getListCompetencesService.run(curriculumSubjectId.value, periodId);
        competencies.value = comp;
      }
    });

    watch(
      () => competencies.value,
      (newCompetencies) => {
        if (form.competencyId && competencyOptions.value.length) {
          selectedCompetency.value = competencyOptions.value.find((comp: any) => comp.id === form.competencyId) || null;
        }
      },
      { immediate: true }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataSend: any = {
        courseId: form.courseId,
        title: form.title ?? '',
        starDate: form.starDate ?? '',
        endDate: form.endDate ?? '',
        range: form.range,
        periodId: form.periodId ?? 0,
        learningOutcomeId: form.learningOutcomeId,
      };

      try {
        const response = await createOrUpdatePlanningWeeksService.run(dataSend, planningWeekWithDetails?.value?.id);

        localStorage.setItem('dataSendPW', JSON.stringify(dataSend));

        localStorage.setItem('planningWeekId', response?.data?.id);
        // Esto responde un id, tomar ese id para editar la siguiente sección

        // Emitir el evento para indicar éxito
        emit('planning-saved');
      } catch (e) {
        console.error(e);
      }
    };

    const reduceoption = (option: any) => option.id;

    return {
      loading,
      v$,
      t,
      periods,
      competencies,
      selectedCompetency,
      selectedCompetencyObject,
      competencyOptions,
      performanceOptions,
      form,
      save,
      planningWeekWithDetails: planningWeekWithDetails?.value,
      sessionOptions,
      selectSession,
      clearDates,
      reduceoption,
      isSessionSelected,
      selectedPeriodId,
    };
  },
});
</script>

<style scoped>
.planning-form-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
}

.form-title {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0f4f8;
}

.form-field {
  margin-bottom: 1rem;
}

.custom-input {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.custom-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.custom-select {
  border-radius: 6px;
  font-size: 0.875rem;
}

.section-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.schedule-section {
  margin-bottom: 1rem;
  background-color: #f8fafc;
  border-radius: 6px;
}

.schedule-buttons {
  display: flex;
  flex-wrap: wrap;
}

.schedule-btn {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  flex: 0 0 auto;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-btn:hover {
  background-color: #e2e8f0;
}

.schedule-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.other-btn {
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
}

.date-time-fields {
  display: flex;
  flex-direction: row;
}

@media (min-width: 640px) {
  .date-time-fields {
    flex-direction: row;
  }

  .date-field {
    flex: 1;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f4f8;
}

.submit-btn {
  background-color: var(--color-primary);
  color: var(--color-light);
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-btn:hover {
  background-color: var(--color-secondary);
}

.form-disabled {
  opacity: 0.75;
  pointer-events: none;
}

.form-control-mod {
  max-width: 190px;
}

/* Estilos responsivos para pantallas pequeñas */
@media (max-width: 480px) {
  .planning-form-container {
    padding: 1rem;
  }

  .form-title {
    font-size: 1.1rem;
  }

  .schedule-btn {
    font-size: 0.7rem;
    padding: 0.35rem 0.5rem;
  }
}
</style>
