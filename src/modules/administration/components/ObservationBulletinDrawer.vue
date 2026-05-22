<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility" :size="'lg'">
    <template #head>
      <span class="title-form px-3">{{ t(title) }}: {{ userData?.[0]?.[0] }}</span>
    </template>
    <template #body>
      <AppLoading v-if="loading" class="d-flex align-items-center h-80" />
      <div v-else class="p-4 overflow-auto">
        <!-- Generar dinámicamente los campos de desempeño -->
        <div v-for="(outcome, index) in form.learningOutcomes" :key="index">
          <AppFormField :form-control="v$.learningOutcomes[index].personalizedDescription" :label="'Desempeño ' + (index + 1)">
            <AppVoiceInput v-model="outcome.personalizedDescription" textareaClass="form-control" />
          </AppFormField>
        </div>

        <!-- Campo de observaciones -->
        <AppFormField :form-control="v$.observations" label="Observaciones">
          <!--  <input v-model="form.observations" type="text" class="form-control" /> -->
          <AppEditorDocument v-model="form.observations" style="max-height: 60vh" class="overflow-clip" withDictation></AppEditorDocument>
        </AppFormField>
      </div>
    </template>
    <template #footer>
      <div class="buttons-form d-flex gap-3 justify-content-between">
        <div>
          <AppButton @click="clearForm()">Limpiar</AppButton>
        </div>
        <div>
          <AppButton @click="save()" label="core.save"></AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch, nextTick } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useI18n } from 'vue-i18n';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEditorDocument from '../../../shared/components/Editor/AppEditorDocument.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { GetActivitiesSummaryByPeriodIdService } from '../services/getActivitiesSummaryByPeriodId.service';
import { PostPersonalizedLearningOutcomesService } from '../services/postPersonalizedLearningOutcomes.service';

const getActivitiesSummaryByPeriodIdService = new GetActivitiesSummaryByPeriodIdService();
const postPersonalizedLearningOutcomesService = new PostPersonalizedLearningOutcomesService();

export default defineComponent({
  name: 'ObservationBulletinDrawer',
  components: {
    AppDrawer,
    AppFormField,
    AppButton,
    AppLoading,
    AppEditorDocument,
    AppVoiceInput,
  },
  props: {
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: Number,
      required: true,
    },
    periodId: {
      type: Number,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const title = ref('Crear Observación');
    const userData = ref();
    const learningOutcomes = ref();
    const loading = ref(true);
    const getData = async () => {
      try {
        const auxPeriodId = (props.periodId as any) != 'null' ? props.periodId : null;
        const res = await getActivitiesSummaryByPeriodIdService.run(props.courseId, auxPeriodId);
        learningOutcomes.value = res.learningOutcomes;
        userData.value = res.activitiesSummary?.consolidate.filter((user: any) => user?.[1] === props.userId) || res.learningOutcomes.filter((item: any) => item.userId === props.userId);

        await nextTick();
        console.log(filteredOutcomes.value);

        updateForm(filteredOutcomes.value);
      } catch (e) {
        console.error(e);
      }
    };
    const filteredOutcomes = computed(() => learningOutcomes.value.filter((outcome: any) => outcome.userId === props.userId));
    const updateForm = (outcomes: any) => {
      console.log('update', outcomes);

      // Mapear los desempeños válidos al formato correcto
      form.learningOutcomes = outcomes
        .filter((outcome: any) => outcome.id !== null) // Excluir valores nulos
        .map((outcome: any) => ({
          learningOutcomeId: outcome.id, // Asignar el ID correctamente
          personalizedDescription: outcome.personalizedDescription || outcome.description, // Guardar la descripción
          description: outcome.description, // Guardar la descripción
        }));

      console.log(form);

      // Buscar la observación (si hay un objeto con id === null)
      const observation = outcomes.find((outcome: any) => outcome.id === null);
      form.observations = observation && observation.observations != null ? observation.observations : '';
    };
    const clearForm = () => {
      form.learningOutcomes = form.learningOutcomes.map((outcome: any) => ({
        ...outcome,
        personalizedDescription: outcome.description, // Restablecer a la descripción original
      }));

      form.observations = ''; // Limpiar las observaciones
    };

    const resetForm = () => {
      form.learningOutcomes = [];
      form.observations = '';
      userData.value = null;
      v$.value.$reset(); // Resetea las validaciones
      console.log('Formulario limpiado');
    };

    onMounted(async () => {
      loading.value = false;
    });
    const updateVisibility = (value: boolean) => {
      console.log(props.isVisible);
      emit('update:isVisible', value); // Emitimos el evento para v-model
      if (!value) {
        setTimeout(() => {
          resetForm(); // Ejecutar reset después de un pequeño retraso
        }, 300);
      }
      //props.isVisible = !props.isVisible;
    };

    watch(
      () => props.isVisible,
      async (newVal) => {
        if (newVal) {
          // Solo ejecuta cuando es true
          loading.value = true;
          await getData();
          loading.value = false;
        }
      }
    );

    const form: any = reactive({
      learningOutcomes: [],
      observations: '',
    });

    const rules = computed(() => ({
      learningOutcomes: form.learningOutcomes.map(() => ({
        personalizedDescription: { required },
      })),
      observations: {},
    }));

    const v$ = useVuelidate(rules, form) as any;

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      interface LearningOutcome {
        learningOutcomeId: number;
        description: string;
        personalizedDescription: string;
      }

      /* const filteredLearningOutcomes = form.learningOutcomes
        .filter(({ learningOutcomeId, description, personalizedDescription }: LearningOutcome) => {
          const initialOutcome = filteredOutcomes.value.find((o: any) => o.id === learningOutcomeId);
          const initialPersonalized = initialOutcome?.personalizedDescription ?? "";

          if (description === personalizedDescription) {
            return initialPersonalized !== ""; // Si la inicial es diferente de "", se mantiene en el array
          }
          return true; // Si son diferentes, siempre se envía
        })
        .map(({ description, personalizedDescription, ...rest }: any) => ({
          ...rest,
          personalizedDescription: description === personalizedDescription ? "" : personalizedDescription, 
        })); */

      const filteredLearningOutcomes = form.learningOutcomes
        //.filter(({ description, personalizedDescription }: LearningOutcome) => description !== personalizedDescription) // Eliminamos si son iguales
        .map(({ personalizedDescription, learningOutcomeId }: any) => ({
          learningOutcomeId,
          personalizedDescription, // Solo mantenemos `personalizedDescription` cuando es diferente
        }));

      console.log(filteredLearningOutcomes);
      try {
        const auxPeriodId = (props.periodId as any) != 'null' ? props.periodId : null;
        const dataObervation = {
          courseId: props.courseId,
          periodId: auxPeriodId,
          userId: props.userId,
          learningOutcomes: filteredLearningOutcomes,
          observations: form.observations,
        };
        await postPersonalizedLearningOutcomesService.run(dataObervation);
        console.log(form.learningOutcomes);
        console.log(form.observations);
        console.log('sendData', dataObervation);
        //guardamos y actualizasmos
        updateVisibility(false);
        // resetForm();
        emit('reload-data');
      } catch (e) {
        console.error(e);
      }
    };

    return {
      t,
      v$,
      title,
      updateVisibility,
      save,
      clearForm,
      loading,
      form,
      userData,
    };
  },
});
</script>

<style scoped>
.title-form {
  margin-left: auto;
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
}
/*.content-form {
  padding: 20px;
  /* max-height: 76vh;
  overflow-y: auto;
}*/
.h-80 {
  height: 80% !important;
}
.overflow-clip {
  overflow-x: clip;
}
</style>
