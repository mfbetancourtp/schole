<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :formControl="v$.form.name" :label="'Nombre'">
          <input type="text" class="form-control" id="name" v-model="v$.form.name.$model" />
        </AppFormField>
        <AppFormField v-if="useAbbreviation" :formControl="v$.form.abbreviation" :label="'Código*'">
          <input type="text" class="form-control" id="abbreviation" v-model="v$.form.abbreviation.$model" />
        </AppFormField>
        <AppFormField v-if="useCode" :formControl="v$.form.code" :label="'Código*'">
          <input type="text" class="form-control" id="code" v-model="v$.form.code.$model" />
        </AppFormField>

        <AppFormField v-if="useDescription" :formControl="v$.form.description" :label="'Descripción'">
          <textarea class="form-control" id="description" v-model="v$.form.description.$model"></textarea>
        </AppFormField>

        <AppFormField v-if="useDuration" :formControl="v$.form.duration" :label="'Duración*'">
          <input type="number" class="form-control" id="duration" v-model="v$.form.duration.$model" />
        </AppFormField>

        <AppFormField v-if="journeyId" :form-control="v$.form.journeyId" label="core.generalTerms.academic.journey.plural">
          <v-select input-id="journey-id" v-model="v$.form.journeyId.$model" :reduce="(journey: any) => journey.id" :options="journeys" label="name"></v-select>
        </AppFormField>

        <div class="row">
          <AppFormField v-if="timeSince" :formControl="v$.form.timeSince" :label="'Inicio*'">
            <input type="time" class="form-control" id="timeSince" v-model="v$.form.timeSince.$model" />
          </AppFormField>
          <AppFormField v-if="timeUntil" :formControl="v$.form.timeUntil" :label="'Fin*'">
            <input type="time" class="form-control" id="timeUntil" v-model="v$.form.timeUntil.$model" />
          </AppFormField>
        </div>
        <AppFormField v-if="v$.form.id.$model > 0" :formControl="v$.form.id" :label="'Código'">
          <input type="text" class="form-control" id="abbreviation" v-model="v$.form.id.$model" readonly />
        </AppFormField>

        <AppFormField v-if="color" :form-control="v$.form.color" label="Color">
          <input class="form-control" type="color" id="color" v-model="v$.form.color.$model" />
        </AppFormField>

        <AppFormField v-if="levelOffenseSystemId" :form-control="v$.form.levelOffenseSystemId" label="Nivel">
          <v-select
            input-id="levelOffenseSystemId"
            v-model="v$.form.levelOffenseSystemId.$model"
            :reduce="(levelOffenseSystem: any) => levelOffenseSystem.id"
            :options="levelOffensesSystem"
            :get-option-label="(opt: any) => `${opt.name} - ${opt.level}`"
          />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, maxLength, requiredIf, numeric } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'AuxiliaryInformationForm',
  components: { AppButton, AppFormField, AppFormModal },

  props: {
    data: {
      type: Object,
    },
    currentEntity: {
      type: Object,
      required: true,
    },
    dataAuxiliary: {
      type: Object,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const data = ref(props.data ?? {});
    const entity = ref(props.currentEntity);
    const useAbbreviation = ref(entity.value.useAbbreviation);
    const useCode = ref(entity.value.useCode);
    const useDescription = ref(entity.value.useDescription);
    const useDuration = ref(entity.value.useDuration);

    const timeSince = ref(entity.value.timeSince);
    const journeyId = ref(entity.value.journeyId);
    console.log('entity.value.journeyId', entity.value.journeyId);
    const timeUntil = ref(entity.value.timeUntil);
    const color = ref(entity.value.color);
    const levelOffenseSystemId = ref(entity.value.levelOffenseSystemId);
    const useId = ref(entity.value.useId);

    const journeys = props.dataAuxiliary?.journeys ?? [];
    const levelOffensesSystem = props.dataAuxiliary?.levelOffensesSystem ?? [];

    const singular = ref(entity.value.label ?? `${entity.value.name}.singular`);
    const title = ref(props.data?.id ? `core.edit ${singular.value}` : `core.new ${singular.value}`);

    const form = reactive({
      name: data.value?.name ?? null,
      abbreviation: data.value?.abbreviation ?? null,
      code: data.value?.code ?? null,
      description: data.value?.description ?? null,
      duration: data.value?.duration ?? null,
      timeSince: data.value?.timeSince ?? null,
      timeUntil: data.value?.timeUntil ?? null,
      id: data.value?.id ?? 0,
      journeyId: data.value.journeyId,
      color: data.value?.color ?? '',
      levelOffenseSystemId: data.value.levelOffenseSystemId,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          timeSince: { requiredIf: requiredIf(() => timeSince.value) },
          timeUntil: { requiredIf: requiredIf(() => timeUntil.value) },
          journeyId: { requiredIf: requiredIf(() => journeyId.value) },
          abbreviation: {
            maxLength: maxLength(10),
            requiredIf: requiredIf(() => useAbbreviation.value),
          },
          code: {
            requiredIf: requiredIf(() => useCode.value),
          },
          description: {},
          duration: {
            requiredIf: requiredIf(() => useDuration.value),
            numeric,
          },
          id: { requiredIf: requiredIf(() => useId.value) },
          color: {
            /* sin validaciones */
          },
          levelOffenseSystemId: {
            requiredIf: requiredIf(() => levelOffenseSystemId.value),
          },
        },
      },
      { form }
    );

    const save = async () => {
      // Dispara la validación y devuelve true/false
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) {
        // Imprime en consola todos los errores de validación
        // Cada objeto de v$.value.$errors tiene:
        //  - $property: el campo
        //  - $message: mensaje (si lo definiste)
        //  - $validator: nombre del validador
        console.log('Errores del formulario:', v$.value.$errors);
        return;
      }

      try {
        // Construir el payload dinámicamente basado en la configuración de la entity
        const payload: any = {
          name: form.name, // name siempre se envía (es obligatorio)
        };

        // Mapeo de campos: [flag de la entity, nombre del campo en el form]
        const fieldMapping = [
          { flag: useAbbreviation, field: 'abbreviation' },
          { flag: useCode, field: 'code' },
          { flag: useDescription, field: 'description' },
          { flag: useDuration, field: 'duration' },
          { flag: timeSince, field: 'timeSince' },
          { flag: timeUntil, field: 'timeUntil' },
          { flag: journeyId, field: 'journeyId' },
          { flag: color, field: 'color' },
          { flag: levelOffenseSystemId, field: 'levelOffenseSystemId' },
          { flag: useId, field: 'id' },
        ];

        // Agregar campos al payload solo si el flag es true
        fieldMapping.forEach(({ flag, field }) => {
          if (flag.value === true) {
            payload[field] = form[field as keyof typeof form];
          }
        });

        // Caso especial para id (solo si es mayor a 0)
        if (useId.value === true && form.id > 0) {
          payload.id = form.id;
        }

        console.log('Payload a enviar:', payload);

        await entity.value.serviceCreateOrUpdate.run(payload, data.value?.id);
        emit('close');
      } catch (e) {
        console.log('error al guardar en servidor:', e);
      }
    };

    return {
      useAbbreviation,
      useCode,
      useDescription,
      useDuration,
      timeSince,
      timeUntil,
      journeyId,
      journeys,
      levelOffensesSystem,
      color,
      levelOffenseSystemId,
      useId,
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
