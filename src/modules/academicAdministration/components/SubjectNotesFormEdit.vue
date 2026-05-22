<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <div>
          <span class="mb-3 tw-flex-1 tw-flex tw-gap-1">Esta seguro de modificar la nota final?</span>
          <div class="tw-flex tw-gap-1">
            <AppFormField class="tw-flex tw-gap-1" :label="'SI'" :formControl="v$.form.isEdit">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="1" v-model="v$.form.isEdit.$model" />
              <label class="form-check-label" for="inlineRadio1"></label>
            </AppFormField>

            <AppFormField class="tw-flex tw-gap-1" :label="'NO'" :formControl="v$.form.isEdit">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="0" v-model="v$.form.isEdit.$model" />
              <label class="form-check-label" for="inlineRadio2"></label>
            </AppFormField>
          </div>
        </div>
        <div v-if="Number(v$.form.isEdit.$model) && isQualitativeGrading === 0">
          <span class="mb-3 tw-flex-1 tw-flex tw-gap-1">Ingresa la nota</span>
          <AppFormField :formControl="v$.form.finishNote">
            <div class="d-flex">
              <input
                class="border border-gray-400 rounded"
                style="height: 25px; width: 11%"
                type="number"
                id="floatNumberField"
                step="any"
                min="0"
                v-model="v$.form.finishNote.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </div>
          </AppFormField>
        </div>
        <div v-if="Number(v$.form.isEdit.$model) && isQualitativeGrading === 1">
          <label for="scale">Usar Escala</label>

          <AppAutocomplete
            class="content-scales"
            :input-id="'scale'"
            :options="ratingScales"
            :reduce="(ratingScale: any) => ratingScale.maximumValue"
            v-model="v$.form.finishNote.$model"
            label="description"
          >
          </AppAutocomplete>
        </div>
        <AppFormField :form-control="v$.form.comment" :label="'classroom.activitiesTeacher.form.description'">
          <AppVoiceInput v-model="v$.form.comment.$model" textareaClass="form-control" :cols="40" :rows="3" id="description"></AppVoiceInput>
        </AppFormField>
      </template>
      <template v-slot:actions>
        <AppButton variant="primary" label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';

import { PostSubjectNotesEditService } from '../services/PostSubjectNotesEdit.service';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const postSubjectNotesEditService = new PostSubjectNotesEditService();

export default defineComponent({
  name: 'SubjectNotesFormEdit',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppVoiceInput,
  },

  props: {
    data: {
      type: Object,
    },
    currentEntity: {
      type: Object,
    },
    isQualitativeGrading: {
      type: Number,
      required: false, // o true, según lo necesites
    },
    ratingScales: {
      type: Array,
      required: true,
    },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data ?? {};
    const title = 'Editar Nota del periodo';

    const form = reactive({
      isEdit: data?.isEdit,
      finishNote: data?.finalAverage ? data?.finalQuality : data?.finalPeriod,
      matriculateSubjectPeriodsId: data?.id,
      matriculateSubjectId: data?.matriculateSubjectId,
      periodId: data?.periodId,
      comment: data?.comment,
    });

    const v$ = useVuelidate(
      computed(() => ({
        form: {
          isEdit: {},
          // ✅ requerido SOLO si (isEdit === 1) y es cuantitativa (isQualitativeGrading === 0)
          finishNote: {
            required: requiredIf(() => !!Number(form.isEdit) && props.isQualitativeGrading === 0),
          },
          comment: { required },
          matriculateSubjectPeriodsId: {},
          matriculateSubjectId: {},
          periodId: {},
        },
      })),
      { form }
    );
    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      let dataSend: any;
      console.log('data.finalAverage', data.finalAverage);

      try {
        if (data.finalAverage) {
          // ➜ Caso promedio final
          dataSend = {
            isEdit: Number(form.isEdit),
            finalQuality: form.finishNote === data?.finalQuality ? data?.finalPeriod : form.finishNote,
            matriculateSubjectId: form.matriculateSubjectPeriodsId, // 👈 nombre que pediste
            periodId: form.periodId,
            comment: form.comment,
          };
        } else {
          // ➜ Caso normal (tu lógica actual)
          if (Number(form.isEdit)) {
            dataSend = {
              isEdit: Number(form.isEdit),
              finalPeriod: Number(form.finishNote),
              matriculateSubjectPeriodsId: form.matriculateSubjectPeriodsId,
              matriculateSubjectId: form.matriculateSubjectId,
              periodId: form.periodId,
              comment: form.comment,
            };
          } else {
            dataSend = {
              isEdit: form.isEdit,
              finalPeriod: data.finalPeriod,
              matriculateSubjectPeriodsId: form.matriculateSubjectPeriodsId,
              matriculateSubjectId: form.matriculateSubjectId,
              periodId: form.periodId,
              comment: form.comment,
            };
          }
        }

        await postSubjectNotesEditService.run(dataSend);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      v$,
      save,
      form,
      emit,
    };
  },
});
</script>
