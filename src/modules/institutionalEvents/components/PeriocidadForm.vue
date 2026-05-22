<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close', id)">
      <template #content>
        <div
          class="form-row align-items-center"
          style="display: flex; flex-direction: row; max-width: 500px"
        >
          <AppFormField style="flex: unset">
            <span>Repetir cada</span>
          </AppFormField>
          <AppFormField style="flex: unset">
            <input
              class="form-control input-sm"
              type="number"
              id="floatNumberField"
              step="any"
              min="0"
              v-model="v$.form.repeatNumber.$model"
            />
          </AppFormField>
          <AppFormField :form-control="v$.form.typeRepeat">
            <!-- <AppAutocomplete
              v-model="v$.form.typeRepeat.$model"
              :input-id="'typeRepeatId'"
              label="label"
              :reduce="(typeRepeat: any) => typeRepeat.id"
              :options="typeRepeat"
              :clearable="false"
              class="bg-white"
            ></AppAutocomplete> -->
            <v-select
              v-model="v$.form.typeRepeat.$model"
              :input-id="'typeRepeatId'"
              :reduce="(typeRepeat: any) => typeRepeat.id"
              :options="typeRepeat"
              :label="'label'"
            ></v-select>
          </AppFormField>
        </div>
        <div v-if="v$.form.typeRepeat.$model === 1">
          <span>Repetir el</span>
          <AppFormField :form-control="v$.form.typeRepeat">
            <!-- <AppAutocomplete
              v-model="v$.form.weekDay.$model"
              :input-id="'selectorTypeRepeatId'"
              label="label"
              :reduce="(selectorByTypeRepeat: any) => selectorByTypeRepeat.id"
              :options="selectorByTypeRepeat"
              :clearable="false"
              multiple
              class="bg-white"
            ></AppAutocomplete> -->
            <v-select
              :options="selectorByTypeRepeat"
              v-model="v$.form.weekDay.$model"
              :multiple="true"
              input-id="typeRepeat"
              :reduce="(selectorByTypeRepeat: any) => selectorByTypeRepeat.id"
              :label="'label'"
            ></v-select>
          </AppFormField>
        </div>
        <div v-if="v$.form.typeRepeat.$model === 2">
          <AppFormField :form-control="v$.form.typeRepeat">
            <AppAutocomplete
              v-model="v$.form.dayMonth.$model"
              :input-id="'selectorTypeRepeatId'"
              label="label"
              :options="selectorByTypeRepeatMonth"
              :clearable="false"
              class="bg-white"
              style="max-width: 500px"
            ></AppAutocomplete>
          </AppFormField>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem">
          <span>Finaliza</span>
          <!-- <div style="flex: unset" class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="isNever" v-model="v$.form.isNeverSelected" />
            <label class="form-check-label" for="isNever" style="flex: unset"> Nunca </label>
          </div> -->

          <div
            class="form-check form-switch form-row"
            style="flex-direction: row !important; align-items: center"
            v-if="!form.isNeverSelected"
          >
            <div
              style="display: flex; align-items: center; margin-right: 0.5rem"
            >
              <input
                class="form-check-input"
                type="checkbox"
                id="isThis"
                v-model="form.isThisSelected"
                @change="toggleIsThis"
              />
              <label
                class="form-check-label"
                for="isThis"
                style="margin-left: 0.5rem; line-height: 2"
              >
                El
              </label>
            </div>
            <AppFormField
              :form-control="v$.form.durationEndDate"
              style="flex: unset"
            >
              <input
                :disabled="!form.isThisSelected"
                class="form-control input-sm input-date"
                type="date"
                id="endDate"
                v-model="form.durationEndDate"
              />
            </AppFormField>
          </div>

          <div
            class="form-check form-switch form-row"
            v-if="!form.isNeverSelected && !form.isThisSelected"
          >
            <div
              style="
                flex: unset;
                display: flex;
                align-items: center;
                margin-right: 0.5rem;
              "
            >
              <div class="d-flex gap-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="isLater"
                  v-model="form.isLaterSelected"
                  @change="toggleIsLater"
                />
                <label
                  class="form-check-label"
                  for="isLater"
                  style="flex: unset"
                >
                  Después de
                </label>
              </div>
            </div>
            <AppFormField
              :form-control="v$.form.durationEndNumberRepeat"
              style="
                flex: unset;
                display: flex;
                gap: 0.5rem;
                align-items: center;
              "
            >
              <input
                style="flex: unset"
                :disabled="!form.isLaterSelected"
                class="form-control input-sm"
                type="number"
                id="durationEndNumber"
                v-model="form.durationEndNumberRepeat"
              />
              <input
                class="form-control input-sm input-date"
                type="text"
                value="Repeticiones"
                readonly
              />
            </AppFormField>
          </div>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  onMounted,
  ref,
  watch,
  PropType,
} from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { GetPeriodicityTypeRepeatService } from '../services/getPeriodicityTypeRepeat.service';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { GetSelectorByTypeRepeatService } from '../services/getSelectorByTypeRepeat.service';
import { CreateOrUpdatePeriodicityService } from '../services/createOrUpdatePeriodicity.service';

const getPeriodicityTypeRepeat = new GetPeriodicityTypeRepeatService();
const getSelectorByTypeRepeat = new GetSelectorByTypeRepeatService();
const createOrUpdatePeriodicity = new CreateOrUpdatePeriodicityService();

export default defineComponent({
  name: 'PersonalisedPeriocity',
  components: { AppFormModal, AppButton, AppFormField, AppAutocomplete },

  props: {
    data: {
      type: Object,
      required: false,
    },
    currentEntity: {
      type: Object,
      required: false,
    },
    dayStartDate: {
      type: Number,
      required: true,
    },
    durationStartDate: {
      type: String,
      required: true,
    },
  },

  emits: ['close', 'id'],

  setup(props, { emit }) {
    const data = ref(props.data);
    console.log('datadataaaaaaaaaaaaaaaa12', data.value);

    const title = 'Recurrencia Personalizada';
    const typeRepeat = ref<any>([]);
    const selectorByTypeRepeat = ref<any>([]);
    const selectorByTypeRepeatMonth = ref<any>([]);

    const selectorTypeRepeatId = ref();
    console.log('typeRepeat.valueeeeeinit', typeRepeat.value);
    const form = reactive({
      id: data.value?.id,
      repeatNumber: data.value?.repeatNumber || '',
      typeRepeat: data.value?.typeRepeat,
      durationStartDate: data.value?.durationStartDate,
      durationEndDate: data.value?.durationEndDate,
      durationEndNumberRepeat: data.value?.durationEndNumberRepeat,
      weekDay: data.value?.weekDay
        ? data.value.weekDay.split(',').map((day: string) => Number(day.trim()))
        : null,
      dayMonth: data.value?.dayMonth,
      isThisSelected: data.value?.durationEndDate ? true : false,
      isLaterSelected: data.value?.durationEndNumberRepeat ? true : false,
      isNeverSelected: false,
    });

    const v$ = useVuelidate(
      {
        form: {
          repeatNumber: { required },
          typeRepeat: { required },
          durationStartDate: {},
          durationEndDate: {},
          durationEndNumberRepeat: {},
          weekDay: {},
          dayMonth: {},
        },
      },

      { form }
    );

    onMounted(async () => {
      console.log('fecha duracion', props.durationStartDate);
      console.log('fecha de el', props.dayStartDate);
      typeRepeat.value = await getPeriodicityTypeRepeat.run();
    console.log('typeRepeat.value', typeRepeat.value);

    if (data.value?.typeRepeat === 0) {
      typeRepeat.value = await getPeriodicityTypeRepeat.run();
      form.typeRepeat = typeRepeat.value.find((option: any) => option.id === data.value?.typeRepeat) || null;
    console.log('typeRepeat.value.find((option: any) => option.id === data.value?.typeRepeat) || null', typeRepeat.value.find((option: any) => option.id === data.value?.typeRepeat) || null);

      } else if (data.value?.typeRepeat === 1) {
        selectorByTypeRepeat.value = await getSelectorByTypeRepeat.run(1);
      } else if (data.value?.typeRepeat === 2) {
        selectorByTypeRepeatMonth.value = await getSelectorByTypeRepeat.run(2, {
          day: form.repeatNumber,
        });
      }
      if (data.value?.durationEndDate) {
        form.isThisSelected = true;
      } else if (data.value?.durationEndNumberRepeat) {
        form.isLaterSelected = true;
      }
    });
    watch(
      () => form.typeRepeat,
      async (newValue) => {
        console.log('form.typeRepeat', form.typeRepeat);
        if (newValue === 1) {
          selectorByTypeRepeat.value = await getSelectorByTypeRepeat.run(
            newValue
          );
        }
      }
    );
    watch(
      [() => form.typeRepeat, () => form.repeatNumber],
      async ([newValue, newValueRepeat]) => {
        if (newValue === 2) {
          selectorByTypeRepeatMonth.value = await getSelectorByTypeRepeat.run(
            newValue,
            { day: newValueRepeat }
          );
        }
      }
    );

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      let dataSend: any = {
        repeatNumber: form.repeatNumber,
        typeRepeat: data.value?.id? form.typeRepeat.id : form.typeRepeat,
        durationStartDate: formatDurationStartDate(props.durationStartDate),
        durationEndDate: form.durationEndDate ?? null,
        durationEndNumberRepeat: form.durationEndNumberRepeat ?? null,
        weekDay: form.typeRepeat === 1 ? form.weekDay : null,
        dayMonth: form.typeRepeat === 2 ? form.dayMonth : null,
      };

      try {
        const response = await createOrUpdatePeriodicity.run(dataSend, form.id);
        emitClose(response.data.id);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    const emitClose = (id: any) => {
      emit('close', id);
    };

    function formatDurationStartDate(dateString: string): string {
      const parts = dateString.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const toggleIsThis = () => {
      if (form.isThisSelected) {
        form.isNeverSelected = false;
        form.isLaterSelected = false;
      }
    };

    const toggleIsLater = () => {
      if (form.isLaterSelected) {
        form.isNeverSelected = false;
        form.isThisSelected = false;
      }
    };

    // const toggleIsNever = () => {
    //   if (v$.form.isNeverSelected) {
    //     v$.form.isThisSelected = false;
    //     v$.form.isLaterSelected = false;
    //   }
    // };
    return {
      title,
      v$,
      save,
      form,
      emit,
      typeRepeat,
      selectorByTypeRepeat,
      selectorByTypeRepeatMonth,
      toggleIsThis,
      toggleIsLater,
    };
  },
});
</script>
<style scoped>
.input-sm {
  width: 70px;
  padding: 0.375rem 0.75rem;
  margin: 0;
}

.input-date {
  width: 140px;
  padding: 0.375rem 0.75rem;
  margin: 0;
}

/* .autocomplete {
  width: 140px;
} */

.form-check-input {
  padding: 0.375rem 0.75rem;
}
</style>
