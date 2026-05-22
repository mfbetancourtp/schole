<template>
  <AppLoading v-if="loading" />

  <AppCard v-else>
    <template #body>
      <div class="table-container">
        <table class="responsive-table">
          <colgroup>
            <col style="width: 20%" />
            <col
              style="width: 7%"
              :style="{
                width: editingIndex != -1 && params.isQualitativeGrading ? '10%' : '7%',
              }"
            />
            <col
              style="width: 3%"
              :style="{
                width: editingIndex != -1 && params.isQualitativeGrading ? '10%' : '3%',
              }"
            />
            <col
              style="width: 60%"
              :style="{
                width: editingIndex != -1 && params.isQualitativeGrading ? '40%' : '60%',
              }"
            />
            <col style="width: 10%" />
          </colgroup>

          <tr>
            <th>Periodo Académico</th>
            <th colspan="2" class="text-center">Calificación</th>
            <th>Observación Docente</th>
            <th class="text-center">Opciones</th>
          </tr>

          <template v-if="!behaviorNotes.value.length">
            <tr>
              <td colspan="4">
                <AppEmptyResponse :subtitle="false" />
              </td>
            </tr>
          </template>

          <tr v-for="(behaviorNote, index) in behaviorNotes.value" :key="index">
            <td>{{ behaviorNote.name }}</td>
            <td :colspan="behaviorNote.directorObservation?.manualDisciplineNote != null && editingIndex !== index ? 1 : 2" class="text-center">
              <template v-if="editingIndex === index">
                <template v-if="!params.isQualitativeGrading">
                  <input type="number" class="form-control" min="0" max="5" step="0.1" v-model="editingNote.manualDisciplineNote" />
                </template>

                <template v-else>
                  <AppAutocomplete v-model="editingNote.qualitativeQualification" :clearable="false" :options="ratingScaleDetail.value" />
                </template>
              </template>

              <template v-else>
                <span
                  :class="{
                    'yellow-highlight-note': behaviorNote.directorObservation?.manualDisciplineNote != null,
                  }"
                  class="px-4 py-2"
                  v-tooltip="behaviorNote.directorObservation?.qualitativeQualification?.description ?? ''"
                >
                  {{
                    !params.isQualitativeGrading
                      ? behaviorNote.directorObservation?.manualDisciplineNote ?? behaviorNote.directorObservation?.disciplineNote ?? ''
                      : behaviorNote.directorObservation?.qualitativeQualification.abbreviation ?? ''
                  }}
                </span>
              </template>
            </td>
            <template v-if="behaviorNote.directorObservation?.manualDisciplineNote != null && editingIndex !== index">
              <td class="text-center">
                <AppCheckPermission permission="disciplinaryControl.observerByUserId.behavior.edit">
                  <AppButton icon="undo" @click="deleteOnlyNote(behaviorNote)" />
                </AppCheckPermission>
              </td>
            </template>

            <td>
              <template v-if="editingIndex === index">
                <AppVoiceInput :rows="3" textareaClass="form-control" v-model="editingNote.disciplineObservations"></AppVoiceInput>
              </template>

              <template v-else>
                {{ behaviorNote.directorObservation?.disciplineObservations ?? '' }}
              </template>
            </td>

            <td>
              <template v-if="editingIndex === index">
                <AppButtonGroup size="lg">
                  <AppButton icon="check" @click="saveObservation()" />
                  <AppButton icon="times" @click="cancelEditing()" />
                </AppButtonGroup>
              </template>

              <template v-else>
                <AppButtonGroup size="lg">
                  <AppCheckPermission permission="disciplinaryControl.observerByUserId.behavior.edit">
                    <AppButtonEdit @click="startEditing(index, behaviorNote)" />
                  </AppCheckPermission>
                </AppButtonGroup>
              </template>
            </td>
          </tr>
        </table>
      </div>
    </template>
  </AppCard>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { ParamsCreateOrUpdateDirectorObservationDto } from '../dtos/observerByUserId.dto';

import { GetPeriodsByAcademicPeriodService } from '../../../shared/services/getPeriodsByAcademicPeriod.service';
import { CreateOrUpdateDirectorObservationService } from '../services/createOrUpdateDirectorObservation.service';
import { GetDirectorObservationsByStudentUserIdService } from '../services/getDirectorObservationsByStudentUserId.service';
import { GetRatingScaleDetailByAcademicPeriodIdAndDegreeIdService } from '../services/getRatingScaleDetailByAcademicPeriodIdAndDegreeId.service';

const getPeriodsByAcademicPeriodService = new GetPeriodsByAcademicPeriodService();
const createOrUpdateDirectorObservationService = new CreateOrUpdateDirectorObservationService();
const getDirectorObservationsByStudentUserIdService = new GetDirectorObservationsByStudentUserIdService();
const getRatingScaleDetailByAcademicPeriodIdAndDegreeIdService = new GetRatingScaleDetailByAcademicPeriodIdAndDegreeIdService();

export default defineComponent({
  name: 'ObseByUserIdBehavior',
  components: {
    AppCheckPermission,
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonEdit,
    AppLoading,
    AppButton,
    AppCard,
    AppVoiceInput,
  },

  props: {
    params: {
      type: Object as PropType<{
        userId: number;
        groupId: number;
        degreeId: number;
        academicPeriodId: number;
        isQualitativeGrading: number;
      }>,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();

    const ratingScaleDetail: { value: any[] } = reactive({
      value: [],
    });
    const behaviorNotes: { value: any[] } = reactive({
      value: [],
    });
    const behaviorNote: { value: any } = reactive({
      value: null,
    });
    const editingNote = reactive({
      disciplineNote: '',
      manualDisciplineNote: '' as any,
      qualitativeQualification: null,
      disciplineObservations: '',
      periodId: null,
    });

    const editingIndex = ref(-1);

    const loading = ref(true);
    const loadingSave = ref(false);
    const modalDelete = ref(false);

    onMounted(async () => {
      loading.value = true;

      await getBehaviorNotes();

      loading.value = false;
    });

    watch(
      () => props.params.academicPeriodId,
      async (value) => {
        if (value) {
          await getBehaviorNotes();
        }
      }
    );
    const getBehaviorNotes = async () => {
      try {
        const paramsGetPeriods = {
          academicPeriodId: props.params.academicPeriodId,
        };
        const paramsGetDirectorObservationsByStudent = {
          academicPeriodId: props.params.academicPeriodId,
          userId: props.params.userId,
        };
        const paramsGetRatingScaleDetail = {
          academicPeriodId: props.params.academicPeriodId,
          degreeId: props.params.degreeId,
        };

        let [periods, observations, ratingScale] = await Promise.all([
          getPeriodsByAcademicPeriodService.run(paramsGetPeriods),
          getDirectorObservationsByStudentUserIdService.run(paramsGetDirectorObservationsByStudent),
          getRatingScaleDetailByAcademicPeriodIdAndDegreeIdService.run(paramsGetRatingScaleDetail),
        ]);

        ratingScaleDetail.value = await ratingScale;
        ratingScaleDetail.value = ratingScaleDetail.value.map((scale) => ({
          ...scale,
          name: `${scale.abbreviation} - ${scale.description}`,
        }));

        behaviorNotes.value = periods.data.map((period: any) => {
          const observation = observations.find((observation: any) => observation.periodId === period.id);

          if (observation && props.params.isQualitativeGrading) {
            observation.qualitativeQualification = getQualitativeQualification(typeof observation.manualDisciplineNote === 'number' ? observation.manualDisciplineNote : observation.disciplineNote);
          }

          return {
            ...period,
            directorObservation: observation ?? null,
          };
        });
      } catch (error) {
        console.log(error);
      }
    };

    const getQualitativeQualification = (disciplineNote: number) => {
      const ratingScale = ratingScaleDetail.value.find((ratingScale: any) => disciplineNote >= ratingScale.minimumValue && disciplineNote <= ratingScale.maximumValue);

      return ratingScale;
    };

    const startEditing = (index: number, note: any) => {
      editingIndex.value = index;

      editingNote.disciplineNote = note.directorObservation?.disciplineNote || '';
      editingNote.manualDisciplineNote = note.directorObservation?.manualDisciplineNote || note.directorObservation?.disciplineNote || '';
      editingNote.qualitativeQualification = note.directorObservation?.qualitativeQualification?.id || null;
      editingNote.disciplineObservations = note.directorObservation?.disciplineObservations || '';
      editingNote.periodId = note.id;
    };
    const cancelEditing = () => {
      editingIndex.value = -1;

      editingNote.disciplineNote = '';
      editingNote.manualDisciplineNote = '';
      editingNote.qualitativeQualification = null;
      editingNote.disciplineObservations = '';
      editingNote.periodId = null;
    };
    const saveObservation = async () => {
      try {
        if (!editingNote.periodId) return;

        loadingSave.value = true;

        const qualitativeToNumber = (scaleId: any) => {
          const ratingScale = ratingScaleDetail.value.find((scale: any) => scale.id === scaleId);
          return ratingScale?.maximumValue;
        };

        if (props.params.isQualitativeGrading) {
          editingNote.manualDisciplineNote = typeof qualitativeToNumber(editingNote.qualitativeQualification) === 'number' ? qualitativeToNumber(editingNote.qualitativeQualification) : '';
        }

        const dataSend: ParamsCreateOrUpdateDirectorObservationDto = {
          degreeId: props.params.degreeId,
          groupId: props.params.groupId,
          periodId: editingNote.periodId,
          directorObservations: [
            {
              studentUserId: props.params.userId,
              disciplineNote: Number(editingNote.disciplineNote),
              manualDisciplineNote:
                editingNote.manualDisciplineNote === editingNote.disciplineNote ? null : typeof editingNote.manualDisciplineNote === 'number' ? Number(editingNote.manualDisciplineNote) : null,
              disciplineObservations: editingNote.disciplineObservations,
            },
          ],
        };

        await createOrUpdateDirectorObservationService.run(dataSend);

        await getBehaviorNotes();
        editingIndex.value = -1;
      } catch (err) {
        console.error('Error al guardar la observación:', err);
      } finally {
        loadingSave.value = false;
      }
    };

    const deleteOnlyNote = async (note: any) => {
      editingNote.disciplineNote = note.directorObservation?.disciplineNote || '';
      editingNote.manualDisciplineNote = null;
      editingNote.qualitativeQualification = null;
      editingNote.disciplineObservations = note.directorObservation?.disciplineObservations || '';
      editingNote.periodId = note.id;

      await saveObservation();
    };

    const openConfirmDelete = async (data: any) => {
      behaviorNote.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      console.log('Eliminar: ', behaviorNote.value);

      modalDelete.value = false;
      behaviorNote.value = null;
    };

    return {
      t,

      loading,

      ratingScaleDetail,
      behaviorNotes,
      editingIndex,
      editingNote,

      openConfirmDelete,
      saveObservation,
      deleteOnlyNote,
      confirmDelete,
      cancelEditing,
      startEditing,
    };
  },
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

th {
  background-color: #f0f0f0;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #ddd;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

tr:hover {
  background-color: #f9f9f9;
}

/* Estilo para los botones de opciones */
td:last-child {
  text-align: center;
}

.yellow-highlight-note {
  background-color: rgba(255, 255, 170, 0.667);
}
/* Contenedor de la tabla con altura fija para que la barra horizontal quede siempre visible en la parte inferior */
.table-container {
  overflow-y: auto; /* Activa el scroll vertical si el contenido excede la altura */
  overflow-x: auto; /* Activa el scroll horizontal si la tabla es ancha */
  max-height: 850px;
  scrollbar-gutter: stable; /* Reserva espacio para la scrollbar */
}
/* Asegúrate de que la tabla ocupe todo el ancho disponible */
.table-fixed {
  width: 100%;
}
.table-bordered > :not(caption) > * {
  border-width: 0px 0;
}
</style>
