<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <template v-if="data.academicPeriodId">
          <div class="form-row">
            <AppFormField label="Titulo">
              <input
                v-model="data.title"
                id="title"
                class="form-control"
                type="text"
                disabled
              />
            </AppFormField>
            <AppFormField label="Color" class="col-1">
              <input
                class="form-control form-control-color"
                type="color"
                id="title"
                v-model="data.color"
                disabled
              />
            </AppFormField>
            <!-- <AppFormField class="col-2"  label="Mostrar en agenda?">
              <div class="mt-2 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="requiresEvent" v-model="data.requiresEvent" disabled />
              </div>
            </AppFormField> -->
          </div>
          <div class="form-row">
            <AppFormField label="Desde">
              <input
                v-model="data.startDate"
                id="startDate"
                class="form-control"
                type="date"
                disabled
              />
            </AppFormField>

            <AppFormField label="Hasta">
              <input
                v-model="data.endDate"
                id="endDate"
                class="form-control"
                type="date"
                disabled
              />
            </AppFormField>
          </div>
          <div>
            <AppFormField :label="'Orden del día'">
              <AppVoiceInput v-model="data.objective"
                id="objective"
                :rows="3"
                disabled 
                textareaClass="form-control"  />
            </AppFormField>
          </div>
          <div
            class="shadow-sm bg-card bg-white"
            style="overflow: auto; max-height: 300px"
          >
            <table class="w-100 table table-striped table-bordered">
              <thead class="sticky-top">
                <tr>
                  <th scope="col" style="width: unset">#</th>
                  <th scope="col" rowspan="2">Tarea</th>
                  <th scope="col" rowspan="2">Fecha Inicio</th>
                  <th scope="col" rowspan="2">Fecha Inicio</th>
                  <th scope="col" rowspan="2">Responsable</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in data.myTasks" :key="index">
                  <th style="text-align: unset">{{ index + 1 }}</th>
                  <td class="text-center">
                    {{ item.description }}
                  </td>
                  <td class="text-center">
                    {{ item.startDate }}
                  </td>
                  <td class="text-center">
                    {{ item.endDate }}
                  </td>
                  <td class="text-center">
                    <!-- <AppButton
                      v-tooltip="item.responsible.map((responsible:any) => responsible.dataUser).join(', ')"
                      icon="eye"
                      outlined
                      @click="openListResponsibles(item)"
                    >
                    </AppButton> -->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.name" label="Titulo">
              <input
                class="form-control"
                type="text"
                id="name"
                v-model="v$.form.name.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>

            <AppFormField
              :form-control="v$.form.color"
              label="Color"
              class="col-2"
            >
              <input
                class="form-control form-control-color"
                type="color"
                id="title"
                v-model="v$.form.color.$model"
              />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.startDate" label="Hora Inicio">
              <input
                class="form-control"
                type="datetime-local"
                id="startDate"
                v-model="v$.form.startDate.$model"
              />
            </AppFormField>

            <AppFormField :form-control="v$.form.endDate" label="Hora Fin">
              <input
                class="form-control"
                type="datetime-local"
                id="endDate"
                v-model="v$.form.endDate.$model"
              />
            </AppFormField>
          </div>

          <div>
            <AppFormField
              :form-control="v$.form.periodicityIdOption"
              label="Frecuencia del Evento"
            >
              <v-select
                v-model="v$.form.periodicityIdOption.$model"
                :reduce="(periodicity: any) => periodicity.id"
                :options="periodicity"
                class="bg-white"
                :clearable="true"
              ></v-select>
            </AppFormField>
            <!-- {{ periodicity }} -->
          </div>
          <div v-if="showEndDate">
            <AppFormField
              :form-control="v$.form.durationEndDate"
              label="Fecha Fin"
            >
              <input
                class="form-control"
                type="date"
                id="endDate"
                v-model="v$.form.durationEndDate.$model"
              />
            </AppFormField>
          </div>

          <AppFormField
            :form-control="v$.form.description"
            :label="'collections.surcharges.form.description'"
          >
              <AppVoiceInput v-model="v$.form.description.$model"
              id="description"
              :rows="3"
              textareaClass="form-control"  />
          </AppFormField>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton
          v-if="!data.academicPeriodId && data?.id"
          :outlined="true"
          :label="'core.delete'"
          @click="openConfirmDelete(data.id)"
        >
        </AppButton>

        <AppButton
          v-if="!data.academicPeriodId"
          :label="'core.save'"
          :nativeType="'submit'"
        ></AppButton>
      </template>
    </AppFormModal>
    <AppModal v-model="periodicityModal" :size="'lg'">
      <PeriocidadForm
        v-if="periodicityModal"
        :day-start-date="durationStartDate.day"
        :duration-start-date="formattedEndDate"
        :data="currentPeriodicity"
        @close="closePeriodicityModal"
      >
      </PeriocidadForm>
    </AppModal>
    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal
        v-if="modalDelete"
        entity="Evento"
        @confirmDelete="confirmDelete"
        @close="modalDelete = false"
      >
      </AppConfirmDeleteModal>
    </AppModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  watch,
  Ref,
  computed,
} from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import PeriocidadForm from './PeriocidadForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';

import { CreateOrUpdateEventService } from '../services/createOrUpdateEvent.service';
import { GetPeriodicityEventsService } from '../services/getPeriodicityEvents.service';
import { UpdatePeriocidadService } from '../services/updatePeriocidad.service';
import { GetDataPeriodicityService } from '../services/getDataPeriodicity.service';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { DeleteEventByIdService } from '../services/deleteEventById.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const deleteEventByIdService = new DeleteEventByIdService();
const createOrUpdateEventService = new CreateOrUpdateEventService();
const getPeriodicityEventsService = new GetPeriodicityEventsService();
const updatePeriocidadService = new UpdatePeriocidadService();
const getDataPeriodicityService = new GetDataPeriodicityService();

export default defineComponent({
  name: 'AgendaForm',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppModal,
    PeriocidadForm,
    AppConfirmDeleteModal,
    AppVoiceInput,
  },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    let title;
    if (props.data?.academicPeriodId) {
      title = 'Actividad institucional';
    } else {
      title = props.data?.id
        ? 'Editar evento personal'
        : 'Nuevo evento personal';
    }
    const periodicityModal = ref(false);
    const startDate = ref('');
    const periodId = ref();
    const periodValue = ref();
    const periodLabel = ref('');
    const endDate = ref('');
    const idEmit = ref();
    const durationStartDate: any = ref<{ fullDate: string; day: number }>({
      fullDate: '',
      day: 0,
    });
    const currentEventId = ref();
    const modalDelete = ref(false);

    const data = ref(props.data);
    console.log('datadata', data);

    const periodicity = ref<any>([]);
    const showDurationEndDate = ref(false);
    const showEndDate = ref(true);
    const currentPeriodicity: Ref<any | null> = ref(null);
    const formattedEndDate = computed(() => {
      if (!form.endDate) return '';

      const date = new Date(form.endDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    });
    console.log('props.data.periodicityOption', props.data.periodicityOption);

    const form: any = reactive({
      eventType: props.data?.eventType ?? 'personal',
      name: props.data?.name ?? null,
      description: props.data?.description ?? '',
      startDate: props.data?.startDate ?? ('' as any),
      durationEndDate: props.data?.durationEndDate
        ? props.data?.durationEndDate.split(' ')[0]
        : props.data?.durationEndDate,
      endDate: props.data?.endDate ?? ('' as any),
      isAllDay: 0,
      color: props.data?.color ?? `${import.meta.env.VITE_COLOR_PRIMARY}`,
      periodicityId: props.data.periodicityId,
      periodicityIdOption: periodId.value,
      periodicityOption: props.data.periodicityId,
      periodicityValue: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          eventType: {},
          name: { required },
          description: {},
          durationEndDate: {},
          startDate: {},
          endDate: {},
          isAllDay: {},
          color: {},
          periodicityId: {},
          periodicityIdOption: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      idEmit.value = props.data.periodicityId;
      if (form.startDate && form.endDate) {
        const formattedStartDate = formatDate(form.startDate);
        const formattedEndDate = formatDate(form.endDate);
        const formattedDurationStartDate = formatStartDate(form.startDate);
        const params = {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          durationStartDate: formattedDurationStartDate,
          id: props.data.periodicityId,
        };
        const response = await getPeriodicityEventsService.run(params);
        // Encuentra el elemento en el arreglo que cumple con la condición y asigna su `id` a `periodId.value`
        console.log("hola respondse onmoin1",response);
        console.log("hola props.data.periodicityId",props.data.periodicityId);

        const matchingItem = response.find(
          (item: any) => item.value === props.data.periodicityId || (item.id === (props.data.periodicityId? 7 : props.data.requiresRepeat === 1 ? 2 :  props.data.repeatUntil ===  1 ? 3 : props.data.repeatsGeneratedUntil === 6?  4 : props.data.intervalEvents === 1 ? 5 : props.data?.weekDays?.length > 0? 6 : props.data.requiresRepeat === 0? 1  :  ''))
        );
        console.log("matchingItem onmoin1",matchingItem);

        if (matchingItem) {
          periodId.value = matchingItem.id;
          console.log(" periodId.value onmoin2", periodId.value);

        }

        periodicity.value = response.map((item: any, index: number) => {
          return {
            ...item,
            id: index + 1,
            value: item.value ?? 8,
            name: item.label,
          };
        });
        console.log("periodicity.value omount3",periodicity.value);

        form.periodicityIdOption =  periodId.value ?? periodicity.value[0]?.id;
      }
    });
    const formatStartDate = (dateString: any) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    };

    watch(
      [() => form.startDate, () => form.endDate],
      async ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
        if (form.startDate === newStartDate || form.endDate === newEndDate) {
          startDate.value = newStartDate;
          endDate.value = newEndDate;
          durationStartDate.value = {
            fullDate: newStartDate,
            day: new Date(newStartDate).getDate(),
          };
          if (newStartDate && newEndDate) {
            const formattedStartDate = formatDate(newStartDate);
            const formattedEndDate = formatDate(newEndDate);
            const formattedDurationStartDate = formatStartDate(form.startDate);
            console.log('duracion', formattedDurationStartDate);
            const params = {
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              durationStartDate: formattedDurationStartDate,
            };
            const response = await getPeriodicityEventsService.run(params);
            periodicity.value = response.map((item: any, index: number) => {
              return {
                ...item,
                id: index + 1,
                value: item.value ?? 8,
                name: item.label,
              };
            });
            const matchingItem = response.find(
              (item: any) => item.value === props.data.periodicityId
            );
            if (matchingItem) {
              periodId.value = matchingItem.id;
            }
            periodicity.value.map((periodicity: any) => periodicity.index);
          }
        }
      }
    );

    watch(
      () => idEmit.value,
      async (newValue, oldValue) => {
        if (newValue !== undefined) {
          const formattedStartDate = formatDate(form.startDate);
          const formattedEndDate = formatDate(form.endDate);
          const formattedDurationStartDate = formatStartDate(form.startDate);

          const params = {
            id: newValue,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            durationStartDate: formattedDurationStartDate,
          };

          const response = await getPeriodicityEventsService.run(params);
          console.log('falla');
          periodicity.value = response.map((item: any, index: number) => {
            return {
              ...item,
              id: index + 1,
              value: item.value ?? 8,
              name: item.label,
            };
          });
          const matchingItem = response.find(
            (item: any) => item.value === props.data.periodicityId
          );
          if (matchingItem) {
            periodId.value = matchingItem.id;
          }
          periodicity.value.map((periodicity: any) => periodicity.index);
        }
      },
      { immediate: true }
    );

    const formatDate = (dateString: any) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        if (form.startDate.indexOf('T') !== -1) {
          form.startDate = form.startDate.replace('T', ' ');
          if (form.endDate) {
            form.endDate = form.endDate.replace('T', ' ');
          }
          if (form.durationEndDate) {
            form.durationEndDate = form.durationEndDate.replace('T', ' ');
          }
        }

        form.endDate = !form.endDate ? null : form.endDate;
        form.isAllDay = 0;
        console.log('lugar', form.periodicityIdOption);

        const dataSend = {
          eventType: form.eventType ?? 'Personal',
          name: form.name,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
          durationStartDate: formatStartDate(form.startDate),
          durationEndDate: form.durationEndDate,
          isAllDay: 0,
          color: form.color,
          requiresRepeat:
            form.periodicityIdOption === 1 ? 0 : form.periodicityIdOption === 2 ? 1 : 0,
          repeatsGeneratedUntil: form.periodicityIdOption === 4 ? 6 : 0,
          repeatUntil: form.periodicityIdOption === 3 ? 1 : 0,
          intervalEvents: form.periodicityIdOption === 5 ? 1 : 0,
          weekDays: form.periodicityIdOption === 6 ? [1, 2, 3, 4, 5]  : [],
          periodicityId: form.periodicityIdOption === 7 ? Number(idEmit.value) : null,
        };

        await createOrUpdateEventService.run(dataSend, props.data?.id);
        console.log('id ', idEmit.value);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    // const openConfirmDelete = (id: any) => {
    //   emit('close', id);
    // };

    const openConfirmDelete = (id: any) => {
      currentEventId.value = id;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentEventId.value) {
          await deleteEventByIdService.run(currentEventId.value);
          currentEventId.value = null;
        }
      } catch (e) {
        console.log(e);
      }
      modalDelete.value = false;
      emit('close');
    };

    const openPeriodicityModal = async (data: any) => {
  console.log("data joseees", data);
  console.log("data joseees",  periodicity.value);
  if (data === 8) {
    const id =  idEmit.value?? periodicity.value[7]?.value;
    const response = await getDataPeriodicityService.run( id );
    currentPeriodicity.value = response;
    periodicityModal.value = true;  // Asegúrate de abrir el modal después de que currentPeriodicity tenga valor
  } else if (periodLabel.value === 'Personalizar') {
    periodicityModal.value = true;
  }
};

    const closePeriodicityModal = async (id: any) => {
      idEmit.value = id;
      periodicityModal.value = false;
      const formattedStartDate = formatDate(form.startDate);
        const formattedEndDate = formatDate(form.endDate);
        const formattedDurationStartDate = formatStartDate(form.startDate);
      console.log("form.periodicityIdOption",form.periodicityIdOption);

        const params = {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          durationStartDate: formattedDurationStartDate,
          id: props.data.periodicityId | periodValue.value,
        };
        const response = await getPeriodicityEventsService.run(params);
        // Encuentra el elemento en el arreglo que cumple con la condición y asigna su `id` a `periodId.value`
        const matchingItem = response.find(
          (item: any) => item.value === props.data.periodicityId
        );
        if (matchingItem) {
          periodId.value = matchingItem.id;
        }
        if (response.length > 7 && !id) {
      form.periodicityIdOption = 7;
      console.log("hola aca");

        }else if (!props.data.periodicityId && !id){
          console.log("hoa caca");

          form.periodicityIdOption = 1;
        }

        periodicity.value = response.map((item: any, index: number) => {
          return {
            ...item,
            id: index + 1,
            value: item.value ?? 8,
            name: item.label,
          };

        });

      if (id) {
        try {
      form.periodicityIdOption = 7;

          const response = await updatePeriocidadService.run(id);
          periodValue.value = response.data.id
        } catch (error) {
          console.error('Error updating periodicidad:', error);
        }
      }
    };

    watch(
  () => form.periodicityIdOption,
  async(newValue, oldValue) => {
    console.log('valu1', newValue);
    console.log('oldValue1', oldValue);
    console.log('periodicity.value', periodicity.value);

    let matchingItem = periodicity.value.find((item:any) => {
      console.log('valueee1', newValue);
      console.log("item.id", item.id);
      console.log('valuesssssss', item.id === newValue);

      return item.id === newValue;  // Retorna el valor de la expresión de comparación
    });

    console.log("matchingItem", matchingItem);

    if (matchingItem) {
      periodLabel.value = matchingItem.name;
      console.log("periodLabel", periodLabel.value);
    }

    if (periodLabel.value === 'Personalizar') {
      await openPeriodicityModal( newValue);
    }
  }
);

watch(
  () => form.periodicityIdOption,
  async (newValue, oldValue) => {
    console.log('value', newValue);
    console.log('oldValue', oldValue);
    if (newValue === 8) {

      await openPeriodicityModal( newValue);  // Espera a que openPeriodicityModal termine
    }
  }
);
    watch(
      () => form.periodicityIdOption,
      (newValue, oldValue) => {
        if (newValue === 1 || newValue == 7) {
          showEndDate.value = false;
          console.log('value', showEndDate.value);
        } else {
          showEndDate.value = true;
          console.log('value', showEndDate.value);
        }
      }
    );

    return {
      title,
      save,
      v$,
      emit,

      openConfirmDelete,
      periodicityModal,
      closePeriodicityModal,
      periodicity,
      showDurationEndDate,
      currentPeriodicity,
      durationStartDate,
      formattedEndDate,
      showEndDate,
      modalDelete,
      confirmDelete,
      data,
      periodId,
    };
  },
});
</script>

<style scoped></style>
