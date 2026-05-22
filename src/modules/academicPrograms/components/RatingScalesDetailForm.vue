<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.abbreviation" label="Abreviatura">
            <input class="form-control" type="text" id="abbreviation" v-model="v$.form.abbreviation.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.description" label="Nombre">
            <input class="form-control" type="text" id="description" v-model="v$.form.description.$model" />
          </AppFormField>
        </div>

        <div class="form-row">
          <AppFormField :form-control="v$.form.minimumValue" label="Valor mínimo">
            <input class="form-control" type="number" step="0.01" id="minimumValue" v-model="v$.form.minimumValue.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.maximumValue" label="Valor máximo">
            <input class="form-control" type="number" step="0.01" id="maximumValue" v-model="v$.form.maximumValue.$model" />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.detail" label="Descripción">
            <AppVoiceInput v-model="v$.form.detail.$model" textareaClass="form-control" />
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.file" :label="'Imagen'">
          <AppUploadImage input-id="file" v-model="v$.form.file.$model" :current-thumbnail="currentImg"></AppUploadImage>
        </AppFormField>

        <div class="form-row">
          <AppFormField :form-control="v$.form.lowScale" :label="'Escala de reprobación'">
            <input class="form-check-input" type="checkbox" v-model="v$.form.lowScale.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.color" label="Color">
            <input class="form-control" type="color" id="color" v-model="v$.form.color.$model" />
          </AppFormField>
        </div>
        <h5 class="under__line">Configuración</h5>
        <div class="content-input">
          <div class="d-flex gap-1 justify-content-between w-100">
            <AppFormField :form-control="v$.form.isImprovement">
              <div class="form-check form-switch d-flex gap-3">
                <!-- Checkbox para Cualitativa: se muestra activa si isQualitativeGrading es false -->
                <input class="form-check-input" type="checkbox" id="qualitative" :checked="v$.form.isImprovement.$model" @click="onJustificationChange" />
                <div>Escala de nivelación</div>
              </div>
            </AppFormField>
            <AppFormField :form-control="v$.form.isImprovement">
              <div class="form-check form-switch d-flex gap-3">
                <!-- Checkbox para Cuantitativa: se muestra activa si isQualitativeGrading es true -->
                <input class="form-check-input" type="checkbox" id="quantitative" @click="onUnJustificationChange" :checked="!v$.form.isImprovement.$model" />
                <div>Escala mejoramiento</div>
              </div>
            </AppFormField>
          </div>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, minValue } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, PropType, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';

import { DetailDto } from '../dtos/ratingScale.dto';

import { CreateOrUpdateRatingScaleDetailService } from '../services/createOrUpdateRatingScaleDetail.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateRatingScaleDetailService = new CreateOrUpdateRatingScaleDetailService();

export default defineComponent({
  name: 'RatingScalesDetailForm',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppUploadImage,
    AppVoiceInput,
  },

  emits: ['close'],
  props: {
    data: {
      type: Object as PropType<DetailDto | null>,
    },
    ratingScaleId: {
      type: Number,
      required: true,
    },
  },

  setup(props, { emit }) {
    const data: DetailDto | null = props.data ?? null;
    const currentImg: string | null = data?.urlImage ?? null;
    let title = data ? 'Editar escala de valoración' : 'Agregar escala de valoración';

    const form = reactive({
      ratingScaleId: props.ratingScaleId,
      abbreviation: data?.abbreviation ?? '',
      description: data?.description ?? '',
      detail: data?.detail ?? '',
      minimumValue: data?.minimumValue ?? 0,
      maximumValue: data?.maximumValue ?? 0,
      file: null,
      lowScale: data?.lowScale == 1 ? true : false,
      color: data?.color ?? '',
      isImprovement: data?.isImprovement ?? '',
    });
    const v$ = useVuelidate(
      {
        form: {
          ratingScaleId: { required },
          abbreviation: { required },
          description: { required },
          detail: {},
          minimumValue: { required, minValue: minValue(0) },
          maximumValue: { minValue: minValue(0) },
          file: {},
          lowScale: {},
          color: { required },
          isImprovement: {},
        },
      },
      { form }
    );
    const onJustificationChange = () => {
      // Si estaba activado, al desmarcarlo se debe activar la otra opción
      if (form.isImprovement) {
        form.isImprovement = false;
      } else {
        form.isImprovement = true;
      }
    };

    const onUnJustificationChange = () => {
      // Si estaba desactivado, activamos Escala de nivelación

      if (!form.isImprovement) {
        form.isImprovement = true;
      } else {
        form.isImprovement = false;
      }
    };
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let dataSend = {
          ...form,
          ratingScaleId: form.ratingScaleId,
          abbreviation: form.abbreviation,
          description: form.description,
          detail: form.detail,
          minimumValue: form.minimumValue,
          maximumValue: form.maximumValue,
          file: form.file,
          lowScale: form.lowScale ? 1 : 0,
          color: form.color,
          isImprovement: form.isImprovement ? 1 : 0,
        };
        await createOrUpdateRatingScaleDetailService.run(dataSend, data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      currentImg,
      title,
      save,
      v$,
      onJustificationChange,
      onUnJustificationChange,
    };
  },
});
</script>

<style scoped>
.form-check-input {
  position: relative;
  left: 10px;
}
.content-input {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
}
</style>
