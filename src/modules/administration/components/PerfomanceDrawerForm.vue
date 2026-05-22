<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility">
    <template #head>
      <span class="title-form">{{ t(title) }} </span>
    </template>
    <template #body>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="content-form">
          <div class="form-section">
            <AppFormField :form-control="v$.form.description" :label="'classroom.competence.performance'">
              <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" :cols="40" :rows="3" id="description"></AppVoiceInput>
            </AppFormField>

            <AppFormField :form-control="v$.form.percentage" :label="'Porcentaje'" v-if="courseData?.percentageLearningOutcomes === 1">
              <input v-model="v$.form.percentage.$model" class="form-control" type="number" />
            </AppFormField>

            <AppFormField :form-control="v$.form.levels" :label="'classroom.competence.levels'">
              <div class="course-card-container">
                <div
                  v-for="item in competenceLevels"
                  :key="item.id"
                  class="course-card"
                  :class="{
                          selected: levelsSelected.some((level: any) => level.competencyLevelId === item.id),
                        }"
                  @click="toggleLevelsSelection(item)"
                >
                  <div class="d-flex align-items-center justify-content-center gap-1 text-center">
                    <div class="course-name">{{ item.name }}</div>
                  </div>
                </div>
              </div>
            </AppFormField>
            <!-- Tabla de niveles seleccionados -->
            <div class="table-responsive w-100 mb-3">
              <table class="content-table" v-if="levelsSelected.length">
                <thead>
                  <tr>
                    <th>NOMBRE</th>
                    <th>DESCRIPCIÓN</th>
                    <th>OPCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="level in levelsSelected" :key="level.competencyLevelId">
                    <td>{{ level.levelName }}</td>
                    <td>
                      <input v-if="editingId === level.competencyLevelId" v-model="level.levelDescription" @blur="editingId = null" class="form-control" />
                      <span v-else>{{ level.levelDescription }}</span>
                    </td>
                    <td class="opciones text-center">
                      <AppButtonGroup>
                        <AppButtonEdit @click="editLevel(level.competencyLevelId)"></AppButtonEdit>
                        <AppButtonDelete @click="removeLevel(level.competencyLevelId)"></AppButtonDelete>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="levelsSelected.some((level) => !level.levelDescription)" class="text-center alert alert-warning" role="alert">
              <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
              <strong>Los niveles seleccionados deben tener una descripción.</strong>
            </div>
            <AppFormField :form-control="v$.form.didacticsStrategies" :label="'classroom.competence.didacticsStrategies'">
              <input
                v-model="v$.form.didacticsStrategies.$model"
                class="form-control"
                type="text"
                id="name"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>
            <AppFormField :form-control="v$.form.assessmentStrategies" :label="'classroom.competence.assessmentStrategies'">
              <input
                v-model="v$.form.assessmentStrategies.$model"
                class="form-control"
                type="text"
                id="name"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>
            <AppFormField :form-control="v$.form.resources" :label="'classroom.competence.resources'">
              <input
                v-model="v$.form.resources.$model"
                class="form-control"
                type="text"
                id="name"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>
            <AppFormField :form-control="v$.form.time" :label="'classroom.competence.time'">
              <input
                v-model="v$.form.time.$model"
                class="form-control"
                type="text"
                id="name"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
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
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { CreateOrUpdateLearningOutComesService } from '../services/createOrUpdateLearningOutComes.service';
import AppIcon from '../../../shared/components/AppIcon.vue';

const createOrUpdateLearningOutComesService = new CreateOrUpdateLearningOutComesService();

export default defineComponent({
  name: 'ActivitiesTeacherDrawerForm',
  components: {
    AppDrawer,
    AppFormField,
    AppLoading,
    AppButton,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonDelete,
    AppIcon,
    AppVoiceInput,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    courseData: {
      type: Object, // Definir tipo adecuado para `data`
      required: true,
    },
    data: {
      type: Object, // Definir tipo adecuado para `data`
      required: true,
    },
    competenceLevels: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const data = props.data ?? null;

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value); // Emitimos el evento para v-model
    };
    //const router = useRouter();
    const courseId = parseInt(route.params.courseId.toString(), 10);

    const title = ref(data?.id ? 'Editar desempeño' : 'Crear desempeño');
    const loading = ref(false);
    const levelsSelected: Ref<any[]> = ref(data?.levels ?? []);

    const editingId = ref<number | null>(null);

    const form: any = reactive({
      id: data?.id ?? null,
      code: data?.code ?? null,
      percentage: data?.percentage ?? null,
      competencyId: data?.competencyId ?? null,
      description: data?.description ?? null,
      levels: [],
      didacticsStrategies: data?.didacticsStrategies ?? null,
      assessmentStrategies: data?.assessmentStrategies ?? null,
      resources: data?.resources ?? null,
      time: data?.time ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          description: { required },
          levels: {},
          didacticsStrategies: {},
          assessmentStrategies: {},
          resources: {},
          time: {},
          percentage: {
            requiredIf: requiredIf(() => {
              return props.courseData?.percentageLearningOutcomes === 1;
            }),
          },
        },
      },
      { form }
    );

    onMounted(() => {});

    const toggleLevelsSelection = (data: { id: number; name: string; description: string }) => {
      const selectedlevels = levelsSelected.value;
      const index = selectedlevels.findIndex((item: any) => item.competencyLevelId === data.id);

      if (index !== -1) {
        // Si ya está seleccionado, lo quitamos
        levelsSelected.value.splice(index, 1);
      } else {
        // Si no está seleccionado, lo agregamos con la estructura requerida
        levelsSelected.value.push({
          competencyLevelId: data.id,
          levelName: data.name, // Puedes cambiar esto si la descripción es diferente
          levelDescription: data.description, // Puedes cambiar esto si la descripción es diferente
        });
      }
    };
    const editLevel = (id: number) => {
      editingId.value = id; // Activa el modo edición para el nivel seleccionado
    };

    const removeLevel = (id: number) => {
      // Filtrar de levelsSelected
      levelsSelected.value = levelsSelected.value.filter((level) => level.competencyLevelId !== id);

      // Filtrar de form.levels
      form.levels = form.levels.filter((level: any) => level.competencyLevelId !== id);
    };

    const save = async (/*goBack: any*/) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      if (form.description) {
        form.description = form.description.replace(/<br\s*\/?>/g, '\n').replace(/<\/?[^>]+(>|$)/g, '');
      }

      const dataSend = {
        ...form,
        levels: levelsSelected.value.map(({ competencyLevelId, levelDescription }) => ({
          competencyLevelId,
          levelDescription,
        })),
      };

      try {
        await createOrUpdateLearningOutComesService.run(dataSend, data?.id);

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
      toggleLevelsSelection,
      levelsSelected,
      editLevel,
      removeLevel,
      editingId,
      updateVisibility,
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
</style>
