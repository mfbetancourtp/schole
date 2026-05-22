<template>
  <form @submit.prevent="saveForm" class="lesson-plan-form">
    <AppLoading v-if="loading"></AppLoading>
    <div v-else class="form-container">
      <div class="form-group">
        <AppFormField :form-control="v$.form.start" label="Inicio (Exploración)" class="form-field">
          <div class="input-wrapper">
            <input id="start" type="text" class="form-control" v-model="v$.form.start.$model" :disabled="!!planningWeekWithDetail?.isApproved" placeholder="Ingrese el Inicio (Exploración)" />
            <span v-if="v$.form.start.$error" class="error-message"> Este campo es requerido </span>
          </div>
        </AppFormField>
      </div>

      <div class="form-group">
        <AppFormField :form-control="v$.form.development" label="Desarrollo (Estructuración y práctica)" class="form-field">
          <div class="input-wrapper">
            <input id="development" type="text" class="form-control" v-model="v$.form.development.$model" :disabled="!!planningWeekWithDetail?.isApproved" placeholder="Ingrese el desarrollo" />
            <span v-if="v$.form.development.$error" class="error-message"> Este campo es requerido </span>
          </div>
        </AppFormField>
      </div>

      <div class="form-group">
        <AppFormField :form-control="v$.form.end" label="Cierre (Transferencia y valoración)" class="form-field">
          <div class="input-wrapper">
            <input id="end" type="text" class="form-control" v-model="v$.form.end.$model" :disabled="!!planningWeekWithDetail?.isApproved" placeholder="Ingrese el cierre" />
            <span v-if="v$.form.end.$error" class="error-message"> Este campo es requerido </span>
          </div>
        </AppFormField>
      </div>

      <div class="form-group">
        <AppFormField :form-control="v$.form.literature" label="Recursos y referente bibliográfico" class="form-field">
          <div class="input-wrapper">
            <input
              id="literature"
              type="text"
              class="form-control"
              v-model="v$.form.literature.$model"
              :disabled="!!planningWeekWithDetail?.isApproved"
              placeholder="Ingrese los recursos y referente bibliográfico"
            />
            <span v-if="v$.form.literature.$error" class="error-message"> Este campo es requerido </span>
          </div>
        </AppFormField>
      </div>

      <div class="form-group">
        <AppFormField :form-control="v$.form.assessment" label="Evaluación formativa" class="form-field">
          <div class="input-wrapper">
            <input
              id="assessment"
              type="text"
              class="form-control"
              v-model="v$.form.assessment.$model"
              :disabled="!!planningWeekWithDetail?.isApproved"
              placeholder="Ingrese la evaluación formativa"
            />
            <span v-if="v$.form.assessment.$error" class="error-message"> Este campo es requerido </span>
          </div>
        </AppFormField>
      </div>

      <div class="form-group">
        <AppFormField :form-control="v$.form.reflection" label="Reflexión pedagógica" class="form-field">
          <div class="input-wrapper">
            <input
              id="reflection"
              type="text"
              class="form-control"
              v-model="v$.form.reflection.$model"
              :disabled="!!planningWeekWithDetail?.isApproved"
              placeholder="Ingrese la reflexión pedagógica"
            />
            <span v-if="v$.form.reflection.$error" class="error-message"> Este campo es requerido </span>
          </div>
        </AppFormField>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="primary-button" :disabled="v$.$invalid">Siguiente</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, Ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateOrUpdatePlanningWeeksService } from '../services/createOrUpdatePlanningWeeks.service';
import { GetPlanningWeeksWithDetailsService } from '../services/getPlanningWeeksWithDetails.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';
import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';
import { GetSessionByIdService } from '../services/getSessionById.service';

const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();
const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const getSessionByIdService = new GetSessionByIdService();

export default defineComponent({
  name: 'PlanDeClasesForm',
  components: {
    AppFormField,
    AppLoading,
  },
  props: {
    courseId: {
      type: Number,
      required: true,
    },
    planningWeekWithDetail: {
      type: Object as PropType<any | null>,
      default: null,
    },
  },
  setup(props, { emit }) {
    const loading = ref(true);
    // Instanciamos el servicio
    const createOrUpdatePlanningWeeksService = new CreateOrUpdatePlanningWeeksService();

    const planningWeekWithDetails: Ref<any> = ref(null);
    const relatedData: Ref<any | null> = ref(null);

    const fetchData = async (planningWeekId: number) => {
      loading.value = true;
      const courseIdPW = localStorage.getItem('courseIdPW');
      const planningWeekIdLS = localStorage.getItem('planningWeekId');
      try {
        planningWeekWithDetails.value = await getPlanningWeeksWithDetailsService.run(planningWeekId ?? planningWeekIdLS);

        // Actualiza aquí los valores del formulario
        form.start = planningWeekWithDetails.value?.start ?? '';
        form.development = planningWeekWithDetails.value?.development ?? '';
        form.end = planningWeekWithDetails.value?.end ?? '';
        form.literature = planningWeekWithDetails.value?.literature ?? '';
        form.assessment = planningWeekWithDetails.value?.assessment ?? '';
        form.reflection = planningWeekWithDetails.value?.reflection ?? '';

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

    // Creamos el objeto reactivo para el formulario,
    // inicializando los campos con la información pre-cargada si existe.
    const form = reactive({
      start: planningWeekWithDetails.value ? planningWeekWithDetails?.value?.start : '',
      development: planningWeekWithDetails.value ? planningWeekWithDetails?.value?.development : '',
      end: planningWeekWithDetails.value ? planningWeekWithDetails?.value?.end : '',
      literature: planningWeekWithDetails.value ? planningWeekWithDetails?.value?.literature : '',
      assessment: planningWeekWithDetails.value ? planningWeekWithDetails?.value?.assessment : '',
      reflection: planningWeekWithDetails.value ? planningWeekWithDetails?.value?.reflection : '',
    });

    const v$ = useVuelidate(
      {
        form: {
          start: { required },
          development: { required },
          end: { required },
          literature: { required },
          assessment: { required },
          reflection: { required },
        },
      },
      { form }
    );

    // Función que arma el payload y envía los datos al servicio
    const saveForm = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      const dataSendLocalStorage = JSON.parse(localStorage.getItem('dataSendPW') as any);

      const payload = {
        courseId: props.courseId,
        start: form.start,
        development: form.development,
        end: form.end,
        literature: form.literature,
        assessment: form.assessment,
        reflection: form.reflection,

        // data desde props
        title: planningWeekWithDetails?.value.title ?? dataSendLocalStorage?.title,
        starDate: planningWeekWithDetails?.value.starDate ?? dataSendLocalStorage?.starDate,
        endDate: planningWeekWithDetails?.value.endDate ?? dataSendLocalStorage?.endDate,
      };

      try {
        const planningWeekId = localStorage.getItem('planningWeekId');
        // Llamamos al método de creación del servicio
        await createOrUpdatePlanningWeeksService.run(payload as any, planningWeekWithDetails?.value?.id ?? planningWeekId);

        // Esto responde un id, tomar ese id para editar la siguiente sección

        // Emitimos el evento para notificar al componente padre que se guardó la planificación
        emit('planning-saved');
      } catch (error) {
        console.error('Error al guardar la planificación', error);
      }
    };

    return {
      loading,
      v$,
      form,
      saveForm,
      planningWeekWithDetails,
    };
  },
});
</script>

<style scoped>
.lesson-plan-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.form-title {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #4caf50;
  padding-bottom: 0.5rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.form-group {
  margin-bottom: 0.75rem;
  width: 100%;
}

.form-field {
  width: 100%;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.3s;
  background-color: #fff;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  outline: none;
}

.form-control:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  color: #f44336;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eaeaea;
}

.primary-button {
  background-color: var(--color-primary);
  color: var(--color-light);
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s;
}

.primary-button:hover {
  background-color: var(--color-secondary);
}

.primary-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.primary-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .lesson-plan-form {
    padding: 0.75rem;
  }

  .form-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .form-control {
    padding: 0.6rem 0.75rem;
  }

  .primary-button {
    padding: 0.5rem 1.25rem;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-container {
    max-height: calc(100vh - 150px);
  }

  .form-group {
    margin-bottom: 0.5rem;
  }
}
</style>
