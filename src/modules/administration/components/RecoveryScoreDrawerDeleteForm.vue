<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility">
    <template #head>
      <span class="title-form">{{ t(title) }} - {{ nameStudentId }} </span>
    </template>
    <template #body>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="content-form">
          <div class="form-section">
            <AppFormField :form-control="v$.form.comment" :label="'Comentario'">

            <AppVoiceInput v-model="v$.form.comment.$model" class="form-control"  id="description" textareaClass="form-control" />

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
//import { defineComponent, ref } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
//import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { defineComponent, onMounted, reactive, ref, Ref, PropType } from 'vue';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateOrUpdateLearningOutcomesScoresService } from '../services/createOrUpdateLearningOutcomesScores.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateLearningOutcomesScoresService = new CreateOrUpdateLearningOutcomesScoresService();

export default defineComponent({
  name: 'ActivitiesTeacherDrawerForm',
  components: {
    AppDrawer,
    AppFormField,
    AppLoading,
    AppButton,
    AppVoiceInput,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    periodId: {
      type: Number, // Definir tipo adecuado para `data`
      required: true,
    },
    learningOutcomeId: {
      type: String, // Definir tipo adecuado para `data`
      required: true,
    },
    userId: {
      type: String, // Definir tipo adecuado para `data`
      required: true,
    },
    couseId: {
      type: Number, // Definir tipo adecuado para `data`
      required: true,
    },
    recovery: {
      type: String, // Definir tipo adecuado para `data`
      required: true,
    },
    nameStudentId: {
      type: String, // Definir tipo adecuado para `data`
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
      emit('update:isVisible', value); // Emitimos el evento para v-model
    };
    //const router = useRouter();
    const courseId = parseInt(route.params.courseId.toString(), 10);

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
          recoveryScore: {},
          recoveryScoreIsImprovement: {},
          comment: { required },
        },
      },
      { form }
    );

    onMounted(() => {});
    const onJustificationChange = () => {
      // Si estaba activado, al desmarcarlo se debe activar la otra opción
      if (form.recoveryScoreIsImprovement) {
        form.recoveryScoreIsImprovement = false;
      } else {
        form.recoveryScoreIsImprovement = true;
      }
    };

    const onUnJustificationChange = () => {
      // Si estaba desactivado, activamos Injustificada
      if (!form.recoveryScoreIsImprovement) {
        form.recoveryScoreIsImprovement = true;
      } else {
        form.recoveryScoreIsImprovement = false;
      }
    };
    const save = async (/*goBack: any*/) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      if (form.description) form.description = form.description.replace(/\n/g, '<br />');

      const dataSend = {
        ...form,
        periodId: props.periodId
      };

      try {
        await createOrUpdateLearningOutcomesScoresService.run(dataSend);

        //goBack = router.go(-1);
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

  /*margin-right: 10px;
  border: 1px solid #ccc;
  background-color: white;*/
  cursor: pointer;
  border-radius: 12px;
  flex: 1 1 0px;
  color: #8d8d8d;
  transition: all 0.55s ease;
  font-size: 0.875rem;
  /*font-weight: bold;*/
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
  /* max-height: 76vh;*/
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
  /* width: 100%; */
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
