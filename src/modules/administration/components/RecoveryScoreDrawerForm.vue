<!-- eslint-disable vue/no-mutating-props -->
<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility">
    <template #head>
      <span class="title-form">{{ t(title) }} - {{ nameStudentId }}</span>
    </template>
    <template #body>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="content-form">
          <h5 class="under__line">Tipo de calificación</h5>
          <div class="content-input">
            <div class="d-flex gap-1 justify-content-between w-100">
              <!-- <AppFormField :form-control="v$.form.recoveryScoreIsImprovement">
                <div class="form-check form-switch d-flex gap-1">
                  <input class="form-check-input" type="checkbox" id="qualitative" :checked="v$.form.recoveryScoreIsImprovement.$model" @click="onJustificationChange" />
                  <div>Mejoramiento de Calificación</div>
                </div>
              </AppFormField> -->
              <AppFormField :form-control="v$.form.recoveryScoreIsImprovement">
                <div class="form-check form-switch d-flex gap-1">
                  <!-- Checkbox para Mejoramiento de Calificación: se muestra activa si recoveryScoreIsImprovement es true -->
                  <input class="form-check-input" type="checkbox" id="qualitative" :checked="v$.form.recoveryScoreIsImprovement.$model" @click="onJustificationChange" />
                  <div>Mejoramiento de Calificación</div>
                </div>
              </AppFormField>
            </div>
          </div>
          <div class="form-section">
            <AppFormField :label="'Calificación anterior'">
              <input v-if="recoveryType === 0" v-model="recovery" class="form-control" type="number" disabled />
              <AppAutocomplete
                v-else
                v-model="recovery"
                class="app-autocomplete-fixed"
                :options="ratingScalesList"
                :reduce="(ratingScale: any) => ratingScale.maximumValue"
                label="description"
                disabled
              />
            </AppFormField>
            <AppFormField :form-control="v$.form.recoveryScore" :label="'Nueva calificación'">
              <input v-if="recoveryType === 0" v-model="v$.form.recoveryScore.$model" class="form-control" type="number" />
              <AppAutocomplete
                v-else
                v-model="v$.form.recoveryScore.$model"
                class="app-autocomplete-fixed"
                :options="computedOptions"
                :reduce="(ratingScale: any) => ratingScale.maximumValue"
                label="description"
              />
            </AppFormField>
            <AppFormField :form-control="v$.form.comment" :label="'Comentario'">
              <AppVoiceInput v-model="v$.form.comment.$model"
                class="form-control" id="description" textareaClass="form-control"  />
            </AppFormField>
          </div>
        </div>
      </template>
    </template>
    <template #footer>
      <div class="buttons-form">
        <div>
          <AppButton @click="save()" label="core.save" :disabled="levelsSelected.some((level) => !level.levelDescription)"></AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, Ref, computed, PropType } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CreateOrUpdateLearningOutcomesScoresService } from '../services/createOrUpdateLearningOutcomesScores.service';
import { GetRatingScalesImprovementLevelingService } from '../services/getRatingScalesImprovementLeveling.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateLearningOutcomesScoresService = new CreateOrUpdateLearningOutcomesScoresService();
const getRatingScalesImprovementLevelingService = new GetRatingScalesImprovementLevelingService();

export default defineComponent({
  name: 'ActivitiesTeacherDrawerForm',
  components: {
    AppDrawer,
    AppFormField,
    AppLoading,
    AppButton,
    AppAutocomplete,
    AppVoiceInput,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    periodId: {
      type: Number,
      required: true,
    },
    learningOutcomeId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    couseId: {
      type: Number,
      required: true,
    },
    recovery: {
      type: String,
      required: true,
    },
    nameStudentId: {
      type: String,
      required: true,
    },
    recoveryType: {
      type: Number,
      required: true,
    },
    ratingScalesList: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value);
    };

    const courseId = parseInt(route.params.courseId.toString(), 10);
    const ratingScalesListOptions = ref<any>(null);

    const title = ref('Calificación');
    const loading = ref(false);
    const levelsSelected: Ref<any[]> = ref([]);
    const editingId = ref<number | null>(null);

    const form: any = reactive({
      id: null,
      courseId: props.couseId,
      userId: props.userId,
      learningOutcomeId: props.learningOutcomeId,
      recoveryScore: null,
      comment: null,
      recoveryScoreIsImprovement: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          courseId: {},
          userId: {},
          learningOutcomeId: {},
          recoveryScore: { required },
          recoveryScoreIsImprovement: {},
          comment: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      ratingScalesListOptions.value = await getRatingScalesImprovementLevelingService.run(courseId);
    });

    // Propiedad computada que selecciona las opciones según el valor de recoveryScoreIsImprovement
    const computedOptions = computed(() => {
      if (form.recoveryScoreIsImprovement) {
        return ratingScalesListOptions.value?.ratingScalesleveling || [];
      } else {
        return ratingScalesListOptions.value?.ratingScalesImprovement || [];
      }
    });

    const onJustificationChange = () => {
      form.recoveryScoreIsImprovement = !form.recoveryScoreIsImprovement;
    };

    const onUnJustificationChange = () => {
      form.recoveryScoreIsImprovement = !form.recoveryScoreIsImprovement;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      if (form.description) form.description = form.description.replace(/\n/g, '<br />');

      const dataSend = {
        ...form,
        periodId: props.periodId,
      };

      try {
        await createOrUpdateLearningOutcomesScoresService.run(dataSend);
        updateVisibility(false);
        emit('reload-data');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,
      t,
      title,
      courseId,
      save,
      levelsSelected,
      editingId,
      updateVisibility,
      onJustificationChange,
      onUnJustificationChange,
      computedOptions,
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
.section-content {
  min-height: 38px;
  background-color: #f4f6f8;
  padding: 10px 8px;
  display: flex;
}
.section-content button {
  padding: 8px 0px;
  cursor: pointer;
  border-radius: 12px;
  flex: 1 1 0px;
  color: #8d8d8d;
  transition: all 0.55s ease;
  font-size: 0.875rem;
  letter-spacing: 0.2px;
  transform: translatey(0);
}
.section-content button.selected {
  background-color: var(--color-primary);
  color: #fff;
  border-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translatey(-2px);
  font-weight: bold;
}
.content-form {
  padding: 20px;
  overflow-y: auto;
}
.customized-badge {
  background-color: var(--color-primary);
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.1rem 0.3rem;
  border-radius: 1rem;
  cursor: pointer;
}
.outlined-badge {
  background-color: inherit;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.course-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.course-card {
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: background 0.3s ease-in-out;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 136px;
}
.course-card:hover {
  background-color: #d6d6d6;
}
.course-card.selected {
  background-color: var(--color-primary);
  color: white;
}
.content-table {
  border-collapse: separate;
  border-bottom: 1px solid #ccc;
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  border: 1px solid #ccc;
}
.content-table th,
.content-table td {
  padding: 0.75rem;
}
.content-table td {
  border-bottom: 1px solid #ccc;
}
.content-table thead {
  background-color: #f5f5f5;
}
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}
.under__line::first-letter {
  text-transform: uppercase;
}
</style>
