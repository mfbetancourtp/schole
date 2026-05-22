<template>
  <AppBaseList isCard>
    <template #actions>
      <AppButtonBack
        :to="{
          name: 'academicAdministration.subjectsByCourse',
          params: { academicPeriodGroupId },
        }"
      />

      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
        <AppButton style="color: white" @click="save()" label="core.save" />
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="tw-w-full" style="width: 13rem">
            <AppAutocomplete v-model="periodId.value" :options="periods.value" :clearable="false" />
          </div>
        </div>

        <div class="mt-3">
          <div class="card-body table-container">
            <table class="table responsive-table">
              <colgroup>
                <col style="width: 30%" />
                <col
                  style="width: 5%"
                  :style="{
                    width: editingIndex != -1 && ratingScaleDetails.value.length ? '20%' : '5%',
                  }"
                />
                <col style="width: 5%" />
                <col style="width: 10%" />
                <col
                  style="width: 50%"
                  :style="{
                    width: editingIndex != -1 && ratingScaleDetails.value.length ? '35%' : '50%',
                  }"
                />
              </colgroup>

              <thead>
                <tr>
                  <th>
                    {{ t('academicAdministration.notesByPeriod.table.student') }}
                  </th>
                  <th class="text-center" colspan="2">
                    {{ t('academicAdministration.notesByPeriod.table.note') }}
                  </th>
                  <th class="text-center">
                    {{ t('academicAdministration.notesByPeriod.table.lack') }}
                  </th>
                  <th>
                    {{ t('academicAdministration.notesByPeriod.table.observation') }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in matriculateWithPeriodNote.value" :key="item.id">
                  <td :title="t('academicAdministration.notesByPeriod.table.student')">
                    <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                      <AppAvatar :size="'sm'" :name="item.matriculate.student.people.names ?? '?'"></AppAvatar>

                      <div class="tw-min-w-0 tw-ml-4">
                        <div class="tw-font-medium tw-leading-5 tw-truncate">
                          {{ item.matriculate.student.people.names }}
                        </div>
                        <div class="tw-leading-5 tw-truncate tw-font-light">
                          {{ item.matriculate.student.people.lastnames }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td :title="t('academicAdministration.notesByPeriod.table.note')">
                    <div class="tw-flex tw-items-center tw-py-2">
                      <template v-if="editingIndex === index && currentMatriculateWithPeriodNote.value">
                        <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
                          <template v-if="ratingScaleDetails.value.length">
                            <AppLoading v-if="loadingSelector" />

                            <AppAutocomplete v-else class="w-100" v-model="ratingScaleDetailId.value" :options="ratingScaleDetails.value" :clearable="false" />
                          </template>

                          <template v-else>
                            <input class="form-control text-center" type="number" step="0.1" v-model="currentMatriculateWithPeriodNote.value.matriculateSubjectPeriod.finalPeriod" />
                          </template>
                        </AppCheckPermission>
                      </template>

                      <template v-else>
                        <span
                          :class="{
                            'yellow-highlight-note': item.matriculateSubjectPeriod.isEdit === 1,
                          }"
                          class="px-4 py-2"
                          v-tooltip="getRatingScaleDetail(item.matriculateSubjectPeriod.finalPeriod)?.description ?? ''"
                        >
                          {{ !ratingScaleDetails.value.length ? item.matriculateSubjectPeriod.finalPeriod ?? '' : getRatingScaleDetail(item.matriculateSubjectPeriod.finalPeriod)?.abbreviation }}
                        </span>
                      </template>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex justify-content-center">
                      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
                        <template v-if="editingIndex === index">
                          <AppButtonGroup size="lg">
                            <AppButton icon="check" v-tooltip="'core.save'" @click="saveNote()" />
                            <AppButton icon="times" v-tooltip="'core.cancel'" @click="cancelEditing()" />
                          </AppButtonGroup>
                        </template>

                        <template v-else>
                          <AppButton v-if="item.matriculateSubjectPeriod.isEdit === 1" icon="undo" @click="resetNote(item)" v-tooltip="'Restaurar nota'" />
                          <AppButtonEdit v-else @click="startEditing(index, item)" />
                        </template>
                      </AppCheckPermission>
                    </div>
                  </td>

                  <td :title="t('academicAdministration.notesByPeriod.table.lack')">
                    <div class="tw-flex tw-items-center tw-py-2">
                      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
                        <input class="form-control text-center" type="number" v-model="item.matriculateSubjectPeriod.lack" />
                      </AppCheckPermission>
                    </div>
                  </td>
                  <td :title="t('academicAdministration.notesByPeriod.table.observation')">
                    <div class="tw-flex tw-items-center tw-py-2">
                      <AppCheckPermission permission="academicAdministration.notesByPeriod.edit">
                        <AppVoiceInput v-model="item.matriculateSubjectPeriod.observation" textareaClass="form-control" />
                      </AppCheckPermission>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

import { PeriodDto } from '../../../shared/dto/period.dto';
import { RatingScaleDetailDto } from '../../../shared/dto/ratingScaleDetail.dto';

import { GetNotesByPeriodRelatedDataFormService } from '../services/getNotesByPeriodRelatedDataForm.service';
import { GetMatriculateSubjectsWithPeriodNoteService } from '../services/getMatriculateSubjectsWithPeriodNote.service';
import { CreateOrUpdateMatriculateSubjectsWithPeriodNoteService } from '../services/createOrUpdateMatriculateSubjectsWithPeriodNote.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateMatriculateSubjectsWithPeriodNoteService = new CreateOrUpdateMatriculateSubjectsWithPeriodNoteService();
const getMatriculateSubjectsWithPeriodNoteService = new GetMatriculateSubjectsWithPeriodNoteService();
const getNotesByPeriodRelatedDataFormService = new GetNotesByPeriodRelatedDataFormService();

export default defineComponent({
  name: 'NotesByPeriod',

  components: {
    AppCheckPermission,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppAvatar,
    AppVoiceInput,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Calificaciones por Periodo';

    useMeta({ title: title });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Administración académica', url: '' };
    headerStorage.moduleItem = { name: 'Administración de cursos', url: '' };

    const subjectAssignmentId = parseInt(route.params.subjectAssignmentId.toString(), 10);
    const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId.toString(), 10);

    const editingIndex = ref(-1);

    const loading = ref(true);
    const loadingSave = ref(true);
    const loadingSelector = ref(false);

    const ratingScaleDetails: { value: RatingScaleDetailDto[] } = reactive({
      value: [],
    });
    const currentMatriculateWithPeriodNote: { value: any } = reactive({
      value: null,
    });
    const matriculateWithPeriodNote: { value: any[] } = reactive({
      value: [],
    });
    const ratingScaleDetailId: { value: number } = reactive({
      value: 0,
    });
    const periods: { value: PeriodDto[] } = reactive({
      value: [],
    });
    const periodId: { value: number } = reactive({
      value: 0,
    });

    onMounted(async () => {
      try {
        let response = await getNotesByPeriodRelatedDataFormService.run({
          subjectAssignmentId,
        });

        const currentGroup = `${response.subjectAssignment.academicPeriodGroup.degree.name} ${response.subjectAssignment.academicPeriodGroup.group.name}`;
        const currentSubject = response.subjectAssignment.curriculumSubject.subject.name;

        periods.value = response.periods;
        periodId.value = periods.value[0].id;

        ratingScaleDetails.value = response.ratingScaleDetails;
        ratingScaleDetails.value = ratingScaleDetails.value.map((scale) => ({
          ...scale,
          name: `${scale.abbreviation} - ${scale.description}`,
        }));

        const subtitle = `${currentSubject} del curso: ${currentGroup}`;
        headerStorage.moduleSubItem = { name: `${title} ${subtitle}`, url: '' };
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    watch(periodId, async () => {
      await getNotes();
    });

    const getNotes = async () => {
      let params = {
        periodId: periodId.value,
        subjectAssignmentId,
      };

      matriculateWithPeriodNote.value = await getMatriculateSubjectsWithPeriodNoteService.run(params);

      if (ratingScaleDetails.value.length) {
        matriculateWithPeriodNote.value.map((value) => {
          value.matriculateSubjectPeriod.ratingScaleDetail = getRatingScaleDetail(value.matriculateSubjectPeriod.finalPeriod);
        });
      }
    };
    const getRatingScaleDetail = (note: number): RatingScaleDetailDto | undefined => {
      return ratingScaleDetails.value.find((item) => note >= item.minimumValue && note <= item.maximumValue);
    };

    const startEditing = async (index: number, note: any) => {
      await cancelEditing();

      editingIndex.value = index;
      currentMatriculateWithPeriodNote.value = note;
      ratingScaleDetailId.value = note.matriculateSubjectPeriod.ratingScaleDetail.id;
    };
    const cancelEditing = () => {
      editingIndex.value = -1;
      currentMatriculateWithPeriodNote.value = null;
      ratingScaleDetailId.value = 0;
    };

    const resetNote = async (note: any) => {
      currentMatriculateWithPeriodNote.value = note;

      await saveNote(true);
    };
    const saveNote = async (resetNote: boolean = false) => {
      try {
        if (!currentMatriculateWithPeriodNote.value) return;

        loadingSave.value = true;

        const index = matriculateWithPeriodNote.value.findIndex((item) => item.id === currentMatriculateWithPeriodNote.value.id);

        if (index !== -1) {
          currentMatriculateWithPeriodNote.value.matriculateSubjectPeriod.isEdit = resetNote ? 0 : 1;

          if (ratingScaleDetails.value.length) {
            currentMatriculateWithPeriodNote.value.matriculateSubjectPeriod.finalPeriod = ratingScaleDetails.value.find((item) => item.id === ratingScaleDetailId.value)?.maximumValue;
          }

          matriculateWithPeriodNote.value[index] = currentMatriculateWithPeriodNote.value;
        }

        await save();
        await getNotes();

        cancelEditing();
      } catch (err) {
        console.error('Error al guardar la observación:', err);
      } finally {
        loadingSave.value = false;
      }
    };
    const save = async () => {
      const grades: any[] = [];

      matriculateWithPeriodNote.value.forEach((value, index) => {
        if (Object.keys(value.matriculateSubjectPeriod).length !== 0) {
          value.matriculateSubjectPeriod.matriculateSubjectId = matriculateWithPeriodNote.value[index].id;
          grades.push(value.matriculateSubjectPeriod);
        }
      });

      const matriculateSubjectPeriods = {
        periodId: periodId.value,
        matriculateSubjectPeriods: grades,
      };

      try {
        await createOrUpdateMatriculateSubjectsWithPeriodNoteService.run(matriculateSubjectPeriods);
        await getNotes();
      } catch (e) {
        console.log(e);
      }
    };

    return {
      t,

      loadingSelector,
      loading,

      currentMatriculateWithPeriodNote,
      matriculateWithPeriodNote,
      academicPeriodGroupId,
      ratingScaleDetailId,
      ratingScaleDetails,
      editingIndex,
      periodId,
      periods,

      getRatingScaleDetail,
      cancelEditing,
      startEditing,
      resetNote,
      saveNote,
      save,
    };
  },
});
</script>

<style scoped>
table {
  all: unset;
  border-color: #e5e7eb;
}

.yellow-highlight-note {
  background-color: rgba(255, 255, 170, 0.667);
}
</style>
